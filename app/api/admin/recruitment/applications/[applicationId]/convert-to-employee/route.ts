import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { convertCandidateToEmployee, EmployeeProvisioningError } from "@/lib/employee-os/provisioning-service";

const allowedRoles = new Set(["ADMIN", "HR", "RECRUITER"]);
const schema = z.object({ employeeCode: z.string().trim().min(1).max(50), departmentId: z.uuid(), designationId: z.uuid(), managerEmployeeId: z.uuid().nullable().optional(), joiningDate: z.iso.date(), roleId: z.uuid().nullable().optional() });

export async function POST(request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub || !allowedRoles.has(String(token.role).toUpperCase())) return Response.json({ error: "Access denied" }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Valid employee code, department, designation, and joining date are required", details: parsed.error.flatten() }, { status: 400 });
  try {
    const { applicationId } = await params;
    const result = await convertCandidateToEmployee({ ...parsed.data, applicationId, organisationId: String(token.organisation_id || CAREERS_ORGANISATION), actorUserId: token.sub });
    return Response.json({ conversion: result }, { status: result.existing ? 200 : 201 });
  } catch (error) {
    if (error instanceof EmployeeProvisioningError) return Response.json({ error: error.message, code: error.code }, { status: error.status });
    console.error("[Employee OS] conversion failed", error); return Response.json({ error: "Employee conversion failed" }, { status: 500 });
  }
}
