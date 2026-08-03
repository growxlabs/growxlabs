# Phases 14–17: Delivery, Change Requests, and Support

This release adds an additive delivery layer around the consulting project activated by Phase 11–13. It does not replace the legacy PM or support tables.

## Workflow gate

`Verified payment + completed kickoff → workspace → milestones/tasks → change requests → support tickets`

The server workflow refuses workspace activation unless the project is already `active`. Client APIs scope records to the authenticated `client_profiles` account; admin APIs require `ADMIN` or `CO_ADMIN`.

## Migration order

Run after the earlier consulting and finance migrations:

1. `20260803_business_document_numbers.sql`
2. `20260805_business_technical_audits.sql`
3. `20260806_consulting_solution_workflow.sql`
4. `20260807_commercial_legal_workflow.sql`
5. `20260808_finance_activation_workflow.sql`
6. `20260809_project_delivery_support_workflow.sql`

The migration creates workspace, members, milestones, tasks, deliverables, approvals, releases, change requests, support plans, tickets, comments, activity, numbering triggers, indexes, and RLS enablement. It preserves the original approved Scope of Work and does not implement project closure.

## Implemented protected endpoints

- Admin workspace activation: `/api/admin/delivery/workspaces`
- Admin milestones: `/api/admin/delivery/milestones`
- Admin tasks: `/api/admin/delivery/tasks`
- Client change requests: `/api/client/delivery/change-requests`
- Client support tickets: `/api/client/support/tickets`

Full QA/UAT, release approval, SLA timers, maintenance reports, email notifications, and the complete client/admin page set remain follow-up work.
