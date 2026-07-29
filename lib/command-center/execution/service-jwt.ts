import { createHmac, timingSafeEqual } from "node:crypto";

export interface ServiceJWTClaims {
  iss: string;
  aud: string;
  service: string;
  env: string;
  requestId: string;
  iat: number;
  exp: number;
}

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export function signServiceJWT(
  claims: ServiceJWTClaims,
  secret: string,
): string {
  if (!secret) throw new Error("Execution service JWT secret is required.");
  const unsigned = `${encode({ alg: "HS256", typ: "JWT" })}.${encode(claims)}`;
  const signature = createHmac("sha256", secret)
    .update(unsigned)
    .digest("base64url");
  return `${unsigned}.${signature}`;
}

export function verifyServiceJWT(
  token: string,
  expected: {
    issuer: string;
    audience: string;
    environment: string;
    secret: string;
    now?: number;
  },
): ServiceJWTClaims {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid service token.");
  const unsigned = `${parts[0]}.${parts[1]}`;
  const actual = Buffer.from(parts[2], "base64url");
  const wanted = createHmac("sha256", expected.secret)
    .update(unsigned)
    .digest();
  if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) {
    throw new Error("Invalid service token signature.");
  }
  const parsed: unknown = JSON.parse(
    Buffer.from(parts[1], "base64url").toString("utf8"),
  );
  if (!isServiceClaims(parsed)) throw new Error("Invalid service token claims.");
  const now = expected.now ?? Math.floor(Date.now() / 1000);
  if (
    parsed.iss !== expected.issuer ||
    parsed.aud !== expected.audience ||
    parsed.env !== expected.environment ||
    parsed.exp <= now ||
    parsed.iat > now + 30 ||
    parsed.exp - parsed.iat > 300
  ) {
    throw new Error("Service token scope or lifetime is invalid.");
  }
  return parsed;
}

function isServiceClaims(value: unknown): value is ServiceJWTClaims {
  if (!value || typeof value !== "object") return false;
  const claims = value as Record<string, unknown>;
  return (
    typeof claims.iss === "string" &&
    typeof claims.aud === "string" &&
    typeof claims.service === "string" &&
    typeof claims.env === "string" &&
    typeof claims.requestId === "string" &&
    typeof claims.iat === "number" &&
    typeof claims.exp === "number"
  );
}
