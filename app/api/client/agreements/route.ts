import { communicationError, requireCommunicationClient } from "@/lib/communications/service";
import { listClientAgreements } from "@/lib/commercial/msa";

export async function GET() {
  try {
    const { clientId } = await requireCommunicationClient();
    return Response.json({ agreements: await listClientAgreements(clientId) });
  } catch (error) { return communicationError(error); }
}
