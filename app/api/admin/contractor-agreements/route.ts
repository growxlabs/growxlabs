import { contractorError, requireContractorAgreementAdmin } from "@/lib/contractors/access";
import { createContractorAgreement, listAdminContractorAgreements } from "@/lib/contractors/agreements";

export async function GET() {
  try {
    await requireContractorAgreementAdmin();
    return Response.json({ agreements: await listAdminContractorAgreements() });
  } catch (error) {
    return contractorError(error);
  }
}

export async function POST() {
  try {
    const admin = await requireContractorAgreementAdmin();
    return Response.json({ agreement: await createContractorAgreement(admin.userId) }, { status: 201 });
  } catch (error) {
    return contractorError(error);
  }
}
