import { CommandCenterContext } from "./command-center-context";

export class AuthorisedContextFilter {
  static filterAllowedTools(commandContext: CommandCenterContext, candidateTools: string[]): string[] {
    const permissions = commandContext.permissions || [];
    
    // Map required permission for each tool
    const toolPermissionMap: Record<string, string> = {
      create_lead: "leads:write",
      create_leads_batch: "leads:write",
      get_company_stats: "leads:read",
      query_leads: "leads:read",
      generate_proposal: "proposals:write",
      create_admin_invoice: "invoices:write",
      send_admin_invoice: "invoices:write",
      get_admin_invoices: "invoices:read",
      get_admin_agreements: "agreements:read",
      get_admin_users: "users:read",
      create_admin_project: "projects:write",
      get_admin_projects: "projects:read",
      send_blog_to_subscribers: "blogs:dispatch",
      get_blog_posts_stats: "blogs:read"
    };

    return candidateTools.filter(toolName => {
      const requiredPerm = toolPermissionMap[toolName];
      if (!requiredPerm) return true; // Public or search tools
      return permissions.includes(requiredPerm);
    });
  }

  static filterAllowedPersonas(commandContext: CommandCenterContext): string[] {
    const role = commandContext.role;
    const permissions = commandContext.permissions || [];

    const allowed = ["ceo", "research", "content", "cto"];
    if (permissions.includes("leads:read") || role === "admin") allowed.push("sales");
    if (permissions.includes("proposals:write") || role === "admin") allowed.push("proposal");
    if (permissions.includes("invoices:read") || role === "admin") allowed.push("cfo");

    return allowed;
  }
}
