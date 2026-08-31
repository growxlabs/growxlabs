import { getContractorSigningAgreement, recordContractorSignature } from "@/lib/contractors/agreements";
import { contractorError } from "@/lib/contractors/access";

export async function GET(request: Request, { params }: { params: Promise<{ agreementNumber: string }> }) {
  try {
    const { agreementNumber } = await params;
    const token = new URL(request.url).searchParams.get("token") || "";
    return Response.json(await getContractorSigningAgreement(decodeURIComponent(agreementNumber), token));
  } catch (error) {
    return contractorError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ agreementNumber: string }> }) {
  try {
    const { agreementNumber } = await params;
    const body = await request.json() as { token?: string; fullLegalName?: string; roleOrCapacity?: string; email?: string; phone?: string; address?: string; panOrTaxId?: string; signature?: string; consentToElectronicExecution?: boolean };
    return Response.json(await recordContractorSignature(decodeURIComponent(agreementNumber), body.token || "", { fullLegalName: body.fullLegalName || "", roleOrCapacity: body.roleOrCapacity || "Independent Contractor", email: body.email || "", phone: body.phone || "", address: body.address || "", panOrTaxId: body.panOrTaxId, signature: body.signature || "", consentToElectronicExecution: Boolean(body.consentToElectronicExecution) }, { ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null, userAgent: request.headers.get("user-agent") || null }));
  } catch (error) {
    return contractorError(error);
  }
}
