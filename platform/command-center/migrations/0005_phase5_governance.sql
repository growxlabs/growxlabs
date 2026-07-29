BEGIN;

CREATE SCHEMA IF NOT EXISTS command_governance;

INSERT INTO identity.permissions (key, description) VALUES
    ('governance.approvals.read', 'View tenant-scoped governance approvals'),
    ('governance.approvals.decide', 'Approve or reject eligible governance requests'),
    ('governance.policies.read', 'View active policy definitions and decisions'),
    ('governance.policies.manage', 'Create and manage governance policy versions'),
    ('governance.audit.read', 'Query tenant-scoped redacted audit history')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE command_execution.steps
    ADD COLUMN IF NOT EXISTS governance_status text
    CHECK (governance_status IS NULL OR governance_status IN (
        'blocked_for_policy', 'blocked_for_approval', 'rejected_by_approver'
    ));

CREATE TABLE IF NOT EXISTS command_governance.policy_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id text NOT NULL,
    version text NOT NULL,
    organisation_id text,
    workspace_id text,
    name text NOT NULL,
    description text NOT NULL DEFAULT '',
    category text NOT NULL CHECK (category IN (
        'access','execution','approval','data','financial','hr','security','retention'
    )),
    priority integer NOT NULL DEFAULT 0,
    scope jsonb NOT NULL DEFAULT '{}'::jsonb,
    conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
    effect text NOT NULL CHECK (effect IN (
        'allow','deny','require_approval','require_additional_permission',
        'require_multi_approval','require_redaction'
    )),
    required_permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
    approval_requirements jsonb,
    status text NOT NULL CHECK (status IN ('draft','active','disabled','deprecated')),
    checksum text NOT NULL CHECK (length(checksum) = 64),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_by_user_id text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    activated_at timestamptz,
    disabled_at timestamptz,
    UNIQUE (policy_id, version, organisation_id, workspace_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS policy_one_active_version
    ON command_governance.policy_versions (
        policy_id, COALESCE(organisation_id,''), COALESCE(workspace_id,'')
    ) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS policy_active_scope
    ON command_governance.policy_versions (organisation_id, workspace_id, status, priority DESC);

CREATE TABLE IF NOT EXISTS command_governance.policy_decisions (
    id text PRIMARY KEY,
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    request_id text NOT NULL,
    trace_id text,
    user_id text NOT NULL,
    run_id uuid,
    step_id uuid,
    tool_id text NOT NULL,
    operation text NOT NULL,
    result text NOT NULL,
    risk_level text NOT NULL,
    policy_version_ids jsonb NOT NULL,
    required_permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
    approval_requirements jsonb,
    reason_codes jsonb NOT NULL,
    context_fingerprint text NOT NULL,
    evaluated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS policy_decisions_scope_time
    ON command_governance.policy_decisions (organisation_id, workspace_id, evaluated_at DESC);
CREATE INDEX IF NOT EXISTS policy_decisions_run
    ON command_governance.policy_decisions (run_id, step_id);

CREATE TABLE IF NOT EXISTS command_governance.approval_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    version text NOT NULL DEFAULT '1.0.0',
    request_id text NOT NULL,
    trace_id text,
    run_id uuid NOT NULL,
    step_id uuid,
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    requested_by_user_id text NOT NULL,
    requested_by_agent_id text,
    policy_decision_id text NOT NULL REFERENCES command_governance.policy_decisions(id),
    policy_version_ids jsonb NOT NULL,
    capability_id text NOT NULL,
    skill_id text,
    tool_id text NOT NULL,
    tool_version text NOT NULL,
    domain text NOT NULL,
    operation text NOT NULL,
    risk_level text NOT NULL CHECK (risk_level IN ('moderate','high','critical')),
    title text NOT NULL,
    safe_summary text NOT NULL CHECK (length(safe_summary) <= 2000),
    resource_type text,
    resource_id text,
    request_fingerprint text NOT NULL CHECK (length(request_fingerprint) = 64),
    minimum_approvals integer NOT NULL CHECK (minimum_approvals BETWEEN 1 AND 5),
    eligible_role_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
    eligible_team_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
    prohibit_self_approval boolean NOT NULL DEFAULT true,
    require_distinct_approvers boolean NOT NULL DEFAULT true,
    status text NOT NULL CHECK (status IN (
        'pending','partially_approved','approved','rejected',
        'expired','revoked','cancelled'
    )),
    expires_at timestamptz NOT NULL,
    authorisation_expires_at timestamptz,
    idempotency_key text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz,
    UNIQUE (organisation_id, workspace_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS approvals_inbox
    ON command_governance.approval_requests (organisation_id, workspace_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS approvals_expiry
    ON command_governance.approval_requests (expires_at)
    WHERE status IN ('pending','partially_approved');
CREATE INDEX IF NOT EXISTS approvals_execution
    ON command_governance.approval_requests (run_id, step_id, tool_id);

CREATE TABLE IF NOT EXISTS command_governance.approval_decisions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_request_id uuid NOT NULL REFERENCES command_governance.approval_requests(id),
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    approver_user_id text NOT NULL,
    approver_role_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
    approver_team_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
    decision text NOT NULL CHECK (decision IN ('approved','rejected')),
    reason text CHECK (length(reason) <= 1000),
    evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
    idempotency_key text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (approval_request_id, approver_user_id),
    UNIQUE (organisation_id, workspace_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS command_governance.approval_revocations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_request_id uuid NOT NULL REFERENCES command_governance.approval_requests(id),
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    revoked_by_user_id text NOT NULL,
    reason_code text NOT NULL,
    safe_reason text NOT NULL CHECK (length(safe_reason) <= 1000),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS command_governance.approval_execution_links (
    approval_request_id uuid PRIMARY KEY REFERENCES command_governance.approval_requests(id),
    run_id uuid NOT NULL REFERENCES command_execution.runs(id),
    step_id uuid REFERENCES command_execution.steps(id),
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS command_governance.audit_stream_heads (
    organisation_id text NOT NULL,
    stream_period date NOT NULL,
    last_sequence bigint NOT NULL DEFAULT 0,
    last_hash text NOT NULL DEFAULT '',
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (organisation_id, stream_period)
);

CREATE TABLE IF NOT EXISTS command_governance.audit_events (
    id text PRIMARY KEY,
    version text NOT NULL,
    sequence bigint NOT NULL,
    event_type text NOT NULL,
    category text NOT NULL,
    organisation_id text NOT NULL,
    workspace_id text,
    stream_period date NOT NULL,
    actor_type text NOT NULL,
    actor_id text NOT NULL,
    impersonated_by text,
    action text NOT NULL,
    target_type text,
    target_id text,
    request_id text NOT NULL,
    trace_id text,
    run_id uuid,
    step_id uuid,
    approval_request_id uuid,
    tool_id text,
    outcome text NOT NULL,
    reason_code text,
    safe_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    classification text NOT NULL DEFAULT 'internal' CHECK (classification IN (
        'public','internal','confidential','restricted','highly_restricted'
    )),
    occurred_at timestamptz NOT NULL,
    ingested_at timestamptz NOT NULL DEFAULT now(),
    previous_hash text NOT NULL DEFAULT '',
    event_hash text NOT NULL CHECK (length(event_hash) = 64),
    retention_until timestamptz,
    legal_hold boolean NOT NULL DEFAULT false,
    UNIQUE (organisation_id, stream_period, sequence)
);
CREATE INDEX IF NOT EXISTS audit_scope_time
    ON command_governance.audit_events (organisation_id, workspace_id, occurred_at DESC, sequence DESC);
CREATE INDEX IF NOT EXISTS audit_request ON command_governance.audit_events (organisation_id, request_id);
CREATE INDEX IF NOT EXISTS audit_run ON command_governance.audit_events (organisation_id, run_id);
CREATE INDEX IF NOT EXISTS audit_approval ON command_governance.audit_events (organisation_id, approval_request_id);

CREATE TABLE IF NOT EXISTS command_governance.audit_outbox (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id text NOT NULL UNIQUE,
    organisation_id text NOT NULL,
    workspace_id text,
    event_type text NOT NULL,
    event_payload jsonb NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','claimed','processed','failed')),
    attempts integer NOT NULL DEFAULT 0,
    next_attempt_at timestamptz NOT NULL DEFAULT now(),
    claimed_by text,
    claimed_until timestamptz,
    processed_at timestamptz,
    last_error text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_outbox_ready
    ON command_governance.audit_outbox (status, next_attempt_at, created_at)
    WHERE status IN ('pending','failed','claimed');

CREATE TABLE IF NOT EXISTS command_governance.retention_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id text NOT NULL,
    event_category text NOT NULL,
    classification text NOT NULL,
    minimum_retention_days integer NOT NULL CHECK (minimum_retention_days >= 0),
    maximum_retention_days integer CHECK (maximum_retention_days IS NULL OR maximum_retention_days >= minimum_retention_days),
    archive_behaviour text NOT NULL DEFAULT 'retain',
    deletion_eligible boolean NOT NULL DEFAULT false,
    legal_hold_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_by_user_id text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (organisation_id, event_category, classification)
);

CREATE TABLE IF NOT EXISTS command_governance.security_event_counters (
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    actor_id text NOT NULL,
    detection_type text NOT NULL,
    window_started_at timestamptz NOT NULL,
    event_count integer NOT NULL DEFAULT 1,
    last_event_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (organisation_id, workspace_id, actor_id, detection_type, window_started_at)
);

CREATE TABLE IF NOT EXISTS command_governance.rate_limits (
    organisation_id text NOT NULL,
    workspace_id text NOT NULL,
    actor_id text NOT NULL,
    route text NOT NULL,
    window_started_at timestamptz NOT NULL,
    request_count integer NOT NULL DEFAULT 1,
    PRIMARY KEY (organisation_id, workspace_id, actor_id, route, window_started_at)
);

CREATE TABLE IF NOT EXISTS command_governance.cron_locks (
    lock_name text PRIMARY KEY,
    owner_id text NOT NULL,
    expires_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION command_governance.reject_immutable_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'governance record is append-only';
END;
$$;

DROP TRIGGER IF EXISTS audit_events_immutable ON command_governance.audit_events;
CREATE TRIGGER audit_events_immutable
BEFORE UPDATE OR DELETE ON command_governance.audit_events
FOR EACH ROW EXECUTE FUNCTION command_governance.reject_immutable_update();

DROP TRIGGER IF EXISTS approval_decisions_immutable ON command_governance.approval_decisions;
CREATE TRIGGER approval_decisions_immutable
BEFORE UPDATE OR DELETE ON command_governance.approval_decisions
FOR EACH ROW EXECUTE FUNCTION command_governance.reject_immutable_update();

CREATE OR REPLACE FUNCTION command_governance.protect_active_policy()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.status = 'active' AND (
        NEW.scope IS DISTINCT FROM OLD.scope OR
        NEW.conditions IS DISTINCT FROM OLD.conditions OR
        NEW.effect IS DISTINCT FROM OLD.effect OR
        NEW.required_permissions IS DISTINCT FROM OLD.required_permissions OR
        NEW.approval_requirements IS DISTINCT FROM OLD.approval_requirements OR
        NEW.checksum IS DISTINCT FROM OLD.checksum
    ) THEN
        RAISE EXCEPTION 'active policy content is immutable';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS policy_active_immutable ON command_governance.policy_versions;
CREATE TRIGGER policy_active_immutable
BEFORE UPDATE ON command_governance.policy_versions
FOR EACH ROW EXECUTE FUNCTION command_governance.protect_active_policy();

COMMIT;
