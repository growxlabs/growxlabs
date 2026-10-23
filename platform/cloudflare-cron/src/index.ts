/**
 * GrowxLabs Command Center — External Cron Recovery Worker
 *
 * Runs on Cloudflare Workers edge runtime.
 * Periodically wakes the Vercel-hosted Command Center recovery endpoint
 * to advance scheduled steps, process pending worker passes, and recover
 * any orphaned execution leases.
 */

export interface Env {
  RECOVERY_ENDPOINT_URL: string;
  CRON_SECRET: string;
  APP_ENV?: string;
  VERCEL_PROTECTION_BYPASS?: string;
}

export interface ScheduledEvent {
  cron: string;
  scheduledTime: number;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException?(): void;
}

export interface ExecutionSummary {
  success: boolean;
  job: string;
  requestId: string;
  durationMs: number;
  processed?: number;
  succeeded?: number;
  failed?: number;
  checkpoint?: string | null;
  workerStepsProcessed?: number;
  error?: string;
}

export default {
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    const started = Date.now();
    const requestId = crypto.randomUUID();

    console.log(
      JSON.stringify({
        level: "INFO",
        msg: "Cron trigger fired",
        cron: event.cron,
        scheduledTime: event.scheduledTime,
        requestId,
        environment: env.APP_ENV ?? "production",
      }),
    );

    ctx.waitUntil(
      triggerRecoveryWithRetry(env, requestId, started).catch((err) => {
        console.error(
          JSON.stringify({
            level: "ERROR",
            msg: "Unhandled cron execution error",
            requestId,
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          }),
        );
      }),
    );
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint for synthetic monitors / uptime checks
    if (request.method === "GET" && url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          service: "growxlabs-recovery-cron",
          targetConfigured: Boolean(env.RECOVERY_ENDPOINT_URL),
          targetURL: env.RECOVERY_ENDPOINT_URL || null,
          environment: env.APP_ENV ?? "production",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Authenticated manual trigger (useful for staging validation and smoke tests)
    if (request.method === "POST" && url.pathname === "/trigger") {
      const auth = request.headers.get("Authorization");
      if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Invalid or missing bearer token" }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }

      const requestId = crypto.randomUUID();
      const started = Date.now();
      try {
        const result = await triggerRecoveryWithRetry(env, requestId, started);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 502,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: error instanceof Error ? error.message : "Trigger failed",
            requestId,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};

/**
 * Executes the recovery call with bounded retry logic for transient errors.
 * Preserves the same requestId and Idempotency-Key across retries.
 * Strictly avoids blind retries on timeouts or concurrent locks.
 */
export async function triggerRecoveryWithRetry(
  env: Env,
  requestId: string,
  started: number,
): Promise<ExecutionSummary> {
  const maxAttempts = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await triggerRecovery(env, requestId, started);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const isTimeout =
        lastError.name === "AbortError" ||
        lastError.message.includes("aborted") ||
        lastError.message.includes("timeout");

      console.warn(
        JSON.stringify({
          level: "WARN",
          msg: "Recovery attempt failed",
          attempt,
          requestId,
          isTimeout,
          error: lastError.message,
        }),
      );

      // CRITICAL: If the request timed out on Vercel after 55s, do NOT retry immediately!
      // Vercel might still be processing or holding the distributed lease.
      // Let the next scheduled 1-minute cron cycle advance cleanly.
      if (isTimeout) {
        return {
          success: false,
          job: "recover-execution",
          requestId,
          durationMs: Date.now() - started,
          error: "Vercel execution deadline exceeded (55s timeout). Next cron tick will resume.",
        };
      }

      // Only retry on transient connect / DNS / gateway failures
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));
      }
    }
  }

  throw lastError ?? new Error("Recovery trigger failed after retries");
}

/**
 * Performs the authenticated HTTP call to the Vercel recovery endpoint.
 */
export async function triggerRecovery(
  env: Env,
  requestId: string,
  started: number,
): Promise<ExecutionSummary> {
  if (!env.RECOVERY_ENDPOINT_URL) {
    throw new Error("RECOVERY_ENDPOINT_URL environment variable is missing");
  }
  if (!env.CRON_SECRET) {
    throw new Error("CRON_SECRET environment variable is missing or empty");
  }

  // Safety Guard: Staging worker must never target the production domain
  if (env.APP_ENV === "staging") {
    const urlLower = env.RECOVERY_ENDPOINT_URL.toLowerCase();
    if (
      urlLower.includes("growxlabs.tech") &&
      !urlLower.includes("staging") &&
      !urlLower.includes("preview") &&
      !urlLower.includes("vercel.app")
    ) {
      throw new Error(
        "CRITICAL SAFETY VIOLATION: Staging worker must never target the production domain!",
      );
    }
  }

  // Bounded 55-second HTTP timeout: allows Vercel's 50s deadlineMs to finish cleanly
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55_000);

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${env.CRON_SECRET}`,
      "X-Request-ID": requestId,
      "Idempotency-Key": requestId,
      "User-Agent": "GrowxLabs-Cloudflare-Cron/1.0",
      Accept: "application/json",
    };

    // Support Vercel Preview Deployment Protection Bypass if configured
    if (env.VERCEL_PROTECTION_BYPASS) {
      headers["x-vercel-protection-bypass"] = env.VERCEL_PROTECTION_BYPASS;
    }

    const response = await fetch(env.RECOVERY_ENDPOINT_URL, {
      method: "POST",
      headers,
      signal: controller.signal,
    });

    const durationMs = Date.now() - started;

    if (response.status === 409) {
      // HTTP 409 Conflict indicates the distributed lock (Upstash/local) is currently held
      // by another in-flight recovery invocation. This is expected, safe, and must NOT be retried.
      console.log(
        JSON.stringify({
          level: "INFO",
          msg: "Recovery skipped: distributed lock currently held by another worker",
          requestId,
          status: 409,
          durationMs,
        }),
      );
      return {
        success: true,
        job: "recover-execution",
        requestId,
        durationMs,
        processed: 0,
        checkpoint: "locked",
      };
    }

    // Transient edge errors: throw so the caller can retry ONCE
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Transient gateway error (HTTP ${response.status}): ${errorText.slice(0, 200)}`,
      );
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(
        JSON.stringify({
          level: "ERROR",
          msg: "Vercel recovery endpoint returned non-2xx status",
          status: response.status,
          statusText: response.statusText,
          requestId,
          durationMs,
          bodyPreview: errorText.slice(0, 500),
        }),
      );
      return {
        success: false,
        job: "recover-execution",
        requestId,
        durationMs,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as ExecutionSummary;

    console.log(
      JSON.stringify({
        level: "INFO",
        msg: "Recovery pass completed successfully",
        requestId,
        durationMs,
        processed: data.processed,
        workerStepsProcessed: data.workerStepsProcessed,
      }),
    );

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}
