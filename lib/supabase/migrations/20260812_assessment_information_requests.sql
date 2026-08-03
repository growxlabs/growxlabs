BEGIN;

ALTER TABLE public.assessment_information_requests
  ADD COLUMN IF NOT EXISTS request_number TEXT,
  ADD COLUMN IF NOT EXISTS client_id UUID,
  ADD COLUMN IF NOT EXISTS company_id UUID,
  ADD COLUMN IF NOT EXISTS general_message TEXT;
ALTER TABLE public.assessment_information_requests DROP CONSTRAINT IF EXISTS assessment_information_requests_status_check;
ALTER TABLE public.assessment_information_requests ADD CONSTRAINT assessment_information_requests_status_check CHECK (status IN ('draft','sent','in_progress','submitted','under_review','partially_accepted','changes_required','resolved','cancelled','open','answered'));
CREATE UNIQUE INDEX IF NOT EXISTS assessment_information_requests_number_uq ON public.assessment_information_requests(request_number) WHERE request_number IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.assessment_information_request_items (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), request_id UUID NOT NULL REFERENCES public.assessment_information_requests(id) ON DELETE CASCADE,
 section_id UUID, section_key TEXT, question_id UUID, question_key TEXT, item_type TEXT NOT NULL CHECK(item_type IN ('question','section','document','custom_information')),
 reason TEXT NOT NULL, instruction TEXT, is_required BOOLEAN NOT NULL DEFAULT true, allow_file_upload BOOLEAN NOT NULL DEFAULT false,
 due_at TIMESTAMPTZ, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','submitted','accepted','rejected','changes_required','waived')),
 original_answer_snapshot JSONB, question_snapshot JSONB NOT NULL DEFAULT '{}', position INTEGER NOT NULL DEFAULT 1, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(request_id,question_key,item_type)
);
CREATE TABLE IF NOT EXISTS public.assessment_information_responses (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), request_item_id UUID NOT NULL REFERENCES public.assessment_information_request_items(id) ON DELETE CASCADE,
 assessment_id UUID NOT NULL REFERENCES public.client_assessments(id) ON DELETE CASCADE, submitted_by UUID NOT NULL, submitted_by_type TEXT NOT NULL CHECK(submitted_by_type IN ('client','admin','consultant')),
 proposed_value JSONB, supporting_note TEXT, source_type TEXT, source_date TIMESTAMPTZ, status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','accepted','rejected','changes_required')),
 submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(), reviewed_by UUID, reviewed_at TIMESTAMPTZ, review_note TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS assessment_information_responses_item_uq ON public.assessment_information_responses(request_item_id);
CREATE TABLE IF NOT EXISTS public.assessment_answer_revisions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), assessment_id UUID NOT NULL REFERENCES public.client_assessments(id) ON DELETE CASCADE, question_id UUID, question_key TEXT NOT NULL,
 revision_number INTEGER NOT NULL, previous_value JSONB, new_value JSONB, change_source TEXT NOT NULL, information_request_id UUID, information_response_id UUID,
 changed_by UUID NOT NULL, approved_by UUID, client_confirmed_by UUID, client_confirmed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(assessment_id,question_key,revision_number)
);
CREATE OR REPLACE FUNCTION public.create_assessment_information_request(p_assessment_id UUID,p_requested_by UUID,p_message TEXT,p_items JSONB,p_due_at TIMESTAMPTZ DEFAULT NULL)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_request UUID; v_item JSONB; v_client UUID; v_company UUID; v_number TEXT;
BEGIN
 SELECT client_id,company_id INTO v_client,v_company FROM client_assessments WHERE id=p_assessment_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Assessment not found'; END IF;
 v_number:=generate_business_document_number('assessment_information_request','GXL-INF');
 INSERT INTO assessment_information_requests(request_number,assessment_id,client_id,company_id,requested_by,message,general_message,requested_question_keys,requested_section_keys,status,due_at,sent_at)
 VALUES(v_number,p_assessment_id,v_client,v_company,p_requested_by,COALESCE(p_message,''),p_message,COALESCE((SELECT jsonb_agg(value->>'questionKey') FROM jsonb_array_elements(p_items) WHERE value->>'questionKey' IS NOT NULL),'[]'),COALESCE((SELECT jsonb_agg(value->>'sectionKey') FROM jsonb_array_elements(p_items) WHERE value->>'sectionKey' IS NOT NULL),'[]'),'sent',p_due_at,now()) RETURNING id INTO v_request;
 FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
   INSERT INTO assessment_information_request_items(request_id,section_id,section_key,question_id,question_key,item_type,reason,instruction,is_required,allow_file_upload,due_at,original_answer_snapshot,question_snapshot,position)
   VALUES(v_request,NULL,v_item->>'sectionKey',NULL,v_item->>'questionKey',COALESCE(v_item->>'itemType','question'),COALESCE(v_item->>'reason','Additional Detail Required'),v_item->>'instruction',COALESCE((v_item->>'isRequired')::boolean,true),COALESCE((v_item->>'allowFileUpload')::boolean,false),p_due_at,v_item->'originalAnswer',COALESCE(v_item->'questionSnapshot','{}'),COALESCE((v_item->>'position')::int,1));
 END LOOP;
 UPDATE client_assessments SET status='more_information_required',reopened_at=now(),updated_at=now() WHERE id=p_assessment_id;
 INSERT INTO assessment_activity(assessment_id,actor_id,actor_type,event_type,metadata) VALUES(p_assessment_id,p_requested_by,'admin','information_requested',jsonb_build_object('requestId',v_request,'requestNumber',v_number));
 RETURN v_request;
END $$;
CREATE OR REPLACE FUNCTION public.review_assessment_information_response(p_response_id UUID,p_reviewer UUID,p_decision TEXT,p_note TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_response assessment_information_responses%ROWTYPE; v_item assessment_information_request_items%ROWTYPE; v_previous JSONB; v_revision INTEGER;
BEGIN
 IF p_decision NOT IN ('accepted','rejected','changes_required') THEN RAISE EXCEPTION 'Unsupported response decision'; END IF;
 SELECT * INTO v_response FROM assessment_information_responses WHERE id=p_response_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Response not found'; END IF;
 SELECT * INTO v_item FROM assessment_information_request_items WHERE id=v_response.request_item_id FOR UPDATE;
 IF p_decision='accepted' AND v_item.question_key IS NOT NULL THEN
   SELECT value INTO v_previous FROM assessment_answers WHERE assessment_id=v_response.assessment_id AND question_key=v_item.question_key FOR UPDATE;
   SELECT COALESCE(MAX(revision_number),0)+1 INTO v_revision FROM assessment_answer_revisions WHERE assessment_id=v_response.assessment_id AND question_key=v_item.question_key;
   INSERT INTO assessment_answer_revisions(assessment_id,question_id,question_key,revision_number,previous_value,new_value,change_source,information_request_id,information_response_id,changed_by,approved_by)
   VALUES(v_response.assessment_id,v_item.question_id,v_item.question_key,v_revision,v_previous,v_response.proposed_value,'client_information_request',v_item.request_id,v_response.id,v_response.submitted_by,p_reviewer);
   INSERT INTO assessment_answers(assessment_id,question_id,question_key,value,question_snapshot,updated_at)
   VALUES(v_response.assessment_id,v_item.question_id,v_item.question_key,v_response.proposed_value,v_item.question_snapshot,now())
   ON CONFLICT(assessment_id,question_key) DO UPDATE SET value=EXCLUDED.value,question_snapshot=EXCLUDED.question_snapshot,updated_at=now();
 END IF;
 UPDATE assessment_information_responses SET status=p_decision,reviewed_by=p_reviewer,reviewed_at=now(),review_note=p_note,updated_at=now() WHERE id=p_response_id;
 UPDATE assessment_information_request_items SET status=p_decision,updated_at=now() WHERE id=v_item.id;
 INSERT INTO assessment_activity(assessment_id,actor_id,actor_type,event_type,metadata) VALUES(v_response.assessment_id,p_reviewer,'admin','information_response_reviewed',jsonb_build_object('responseId',p_response_id,'decision',p_decision));
END $$;
ALTER TABLE public.assessment_information_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_information_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answer_revisions ENABLE ROW LEVEL SECURITY;
COMMIT;
