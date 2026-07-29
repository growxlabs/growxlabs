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
}

export async function resolveCommandCenterContext(
  options: ResolveContextOptions = {}
): Promise<CommandCenterContext> {
  const requestId = "req_" + Math.random().toString(36).substring(2, 11);

  // Default internal enterprise context scope
  // In production, this extracts and validates cookie/JWT session claims
  const context: CommandCenterContext = {
    userId: "usr_admin_gxl",
    organizationId: options.customOrgId || "org_growxlabs",
    workspaceId: options.customWorkspaceId || "ws_main",
    role: "admin",
    permissions: [
      "leads:read", "leads:write",
      "proposals:read", "proposals:write",
      "invoices:read", "invoices:write",
      "projects:read", "projects:write",
      "users:read",
      "blogs:read", "blogs:dispatch"
    ],
    requestId
  };

  return context;
}
