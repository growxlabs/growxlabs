import { dockError, requireDockAdmin } from "@/lib/activity/dock";
import { supabaseAdmin } from "@/lib/supabase/admin";

type SourceRow = Record<string, unknown>;

type ActivityRow = {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  created_at: string;
  actor_id: string | null;
  source: string;
};

type QueryResult = {
  data: unknown[] | null;
  error: { code?: string; message: string } | null;
};

const text = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
};

const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

function record(value: unknown): SourceRow {
  return value && typeof value === "object" && !Array.isArray(value) ? value as SourceRow : {};
}

function metadataSummary(value: unknown) {
  const metadata = record(value);
  const referenceKeys = [
    "agreementNumber",
    "proposalNumber",
    "scopeNumber",
    "invoiceNumber",
    "paymentNumber",
    "receiptNumber",
    "onboardingNumber",
    "projectNumber",
    "kickoffNumber",
  ];
  const references = referenceKeys.map((key) => text(metadata[key])).filter(Boolean);
  return references.length ? references.join(" · ") : "";
}

function normalize(source: string, item: unknown): ActivityRow | null {
  const row = record(item);
  const id = text(row.id);
  const createdAt = text(row.created_at);
  if (!id || !createdAt) return null;

  const eventType = text(row.event_type) || text(row.activity_type) || "activity";
  const subject = text(row.document_type) || text(row.entity_type) || source;
  const reference = metadataSummary(row.metadata);

  return {
    id: `${source}:${id}`,
    activity_type: eventType,
    title: `${label(eventType)} · ${label(subject)}`,
    description: reference || `Recorded in ${label(source)}.`,
    created_at: createdAt,
    actor_id: text(row.actor_id) || null,
    source,
  };
}

async function readSource(source: string, query: () => PromiseLike<QueryResult>) {
  const result = await query();
  if (result.error) {
    const isMissingTable = result.error.code === "42P01" || /does not exist|schema cache/i.test(result.error.message);
    if (isMissingTable) return [];
    throw new Error(result.error.message);
  }
  return (result.data || []).map((item) => normalize(source, item)).filter((item): item is ActivityRow => Boolean(item));
}

export async function GET() {
  try {
    await requireDockAdmin();

    const sources = await Promise.all([
      readSource("commercial", () => supabaseAdmin.from("commercial_document_activity").select("id,document_type,event_type,metadata,created_at,actor_id").order("created_at", { ascending: false }).limit(50)),
      readSource("finance", () => supabaseAdmin.from("finance_activation_activity").select("id,entity_type,event_type,metadata,created_at,actor_id").order("created_at", { ascending: false }).limit(50)),
      readSource("consulting", () => supabaseAdmin.from("consulting_document_activity").select("id,document_type,event_type,metadata,created_at,actor_id").order("created_at", { ascending: false }).limit(50)),
      readSource("delivery", () => supabaseAdmin.from("project_delivery_activity").select("id,entity_type,event_type,metadata,created_at,actor_id").order("created_at", { ascending: false }).limit(50)),
    ]);

    const activity = sources.flat().sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()).slice(0, 50);
    return Response.json({ activity });
  } catch (error) {
    return dockError(error);
  }
}
