import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { sendCandidateEmail } from "@/lib/recruitment/email-service";

const ROLES = new Set(["ADMIN", "CO_ADMIN", "HR", "RECRUITER"]);
const REASONS = new Set([
  "Does not meet role requirements", "Insufficient relevant experience", "Communication not suitable",
  "Interview performance", "Assessment performance", "Availability / joining constraints",
  "Compensation mismatch", "Position filled", "Candidate withdrew", "Duplicate application", "Other",
]);

async function authorize(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  return token && ROLES.has(String(token.role || "").toUpperCase()) ? token : null;
}

export async function POST(request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  const token = await authorize(request);
  if (!token) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const { applicationId } = await params;
  const body = await request.json() as { reason?: string; note?: string; sendEmail?: boolean; otherReason?: string };
  const reason = String(body.reason || "");
  if (!REASONS.has(reason) || (reason === "Other" && !String(body.otherReason || "").trim())) {
    return NextResponse.json({ error: "A valid rejection reason is required." }, { status: 400 });
  }
  const { data: application, error: lookupError } = await supabaseAdmin.schema("recruitment").from("careers_applications")
    .select("id,organisation_id,candidate_id,job_id,profile,current_stage,application_reference").eq("id", applicationId).eq("organisation_id", CAREERS_ORGANISATION).maybeSingle();
  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 });
  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  const rejectionReason = reason === "Other" ? String(body.otherReason).trim() : reason;
  const rejectedAt = new Date().toISOString();
  const { data: updated, error } = await supabaseAdmin.schema("recruitment").from("careers_applications").update({
    status: "rejected", current_stage: "rejected", rejected_at: rejectedAt, rejected_by: token.sub,
    rejection_reason: rejectionReason, rejection_note: String(body.note || "").trim() || null, rejection_previous_stage: application.current_stage,
  }).eq("id", applicationId).eq("organisation_id", CAREERS_ORGANISATION).select("id,status,current_stage,rejected_at").single();
  if (error) return NextResponse.json({ error: "Failed to reject application.", detail: error.message }, { status: 500 });
  const { data: job } = await supabaseAdmin.schema("recruitment").from("careers_jobs").select("title").eq("id", application.job_id).maybeSingle();
  const candidateName = application.profile?.full_name || application.candidate_id;
  const candidateEmail = application.profile?.email;
  let emailSent = false;
  if (body.sendEmail !== false && candidateEmail) {
    try { await sendCandidateEmail("rejection", { candidateName, jobTitle: job?.title || "the position", companyName: "GrowXLabs", portalLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://growxlabs.tech"}/careers/applications/${application.id}` }, candidateEmail, application.candidate_id, application.id, application.job_id); emailSent = true; } catch (emailError) { console.error("[Recruitment] rejection email failed", emailError); }
  }
  await supabaseAdmin.schema("audit").from("events").insert({ organisation_id: CAREERS_ORGANISATION, actor_user_id: token.sub, entity_type: "candidate", entity_id: application.id, action: "candidate_rejected", new_value: { applicationId: application.id, candidateId: application.candidate_id, jobId: application.job_id, previousStage: application.current_stage, rejectionReason, rejectedAt, emailSent } }).then(() => undefined, () => undefined);
  return NextResponse.json({ application: updated, emailSent });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  const token = await authorize(request);
  if (!token) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const { applicationId } = await params;
  const { data: application } = await supabaseAdmin.schema("recruitment").from("careers_applications").select("id,organisation_id,candidate_id,job_id,current_stage,rejection_previous_stage,status").eq("id", applicationId).eq("organisation_id", CAREERS_ORGANISATION).maybeSingle();
  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  const restoredStage = application.rejection_previous_stage || "applied";
  const { data: updated, error } = await supabaseAdmin.schema("recruitment").from("careers_applications").update({ status: "active", current_stage: restoredStage, rejected_at: null, rejected_by: null, rejection_reason: null, rejection_note: null, rejection_previous_stage: null }).eq("id", applicationId).select("id,status,current_stage").single();
  if (error) return NextResponse.json({ error: "Failed to reopen application.", detail: error.message }, { status: 500 });
  await supabaseAdmin.schema("audit").from("events").insert({ organisation_id: CAREERS_ORGANISATION, actor_user_id: token.sub, entity_type: "candidate", entity_id: application.id, action: "candidate_reopened", new_value: { applicationId, restoredStage } }).then(() => undefined, () => undefined);
  return NextResponse.json({ application: updated });
}
