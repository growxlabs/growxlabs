import { NextResponse } from "next/server";
import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";
import { NotificationService } from "@/lib/command-center/notifications/notification-service";
import { requireSameOrigin } from "@/lib/command-center/security/browser-request";
import { CommandCenterError, errorResponse, requestIdFrom } from "@/lib/command-center/production/errors";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/command-center/production/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = requestIdFrom(req);
  try {
    const context = await resolveCommandCenterContext({ req });
    const limit = await enforceRateLimit("governance.read", req, context);
    const [notifications, preferences] = await Promise.all([
      NotificationService.listForUser(context.userId, context.organizationId, context.workspaceId),
      NotificationService.getPreferences(context.userId, context.organizationId, context.workspaceId),
    ]);
    return NextResponse.json({ success: true, notifications, preferences }, { headers: { ...rateLimitHeaders(limit), "Cache-Control": "private, no-store", "X-Request-ID": requestId } });
  } catch (error: unknown) {
    return errorResponse(error, requestId);
  }
}

export async function POST(req: Request) {
  const requestId = requestIdFrom(req);
  try {
    requireSameOrigin(req);
    const context = await resolveCommandCenterContext({ req });
    const limit = await enforceRateLimit("notification.mutate", req, context);
    const body = await req.json() as unknown;
    if (!body || typeof body !== "object") throw new CommandCenterError("VALIDATION_FAILED");
    const value = body as Record<string, unknown>;
    const action = typeof value.action === "string" ? value.action : "read";
    const notificationId = typeof value.notificationId === "string" ? value.notificationId : "";
    if (action === "read_all") return NextResponse.json({ success: true, updated: await NotificationService.markAllRead(context.userId, context.organizationId, context.workspaceId) }, { headers: { ...rateLimitHeaders(limit), "X-Request-ID": requestId } });
    if (action === "preferences") {
      const preferences = value.preferences && typeof value.preferences === "object" ? value.preferences as Record<string, unknown> : {};
      return NextResponse.json({ success: true, preferences: await NotificationService.updatePreferences(context.userId, context.organizationId, context.workspaceId, {
        info: preferences.info !== false, success: preferences.success !== false, warning: preferences.warning !== false,
      }) }, { headers: { ...rateLimitHeaders(limit), "X-Request-ID": requestId } });
    }
    if (!notificationId) throw new CommandCenterError("VALIDATION_FAILED");
    const ok = action === "archive"
      ? await NotificationService.archive(notificationId, context.userId, context.organizationId, context.workspaceId)
      : await NotificationService.markRead(notificationId, context.userId, context.organizationId, context.workspaceId);
    if (!ok) throw new CommandCenterError("RESOURCE_NOT_FOUND");
    return NextResponse.json({ success: true }, { headers: { ...rateLimitHeaders(limit), "X-Request-ID": requestId } });
  } catch (error: unknown) {
    return errorResponse(error, requestId);
  }
}
