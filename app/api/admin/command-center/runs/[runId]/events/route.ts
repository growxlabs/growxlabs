import { resolveCommandCenterContext } from "@/lib/command-center/context/command-center-context";
import {
  ExecutionClient,
  type ExecutionEvent,
} from "@/lib/command-center/execution/execution-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ runId: string }> };

export async function GET(
  request: Request,
  routeContext: RouteContext,
): Promise<Response> {
  const context = await resolveCommandCenterContext({ req: request });
  const { runId } = await routeContext.params;
  const client = new ExecutionClient();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sequence = 0;
      try {
        for (let poll = 0; poll < 300 && !request.signal.aborted; poll += 1) {
          const events = await client.getEvents(
            runId,
            context.organizationId,
            context.workspaceId,
            context.requestId,
            sequence,
            request.signal,
          );
          for (const event of events) {
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
              sse("run_status", { runId, status: run.status }),
            ),
          );
          if (["succeeded", "failed", "cancelled"].includes(run.status)) break;
          await abortableDelay(1_000, request.signal);
        }
      } catch (error) {
        if (!request.signal.aborted) {
          controller.enqueue(
            encoder.encode(
              sse("error", {
                code: "EXECUTION_STREAM_FAILED",
                message:
                  error instanceof Error
                    ? error.message
                    : "Execution stream failed.",
              }),
            ),
          );
        }
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
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
    payload: event.payload,
    occurredAt: event.occurredAt,
  });
}

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
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
