# Command Center Phase 4

Phase 4 introduces bounded Go Vercel Function boundaries for tools,
capabilities, skills and business domains alongside the Next.js application.

## Deployment

| Component | Target |
| --- | --- |
| Next.js UI, BFF, orchestrator and planner | Vercel |
| Internal API Gateway | Vercel Go Function |
| Tool, Capability and Skill Services | Vercel Go Functions |
| CRM, Finance, HR, Project and Marketing Services | Vercel Go Functions |
| Execution Engine | Vercel Go Function |
| Scheduler and Worker | Bounded Vercel Go Function invocations |
| PostgreSQL | Supabase or managed PostgreSQL |
| Redis and NATS JetStream | Managed infrastructure when enabled |

No listener process, polling loop, NATS consumer or Docker build is started by Vercel.
All service URLs and signing credentials are server-only variables without a
`NEXT_PUBLIC_` prefix.

Phase 4 activation is controlled independently:

```text
COMMAND_CENTER_PHASE4_SERVICES_ENABLED=false
INTERNAL_API_GATEWAY_URL=https://deployment.example.com/api/internal/gateway
TOOL_SERVICE_INTERNAL_URL=https://deployment.example.com/api/internal/tools
```

The Phase 2 registries and Phase 1 tool endpoint remain as compatibility
fallbacks while the migration is verified. Set
`PHASE1_TOOL_COMPATIBILITY_FALLBACK_ENABLED=false` only after production
compatibility testing.

## Phase 1 inventory

The existing registry contains 17 tools:

| Tool | Domain | Permission | Phase 4 adapter |
| --- | --- | --- | --- |
| `get_company_stats` | CRM | `leads:read` | Legacy Next.js compatibility |
| `query_leads` | CRM | `leads:read` | Legacy Next.js compatibility |
| `create_lead` | CRM | `leads:write` | Legacy Next.js compatibility |
| `create_leads_batch` | CRM | `leads:write` | Legacy Next.js compatibility; approval metadata |
| `generate_proposal` | CRM | `proposals:write` | Legacy Next.js compatibility |
| `search_web` | System | None | Legacy Next.js compatibility |
| `spawn_subagent` | System | None | Legacy Next.js compatibility |
| `get_blog_posts_stats` | Marketing | `blogs:read` | Legacy Next.js compatibility |
| `query_wish_game_data` | Marketing | `blogs:read` | Legacy Next.js compatibility |
| `send_blog_to_subscribers` | Marketing | `blogs:dispatch` | Approval required |
| `get_admin_users` | System | `users:read` | Legacy Next.js compatibility |
| `get_admin_agreements` | Finance | `invoices:read` | Legacy Next.js compatibility |
| `get_admin_invoices` | Finance | `invoices:read` | Legacy Next.js compatibility |
| `create_admin_invoice` | Finance | `invoices:write` | Legacy Next.js compatibility |
| `get_admin_projects` | Projects | `projects:read` | Legacy Next.js compatibility |
| `create_admin_project` | Projects | `projects:write` | Legacy Next.js compatibility |
| `send_admin_invoice` | Finance | `invoices:write` | Approval required |

The existing Zod schemas and Tool Registry remain the final compatibility
validation boundary. The Tool Service adds version, agent, capability, skill,
scope, approval, deadline, idempotency and output-envelope validation before
calling that boundary.

## Service flow

```text
Browser
  -> Next.js BFF
  -> Planner
  -> Execution Engine
  -> Worker
  -> Tool Service
  -> authoritative scope validation
  -> versioned adapter
  -> Domain Service or temporary Phase 1 compatibility adapter
  -> durable tool result and domain event
```

The Worker never queries a domain table. The Execution Engine contains no
domain business logic.

## Persistence

Apply, in order:

1. `0003_phase3_execution.sql`
2. `0004_phase4_services.sql`

The Phase 4 migration is additive. It creates versioned registry metadata,
tool-execution records, service idempotency records, an event outbox and
tenant-scoped indexes. Existing domain rows without tenant scope remain
untouched and are not exposed by the new services.

## Current transport boundary

Domain events are durably written to
`command_services.domain_events`. A managed NATS JetStream publisher may drain
this outbox after NATS is configured. PostgreSQL remains the source of truth;
Redis is not used as a domain record store.
