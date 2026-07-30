export interface ParsedSSEEvent {
  event: string;
  data: unknown;
}

export function consumeSSEChunk(buffer: string, chunk: string): { events: ParsedSSEEvent[]; remainder: string } {
  const blocks = (buffer + chunk).replace(/\r\n/g, "\n").split("\n\n");
  const remainder = blocks.pop() ?? "";
  const events: ParsedSSEEvent[] = [];
  for (const block of blocks) {
    let event = "message";
    const data: string[] = [];
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
    }
    if (!data.length) continue;
    try {
      events.push({ event, data: JSON.parse(data.join("\n")) as unknown });
    } catch {
      events.push({ event: "error", data: { message: "The activity stream returned an invalid event." } });
    }
  }
  return { events, remainder };
}

export function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

export function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.slice(0, 4_000) : fallback;
}
