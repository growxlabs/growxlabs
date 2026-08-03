# Phases 18–19: Closure and Client Success

This is an additive post-delivery lifecycle layer. A closure record is blocked when milestones, tasks, approvals, or support tickets remain unresolved. A client can accept only a closure in `awaiting_client_acceptance`; acceptance moves the workspace to `completed`. Customer-success reviews and QBRs unlock only after completion.

## Migration order

Run after migrations `20260803` through `20260809`:

`20260810_client_success_lifecycle.sql`

It creates closure, handover, certificate, archive, success review, QBR, ROI, renewal, expansion, feedback, and success activity tables with business-number triggers and RLS enablement.

## Protected endpoints

- Admin closure/success actions: `/api/admin/success`
- Client closure acceptance and post-project view: `/api/client/success`

The server keeps internal lessons learned and internal success information out of the client response. Full certificate PDF generation, email notifications, renewal quoting, referral tracking, and complete portal pages remain follow-up work; project closure is not marked complete by this implementation alone.
