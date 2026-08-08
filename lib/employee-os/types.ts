export const WORKSPACE_STATUSES = ["pending", "provisioning", "active", "suspended", "failed"] as const;
export type WorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];
export type ResourceScope = "own" | "assigned" | "team" | "organisation";

export interface ConvertCandidateInput {
  applicationId: string;
  organisationId: string;
  employeeCode: string;
  departmentId: string;
  designationId: string;
  managerEmployeeId?: string | null;
  joiningDate: string;
  roleId?: string | null;
  actorUserId: string;
}
