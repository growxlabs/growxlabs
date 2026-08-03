BEGIN;
-- Commercial and legal phases are separate from legacy proposal/agreement tables.
-- They remain traceable to the approved consulting architecture.
CREATE TABLE IF NOT EXISTS public.scopes_of_work (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), scope_number TEXT UNIQUE NOT NULL,
  solution_architecture_id UUID NOT NULL REFERENCES public.solution_architectures(id) ON DELETE RESTRICT,
  ai_solution_report_id UUID NOT NULL REFERENCES public.ai_solution_reports(id) ON DELETE RESTRICT,
  audit_id UUID NOT NULL REFERENCES public.business_technical_audits(id) ON DELETE RESTRICT,
  assessment_id UUID NOT NULL, discovery_meeting_id UUID NOT NULL, client_id UUID NOT NULL, company_id UUID, deal_id UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','internal_review','changes_required','approved_internal','ready_for_client','sent','viewed','negotiation','client_changes_requested','approved','rejected','expired','signed','cancelled','archived')),
  version INTEGER NOT NULL DEFAULT 1, content JSONB NOT NULL DEFAULT '{}', created_by UUID NOT NULL,
  approved_by UUID, approved_at TIMESTAMPTZ, shared_at TIMESTAMPTZ, client_acknowledged_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.commercial_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), proposal_number TEXT UNIQUE NOT NULL,
  scope_of_work_id UUID NOT NULL REFERENCES public.scopes_of_work(id) ON DELETE RESTRICT,
  solution_architecture_id UUID NOT NULL REFERENCES public.solution_architectures(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL, company_id UUID, deal_id UUID, status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','internal_review','changes_required','approved_internal','ready_for_client','sent','viewed','negotiation','client_changes_requested','approved','rejected','expired','signed','cancelled','archived')),
  version INTEGER NOT NULL DEFAULT 1, valid_until DATE, content JSONB NOT NULL DEFAULT '{}', pricing JSONB NOT NULL DEFAULT '[]', payment_schedule JSONB NOT NULL DEFAULT '[]', created_by UUID NOT NULL,
  approved_by UUID, approved_at TIMESTAMPTZ, sent_at TIMESTAMPTZ, viewed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.proposal_approval_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), approval_number TEXT UNIQUE NOT NULL,
  proposal_id UUID NOT NULL REFERENCES public.commercial_proposals(id) ON DELETE RESTRICT, client_id UUID NOT NULL, company_id UUID, deal_id UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','internal_review','changes_required','approved_internal','ready_for_client','sent','viewed','negotiation','client_changes_requested','approved','rejected','expired','signed','cancelled','archived')),
  version INTEGER NOT NULL DEFAULT 1, approval_data JSONB NOT NULL DEFAULT '{}', created_by UUID NOT NULL,
  approved_at TIMESTAMPTZ, approved_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.master_service_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), agreement_number TEXT UNIQUE NOT NULL,
  proposal_approval_id UUID NOT NULL REFERENCES public.proposal_approval_records(id) ON DELETE RESTRICT, proposal_id UUID NOT NULL REFERENCES public.commercial_proposals(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL, company_id UUID, deal_id UUID, status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','internal_review','changes_required','approved_internal','ready_for_client','sent','viewed','negotiation','client_changes_requested','approved','rejected','expired','signed','cancelled','archived')),
  version INTEGER NOT NULL DEFAULT 1, content JSONB NOT NULL DEFAULT '{}', created_by UUID NOT NULL,
  signed_at TIMESTAMPTZ, client_signed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.commercial_document_activity (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_type TEXT NOT NULL, document_id UUID NOT NULL, actor_id UUID, actor_type TEXT, event_type TEXT NOT NULL, metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.commercial_document_versions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_type TEXT NOT NULL, document_id UUID NOT NULL, version INTEGER NOT NULL, snapshot JSONB NOT NULL DEFAULT '{}', created_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(document_type,document_id,version));
CREATE TABLE IF NOT EXISTS public.commercial_document_comments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), document_type TEXT NOT NULL, document_id UUID NOT NULL, author_id UUID NOT NULL, audience TEXT NOT NULL DEFAULT 'internal' CHECK(audience IN ('internal','client')), body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE OR REPLACE FUNCTION public.assign_commercial_number() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF TG_TABLE_NAME='scopes_of_work' AND (NEW.scope_number IS NULL OR btrim(NEW.scope_number)='') THEN NEW.scope_number:=public.generate_business_document_number('scope_of_work','GXL-SOW',COALESCE(NEW.created_at,now())); END IF;
  IF TG_TABLE_NAME='commercial_proposals' AND (NEW.proposal_number IS NULL OR btrim(NEW.proposal_number)='') THEN NEW.proposal_number:=public.generate_business_document_number('commercial_proposal','GXL-PRO',COALESCE(NEW.created_at,now())); END IF;
  IF TG_TABLE_NAME='proposal_approval_records' AND (NEW.approval_number IS NULL OR btrim(NEW.approval_number)='') THEN NEW.approval_number:=public.generate_business_document_number('proposal_approval','GXL-PAP',COALESCE(NEW.created_at,now())); END IF;
  IF TG_TABLE_NAME='master_service_agreements' AND (NEW.agreement_number IS NULL OR btrim(NEW.agreement_number)='') THEN NEW.agreement_number:=public.generate_business_document_number('master_service_agreement','GXL-MSA',COALESCE(NEW.created_at,now())); END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_scope_number ON public.scopes_of_work; CREATE TRIGGER trg_scope_number BEFORE INSERT ON public.scopes_of_work FOR EACH ROW EXECUTE FUNCTION public.assign_commercial_number();
DROP TRIGGER IF EXISTS trg_proposal_number ON public.commercial_proposals; CREATE TRIGGER trg_proposal_number BEFORE INSERT ON public.commercial_proposals FOR EACH ROW EXECUTE FUNCTION public.assign_commercial_number();
DROP TRIGGER IF EXISTS trg_proposal_approval_number ON public.proposal_approval_records; CREATE TRIGGER trg_proposal_approval_number BEFORE INSERT ON public.proposal_approval_records FOR EACH ROW EXECUTE FUNCTION public.assign_commercial_number();
DROP TRIGGER IF EXISTS trg_msa_number ON public.master_service_agreements; CREATE TRIGGER trg_msa_number BEFORE INSERT ON public.master_service_agreements FOR EACH ROW EXECUTE FUNCTION public.assign_commercial_number();
ALTER TABLE public.scopes_of_work ENABLE ROW LEVEL SECURITY; ALTER TABLE public.commercial_proposals ENABLE ROW LEVEL SECURITY; ALTER TABLE public.proposal_approval_records ENABLE ROW LEVEL SECURITY; ALTER TABLE public.master_service_agreements ENABLE ROW LEVEL SECURITY; ALTER TABLE public.commercial_document_activity ENABLE ROW LEVEL SECURITY; ALTER TABLE public.commercial_document_versions ENABLE ROW LEVEL SECURITY; ALTER TABLE public.commercial_document_comments ENABLE ROW LEVEL SECURITY;
COMMIT;
