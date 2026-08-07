import { NextResponse } from "next/server";
import { validateInterviewerAccess, InterviewerAuthError, logInterviewAccessEvent } from "@/lib/recruitment/interviewer-auth";
import { createZoomSdkSignature, decryptZoomPasscode, getZoomSdkConfig } from "@/lib/recruitment/zoom";

export async function POST(request: Request, { params }: { params: Promise<{ interviewId: string }> }) {
  const { interviewId } = await params;
  try {
    const context = await validateInterviewerAccess(interviewId, "interview.join");
    if (!context.assignment) throw new InterviewerAuthError(403, "INTERVIEW_ASSIGNMENT_REQUIRED", "An active interviewer assignment is required.");
    if (String(context.interview?.meeting_provider || "").toLowerCase() !== "zoom" || context.interview?.meeting_sdk_enabled !== true || !context.interview?.zoom_meeting_id || !context.interview?.zoom_passcode_encrypted) {
      return NextResponse.json({ error: "Embedded Zoom is not enabled for this interview." }, { status: 409 });
    }
    const config = getZoomSdkConfig();
    if (!config) return NextResponse.json({ error: "Zoom SDK is not configured on the server." }, { status: 503 });
    const passcode = decryptZoomPasscode(context.interview.zoom_passcode_encrypted);
    const signature = createZoomSdkSignature(context.interview.zoom_meeting_id, 0);
    await logInterviewAccessEvent({ assignmentId: context.assignment.id, interviewId, userId: context.userId, userEmail: context.userEmail, eventType: "zoom_signature_issued", actionDetails: { provider: "zoom_sdk" } });
    return NextResponse.json({ signature, meetingNumber: context.interview.zoom_meeting_id, passcode, userName: context.userName, userEmail: context.userEmail, role: 0, expiresIn: 600 });
  } catch (error: any) {
    if (error instanceof InterviewerAuthError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    return NextResponse.json({ error: error?.message || "Unable to authorize Zoom meeting" }, { status: 500 });
  }
}
