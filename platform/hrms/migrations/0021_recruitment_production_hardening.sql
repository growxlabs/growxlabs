BEGIN;

CREATE TABLE IF NOT EXISTS recruitment.requisition_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  requisition_id uuid NOT NULL REFERENCES recruitment.job_requisitions(id),
  previous_status recruitment.requisition_status,
  new_status recruitment.requisition_status NOT NULL,
  actor_user_id uuid NOT NULL,
  reason text,
  request_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recruitment.job_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  job_id uuid NOT NULL REFERENCES recruitment.jobs(id),
  version integer NOT NULL,
  snapshot jsonb NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, version)
);

CREATE TABLE IF NOT EXISTS recruitment.job_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  job_id uuid NOT NULL REFERENCES recruitment.jobs(id),
  action text NOT NULL CHECK (action IN ('published','unpublished','closed')),
  actor_user_id uuid NOT NULL,
  request_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recruitment.job_screening_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  job_id uuid NOT NULL REFERENCES recruitment.jobs(id),
  question text NOT NULL,
  answer_type text NOT NULL,
  required boolean NOT NULL DEFAULT false,
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, position)
);

CREATE TABLE IF NOT EXISTS recruitment.application_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  application_id uuid NOT NULL REFERENCES recruitment.job_applications(id),
  previous_stage_id uuid REFERENCES recruitment.pipeline_stages(id),
  new_stage_id uuid NOT NULL REFERENCES recruitment.pipeline_stages(id),
  actor_user_id uuid,
  reason text,
  request_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recruitment.application_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  idempotency_key text NOT NULL,
  job_id uuid NOT NULL REFERENCES recruitment.jobs(id),
  application_id uuid REFERENCES recruitment.job_applications(id),
  response_body jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '24 hours',
  UNIQUE(organisation_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS recruitment.consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  candidate_id uuid NOT NULL REFERENCES recruitment.candidate_profiles(id),
  consent_type text NOT NULL CHECK (consent_type IN ('recruitment','talent_network','privacy_notice')),
  consent_version text NOT NULL,
  consented_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL,
  withdrawn_at timestamptz,
  UNIQUE(candidate_id, consent_type, consent_version)
);

CREATE TABLE IF NOT EXISTS recruitment.outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_version integer NOT NULL DEFAULT 1,
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  organisation_id uuid NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','publishing','published','failed','dead_letter')),
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  last_error text
);

CREATE INDEX IF NOT EXISTS recruitment_requisitions_status_created_idx
  ON recruitment.job_requisitions(organisation_id,status,created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS recruitment_jobs_status_created_idx
  ON recruitment.jobs(organisation_id,status,created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS recruitment_candidates_created_idx
  ON recruitment.candidate_profiles(organisation_id,created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS recruitment_outbox_pending_idx
  ON recruitment.outbox(available_at,created_at) WHERE status IN ('pending','failed');
CREATE INDEX IF NOT EXISTS recruitment_application_history_idx
  ON recruitment.application_stage_history(application_id,created_at DESC);

COMMIT;
