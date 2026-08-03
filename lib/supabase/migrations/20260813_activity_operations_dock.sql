BEGIN;

CREATE TABLE IF NOT EXISTS public.client_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  company_id UUID,
  activity_type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal','important','action_required','urgent')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  business_number TEXT,
  href TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS client_activity_events_client_created_idx ON public.client_activity_events(client_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.client_activity_reads (
  activity_event_id UUID NOT NULL REFERENCES public.client_activity_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (activity_event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.client_activity_dock_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  dock_state TEXT NOT NULL DEFAULT 'collapsed' CHECK (dock_state IN ('hidden','collapsed','expanded')),
  dismissed_until TIMESTAMPTZ, last_opened_at TIMESTAMPTZ, preferred_filter TEXT NOT NULL DEFAULT 'all', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, resource_type TEXT, resource_id UUID, client_id UUID, company_id UUID, metadata JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_events_created_idx ON public.audit_events(created_at DESC);

CREATE TABLE IF NOT EXISTS public.system_error_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), fingerprint TEXT NOT NULL UNIQUE, error_number TEXT UNIQUE,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('warning','error','critical')),
  summary TEXT NOT NULL, detail TEXT NOT NULL, module TEXT NOT NULL, occurrence_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','dismissed_duplicate')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL, first_seen TIMESTAMPTZ NOT NULL DEFAULT now(), last_seen TIMESTAMPTZ NOT NULL DEFAULT now(), metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS system_error_events_status_idx ON public.system_error_events(status, last_seen DESC);
CREATE TABLE IF NOT EXISTS public.system_error_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), error_id UUID NOT NULL REFERENCES public.system_error_events(id) ON DELETE CASCADE, occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(), route TEXT, release_version TEXT
);
CREATE TABLE IF NOT EXISTS public.system_error_assignments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), error_id UUID NOT NULL REFERENCES public.system_error_events(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.system_error_comments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), error_id UUID NOT NULL REFERENCES public.system_error_events(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.operations_dock_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  dock_state TEXT NOT NULL DEFAULT 'collapsed' CHECK (dock_state IN ('hidden','collapsed','expanded')),
  active_tab TEXT NOT NULL DEFAULT 'activity' CHECK (active_tab IN ('activity','audit','errors')),
  dismissed_until TIMESTAMPTZ, show_normal_activity BOOLEAN NOT NULL DEFAULT true, show_warnings BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_activity_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_activity_dock_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_error_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_error_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_error_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_error_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations_dock_preferences ENABLE ROW LEVEL SECURITY;

COMMIT;
