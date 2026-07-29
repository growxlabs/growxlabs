# Command Center: Vercel-only Go deployment

The Next.js application and bounded Go request handlers deploy as one Vercel
project. Docker is not required for production, CI, local verification, or
Phase completion.

## Runtime classification

| Component | Category | Production invocation |
| --- | --- | --- |
| Execution Engine HTTP API | Request/response | `/api/internal/execution` |
| Tool Service | Request/response | `/api/internal/tools` |
| Capability Service | Request/response | `/api/internal/capabilities` |
| Skill Service | Request/response | `/api/internal/skills` |
| Internal API Gateway | Request/response | `/api/internal/gateway` |
| CRM Service | Request/response | `/api/internal/crm` |
| Finance Service | Request/response | `/api/internal/finance` |
| HR Service | Request/response | `/api/internal/hr` |
| Project Service | Request/response | `/api/internal/projects` |
| Marketing Service | Request/response | `/api/internal/marketing` |
| Execution Worker | Persistent design converted to bounded invocation | `/api/internal/worker?limit=1` |
| Task Scheduler | Persistent design converted to bounded invocation | `/api/internal/scheduler` |

The twelve files under `api/internal` are thin Vercel Go Runtime entrypoints.
They import the existing service packages; domain SQL, state machines,
idempotency, leases, validation, and business contracts were not rewritten.

The `services/*/cmd/server` programs remain optional local development
utilities. They are not referenced by `package.json`, Next.js, `vercel.json`,
or any Vercel build command and are not production entrypoints.

## Bounded execution

Worker `ProcessBatch` executes at most ten persisted queue items and returns
without polling. Scheduler `ProcessBatch` performs one atomic tick: it recovers
expired leases, queues a bounded set of ready steps, and returns. Execution
Engine create/read/cancel/event operations are already bounded HTTP requests.
No Vercel invocation starts a listener, polling loop, or consumer.

## Events and NATS

PostgreSQL execution events and the transactional domain-event outbox remain
the durable source of truth. Request-bound publishing is compatible with
Vercel. Permanent NATS consumption is not; future delivery must call bounded
authenticated handlers or drain bounded outbox batches.

## PostgreSQL

Functions initialise pools lazily with five-second startup deadlines, zero
minimum connections, and at most three connections per warm instance. Failed
readiness checks cause reconnection. Correctness does not depend on warm memory
or writable filesystem persistence.

## Private routing and environment

Browsers call only Next.js routes. Go endpoints require signed service
authentication. Configure these as server-only variables:

```text
EXECUTION_ENGINE_INTERNAL_URL=https://<deployment>/api/internal/execution
INTERNAL_API_GATEWAY_URL=https://<deployment>/api/internal/gateway
TOOL_SERVICE_INTERNAL_URL=https://<deployment>/api/internal/tools
CAPABILITY_SERVICE_INTERNAL_URL=https://<deployment>/api/internal/capabilities
SKILL_SERVICE_INTERNAL_URL=https://<deployment>/api/internal/skills
CRM_SERVICE_INTERNAL_URL=https://<deployment>/api/internal/crm
FINANCE_SERVICE_INTERNAL_URL=https://<deployment>/api/internal/finance
HR_SERVICE_INTERNAL_URL=https://<deployment>/api/internal/hr
PROJECT_SERVICE_INTERNAL_URL=https://<deployment>/api/internal/projects
MARKETING_SERVICE_INTERNAL_URL=https://<deployment>/api/internal/marketing
EXECUTION_SERVICE_JWT_SECRET=<server-only secret>
APP_ENV=production
DATABASE_URL=<Supabase pooler/serverless PostgreSQL URL>
```

None may use the `NEXT_PUBLIC_` prefix.

Because each Go file is one Vercel Function, signed callers invoke the exact
function URL and pass the versioned service route in
`X-GXL-Internal-Path`. The internal gateway replaces this header from its own
validated routing decision before forwarding; browsers cannot use it to bypass
service authentication or tenant/permission checks.

## Docker and limits

Service Dockerfiles are retained only as unused optional artifacts. Docker
commands are not part of deployment or validation.

Vercel does not provide a permanent consumer, exact sub-minute Hobby cron, or
durable process memory. Such work must use authenticated request delivery plus
PostgreSQL leases and idempotency.
