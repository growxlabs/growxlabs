BEGIN;

-- The production database has an older shared trigger function that can read
-- NEW.payment_number while an invoice row is being inserted. Keep each finance
-- number trigger table-specific so a row can never reference another table's
-- columns.
CREATE OR REPLACE FUNCTION public.assign_consulting_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR btrim(NEW.invoice_number) = '' THEN
    NEW.invoice_number := public.generate_business_document_number('consulting_invoice', 'GXL-INV', COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.assign_consulting_payment_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
  IF NEW.payment_number IS NULL OR btrim(NEW.payment_number) = '' THEN
    NEW.payment_number := public.generate_business_document_number('consulting_payment', 'GXL-PAY', COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.assign_consulting_receipt_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
  IF NEW.receipt_number IS NULL OR btrim(NEW.receipt_number) = '' THEN
    NEW.receipt_number := public.generate_business_document_number('consulting_receipt', 'GXL-RCP', COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.assign_consulting_project_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
  IF NEW.project_number IS NULL OR btrim(NEW.project_number) = '' THEN
    NEW.project_number := public.generate_business_document_number('consulting_project', 'GXL-PRJ', COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.assign_consulting_kickoff_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
  IF NEW.kickoff_number IS NULL OR btrim(NEW.kickoff_number) = '' THEN
    NEW.kickoff_number := public.generate_business_document_number('consulting_kickoff', 'GXL-KOF', COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_consulting_invoice_number ON public.consulting_advance_invoices;
CREATE TRIGGER trg_consulting_invoice_number
BEFORE INSERT ON public.consulting_advance_invoices
FOR EACH ROW EXECUTE FUNCTION public.assign_consulting_invoice_number();

DROP TRIGGER IF EXISTS trg_consulting_payment_number ON public.consulting_payments;
CREATE TRIGGER trg_consulting_payment_number
BEFORE INSERT ON public.consulting_payments
FOR EACH ROW EXECUTE FUNCTION public.assign_consulting_payment_number();

DROP TRIGGER IF EXISTS trg_consulting_receipt_number ON public.consulting_payment_receipts;
CREATE TRIGGER trg_consulting_receipt_number
BEFORE INSERT ON public.consulting_payment_receipts
FOR EACH ROW EXECUTE FUNCTION public.assign_consulting_receipt_number();

DROP TRIGGER IF EXISTS trg_consulting_project_number ON public.consulting_projects;
CREATE TRIGGER trg_consulting_project_number
BEFORE INSERT ON public.consulting_projects
FOR EACH ROW EXECUTE FUNCTION public.assign_consulting_project_number();

DROP TRIGGER IF EXISTS trg_consulting_kickoff_number ON public.consulting_kickoffs;
CREATE TRIGGER trg_consulting_kickoff_number
BEFORE INSERT ON public.consulting_kickoffs
FOR EACH ROW EXECUTE FUNCTION public.assign_consulting_kickoff_number();

COMMIT;
