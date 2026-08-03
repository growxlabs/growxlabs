import { createAdvanceInvoice, financeError, requireFinanceAdmin, supabaseAdmin } from "@/lib/finance/activation-workflow";

export async function GET() {
  try { await requireFinanceAdmin(); const { data, error } = await supabaseAdmin.from("consulting_advance_invoices").select("id,invoice_number,status,currency,total,amount_paid,balance_due,due_date,created_at,client_id,agreement_id").order("created_at", { ascending: false }); if (error) throw new Error(error.message); return Response.json({ invoices: data || [] }); } catch (error) { return financeError(error); }
}

export async function POST(request: Request) {
  try { const { userId } = await requireFinanceAdmin(); const body = await request.json() as { agreementId?: string }; if (!body.agreementId) return Response.json({ error: "Agreement is required." }, { status: 400 }); return Response.json({ invoice: await createAdvanceInvoice(body.agreementId, userId) }, { status: 201 }); } catch (error) { return financeError(error); }
}
