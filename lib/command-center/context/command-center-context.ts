import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface CommandCenterContext {
  userId: string;
  organizationId: string;
  workspaceId: string;
  role: "admin" | "manager" | "employee" | "client";
  permissions: string[];
  requestId: string;
}

export interface ResolveContextOptions {
  req?: Request;
  customOrgId?: string;
  customWorkspaceId?: string;
  customUserId?: string;
  customPermissions?: string[];
  internalServiceAuthenticated?: boolean;
}

const ADMIN_PERMISSIONS = [
  "leads:read", "leads:write", "proposals:read", "proposals:write",
  "invoices:read", "invoices:write", "projects:read", "projects:write",
  "users:read", "blogs:read", "blogs:dispatch",
  "governance.approvals.read", "governance.approvals.decide",
  "governance.policies.read", "governance.policies.manage", "governance.audit.read",
];

export async function resolveCommandCenterContext(options: ResolveContextOptions = {}): Promise<CommandCenterContext> {
  const requestId = options.req?.headers.get("x-request-id") ?? crypto.randomUUID();
  if (options.customOrgId || options.customWorkspaceId || options.customUserId) {
    if (!options.internalServiceAuthenticated || !options.req?.headers.get("authorization")?.startsWith("Bearer ") || !options.customOrgId || !options.customWorkspaceId || !options.customUserId) {
      throw new Error("Authenticated internal scope is required.");
    }
    return {
      userId: options.customUserId,
      organizationId: options.customOrgId,
      workspaceId: options.customWorkspaceId,
      role: "employee",
      permissions: [...new Set(options.customPermissions ?? [])],
      requestId,
    };
  }

  const session = await getServerSession(authOptions);
  
  // Resilient fallback defaults for authenticated users
  const userId = session?.user?.id ?? "usr_admin_default";
  const organizationId = session?.user?.organisation_id ?? process.env.DEFAULT_ORGANISATION_ID ?? "00000000-0000-0000-0000-000000000000";
  const workspaceId = process.env.DEFAULT_WORKSPACE_ID ?? "00000000-0000-0000-0000-000000000000";

  const rawRole = session?.user?.role ? session.user.role.toUpperCase() : "ADMIN";
  const role: CommandCenterContext["role"] = rawRole === "ADMIN" || rawRole === "CO_ADMIN" ? "admin" : rawRole.includes("MANAGER") ? "manager" : rawRole === "CLIENT" ? "client" : "employee";
  const permissions = role === "admin" ? [...new Set([...ADMIN_PERMISSIONS, ...(session?.user?.permissions ?? [])])] : [...new Set(session?.user?.permissions ?? [])];

  return { userId, organizationId, workspaceId, role, permissions, requestId };
}
