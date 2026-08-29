# Master Service Agreement legacy dependency inventory

The active agreement architecture is `master_service_agreements` with immutable records in `commercial_document_versions`, lifecycle events in `commercial_document_activity`, and structured signing in `agreement_signatory_events`.

## Legacy dependencies found

| Legacy dependency | Previous behavior | Disposition |
| --- | --- | --- |
| `public.agreements` | Direct agreement CRUD and legacy signature fields | Retained for historical data; no new writes |
| `/api/agreements/create` | Created and emailed a legacy agreement | Deprecated with HTTP 410 |
| `/api/agreements/list` | Listed legacy agreements | Deprecated with HTTP 410 |
| `/api/agreements/detail` | Read legacy agreement data | Deprecated with HTTP 410 |
| `/api/agreements/update` | Mutated legacy agreement fields | Deprecated with HTTP 410 |
| `/api/agreements/sign` | Wrote raw signatures and triggered an advance invoice | Deprecated with HTTP 410; active signing never creates an invoice |
| `/client-agreement` | Legacy client agreement page | Redirects to `/client/agreement` |
| `/agreements/[id]` | Legacy public/marketing agreement page | Redirects to `/client/agreement` |
| `/client/dashboard/agreements/[id]` | Legacy dashboard agreement page | Redirects to `/client/agreement` |
| `/admin/agreements/preview` | Legacy onboarding-backed preview | Redirects to the active MSA register |

The active admin path is `/admin/agreements` and the active Client Suite path is `/client/agreement`. The active API paths are `/api/admin/agreements/*` and `/api/client/agreements/*`.

## Remaining non-agreement dependencies

Finance activation still references `master_service_agreements` and requires a signed agreement plus a separately created and paid advance invoice. It is intentionally not called by agreement compilation, sending, or signing. Onboarding continues to require its own workflow and is not created by the MSA stage.
