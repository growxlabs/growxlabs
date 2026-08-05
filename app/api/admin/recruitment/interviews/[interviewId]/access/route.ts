import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { generateAssignmentToken, logInterviewAccessEvent } from "@/lib/recruitment/interviewer-auth";
import { sendRecruitmentEmail } from "@/lib/recruitment/email-service";

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

    // Fetch assignments and audit access events
    const { data: assignments, error: assignErr } = await supabaseAdmin
      .schema("recruitment")
      .from("interview_assignments")
      .select("*")
      .eq("interview_id", interviewId)
      .order("created_at", { ascending: false });

    if (assignErr) throw assignErr;

    const { data: auditEvents } = await supabaseAdmin
      .schema("recruitment")
      .from("interview_access_events")
      .select("*")
      .eq("interview_id", interviewId)
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({
      assignments: assignments || [],
      auditEvents: auditEvents || [],
    });
  } catch (error: any) {
    console.error("GET Interview Access Control Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch access details" }, { status: 500 });
  }
}

export async function POST(
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
    const { interviewerEmail, interviewerName, accessStartsAt, accessExpiresAt, visibilityScope, permissions } = body;

    if (!interviewerEmail) {
      return NextResponse.json({ error: "Interviewer email is required" }, { status: 400 });
    }

    const { data: interview } = await supabaseAdmin
      .schema("recruitment")
      .from("interviews")
      .select("*")
      .eq("id", interviewId)
      .single();

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const { data: appData } = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .select("*, careers_jobs(title)")
      .eq("id", interview.application_id)
      .single();

    const candidateName = appData?.profile?.full_name || interview.candidate_id;
    const jobTitle = appData?.careers_jobs?.title || "Specialist";

    const interviewDate = new Date(interview.scheduled_at);
    const start = accessStartsAt ? new Date(accessStartsAt).toISOString() : new Date(interviewDate.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const expire = accessExpiresAt ? new Date(accessExpiresAt).toISOString() : new Date(interviewDate.getTime() + 150 * 60 * 1000).toISOString();

    const { rawToken, tokenHash } = generateAssignmentToken();
    const invitationExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    const { data: userMatch } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", interviewerEmail.toLowerCase())
      .maybeSingle();

    const { data: assignment, error: assignErr } = await supabaseAdmin
      .schema("recruitment")
      .from("interview_assignments")
      .insert({
        organisation_id: CAREERS_ORGANISATION,
        interview_id: interviewId,
        application_id: interview.application_id,
        candidate_id: interview.candidate_id,
        job_id: interview.job_id,
        interviewer_user_id: userMatch?.id || null,
        interviewer_email: interviewerEmail.toLowerCase(),
        interviewer_name: interviewerName || interviewerEmail,
        assigned_by_user_id: token.sub,
        access_starts_at: start,
        access_expires_at: expire,
        status: "invited",
        ...(visibilityScope ? { visibility_scope: visibilityScope } : {}),
        ...(permissions ? { permissions } : {}),
        invitation_token_hash: tokenHash,
        invitation_expires_at: invitationExpiresAt,
      })
      .select()
      .single();

    if (assignErr) throw assignErr;

    // Log Audit Event
    await logInterviewAccessEvent({
      assignmentId: assignment.id,
      interviewId,
      userId: token.sub as string,
      userEmail: token.email as string,
      eventType: "assignment_created",
      actionDetails: { interviewerEmail, accessStartsAt: start, accessExpiresAt: expire },
    });

    // Send Invitation Email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://growxlabs.tech";
    const invitationLink = `${baseUrl}/interviewer/invitations/${rawToken}`;

    sendRecruitmentEmail({
      to: interviewerEmail,
      subject: `Interview Assignment: ${candidateName} for ${jobTitle} | GrowXLabs`,
      templateKey: "interviewer_assignment",
      html: `<p>Hi ${interviewerName || interviewerEmail},</p>
        <p>You have been assigned to conduct an interview for <strong>${candidateName}</strong> applying for <strong>${jobTitle}</strong>.</p>
        <div style="background-color:#f8fafc; border:1px solid #e2e8f0; padding:16px; border-radius:8px; margin:16px 0;">
          <p>📅 <strong>Date:</strong> ${interviewDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
          <p>⏰ <strong>Time:</strong> ${interviewDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
          <p>🔓 <strong>Access Window:</strong> ${new Date(start).toLocaleString()} to ${new Date(expire).toLocaleString()}</p>
        </div>
        <p>Access the Interviewer Workspace to review candidate details, resume, screening answers, and complete your evaluation scorecard:</p>
        <a href="${invitationLink}" style="display:inline-block; padding:12px 24px; background-color:#0075de; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">Review Candidate & Access Workspace</a>`,
      applicationId: interview.application_id,
      jobId: interview.job_id,
    }).catch(() => {});

    return NextResponse.json({ assignment });
  } catch (error: any) {
    console.error("POST Admin Interview Access Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to assign interviewer" }, { status: 500 });
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
    const { action, assignmentId, extensionHours, customExpiresAt, reason, visibilityScope, permissions } = body;

    if (!assignmentId || !action) {
      return NextResponse.json({ error: "Assignment ID and action are required" }, { status: 400 });
    }

    // Fetch existing assignment
    const { data: assignment, error: fetchErr } = await supabaseAdmin
      .schema("recruitment")
      .from("interview_assignments")
      .select("*")
      .eq("id", assignmentId)
      .eq("interview_id", interviewId)
      .single();

    if (fetchErr || !assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    let updatedAssignment: any = null;

    if (action === "extend") {
      const currentExpiry = new Date(assignment.access_expires_at > new Date().toISOString() ? assignment.access_expires_at : new Date());
      const hours = Number(extensionHours || 24);
      const newExpiry = customExpiresAt ? new Date(customExpiresAt).toISOString() : new Date(currentExpiry.getTime() + hours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabaseAdmin
        .schema("recruitment")
        .from("interview_assignments")
        .update({
          access_expires_at: newExpiry,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignmentId)
        .select()
        .single();

      if (error) throw error;
      updatedAssignment = data;

      await logInterviewAccessEvent({
        assignmentId,
        interviewId,
        userId: token.sub as string,
        userEmail: token.email as string,
        eventType: "access_extended",
        actionDetails: { extensionHours: hours, newExpiry },
      });
    } else if (action === "revoke") {
      const { data, error } = await supabaseAdmin
        .schema("recruitment")
        .from("interview_assignments")
        .update({
          status: "revoked",
          revoked_at: new Date().toISOString(),
          revoked_by: token.sub,
          revocation_reason: reason || "Revoked by recruitment administrator",
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignmentId)
        .select()
        .single();

      if (error) throw error;
      updatedAssignment = data;

      await logInterviewAccessEvent({
        assignmentId,
        interviewId,
        userId: token.sub as string,
        userEmail: token.email as string,
        eventType: "access_revoked",
        actionDetails: { reason },
      });
    } else if (action === "update_visibility") {
      const { data, error } = await supabaseAdmin
        .schema("recruitment")
        .from("interview_assignments")
        .update({
          visibility_scope: visibilityScope,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignmentId)
        .select()
        .single();

      if (error) throw error;
      updatedAssignment = data;
    } else if (action === "update_permissions") {
      const { data, error } = await supabaseAdmin
        .schema("recruitment")
        .from("interview_assignments")
        .update({
          permissions: permissions,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignmentId)
        .select()
        .single();

      if (error) throw error;
      updatedAssignment = data;
    } else if (action === "resend_invitation") {
      const { rawToken, tokenHash } = generateAssignmentToken();
      const invitationExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabaseAdmin
        .schema("recruitment")
        .from("interview_assignments")
        .update({
          invitation_token_hash: tokenHash,
          invitation_expires_at: invitationExpiresAt,
          status: "invited",
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignmentId)
        .select()
        .single();

      if (error) throw error;
      updatedAssignment = data;

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://growxlabs.tech";
      const invitationLink = `${baseUrl}/interviewer/invitations/${rawToken}`;

      sendRecruitmentEmail({
        to: assignment.interviewer_email,
        subject: `[Resent] Interview Assignment Link | GrowXLabs`,
        templateKey: "interviewer_assignment",
        html: `<p>Hi ${assignment.interviewer_name || assignment.interviewer_email},</p>
          <p>Here is your resent secure link to access the Interviewer Workspace for candidate review:</p>
          <a href="${invitationLink}" style="display:inline-block; padding:12px 24px; background-color:#0075de; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">Open Interviewer Workspace</a>`,
        applicationId: assignment.application_id,
        jobId: assignment.job_id,
      }).catch(() => {});

      await logInterviewAccessEvent({
        assignmentId,
        interviewId,
        userId: token.sub as string,
        userEmail: token.email as string,
        eventType: "invitation_sent",
        actionDetails: { resent: true },
      });
    }

    return NextResponse.json({ assignment: updatedAssignment });
  } catch (error: any) {
    console.error("PATCH Admin Interview Access Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to execute access action" }, { status: 500 });
  }
}
