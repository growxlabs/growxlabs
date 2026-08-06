import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendRecruitmentEmail } from "@/lib/recruitment/email-service";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { getCandidateSession } from "@/lib/recruitment/candidate-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interviewId, applicationId, reason, preferredTimes } = body;
    const email = getCandidateSession(request)?.email;

    if (!interviewId || !applicationId || !email || !reason) {
      return NextResponse.json({ error: "Please sign in and provide a reason for your request." }, { status: 400 });
    }

    // Verify candidate application
    const { data: appData, error: appErr } = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .select("id,application_reference,profile,careers_jobs(title)")
      .eq("id", applicationId)
      .single();

    if (appErr || !appData || String(appData.profile?.email || "").toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Application verification failed" }, { status: 403 });
    }

    const candidateName = appData.profile?.full_name || email;
    const jobTitle = (appData.careers_jobs as any)?.title || "Specialist";

    // Insert Reschedule Request
    const { data: requestRecord, error: insertErr } = await supabaseAdmin
      .schema("recruitment")
      .from("candidate_reschedule_requests")
      .insert({
        organisation_id: CAREERS_ORGANISATION,
        interview_id: interviewId,
        application_id: applicationId,
        candidate_email: email.toLowerCase(),
        reason,
        preferred_times: preferredTimes || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // Send Notification Alert to HR
    sendRecruitmentEmail({
      to: "sai@growxlabs.tech",
      subject: `[Candidate Alert] Interview Reschedule Request: ${candidateName}`,
      templateKey: "general",
      html: `
        <p>Candidate <strong>${candidateName}</strong> (${email}) has requested to reschedule their interview for position <strong>${jobTitle}</strong>.</p>
        <div style="background-color:#f8fafc; border:1px solid #e2e8f0; padding:16px; border-radius:8px; margin:16px 0;">
          <p><strong>Application Ref:</strong> ${appData.application_reference}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Preferred Times:</strong> ${preferredTimes || "Not specified"}</p>
        </div>
        <p>Please review and reschedule in the Recruitment Dashboard.</p>
      `,
      applicationId,
    }).catch(() => {});

    return NextResponse.json({ success: true, request: requestRecord, message: "Reschedule request submitted to HR." });
  } catch (error: any) {
    console.error("POST Reschedule Request Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to submit reschedule request" }, { status: 500 });
  }
}
