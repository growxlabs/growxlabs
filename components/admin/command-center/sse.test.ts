import assert from "node:assert/strict";
import test from "node:test";
import { consumeSSEChunk, record, safeString } from "./sse.ts";

test("parses split SSE chunks without losing events", () => {
  const first = consumeSSEChunk("", "event: text_delta\ndata: {\"text\":\"hel");
  assert.equal(first.events.length, 0);
  const second = consumeSSEChunk(first.remainder, "lo\"}\n\nevent: done\ndata: {}\n\n");
  assert.deepEqual(second.events, [
    { event: "text_delta", data: { text: "hello" } },
    { event: "done", data: {} },
  ]);
});

test("converts malformed data to a safe error event", () => {
  const parsed = consumeSSEChunk("", "event: tool_result\ndata: not-json\n\n");
  assert.equal(parsed.events[0]?.event, "error");
});

test("safe helpers do not expose non-string payloads and bound text", () => {
  assert.deepEqual(record(null), {});
  assert.equal(safeString({ secret: "hidden" }, "safe"), "safe");
  assert.equal(safeString("x".repeat(5_000)).length, 4_000);
});
