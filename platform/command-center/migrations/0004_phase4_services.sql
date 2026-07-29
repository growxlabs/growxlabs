BEGIN;

CREATE SCHEMA IF NOT EXISTS command_services;
CREATE SCHEMA IF NOT EXISTS command_marketing;

ALTER TABLE IF EXISTS public.leads
    ADD COLUMN IF NOT EXISTS organisation_id text,
    ADD COLUMN IF NOT EXISTS workspace_id text;
ALTER TABLE IF EXISTS public.invoices
    ADD COLUMN IF NOT EXISTS organisation_id text,
    ADD COLUMN IF NOT EXISTS workspace_id text,
    ADD COLUMN IF NOT EXISTS idempotency_key text;
ALTER TABLE IF EXISTS public.projects
    ADD COLUMN IF NOT EXISTS organisation_id text,
    ADD COLUMN IF NOT EXISTS workspace_id text;
ALTER TABLE IF EXISTS public.campaigns
    ADD COLUMN IF NOT EXISTS organisation_id text,
    ADD COLUMN IF NOT EXISTS workspace_id text;

CREATE INDEX IF NOT EXISTS leads_tenant_scope_idx
    ON public.leads (organisation_id, workspace_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS leads_tenant_email_uq
    ON public.leads (organisation_id, workspace_id, lower(email))
    WHERE email IS NOT NULL
      AND organisation_id IS NOT NULL
      AND workspace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS invoices_tenant_scope_idx
    ON public.invoices (organisation_id, workspace_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS invoices_tenant_idempotency_uq
    ON public.invoices (organisation_id, workspace_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS projects_tenant_scope_idx
    ON public.projects (organisation_id, workspace_id, created_at);
CREATE INDEX IF NOT EXISTS campaigns_tenant_scope_idx
    ON public.campaigns (organisation_id, workspace_id, created_at);

CREATE TABLE IF NOT EXISTS command_marketing.content_briefs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    title text NOT NULL,
    objective text NOT NULL,
    audience text,
    status text NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'review', 'approved', 'archived')),
    created_by text NOT NULL,
    idempotency_key text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (organisation_id, workspace_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS command_services.tool_definitions (
    id text NOT NULL,
    version text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    domain text NOT NULL,
    operation text NOT NULL,
    definition jsonb NOT NULL,
    status text NOT NULL CHECK (status IN ('active', 'disabled', 'deprecated')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (id, version)
);

CREATE TABLE IF NOT EXISTS command_services.capability_definitions (
    id text NOT NULL,
    version text NOT NULL,
    name text NOT NULL,
    domain text NOT NULL,
    definition jsonb NOT NULL,
    status text NOT NULL CHECK (status IN ('active', 'disabled', 'deprecated')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (id, version)
);

CREATE TABLE IF NOT EXISTS command_services.skill_definitions (
    id text NOT NULL,
    version text NOT NULL,
    name text NOT NULL,
    domain text NOT NULL,
    definition jsonb NOT NULL,
    status text NOT NULL CHECK (status IN ('active', 'disabled', 'deprecated')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (id, version)
);

CREATE TABLE IF NOT EXISTS command_services.tool_execution_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    request_id text NOT NULL,
    trace_id text NOT NULL,
    run_id uuid NOT NULL REFERENCES command_execution.runs(id) ON DELETE CASCADE,
    step_id uuid NOT NULL REFERENCES command_execution.steps(id) ON DELETE CASCADE,
    attempt_id text NOT NULL,
    tool_id text NOT NULL,
    tool_version text NOT NULL,
    idempotency_key text NOT NULL,
    input_hash text NOT NULL,
    status text NOT NULL CHECK (status IN (
        'started', 'succeeded', 'failed', 'blocked', 'timed_out', 'cancelled'
    )),
    result jsonb,
    error_code text,
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    UNIQUE (organisation_id, workspace_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS command_services.domain_events (
    sequence bigserial PRIMARY KEY,
    id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    event_version text NOT NULL DEFAULT 'gxl.domain-event.v1',
    event_type text NOT NULL,
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    request_id text NOT NULL,
    trace_id text NOT NULL,
    run_id uuid,
    user_id text NOT NULL,
    service_name text NOT NULL,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    published_at timestamptz,
    occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS command_services.service_idempotency_records (
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    service_name text NOT NULL,
    idempotency_key text NOT NULL,
    request_hash text NOT NULL,
    response jsonb,
    status text NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    expires_at timestamptz NOT NULL,
    PRIMARY KEY (
        organisation_id, workspace_id, service_name, idempotency_key
    )
);

CREATE INDEX IF NOT EXISTS tool_definitions_active_idx
    ON command_services.tool_definitions (domain, id, version)
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS capability_definitions_active_idx
    ON command_services.capability_definitions (domain, id, version)
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS skill_definitions_active_idx
    ON command_services.skill_definitions (domain, id, version)
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS tool_execution_scope_idx
    ON command_services.tool_execution_records (
        organisation_id, workspace_id, tool_id, created_at
    );
CREATE INDEX IF NOT EXISTS tool_execution_run_step_idx
    ON command_services.tool_execution_records (run_id, step_id, created_at);
CREATE INDEX IF NOT EXISTS domain_events_unpublished_idx
    ON command_services.domain_events (sequence)
    WHERE published_at IS NULL;
CREATE INDEX IF NOT EXISTS domain_events_scope_idx
    ON command_services.domain_events (
        organisation_id, workspace_id, sequence
    );
CREATE INDEX IF NOT EXISTS service_idempotency_expiry_idx
    ON command_services.service_idempotency_records (expires_at);

COMMIT;
