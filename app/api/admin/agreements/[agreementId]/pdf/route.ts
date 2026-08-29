import { commercialError, requireCommercialAdmin } from "@/lib/commercial/workflow";
import { getAgreementPdfForAdmin } from "@/lib/commercial/msa";

export async function GET(_: Request, { params }: { params: Promise<{ agreementId: string }> }) {
  try {
    await requireCommercialAdmin();
    const { agreementId } = await params;
    const data = await getAgreementPdfForAdmin(agreementId);
    return new Response(new Uint8Array(data.pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${data.agreement.agreementNumber}-v${data.version.version}.pdf"`, "Cache-Control": "private, no-store" } });
  } catch (error) { return commercialError(error); }
}
