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
  const required = ["interviewDate", "interviewTime", "timeZone", "interviewFormat", "meetingLinkOrOfficeLocation", "interviewerName", "interviewerRole", "preparationInstructions", "supportEmail"];
  const missing = required.filter((key) => !String(body[key] || "").trim());
  if (missing.length || !Number.isFinite(Number(body.durationMinutes)) || Number(body.durationMinutes) <= 0) return NextResponse.json({ error: `Interview date, time, format, location/link, duration, interviewer, preparation instructions, and support email are required. Missing: ${missing.join(", ")}` }, { status: 400 });
  const scheduledAt = body.scheduledAt || `${body.interviewDate}T${body.interviewTime}`;
  if (Number.isNaN(new Date(scheduledAt).getTime())) return NextResponse.json({ error: "A valid interview date and time are required." }, { status: 400 });
  const { data: application, error } = await supabaseAdmin.schema("recruitment").from("careers_applications").select("id,candidate_id,profile,job_id").eq("id", applicationId).eq("organisation_id", CAREERS_ORGANISATION).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  const { data: job } = await supabaseAdmin.schema("recruitment").from("careers_jobs").select("title").eq("id", application.job_id).maybeSingle();
  const { data: interview, error: insertError } = await supabaseAdmin.schema("recruitment").from("interviews").insert({ application_id: application.id, candidate_id: application.candidate_id, organisation_id: CAREERS_ORGANISATION, title: `${job?.title || "Role"} interview`, stage: "Interview", scheduled_at: scheduledAt, duration_minutes: Number(body.durationMinutes), meeting_link: body.meetingLinkOrOfficeLocation, interviewer_user_ids: body.interviewerUserIds || [], status: "scheduled" }).select().single();
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  const base = process.env.NEXTAUTH_URL || "https://growxlabs.tech";
  const vars = { candidateName: application.profile?.full_name || application.candidate_id, jobTitle: job?.title || "the position", companyName: "GrowXLabs", interviewDate: body.interviewDate, interviewTime: body.interviewTime, interviewLink: body.meetingLinkOrOfficeLocation, interviewFormat: body.interviewFormat, timeZone: body.timeZone, interviewDuration: `${body.durationMinutes} minutes`, interviewerName: body.interviewerName, interviewerRole: body.interviewerRole, preparationInstructions: body.preparationInstructions, supportEmail: body.supportEmail, confirmLink: `${base}/careers/interview-response/${application.id}?action=confirm`, rescheduleLink: `${base}/careers/interview-response/${application.id}?action=reschedule`, declineLink: `${base}/careers/interview-response/${application.id}?action=decline` };
  const email = await sendCandidateEmail("interview_invite", vars, application.profile?.email, application.candidate_id, application.id, application.job_id);
  await sendHrNotification("interview_scheduled", { candidateName: vars.candidateName, jobTitle: vars.jobTitle, scheduledAt: body.scheduledAt, meetingLink: body.meetingLink });
  return NextResponse.json({ interview, email }, { status: 201 });
}
