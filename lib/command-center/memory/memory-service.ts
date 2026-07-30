import "server-only";

import crypto from "crypto";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { MemoryRecord, MemoryRetrievalQuery } from "./memory.types";
import { MemoryRedactor } from "./memory-redaction";
import { DefaultVectorRetrievalProvider } from "./vector-retrieval";
import { CommandCenterLogger } from "../logging/logger";
import { CommandCenterError } from "../production/errors";

export class MemoryService {
  private static retriever = new DefaultVectorRetrievalProvider();

  static async writeMemory(recordInput: Omit<MemoryRecord, "id" | "createdAt" | "updatedAt">): Promise<MemoryRecord> {
    const { sanitizedContent, containsSecrets } = MemoryRedactor.redact(recordInput.content);
    if (containsSecrets) {
      CommandCenterLogger.warn("Memory content was redacted", {
        organizationId: recordInput.organisationId,
        workspaceId: recordInput.workspaceId,
        userId: recordInput.createdBy.id,
        outcome: "redacted",
      });
    }
    const id = `mem_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const record: MemoryRecord = {
      ...recordInput,
      id,
      content: sanitizedContent,
      createdAt: now,
      updatedAt: now,
    };
    const { error } = await supabaseAdmin.from("memory_records").insert(toRow(record));
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    return record;
  }

  static async retrieveMemory(query: MemoryRetrievalQuery): Promise<MemoryRecord[]> {
    let databaseQuery = supabaseAdmin
      .from("memory_records")
      .select("*")
      .eq("organisation_id", query.organisationId)
      .eq("workspace_id", query.workspaceId)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (query.memoryType) databaseQuery = databaseQuery.eq("memory_type", query.memoryType);
    if (query.ownerType) databaseQuery = databaseQuery.eq("owner_type", query.ownerType);
    if (query.ownerId) databaseQuery = databaseQuery.eq("owner_id", query.ownerId);
    const { data, error } = await databaseQuery;
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    const ranked = await this.retriever.search(query, (data ?? []).map((row) => fromRow(row as Record<string, unknown>)));

    const maxTokens = Math.min(4_000, Math.max(100, query.tokenBudget || 2_000));
    let accumulatedTokens = 0;
    const finalRecords: MemoryRecord[] = [];
    for (const result of ranked) {
      const tokens = Math.ceil(result.record.content.length / 4);
      if (accumulatedTokens + tokens > maxTokens) break;
      accumulatedTokens += tokens;
      finalRecords.push(result.record);
    }
    return finalRecords;
  }

  static async deleteMemory(id: string, organisationId: string, workspaceId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from("memory_records")
      .update({ status: "deleted", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("organisation_id", organisationId)
      .eq("workspace_id", workspaceId)
      .eq("owner_type", "user")
      .eq("owner_id", userId)
      .eq("memory_type", "user_preference")
      .select("id")
      .maybeSingle();
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    return Boolean(data);
  }

  static async updatePreference(
    id: string,
    organisationId: string,
    workspaceId: string,
    userId: string,
    content: string,
    disabled: boolean,
  ): Promise<MemoryRecord | null> {
    const redacted = MemoryRedactor.redact(content);
    const { data, error } = await supabaseAdmin
      .from("memory_records")
      .update({
        content: redacted.sanitizedContent,
        status: disabled ? "superseded" : "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organisation_id", organisationId)
      .eq("workspace_id", workspaceId)
      .eq("owner_type", "user")
      .eq("owner_id", userId)
      .eq("memory_type", "user_preference")
      .select("*")
      .maybeSingle();
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    return data ? fromRow(data as Record<string, unknown>) : null;
  }
}

function toRow(record: MemoryRecord): Record<string, unknown> {
  return {
    id: record.id,
    version: record.version,
    organisation_id: record.organisationId,
    workspace_id: record.workspaceId,
    owner_type: record.ownerType,
    owner_id: record.ownerId,
    memory_type: record.memoryType,
    title: record.title ?? null,
    content: record.content,
    classification: record.classification,
    confidence: record.confidence,
    status: record.status,
    created_by_type: record.createdBy.type,
    created_by_id: record.createdBy.id,
    approved_by_user_id: record.approvedByUserId ?? null,
    valid_from: record.validFrom,
    expires_at: record.expiresAt ?? null,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    metadata: record.metadata ?? {},
  };
}

function fromRow(row: Record<string, unknown>): MemoryRecord {
  return {
    id: String(row.id),
    version: String(row.version),
    organisationId: String(row.organisation_id),
    workspaceId: String(row.workspace_id),
    ownerType: String(row.owner_type) as MemoryRecord["ownerType"],
    ownerId: String(row.owner_id),
    memoryType: String(row.memory_type) as MemoryRecord["memoryType"],
    title: row.title ? String(row.title) : undefined,
    content: String(row.content),
    classification: String(row.classification) as MemoryRecord["classification"],
    confidence: Number(row.confidence),
    status: String(row.status) as MemoryRecord["status"],
    createdBy: { type: String(row.created_by_type) as MemoryRecord["createdBy"]["type"], id: String(row.created_by_id) },
    approvedByUserId: row.approved_by_user_id ? String(row.approved_by_user_id) : undefined,
    validFrom: String(row.valid_from),
    expiresAt: row.expires_at ? String(row.expires_at) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata as Record<string, unknown> : {},
  };
}
