import { financeError, requireFinanceClient, submitPayment } from "@/lib/finance/activation-workflow";

export async function POST(request: Request) {
  try { const { clientId } = await requireFinanceClient(); const body = await request.json() as Record<string, unknown>; if (!body.invoiceId || !body.amount || !body.method) return Response.json({ error: "Invoice, amount, and payment method are required." }, { status: 400 }); return Response.json({ payment: await submitPayment(String(body.invoiceId), clientId, body) }, { status: 201 }); } catch (error) { return financeError(error); }
}
