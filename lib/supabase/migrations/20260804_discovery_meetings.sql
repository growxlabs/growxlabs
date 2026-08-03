BEGIN;

-- Discovery meetings are intentionally separate from the assessment snapshot.  UUIDs
-- remain internal; meeting_number is the business identifier used in documents/email.
CREATE TABLE IF NOT EXISTS public.discovery_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meeting_number TEXT UNIQUE NOT NULL,
  assessment_id UUID NOT NULL, client_id UUID NOT NULL, company_id UUID, lead_id UUID, deal_id UUID,
  parent_meeting_id UUID, meeting_type TEXT NOT NULL DEFAULT 'initial_discovery', title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', scheduled_start TIMESTAMPTZ, scheduled_end TIMESTAMPTZ,
  timezone TEXT, platform TEXT, meeting_url TEXT, location TEXT, assigned_consultant_id UUID,
  recording_planned BOOLEAN NOT NULL DEFAULT false, recording_consent BOOLEAN NOT NULL DEFAULT false,
  recording_url TEXT, transcript_text TEXT, transcript_status TEXT, agenda JSONB NOT NULL DEFAULT '[]',
  client_summary TEXT, client_summary_status TEXT, closed_at TIMESTAMPTZ, created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS discovery_meetings_active_assessment_uq ON public.discovery_meetings(assessment_id)
  WHERE status NOT IN ('closed','cancelled');

CREATE TABLE IF NOT EXISTS public.discovery_meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meeting_id UUID NOT NULL REFERENCES public.discovery_meetings(id) ON DELETE CASCADE,
  user_id UUID, name TEXT NOT NULL, email TEXT, organisation TEXT, designation TEXT,
  participant_type TEXT NOT NULL, attendance_status TEXT, is_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.discovery_meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meeting_id UUID NOT NULL REFERENCES public.discovery_meetings(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL, content JSONB NOT NULL DEFAULT '{}', visibility TEXT NOT NULL DEFAULT 'Internal',
  version INTEGER NOT NULL DEFAULT 1, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(meeting_id,section_key,version)
);
CREATE TABLE IF NOT EXISTS public.discovery_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meeting_id UUID NOT NULL REFERENCES public.discovery_meetings(id) ON DELETE CASCADE,
  finding_number TEXT NOT NULL, title TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Business', current_state TEXT, problem TEXT,
  business_impact TEXT, evidence TEXT, priority TEXT DEFAULT 'Medium', client_confirmation_status TEXT DEFAULT 'Pending', consultant_notes TEXT,
  created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(meeting_id,finding_number)
);
CREATE TABLE IF NOT EXISTS public.discovery_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meeting_id UUID NOT NULL REFERENCES public.discovery_meetings(id) ON DELETE CASCADE,
  requirement_number TEXT NOT NULL, title TEXT NOT NULL, description TEXT, business_reason TEXT, category TEXT, priority TEXT,
  requested_by TEXT, owner_id UUID, dependency TEXT, acceptance_note TEXT, status TEXT DEFAULT 'Proposed', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(meeting_id,requirement_number)
);
CREATE TABLE IF NOT EXISTS public.discovery_ai_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meeting_id UUID NOT NULL REFERENCES public.discovery_meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL, business_function TEXT, current_process TEXT, current_problem TEXT, proposed_ai_assistance TEXT, required_data TEXT,
  expected_benefit TEXT, complexity TEXT, risk TEXT, priority TEXT, consultant_confidence TEXT, client_interest TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.discovery_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meeting_id UUID NOT NULL REFERENCES public.discovery_meetings(id) ON DELETE CASCADE,
  decision_number TEXT NOT NULL, decision TEXT NOT NULL, context TEXT, decision_owner TEXT, approved_by TEXT, decision_date TIMESTAMPTZ,
  impact TEXT, related_requirement_id UUID, status TEXT DEFAULT 'Proposed', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(meeting_id,decision_number)
);
CREATE TABLE IF NOT EXISTS public.discovery_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meeting_id UUID NOT NULL REFERENCES public.discovery_meetings(id) ON DELETE CASCADE,
  action TEXT NOT NULL, owner_type TEXT, owner_id UUID, owner_name TEXT, due_date DATE, priority TEXT, status TEXT DEFAULT 'Open',
  related_finding_id UUID, related_requirement_id UUID, client_visible BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.discovery_document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meeting_id UUID NOT NULL REFERENCES public.discovery_meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL, reason TEXT, requested_from TEXT, due_date DATE, status TEXT DEFAULT 'Requested', file_id UUID, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.discovery_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meeting_id UUID NOT NULL REFERENCES public.discovery_meetings(id) ON DELETE CASCADE,
  risk TEXT NOT NULL, category TEXT, likelihood TEXT, impact TEXT, severity TEXT, mitigation TEXT, owner_id UUID, status TEXT DEFAULT 'Open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.discovery_summary_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meeting_id UUID NOT NULL REFERENCES public.discovery_meetings(id) ON DELETE CASCADE,
  summary_version INTEGER NOT NULL, client_user_id UUID NOT NULL, response TEXT NOT NULL, comment TEXT, responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.discovery_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), meeting_id UUID NOT NULL REFERENCES public.discovery_meetings(id) ON DELETE CASCADE,
  actor_id UUID, actor_type TEXT, event_type TEXT NOT NULL, metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.create_discovery_meeting_number() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.meeting_number IS NULL OR btrim(NEW.meeting_number)='' THEN
    NEW.meeting_number := public.generate_business_document_number('discovery_meeting','GXL-DSC',COALESCE(NEW.created_at,now()));
  END IF;
  RETURN NEW;
END $$;
;
DROP TRIGGER IF EXISTS trg_discovery_meeting_number ON public.discovery_meetings;
CREATE TRIGGER trg_discovery_meeting_number BEFORE INSERT ON public.discovery_meetings FOR EACH ROW EXECUTE FUNCTION public.create_discovery_meeting_number();
CREATE INDEX IF NOT EXISTS discovery_meetings_status_idx ON public.discovery_meetings(status,scheduled_start);
CREATE INDEX IF NOT EXISTS discovery_meetings_search_idx ON public.discovery_meetings(meeting_number,assessment_id,client_id,company_id);
ALTER TABLE public.discovery_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_ai_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_summary_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_activity ENABLE ROW LEVEL SECURITY;
COMMIT;
