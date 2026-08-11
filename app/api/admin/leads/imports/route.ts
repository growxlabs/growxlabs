import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { upsertCanonicalLead } from "@/lib/leads/canonical";

async function admin() {
  const session = await getServerSession(authOptions);
  return session?.user?.id &&
    ["ADMIN", "CO_ADMIN"].includes(String(session.user.role))
    ? session
    : null;
}
export async function GET() {
  const session = await admin();
  if (!session?.user.organisation_id)
    return Response.json({ error: "Access denied" }, { status: 403 });
  const org = session.user.organisation_id;
  const { data, error } = await supabaseAdmin
    .from("lead_import_batches")
    .select(
      "id,batch_reference,source,source_job_id,status,received_count,valid_count,duplicate_count,needs_review_count,approved_count,imported_count,created_at",
    )
    .eq("organisation_id", org)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error)
    return Response.json(
      { error: "Imports could not be loaded" },
      { status: 500 },
    );
  return Response.json({ batches: data || [] });
}
export async function POST(request: Request) {
  const session = await admin();
  if (!session?.user.organisation_id)
    return Response.json({ error: "Access denied" }, { status: 403 });
  const body = await request.json();
  if (typeof body.candidateId !== "string")
    return Response.json({ error: "Candidate is required" }, { status: 400 });
  const org = session.user.organisation_id;
  const candidate = await supabaseAdmin
    .from("lead_import_candidates")
    .select("*,lead_import_batches!inner(source)")
    .eq("id", body.candidateId)
    .eq("organisation_id", org)
    .maybeSingle();
  if (!candidate.data)
    return Response.json(
      { error: "Import candidate not found" },
      { status: 404 },
    );
  if (
    candidate.data.review_status === "imported" &&
    candidate.data.promoted_lead_id
  )
    return Response.json({
      success: true,
      existing: true,
      leadId: candidate.data.promoted_lead_id,
    });
  if (candidate.data.match_status !== "no_match")
    return Response.json(
      { error: "Resolve the possible duplicate before approving" },
      { status: 409 },
    );
  const payload = candidate.data.payload_snapshot as any;
  const promoted = await upsertCanonicalLead(
    org,
    {
      businessName: payload.company_name,
      contactName: payload.contact?.name,
      contactTitle: payload.contact?.role,
      email: payload.contact?.email || payload.email,
      phone: payload.contact?.phone || payload.phone,
      websiteUrl: payload.website || payload.domain,
      linkedinUrl: payload.linkedin_url,
      instagramUrl: payload.instagram_url,
      city: payload.city,
      state: payload.state,
      country: payload.country,
      source: "growx-crawl",
      sourceTool: "growx-crawl",
      sourceUrl: payload.evidence_urls?.[0],
      priority: payload.priority,
      notes: payload.research_summary,
      customFields: {
        industry: payload.industry,
        whatsapp: payload.whatsapp,
        score: payload.score,
        products_services: payload.products_services,
        score_reasons: payload.score_reasons,
      },
    },
    { updateExisting: false },
  );
  const update = await supabaseAdmin
    .from("lead_import_candidates")
    .update({
      review_status: "imported",
      promoted_lead_id: promoted.lead.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", candidate.data.id)
    .eq("organisation_id", org);
  if (update.error)
    return Response.json(
      { error: "Candidate could not be promoted" },
      { status: 500 },
    );
  await supabaseAdmin
    .schema("audit")
    .from("events")
    .insert({
      organisation_id: org,
      actor_user_id: session.user.id,
      entity_type: "lead_import_candidate",
      entity_id: candidate.data.id,
      action: "crawler_candidate_promoted",
      new_value: { leadId: promoted.lead.id },
    });
  return Response.json(
    { success: true, leadId: promoted.lead.id, outcome: promoted.outcome },
    { status: 201 },
  );
}
