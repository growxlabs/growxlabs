import { communicationError, requireCommunicationClient } from "@/lib/communications/service";
import { getClientAgreement, recordAgreementSignature } from "@/lib/commercial/msa";
import type { SignatureInput } from "@/lib/commercial/msa";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(_: Request, { params }: { params: Promise<{ agreementNumber: string }> }) {
  try {
    const client = await requireCommunicationClient();
    const { agreementNumber } = await params;
    return Response.json(await getClientAgreement(decodeURIComponent(agreementNumber), client.clientId, client.userId, true));
  } catch (error) { return communicationError(error); }
}

export async function POST(request: Request, { params }: { params: Promise<{ agreementNumber: string }> }) {
  try {
    const client = await requireCommunicationClient();
    const { agreementNumber } = await params;
    const body = await request.json() as { signature?: Record<string, unknown> };
    if (!body.signature) return Response.json({ error: "Structured signature details are required." }, { status: 400 });
    const loaded = await getClientAgreement(decodeURIComponent(agreementNumber), client.clientId, client.userId, false);
    const agreementResult = await supabaseAdmin.from("master_service_agreements").select("id").eq("agreement_number", loaded.agreementNumber).eq("client_id", client.clientId).maybeSingle();
    if (agreementResult.error) throw new Error(agreementResult.error.message);
    if (!agreementResult.data) return Response.json({ error: "Agreement not found." }, { status: 404 });
    await recordAgreementSignature(agreementResult.data.id, "client", body.signature as SignatureInput, client.userId, { userAgent: request.headers.get("user-agent") });
    return Response.json(await getClientAgreement(loaded.agreementNumber, client.clientId, client.userId, false));
  } catch (error) { return communicationError(error); }
}
