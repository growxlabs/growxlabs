import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { GovernanceClient } from "@/lib/command-center/governance/governance-client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const routes: Record<string, { internal: string; methods: ReadonlySet<string> }> = {
  "approvals/list": { internal: "/internal/v1/governance/approvals/list", methods: new Set(["GET"]) },
  "approvals/get": { internal: "/internal/v1/governance/approvals/get", methods: new Set(["GET"]) },
  "approvals/decide": { internal: "/internal/v1/governance/approvals/decide", methods: new Set(["POST"]) },
  "approvals/revoke": { internal: "/internal/v1/governance/approvals/revoke", methods: new Set(["POST"]) },
  "policy/simulate": { internal: "/internal/v1/governance/policy/simulate", methods: new Set(["POST"]) },
  "audit/query": { internal: "/internal/v1/governance/audit/query", methods: new Set(["GET"]) },
  "audit/verify": { internal: "/internal/v1/governance/audit/verify", methods: new Set(["GET"]) },
};

interface GovernanceRouteContext {
  params: Promise<{ path: string[] }>;
}

async function handle(request: Request, context: GovernanceRouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const organisationId = session.user.organisation_id ?? process.env.DEFAULT_ORGANISATION_ID;
  const workspaceId = process.env.DEFAULT_WORKSPACE_ID;
  if (!organisationId || !workspaceId) {
    return Response.json({ error: "trusted_scope_unavailable" }, { status: 503 });
  }
  const key = (await context.params).path.join("/");
  const route = routes[key];
  if (!route) return Response.json({ error: "route_not_found" }, { status: 404 });
  if (!route.methods.has(request.method)) return Response.json({ error: "method_not_allowed" }, { status: 405 });
  if (request.method !== "GET" && !sameOrigin(request)) {
    return Response.json({ error: "csrf_validation_failed" }, { status: 403 });
  }
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const body = request.method === "GET" ? undefined : await boundedJSON(request);
  if (body instanceof Response) return body;
  try {
    const upstream = await new GovernanceClient().request(
      route.internal,
      request.method as "GET" | "POST",
      { organisationId, workspaceId, userId: session.user.id, requestId },
      body,
      new URL(request.url).searchParams,
    );
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json", "X-Request-ID": requestId },
    });
  } catch {
    return Response.json({ error: "governance_unavailable", requestId }, { status: 503 });
  }
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return new URL(origin).host === new URL(request.url).host;
}

async function boundedJSON(request: Request): Promise<unknown | Response> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 1_048_576) return Response.json({ error: "payload_too_large" }, { status: 413 });
  try {
    return await request.json() as unknown;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
}

export const GET = handle;
export const POST = handle;
