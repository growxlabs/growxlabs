BEGIN;

CREATE TABLE IF NOT EXISTS public.client_onboardings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), onboarding_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE RESTRICT, user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL, assessment_id UUID REFERENCES public.client_assessments(id) ON DELETE SET NULL,
  deal_id UUID, proposal_id UUID, agreement_id UUID, project_id UUID, owner_id UUID,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK(status IN ('not_started','invited','in_progress','submitted','additional_information_required','resubmitted','under_review','ready_for_kickoff','completed')),
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK(completion_percentage BETWEEN 0 AND 100),
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb, applicable_sections JSONB NOT NULL DEFAULT '["company_details","billing_legal","project_contacts","assets","digital_properties","access_requests","documents","final_review"]'::jsonb,
  confirmation JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), invited_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ, submitted_at TIMESTAMPTZ, approved_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS client_onboardings_active_uq ON public.client_onboardings(client_id) WHERE status <> 'completed';

CREATE TABLE IF NOT EXISTS public.onboarding_requirement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), requirement_key TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('company','billing','contact','brand','digital','technical','legal','finance','compliance','other')),
  requirement_type TEXT NOT NULL CHECK(requirement_type IN ('field','document','access','confirmation','custom')),
  description TEXT, default_required BOOLEAN NOT NULL DEFAULT false, config JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.onboarding_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), onboarding_id UUID NOT NULL REFERENCES public.client_onboardings(id) ON DELETE CASCADE,
  definition_id UUID REFERENCES public.onboarding_requirement_definitions(id) ON DELETE SET NULL, requirement_key TEXT NOT NULL,
  section_key TEXT NOT NULL, name TEXT NOT NULL, description TEXT, requirement_type TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false, position INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','complete','needs_information','verified','not_applicable')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb, admin_notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(onboarding_id,requirement_key)
);
CREATE TABLE IF NOT EXISTS public.onboarding_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), onboarding_id UUID NOT NULL REFERENCES public.client_onboardings(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES public.onboarding_requirements(id) ON DELETE SET NULL, service_name TEXT NOT NULL, required BOOLEAN NOT NULL DEFAULT false,
  reason TEXT, instructions TEXT, status TEXT NOT NULL DEFAULT 'not_requested' CHECK(status IN ('not_requested','requested','client_action_required','granted','verification_required','verified','not_applicable')),
  assigned_contact JSONB NOT NULL DEFAULT '{}'::jsonb, requested_at TIMESTAMPTZ, granted_at TIMESTAMPTZ, verified_at TIMESTAMPTZ,
  admin_notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.onboarding_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), onboarding_id UUID NOT NULL REFERENCES public.client_onboardings(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES public.onboarding_requirements(id) ON DELETE SET NULL, category TEXT NOT NULL CHECK(category IN ('legal','finance','brand','technical','product','access','compliance','other')),
  file_name TEXT NOT NULL, storage_path TEXT NOT NULL, mime_type TEXT, size_bytes BIGINT, version INTEGER NOT NULL DEFAULT 1,
  uploaded_by UUID NOT NULL, verification_status TEXT NOT NULL DEFAULT 'pending' CHECK(verification_status IN ('pending','verified','rejected','superseded')),
  admin_note TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.onboarding_information_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), onboarding_id UUID NOT NULL REFERENCES public.client_onboardings(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL, reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','resubmitted','resolved','cancelled')),
  requested_items JSONB NOT NULL DEFAULT '[]'::jsonb, due_at TIMESTAMPTZ, resubmitted_at TIMESTAMPTZ, resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.onboarding_readiness_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), onboarding_id UUID NOT NULL REFERENCES public.client_onboardings(id) ON DELETE CASCADE,
  check_key TEXT NOT NULL, label TEXT NOT NULL, complete BOOLEAN NOT NULL DEFAULT false, verified_by UUID, verified_at TIMESTAMPTZ,
  note TEXT, position INTEGER NOT NULL, UNIQUE(onboarding_id,check_key)
);
CREATE TABLE IF NOT EXISTS public.onboarding_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), onboarding_id UUID NOT NULL REFERENCES public.client_onboardings(id) ON DELETE CASCADE,
  actor_id UUID, actor_type TEXT NOT NULL, event_type TEXT NOT NULL, audience TEXT NOT NULL DEFAULT 'admin' CHECK(audience IN ('client','admin','audit')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.assign_onboarding_number() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN IF NEW.onboarding_number IS NULL OR btrim(NEW.onboarding_number)='' THEN NEW.onboarding_number:=public.generate_business_document_number('client_onboarding','GXL-ONB',COALESCE(NEW.created_at,now())); END IF; RETURN NEW; END $$;
DROP TRIGGER IF EXISTS trg_client_onboarding_number ON public.client_onboardings;
CREATE TRIGGER trg_client_onboarding_number BEFORE INSERT ON public.client_onboardings FOR EACH ROW EXECUTE FUNCTION public.assign_onboarding_number();

CREATE INDEX IF NOT EXISTS onboarding_client_status_idx ON public.client_onboardings(client_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS onboarding_requirements_idx ON public.onboarding_requirements(onboarding_id,section_key,position);
CREATE INDEX IF NOT EXISTS onboarding_access_idx ON public.onboarding_access_requests(onboarding_id,status);
CREATE INDEX IF NOT EXISTS onboarding_documents_idx ON public.onboarding_documents(onboarding_id,category,created_at DESC);

DO $$ DECLARE t TEXT; BEGIN FOREACH t IN ARRAY ARRAY['client_onboardings','onboarding_requirement_definitions','onboarding_requirements','onboarding_access_requests','onboarding_documents','onboarding_information_requests','onboarding_readiness_checks','onboarding_activity'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('DROP POLICY IF EXISTS onboarding_admin_all ON public.%I',t);
  EXECUTE format('CREATE POLICY onboarding_admin_all ON public.%I FOR ALL USING ((auth.jwt()->>''role'') IN (''ADMIN'',''CO_ADMIN'')) WITH CHECK ((auth.jwt()->>''role'') IN (''ADMIN'',''CO_ADMIN''))',t);
END LOOP; END $$;
DROP POLICY IF EXISTS onboarding_client_own ON public.client_onboardings;
CREATE POLICY onboarding_client_own ON public.client_onboardings FOR SELECT USING(user_id=auth.uid());
DROP POLICY IF EXISTS onboarding_client_update ON public.client_onboardings;
CREATE POLICY onboarding_client_update ON public.client_onboardings FOR UPDATE USING(user_id=auth.uid() AND status IN ('invited','in_progress','additional_information_required')) WITH CHECK(user_id=auth.uid());
DO $$ DECLARE t TEXT; BEGIN FOREACH t IN ARRAY ARRAY['onboarding_requirements','onboarding_access_requests','onboarding_documents','onboarding_information_requests','onboarding_readiness_checks','onboarding_activity'] LOOP
  EXECUTE format('DROP POLICY IF EXISTS onboarding_client_related ON public.%I',t);
  EXECUTE format('CREATE POLICY onboarding_client_related ON public.%I FOR SELECT USING(EXISTS(SELECT 1 FROM public.client_onboardings o WHERE o.id=onboarding_id AND o.user_id=auth.uid()))',t);
END LOOP; END $$;

INSERT INTO public.onboarding_requirement_definitions(requirement_key,name,category,requirement_type,description,default_required,config) VALUES
('company_details','Company Details','company','field','Confirm known company and primary-contact information.',true,'{"fields":["company_name","legal_entity_name","primary_contact","designation","email","phone","website","headquarters","operating_regions"]}'),
('billing_legal','Billing & Legal Details','billing','field','Provide applicable legal, tax, billing and authorised-representative details.',true,'{"fields":["registered_legal_name","registered_address","billing_address","gstin","pan","billing_contact","billing_email","purchase_order_required","authorized_representative"]}'),
('project_contacts','Project Contacts','contact','field','Identify only the contacts required for this engagement.',true,'{"multiple":true}'),
('brand_assets','Brand & Company Assets','brand','document','Upload relevant approved brand and company materials.',false,'{}'),
('digital_properties','Digital Properties','digital','field','Confirm relevant domains, platforms and environments without sharing secrets.',false,'{}'),
('final_confirmation','Final Authorisation','legal','confirmation','Confirm the onboarding information is accurate and authorised.',true,'{}')
ON CONFLICT(requirement_key) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,config=EXCLUDED.config,updated_at=now();

COMMIT;
