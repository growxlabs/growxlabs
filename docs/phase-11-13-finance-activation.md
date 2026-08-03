# Phases 11–13: Finance and Project Activation

This release adds an additive consulting workflow behind the signed-agreement gate:

`Signed MSA → GXL-INV advance invoice → finance verification → GXL-RCP receipt → GXL-PRJ project activation → GXL-KOF kickoff`

The new tables are separate from the existing legacy invoice, payment, and project tables. Browser clients never mark a payment as verified or a project as active; those transitions require the protected admin APIs.

## Migration order

Run these files in order in Supabase SQL Editor:

1. `20260803_business_document_numbers.sql`
2. `20260805_business_technical_audits.sql`
3. `20260806_consulting_solution_workflow.sql`
4. `20260807_commercial_legal_workflow.sql`
5. `20260808_finance_activation_workflow.sql`

The final migration creates the finance, payment, receipt, project, kickoff, activity tables, number triggers, indexes, and RLS enablement. It does not delete or alter legacy finance/project data.

## Protected endpoints

- Admin: `/api/admin/consulting-invoices`
- Admin: `/api/admin/consulting-payments`
- Admin: `/api/admin/consulting-projects`
- Admin: `/api/admin/consulting-kickoffs`
- Client: `/api/client/consulting-invoices`
- Client: `/api/client/consulting-payments`
- Client: `/api/client/consulting-projects`

Full delivery sprints, change requests, support, and project closure remain outside this release.
