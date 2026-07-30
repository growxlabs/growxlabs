# GXL Command Center Phase 8 production readiness

This document is the operational source of truth for the production-hardening
implemented in Phase 8. It describes only code that exists in this repository.

## Architecture and deployment

The supported request path remains:

```text
Browser
  -> Next.js UI and Gateway/BFF on Vercel
  -> api/private/gateway/index.go (the only Go Vercel function)
  -> modular Go handlers
  -> PostgreSQL / Cloudflare R2
```

Browser code calls only `/api/admin/command-center/*`. Private service URLs,
service JWT secrets, database credentials, R2 credentials, Redis credentials,
and Cron credentials are server-only variables. The Go gateway requires signed
service authentication in its downstream handlers. No worker, consumer,
infinite loop, Docker runtime, or filesystem persistence is required by the
Vercel application. Scheduler recovery is a bounded request invoked by a
Next.js Cron route.

`vercel.json` must continue to contain exactly one `.go` function:
`api/private/gateway/index.go`. Dockerfiles belonging to standalone Go services
are not part of the Vercel build.

## Environment variables

Production and preview must set the following server-side variables:

| Variable | Purpose |
| --- | --- |
| `APP_ENV` | `production` or `preview`; included in service JWTs and logs |
| `DATABASE_URL` | PostgreSQL connection used by Go services |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | Session signing and canonical auth URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL; intentionally public |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only PostgreSQL/Supabase access |
| `DEFAULT_ORGANISATION_ID`, `DEFAULT_WORKSPACE_ID` | Trusted scheduled-job scope |
| `EXECUTION_SERVICE_JWT_SECRET` | Server-to-server authentication |
| `INTERNAL_API_GATEWAY_URL` | Server-only consolidated gateway URL |
| `CRON_SECRET` | Vercel Cron bearer authentication |
| `HEALTHCHECK_SECRET` | Detailed readiness endpoint authentication |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Distributed rate limits and Cron leases |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Private artifact storage |
| `GEMINI_API_KEY` or `OPENROUTER_API_KEY` | At least one model provider |
| `SERPER_API_KEY` | Server-side web search provider used by search tools |
| `COMMAND_CENTER_LOG_LEVEL` | `DEBUG`, `INFO`, `WARN`, or `ERROR` |

Do not prefix private variables with `NEXT_PUBLIC_`. Development may omit
external services; production and preview fail startup validation through
`instrumentation.ts`. `.env.example` contains placeholders only.

## Database migration

Apply migrations in numeric order:

1. `0003_phase3_execution.sql`
2. `0004_phase4_services.sql`
3. `0005_phase5_governance.sql`
4. `0006_phase6_memory_artifacts_events_notifications.sql`
5. `0007_phase8_production_hardening.sql`

Migration `0007` is additive. It adds tenant/cursor/expiry/outbox indexes,
submission idempotency, artifact idempotency scope, notification preference
scope, retry metadata, and bounded SQL functions for event, notification, and
memory jobs. It also grants the new functions only to `service_role`.

Before deployment, run `npm run validate:migrations`, apply the migration in a
staging database, and call the authenticated readiness endpoint. A response
with `migration.compatible: false` blocks release.

## Rollback

Application rollback is the normal response to a failed release:

1. Stop Cron invocations for the affected deployment.
2. Roll Vercel back to the previous immutable deployment.
3. Do not reverse `0007` during an incident; its tables, columns, indexes, and
   functions are backward-compatible with Phase 7.
4. If R2 writes occurred, retain the private objects until metadata
   reconciliation completes. Do not delete by prefix without a reviewed list.
5. Re-enable Cron only after readiness and tenant-isolation smoke tests pass.

Destructive database rollback requires a separately reviewed migration and a
verified backup. Never edit an already-applied migration.

## Observability and incident response

Next.js and the Go gateway emit JSON logs with timestamps, environment,
service, route, request/trace IDs, scoped resource IDs when available,
duration, outcome, and error code. Recursive redaction removes authorization,
cookies, tokens, secrets, signed URLs, prompts, reasoning, and raw payload
fields. User responses contain a safe error code, message, retryability, and
request ID; stack traces, SQL details, and private URLs are not returned.

For an incident:

1. Record the deployment SHA and a failing request ID.
2. Check `/api/health` for liveness.
3. Call `/api/internal/health/readiness` with
   `Authorization: Bearer $HEALTHCHECK_SECRET`.
4. Correlate BFF and Go JSON logs by request/trace ID.
5. Pause the affected Cron path if retries could increase impact.
6. For R2 issues, disable artifact generation while preserving reads only if
   signed URL generation remains healthy.
7. For database saturation, inspect pool usage and slow queries; Go pools are
   bounded to three connections per warm function.
8. Roll back the application if a high-severity defect is confirmed.
9. Preserve audit records and write an incident timeline before cleanup.

The public liveness route intentionally exposes no topology. Detailed
readiness is secret-protected and returns only boolean dependency state,
version, environment, configuration key names, and migration compatibility.

## Error catalogue

| Code | HTTP | Retry |
| --- | ---: | --- |
| `AUTHENTICATION_REQUIRED` | 401 | no |
| `PERMISSION_DENIED`, `TENANT_SCOPE_INVALID`, `POLICY_DENIED` | 403 | no |
| `VALIDATION_FAILED` | 400 | no |
| `RESOURCE_NOT_FOUND` | 404 | no |
| `APPROVAL_REQUIRED`, `CONFLICT`, `IDEMPOTENCY_CONFLICT` | 409 | depends on code |
| `APPROVAL_EXPIRED`, `RESOURCE_EXPIRED` | 410 | no |
| `RATE_LIMITED` | 429 | yes; response includes retry metadata |
| `MODEL_FAILURE`, `TOOL_FAILURE` | 502 | yes only for transient provider failures |
| `DEPENDENCY_UNAVAILABLE`, `STORAGE_FAILURE`, `DATABASE_FAILURE` | 503 | yes |
| `TIMEOUT` | 504 | yes |
| `INTERNAL_ERROR` | 500 | yes |

## Rate limits and concurrency

Limits are enforced after server-derived authentication. The key contains the
operation, organisation, workspace, user, and source IP where relevant.
Upstash Redis is mandatory in production; expensive operations fail closed if
distributed abuse protection is unavailable.

| Operation | Limit |
| --- | ---: |
| Conversation submission | 12/minute |
| Model execution | 20/minute, 4 concurrent per instance |
| Tool execution | 30/minute, 8 concurrent per instance |
| Artifact generation | 5/minute |
| Artifact signed URLs and SSE connections | 20/minute |
| Memory mutations | 30/minute |
| Notification mutations | 60/minute |
| Governance mutations | 20/minute |
| Governance/list reads | 90/minute |
| Cron invocation | 4/minute |

Rate-limited responses include `Retry-After`, `RateLimit-Remaining`, and a
request ID. Submission and artifact mutations also use database-enforced
idempotency keys.

## Cache policy

| Data | Key and tenant scope | TTL/staleness | Invalidation and sensitivity |
| --- | --- | --- | --- |
| Next static assets | content hash | one year, immutable | build creates a new hash; public |
| Agent/tool/capability metadata | deployed version | process lifetime | deployment; internal |
| Command Center pages and APIs | user + org + workspace | `private, no-store` | every request; confidential |
| Conversations and memory | org + workspace + user/resource | no-store | mutation; confidential |
| Approvals, policies, audit, notifications | org + workspace + user/filter | no-store | mutation; confidential/restricted |
| Artifact lists | org + workspace | no-store | generation/deletion; confidential |
| Signed R2 URLs | artifact + authorised user | maximum 15 minutes | expiry/deletion; restricted |
| Security decisions | full authenticated scope | not shared | request end; restricted |

Shared caching is prohibited for tenant data, permission decisions, approvals,
audit results, mutable policy state, and signed URLs.

## Cron catalogue and runbook

All Command Center jobs run at most once daily on the Vercel Hobby-compatible
schedule. Requests require the Cron bearer secret, reject browser fetch
headers, take an Upstash lease with expiry, enforce a deadline, and emit a
structured summary.

| Route | Purpose | Bound |
| --- | --- | ---: |
| `expire-approvals` | expire pending governance approvals | upstream limit 100 |
| `process-audit-outbox` | persist governance audit outbox | upstream limit 100 |
| `process-events` | project durable event outbox records | 100 |
| `process-notifications` | deliver pending records to the in-product inbox | 100 |
| `compact-memory` | supersede exact duplicate memory outside legal hold | 100 |
| `expire-memory` | expire due memory outside legal hold | 100 |
| `clean-artifacts` | delete due R2 objects outside legal hold | 25 |
| `recover-execution` | recover stale leases and queue ready steps | Go service bound, max 100 |

If a job fails, use its request ID and checkpoint. Fix the dependency before
manual retry. The lease expires automatically; do not delete lock keys during
an active invocation. Jobs use `FOR UPDATE SKIP LOCKED` or tenant-safe object
selection and contain no unbounded loops.

## R2 lifecycle

The bucket must be private and credentials must be limited to the configured
bucket. Object keys are tenant-scoped and use sanitised filenames. Bytes are
uploaded with a SHA-256 checksum before metadata becomes available. Metadata
failure triggers object cleanup. Restricted access is checked against
organisation and workspace before issuing a SigV4 signed URL, limited to 15
minutes, and the issuance is audited. Legal hold blocks scheduled deletion.
Scheduled cleanup deletes the object before marking metadata deleted, so a
storage failure remains retryable and does not silently claim deletion.

Supported generators are PDF, DOCX, XLSX, CSV, PPTX, and Markdown/text.
Outputs are limited to 25 MiB. Spreadsheet cells beginning with `=`, `+`, `-`,
or `@` are quoted, and filenames neutralise traversal and unsafe characters.

## Retention and deletion

Memory and artifacts have explicit retention tables with legal-hold flags.
Memory expiry and compaction exclude legal hold. Artifact deletion requires
the creator for interactive deletion and a due retention record for scheduled
deletion. Audit events and approval decisions remain immutable. Notification
expiry changes inbox state without removing history. Execution/event/audit
retention must follow the configured workspace policy; no Phase 8 job
hard-deletes those records.

Privileged deletions must be correlated by request ID. R2 orphan
reconciliation must compare database object keys to a bounded bucket listing
before taking action.

## Backup and recovery

Enable managed PostgreSQL point-in-time recovery and verify a restore in a
non-production project. Back up R2 according to the organisation retention
policy or enable object versioning where required. Database and object backup
retention must be aligned: metadata without an object and an object without
metadata are both recovery defects. Keep deployment SHA, migration version,
and restore timestamp in the incident record.

## Release checklist

- Run `gofmt`, `go vet`, `go test`, and `go test -race` for every Go module.
- Run `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run build`.
- Run migration, isolation, security, SSE, Cron, and artifact safety tests.
- Run `npx vercel build` with production-equivalent environment variables.
- Inspect `.vercel/output/functions` and confirm one Go function.
- Exercise authenticated desktop/mobile Command Center flows.
- Verify readiness against the migrated staging database and private R2.
- Verify duplicate command/artifact/event delivery and stale lease recovery.
- Verify an expired signed URL and a legal-hold cleanup attempt.
- Deploy production, call liveness/readiness, and run a tenant-isolation smoke
  test.
- Push only after every mandatory check succeeds.
