-- Recruitment email audit copies and provider event metadata.
ALTER TABLE recruitment.email_settings
  ADD COLUMN IF NOT EXISTS internal_audit_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS internal_audit_recipients JSONB NOT NULL DEFAULT '["sai@growxlabs.tech"]'::jsonb;

ALTER TABLE recruitment.email_logs
  ADD COLUMN IF NOT EXISTS resend_event_id TEXT,
  ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ;

UPDATE recruitment.email_settings
SET internal_audit_enabled = true,
    internal_audit_recipients = '["sai@growxlabs.tech"]'::jsonb
WHERE internal_audit_recipients IS NULL;
