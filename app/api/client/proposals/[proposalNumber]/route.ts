import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { communicationError,requireCommunicationClient } from "@/lib/communications/service";
import { clientDecision,getClientProposal } from "@/lib/commercial/proposal-phase2";
export async function GET(_:Request,{params}:{params:Promise<{proposalNumber:string}>}){try{const client=await requireCommunicationClient(),{proposalNumber}=await params;return Response.json(await getClientProposal(decodeURIComponent(proposalNumber),client.clientId,client.userId,true));}catch(error){return communicationError(error);}}
export async function POST(request:Request,{params}:{params:Promise<{proposalNumber:string}>}){try{const client=await requireCommunicationClient(),session=await getServerSession(authOptions),{proposalNumber}=await params,body=await request.json();return Response.json(await clientDecision(decodeURIComponent(proposalNumber),client.clientId,client.userId,session?.user?.name||session?.user?.email||"Client",{...body,requestMetadata:{userAgent:request.headers.get("user-agent")}}));}catch(error){return communicationError(error);}}
