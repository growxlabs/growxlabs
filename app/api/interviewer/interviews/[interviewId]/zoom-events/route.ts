import { NextResponse } from "next/server";
import { validateInterviewerAccess, InterviewerAuthError, logInterviewAccessEvent } from "@/lib/recruitment/interviewer-auth";

const allowed = new Set(["zoom_join_attempted", "zoom_joined", "zoom_join_failed", "zoom_left", "zoom_access_expired", "zoom_external_fallback_used"]);

export async function POST(request: Request, { params }: { params: Promise<{ interviewId: string }> }) {
  try {
    const { interviewId } = await params;
    const context = await validateInterviewerAccess(interviewId, "interview.join");
    if (!context.assignment) throw new InterviewerAuthError(403, "ASSIGNMENT_REQUIRED", "An active interviewer assignment is required.");
    const body = await request.json().catch(() => ({}));
    const event = String(body?.event || "");
    if (!allowed.has(event)) return NextResponse.json({ error: "Invalid Zoom event" }, { status: 400 });
    await logInterviewAccessEvent({ assignmentId: context.assignment.id, interviewId, eventType: event, actionDetails: { source: "zoom_workspace" } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error instanceof InterviewerAuthError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    return NextResponse.json({ error: "Unable to record Zoom event" }, { status: 500 });
  }
}
