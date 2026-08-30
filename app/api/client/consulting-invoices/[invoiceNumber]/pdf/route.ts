import { financeError, getConsultingInvoiceDocument, requireFinanceClient } from "@/lib/finance/activation-workflow";
import { renderConsultingInvoicePdf } from "@/lib/pdf/consulting-invoice-pdf";

export async function GET(_: Request, { params }: { params: Promise<{ invoiceNumber: string }> }) {
  try {
    const { clientId } = await requireFinanceClient();
    const { invoiceNumber } = await params;
    const data = await getConsultingInvoiceDocument(decodeURIComponent(invoiceNumber), clientId);
    const pdf = await renderConsultingInvoicePdf(data);
    return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${data.invoice.invoice_number}.pdf"`, "Cache-Control": "private, no-store" } });
  } catch (error) { return financeError(error); }
}
