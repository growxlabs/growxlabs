# HRMS TanStack Frontend Standard

**Status:** Mandatory for HRMS Releases 05–10  
**Routing:** Next.js App Router remains authoritative

## Shared foundation

- `QueryProvider` owns one browser `QueryClient` and enables Query Devtools only
  in development.
- `lib/hrms/query/keys.ts` is the only query-key root catalogue.
- `lib/hrms/query/api-client.ts` is the standard typed browser client. It calls
  only `/api/v1/hrms/*`, never a Go service or Supabase directly.
- `components/hrms/tanstack/EnterpriseDataGrid.tsx` combines TanStack Table and
  TanStack Virtual for enterprise grids.
- TanStack Form owns enterprise form value, validation, dirty, submission, and
  async state.
- Zustand is reserved for panels, drawers, flyouts, dialogs, layout
  preferences, and other UI-only state. Server records must not be copied into
  a Zustand store.

## Query-key grammar

```text
[domain]
[domain, "list"]
[domain, "list", query]
[domain, "detail"]
[domain, "detail", id]
[domain, "analytics", query]
```

Approved roots are `employees`, `attendance`, `leave`, `recruitment`,
`onboarding`, `payroll`, `performance`, `learning`, `compensation`,
`workforce`, `platform`, `dashboard`, `analytics`, `notifications`, and
`documents`.

## Cache policy

| Data | Default policy |
| --- | --- |
| Notifications and live operational counters | Short — 15 seconds |
| Dashboards and frequently changing lists | Medium — 1 minute |
| Employee profiles and settings | Long — 10 minutes |
| Stable catalogue/reference data | Static — 1 hour |
| Payroll, compliance, financial approvals | Explicit invalidation after confirmed server mutation |
| Generated reports | Cached until regeneration succeeds |

Mutations invalidate only the affected domain/list/detail keys. Optimistic
updates are allowed for low-risk state such as comments, tags, goal progress,
task status, and notification read state. They are prohibited for payroll,
financial data, compliance, and approval decisions.

## Enterprise grids

All enterprise grids use `EnterpriseDataGrid` or a domain wrapper built on it.
The shared grid supports manual server pagination, filters and sorting; column
resizing, visibility and left pinning; row selection and bulk actions;
keyboard row selection; sticky headers; virtualized rows; and CSV export.

The server remains responsible for filtered record count, stable cursor/page
ordering, organisation isolation, permission checks, and export-job creation
for large or sensitive datasets. Browser CSV export is limited to the
currently authorised loaded rows.

## Forms

Forms use TanStack Form. Validation runs at the field and form boundary.
Async uniqueness or policy checks use dependent TanStack queries. Autosave
uses a debounced mutation with an idempotency key. Critical workflows require
an explicit submit/confirm response and never use optimistic completion.

## Infinite and live data

Activity, audit, timelines, notifications, histories, and conversations use
`useInfiniteQuery`. Large loaded pages render through TanStack Virtual.
SSE events update or invalidate Query caches; they are not duplicated into
Zustand.

## Migration state

The shared provider, keys, cache policy, API client, virtualized enterprise
grid, development Devtools, and architecture tests are implemented.
`ExecutiveCommandCenter` now uses TanStack Query rather than `useEffect`, and
the payroll advisory form uses TanStack Form plus a non-optimistic Query
mutation.

Remaining legacy HRMS screens must be migrated incrementally. A release is not
frontend-complete while its server state is fetched through `useEffect`, its
enterprise grid is custom, or its enterprise form uses manual state.
