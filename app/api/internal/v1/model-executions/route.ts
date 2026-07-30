import { NextResponse } from "next/server";

import { GeminiProvider } from "@/lib/command-center/models/gemini.provider";
import { OpenRouterProvider } from "@/lib/command-center/models/openrouter.provider";
import { verifyServiceJWT } from "@/lib/command-center/execution/service-jwt";
import { WorkerExecutionRequestSchema } from "@/lib/command-center/execution/worker-request.schema";
import { authoriseWorkerRequest } from "@/lib/command-center/execution/authorise-worker-request";
import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";
import { CommandCenterError, errorResponse, requestIdFrom } from "@/lib/command-center/production/errors";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/command-center/production/rate-limit";
import { withConcurrencyLimit } from "@/lib/command-center/production/concurrency";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const requestId = requestIdFrom(request);
  try {
    authenticate(request);
    const execution = WorkerExecutionRequestSchema.parse(await request.json());
    authoriseWorkerRequest(execution);
    const authoritativeContext = await resolveCommandCenterContext({
      req: request,
      customOrgId: execution.organisationId,
      customWorkspaceId: execution.workspaceId,
      customUserId: execution.userId,
      customPermissions: execution.requiredPermissions,
      internalServiceAuthenticated: true,
    });
    if (
      authoritativeContext.userId !== execution.userId ||
      execution.requiredPermissions.some(
        (permission) =>
          !authoritativeContext.permissions.includes(permission),
      )
    ) {
      throw new Error("Authoritative user scope or permissions do not match.");
    }
    const rateLimit = await enforceRateLimit("model.execute", request, authoritativeContext);
    const prompt = modelPrompt(execution.input);
    if (GeminiProvider.isConfigured()) {
      const response = await withConcurrencyLimit("model.execute", 4, () =>
        withTimeout(GeminiProvider.getModel().generateContent(prompt), 30_000));
      return NextResponse.json({
        result: { text: response.response.text(), provider: "gemini" },
      }, { headers: { ...rateLimitHeaders(rateLimit), "X-Request-ID": requestId } });
    }
    if (OpenRouterProvider.isConfigured()) {
      const response = await withConcurrencyLimit("model.execute", 4, () => withTimeout(OpenRouterProvider.getClient().chat.completions.create({
        model: "anthropic/claude-3.5-sonnet",
        messages: [{ role: "user", content: prompt }],
      }), 30_000));
      return NextResponse.json({
        result: {
          text: response.choices[0]?.message.content ?? "",
          provider: "openrouter",
        },
      }, { headers: { ...rateLimitHeaders(rateLimit), "X-Request-ID": requestId } });
    }
    throw new CommandCenterError("MODEL_FAILURE", { message: "No model provider is configured.", retryable: false });
  } catch (error) {
    return errorResponse(error, requestId);
  }
}

function modelPrompt(input: Record<string, unknown>): string {
  const prompt = input.prompt;
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 100_000) {
    throw new Error("A bounded model prompt is required.");
  }
  return prompt;
}

function authenticate(request: Request): void {
  const secret = process.env.EXECUTION_SERVICE_JWT_SECRET;
  const environment = process.env.APP_ENV;
  if (!secret || !environment) throw new Error("Execution authentication is not configured.");
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Service authentication is required.");
  verifyServiceJWT(token, {
    issuer: "execution-worker",
    audience: "gxl-web",
    environment,
    secret,
  });
}

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new CommandCenterError("TIMEOUT", { retryable: true })), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
