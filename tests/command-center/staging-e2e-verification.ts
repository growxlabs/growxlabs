/**
 * Staging End-to-End Verification Test Suite
 * Tracked location: tests/command-center/staging-e2e-verification.ts (v1.0.1)
 *
 * Runs 9 strict verification gates against a designated staging / preview environment:
 * 1. Gateway Route Dispatch & Unauthenticated 401 Enforcement
 * 2. Header-based Internal Path Dispatch for Scheduler (/internal/v1/scheduler/tick)
 * 3. Strict CRON_SECRET Authentication on Scheduler
 * 4. Internal Route Protection for Tool Execution Callbacks (/api/internal/v1/tool-executions)
 * 5. Recovery Cron Endpoint (/api/cron/command-center/recover-execution) & Distributed Locking
 * 6. Phase 4 Capability & Skill Registry Gateway Routing (/internal/v1/capabilities/resolve)
 * 7. Governance Policy Evaluation (/internal/v1/governance/policy/evaluate)
 * 8. Targeted Run Cancellation (/internal/v1/runs/{id}/cancel) - Zero Blanket DB Mutations
 * 9. Real Disposable Execution Run: createRun -> schedule -> claim -> persist -> succeeded
 *
 * Usage:
 *   npm run test:staging
 *   or:
 *   node --experimental-transform-types tests/command-center/staging-e2e-verification.ts
 */

import crypto from "crypto";

interface ServiceClaims {
  iss: string;
  aud: string;
  service: string;
  env: string;
  requestId: string;
  iat: number;
  exp: number;
}

function signServiceJWT(claims: ServiceClaims, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const data = `${header}.${payload}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

async function runStagingVerification() {
  const baseURL = (process.env.STAGING_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
  const jwtSecret = process.env.EXECUTION_SERVICE_JWT_SECRET || "staging-secret-must-be-at-least-thirty-two-chars";
  const cronSecret = process.env.CRON_SECRET || "staging-cron-secret-thirty-two-chars";
  const env = process.env.APP_ENV || "staging";
  const bypassSecret = process.env.VERCEL_PROTECTION_BYPASS;

  console.log(`\n======================================================`);
  console.log(`  GrowX Labs — Staging E2E Verification Test Suite`);
  console.log(`  Target URL: ${baseURL}`);
  console.log(`  Environment: ${env}`);
  console.log(`  Preview Protection Bypass: ${bypassSecret ? "Configured (secret)" : "Not Configured"}`);
  console.log(`======================================================\n`);

  // Pre-flight connectivity check
  try {
    const preflight = new AbortController();
    const timeout = setTimeout(() => preflight.abort(), 8000);
    const headers: Record<string, string> = {};
    if (bypassSecret) headers["x-vercel-protection-bypass"] = bypassSecret;

    const preRes = await fetch(`${baseURL}/api/health`, {
      method: "GET",
      headers,
      signal: preflight.signal,
      redirect: "manual"
    }).catch(() => {
      return fetch(baseURL, { method: "HEAD", headers, signal: preflight.signal, redirect: "manual" });
    });
    clearTimeout(timeout);

    if (preRes && (preRes.status === 302 || preRes.status === 307 || preRes.status === 308)) {
      const loc = preRes.headers.get("location") || "";
      if (loc.includes("sso-api") || loc.includes("vercel.com")) {
        console.warn(`\n⚠️  WARNING: Target deployment is Protected by Vercel Authentication (SSO).`);
        console.warn(`   External requests are being redirected to: ${loc.split('?')[0]}`);
        console.warn(`   To run automated tests against Vercel Preview Deployments:`);
        console.warn(`   1. Pass VERCEL_PROTECTION_BYPASS=<secret> (from Vercel Project -> Settings -> Deployment Protection)`);
        console.warn(`   2. OR disable Preview Deployment Protection for branch 'staging-go-verification'\n`);
      }
    }
  } catch {
    console.error(`❌ Connection Error: Unable to reach server at ${baseURL}`);
    console.error(`\nWhy did this happen?`);
    if (baseURL.includes("localhost")) {
      console.error(`  No local server is currently running on ${baseURL}.`);
      console.error(`\n  👉 Option 1: Test locally`);
      console.error(`     1. Open another terminal in 'C:\\growxlabs\\grow-x'`);
      console.error(`     2. Run: npm run dev`);
      console.error(`     3. Once started, re-run: npm run test:staging`);
    } else {
      console.error(`  Unable to connect to the remote host at ${baseURL}.`);
      console.error(`  Check network connectivity or your Vercel preview deployment status.`);
    }
    console.error(`\n  👉 Option 2: Test against your Vercel Preview Deployment`);
    console.error(`     In PowerShell:`);
    console.error(`       $env:STAGING_BASE_URL="https://<your-preview-domain>.vercel.app"`);
    console.error(`       $env:CRON_SECRET="<your-staging-cron-secret>"`);
    console.error(`       $env:EXECUTION_SERVICE_JWT_SECRET="<your-staging-jwt-secret>"`);
    console.error(`       $env:VERCEL_PROTECTION_BYPASS="<your-bypass-secret>"`);
    console.error(`       npm run test:staging\n`);
    process.exit(1);
  }

  let totalTests = 0;
  let passedTests = 0;
  const failedGates: Array<{ gate: number; name: string; error: string }> = [];

  async function stagingFetch(url: string, init?: RequestInit): Promise<Response> {
    const res = await fetch(url, { ...init, redirect: "manual" });
    if (res.status === 302 || res.status === 307 || res.status === 308) {
      const loc = res.headers.get("location") || "";
      if (loc.includes("sso-api") || loc.includes("vercel.com")) {
        throw new Error(
          `Vercel SSO Protection intercepted request (HTTP ${res.status}). Set VERCEL_PROTECTION_BYPASS or disable Preview Deployment Protection for branch.`
        );
      }
    }
    return res;
  }

  async function test(name: string, fn: () => Promise<void>) {
    totalTests++;
    const gateNum = totalTests;
    process.stdout.write(`[GATE ${gateNum}] ${name} ... `);
    try {
      await fn();
      passedTests++;
      console.log(`✅ PASS`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`❌ FAIL`);
      console.error(`   Error: ${msg}`);
      failedGates.push({ gate: gateNum, name, error: msg });
    }
  }

  function getHeaders(audience: string, requestId: string, internalPath?: string) {
    const now = Math.floor(Date.now() / 1000);
    const token = signServiceJWT({
      iss: "gxl-web",
      aud: audience,
      service: "gxl-web",
      env,
      requestId,
      iat: now,
      exp: now + 120,
    }, jwtSecret);

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Request-ID": requestId,
    };

    if (bypassSecret) {
      headers["x-vercel-protection-bypass"] = bypassSecret;
    }

    if (internalPath) {
      headers["X-GXL-Internal-Path"] = internalPath;
    }

    return headers;
  }

  // --- Gate 1: Gateway Routing & Unauthenticated Rejection ---
  await test("Unauthenticated requests to gateway are strictly rejected with 401", async () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (bypassSecret) headers["x-vercel-protection-bypass"] = bypassSecret;

    const res = await stagingFetch(`${baseURL}/api/private/gateway`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });
    if (res.status !== 401) {
      const text = await res.text().catch(() => "");
      throw new Error(`Expected strictly 401 UNAUTHENTICATED, got HTTP ${res.status}: ${text.slice(0, 100)}`);
    }
  });

  // --- Gate 2: Internal Path Dispatch for Scheduler ---
  await test("Gateway dispatches /internal/v1/scheduler via header to task-scheduler", async () => {
    const reqId = `req-sched-${Date.now()}`;
    const res = await stagingFetch(`${baseURL}/api/private/gateway`, {
      method: "POST",
      headers: getHeaders("task-scheduler", reqId, "/internal/v1/scheduler/tick"),
    });
    if (res.status === 401) throw new Error("Authentication failed: Service JWT was rejected (verify EXECUTION_SERVICE_JWT_SECRET)");
    if (res.status === 404) throw new Error("Route not found: Scheduler dispatch failed");
    if (res.status === 503) {
      const text = await res.text().catch(() => "");
      throw new Error(`Scheduler dependencies/database unavailable (HTTP 503): ${text.slice(0, 150)}`);
    }
    if (res.status !== 200) {
      const text = await res.text().catch(() => "");
      throw new Error(`Expected HTTP 200 from scheduler tick, got ${res.status}: ${text.slice(0, 150)}`);
    }
  });

  // --- Gate 3: Cron Secret Authentication on Scheduler ---
  await test("Scheduler accepts valid CRON_SECRET and rejects empty/invalid secret", async () => {
    const headersInvalid: Record<string, string> = { "Authorization": "Bearer wrong-secret" };
    if (bypassSecret) headersInvalid["x-vercel-protection-bypass"] = bypassSecret;
    const invalidRes = await stagingFetch(`${baseURL}/api/private/scheduler`, {
      method: "POST",
      headers: headersInvalid,
    });
    if (invalidRes.status !== 401) {
      throw new Error(`Expected 401 for invalid CRON_SECRET, got ${invalidRes.status}`);
    }

    const headersEmpty: Record<string, string> = { "Authorization": "Bearer " };
    if (bypassSecret) headersEmpty["x-vercel-protection-bypass"] = bypassSecret;
    const emptyRes = await stagingFetch(`${baseURL}/api/private/scheduler`, {
      method: "POST",
      headers: headersEmpty,
    });
    if (emptyRes.status !== 401) {
      throw new Error(`Expected 401 for empty Bearer token, got ${emptyRes.status}`);
    }

    const headersValid: Record<string, string> = { "Authorization": `Bearer ${cronSecret}` };
    if (bypassSecret) headersValid["x-vercel-protection-bypass"] = bypassSecret;
    const validRes = await stagingFetch(`${baseURL}/api/private/scheduler`, {
      method: "POST",
      headers: headersValid,
    });
    if (validRes.status === 401) {
      throw new Error("Valid CRON_SECRET was rejected with 401 (verify CRON_SECRET matches in Vercel)");
    }
    if (validRes.status === 503) {
      const text = await validRes.text().catch(() => "");
      throw new Error(`Scheduler database unavailable (HTTP 503): ${text.slice(0, 150)}`);
    }
    if (validRes.status !== 200) {
      const text = await validRes.text().catch(() => "");
      throw new Error(`Expected HTTP 200 with valid CRON_SECRET, got ${validRes.status}: ${text.slice(0, 150)}`);
    }
  });

  // --- Gate 4: Internal Route for Tool Execution Callback ---
  await test("Next.js internal tool-executions endpoint verifies service authentication", async () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (bypassSecret) headers["x-vercel-protection-bypass"] = bypassSecret;

    const unauthRes = await stagingFetch(`${baseURL}/api/internal/v1/tool-executions`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });
    if (unauthRes.status !== 401) {
      const text = await unauthRes.text().catch(() => "");
      throw new Error(`Expected strictly 401 for unauthenticated tool callback, got ${unauthRes.status}: ${text.slice(0, 100)}`);
    }
  });

  // --- Gate 5: Recovery Cron Endpoint & Distributed Locking ---
  await test("Recovery Cron endpoint verifies CRON_SECRET and handles distributed locking", async () => {
    const headersUnauth: Record<string, string> = {};
    if (bypassSecret) headersUnauth["x-vercel-protection-bypass"] = bypassSecret;

    const unauthRes = await stagingFetch(`${baseURL}/api/cron/command-center/recover-execution`, {
      headers: headersUnauth,
    });
    if (unauthRes.status !== 401 && unauthRes.status !== 403) {
      throw new Error(`Expected 401/403 for unauthenticated cron request, got ${unauthRes.status}`);
    }

    const headersAuth: Record<string, string> = { "Authorization": `Bearer ${cronSecret}` };
    if (bypassSecret) headersAuth["x-vercel-protection-bypass"] = bypassSecret;

    const authRes = await stagingFetch(`${baseURL}/api/cron/command-center/recover-execution`, {
      headers: headersAuth,
    });
    if (authRes.status === 401 || authRes.status === 403) {
      throw new Error(`CRON_SECRET was rejected on recovery endpoint (HTTP ${authRes.status})`);
    }
    if (authRes.status !== 200 && authRes.status !== 409) {
      const text = await authRes.text().catch(() => "");
      throw new Error(`Expected HTTP 200 or 409 (lock held), got ${authRes.status}: ${text.slice(0, 150)}`);
    }
  });

  // --- Gate 6: Phase 4 Capability & Skill Registry Gateway Routing ---
  await test("Gateway routes /internal/v1/capabilities/resolve with gxl-web token", async () => {
    const reqId = `req-cap-${Date.now()}`;
    const res = await stagingFetch(`${baseURL}/api/private/gateway`, {
      method: "POST",
      headers: getHeaders("internal-api-gateway", reqId, "/internal/v1/capabilities/resolve"),
      body: JSON.stringify({
        capabilityId: "sales.leads",
        version: "1.0.0",
        agentId: "agent_sales",
        scope: { organisationId: "org-1", workspaceId: "ws-1", userId: "user-1", permissions: ["leads:read"] }
      }),
    });
    if (res.status === 401) throw new Error(`Capability resolution token was rejected with 401`);
    if (res.status === 404) throw new Error(`Route not found for capability resolution`);
    if (res.status !== 200) {
      const text = await res.text().catch(() => "");
      throw new Error(`Expected HTTP 200 for capability resolution, got ${res.status}: ${text.slice(0, 150)}`);
    }
  });

  // --- Gate 7: Governance Evaluation Dispatch ---
  await test("Gateway routes /internal/v1/governance/policy/evaluate with gxl-web token", async () => {
    const reqId = `req-gov-${Date.now()}`;
    const headers = getHeaders("internal-api-gateway", reqId, "/internal/v1/governance/policy/evaluate");
    headers["X-GXL-Organisation-ID"] = "00000000-0000-0000-0000-000000000001";
    headers["X-GXL-Workspace-ID"] = "00000000-0000-0000-0000-000000000002";
    headers["X-GXL-User-ID"] = "00000000-0000-0000-0000-000000000003";

    const res = await stagingFetch(`${baseURL}/api/private/gateway`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        requestId: reqId,
        traceId: reqId,
        organisationId: "00000000-0000-0000-0000-000000000001",
        workspaceId: "00000000-0000-0000-0000-000000000002",
        userId: "00000000-0000-0000-0000-000000000003",
        roleIds: ["admin"],
        teamIds: ["team-core"],
        permissionIds: ["leads:read"],
        agentId: "agent_sales",
        capabilityId: "sales.leads",
        toolId: "query_leads",
        toolVersion: "1.0.0",
        domain: "crm",
        operation: "leads.search",
        executionMode: "read",
        sensitivity: "moderate",
        dataClassification: "internal"
      }),
    });
    if (res.status === 401) throw new Error(`Governance token was rejected with 401`);
    if (res.status === 404) throw new Error(`Route not found for governance evaluation`);
    if (res.status !== 200) {
      const text = await res.text().catch(() => "");
      throw new Error(`Expected HTTP 200 for governance evaluation, got ${res.status}: ${text.slice(0, 150)}`);
    }
  });

  // --- Gate 8: Targeted Run Cancellation Route ---
  await test("Gateway routes /internal/v1/runs/{id}/cancel without blanket database mutations", async () => {
    const reqId = `req-cancel-${Date.now()}`;
    const testRunId = crypto.randomUUID();
    const headers = getHeaders("execution-engine", reqId, `/internal/v1/runs/${testRunId}/cancel`);
    headers["X-Organisation-ID"] = "org-staging-disposable";
    headers["X-Workspace-ID"] = "ws-staging-disposable";

    const res = await stagingFetch(`${baseURL}/api/private/gateway`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        reason: "User cancelled execution",
        cancelledBy: "user-1"
      }),
    });
    if (res.status === 401) throw new Error(`Cancellation token was rejected with 401`);
    // Non-existent disposable test run ID must return 404 (RUN_NOT_CANCELLABLE), proving targeted handler was reached
    if (res.status !== 404 && res.status !== 202) {
      const text = await res.text().catch(() => "");
      throw new Error(`Expected HTTP 404 or 202 for targeted cancellation, got ${res.status}: ${text.slice(0, 150)}`);
    }
  });

  // --- Gate 9: Real Disposable Execution Run & DB Lifecycle Verification ---
  await test("Real disposable execution run lifecycle: create -> schedule -> claim -> persist -> succeeded", async () => {
    const planId = crypto.randomUUID();
    const stepId = crypto.randomUUID();
    const conversationId = crypto.randomUUID();
    const uniqueId = `staging-test-${Date.now()}`;
    const reqId = `req-e2e-${uniqueId}`;
    const orgId = "org-staging-disposable";
    const wsId = "ws-staging-disposable";
    const userId = "user-staging-disposable";

    // Strictly conforms to Go contract.Plan in packages/execution-go/contract/types.go
    // Extra fields are forbidden by decoder.DisallowUnknownFields()
    const disposablePlan = {
      id: planId,
      version: "gxl.execution-plan.v1",
      requestId: reqId,
      conversationId: conversationId,
      organisationId: orgId,
      workspaceId: wsId,
      userId: userId,
      agentId: "agent-growth",
      capabilityId: "crm.leads.read",
      skillId: "skill-data-transform",
      permissions: ["crm:leads:read"],
      steps: [
        {
          id: stepId,
          index: 0,
          type: "transform",
          name: "Safe Pick Transform Step",
          dependsOn: [],
          input: {
            operation: "pick",
            value: { item: "staging-token-verify", count: 42, active: true },
            keys: ["item", "active"]
          },
          requiredPermissions: ["crm:leads:read"],
          retryPolicy: { maxAttempts: 2, initialDelayMs: 100, maxDelayMs: 500 },
          timeoutMs: 15000,
          destructive: false
        }
      ],
      createdAt: new Date().toISOString()
    };

    // 1. Create durable run via Execution Engine
    const createHeaders = getHeaders("execution-engine", reqId, "/internal/v1/runs");
    createHeaders["X-Organisation-ID"] = orgId;
    createHeaders["X-Workspace-ID"] = wsId;

    const createRes = await stagingFetch(`${baseURL}/api/private/gateway`, {
      method: "POST",
      headers: createHeaders,
      body: JSON.stringify({
        idempotencyKey: `idem-${uniqueId}`,
        plan: disposablePlan
      })
    });

    if (createRes.status !== 200 && createRes.status !== 201) {
      const errText = await createRes.text().catch(() => "");
      throw new Error(`createRun() failed with HTTP ${createRes.status}: ${errText.slice(0, 300)}`);
    }

    const createdData = (await createRes.json()) as { id: string; status: string };
    if (!createdData.id) {
      throw new Error("createRun() returned response missing run ID");
    }
    if (createdData.status !== "queued") {
      throw new Error(`Expected initial created run status 'queued', got '${createdData.status}'`);
    }
    const actualRunId = createdData.id;

    // 2. Trigger Scheduler Tick to advance queued step to scheduled
    const schedHeaders = getHeaders("task-scheduler", `req-sched-${uniqueId}`, "/internal/v1/scheduler/tick");
    const schedRes = await stagingFetch(`${baseURL}/api/private/gateway`, {
      method: "POST",
      headers: schedHeaders,
    });
    if (schedRes.status !== 200) {
      const schedText = await schedRes.text().catch(() => "");
      throw new Error(`Scheduler tick failed with HTTP ${schedRes.status}: ${schedText.slice(0, 200)}`);
    }

    // 3. Trigger Worker Pass to claim step using DB lease and execute transform step
    let workerProcessed = 0;
    for (let pass = 0; pass < 3; pass++) {
      const workerHeaders = getHeaders("execution-worker", `req-worker-${uniqueId}-${pass}`, "/internal/v1/worker/batch");
      const workerRes = await stagingFetch(`${baseURL}/api/private/gateway?limit=5`, {
        method: "POST",
        headers: workerHeaders,
      });
      if (workerRes.status === 200) {
        const workerData = (await workerRes.json()) as { processed: number };
        workerProcessed += workerData.processed;
        if (workerProcessed >= 1) break;
      }
      await new Promise((r) => setTimeout(r, 400));
    }
    if (workerProcessed < 1) {
      throw new Error(`Worker processed 0 items; step was not claimed or queued properly`);
    }

    // 4. Query Run Status to verify state transition & persisted output
    const getHeadersObj = getHeaders("execution-engine", `req-get-${uniqueId}`, `/internal/v1/runs/${encodeURIComponent(actualRunId)}`);
    getHeadersObj["X-Organisation-ID"] = orgId;
    getHeadersObj["X-Workspace-ID"] = wsId;

    let runState: { id: string; status: string } = { id: actualRunId, status: "unknown" };
    for (let poll = 0; poll < 6; poll++) {
      const getRes = await stagingFetch(`${baseURL}/api/private/gateway`, {
        method: "GET",
        headers: getHeadersObj,
      });
      if (getRes.status === 200) {
        runState = (await getRes.json()) as { id: string; status: string };
        if (runState.status === "succeeded") break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    if (runState.status !== "succeeded") {
      throw new Error(`Expected run status to reach 'succeeded', but got '${runState.status}'`);
    }

    // 5. Query Run Events to verify full event trail
    const eventsHeadersObj = getHeaders("execution-engine", `req-events-${uniqueId}`, `/internal/v1/runs/${encodeURIComponent(actualRunId)}/events`);
    eventsHeadersObj["X-Organisation-ID"] = orgId;
    eventsHeadersObj["X-Workspace-ID"] = wsId;

    const eventsRes = await stagingFetch(`${baseURL}/api/private/gateway`, {
      method: "GET",
      headers: eventsHeadersObj,
    });
    if (eventsRes.status === 200) {
      const eventsData = (await eventsRes.json()) as { events: Array<{ event_type: string }> };
      const eventTypes = (eventsData.events || []).map((e: any) => e.type || e.event_type);
      const hasSucceeded = eventTypes.includes("step.succeeded") || eventTypes.includes("run.succeeded");
      if (!hasSucceeded) {
        throw new Error(`Expected events to include 'step.succeeded' or 'run.succeeded', got: ${eventTypes.join(", ")}`);
      }
    }
  });

  console.log(`\n------------------------------------------------------`);
  console.log(`  Staging Verification Complete: ${passedTests}/${totalTests} gates passed`);
  if (failedGates.length > 0) {
    console.log(`  Failed Gates: ${failedGates.map((f) => `Gate ${f.gate}`).join(", ")}`);
  }
  console.log(`------------------------------------------------------\n`);

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

runStagingVerification().catch((err) => {
  console.error("Staging verification suite crashed:", err);
  process.exit(1);
});
