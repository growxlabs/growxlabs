import { contractorError, requireContractorAgreementAdmin } from "@/lib/contractors/access";
import { contractorAgreementAction, getAdminContractorAgreement, recordContractorPayment, recordGrowxLabsCountersignature, updateContractorAgreementDraft } from "@/lib/contractors/agreements";
import type { ContractorSignatureInput } from "@/lib/contractors/agreements";

export async function GET(_: Request, { params }: { params: Promise<{ agreementId: string }> }) {
  try {
    await requireContractorAgreementAdmin();
    const { agreementId } = await params;
    return Response.json(await getAdminContractorAgreement(agreementId));
  } catch (error) {
    return contractorError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ agreementId: string }> }) {
  try {
    const admin = await requireContractorAgreementAdmin();
    const { agreementId } = await params;
    const body = await request.json() as { action?: string; comment?: string; draft?: Record<string, unknown>; signature?: ContractorSignatureInput; milestoneKey?: string; paymentStatus?: "approved" | "paid"; paymentReference?: string; notes?: string };
    if (body.action === "save_draft") return Response.json(await updateContractorAgreementDraft(agreementId, body.draft || {}, admin.userId));
    if (body.action === "countersign" && body.signature) return Response.json(await recordGrowxLabsCountersignature(agreementId, body.signature, admin.userId, { userAgent: request.headers.get("user-agent") }));
    if (body.action === "record_payment" && body.milestoneKey && body.paymentStatus) return Response.json(await recordContractorPayment(agreementId, body.milestoneKey, body.paymentStatus, body.paymentReference, body.notes, admin.userId));
    if (!body.action) return Response.json({ error: "Contractor agreement action is required." }, { status: 400 });
    return Response.json(await contractorAgreementAction(agreementId, body.action, admin.userId, body.comment));
  } catch (error) {
    return contractorError(error);
  }
}
