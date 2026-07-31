# HRMS Releases 05–10 Final Architecture Audit

**Audit date:** 31 July 2026  
**Decision:** Approved architecture, remediation in progress  
**Completion status:** Not release-complete

## Executive finding

The repository already contains broad functional prototypes for Performance,
Learning, Payroll, Workforce, and Enterprise Platform. It also contains mature
Release 05 Documents and Assets services. However, the newer prototypes do not
yet meet the final architecture standard.

The most important findings were:

- Performance, Payroll, Workforce, and Platform keep state in process-local
  maps instead of PostgreSQL.
- Business handlers and wiring remain concentrated under `cmd/server`.
- Several Next.js routes called `localhost` services directly, bypassing the
  HRMS Gateway, session-derived organisation context, and permission
  resolution.
- Multiple services substitute `org_default` when tenant context is missing.
- AI assistants return locally generated advice rather than calling the shared
  AI service.
- Several migrations lack the complete metadata contract.
- Release-specific enterprise features are missing from the data model.
- Search, saved views, bulk operations, import/export, configurable dashboards,
  and shared background-job contracts are not consistently implemented.
- Test suites exist but do not cover all mandatory integration, RBAC, tenant,
  workflow, performance, E2E, accessibility, and load gates.

No Release 05–10 module should be marked complete until these gaps are closed.

## Release-number compatibility

The repository previously used:

- Release 05: Documents, Assets, and Learning
- Release 06: Performance
- Release 07: Learning expansion
- Release 08: Payroll
- Release 09: Workforce
- Release 10: Enterprise Platform

The final instruction now calls Payroll “Release 05” and Compensation
“Release 08”. Applied migrations must never be renamed or rewritten.
Therefore:

- Existing migrations `0008`–`0017` retain their historical filenames.
- Migration `0018_release_05_10_architecture_revision.sql` adds the final
  requirements without destructive rewrites.
- Product documentation may use the final business labels, while migration
  ordering continues to use immutable numeric identifiers.

## Compliance matrix

| Standard | Current assessment | Evidence/remediation |
| --- | --- | --- |
| Independent Go services | Partial | Service modules exist; Compensation needs its own complete runtime |
| Clean Architecture | Non-compliant for newer prototypes | Business code remains under `cmd/server`; incremental refactor required |
| Gateway-only browser access | Corrected | Direct localhost Next.js proxy routes removed; generic authenticated HRMS BFF now owns routing |
| PostgreSQL persistence | Non-compliant for newer prototypes | Performance, Payroll, Workforce, and Platform still use memory repositories |
| Additive migrations | Compliant direction | New `0018` is additive and does not rewrite `0013`–`0017` |
| Common entity metadata | Partially corrected | `0018` adds common metadata columns non-destructively across `hrms_*` tables |
| Audit for every action | Partial | Mature services use `audit.events`; prototypes require transactional audit integration |
| Shared notification service | Partial | Outbox foundation exists; prototype actions are not all publishing events |
| Shared document service | Partial | Mature domains comply; payroll exports/rewards statements need worker integration |
| Shared workflow engine | Partial | Existing workflow foundation exists; new approvals must stop hardcoding status transitions |
| Search/views/bulk/export | Foundation added | Saved views and background-job contracts added; APIs/UI still required |
| Configurable dashboards | Foundation added | Widget configuration table added; role dashboards remain incomplete |
| Shared advisory AI | Non-compliant | Prototype AI files are local/hardcoded and must become shared AI clients |
| JWT/RBAC/tenant isolation | Partial | Gateway path corrected; downstream prototype middleware still needs strict fail-closed enforcement |
| Rate limiting/idempotency/CSRF | Partial | Gateway rate limit and BFF protection exist; shared idempotency contract added |
| Transactional outbox | Foundation added | Shared outbox table added; every mutation must adopt it transactionally |
| Bounded background jobs | Foundation added | Shared job table added; job processors and schedules remain incomplete |
| Observability | Partial | Gateway has request context; each service needs structured logs, metrics, traces, readiness, and slow-query logging |
| Mandatory test matrix | Non-compliant | Existing tests pass but required integration/E2E/load/accessibility coverage is incomplete |

## Remediation already applied

1. Removed five direct Next.js-to-local-service routes:
   - Performance
   - Payroll
   - Learning
   - Workforce
   - Platform
2. All browser traffic for those modules now resolves through the generic
   authenticated `/api/v1/hrms/[...path]` BFF and HRMS Gateway.
3. Added migration `0018_release_05_10_architecture_revision.sql`.
4. Added shared persisted contracts for:
   - Transactional outbox
   - Idempotency
   - Saved views
   - Background jobs
   - Configurable dashboard widgets
5. Added missing data foundations for:
   - Retroactive payroll, simulation, rollback, tax rules, FX, bank/GL export,
     and reconciliation
   - Talent matrix, promotion readiness, and compensation recommendations
   - SCORM, xAPI, learning providers, course generation, certification
     marketplace, and skill passport
   - Flexible benefits, equity, benchmarks, total rewards, and budgets
   - Shift planning, desk/space, fleet, marketplace, and communities
   - Feature flags, plugins, API products, event replay, warehouse connectors,
     AI agents, enterprise policies, and automation definitions
6. Added the common metadata columns to HRMS tables through an additive,
   repeatable migration block.

## Required implementation sequence

### Gate A — Shared platform contracts

- Finalize common actor/context middleware.
- Add strict service authentication and fail-closed organisation context.
- Provide shared PostgreSQL transaction helpers.
- Provide shared audit/outbox/idempotency APIs.
- Connect shared Workflow, Notification, Document, and AI service clients.
- Add common query, pagination, saved-view, import/export, job, and
  observability contracts.

### Gate B — Payroll

- Replace memory repository with PostgreSQL.
- Move domain, repository, service, handler, validator, events, jobs,
  middleware, mapper, DTO, and AI client into separate packages.
- Implement simulation before approval, immutable calculation snapshots,
  retroactive adjustments, rollback workflow, tax/FX engines, bank files, GL,
  reconciliation, and document-based payslips.

### Gate C — Performance

- Replace memory repository.
- Route PIP, reviews, calibration, promotion, and reward approvals through the
  Workflow Engine.
- Add talent matrix, readiness, compensation advisory, heatmaps, analytics,
  import/export, and role dashboards.

### Gate D — Learning

- Preserve the existing clean domain/repository/service split.
- Add SCORM runtime contracts, xAPI ingestion, provider adapters, marketplace,
  skill passports, shared AI course-generation jobs, and enterprise analytics.

### Gate E — Compensation

- Complete the independent service and gateway route.
- Add benefits, equity/vesting, benchmarks, total rewards statements, budgets,
  workflow approvals, audit/outbox, and exports.

### Gate F — Workforce Operations

- Replace memory repository.
- Add scheduling rules, overlap protection, desk/fleet booking concurrency,
  visitor QR lifecycle, marketplace moderation, communities, analytics, and
  background jobs.

### Gate G — Enterprise Platform

- Replace memory repository.
- Implement safe feature rollout, signed plugin/API manifests, event replay,
  warehouse exports, constrained advisory agents, versioned policies, and
  low-code workflow definitions.

## Verification performed

Repository tests currently pass for:

- Learning domain
- Performance prototype
- Payroll prototype
- Workforce prototype
- Enterprise Platform prototype

These passing tests do not satisfy the final mandatory test standard because
they do not yet prove live PostgreSQL transactions, tenant isolation, workflow
integration, RBAC, load, accessibility, or end-to-end deployment behavior.

## Database deployment

Do not run migration `0018` before all earlier HRMS migrations are applied.
Apply migrations in numeric order through `0017`, then apply:

```text
0018_release_05_10_architecture_revision.sql
```

The migration is intentionally additive. It does not drop tables, columns, or
historical rows. It also does not pretend that database foundations alone make
the releases complete; service and UI remediation is still required.

## Final audit decision

The architecture requirements are accepted and the highest-risk gateway bypass
has been corrected. The shared data foundation is now represented by an
additive migration.

Releases 05–10 remain **partially implemented**. The next mandatory work is the
Clean Architecture and PostgreSQL refactor, beginning with Payroll and then
proceeding release by release. No production-completion claim is justified
until every release passes the full required test and deployment matrix.
