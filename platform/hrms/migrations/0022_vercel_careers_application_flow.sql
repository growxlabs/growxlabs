-- Vercel-native careers publishing and job-specific applications.
-- This is additive: existing recruitment.jobs and legacy career_applications remain intact.
BEGIN;

CREATE TABLE IF NOT EXISTS recruitment.careers_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id text NOT NULL DEFAULT 'org_default',
  workspace_id text,
  title text NOT NULL,
  slug text NOT NULL,
  job_reference text NOT NULL,
  department text,
  location text NOT NULL DEFAULT 'India',
  employment_type text NOT NULL DEFAULT 'Full-time',
  workplace_type text NOT NULL DEFAULT 'On-site',
  experience_level text,
  openings integer NOT NULL DEFAULT 1 CHECK (openings > 0),
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  responsibilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  preferred_qualifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  compensation_text text,
  hiring_process jsonb NOT NULL DEFAULT '[]'::jsonb,
  application_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  applications_open_at timestamptz,
  applications_close_at timestamptz,
  applications_timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  application_limit integer CHECK (application_limit IS NULL OR application_limit > 0),
  close_when_limit_reached boolean NOT NULL DEFAULT false,
  allow_late_applications boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','scheduled','published','closing_soon','closed','archived','cancelled')),
  published_at timestamptz,
  closed_at timestamptz,
  closed_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, slug),
  UNIQUE (organisation_id, job_reference),
  CHECK (applications_close_at IS NULL OR applications_open_at IS NULL OR applications_close_at > applications_open_at)
);

CREATE TABLE IF NOT EXISTS recruitment.careers_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES recruitment.careers_jobs(id),
  candidate_id text NOT NULL,
  organisation_id text NOT NULL DEFAULT 'org_default',
  application_reference text NOT NULL,
  current_stage text NOT NULL DEFAULT 'applied',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','withdrawn','rejected','hired')),
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  experience jsonb NOT NULL DEFAULT '{}'::jsonb,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  resume_path text,
  cover_letter text,
  source text NOT NULL DEFAULT 'careers_portal',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, job_id, candidate_id),
  UNIQUE (organisation_id, application_reference)
);

CREATE TABLE IF NOT EXISTS recruitment.careers_application_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES recruitment.careers_jobs(id),
  candidate_id text NOT NULL,
  organisation_id text NOT NULL DEFAULT 'org_default',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, job_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS careers_jobs_public_idx ON recruitment.careers_jobs (organisation_id, status, published_at DESC);
CREATE INDEX IF NOT EXISTS careers_applications_job_idx ON recruitment.careers_applications (organisation_id, job_id, submitted_at DESC);

COMMIT;
