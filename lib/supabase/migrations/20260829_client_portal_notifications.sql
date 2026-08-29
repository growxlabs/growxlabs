BEGIN;

CREATE TABLE IF NOT EXISTS public.client_notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.communication_messages(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS client_notification_reads_client_idx
  ON public.client_notification_reads(client_id, user_id, read_at DESC);

ALTER TABLE public.client_notification_reads ENABLE ROW LEVEL SECURITY;

COMMIT;
