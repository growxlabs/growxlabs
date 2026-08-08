# Employee OS production readiness

## Authorization matrix

| Actor | Employee OS | Assigned CRM | Team controls | Commercial/finance | Private HR |
|---|---|---|---|---|---|
| Platform Admin | Only with employee identity | Organisation control APIs | Organisation scope | Existing Admin RBAC | Existing Admin RBAC |
| Permissioned Manager | Only with active identity | Own execution plus direct-report management scope | Direct reports only | No implicit access | No implicit access |
| BDE | Active workspace only | Assigned/owned resources only | Denied | Denied | Own employment only |
| Normal Employee | Active workspace only | Denied without sales bundle | Denied | Denied | Own employment only |
| Candidate | Denied | Denied | Denied | Denied | Candidate portal only |
| Client | Denied | Denied | Denied | Client-scoped modules only | Denied |
| Unauthenticated | Login/activation only | Denied | Denied | Denied | Denied |

Every Employee OS request resolves the current identity, employment status, role grants and workspace status from canonical server-side records. Service-role queries repeat organisation and owner/assignee filters. Manager mutations repeat direct-report scope.

## Service-role and RLS model

Employee OS server routes intentionally use the Supabase service role. RLS is enabled on Employee OS identity, onboarding, conversion, sales execution and feedback tables without broad browser policies. Direct PostgREST access is therefore not the authorization boundary; authenticated server services are. Notifications, documents, attendance and leave queries include recipient/employee ownership predicates.

## Migration plan

1. Take a Supabase point-in-time backup or schema plus affected-table data export.
2. Apply in order: `0030`, `0031`, `0032`, `0033`, `0034`.
3. Do not apply a later migration if the previous transaction fails.
4. In Supabase API settings, expose `identity`, `people`, `onboarding`, `notifications`, `documents`, `audit`, and `recruitment` to PostgREST. Grant schema usage/table access only to the server role required by the deployment; do not grant browser roles broad table access. Reload PostgREST and confirm the protected readiness endpoint no longer reports schema failures.
5. Validate the tables/indexes with the protected readiness endpoint and the queries below.
6. Test one Admin and one BDE account before general enablement.

Affected data: `identity.employee_identities`, `identity.invitations`, `identity.employee_activations` (legacy, retained), `identity.permissions`, role grants, onboarding employee states, recruitment conversions, canonical leads, assignments, qualifications, sales activities/follow-ups/opportunities/discovery/handoffs, management feedback, notifications and audit events.

All migrations are additive and transaction-wrapped. Recovery is restore-from-backup or a reviewed forward migration; do not drop columns/tables to roll back after employee usage begins. Workspace suspension is the safe operational rollback.

Validation queries (run with an administrator connection):

```sql
select workspace_status,count(*) from identity.employee_identities group by workspace_status;
select organisation_id,employee_id,count(*) from identity.employee_identities group by 1,2 having count(*)>1;
select organisation_id,auth_user_id,count(*) from identity.employee_identities group by 1,2 having count(*)>1;
select organisation_id,application_id,count(*) from recruitment.employee_conversions group by 1,2 having count(*)>1;
select indexname from pg_indexes where indexname in ('employee_identity_workspace_idx','leads_employee_scope_idx','sales_followups_employee_due_idx','handoff_employee_review_idx');
```

## Legacy route plan

- `/team/login`: KEEP for legacy team accounts until canonical identity migration is complete.
- `/team/crm`: DEPRECATE for normal employees; BDE daily execution is `/workspace/sales`.
- `/people/me/*`: KEEP as HRMS compatibility routes; Employee OS links use `/workspace/employment`.
- `/me/*`: KEEP as document/learning compatibility routes, then REDIRECT after production parity is verified.
- `/admin/*`: KEEP for Admin OS. Normal BDE execution must not depend on it.

Remaining legacy identity dependencies are the legacy `public.users` and `team_members` credential fallback in NextAuth, legacy `allowed_paths` navigation compatibility, and older `/team/*`, `/people/me/*`, and `/me/*` entry points. Employee OS authorization itself uses `identity.employee_identities`, not email matching.

## Launch checklist

- [ ] Production backup completed
- [ ] Migrations 0030–0034 applied in order
- [ ] Required Supabase API schemas exposed to the server client; browser access remains RLS-restricted
- [ ] Protected readiness endpoint reports Employee OS ready
- [ ] `NEXTAUTH_SECRET`, canonical `NEXTAUTH_URL`, Supabase server keys, HRMS gateway secrets and Resend configured
- [ ] Sentry/monitoring configured
- [ ] Canonical Admin and first BDE identities verified
- [ ] BDE role and effective permissions verified
- [ ] Activation email delivered and one-time link accepted
- [ ] Workspace active; suspension denial tested with an existing session
- [ ] Lead assignment/reassignment and history verified
- [ ] Follow-up completion/reschedule verified
- [ ] Qualification, discovery and handoff verified
- [ ] Admin commercial continuation verified
- [ ] BDE commercial API denial verified
- [ ] Cross-employee URL/API attacks verified
- [ ] 390, 430, 768, 1024 and 1440 px QA completed
- [ ] Accessibility keyboard/dialog QA completed
- [ ] Production build and focused tests passed

Production runtime checks and database statements must be recorded as PASS only after execution against the deployed environment. Source inspection alone is UNVERIFIED.
