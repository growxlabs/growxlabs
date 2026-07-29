import { NextResponse } from "next/server";
import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";
import { ProcessMessageBodySchema, GetConversationQuerySchema } from "@/lib/command-center/validation/api.schemas";
import { ConversationRepository } from "@/lib/command-center/conversations/conversation.repository";
import { MessageRepository } from "@/lib/command-center/messages/message.repository";
import { LegacyCommandProcessor } from "@/lib/command-center/command-processing-adapter";
import { StreamWriter } from "@/lib/command-center/streaming/stream-writer";
import { CommandCenterLogger } from "@/lib/command-center/logging/logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const context = await resolveCommandCenterContext({ req });
    const { searchParams } = new URL(req.url);
    const query = GetConversationQuerySchema.parse({
      conversationId: searchParams.get("conversationId") || undefined,
      limit: searchParams.get("limit") || undefined
    });

    if (query.conversationId) {
      const messages = await MessageRepository.listByConversationId(query.conversationId);
      return NextResponse.json({ success: true, conversationId: query.conversationId, messages });
    }

    const conversations = await ConversationRepository.listRecent(query.limit);
    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    CommandCenterLogger.error("GET Command Center handler error", { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveCommandCenterContext({ req });
    const json = await req.json();
    const body = ProcessMessageBodySchema.parse(json);
    const origin = req.headers.get("origin") || req.headers.get("host") || "";
    const protocol = origin.startsWith("http") ? "" : "https://";
    const baseUrl = origin ? `${protocol}${origin}` : "";

    const stream = new ReadableStream({
      async start(controller) {
        const writer = new StreamWriter(controller);
        try {
          await LegacyCommandProcessor.processStream(
            body.message,
            body.history,
            body.attachments,
            body.conversationId,
            context,
            baseUrl,
            writer
          );
        } catch (err: any) {
          CommandCenterLogger.error("Streaming execution error", { error: err.message });
          writer.sendEvent("text_delta", { text: `\n\n[Error: ${err.message}]` });
          writer.sendEvent("done", {});
          writer.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive"
      }
    });
  } catch (error: any) {
    CommandCenterLogger.error("POST Command Center handler error", { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
