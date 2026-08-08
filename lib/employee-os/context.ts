import "server-only";
import { cache } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { WorkspaceStatus } from "./types";

export type EmployeeContext = {
  identityId: string; authUserId: string; employeeId: string; employeeCode: string; organisationId: string;
  name: string; email: string; department: string | null; designation: string | null;
  manager: string | null; role: string; permissions: string[]; workspaceStatus: WorkspaceStatus;
  employmentStatus: string; joiningDate: string; workLocation: string | null;
};
export type EmployeeContextResult = { state: "active"; employee: EmployeeContext } | { state: "unavailable" | "invalid" | Exclude<WorkspaceStatus, "active">; employee?: Partial<EmployeeContext> };

export const resolveEmployeeContext = cache(async (): Promise<EmployeeContextResult> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent("/workspace")}`);
  const organisationId = session.user.organisation_id;
  if (!organisationId) return { state: "unavailable" };
  const identityResult = await supabaseAdmin.schema("identity").from("employee_identities")
    .select("id,employee_id,auth_user_id,email,workspace_status").eq("auth_user_id", session.user.id).eq("organisation_id", organisationId).maybeSingle();
  if (identityResult.error || !identityResult.data) return { state: "unavailable" };
  const identity = identityResult.data;
  const employeeResult = await supabaseAdmin.schema("people").from("employees")
    .select("id,employee_number,first_name,middle_name,last_name,user_id,deleted_at").eq("id", identity.employee_id).eq("organisation_id", organisationId).maybeSingle();
  if (employeeResult.error || !employeeResult.data || employeeResult.data.deleted_at || employeeResult.data.user_id !== session.user.id) return { state: "invalid" };
  const employee = employeeResult.data;
  const employmentResult = await supabaseAdmin.schema("people").from("employment_records")
    .select("joining_date,status,work_location,department_id,designation_id,manager_employee_id").eq("organisation_id", organisationId).eq("employee_id", employee.id).is("valid_to", null).maybeSingle();
  if (!employmentResult.data || !["active", "probation", "notice"].includes(employmentResult.data.status)) return { state: "invalid" };
  const employment = employmentResult.data;
  const [department, designation, manager, assignments] = await Promise.all([
    employment.department_id ? supabaseAdmin.schema("people").from("departments").select("name").eq("id", employment.department_id).eq("organisation_id", organisationId).maybeSingle() : Promise.resolve({ data: null }),
    employment.designation_id ? supabaseAdmin.schema("people").from("designations").select("name").eq("id", employment.designation_id).eq("organisation_id", organisationId).maybeSingle() : Promise.resolve({ data: null }),
    employment.manager_employee_id ? supabaseAdmin.schema("people").from("employees").select("first_name,last_name").eq("id", employment.manager_employee_id).eq("organisation_id", organisationId).maybeSingle() : Promise.resolve({ data: null }),
    supabaseAdmin.schema("identity").from("user_roles").select("role_id").eq("user_id", session.user.id).eq("organisation_id", organisationId),
  ]);
  const roleIds = (assignments.data || []).map(row => row.role_id);
  const [roles, rolePermissions] = roleIds.length ? await Promise.all([
    supabaseAdmin.schema("identity").from("roles").select("id,name").eq("organisation_id", organisationId).in("id", roleIds),
    supabaseAdmin.schema("identity").from("role_permissions").select("permission_id").eq("organisation_id", organisationId).in("role_id", roleIds),
  ]) : [{ data: [] }, { data: [] }];
  const permissionIds = [...new Set((rolePermissions.data || []).map(row => row.permission_id))];
  const permissionRows = permissionIds.length ? await supabaseAdmin.schema("identity").from("permissions").select("key").in("id", permissionIds) : { data: [] };
  const context: EmployeeContext = {
    identityId: identity.id, authUserId: session.user.id, employeeId: employee.id, employeeCode: employee.employee_number, organisationId,
    name: [employee.first_name, employee.middle_name, employee.last_name].filter(Boolean).join(" "), email: identity.email,
    department: department.data?.name || null, designation: designation.data?.name || null,
    manager: manager.data ? `${manager.data.first_name} ${manager.data.last_name}`.trim() : null,
    role: roles.data?.map(row => row.name).join(", ") || "Employee",
    permissions: [...new Set([...(session.user.permissions || []), ...(permissionRows.data || []).map(row => row.key)])],
    workspaceStatus: identity.workspace_status, employmentStatus: employment.status,
    joiningDate: employment.joining_date, workLocation: employment.work_location,
  };
  return identity.workspace_status === "active" ? { state: "active", employee: context } : { state: identity.workspace_status, employee: context };
});

export async function requireActiveEmployeeContext(): Promise<EmployeeContext> {
  const result = await resolveEmployeeContext();
  if (result.state !== "active") throw new Error("Active employee workspace required");
  return result.employee;
}
