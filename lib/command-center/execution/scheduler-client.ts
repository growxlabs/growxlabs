import "server-only";

import { CommandCenterError } from "../production/errors";
import { fetchWithResilience } from "../production/resilience";
import { signServiceJWT } from "./service-jwt";

export async function invokeBoundedScheduler(requestId: string, signal: AbortSignal): Promise<void> {
  const baseURL = process.env.INTERNAL_API_GATEWAY_URL;
  const secret = process.env.EXECUTION_SERVICE_JWT_SECRET;
  const environment = process.env.APP_ENV;
  if (!baseURL || !secret || !environment) {
    throw new CommandCenterError("DEPENDENCY_UNAVAILABLE", {
      message: "Execution recovery is not configured.",
      retryable: false,
    });
  }
  const parsed = new URL(baseURL);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new CommandCenterError("DEPENDENCY_UNAVAILABLE", { retryable: false });
  }
  const now = Math.floor(Date.now() / 1_000);
  const token = signServiceJWT({
    iss: "gxl-web",
    aud: "task-scheduler",
    service: "gxl-web",
    env: environment,
    requestId,
    iat: now,
    exp: now + 60,
  }, secret);
  const response = await fetchWithResilience(parsed, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Request-ID": requestId,
      "X-GXL-Internal-Path": "/internal/v1/scheduler/tick",
    },
    cache: "no-store",
    signal,
  }, {
    operation: "task-scheduler:recover",
    requestId,
    timeoutMs: 20_000,
    totalDeadlineMs: 45_000,
    maxAttempts: 2,
  });
  if (!response.ok) {
    throw new CommandCenterError("DEPENDENCY_UNAVAILABLE", {
      message: "Execution recovery could not complete.",
      retryable: response.status >= 500,
    });
  }
}
