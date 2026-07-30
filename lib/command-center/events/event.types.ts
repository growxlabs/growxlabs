import { z } from "zod";

export const EventCategorySchema = z.enum([
  "conversation",
  "execution",
  "tool",
  "domain",
  "policy",
  "approval",
  "artifact",
  "memory",
  "notification"
]);
export type EventCategory = z.infer<typeof EventCategorySchema>;

export const PlatformEventSchema = z.object({
  id: z.string(),
  version: z.string().default("1.0.0"),
  eventType: z.string(),
  category: EventCategorySchema,
  organisationId: z.string(),
  workspaceId: z.string(),
  requestId: z.string(),
  traceId: z.string().optional(),
  conversationId: z.string().optional(),
  runId: z.string().optional(),
  stepId: z.string().optional(),
  actor: z.object({
    type: z.enum(["user", "agent", "service", "system"]),
    id: z.string()
  }),
  sequence: z.number().optional(),
  occurredAt: z.string(),
  ingestedAt: z.string(),
  safePayload: z.record(z.string(), z.unknown()).default({}),
  classification: z.enum(["public", "internal", "confidential", "restricted"]).default("internal")
});
export type PlatformEvent = z.infer<typeof PlatformEventSchema>;
