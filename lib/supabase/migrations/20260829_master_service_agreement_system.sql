BEGIN;

-- Active MSA lifecycle, immutable version snapshots, structured signing, and
-- explicit legal-review fields. This migration is additive and deliberately
-- leaves legacy public.agreements untouched.
ALTER TABLE public.master_service_agreements
  ADD COLUMN IF NOT EXISTS scope_of_work_id UUID REFERENCES public.scopes_of_work(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS proposal_version_id UUID REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS current_version_id UUID REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS executed_version_id UUID REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS pdf_status TEXT NOT NULL DEFAULT 'not_generated',
  ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS effective_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_internally_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ready_for_client_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS client_changes_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terminated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS superseded_at TIMESTAMPTZ;

UPDATE public.master_service_agreements a
SET scope_of_work_id = p.scope_of_work_id
FROM public.commercial_proposals p
WHERE a.proposal_id = p.id AND a.scope_of_work_id IS NULL;

ALTER TABLE public.master_service_agreements DROP CONSTRAINT IF EXISTS master_service_agreements_status_check;
ALTER TABLE public.master_service_agreements
  ADD CONSTRAINT master_service_agreements_status_check CHECK(status IN (
    'draft','internal_review','changes_required','approved_internal','ready_for_client',
    'sent','viewed','negotiation','client_changes_requested','signing','signed',
    'superseded','expired','terminated','approved','rejected','cancelled','archived'
  ));
ALTER TABLE public.master_service_agreements DROP CONSTRAINT IF EXISTS master_service_agreements_pdf_status_check;
ALTER TABLE public.master_service_agreements
  ADD CONSTRAINT master_service_agreements_pdf_status_check CHECK(pdf_status IN ('not_generated','generated','failed'));

ALTER TABLE public.commercial_document_activity
  ADD COLUMN IF NOT EXISTS agreement_version_id UUID REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT;

CREATE TABLE IF NOT EXISTS public.agreement_internal_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.master_service_agreements(id) ON DELETE RESTRICT,
  agreement_version_id UUID REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT,
  reviewer_id UUID,
  decision TEXT NOT NULL CHECK(decision IN ('submitted','approved','changes_required')),
  comment TEXT,
  unresolved_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agreement_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.master_service_agreements(id) ON DELETE RESTRICT,
  agreement_version_id UUID NOT NULL REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT,
  requested_by UUID,
  requested_by_name TEXT NOT NULL,
  requested_change TEXT NOT NULL,
  reason TEXT NOT NULL,
  scope_impact TEXT NOT NULL,
  timeline_impact TEXT NOT NULL,
  commercial_impact TEXT NOT NULL,
  growxlabs_approval JSONB NOT NULL DEFAULT '{}'::jsonb,
  client_approval JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved','cancelled')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.agreement_signatory_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.master_service_agreements(id) ON DELETE RESTRICT,
  agreement_version_id UUID NOT NULL REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT,
  party TEXT NOT NULL CHECK(party IN ('growxlabs','client')),
  full_legal_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  signature TEXT NOT NULL,
  consent_to_electronic_execution BOOLEAN NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id UUID,
  audit_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS agreement_signatory_events_version_party_uq
  ON public.agreement_signatory_events(agreement_version_id, party);

CREATE INDEX IF NOT EXISTS master_service_agreements_status_updated_idx
  ON public.master_service_agreements(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS master_service_agreements_client_status_idx
  ON public.master_service_agreements(client_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS agreement_internal_reviews_agreement_idx
  ON public.agreement_internal_reviews(agreement_id, created_at DESC);
CREATE INDEX IF NOT EXISTS agreement_change_requests_agreement_idx
  ON public.agreement_change_requests(agreement_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS agreement_signatory_events_agreement_idx
  ON public.agreement_signatory_events(agreement_id, signed_at DESC);

-- Every commercial version is immutable once written. New material agreement
-- changes must create a new version instead of mutating a sent or signed one.
CREATE OR REPLACE FUNCTION public.prevent_immutable_commercial_version_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.locked_at IS NOT NULL THEN
    RAISE EXCEPTION 'Commercial document version snapshots are immutable';
  END IF;
  RETURN OLD;
END $$;
DROP TRIGGER IF EXISTS trg_immutable_proposal_version_update ON public.commercial_document_versions;
DROP TRIGGER IF EXISTS trg_immutable_commercial_version_update ON public.commercial_document_versions;
CREATE TRIGGER trg_immutable_commercial_version_update
  BEFORE UPDATE OR DELETE ON public.commercial_document_versions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_immutable_commercial_version_change();

CREATE OR REPLACE FUNCTION public.prevent_sent_msa_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IN ('sent','viewed','negotiation','client_changes_requested','signing','signed','superseded','expired','terminated')
     AND NOT (OLD.status = 'signing' AND NEW.status = 'signed' AND NEW.executed_version_id IS NOT NULL
       AND NEW.version = OLD.version + 1 AND NEW.current_version_id = NEW.executed_version_id
       AND NEW.content_hash IS DISTINCT FROM OLD.content_hash)
     AND (NEW.content IS DISTINCT FROM OLD.content
        OR NEW.version IS DISTINCT FROM OLD.version
       OR NEW.proposal_id IS DISTINCT FROM OLD.proposal_id
       OR NEW.proposal_version_id IS DISTINCT FROM OLD.proposal_version_id
       OR NEW.scope_of_work_id IS DISTINCT FROM OLD.scope_of_work_id
       OR NEW.client_id IS DISTINCT FROM OLD.client_id
       OR NEW.company_id IS DISTINCT FROM OLD.company_id
        OR NEW.deal_id IS DISTINCT FROM OLD.deal_id
        OR NEW.current_version_id IS DISTINCT FROM OLD.current_version_id
        OR NEW.executed_version_id IS DISTINCT FROM OLD.executed_version_id
        OR NEW.content_hash IS DISTINCT FROM OLD.content_hash) THEN
    RAISE EXCEPTION 'Sent or executed agreement content is immutable; create a new agreement version';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_prevent_sent_msa_mutation ON public.master_service_agreements;
CREATE TRIGGER trg_prevent_sent_msa_mutation
  BEFORE UPDATE ON public.master_service_agreements
  FOR EACH ROW EXECUTE FUNCTION public.prevent_sent_msa_mutation();

ALTER TABLE public.master_service_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_internal_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_signatory_events ENABLE ROW LEVEL SECURITY;

COMMIT;
