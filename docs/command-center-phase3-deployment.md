# Command Center Phase 3 deployment

## Deployment boundary

| Component | Deployment target | Browser-accessible |
| --- | --- | --- |
| Next.js UI, Gateway/BFF, Phase 2 orchestrator and Planner | Vercel | Yes |
| Go Execution Engine | Bounded Vercel Go Function | No |
| Go Task Scheduler | Bounded Vercel invocation | No |
| Go Execution Worker | Bounded Vercel invocation | No |
| PostgreSQL | Managed PostgreSQL / Supabase | No |
| NATS JetStream | Managed or separately hosted NATS when enabled | No |
| Redis | Managed Redis when enabled | No |
| Artifact storage | Cloudflare R2 | Only through signed server APIs |

Phase 3 currently uses its PostgreSQL durable queue and event log. NATS
JetStream and Redis are separate managed infrastructure boundaries for the
future transport/cache integrations; neither is started by Vercel. Artifact
access remains server-mediated and credentials must never be sent to a browser.

Production uses the Vercel Go Function adapters described in
`command-center-vercel-go.md`. Service-level Dockerfiles are unused optional
local artifacts; Docker is not part of deployment, verification, or Phase
completion.

## Browser and service flow

```text
Browser
  -> Vercel Next.js Gateway/BFF
     -> authenticated Execution Engine request
        -> PostgreSQL durable state
        -> Task Scheduler
        -> Execution Worker
           -> authenticated Next.js tool/model compatibility adapter
```

The browser only calls Next.js routes. Run identifiers and safe execution
events may be returned to the browser, but internal URLs, database credentials,
service JWT secrets and infrastructure credentials are never returned.

## Vercel configuration

Keep the existing repository root, Next.js preset, build command and route
configuration. No `vercel.json` change is required for Phase 3.

Configure these server-only environment variables in Vercel:

```text
COMMAND_CENTER_PHASE3_EXECUTION_ENABLED=true
EXECUTION_ENGINE_INTERNAL_URL=https://execution-engine.internal.example.com
EXECUTION_SCHEDULER_INTERNAL_URL=https://task-scheduler.internal.example.com
EXECUTION_WORKER_INTERNAL_URL=https://execution-worker.internal.example.com
EXECUTION_SERVICE_JWT_SECRET=<shared high-entropy secret>
APP_ENV=production
```

The URLs are same-deployment Vercel Go Function addresses protected by
short-lived service JWTs. Despite the `INTERNAL_URL` naming, these values are
server-only connection details, not browser configuration.

Never create any of the following:

```text
NEXT_PUBLIC_EXECUTION_ENGINE_INTERNAL_URL
NEXT_PUBLIC_EXECUTION_SCHEDULER_INTERNAL_URL
NEXT_PUBLIC_EXECUTION_WORKER_INTERNAL_URL
NEXT_PUBLIC_EXECUTION_SERVICE_JWT_SECRET
```

If the engine is unavailable, the Gateway emits a safe recoverable SSE error,
records a structured warning without credentials, and continues through the
existing synchronous Command Center path. Keep
`COMMAND_CENTER_PHASE3_EXECUTION_ENABLED=false` until the migration and
external services are ready.

## External Go service configuration

All three services require:

```text
DATABASE_URL=<managed PostgreSQL connection string>
APP_ENV=production
```

Execution Engine:

```text
EXECUTION_ENGINE_ADDRESS=:8091
EXECUTION_SERVICE_JWT_SECRET=<same value as Vercel>
```

Task Scheduler:

```text
TASK_SCHEDULER_ADDRESS=:8092
SCHEDULER_BATCH_SIZE=50
SCHEDULER_INTERVAL_MS=1000
```

Execution Worker:

```text
EXECUTION_WORKER_ADDRESS=:8093
EXECUTION_WORKER_ID=worker-production-1
GXL_WEB_BASE_URL=https://your-vercel-domain.example
EXECUTION_SERVICE_JWT_SECRET=<same value as Vercel>
WORKER_LEASE_SECONDS=90
WORKER_POLL_MS=500
```

Restrict the Go service ingress wherever the hosting platform permits it. The
Execution Engine accepts only authenticated internal service calls. Worker
callbacks to Next.js use a separate issuer/audience pair over HTTPS.

## Vercel runtime confirmation

The root `package.json` scripts invoke only Next.js, ESLint and Node tests.
There is no `go run`, compiled Go binary, Docker invocation, worker loop,
scheduler loop, NATS consumer or persistent process in the Vercel build or
runtime configuration.
