import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { getCandidateSession } from "@/lib/recruitment/candidate-session";

const safe = (value: string) => value.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 100);

export async function GET(request: Request, { params }: { params: Promise<{ offerId: string }> }) {
  const session = getCandidateSession(request);
  if (!session) return Response.json({ error: "Sign in to view this offer" }, { status: 401 });
  const { offerId } = await params;
  const offer = await supabaseAdmin
    .schema("recruitment")
    .from("offers")
    .select("candidate_id,application_id,document_id,status,current_version")
    .eq("id", offerId)
    .eq("organisation_id", CAREERS_ORGANISATION)
    .maybeSingle();
  if (!offer.data || !['issued', 'sent', 'accepted', 'declined', 'rejected'].includes(offer.data.status))
    return Response.json({ error: "Offer not found" }, { status: 404 });
  const app = await supabaseAdmin
    .schema("recruitment")
    .from("careers_applications")
    .select("profile")
    .eq("id", offer.data.application_id)
    .maybeSingle();
  if (String(app.data?.profile?.email || offer.data.candidate_id).toLowerCase() !== session.email)
    return Response.json({ error: "Access denied" }, { status: 403 });
  if (!offer.data.document_id)
    return Response.json({ error: "Offer document is unavailable" }, { status: 404 });

  let storageKey = `offers/${CAREERS_ORGANISATION}/${offerId}/v${offer.data.current_version}-${safe(app.data?.profile?.full_name || "Candidate")}.pdf`;
  try {
    const file = await supabaseAdmin
      .schema("documents")
      .from("versions")
      .select("storage_object_key")
      .eq("document_id", offer.data.document_id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (file.data?.storage_object_key) storageKey = file.data.storage_object_key;
  } catch (err) {
    console.warn("Using canonical offer storage key fallback:", err);
  }

  const signed = await supabaseAdmin.storage
    .from('hrms-documents')
    .createSignedUrl(storageKey, 300, { download: `GrowXLabs-Offer-${offerId}.pdf` });
  if (signed.error)
    return Response.json({ error: "Download could not be prepared" }, { status: 500 });
  await supabaseAdmin
    .schema("recruitment")
    .from("offer_audit")
    .insert({ organisation_id: CAREERS_ORGANISATION, offer_id: offerId, action: 'offer_viewed', metadata: { channel: 'candidate_portal' } });
  return Response.redirect(signed.data.signedUrl, 302);
}
