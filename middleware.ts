import { NextRequest, NextResponse } from "next/server";

/**
 * Subdomain-based routing middleware.
 * Rewrites `careers.<domain>/` → `/careers` so the (careers) route group activates.
 * All other subdomains (www, naked domain) pass through unchanged.
 */
export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // Strip port for local development (e.g. careers.localhost:3000 → careers.localhost)
  const host = hostname.split(":")[0];

  // Detect careers subdomain (careers.localhost, careers.growxlabs.tech, etc.)
  if (host.startsWith("careers.")) {
    const { pathname, search } = request.nextUrl;

    // If already on /careers path, pass through
    if (pathname.startsWith("/careers")) {
      return NextResponse.next();
    }

    // Skip API routes, static assets, and Next.js internals
    if (
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/favicon") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    // Rewrite root and all other paths to /careers prefix
    const url = request.nextUrl.clone();
    url.pathname = `/careers${pathname === "/" ? "" : pathname}`;
    url.search = search;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icon.svg
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg).*)",
  ],
};
