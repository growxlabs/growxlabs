import { z } from "zod";

export const ArtifactTypeSchema = z.enum([
  "pdf",
  "docx",
  "xlsx",
  "csv",
  "pptx",
  "markdown",
  "text",
  "json"
]);
export type ArtifactType = z.infer<typeof ArtifactTypeSchema>;

export const ArtifactStatusSchema = z.enum([
  "generating",
  "available",
  "failed",
  "expired",
  "deleted"
]);
export type ArtifactStatus = z.infer<typeof ArtifactStatusSchema>;

export const ArtifactRecordSchema = z.object({
  id: z.string(),
  version: z.string().default("1.0.0"),
  organisationId: z.string(),
  workspaceId: z.string(),
  conversationId: z.string().optional(),
  runId: z.string().optional(),
  stepId: z.string().optional(),
  createdByUserId: z.string(),
  createdByAgentId: z.string().optional(),
  artifactType: ArtifactTypeSchema,
  name: z.string(),
  safeDescription: z.string().optional(),
  mimeType: z.string(),
  fileExtension: z.string(),
  storageProvider: z.literal("cloudflare_r2").default("cloudflare_r2"),
  objectKey: z.string(),
  sizeBytes: z.number(),
  checksum: z.string(),
  classification: z.enum(["public", "internal", "confidential", "restricted"]).default("internal"),
  status: ArtifactStatusSchema.default("available"),
  templateId: z.string().optional(),
  templateVersion: z.string().optional(),
  generatorId: z.string(),
  generatorVersion: z.string(),
  createdAt: z.string(),
  expiresAt: z.string().optional(),
  deletedAt: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});
export type ArtifactRecord = z.infer<typeof ArtifactRecordSchema>;

export interface ArtifactGenerationRequest {
  organisationId: string;
  workspaceId: string;
  requestedByUserId: string;
  artifactType: ArtifactType;
  name: string;
  content: {
    title: string;
    sections?: Array<{ heading?: string; body: string }>;
    table?: { headers: string[]; rows: string[][] };
    rawMarkdown?: string;
  };
  classification?: "public" | "internal" | "confidential" | "restricted";
  idempotencyKey?: string;
}
