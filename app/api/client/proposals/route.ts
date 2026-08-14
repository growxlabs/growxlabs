import { communicationError,requireCommunicationClient } from "@/lib/communications/service";
import { listClientProposals } from "@/lib/commercial/proposal-phase2";
export async function GET(){try{const {clientId}=await requireCommunicationClient();return Response.json({proposals:await listClientProposals(clientId)});}catch(error){return communicationError(error);}}
