export interface ParsedSSEEvent {
  event: string;
  data: unknown;
  id?: string;
}

export function consumeSSEChunk(
  buffer: string,
  chunk: string,
): { events: ParsedSSEEvent[]; remainder: string } {
  const blocks = (buffer + chunk).replace(/\r\n/g, "\n").split("\n\n");
  const remainder = blocks.pop() ?? "";
  const events: ParsedSSEEvent[] = [];

  for (const block of blocks) {
    if (!block.trim() || block.trimStart().startsWith(":")) continue;

    let event = "message";
    let id: string | undefined;
    const data: string[] = [];

    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("id:")) id = line.slice(3).trim();
      else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
    }

    if (!data.length) continue;

    try {
      events.push({
        event,
        data: JSON.parse(data.join("\n")) as unknown,
        id,
      });
    } catch {
      events.push({
        event: "error",
        data: { message: "The activity stream returned an invalid event." },
        id,
      });
    }
  }

  return { events, remainder };
}

export function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.slice(0, 4_000) : fallback;
}

export function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Read a durable run event stream with Last-Event-ID resume support. */
export async function readRunEventStream(
  runId: string,
  options: {
    lastSequence?: number;
    signal?: AbortSignal;
    onEvent: (event: ParsedSSEEvent) => void;
  },
): Promise<void> {
  const headers: Record<string, string> = { Accept: "text/event-stream" };
  if (options.lastSequence && options.lastSequence > 0) {
    headers["Last-Event-ID"] = String(options.lastSequence);
  }

  const response = await fetch(
    `/api/admin/command-center/runs/${encodeURIComponent(runId)}/events`,
    { headers, cache: "no-store", signal: options.signal },
  );

  if (!response.ok || !response.body) {
    throw new Error("Live execution updates are temporarily unavailable.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const parsed = consumeSSEChunk(buffer, chunk);
    buffer = parsed.remainder;
    parsed.events.forEach(options.onEvent);
  }
}
