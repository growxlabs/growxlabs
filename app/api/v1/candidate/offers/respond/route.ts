import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendRecruitmentEmail } from "@/lib/recruitment/email-service";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { getCandidateSession } from "@/lib/recruitment/candidate-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { offerId, applicationId, decision, notes } = body;
    const email = getCandidateSession(request)?.email;

    if (!applicationId || !email || !decision || !["accepted", "rejected"].includes(decision)) {
      return NextResponse.json({ error: "Please sign in and choose a valid offer decision." }, { status: 400 });
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

    // Insert Candidate Offer Response
    const { data: responseRecord, error: insertErr } = await supabaseAdmin
      .schema("recruitment")
      .from("candidate_offer_responses")
      .insert({
        organisation_id: CAREERS_ORGANISATION,
        offer_id: offerId || null,
        application_id: applicationId,
        candidate_email: email.toLowerCase(),
        decision,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // Update Application Stage based on decision
    const nextStage = decision === "accepted" ? "hired" : "rejected";
    const nextStatus = decision === "accepted" ? "hired" : "offer_rejected";

    await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .update({
        current_stage: nextStage,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    // Record stage history
    await supabaseAdmin
      .schema("recruitment")
      .from("application_stage_history")
      .insert({
        application_id: applicationId,
        from_stage: "offer",
        to_stage: nextStage,
        notes: `Candidate ${decision} job offer${notes ? `: ${notes}` : "."}`,
      });

    // Notify HR
    sendRecruitmentEmail({
      to: "sai@growxlabs.tech",
      subject: `[HR Alert] Candidate Offer ${decision.toUpperCase()}: ${candidateName}`,
      templateKey: "general",
      html: `
        <p>Candidate <strong>${candidateName}</strong> (${email}) has <strong>${decision.toUpperCase()}</strong> the offer for position <strong>${jobTitle}</strong>.</p>
        <div style="background-color:#f8fafc; border:1px solid #e2e8f0; padding:16px; border-radius:8px; margin:16px 0;">
          <p><strong>Application Ref:</strong> ${appData.application_reference}</p>
          <p><strong>Decision:</strong> ${decision.toUpperCase()}</p>
          <p><strong>Notes:</strong> ${notes || "None provided"}</p>
        </div>
      `,
      applicationId,
    }).catch(() => {});

    return NextResponse.json({ success: true, response: responseRecord, nextStage, message: `Offer ${decision} successfully.` });
  } catch (error: any) {
    console.error("POST Candidate Offer Response Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to submit offer response" }, { status: 500 });
  }
}
