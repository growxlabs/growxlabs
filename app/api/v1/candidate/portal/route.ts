import { NextResponse } from "next/server";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url); const reference = url.searchParams.get("reference")?.trim(); const email = url.searchParams.get("email")?.trim().toLowerCase();
  if (!reference || !email) return NextResponse.json({ error: "Application reference and email are required." }, { status: 400 });
  const { data: application, error } = await supabaseAdmin.schema("recruitment").from("careers_applications").select("id,application_reference,candidate_id,current_stage,status,profile,submitted_at,updated_at,job_id,resume_path,cover_letter,careers_jobs(title,slug)").eq("organisation_id", CAREERS_ORGANISATION).eq("application_reference", reference).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!application || String(application.profile?.email || "").toLowerCase() !== email) return NextResponse.json({ error: "Application not found. Check the reference and email." }, { status: 404 });
  const [history, interviews, messages] = await Promise.all([
    supabaseAdmin.schema("recruitment").from("application_stage_history").select("from_stage,to_stage,created_at").eq("application_id", application.id).order("created_at", { ascending: true }),
    supabaseAdmin.schema("recruitment").from("interviews").select("id,scheduled_at,duration_minutes,meeting_link,status,title,interviewer_user_ids").eq("application_id", application.id).order("scheduled_at", { ascending: false }),
    supabaseAdmin.schema("recruitment").from("email_logs").select("id,template_key,subject,status,sent_at,created_at").eq("application_id", application.id).order("created_at", { ascending: false })
  ]);
  return NextResponse.json({ candidate: { name: application.profile?.full_name || "Candidate", email }, application: { reference: application.application_reference, jobTitle: (application.careers_jobs as any)?.title || "Role", appliedAt: application.submitted_at, updatedAt: application.updated_at, status: application.status, stage: application.current_stage, profile: application.profile, resumePath: application.resume_path }, timeline: history.data || [], interviews: interviews.data || [], messages: messages.data || [] });
}
