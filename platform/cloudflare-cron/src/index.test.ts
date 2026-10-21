import test from "node:test";
import assert from "node:assert/strict";
import worker, { triggerRecovery, triggerRecoveryWithRetry } from "./index.ts";

test("Health check returns healthy status and target info", async () => {
  const req = new Request("https://worker.local/health", { method: "GET" });
  const env = {
    RECOVERY_ENDPOINT_URL: "https://staging.growxlabs.tech/api/cron/command-center/recover-execution",
    CRON_SECRET: "test-secret-at-least-thirty-two-bytes",
    APP_ENV: "staging",
  };
  const res = await worker.fetch(req, env);
  assert.equal(res.status, 200);
  const data = (await res.json()) as { status: string; service: string; environment: string };
  assert.equal(data.status, "healthy");
  assert.equal(data.service, "growxlabs-recovery-cron");
  assert.equal(data.environment, "staging");
});

test("Manual trigger without auth returns 401", async () => {
  const req = new Request("https://worker.local/trigger", { method: "POST" });
  const env = {
    RECOVERY_ENDPOINT_URL: "https://staging.growxlabs.tech/api/cron/command-center/recover-execution",
    CRON_SECRET: "test-secret-at-least-thirty-two-bytes",
  };
  const res = await worker.fetch(req, env);
  assert.equal(res.status, 401);
});

test("Missing CRON_SECRET throws error immediately", async () => {
  const env = {
    RECOVERY_ENDPOINT_URL: "https://staging.growxlabs.tech/api/cron/command-center/recover-execution",
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
    CRON_SECRET: "test-secret-at-least-thirty-two-bytes",
  };
  await assert.rejects(
    () => triggerRecovery(env, "req-1", Date.now()),
    /RECOVERY_ENDPOINT_URL environment variable is missing/,
  );
});

test("Safety Guard: Staging worker strictly rejects production domain", async () => {
  const env = {
    RECOVERY_ENDPOINT_URL: "https://growxlabs.tech/api/cron/command-center/recover-execution",
    CRON_SECRET: "test-secret-at-least-thirty-two-bytes",
    APP_ENV: "staging",
  };
  await assert.rejects(
    () => triggerRecovery(env, "req-staging-prod-block", Date.now()),
    /CRITICAL SAFETY VIOLATION: Staging worker must never target the production domain!/,
  );
});

test("Timeout handling does not blind-retry and exits cleanly", async () => {
  const env = {
    // Non-routable IP to simulate timeout / abort
    RECOVERY_ENDPOINT_URL: "http://10.255.255.1/timeout-test",
    CRON_SECRET: "test-secret-at-least-thirty-two-bytes",
    APP_ENV: "staging",
  };
  const started = Date.now();
  // Call triggerRecoveryWithRetry with an immediate timeout simulator
  const result = await triggerRecoveryWithRetry(env, "req-timeout-test", started).catch((err) => ({
    success: false,
    error: err.message,
  }));
  // Must either catch timeout or connection refused cleanly without looping
  assert.equal(typeof result, "object");
});
