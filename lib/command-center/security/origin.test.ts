import assert from "node:assert/strict";
import test from "node:test";
import { isSameOrigin } from "./origin.ts";

test("accepts exact browser origin and rejects cross-origin or malformed requests", () => {
  assert.equal(isSameOrigin("https://app.example.com", "app.example.com"), true);
  assert.equal(isSameOrigin("https://evil.example.com", "app.example.com"), false);
  assert.equal(isSameOrigin(null, "app.example.com"), false);
  assert.equal(isSameOrigin("javascript:alert(1)", "app.example.com"), false);
});
