import { AgentDefinition } from "./agent.types";

export class AgentRegistry {
  private static agents = new Map<string, AgentDefinition>();

  static {
    // Built-in Agent 1: Sales Assistant
    this.register({
      id: "agent_sales",
      version: "2.0.0",
      name: "Sales Agent",
      description: "Handles querying, creating, and enriching sales leads.",
      department: "Sales",
      persona: "sales",
      status: "active",
      supportedIntents: ["CREATE_LEAD", "QUERY_LEADS"],
      supportedCapabilities: ["sales.leads", "sales.enrich"],
      supportedSkills: ["skill_lead_qualification"],
      allowedTools: ["create_lead", "create_leads_batch", "query_leads", "get_company_stats"],
      requiredPermissions: ["leads:read"],
      supportedProviders: ["gemini", "openrouter"],
      defaultProviderPolicy: "gemini-primary"
    });

    // Built-in Agent 2: Proposal Agent
    this.register({
      id: "agent_proposal",
      version: "2.0.0",
      name: "Proposal Agent",
      description: "Drafts scopes of work (SOW) and creates client proposals.",
      department: "Sales",
      persona: "proposal",
      status: "active",
      supportedIntents: ["GENERATE_PROPOSAL"],
      supportedCapabilities: ["sales.proposal"],
      supportedSkills: ["skill_proposal_writing"],
      allowedTools: ["generate_proposal"],
      requiredPermissions: ["proposals:write"],
      supportedProviders: ["gemini", "openrouter"],
      defaultProviderPolicy: "gemini-primary"
    });

    // Built-in Agent 3: CFO / Finance Agent
    this.register({
      id: "agent_cfo",
      version: "2.0.0",
      name: "CFO Agent",
      description: "Analyzes pricing, margins, corporate stats, and billing invoices.",
      department: "Finance",
      persona: "cfo",
      status: "active",
      supportedIntents: ["CREATE_INVOICE", "QUERY_FINANCE"],
      supportedCapabilities: ["finance.invoices", "finance.agreements"],
      supportedSkills: ["skill_revenue_analysis"],
      allowedTools: ["get_admin_invoices", "create_admin_invoice", "send_admin_invoice", "get_admin_agreements", "get_company_stats"],
      requiredPermissions: ["invoices:read"],
      supportedProviders: ["gemini", "openrouter"],
      defaultProviderPolicy: "gemini-primary"
    });

    // Built-in Agent 4: CEO Agent
    this.register({
      id: "agent_ceo",
      version: "2.0.0",
      name: "CEO Agent",
      description: "Strategic executive recommendations and company vision.",
      department: "Executive",
      persona: "ceo",
      status: "active",
      supportedIntents: ["GENERAL_CHAT"],
      supportedCapabilities: ["executive.strategy"],
      supportedSkills: ["skill_executive_strategy"],
      allowedTools: ["get_company_stats", "search_web"],
      requiredPermissions: [],
      supportedProviders: ["gemini", "openrouter"],
      defaultProviderPolicy: "gemini-primary"
    });

    // Built-in Agent 5: Content / SEO Agent
    this.register({
      id: "agent_content",
      version: "2.0.0",
      name: "Content Agent",
      description: "Writes editorial copy and dispatches newsletter articles.",
      department: "Marketing",
      persona: "content",
      status: "active",
      supportedIntents: ["CONTENT_DISPATCH"],
      supportedCapabilities: ["content.blog", "content.newsletter"],
      supportedSkills: ["skill_content_writing"],
      allowedTools: ["get_blog_posts_stats", "send_blog_to_subscribers", "query_wish_game_data"],
      requiredPermissions: ["blogs:read"],
      supportedProviders: ["gemini", "openrouter"],
      defaultProviderPolicy: "gemini-primary"
    });

    // Built-in Agent 6: CTO / Engineering Agent
    this.register({
      id: "agent_cto",
      version: "2.0.0",
      name: "CTO Agent",
      description: "Monitors technical project milestones and performance specs.",
      department: "Engineering",
      persona: "cto",
      status: "active",
      supportedIntents: ["QUERY_PROJECTS"],
      supportedCapabilities: ["engineering.projects"],
      supportedSkills: ["skill_project_risk_analysis"],
      allowedTools: ["get_admin_projects", "create_admin_project"],
      requiredPermissions: ["projects:read"],
      supportedProviders: ["gemini", "openrouter"],
      defaultProviderPolicy: "gemini-primary"
    });

    // Built-in Agent 7: Research Agent
    this.register({
      id: "agent_research",
      version: "2.0.0",
      name: "Research Agent",
      description: "Conducts live web searches and market intelligence gathering.",
      department: "Research",
      persona: "research",
      status: "active",
      supportedIntents: ["INFORMATION_LOOKUP"],
      supportedCapabilities: ["research.web"],
      supportedSkills: ["skill_market_research"],
      allowedTools: ["search_web", "spawn_subagent"],
      requiredPermissions: [],
      supportedProviders: ["gemini", "openrouter"],
      defaultProviderPolicy: "gemini-primary"
    });
  }

  static register(agent: AgentDefinition): void {
    this.agents.set(agent.id, agent);
  }

  static get(id: string): AgentDefinition | undefined {
    return this.agents.get(id);
  }

  static findByPersona(persona: string): AgentDefinition | undefined {
    return Array.from(this.agents.values()).find(a => a.persona === persona);
  }

  static listAll(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }
}
