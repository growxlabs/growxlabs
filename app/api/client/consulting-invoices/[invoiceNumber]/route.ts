/* eslint-disable @typescript-eslint/no-explicit-any */
import { financeError, getConsultingInvoiceDocument, requireFinanceClient } from "@/lib/finance/activation-workflow";

export async function GET(_: Request, { params }: { params: Promise<{ invoiceNumber: string }> }) {
  try {
    const { clientId } = await requireFinanceClient();
    const { invoiceNumber } = await params;
    const data = await getConsultingInvoiceDocument(decodeURIComponent(invoiceNumber), clientId);
    const invoice = data.invoice as Record<string, any>;
    return Response.json({ invoice: { invoiceNumber: invoice.invoice_number, status: invoice.status, currency: invoice.currency, subtotal: invoice.subtotal, discountTotal: invoice.discount_total, taxTotal: invoice.tax_total, total: invoice.total, amountPaid: invoice.amount_paid, balanceDue: invoice.balance_due, dueDate: invoice.due_date, issuedAt: invoice.issued_at, sentAt: invoice.sent_at, lineItems: invoice.line_items, taxBreakdown: invoice.tax_breakdown, paymentInstructions: invoice.payment_instructions, agreementReference: data.agreement?.agreement_number || null, proposalReference: data.proposal?.proposal_number || null, scopeReference: data.scope?.scope_number || null, payments: data.payments.map((payment: Record<string, any>) => ({ paymentNumber: payment.payment_number, amount: payment.amount, currency: payment.currency, method: payment.method, transactionReference: payment.transaction_reference, status: payment.status, submittedAt: payment.submitted_at, verifiedAt: payment.verified_at })), receipts: data.receipts.map((receipt: Record<string, any>) => ({ receiptNumber: receipt.receipt_number, amount: receipt.amount, balanceAfter: receipt.balance_after, createdAt: receipt.created_at, snapshot: receipt.snapshot })) } });
  } catch (error) { return financeError(error); }
}
