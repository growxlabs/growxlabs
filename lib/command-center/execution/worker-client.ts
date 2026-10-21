import "server-only";

import { CommandCenterError } from "../production/errors";
import { fetchWithResilience } from "../production/resilience";
import { signServiceJWT } from "./service-jwt";

export interface WorkerBatchResult {
  processed: number;
  bounded: boolean;
  error?: string;
}

export async function invokeBoundedWorker(
  requestId: string,
  signal: AbortSignal,
  options: { limit?: number } = {},
): Promise<WorkerBatchResult> {
  const baseURL =
    process.env.EXECUTION_WORKER_INTERNAL_URL ||
    process.env.INTERNAL_API_GATEWAY_URL;
  const secret = process.env.EXECUTION_SERVICE_JWT_SECRET;
  const environment = process.env.APP_ENV;

  if (!baseURL || !secret || !environment) {
    throw new CommandCenterError("DEPENDENCY_UNAVAILABLE", {
      message: "Execution worker is not configured.",
      retryable: false,
    });
  }

  const limit = Math.min(10, Math.max(1, options.limit ?? 5));
  const parsed = new URL(baseURL);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new CommandCenterError("DEPENDENCY_UNAVAILABLE", { retryable: false });
  }

  parsed.searchParams.set("limit", String(limit));

  const now = Math.floor(Date.now() / 1_000);
  const token = signServiceJWT(
    {
      iss: "gxl-web",
      aud: "execution-worker",
      service: "gxl-web",
      env: environment,
      requestId,
      iat: now,
      exp: now + 120,
    },
    secret,
  );

  const response = await fetchWithResilience(
    parsed,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Request-ID": requestId,
        "X-GXL-Internal-Path": "/internal/v1/worker/batch",
      },
      cache: "no-store",
      signal,
    },
    {
      operation: "execution-worker:batch",
      requestId,
      timeoutMs: 45_000,
      totalDeadlineMs: 50_000,
      maxAttempts: 2,
    },
  );

  if (!response.ok) {
    throw new CommandCenterError("DEPENDENCY_UNAVAILABLE", {
      message: `Execution worker failed with HTTP ${response.status}`,
      retryable: response.status >= 500,
    });
  }

  return (await response.json()) as WorkerBatchResult;
}
