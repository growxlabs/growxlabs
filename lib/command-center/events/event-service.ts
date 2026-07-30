import "server-only";

import crypto from "crypto";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { PlatformEvent } from "./event.types";
import { CommandCenterError } from "../production/errors";

export class EventService {
  static async ingestEvent(
    eventInput: Omit<PlatformEvent, "id" | "ingestedAt">,
    dedupKey?: string,
  ): Promise<PlatformEvent> {
    const id = `evt_${crypto.randomUUID()}`;
    const { data, error } = await supabaseAdmin.rpc("command_center_ingest_event", {
      p_event: {
        id,
        version: eventInput.version,
        event_type: eventInput.eventType,
        category: eventInput.category,
        organisation_id: eventInput.organisationId,
        workspace_id: eventInput.workspaceId,
        request_id: eventInput.requestId,
        trace_id: eventInput.traceId ?? null,
        conversation_id: eventInput.conversationId ?? null,
        run_id: eventInput.runId ?? null,
        step_id: eventInput.stepId ?? null,
        actor_type: eventInput.actor.type,
        actor_id: eventInput.actor.id,
        occurred_at: eventInput.occurredAt,
        safe_payload: redactPayload(eventInput.safePayload),
        classification: eventInput.classification,
      },
      p_dedup_key: dedupKey ?? null,
    });
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || typeof row !== "object") throw new CommandCenterError("DATABASE_FAILURE");
    return fromRow(row as Record<string, unknown>);
  }

  static async listEvents(
    organisationId: string,
    workspaceId: string,
    afterSequence = 0,
    limit = 100,
  ): Promise<PlatformEvent[]> {
    const { data, error } = await supabaseAdmin
      .from("platform_events")
      .select("*")
      .eq("organisation_id", organisationId)
      .eq("workspace_id", workspaceId)
      .gt("sequence", Math.max(0, afterSequence))
      .order("sequence", { ascending: true })
      .limit(Math.min(250, Math.max(1, limit)));
    if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
    return (data ?? []).map((row) => fromRow(row as Record<string, unknown>));
  }
}

function redactPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    output[key] = /(password|token|secret|authorization|cookie|prompt|reasoning|raw.?payload)/i.test(key)
      ? "[REDACTED]"
      : value;
  }
  return output;
}

function fromRow(row: Record<string, unknown>): PlatformEvent {
  return {
    id: String(row.id),
    version: String(row.version),
    eventType: String(row.event_type),
    category: String(row.category) as PlatformEvent["category"],
    organisationId: String(row.organisation_id),
    workspaceId: String(row.workspace_id),
    requestId: String(row.request_id),
    traceId: row.trace_id ? String(row.trace_id) : undefined,
    conversationId: row.conversation_id ? String(row.conversation_id) : undefined,
    runId: row.run_id ? String(row.run_id) : undefined,
    stepId: row.step_id ? String(row.step_id) : undefined,
    actor: { type: String(row.actor_type) as PlatformEvent["actor"]["type"], id: String(row.actor_id) },
    sequence: row.sequence == null ? undefined : Number(row.sequence),
    occurredAt: String(row.occurred_at),
    ingestedAt: String(row.ingested_at),
    safePayload: row.safe_payload && typeof row.safe_payload === "object" ? row.safe_payload as Record<string, unknown> : {},
    classification: String(row.classification) as PlatformEvent["classification"],
  };
}
