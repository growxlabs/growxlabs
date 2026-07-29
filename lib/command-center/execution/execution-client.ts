import "server-only";

import { signServiceJWT } from "./service-jwt";
import type { ExecutionPlan } from "../planning/plan.types";

export interface ExecutionRun {
  id: string;
  idempotencyKey: string;
  plan: ExecutionPlan;
  status:
    | "queued"
    | "running"
    | "waiting"
    | "succeeded"
    | "failed"
    | "cancelling"
    | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionEvent {
  id: string;
  sequence: number;
  runId: string;
  stepId?: string;
  organisationId: string;
  workspaceId: string;
  type: string;
  payload: unknown;
  occurredAt: string;
}

export class ExecutionServiceError extends Error {
  constructor(
    public readonly code:
      | "EXECUTION_SERVICE_UNAVAILABLE"
      | "EXECUTION_SERVICE_REJECTED"
      | "EXECUTION_SERVICE_MISCONFIGURED",
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ExecutionServiceError";
  }
}

export class ExecutionClient {
  constructor(
    private readonly baseURL = requireInternalURL(
      "EXECUTION_ENGINE_INTERNAL_URL",
    ),
    private readonly secret = requireEnvironment(
      "EXECUTION_SERVICE_JWT_SECRET",
    ),
    private readonly environment = requireEnvironment("APP_ENV"),
  ) {}

  async createRun(
    plan: ExecutionPlan,
    idempotencyKey: string,
    signal?: AbortSignal,
  ): Promise<ExecutionRun> {
    return this.request<ExecutionRun>(
      "/internal/v1/runs",
      plan.requestId,
      {
        method: "POST",
        body: JSON.stringify({ idempotencyKey, plan }),
        signal,
      },
    );
  }

  async getRun(
    runId: string,
    organisationId: string,
    workspaceId: string,
    requestId: string,
    signal?: AbortSignal,
  ): Promise<ExecutionRun> {
    return this.request<ExecutionRun>(
      `/internal/v1/runs/${encodeURIComponent(runId)}`,
      requestId,
      {
        method: "GET",
        headers: {
          "X-Organisation-ID": organisationId,
          "X-Workspace-ID": workspaceId,
        },
        signal,
      },
    );
  }

  async getEvents(
    runId: string,
    organisationId: string,
    workspaceId: string,
    requestId: string,
    after = 0,
    signal?: AbortSignal,
  ): Promise<ExecutionEvent[]> {
    const result = await this.request<{ events: ExecutionEvent[] }>(
      `/internal/v1/runs/${encodeURIComponent(runId)}/events?after=${after}`,
      requestId,
      {
        method: "GET",
        headers: {
          "X-Organisation-ID": organisationId,
          "X-Workspace-ID": workspaceId,
        },
        signal,
      },
    );
    return result.events;
  }

  async cancelRun(
    runId: string,
    organisationId: string,
    workspaceId: string,
    requestId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.request<void>(
      `/internal/v1/runs/${encodeURIComponent(runId)}/cancel`,
      requestId,
      {
        method: "POST",
        headers: {
          "X-Organisation-ID": organisationId,
          "X-Workspace-ID": workspaceId,
        },
        signal,
      },
      true,
    );
  }

  private async request<T>(
    path: string,
    requestId: string,
    init: RequestInit,
    emptyResponse = false,
  ): Promise<T> {
    const now = Math.floor(Date.now() / 1000);
    const token = signServiceJWT(
      {
        iss: "gxl-web",
        aud: "execution-engine",
        service: "gxl-web",
        env: this.environment,
        requestId,
        iat: now,
        exp: now + 120,
      },
      this.secret,
    );
    let response: Response;
    try {
      response = await fetch(this.baseURL, {
        ...init,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
          "X-GXL-Internal-Path": path,
          ...init.headers,
        },
        cache: "no-store",
      });
    } catch (error) {
      throw new ExecutionServiceError(
        "EXECUTION_SERVICE_UNAVAILABLE",
        error instanceof Error
          ? `Execution service is unavailable: ${error.message}`
          : "Execution service is unavailable.",
      );
    }
    if (!response.ok) {
      const unavailable = response.status >= 500;
      throw new ExecutionServiceError(
        unavailable
          ? "EXECUTION_SERVICE_UNAVAILABLE"
          : "EXECUTION_SERVICE_REJECTED",
        unavailable
          ? "Execution service is temporarily unavailable."
          : `Execution service rejected the request with HTTP ${response.status}.`,
        response.status,
      );
    }
    if (emptyResponse) return undefined as T;
    return (await response.json()) as T;
  }
}

function requireEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ExecutionServiceError(
      "EXECUTION_SERVICE_MISCONFIGURED",
      `${name} is required when Phase 3 execution is enabled.`,
    );
  }
  return value;
}

function requireInternalURL(name: string): string {
  const value = requireEnvironment(name);
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new ExecutionServiceError(
      "EXECUTION_SERVICE_MISCONFIGURED",
      `${name} must be an absolute HTTP(S) URL.`,
    );
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new ExecutionServiceError(
      "EXECUTION_SERVICE_MISCONFIGURED",
      `${name} must use HTTP or HTTPS.`,
    );
  }
  return parsed.toString();
}
