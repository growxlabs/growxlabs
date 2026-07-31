export type AgentState =
  | "idle"
  | "thinking"
  | "working"
  | "waiting"
  | "blocked"
  | "complete"
  | "failed";

export type FlyoutMode =
  | "activity"
  | "approvals"
  | "artifacts"
  | "memory"
  | "notifications";

export type PlanStepStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "skipped"
  | "waiting_approval";

export type RunStatus =
  | "queued"
  | "running"
  | "waiting"
  | "waiting_for_approval"
  | "succeeded"
  | "failed"
  | "cancelled";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  pinned?: boolean;
  agentId?: string;
  lastRunStatus?: RunStatus;
}

export interface ToolActivity {
  id: string;
  name: string;
  status: "calling" | "complete" | "error";
  summary: string;
  risk?: RiskLevel;
  args?: any;
  result?: any;
  argsSummary?: string;
  resultSummary?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ActivityItem {
  id: string;
  label: string;
  state: AgentState;
  detail?: string;
  timestamp: string;
  runId?: string;
  stepId?: string;
}

export interface PlanStepView {
  id: string;
  name: string;
  type?: string;
  status: PlanStepStatus;
  detail?: string;
  toolId?: string;
}

export interface PlanView {
  id: string;
  title: string;
  steps: PlanStepView[];
  agentId?: string;
  agentName?: string;
  capabilityId?: string;
  createdAt: string;
}

export interface RunView {
  id: string;
  status: RunStatus;
  planId?: string;
  lastSequence: number;
  startedAt: string;
  finishedAt?: string;
  title?: string;
}

export interface ApprovalView {
  id: string;
  title: string;
  summary: string;
  riskLevel: RiskLevel;
  status: "pending" | "approved" | "rejected" | "expired";
  runId?: string;
  operation?: string;
  expiresAt?: string;
}

export interface ClarificationView {
  message: string;
  questions: Array<{ id?: string; question: string }>;
}

export interface CommandMessage {
  id: string;
  conversationId: string;
  sender: "user" | "gxl";
  text: string;
  timestamp: string;
  kind?: "message" | "error" | "clarification" | "approval" | "artifact" | "plan" | "system";
  toolCalls?: ToolActivity[];
  plan?: PlanView;
  run?: RunView;
  approval?: ApprovalView;
  clarification?: ClarificationView;
  agentName?: string;
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

export interface AgentOption {
  id: string;
  name: string;
  persona: string;
  description: string;
  department: string;
  token: string;
  status: "active" | "idle";
}

export interface MissionControlState {
  agentName: string;
  agentId?: string;
  state: AgentState;
  summary: string;
  plan: PlanView | null;
  run: RunView | null;
  approval: ApprovalView | null;
}
