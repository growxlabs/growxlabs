import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";

const PUBLIC_PREFIXES = [
  "identity/invitations",
  "recruitment/public",
  "onboarding/public",
] as const;

function apiError(status: number, code: string, message: string, requestId: string) {
  return Response.json(
    { error: { code, message, request_id: requestId } },
    { status, headers: { "X-Request-Id": requestId } },
  );
}

function requiredServerEnv(name: "HRMS_GATEWAY_URL" | "HRMS_BFF_SHARED_SECRET") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function isPublicPath(path: string[], method: string) {
  const joined = path.join("/");
  if (joined.startsWith("identity/invitations/") && joined.endsWith("/accept")) {
    return method === "POST";
  }
  return PUBLIC_PREFIXES.slice(1).some((prefix) => joined.startsWith(prefix));
}

function upstreamErrorCode(status: number) {
  if (status === 401) return "UNAUTHENTICATED";
  if (status === 403) return "FORBIDDEN";
  if (status === 504) return "GATEWAY_TIMEOUT";
  return "PEOPLE_SERVICE_UNAVAILABLE";
}

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const { path } = await context.params;
  const publicRequest = isPublicPath(path, request.method);

  let base: string;
  let gatewaySecret: string;
  try {
    base = requiredServerEnv("HRMS_GATEWAY_URL");
    gatewaySecret = publicRequest ? "" : requiredServerEnv("HRMS_BFF_SHARED_SECRET");
  } catch (error) {
    console.error(JSON.stringify({ request_id: requestId, route: request.nextUrl.pathname, error: String(error) }));
    return apiError(503, "PEOPLE_SERVICE_UNAVAILABLE", "The HRMS gateway is not configured.", requestId);
  }

  const session = await getServerSession(authOptions);
  if (!publicRequest && !session?.user?.id) {
    return apiError(401, "UNAUTHENTICATED", "Your session has expired. Sign in again.", requestId);
  }

  const upstream = new URL(`/v1/${path.map(encodeURIComponent).join("/")}`, base.replace(/\/$/, ""));
  upstream.search = request.nextUrl.search;
  const headers = new Headers({
    Accept: request.headers.get("accept") || "application/json",
    "Content-Type": request.headers.get("content-type") || "application/json",
    "X-Request-Id": requestId,
    "X-Correlation-Id": request.headers.get("x-correlation-id") || requestId,
  });

  if (!publicRequest) {
    const organisationId = session!.user.organisation_id?.trim();
    if (!organisationId || organisationId === "org_default") {
      return apiError(403, "ORGANISATION_CONTEXT_MISSING", "No organisation is assigned to this session.", requestId);
    }
    headers.set("X-Actor-Id", session!.user.id);
    headers.set("X-Organisation-Id", organisationId);
    headers.set("X-HRMS-BFF-Token", gatewaySecret);
    const cookie = request.headers.get("cookie");
    const authorization = request.headers.get("authorization");
    if (cookie) headers.set("Cookie", cookie);
    if (authorization) headers.set("Authorization", authorization);

    let permissions = session!.user.permissions || [];
    if (permissions.length === 0) {
      try {
        const permissionURL = new URL(`/v1/identity/users/${encodeURIComponent(session!.user.id)}/permissions`, base.replace(/\/$/, ""));
        const permissionResponse = await fetch(permissionURL, {
          headers,
          cache: "no-store",
          signal: AbortSignal.timeout(5_000),
        });
        if (permissionResponse.ok) {
          const resolved = await permissionResponse.json() as { permissions?: string[] };
          permissions = resolved.permissions || [];
        }
      } catch (error) {
        console.error(JSON.stringify({ request_id: requestId, route: "identity/permissions", error: String(error) }));
      }
    }
    headers.set("X-Permissions", permissions.join(","));
  }

  const startedAt = Date.now();
  try {
    const response = await fetch(upstream, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    console.info(JSON.stringify({
      request_id: requestId,
      route: request.nextUrl.pathname,
      method: request.method,
      status: response.status,
      latency_ms: Date.now() - startedAt,
    }));
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("X-Request-Id", response.headers.get("x-request-id") || requestId);
    responseHeaders.set("Cache-Control", "no-store");
    return new Response(response.body, { status: response.status, headers: responseHeaders });
  } catch (error) {
    const timeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    console.error(JSON.stringify({
      request_id: requestId,
      route: request.nextUrl.pathname,
      method: request.method,
      status: timeout ? 504 : 503,
      latency_ms: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    }));
    const status = timeout ? 504 : 503;
    return apiError(
      status,
      upstreamErrorCode(status),
      timeout ? "The HRMS gateway timed out." : "The People service is unavailable.",
      requestId,
    );
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
export const dynamic = "force-dynamic";
