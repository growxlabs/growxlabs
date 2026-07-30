import assert from "node:assert/strict";
import test from "node:test";

import { runBoundedCron, resetLocalCronLeasesForTests } from "./cron-runtime.ts";
import { resetRateLimitsForTests } from "./rate-limit.ts";

function request(options: { secret?: string; browser?: boolean } = {}): Request {
  const headers = new Headers();
  if (options.secret) headers.set("authorization", `Bearer ${options.secret}`);
  if (options.browser) headers.set("sec-fetch-mode", "navigate");
  return new Request("http://localhost/api/cron/command-center/test", { headers });
}

test("Cron fails closed, rejects browsers, and prevents duplicate leases", async () => {
  const previousSecret = process.env.CRON_SECRET;
  const previousEnvironment = process.env.APP_ENV;
  process.env.CRON_SECRET = "test-secret-that-is-at-least-thirty-two-characters";
  process.env.APP_ENV = "test";
  resetLocalCronLeasesForTests();
  resetRateLimitsForTests();
  try {
    assert.equal((await runBoundedCron(request(), "auth-test", async () => ({}))).status, 403);
    assert.equal((await runBoundedCron(request({ secret: process.env.CRON_SECRET, browser: true }), "browser-test", async () => ({}))).status, 403);
    assert.equal((await runBoundedCron(request({ secret: process.env.CRON_SECRET }), "lease-test", async () => ({ processed: 1 }))).status, 200);
    assert.equal((await runBoundedCron(request({ secret: process.env.CRON_SECRET }), "lease-test", async () => ({ processed: 1 }))).status, 409);
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousSecret;
    if (previousEnvironment === undefined) delete process.env.APP_ENV;
    else process.env.APP_ENV = previousEnvironment;
  }
});
