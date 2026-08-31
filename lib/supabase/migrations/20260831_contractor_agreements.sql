BEGIN;

-- Contractor agreements are deliberately separate from the client-facing MSA.
CREATE TABLE IF NOT EXISTS public.contractor_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_number TEXT NOT NULL UNIQUE,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft','internal_review','approved_for_signing','sent_to_contractor',
    'viewed','contractor_signed','fully_executed','completed',
    'terminated','superseded','cancelled'
  )),
  agreement_date DATE,
  effective_date DATE,
  project_reference TEXT,
  client_project_reference TEXT,
  project_name TEXT,
  project_role TEXT NOT NULL DEFAULT 'Developer, GrowxLabs Delivery Team',
  contractor_full_legal_name TEXT,
  contractor_email TEXT,
  contractor_phone TEXT,
  contractor_address TEXT,
  contractor_pan_or_tax_id TEXT,
  scope JSONB NOT NULL DEFAULT '{}'::jsonb,
  legal_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_fee NUMERIC(12,2) NOT NULL DEFAULT 30000 CHECK (total_fee = 30000),
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  payment_method TEXT NOT NULL DEFAULT 'UPI' CHECK (payment_method = 'UPI'),
  payment_milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_version_id UUID REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT,
  executed_version_id UUID REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT,
  content_hash TEXT,
  pdf_storage_path TEXT,
  pdf_status TEXT NOT NULL DEFAULT 'not_generated' CHECK (pdf_status IN ('not_generated','generated','failed')),
  pdf_generated_at TIMESTAMPTZ,
  submitted_for_review_at TIMESTAMPTZ,
  approved_for_signing_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  contractor_signed_at TIMESTAMPTZ,
  countersigned_at TIMESTAMPTZ,
  handover_confirmed_at TIMESTAMPTZ,
  handover_confirmed_by UUID,
  handover_notes TEXT,
  completed_at TIMESTAMPTZ,
  terminated_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contractor_agreement_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.contractor_agreements(id) ON DELETE RESTRICT,
  agreement_version_id UUID NOT NULL REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT,
  party TEXT NOT NULL CHECK (party IN ('growxlabs','contractor')),
  full_legal_name TEXT NOT NULL,
  role_or_capacity TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  pan_or_tax_id TEXT,
  signature TEXT NOT NULL,
  consent_to_electronic_execution BOOLEAN NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id UUID,
  audit_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS contractor_agreement_signatures_version_party_uq
  ON public.contractor_agreement_signatures(agreement_version_id, party);

CREATE TABLE IF NOT EXISTS public.contractor_signing_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.contractor_agreements(id) ON DELETE RESTRICT,
  agreement_version_id UUID NOT NULL REFERENCES public.commercial_document_versions(id) ON DELETE RESTRICT,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contractor_agreement_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.contractor_agreements(id) ON DELETE RESTRICT,
  milestone_key TEXT NOT NULL CHECK (milestone_key IN ('milestone_1','milestone_2','milestone_3')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount IN (9000,12000)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid')),
  payment_method TEXT NOT NULL DEFAULT 'UPI' CHECK (payment_method = 'UPI'),
  payment_reference TEXT,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agreement_id, milestone_key)
);

CREATE INDEX IF NOT EXISTS contractor_agreements_status_updated_idx
  ON public.contractor_agreements(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS contractor_agreement_signatures_agreement_idx
  ON public.contractor_agreement_signatures(agreement_id, signed_at DESC);
CREATE INDEX IF NOT EXISTS contractor_signing_invitations_agreement_idx
  ON public.contractor_signing_invitations(agreement_id, created_at DESC);
CREATE INDEX IF NOT EXISTS contractor_agreement_payments_agreement_idx
  ON public.contractor_agreement_payments(agreement_id, milestone_key);

CREATE OR REPLACE FUNCTION public.assign_contractor_agreement_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.agreement_number IS NULL OR btrim(NEW.agreement_number) = '' THEN
    NEW.agreement_number := public.generate_business_document_number(
      'independent_contractor_agreement', 'GXL-ICA', COALESCE(NEW.created_at, now())
    );
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_contractor_agreement_number ON public.contractor_agreements;
CREATE TRIGGER trg_contractor_agreement_number
  BEFORE INSERT ON public.contractor_agreements
  FOR EACH ROW EXECUTE FUNCTION public.assign_contractor_agreement_number();

ALTER TABLE public.contractor_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_agreement_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_signing_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_agreement_payments ENABLE ROW LEVEL SECURITY;

COMMIT;
