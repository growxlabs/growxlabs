-- Vercel-native bridge for the live careers pipeline.
-- Keeps the Release 03 immutable-version model while linking careers_applications
-- and already-created employees without recreating either record.

CREATE SCHEMA IF NOT EXISTS recruitment;

ALTER TABLE recruitment.offers
  ADD COLUMN IF NOT EXISTS salary_offered numeric(12,2),
  ADD COLUMN IF NOT EXISTS job_id uuid,
  ADD COLUMN IF NOT EXISTS employee_id uuid REFERENCES people.employees(id),
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES people.departments(id),
  ADD COLUMN IF NOT EXISTS designation_id uuid REFERENCES people.designations(id),
  ADD COLUMN IF NOT EXISTS manager_employee_id uuid REFERENCES people.employees(id),
  ADD COLUMN IF NOT EXISTS employment_type text,
  ADD COLUMN IF NOT EXISTS work_location text,
  ADD COLUMN IF NOT EXISTS salary numeric(14,2),
  ADD COLUMN IF NOT EXISTS probation_days integer,
  ADD COLUMN IF NOT EXISTS notice_period_days integer,
  ADD COLUMN IF NOT EXISTS terms jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS issued_at timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS declined_at timestamptz,
  ADD COLUMN IF NOT EXISTS current_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS document_id uuid REFERENCES documents.documents(id),
  ADD COLUMN IF NOT EXISTS offer_letter_url text,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS backfill_reason text;

CREATE UNIQUE INDEX IF NOT EXISTS recruitment_offers_application_uq
  ON recruitment.offers(application_id);

CREATE TABLE IF NOT EXISTS recruitment.offer_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  offer_id varchar(128) NOT NULL REFERENCES recruitment.offers(id),
  version integer NOT NULL,
  snapshot jsonb NOT NULL,
  document_id uuid REFERENCES documents.documents(id),
  checksum_sha256 text,
  change_summary text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(offer_id, version)
);

DO $$ BEGIN
  CREATE TRIGGER recruitment_offer_versions_immutable
  BEFORE UPDATE OR DELETE ON recruitment.offer_versions
  FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS recruitment.offer_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  offer_id varchar(128) NOT NULL REFERENCES recruitment.offers(id),
  action text NOT NULL CHECK (action IN (
    'offer_draft_created','offer_issued','offer_viewed','offer_accepted',
    'offer_declined','offer_expired','offer_reissued','offer_backfilled',
    'offline_acceptance_recorded','offer_override_used'
  )),
  actor_user_id uuid,
  reason text,
  evidence_reference text,
  metadata jsonb NOT NULL DEFAULT '{}',
  occurred_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE TRIGGER recruitment_offer_audit_immutable
  BEFORE UPDATE OR DELETE ON recruitment.offer_audit
  FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE recruitment.offer_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.offer_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS recruitment_offer_versions_service ON recruitment.offer_versions;
CREATE POLICY recruitment_offer_versions_service ON recruitment.offer_versions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS recruitment_offer_audit_service ON recruitment.offer_audit;
CREATE POLICY recruitment_offer_audit_service ON recruitment.offer_audit
  FOR ALL TO service_role USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
