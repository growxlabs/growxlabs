# GrowXLabs HRMS, People Operations & Careers

## Implementation Inventory and Production Gap Audit

Status: **Conditionally approved — production verification remains outstanding**

This document is an inventory of repository evidence. It is not proof that the
deployed environment is complete or healthy.

## Verified repository inventory

### Next.js

- Canonical HRMS BFF: `app/api/v1/hrms/[...path]/route.ts`
- People UI: employee directory, departments, designations, team and access
- Recruitment UI: requisitions, jobs, pipelines, candidates and interviews
- Careers UI: public jobs, job details, candidate authentication and application
- TanStack Query is used for People, Recruitment and public careers server state

### Go services

- `platform/hrms/gateway`
- `platform/hrms/people`
- `platform/hrms/identity`
- `platform/hrms/recruitment`
- `platform/hrms/onboarding`
- `platform/hrms/assets`
- `platform/hrms/learning`
- `platform/hrms/performance`
- `platform/hrms/payroll`
- `platform/hrms/workforce`
- `platform/hrms/platform`

The People service is PostgreSQL-backed and exposes `/health`, `/ready` and
`/healthz`. The Gateway forwards runtime `/v1/people/{path}` requests to it.

### Background processes already present

- People notification worker
- Recruitment AI worker
- Onboarding conversion, activation and Release 05 workers
- Learning certificate worker

These workers are standalone Go processes. They do not run inside Vercel.

### Database migrations

- `0001_release_01.sql` contains the original People, Identity, Audit, Workflow,
  Documents and Notification foundations.
- `0003_recruitment_release_02.sql` contains requisitions, approvals, pipelines,
  stages, jobs, candidates, applications, AI results, interviews and activities.
- `0008_release_05_documents.sql` extends controlled document storage.
- `0019_careers_candidate_platform.sql` is a later additive Careers migration.
- `0020_people_persistence_hardening.sql` hardens People reference persistence.
- `0021_recruitment_production_hardening.sql` adds recruitment histories,
  versions, publications, screening questions, consent, idempotency and outbox.

## Correct runtime endpoints

Filesystem parameters use `[id]` and `[slug]`. Runtime API documentation uses:

```text
/api/v1/hrms/people/departments/{id}
/api/v1/hrms/recruitment/requisitions/{id}/submit
/api/v1/hrms/recruitment/jobs/{id}/publish
/api/v1/hrms/recruitment/public/jobs/{slug}
/api/v1/hrms/recruitment/public/jobs/{slug}/applications
```

## Reliability and security corrections in this audit

- Removed UI-created fake requisitions and jobs.
- Removed success messages emitted after failed Recruitment requests.
- Removed localStorage-based candidate authentication and direct identity entry.
- Candidate identity now requires the server-issued Google/NextAuth session.
- Candidate sessions are rejected from non-public HRMS BFF routes.
- Public organisation context is injected by the server-side BFF.
- The application API no longer accepts organisation identity from request JSON.
- Application submission requires an idempotency key.
- Resume metadata is limited to PDF or DOCX and 10 MB.
- Application records, audit records, consent and outbox events share a database
  transaction.
- Requisition and job detail endpoints are registered.
- Recruitment health and readiness endpoints are registered.

## Still incomplete or unverified

- Migrations 0020 and 0021 have not been verified against the production database.
- External Gateway, People and Recruitment deployments were not reachable from
  this local audit.
- Communication delivery is not a complete independent platform. The repository
  has a notification worker, but recruitment-specific templates, webhook
  ingestion, bounce processing, scheduler, retry dashboard and dead-letter
  operations are not fully implemented.
- Resume upload uses the controlled Document foundation, but upload completion,
  file-signature verification and virus-scanner evidence are incomplete.
- Candidate dashboard SSE is not implemented; do not call it real-time.
- Configurable workflow delegation, escalation and arbitrary parallel approvals
  are not proven.
- People locations, job families, cost centres and reporting relationships are
  not exposed as complete independent CRUD modules.
- Production cross-tenant, RBAC, OAuth and email-delivery tests remain required.

## Required deployment order

1. Back up the production PostgreSQL database.
2. Apply migrations through `0020_people_persistence_hardening.sql`.
3. Apply `0021_recruitment_production_hardening.sql`.
4. Deploy People and Recruitment Go services.
5. Deploy the HRMS Gateway with matching service URLs and shared secret.
6. Redeploy Vercel with the matching Gateway, organisation and authentication
   variables.
7. Start the standalone notification and AI workers.
8. Execute the production verification matrix below.

## Production verification matrix

| Area | Required evidence |
|---|---|
| People service | `/health` and `/ready` return 200 |
| Departments | Create, list, refresh and status persistence |
| Designations | Create, list, refresh and status persistence |
| Requisitions | POST returns 201 UUID and draft survives refresh/login |
| Approval | Invalid transitions return 409 |
| Jobs | Published job appears on public Careers API |
| Candidate auth | Google session is server-issued as `CANDIDATE` |
| Security | Candidate receives 403 from internal HRMS APIs |
| Application | Idempotent submission persists under job organisation |
| Resume | Private upload, completion and document association succeed |
| Pipeline | Stage move persists and creates history/outbox |
| Communication | Outbox delivery and provider receipt are recorded |
| Isolation | Organisation A cannot read or mutate Organisation B |
| Build | Vercel production build completes without fallbacks |

## Current decision

```text
Architecture and repository inventory: verified locally
False-success UI paths: removed
People and Recruitment local compilation/tests: passing
Production implementation: not yet proven
Communication platform: partial
End-to-end production acceptance: pending
```
