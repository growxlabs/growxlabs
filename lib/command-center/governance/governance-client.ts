import "server-only";

import { signServiceJWT } from "@/lib/command-center/execution/service-jwt";

export interface GovernanceScope {
  organisationId: string;
  workspaceId: string;
  userId: string;
  requestId: string;
}

export class GovernanceClient {
  private readonly gatewayURL = requiredURL("INTERNAL_API_GATEWAY_URL");
  private readonly secret = required("EXECUTION_SERVICE_JWT_SECRET");
  private readonly environment = required("APP_ENV");

  async request(
    path: string,
    method: "GET" | "POST",
    scope: GovernanceScope,
    body?: unknown,
    query?: URLSearchParams,
    cron = false,
  ): Promise<Response> {
    const now = Math.floor(Date.now() / 1_000);
    const token = signServiceJWT(
      {
        iss: "gxl-web",
        aud: "internal-api-gateway",
        service: "gxl-web",
        env: this.environment,
        requestId: scope.requestId,
        iat: now,
        exp: now + 120,
      },
      this.secret,
    );
    const gateway = new URL(this.gatewayURL);
    if (query) gateway.search = query.toString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50_000);
    try {
      return await fetch(gateway, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Request-ID": scope.requestId,
          "X-Service-Name": "gxl-web",
          "X-GXL-Internal-Path": path,
          "X-GXL-Organisation-ID": scope.organisationId,
          "X-GXL-Workspace-ID": scope.workspaceId,
          "X-GXL-User-ID": scope.userId,
          ...(cron ? { "X-GXL-Cron-Authorised": "true" } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function requiredURL(name: string): string {
  const value = required(name);
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${name} must use HTTP or HTTPS.`);
  }
  return parsed.toString();
}
