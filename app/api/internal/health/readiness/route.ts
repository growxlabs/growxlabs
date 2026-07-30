import crypto from "crypto";

import { R2StorageService } from "@/lib/command-center/artifacts/r2-storage";
import { validateProductionConfiguration } from "@/lib/command-center/production/config";
import { CommandCenterError, errorResponse, requestIdFrom } from "@/lib/command-center/production/errors";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET(request: Request): Promise<Response> {
  const requestId = requestIdFrom(request);
  const expected = process.env.HEALTHCHECK_SECRET ?? process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!expected || !constantTimeEqual(expected, supplied)) {
    return errorResponse(new CommandCenterError("PERMISSION_DENIED"), requestId);
  }

  const configuration = validateProductionConfiguration();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3_000);
  const started = Date.now();
  try {
    const [database, storage] = await Promise.all([
      checkDatabase(),
      R2StorageService.readiness(controller.signal),
    ]);
    const ready = configuration.ready && database.ready && storage;
    return Response.json({
      status: ready ? "READY" : "NOT_READY",
      requestId,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? process.env.npm_package_version ?? "development",
      environment: configuration.environment,
      migration: { compatible: database.migrationCompatible },
      checks: {
        configuration: {
          ready: configuration.ready,
          missingKeys: configuration.missing,
          invalidKeys: configuration.invalid,
        },
        database: { ready: database.ready },
        objectStorage: { ready: storage },
      },
      durationMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    }, {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkDatabase(): Promise<{ ready: boolean; migrationCompatible: boolean }> {
  try {
    const { error } = await supabaseAdmin.from("artifact_idempotency_records").select("request_hash").limit(1);
    return { ready: !error, migrationCompatible: !error };
  } catch {
    return { ready: false, migrationCompatible: false };
  }
}

function constantTimeEqual(expected: string, supplied: string): boolean {
  const left = Buffer.from(expected);
  const right = Buffer.from(supplied);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
