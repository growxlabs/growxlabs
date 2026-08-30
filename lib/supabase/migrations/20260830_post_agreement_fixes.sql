BEGIN;

-- The canonical onboarding record already exists. These links let the existing
-- workflow retain the exact consulting scope and invoice that unlocked it.
ALTER TABLE public.client_onboardings
  ADD COLUMN IF NOT EXISTS scope_id UUID REFERENCES public.scopes_of_work(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.consulting_advance_invoices(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS client_onboardings_engagement_idx
  ON public.client_onboardings(agreement_id, scope_id, invoice_id, updated_at DESC);

COMMIT;
