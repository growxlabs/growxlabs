import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Known legacy i18n locale prefixes to strip & 301 redirect for Googlebot & incoming traffic
const LEGACY_LOCALES = [
  "en-IN", "en-US", "en-GB", "en", "es", "de", "fr", "hi", "ja", "zh", "pt", "it", "ru", "ar", "ko"
];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const requestId = validRequestId(request.headers.get("x-request-id")) ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  requestHeaders.set("x-trace-id", validRequestId(request.headers.get("x-trace-id")) ?? requestId);

  // 1. Subdomain routing for careers.growxlabs.tech
  const isCareersSubdomain = hostname.startsWith("careers.growxlabs.tech") || hostname.startsWith("careers.localhost");
  if (isCareersSubdomain) {
    if (
      !pathname.startsWith("/careers") &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/_next") &&
      !pathname.startsWith("/login") &&
      !pathname.startsWith("/auth")
    ) {
      const cleanPath = `/careers${pathname === "/" ? "" : pathname}`;
      const rewriteUrl = new URL(cleanPath + search, request.url);
      return secureResponse(NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } }), requestId);
    }
  }

  // 2. Intercept legacy i18n locale paths (e.g. /en-IN/blog/slug, /en/services, /en-IN)
  const segments = pathname.split("/");
  const firstSegment = segments[1];

  if (firstSegment && LEGACY_LOCALES.includes(firstSegment)) {
    // Strip locale segment (e.g. /en-IN/blog/slug -> /blog/slug)
    const cleanPath = "/" + segments.slice(2).join("/");
    const targetUrl = new URL((cleanPath || "/") + search, request.url);
    
    // Return HTTP 301 Moved Permanently for Googlebot & Search Engines to transfer PageRank
    return secureResponse(NextResponse.redirect(targetUrl, 301), requestId);
  }

  return secureResponse(NextResponse.next({ request: { headers: requestHeaders } }), requestId);
}

function validRequestId(value: string | null): string | null {
  return value && /^[A-Za-z0-9._:-]{8,128}$/.test(value) ? value : null;
}

function secureResponse(response: NextResponse, requestId: string): NextResponse {
  response.headers.set("x-request-id", requestId);
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  response.headers.set("Content-Security-Policy", contentSecurityPolicy());
  return response;
}

function contentSecurityPolicy(): string {
  const developmentEval = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${developmentEval} https://www.googletagmanager.com https://www.google-analytics.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https: wss:",
    "media-src 'self' blob: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
};
