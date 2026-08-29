import { communicationError, requireCommunicationClient } from "@/lib/communications/service";
import { getAgreementPdfForClient } from "@/lib/commercial/msa";

export async function GET(_: Request, { params }: { params: Promise<{ agreementNumber: string }> }) {
  try {
    const client = await requireCommunicationClient();
    const { agreementNumber } = await params;
    const data = await getAgreementPdfForClient(decodeURIComponent(agreementNumber), client.clientId, client.userId);
    return new Response(new Uint8Array(data.pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${data.agreementNumber}-v${data.version}.pdf"`, "Cache-Control": "private, no-store" } });
  } catch (error) { return communicationError(error); }
}
