import { dockError, requireDockAdmin } from "@/lib/activity/dock";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function GET() { try { await requireDockAdmin(); const { data, error } = await supabaseAdmin.from("audit_events").select("id,action,resource_type,resource_id,metadata,created_at,actor_id").order("created_at", { ascending: false }).limit(50); if (error) throw new Error(error.message); return Response.json({ audit: data || [] }); } catch (error) { return dockError(error); } }
