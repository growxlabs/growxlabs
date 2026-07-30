-- Phase 6 Migration: Memory, Artifacts, Events & Notifications

-- ─────────────────────────────────────────────────────────
-- 1. Memory Tables
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memory_records (
    id VARCHAR(128) PRIMARY KEY,
    version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    organisation_id VARCHAR(128) NOT NULL,
    workspace_id VARCHAR(128) NOT NULL,
    owner_type VARCHAR(64) NOT NULL, -- user, conversation, workspace, entity, execution
    owner_id VARCHAR(128) NOT NULL,
    memory_type VARCHAR(64) NOT NULL, -- working, conversation_summary, user_preference, workspace_knowledge, execution_summary, entity_fact
    title VARCHAR(255),
    content TEXT NOT NULL,
    classification VARCHAR(64) NOT NULL DEFAULT 'internal', -- public, internal, confidential, restricted
    confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    status VARCHAR(64) NOT NULL DEFAULT 'active', -- active, superseded, expired, deleted
    created_by_type VARCHAR(64) NOT NULL DEFAULT 'system',
    created_by_id VARCHAR(128) NOT NULL,
    approved_by_user_id VARCHAR(128),
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_memory_records_org_ws ON memory_records(organisation_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_memory_records_owner ON memory_records(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_memory_records_status ON memory_records(status);

CREATE TABLE IF NOT EXISTS memory_versions (
    id VARCHAR(128) PRIMARY KEY,
    memory_id VARCHAR(128) NOT NULL REFERENCES memory_records(id) ON DELETE CASCADE,
    version VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_sources (
    id VARCHAR(128) PRIMARY KEY,
    memory_id VARCHAR(128) NOT NULL REFERENCES memory_records(id) ON DELETE CASCADE,
    source_type VARCHAR(64) NOT NULL, -- conversation, message, run, step, artifact, domain_record
    source_id VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_embeddings (
    memory_id VARCHAR(128) PRIMARY KEY REFERENCES memory_records(id) ON DELETE CASCADE,
    provider VARCHAR(64) NOT NULL,
    model_name VARCHAR(128) NOT NULL,
    dimensions INT NOT NULL,
    embedding_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_access_events (
    id VARCHAR(128) PRIMARY KEY,
    memory_id VARCHAR(128) NOT NULL REFERENCES memory_records(id) ON DELETE CASCADE,
    organisation_id VARCHAR(128) NOT NULL,
    workspace_id VARCHAR(128) NOT NULL,
    user_id VARCHAR(128) NOT NULL,
    action VARCHAR(64) NOT NULL, -- read, search, delete, deny
    accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_retention_status (
    memory_id VARCHAR(128) PRIMARY KEY REFERENCES memory_records(id) ON DELETE CASCADE,
    retention_policy_id VARCHAR(128),
    legal_hold BOOLEAN NOT NULL DEFAULT FALSE,
    scheduled_cleanup_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- 2. Artifact Tables
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artifact_records (
    id VARCHAR(128) PRIMARY KEY,
    version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    organisation_id VARCHAR(128) NOT NULL,
    workspace_id VARCHAR(128) NOT NULL,
    conversation_id VARCHAR(128),
    run_id VARCHAR(128),
    step_id VARCHAR(128),
    created_by_user_id VARCHAR(128) NOT NULL,
    created_by_agent_id VARCHAR(128),
    artifact_type VARCHAR(64) NOT NULL, -- pdf, docx, xlsx, csv, pptx, markdown, text, json
    name VARCHAR(255) NOT NULL,
    safe_description TEXT,
    mime_type VARCHAR(128) NOT NULL,
    file_extension VARCHAR(32) NOT NULL,
    storage_provider VARCHAR(64) NOT NULL DEFAULT 'cloudflare_r2',
    object_key VARCHAR(512) NOT NULL,
    size_bytes BIGINT NOT NULL,
    checksum VARCHAR(128) NOT NULL,
    classification VARCHAR(64) NOT NULL DEFAULT 'internal',
    status VARCHAR(64) NOT NULL DEFAULT 'available', -- generating, available, failed, expired, deleted
    template_id VARCHAR(128),
    template_version VARCHAR(32),
    generator_id VARCHAR(128) NOT NULL,
    generator_version VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_artifact_records_org_ws ON artifact_records(organisation_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_artifact_records_status ON artifact_records(status);

CREATE TABLE IF NOT EXISTS artifact_versions (
    id VARCHAR(128) PRIMARY KEY,
    artifact_id VARCHAR(128) NOT NULL REFERENCES artifact_records(id) ON DELETE CASCADE,
    version VARCHAR(32) NOT NULL,
    object_key VARCHAR(512) NOT NULL,
    checksum VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artifact_sources (
    id VARCHAR(128) PRIMARY KEY,
    artifact_id VARCHAR(128) NOT NULL REFERENCES artifact_records(id) ON DELETE CASCADE,
    source_type VARCHAR(64) NOT NULL,
    source_id VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artifact_generation_attempts (
    id VARCHAR(128) PRIMARY KEY,
    artifact_id VARCHAR(128) NOT NULL,
    request_id VARCHAR(128) NOT NULL,
    attempt_number INT NOT NULL,
    success BOOLEAN NOT NULL,
    duration_ms INT NOT NULL,
    error_code VARCHAR(64),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artifact_access_events (
    id VARCHAR(128) PRIMARY KEY,
    artifact_id VARCHAR(128) NOT NULL REFERENCES artifact_records(id) ON DELETE CASCADE,
    user_id VARCHAR(128) NOT NULL,
    action VARCHAR(64) NOT NULL, -- signed_url_issued, download_proxy, access_denied
    accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artifact_retention_status (
    artifact_id VARCHAR(128) PRIMARY KEY REFERENCES artifact_records(id) ON DELETE CASCADE,
    legal_hold BOOLEAN NOT NULL DEFAULT FALSE,
    scheduled_deletion_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artifact_templates (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    artifact_type VARCHAR(64) NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artifact_template_versions (
    id VARCHAR(128) PRIMARY KEY,
    template_id VARCHAR(128) NOT NULL REFERENCES artifact_templates(id) ON DELETE CASCADE,
    version VARCHAR(32) NOT NULL,
    input_schema JSONB NOT NULL,
    layout_spec JSONB NOT NULL,
    checksum VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artifact_idempotency_records (
    idempotency_key VARCHAR(255) PRIMARY KEY,
    artifact_id VARCHAR(128) NOT NULL REFERENCES artifact_records(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- 3. Event Tables
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_events (
    id VARCHAR(128) PRIMARY KEY,
    version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    event_type VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL, -- conversation, execution, tool, domain, policy, approval, artifact, memory, notification
    organisation_id VARCHAR(128) NOT NULL,
    workspace_id VARCHAR(128) NOT NULL,
    request_id VARCHAR(128) NOT NULL,
    trace_id VARCHAR(128),
    conversation_id VARCHAR(128),
    run_id VARCHAR(128),
    step_id VARCHAR(128),
    actor_type VARCHAR(64) NOT NULL,
    actor_id VARCHAR(128) NOT NULL,
    sequence BIGSERIAL,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ingested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    safe_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    classification VARCHAR(64) NOT NULL DEFAULT 'internal'
);

CREATE INDEX IF NOT EXISTS idx_platform_events_type ON platform_events(event_type);
CREATE INDEX IF NOT EXISTS idx_platform_events_org_ws ON platform_events(organisation_id, workspace_id);

CREATE TABLE IF NOT EXISTS platform_event_outbox (
    id VARCHAR(128) PRIMARY KEY,
    event_id VARCHAR(128) NOT NULL REFERENCES platform_events(id) ON DELETE CASCADE,
    status VARCHAR(64) NOT NULL DEFAULT 'pending', -- pending, processed, failed
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS event_processing_status (
    event_id VARCHAR(128) PRIMARY KEY REFERENCES platform_events(id) ON DELETE CASCADE,
    handler_name VARCHAR(128) NOT NULL,
    status VARCHAR(64) NOT NULL, -- success, failed, skipped
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_delivery_attempts (
    id VARCHAR(128) PRIMARY KEY,
    event_id VARCHAR(128) NOT NULL REFERENCES platform_events(id) ON DELETE CASCADE,
    target_handler VARCHAR(128) NOT NULL,
    attempt_number INT NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_replay_requests (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128) NOT NULL,
    workspace_id VARCHAR(128) NOT NULL,
    requested_by_user_id VARCHAR(128) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    event_types JSONB NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_replay_batches (
    id VARCHAR(128) PRIMARY KEY,
    replay_request_id VARCHAR(128) NOT NULL REFERENCES event_replay_requests(id) ON DELETE CASCADE,
    batch_index INT NOT NULL,
    events_count INT NOT NULL,
    success BOOLEAN NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_deduplication_keys (
    dedup_key VARCHAR(255) PRIMARY KEY,
    event_id VARCHAR(128) NOT NULL REFERENCES platform_events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- 4. Notification Tables
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_records (
    id VARCHAR(128) PRIMARY KEY,
    version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    organisation_id VARCHAR(128) NOT NULL,
    workspace_id VARCHAR(128) NOT NULL,
    recipient_user_id VARCHAR(128) NOT NULL,
    notification_type VARCHAR(64) NOT NULL, -- approval_required, approval_resolved, run_completed, run_failed, artifact_ready, artifact_failed, policy_changed, security_warning, memory_confirmation, clarification_required
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'info', -- info, success, warning, critical
    source_type VARCHAR(64) NOT NULL,
    source_id VARCHAR(128) NOT NULL,
    action_url VARCHAR(512),
    status VARCHAR(32) NOT NULL DEFAULT 'unread', -- unread, read, archived, expired
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_notification_records_recipient ON notification_records(recipient_user_id, status);

CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id VARCHAR(128) PRIMARY KEY,
    in_product_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    preferences_json JSONB DEFAULT '{}'::jsonb,
    quiet_hours_json JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_processing_status (
    id VARCHAR(128) PRIMARY KEY,
    notification_id VARCHAR(128) NOT NULL REFERENCES notification_records(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_idempotency_records (
    idempotency_key VARCHAR(255) PRIMARY KEY,
    notification_id VARCHAR(128) NOT NULL REFERENCES notification_records(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
