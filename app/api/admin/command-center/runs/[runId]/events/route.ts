import {
  resolveCommandCenterContext,
  type CommandCenterContext,
} from "@/lib/command-center/context/command-center-context";
import {
  ExecutionClient,
  type ExecutionEvent,
} from "@/lib/command-center/execution/execution-client";
import { CommandCenterLogger } from "@/lib/command-center/logging/logger";
import { errorResponse, requestIdFrom } from "@/lib/command-center/production/errors";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/command-center/production/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ runId: string }> };

export async function GET(
  request: Request,
  routeContext: RouteContext,
): Promise<Response> {
  const requestId = requestIdFrom(request);
  let context: CommandCenterContext;
  try {
    context = await resolveCommandCenterContext({ req: request });
    const limit = await enforceRateLimit("sse.connect", request, context);
    const { runId } = await routeContext.params;
    const lastEventId = request.headers.get("last-event-id");
    const resumedSequence = lastEventId && /^\d+$/.test(lastEventId) ? Number(lastEventId) : 0;
    const started = Date.now();
  const client = new ExecutionClient();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sequence = resumedSequence;
      try {
        for (let poll = 0; poll < 45 && !request.signal.aborted; poll += 1) {
          const events = await client.getEvents(
            runId,
            context.organizationId,
            context.workspaceId,
            context.requestId,
            sequence,
            request.signal,
          );
          for (const event of events) {
            if (event.sequence <= sequence) continue;
            sequence = Math.max(sequence, event.sequence);
            controller.enqueue(
              encoder.encode(formatExecutionEvent(event)),
            );
          }
          const run = await client.getRun(
            runId,
            context.organizationId,
            context.workspaceId,
            context.requestId,
            request.signal,
          );
          controller.enqueue(
            encoder.encode(
              sse("run_status", { runId, status: run.status }, sequence),
            ),
          );
          if (["succeeded", "failed", "cancelled"].includes(run.status)) break;
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
          await abortableDelay(1_000, request.signal);
        }
      } catch {
        if (!request.signal.aborted) {
          controller.enqueue(
            encoder.encode(
              sse("error", {
                code: "EXECUTION_STREAM_FAILED",
                message: "Live execution updates are temporarily unavailable.",
              }),
            ),
          );
        }
      } finally {
        CommandCenterLogger.info("SSE connection closed", {
          requestId,
          route: "/api/admin/command-center/runs/[runId]/events",
          organizationId: context.organizationId,
          workspaceId: context.workspaceId,
          userId: context.userId,
          runId,
          durationMs: Date.now() - started,
          outcome: request.signal.aborted ? "disconnected" : "completed",
        });
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "X-Request-ID": requestId,
      ...rateLimitHeaders(limit),
    },
  });
  } catch (error) {
    return errorResponse(error, requestId);
  }
}

function formatExecutionEvent(event: ExecutionEvent): string {
  const names: Record<string, string> = {
    "step.started": "step_started",
    "step.succeeded": "step_succeeded",
    "step.failed": "step_failed",
    "run.cancelled": "run_cancelled",
  };
  return sse(names[event.type] ?? "run_status", {
    eventId: event.id,
    sequence: event.sequence,
    runId: event.runId,
    stepId: event.stepId,
    type: event.type,
    payload: redactEventPayload(event.payload),
    occurredAt: event.occurredAt,
  }, event.sequence);
}

function sse(event: string, data: unknown, id?: number): string {
  return `${id ? `id: ${id}\n` : ""}event: ${event}\nretry: 2000\ndata: ${JSON.stringify(data)}\n\n`;
}

function redactEventPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (/(password|token|secret|authorization|cookie|prompt|reasoning|raw.?payload)/i.test(key)) {
      safe[key] = "[REDACTED]";
    } else {
      safe[key] = value;
    }
  }
  return safe;
}

async function abortableDelay(
  milliseconds: number,
  signal: AbortSignal,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, milliseconds);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}
