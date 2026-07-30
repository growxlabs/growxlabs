import { z } from "zod";

export const MemoryTypeSchema = z.enum([
  "working",
  "conversation_summary",
  "user_preference",
  "workspace_knowledge",
  "execution_summary",
  "entity_fact"
]);
export type MemoryType = z.infer<typeof MemoryTypeSchema>;

export const MemoryOwnerTypeSchema = z.enum(["user", "conversation", "workspace", "entity", "execution"]);
export type MemoryOwnerType = z.infer<typeof MemoryOwnerTypeSchema>;

export const MemoryClassificationSchema = z.enum(["public", "internal", "confidential", "restricted"]);
export type MemoryClassification = z.infer<typeof MemoryClassificationSchema>;

export const MemoryStatusSchema = z.enum(["active", "superseded", "expired", "deleted"]);
export type MemoryStatus = z.infer<typeof MemoryStatusSchema>;

export const MemoryRecordSchema = z.object({
  id: z.string(),
  version: z.string().default("1.0.0"),
  organisationId: z.string(),
  workspaceId: z.string(),
  ownerType: MemoryOwnerTypeSchema,
  ownerId: z.string(),
  memoryType: MemoryTypeSchema,
  title: z.string().optional(),
  content: z.string(),
  classification: MemoryClassificationSchema.default("internal"),
  confidence: z.number().min(0).max(1).default(1.0),
  status: MemoryStatusSchema.default("active"),
  createdBy: z.object({
    type: z.enum(["user", "agent", "service", "system"]),
    id: z.string()
  }),
  approvedByUserId: z.string().optional(),
  validFrom: z.string(),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional()
});
export type MemoryRecord = z.infer<typeof MemoryRecordSchema>;

export interface MemoryRetrievalQuery {
  organisationId: string;
  workspaceId: string;
  userId: string;
  memoryType?: MemoryType;
  ownerType?: MemoryOwnerType;
  ownerId?: string;
  searchQuery?: string;
  topK?: number;
  tokenBudget?: number;
}
