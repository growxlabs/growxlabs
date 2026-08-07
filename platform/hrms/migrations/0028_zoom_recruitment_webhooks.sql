-- Idempotent receipt log for Zoom recruitment interview webhooks.
CREATE TABLE IF NOT EXISTS recruitment.zoom_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_identifier TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  meeting_id TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'received',
  payload_metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_zoom_webhook_events_meeting ON recruitment.zoom_webhook_events(meeting_id, received_at DESC);
