import test from "node:test";
import assert from "node:assert/strict";
import worker, { triggerRecovery } from "./index.ts";

test("Health check returns healthy status", async () => {
  const req = new Request("https://worker.local/health", { method: "GET" });
  const env = {
    RECOVERY_ENDPOINT_URL: "https://staging.growxlabs.com/api/cron/command-center/recover-execution",
    CRON_SECRET: "test-secret",
    APP_ENV: "test",
  };
  const res = await worker.fetch(req, env);
  assert.equal(res.status, 200);
  const data = (await res.json()) as { status: string; service: string };
  assert.equal(data.status, "healthy");
  assert.equal(data.service, "growxlabs-recovery-cron");
});

test("Manual trigger without auth returns 401", async () => {
  const req = new Request("https://worker.local/trigger", { method: "POST" });
  const env = {
    RECOVERY_ENDPOINT_URL: "https://staging.growxlabs.com/api/cron/command-center/recover-execution",
    CRON_SECRET: "test-secret",
  };
  const res = await worker.fetch(req, env);
  assert.equal(res.status, 401);
});

test("Missing CRON_SECRET throws error immediately", async () => {
  const env = {
    RECOVERY_ENDPOINT_URL: "https://staging.growxlabs.com/api/cron/command-center/recover-execution",
    CRON_SECRET: "",
  };
  await assert.rejects(
    () => triggerRecovery(env, "req-1", Date.now()),
    /CRON_SECRET environment variable is missing/,
  );
});

test("Missing RECOVERY_ENDPOINT_URL throws error immediately", async () => {
  const env = {
    RECOVERY_ENDPOINT_URL: "",
    CRON_SECRET: "test-secret",
  };
  await assert.rejects(
    () => triggerRecovery(env, "req-1", Date.now()),
    /RECOVERY_ENDPOINT_URL environment variable is missing/,
  );
});
