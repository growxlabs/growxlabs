import { NextResponse } from "next/server";
import { validateInterviewerAccess, logInterviewAccessEvent, InterviewerAuthError } from "@/lib/recruitment/interviewer-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const { interviewId } = await params;
    const authContext = await validateInterviewerAccess(interviewId, "interview.assignment.read");

    if (!authContext.assignment?.id) {
      return NextResponse.json({ feedback: null });
    }

    const { data: feedback } = await supabaseAdmin
      .schema("recruitment")
      .from("interview_feedback")
      .select("*")
      .eq("assignment_id", authContext.assignment.id)
      .maybeSingle();

    return NextResponse.json({ feedback });
  } catch (error: any) {
    if (error instanceof InterviewerAuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return NextResponse.json({ error: error?.message || "Failed to fetch feedback" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const { interviewId } = await params;
    const authContext = await validateInterviewerAccess(interviewId, "interview.feedback.write");
    const { assignment, interview, userId, userEmail } = authContext;

    if (!assignment?.id) {
      return NextResponse.json({ error: "No assignment found to submit feedback" }, { status: 400 });
    }

    const body = await request.json();
    const { ratings = {}, notes = "", scratchpadNotes = "", recommendation = null, isFinal = false } = body;

    // Check if feedback already exists and is locked
    const { data: existing } = await supabaseAdmin
      .schema("recruitment")
      .from("interview_feedback")
      .select("*")
      .eq("assignment_id", assignment.id)
      .maybeSingle();

    if (existing && existing.is_locked && !authContext.isAdminOverride) {
      return NextResponse.json(
        { error: "This feedback has been submitted and locked. Contact HR to reopen editing." },
        { status: 403 }
      );
    }

    const status = isFinal ? "submitted" : "draft";
    const isLocked = isFinal;

    let feedbackRecord: any = null;

    if (existing) {
      // Store version history before updating
      await supabaseAdmin
        .schema("recruitment")
        .from("interview_feedback_versions")
        .insert({
          feedback_id: existing.id,
          version: existing.version || 1,
          ratings: existing.ratings || {},
          notes: existing.notes || "",
          recommendation: existing.recommendation || null,
          saved_by: userId,
        });

      const { data: updated, error: updateErr } = await supabaseAdmin
        .schema("recruitment")
        .from("interview_feedback")
        .update({
          ratings,
          notes,
          scratchpad_notes: scratchpadNotes,
          recommendation,
          status,
          is_locked: isLocked,
          submitted_at: isFinal ? new Date().toISOString() : existing.submitted_at,
          version: (existing.version || 1) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      feedbackRecord = updated;
    } else {
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .schema("recruitment")
        .from("interview_feedback")
        .insert({
          organisation_id: CAREERS_ORGANISATION,
          interview_id: interviewId,
          assignment_id: assignment.id,
          interviewer_user_id: userId,
          ratings,
          notes,
          scratchpad_notes: scratchpadNotes,
          recommendation,
          status,
          is_locked: isLocked,
          submitted_at: isFinal ? new Date().toISOString() : null,
          version: 1,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      feedbackRecord = inserted;
    }

    // Log Audit Event
    await logInterviewAccessEvent({
      assignmentId: assignment.id,
      interviewId,
      userId,
      userEmail,
      eventType: isFinal ? "feedback_submitted" : "feedback_saved",
      actionDetails: { recommendation, isFinal },
    });

    return NextResponse.json({ feedback: feedbackRecord, message: isFinal ? "Feedback submitted successfully" : "Draft saved" });
  } catch (error: any) {
    if (error instanceof InterviewerAuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error("POST Interviewer Feedback Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to save feedback" }, { status: 500 });
  }
}
