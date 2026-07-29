# GXL Command Center Phase 3

Phase 3 adds durable, bounded plan execution without replacing the Phase 1 SSE
protocol or the Phase 2 intent/capability/skill routing pipeline.

## Runtime topology

1. Next.js resolves the authenticated user context and Phase 2 routing.
2. The typed planner emits a validated `gxl.execution-plan.v1` DAG.
3. Next.js signs a short-lived service JWT and creates an idempotent run.
4. The execution engine persists the run, steps, dependencies, and initial event.
5. The scheduler finds dependency-ready steps and publishes them through the
   PostgreSQL durable queue.
6. A worker claims work with a time-bounded lease and fencing token.
7. Model and tool steps call the authenticated Next.js internal adapters.
   Transform, decision, and wait steps use bounded built-in operations only.
8. Events are persisted and exposed through the existing SSE-compatible web
   boundary.

PostgreSQL is the selected durable queue/event transport for this phase because
the repository did not already standardize on NATS. The scheduler and worker are
separate services, and the durable transport is isolated behind their database
boundary so a future transport can be introduced without changing plan or state
contracts.

## Required configuration

The Next.js service requires:

```text
COMMAND_CENTER_PHASE3_EXECUTION_ENABLED=true
EXECUTION_ENGINE_INTERNAL_URL=https://execution-engine.internal.example.com
EXECUTION_SCHEDULER_INTERNAL_URL=https://task-scheduler.internal.example.com
EXECUTION_WORKER_INTERNAL_URL=https://execution-worker.internal.example.com
EXECUTION_SERVICE_JWT_SECRET=<at-least-32-random-bytes>
APP_ENV=production
```

All Go services require `DATABASE_URL`. The execution engine also requires
`EXECUTION_SERVICE_JWT_SECRET` and `APP_ENV`. The worker requires:

```text
EXECUTION_WORKER_ID=worker-1
GXL_WEB_BASE_URL=https://app.example.com
EXECUTION_SERVICE_JWT_SECRET=<same-secret>
APP_ENV=production
```

Optional operational settings:

```text
EXECUTION_ENGINE_ADDRESS=:8091
TASK_SCHEDULER_ADDRESS=:8092
EXECUTION_WORKER_ADDRESS=:8093
SCHEDULER_BATCH_SIZE=50
SCHEDULER_INTERVAL_MS=1000
WORKER_LEASE_SECONDS=90
WORKER_POLL_MS=500
```

Apply `platform/command-center/migrations/0003_phase3_execution.sql` before
enabling the feature flag. Do not expose any `/internal/v1` endpoint publicly;
enforce service-network ingress rules in addition to the application JWT.

The Next.js application remains a normal Vercel deployment. Its build and
runtime do not start Go binaries, workers, schedulers, queue consumers, Docker
containers, or persistent background processes. Existing Dockerfiles are
unused optional local artifacts; production uses the bounded Vercel Go
Function adapters documented in `command-center-vercel-go.md`.

See `docs/command-center-phase3-deployment.md` for the complete deployment
boundary and Vercel configuration.

## Local verification

```powershell
node --experimental-transform-types --test lib/command-center/planning/planner.test.ts
npx tsc --noEmit
npx eslint lib/command-center/planning lib/command-center/execution app/api/internal/v1

$modules = @(
  "packages/execution-go",
  "services/execution-engine",
  "services/task-scheduler",
  "services/execution-worker"
)
foreach ($module in $modules) {
  Push-Location $module
  go vet ./...
  go test ./...
  Pop-Location
}
```

Race tests require a CGO-enabled Go toolchain. Run `go test -race ./...` for
each module in Linux CI.

## Deliberate Phase 3 boundaries

- No arbitrary code, shell, SQL, or URL execution is accepted from a plan.
- No E2B runtime or general Tool Service is included.
- No new business-domain implementation is included.
- PostgreSQL credentials remain server-side.
- Tool and model callbacks re-check service authentication, scope, registry
  membership, and authoritative permissions.
- Existing tool implementations remain the only business mutation boundary.
