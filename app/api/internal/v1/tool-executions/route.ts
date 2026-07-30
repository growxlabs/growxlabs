import { NextResponse } from "next/server";

import { ToolRegistry } from "@/lib/command-center/tools/registry/tool-registry";
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
      authoritativeContext.organizationId !== execution.organisationId ||
      authoritativeContext.workspaceId !== execution.workspaceId ||
      execution.requiredPermissions.some(
        (permission) =>
          !authoritativeContext.permissions.includes(permission),
      )
    ) {
      throw new Error("Authoritative user scope or permissions do not match.");
    }
    if (!execution.toolId || !ToolRegistry.has(execution.toolId)) {
      throw new CommandCenterError("VALIDATION_FAILED", { message: "Registered tool is required." });
    }
    const toolId = execution.toolId;
    const rateLimit = await enforceRateLimit("tool.execute", request, authoritativeContext);
    const result = await withConcurrencyLimit("tool.execute", 8, () => withTimeout(ToolRegistry.executeTool(
      toolId,
      execution.input,
      {
        commandContext: {
          ...authoritativeContext,
          requestId: execution.requestId,
        },
        baseUrl: new URL(request.url).origin,
      },
    ), 30_000));
    return NextResponse.json({ result }, { headers: { ...rateLimitHeaders(rateLimit), "X-Request-ID": requestId } });
  } catch (error) {
    return errorResponse(error, requestId);
  }
}

function authenticate(request: Request): void {
  const secret = process.env.EXECUTION_SERVICE_JWT_SECRET;
  const environment = process.env.APP_ENV;
  if (!secret || !environment) throw new Error("Execution authentication is not configured.");
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Service authentication is required.");
  const issuers = ["tool-service", "execution-worker"] as const;
  const authenticated = issuers.some((issuer) => {
    try {
      const claims = verifyServiceJWT(token, {
        issuer,
        audience: "gxl-web",
        environment,
        secret,
      });
      return claims.service === issuer;
    } catch {
      return false;
    }
  });
  if (!authenticated) throw new Error("Service identity is not permitted.");
}

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  if (timeoutMs <= 0) throw new CommandCenterError("TIMEOUT", { retryable: false });
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
