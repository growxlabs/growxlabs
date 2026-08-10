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

    if (!offerId) return NextResponse.json({ error: "A valid issued offer is required." }, { status: 400 });
    const { data: offer, error: offerErr } = await supabaseAdmin
      .schema("recruitment").from("offers")
      .select("id,status,expires_at,application_id,candidate_id")
      .eq("id", offerId).eq("application_id", applicationId)
      .eq("organisation_id", CAREERS_ORGANISATION).maybeSingle();
    if (offerErr || !offer || !["issued", "sent"].includes(offer.status)) {
      return NextResponse.json({ error: "This offer is unavailable or has already received a response." }, { status: 409 });
    }
    if (offer.expires_at && new Date(offer.expires_at) <= new Date()) {
      await supabaseAdmin.schema("recruitment").from("offers").update({ status: "expired", updated_at: new Date().toISOString() }).eq("id", offer.id);
      await supabaseAdmin.schema("recruitment").from("offer_audit").insert({ organisation_id: CAREERS_ORGANISATION, offer_id: offer.id, action: "offer_expired", metadata: { channel: "candidate_portal" } });
      return NextResponse.json({ error: "This offer has expired. Please contact the GrowXLabs People team." }, { status: 409 });
    }

    // Insert Candidate Offer Response if table exists in schema cache
    try {
      await supabaseAdmin
        .schema("recruitment")
        .from("candidate_offer_responses")
        .insert({
          organisation_id: CAREERS_ORGANISATION,
          offer_id: offerId || null,
          application_id: applicationId,
          candidate_email: email.toLowerCase(),
          decision,
          notes: notes || null,
        });
    } catch (respErr) {
      console.warn("Optional candidate_offer_responses write skipped:", respErr);
    }

    const respondedAt = new Date().toISOString();
    await supabaseAdmin.schema("recruitment").from("offers").update({
      status: decision === "accepted" ? "accepted" : "rejected",
      accepted_at: decision === "accepted" ? respondedAt : null,
      declined_at: decision === "rejected" ? respondedAt : null,
      updated_at: respondedAt,
    }).eq("id", offer.id).in("status", ["issued", "sent"]);
    await supabaseAdmin.schema("recruitment").from("offer_audit").insert({
      organisation_id: CAREERS_ORGANISATION, offer_id: offer.id,
      action: decision === "accepted" ? "offer_accepted" : "offer_declined",
      metadata: { channel: "candidate_portal" },
    });

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

    return NextResponse.json({ success: true, decision, nextStage, message: `Offer ${decision} successfully.` });
  } catch (error: any) {
    console.error("POST Candidate Offer Response Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to submit offer response" }, { status: 500 });
  }
}
