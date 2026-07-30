import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

test("Phase 8 migration is additive and contains critical tenant indexes", () => {
  const migration = fs.readFileSync(path.join(root, "platform/command-center/migrations/0007_phase8_production_hardening.sql"), "utf8");
  assert.doesNotMatch(migration, /\bDROP\s+(TABLE|SCHEMA|COLUMN)\b/i);
  assert.match(migration, /artifact_tenant_listing_idx/);
  assert.match(migration, /notification_tenant_inbox_idx/);
  assert.match(migration, /platform_event_tenant_sequence_idx/);
  assert.match(migration, /approval_tenant_inbox_idx/);
  assert.match(migration, /execution_run_tenant_cursor_idx/);
});

test("Vercel configuration retains exactly one Go function", () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8")) as {
    functions?: Record<string, unknown>;
  };
  const goFunctions = Object.keys(config.functions ?? {}).filter((name) => name.endsWith(".go"));
  assert.deepEqual(goFunctions, ["api/private/gateway/index.go"]);
});

test("private service configuration is never declared as NEXT_PUBLIC", () => {
  const example = fs.readFileSync(path.join(root, ".env.example"), "utf8");
  assert.doesNotMatch(example, /NEXT_PUBLIC_(INTERNAL|EXECUTION|R2_|CRON|HEALTHCHECK|DATABASE)/);
});

test("artifact storage uses authenticated R2 requests instead of a production mock", () => {
  const storage = fs.readFileSync(path.join(root, "lib/command-center/artifacts/r2-storage.ts"), "utf8");
  assert.match(storage, /AWS4-HMAC-SHA256/);
  assert.match(storage, /R2_SECRET_ACCESS_KEY/);
  assert.match(storage, /static async upload\(/);
  assert.match(storage, /static async delete\(/);
  assert.doesNotMatch(storage, /\b(mock|placeholder|synthetic)\b/i);
});

test("the Next.js proxy applies the required browser security headers", () => {
  const proxy = fs.readFileSync(path.join(root, "proxy.ts"), "utf8");
  for (const header of [
    "Content-Security-Policy",
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Permissions-Policy",
  ]) {
    assert.match(proxy, new RegExp(header));
  }
});
