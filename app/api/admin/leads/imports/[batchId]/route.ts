import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function admin() {
  const session = await getServerSession(authOptions);
  return session?.user?.id &&
    ["ADMIN", "CO_ADMIN"].includes(String(session.user.role))
    ? session
    : null;
}
export async function GET(
  _: Request,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const session = await admin();
  if (!session?.user.organisation_id)
    return Response.json({ error: "Access denied" }, { status: 403 });
  const { batchId } = await params;
  const batch = await supabaseAdmin
    .from("lead_import_batches")
    .select("*")
    .eq("id", batchId)
    .eq("organisation_id", session.user.organisation_id)
    .maybeSingle();
  if (!batch.data)
    return Response.json({ error: "Import not found" }, { status: 404 });
  const candidates = await supabaseAdmin
    .from("lead_import_candidates")
    .select(
      "id,external_reference,payload_snapshot,review_status,match_status,matched_lead_id,promoted_lead_id,normalized_company_name,normalized_domain,normalized_email,normalized_phone",
    )
    .eq("batch_id", batchId)
    .eq("organisation_id", session.user.organisation_id)
    .order("created_at");
  return Response.json({
    batch: batch.data,
    candidates: candidates.data || [],
  });
}
