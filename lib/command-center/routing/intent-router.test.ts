import { test } from "node:test";
import assert from "node:assert";
import { routeCommandIntent } from "./intent-router.ts";

test("GXL Command Center Pre-Router — Greetings", () => {
  const cases = [
    "hi",
    "hii",
    "hiii",
    "hello!",
    "hey bro",
    "good morning",
    "yo",
    "sup",
    "howdy"
  ];
  for (const c of cases) {
    const res = routeCommandIntent({ message: c });
    assert.strictEqual(res.intent, "greeting", `Failed greeting: ${c}`);
    assert.strictEqual(res.requiresTools, false);
    assert.strictEqual(res.requiresModel, false);
  }
});

test("GXL Command Center Pre-Router — Courtesy", () => {
  const cases = [
    "thanks",
    "thank you",
    "great",
    "okay",
    "got it",
    "bye",
    "see you"
  ];
  for (const c of cases) {
    const res = routeCommandIntent({ message: c });
    assert.strictEqual(res.intent, "courtesy", `Failed courtesy: ${c}`);
    assert.strictEqual(res.requiresTools, false);
    assert.strictEqual(res.requiresModel, false);
  }
});

test("GXL Command Center Pre-Router — Small Talk & Help", () => {
  const res1 = routeCommandIntent({ message: "how are you" });
  assert.strictEqual(res1.intent, "small_talk");
  assert.strictEqual(res1.requiresTools, false);

  const res2 = routeCommandIntent({ message: "what can you do" });
  assert.strictEqual(res2.intent, "product_help");
  assert.strictEqual(res2.requiresTools, false);

  const res3 = routeCommandIntent({ message: "how do I use @agent" });
  assert.strictEqual(res3.intent, "product_help");
  assert.strictEqual(res3.requiresTools, false);
});

test("GXL Command Center Pre-Router — General Knowledge (No Tools)", () => {
  const res1 = routeCommandIntent({ message: "what is OAuth" });
  assert.strictEqual(res1.intent, "knowledge");
  assert.strictEqual(res1.requiresTools, false);
  assert.strictEqual(res1.requiresModel, true);

  const res2 = routeCommandIntent({ message: "explain JWT" });
  assert.strictEqual(res2.intent, "knowledge");
  assert.strictEqual(res2.requiresTools, false);
  assert.strictEqual(res2.requiresModel, true);
});

test("GXL Command Center Pre-Router — Business Read (Specific Tools)", () => {
  const res1 = routeCommandIntent({ message: "show total leads" });
  assert.strictEqual(res1.intent, "business_read");
  assert.ok(res1.allowedTools.includes("query_leads"));
  assert.ok(res1.allowedTools.includes("get_company_stats"));
  assert.ok(!res1.allowedTools.includes("get_admin_invoices"));

  const res2 = routeCommandIntent({ message: "show invoices" });
  assert.strictEqual(res2.intent, "business_read");
  assert.ok(res2.allowedTools.includes("get_admin_invoices"));
  assert.ok(!res2.allowedTools.includes("query_leads"));
});

test("GXL Command Center Pre-Router — Web Research", () => {
  const res = routeCommandIntent({ message: "research AI-native HRMS competitors" });
  assert.strictEqual(res.intent, "research");
  assert.strictEqual(res.allowedTools.length, 1);
  assert.strictEqual(res.allowedTools[0], "search_web");
});

test("GXL Command Center Pre-Router — Intent Precedence", () => {
  // A greeting prefixed query should route to the operational intent, not "greeting"
  const res1 = routeCommandIntent({ message: "hi, show total leads" });
  assert.strictEqual(res1.intent, "business_read");

  const res2 = routeCommandIntent({ message: "hello can you list invoices" });
  assert.strictEqual(res2.intent, "business_read");
});
