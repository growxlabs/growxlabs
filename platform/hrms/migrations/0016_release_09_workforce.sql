-- Release 09 Migration: Workforce Operations, Employee Experience & Enterprise Administration

-- 1. Workforce Planning & Positions
CREATE TABLE IF NOT EXISTS hrms_workforce_plans (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    name VARCHAR(255) NOT NULL DEFAULT '',
    fiscal_year VARCHAR(32) NOT NULL DEFAULT '',
    target_headcount INT NOT NULL DEFAULT 0,
    budget_total DOUBLE PRECISION NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_workforce_plans ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_position_plans (
    id VARCHAR(128) PRIMARY KEY,
    plan_id VARCHAR(128),
    designation_id VARCHAR(128),
    department_id VARCHAR(128),
    quarter_code VARCHAR(16) NOT NULL DEFAULT 'Q1',
    target_hires INT NOT NULL DEFAULT 1,
    allocated_budget DOUBLE PRECISION NOT NULL DEFAULT 0
);
ALTER TABLE hrms_position_plans ADD COLUMN IF NOT EXISTS plan_id VARCHAR(128);

-- 2. Employee Helpdesk & Knowledge Base
CREATE TABLE IF NOT EXISTS hrms_helpdesk_tickets (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    employee_id VARCHAR(128),
    category VARCHAR(32) NOT NULL DEFAULT 'it',
    subject VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT,
    priority VARCHAR(32) NOT NULL DEFAULT 'medium',
    status VARCHAR(32) NOT NULL DEFAULT 'open',
    assigned_agent_id VARCHAR(128),
    sla_due_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_helpdesk_tickets ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_helpdesk_tickets ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_helpdesk_comments (
    id VARCHAR(128) PRIMARY KEY,
    ticket_id VARCHAR(128),
    author_id VARCHAR(128),
    comment TEXT,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_helpdesk_comments ADD COLUMN IF NOT EXISTS ticket_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_knowledge_base (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    title VARCHAR(255) NOT NULL DEFAULT '',
    category VARCHAR(64) NOT NULL DEFAULT 'general',
    content TEXT,
    views_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_knowledge_base ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

-- 3. Travel Management & Visitor Logs
CREATE TABLE IF NOT EXISTS hrms_travel_requests (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    employee_id VARCHAR(128),
    destination VARCHAR(255) NOT NULL DEFAULT '',
    purpose TEXT,
    departure_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    return_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    estimated_budget DOUBLE PRECISION NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_travel_requests ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_travel_requests ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_travel_itineraries (
    id VARCHAR(128) PRIMARY KEY,
    travel_id VARCHAR(128),
    booking_type VARCHAR(32) NOT NULL DEFAULT 'flight',
    provider_name VARCHAR(255) NOT NULL DEFAULT '',
    confirmation_code VARCHAR(128),
    cost DOUBLE PRECISION NOT NULL DEFAULT 0
);
ALTER TABLE hrms_travel_itineraries ADD COLUMN IF NOT EXISTS travel_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_visitor_logs (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    visitor_name VARCHAR(255) NOT NULL DEFAULT '',
    host_employee_id VARCHAR(128),
    company_name VARCHAR(255),
    qr_pass_code VARCHAR(128) NOT NULL DEFAULT '',
    entry_time TIMESTAMP WITH TIME ZONE,
    exit_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) NOT NULL DEFAULT 'registered',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_visitor_logs ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

-- 4. Employee Engagement, Polls & Policy Management
CREATE TABLE IF NOT EXISTS hrms_announcements (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    title VARCHAR(255) NOT NULL DEFAULT '',
    content TEXT,
    author_id VARCHAR(128),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_announcements ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_surveys (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    title VARCHAR(255) NOT NULL DEFAULT '',
    survey_type VARCHAR(32) NOT NULL DEFAULT 'pulse',
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_surveys ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_survey_responses (
    id VARCHAR(128) PRIMARY KEY,
    survey_id VARCHAR(128),
    employee_id VARCHAR(128),
    answers_json JSONB DEFAULT '{}'::jsonb,
    sentiment_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_survey_responses ADD COLUMN IF NOT EXISTS survey_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_policies (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    title VARCHAR(255) NOT NULL DEFAULT '',
    category VARCHAR(64) NOT NULL DEFAULT 'hr',
    version INT NOT NULL DEFAULT 1,
    document_url TEXT,
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_policies ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_policy_acknowledgements (
    id VARCHAR(128) PRIMARY KEY,
    policy_id VARCHAR(128),
    employee_id VARCHAR(128),
    acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(64)
);
ALTER TABLE hrms_policy_acknowledgements ADD COLUMN IF NOT EXISTS policy_id VARCHAR(128);
ALTER TABLE hrms_policy_acknowledgements ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);

-- 5. Organization Units & Compliance Calendar Tasks
CREATE TABLE IF NOT EXISTS hrms_organization_units (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    name VARCHAR(255) NOT NULL DEFAULT '',
    unit_type VARCHAR(32) NOT NULL DEFAULT 'business_unit',
    code VARCHAR(64) NOT NULL DEFAULT '',
    parent_unit_id VARCHAR(128)
);
ALTER TABLE hrms_organization_units ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_compliance_tasks (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    title VARCHAR(255) NOT NULL DEFAULT '',
    regulatory_body VARCHAR(255) NOT NULL DEFAULT '',
    due_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    assigned_to_id VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    evidence_url TEXT
);
ALTER TABLE hrms_compliance_tasks ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

-- 6. AI Workforce Insights
CREATE TABLE IF NOT EXISTS hrms_ai_workforce_insights (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    insight_type VARCHAR(64) NOT NULL DEFAULT 'attrition_risk',
    payload_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_ai_workforce_insights ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
