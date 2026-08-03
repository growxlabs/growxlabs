BEGIN;

CREATE TABLE IF NOT EXISTS public.project_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), closure_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL UNIQUE REFERENCES public.project_workspaces(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL, agreement_id UUID REFERENCES public.master_service_agreements(id) ON DELETE SET NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','internal_review','awaiting_client_acceptance','accepted','delayed','completed','cancelled')),
  checklist JSONB NOT NULL DEFAULT '{}', executive_summary JSONB NOT NULL DEFAULT '{}', lessons_learned JSONB NOT NULL DEFAULT '{}', accepted_at TIMESTAMPTZ, accepted_by UUID, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.handover_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), handover_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE RESTRICT, closure_id UUID REFERENCES public.project_closures(id) ON DELETE SET NULL, client_id UUID NOT NULL, status TEXT NOT NULL DEFAULT 'draft', assets JSONB NOT NULL DEFAULT '[]', acknowledgement JSONB NOT NULL DEFAULT '{}', acknowledged_at TIMESTAMPTZ, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.closure_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), certificate_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL UNIQUE REFERENCES public.project_workspaces(id) ON DELETE RESTRICT, closure_id UUID NOT NULL REFERENCES public.project_closures(id) ON DELETE RESTRICT, client_id UUID NOT NULL, issued_at TIMESTAMPTZ NOT NULL DEFAULT now(), snapshot JSONB NOT NULL DEFAULT '{}', created_by UUID NOT NULL
);
CREATE TABLE IF NOT EXISTS public.project_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL UNIQUE REFERENCES public.project_workspaces(id) ON DELETE RESTRICT, client_id UUID NOT NULL, archived_at TIMESTAMPTZ NOT NULL DEFAULT now(), archive_manifest JSONB NOT NULL DEFAULT '{}', created_by UUID NOT NULL
);
CREATE TABLE IF NOT EXISTS public.customer_success_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), review_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE RESTRICT, client_id UUID NOT NULL, status TEXT NOT NULL DEFAULT 'draft', health TEXT NOT NULL DEFAULT 'healthy' CHECK(health IN ('healthy','needs_attention','at_risk','expansion_opportunity')), reasons JSONB NOT NULL DEFAULT '[]', systems JSONB NOT NULL DEFAULT '{}', recommendations JSONB NOT NULL DEFAULT '[]', created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.quarterly_business_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), qbr_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE RESTRICT, client_id UUID NOT NULL, status TEXT NOT NULL DEFAULT 'draft', review_period DATERANGE, goals JSONB NOT NULL DEFAULT '[]', kpis JSONB NOT NULL DEFAULT '[]', recommendations JSONB NOT NULL DEFAULT '[]', meeting_notes TEXT, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.roi_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE, client_id UUID NOT NULL, metric_key TEXT NOT NULL, metric_label TEXT NOT NULL, value NUMERIC, unit TEXT, period_start DATE, period_end DATE, source TEXT, notes TEXT, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), renewal_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE RESTRICT, client_id UUID NOT NULL, agreement_id UUID REFERENCES public.master_service_agreements(id) ON DELETE SET NULL, status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming','negotiation','renewed','expired','cancelled')), starts_on DATE, ends_on DATE, notes TEXT, owner_id UUID, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.expansion_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), expansion_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE RESTRICT, client_id UUID NOT NULL, title TEXT NOT NULL, category TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'identified', business_value TEXT, estimated_effort TEXT, priority TEXT, dependencies JSONB NOT NULL DEFAULT '[]', recommendation TEXT, commercial_notes TEXT, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE RESTRICT, client_id UUID NOT NULL, communication INTEGER CHECK(communication BETWEEN 1 AND 5), delivery INTEGER CHECK(delivery BETWEEN 1 AND 5), quality INTEGER CHECK(quality BETWEEN 1 AND 5), support INTEGER CHECK(support BETWEEN 1 AND 5), experience INTEGER CHECK(experience BETWEEN 1 AND 5), recommend_score INTEGER CHECK(recommend_score BETWEEN 0 AND 10), comments TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.success_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE, entity_type TEXT NOT NULL, entity_id UUID, event_type TEXT NOT NULL, actor_id UUID, metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.assign_success_number() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_TABLE_NAME='project_closures' AND (NEW.closure_number IS NULL OR btrim(NEW.closure_number)='') THEN NEW.closure_number:=public.generate_business_document_number('project_closure','GXL-CLS',COALESCE(NEW.created_at,now())); END IF;
 IF TG_TABLE_NAME='handover_records' AND (NEW.handover_number IS NULL OR btrim(NEW.handover_number)='') THEN NEW.handover_number:=public.generate_business_document_number('handover','GXL-HND',COALESCE(NEW.created_at,now())); END IF;
 IF TG_TABLE_NAME='closure_certificates' AND (NEW.certificate_number IS NULL OR btrim(NEW.certificate_number)='') THEN NEW.certificate_number:=public.generate_business_document_number('closure_certificate','GXL-CRT',COALESCE(NEW.issued_at,now())); END IF;
 IF TG_TABLE_NAME='customer_success_reviews' AND (NEW.review_number IS NULL OR btrim(NEW.review_number)='') THEN NEW.review_number:=public.generate_business_document_number('customer_success_review','GXL-CSR',COALESCE(NEW.created_at,now())); END IF;
 IF TG_TABLE_NAME='quarterly_business_reviews' AND (NEW.qbr_number IS NULL OR btrim(NEW.qbr_number)='') THEN NEW.qbr_number:=public.generate_business_document_number('quarterly_business_review','GXL-QBR',COALESCE(NEW.created_at,now())); END IF;
 IF TG_TABLE_NAME='renewals' AND (NEW.renewal_number IS NULL OR btrim(NEW.renewal_number)='') THEN NEW.renewal_number:=public.generate_business_document_number('renewal','GXL-RNW',COALESCE(NEW.created_at,now())); END IF;
 IF TG_TABLE_NAME='expansion_opportunities' AND (NEW.expansion_number IS NULL OR btrim(NEW.expansion_number)='') THEN NEW.expansion_number:=public.generate_business_document_number('expansion_opportunity','GXL-EXP',COALESCE(NEW.created_at,now())); END IF;
 RETURN NEW;
END $$;
DO $$ DECLARE t TEXT; BEGIN FOREACH t IN ARRAY ARRAY['project_closures','handover_records','closure_certificates','customer_success_reviews','quarterly_business_reviews','renewals','expansion_opportunities'] LOOP EXECUTE format('DROP TRIGGER IF EXISTS trg_success_number_%s ON public.%I',t,t); EXECUTE format('CREATE TRIGGER trg_success_number_%s BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.assign_success_number()',t,t); END LOOP; END $$;

CREATE INDEX IF NOT EXISTS success_activity_project_idx ON public.success_activity(project_id,created_at DESC);
CREATE INDEX IF NOT EXISTS roi_metrics_project_period_idx ON public.roi_metrics(project_id,period_end DESC);
ALTER TABLE public.project_closures ENABLE ROW LEVEL SECURITY; ALTER TABLE public.handover_records ENABLE ROW LEVEL SECURITY; ALTER TABLE public.closure_certificates ENABLE ROW LEVEL SECURITY; ALTER TABLE public.project_archives ENABLE ROW LEVEL SECURITY; ALTER TABLE public.customer_success_reviews ENABLE ROW LEVEL SECURITY; ALTER TABLE public.quarterly_business_reviews ENABLE ROW LEVEL SECURITY; ALTER TABLE public.roi_metrics ENABLE ROW LEVEL SECURITY; ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY; ALTER TABLE public.expansion_opportunities ENABLE ROW LEVEL SECURITY; ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY; ALTER TABLE public.success_activity ENABLE ROW LEVEL SECURITY;
COMMIT;
