import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import type { CommandCenterContext } from "../context/command-center-context.ts";
import { CommandCenterError } from "./errors.ts";

export type RateLimitOperation =
  | "conversation.submit"
  | "model.execute"
  | "tool.execute"
  | "sse.connect"
  | "artifact.generate"
  | "artifact.signed-url"
  | "memory.mutate"
  | "notification.mutate"
  | "governance.read"
  | "governance.mutate"
  | "cron.invoke";

const policies: Record<RateLimitOperation, { requests: number; window: `${number} ${"s" | "m" | "h"}` }> = {
  "conversation.submit": { requests: 12, window: "1 m" },
  "model.execute": { requests: 20, window: "1 m" },
  "tool.execute": { requests: 30, window: "1 m" },
  "sse.connect": { requests: 20, window: "1 m" },
  "artifact.generate": { requests: 5, window: "1 m" },
  "artifact.signed-url": { requests: 20, window: "1 m" },
  "memory.mutate": { requests: 30, window: "1 m" },
  "notification.mutate": { requests: 60, window: "1 m" },
  "governance.read": { requests: 90, window: "1 m" },
  "governance.mutate": { requests: 20, window: "1 m" },
  "cron.invoke": { requests: 4, window: "1 m" },
};

type Limiter = Pick<Ratelimit, "limit">;
const distributedLimiters = new Map<RateLimitOperation, Limiter>();
const developmentCounters = new Map<string, { count: number; reset: number }>();

function getDistributedLimiter(operation: RateLimitOperation): Limiter | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const existing = distributedLimiters.get(operation);
  if (existing) return existing;
  const policy = policies[operation];
  const limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(policy.requests, policy.window),
    prefix: `gxl:command-center:${operation}`,
    analytics: true,
  });
  distributedLimiters.set(operation, limiter);
  return limiter;
}

export type RateLimitResult = {
  limit: number;
  remaining: number;
  reset: number;
};

export async function enforceRateLimit(
  operation: RateLimitOperation,
  request: Request,
  context?: Pick<CommandCenterContext, "organizationId" | "workspaceId" | "userId">,
): Promise<RateLimitResult> {
  const policy = policies[operation];
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const identity = context
    ? `${context.organizationId}:${context.workspaceId}:${context.userId}:${ip}`
    : ip;
  const limiter = getDistributedLimiter(operation);
  if (limiter) {
    const result = await limiter.limit(identity);
    if (!result.success) {
      throw new CommandCenterError("RATE_LIMITED", {
        retryable: true,
        status: 429,
      });
    }
    return { limit: result.limit, remaining: result.remaining, reset: result.reset };
  }

  if ((process.env.APP_ENV === "production" || process.env.VERCEL_ENV === "production") && operation !== "cron.invoke") {
    throw new CommandCenterError("DEPENDENCY_UNAVAILABLE", {
      message: "Abuse protection is temporarily unavailable.",
      retryable: true,
    });
  }

  const now = Date.now();
  const key = `${operation}:${identity}`;
  const current = developmentCounters.get(key);
  const windowMs = policy.window.endsWith("h") ? 3_600_000 : policy.window.endsWith("m") ? 60_000 : 1_000;
  const entry = !current || current.reset <= now ? { count: 0, reset: now + windowMs } : current;
  entry.count += 1;
  developmentCounters.set(key, entry);
  if (entry.count > policy.requests) throw new CommandCenterError("RATE_LIMITED", { retryable: true });
  return { limit: policy.requests, remaining: Math.max(0, policy.requests - entry.count), reset: entry.reset };
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
  };
}

export function resetRateLimitsForTests(): void {
  developmentCounters.clear();
  distributedLimiters.clear();
}
