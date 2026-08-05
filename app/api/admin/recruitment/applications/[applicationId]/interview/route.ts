import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { sendCandidateEmail, sendHrNotification } from "@/lib/recruitment/email-service";

export async function POST(request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !["ADMIN", "CO_ADMIN", "HR", "RECRUITER"].includes(String(token.role))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { applicationId } = await params;
  const body = await request.json();
  if (!body.scheduledAt || !body.meetingLink) return NextResponse.json({ error: "scheduledAt and meetingLink are required" }, { status: 400 });
  const { data: application, error } = await supabaseAdmin.schema("recruitment").from("careers_applications").select("id,candidate_id,profile,job_id").eq("id", applicationId).eq("organisation_id", CAREERS_ORGANISATION).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  const { data: job } = await supabaseAdmin.schema("recruitment").from("careers_jobs").select("title").eq("id", application.job_id).maybeSingle();
  const { data: interview, error: insertError } = await supabaseAdmin.schema("recruitment").from("interviews").insert({ application_id: application.id, candidate_id: application.candidate_id, organisation_id: CAREERS_ORGANISATION, title: `${job?.title || "Role"} interview`, stage: "Interview", scheduled_at: body.scheduledAt, duration_minutes: Number(body.durationMinutes || 45), meeting_link: body.meetingLink, interviewer_user_ids: body.interviewerUserIds || [], status: "scheduled" }).select().single();
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  const vars = { candidateName: application.profile?.full_name || application.candidate_id, jobTitle: job?.title || "the position", companyName: "GrowXLabs", interviewDate: new Date(body.scheduledAt).toLocaleDateString(), interviewTime: new Date(body.scheduledAt).toLocaleTimeString(), interviewLink: body.meetingLink, interviewType: body.interviewType || "Video interview" };
  const email = await sendCandidateEmail("interview_invite", vars, application.profile?.email, application.candidate_id, application.id, application.job_id);
  await sendHrNotification("interview_scheduled", { candidateName: vars.candidateName, jobTitle: vars.jobTitle, scheduledAt: body.scheduledAt, meetingLink: body.meetingLink });
  return NextResponse.json({ interview, email }, { status: 201 });
}
