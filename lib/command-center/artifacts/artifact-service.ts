import "server-only";

import crypto from "crypto";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { ArtifactRecord, ArtifactGenerationRequest } from "./artifact.types";
import { ArtifactSafetyValidator } from "./safety-validator";
import { R2StorageService } from "./r2-storage";
import { MarkdownGenerator } from "./generators/markdown.generator";
import { CsvGenerator } from "./generators/csv.generator";
import { PdfGenerator } from "./generators/pdf.generator";
import { DocxGenerator } from "./generators/docx.generator";
import { XlsxGenerator } from "./generators/xlsx.generator";
import { PptxGenerator } from "./generators/pptx.generator";
import { CommandCenterError } from "../production/errors";

const MAX_ARTIFACT_BYTES = 25 * 1024 * 1024;

export class ArtifactService {
  static async generateArtifact(req: ArtifactGenerationRequest): Promise<ArtifactRecord> {
    if (req.idempotencyKey) {
      const existing = await this.findByIdempotencyKey(req.idempotencyKey, req.organisationId, req.workspaceId, requestHash(req));
      if (existing) return existing;
    }

    const id = `art_${crypto.randomUUID()}`;
    const sanitizedName = ArtifactSafetyValidator.sanitizeFilename(req.name).slice(0, 180);
    if (!sanitizedName) throw new CommandCenterError("VALIDATION_FAILED");
    const { mimeType, fileExtension } = ArtifactSafetyValidator.getMimeAndExtension(req.artifactType);
    const fileBuffer = this.generateBytes(req);
    if (fileBuffer.length === 0 || fileBuffer.length > MAX_ARTIFACT_BYTES) {
      throw new CommandCenterError("VALIDATION_FAILED", {
        message: "Artifact output exceeds the allowed size.",
      });
    }

    const checksum = `sha256_${crypto.createHash("sha256").update(fileBuffer).digest("hex")}`;
    const objectKey = R2StorageService.buildObjectKey(
      req.organisationId,
      req.workspaceId,
      id,
      `${sanitizedName}${fileExtension}`,
    );
    const now = new Date().toISOString();
    const record: ArtifactRecord = {
      id,
      version: "1.0.0",
      organisationId: req.organisationId,
      workspaceId: req.workspaceId,
      createdByUserId: req.requestedByUserId,
      artifactType: req.artifactType,
      name: sanitizedName,
      safeDescription: req.content.title.slice(0, 500),
      mimeType,
      fileExtension,
      storageProvider: "cloudflare_r2",
      objectKey,
      sizeBytes: fileBuffer.length,
      checksum,
      classification: req.classification || "internal",
      status: "available",
      generatorId: `gen_${req.artifactType}`,
      generatorVersion: "2.0.0",
      createdAt: now,
    };

    await R2StorageService.upload(objectKey, fileBuffer, mimeType, checksum);
    try {
      const { error } = await supabaseAdmin.from("artifact_records").insert(toRow(record));
      if (error) throw error;
      if (req.idempotencyKey) {
        const { error: idempotencyError } = await supabaseAdmin.from("artifact_idempotency_records").insert({
          idempotency_key: req.idempotencyKey,
          artifact_id: id,
          organisation_id: req.organisationId,
          workspace_id: req.workspaceId,
          request_hash: requestHash(req),
        });
        if (idempotencyError) {
          await supabaseAdmin.from("artifact_records").delete().eq("id", id);
          await R2StorageService.delete(objectKey).catch(() => undefined);
          const raced = await this.findByIdempotencyKey(
            req.idempotencyKey,
            req.organisationId,
            req.workspaceId,
            requestHash(req),
          );
          if (raced) return raced;
          throw idempotencyError;
        }
      }
      return record;
    } catch (error) {
      try {
        await supabaseAdmin.from("artifact_records").delete().eq("id", id);
      } catch {
        // The R2 cleanup below is still attempted; readiness will surface an orphaned row.
      }
      await R2StorageService.delete(objectKey).catch(() => undefined);
      throw new CommandCenterError("DATABASE_FAILURE", { cause: error, retryable: true });
    }
  }

  static async getArtifact(id: string, organisationId: string, workspaceId: string): Promise<ArtifactRecord | undefined> {
    const { data, error } = await supabaseAdmin
      .from("artifact_records")
      .select("*")
      .eq("id", id)
      .eq("organisation_id", organisationId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    return data ? fromRow(data as Record<string, unknown>) : undefined;
  }

  static async listArtifacts(organisationId: string, workspaceId: string, limit = 50): Promise<ArtifactRecord[]> {
    const { data, error } = await supabaseAdmin
      .from("artifact_records")
      .select("*")
      .eq("organisation_id", organisationId)
      .eq("workspace_id", workspaceId)
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(Math.min(100, Math.max(1, limit)));
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    return (data ?? []).map((row) => fromRow(row as Record<string, unknown>));
  }

  static async deleteArtifact(id: string, organisationId: string, workspaceId: string, userId: string): Promise<boolean> {
    const artifact = await this.getArtifact(id, organisationId, workspaceId);
    if (!artifact || artifact.createdByUserId !== userId || artifact.status !== "available") return false;
    const { data: retention, error: retentionError } = await supabaseAdmin
      .from("artifact_retention_status")
      .select("legal_hold")
      .eq("artifact_id", id)
      .maybeSingle();
    if (retentionError) throw new CommandCenterError("DATABASE_FAILURE", { cause: retentionError });
    if (retention?.legal_hold === true) return false;

    await R2StorageService.delete(artifact.objectKey);
    const deletedAt = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from("artifact_records")
      .update({ status: "deleted", deleted_at: deletedAt })
      .eq("id", id)
      .eq("organisation_id", organisationId)
      .eq("workspace_id", workspaceId)
      .eq("status", "available");
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    return true;
  }

  static async auditAccess(artifactId: string, userId: string, action: "signed_url_issued" | "access_denied"): Promise<void> {
    const { error } = await supabaseAdmin.from("artifact_access_events").insert({
      id: `aae_${crypto.randomUUID()}`,
      artifact_id: artifactId,
      user_id: userId,
      action,
    });
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
  }

  static async deleteExpiredArtifact(id: string): Promise<void> {
    const { data, error } = await supabaseAdmin
      .from("artifact_records")
      .select("id,object_key,status")
      .eq("id", id)
      .in("status", ["available", "expired"])
      .maybeSingle();
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    if (!data) return;
    const { data: retention, error: retentionError } = await supabaseAdmin
      .from("artifact_retention_status")
      .select("legal_hold,scheduled_deletion_at")
      .eq("artifact_id", id)
      .maybeSingle();
    if (retentionError) throw new CommandCenterError("DATABASE_FAILURE", { cause: retentionError });
    if (!retention || retention.legal_hold || !retention.scheduled_deletion_at || new Date(retention.scheduled_deletion_at) > new Date()) {
      throw new CommandCenterError("PERMISSION_DENIED");
    }
    await R2StorageService.delete(String(data.object_key));
    const { error: updateError } = await supabaseAdmin
      .from("artifact_records")
      .update({ status: "deleted", deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (updateError) throw new CommandCenterError("DATABASE_FAILURE", { cause: updateError });
  }

  private static generateBytes(req: ArtifactGenerationRequest): Buffer {
    switch (req.artifactType) {
      case "csv": return Buffer.from(CsvGenerator.generate(req));
      case "markdown":
      case "text": return Buffer.from(MarkdownGenerator.generate(req));
      case "pdf": return PdfGenerator.generate(req);
      case "docx": return DocxGenerator.generate(req);
      case "xlsx": return XlsxGenerator.generate(req);
      case "pptx": return PptxGenerator.generate(req);
      default: return Buffer.from(JSON.stringify(req.content, null, 2));
    }
  }

  private static async findByIdempotencyKey(
    key: string,
    organisationId: string,
    workspaceId: string,
    expectedHash: string,
  ): Promise<ArtifactRecord | undefined> {
    const { data, error } = await supabaseAdmin
      .from("artifact_idempotency_records")
      .select("artifact_id,request_hash")
      .eq("idempotency_key", key)
      .eq("organisation_id", organisationId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    if (!data?.artifact_id) return undefined;
    if (data.request_hash && data.request_hash !== expectedHash) {
      throw new CommandCenterError("IDEMPOTENCY_CONFLICT", { retryable: false });
    }
    return this.getArtifact(String(data.artifact_id), organisationId, workspaceId);
  }
}

function requestHash(req: ArtifactGenerationRequest): string {
  return crypto.createHash("sha256").update(JSON.stringify({
    artifactType: req.artifactType,
    name: req.name,
    content: req.content,
    classification: req.classification,
  })).digest("hex");
}

function toRow(record: ArtifactRecord): Record<string, unknown> {
  return {
    id: record.id,
    version: record.version,
    organisation_id: record.organisationId,
    workspace_id: record.workspaceId,
    conversation_id: record.conversationId ?? null,
    run_id: record.runId ?? null,
    step_id: record.stepId ?? null,
    created_by_user_id: record.createdByUserId,
    created_by_agent_id: record.createdByAgentId ?? null,
    artifact_type: record.artifactType,
    name: record.name,
    safe_description: record.safeDescription ?? null,
    mime_type: record.mimeType,
    file_extension: record.fileExtension,
    storage_provider: record.storageProvider,
    object_key: record.objectKey,
    size_bytes: record.sizeBytes,
    checksum: record.checksum,
    classification: record.classification,
    status: record.status,
    template_id: record.templateId ?? null,
    template_version: record.templateVersion ?? null,
    generator_id: record.generatorId,
    generator_version: record.generatorVersion,
    created_at: record.createdAt,
    expires_at: record.expiresAt ?? null,
    deleted_at: record.deletedAt ?? null,
    metadata: record.metadata ?? {},
  };
}

function fromRow(row: Record<string, unknown>): ArtifactRecord {
  return {
    id: String(row.id),
    version: String(row.version),
    organisationId: String(row.organisation_id),
    workspaceId: String(row.workspace_id),
    conversationId: row.conversation_id ? String(row.conversation_id) : undefined,
    runId: row.run_id ? String(row.run_id) : undefined,
    stepId: row.step_id ? String(row.step_id) : undefined,
    createdByUserId: String(row.created_by_user_id),
    createdByAgentId: row.created_by_agent_id ? String(row.created_by_agent_id) : undefined,
    artifactType: String(row.artifact_type) as ArtifactRecord["artifactType"],
    name: String(row.name),
    safeDescription: row.safe_description ? String(row.safe_description) : undefined,
    mimeType: String(row.mime_type),
    fileExtension: String(row.file_extension),
    storageProvider: "cloudflare_r2",
    objectKey: String(row.object_key),
    sizeBytes: Number(row.size_bytes),
    checksum: String(row.checksum),
    classification: String(row.classification) as ArtifactRecord["classification"],
    status: String(row.status) as ArtifactRecord["status"],
    templateId: row.template_id ? String(row.template_id) : undefined,
    templateVersion: row.template_version ? String(row.template_version) : undefined,
    generatorId: String(row.generator_id),
    generatorVersion: String(row.generator_version),
    createdAt: String(row.created_at),
    expiresAt: row.expires_at ? String(row.expires_at) : undefined,
    deletedAt: row.deleted_at ? String(row.deleted_at) : undefined,
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata as Record<string, unknown> : {},
  };
}
