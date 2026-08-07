import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { sendRecruitmentEmail } from "@/lib/recruitment/email-service";

const roles = ["ADMIN", "CO_ADMIN", "HR", "RECRUITER"];
async function admin(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  return token && roles.includes(String(token.role || "").toUpperCase()) ? token : null;
}

export async function GET(request: Request, { params }: { params: Promise<{ interviewId: string }> }) {
  const token = await admin(request); if (!token) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const { interviewId } = await params;
  const { data, error } = await supabaseAdmin.schema("recruitment").from("candidate_playbooks").select("id,status,assigned_at,published_at,opened_at,last_viewed_at,playbook:interview_playbooks(slug,title,version),application:careers_applications(application_reference,profile)").eq("organisation_id", CAREERS_ORGANISATION).eq("interview_id", interviewId).order("assigned_at", { ascending: false }).limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const record: any = data;
  const application = Array.isArray(record?.application) ? record.application[0] : record?.application;
  return NextResponse.json({ assignment: record ? { id: record.id, status: record.status, sentAt: record.published_at || record.assigned_at, openedAt: record.opened_at, lastViewedAt: record.last_viewed_at, playbook: record.playbook, applicationReference: application?.application_reference, candidateName: application?.profile?.full_name } : null });
}

export async function POST(request: Request, { params }: { params: Promise<{ interviewId: string }> }) {
  const token = await admin(request); if (!token) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const { interviewId } = await params;
  const { data: interview } = await supabaseAdmin.schema("recruitment").from("interviews").select("id,application_id,candidate_id,job_id,careers_applications(id,application_reference,profile,job_id,careers_jobs(title))").eq("organisation_id", CAREERS_ORGANISATION).eq("id", interviewId).maybeSingle();
  const application: any = Array.isArray(interview?.careers_applications) ? interview?.careers_applications[0] : interview?.careers_applications;
  if (!interview || !application) return NextResponse.json({ error: "Interview application not found" }, { status: 404 });
  const { data: playbook } = await supabaseAdmin.schema("recruitment").from("interview_playbooks").select("*").eq("organisation_id", CAREERS_ORGANISATION).eq("role_key", "business_development_executive").eq("status", "published").order("version", { ascending: false }).limit(1).maybeSingle();
  if (!playbook) return NextResponse.json({ error: "No published playbook is available for this role." }, { status: 404 });
  const { data: existing } = await supabaseAdmin.schema("recruitment").from("candidate_playbooks").select("id,status,assigned_at,published_at,opened_at,last_viewed_at").eq("organisation_id", CAREERS_ORGANISATION).eq("application_id", application.id).eq("playbook_id", playbook.id).maybeSingle();
  if (existing && existing.status !== "withdrawn") return NextResponse.json({ assignment: existing, alreadySent: true });
  const { data: assignment, error } = await supabaseAdmin.schema("recruitment").from("candidate_playbooks").upsert({ organisation_id: CAREERS_ORGANISATION, candidate_id: application.candidate_id, application_id: application.id, interview_id: interview.id, playbook_id: playbook.id, assigned_by: token.sub, published_at: new Date().toISOString(), status: "published" }, { onConflict: "application_id,playbook_id" }).select("id,status,assigned_at,published_at,opened_at,last_viewed_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabaseAdmin.schema("audit").from("events").insert({ organisation_id: CAREERS_ORGANISATION, actor_user_id: token.sub, entity_type: "candidate_playbook", entity_id: assignment.id, action: "playbook_assigned", new_value: { applicationId: application.id, interviewId: interview.id, playbookSlug: playbook.slug } }).then(() => undefined, () => undefined);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://growxlabs.tech";
  const link = `${baseUrl}/careers/applications/${application.id}/playbook/${playbook.slug}`;
  const candidateName = application.profile?.full_name || "Candidate";
  const candidateEmail = application.profile?.email || application.candidate_id;
  const email = await sendRecruitmentEmail({ to: candidateEmail, subject: `Interview Preparation Guide | ${application.careers_jobs?.title || playbook.role_key} | GrowXLabs`, templateKey: "interview_playbook", html: `<p>Hi ${candidateName},</p><p>We've shared an interview preparation guide for your upcoming interview with GrowXLabs.</p><p>The guide explains what to prepare, what we look for, and how to approach the conversation.</p><p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#0075de;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">View Interview Playbook</a></p><p>You can also access it anytime from your GrowXLabs Candidate Portal.</p><p>Best regards,<br/>GrowXLabs Recruitment Team</p>`, candidateId: application.candidate_id, applicationId: application.id, jobId: application.job_id, metadata: { variables: { candidateName, applicationRef: application.application_reference, jobTitle: application.careers_jobs?.title || playbook.title }, triggeredBy: token.email || token.sub } });
  if (!email.success) return NextResponse.json({ error: email.error || "Playbook assigned but notification failed.", assignment }, { status: 502 });
  await supabaseAdmin.schema("audit").from("events").insert({ organisation_id: CAREERS_ORGANISATION, actor_user_id: token.sub, entity_type: "candidate_playbook", entity_id: assignment.id, action: "playbook_email_sent", new_value: { applicationId: application.id, playbookSlug: playbook.slug } }).then(() => undefined, () => undefined);
  return NextResponse.json({ assignment, email: { sent: true } });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ interviewId: string }> }) {
  const token = await admin(request); if (!token) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const { interviewId } = await params;
  const { data, error } = await supabaseAdmin.schema("recruitment").from("candidate_playbooks").update({ status: "withdrawn" }).eq("organisation_id", CAREERS_ORGANISATION).eq("interview_id", interviewId).neq("status", "withdrawn").select("id").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data) await supabaseAdmin.schema("audit").from("events").insert({ organisation_id: CAREERS_ORGANISATION, actor_user_id: token.sub, entity_type: "candidate_playbook", entity_id: data.id, action: "playbook_withdrawn", new_value: { interviewId } }).then(() => undefined, () => undefined);
  return NextResponse.json({ withdrawn: Boolean(data), actor: token.sub });
}
