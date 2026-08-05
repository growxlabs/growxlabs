-- ============================================================================
-- GROWXLABS RECRUITMENT — TEMPORARY INTERVIEWER ACCESS & WORKSPACE MIGRATION
-- Migration: 0024_temporary_interviewer_access.sql
-- (Hardened for idempotent compatibility with pre-existing schemas)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS recruitment;

-- ----------------------------------------------------------------------------
-- 1. RECRUITMENT INTERVIEWS
-- Stores interview schedule, meeting details, and status
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recruitment.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  application_id UUID NOT NULL,
  candidate_id TEXT NOT NULL DEFAULT '',
  job_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  title VARCHAR(255) NOT NULL DEFAULT 'Interview',
  stage VARCHAR(64) NOT NULL DEFAULT 'INTERVIEW',
  meeting_provider VARCHAR(64) NOT NULL DEFAULT 'google_meet',
  meeting_join_url TEXT,
  meeting_created_at TIMESTAMPTZ,
  calendar_provider VARCHAR(64),
  calendar_event_id TEXT,
  conference_id TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  duration_minutes INT NOT NULL DEFAULT 30,
  timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
  location_text TEXT,
  instructions TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'scheduled',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure all columns exist even if recruitment.interviews was created by an older migration
ALTER TABLE recruitment.interviews ADD COLUMN IF NOT EXISTS candidate_id TEXT DEFAULT '';
ALTER TABLE recruitment.interviews ADD COLUMN IF NOT EXISTS job_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID;
ALTER TABLE recruitment.interviews ADD COLUMN IF NOT EXISTS stage VARCHAR(64) DEFAULT 'INTERVIEW';
ALTER TABLE recruitment.interviews ADD COLUMN IF NOT EXISTS meeting_provider VARCHAR(64) DEFAULT 'google_meet';
ALTER TABLE recruitment.interviews ADD COLUMN IF NOT EXISTS meeting_join_url TEXT;
ALTER TABLE recruitment.interviews ADD COLUMN IF NOT EXISTS meeting_created_at TIMESTAMPTZ;
ALTER TABLE recruitment.interviews ADD COLUMN IF NOT EXISTS calendar_provider VARCHAR(64);
ALTER TABLE recruitment.interviews ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;
ALTER TABLE recruitment.interviews ADD COLUMN IF NOT EXISTS conference_id TEXT;
ALTER TABLE recruitment.interviews ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE recruitment.interviews ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 30;
ALTER TABLE recruitment.interviews ADD COLUMN IF NOT EXISTS timezone VARCHAR(64) DEFAULT 'Asia/Kolkata';
ALTER TABLE recruitment.interviews ADD COLUMN IF NOT EXISTS location_text TEXT;
ALTER TABLE recruitment.interviews ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Backfill scheduled_at from starts_at if starts_at exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='recruitment' AND table_name='interviews' AND column_name='starts_at') THEN
    UPDATE recruitment.interviews SET scheduled_at = starts_at WHERE scheduled_at IS NULL AND starts_at IS NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='recruitment' AND table_name='interviews' AND column_name='meeting_url') THEN
    UPDATE recruitment.interviews SET meeting_join_url = meeting_url WHERE meeting_join_url IS NULL AND meeting_url IS NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_interviews_app_id ON recruitment.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON recruitment.interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON recruitment.interviews(status);

-- ----------------------------------------------------------------------------
-- 2. RECRUITMENT INTERVIEW ASSIGNMENTS
-- Secure time-bound access assignments for team interviewers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recruitment.interview_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  workspace_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  interview_id UUID NOT NULL REFERENCES recruitment.interviews(id) ON DELETE CASCADE,
  application_id UUID NOT NULL,
  candidate_id TEXT NOT NULL DEFAULT '',
  job_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  interviewer_user_id UUID,
  interviewer_email VARCHAR(255) NOT NULL,
  interviewer_name VARCHAR(255),
  assigned_by_user_id UUID,
  access_starts_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  access_expires_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
  status VARCHAR(32) NOT NULL DEFAULT 'invited',
  permissions JSONB NOT NULL DEFAULT '[
    "interview.assignment.read",
    "interview.candidate.summary.read",
    "interview.resume.preview",
    "interview.answers.read",
    "interview.join",
    "interview.feedback.write",
    "interview.scorecard.write"
  ]'::JSONB,
  visibility_scope JSONB NOT NULL DEFAULT '{
    "contact_details": false,
    "resume": true,
    "portfolio": true,
    "application_answers": true,
    "education": true,
    "employment_history": true,
    "assessment_results": true,
    "prior_feedback": false,
    "recruiter_notes": false,
    "compensation_expectations": false
  }'::JSONB,
  invitation_token_hash VARCHAR(255),
  invitation_expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID,
  revocation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assignments_interview_id ON recruitment.interview_assignments(interview_id);
CREATE INDEX IF NOT EXISTS idx_assignments_interviewer_user ON recruitment.interview_assignments(interviewer_user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_token_hash ON recruitment.interview_assignments(invitation_token_hash);
CREATE INDEX IF NOT EXISTS idx_assignments_access_window ON recruitment.interview_assignments(access_starts_at, access_expires_at);

-- ----------------------------------------------------------------------------
-- 3. RECRUITMENT INTERVIEW ACCESS EVENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recruitment.interview_access_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  assignment_id UUID NOT NULL REFERENCES recruitment.interview_assignments(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL REFERENCES recruitment.interviews(id) ON DELETE CASCADE,
  user_id UUID,
  user_email VARCHAR(255),
  event_type VARCHAR(64) NOT NULL,
  action_details JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_address VARCHAR(64),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_access_events_assignment ON recruitment.interview_access_events(assignment_id);
CREATE INDEX IF NOT EXISTS idx_access_events_type ON recruitment.interview_access_events(event_type);

-- ----------------------------------------------------------------------------
-- 4. RECRUITMENT INTERVIEW SCORECARDS & FEEDBACK
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recruitment.interview_scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  job_id UUID,
  stage VARCHAR(64) NOT NULL DEFAULT 'INTERVIEW',
  title VARCHAR(255) NOT NULL DEFAULT 'Standard Candidate Evaluation Scorecard',
  criteria JSONB NOT NULL DEFAULT '[
    {"key": "communication", "label": "Communication & Verbal Clarity", "weight": 1, "required": true},
    {"key": "confidence", "label": "Confidence & Articulation", "weight": 1, "required": true},
    {"key": "listening", "label": "Active Listening & Question Comprehension", "weight": 1, "required": true},
    {"key": "business_understanding", "label": "Business Understanding & Domain Logic", "weight": 1, "required": true},
    {"key": "problem_solving", "label": "Problem Solving & Analytical Thinking", "weight": 1, "required": true},
    {"key": "ownership", "label": "Grit, Drive & Startup Readiness", "weight": 1, "required": true}
  ]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruitment.interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  interview_id UUID NOT NULL REFERENCES recruitment.interviews(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES recruitment.interview_assignments(id) ON DELETE CASCADE,
  interviewer_user_id UUID,
  ratings JSONB NOT NULL DEFAULT '{}'::JSONB,
  notes TEXT,
  scratchpad_notes TEXT,
  recommendation VARCHAR(64),
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  reopened_at TIMESTAMPTZ,
  reopened_by UUID,
  reopen_reason TEXT,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add columns to feedback if pre-existing
ALTER TABLE recruitment.interview_feedback ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES recruitment.interview_assignments(id) ON DELETE CASCADE;
ALTER TABLE recruitment.interview_feedback ADD COLUMN IF NOT EXISTS scratchpad_notes TEXT;
ALTER TABLE recruitment.interview_feedback ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE recruitment.interview_feedback ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;

-- Drop strict check constraint on recommendation if pre-existing
ALTER TABLE recruitment.interview_feedback DROP CONSTRAINT IF EXISTS interview_feedback_recommendation_check;

CREATE TABLE IF NOT EXISTS recruitment.interview_feedback_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES recruitment.interview_feedback(id) ON DELETE CASCADE,
  version INT NOT NULL,
  ratings JSONB NOT NULL,
  notes TEXT,
  recommendation VARCHAR(64),
  saved_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_interview ON recruitment.interview_feedback(interview_id);

-- Enable RLS
ALTER TABLE recruitment.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.interview_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.interview_access_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.interview_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.interview_feedback_versions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'interviews_admin_all' AND tablename = 'interviews') THEN
    CREATE POLICY "interviews_admin_all" ON recruitment.interviews FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'assignments_admin_all' AND tablename = 'interview_assignments') THEN
    CREATE POLICY "assignments_admin_all" ON recruitment.interview_assignments FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'access_events_admin_all' AND tablename = 'interview_access_events') THEN
    CREATE POLICY "access_events_admin_all" ON recruitment.interview_access_events FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'scorecards_admin_all' AND tablename = 'interview_scorecards') THEN
    CREATE POLICY "scorecards_admin_all" ON recruitment.interview_scorecards FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'feedback_admin_all' AND tablename = 'interview_feedback') THEN
    CREATE POLICY "feedback_admin_all" ON recruitment.interview_feedback FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'feedback_versions_admin_all' AND tablename = 'interview_feedback_versions') THEN
    CREATE POLICY "feedback_versions_admin_all" ON recruitment.interview_feedback_versions FOR ALL USING (true);
  END IF;
END $$;
