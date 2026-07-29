import { SkillDefinition } from "./skill.types";

export class SkillRegistry {
  private static skills = new Map<string, SkillDefinition>();

  static {
    this.register({
      id: "skill_lead_qualification",
      version: "2.0.0",
      name: "Lead Qualification & Ingestion",
      description: "Extracts business details and enriches leads into CRM databases.",
      department: "Sales",
      capabilityIds: ["sales.leads"],
      supportedIntentTypes: ["CREATE_LEAD", "QUERY_LEADS"],
      allowedAgentIds: ["agent_sales"],
      requiredPermissions: ["leads:read"],
      allowedToolIds: ["create_lead", "create_leads_batch", "query_leads", "get_company_stats"],
      status: "active"
    });

    this.register({
      id: "skill_proposal_writing",
      version: "2.0.0",
      name: "Scope of Work Proposal Generation",
      description: "Drafts tailored SOW proposals with tier-based pricing models.",
      department: "Sales",
      capabilityIds: ["sales.proposal"],
      supportedIntentTypes: ["GENERATE_PROPOSAL"],
      allowedAgentIds: ["agent_proposal"],
      requiredPermissions: ["proposals:write"],
      allowedToolIds: ["generate_proposal"],
      status: "active"
    });

    this.register({
      id: "skill_revenue_analysis",
      version: "2.0.0",
      name: "Financial Revenue & Billing Analysis",
      description: "Analyzes billing contracts, revenue stats, and invoice generation.",
      department: "Finance",
      capabilityIds: ["finance.invoices"],
      supportedIntentTypes: ["CREATE_INVOICE", "QUERY_FINANCE"],
      allowedAgentIds: ["agent_cfo"],
      requiredPermissions: ["invoices:read"],
      allowedToolIds: ["get_admin_invoices", "create_admin_invoice", "send_admin_invoice", "get_admin_agreements"],
      status: "active"
    });

    this.register({
      id: "skill_content_writing",
      version: "2.0.0",
      name: "Editorial & Newsletter Dispatch",
      description: "Manages blog publications and dispatches email newsletters to subscribers.",
      department: "Marketing",
      capabilityIds: ["content.blog"],
      supportedIntentTypes: ["CONTENT_DISPATCH"],
      allowedAgentIds: ["agent_content"],
      requiredPermissions: ["blogs:read"],
      allowedToolIds: ["get_blog_posts_stats", "send_blog_to_subscribers", "query_wish_game_data"],
      status: "active"
    });

    this.register({
      id: "skill_market_research",
      version: "2.0.0",
      name: "Web Intelligence & Market Research",
      description: "Conducts live web searches and market intelligence synthesis.",
      department: "Research",
      capabilityIds: ["research.web"],
      supportedIntentTypes: ["INFORMATION_LOOKUP"],
      allowedAgentIds: ["agent_research"],
      requiredPermissions: [],
      allowedToolIds: ["search_web", "spawn_subagent"],
      status: "active"
    });
  }

  static register(skill: SkillDefinition): void {
    this.skills.set(skill.id, skill);
  }

  static get(id: string): SkillDefinition | undefined {
    return this.skills.get(id);
  }

  static findByIntent(intentType: string): SkillDefinition | undefined {
    return Array.from(this.skills.values()).find(s => s.supportedIntentTypes.includes(intentType as any));
  }
}
