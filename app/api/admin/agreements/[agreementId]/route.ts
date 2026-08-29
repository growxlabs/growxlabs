import { commercialError, requireCommercialAdmin } from "@/lib/commercial/workflow";
import { agreementAction, getAdminAgreement, getAgreementPdfForAdmin, recordAgreementSignature, updateAgreementLegalReview } from "@/lib/commercial/msa";
import type { SignatureInput } from "@/lib/commercial/msa";

export async function GET(_: Request, { params }: { params: Promise<{ agreementId: string }> }) {
  try {
    await requireCommercialAdmin();
    const { agreementId } = await params;
    if (new URL(_.url).searchParams.get("format") === "pdf") {
      const data = await getAgreementPdfForAdmin(agreementId);
      return new Response(new Uint8Array(data.pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${data.agreement.agreementNumber}-v${data.version.version}.pdf"`, "Cache-Control": "private, no-store" } });
    }
    return Response.json(await getAdminAgreement(agreementId));
  } catch (error) { return commercialError(error); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ agreementId: string }> }) {
  try {
    const admin = await requireCommercialAdmin();
    const { agreementId } = await params;
    const body = await request.json() as { action?: string; comment?: string; party?: "growxlabs" | "client"; signature?: Record<string, unknown>; legalFields?: Record<string, unknown> };
    if (body.action === "sign" && body.party && body.signature) {
      return Response.json(await recordAgreementSignature(agreementId, body.party, body.signature as SignatureInput, admin.userId, { userAgent: request.headers.get("user-agent") }));
    }
    if (body.action === "save_legal_review") return Response.json(await updateAgreementLegalReview(agreementId, body.legalFields || {}, admin.userId));
    if (!body.action) return Response.json({ error: "Agreement action is required." }, { status: 400 });
    return Response.json(await agreementAction(agreementId, body.action, admin.userId, body.comment));
  } catch (error) { return commercialError(error); }
}

export async function POST(request: Request, { params }: { params: Promise<{ agreementId: string }> }) {
  try {
    await requireCommercialAdmin();
    const { agreementId } = await params;
    const body = await request.json().catch(() => ({})) as { format?: string };
    if (body.format !== "pdf") return Response.json({ error: "Only PDF preview is supported." }, { status: 400 });
    const data = await getAgreementPdfForAdmin(agreementId);
    return new Response(new Uint8Array(data.pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${data.agreement.agreementNumber}-v${data.version.version}.pdf"`, "Cache-Control": "private, no-store" } });
  } catch (error) { return commercialError(error); }
}
