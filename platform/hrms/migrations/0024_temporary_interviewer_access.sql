-- ============================================================================
-- GROWXLABS RECRUITMENT — TEMPORARY INTERVIEWER ACCESS & WORKSPACE MIGRATION
-- Migration: 0024_temporary_interviewer_access.sql
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
  candidate_id TEXT NOT NULL,
  job_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  stage VARCHAR(64) NOT NULL DEFAULT 'INTERVIEW',
  meeting_provider VARCHAR(64) NOT NULL DEFAULT 'google_meet', -- google_meet, zoom, teams, phone, in_person, custom
  meeting_join_url TEXT,
  meeting_created_at TIMESTAMPTZ,
  calendar_provider VARCHAR(64),
  calendar_event_id TEXT,
  conference_id TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
  location_text TEXT,
  instructions TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled, rescheduled
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
  candidate_id TEXT NOT NULL,
  job_id UUID NOT NULL,
  interviewer_user_id UUID,
  interviewer_email VARCHAR(255) NOT NULL,
  interviewer_name VARCHAR(255),
  assigned_by_user_id UUID,
  access_starts_at TIMESTAMPTZ NOT NULL,
  access_expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'invited', -- draft, invited, accepted, active, expired, revoked, completed, cancelled
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
-- Immutable audit log for all interviewer access and document view events
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recruitment.interview_access_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  assignment_id UUID NOT NULL REFERENCES recruitment.interview_assignments(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL REFERENCES recruitment.interviews(id) ON DELETE CASCADE,
  user_id UUID,
  user_email VARCHAR(255),
  event_type VARCHAR(64) NOT NULL, -- assignment_created, invitation_sent, invitation_accepted, profile_viewed, resume_previewed, resume_downloaded, meeting_joined, feedback_saved, feedback_submitted, access_extended, access_revoked, scorecard_reopened
  action_details JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_address VARCHAR(64),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_access_events_assignment ON recruitment.interview_access_events(assignment_id);
CREATE INDEX IF NOT EXISTS idx_access_events_type ON recruitment.interview_access_events(event_type);

-- ----------------------------------------------------------------------------
-- 4. RECRUITMENT INTERVIEW SCORECARDS & FEEDBACK
-- Scorecard definitions, rating evaluations (1-5), and recommendation history
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
  assignment_id UUID NOT NULL REFERENCES recruitment.interview_assignments(id) ON DELETE CASCADE,
  interviewer_user_id UUID NOT NULL,
  ratings JSONB NOT NULL DEFAULT '{}'::JSONB, -- e.g. {"communication": 4, "confidence": 5}
  notes TEXT,
  scratchpad_notes TEXT,
  recommendation VARCHAR(64), -- strong_hire, hire, mixed, no_hire, strong_no_hire
  status VARCHAR(32) NOT NULL DEFAULT 'draft', -- draft, submitted, locked, reopened
  submitted_at TIMESTAMPTZ,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  reopened_at TIMESTAMPTZ,
  reopened_by UUID,
  reopen_reason TEXT,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
CREATE INDEX IF NOT EXISTS idx_feedback_assignment ON recruitment.interview_feedback(assignment_id);

-- Enable RLS
ALTER TABLE recruitment.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.interview_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.interview_access_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.interview_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.interview_feedback_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interviews_admin_all" ON recruitment.interviews FOR ALL USING (true);
CREATE POLICY "assignments_admin_all" ON recruitment.interview_assignments FOR ALL USING (true);
CREATE POLICY "access_events_admin_all" ON recruitment.interview_access_events FOR ALL USING (true);
CREATE POLICY "scorecards_admin_all" ON recruitment.interview_scorecards FOR ALL USING (true);
CREATE POLICY "feedback_admin_all" ON recruitment.interview_feedback FOR ALL USING (true);
CREATE POLICY "feedback_versions_admin_all" ON recruitment.interview_feedback_versions FOR ALL USING (true);
