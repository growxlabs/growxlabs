# HRMS Releases 01–03

This directory is the isolated, service-oriented replacement for the legacy HRMS.
The existing `app/api/hrms`, `app/admin/hrms`, `services/enterprise-hrms.ts`, and
legacy Supabase schema remain unchanged and are read-only migration references.

## Boundaries

- `gateway`: the only HRMS API consumed by the Next.js application.
- `people`: owns employee, organisation, department, designation, and reporting data.
- `identity`: owns users, invitations, roles, permissions, and role assignments.
- `recruitment`: owns requisitions, approvals, jobs, canonical candidates,
  applications, pipelines, talent pools, interviews, feedback, and AI results.
- `onboarding`: owns immutable offer versions and responses, offer approvals,
  candidate conversion sagas, onboarding templates/tasks, verification,
  probation, and the asset/training/background foundations.
- `migrations`: PostgreSQL schemas owned by the Release 01 services.

The gateway passes an authenticated actor, organisation, request ID, and evaluated
permissions to downstream services. Services still enforce their own permissions.
No service writes another service's schema.

## Local configuration

Copy `.env.example` values into the deployment secret store. Run the migration with
a PostgreSQL role that can create schemas, then start each Go service:

```text
cd platform/hrms/people
go run ./cmd/migrate
go run ./cmd/server

cd ../identity
go run ./cmd/server

cd ../gateway
go run ./cmd/server

cd ../recruitment
go run ./cmd/server
go run ./cmd/ai-worker

cd ../onboarding
go run ./cmd/server
go run ./cmd/conversion-worker
go run ./cmd/activation-worker
```

The migration runner uses an advisory lock, checksums applied files, and executes each
migration atomically. It refuses to continue if an applied migration was edited.

The Next.js gateway route uses `HRMS_GATEWAY_URL`. If it is not configured it returns
`503`, never falling back to direct database access.

Set `DEFAULT_ORGANISATION_ID` during the single-organisation transition. Identity
records must use the same UUID. Remove the fallback when organisation selection is
added to the primary login flow.

For the first organisation only, call `POST /v1/identity/bootstrap` with a long-lived
random value supplied in `X-Bootstrap-Token`. The body contains `organisationId`,
`userId`, `email`, and `displayName`. This creates a database role containing the
current permission catalogue and links the migration administrator. Remove
`HRMS_BOOTSTRAP_TOKEN` after bootstrap; the endpoint then disables itself.

## Release 01 API

- People: organisations, directory, profiles, employment changes, immutable history,
  audit, departments, designations, reporting hierarchy, self profile, and manager team.
- Identity: invitations, activation, suspension/reactivation, roles, permissions, and
  resolved user permissions.
- Documents: private Supabase Storage upload/download URLs with metadata and append-only access logs.
- Workflow: versioned definitions and instances with immutable transition history.
- Notifications: reusable email/in-app records and a transactional delivery outbox.

All mutations that this release exposes write an `audit.events` record in the same
database transaction. Updates use `If-Match` versions where concurrent edits exist.

## Storage providers

Document handlers depend on the `StorageProvider` interface, never on Supabase APIs.
`SupabaseStorageProvider` is the active Release 01 adapter. It supports server uploads,
downloads, deletion, signed downloads, and signed browser uploads. The bucket remains
private and the service-role key is never sent to the browser.

A future `R2StorageProvider` only needs to implement the same interface; no document,
workflow, audit, API, or UI code needs to change.

## Release 02 ATS

Release 02 adds a public careers portal and a permission-scoped ATS. Hiring starts
with a requisition and department-head/HR approval, then creates a draft job against
a configurable pipeline. Published jobs accept consented candidate applications.
Resume files use the Release 01 document service and private Supabase Storage; the
recruitment schema stores only document IDs.

The AI worker extracts PDF, DOCX, or text resumes, calls the configured Gemini model,
and stores immutable summaries, skills, concerns, and match scores. AI output is
decision support only. Recruiters retain stage control and every stage move,
interview, feedback submission, and score is recorded in both the recruitment
timeline and the shared audit log.

Set `RECRUITMENT_SERVICE_URL`, `RECRUITMENT_SERVICE_ACTOR_ID`, `GEMINI_API_KEY`, and
`RECRUITMENT_AI_MODEL`. The web careers portal also requires
`NEXT_PUBLIC_DEFAULT_ORGANISATION_ID`.

## Release 03 offers and onboarding

Offers are append-only versions. Submitting an offer starts a published Release 01
workflow instance with hiring-manager and HR-manager approval transitions. Sending
an approved offer generates offer-letter, compensation, NDA, and employment-agreement
documents through the People document API; the active provider is private Supabase
Storage.

Candidate acceptance creates an idempotent conversion job. The conversion worker
invites the identity user, creates a probationary People employee/employment record,
preserves the recruitment candidate, instantiates dependency-aware onboarding tasks,
and creates probation, asset-request, and training foundations. A separate activation
worker changes employment to active only after the accepted offer, employee record,
required uploads, verified identity, and required checklist are complete.

Sensitive onboarding information is AES-GCM encrypted using
`ONBOARDING_ENCRYPTION_KEY`. Configure `ONBOARDING_EMPLOYEE_ROLE_ID` with the employee
role assigned to invitations. Offer links are single-response opaque tokens and are
invalidated after acceptance, rejection, requested changes, withdrawal, or expiry.

## Migration

1. Keep the legacy HRMS live.
2. Import records through an idempotent migration job into `people.*`.
3. Reconcile counts and immutable history.
4. Move consumers to `/api/v1/hrms`.
5. Retire legacy writes only after acceptance and rollback windows have passed.

## Release 04 attendance and leave

Release 04 runs natively in Next.js route handlers and Supabase transactions. The
`attendance` and `leave` schemas are separate domains and integrate only through
their transactional outboxes. Clock events and leave-ledger entries are immutable;
corrections and reversals are appended instead of rewriting history.

Employee self-service is available at `/people/time-and-leave`, with leave submission
at `/people/leave/request`. HR configuration visibility is at
`/admin/attendance-leave`. The domain APIs are mounted at
`/api/v1/hrms/attendance/*` and `/api/v1/hrms/leave/*`; these more-specific routes do
not use the Release 01–03 gateway catch-all.

Apply migrations `0005`, `0006`, and `0007` in order. Configure `CRON_SECRET` and
`HRMS_SYSTEM_ACTOR_USER_ID` in Vercel. Vercel invokes bounded routes for daily
attendance closeout, monthly accrual, and annual carry-forward. Repeated accrual and
carry-forward invocations are safe because ledger idempotency keys are unique.
Upstash Redis is optional and provides distributed punch rate limiting and fast
duplicate suppression; the database remains the authoritative idempotency boundary.

For legacy migration, stage source identifiers in
`attendance.legacy_migration_items` and `leave.legacy_migration_items`, resolve every
row to a canonical People employee, import in bounded batches, and compare source
counts with rows marked `imported`. Rows marked `failed` retain the error and original
metadata for repair and replay. Keep legacy writes enabled until counts, sampled
balances, daily totals, and approval histories reconcile.

## Release 05 documents, assets, and learning

Release 05 extends the existing `documents` schema and People service; it does not
create a second document library or bypass `StorageProvider`. Assets and Learning are
independent Go services on ports 8085 and 8086 with their own schemas, repositories,
transactional services, permission checks, immutable histories, audit events, and
outboxes. The gateway exposes them below `/v1/documents`, `/v1/assets`, and
`/v1/learning`.

Apply migrations `0008` through `0012` in order. Configure the service URLs and actor
IDs in `.env.example`. Employee, manager, and HR workspaces are available under
`/me/{documents,assets,learning}`, `/team/{documents,assets,learning}`, and
`/hr/{documents,assets,learning}`.

Vercel Cron runs bounded expiry, warranty, learning reminder, and outbox-dispatch
batches. Domain outboxes are published through QStash to a signed worker endpoint,
which calls the existing notification service through the gateway. The onboarding
Release 05 worker consumes the existing `employee.activated` outbox event and creates
document requests, asset requests, and course enrollments through domain APIs. The
certificate worker creates a versioned HTML completion certificate using the People
document API and therefore the configured `StorageProvider`; it never calls Supabase
Storage directly.

No Release 05 worker is a long-running server. Each worker processes a bounded batch
and exits, so it can be invoked by QStash or a scheduled platform job.

## Releases 05–10 final architecture revision

The final cross-release architecture audit is documented in
`docs/hrms-release-05-10-final-architecture-audit.md`. Existing migrations keep
their immutable historical numbers even where later product naming changed.
After applying `0001` through `0017`, apply
`0018_release_05_10_architecture_revision.sql`.

Migration `0018` adds the shared outbox, idempotency, saved-view, background-job,
dashboard, common metadata, and missing enterprise-domain foundations. It is
additive and does not by itself mark Releases 05–10 complete. Performance,
Payroll, Workforce, and Enterprise Platform still require their prototype
in-memory repositories and `cmd/server` business logic to be replaced with
PostgreSQL-backed Clean Architecture packages before production acceptance.
