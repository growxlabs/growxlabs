import { z } from "zod";

export const WorkerExecutionRequestSchema = z
  .object({
    runId: z.string().uuid(),
    stepId: z.string().uuid(),
    attempt: z.number().int().positive().max(5),
    organisationId: z.string().min(1).max(200),
    workspaceId: z.string().min(1).max(200),
    userId: z.string().min(1).max(200),
    requestId: z.string().min(1).max(200),
    conversationId: z.string().min(1).max(200),
    agentId: z.string().min(1).max(200),
    capabilityId: z.string().min(1).max(200),
    skillId: z.string().max(200).optional(),
    toolId: z.string().max(200).optional(),
    input: z.record(z.string(), z.unknown()),
    requiredPermissions: z.array(z.string().min(1).max(200)).max(100),
  })
  .strict();

export type WorkerExecutionRequest = z.infer<
  typeof WorkerExecutionRequestSchema
>;
