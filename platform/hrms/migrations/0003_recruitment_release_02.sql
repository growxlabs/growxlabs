CREATE SCHEMA IF NOT EXISTS recruitment;

CREATE TYPE recruitment.requisition_status AS ENUM ('draft','pending_department_head','pending_hr','approved','rejected','cancelled','closed');
CREATE TYPE recruitment.job_status AS ENUM ('draft','published','closed','archived');
CREATE TYPE recruitment.application_status AS ENUM ('active','hired','rejected','withdrawn');
CREATE TYPE recruitment.interview_status AS ENUM ('planned','scheduled','completed','cancelled');

CREATE TABLE recruitment.job_requisitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  workspace_id uuid,
  business_unit_id uuid,
  legal_entity_id uuid,
  department_id uuid NOT NULL,
  hiring_manager_employee_id uuid NOT NULL,
  recruiter_user_id uuid NOT NULL,
  title text NOT NULL,
  number_of_positions integer NOT NULL CHECK (number_of_positions > 0),
  employment_type text NOT NULL,
  budget numeric(18,2),
  salary_band_min numeric(18,2),
  salary_band_max numeric(18,2),
  business_justification text NOT NULL,
  target_hiring_date date,
  status recruitment.requisition_status NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CHECK (salary_band_max IS NULL OR salary_band_min IS NULL OR salary_band_max >= salary_band_min)
);

CREATE TABLE recruitment.requisition_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  requisition_id uuid NOT NULL REFERENCES recruitment.job_requisitions(id),
  step_key text NOT NULL CHECK (step_key IN ('department_head','hr')),
  sequence integer NOT NULL,
  approver_user_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  comment text,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requisition_id, step_key)
);

CREATE TABLE recruitment.pipeline_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, name)
);
CREATE UNIQUE INDEX recruitment_one_default_pipeline ON recruitment.pipeline_definitions(organisation_id) WHERE is_default;

CREATE TABLE recruitment.pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  pipeline_id uuid NOT NULL REFERENCES recruitment.pipeline_definitions(id),
  key text NOT NULL,
  name text NOT NULL,
  position integer NOT NULL,
  category text NOT NULL CHECK (category IN ('active','hired','rejected','withdrawn')),
  is_terminal boolean NOT NULL DEFAULT false,
  sla_hours integer,
  UNIQUE (pipeline_id,key),
  UNIQUE (pipeline_id,position)
);

CREATE TABLE recruitment.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  workspace_id uuid,
  business_unit_id uuid,
  legal_entity_id uuid,
  requisition_id uuid NOT NULL REFERENCES recruitment.job_requisitions(id),
  pipeline_id uuid NOT NULL REFERENCES recruitment.pipeline_definitions(id),
  department_id uuid NOT NULL,
  hiring_manager_employee_id uuid NOT NULL,
  recruiter_user_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  summary text NOT NULL,
  description jsonb NOT NULL,
  responsibilities jsonb NOT NULL DEFAULT '[]',
  requirements jsonb NOT NULL DEFAULT '[]',
  skills text[] NOT NULL DEFAULT '{}',
  experience_min numeric(4,1),
  experience_max numeric(4,1),
  employment_type text NOT NULL,
  location text NOT NULL,
  is_remote boolean NOT NULL DEFAULT false,
  salary_min numeric(18,2),
  salary_max numeric(18,2),
  salary_currency char(3) NOT NULL DEFAULT 'INR',
  benefits jsonb NOT NULL DEFAULT '[]',
  status recruitment.job_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  closed_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (organisation_id,slug)
);
CREATE INDEX recruitment_public_jobs_idx ON recruitment.jobs(organisation_id,status,published_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE recruitment.candidate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  workspace_id uuid,
  email citext NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  location text,
  professional_summary text,
  skills text[] NOT NULL DEFAULT '{}',
  years_of_experience numeric(4,1),
  current_company text,
  current_title text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  consent_at timestamptz NOT NULL,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (organisation_id,email)
);

CREATE TABLE recruitment.candidate_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  candidate_id uuid NOT NULL REFERENCES recruitment.candidate_profiles(id),
  company text NOT NULL, title text NOT NULL, location text,
  started_on date, ended_on date, description text
);
CREATE TABLE recruitment.candidate_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  candidate_id uuid NOT NULL REFERENCES recruitment.candidate_profiles(id),
  institution text NOT NULL, degree text, field_of_study text,
  started_on date, ended_on date
);

CREATE TABLE recruitment.candidate_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  candidate_id uuid NOT NULL REFERENCES recruitment.candidate_profiles(id),
  document_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('resume','portfolio','certificate','assessment','offer_draft')),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE recruitment.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  candidate_id uuid NOT NULL REFERENCES recruitment.candidate_profiles(id),
  job_id uuid NOT NULL REFERENCES recruitment.jobs(id),
  current_stage_id uuid NOT NULL REFERENCES recruitment.pipeline_stages(id),
  cover_letter text,
  notice_period_days integer,
  expected_salary numeric(18,2),
  salary_currency char(3) DEFAULT 'INR',
  source text,
  referral_employee_id uuid,
  status recruitment.application_status NOT NULL DEFAULT 'active',
  applied_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz,
  UNIQUE (candidate_id,job_id)
);
CREATE INDEX recruitment_applications_stage_idx ON recruitment.job_applications(organisation_id,job_id,current_stage_id,status);

CREATE TABLE recruitment.candidate_ai_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  candidate_id uuid NOT NULL REFERENCES recruitment.candidate_profiles(id),
  application_id uuid REFERENCES recruitment.job_applications(id),
  document_id uuid,
  model text NOT NULL,
  prompt_version text NOT NULL,
  summary text NOT NULL,
  extracted_skills text[] NOT NULL DEFAULT '{}',
  years_of_experience numeric(4,1),
  primary_technologies text[] NOT NULL DEFAULT '{}',
  highlights jsonb NOT NULL DEFAULT '[]',
  concerns jsonb NOT NULL DEFAULT '[]',
  match_score numeric(5,2) CHECK (match_score BETWEEN 0 AND 100),
  raw_result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE recruitment.resume_processing_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  candidate_id uuid NOT NULL REFERENCES recruitment.candidate_profiles(id),
  application_id uuid NOT NULL REFERENCES recruitment.job_applications(id),
  document_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  attempts integer NOT NULL DEFAULT 0,
  extracted_text text,
  last_error text,
  available_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX recruitment_resume_jobs_pending_idx ON recruitment.resume_processing_jobs(available_at)
WHERE status IN ('pending','failed') AND attempts < 5;

CREATE TABLE recruitment.talent_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  name text NOT NULL, description text, created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (organisation_id,name)
);
CREATE TABLE recruitment.talent_pool_members (
  organisation_id uuid NOT NULL, pool_id uuid NOT NULL REFERENCES recruitment.talent_pools(id),
  candidate_id uuid NOT NULL REFERENCES recruitment.candidate_profiles(id),
  added_by uuid NOT NULL, added_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(pool_id,candidate_id)
);
CREATE TABLE recruitment.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  name text NOT NULL, color text, UNIQUE(organisation_id,name)
);
CREATE TABLE recruitment.candidate_tags (
  organisation_id uuid NOT NULL, candidate_id uuid NOT NULL REFERENCES recruitment.candidate_profiles(id),
  tag_id uuid NOT NULL REFERENCES recruitment.tags(id), added_by uuid NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(candidate_id,tag_id)
);
CREATE TABLE recruitment.candidate_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  candidate_id uuid NOT NULL REFERENCES recruitment.candidate_profiles(id),
  application_id uuid REFERENCES recruitment.job_applications(id),
  author_user_id uuid NOT NULL, body text NOT NULL, is_private boolean NOT NULL DEFAULT false,
  mentions uuid[] NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz, deleted_at timestamptz
);

CREATE TABLE recruitment.interview_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  job_id uuid NOT NULL REFERENCES recruitment.jobs(id), name text NOT NULL,
  description text, version integer NOT NULL DEFAULT 1
);
CREATE TABLE recruitment.interview_plan_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES recruitment.interview_plans(id),
  name text NOT NULL, position integer NOT NULL, duration_minutes integer NOT NULL,
  interview_type text NOT NULL, feedback_form jsonb NOT NULL,
  UNIQUE(plan_id,position)
);
CREATE TABLE recruitment.interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  application_id uuid NOT NULL REFERENCES recruitment.job_applications(id),
  plan_round_id uuid REFERENCES recruitment.interview_plan_rounds(id),
  title text NOT NULL, status recruitment.interview_status NOT NULL DEFAULT 'planned',
  starts_at timestamptz, ends_at timestamptz, timezone text,
  location text, meeting_url text, calendar_provider text, external_event_id text,
  created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE recruitment.interviewers (
  organisation_id uuid NOT NULL, interview_id uuid NOT NULL REFERENCES recruitment.interviews(id),
  user_id uuid NOT NULL, is_lead boolean NOT NULL DEFAULT false, PRIMARY KEY(interview_id,user_id)
);
CREATE TABLE recruitment.interview_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  interview_id uuid NOT NULL REFERENCES recruitment.interviews(id),
  interviewer_user_id uuid NOT NULL, ratings jsonb NOT NULL, comments text,
  recommendation text NOT NULL CHECK (recommendation IN ('strong_yes','yes','neutral','no','strong_no')),
  submitted_at timestamptz NOT NULL DEFAULT now(), UNIQUE(interview_id,interviewer_user_id)
);

CREATE TABLE recruitment.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  candidate_id uuid REFERENCES recruitment.candidate_profiles(id),
  application_id uuid REFERENCES recruitment.job_applications(id),
  entity_type text NOT NULL, entity_id uuid NOT NULL, action text NOT NULL,
  actor_user_id uuid, payload jsonb NOT NULL DEFAULT '{}',
  request_id uuid NOT NULL, occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX recruitment_activity_timeline_idx ON recruitment.activities(organisation_id,candidate_id,occurred_at DESC);
CREATE TRIGGER recruitment_activity_immutable BEFORE UPDATE OR DELETE ON recruitment.activities
FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();

INSERT INTO identity.permissions(key,description) VALUES
('requisition.create','Create workforce requisitions'),
('requisition.approve_department','Approve requisitions as department head'),
('requisition.approve_hr','Approve requisitions as HR'),
('job.create','Create jobs from approved requisitions'),
('job.edit','Edit job postings'),
('job.publish','Publish approved jobs'),
('candidate.view','View assigned candidate profiles'),
('candidate.view_all','View all candidate profiles'),
('candidate.move','Move candidates through configured stages'),
('candidate.note','Add candidate notes'),
('interview.schedule','Plan and schedule interviews'),
('interview.feedback','Submit interview feedback'),
('pipeline.manage','Configure recruitment pipelines')
ON CONFLICT(key) DO NOTHING;

CREATE TRIGGER candidate_ai_results_immutable BEFORE UPDATE OR DELETE ON recruitment.candidate_ai_results
FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();
CREATE TRIGGER interview_feedback_immutable BEFORE UPDATE OR DELETE ON recruitment.interview_feedback
FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();

-- Release 02 stops at offer preparation: this record is an internal draft and
-- deliberately has no candidate acceptance or onboarding behavior.
CREATE TABLE recruitment.offer_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  application_id uuid NOT NULL REFERENCES recruitment.job_applications(id),
  title text NOT NULL,
  proposed_start_date date,
  salary_amount numeric(14,2),
  salary_currency char(3),
  terms jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','ready_for_review','approved')),
  created_by uuid NOT NULL,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(application_id)
);

-- System owners created by Release 01 automatically inherit the Release 02
-- permission catalogue when this migration is applied later.
INSERT INTO identity.role_permissions(role_id,permission_id)
SELECT role.id, permission.id
FROM identity.roles role
CROSS JOIN identity.permissions permission
WHERE role.is_system
  AND lower(role.name) = 'owner'
  AND permission.key IN (
    'requisition.create','requisition.approve_department','requisition.approve_hr',
    'job.create','job.edit','job.publish','candidate.view','candidate.view_all',
    'candidate.move','candidate.note','interview.schedule','interview.feedback',
    'pipeline.manage'
  )
ON CONFLICT DO NOTHING;
