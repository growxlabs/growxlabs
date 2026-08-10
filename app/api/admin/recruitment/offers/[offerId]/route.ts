import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import {
  generateOfferPdf,
  missingOfferInputs,
  type OfferSnapshot,
} from "@/lib/recruitment/offer-letter";
import { sendRecruitmentEmail } from "@/lib/recruitment/email-service";

const input = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("issue") }),
  z.object({
    action: z.literal("record_offline_acceptance"),
    acceptedAt: z.iso.datetime(),
    evidenceReference: z.string().trim().min(3),
    note: z.string().trim().min(3),
  }),
]);
const bucket = "hrms-documents";
const safe = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 100);
async function actor(request: Request) {
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return token?.sub &&
    ["ADMIN", "HR", "RECRUITER"].includes(String(token.role).toUpperCase())
    ? { id: token.sub, role: String(token.role).toUpperCase() }
    : null;
}
async function ensureBucket() {
  const found = await supabaseAdmin.storage.getBucket(bucket);
  if (!found.error) return;
  const made = await supabaseAdmin.storage.createBucket(bucket, {
    public: false,
    allowedMimeTypes: ["application/pdf"],
    fileSizeLimit: 10 * 1024 * 1024,
  });
  if (made.error && !/already exists|duplicate/i.test(made.error.message))
    throw made.error;
}
function storageErrorMessage() {
  return "Offer document storage is unavailable. The offer has not been issued. Retry when storage is available.";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ offerId: string }> },
) {
  const user = await actor(request);
  if (!user) return Response.json({ error: "Access denied" }, { status: 403 });
  const { offerId } = await params;
  const offer = await supabaseAdmin
    .schema("recruitment")
    .from("offers")
    .select("document_id,title,current_version,application_id,candidate_id")
    .eq("id", offerId)
    .eq("organisation_id", CAREERS_ORGANISATION)
    .maybeSingle();
  if (!offer.data)
    return Response.json({ error: "Offer not found" }, { status: 404 });

  const app = await supabaseAdmin
    .schema("recruitment")
    .from("careers_applications")
    .select("profile")
    .eq("id", offer.data.application_id)
    .maybeSingle();

  let storageKey = `offers/${CAREERS_ORGANISATION}/${offerId}/v${offer.data.current_version}-${safe(app.data?.profile?.full_name || "Candidate")}.pdf`;
  try {
    if (offer.data.document_id) {
      const version = await supabaseAdmin
        .schema("documents")
        .from("versions")
        .select("storage_object_key")
        .eq("document_id", offer.data.document_id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (version.data?.storage_object_key) storageKey = version.data.storage_object_key;
    }
  } catch (err) {
    console.warn("Using canonical offer storage key fallback:", err);
  }
  const signed = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(storageKey, 300, {
      download: `${safe(offer.data.title || "GrowXLabs-Offer")}.pdf`,
    });
  if (signed.error)
    return Response.json(
      { error: "Download could not be prepared" },
      { status: 500 },
    );
  return Response.redirect(signed.data.signedUrl, 302);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ offerId: string }> },
) {
  const user = await actor(request);
  if (!user) return Response.json({ error: "Access denied" }, { status: 403 });
  const parsed = input.safeParse(await request.json());
  if (!parsed.success)
    return Response.json({ error: "Invalid offer action" }, { status: 400 });
  const { offerId } = await params;
  const offerQuery = () =>
    supabaseAdmin
      .schema("recruitment")
      .from("offers")
      .select(
        "id,application_id,candidate_id,employee_id,job_id,status,current_version,expires_at,document_id,issued_at,document_ready_at,delivery_status,delivery_error,email_message_id",
      )
      .eq("id", offerId)
      .eq("organisation_id", CAREERS_ORGANISATION)
      .maybeSingle();
  const offer = await offerQuery();
  if (offer.error || !offer.data)
    return Response.json({ error: "Offer not found" }, { status: 404 });
  const current = offer.data;

  if (parsed.data.action === "approve") {
    if (current.status !== "draft")
      return Response.json(
        { error: "Only a draft can be approved" },
        { status: 409 },
      );
    const updated = await supabaseAdmin
      .schema("recruitment")
      .from("offers")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", offerId)
      .eq("status", "draft");
    if (updated.error)
      return Response.json({ error: "Offer approval failed" }, { status: 500 });
    return Response.json({ status: "approved" });
  }

  if (parsed.data.action === "record_offline_acceptance") {
    if (user.role !== "ADMIN")
      return Response.json(
        { error: "Only an Admin can record offline acceptance" },
        { status: 403 },
      );
    if (!["sent", "accepted"].includes(current.status))
      return Response.json(
        { error: "Issue the formal offer before recording acceptance" },
        { status: 409 },
      );
    const acceptedAt = new Date(parsed.data.acceptedAt);
    if (acceptedAt > new Date())
      return Response.json(
        { error: "Acceptance date cannot be in the future" },
        { status: 400 },
      );
    if (current.status === "accepted")
      return Response.json({ status: "accepted", idempotent: true });
    const response = await supabaseAdmin
      .schema("recruitment")
      .from("candidate_offer_responses")
      .insert({
        organisation_id: CAREERS_ORGANISATION,
        offer_id: offerId,
        application_id: current.application_id,
        candidate_email: current.candidate_id,
        decision: "accepted",
        notes: `Offline evidence: ${parsed.data.evidenceReference}. ${parsed.data.note}`,
        responded_at: parsed.data.acceptedAt,
      });
    if (response.error)
      return Response.json(
        { error: "Offline acceptance could not be recorded" },
        { status: 500 },
      );
    await supabaseAdmin
      .schema("recruitment")
      .from("offers")
      .update({
        status: "accepted",
        accepted_at: parsed.data.acceptedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", offerId)
      .eq("status", "sent");
    await supabaseAdmin
      .schema("recruitment")
      .from("offer_audit")
      .insert({
        organisation_id: CAREERS_ORGANISATION,
        offer_id: offerId,
        action: "offline_acceptance_recorded",
        actor_user_id: user.id,
        reason: parsed.data.note,
        evidence_reference: parsed.data.evidenceReference,
        metadata: { acceptedAt: parsed.data.acceptedAt },
      });
    return Response.json({ status: "accepted" });
  }

  if (current.status === "sent" && current.delivery_status === "failed") {
    const retryVersion = await supabaseAdmin
      .schema("recruitment")
      .from("offer_versions")
      .select("snapshot")
      .eq("offer_id", offerId)
      .eq("version", current.current_version)
      .maybeSingle();
    const retryApp = await supabaseAdmin
      .schema("recruitment")
      .from("careers_applications")
      .select("profile")
      .eq("id", current.application_id)
      .single();
    const retrySnapshot = retryVersion.data?.snapshot as
      | OfferSnapshot
      | undefined;
    if (!retrySnapshot || !current.document_id)
      return Response.json(
        {
          error:
            "Offer document is unavailable. The offer remains issued; contact HR.",
        },
        { status: 409 },
      );
    const retryEmail = await sendRecruitmentEmail({
      to: String(retryApp.data?.profile?.email || current.candidate_id),
      subject: `Offer of Employment — ${retrySnapshot.title} | GrowXLabs`,
      templateKey: "offer_extended",
      applicationId: current.application_id,
      candidateId: current.candidate_id,
      jobId: current.job_id,
      html: `<p>Dear ${retrySnapshot.candidateName},</p><p>Your GrowXLabs offer is ready to review.</p><p><a href="${process.env.NEXTAUTH_URL || "https://growxlabs.tech"}/careers/portal">View Offer</a></p>`,
    });
    if (!retryEmail.success)
      return Response.json(
        {
          status: "sent",
          deliveryStatus: "failed",
          issued: true,
          emailSent: false,
          error: "Offer issued, but delivery failed. Retry Send is safe.",
        },
        { status: 502 },
      );
    await supabaseAdmin
      .schema("recruitment")
      .from("offers")
      .update({
        delivery_status: "sent",
        email_message_id: retryEmail.messageId || null,
        delivery_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", offerId)
      .eq("status", "sent")
      .eq("delivery_status", "failed");
    await supabaseAdmin
      .schema("recruitment")
      .from("offer_audit")
      .insert({
        organisation_id: CAREERS_ORGANISATION,
        offer_id: offerId,
        action: "offer_issued",
        actor_user_id: user.id,
        metadata: { version: current.current_version, deliveryRetry: true },
      });
    return Response.json({
      status: "sent",
      deliveryStatus: "sent",
      documentId: current.document_id,
      issued: true,
      emailSent: true,
    });
  }
  if (["sent", "accepted", "rejected"].includes(current.status))
    return Response.json({
      status: current.status,
      deliveryStatus: current.delivery_status,
      documentId: current.document_id,
      idempotent: true,
      emailSent: current.delivery_status === "sent",
    });
  if (!["approved"].includes(current.status))
    return Response.json(
      { error: "Offer must be approved before issue" },
      { status: 409 },
    );
  if (current.expires_at && new Date(current.expires_at) <= new Date())
    return Response.json(
      { error: "Offer validity has expired. Create a new version." },
      { status: 409 },
    );
  const version = await supabaseAdmin
    .schema("recruitment")
    .from("offer_versions")
    .select("id,snapshot,document_id,checksum_sha256")
    .eq("offer_id", offerId)
    .eq("version", current.current_version)
    .maybeSingle();
  if (version.error || !version.data)
    return Response.json(
      { error: "Immutable offer version is missing" },
      { status: 409 },
    );
  const snapshot = version.data.snapshot as OfferSnapshot;
  const missing = missingOfferInputs(snapshot);
  if (missing.length)
    return Response.json(
      {
        error: "Required Admin inputs or approved template wording are missing",
        missingAdminInputs: missing,
      },
      { status: 409 },
    );
  const applicationRecord=await supabaseAdmin.schema("recruitment").from("careers_applications").select("application_reference").eq("id",current.application_id).eq("organisation_id",CAREERS_ORGANISATION).maybeSingle();
  const applicationReference=String(applicationRecord.data?.application_reference||"");
  const offerReference=/^GXL-APP-/i.test(applicationReference)?applicationReference.replace(/^GXL-APP-/i,"GXL-OFFER-"):`GXL-OFFER-${new Date().getFullYear()}-${String(current.current_version).padStart(5,"0")}`;
  const documentSnapshot:OfferSnapshot={...snapshot,applicationReference,offerReference,version:current.current_version,compensationModel:snapshot.compensationModel||(snapshot.salaryAmount===0?"Incentive-based":"Fixed compensation")};
  const issuedAt = new Date();
  const pdf = generateOfferPdf(documentSnapshot, issuedAt);
  const objectKey = `offers/${CAREERS_ORGANISATION}/${offerId}/v${current.current_version}-${safe(snapshot.candidateName)}.pdf`;

  try {
    await ensureBucket();
  } catch {
    return Response.json({ error: storageErrorMessage() }, { status: 503 });
  }
  let objectExists = false;
  const existingObject = await supabaseAdmin.storage
    .from(bucket)
    .download(objectKey);
  if (!existingObject.error && existingObject.data) {
    // The object key is the canonical storage identity for this offer/version.
    // Do not compare against a freshly generated checksum here: the PDF contains
    // a generated date, so a retry would otherwise look like a false conflict.
    // A key scoped by organisation + offer id + version cannot belong to another
    // offer/version without a storage/data-integrity violation.
    objectExists = true;
  }
  if (!objectExists) {
    const stored = await supabaseAdmin.storage
      .from(bucket)
      .upload(objectKey, pdf.bytes, {
        contentType: "application/pdf",
        upsert: false,
      });
    if (
      stored.error &&
      !/already exists|duplicate|resource already exists/i.test(
        stored.error.message,
      )
    )
      return Response.json({ error: storageErrorMessage() }, { status: 503 });
  }

  const conversion = current.employee_id
    ? { data: { employee_id: current.employee_id } }
    : await supabaseAdmin
        .schema("recruitment")
        .from("employee_conversions")
        .select("employee_id")
        .eq("application_id", current.application_id)
        .maybeSingle();
  const employeeId = conversion.data?.employee_id || null;
  const recoveredEmployee = employeeId
    ? null
    : await (async () => {
        const application = await supabaseAdmin
          .schema("recruitment")
          .from("careers_applications")
          .select("profile")
          .eq("id", current.application_id)
          .maybeSingle();
        const email = String(application.data?.profile?.email || "")
          .trim()
          .toLowerCase();
        if (!email) return null;
        const identity = await supabaseAdmin
          .schema("identity")
          .from("users")
          .select("id")
          .eq("organisation_id", CAREERS_ORGANISATION)
          .eq("email", email)
          .maybeSingle();
        if (!identity.data?.id) return null;
        return supabaseAdmin
          .schema("people")
          .from("employees")
          .select("id")
          .eq("organisation_id", CAREERS_ORGANISATION)
          .eq("user_id", identity.data.id)
          .is("deleted_at", null)
          .maybeSingle();
      })();
  const documentEmployeeId = employeeId || recoveredEmployee?.data?.id || null;
  if (!documentEmployeeId)
    return Response.json(
      {
        error:
          "The existing employee link could not be recovered. The offer has not been issued; no duplicate employee was created.",
      },
      { status: 409 },
    );
  let documentId: string | null = current.document_id || null;
  try {
    const existingDocVer = await supabaseAdmin
      .schema("documents")
      .from("versions")
      .select("document_id")
      .eq("storage_object_key", objectKey)
      .maybeSingle();
    if (existingDocVer.data?.document_id) {
      documentId = existingDocVer.data.document_id;
    }
  } catch (docSchemaErr) {
    console.warn("Document schema lookup skipped or unavailable:", docSchemaErr);
  }

  // Update offer_versions metadata if permitted (ignore immutability trigger errors on retry)
  try {
    if (documentId) {
      await supabaseAdmin
        .schema("recruitment")
        .from("offer_versions")
        .update({ document_id: documentId, checksum_sha256: pdf.checksum })
        .eq("offer_id", offerId)
        .eq("version", current.current_version);
    }
  } catch (verErr) {
    console.warn("Offer version metadata update skipped:", verErr);
  }

  const claimed = await supabaseAdmin
    .schema("recruitment")
    .from("offers")
    .update({
      status: "sent",
      issued_at: current.issued_at || issuedAt.toISOString(),
      document_ready_at: current.document_ready_at || issuedAt.toISOString(),
      employee_id: documentEmployeeId,
      document_id: documentId,
      offer_letter_document_id: documentId,
      offer_letter_url: `/api/v1/candidate/offers/${offerId}/document`,
      delivery_status: current.delivery_status === "sent" ? "sent" : "sending",
      delivery_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", offerId)
    .select("id")
    .maybeSingle();
  if (claimed.error)
    return Response.json(
      {
        error:
          "Offer state could not be updated. The document is preserved; retry is safe.",
      },
      { status: 503 },
    );
  if (!claimed.data) {
    const latest = await offerQuery();
    return Response.json({
      status: latest.data?.status || "sent",
      deliveryStatus: latest.data?.delivery_status || "sending",
      documentId: latest.data?.document_id || documentId,
      idempotent: true,
    });
  }

  const application = await supabaseAdmin
    .schema("recruitment")
    .from("careers_applications")
    .select("profile,application_reference")
    .eq("id", current.application_id)
    .single();
  const email = String(
    application.data?.profile?.email || current.candidate_id,
  );
  const emailResult = await sendRecruitmentEmail({
    to: email,
    subject: `Offer of Employment — ${snapshot.title} | GrowXLabs`,
    templateKey: "offer_extended",
    applicationId: current.application_id,
    candidateId: current.candidate_id,
    jobId: current.job_id,
    html: `<p>Dear ${snapshot.candidateName},</p><p>GrowXLabs is pleased to share your formal offer for <strong>${snapshot.title}</strong>.</p><p>Proposed joining date: <strong>${new Date(snapshot.joiningDate).toLocaleDateString("en-IN")}</strong></p><p><a href="${process.env.NEXTAUTH_URL || "https://growxlabs.tech"}/careers/portal">View Offer</a></p><p>Please sign in with the same email address to review and respond.</p>`,
  });
  if (!emailResult.success) {
    await supabaseAdmin
      .schema("recruitment")
      .from("offers")
      .update({
        delivery_status: "failed",
        delivery_error: emailResult.error || "Email delivery failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", offerId)
      .eq("status", "sent");
    return Response.json(
      {
        status: "sent",
        deliveryStatus: "failed",
        documentId,
        issued: true,
        emailSent: false,
        error: "Offer issued, but delivery failed. Retry Send is safe.",
      },
      { status: 502 },
    );
  }
  await supabaseAdmin
    .schema("recruitment")
    .from("offers")
    .update({
      delivery_status: "sent",
      email_message_id: emailResult.messageId || null,
      delivery_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", offerId)
    .eq("status", "sent")
    .neq("delivery_status", "sent");
  await supabaseAdmin
    .schema("recruitment")
    .from("offer_audit")
    .insert({
      organisation_id: CAREERS_ORGANISATION,
      offer_id: offerId,
      action: "offer_issued",
      actor_user_id: user.id,
      metadata: {
        version: current.current_version,
        checksum: pdf.checksum,
        applicationReference: application.data?.application_reference,
      },
    });
  return Response.json({
    status: "sent",
    deliveryStatus: "sent",
    documentId,
    issued: true,
    emailSent: true,
  });
}
