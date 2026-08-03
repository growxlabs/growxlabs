import { financeError, requireFinanceClient, supabaseAdmin } from "@/lib/finance/activation-workflow";

export async function GET() {
  try { const { clientId } = await requireFinanceClient(); const { data, error } = await supabaseAdmin.from("consulting_advance_invoices").select("invoice_number,status,currency,total,amount_paid,balance_due,due_date,issued_at,sent_at,line_items,payment_instructions").eq("client_id", clientId).order("created_at", { ascending: false }); if (error) throw new Error(error.message); return Response.json({ invoices: data || [] }); } catch (error) { return financeError(error); }
}
