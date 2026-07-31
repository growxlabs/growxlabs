-- Releases 05-10 architecture revision.
-- Additive only: preserves all existing Release 01-17 objects and history.

BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '120s';

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Shared platform contracts used by every HRMS domain.
CREATE TABLE IF NOT EXISTS hrms_domain_outbox (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id varchar(128) NOT NULL,
    tenant_id varchar(128) NOT NULL,
    aggregate_type varchar(96) NOT NULL,
    aggregate_id varchar(128) NOT NULL,
    event_type varchar(128) NOT NULL,
    event_version integer NOT NULL DEFAULT 1,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    correlation_id varchar(128),
    causation_id varchar(128),
    occurred_at timestamptz NOT NULL DEFAULT now(),
    available_at timestamptz NOT NULL DEFAULT now(),
    published_at timestamptz,
    attempts integer NOT NULL DEFAULT 0,
    last_error text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by varchar(128) NOT NULL,
    updated_by varchar(128) NOT NULL,
    deleted_at timestamptz,
    version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS hrms_idempotency_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id varchar(128) NOT NULL,
    tenant_id varchar(128) NOT NULL,
    operation varchar(128) NOT NULL,
    idempotency_key varchar(255) NOT NULL,
    request_hash varchar(64) NOT NULL,
    response_status integer,
    response_body jsonb,
    resource_id varchar(128),
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by varchar(128) NOT NULL,
    updated_by varchar(128) NOT NULL,
    deleted_at timestamptz,
    version integer NOT NULL DEFAULT 1,
    UNIQUE (organisation_id, tenant_id, operation, idempotency_key)
);

CREATE TABLE IF NOT EXISTS hrms_saved_views (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id varchar(128) NOT NULL,
    tenant_id varchar(128) NOT NULL,
    owner_user_id varchar(128) NOT NULL,
    module varchar(64) NOT NULL,
    name varchar(160) NOT NULL,
    filters jsonb NOT NULL DEFAULT '{}'::jsonb,
    sorting jsonb NOT NULL DEFAULT '[]'::jsonb,
    columns jsonb NOT NULL DEFAULT '[]'::jsonb,
    is_shared boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by varchar(128) NOT NULL,
    updated_by varchar(128) NOT NULL,
    deleted_at timestamptz,
    version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS hrms_background_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id varchar(128) NOT NULL,
    tenant_id varchar(128) NOT NULL,
    module varchar(64) NOT NULL,
    job_type varchar(96) NOT NULL,
    status varchar(32) NOT NULL DEFAULT 'queued'
      CHECK (status IN ('queued','running','succeeded','failed','cancelled')),
    input jsonb NOT NULL DEFAULT '{}'::jsonb,
    result jsonb,
    attempts integer NOT NULL DEFAULT 0,
    available_at timestamptz NOT NULL DEFAULT now(),
    started_at timestamptz,
    completed_at timestamptz,
    last_error text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by varchar(128) NOT NULL,
    updated_by varchar(128) NOT NULL,
    deleted_at timestamptz,
    version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS hrms_dashboard_widgets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id varchar(128) NOT NULL,
    tenant_id varchar(128) NOT NULL,
    owner_user_id varchar(128) NOT NULL,
    audience varchar(32) NOT NULL,
    module varchar(64) NOT NULL,
    widget_key varchar(96) NOT NULL,
    position integer NOT NULL DEFAULT 0,
    configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by varchar(128) NOT NULL,
    updated_by varchar(128) NOT NULL,
    deleted_at timestamptz,
    version integer NOT NULL DEFAULT 1
);

-- Release 05: enterprise payroll.
CREATE TABLE IF NOT EXISTS hrms_payroll_simulations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_cycle_id varchar(128),
    scenario_name varchar(160) NOT NULL,
    input jsonb NOT NULL,
    result jsonb,
    status varchar(32) NOT NULL DEFAULT 'queued'
);
CREATE TABLE IF NOT EXISTS hrms_payroll_adjustments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_cycle_id varchar(128) NOT NULL,
    employee_id varchar(128) NOT NULL,
    adjustment_type varchar(48) NOT NULL,
    source_period varchar(16),
    currency varchar(8) NOT NULL,
    amount numeric(18,4) NOT NULL,
    reason text NOT NULL,
    status varchar(32) NOT NULL DEFAULT 'draft'
);
CREATE TABLE IF NOT EXISTS hrms_payroll_rollbacks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_cycle_id varchar(128) NOT NULL,
    rollback_of_id uuid,
    reason text NOT NULL,
    status varchar(32) NOT NULL DEFAULT 'requested',
    workflow_instance_id uuid
);
CREATE TABLE IF NOT EXISTS hrms_payroll_tax_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code varchar(3) NOT NULL,
    jurisdiction varchar(96),
    tax_year varchar(16) NOT NULL,
    currency varchar(8) NOT NULL,
    rules jsonb NOT NULL,
    effective_from date NOT NULL,
    effective_to date
);
CREATE TABLE IF NOT EXISTS hrms_payroll_fx_rates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency varchar(8) NOT NULL,
    quote_currency varchar(8) NOT NULL,
    rate numeric(24,10) NOT NULL,
    rate_date date NOT NULL,
    source varchar(64) NOT NULL
);
CREATE TABLE IF NOT EXISTS hrms_payroll_exports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_cycle_id varchar(128) NOT NULL,
    export_type varchar(24) NOT NULL CHECK (export_type IN ('bank','gl','reconciliation')),
    format varchar(24) NOT NULL,
    document_id uuid,
    status varchar(32) NOT NULL DEFAULT 'queued',
    totals jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Release 06: performance additions.
CREATE TABLE IF NOT EXISTS hrms_talent_matrix_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    review_cycle_id varchar(128) NOT NULL,
    employee_id varchar(128) NOT NULL,
    performance_box integer NOT NULL,
    potential_box integer NOT NULL,
    readiness varchar(32),
    evidence jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS hrms_promotion_readiness (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id varchar(128) NOT NULL,
    target_designation_id varchar(128),
    readiness_score numeric(6,2),
    competency_gaps jsonb NOT NULL DEFAULT '[]'::jsonb,
    recommendation text,
    advisory_only boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS hrms_compensation_recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id varchar(128) NOT NULL,
    review_cycle_id varchar(128),
    recommended_currency varchar(8),
    recommended_amount numeric(18,4),
    rationale jsonb NOT NULL DEFAULT '{}'::jsonb,
    advisory_only boolean NOT NULL DEFAULT true
);

-- Release 07: learning interoperability and marketplace.
CREATE TABLE IF NOT EXISTS hrms_scorm_packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id varchar(128) NOT NULL,
    document_id uuid NOT NULL,
    scorm_version varchar(24) NOT NULL,
    manifest jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS hrms_xapi_statements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id varchar(128) NOT NULL,
    statement_id uuid NOT NULL,
    verb varchar(255) NOT NULL,
    object jsonb NOT NULL,
    result jsonb,
    occurred_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS hrms_learning_providers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(160) NOT NULL,
    provider_type varchar(48) NOT NULL,
    configuration_reference varchar(255),
    status varchar(32) NOT NULL DEFAULT 'active'
);
CREATE TABLE IF NOT EXISTS hrms_certification_marketplace (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id uuid,
    title varchar(255) NOT NULL,
    currency varchar(8),
    price numeric(18,4),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    status varchar(32) NOT NULL DEFAULT 'draft'
);
CREATE TABLE IF NOT EXISTS hrms_skill_passports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id varchar(128) NOT NULL,
    passport_version integer NOT NULL DEFAULT 1,
    skills jsonb NOT NULL DEFAULT '[]'::jsonb,
    evidence_document_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
    published_at timestamptz
);
CREATE TABLE IF NOT EXISTS hrms_ai_course_generation_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_by varchar(128) NOT NULL,
    brief jsonb NOT NULL,
    output_course_id varchar(128),
    advisory_only boolean NOT NULL DEFAULT true,
    status varchar(32) NOT NULL DEFAULT 'queued'
);

-- Release 08: independent compensation domain.
CREATE TABLE IF NOT EXISTS hrms_benefit_plans (
    id varchar(128) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name varchar(160) NOT NULL,
    plan_type varchar(48) NOT NULL,
    currency varchar(8),
    annual_budget numeric(18,4),
    rules jsonb NOT NULL DEFAULT '{}'::jsonb,
    status varchar(32) NOT NULL DEFAULT 'draft'
);
CREATE TABLE IF NOT EXISTS hrms_benefit_enrollments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id varchar(128) NOT NULL REFERENCES hrms_benefit_plans(id),
    employee_id varchar(128) NOT NULL,
    selections jsonb NOT NULL DEFAULT '{}'::jsonb,
    elected_amount numeric(18,4),
    status varchar(32) NOT NULL DEFAULT 'pending',
    workflow_instance_id uuid
);
CREATE TABLE IF NOT EXISTS hrms_equity_grants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id varchar(128) NOT NULL,
    grant_type varchar(32) NOT NULL,
    units numeric(20,6) NOT NULL,
    strike_price numeric(20,6),
    currency varchar(8),
    grant_date date NOT NULL,
    vesting_schedule jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS hrms_compensation_benchmarks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code varchar(3),
    job_family varchar(128) NOT NULL,
    level varchar(64),
    currency varchar(8) NOT NULL,
    percentile_data jsonb NOT NULL,
    source varchar(128) NOT NULL,
    effective_at date NOT NULL
);
CREATE TABLE IF NOT EXISTS hrms_total_rewards_statements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id varchar(128) NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    currency varchar(8) NOT NULL,
    totals jsonb NOT NULL,
    document_id uuid,
    status varchar(32) NOT NULL DEFAULT 'queued'
);
CREATE TABLE IF NOT EXISTS hrms_compensation_budgets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fiscal_year varchar(16) NOT NULL,
    department_id varchar(128),
    currency varchar(8) NOT NULL,
    allocated numeric(18,4) NOT NULL,
    committed numeric(18,4) NOT NULL DEFAULT 0,
    spent numeric(18,4) NOT NULL DEFAULT 0,
    status varchar(32) NOT NULL DEFAULT 'draft',
    workflow_instance_id uuid
);

-- Release 09: workforce operations additions.
CREATE TABLE IF NOT EXISTS hrms_shift_plans (
    id varchar(128) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name varchar(160) NOT NULL,
    timezone varchar(64) NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    status varchar(32) NOT NULL DEFAULT 'draft',
    workflow_instance_id uuid
);
CREATE TABLE IF NOT EXISTS hrms_shift_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_plan_id varchar(128) NOT NULL REFERENCES hrms_shift_plans(id),
    employee_id varchar(128) NOT NULL,
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    location_id varchar(128),
    status varchar(32) NOT NULL DEFAULT 'scheduled'
);
CREATE TABLE IF NOT EXISTS hrms_spaces (
    id varchar(128) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name varchar(160) NOT NULL,
    location_id varchar(128),
    capacity integer NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS hrms_desk_bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id varchar(128) NOT NULL REFERENCES hrms_spaces(id),
    desk_code varchar(64) NOT NULL,
    employee_id varchar(128) NOT NULL,
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    status varchar(32) NOT NULL DEFAULT 'confirmed'
);
CREATE TABLE IF NOT EXISTS hrms_fleet_vehicles (
    id varchar(128) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    registration_number varchar(64) NOT NULL,
    vehicle_type varchar(48) NOT NULL,
    status varchar(32) NOT NULL DEFAULT 'available',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS hrms_fleet_bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id varchar(128) NOT NULL REFERENCES hrms_fleet_vehicles(id),
    employee_id varchar(128) NOT NULL,
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    purpose text,
    status varchar(32) NOT NULL DEFAULT 'requested',
    workflow_instance_id uuid
);
CREATE TABLE IF NOT EXISTS hrms_marketplace_listings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_employee_id varchar(128) NOT NULL,
    listing_type varchar(48) NOT NULL,
    title varchar(160) NOT NULL,
    description text,
    status varchar(32) NOT NULL DEFAULT 'active'
);
CREATE TABLE IF NOT EXISTS hrms_employee_communities (
    id varchar(128) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name varchar(160) NOT NULL,
    description text,
    visibility varchar(32) NOT NULL DEFAULT 'organisation',
    status varchar(32) NOT NULL DEFAULT 'active'
);
CREATE TABLE IF NOT EXISTS hrms_community_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id varchar(128) NOT NULL REFERENCES hrms_employee_communities(id),
    employee_id varchar(128) NOT NULL,
    role varchar(32) NOT NULL DEFAULT 'member'
);

-- Release 10: enterprise platform additions.
CREATE TABLE IF NOT EXISTS hrms_feature_flags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key varchar(160) NOT NULL,
    environment varchar(32) NOT NULL,
    enabled boolean NOT NULL DEFAULT false,
    rollout_percentage integer NOT NULL DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
    targeting_rules jsonb NOT NULL DEFAULT '[]'::jsonb
);
CREATE TABLE IF NOT EXISTS hrms_plugins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plugin_key varchar(160) NOT NULL,
    name varchar(160) NOT NULL,
    manifest jsonb NOT NULL,
    status varchar(32) NOT NULL DEFAULT 'draft',
    published_at timestamptz
);
CREATE TABLE IF NOT EXISTS hrms_api_products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_key varchar(160) NOT NULL,
    name varchar(160) NOT NULL,
    openapi_document jsonb NOT NULL,
    visibility varchar(32) NOT NULL DEFAULT 'private',
    status varchar(32) NOT NULL DEFAULT 'draft'
);
CREATE TABLE IF NOT EXISTS hrms_event_replay_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type varchar(128),
    from_occurred_at timestamptz,
    to_occurred_at timestamptz,
    filter jsonb NOT NULL DEFAULT '{}'::jsonb,
    status varchar(32) NOT NULL DEFAULT 'queued'
);
CREATE TABLE IF NOT EXISTS hrms_data_warehouse_connectors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(160) NOT NULL,
    connector_type varchar(64) NOT NULL,
    secret_reference varchar(255) NOT NULL,
    configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
    status varchar(32) NOT NULL DEFAULT 'disabled'
);
CREATE TABLE IF NOT EXISTS hrms_ai_agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(160) NOT NULL,
    instructions text NOT NULL,
    allowed_capabilities jsonb NOT NULL DEFAULT '[]'::jsonb,
    advisory_only boolean NOT NULL DEFAULT true,
    status varchar(32) NOT NULL DEFAULT 'draft'
);
CREATE TABLE IF NOT EXISTS hrms_enterprise_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_key varchar(160) NOT NULL,
    policy_version integer NOT NULL,
    specification jsonb NOT NULL,
    status varchar(32) NOT NULL DEFAULT 'draft',
    published_at timestamptz
);
CREATE TABLE IF NOT EXISTS hrms_automation_definitions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(160) NOT NULL,
    trigger_spec jsonb NOT NULL,
    workflow_definition_id uuid,
    action_spec jsonb NOT NULL,
    status varchar(32) NOT NULL DEFAULT 'draft'
);

-- Every HRMS entity receives the common non-destructive metadata contract.
DO $$
DECLARE
    relation record;
BEGIN
    FOR relation IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename LIKE 'hrms\_%' ESCAPE '\'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS organisation_id varchar(128)', relation.tablename);
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id varchar(128)', relation.tablename);
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()', relation.tablename);
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()', relation.tablename);
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS created_by varchar(128)', relation.tablename);
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_by varchar(128)', relation.tablename);
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_at timestamptz', relation.tablename);
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1', relation.tablename);
        EXECUTE format(
            'UPDATE public.%I SET tenant_id = organisation_id WHERE tenant_id IS NULL AND organisation_id IS NOT NULL',
            relation.tablename
        );
    END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS hrms_outbox_ready_idx
    ON hrms_domain_outbox (available_at, occurred_at)
    WHERE published_at IS NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS hrms_jobs_ready_idx
    ON hrms_background_jobs (module, available_at, created_at)
    WHERE status IN ('queued','failed') AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS hrms_saved_views_owner_idx
    ON hrms_saved_views (organisation_id, tenant_id, owner_user_id, module)
    WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS hrms_xapi_statement_scope_uq
    ON hrms_xapi_statements (organisation_id, tenant_id, statement_id);
CREATE UNIQUE INDEX IF NOT EXISTS hrms_desk_booking_slot_uq
    ON hrms_desk_bookings (organisation_id, tenant_id, space_id, desk_code, starts_at)
    WHERE deleted_at IS NULL AND status <> 'cancelled';
CREATE UNIQUE INDEX IF NOT EXISTS hrms_feature_flag_scope_uq
    ON hrms_feature_flags (organisation_id, tenant_id, environment, flag_key)
    WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS hrms_plugin_scope_uq
    ON hrms_plugins (organisation_id, tenant_id, plugin_key)
    WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS hrms_api_product_scope_uq
    ON hrms_api_products (organisation_id, tenant_id, product_key)
    WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS hrms_policy_scope_version_uq
    ON hrms_enterprise_policies (organisation_id, tenant_id, policy_key, policy_version)
    WHERE deleted_at IS NULL;

COMMIT;
