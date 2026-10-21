# GrowxLabs Command Center — Go Production Activation Readiness Report

**Target Repository:** `C:\growxlabs\grow-x`  
**Execution Runtime Architecture:** Option A — Native Vercel Go (Single Consolidated Private Gateway)  
**Web Framework:** Next.js 16.2.4 (Turbopack) + React 19  
**Database:** Supabase PostgreSQL (Port 6543 / 5432)  
**External Clock & Recovery Dispatcher:** Cloudflare Workers Cron Trigger  
**Status:** **REMEDIATION & VERIFICATION COMPLETE (AWAITING LIVE STAGING VALIDATION)**  

---

## 1. Executive Summary

### 1.1 Architecture Decision: Option A Confirmed
GrowxLabs Command Center has been fully verified and standardized under **Option A**:
- **Consolidated Native Vercel Go Function:** Hosted at `api/private/gateway/index.go`. Vercel natively compiles and deploys this Go binary without custom Dockerfiles or Container Runtime overhead.
- **Frontend & Orchestrator:** Next.js 16 App Router on Vercel handling user sessions, chat UI, Server-Sent Events (SSE) streaming, and decoupled asynchronous background dispatches.
- **Data Persistence:** Supabase PostgreSQL remains the authoritative data store for all operational and historical Command Center records. **Supabase Storage, existing buckets, documents, URLs, and storage policies remain strictly untouched and preserved.**
- **External Clock & Recovery:** A dedicated, lightweight Cloudflare Worker (`platform/cloudflare-cron`) triggers the authenticated recovery dispatcher every minute, ensuring background execution advances predictably even if user browser tabs close.

### 1.2 Phase 3 and Phase 4 Activation State
| Milestone | Services Included | Current State | Flag Requirement | Staging Gate | Production Gate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 3** | `execution-engine`, `task-scheduler`, `execution-worker` | **CODE READY & VERIFIED** | `COMMAND_CENTER_PHASE3_EXECUTION_ENABLED=false` | Pending Live DB Run | Awaiting Staging Sign-Off |
| **Phase 4** | `capability-service`, `skill-service`, `crm`, `finance`, `hr`, `marketing`, `project`, `tool-service` | **CODE READY & VERIFIED** | `COMMAND_CENTER_PHASE4_SERVICES_ENABLED=false` | Pending Live DB Run | Awaiting Phase 3 Sign-Off |

### 1.3 Cloudflare Cron Readiness
- Edge Worker source implemented at [`platform/cloudflare-cron/src/index.ts`](file:///C:/growxlabs/grow-x/platform/cloudflare-cron/src/index.ts).
- Verified with 4 unit tests covering health check, unauthorized rejection, and environment validation.
- Ready for deployment via Wrangler once staging credentials are provided.

---

## 2. Complete Remediation Matrix (B1 – B11)

| Blocker | Description & Root Cause | Exact Resolution | Files Modified | Test Evidence | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **B1** | **Internal Route Collision:** Worker callbacks targeted `/api/private/v1/*` which overlapped with private gateway routes. | Migrated tool execution callbacks to explicit `/api/internal/v1/tool-executions` endpoint. | [`services/execution-worker/internal/worker/worker.go`](file:///C:/growxlabs/grow-x/services/execution-worker/internal/worker/worker.go)<br>[`services/tool-service/internal/adapter/legacy.go`](file:///C:/growxlabs/grow-x/services/tool-service/internal/adapter/legacy.go) | Tool execution tests pass | **VERIFIED** |
| **B2** | **Governance Gateway Rewrite Missing:** Vercel rewrites lacked routing for `/api/private/governance/:path*`. | Added rewrite rule mapping `/api/private/governance/:path*` to `/api/private/gateway`. | [`vercel.json`](file:///C:/growxlabs/grow-x/vercel.json) | Vercel configuration validation pass | **VERIFIED** |
| **B3 / B7** | **Scheduler Dispatch Header Mismatch:** `scheduler-client.ts` provided `X-GXL-Internal-Path: /internal/v1/scheduler/tick`, but gateway required exact prefix. | Updated gateway routing to accept `/internal/v1/scheduler`, `/internal/v1/runs`, `/internal/v1/worker`, and updated `scheduler-client.ts`. | [`api/private/gateway/index.go`](file:///C:/growxlabs/grow-x/api/private/gateway/index.go)<br>[`lib/command-center/execution/scheduler-client.ts`](file:///C:/growxlabs/grow-x/lib/command-center/execution/scheduler-client.ts) | `TestGatewayInternalPathRouting` passed | **VERIFIED** |
| **B4** | **Database Pooler Incompatibility:** `pgx/v5` default query protocol caused prepared statement collisions on Supabase port 6543. | Enforced `DefaultQueryExecMode = pgx.QueryExecModeExec` and bounded pools (`MaxConns: 3`, `MinConns: 0`). | [`services/execution-engine/internal/store/postgres.go`](file:///C:/growxlabs/grow-x/services/execution-engine/internal/store/postgres.go)<br>[`packages/phase4-go/servicekit/postgres.go`](file:///C:/growxlabs/grow-x/packages/phase4-go/servicekit/postgres.go) | Phase 4 & Engine store tests pass | **VERIFIED** |
| **B5 / B8** | **Insecure Scheduler/Worker Secret Handling:** Unset `CRON_SECRET` allowed empty or invalid tokens to authenticate. | Strict validation: `CRON_SECRET` must be non-empty; missing, empty, or mismatched tokens return HTTP 401. | [`services/task-scheduler/function/handler.go`](file:///C:/growxlabs/grow-x/services/task-scheduler/function/handler.go)<br>[`services/execution-worker/function/handler.go`](file:///C:/growxlabs/grow-x/services/execution-worker/function/handler.go) | 10 unit regression tests passed | **VERIFIED** |
| **B6** | **Inter-Service JWT Mismatch:** `capability-service`, `skill-service`, and domain services rejected `gxl-web` tokens because they expected standalone gateway proxies. | Updated service validators to accept `gxl-web`, `internal-api-gateway`, `execution-worker`, `tool-service` issuers and appropriate audiences. | [`services/capability-service/function/handler.go`](file:///C:/growxlabs/grow-x/services/capability-service/function/handler.go)<br>[`services/skill-service/function/handler.go`](file:///C:/growxlabs/grow-x/services/skill-service/function/handler.go)<br>[`packages/phase4-go/servicekit/http.go`](file:///C:/growxlabs/grow-x/packages/phase4-go/servicekit/http.go) | `TestAuthorisedAcceptsGxlWebConsolidatedGatewayToken` pass | **VERIFIED** |
| **B9** | **Model Execution Internal Routing:** Model callbacks required isolated internal endpoint rather than private gateway rewrite. | Explicit internal route `/api/internal/v1/model-executions` verified and guarded with service JWT. | [`services/execution-worker/internal/worker/worker.go`](file:///C:/growxlabs/grow-x/services/execution-worker/internal/worker/worker.go)<br>[`app/api/internal/v1/model-executions/route.ts`](file:///C:/growxlabs/grow-x/app/api/internal/v1/model-executions/route.ts) | TypeScript type-check & route verification | **VERIFIED** |
| **B10** | **Synchronous Browser Blocking & Stalled Jobs:** Command Center blocked user streams waiting for worker passes, risking client abort. | Created decoupled execution dispatcher using `after()` with independent 35s server-side timeout. Zero user latency. | [`lib/command-center/execution/execution-dispatch.ts`](file:///C:/growxlabs/grow-x/lib/command-center/execution/execution-dispatch.ts)<br>[`lib/command-center/orchestration/command-orchestrator.ts`](file:///C:/growxlabs/grow-x/lib/command-center/orchestration/command-orchestrator.ts) | TypeScript tests & Next.js production build | **VERIFIED** |
| **B11** | **Unsafe Rollback Procedures:** Prior documentation proposed dangerous blanket SQL `UPDATE` / `DELETE` across the entire database. | Completely replaced with authorized tenant-scoped cancellation API (`POST /internal/v1/runs/{id}/cancel`). | [`docs/GO_PRODUCTION_ACTIVATION_READINESS.md`](file:///C:/growxlabs/grow-x/docs/GO_PRODUCTION_ACTIVATION_READINESS.md)<br>[`services/execution-engine/internal/store/postgres.go`](file:///C:/growxlabs/grow-x/services/execution-engine/internal/store/postgres.go) | Run cancellation tests pass | **VERIFIED** |

---

## 3. Architecture & Service Verification

### 3.1 Consolidated Go Gateway Dispatches
All 13 Go services are linked in the single native Go binary at [`api/private/gateway/index.go`](file:///C:/growxlabs/grow-x/api/private/gateway/index.go):
1. `capability-service` $\rightarrow$ `/api/private/gateway/capabilities` or `X-GXL-Internal-Path: /internal/v1/capabilities`
2. `crm-service` $\rightarrow$ `/api/private/gateway/crm` or `X-GXL-Internal-Path: /internal/v1/crm`
3. `execution-engine` $\rightarrow$ `/api/private/gateway/execution` or `X-GXL-Internal-Path: /internal/v1/runs`
4. `finance-service` $\rightarrow$ `/api/private/gateway/finance` or `X-GXL-Internal-Path: /internal/v1/finance`
5. `governance-service` $\rightarrow$ `/api/private/gateway/governance` or `X-GXL-Internal-Path: /internal/v1/governance`
6. `hr-service` $\rightarrow$ `/api/private/gateway/hr` or `X-GXL-Internal-Path: /internal/v1/hr`
7. `internal-api-gateway` $\rightarrow$ Fallback internal reverse proxy
8. `marketing-service` $\rightarrow$ `/api/private/gateway/marketing` or `X-GXL-Internal-Path: /internal/v1/marketing`
9. `project-service` $\rightarrow$ `/api/private/gateway/projects` or `X-GXL-Internal-Path: /internal/v1/projects`
10. `skill-service` $\rightarrow$ `/api/private/gateway/skills` or `X-GXL-Internal-Path: /internal/v1/skills`
11. `task-scheduler` $\rightarrow$ `/api/private/gateway/scheduler` or `X-GXL-Internal-Path: /internal/v1/scheduler`
12. `tool-service` $\rightarrow$ `/api/private/gateway/tools` or `X-GXL-Internal-Path: /internal/v1/tools`
13. `execution-worker` $\rightarrow$ `/api/private/gateway/worker` or `X-GXL-Internal-Path: /internal/v1/worker`

### 3.2 Route & Versioning Contract Preservation
- Explicit API versioning (`/v1`, `/v2`, `/v3`) is preserved across all Next.js API routes and internal Go services.
- Public Next.js endpoints remain unaffected:
  - `/api/command-center/*`
  - `/api/cron/command-center/*`
  - `/api/internal/v1/*`

---

## 4. Asynchronous Execution Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant Orch as Command Orchestrator
    participant SSE as SSE Stream
    participant DB as Supabase PostgreSQL
    participant Dispatch as Execution Dispatcher (after())
    participant Sched as Task Scheduler
    participant Worker as Execution Worker
    participant Cron as Cloudflare Cron

    User->>Orch: Submit Prompt / Instruction
    Orch->>DB: createRun() [Persist Plan & Initial Steps]
    Orch->>SSE: Emit run_created, text delta, done (<500ms)
    SSE-->>User: Stream Completes (Zero Wait)
    Orch->>Dispatch: scheduleDecoupledDispatch()
    Note over Dispatch: Runs in background via after() with independent 35s timer
    Dispatch->>Sched: invokeBoundedScheduler() [Find Ready Steps]
    Sched->>DB: Advance Queued Steps to 'scheduled'
    Dispatch->>Worker: invokeBoundedWorker() [Claim Batch with DB Leases]
    Worker->>DB: Claim steps (FOR UPDATE SKIP LOCKED)
    Worker->>DB: Persist Execution Result & Audit Trail
    Worker->>Sched: Advance Dependent Steps
    
    Note over Cron: Every 1 Minute External Safety Net
    Cron->>Dispatch: /api/cron/command-center/recover-execution
    Dispatch->>DB: Reclaim Expired Leases & Advance Stalled Work
```

### 4.1 Durable Database Leases
- Workers claim tasks using `SELECT ... FOR UPDATE SKIP LOCKED`.
- Every active lease sets `lease_expires_at = NOW() + INTERVAL '30 seconds'`.
- If a serverless function terminates unexpectedly, the lock expires automatically. The Cloudflare recovery tick reclaims the orphaned step and increments `retry_count`.

---

## 5. Cloudflare Cron Configuration

### 5.1 Architecture & Security Specs
- **Worker Directory:** [`platform/cloudflare-cron/`](file:///C:/growxlabs/grow-x/platform/cloudflare-cron/)
- **Trigger Schedule:** `*/1 * * * *` (Every 1 minute)
- **Target Endpoint:** `https://<VERCEL_DOMAIN>/api/cron/command-center/recover-execution`
- **Authentication:** `Authorization: Bearer <CRON_SECRET>`
- **HTTP Timeout:** Bounded 25-second `AbortSignal` timeout.
- **Lease Conflict Handling:** Recognizes HTTP 409 Conflict as safe concurrent state (`checkpoint: "locked"`).
- **Public Surface:** Exposes only `GET /health` for monitoring. Internal Go ports remain private.

### 5.2 Deployment Instructions
```bash
cd platform/cloudflare-cron
npm install
npm test

# Set Staging Secret:
npx wrangler secret put CRON_SECRET --env staging

# Deploy to Staging:
npm run deploy:staging

# Verify Staging Worker:
curl -i https://growxlabs-recovery-cron-staging.<subdomain>.workers.dev/health
```

---

## 6. Database Readiness & Verification

### 6.1 Supabase Transaction Pooler Compatibility
- **Port 6543 (PgBouncer / Supavisor):** Configured with `pgx.QueryExecModeExec` across all Go services (`execution-engine`, `task-scheduler`, `execution-worker`, `phase4-go/servicekit`).
- **Elimination of Prepared Statement Collisions:** Disables named prepared statements, ensuring 100% compatibility with transaction poolers.
- **Connection Budgets:** Conservative settings (`MaxConns: 3`, `MinConns: 0`, `MaxConnIdleTime: 30s`, `MaxConnLifetime: 5m`) prevent exhausting the database pool.

### 6.2 Read-Only Migration Verification Script
Before enabling Phase 3 or Phase 4 in staging, execute this read-only SQL check:
```sql
-- Read-Only Schema Verification Query (Safe to run against any database)
SELECT table_schema, table_name
FROM information_schema.tables 
WHERE table_schema IN ('command_execution', 'command_services', 'command_governance')
ORDER BY table_schema, table_name;

-- Verify Indexes and Constraints
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname IN ('command_execution', 'command_services', 'command_governance');
```
> [!IMPORTANT]
> Foundational SQL scripts must **never** be rerun against existing databases. Migrations must be strictly additive.

---

## 7. Security Verification

### 7.1 Cross-Service JWT Matrix
| Calling Service | Target Service | Issuer (`iss`) | Audience (`aud`) | Status |
| :--- | :--- | :--- | :--- | :--- |
| `gxl-web` | Consolidated Gateway | `gxl-web` | `internal-api-gateway` | **VERIFIED** |
| `gxl-web` | `execution-engine` | `gxl-web` | `execution-engine` | **VERIFIED** |
| `gxl-web` | `capability-service` | `gxl-web` | `internal-api-gateway` / `capability-service` | **VERIFIED** |
| `gxl-web` | `skill-service` | `gxl-web` | `internal-api-gateway` / `skill-service` | **VERIFIED** |
| `execution-worker` | `tool-service` | `execution-worker` | `tool-service` | **VERIFIED** |
| `tool-service` | `gxl-web` (Tool Callback)| `tool-service` | `gxl-web` | **VERIFIED** |
| `execution-worker` | `gxl-web` (Model Callback)| `execution-worker`| `gxl-web` | **VERIFIED** |

### 7.2 Strict Authentication Guarantees
- Unset `CRON_SECRET` results in immediate HTTP 401 rejection. Empty tokens (`Bearer `) are strictly rejected.
- All internal tool and model callback routes require authentic HMAC-SHA256 tokens signed with `EXECUTION_SERVICE_JWT_SECRET` ($\ge 32$ bytes).

---

## 8. Safe Rollback Procedure

### 8.1 Zero-Downtime Rollback via Flags
If unexpected behavior occurs in staging or production:
1. Set feature flags in Vercel Project Settings:
   ```env
   COMMAND_CENTER_PHASE3_EXECUTION_ENABLED=false
   COMMAND_CENTER_PHASE4_SERVICES_ENABLED=false
   ```
2. Trigger an immediate redeployment:
   ```bash
   vercel --prod
   ```
   *(Environment variable changes in Vercel require a redeploy to take effect).*

### 8.2 Targeted Run Cancellation (No Blanket SQL)
To safely stop execution without corrupting or deleting database records:
```bash
curl -X POST https://<DOMAIN>/api/private/gateway \
  -H "Authorization: Bearer <GXL_WEB_JWT>" \
  -H "X-GXL-Internal-Path: /internal/v1/runs/<RUN_ID>/cancel" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Rollback cancellation", "cancelledBy": "admin"}'
```
- Targets **only** the specified `run_id` and its immediate pending steps.
- Existing logs, audit trails, and execution records remain completely intact.
- **Never execute blanket `DELETE FROM command_execution.queue` or `UPDATE command_execution.runs SET status='cancelled'`.**

---

## 9. Verification Evidence

### 9.1 TypeScript Test Suite
```text
> npm test
ℹ tests 69
ℹ suites 0
ℹ pass 69
ℹ fail 0
ℹ duration_ms 1413.8865
```

### 9.2 Phase 8 Production Hardening Test Suite
```text
> npm run test:phase8
✔ Phase 8 migration is additive and contains critical tenant indexes
✔ Vercel configuration retains exactly one Go function
✔ private service configuration is never declared as NEXT_PUBLIC
✔ Cron fails closed, rejects browsers, and prevents duplicate leases
ℹ tests 16
ℹ pass 16
ℹ fail 0
```

### 9.3 Cloudflare Cron Test Suite
```text
> node --experimental-transform-types src/index.test.ts
✔ Health check returns healthy status
✔ Manual trigger without auth returns 401
✔ Missing CRON_SECRET throws error immediately
✔ Missing RECOVERY_ENDPOINT_URL throws error immediately
ℹ tests 4
ℹ pass 4
ℹ fail 0
```

### 9.4 Go Test Suites
- `api/private/gateway`: **PASS** (`TestGatewayRouteDispatchUnauthenticated`, `TestGatewayInternalPathRouting`)
- `services/task-scheduler/function`: **PASS** (10 auth & tick tests)
- `services/capability-service/function`: **PASS** (3 auth & resolution tests)
- `services/skill-service/function`: **PASS** (2 auth & resolution tests)
- `packages/phase4-go/servicekit`: **PASS** (3 auth & gateway token tests)
- `packages/execution-go/...`: **PASS**

### 9.5 TypeScript Compiler & Next.js Production Build
- `npm run type-check` (`tsc --noEmit`): **0 errors**.
- `npm run build`: Compiled successfully in 2.1min. All 431 static and dynamic pages generated without error.

---

## 10. Exact Staging Environment Variables

| Variable | Description | Source / Requirement | Staging Value Example |
| :--- | :--- | :--- | :--- |
| `APP_ENV` | Application environment identifier | Required across all Go services and Next.js | `staging` |
| `DATABASE_URL` | Supabase PostgreSQL Connection Pooler URL | Supabase Dashboard (Port 6543) | `postgres://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require` |
| `DIRECT_URL` | Direct PostgreSQL Connection URL (Migrations) | Supabase Dashboard (Port 5432) | `postgres://postgres.[ref]:[pass]@aws-0-[region].supabase.com:5432/postgres?sslmode=require` |
| `EXECUTION_SERVICE_JWT_SECRET` | 32+ byte high-entropy secret for inter-service auth | Generated via `openssl rand -hex 32` | `e2a48f...` ($\ge 32$ chars) |
| `CRON_SECRET` | Secret for authenticating recovery cron triggers | Generated via `openssl rand -hex 32` | `c9b71d...` ($\ge 32$ chars) |
| `INTERNAL_API_GATEWAY_URL` | Gateway target URL for internal Next.js calls | Vercel Deployment URL | `https://staging.growxlabs.com/api/private/gateway` |
| `EXECUTION_ENGINE_INTERNAL_URL` | Direct URL to execution engine | Optional override; defaults to gateway | `https://staging.growxlabs.com/api/private/gateway` |
| `UPSTASH_REDIS_REST_URL` | Distributed locking REST URL | Upstash Redis Console | `https://[id].upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token | Upstash Redis Console | `AX...` |
| `COMMAND_CENTER_PHASE3_EXECUTION_ENABLED` | Phase 3 Go Execution feature flag | Set to `false` initially; flip to `true` after DB verification | `false` (initial) |
| `COMMAND_CENTER_PHASE4_SERVICES_ENABLED` | Phase 4 Go Domain Services feature flag | Set to `false` initially; flip after Phase 3 verification | `false` (initial) |

---

## 11. Staging E2E Verification Procedure

A comprehensive test runner is provided at [`scratch/staging_e2e_verification.ts`](file:///C:/growxlabs/grow-x/scratch/staging_e2e_verification.ts).

### Step-by-Step Staging Verification
1. Export staging credentials in your terminal:
   ```bash
   export STAGING_BASE_URL="https://staging.growxlabs.com"
   export EXECUTION_SERVICE_JWT_SECRET="<staging-secret>"
   export CRON_SECRET="<staging-cron-secret>"
   export APP_ENV="staging"
   ```
2. Execute the verification suite:
   ```bash
   node --experimental-transform-types scratch/staging_e2e_verification.ts
   ```
3. Verification Gates:
   - **Gate 1:** Gateway rejects unauthenticated requests with HTTP 401.
   - **Gate 2:** Task Scheduler accepts header-based dispatch without 404/401.
   - **Gate 3:** Task Scheduler validates `CRON_SECRET` and rejects invalid tokens.
   - **Gate 4:** Tool execution callback route validates service authentication.
   - **Gate 5:** Recovery Cron triggers successfully with `CRON_SECRET`.
   - **Gate 6:** Capability registry resolves via gateway with `gxl-web` JWT.
   - **Gate 7:** Governance policy evaluation routes successfully.
   - **Gate 8:** Targeted run cancellation routes properly without blanket database modifications.

---

## 12. Residual Risks & Mitigations

| Risk | Severity | Potential Impact | Mitigation & Safeguard | Monitoring |
| :--- | :--- | :--- | :--- | :--- |
| **Vercel Serverless Execution Timeout** | Medium | Long tool calls exceeding 60s could be terminated. | All serverless routes configured with `maxDuration: 60`. Background steps chunked across passes. | Sentry alerts on HTTP 504 / duration $>50\text{s}$. |
| **PostgreSQL Pool Saturation** | Low | Burst of concurrent workers exhausting database pool. | Pool size clamped to 3 conns per Go instance; idle timeout 30s; PgBouncer pooler mode enabled. | Supabase Connection Pool Metrics & PgBouncer client count. |
| **Cloudflare Cron Double-Trigger** | Very Low | Cloudflare and Vercel cron triggering simultaneously. | Upstash Redis distributed lease (`gxl:command-center:cron:*`) ensures single-leader execution. | Next.js structured logs (`outcome: "success"`, `status: 409`). |
| **Orphaned Execution Step** | Low | Worker terminates mid-task due to platform shutdown. | Lease expiry (30s) + Cloudflare 1-minute recovery tick reclaims step automatically. | `workerStepsProcessed` metric in recovery cron output. |

---

## 13. Production Activation Checklist

- [ ] **Step 1: Staging Schema Audit**
  - Run read-only schema verification query on staging PostgreSQL database.
  - Confirm `command_execution`, `command_services`, and `command_governance` schemas exist.
- [ ] **Step 2: Staging Environment Configuration**
  - Configure `EXECUTION_SERVICE_JWT_SECRET` ($\ge 32$ bytes) and `CRON_SECRET` ($\ge 32$ bytes) in Vercel Staging.
  - Keep `COMMAND_CENTER_PHASE3_EXECUTION_ENABLED=false`.
- [ ] **Step 3: Deploy & Verify Cloudflare Worker**
  - Deploy `platform/cloudflare-cron` to Cloudflare staging environment.
  - Verify `GET /health` returns HTTP 200.
- [ ] **Step 4: Execute Staging E2E Suite**
  - Run `node --experimental-transform-types scratch/staging_e2e_verification.ts`.
  - Confirm all 8 integration tests pass.
- [ ] **Step 5: Controlled Phase 3 Enablement**
  - Set `COMMAND_CENTER_PHASE3_EXECUTION_ENABLED=true` in staging.
  - Trigger a test run via Command Center UI.
  - Verify complete lifecycle: create $\rightarrow$ schedule $\rightarrow$ claim $\rightarrow$ execute $\rightarrow$ complete.
- [ ] **Step 6: Controlled Phase 4 Enablement**
  - Set `COMMAND_CENTER_PHASE4_SERVICES_ENABLED=true` in staging.
  - Test domain tool execution (CRM, HR, Finance, Projects).
- [ ] **Step 7: Final Production Approval Gate**
  - Collect staging run logs and verify zero errors.
  - Obtain formal stakeholder sign-off prior to applying production flags.
