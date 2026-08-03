BEGIN;
CREATE TABLE IF NOT EXISTS public.business_technical_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), audit_number TEXT UNIQUE NOT NULL,
  discovery_meeting_id UUID NOT NULL, assessment_id UUID NOT NULL, client_id UUID NOT NULL,
  company_id UUID, deal_id UUID, status TEXT NOT NULL DEFAULT 'Draft', version INTEGER NOT NULL DEFAULT 1,
  executive_summary JSONB NOT NULL DEFAULT '{}', business_overview JSONB NOT NULL DEFAULT '{}',
  operating_model JSONB NOT NULL DEFAULT '{}', technology_landscape JSONB NOT NULL DEFAULT '{}',
  digital_presence JSONB NOT NULL DEFAULT '{}', business_challenges JSONB NOT NULL DEFAULT '[]', technical_challenges JSONB NOT NULL DEFAULT '[]',
  process_gaps JSONB NOT NULL DEFAULT '[]', technology_gaps JSONB NOT NULL DEFAULT '[]', ai_readiness JSONB NOT NULL DEFAULT '{}',
  risks JSONB NOT NULL DEFAULT '[]', quick_wins JSONB NOT NULL DEFAULT '[]', medium_term_opportunities JSONB NOT NULL DEFAULT '[]',
  long_term_opportunities JSONB NOT NULL DEFAULT '[]', priority_matrix JSONB NOT NULL DEFAULT '[]', recommendations JSONB NOT NULL DEFAULT '[]',
  next_steps JSONB NOT NULL DEFAULT '[]', client_comments TEXT, client_acknowledged_at TIMESTAMPTZ,
  approved_by UUID, approved_at TIMESTAMPTZ, shared_at TIMESTAMPTZ, closed_at TIMESTAMPTZ,
  created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS business_audits_active_meeting_uq ON public.business_technical_audits(discovery_meeting_id) WHERE status <> 'Closed';
CREATE TABLE IF NOT EXISTS public.business_audit_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), audit_id UUID NOT NULL REFERENCES public.business_technical_audits(id) ON DELETE CASCADE,
  actor_id UUID, actor_type TEXT, event_type TEXT NOT NULL, metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION public.create_business_audit_number() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.audit_number IS NULL OR btrim(NEW.audit_number)='' THEN NEW.audit_number:=public.generate_business_document_number('business_audit','GXL-AUD',COALESCE(NEW.created_at,now())); END IF;
  RETURN NEW;
END $$;
;
DROP TRIGGER IF EXISTS trg_business_audit_number ON public.business_technical_audits;
CREATE TRIGGER trg_business_audit_number BEFORE INSERT ON public.business_technical_audits FOR EACH ROW EXECUTE FUNCTION public.create_business_audit_number();
CREATE INDEX IF NOT EXISTS business_audits_status_idx ON public.business_technical_audits(status,updated_at);
ALTER TABLE public.business_technical_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_audit_activity ENABLE ROW LEVEL SECURITY;
COMMIT;
