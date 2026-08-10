# GrowXLabs communication pattern system

All GrowXLabs-branded HTML email must be rendered through `lib/email/growxlabs-layout.ts`.

The shared foundation provides `GrowXLabsEmailLayout`, `EmailHeader`, `EmailMeta`, `EmailSection`, `EmailField`, `EmailDivider`, `EmailAction`, and `EmailFooter`. `ensureGrowXLabsEmailLayout` exists for legacy or administrator-authored HTML and is idempotent.

## Audited delivery boundaries

- Recruitment: candidate lifecycle, interview scheduling/access/playbooks, assessment, rejection, offer issue/retry/response, candidate OTP, HR notifications, saved-template preview and internal audit copies.
- Employee identity: workspace activation and reissue.
- Client and sales: client portal invitations, queued communications, direct and dynamic outreach, bookings and internal booking alerts.
- Finance and delivery: invoices, agreements, proposals, payment confirmation and project onboarding.
- Learning and editorial: certificates, subscriber confirmation, editorial/blog distribution.
- Development tooling: welcome-email test sender.

Provider configuration, recipients, tokens, attachments, queue state, audit logging and workflow triggers remain owned by their existing services. The layout layer only standardizes presentation and HTML escaping.

## Rule for new senders

Do not add a raw branded `html:` payload to a provider call. Build content with the shared primitives or pass legacy content through `ensureGrowXLabsEmailLayout` at the final sending boundary. Human prose remains normal prose; the editorial notation is reserved for context, references, structured fields, actions, and section separation.
