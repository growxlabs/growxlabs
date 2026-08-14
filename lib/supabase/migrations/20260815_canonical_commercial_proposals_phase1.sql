BEGIN;

ALTER TABLE public.commercial_proposals
  ADD COLUMN IF NOT EXISTS assessment_id UUID,
  ADD COLUMN IF NOT EXISTS client_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS commercial_totals JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS current_version_id UUID,
  ADD COLUMN IF NOT EXISTS accepted_by_user_id UUID,
  ADD COLUMN IF NOT EXISTS accepted_by_name TEXT,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_version_id UUID,
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ;

UPDATE public.commercial_proposals p
SET assessment_id=s.assessment_id
FROM public.scopes_of_work s
WHERE p.scope_of_work_id=s.id AND p.assessment_id IS NULL;

ALTER TABLE public.commercial_document_versions
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS client_visible BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.commercial_document_activity
  ADD COLUMN IF NOT EXISTS proposal_version_id UUID;

DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='commercial_proposals_assessment_fk') THEN
    ALTER TABLE public.commercial_proposals ADD CONSTRAINT commercial_proposals_assessment_fk FOREIGN KEY(assessment_id) REFERENCES public.client_assessments(id) ON DELETE RESTRICT NOT VALID;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='commercial_proposals_client_fk') THEN
    ALTER TABLE public.commercial_proposals ADD CONSTRAINT commercial_proposals_client_fk FOREIGN KEY(client_id) REFERENCES public.client_profiles(id) ON DELETE RESTRICT NOT VALID;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='commercial_proposals_company_fk') THEN
    ALTER TABLE public.commercial_proposals ADD CONSTRAINT commercial_proposals_company_fk FOREIGN KEY(company_id) REFERENCES public.companies(id) ON DELETE RESTRICT NOT VALID;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='commercial_proposals_deal_fk') THEN
    ALTER TABLE public.commercial_proposals ADD CONSTRAINT commercial_proposals_deal_fk FOREIGN KEY(deal_id) REFERENCES public.deals(id) ON DELETE RESTRICT NOT VALID;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='commercial_proposals_current_version_fk') THEN
    ALTER TABLE public.commercial_proposals ADD CONSTRAINT commercial_proposals_current_version_fk FOREIGN KEY(current_version_id) REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT NOT VALID;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='commercial_proposals_accepted_version_fk') THEN
    ALTER TABLE public.commercial_proposals ADD CONSTRAINT commercial_proposals_accepted_version_fk FOREIGN KEY(accepted_version_id) REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT NOT VALID;
  END IF;
END $$;

ALTER TABLE public.commercial_proposals DROP CONSTRAINT IF EXISTS commercial_proposals_status_check;
ALTER TABLE public.commercial_proposals ADD CONSTRAINT commercial_proposals_status_check CHECK(status IN ('draft','internal_review','changes_required','approved_internal','ready_for_client','sent','viewed','request_changes','client_changes_requested','accepted','approved','rejected','expired','signed','cancelled','archived'));

CREATE TABLE IF NOT EXISTS public.legacy_proposal_migration_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), legacy_proposal_id UUID NOT NULL UNIQUE,
  canonical_proposal_id UUID REFERENCES public.commercial_proposals(id) ON DELETE SET NULL,
  migration_status TEXT NOT NULL DEFAULT 'discovered' CHECK(migration_status IN ('discovered','needs_mapping','migrated','retained_read_only','retired')),
  legacy_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb, migration_notes TEXT,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(), migrated_at TIMESTAMPTZ
);
DO $$ BEGIN
  IF to_regclass('public.proposals') IS NOT NULL THEN
    EXECUTE 'INSERT INTO public.legacy_proposal_migration_inventory(legacy_proposal_id,legacy_snapshot,migration_status) SELECT id,to_jsonb(p),''needs_mapping'' FROM public.proposals p ON CONFLICT(legacy_proposal_id) DO NOTHING';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.prevent_immutable_proposal_version_change() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN IF OLD.document_type='proposal' THEN RAISE EXCEPTION 'Proposal version snapshots are immutable'; END IF; RETURN OLD; END $$;
DROP TRIGGER IF EXISTS trg_immutable_proposal_version_update ON public.commercial_document_versions;
CREATE TRIGGER trg_immutable_proposal_version_update BEFORE UPDATE OR DELETE ON public.commercial_document_versions FOR EACH ROW EXECUTE FUNCTION public.prevent_immutable_proposal_version_change();

CREATE OR REPLACE FUNCTION public.prevent_accepted_proposal_mutation() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IN ('accepted','approved','signed') AND (
    NEW.content IS DISTINCT FROM OLD.content OR NEW.client_content IS DISTINCT FROM OLD.client_content OR
    NEW.pricing IS DISTINCT FROM OLD.pricing OR NEW.payment_schedule IS DISTINCT FROM OLD.payment_schedule OR
    NEW.commercial_totals IS DISTINCT FROM OLD.commercial_totals OR NEW.valid_until IS DISTINCT FROM OLD.valid_until OR
    NEW.version IS DISTINCT FROM OLD.version OR NEW.scope_of_work_id IS DISTINCT FROM OLD.scope_of_work_id OR
    NEW.assessment_id IS DISTINCT FROM OLD.assessment_id OR NEW.client_id IS DISTINCT FROM OLD.client_id OR
    NEW.company_id IS DISTINCT FROM OLD.company_id OR NEW.deal_id IS DISTINCT FROM OLD.deal_id
  ) THEN RAISE EXCEPTION 'Accepted proposal content is immutable; create a new proposal version'; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_prevent_accepted_proposal_mutation ON public.commercial_proposals;
CREATE TRIGGER trg_prevent_accepted_proposal_mutation BEFORE UPDATE ON public.commercial_proposals FOR EACH ROW EXECUTE FUNCTION public.prevent_accepted_proposal_mutation();

CREATE INDEX IF NOT EXISTS commercial_proposals_assessment_idx ON public.commercial_proposals(assessment_id);
CREATE INDEX IF NOT EXISTS commercial_proposal_activity_version_idx ON public.commercial_document_activity(document_id,proposal_version_id,created_at DESC) WHERE document_type='proposal';
CREATE UNIQUE INDEX IF NOT EXISTS proposal_version_hash_uq ON public.commercial_document_versions(document_id,content_hash) WHERE document_type='proposal' AND content_hash IS NOT NULL;
ALTER TABLE public.legacy_proposal_migration_inventory ENABLE ROW LEVEL SECURITY;

COMMIT;
