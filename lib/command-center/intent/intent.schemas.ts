import { z } from "zod";

export const CommandIntentTypeSchema = z.enum([
  "CREATE_LEAD",
  "QUERY_LEADS",
  "GENERATE_PROPOSAL",
  "CREATE_INVOICE",
  "QUERY_FINANCE",
  "QUERY_PROJECTS",
  "CONTENT_DISPATCH",
  "GENERAL_CHAT",
  "INFORMATION_LOOKUP",
  "CLARIFICATION_REQUIRED"
]);

export const IntentClassificationSchema = z.object({
  type: CommandIntentTypeSchema,
  confidence: z.number().min(0).max(1),
  source: z.enum(["rule", "model", "fallback"]),
  department: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  entities: z.record(z.string(), z.unknown()).default({}),
  requiresClarification: z.boolean().default(false),
  explanation: z.string().optional(),
  classifierVersion: z.string().default("2.0.0")
});
