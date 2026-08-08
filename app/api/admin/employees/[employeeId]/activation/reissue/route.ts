import { getToken } from "next-auth/jwt";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { EmployeeProvisioningError, reissueEmployeeActivation } from "@/lib/employee-os/provisioning-service";

const allowedRoles = new Set(["ADMIN", "HR", "RECRUITER"]);

export async function POST(request: Request, { params }: { params: Promise<{ employeeId: string }> }) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub || !allowedRoles.has(String(token.role).toUpperCase())) return Response.json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } }, { status: 403 });
  try {
    const { employeeId } = await params;
    const result = await reissueEmployeeActivation(employeeId, CAREERS_ORGANISATION, token.sub);
    return Response.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof EmployeeProvisioningError) return Response.json({ success: false, error: { code: error.code, message: error.message } }, { status: error.status });
    return Response.json({ success: false, error: { code: "REISSUE_FAILED", message: "The activation email could not be reissued." } }, { status: 500 });
  }
}
