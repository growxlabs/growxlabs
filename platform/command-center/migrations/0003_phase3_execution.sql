BEGIN;

CREATE SCHEMA IF NOT EXISTS command_execution;

CREATE TABLE IF NOT EXISTS command_execution.runs (
    id uuid PRIMARY KEY,
    idempotency_key text NOT NULL,
    plan_version text NOT NULL,
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    user_id text NOT NULL,
    conversation_id text NOT NULL,
    request_id text NOT NULL,
    agent_id text NOT NULL,
    capability_id text NOT NULL,
    skill_id text NOT NULL,
    status text NOT NULL CHECK (status IN (
        'created', 'validating', 'ready', 'queued', 'running', 'waiting',
        'cancelling', 'cancelled', 'succeeded', 'failed', 'timed_out'
    )),
    plan jsonb NOT NULL,
    error_code text,
    error_message text,
    cancellation_requested_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    started_at timestamptz,
    finished_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (organisation_id, workspace_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS command_execution.steps (
    id uuid PRIMARY KEY,
    run_id uuid NOT NULL REFERENCES command_execution.runs(id) ON DELETE CASCADE,
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    step_key text NOT NULL,
    ordinal integer NOT NULL CHECK (ordinal >= 0),
    step_type text NOT NULL CHECK (step_type IN (
        'tool', 'model', 'transform', 'decision', 'wait'
    )),
    status text NOT NULL CHECK (status IN (
        'pending', 'blocked', 'ready', 'queued', 'claimed', 'running',
        'retry_wait', 'waiting', 'succeeded', 'failed', 'cancelled',
        'skipped', 'timed_out'
    )),
    input jsonb NOT NULL DEFAULT '{}'::jsonb,
    output jsonb,
    required_permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
    retry_policy jsonb NOT NULL,
    timeout_ms integer NOT NULL CHECK (timeout_ms BETWEEN 100 AND 300000),
    lease_owner text,
    lease_token uuid,
    lease_expires_at timestamptz,
    next_attempt_at timestamptz,
    last_error_code text,
    last_error_message text,
    created_at timestamptz NOT NULL DEFAULT now(),
    started_at timestamptz,
    finished_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (run_id, step_key)
);

CREATE TABLE IF NOT EXISTS command_execution.step_dependencies (
    run_id uuid NOT NULL REFERENCES command_execution.runs(id) ON DELETE CASCADE,
    step_id uuid NOT NULL REFERENCES command_execution.steps(id) ON DELETE CASCADE,
    depends_on_step_id uuid NOT NULL REFERENCES command_execution.steps(id) ON DELETE CASCADE,
    PRIMARY KEY (step_id, depends_on_step_id),
    CHECK (step_id <> depends_on_step_id)
);

CREATE TABLE IF NOT EXISTS command_execution.attempts (
    id uuid PRIMARY KEY,
    run_id uuid NOT NULL REFERENCES command_execution.runs(id) ON DELETE CASCADE,
    step_id uuid NOT NULL REFERENCES command_execution.steps(id) ON DELETE CASCADE,
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    attempt_number integer NOT NULL CHECK (attempt_number > 0),
    worker_id text NOT NULL,
    lease_token uuid NOT NULL,
    status text NOT NULL CHECK (status IN (
        'running', 'succeeded', 'failed', 'timed_out', 'cancelled'
    )),
    input jsonb NOT NULL,
    output jsonb,
    error_code text,
    error_message text,
    started_at timestamptz NOT NULL DEFAULT now(),
    finished_at timestamptz,
    UNIQUE (step_id, attempt_number)
);

CREATE TABLE IF NOT EXISTS command_execution.events (
    sequence bigserial PRIMARY KEY,
    id uuid NOT NULL UNIQUE,
    run_id uuid NOT NULL REFERENCES command_execution.runs(id) ON DELETE CASCADE,
    step_id uuid REFERENCES command_execution.steps(id) ON DELETE CASCADE,
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    request_id text NOT NULL,
    event_type text NOT NULL,
    event_version text NOT NULL DEFAULT 'gxl.execution-event.v1',
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS command_execution.queue (
    id bigserial PRIMARY KEY,
    run_id uuid NOT NULL REFERENCES command_execution.runs(id) ON DELETE CASCADE,
    step_id uuid NOT NULL REFERENCES command_execution.steps(id) ON DELETE CASCADE,
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    available_at timestamptz NOT NULL DEFAULT now(),
    claimed_by text,
    claim_token uuid,
    claimed_until timestamptz,
    delivery_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (step_id)
);

CREATE INDEX IF NOT EXISTS execution_runs_scope_status_idx
    ON command_execution.runs (organisation_id, workspace_id, status, created_at);
CREATE INDEX IF NOT EXISTS execution_steps_runnable_idx
    ON command_execution.steps (run_id, status, next_attempt_at, ordinal);
CREATE INDEX IF NOT EXISTS execution_steps_lease_idx
    ON command_execution.steps (lease_expires_at)
    WHERE status = 'running';
CREATE INDEX IF NOT EXISTS execution_queue_available_idx
    ON command_execution.queue (available_at, id)
    WHERE claimed_until IS NULL;
CREATE INDEX IF NOT EXISTS execution_events_run_sequence_idx
    ON command_execution.events (run_id, sequence);
CREATE INDEX IF NOT EXISTS execution_events_scope_idx
    ON command_execution.events (organisation_id, workspace_id, sequence);

COMMIT;
