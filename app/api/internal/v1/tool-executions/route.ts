import { NextResponse } from "next/server";

import { ToolRegistry } from "@/lib/command-center/tools/registry/tool-registry";
import { verifyServiceJWT } from "@/lib/command-center/execution/service-jwt";
import { WorkerExecutionRequestSchema } from "@/lib/command-center/execution/worker-request.schema";
import { authoriseWorkerRequest } from "@/lib/command-center/execution/authorise-worker-request";
import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  try {
    authenticate(request);
    const execution = WorkerExecutionRequestSchema.parse(await request.json());
    authoriseWorkerRequest(execution);
    const authoritativeContext = await resolveCommandCenterContext({
      req: request,
      customOrgId: execution.organisationId,
      customWorkspaceId: execution.workspaceId,
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
      return errorResponse(400, "UNKNOWN_TOOL", "Registered tool is required.");
    }
    const result = await ToolRegistry.executeTool(
      execution.toolId,
      execution.input,
      {
        commandContext: {
          ...authoritativeContext,
          requestId: execution.requestId,
        },
        baseUrl: new URL(request.url).origin,
      },
    );
    return NextResponse.json({ result });
  } catch (error) {
    return errorResponse(
      403,
      "EXECUTION_REJECTED",
      error instanceof Error ? error.message : "Execution was rejected.",
    );
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

function errorResponse(status: number, code: string, message: string): Response {
  return NextResponse.json({ error: { code, message } }, { status });
}
