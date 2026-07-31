-- Release 10 Migration: Enterprise Platform, AI Workforce Intelligence & Ecosystem

-- 1. Enterprise Administration & Legal Entities
CREATE TABLE IF NOT EXISTS hrms_organizations (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT '',
    code VARCHAR(64) NOT NULL DEFAULT '',
    default_currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    default_timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    supported_languages_json JSONB DEFAULT '["en"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_organizations ADD COLUMN IF NOT EXISTS default_currency VARCHAR(8) DEFAULT 'USD';

CREATE TABLE IF NOT EXISTS hrms_business_units (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    name VARCHAR(255) NOT NULL DEFAULT '',
    code VARCHAR(64) NOT NULL DEFAULT '',
    region_code VARCHAR(32) NOT NULL DEFAULT 'GLOBAL',
    parent_unit_id VARCHAR(128)
);
ALTER TABLE hrms_business_units ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_legal_entities (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    entity_name VARCHAR(255) NOT NULL DEFAULT '',
    registration_number VARCHAR(128),
    country_code VARCHAR(8) NOT NULL DEFAULT 'US',
    tax_id VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_legal_entities ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

-- 2. Identity, Advanced RBAC & ABAC
CREATE TABLE IF NOT EXISTS hrms_roles_permissions (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    role_name VARCHAR(128) NOT NULL DEFAULT '',
    abac_rules_json JSONB DEFAULT '{}'::jsonb,
    permissions_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_roles_permissions ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_api_keys (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    name VARCHAR(255) NOT NULL DEFAULT '',
    key_prefix VARCHAR(16) NOT NULL DEFAULT '',
    key_hash VARCHAR(255) NOT NULL DEFAULT '',
    scopes_json JSONB DEFAULT '["read"]'::jsonb,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_api_keys ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

-- 3. No-Code Workflow Engine
CREATE TABLE IF NOT EXISTS hrms_workflow_definitions (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    name VARCHAR(255) NOT NULL DEFAULT '',
    trigger_event VARCHAR(128) NOT NULL DEFAULT '',
    conditions_json JSONB DEFAULT '{}'::jsonb,
    approval_chain_json JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_workflow_definitions ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_workflow_executions (
    id VARCHAR(128) PRIMARY KEY,
    workflow_id VARCHAR(128),
    entity_type VARCHAR(64) NOT NULL DEFAULT '',
    entity_id VARCHAR(128) NOT NULL DEFAULT '',
    current_step INT NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    history_json JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_workflow_executions ADD COLUMN IF NOT EXISTS workflow_id VARCHAR(128);

-- 4. Integration Platform & Webhooks
CREATE TABLE IF NOT EXISTS hrms_webhooks (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    target_url TEXT NOT NULL DEFAULT '',
    events_json JSONB DEFAULT '[]'::jsonb,
    secret_hash VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_webhooks ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_integration_configs (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    provider_code VARCHAR(64) NOT NULL DEFAULT '',
    config_json JSONB DEFAULT '{}'::jsonb,
    sync_status VARCHAR(32) NOT NULL DEFAULT 'active',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_integration_configs ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

-- 5. AI Workforce Intelligence & AI Studio
CREATE TABLE IF NOT EXISTS hrms_ai_automation_rules (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    feature_code VARCHAR(64) NOT NULL DEFAULT '',
    prompt_template TEXT,
    model_type VARCHAR(64) NOT NULL DEFAULT 'gemini-flash',
    usage_cost_limit DOUBLE PRECISION DEFAULT 100.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_ai_automation_rules ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_executive_ai_insights (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    domain VARCHAR(64) NOT NULL DEFAULT 'attrition',
    payload_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_executive_ai_insights ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

-- 6. Enterprise Reporting & Custom Analytics
CREATE TABLE IF NOT EXISTS hrms_report_templates (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    title VARCHAR(255) NOT NULL DEFAULT '',
    module VARCHAR(64) NOT NULL DEFAULT 'workforce',
    fields_json JSONB DEFAULT '[]'::jsonb,
    export_format VARCHAR(16) NOT NULL DEFAULT 'pdf',
    schedule_cron VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_report_templates ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_generated_reports (
    id VARCHAR(128) PRIMARY KEY,
    template_id VARCHAR(128),
    generated_by_id VARCHAR(128),
    file_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_generated_reports ADD COLUMN IF NOT EXISTS template_id VARCHAR(128);

-- 7. Audit, Governance & Observability
CREATE TABLE IF NOT EXISTS hrms_platform_audit_events (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    actor_id VARCHAR(128),
    action VARCHAR(128) NOT NULL DEFAULT '',
    resource VARCHAR(128) NOT NULL DEFAULT '',
    ip_address VARCHAR(64),
    details_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_platform_audit_events ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_platform_metrics (
    id VARCHAR(128) PRIMARY KEY,
    service_name VARCHAR(64) NOT NULL DEFAULT '',
    metric_key VARCHAR(128) NOT NULL DEFAULT '',
    metric_value DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_platform_metrics ADD COLUMN IF NOT EXISTS service_name VARCHAR(64);
