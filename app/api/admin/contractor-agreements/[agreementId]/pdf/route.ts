import { contractorError, requireContractorAgreementAdmin } from "@/lib/contractors/access";
import { getContractorAgreementPdf } from "@/lib/contractors/agreements";

export async function GET(_: Request, { params }: { params: Promise<{ agreementId: string }> }) {
  try {
    await requireContractorAgreementAdmin();
    const { agreementId } = await params;
    const data = await getContractorAgreementPdf(agreementId);
    return new Response(new Uint8Array(data.pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${data.agreement.agreementNumber}-v${data.version.version}.pdf"`, "Cache-Control": "private, no-store" } });
  } catch (error) {
    return contractorError(error);
  }
}
