import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { encryptZoomPasscode, isValidZoomMeetingNumber } from "@/lib/recruitment/zoom";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = String(token.role || "").toUpperCase();
    if (!["ADMIN", "CO_ADMIN", "HR", "RECRUITER"].includes(role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { interviewId } = await params;

    const { data: interview, error } = await supabaseAdmin
      .schema("recruitment")
      .from("interviews")
      .select("*, interview_assignments(*), interview_feedback(*)")
      .eq("id", interviewId)
      .eq("organisation_id", CAREERS_ORGANISATION)
      .maybeSingle();

    if (error || !interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Fetch Candidate & Application details
    const { data: application } = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .select("*, careers_jobs(*)")
      .eq("id", interview.application_id)
      .maybeSingle();

    const { zoom_passcode_encrypted: _encryptedPasscode, ...safeInterview } = interview;
    return NextResponse.json({
      interview: { ...safeInterview, zoom_passcode_configured: Boolean(_encryptedPasscode) },
      application,
      job: application?.careers_jobs,
    });
  } catch (error: any) {
    console.error("GET Interview Detail Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch interview detail" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = String(token.role || "").toUpperCase();
    if (!["ADMIN", "CO_ADMIN", "HR", "RECRUITER"].includes(role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { interviewId } = await params;
    const body = await request.json();
    const { scheduledAt, durationMinutes, meetingJoinUrl, instructions, status, meetingProvider, zoomMeetingId, zoomPasscode, meetingSdkEnabled } = body;

    const updates: any = { updated_at: new Date().toISOString() };
    if (scheduledAt !== undefined) updates.scheduled_at = new Date(scheduledAt).toISOString();
    if (durationMinutes !== undefined) updates.duration_minutes = Number(durationMinutes);
    if (meetingJoinUrl !== undefined) updates.meeting_join_url = meetingJoinUrl;
    if (instructions !== undefined) updates.instructions = instructions;
    if (status !== undefined) updates.status = status;
    if (meetingProvider !== undefined) updates.meeting_provider = meetingProvider;
    if (meetingJoinUrl !== undefined) updates.meeting_join_url = meetingJoinUrl;
    if (meetingProvider?.toLowerCase() === "zoom") {
      const normalizedId = String(zoomMeetingId || "").replace(/[\s-]/g, "");
      if (meetingSdkEnabled && (!isValidZoomMeetingNumber(normalizedId) || !String(zoomPasscode || "").trim())) return NextResponse.json({ error: "A valid Zoom meeting ID and passcode are required to enable Embedded Zoom." }, { status: 400 });
      updates.zoom_meeting_id = normalizedId || null;
      if (zoomPasscode) updates.zoom_passcode_encrypted = encryptZoomPasscode(String(zoomPasscode));
      updates.meeting_sdk_enabled = meetingSdkEnabled === true;
      updates.zoom_configured_at = new Date().toISOString();
      updates.zoom_configured_by = token.sub;
    }

    const { data: updated, error } = await supabaseAdmin
      .schema("recruitment")
      .from("interviews")
      .update(updates)
      .eq("id", interviewId)
      .eq("organisation_id", CAREERS_ORGANISATION)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ interview: updated });
  } catch (error: any) {
    console.error("PATCH Interview Detail Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update interview" }, { status: 500 });
  }
}
