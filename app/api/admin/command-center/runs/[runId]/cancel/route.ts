import { NextResponse } from "next/server";

import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";
import { ExecutionClient } from "@/lib/command-center/execution/execution-client";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ runId: string }> };

export async function POST(
  request: Request,
  routeContext: RouteContext,
): Promise<Response> {
  const context = await resolveCommandCenterContext({ req: request });
  const { runId } = await routeContext.params;
  await new ExecutionClient().cancelRun(
    runId,
    context.organizationId,
    context.workspaceId,
    context.requestId,
    request.signal,
  );
  return NextResponse.json({ success: true, runId }, { status: 202 });
}
