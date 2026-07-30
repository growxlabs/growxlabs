import { NextResponse } from "next/server";
import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";
import { ProcessMessageBodySchema, GetConversationQuerySchema } from "@/lib/command-center/validation/api.schemas";
import { ConversationRepository } from "@/lib/command-center/conversations/conversation.repository";
import { MessageRepository } from "@/lib/command-center/messages/message.repository";
import { CommandOrchestrator } from "@/lib/command-center/orchestration/command-orchestrator";
import { StreamWriter } from "@/lib/command-center/streaming/stream-writer";
import { CommandCenterLogger } from "@/lib/command-center/logging/logger";
import { requireSameOrigin } from "@/lib/command-center/security/browser-request";
import { CommandCenterError, errorResponse, requestIdFrom } from "@/lib/command-center/production/errors";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/command-center/production/rate-limit";
import { completeSubmission, reserveSubmission } from "@/lib/command-center/production/submission-idempotency";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = requestIdFrom(req);
  try {
    const context = await resolveCommandCenterContext({ req });
    const limit = await enforceRateLimit("governance.read", req, context);
    const { searchParams } = new URL(req.url);
    const query = GetConversationQuerySchema.parse({
      conversationId: searchParams.get("conversationId") || undefined,
      limit: searchParams.get("limit") || undefined
    });

    if (query.conversationId) {
      const messages = await MessageRepository.listByConversationId(query.conversationId, context.organizationId, context.workspaceId);
      return NextResponse.json({ success: true, conversationId: query.conversationId, messages }, { headers: { ...rateLimitHeaders(limit), "Cache-Control": "private, no-store", "X-Request-ID": requestId } });
    }

    const conversations = await ConversationRepository.listRecent(context.organizationId, context.workspaceId, query.limit);
    return NextResponse.json({ success: true, conversations }, { headers: { ...rateLimitHeaders(limit), "Cache-Control": "private, no-store", "X-Request-ID": requestId } });
  } catch (error: unknown) {
    CommandCenterLogger.error("GET Command Center handler error", { requestId, route: "/api/admin/command-center", errorCode: "INTERNAL_ERROR" });
    return errorResponse(error, requestId);
  }
}

export async function POST(req: Request) {
  const requestId = requestIdFrom(req);
  try {
    requireSameOrigin(req);
    const context = await resolveCommandCenterContext({ req });
    const limit = await enforceRateLimit("conversation.submit", req, context);
    const json = await req.json();
    const parsed = ProcessMessageBodySchema.safeParse(json);
    if (!parsed.success) throw new CommandCenterError("VALIDATION_FAILED");
    const body = parsed.data;
    const idempotencyKey = req.headers.get("idempotency-key");
    await reserveSubmission(context, idempotencyKey, body);
    const baseUrl = new URL(req.url).origin;

    const stream = new ReadableStream({
      async start(controller) {
        const writer = new StreamWriter(controller);
        try {
          await CommandOrchestrator.handleRequest(
            body.message,
            body.history,
            body.attachments,
            body.conversationId,
            context,
            baseUrl,
            writer
          );
          await completeSubmission(context, idempotencyKey!, "succeeded");
        } catch {
          CommandCenterLogger.error("CommandOrchestrator streaming error", { requestId, route: "/api/admin/command-center", conversationId: body.conversationId, errorCode: "INTERNAL_ERROR" });
          writer.sendEvent("error", { code: "COMMAND_EXECUTION_FAILED", message: "The command could not be completed safely.", recoverable: true });
          writer.sendEvent("done", {});
          writer.close();
          await completeSubmission(context, idempotencyKey!, "failed").catch(() => undefined);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        "X-Request-ID": requestId,
        ...rateLimitHeaders(limit),
      }
    });
  } catch (error: unknown) {
    CommandCenterLogger.error("POST Command Center handler error", { requestId, route: "/api/admin/command-center", errorCode: error instanceof CommandCenterError ? error.code : "INTERNAL_ERROR" });
    return errorResponse(error, requestId);
  }
}
