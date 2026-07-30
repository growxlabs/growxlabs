import "server-only";

import crypto from "crypto";

import { supabaseAdmin } from "@/lib/supabase/admin";

import type { CommandCenterContext } from "../context/command-center-context";
import { CommandCenterError } from "./errors";

export async function reserveSubmission(
  context: CommandCenterContext,
  idempotencyKey: string | null,
  input: unknown,
): Promise<void> {
  if (!idempotencyKey || !/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) {
    throw new CommandCenterError("VALIDATION_FAILED", {
      message: "A valid Idempotency-Key header is required.",
    });
  }
  const requestHash = crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
  const { data, error } = await supabaseAdmin.rpc("command_center_reserve_submission", {
    p_organisation_id: context.organizationId,
    p_workspace_id: context.workspaceId,
    p_user_id: context.userId,
    p_idempotency_key: idempotencyKey,
    p_request_hash: requestHash,
    p_lease_seconds: 120,
  });
  if (error) throw new CommandCenterError("DATABASE_FAILURE", { cause: error });
  const result = Array.isArray(data) ? data[0] : data;
  if (!result || typeof result !== "object") throw new CommandCenterError("DATABASE_FAILURE");
  if ((result as Record<string, unknown>).hash_conflict === true) {
    throw new CommandCenterError("IDEMPOTENCY_CONFLICT", { retryable: false });
  }
  if ((result as Record<string, unknown>).acquired !== true) {
    throw new CommandCenterError("CONFLICT", {
      message: "This command is already being processed.",
      retryable: false,
    });
  }
}

export async function completeSubmission(
  context: CommandCenterContext,
  idempotencyKey: string,
  status: "succeeded" | "failed",
): Promise<void> {
  await supabaseAdmin
    .from("command_center_submission_idempotency")
    .update({ status, completed_at: new Date().toISOString() })
    .eq("organisation_id", context.organizationId)
    .eq("workspace_id", context.workspaceId)
    .eq("user_id", context.userId)
    .eq("idempotency_key", idempotencyKey);
}
