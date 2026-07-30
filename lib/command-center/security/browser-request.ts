import "server-only";
import { isSameOrigin } from "./origin";

export function requireSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!isSameOrigin(origin, host)) {
    throw new Error("Cross-origin request was rejected.");
  }
}
