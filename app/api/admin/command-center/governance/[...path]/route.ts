import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { GovernanceClient } from "@/lib/command-center/governance/governance-client";
import { CommandCenterError, errorResponse, requestIdFrom } from "@/lib/command-center/production/errors";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/command-center/production/rate-limit";
import { isSameOrigin } from "@/lib/command-center/security/origin";

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
  const requestId = requestIdFrom(request);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return errorResponse(new CommandCenterError("AUTHENTICATION_REQUIRED"), requestId);
  const organisationId = session.user.organisation_id ?? process.env.DEFAULT_ORGANISATION_ID;
  const workspaceId = process.env.DEFAULT_WORKSPACE_ID;
  if (!organisationId || !workspaceId) {
    return errorResponse(new CommandCenterError("TENANT_SCOPE_INVALID"), requestId);
  }
  const key = (await context.params).path.join("/");
  const route = routes[key];
  if (!route) return errorResponse(new CommandCenterError("RESOURCE_NOT_FOUND"), requestId);
  if (!route.methods.has(request.method)) return errorResponse(new CommandCenterError("VALIDATION_FAILED", { status: 405 }), requestId);
  if (request.method !== "GET" && !isSameOrigin(request.headers.get("origin"), request.headers.get("x-forwarded-host") ?? request.headers.get("host"))) {
    return errorResponse(new CommandCenterError("PERMISSION_DENIED"), requestId);
  }
  let rateLimit;
  try {
    rateLimit = await enforceRateLimit(request.method === "GET" ? "governance.read" : "governance.mutate", request, {
      organizationId: organisationId,
      workspaceId,
      userId: session.user.id,
    });
  } catch (error) {
    return errorResponse(error, requestId);
  }
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
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "private, no-store",
        "X-Request-ID": requestId,
        ...rateLimitHeaders(rateLimit),
      },
    });
  } catch {
    return errorResponse(new CommandCenterError("DEPENDENCY_UNAVAILABLE"), requestId);
  }
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
