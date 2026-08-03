import { dockError, requireDockClient } from "@/lib/activity/dock";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const ctx = await requireDockClient();
    const { data: events, error } = await supabaseAdmin.from("client_activity_events").select("id,activity_type,priority,title,description,business_number,href,created_at").eq("client_id", ctx.clientId).order("created_at", { ascending: false }).limit(50);
    if (error) throw new Error(error.message);
    const ids = (events || []).map((event) => event.id);
    const { data: reads, error: readError } = ids.length ? await supabaseAdmin.from("client_activity_reads").select("activity_event_id").eq("user_id", ctx.userId).in("activity_event_id", ids) : { data: [], error: null };
    if (readError) throw new Error(readError.message);
    const readSet = new Set((reads || []).map((row) => row.activity_event_id));
    const activity = (events || []).map((event) => ({ ...event, read: readSet.has(event.id) }));
    const unread = activity.filter((event) => !event.read).length;
    return Response.json({ activity, unreadCount: unread, latest: activity.find((event) => !event.read && ["important", "action_required", "urgent"].includes(event.priority)) || activity[0] || null });
  } catch (error) { return dockError(error); }
}
