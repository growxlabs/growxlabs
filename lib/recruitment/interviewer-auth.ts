import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

export type InterviewerPermission =
  | "interview.assignment.read"
  | "interview.candidate.summary.read"
  | "interview.resume.preview"
  | "interview.resume.download"
  | "interview.answers.read"
  | "interview.portfolio.read"
  | "interview.join"
  | "interview.feedback.write"
  | "interview.scorecard.write"
  | "interview.notes.write"
  | "interview.recommendation.submit";

export interface VisibilityScope {
  contact_details?: boolean;
  resume?: boolean;
  portfolio?: boolean;
  application_answers?: boolean;
  education?: boolean;
  employment_history?: boolean;
  assessment_results?: boolean;
  prior_feedback?: boolean;
  recruiter_notes?: boolean;
  compensation_expectations?: boolean;
}

export interface InterviewerAuthContext {
  userId: string;
  userEmail: string;
  userName: string;
  role: string;
  isAdminOverride: boolean;
  assignment?: any;
  interview?: any;
  visibilityScope: VisibilityScope;
  permissions: string[];
}

export class InterviewerAuthError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "InterviewerAuthError";
  }
}

/**
 * Server-side temporal & granular access validation for Interviewers
 */
export async function validateInterviewerAccess(
  interviewId: string,
  requiredPermission?: InterviewerPermission
): Promise<InterviewerAuthContext> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.email) {
    throw new InterviewerAuthError(401, "UNAUTHENTICATED", "Authentication required.");
  }

  const userId = session.user.id;
  const userEmail = session.user.email.toLowerCase();
  const userName = session.user.name || userEmail;
  const userRole = String(session.user.role || "").toUpperCase();

  const isAdmin = ["ADMIN", "CO_ADMIN", "HR", "RECRUITER"].includes(userRole);

  // 1. Fetch Interview Schedule
  const { data: interview, error: interviewErr } = await supabaseAdmin
    .schema("recruitment")
    .from("interviews")
    .select("*")
    .eq("id", interviewId)
    .maybeSingle();

  if (interviewErr || !interview) {
    throw new InterviewerAuthError(404, "INTERVIEW_ASSIGNMENT_NOT_FOUND", "Interview not found.");
  }

  // 2. Fetch Interview Assignment for this user
  const { data: assignments, error: assignErr } = await supabaseAdmin
    .schema("recruitment")
    .from("interview_assignments")
    .select("*")
    .eq("interview_id", interviewId)
    .order("created_at", { ascending: false });

  if (assignErr) {
    throw new InterviewerAuthError(500, "DATABASE_ERROR", "Failed to resolve interview assignment.");
  }

  // Find assignment matching user ID or email
  const assignment = (assignments || []).find(
    (a) =>
      (a.interviewer_user_id && a.interviewer_user_id === userId) ||
      (a.interviewer_email && a.interviewer_email.toLowerCase() === userEmail)
  );

  // If Admin/HR and no specific assignment exists, grant full admin view context
  if (isAdmin && !assignment) {
    return {
      userId,
      userEmail,
      userName,
      role: userRole,
      isAdminOverride: true,
      interview,
      visibilityScope: {
        contact_details: true,
        resume: true,
        portfolio: true,
        application_answers: true,
        education: true,
        employment_history: true,
        assessment_results: true,
        prior_feedback: true,
        recruiter_notes: true,
        compensation_expectations: true,
      },
      permissions: [
        "interview.assignment.read",
        "interview.candidate.summary.read",
        "interview.resume.preview",
        "interview.resume.download",
        "interview.answers.read",
        "interview.portfolio.read",
        "interview.join",
        "interview.feedback.write",
        "interview.scorecard.write",
        "interview.notes.write",
        "interview.recommendation.submit",
      ],
    };
  }

  if (!assignment) {
    throw new InterviewerAuthError(403, "INTERVIEW_ASSIGNMENT_NOT_FOUND", "You are not assigned to this interview.");
  }

  // 3. Verify Revocation & Status
  if (assignment.status === "revoked" || assignment.revoked_at) {
    throw new InterviewerAuthError(
      403,
      "INTERVIEW_ACCESS_REVOKED",
      `Your access to this interview assignment was revoked${assignment.revocation_reason ? `: ${assignment.revocation_reason}` : "."}`
    );
  }

  if (assignment.status === "cancelled" || interview.status === "cancelled") {
    throw new InterviewerAuthError(403, "INTERVIEW_ACCESS_CANCELLED", "This interview has been cancelled.");
  }

  // 4. Temporal Access Window Validation (Server Time)
  const now = new Date();
  const startsAt = new Date(assignment.access_starts_at);
  const expiresAt = new Date(assignment.access_expires_at);

  if (now < startsAt) {
    throw new InterviewerAuthError(
      403,
      "INTERVIEW_ACCESS_NOT_STARTED",
      `Interview access opens at ${startsAt.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}.`
    );
  }

  if (now >= expiresAt) {
    throw new InterviewerAuthError(
      403,
      "INTERVIEW_ACCESS_EXPIRED",
      `Your temporary interview access window expired at ${expiresAt.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}.`
    );
  }

  // 5. Granular Permission Validation
  const permissions: string[] = Array.isArray(assignment.permissions) ? assignment.permissions : [];
  if (requiredPermission && !permissions.includes(requiredPermission) && !isAdmin) {
    throw new InterviewerAuthError(
      403,
      "INTERVIEW_ACTION_NOT_ALLOWED",
      `Permission '${requiredPermission}' is not granted for your assignment.`
    );
  }

  return {
    userId,
    userEmail,
    userName,
    role: userRole,
    isAdminOverride: false,
    assignment,
    interview,
    visibilityScope: assignment.visibility_scope || {},
    permissions,
  };
}

/**
 * Log access event to audit log table
 */
export async function logInterviewAccessEvent(params: {
  assignmentId: string;
  interviewId: string;
  userId?: string;
  userEmail?: string;
  eventType: string;
  actionDetails?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await supabaseAdmin
      .schema("recruitment")
      .from("interview_access_events")
      .insert({
        assignment_id: params.assignmentId,
        interview_id: params.interviewId,
        user_id: params.userId || null,
        user_email: params.userEmail || null,
        event_type: params.eventType,
        action_details: params.actionDetails || {},
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
      });
  } catch (err) {
    console.error("Failed to log interview access event:", err);
  }
}

/**
 * Cryptographic token generator for secure single-use invitation links
 */
export function generateAssignmentToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}
