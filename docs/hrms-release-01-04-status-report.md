# HRMS Releases 01–04 Status Report

**Report date:** 30 July 2026  
**Scope:** Work completed before Release 05  
**Overall status:** **Implemented but not production-accepted**

## Executive summary

The repository contains substantial implementations for Releases 01–04 across
the Go services, Next.js gateway/UI, PostgreSQL migrations, background workers,
permission enforcement, audit/outbox foundations, and automated tests.

- **Estimated source implementation coverage:** approximately **90%**
- **Estimated verified acceptance coverage:** approximately **60%**
- **Release 05 readiness:** code foundations exist, but Releases 01–04 should not
  be called production-complete until their migrations and live end-to-end flows
  are verified against Supabase and the deployed services.

The two percentages intentionally measure different things. The implementation
is present in the repository, while production acceptance requires database,
storage, worker, authentication, and scheduled-job verification using real
deployment credentials.

## Status by release

| Release | Estimated implementation | Current status | Main remaining verification |
| --- | ---: | --- | --- |
| Release 01 — Foundation and People Core | 90% | Partially complete | Apply migrations, verify Supabase Storage bucket, bootstrap identity, and run live People/RBAC/document workflows |
| Release 02 — Careers and Recruitment | 90% | Partially complete | Apply ATS migration and verify public application, private resume storage, AI worker, interviews, feedback, and tenant isolation |
| Release 03 — Offers and Onboarding | 88% | Partially complete | Apply onboarding migration and verify offer approval, signed response, conversion worker, activation worker, encryption, and rollback paths |
| Release 04 — Attendance, Shifts and Leave | 92% | Partially complete | Apply three Release 04 migrations and verify live punches, approvals, ledgers, Cron execution, rate limiting, and legacy reconciliation |

## Release 01 — Foundation and People Core

### Implemented

- Separate `people`, `identity`, and `gateway` Go modules.
- Organisation, employee directory, employee profile, department,
  designation, reporting hierarchy, self-service, and manager-team APIs.
- Identity invitations, activation, suspension/reactivation, roles,
  permissions, assignments, and permission resolution.
- Backend organisation context and permission checks through the HRMS gateway
  and downstream services.
- Audit, workflow, notification, delivery-outbox, and document foundations.
- `StorageProvider` interface with upload, download, delete, signed download,
  and signed browser-upload operations.
- `SupabaseStorageProvider` is isolated behind that interface; UI code does not
  access Supabase Storage directly.
- Next.js People Directory, structure, access, team, and employee self-service
  screens.
- Migration runner with advisory locking, checksums, and atomic execution.

### Partial or unverified

- Migration `0001_release_01.sql` has not been verified as applied to the live
  Supabase project.
- The private `hrms-documents` bucket from `0002_supabase_storage.sql` is not
  confirmed healthy. Previous SQL execution encountered Supabase ownership
  restrictions.
- Identity bootstrap and removal of `HRMS_BOOTSTRAP_TOKEN` have not been
  verified in production.
- No recorded live end-to-end proof covers invite → activate → role assignment
  → employee access → document upload/download.
- A future `R2StorageProvider` is architecturally possible but is not required
  for Release 01 because Supabase Storage is the selected provider.

## Release 02 — Careers and Recruitment

### Implemented

- Dedicated recruitment Go service and AI worker.
- Requisitions, department-head/HR approvals, jobs, configurable pipelines,
  candidates, applications, talent pools, interviews, feedback, and stage
  history.
- Public careers pages and application APIs.
- Resume references use the shared document service; recruitment stores
  document identifiers rather than bypassing the storage abstraction.
- AI resume extraction and matching worker with bounded attempts and immutable
  analysis records.
- Recruiter, hiring-manager, and operations workspaces.
- Audit and tenant-scoped mutation paths are present.

### Partial or unverified

- Migration `0003_recruitment_release_02.sql` is not confirmed applied live.
- Public careers requires a correctly configured organisation identifier and
  deployed gateway/service URLs.
- Gemini-backed resume processing has not been verified using production
  credentials and real PDF/DOCX samples.
- Full live checks for duplicate candidates, consent, pipeline movement,
  interview feedback, organisation isolation, and failure recovery remain.

## Release 03 — Offers and Employee Onboarding

### Implemented

- Dedicated onboarding Go service.
- Immutable offer versions, approval records, workflow instances, response
  tokens, withdrawal, expiry, rejection, acceptance, and requested changes.
- Offer-related documents use the People document API and configured
  `StorageProvider`.
- Idempotent candidate-conversion worker.
- Identity invitation, probationary employee/employment creation, onboarding
  instances, dependency-aware tasks, verification, probation, asset-request,
  and training foundations.
- Activation worker checks accepted offer, employee record, required uploads,
  verified identity, and required checklist before activation.
- AES-GCM handling for sensitive onboarding data.
- Employee and administrative onboarding UIs and APIs.

### Partial or unverified

- Migration `0004_offer_onboarding_release_03.sql` is not confirmed applied
  live.
- Required production values such as `ONBOARDING_ENCRYPTION_KEY` and
  `ONBOARDING_EMPLOYEE_ROLE_ID` are not confirmed.
- Conversion and activation workers pass repository tests but have not been
  observed against the live database, identity service, document provider, and
  notification delivery chain.
- Expired/replayed links, partial conversion recovery, and complete rollback
  scenarios still need deployment-level verification.

## Release 04 — Attendance, Shifts and Leave

### Implemented

- Independent `attendance` and `leave` schemas and repository/service layers.
- Shift configuration, immutable clock events, daily calculations, breaks,
  late time, overtime, cross-midnight handling, and missing-punch detection.
- Leave policies, requests, approvals, immutable ledgers, balances, accrual,
  carry-forward, holidays, weekends, half days, and sandwich rules.
- Corrections and reversals are append-only rather than destructive rewrites.
- Transactional audit and outbox contracts.
- Employee time-and-leave, leave-request, and HR configuration screens.
- Dedicated Next.js gateway routes for attendance and leave.
- Bounded Vercel Cron routes for attendance closeout, accrual, and
  carry-forward.
- Database idempotency boundaries with optional Upstash Redis acceleration.
- Legacy migration staging and reconciliation structures.

### Verification completed

Eight deterministic engine tests pass:

- Attendance sequencing
- Break, late-time, and overtime calculation
- Cross-midnight shifts
- Missing-punch detection
- Full-day and half-day leave
- Holiday/weekend and sandwich behavior
- Immutable-ledger balance derivation
- Accrual and carry-forward

### Partial or unverified

- Migrations `0005_attendance_leave_release_04.sql`,
  `0006_release_04_transactional_contracts.sql`, and
  `0007_release_04_scheduled_operations.sql` are not confirmed applied live.
- Vercel Cron authentication and execution history are not verified with the
  deployed environment.
- Live concurrency, duplicate punch, approval race, timezone, DST, ledger
  reversal, organisation-isolation, and legacy-data reconciliation tests
  remain.

## Verification performed for this report

- Current Next.js production build: **passed** (`npm run build`, 325 pages).
- Release 04 attendance/leave engine tests: **8/8 passed**.
- Go tests using a workspace-local build cache:
  - People service: **passed**
  - Identity service: **passed**
  - HRMS gateway: **passed**
  - Recruitment service and AI worker: **passed**
  - Onboarding service and conversion worker: **passed**
- Source inspection confirms the `StorageProvider` abstraction and
  `SupabaseStorageProvider` implementation.

These are repository-level checks. They do not prove live Supabase migrations,
storage permissions, service credentials, external AI calls, email delivery, or
production Cron execution.

## Database work required before production acceptance

Apply the HRMS migrations in order:

1. `0001_release_01.sql`
2. `0002_supabase_storage.sql`
3. `0003_recruitment_release_02.sql`
4. `0004_offer_onboarding_release_03.sql`
5. `0005_attendance_leave_release_04.sql`
6. `0006_release_04_transactional_contracts.sql`
7. `0007_release_04_scheduled_operations.sql`

The storage migration must be handled using Supabase-supported bucket creation
and policies if the SQL Editor reports ownership errors for Supabase-managed
`storage` tables.

## Release decision

**Do not label Releases 01–04 fully complete yet.** The implementation is
advanced enough to proceed with Release 05 development, but the production
acceptance gate remains open.

Before declaring Releases 01–04 complete:

1. Apply and record all seven HRMS migrations in staging.
2. Configure and verify all server-only environment variables.
3. Bootstrap the initial identity administrator and disable the bootstrap
   token.
4. Verify the private document bucket through the People API.
5. Execute one organisation-isolated end-to-end scenario for each release.
6. Run workers and scheduled jobs against staging and verify audit/outbox
   records.
7. Re-run builds and tests using production-equivalent configuration.
