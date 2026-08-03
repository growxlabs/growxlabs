BEGIN;

-- Phase 5 and 6 records deliberately use their own tables.  UUIDs stay internal;
-- the existing business-number generator supplies the client-safe document numbers.
CREATE TABLE IF NOT EXISTS public.ai_solution_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number TEXT UNIQUE NOT NULL,
  audit_id UUID NOT NULL REFERENCES public.business_technical_audits(id) ON DELETE RESTRICT,
  assessment_id UUID NOT NULL,
  discovery_meeting_id UUID NOT NULL,
  client_id UUID NOT NULL,
  company_id UUID,
  deal_id UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','internal_review','changes_required','approved_internal','ready_for_client','shared','client_reviewed','client_acknowledged','closed','archived')),
  version INTEGER NOT NULL DEFAULT 1,
  executive_summary JSONB NOT NULL DEFAULT '{}',
  business_outcomes JSONB NOT NULL DEFAULT '[]',
  opportunity_map JSONB NOT NULL DEFAULT '[]',
  opportunities JSONB NOT NULL DEFAULT '[]',
  automation_opportunities JSONB NOT NULL DEFAULT '[]',
  software_opportunities JSONB NOT NULL DEFAULT '[]',
  solution_options JSONB NOT NULL DEFAULT '[]',
  human_in_loop JSONB NOT NULL DEFAULT '[]',
  data_requirements JSONB NOT NULL DEFAULT '[]',
  integration_requirements JSONB NOT NULL DEFAULT '[]',
  roadmap JSONB NOT NULL DEFAULT '[]',
  risks JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  client_comments TEXT,
  client_acknowledged_at TIMESTAMPTZ,
  approved_by UUID, approved_at TIMESTAMPTZ, shared_at TIMESTAMPTZ, closed_at TIMESTAMPTZ,
  created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.solution_architectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  architecture_number TEXT UNIQUE NOT NULL,
  ai_solution_report_id UUID NOT NULL REFERENCES public.ai_solution_reports(id) ON DELETE RESTRICT,
  audit_id UUID NOT NULL REFERENCES public.business_technical_audits(id) ON DELETE RESTRICT,
  assessment_id UUID NOT NULL,
  discovery_meeting_id UUID NOT NULL,
  client_id UUID NOT NULL,
  company_id UUID, deal_id UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','internal_review','changes_required','approved_internal','ready_for_client','shared','client_reviewed','client_acknowledged','closed','archived')),
  version INTEGER NOT NULL DEFAULT 1,
  executive_summary JSONB NOT NULL DEFAULT '{}',
  business_capabilities JSONB NOT NULL DEFAULT '[]',
  architecture_overview JSONB NOT NULL DEFAULT '{}',
  components JSONB NOT NULL DEFAULT '[]',
  data_architecture JSONB NOT NULL DEFAULT '{}',
  integrations JSONB NOT NULL DEFAULT '[]',
  workflows JSONB NOT NULL DEFAULT '[]',
  ai_components JSONB NOT NULL DEFAULT '[]',
  security_controls JSONB NOT NULL DEFAULT '[]',
  implementation_phases JSONB NOT NULL DEFAULT '[]',
  risks JSONB NOT NULL DEFAULT '[]',
  decisions JSONB NOT NULL DEFAULT '[]',
  traceability JSONB NOT NULL DEFAULT '[]',
  diagram JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}',
  client_comments TEXT,
  client_acknowledged_at TIMESTAMPTZ,
  approved_by UUID, approved_at TIMESTAMPTZ, shared_at TIMESTAMPTZ, closed_at TIMESTAMPTZ,
  created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consulting_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_type TEXT NOT NULL CHECK (document_type IN ('audit','ai_solution_report','solution_architecture')),
  document_id UUID NOT NULL, version INTEGER NOT NULL, snapshot JSONB NOT NULL DEFAULT '{}', created_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(document_type, document_id, version)
);
CREATE TABLE IF NOT EXISTS public.consulting_document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_type TEXT NOT NULL CHECK (document_type IN ('audit','ai_solution_report','solution_architecture')),
  document_id UUID NOT NULL, author_id UUID NOT NULL, audience TEXT NOT NULL DEFAULT 'internal' CHECK (audience IN ('internal','client')),
  body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.consulting_document_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_type TEXT NOT NULL CHECK (document_type IN ('audit','ai_solution_report','solution_architecture')),
  document_id UUID NOT NULL, reviewer_id UUID NOT NULL, decision TEXT NOT NULL CHECK (decision IN ('approved','changes_required')),
  notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.consulting_document_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_type TEXT NOT NULL, document_id UUID NOT NULL,
  actor_id UUID, actor_type TEXT, event_type TEXT NOT NULL, metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.consulting_workflow_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL, deal_id UUID, source_document_type TEXT NOT NULL,
  source_document_id UUID NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), completed_at TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION public.assign_ai_solution_report_number() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.report_number IS NULL OR btrim(NEW.report_number) = '' THEN NEW.report_number := public.generate_business_document_number('ai_solution_report','GXL-AIR',COALESCE(NEW.created_at,now())); END IF;
  RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.assign_solution_architecture_number() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.architecture_number IS NULL OR btrim(NEW.architecture_number) = '' THEN NEW.architecture_number := public.generate_business_document_number('solution_architecture','GXL-ARC',COALESCE(NEW.created_at,now())); END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_ai_solution_report_number ON public.ai_solution_reports;
CREATE TRIGGER trg_ai_solution_report_number BEFORE INSERT ON public.ai_solution_reports FOR EACH ROW EXECUTE FUNCTION public.assign_ai_solution_report_number();
DROP TRIGGER IF EXISTS trg_solution_architecture_number ON public.solution_architectures;
CREATE TRIGGER trg_solution_architecture_number BEFORE INSERT ON public.solution_architectures FOR EACH ROW EXECUTE FUNCTION public.assign_solution_architecture_number();

CREATE INDEX IF NOT EXISTS ai_solution_reports_audit_idx ON public.ai_solution_reports(audit_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS solution_architectures_report_idx ON public.solution_architectures(ai_solution_report_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS consulting_document_activity_document_idx ON public.consulting_document_activity(document_type, document_id, created_at DESC);
CREATE INDEX IF NOT EXISTS consulting_document_comments_document_idx ON public.consulting_document_comments(document_type, document_id, created_at DESC);

ALTER TABLE public.ai_solution_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_architectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulting_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulting_document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulting_document_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulting_document_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulting_workflow_tasks ENABLE ROW LEVEL SECURITY;
COMMIT;
