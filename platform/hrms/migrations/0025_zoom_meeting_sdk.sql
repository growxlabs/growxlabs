-- Zoom Meeting SDK fields on the existing recruitment interview record.
ALTER TABLE recruitment.interviews
  ADD COLUMN IF NOT EXISTS zoom_meeting_id TEXT,
  ADD COLUMN IF NOT EXISTS zoom_passcode_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS zoom_meeting_uuid TEXT,
  ADD COLUMN IF NOT EXISTS meeting_sdk_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS provider_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS zoom_configured_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS zoom_configured_by UUID;

CREATE INDEX IF NOT EXISTS idx_interviews_zoom_meeting_id ON recruitment.interviews(zoom_meeting_id);

CREATE TABLE IF NOT EXISTS recruitment.interview_configuration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES recruitment.interviews(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  changed_by UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_interview_configuration_events_interview ON recruitment.interview_configuration_events(interview_id, created_at DESC);
