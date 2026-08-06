import { NextResponse } from "next/server";
import { validateInterviewerAccess, logInterviewAccessEvent, InterviewerAuthError } from "@/lib/recruitment/interviewer-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const { interviewId } = await params;

    // 1. Strict Server-Side Authorization Check
    const authContext = await validateInterviewerAccess(interviewId, "interview.assignment.read");
    const { assignment, interview, visibilityScope, userId, userEmail } = authContext;

    // 2. Log profile viewed audit event if assignment exists
    if (assignment?.id) {
      logInterviewAccessEvent({
        assignmentId: assignment.id,
        interviewId,
        userId,
        userEmail,
        eventType: "profile_viewed",
      });
    }

    // 3. Fetch Candidate Application & Job Data
    const { data: application } = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .select("*, careers_jobs(*)")
      .eq("id", interview.application_id)
      .maybeSingle();

    if (!application) {
      return NextResponse.json({ error: "Candidate application record not found" }, { status: 404 });
    }

    // 4. Apply Visibility Scope Filtering (Do NOT return hidden PII fields to client)
    const filteredProfile: Record<string, any> = {
      full_name: application.profile?.full_name || application.candidate_id,
      email: application.profile?.email || application.candidate_id,
    };

    if (visibilityScope.contact_details) {
      filteredProfile.phone = application.profile?.phone || null;
      filteredProfile.location = application.profile?.location || null;
    }

    if (visibilityScope.education) {
      filteredProfile.education = application.profile?.education || [];
    }

    if (visibilityScope.employment_history) {
      filteredProfile.experience = application.profile?.experience || application.profile?.work_history || null;
    }

    const filteredApplication: Record<string, any> = {
      id: application.id,
      application_reference: application.application_reference,
      submitted_at: application.submitted_at,
      profile: filteredProfile,
    };

    if (visibilityScope.resume) {
      filteredApplication.resume_url = application.resume_path || application.profile?.resume_url || null;
    }

    if (visibilityScope.portfolio) {
      filteredApplication.portfolio_url = application.profile?.portfolio_url || null;
    }

    if (visibilityScope.application_answers) {
      filteredApplication.answers = application.answers || [];
      filteredApplication.cover_letter = application.cover_letter || application.profile?.cover_letter || null;
    }

    if (visibilityScope.compensation_expectations) {
      filteredApplication.compensation_expectations = application.profile?.compensation_expectations || null;
    }

    // 5. Fetch Scorecard Criteria
    const { data: scorecards } = await supabaseAdmin
      .schema("recruitment")
      .from("interview_scorecards")
      .select("*")
      .order("created_at", { ascending: false });

    const scorecard = (scorecards || []).find((s) => s.job_id === interview.job_id) || scorecards?.[0] || {
      title: "Standard Candidate Evaluation Scorecard",
      criteria: [
        { key: "communication", label: "Communication & Verbal Clarity", weight: 1, required: true },
        { key: "confidence", label: "Confidence & Articulation", weight: 1, required: true },
        { key: "listening", label: "Active Listening & Question Comprehension", weight: 1, required: true },
        { key: "business_understanding", label: "Business Understanding & Domain Logic", weight: 1, required: true },
        { key: "problem_solving", label: "Problem Solving & Analytical Thinking", weight: 1, required: true },
        { key: "ownership", label: "Grit, Drive & Startup Readiness", "weight": 1, required: true },
      ],
    };

    // 6. Check Meeting Join Window (e.g. 15m before start through 30m after end)
    const now = new Date();
    const scheduledAt = new Date(interview.scheduled_at);
    const durationMins = interview.duration_minutes || 30;

    const joinStartsAt = new Date(scheduledAt.getTime() - 15 * 60 * 1000);
    const joinExpiresAt = new Date(scheduledAt.getTime() + (durationMins + 30) * 60 * 1000);

    const isJoinEnabled = now >= joinStartsAt && now < joinExpiresAt;

    // 7. Fetch existing Feedback if any
    let feedback = null;
    if (assignment?.id) {
      const { data: fb } = await supabaseAdmin
        .schema("recruitment")
        .from("interview_feedback")
        .select("*")
        .eq("assignment_id", assignment.id)
        .maybeSingle();
      feedback = fb;
    }

    return NextResponse.json({
      interview: {
        id: interview.id,
        title: interview.title,
        scheduled_at: interview.scheduled_at,
        duration_minutes: interview.duration_minutes,
        timezone: interview.timezone,
        meeting_provider: interview.meeting_provider,
        meeting_join_url: isJoinEnabled ? interview.meeting_join_url : null,
        meeting_sdk_enabled: interview.meeting_sdk_enabled === true,
        zoom_meeting_id: interview.meeting_provider === "zoom" ? interview.zoom_meeting_id : null,
        is_join_enabled: isJoinEnabled,
        instructions: interview.instructions,
        status: interview.status,
      },
      assignment: assignment ? {
        id: assignment.id,
        access_starts_at: assignment.access_starts_at,
        access_expires_at: assignment.access_expires_at,
        permissions: assignment.permissions,
        status: assignment.status,
      } : null,
      candidate: filteredApplication,
      job: {
        id: application.careers_jobs?.id,
        title: application.careers_jobs?.title || "Specialist",
        department: application.careers_jobs?.department,
        description: application.careers_jobs?.description,
        requirements: application.careers_jobs?.requirements,
      },
      scorecard,
      feedback,
      visibilityScope,
    });
  } catch (error: any) {
    if (error instanceof InterviewerAuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error("GET Interviewer Interview Workspace Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load interview workspace" }, { status: 500 });
  }
}
