import "server-only";

export function requiredHrmsGatewayURL(source: NodeJS.ProcessEnv = process.env): string {
  const raw = source.HRMS_GATEWAY_URL?.trim();
  if (!raw) throw new Error("HRMS_GATEWAY_URL is not configured");
  const gateway = new URL(raw);
  if (!["https:", "http:"].includes(gateway.protocol)) {
    throw new Error("HRMS_GATEWAY_URL must use HTTP or HTTPS");
  }
  const forbiddenOrigins = [source.NEXTAUTH_URL, source.NEXT_PUBLIC_SITE_URL]
    .filter((value): value is string => Boolean(value))
    .map((value) => {
      try { return new URL(value).origin; } catch { return ""; }
    });
  const publicHosts = new Set(["growxlabs.tech", "www.growxlabs.tech", "careers.growxlabs.tech"]);
  if (forbiddenOrigins.includes(gateway.origin) || publicHosts.has(gateway.hostname.toLowerCase())) {
    throw new Error("HRMS_GATEWAY_URL must not point to the public Next.js application");
  }
  gateway.pathname = gateway.pathname.replace(/\/+$/, "");
  return gateway.toString();
}
