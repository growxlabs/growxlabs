import { z } from "zod";

/* ─────────────────────────────────────────────────────────
   1. Run Contract
   ───────────────────────────────────────────────────────── */
export const RunStatusSchema = z.enum([
  "queued",
  "running",
  "waiting_for_approval",
  "completed",
  "failed",
  "cancelled"
]);
export type RunStatus = z.infer<typeof RunStatusSchema>;

export const RunContractSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  workspaceId: z.string(),
  conversationId: z.string(),
  status: RunStatusSchema,
  startedAt: z.string(),
  completedAt: z.string().optional(),
  error: z.object({ code: z.string(), message: z.string() }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});
export type RunContract = z.infer<typeof RunContractSchema>;

/* ─────────────────────────────────────────────────────────
   2. Plan Contract
   ───────────────────────────────────────────────────────── */
export const PlanStatusSchema = z.enum(["draft", "active", "completed", "failed", "cancelled"]);
export type PlanStatus = z.infer<typeof PlanStatusSchema>;

export const PlanContractSchema = z.object({
  id: z.string(),
  runId: z.string(),
  organizationId: z.string(),
  workspaceId: z.string(),
  goal: z.string(),
  steps: z.array(z.object({
    id: z.string(),
    description: z.string(),
    status: z.enum(["pending", "in_progress", "completed", "failed"])
  })),
  status: PlanStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});
export type PlanContract = z.infer<typeof PlanContractSchema>;

/* ─────────────────────────────────────────────────────────
   3. Task Contract
   ───────────────────────────────────────────────────────── */
export const TaskStatusSchema = z.enum([
  "pending",
  "ready",
  "running",
  "waiting_for_approval",
  "completed",
  "failed",
  "cancelled",
  "skipped"
]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskContractSchema = z.object({
  id: z.string(),
  runId: z.string(),
  planId: z.string().optional(),
  organizationId: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  status: TaskStatusSchema,
  dependencies: z.array(z.string()).default([]),
  capabilityId: z.string().optional(),
  toolId: z.string().optional(),
  input: z.unknown(),
  output: z.unknown().optional(),
  error: z.object({ code: z.string(), message: z.string() }).optional(),
  createdAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional()
});
export type TaskContract = z.infer<typeof TaskContractSchema>;

/* ─────────────────────────────────────────────────────────
   4. Agent Contract
   ───────────────────────────────────────────────────────── */
export const AgentContractSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  persona: z.string(),
  avatarUrl: z.string().optional(),
  capabilities: z.array(z.string()).default([]),
  description: z.string()
});
export type AgentContract = z.infer<typeof AgentContractSchema>;

/* ─────────────────────────────────────────────────────────
   5. Tool Contract
   ───────────────────────────────────────────────────────── */
export const ToolContractSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.enum(["sales", "cfo", "proposal", "research", "content", "cto", "admin"]),
  parameters: z.object({
    type: z.literal("object"),
    properties: z.record(z.string(), z.unknown()),
    required: z.array(z.string()).optional()
  }),
  riskLevel: z.enum(["low", "medium", "high"]),
  requiredPermissions: z.array(z.string()).default([])
});
export type ToolContract = z.infer<typeof ToolContractSchema>;

/* ─────────────────────────────────────────────────────────
   6. Capability Contract
   ───────────────────────────────────────────────────────── */
export const CapabilityContractSchema = z.object({
  id: z.string(),
  name: z.string(),
  scope: z.string(),
  description: z.string(),
  tools: z.array(z.string())
});
export type CapabilityContract = z.infer<typeof CapabilityContractSchema>;

/* ─────────────────────────────────────────────────────────
   7. Approval Contract
   ───────────────────────────────────────────────────────── */
export const ApprovalStatusSchema = z.enum(["pending", "approved", "rejected", "expired"]);
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;

export const ApprovalContractSchema = z.object({
  id: z.string(),
  runId: z.string(),
  taskId: z.string(),
  organizationId: z.string(),
  action: z.string(),
  requestedBy: z.string(),
  status: ApprovalStatusSchema,
  requestedAt: z.string(),
  decidedAt: z.string().optional(),
  decidedBy: z.string().optional(),
  reason: z.string().optional()
});
export type ApprovalContract = z.infer<typeof ApprovalContractSchema>;

/* ─────────────────────────────────────────────────────────
   8. Artifact Contract
   ───────────────────────────────────────────────────────── */
export const ArtifactContractSchema = z.object({
  id: z.string(),
  runId: z.string().optional(),
  organizationId: z.string(),
  workspaceId: z.string(),
  type: z.enum(["proposal", "chart", "report", "csv", "json", "code"]),
  title: z.string(),
  content: z.unknown(),
  url: z.string().optional(),
  createdAt: z.string()
});
export type ArtifactContract = z.infer<typeof ArtifactContractSchema>;

/* ─────────────────────────────────────────────────────────
   9. Audit Contract
   ───────────────────────────────────────────────────────── */
export const AuditContractSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  workspaceId: z.string(),
  action: z.string(),
  performedBy: z.string(),
  timestamp: z.string(),
  details: z.record(z.string(), z.unknown())
});
export type AuditContract = z.infer<typeof AuditContractSchema>;

/* ─────────────────────────────────────────────────────────
   10. Conversation Contract
   ───────────────────────────────────────────────────────── */
export const ConversationContractSchema = z.object({
  id: z.string(),
  organizationId: z.string().default("default"),
  workspaceId: z.string().default("default"),
  title: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().optional()
});
export type ConversationContract = z.infer<typeof ConversationContractSchema>;

/* ─────────────────────────────────────────────────────────
   11. Message Contract
   ───────────────────────────────────────────────────────── */
export const ToolCallStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  args: z.record(z.string(), z.unknown()),
  status: z.enum(["calling", "complete", "error"]),
  result: z.unknown().optional(),
  duration: z.number().optional()
});
export type ToolCallState = z.infer<typeof ToolCallStateSchema>;

export const MessageContractSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  sender: z.enum(["user", "gxl"]),
  text: z.string(),
  timestamp: z.string(),
  toolCalls: z.array(ToolCallStateSchema).optional(),
  proposal: z.record(z.string(), z.unknown()).optional(),
  chart: z.array(z.record(z.string(), z.unknown())).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    base64: z.string().optional(),
    url: z.string().optional()
  })).optional()
});
export type MessageContract = z.infer<typeof MessageContractSchema>;

/* ─────────────────────────────────────────────────────────
   12. Event Contract (SSE)
   ───────────────────────────────────────────────────────── */
export const EventTypeSchema = z.enum([
  "text_delta",
  "tool_call",
  "tool_result",
  "proposal",
  "chart",
  "done",
  "error"
]);
export type EventType = z.infer<typeof EventTypeSchema>;

export const EventContractSchema = z.object({
  type: EventTypeSchema,
  data: z.unknown(),
  timestamp: z.string()
});
export type EventContract = z.infer<typeof EventContractSchema>;

/* ─────────────────────────────────────────────────────────
   13. Source Contract
   ───────────────────────────────────────────────────────── */
export const SourceContractSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  snippet: z.string().optional(),
  fetchedAt: z.string()
});
export type SourceContract = z.infer<typeof SourceContractSchema>;

/* ─────────────────────────────────────────────────────────
   14. ModelInvocation Contract
   ───────────────────────────────────────────────────────── */
export const ModelInvocationContractSchema = z.object({
  id: z.string(),
  provider: z.enum(["gemini", "openrouter"]),
  modelName: z.string(),
  promptTokens: z.number().optional(),
  completionTokens: z.number().optional(),
  durationMs: z.number(),
  success: z.boolean(),
  error: z.string().optional(),
  timestamp: z.string()
});
export type ModelInvocationContract = z.infer<typeof ModelInvocationContractSchema>;
