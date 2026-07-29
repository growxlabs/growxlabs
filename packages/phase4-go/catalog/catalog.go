package catalog

import (
	"encoding/json"

	"growx/commandcenter/phase4/contract"
	"growx/commandcenter/phase4/registry"
)

var objectSchema = json.RawMessage(`{"type":"object","properties":{},"required":[]}`)

type legacyTool struct {
	id, domain, operation, permission, capability, agent, skill string
	write, approval                                             bool
}

var legacyTools = []legacyTool{
	{"get_company_stats", "crm", "leads.stats", "leads:read", "sales.leads", "agent_sales", "skill_lead_qualification", false, false},
	{"query_leads", "crm", "leads.search", "leads:read", "sales.leads", "agent_sales", "skill_lead_qualification", false, false},
	{"create_lead", "crm", "leads.create", "leads:write", "sales.leads", "agent_sales", "skill_lead_qualification", true, false},
	{"create_leads_batch", "crm", "leads.create_batch", "leads:write", "sales.leads", "agent_sales", "skill_lead_qualification", true, true},
	{"generate_proposal", "crm", "proposals.create", "proposals:write", "sales.proposal", "agent_proposal", "skill_proposal_writing", true, false},
	{"search_web", "system", "web.search", "", "research.web", "agent_research", "skill_market_research", false, false},
	{"spawn_subagent", "system", "research.delegate", "", "research.web", "agent_research", "skill_market_research", false, false},
	{"get_blog_posts_stats", "marketing", "content.stats", "blogs:read", "content.blog", "agent_content", "skill_content_writing", false, false},
	{"query_wish_game_data", "marketing", "wish.search", "blogs:read", "content.blog", "agent_content", "skill_content_writing", false, false},
	{"send_blog_to_subscribers", "marketing", "content.publish", "blogs:dispatch", "content.newsletter", "agent_content", "skill_content_writing", true, true},
	{"get_admin_users", "system", "users.list", "users:read", "executive.strategy", "agent_ceo", "skill_executive_strategy", false, false},
	{"get_admin_agreements", "finance", "agreements.list", "invoices:read", "finance.agreements", "agent_cfo", "skill_revenue_analysis", false, false},
	{"get_admin_invoices", "finance", "invoices.list", "invoices:read", "finance.invoices", "agent_cfo", "skill_revenue_analysis", false, false},
	{"create_admin_invoice", "finance", "invoices.create_draft", "invoices:write", "finance.invoices", "agent_cfo", "skill_revenue_analysis", true, false},
	{"get_admin_projects", "projects", "projects.list", "projects:read", "engineering.projects", "agent_cto", "skill_project_risk_analysis", false, false},
	{"create_admin_project", "projects", "projects.create", "projects:write", "engineering.projects", "agent_cto", "skill_project_risk_analysis", true, false},
	{"send_admin_invoice", "finance", "invoices.send", "invoices:write", "finance.invoices", "agent_cfo", "skill_revenue_analysis", true, true},
}

func ToolRegistry() (*registry.Registry[registry.Tool], error) {
	result := registry.New[registry.Tool]()
	for _, item := range legacyTools {
		permissions := []string{}
		if item.permission != "" {
			permissions = append(permissions, item.permission)
		}
		mode := "read"
		if item.write {
			mode = "write"
		}
		definition := registry.Tool(contract.ToolDefinition{
			ID: item.id, Version: "1.0.0", Name: item.id, Description: "Migrated Phase 1 tool",
			Domain: item.domain, Operation: item.operation, InputSchema: objectSchema,
			OutputSchema: objectSchema, RequiredPermissions: permissions,
			RequiredCapabilityIDs: []string{item.capability}, AllowedSkillIDs: []string{item.skill},
			AllowedAgentIDs: []string{item.agent}, Sensitivity: "moderate",
			ExecutionMode: mode, Idempotent: !item.write, Retryable: !item.write,
			RequiresApproval: item.approval, TimeoutMS: 30_000, Status: "active",
			Adapter: "legacy-nextjs",
		})
		if err := result.Register(definition); err != nil {
			return nil, err
		}
	}
	return result, nil
}

func CapabilityRegistry() (*registry.Registry[registry.Capability], error) {
	result := registry.New[registry.Capability]()
	definitions := []contract.CapabilityDefinition{
		{ID: "sales.leads", Version: "1.0.0", Name: "CRM lead operations", Domain: "crm", RequiredPermissions: []string{"leads:read"}, AllowedAgentIDs: []string{"agent_sales"}, AllowedSkillIDs: []string{"skill_lead_qualification"}, AllowedToolIDs: []string{"get_company_stats", "query_leads", "create_lead", "create_leads_batch"}, Status: "active"},
		{ID: "sales.proposal", Version: "1.0.0", Name: "Proposal preparation", Domain: "crm", RequiredPermissions: []string{"proposals:write"}, AllowedAgentIDs: []string{"agent_proposal"}, AllowedSkillIDs: []string{"skill_proposal_writing"}, AllowedToolIDs: []string{"generate_proposal"}, Status: "active"},
		{ID: "finance.invoices", Version: "1.0.0", Name: "Finance invoices", Domain: "finance", RequiredPermissions: []string{"invoices:read"}, AllowedAgentIDs: []string{"agent_cfo"}, AllowedSkillIDs: []string{"skill_revenue_analysis"}, AllowedToolIDs: []string{"get_admin_invoices", "create_admin_invoice", "send_admin_invoice"}, Status: "active"},
		{ID: "finance.agreements", Version: "1.0.0", Name: "Finance agreements", Domain: "finance", RequiredPermissions: []string{"invoices:read"}, AllowedAgentIDs: []string{"agent_cfo"}, AllowedSkillIDs: []string{"skill_revenue_analysis"}, AllowedToolIDs: []string{"get_admin_agreements"}, Status: "active"},
		{ID: "content.blog", Version: "1.0.0", Name: "Marketing content", Domain: "marketing", RequiredPermissions: []string{"blogs:read"}, AllowedAgentIDs: []string{"agent_content"}, AllowedSkillIDs: []string{"skill_content_writing"}, AllowedToolIDs: []string{"get_blog_posts_stats", "query_wish_game_data"}, Status: "active"},
		{ID: "content.newsletter", Version: "1.0.0", Name: "Newsletter dispatch", Domain: "marketing", RequiredPermissions: []string{"blogs:dispatch"}, AllowedAgentIDs: []string{"agent_content"}, AllowedSkillIDs: []string{"skill_content_writing"}, AllowedToolIDs: []string{"send_blog_to_subscribers"}, Status: "active"},
		{ID: "engineering.projects", Version: "1.0.0", Name: "Project operations", Domain: "projects", RequiredPermissions: []string{"projects:read"}, AllowedAgentIDs: []string{"agent_cto"}, AllowedSkillIDs: []string{"skill_project_risk_analysis"}, AllowedToolIDs: []string{"get_admin_projects", "create_admin_project"}, Status: "active"},
		{ID: "research.web", Version: "1.0.0", Name: "Web research", Domain: "system", AllowedAgentIDs: []string{"agent_research"}, AllowedSkillIDs: []string{"skill_market_research"}, AllowedToolIDs: []string{"search_web", "spawn_subagent"}, Status: "active"},
	}
	for _, definition := range definitions {
		if err := result.Register(registry.Capability(definition)); err != nil {
			return nil, err
		}
	}
	return result, nil
}

func SkillRegistry() (*registry.Registry[registry.Skill], error) {
	result := registry.New[registry.Skill]()
	definitions := []contract.SkillDefinition{
		skill("skill_lead_qualification", "Lead qualification", "crm", "sales.leads", "agent_sales", []string{"get_company_stats", "query_leads", "create_lead", "create_leads_batch"}, []string{"leads:read"}),
		skill("skill_proposal_writing", "Proposal writing", "crm", "sales.proposal", "agent_proposal", []string{"generate_proposal"}, []string{"proposals:write"}),
		skill("skill_revenue_analysis", "Revenue analysis", "finance", "finance.invoices", "agent_cfo", []string{"get_admin_invoices", "create_admin_invoice", "send_admin_invoice", "get_admin_agreements"}, []string{"invoices:read"}),
		skill("skill_content_writing", "Content preparation", "marketing", "content.blog", "agent_content", []string{"get_blog_posts_stats", "query_wish_game_data", "send_blog_to_subscribers"}, []string{"blogs:read"}),
		skill("skill_market_research", "Market research", "system", "research.web", "agent_research", []string{"search_web", "spawn_subagent"}, nil),
		skill("skill_project_risk_analysis", "Project risk analysis", "projects", "engineering.projects", "agent_cto", []string{"get_admin_projects", "create_admin_project"}, []string{"projects:read"}),
	}
	for _, definition := range definitions {
		if err := result.Register(registry.Skill(definition)); err != nil {
			return nil, err
		}
	}
	return result, nil
}

func skill(id, name, domain, capability, agent string, tools, permissions []string) contract.SkillDefinition {
	return contract.SkillDefinition{
		ID: id, Version: "1.0.0", Name: name, Description: name,
		Domain: domain, CapabilityIDs: []string{capability},
		AllowedAgentIDs: []string{agent}, AllowedToolIDs: tools,
		RequiredPermissions: permissions, InputSchema: objectSchema,
		OutputSchema: objectSchema, Status: "active",
		ExecutionPolicy: contract.SkillExecutionPolicy{
			MaxSteps: 20, ParallelismAllowed: true, RequiresApproval: false,
			AllowedStepTypes: []string{"model", "tool", "transform", "decision", "wait"},
		},
	}
}
