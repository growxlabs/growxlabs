ALTER TABLE recruitment.careers_applications
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_by UUID,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejection_note TEXT,
  ADD COLUMN IF NOT EXISTS rejection_previous_stage TEXT;

CREATE INDEX IF NOT EXISTS careers_applications_rejected_idx
  ON recruitment.careers_applications(organisation_id, status, rejected_at DESC);
