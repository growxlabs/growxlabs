export type AgentState = "idle" | "thinking" | "working" | "waiting" | "blocked" | "complete" | "failed";
export type FlyoutMode = "activity" | "approvals" | "artifacts" | "memory" | "notifications";

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  pinned?: boolean;
}

export interface ToolActivity {
  id: string;
  name: string;
  status: "calling" | "complete" | "error";
  summary: string;
}

export interface ActivityItem {
  id: string;
  label: string;
  state: AgentState;
  detail?: string;
  timestamp: string;
}

export interface CommandMessage {
  id: string;
  conversationId: string;
  sender: "user" | "gxl";
  text: string;
  timestamp: string;
  kind?: "message" | "error" | "clarification" | "approval" | "artifact";
  toolCalls?: ToolActivity[];
}

export interface ComposerAttachment {
  id: string;
  name: string;
  type: string;
  base64: string;
  size: number;
}

export interface MentionOption {
  id: string;
  label: string;
  description: string;
  token: string;
  kind: "agent" | "project" | "model" | "command";
}

// === Execution Timeline Types ===
export type TimelineStepStatus = "pending" | "running" | "complete" | "failed" | "waiting";

export interface TimelineStep {
  id: string;
  label: string;
  status: TimelineStepStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  detail?: string;
  toolName?: string;
  expandable?: boolean;
  retryable?: boolean;
}

// === Execution Widget Types ===
export type WidgetType = "crm" | "search" | "terminal" | "sql" | "files" | "memory" | "approval" | "browser" | "deployment" | "git";

export interface ExecutionWidget {
  id: string;
  type: WidgetType;
  title: string;
  status: "active" | "complete" | "error" | "collapsed";
  data: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
}

// === Capability Types ===
export interface AgentCapability {
  id: string;
  name: string;
  status: "running" | "complete" | "waiting" | "error";
  startedAt: string;
  durationMs?: number;
  dependencies?: string[];
}

// Extended FlyoutMode — includes all original tabs plus new ones
export type FlyoutModeExtended = FlyoutMode | "capabilities" | "widgets" | "files" | "reasoning" | "metrics";
