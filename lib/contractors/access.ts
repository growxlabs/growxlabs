import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ConsultingHttpError, workflowError } from "@/lib/consulting/workflow";

export async function requireContractorAgreementAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new ConsultingHttpError(401, "Authentication required.");
  if (!["ADMIN", "CO_ADMIN"].includes(session.user.role)) throw new ConsultingHttpError(403, "Contractor agreement workspace permission is required.");
  return { userId: session.user.id };
}

export function contractorError(error: unknown) {
  return workflowError(error);
}
