import { NextResponse } from "next/server";

import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";
import { ExecutionClient } from "@/lib/command-center/execution/execution-client";
import { requireSameOrigin } from "@/lib/command-center/security/browser-request";
import { errorResponse, requestIdFrom } from "@/lib/command-center/production/errors";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/command-center/production/rate-limit";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ runId: string }> };

export async function POST(
  request: Request,
  routeContext: RouteContext,
): Promise<Response> {
  const requestId = requestIdFrom(request);
  try {
    requireSameOrigin(request);
    const context = await resolveCommandCenterContext({ req: request });
    const limit = await enforceRateLimit("governance.mutate", request, context);
    const { runId } = await routeContext.params;
    await new ExecutionClient().cancelRun(runId, context.organizationId, context.workspaceId, context.requestId, request.signal);
    return NextResponse.json({ success: true, runId }, { status: 202, headers: { ...rateLimitHeaders(limit), "X-Request-ID": requestId } });
  } catch (error) {
    return errorResponse(error, requestId);
  }
}
