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
  args?: Record<string, any>;
  result?: any;
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
