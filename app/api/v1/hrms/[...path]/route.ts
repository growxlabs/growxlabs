import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { requiredHrmsGatewayURL } from "@/lib/hrms/gateway";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CAREERS_ORGANISATION } from "@/lib/careers/jobs";
import { z } from "zod";

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

function requiredServerEnv(name: "HRMS_BFF_SHARED_SECRET") {
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

const referenceCreateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  code: z.string().trim().min(1).max(50).transform(value => value.toUpperCase()),
  description: z.string().trim().max(1000).optional(),
  level: z.number().int().min(1).max(100).optional(),
});
const referenceStatusSchema = z.object({ status: z.enum(["active", "inactive", "archived"]) });

async function handleVercelPeopleReferences(request: NextRequest, path: string[], requestId: string) {
  if (path[0] !== "people" || !["departments", "designations"].includes(path[1] || "")) return null;
  const entity = path[1] as "departments" | "designations";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError(401, "UNAUTHENTICATED", "Your session has expired. Sign in again.", requestId);
  if (!["ADMIN", "CO_ADMIN", "HR"].includes(String(session.user.role).toUpperCase())) return apiError(403, "FORBIDDEN", "People administration access is required.", requestId);
  const organisationId = CAREERS_ORGANISATION;
  if (!z.uuid().safeParse(organisationId).success) return apiError(503, "ORGANISATION_CONTEXT_MISSING", "The organisation is not configured.", requestId);
  const db = supabaseAdmin.schema("people").from(entity);

  if (request.method === "GET" && path.length === 2) {
    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("pageSize")) || 50));
    let query = db.select("*", { count: "exact" }).eq("organisation_id", organisationId).is("deleted_at", null).order("name").range((page - 1) * pageSize, page * pageSize - 1);
    const status = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("q")?.trim();
    if (["active", "inactive", "archived"].includes(status || "")) query = query.eq("status", status!);
    if (search) query = query.or(`name.ilike.%${search.replace(/[%_,()]/g, "") }%,code.ilike.%${search.replace(/[%_,()]/g, "")}%`);
    const { data, error, count } = await query;
    if (error) { console.error(JSON.stringify({ request_id: requestId, route: request.nextUrl.pathname, code: error.code })); return apiError(500, "PEOPLE_REFERENCE_READ_FAILED", "Departments and designations could not be loaded.", requestId); }
    return Response.json({ items: data || [], total: count || 0 }, { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } });
  }

  if (request.method === "POST" && path.length === 2) {
    const parsed = referenceCreateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return apiError(400, "INVALID_REFERENCE", "A valid name and code are required.", requestId);
    const payload = { organisation_id: organisationId, name: parsed.data.name, code: parsed.data.code, status: "active", ...(parsed.data.description ? { description: parsed.data.description } : {}), ...(entity === "designations" && parsed.data.level ? { level: parsed.data.level } : {}) };
    const { data, error } = await db.insert(payload).select("*").single();
    if (error) { const duplicate = error.code === "23505"; return apiError(duplicate ? 409 : 500, duplicate ? "REFERENCE_CODE_EXISTS" : "PEOPLE_REFERENCE_CREATE_FAILED", duplicate ? "That code already exists." : "The record could not be created.", requestId); }
    return Response.json(data, { status: 201, headers: { "X-Request-Id": requestId } });
  }

  if (request.method === "PATCH" && path.length === 4 && path[3] === "status" && z.uuid().safeParse(path[2]).success) {
    const parsed = referenceStatusSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return apiError(400, "INVALID_STATUS", "A valid status is required.", requestId);
    const version = Number(request.headers.get("if-match")?.replaceAll('"', ""));
    let query = db.update({ status: parsed.data.status, deleted_at: parsed.data.status === "archived" ? new Date().toISOString() : null }).eq("id", path[2]).eq("organisation_id", organisationId);
    if (Number.isInteger(version)) query = query.eq("version", version);
    const { data, error } = await query.select("*").maybeSingle();
    if (error) return apiError(500, "PEOPLE_REFERENCE_UPDATE_FAILED", "The status could not be saved.", requestId);
    if (!data) return apiError(409, "REFERENCE_VERSION_CONFLICT", "This record changed. Refresh and try again.", requestId);
    return Response.json(data, { headers: { "X-Request-Id": requestId } });
  }
  return apiError(404, "NOT_FOUND", "People reference route not found.", requestId);
}

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const { path } = await context.params;
  const localPeopleResponse = await handleVercelPeopleReferences(request, path, requestId);
  if (localPeopleResponse) return localPeopleResponse;
  const publicRequest = isPublicPath(path, request.method);

  let base: string;
  let gatewaySecret: string;
  try {
    base = requiredHrmsGatewayURL();
    gatewaySecret = publicRequest ? "" : requiredServerEnv("HRMS_BFF_SHARED_SECRET");
  } catch (error) {
    console.error(JSON.stringify({ request_id: requestId, route: request.nextUrl.pathname, error: String(error) }));
    return apiError(503, "PEOPLE_SERVICE_UNAVAILABLE", "The HRMS gateway is not configured.", requestId);
  }

  const session = await getServerSession(authOptions);
  if (!publicRequest && !session?.user?.id) {
    return apiError(401, "UNAUTHENTICATED", "Your session has expired. Sign in again.", requestId);
  }
  if (!publicRequest && session?.user?.role === "CANDIDATE") {
    return apiError(403, "FORBIDDEN", "Candidate accounts cannot access internal HRMS services.", requestId);
  }

  const upstream = new URL(`/v1/${path.map(encodeURIComponent).join("/")}`, base.replace(/\/$/, ""));
  upstream.search = request.nextUrl.search;
  if (publicRequest && path[0] === "recruitment") {
    const publicOrganisationId = process.env.DEFAULT_ORGANISATION_ID?.trim();
    if (!publicOrganisationId || publicOrganisationId === "org_default") {
      return apiError(503, "ORGANISATION_CONTEXT_MISSING", "The careers organisation is not configured.", requestId);
    }
    upstream.searchParams.set("organisationId", publicOrganisationId);
  }
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
    if(publicRequest&&response.ok&&path[0]==="identity"&&path[1]==="invitations"&&path.at(-1)==="accept"){
      const payload=await response.json() as {userId?:string;status?:string};
      if(payload.userId){const activated=await supabaseAdmin.schema("identity").from("employee_identities").update({workspace_status:"active",provisioning_error:null,provisioned_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("auth_user_id",payload.userId).neq("workspace_status","suspended").select("id,organisation_id").maybeSingle();if(activated.data)await supabaseAdmin.schema("audit").from("events").insert({organisation_id:activated.data.organisation_id,actor_user_id:payload.userId,entity_type:"employee_identity",entity_id:activated.data.id,action:"workspace_activated",new_value:{source:"employee_activation"},request_id:requestId})}
      return Response.json(payload,{status:response.status,headers:responseHeaders});
    }
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
