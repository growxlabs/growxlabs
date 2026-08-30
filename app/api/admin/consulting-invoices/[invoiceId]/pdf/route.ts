import { getConsultingInvoiceDocument, financeError, requireFinanceAdmin } from "@/lib/finance/activation-workflow";
import { renderConsultingInvoicePdf } from "@/lib/pdf/consulting-invoice-pdf";

export async function GET(_: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
  try {
    await requireFinanceAdmin();
    const { invoiceId } = await params;
    const data = await getConsultingInvoiceDocument(decodeURIComponent(invoiceId));
    const pdf = await renderConsultingInvoicePdf(data);
    return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${data.invoice.invoice_number}.pdf"`, "Cache-Control": "private, no-store" } });
  } catch (error) { return financeError(error); }
}
