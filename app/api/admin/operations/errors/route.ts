import { dockError, requireDockAdmin } from "@/lib/activity/dock";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function GET() { try { await requireDockAdmin(); const { data, error } = await supabaseAdmin.from("system_error_events").select("id,error_number,severity,summary,detail,module,occurrence_count,status,assigned_to,first_seen,last_seen").neq("status", "resolved").order("last_seen", { ascending: false }).limit(50); if (error) throw new Error(error.message); return Response.json({ errors: data || [] }); } catch (error) { return dockError(error); } }
