import "server-only";

import { GovernanceClient } from "./governance-client";

export async function runGovernanceCron(request: Request, path: string): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "cron_forbidden" }, { status: 403 });
  }
  const requestId = request.headers.get("x-vercel-id") ?? crypto.randomUUID();
  const organisationId = process.env.DEFAULT_ORGANISATION_ID;
  const workspaceId = process.env.DEFAULT_WORKSPACE_ID;
  if (!organisationId || !workspaceId) {
    return Response.json({ error: "cron_scope_unavailable", requestId }, { status: 503 });
  }
  try {
    const upstream = await new GovernanceClient().request(
      path,
      "POST",
      { organisationId, workspaceId, userId: "vercel-cron", requestId },
      undefined,
      new URLSearchParams({ limit: "100" }),
      true,
    );
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json", "X-Request-ID": requestId },
    });
  } catch {
    return Response.json({ error: "governance_unavailable", requestId }, { status: 503 });
  }
}
