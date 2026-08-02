BEGIN;

CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  lead_id UUID,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  assigned_consultant_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT NOT NULL,
  description TEXT, version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  published_at TIMESTAMPTZ, created_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, version)
);
CREATE TABLE IF NOT EXISTS public.assessment_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), template_id UUID NOT NULL REFERENCES public.assessment_templates(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL, title TEXT NOT NULL, description TEXT, position INTEGER NOT NULL CHECK (position > 0),
  is_required BOOLEAN NOT NULL DEFAULT false, is_active BOOLEAN NOT NULL DEFAULT true, config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(template_id, section_key), UNIQUE(template_id, position)
);
CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), section_id UUID NOT NULL REFERENCES public.assessment_sections(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL, label TEXT NOT NULL, description TEXT, field_type TEXT NOT NULL CHECK (field_type IN ('text','textarea','email','phone','number','currency','date','url','single_select','multi_select','radio','checkbox','boolean','file_upload','signature','consent','summary')),
  placeholder TEXT, help_text TEXT, position INTEGER NOT NULL CHECK (position > 0), is_required BOOLEAN NOT NULL DEFAULT false,
  validation JSONB NOT NULL DEFAULT '{}'::jsonb, visibility_rules JSONB NOT NULL DEFAULT '[]'::jsonb, config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(section_id, question_key), UNIQUE(section_id, position)
);
CREATE TABLE IF NOT EXISTS public.assessment_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), question_id TEXT NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  label TEXT NOT NULL, value TEXT NOT NULL, position INTEGER NOT NULL CHECK (position > 0), is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(question_id, value), UNIQUE(question_id, position)
);
CREATE TABLE IF NOT EXISTS public.client_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), template_id UUID NOT NULL REFERENCES public.assessment_templates(id), template_version INTEGER NOT NULL,
  user_id UUID NOT NULL, client_id UUID NOT NULL REFERENCES public.client_profiles(id), company_id UUID REFERENCES public.companies(id), lead_id UUID, deal_id UUID REFERENCES public.deals(id),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','draft','submitted','under_review','more_information_required','review_complete','archived')),
  current_section INTEGER NOT NULL DEFAULT 1 CHECK (current_section > 0), completed_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100), template_snapshot JSONB NOT NULL,
  started_at TIMESTAMPTZ, submitted_at TIMESTAMPTZ, review_started_at TIMESTAMPTZ, reviewed_at TIMESTAMPTZ, reopened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS client_assessments_active_uq ON public.client_assessments(client_id, template_id, template_version) WHERE status <> 'archived';
CREATE TABLE IF NOT EXISTS public.assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), assessment_id UUID NOT NULL REFERENCES public.client_assessments(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES public.assessment_questions(id), question_key TEXT NOT NULL, value JSONB, section_snapshot JSONB,
  question_snapshot JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(assessment_id, question_key)
);
CREATE TABLE IF NOT EXISTS public.assessment_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), assessment_id UUID NOT NULL REFERENCES public.client_assessments(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES public.assessment_questions(id), question_key TEXT, uploaded_by UUID NOT NULL, file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL, file_type TEXT, file_size BIGINT CHECK (file_size IS NULL OR file_size >= 0), metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.assessment_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), assessment_id UUID NOT NULL REFERENCES public.client_assessments(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL, status TEXT NOT NULL DEFAULT 'pending', summary TEXT, missing_information TEXT,
  immediate_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb, medium_term_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
  long_term_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb, risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_next_action TEXT, internal_notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.assessment_information_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), assessment_id UUID NOT NULL REFERENCES public.client_assessments(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL, message TEXT NOT NULL, requested_question_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
  requested_section_keys JSONB NOT NULL DEFAULT '[]'::jsonb, required_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','answered','resolved','cancelled')), due_at TIMESTAMPTZ, resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.assessment_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), assessment_id UUID NOT NULL REFERENCES public.client_assessments(id) ON DELETE CASCADE,
  actor_id UUID, actor_type TEXT, event_type TEXT NOT NULL, metadata JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.client_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL, accepted_at TIMESTAMPTZ, revoked_at TIMESTAMPTZ,
  created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Preserve existing CLIENT accounts and make them resumable immediately. CRM
-- company/lead/deal links can be attached without replacing the client row.
INSERT INTO public.client_profiles(user_id)
SELECT id FROM public.users WHERE role='CLIENT'
ON CONFLICT(user_id) DO NOTHING;

ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_information_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE t TEXT; BEGIN FOREACH t IN ARRAY ARRAY['client_profiles','assessment_templates','assessment_sections','assessment_questions','assessment_question_options','client_assessments','assessment_answers','assessment_files','assessment_reviews','assessment_information_requests','assessment_activity','client_invitations'] LOOP
  EXECUTE format('DROP POLICY IF EXISTS assessment_admin_all ON public.%I', t);
  EXECUTE format('CREATE POLICY assessment_admin_all ON public.%I FOR ALL USING ((auth.jwt()->>''role'') IN (''ADMIN'',''CO_ADMIN'')) WITH CHECK ((auth.jwt()->>''role'') IN (''ADMIN'',''CO_ADMIN''))', t);
END LOOP; END $$;
DROP POLICY IF EXISTS assessment_client_profile_own ON public.client_profiles;
CREATE POLICY assessment_client_profile_own ON public.client_profiles FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS assessment_client_own ON public.client_assessments;
CREATE POLICY assessment_client_own ON public.client_assessments FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS assessment_client_update_draft ON public.client_assessments;
CREATE POLICY assessment_client_update_draft ON public.client_assessments FOR UPDATE USING (user_id = auth.uid() AND status IN ('not_started','draft','more_information_required')) WITH CHECK (user_id = auth.uid() AND status IN ('not_started','draft','more_information_required'));
DROP POLICY IF EXISTS assessment_answer_own ON public.assessment_answers;
CREATE POLICY assessment_answer_own ON public.assessment_answers FOR ALL USING (EXISTS (SELECT 1 FROM public.client_assessments a WHERE a.id=assessment_id AND a.user_id=auth.uid() AND a.status IN ('not_started','draft','more_information_required'))) WITH CHECK (EXISTS (SELECT 1 FROM public.client_assessments a WHERE a.id=assessment_id AND a.user_id=auth.uid() AND a.status IN ('not_started','draft','more_information_required')));
DROP POLICY IF EXISTS assessment_file_own ON public.assessment_files;
CREATE POLICY assessment_file_own ON public.assessment_files FOR SELECT USING (EXISTS (SELECT 1 FROM public.client_assessments a WHERE a.id=assessment_id AND a.user_id=auth.uid()));
DROP POLICY IF EXISTS assessment_request_own ON public.assessment_information_requests;
CREATE POLICY assessment_request_own ON public.assessment_information_requests FOR SELECT USING (EXISTS (SELECT 1 FROM public.client_assessments a WHERE a.id=assessment_id AND a.user_id=auth.uid()));

INSERT INTO public.assessment_templates(name,slug,description,version,status,published_at)
VALUES ('Business Discovery & Consulting Assessment','business-discovery-consulting','GrowXLabs authenticated client consulting assessment',1,'published',now())
ON CONFLICT(slug,version) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, status='published', published_at=COALESCE(assessment_templates.published_at,now()), updated_at=now();

WITH template AS (SELECT id FROM public.assessment_templates WHERE slug='business-discovery-consulting' AND version=1), seed(section_key,title,description,position,is_required) AS (VALUES
('company_profile','Company Profile','Establish the organisation, its leadership contact and operating footprint.',1,true),
('business_overview','Business Overview','Document how the organisation creates value and serves its markets.',2,true),
('ai_native_business_assessment','AI-Native Business Assessment','Identify where AI, automation and custom software can create measurable business value.',3,true),
('business_challenges','Business Challenges','Identify the commercial and operational constraints requiring attention.',4,false),
('technology_landscape','Current Technology Landscape','Create an inventory of systems currently supporting the business.',5,false),
('digital_presence','Digital Presence Assessment','Review owned, social and paid digital channels.',6,false),
('business_objectives','Business Objectives','Prioritise outcomes expected from this engagement.',7,true),
('project_scope','Project Scope','Define the services and capabilities required from GrowXLabs.',8,false),
('commercial_operations','Commercial & Operational Information','Align investment, timing, decision authority and operating model.',9,false),
('documents_assets','Documentation & Assets','Provide materials required for discovery and solution design.',10,false),
('project_readiness','Project Readiness Review','Confirm stakeholder, commercial and delivery readiness.',11,false),
('executive_declaration','Executive Declaration & Final Review','Review the assessment and formally authorise submission.',12,true))
INSERT INTO public.assessment_sections(template_id,section_key,title,description,position,is_required)
SELECT template.id,seed.* FROM template,seed ON CONFLICT(template_id,section_key) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,position=EXCLUDED.position,is_required=EXCLUDED.is_required,updated_at=now();

WITH template AS (SELECT id FROM public.assessment_templates WHERE slug='business-discovery-consulting' AND version=1), q(section_key,question_key,label,field_type,placeholder,help_text,position,is_required,validation) AS (VALUES
('company_profile','business_name','Business / Company Name','text',NULL,NULL,1,true,'{"minLength":2,"maxLength":160}'::jsonb),('company_profile','legal_entity_name','Legal Entity Name','text',NULL,NULL,2,false,'{}'),('company_profile','industry','Industry','text',NULL,NULL,3,false,'{}'),('company_profile','primary_contact','Primary Contact','text',NULL,NULL,4,true,'{"minLength":2}'),('company_profile','designation','Designation','text',NULL,NULL,5,false,'{}'),('company_profile','business_email','Business Email','email',NULL,NULL,6,true,'{}'),('company_profile','phone','Phone','phone',NULL,NULL,7,false,'{}'),('company_profile','website','Website','url',NULL,NULL,8,false,'{}'),('company_profile','headquarters','Headquarters','text',NULL,NULL,9,false,'{}'),('company_profile','operating_regions','Operating Regions','text',NULL,NULL,10,false,'{}'),('company_profile','employee_count','Number of Employees','number',NULL,NULL,11,false,'{"min":0}'),('company_profile','years_in_business','Years in Business','number',NULL,NULL,12,false,'{"min":0}'),
('business_overview','company_overview','Company Overview','textarea','Describe the organisation and what it does.',NULL,1,true,'{"minLength":30}'),('business_overview','products','Products','textarea',NULL,NULL,2,false,'{}'),('business_overview','services_overview','Services','textarea',NULL,NULL,3,false,'{}'),('business_overview','primary_customers','Primary Customers','textarea',NULL,NULL,4,false,'{}'),('business_overview','business_model','Business Model','textarea',NULL,NULL,5,false,'{}'),('business_overview','annual_revenue','Annual Revenue Range','single_select',NULL,NULL,6,false,'{}'),('business_overview','markets_served','Markets Served','textarea',NULL,NULL,7,false,'{}'),('business_overview','competitive_advantage','Competitive Advantage','textarea',NULL,NULL,8,false,'{}'),
('ai_native_business_assessment','ai_business_functions','Which business functions are part of your organisation?','multi_select',NULL,NULL,1,true,'{"minSelections":1}'),('ai_native_business_assessment','ai_process_maturity','How are most of your business activities managed today?','single_select',NULL,NULL,2,true,'{}'),('ai_native_business_assessment','ai_current_software','Which software and tools do you currently use?','multi_select',NULL,NULL,3,false,'{}'),('ai_native_business_assessment','ai_repetitive_work','Which repetitive activities consume the most time in your organisation?','textarea','Describe quotations, follow-ups, reporting, data entry, inventory updates, billing, customer support, approvals, or other repetitive work.',NULL,4,true,'{"minLength":30}'),('ai_native_business_assessment','ai_opportunities','Where would you like AI to assist your business?','multi_select',NULL,NULL,5,true,'{"minSelections":1}'),('ai_native_business_assessment','ai_services','Which AI-native solutions are you interested in exploring?','multi_select',NULL,'These selections are exploratory. Final recommendations will be prepared after business analysis and discovery.',6,false,'{}'),('ai_native_business_assessment','ai_current_usage','How does your organisation currently use AI?','single_select',NULL,NULL,7,true,'{}'),('ai_native_business_assessment','ai_data_locations','Where is your business information currently stored?','multi_select',NULL,NULL,8,false,'{}'),('ai_native_business_assessment','ai_concerns','Do you have any concerns about adopting AI?','multi_select',NULL,NULL,9,false,'{"conflictsWith":["no_concerns"]}'),('ai_native_business_assessment','ai_outcomes','What business outcomes do you expect from AI?','multi_select',NULL,NULL,10,true,'{"minSelections":1}'),('ai_native_business_assessment','ai_three_year_vision','Where do you want your business to be within the next three years?','textarea',NULL,NULL,11,true,'{"minLength":30}'),('ai_native_business_assessment','ai_priority_problem','If GrowXLabs could solve only one business problem for your organisation within the next 12 months, what would it be, and why is it your highest priority?','textarea',NULL,NULL,12,true,'{"minLength":40}'),
('business_challenges','challenges','Select the business challenges requiring attention.','multi_select',NULL,NULL,1,false,'{}'),('business_challenges','biggest_challenge','Describe your biggest business challenge.','textarea',NULL,NULL,2,false,'{}'),
('technology_landscape','technology_systems','Describe the website, CRM, ERP, inventory, accounting, hosting, analytics, email and integrations currently used.','textarea',NULL,NULL,1,false,'{}'),
('digital_presence','digital_presence_summary','Describe your website, Google Business Profile, social channels, analytics, advertising and SEO status.','textarea',NULL,NULL,1,false,'{}'),
('business_objectives','objectives','Select the primary business objectives.','multi_select',NULL,NULL,1,true,'{"minSelections":1}'),('business_objectives','objective_priority','Overall Priority','single_select',NULL,NULL,2,true,'{}'),
('project_scope','services','Select the services and capabilities to explore.','multi_select',NULL,NULL,1,false,'{}'),
('commercial_operations','budget','Estimated Investment','single_select',NULL,NULL,1,false,'{}'),('commercial_operations','timeline','Timeline','single_select',NULL,NULL,2,false,'{}'),('commercial_operations','decision_maker','Decision Maker','single_select',NULL,NULL,3,false,'{}'),('commercial_operations','operational_model','Describe the sales process, team, locations, network and internal workflow.','textarea',NULL,NULL,4,false,'{}'),
('documents_assets','discovery_documents','Discovery Documents','file_upload',NULL,'Upload only business discovery materials. Never upload passwords, OTPs, secrets, banking credentials or private keys.',1,false,'{"maxFileSize":26214400,"allowedMimeTypes":["application/pdf","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","image/png","image/jpeg","image/webp","video/mp4"]}'),
('project_readiness','readiness','Select all confirmed readiness items.','multi_select',NULL,NULL,1,false,'{}'),('project_readiness','additional_notes','Additional Notes','textarea',NULL,NULL,2,false,'{}'),('project_readiness','questions','Questions','textarea',NULL,NULL,3,false,'{}'),('project_readiness','dependencies','Dependencies','textarea',NULL,NULL,4,false,'{}'),
('executive_declaration','final_summary','Assessment Summary','summary',NULL,NULL,1,false,'{}'),('executive_declaration','signature_name','Digital Signature — Typed Full Name','signature',NULL,NULL,2,true,'{"minLength":2}'),('executive_declaration','signature_designation','Designation','text',NULL,NULL,3,true,'{}'),('executive_declaration','signature_company','Company Name','text',NULL,NULL,4,true,'{}'),('executive_declaration','assessment_date','Date','date',NULL,NULL,5,true,'{}'),('executive_declaration','consent','I confirm the information is accurate and consent to its processing for consulting purposes.','consent',NULL,NULL,6,true,'{}'))
INSERT INTO public.assessment_questions(section_id,question_key,label,field_type,placeholder,help_text,position,is_required,validation)
SELECT s.id,q.question_key,q.label,q.field_type,q.placeholder,q.help_text,q.position,q.is_required,q.validation FROM q JOIN template t ON true JOIN public.assessment_sections s ON s.template_id=t.id AND s.section_key=q.section_key
ON CONFLICT(section_id,question_key) DO UPDATE SET label=EXCLUDED.label,field_type=EXCLUDED.field_type,placeholder=EXCLUDED.placeholder,help_text=EXCLUDED.help_text,position=EXCLUDED.position,is_required=EXCLUDED.is_required,validation=EXCLUDED.validation,updated_at=now();

WITH option_seed(question_key, labels) AS (VALUES
('annual_revenue',ARRAY['Pre-revenue','Below ₹1 crore','₹1–5 crore','₹5–25 crore','₹25–100 crore','₹100 crore+']),
('ai_business_functions',ARRAY['Sales','Marketing','Customer Support','Operations','Finance','Accounting','Inventory','Procurement','Dealer Management','Distributor Management','Manufacturing','Human Resources','Recruitment','Reporting','Compliance','Project Management','Logistics','Other']),
('ai_process_maturity',ARRAY['Mostly Manual','Manual using Excel and WhatsApp','Partially Digital','Multiple Disconnected Systems','Mostly Integrated','Fully Digital']),
('ai_current_software',ARRAY['Excel','Google Sheets','WhatsApp','Email','Tally','CRM','ERP','Inventory Software','Accounting Software','Project Management Software','HRMS','Custom Software','Other']),
('ai_opportunities',ARRAY['Lead Qualification','Sales Follow-Up','Proposal Generation','Quotation Generation','Customer Support','Marketing Content','SEO','AEO','GEO','Reporting','Business Analytics','Inventory Planning','Workflow Automation','Internal Knowledge Search','AI Agents','Decision Support','Other']),
('ai_services',ARRAY['AI-Native Website','AI CRM','AI Dealer Management','AI Distributor Management','AI Inventory Management','AI Sales Assistant','AI Customer Support Assistant','AI Workflow Automation','AI Reporting Dashboard','AI Knowledge Base','AI Agent Workspace','Custom AI Software','Custom Business Software','Unsure — Need Consulting Recommendation']),
('ai_current_usage',ARRAY['Never Used AI','Occasionally','Daily','Team Uses AI','Already Have AI Systems']),
('ai_data_locations',ARRAY['Excel','Google Sheets','Tally','CRM','ERP','Inventory Software','Email','WhatsApp','Paper Records','Cloud Storage','Database','Other']),
('ai_concerns',ARRAY['Security','Privacy','Cost','Accuracy','Employee Adoption','Integration','Compliance','No Concerns','Other']),
('ai_outcomes',ARRAY['Increase Revenue','Generate More Leads','Reduce Costs','Save Employee Time','Improve Customer Experience','Improve Sales Conversion','Better Reporting','Better Decision-Making','Improve Productivity','Scale Business','Reduce Manual Work','Other']),
('challenges',ARRAY['Lead Generation','Branding','Website','CRM','Sales','Inventory','Distribution','Dealer Network','Marketing','SEO','Operations','Reporting','Customer Experience','Automation','Other']),
('objectives',ARRAY['Increase Revenue','Generate More Leads','Expand Distribution','Launch New Products','Improve Operations','Reduce Manual Work','Improve Customer Experience','Digital Transformation','Improve Brand Position']),
('objective_priority',ARRAY['High','Medium','Low']),('services',ARRAY['Website','Branding','CRM','Custom Software','Dealer Management','Distributor Management','Inventory','ERP','Automation','SEO','AEO','GEO','Google Ads','Meta Ads','Video Marketing','Analytics','Training','Support']),
('budget',ARRAY['Below ₹5 lakh','₹5–10 lakh','₹10–25 lakh','₹25 lakh+']),('timeline',ARRAY['Immediate','30 Days','60 Days','90 Days','Planning Stage']),('decision_maker',ARRAY['Owner','CEO','Director','Marketing Head','Operations Head','IT Head']),
('readiness',ARRAY['Business Goals Defined','Stakeholders Identified','Budget Approved','Timeline Confirmed','Assets Ready','Decision Makers Confirmed'])
), expanded AS (SELECT question_key,label,ordinality::int position FROM option_seed CROSS JOIN LATERAL unnest(labels) WITH ORDINALITY AS u(label,ordinality))
INSERT INTO public.assessment_question_options(question_id,label,value,position)
SELECT q.id,e.label,lower(regexp_replace(regexp_replace(e.label,'[^a-zA-Z0-9]+','_','g'),'^_|_$','','g')),e.position FROM expanded e JOIN public.assessment_questions q ON q.question_key=e.question_key
ON CONFLICT(question_id,value) DO UPDATE SET label=EXCLUDED.label,position=EXCLUDED.position,updated_at=now();

CREATE OR REPLACE FUNCTION public.start_client_assessment(p_user_id UUID,p_client_id UUID,p_company_id UUID,p_lead_id UUID,p_deal_id UUID,p_template_id UUID,p_template_version INTEGER,p_template_snapshot JSONB)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE v_id UUID; BEGIN
  SELECT id INTO v_id FROM client_assessments WHERE client_id=p_client_id AND template_id=p_template_id AND template_version=p_template_version AND status<>'archived' FOR UPDATE;
  IF v_id IS NULL THEN
    INSERT INTO client_assessments(template_id,template_version,user_id,client_id,company_id,lead_id,deal_id,status,current_section,template_snapshot,started_at)
    VALUES(p_template_id,p_template_version,p_user_id,p_client_id,p_company_id,p_lead_id,p_deal_id,'draft',1,p_template_snapshot,now()) RETURNING id INTO v_id;
    INSERT INTO assessment_activity(assessment_id,actor_id,actor_type,event_type) VALUES(v_id,p_user_id,'client','assessment_created'),(v_id,p_user_id,'client','assessment_started');
  END IF;
  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.save_client_assessment_draft(p_assessment_id UUID,p_user_id UUID,p_answers JSONB,p_current_section INTEGER,p_completed_sections JSONB,p_completion_percentage INTEGER)
RETURNS TIMESTAMPTZ LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE v_now TIMESTAMPTZ:=now(); v_item JSONB; BEGIN
  IF NOT EXISTS(SELECT 1 FROM client_assessments WHERE id=p_assessment_id AND user_id=p_user_id AND status IN('not_started','draft','more_information_required') FOR UPDATE) THEN RAISE EXCEPTION 'Assessment is unavailable or locked'; END IF;
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_answers) LOOP
    INSERT INTO assessment_answers(assessment_id,question_id,question_key,value,section_snapshot,question_snapshot,updated_at)
    VALUES(p_assessment_id,NULL,v_item->>'questionKey',v_item->'value',v_item->'sectionSnapshot',v_item->'questionSnapshot',v_now)
    ON CONFLICT(assessment_id,question_key) DO UPDATE SET value=EXCLUDED.value,section_snapshot=EXCLUDED.section_snapshot,question_snapshot=EXCLUDED.question_snapshot,updated_at=v_now;
  END LOOP;
  UPDATE client_assessments SET status=CASE WHEN status='not_started' THEN 'draft' ELSE status END,current_section=p_current_section,completed_sections=p_completed_sections,completion_percentage=p_completion_percentage,updated_at=v_now WHERE id=p_assessment_id;
  INSERT INTO assessment_activity(assessment_id,actor_id,actor_type,event_type,metadata) VALUES(p_assessment_id,p_user_id,'client','draft_saved',jsonb_build_object('currentSection',p_current_section,'completionPercentage',p_completion_percentage));
  RETURN v_now;
END $$;

CREATE OR REPLACE FUNCTION public.submit_client_assessment(p_assessment_id UUID,p_user_id UUID)
RETURNS TIMESTAMPTZ LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE v_now TIMESTAMPTZ:=now(); v_deal UUID; v_stage UUID; BEGIN
  SELECT deal_id INTO v_deal FROM client_assessments WHERE id=p_assessment_id AND user_id=p_user_id AND status IN('not_started','draft','more_information_required') FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Assessment is unavailable or locked'; END IF;
  UPDATE client_assessments SET status='submitted',submitted_at=v_now,completion_percentage=100,updated_at=v_now WHERE id=p_assessment_id;
  INSERT INTO assessment_activity(assessment_id,actor_id,actor_type,event_type) VALUES(p_assessment_id,p_user_id,'client','assessment_submitted');
  INSERT INTO assessment_reviews(assessment_id,reviewer_id,status) VALUES(p_assessment_id,'00000000-0000-0000-0000-000000000000','pending') ON CONFLICT DO NOTHING;
  IF v_deal IS NOT NULL THEN SELECT id INTO v_stage FROM deal_stages WHERE lower(name)=lower('Assessment Received') LIMIT 1; IF v_stage IS NOT NULL THEN UPDATE deals SET stage_id=v_stage,updated_at=v_now WHERE id=v_deal; END IF; END IF;
  RETURN v_now;
END $$;

CREATE OR REPLACE FUNCTION public.transition_assessment_review(p_assessment_id UUID,p_reviewer_id UUID,p_action TEXT,p_payload JSONB DEFAULT '{}'::jsonb)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
  PERFORM 1 FROM client_assessments WHERE id=p_assessment_id FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'Assessment not found'; END IF;
  IF p_action='start_review' THEN
    UPDATE client_assessments SET status='under_review',review_started_at=COALESCE(review_started_at,now()),updated_at=now() WHERE id=p_assessment_id AND status IN('submitted','under_review');
    INSERT INTO assessment_reviews(assessment_id,reviewer_id,status) VALUES(p_assessment_id,p_reviewer_id,'in_progress');
    INSERT INTO assessment_activity(assessment_id,actor_id,actor_type,event_type) VALUES(p_assessment_id,p_reviewer_id,'admin','review_started');
  ELSIF p_action='request_information' THEN
    INSERT INTO assessment_information_requests(assessment_id,requested_by,message,requested_question_keys,requested_section_keys,required_files,due_at) VALUES(p_assessment_id,p_reviewer_id,p_payload->>'message',COALESCE(p_payload->'questionKeys','[]'),COALESCE(p_payload->'sectionKeys','[]'),COALESCE(p_payload->'requiredFiles','[]'),(p_payload->>'dueAt')::timestamptz);
    UPDATE client_assessments SET status='more_information_required',reopened_at=now(),updated_at=now() WHERE id=p_assessment_id;
    INSERT INTO assessment_activity(assessment_id,actor_id,actor_type,event_type,metadata) VALUES(p_assessment_id,p_reviewer_id,'admin','information_requested',p_payload);
  ELSIF p_action='complete_review' THEN
    UPDATE assessment_reviews SET status='complete',summary=p_payload->>'summary',missing_information=p_payload->>'missingInformation',immediate_opportunities=COALESCE(p_payload->'immediateOpportunities','[]'),medium_term_opportunities=COALESCE(p_payload->'mediumTermOpportunities','[]'),long_term_opportunities=COALESCE(p_payload->'longTermOpportunities','[]'),risks=COALESCE(p_payload->'risks','[]'),recommended_next_action=p_payload->>'recommendedNextAction',internal_notes=p_payload->>'internalNotes',updated_at=now() WHERE id=(SELECT id FROM assessment_reviews WHERE assessment_id=p_assessment_id ORDER BY created_at DESC LIMIT 1);
    UPDATE client_assessments SET status='review_complete',reviewed_at=now(),updated_at=now() WHERE id=p_assessment_id;
    INSERT INTO assessment_activity(assessment_id,actor_id,actor_type,event_type) VALUES(p_assessment_id,p_reviewer_id,'admin','review_completed');
  ELSIF p_action='reopen' THEN
    UPDATE client_assessments SET status='more_information_required',reopened_at=now(),updated_at=now() WHERE id=p_assessment_id;
    INSERT INTO assessment_activity(assessment_id,actor_id,actor_type,event_type,metadata) VALUES(p_assessment_id,p_reviewer_id,'admin','assessment_reopened',p_payload);
  ELSE RAISE EXCEPTION 'Unsupported review action'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.create_client_invitation(p_email TEXT,p_name TEXT,p_password_hash TEXT,p_company_id UUID,p_lead_id UUID,p_deal_id UUID,p_token_hash TEXT,p_expires_at TIMESTAMPTZ,p_created_by UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE v_user UUID; v_client UUID; BEGIN
  SELECT id INTO v_user FROM users WHERE lower(email)=lower(p_email) FOR UPDATE;
  IF v_user IS NULL THEN INSERT INTO users(name,email,password,role) VALUES(p_name,lower(p_email),p_password_hash,'CLIENT') RETURNING id INTO v_user;
  ELSIF NOT EXISTS(SELECT 1 FROM users WHERE id=v_user AND role='CLIENT') THEN RAISE EXCEPTION 'Email belongs to a non-client account'; END IF;
  INSERT INTO client_profiles(user_id,company_id,lead_id,deal_id) VALUES(v_user,p_company_id,p_lead_id,p_deal_id) ON CONFLICT(user_id) DO UPDATE SET company_id=COALESCE(EXCLUDED.company_id,client_profiles.company_id),lead_id=COALESCE(EXCLUDED.lead_id,client_profiles.lead_id),deal_id=COALESCE(EXCLUDED.deal_id,client_profiles.deal_id),updated_at=now() RETURNING id INTO v_client;
  UPDATE client_invitations SET revoked_at=now() WHERE client_id=v_client AND accepted_at IS NULL AND revoked_at IS NULL;
  INSERT INTO client_invitations(client_id,email,token_hash,expires_at,created_by) VALUES(v_client,lower(p_email),p_token_hash,p_expires_at,p_created_by);
  RETURN v_client;
END $$;

CREATE OR REPLACE FUNCTION public.accept_client_invitation(p_token_hash TEXT,p_password_hash TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE v_inv client_invitations%ROWTYPE; v_user UUID; BEGIN
  SELECT * INTO v_inv FROM client_invitations WHERE token_hash=p_token_hash FOR UPDATE;
  IF NOT FOUND OR v_inv.accepted_at IS NOT NULL OR v_inv.revoked_at IS NOT NULL OR v_inv.expires_at<=now() THEN RAISE EXCEPTION 'Invitation is invalid or expired'; END IF;
  SELECT user_id INTO v_user FROM client_profiles WHERE id=v_inv.client_id; UPDATE users SET password=p_password_hash,updated_at=now() WHERE id=v_user AND role='CLIENT';
  UPDATE client_invitations SET accepted_at=now() WHERE id=v_inv.id; RETURN v_inv.email;
END $$;

REVOKE ALL ON FUNCTION public.start_client_assessment(UUID,UUID,UUID,UUID,UUID,UUID,INTEGER,JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_client_assessment_draft(UUID,UUID,JSONB,INTEGER,JSONB,INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_client_assessment(UUID,UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_client_assessment(UUID,UUID,UUID,UUID,UUID,UUID,INTEGER,JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.save_client_assessment_draft(UUID,UUID,JSONB,INTEGER,JSONB,INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.submit_client_assessment(UUID,UUID) TO service_role;
REVOKE ALL ON FUNCTION public.transition_assessment_review(UUID,UUID,TEXT,JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_assessment_review(UUID,UUID,TEXT,JSONB) TO service_role;
REVOKE ALL ON FUNCTION public.create_client_invitation(TEXT,TEXT,TEXT,UUID,UUID,UUID,TEXT,TIMESTAMPTZ,UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.accept_client_invitation(TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_client_invitation(TEXT,TEXT,TEXT,UUID,UUID,UUID,TEXT,TIMESTAMPTZ,UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.accept_client_invitation(TEXT,TEXT) TO service_role;

COMMIT;
