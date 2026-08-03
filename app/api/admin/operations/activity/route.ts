import { dockError, requireDockAdmin } from "@/lib/activity/dock";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function GET() { try { await requireDockAdmin(); const { data, error } = await supabaseAdmin.from("client_activity_events").select("id,activity_type,priority,title,description,business_number,href,created_at,client_id,company_id").order("created_at", { ascending: false }).limit(50); if (error) throw new Error(error.message); return Response.json({ activity: data || [] }); } catch (error) { return dockError(error); } }
