import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { generateAssignmentToken, logInterviewAccessEvent } from "@/lib/recruitment/interviewer-auth";
import { sendCandidateEmail, sendRecruitmentEmail } from "@/lib/recruitment/email-service";
import crypto from "crypto";
import { encryptZoomPasscode } from "@/lib/recruitment/zoom";
import { createZoomInterviewMeeting } from "@/lib/recruitment/zoom-api";

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = String(token.role || "").toUpperCase();
    if (!["ADMIN", "CO_ADMIN", "HR", "RECRUITER"].includes(role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data: interviews, error } = await supabaseAdmin
      .schema("recruitment")
      .from("interviews")
      .select("*, interview_assignments(*)")
      .eq("organisation_id", CAREERS_ORGANISATION)
      .order("scheduled_at", { ascending: false });

    if (error) throw error;

    // Fetch candidate names and job titles for display
    const appIds = [...new Set((interviews || []).map((i) => i.application_id))];
    const { data: applications } = appIds.length
      ? await supabaseAdmin.schema("recruitment").from("careers_applications").select("id,profile,candidate_id,application_reference,job_id").in("id", appIds)
      : { data: [] as any[] };

    const jobIds = [...new Set((interviews || []).map((i) => i.job_id))];
    const { data: jobs } = jobIds.length
      ? await supabaseAdmin.schema("recruitment").from("careers_jobs").select("id,title").in("id", jobIds)
      : { data: [] as any[] };

    const appMap = new Map((applications || []).map((a) => [a.id, a]));
    const jobMap = new Map((jobs || []).map((j) => [j.id, j.title]));

    const enriched = (interviews || []).map((inv) => {
      const { zoom_passcode_encrypted: _encryptedPasscode, ...safeInterview } = inv;
      const app = appMap.get(inv.application_id);
      const candidateName = app?.profile?.full_name || app?.candidate_id || inv.candidate_id;
      const candidateEmail = app?.profile?.email || inv.candidate_id;
      const jobTitle = jobMap.get(inv.job_id) || "Specialist";

      return {
        ...safeInterview,
        zoom_passcode_configured: Boolean(_encryptedPasscode),
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        application_reference: app?.application_reference,
        job_title: jobTitle,
      };
    });

    return NextResponse.json({ interviews: enriched });
  } catch (error: any) {
    console.error("GET Admin Interviews Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch interviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = String(token.role || "").toUpperCase();
    if (!["ADMIN", "CO_ADMIN", "HR", "RECRUITER"].includes(role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const {
      applicationId,
      scheduledAt,
      durationMinutes = 30,
      meetingProvider = "google_meet",
      customMeetLink,
      interviewerEmail,
      interviewerName,
      accessStartsAt,
      accessExpiresAt,
      instructions,
      meetingSdkEnabled = false,
      playbookId,
      publishPlaybook = true,
    } = body;

    if (!applicationId || !scheduledAt) {
      return NextResponse.json({ error: "Application ID and Scheduled Time are required" }, { status: 400 });
    }

    // 1. Fetch Candidate details
    const { data: application, error: appErr } = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .select("*, careers_jobs(title)")
      .eq("id", applicationId)
      .single();

    if (appErr || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const { data: activeInterview } = await supabaseAdmin
      .schema("recruitment")
      .from("interviews")
      .select("id,status,scheduled_at")
      .eq("organisation_id", CAREERS_ORGANISATION)
      .eq("application_id", applicationId)
      .not("status", "in", "(cancelled,completed,withdrawn)")
      .maybeSingle();
    if (activeInterview) {
      return NextResponse.json({ error: "This application already has an active interview scheduled.", interview: activeInterview }, { status: 409 });
    }

    const candidateName = application.profile?.full_name || application.candidate_id;
    const candidateEmail = application.profile?.email || application.candidate_id;
    const jobTitle = application.careers_jobs?.title || "Specialist";

    // 2. Resolve the provider meeting server-side. Zoom never accepts manual IDs/passcodes.
    const isZoom = String(meetingProvider).toLowerCase() === "zoom";
    if (isZoom && customMeetLink) return NextResponse.json({ error: "Zoom meetings are created automatically. Use External / Custom link for a manual meeting URL." }, { status: 400 });
    let meetingJoinUrl = process.env.GOOGLE_MEET_LINK || "https://meet.google.com/fau-nfbw-kfu";
    let zoomMeeting: Awaited<ReturnType<typeof createZoomInterviewMeeting>> | null = null;
    if (isZoom) {
      try { zoomMeeting = await createZoomInterviewMeeting({ topic: `Interview: ${candidateName} — ${jobTitle}`, startTime: new Date(scheduledAt).toISOString(), durationMinutes: Number(durationMinutes), agenda: instructions }); }
      catch (error: any) { return NextResponse.json({ error: error?.message || "Zoom is not configured." }, { status: 503 }); }
      meetingJoinUrl = zoomMeeting.join_url;
    } else if (String(meetingProvider).toLowerCase() === "external_custom") {
      if (!customMeetLink) return NextResponse.json({ error: "An external meeting link is required for External / Custom link." }, { status: 400 });
      meetingJoinUrl = customMeetLink;
    }

    // 3. Create Interview Record
    const { data: interview, error: invErr } = await supabaseAdmin
      .schema("recruitment")
      .from("interviews")
      .insert({
        organisation_id: CAREERS_ORGANISATION,
        application_id: applicationId,
        candidate_id: application.candidate_id,
        job_id: application.job_id,
        title: `Interview: ${candidateName} — ${jobTitle}`,
        stage: "INTERVIEW",
        meeting_provider: meetingProvider,
        meeting_join_url: meetingJoinUrl,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: Number(durationMinutes),
        instructions: instructions || "Review candidate context and complete evaluation scorecard during the call.",
        status: "scheduled",
        created_by: token.sub,
        zoom_meeting_id: zoomMeeting ? String(zoomMeeting.id) : null,
        zoom_passcode_encrypted: zoomMeeting?.password ? encryptZoomPasscode(zoomMeeting.password) : null,
        zoom_meeting_uuid: zoomMeeting?.uuid || null,
        meeting_sdk_enabled: isZoom && meetingSdkEnabled === true,
        provider_metadata: zoomMeeting ? { zoomStartUrl: zoomMeeting.start_url || null, zoomMeetingId: zoomMeeting.id } : {},
        zoom_configured_at: zoomMeeting ? new Date().toISOString() : null,
        zoom_configured_by: zoomMeeting ? token.sub : null,
      })
      .select()
      .single();

    if (invErr) throw invErr;

    let assignedPlaybook = null;
    if (playbookId && publishPlaybook) {
      const { data: playbook } = await supabaseAdmin.schema("recruitment").from("interview_playbooks").select("id,slug,title,status").eq("organisation_id", CAREERS_ORGANISATION).eq("id", String(playbookId)).eq("status", "published").maybeSingle();
      if (!playbook) return NextResponse.json({ error: "Selected playbook is not published or available." }, { status: 400 });
      const { data: assignment, error: assignmentError } = await supabaseAdmin.schema("recruitment").from("candidate_playbooks").upsert({ organisation_id: CAREERS_ORGANISATION, candidate_id: application.candidate_id, application_id: applicationId, interview_id: interview.id, playbook_id: playbook.id, assigned_by: token.sub, published_at: new Date().toISOString(), status: "published" }, { onConflict: "application_id,playbook_id" }).select("id,playbook_id,status,published_at").single();
      if (assignmentError) throw assignmentError;
      assignedPlaybook = { ...assignment, slug: playbook.slug, title: playbook.title };
    }

    // 4. Update Candidate Stage to 'interview'
    await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .update({ current_stage: "interview" })
      .eq("id", applicationId);

    // 5. Create Interviewer Assignment if interviewer email is provided
    let assignment = null;
    if (interviewerEmail) {
      const interviewDate = new Date(scheduledAt);
      
      // Default access window: 24 hours before interview -> 2 hours after interview
      const defaultStartsAt = new Date(interviewDate.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const defaultExpiresAt = new Date(interviewDate.getTime() + (Number(durationMinutes) + 120) * 60 * 1000).toISOString();

      const start = accessStartsAt ? new Date(accessStartsAt).toISOString() : defaultStartsAt;
      const expire = accessExpiresAt ? new Date(accessExpiresAt).toISOString() : defaultExpiresAt;

      const { rawToken, tokenHash } = generateAssignmentToken();
      const invitationExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(); // 72h token validity

      // Lookup user ID for interviewer if exists
      const { data: userMatch } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", interviewerEmail.toLowerCase())
        .maybeSingle();

      const { data: assignData, error: assignErr } = await supabaseAdmin
        .schema("recruitment")
        .from("interview_assignments")
        .insert({
          organisation_id: CAREERS_ORGANISATION,
          interview_id: interview.id,
          application_id: applicationId,
          candidate_id: application.candidate_id,
          job_id: application.job_id,
          interviewer_user_id: userMatch?.id || null,
          interviewer_email: interviewerEmail.toLowerCase(),
          interviewer_name: interviewerName || interviewerEmail,
          assigned_by_user_id: token.sub,
          access_starts_at: start,
          access_expires_at: expire,
          status: "invited",
          invitation_token_hash: tokenHash,
          invitation_expires_at: invitationExpiresAt,
        })
        .select()
        .single();

      if (!assignErr) {
        assignment = assignData;

        // Log audit event
        await logInterviewAccessEvent({
          assignmentId: assignData.id,
          interviewId: interview.id,
          userId: token.sub as string,
          userEmail: token.email as string,
          eventType: "assignment_created",
          actionDetails: { interviewerEmail, accessStartsAt: start, accessExpiresAt: expire },
        });

        // Send Invitation Email to Interviewer
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://growxlabs.tech";
        const invitationLink = `${baseUrl}/interviewer/invitations/${rawToken}`;

        sendRecruitmentEmail({
          to: interviewerEmail,
          subject: `Interview Assignment: ${candidateName} for ${jobTitle} | GrowXLabs`,
          templateKey: "interviewer_assignment",
          html: `<p>Hi ${interviewerName || interviewerEmail},</p>
            <p>You have been assigned to interview <strong>${candidateName}</strong> for the position of <strong>${jobTitle}</strong>.</p>
            <div style="background-color:#f8fafc; border:1px solid #e2e8f0; padding:16px; border-radius:8px; margin:16px 0;">
              <p>📅 <strong>Date:</strong> ${interviewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p>⏰ <strong>Time:</strong> ${interviewDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              <p>⏱️ <strong>Duration:</strong> ${durationMinutes} mins</p>
              <p>🔓 <strong>Access Window:</strong> ${new Date(start).toLocaleString()} to ${new Date(expire).toLocaleString()}</p>
            </div>
            <p>Access candidate context, resume, screening answers, and complete your scorecard in the Interviewer Workspace:</p>
            <a href="${invitationLink}" style="display:inline-block; padding:12px 24px; background-color:#0075de; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">Accept Assignment & Open Workspace</a>`,
          applicationId,
          jobId: application.job_id,
        }).catch(() => {});
      }
    }

    // 6. Send Confirmation Email to Candidate
    sendCandidateEmail(
      "interview_invite",
      {
        candidateName,
        jobTitle,
        interviewDate: new Date(scheduledAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        interviewTime: new Date(scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        interviewLink: meetingJoinUrl,
        timeZone: "Asia/Kolkata",
        interviewDuration: String(durationMinutes),
        interviewerName: interviewerName || "GrowXLabs Recruitment Team",
        preparationInstructions: assignedPlaybook ? "A preparation guide is available in your candidate portal." : instructions || "Please review your application and be ready to discuss your experience.",
        portalLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://growxlabs.tech"}/careers/applications/${applicationId}`,
        playbookCta: assignedPlaybook ? `<p style="text-align:center"><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://growxlabs.tech"}/careers/applications/${applicationId}/playbook/${assignedPlaybook.slug}" style="display:inline-block;padding:10px 16px;background:#0075de;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">View Interview Playbook</a></p>` : "",
      },
      candidateEmail,
      application.candidate_id,
      applicationId,
      application.job_id
    ).catch(() => {});

    return NextResponse.json({ interview, assignment, playbook: assignedPlaybook });
  } catch (error: any) {
    console.error("POST Admin Interviews Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to schedule interview" }, { status: 500 });
  }
}
