import type {
  AgentOption,
  PlanStepStatus,
  RiskLevel,
  RunStatus,
  ToolActivity,
} from "./command-center.types";
import { record, safeString } from "./sse";

export const AGENT_CATALOG: AgentOption[] = [
  {
    id: "agent_sales",
    name: "Sales Agent",
    persona: "sales",
    description: "Leads, enrichment, and pipeline",
    department: "Sales",
    token: "@agent:sales",
    status: "active",
  },
  {
    id: "agent_cfo",
    name: "CFO Agent",
    persona: "cfo",
    description: "Invoices, revenue, and financial analysis",
    department: "Finance",
    token: "@agent:cfo",
    status: "active",
  },
  {
    id: "agent_research",
    name: "Research Agent",
    persona: "research",
    description: "Market and live web research",
    department: "Research",
    token: "@agent:research",
    status: "active",
  },
  {
    id: "agent_cto",
    name: "Engineering Agent",
    persona: "cto",
    description: "Projects, milestones, and technical risk",
    department: "Engineering",
    token: "@agent:cto",
    status: "active",
  },
  {
    id: "agent_content",
    name: "Content Agent",
    persona: "content",
    description: "Editorial, SEO, and newsletter dispatch",
    department: "Marketing",
    token: "@agent:content",
    status: "active",
  },
  {
    id: "agent_ceo",
    name: "CEO Agent",
    persona: "ceo",
    description: "Executive briefings and strategy",
    department: "Executive",
    token: "@agent:ceo",
    status: "active",
  },
  {
    id: "agent_proposal",
    name: "Proposal Agent",
    persona: "proposal",
    description: "SOW drafts and client proposals",
    department: "Sales",
    token: "@agent:proposal",
    status: "active",
  },
];

const TOOL_META: Record<
  string,
  { label: string; risk: RiskLevel; category: string }
> = {
  query_leads: { label: "Looking up customer data", risk: "low", category: "sales" },
  create_lead: { label: "Creating a lead", risk: "medium", category: "sales" },
  create_leads_batch: { label: "Batch-creating leads", risk: "high", category: "sales" },
  generate_proposal: { label: "Preparing proposal", risk: "medium", category: "sales" },
  get_company_stats: { label: "Reviewing company metrics", risk: "low", category: "admin" },
  get_admin_invoices: { label: "Reviewing invoices", risk: "low", category: "finance" },
  create_admin_invoice: { label: "Creating invoice", risk: "high", category: "finance" },
  send_admin_invoice: { label: "Sending invoice", risk: "high", category: "finance" },
  get_admin_agreements: { label: "Reviewing agreements", risk: "low", category: "finance" },
  get_admin_projects: { label: "Reviewing projects", risk: "low", category: "engineering" },
  create_admin_project: { label: "Creating project", risk: "medium", category: "engineering" },
  get_blog_posts_stats: { label: "Analyzing content metrics", risk: "low", category: "content" },
  send_blog_to_subscribers: { label: "Dispatching newsletter", risk: "high", category: "content" },
  query_wish_game_data: { label: "Reading game telemetry", risk: "low", category: "content" },
  search_web: { label: "Researching sources", risk: "low", category: "research" },
  spawn_subagent: { label: "Spawning specialist subagent", risk: "medium", category: "research" },
};

export function toolLabel(name: string, summary?: string): string {
  if (summary && summary !== name) return summary;
  return TOOL_META[name]?.label ?? humanize(name);
}

export function toolRisk(name: string, fallback?: RiskLevel): RiskLevel {
  return TOOL_META[name]?.risk ?? fallback ?? "low";
}

export function summarizeArgs(args: unknown): string | undefined {
  const value = record(args);
  const keys = Object.keys(value);
  if (!keys.length) return undefined;
  const parts = keys.slice(0, 4).map((key) => {
    const raw = value[key];
    if (typeof raw === "string") return `${key}: ${raw.slice(0, 40)}`;
    if (typeof raw === "number" || typeof raw === "boolean") return `${key}: ${raw}`;
    if (Array.isArray(raw)) return `${key}: [${raw.length}]`;
    return `${key}: …`;
  });
  return parts.join(" · ");
}

export function summarizeResult(result: unknown): string | undefined {
  if (result == null) return undefined;
  if (typeof result === "string") return result.slice(0, 160);
  const value = record(result);
  if (typeof value.summary === "string") return value.summary.slice(0, 160);
  if (typeof value.message === "string") return value.message.slice(0, 160);
  if (typeof value.count === "number") return `${value.count} records`;
  if (Array.isArray(value.items)) return `${value.items.length} items returned`;
  if (Array.isArray(result)) return `${result.length} items returned`;
  return "Result received · sensitive fields hidden";
}

export function buildToolActivity(
  name: string,
  status: ToolActivity["status"],
  extra?: Partial<ToolActivity>,
): ToolActivity {
  return {
    id: extra?.id ?? crypto.randomUUID(),
    name,
    status,
    summary: toolLabel(name, extra?.summary),
    risk: extra?.risk ?? toolRisk(name),
    argsSummary: extra?.argsSummary,
    resultSummary: extra?.resultSummary,
    startedAt: extra?.startedAt,
    completedAt: extra?.completedAt,
  };
}

export function mapRunStatus(value: string): RunStatus {
  switch (value) {
    case "queued":
    case "running":
    case "waiting":
    case "waiting_for_approval":
    case "succeeded":
    case "failed":
    case "cancelled":
      return value;
    case "completed":
      return "succeeded";
    default:
      return "running";
  }
}

export function runStatusToAgentState(
  status: RunStatus,
): "working" | "waiting" | "blocked" | "complete" | "failed" {
  if (status === "waiting_for_approval") return "blocked";
  if (status === "waiting") return "waiting";
  if (status === "succeeded") return "complete";
  if (status === "failed" || status === "cancelled") return "failed";
  return "working";
}

export function isTerminalRun(status: RunStatus): boolean {
  return status === "succeeded" || status === "failed" || status === "cancelled";
}

export function stepStatusFromEvent(
  event: string,
  current: PlanStepStatus = "pending",
): PlanStepStatus {
  if (event === "step_started") return "running";
  if (event === "step_succeeded") return "succeeded";
  if (event === "step_failed") return "failed";
  if (event === "approval_required") return "waiting_approval";
  return current;
}

export function riskTone(risk: RiskLevel): string {
  switch (risk) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "high":
      return "bg-amber-100 text-amber-900 border-amber-200";
    case "medium":
      return "bg-blue-50 text-blue-800 border-blue-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function parseAgentToken(text: string): AgentOption | undefined {
  const match = text.match(/@agent:([a-z0-9_-]+)/i);
  if (!match) return undefined;
  const persona = match[1].toLowerCase();
  return AGENT_CATALOG.find(
    (agent) => agent.persona === persona || agent.id === `agent_${persona}`,
  );
}

export function extractApproval(value: unknown) {
  const item = record(value);
  const id = safeString(item.id || item.approvalId);
  const title = safeString(item.title, "Approval required");
  if (!id && !title) return null;
  return {
    id: id || crypto.randomUUID(),
    title,
    summary: safeString(
      item.safeSummary || item.summary || item.message,
      "A governed action needs your decision before it can continue.",
    ),
    riskLevel: (safeString(item.riskLevel, "medium") as RiskLevel) || "medium",
    status: (safeString(item.status, "pending") as
      | "pending"
      | "approved"
      | "rejected"
      | "expired") || "pending",
    runId: safeString(item.runId) || undefined,
    operation: safeString(item.operation) || undefined,
    expiresAt: safeString(item.expiresAt) || undefined,
  };
}
