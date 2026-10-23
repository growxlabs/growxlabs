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

test("Cron fails closed, rejects browsers, prevents overlapping leases, and releases upon completion", async () => {
  const previousSecret = process.env.CRON_SECRET;
  const previousEnvironment = process.env.APP_ENV;
  process.env.CRON_SECRET = "test-secret-that-is-at-least-thirty-two-characters";
  process.env.APP_ENV = "test";
  resetLocalCronLeasesForTests();
  resetRateLimitsForTests();
  try {
    assert.equal((await runBoundedCron(request(), "auth-test", async () => ({}))).status, 403);
    assert.equal((await runBoundedCron(request({ secret: process.env.CRON_SECRET, browser: true }), "browser-test", async () => ({}))).status, 403);

    // Test overlapping concurrent invocations: second one must return 409
    let resolveFirst: (() => void) | undefined;
    const firstRunning = new Promise<void>((resolve) => { resolveFirst = resolve; });
    const run1Promise = runBoundedCron(request({ secret: process.env.CRON_SECRET }), "overlap-test", async () => {
      await firstRunning;
      return { processed: 1 };
    });

    // Overlapping concurrent invocation while run1 is in flight
    const run2Res = await runBoundedCron(request({ secret: process.env.CRON_SECRET }), "overlap-test", async () => ({ processed: 2 }));
    assert.equal(run2Res.status, 409);

    // Let run1 complete and release its lease
    resolveFirst?.();
    const run1Res = await run1Promise;
    assert.equal(run1Res.status, 200);

    // Sequential invocation after completion: owner-verified release allows immediate subsequent execution
    const run3Res = await runBoundedCron(request({ secret: process.env.CRON_SECRET }), "overlap-test", async () => ({ processed: 3 }));
    assert.equal(run3Res.status, 200);
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousSecret;
    if (previousEnvironment === undefined) delete process.env.APP_ENV;
    else process.env.APP_ENV = previousEnvironment;
  }
});
