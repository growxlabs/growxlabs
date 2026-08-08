import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ResourceScope, WorkspaceStatus } from "./types";

export class EmployeeAuthorizationError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function requireEmployee() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new EmployeeAuthorizationError(401, "Authentication required");
  const organisationId = session.user.organisation_id;
  if (!organisationId) throw new EmployeeAuthorizationError(403, "Organisation context required");
  const { data, error } = await supabaseAdmin.schema("identity").from("employee_identities")
    .select("id,employee_id,organisation_id,workspace_status")
    .eq("auth_user_id", session.user.id).eq("organisation_id", organisationId).maybeSingle();
  if (error || !data) throw new EmployeeAuthorizationError(403, "Employee identity required");
  return { identityId: data.id, employeeId: data.employee_id, organisationId: data.organisation_id, workspaceStatus: data.workspace_status as WorkspaceStatus, permissions: new Set(session.user.permissions || []) };
}

export function requireWorkspaceActive(employee: Awaited<ReturnType<typeof requireEmployee>>) {
  if (employee.workspaceStatus !== "active") throw new EmployeeAuthorizationError(403, "Employee workspace is not active");
  return employee;
}
export function requirePermission(employee: Awaited<ReturnType<typeof requireEmployee>>, permission: string) {
  if (!employee.permissions.has(permission)) throw new EmployeeAuthorizationError(403, `Permission required: ${permission}`);
  return employee;
}
export function requireOrganisationScope(employeeOrganisationId: string, resourceOrganisationId: string) {
  if (employeeOrganisationId !== resourceOrganisationId) throw new EmployeeAuthorizationError(403, "Cross-organisation access denied");
}
export function requireResourceScope(scope: ResourceScope, ids: { employeeId: string; ownerEmployeeId?: string | null; assigneeEmployeeId?: string | null }) {
  if (scope === "own" && ids.ownerEmployeeId !== ids.employeeId) throw new EmployeeAuthorizationError(403, "Own-resource scope required");
  if (scope === "assigned" && ids.assigneeEmployeeId !== ids.employeeId) throw new EmployeeAuthorizationError(403, "Assigned-resource scope required");
  return true;
}
