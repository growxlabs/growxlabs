import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { ArtifactService } from "../artifacts/artifact-service";
import { CommandCenterError } from "./errors";

type JobSummary = { processed: number; succeeded: number; failed: number; checkpoint: string | null };

export async function compactMemory(signal: AbortSignal): Promise<JobSummary> {
  return runRPC("command_center_compact_memory", signal);
}

export async function expireMemory(signal: AbortSignal): Promise<JobSummary> {
  return runRPC("command_center_expire_memory", signal);
}

export async function processEvents(signal: AbortSignal): Promise<JobSummary> {
  return runRPC("command_center_process_event_outbox", signal);
}

export async function processNotifications(signal: AbortSignal): Promise<JobSummary> {
  return runRPC("command_center_process_notifications", signal);
}

export async function cleanArtifacts(signal: AbortSignal): Promise<JobSummary> {
  const { data, error } = await supabaseAdmin
    .from("artifact_retention_status")
    .select("artifact_id")
    .eq("legal_hold", false)
    .lte("scheduled_deletion_at", new Date().toISOString())
    .order("scheduled_deletion_at", { ascending: true })
    .limit(25);
  if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
  let succeeded = 0;
  let failed = 0;
  let checkpoint: string | null = null;
  for (const item of data ?? []) {
    if (signal.aborted) throw new CommandCenterError("TIMEOUT", { retryable: true });
    checkpoint = String(item.artifact_id);
    try {
      await ArtifactService.deleteExpiredArtifact(checkpoint);
      succeeded += 1;
    } catch {
      failed += 1;
    }
  }
  return { processed: data?.length ?? 0, succeeded, failed, checkpoint };
}

async function runRPC(name: string, signal: AbortSignal): Promise<JobSummary> {
  if (signal.aborted) throw new CommandCenterError("TIMEOUT", { retryable: true });
  const { data, error } = await supabaseAdmin.rpc(name, { p_limit: 100 });
  if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
  const result = Array.isArray(data) ? data[0] : data;
  const value = result && typeof result === "object" ? result as Record<string, unknown> : {};
  return {
    processed: Number(value.processed ?? 0),
    succeeded: Number(value.succeeded ?? value.processed ?? 0),
    failed: Number(value.failed ?? 0),
    checkpoint: value.checkpoint == null ? null : String(value.checkpoint),
  };
}
