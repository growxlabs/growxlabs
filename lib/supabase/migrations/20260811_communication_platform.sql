BEGIN;
CREATE TABLE IF NOT EXISTS public.communication_templates (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), template_key TEXT UNIQUE NOT NULL, category TEXT NOT NULL, subject TEXT NOT NULL, preview_text TEXT, header TEXT, body TEXT NOT NULL, variables JSONB NOT NULL DEFAULT '[]', cta JSONB NOT NULL DEFAULT '{}', footer TEXT, version INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','internal_review','approved','archived')), created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.communication_messages (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), channel TEXT NOT NULL CHECK(channel IN ('email','in_app','browser','sms','whatsapp','slack','teams','webhook','push')), message_type TEXT NOT NULL, template_id UUID REFERENCES public.communication_templates(id) ON DELETE SET NULL, subject TEXT, body TEXT NOT NULL, variables JSONB NOT NULL DEFAULT '{}', sender_id UUID, related_entity_type TEXT, related_entity_id UUID, client_id UUID, company_id UUID, project_id UUID, status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('draft','queued','scheduled','sending','sent','delivered','opened','clicked','failed','cancelled','retry')), scheduled_for TIMESTAMPTZ, sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.communication_recipients (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), message_id UUID NOT NULL REFERENCES public.communication_messages(id) ON DELETE CASCADE, user_id UUID, email TEXT, display_name TEXT, recipient_type TEXT NOT NULL DEFAULT 'to', delivered_at TIMESTAMPTZ, opened_at TIMESTAMPTZ, clicked_at TIMESTAMPTZ, error TEXT, UNIQUE(message_id,email)
);
CREATE TABLE IF NOT EXISTS public.communication_queue (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), message_id UUID NOT NULL UNIQUE REFERENCES public.communication_messages(id) ON DELETE CASCADE, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','scheduled','sending','sent','failed','cancelled','retry')), attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(), locked_at TIMESTAMPTZ, last_error TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.communication_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), message_id UUID NOT NULL REFERENCES public.communication_messages(id) ON DELETE CASCADE, event_type TEXT NOT NULL, event_data JSONB NOT NULL DEFAULT '{}', occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.communication_preferences (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID UNIQUE NOT NULL, marketing BOOLEAN NOT NULL DEFAULT true, project_updates BOOLEAN NOT NULL DEFAULT true, billing BOOLEAN NOT NULL DEFAULT true, support BOOLEAN NOT NULL DEFAULT true, meeting_reminders BOOLEAN NOT NULL DEFAULT true, system BOOLEAN NOT NULL DEFAULT true, digest_frequency TEXT NOT NULL DEFAULT 'immediate', language TEXT NOT NULL DEFAULT 'en', timezone TEXT NOT NULL DEFAULT 'UTC', updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.communication_reminders (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), message_id UUID REFERENCES public.communication_messages(id) ON DELETE SET NULL, reminder_type TEXT NOT NULL, due_at TIMESTAMPTZ NOT NULL, status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','sent','cancelled','failed')), related_entity_type TEXT, related_entity_id UUID, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS communication_messages_client_idx ON public.communication_messages(client_id,created_at DESC);
CREATE INDEX IF NOT EXISTS communication_queue_due_idx ON public.communication_queue(status,next_attempt_at);
CREATE INDEX IF NOT EXISTS communication_events_message_idx ON public.communication_events(message_id,occurred_at DESC);
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY; ALTER TABLE public.communication_messages ENABLE ROW LEVEL SECURITY; ALTER TABLE public.communication_recipients ENABLE ROW LEVEL SECURITY; ALTER TABLE public.communication_queue ENABLE ROW LEVEL SECURITY; ALTER TABLE public.communication_events ENABLE ROW LEVEL SECURITY; ALTER TABLE public.communication_preferences ENABLE ROW LEVEL SECURITY; ALTER TABLE public.communication_reminders ENABLE ROW LEVEL SECURITY;
COMMIT;
