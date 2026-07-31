-- Release 06 Migration: Performance Management & Talent Intelligence

-- 1. Performance System Configuration
CREATE TABLE IF NOT EXISTS hrms_performance_configs (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    rating_scale_type VARCHAR(32) NOT NULL DEFAULT '5_point',
    calibration_distribution_type VARCHAR(32) NOT NULL DEFAULT 'nine_box',
    rating_labels_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_performance_configs ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_performance_configs ADD COLUMN IF NOT EXISTS rating_scale_type VARCHAR(32) DEFAULT '5_point';
ALTER TABLE hrms_performance_configs ADD COLUMN IF NOT EXISTS calibration_distribution_type VARCHAR(32) DEFAULT 'nine_box';

-- 2. Goals (OKRs, KPIs, KRAs, Dept, Business, Project, Personal)
CREATE TABLE IF NOT EXISTS hrms_goals (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    department_id VARCHAR(128),
    employee_id VARCHAR(128),
    parent_goal_id VARCHAR(128),
    goal_type VARCHAR(32) NOT NULL DEFAULT 'okr',
    cycle_type VARCHAR(32) NOT NULL DEFAULT 'quarterly',
    cycle_code VARCHAR(32) NOT NULL DEFAULT 'Q1_2026',
    title VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT,
    weightage DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    progress_percent INT NOT NULL DEFAULT 0,
    due_date TIMESTAMP WITH TIME ZONE,
    created_by_id VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_goals ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_goals ADD COLUMN IF NOT EXISTS department_id VARCHAR(128);
ALTER TABLE hrms_goals ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);
ALTER TABLE hrms_goals ADD COLUMN IF NOT EXISTS parent_goal_id VARCHAR(128);
ALTER TABLE hrms_goals ADD COLUMN IF NOT EXISTS goal_type VARCHAR(32) DEFAULT 'okr';
ALTER TABLE hrms_goals ADD COLUMN IF NOT EXISTS cycle_type VARCHAR(32) DEFAULT 'quarterly';
ALTER TABLE hrms_goals ADD COLUMN IF NOT EXISTS cycle_code VARCHAR(32) DEFAULT 'Q1_2026';
ALTER TABLE hrms_goals ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT '';
ALTER TABLE hrms_goals ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE hrms_goals ADD COLUMN IF NOT EXISTS weightage DOUBLE PRECISION DEFAULT 10.0;
ALTER TABLE hrms_goals ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'draft';
ALTER TABLE hrms_goals ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0;
ALTER TABLE hrms_goals ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE hrms_goals ADD COLUMN IF NOT EXISTS created_by_id VARCHAR(128);

CREATE INDEX IF NOT EXISTS idx_hrms_goals_org_emp ON hrms_goals(organisation_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_hrms_goals_type_status ON hrms_goals(goal_type, status);

-- 3. Goal Milestones
CREATE TABLE IF NOT EXISTS hrms_goal_milestones (
    id VARCHAR(128) PRIMARY KEY,
    goal_id VARCHAR(128),
    title VARCHAR(255) NOT NULL DEFAULT '',
    target_value DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    current_value DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    unit VARCHAR(32) NOT NULL DEFAULT 'percent',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_goal_milestones ADD COLUMN IF NOT EXISTS goal_id VARCHAR(128);
ALTER TABLE hrms_goal_milestones ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT '';
ALTER TABLE hrms_goal_milestones ADD COLUMN IF NOT EXISTS target_value DOUBLE PRECISION DEFAULT 100.0;
ALTER TABLE hrms_goal_milestones ADD COLUMN IF NOT EXISTS current_value DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE hrms_goal_milestones ADD COLUMN IF NOT EXISTS unit VARCHAR(32) DEFAULT 'percent';
ALTER TABLE hrms_goal_milestones ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

-- 4. Goal Updates Audit Log
CREATE TABLE IF NOT EXISTS hrms_goal_updates (
    id VARCHAR(128) PRIMARY KEY,
    goal_id VARCHAR(128),
    updated_by_id VARCHAR(128),
    old_progress INT NOT NULL DEFAULT 0,
    new_progress INT NOT NULL DEFAULT 0,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_goal_updates ADD COLUMN IF NOT EXISTS goal_id VARCHAR(128);
ALTER TABLE hrms_goal_updates ADD COLUMN IF NOT EXISTS updated_by_id VARCHAR(128);
ALTER TABLE hrms_goal_updates ADD COLUMN IF NOT EXISTS old_progress INT DEFAULT 0;
ALTER TABLE hrms_goal_updates ADD COLUMN IF NOT EXISTS new_progress INT DEFAULT 0;

-- 5. Competencies & Behavior Indicators
CREATE TABLE IF NOT EXISTS hrms_competencies (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    category VARCHAR(64) NOT NULL DEFAULT 'core',
    code VARCHAR(64) NOT NULL DEFAULT '',
    name VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_competencies ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_competency_levels (
    id VARCHAR(128) PRIMARY KEY,
    competency_id VARCHAR(128),
    level INT NOT NULL DEFAULT 1,
    level_name VARCHAR(64) NOT NULL DEFAULT '',
    behavior_indicators TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_competency_levels ADD COLUMN IF NOT EXISTS competency_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_designation_competencies (
    id VARCHAR(128) PRIMARY KEY,
    designation_id VARCHAR(128),
    competency_id VARCHAR(128),
    required_level INT NOT NULL DEFAULT 3,
    weightage DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_designation_competencies ADD COLUMN IF NOT EXISTS designation_id VARCHAR(128);
ALTER TABLE hrms_designation_competencies ADD COLUMN IF NOT EXISTS competency_id VARCHAR(128);

-- 6. Review Cycles & Form Templates
CREATE TABLE IF NOT EXISTS hrms_review_cycles (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    name VARCHAR(255) NOT NULL DEFAULT '',
    cycle_type VARCHAR(32) NOT NULL DEFAULT 'annual',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_review_cycles ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_review_templates (
    id VARCHAR(128) PRIMARY KEY,
    review_cycle_id VARCHAR(128),
    title VARCHAR(255) NOT NULL DEFAULT '',
    competency_section_json JSONB DEFAULT '{}'::jsonb,
    goal_section_json JSONB DEFAULT '{}'::jsonb,
    custom_questions_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_review_templates ADD COLUMN IF NOT EXISTS review_cycle_id VARCHAR(128);

-- 7. Performance Reviews & Multi-tier Approvals
CREATE TABLE IF NOT EXISTS hrms_performance_reviews (
    id VARCHAR(128) PRIMARY KEY,
    version INT NOT NULL DEFAULT 1,
    organisation_id VARCHAR(128),
    review_cycle_id VARCHAR(128),
    employee_id VARCHAR(128),
    manager_id VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'self_review',
    overall_rating DOUBLE PRECISION,
    summary_comments TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_performance_reviews ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_performance_reviews ADD COLUMN IF NOT EXISTS review_cycle_id VARCHAR(128);
ALTER TABLE hrms_performance_reviews ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);
ALTER TABLE hrms_performance_reviews ADD COLUMN IF NOT EXISTS manager_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_review_ratings (
    id VARCHAR(128) PRIMARY KEY,
    review_id VARCHAR(128),
    evaluator_type VARCHAR(32) NOT NULL DEFAULT 'self',
    evaluator_id VARCHAR(128),
    competency_id VARCHAR(128),
    goal_id VARCHAR(128),
    rating DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    comments TEXT,
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_review_ratings ADD COLUMN IF NOT EXISTS review_id VARCHAR(128);

-- 8. 360 Degree Feedback
CREATE TABLE IF NOT EXISTS hrms_feedback_360 (
    id VARCHAR(128) PRIMARY KEY,
    review_id VARCHAR(128),
    subject_employee_id VARCHAR(128),
    reviewer_id VARCHAR(128),
    relationship VARCHAR(32) NOT NULL DEFAULT 'peer',
    is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    ratings_json JSONB DEFAULT '{}'::jsonb,
    comments TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_feedback_360 ADD COLUMN IF NOT EXISTS review_id VARCHAR(128);
ALTER TABLE hrms_feedback_360 ADD COLUMN IF NOT EXISTS subject_employee_id VARCHAR(128);

-- 9. Calibration Engine & 9-Box Grid
CREATE TABLE IF NOT EXISTS hrms_calibration_sessions (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    cycle_id VARCHAR(128),
    name VARCHAR(255) NOT NULL DEFAULT '',
    moderator_id VARCHAR(128),
    distribution_type VARCHAR(32) NOT NULL DEFAULT 'nine_box',
    status VARCHAR(32) NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_calibration_sessions ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_calibration_ratings (
    id VARCHAR(128) PRIMARY KEY,
    session_id VARCHAR(128),
    employee_id VARCHAR(128),
    pre_calibration_rating DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    post_calibration_rating DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    performance_box INT NOT NULL DEFAULT 2,
    potential_box INT NOT NULL DEFAULT 2,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_calibration_ratings ADD COLUMN IF NOT EXISTS session_id VARCHAR(128);
ALTER TABLE hrms_calibration_ratings ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);

-- 10. Performance Improvement Plans (PIP)
CREATE TABLE IF NOT EXISTS hrms_pip_plans (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    employee_id VARCHAR(128),
    manager_id VARCHAR(128),
    reason TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_pip_plans ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_pip_plans ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_pip_milestones (
    id VARCHAR(128) PRIMARY KEY,
    pip_id VARCHAR(128),
    objective VARCHAR(255) NOT NULL DEFAULT '',
    success_criteria TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_met BOOLEAN NOT NULL DEFAULT FALSE,
    comments TEXT
);
ALTER TABLE hrms_pip_milestones ADD COLUMN IF NOT EXISTS pip_id VARCHAR(128);

-- 11. Recognition & Rewards
CREATE TABLE IF NOT EXISTS hrms_rewards_recognition (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    recipient_employee_id VARCHAR(128),
    giver_employee_id VARCHAR(128),
    reward_type VARCHAR(32) NOT NULL DEFAULT 'appreciation',
    badge_name VARCHAR(128),
    points_or_amount DOUBLE PRECISION DEFAULT 0,
    title VARCHAR(255) NOT NULL DEFAULT '',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_rewards_recognition ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_rewards_recognition ADD COLUMN IF NOT EXISTS recipient_employee_id VARCHAR(128);

-- 12. Career Development & Succession Pipelines
CREATE TABLE IF NOT EXISTS hrms_idp_plans (
    id VARCHAR(128) PRIMARY KEY,
    employee_id VARCHAR(128),
    career_goal VARCHAR(255) NOT NULL DEFAULT '',
    skill_gaps_json JSONB DEFAULT '[]'::jsonb,
    action_items_json JSONB DEFAULT '[]'::jsonb,
    target_completion_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_idp_plans ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_succession_pipelines (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    designation_id VARCHAR(128),
    current_holder_id VARCHAR(128),
    risk_level VARCHAR(32) NOT NULL DEFAULT 'medium',
    impact_level VARCHAR(32) NOT NULL DEFAULT 'high',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_succession_pipelines ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);

CREATE TABLE IF NOT EXISTS hrms_successors (
    id VARCHAR(128) PRIMARY KEY,
    pipeline_id VARCHAR(128),
    successor_employee_id VARCHAR(128),
    readiness_level VARCHAR(32) NOT NULL DEFAULT 'ready_1_year',
    development_needs TEXT
);
ALTER TABLE hrms_successors ADD COLUMN IF NOT EXISTS pipeline_id VARCHAR(128);

-- 13. Immutable Employee Performance Timeline
CREATE TABLE IF NOT EXISTS hrms_performance_timeline (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    employee_id VARCHAR(128),
    event_type VARCHAR(64) NOT NULL DEFAULT '',
    title VARCHAR(255) NOT NULL DEFAULT '',
    details_json JSONB DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_performance_timeline ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_performance_timeline ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);

CREATE INDEX IF NOT EXISTS idx_hrms_timeline_emp ON hrms_performance_timeline(organisation_id, employee_id);

-- 14. AI Performance Insights Log
CREATE TABLE IF NOT EXISTS hrms_ai_performance_insights (
    id VARCHAR(128) PRIMARY KEY,
    organisation_id VARCHAR(128),
    employee_id VARCHAR(128),
    insight_type VARCHAR(64) NOT NULL DEFAULT '',
    payload_json JSONB DEFAULT '{}'::jsonb,
    is_applied BOOLEAN NOT NULL DEFAULT FALSE,
    applied_by_user_id VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE hrms_ai_performance_insights ADD COLUMN IF NOT EXISTS organisation_id VARCHAR(128);
ALTER TABLE hrms_ai_performance_insights ADD COLUMN IF NOT EXISTS employee_id VARCHAR(128);
