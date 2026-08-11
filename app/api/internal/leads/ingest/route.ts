import { z } from "zod";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  upsertCanonicalLead,
  normalizeDomain,
  normalizeEmail,
  normalizePhone,
} from "@/lib/leads/canonical";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { getGrowXCrawlConfig } from "@/lib/integrations/growx-crawl-config";

const leadSchema = z
  .object({
    external_reference: z.string().trim().min(1).max(200),
    company_name: z.string().trim().min(1).max(240),
    industry: z.string().trim().max(160).optional(),
    website: z.string().url().max(500).optional(),
    domain: z.string().trim().max(500).optional(),
    email: z.string().email().max(320).optional(),
    phone: z.string().max(50).optional(),
    whatsapp: z.string().max(50).optional(),
    city: z.string().max(160).optional(),
    state: z.string().max(160).optional(),
    country: z.string().max(160).optional(),
    contact: z
      .object({
        name: z.string().max(240).optional(),
        role: z.string().max(160).optional(),
        email: z.string().email().max(320).optional(),
        phone: z.string().max(50).optional(),
      })
      .optional(),
    linkedin_url: z.string().url().max(500).optional(),
    instagram_url: z.string().url().max(500).optional(),
    score: z.number().min(0).max(10).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    products_services: z.string().max(5000).optional(),
    research_summary: z.string().max(10000).optional(),
    evidence_urls: z.array(z.string().url().max(500)).max(20).optional(),
    discovered_at: z.string().datetime().optional(),
  })
  .strict();
const envelope = z
  .object({
    schema_version: z.literal("1"),
    source: z.literal("growx-crawl"),
    crawl_job_id: z.string().trim().min(1).max(200),
    leads: z.array(leadSchema).min(1).max(500),
  })
  .strict();

function auth(request: Request) {
  let expected: string | undefined;
  try {
    expected = getGrowXCrawlConfig().token;
  } catch {
    return false;
  }
  const actual = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  return Boolean(
    expected &&
      actual &&
      actual.length === expected.length &&
      actual.split("").every((char, index) => char === expected[index]),
  );
}
function batchRef() {
  return `GXL-IMP-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  if (!auth(request))
    return Response.json(
      {
        success: false,
        code: "invalid_service_authentication",
        error: "Service authentication failed",
      },
      { status: 401 },
    );
  const organisationId =
    getGrowXCrawlConfig().organisationId || CAREERS_ORGANISATION;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        code: "invalid_json",
        error: "A valid JSON payload is required",
      },
      { status: 400 },
    );
  }
  const parsed = envelope.safeParse(body);
  if (!parsed.success)
    return Response.json(
      {
        success: false,
        code: "invalid_payload",
        error: "Payload does not match schema version 1",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  const input = parsed.data;
  const existing = await supabaseAdmin
    .from("lead_import_batches")
    .select(
      "id,batch_reference,received_count,valid_count,duplicate_count,needs_review_count",
    )
    .eq("organisation_id", organisationId)
    .eq("source", input.source)
    .eq("source_job_id", input.crawl_job_id)
    .eq("schema_version", input.schema_version)
    .maybeSingle();
  if (existing.data)
    return Response.json({
      success: true,
      replay: true,
      batch_reference: existing.data.batch_reference,
      received: existing.data.received_count,
      accepted_for_review: existing.data.valid_count,
      possible_duplicates: existing.data.duplicate_count,
      invalid: 0,
    });
  const batch = await supabaseAdmin
    .from("lead_import_batches")
    .insert({
      organisation_id: organisationId,
      batch_reference: batchRef(),
      source: input.source,
      source_job_id: input.crawl_job_id,
      schema_version: input.schema_version,
      received_count: input.leads.length,
    })
    .select("id,batch_reference")
    .single();
  if (batch.error)
    return Response.json(
      {
        success: false,
        code: "batch_create_failed",
        error: "Import batch could not be created",
      },
      { status: 500 },
    );
  let valid = 0,
    duplicates = 0,
    review = 0;
  for (const lead of input.leads) {
    const email = normalizeEmail(lead.contact?.email || lead.email),
      phone = normalizePhone(
        lead.contact?.phone || lead.whatsapp || lead.phone,
      ),
      domain = normalizeDomain(lead.domain || lead.website);
    let matchQuery = supabaseAdmin
      .from("leads")
      .select("id")
      .eq("organisation_id", organisationId)
      .is("deleted_at", null);
    const signals = [
      email && `normalized_email.eq.${email}`,
      phone && `normalized_phone.eq.${phone}`,
      domain && `normalized_domain.eq.${domain}`,
    ]
      .filter(Boolean)
      .join(",");
    const matches = await (signals ? matchQuery.or(signals) : matchQuery).limit(
      2,
    );
    const matchStatus = matches.data?.length
      ? matches.data.length > 1
        ? "ambiguous"
        : "possible_duplicate"
      : "no_match";
    if (matchStatus !== "no_match") duplicates++;
    if (matchStatus === "ambiguous") review++;
    else valid++;
    await supabaseAdmin.from("lead_import_candidates").insert({
      batch_id: batch.data.id,
      organisation_id: organisationId,
      external_reference: lead.external_reference,
      payload_snapshot: lead,
      normalized_company_name: lead.company_name.trim().toLowerCase(),
      normalized_domain: domain,
      normalized_email: email,
      normalized_phone: phone,
      match_status: matchStatus,
      matched_lead_id: matches.data?.[0]?.id || null,
    });
  }
  await supabaseAdmin
    .from("lead_import_batches")
    .update({
      valid_count: valid,
      duplicate_count: duplicates,
      needs_review_count: review,
      status: "ready",
      updated_at: new Date().toISOString(),
    })
    .eq("id", batch.data.id);
  await supabaseAdmin
    .schema("audit")
    .from("events")
    .insert({
      organisation_id: organisationId,
      entity_type: "lead_import",
      entity_id: batch.data.id,
      action: "crawler_import_received",
      new_value: {
        source: input.source,
        crawlJobId: input.crawl_job_id,
        received: input.leads.length,
      },
    });
  return Response.json(
    {
      success: true,
      batch_reference: batch.data.batch_reference,
      received: input.leads.length,
      accepted_for_review: valid,
      possible_duplicates: duplicates,
      invalid: 0,
    },
    { status: 201 },
  );
}
