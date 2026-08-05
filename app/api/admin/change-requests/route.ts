import { deliveryError, requireDeliveryAdmin, supabaseAdmin } from "@/lib/delivery/workflow";

export async function GET() {
  try {
    await requireDeliveryAdmin();
    const { data, error } = await supabaseAdmin.from("change_requests").select("id,change_number,title,status,impact,client_id,project_id,created_at,updated_at").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return Response.json({ changes: data || [] });
  } catch (error) { return deliveryError(error); }
}
