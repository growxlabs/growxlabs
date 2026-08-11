BEGIN;
CREATE TABLE IF NOT EXISTS public.lead_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id text NOT NULL,
  batch_reference text NOT NULL UNIQUE, source text NOT NULL, source_job_id text NOT NULL,
  schema_version text NOT NULL, status text NOT NULL DEFAULT 'received' CHECK (status IN ('received','ready','completed','failed')),
  received_count integer NOT NULL DEFAULT 0, valid_count integer NOT NULL DEFAULT 0, duplicate_count integer NOT NULL DEFAULT 0,
  needs_review_count integer NOT NULL DEFAULT 0, approved_count integer NOT NULL DEFAULT 0, rejected_count integer NOT NULL DEFAULT 0,
  imported_count integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, source, source_job_id, schema_version)
);
CREATE TABLE IF NOT EXISTS public.lead_import_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), batch_id uuid NOT NULL REFERENCES public.lead_import_batches(id) ON DELETE CASCADE,
  organisation_id text NOT NULL, external_reference text NOT NULL, payload_snapshot jsonb NOT NULL,
  normalized_company_name text NOT NULL, normalized_domain text, normalized_email text, normalized_phone text,
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected','imported','invalid')),
  match_status text NOT NULL DEFAULT 'no_match' CHECK (match_status IN ('no_match','possible_duplicate','ambiguous')),
  matched_lead_id uuid REFERENCES public.leads(id), promoted_lead_id uuid REFERENCES public.leads(id),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (batch_id, external_reference)
);
CREATE INDEX IF NOT EXISTS lead_import_candidates_review_idx ON public.lead_import_candidates(organisation_id, review_status, match_status);
ALTER TABLE public.lead_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_import_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY lead_import_batches_service ON public.lead_import_batches FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY lead_import_candidates_service ON public.lead_import_candidates FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY lead_import_batches_admin ON public.lead_import_batches FOR SELECT TO authenticated USING (organisation_id = (auth.jwt()->>'organisation_id') AND (auth.jwt()->>'role') IN ('ADMIN','CO_ADMIN'));
CREATE POLICY lead_import_candidates_admin ON public.lead_import_candidates FOR SELECT TO authenticated USING (organisation_id = (auth.jwt()->>'organisation_id') AND (auth.jwt()->>'role') IN ('ADMIN','CO_ADMIN'));
COMMIT;
