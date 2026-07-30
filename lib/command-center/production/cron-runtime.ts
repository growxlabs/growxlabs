import { Redis } from "@upstash/redis";

import { CommandCenterLogger } from "../logging/logger.ts";
import { CommandCenterError, errorResponse, requestIdFrom } from "./errors.ts";
import { enforceRateLimit } from "./rate-limit.ts";

const localLeases = new Map<string, number>();

export type CronSummary = {
  processed?: number;
  succeeded?: number;
  failed?: number;
  checkpoint?: string | null;
  [key: string]: unknown;
};

export async function runBoundedCron(
  request: Request,
  job: string,
  handler: (signal: AbortSignal) => Promise<CronSummary>,
  options: { deadlineMs?: number; leaseSeconds?: number } = {},
): Promise<Response> {
  const started = Date.now();
  const requestId = requestIdFrom(request);
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return errorResponse(new CommandCenterError("PERMISSION_DENIED"), requestId);
  }
  if (request.headers.has("sec-fetch-mode") || request.headers.has("sec-fetch-site")) {
    return errorResponse(new CommandCenterError("PERMISSION_DENIED"), requestId);
  }

  try {
    await enforceRateLimit("cron.invoke", request);
    const leaseSeconds = Math.min(300, Math.max(30, options.leaseSeconds ?? 90));
    const acquired = await acquireLease(job, requestId, leaseSeconds);
    if (!acquired) {
      throw new CommandCenterError("CONFLICT", {
        message: "This job is already running.",
        retryable: true,
      });
    }
    const controller = new AbortController();
    const deadlineMs = Math.min(55_000, Math.max(1_000, options.deadlineMs ?? 50_000));
    const timeout = setTimeout(() => controller.abort(), deadlineMs);
    try {
      const summary = await handler(controller.signal);
      const durationMs = Date.now() - started;
      CommandCenterLogger.info("Cron run completed", {
        route: `/api/cron/command-center/${job}`,
        requestId,
        durationMs,
        outcome: "success",
        summary,
      });
      return Response.json(
        {
          success: true,
          job,
          requestId,
          durationMs,
          ...summary,
          timestamp: new Date().toISOString(),
        },
        { headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
      );
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    CommandCenterLogger.error("Cron run failed", {
      route: `/api/cron/command-center/${job}`,
      requestId,
      durationMs: Date.now() - started,
      outcome: "failure",
      errorCode: error instanceof CommandCenterError ? error.code : "INTERNAL_ERROR",
    });
    return errorResponse(error, requestId);
  }
}

async function acquireLease(job: string, owner: string, leaseSeconds: number): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    const result = await new Redis({ url, token }).set(
      `gxl:command-center:cron:${job}`,
      owner,
      { nx: true, ex: leaseSeconds },
    );
    return result === "OK";
  }
  if (process.env.APP_ENV === "production" || process.env.VERCEL_ENV === "production") {
    throw new CommandCenterError("DEPENDENCY_UNAVAILABLE", {
      message: "The distributed Cron lock is unavailable.",
      retryable: true,
    });
  }
  const now = Date.now();
  const key = `cron:${job}`;
  const expiresAt = localLeases.get(key) ?? 0;
  if (expiresAt > now) return false;
  localLeases.set(key, now + leaseSeconds * 1_000);
  return true;
}

export function resetLocalCronLeasesForTests(): void {
  localLeases.clear();
}
