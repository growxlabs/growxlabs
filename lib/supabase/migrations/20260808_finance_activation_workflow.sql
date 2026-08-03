BEGIN;

-- Additive finance and activation workflow. Legacy finance/project tables remain unchanged.
CREATE TABLE IF NOT EXISTS public.consulting_advance_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  agreement_id UUID NOT NULL REFERENCES public.master_service_agreements(id) ON DELETE RESTRICT,
  proposal_id UUID NOT NULL REFERENCES public.commercial_proposals(id) ON DELETE RESTRICT,
  scope_id UUID NOT NULL REFERENCES public.scopes_of_work(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL,
  company_id UUID,
  deal_id UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','internal_review','approved','sent','viewed','partially_paid','paid','overdue','cancelled','void','refunded')),
  currency TEXT NOT NULL DEFAULT 'INR',
  subtotal NUMERIC(14,2) NOT NULL CHECK (subtotal >= 0),
  discount_total NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
  tax_total NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (tax_total >= 0),
  total NUMERIC(14,2) NOT NULL CHECK (total >= 0),
  amount_paid NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  balance_due NUMERIC(14,2) NOT NULL CHECK (balance_due >= 0),
  line_items JSONB NOT NULL DEFAULT '[]',
  tax_breakdown JSONB NOT NULL DEFAULT '[]',
  payment_instructions JSONB NOT NULL DEFAULT '{}',
  due_date DATE,
  issued_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consulting_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number TEXT UNIQUE NOT NULL,
  invoice_id UUID NOT NULL REFERENCES public.consulting_advance_invoices(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL,
  company_id UUID,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  method TEXT NOT NULL CHECK (method IN ('bank_transfer','upi','card','gateway','other')),
  transaction_reference TEXT,
  status TEXT NOT NULL DEFAULT 'verification_required' CHECK (status IN ('pending','initiated','processing','received','verification_required','verified','failed','reversed','refunded','partially_refunded')),
  proof_path TEXT,
  gateway_payload JSONB NOT NULL DEFAULT '{}',
  verification_metadata JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consulting_payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  payment_id UUID UNIQUE NOT NULL REFERENCES public.consulting_payments(id) ON DELETE RESTRICT,
  invoice_id UUID NOT NULL REFERENCES public.consulting_advance_invoices(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  balance_after NUMERIC(14,2) NOT NULL CHECK (balance_after >= 0),
  snapshot JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consulting_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_number TEXT UNIQUE NOT NULL,
  agreement_id UUID NOT NULL UNIQUE REFERENCES public.master_service_agreements(id) ON DELETE RESTRICT,
  proposal_id UUID NOT NULL REFERENCES public.commercial_proposals(id) ON DELETE RESTRICT,
  scope_id UUID NOT NULL REFERENCES public.scopes_of_work(id) ON DELETE RESTRICT,
  invoice_id UUID REFERENCES public.consulting_advance_invoices(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL,
  company_id UUID,
  deal_id UUID,
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment','payment_verified','activation_pending','active','on_hold','cancelled')),
  activated_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consulting_kickoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kickoff_number TEXT UNIQUE NOT NULL,
  project_id UUID NOT NULL UNIQUE REFERENCES public.consulting_projects(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','preparation','scheduled','confirmed','in_progress','completed','follow_up_required','closed','cancelled')),
  agenda JSONB NOT NULL DEFAULT '[]',
  attendees JSONB NOT NULL DEFAULT '[]',
  preparation JSONB NOT NULL DEFAULT '{}',
  meeting_details JSONB NOT NULL DEFAULT '{}',
  scheduled_for TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.finance_activation_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  actor_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.assign_finance_activation_number() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF TG_TABLE_NAME='consulting_advance_invoices' AND (NEW.invoice_number IS NULL OR btrim(NEW.invoice_number)='') THEN NEW.invoice_number:=public.generate_business_document_number('consulting_invoice','GXL-INV',COALESCE(NEW.created_at,now())); END IF;
  IF TG_TABLE_NAME='consulting_payments' AND (NEW.payment_number IS NULL OR btrim(NEW.payment_number)='') THEN NEW.payment_number:=public.generate_business_document_number('consulting_payment','GXL-PAY',COALESCE(NEW.created_at,now())); END IF;
  IF TG_TABLE_NAME='consulting_payment_receipts' AND (NEW.receipt_number IS NULL OR btrim(NEW.receipt_number)='') THEN NEW.receipt_number:=public.generate_business_document_number('consulting_receipt','GXL-RCP',COALESCE(NEW.created_at,now())); END IF;
  IF TG_TABLE_NAME='consulting_projects' AND (NEW.project_number IS NULL OR btrim(NEW.project_number)='') THEN NEW.project_number:=public.generate_business_document_number('consulting_project','GXL-PRJ',COALESCE(NEW.created_at,now())); END IF;
  IF TG_TABLE_NAME='consulting_kickoffs' AND (NEW.kickoff_number IS NULL OR btrim(NEW.kickoff_number)='') THEN NEW.kickoff_number:=public.generate_business_document_number('consulting_kickoff','GXL-KOF',COALESCE(NEW.created_at,now())); END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_consulting_invoice_number ON public.consulting_advance_invoices;
CREATE TRIGGER trg_consulting_invoice_number BEFORE INSERT ON public.consulting_advance_invoices FOR EACH ROW EXECUTE FUNCTION public.assign_finance_activation_number();
DROP TRIGGER IF EXISTS trg_consulting_payment_number ON public.consulting_payments;
CREATE TRIGGER trg_consulting_payment_number BEFORE INSERT ON public.consulting_payments FOR EACH ROW EXECUTE FUNCTION public.assign_finance_activation_number();
DROP TRIGGER IF EXISTS trg_consulting_receipt_number ON public.consulting_payment_receipts;
CREATE TRIGGER trg_consulting_receipt_number BEFORE INSERT ON public.consulting_payment_receipts FOR EACH ROW EXECUTE FUNCTION public.assign_finance_activation_number();
DROP TRIGGER IF EXISTS trg_consulting_project_number ON public.consulting_projects;
CREATE TRIGGER trg_consulting_project_number BEFORE INSERT ON public.consulting_projects FOR EACH ROW EXECUTE FUNCTION public.assign_finance_activation_number();
DROP TRIGGER IF EXISTS trg_consulting_kickoff_number ON public.consulting_kickoffs;
CREATE TRIGGER trg_consulting_kickoff_number BEFORE INSERT ON public.consulting_kickoffs FOR EACH ROW EXECUTE FUNCTION public.assign_finance_activation_number();

CREATE INDEX IF NOT EXISTS consulting_invoices_client_idx ON public.consulting_advance_invoices(client_id,created_at DESC);
CREATE INDEX IF NOT EXISTS consulting_payments_invoice_idx ON public.consulting_payments(invoice_id,created_at DESC);
CREATE INDEX IF NOT EXISTS consulting_projects_client_idx ON public.consulting_projects(client_id,created_at DESC);
CREATE INDEX IF NOT EXISTS finance_activation_activity_entity_idx ON public.finance_activation_activity(entity_type,entity_id,created_at DESC);

ALTER TABLE public.consulting_advance_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulting_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulting_payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulting_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulting_kickoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_activation_activity ENABLE ROW LEVEL SECURITY;

COMMIT;
