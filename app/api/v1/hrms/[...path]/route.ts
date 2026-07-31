import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";

const supported = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const isInvitationAcceptance =
    request.method === "POST" &&
    path[0] === "identity" &&
    path[1] === "invitations" &&
    path.length === 4 &&
    path[3] === "accept";
  const isPublicRecruitment = path[0] === "recruitment" && path[1] === "public";
  const isPublicOnboarding = path[0] === "onboarding" && path[1] === "public";
  const isPublicRequest = isInvitationAcceptance || isPublicRecruitment || isPublicOnboarding;
  const session = await getServerSession(authOptions);
  if (!session?.user && !isPublicRequest) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const base = process.env.HRMS_GATEWAY_URL;
  const gatewaySecret = process.env.HRMS_BFF_SHARED_SECRET;
  if (!base || (!gatewaySecret && !isPublicRequest)) {
    return Response.json(
      { error: "service_unavailable", message: "HRMS gateway configuration is incomplete. Set HRMS_GATEWAY_URL and HRMS_BFF_SHARED_SECRET in your environment." },
      { status: 503 },
    );
  }

  const upstream = new URL(`/v1/${path.join("/")}`, base);
  upstream.search = request.nextUrl.search;
  if (isPublicRequest) {
    const response = await fetch(upstream, {
      method: request.method,
      headers: { "Content-Type": request.headers.get("content-type") || "application/json", "X-Request-Id": crypto.randomUUID() },
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    return new Response(response.body, { status: response.status, headers: response.headers });
  }

  const user = session!.user as {
    id?: string;
    email?: string | null;
    organisation_id?: string;
    permissions?: string[];
  };
  const headers = new Headers();
  headers.set("Content-Type", request.headers.get("content-type") || "application/json");
  headers.set("X-Actor-Id", user.id || session!.user.email || "unknown");
  headers.set("X-Organisation-Id", user.organisation_id || process.env.DEFAULT_ORGANISATION_ID || "");
  headers.set("X-Request-Id", request.headers.get("x-request-id") || crypto.randomUUID());
  headers.set("X-HRMS-BFF-Token", gatewaySecret!);

  if (!headers.get("X-Organisation-Id")) {
    return Response.json({ error: "organisation_context_required" }, { status: 403 });
  }

  let permissions = user.permissions || [];
  if (permissions.length === 0) {
    const permissionURL = new URL(`/v1/identity/users/${encodeURIComponent(headers.get("X-Actor-Id")!)}/permissions`, base);
    const permissionResponse = await fetch(permissionURL, { headers, cache: "no-store", signal: AbortSignal.timeout(5_000) });
    if (!permissionResponse.ok) {
      return Response.json({ error: "permission_resolution_failed" }, { status: 403 });
    }
    const resolved = await permissionResponse.json() as { status?: string; permissions?: string[] };
    if (resolved.status !== "active") return Response.json({ error: "account_inactive" }, { status: 403 });
    permissions = resolved.permissions || [];
  }
  headers.set("X-Permissions", permissions.join(","));

  const response = await fetch(upstream, {
    method: request.method,
    headers,
    body: request.method === "GET" ? undefined : await request.arrayBuffer(),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  return new Response(response.body, { status: response.status, headers: response.headers });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
export const dynamic = "force-dynamic";
void supported;
