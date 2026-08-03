import { financeError, requireFinanceClient, supabaseAdmin } from "@/lib/finance/activation-workflow";

export async function GET() {
  try { const { clientId } = await requireFinanceClient(); const { data, error } = await supabaseAdmin.from("consulting_projects").select("project_number,status,activated_at,consulting_kickoffs(kickoff_number,status,agenda,preparation,meeting_details,scheduled_for)").eq("client_id", clientId).order("created_at", { ascending: false }); if (error) throw new Error(error.message); return Response.json({ projects: data || [] }); } catch (error) { return financeError(error); }
}
