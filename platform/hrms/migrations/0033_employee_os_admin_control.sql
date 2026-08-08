BEGIN;

INSERT INTO identity.permissions(key,description) VALUES
('sales.team.view','View scoped employee sales operations'),
('sales.assignment.manage','Assign and reassign CRM prospects'),
('sales.qualification.review','Review employee qualification quality'),
('sales.discovery.manage','Manage discovery ownership and participants'),
('sales.handoff.review','Accept handoffs or request clarification'),
('employee.access.manage','Activate or suspend Employee OS access')
ON CONFLICT(key) DO NOTHING;

-- Existing organisation administrator bundles receive the control capabilities.
-- Manager bundles remain explicit so a manager is never granted organisation scope by title alone.
INSERT INTO identity.role_permissions(organisation_id,role_id,permission_id)
SELECT r.organisation_id,r.id,p.id FROM identity.roles r CROSS JOIN identity.permissions p
WHERE lower(r.name) IN ('admin','administrator','organisation admin','organization admin','owner')
  AND p.key IN ('sales.team.view','sales.assignment.manage','sales.qualification.review','sales.discovery.manage','sales.handoff.review','employee.access.manage')
ON CONFLICT DO NOTHING;

ALTER TABLE public.lead_assignment_history ADD COLUMN IF NOT EXISTS assignment_note text;
ALTER TABLE public.lead_assignment_history ADD COLUMN IF NOT EXISTS initial_due_at timestamptz;
ALTER TABLE public.lead_qualifications ADD COLUMN IF NOT EXISTS review_state text NOT NULL DEFAULT 'draft'
  CHECK(review_state IN ('draft','ready_for_review','needs_clarification','approved'));
ALTER TABLE public.lead_qualifications ADD COLUMN IF NOT EXISTS manager_feedback text;
ALTER TABLE public.lead_qualifications ADD COLUMN IF NOT EXISTS reviewed_by uuid;
ALTER TABLE public.lead_qualifications ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE public.sales_discovery_schedules ADD COLUMN IF NOT EXISTS internal_owner_employee_id uuid REFERENCES people.employees(id);
ALTER TABLE public.sales_handoffs ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'awaiting_review'
  CHECK(review_status IN ('awaiting_review','accepted','needs_clarification'));
ALTER TABLE public.sales_handoffs ADD COLUMN IF NOT EXISTS internal_owner_employee_id uuid REFERENCES people.employees(id);
ALTER TABLE public.sales_handoffs ADD COLUMN IF NOT EXISTS commercial_owner_user_id uuid;
ALTER TABLE public.sales_handoffs ADD COLUMN IF NOT EXISTS clarification_request text;
ALTER TABLE public.sales_handoffs ADD COLUMN IF NOT EXISTS reviewed_by uuid;
ALTER TABLE public.sales_handoffs ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

CREATE TABLE IF NOT EXISTS public.sales_management_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id text NOT NULL,
  employee_id uuid NOT NULL REFERENCES people.employees(id), lead_id uuid REFERENCES public.leads(id),
  handoff_id uuid REFERENCES public.sales_handoffs(id), feedback_type text NOT NULL CHECK(feedback_type IN ('qualification','handoff')),
  message text NOT NULL, created_by uuid NOT NULL, resolved_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sales_management_feedback_work_idx ON public.sales_management_feedback(organisation_id,employee_id,resolved_at,created_at DESC);
ALTER TABLE public.sales_management_feedback ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.admin_assign_sales_leads(
  p_organisation_id text,p_lead_ids uuid[],p_employee_id uuid,p_actor_user_id uuid,p_priority text DEFAULT NULL,
  p_assignment_note text DEFAULT NULL,p_initial_due_at timestamptz DEFAULT NULL
) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,identity,people,notifications AS $$
DECLARE v_user_id uuid;v_lead uuid;v_previous uuid;v_count integer:=0;v_now timestamptz:=now();
BEGIN
  IF cardinality(p_lead_ids)<1 OR cardinality(p_lead_ids)>100 THEN RAISE EXCEPTION 'Select between 1 and 100 prospects'; END IF;
  SELECT e.user_id INTO v_user_id FROM people.employees e JOIN people.employment_records er ON er.employee_id=e.id AND er.organisation_id=e.organisation_id AND er.valid_to IS NULL
  WHERE e.id=p_employee_id AND e.organisation_id::text=p_organisation_id AND e.deleted_at IS NULL AND er.status IN ('active','probation','notice');
  IF v_user_id IS NULL OR NOT EXISTS(SELECT 1 FROM identity.user_roles ur JOIN identity.role_permissions rp ON rp.role_id=ur.role_id JOIN identity.permissions p ON p.id=rp.permission_id WHERE ur.user_id=v_user_id AND ur.organisation_id::text=p_organisation_id AND p.key='sales.workspace') THEN RAISE EXCEPTION 'Employee is not an active sales workspace user'; END IF;
  FOREACH v_lead IN ARRAY p_lead_ids LOOP
    SELECT assigned_employee_id INTO v_previous FROM public.leads WHERE id=v_lead AND organisation_id=p_organisation_id AND deleted_at IS NULL FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Prospect is not assignable'; END IF;
    IF v_previous IS NOT DISTINCT FROM p_employee_id THEN
      UPDATE public.leads SET priority=COALESCE(p_priority,priority),updated_at=v_now WHERE id=v_lead;
      CONTINUE;
    END IF;
    UPDATE public.lead_assignment_history SET ended_at=v_now WHERE organisation_id=p_organisation_id AND lead_id=v_lead AND ended_at IS NULL;
    UPDATE public.leads SET assigned_employee_id=p_employee_id,assigned_at=v_now,priority=COALESCE(p_priority,priority),updated_at=v_now WHERE id=v_lead AND organisation_id=p_organisation_id;
    INSERT INTO public.lead_assignment_history(organisation_id,lead_id,previous_employee_id,assigned_employee_id,assigned_by,assigned_at,assignment_note,initial_due_at) VALUES(p_organisation_id,v_lead,v_previous,p_employee_id,p_actor_user_id,v_now,NULLIF(btrim(p_assignment_note),''),p_initial_due_at);
    IF p_initial_due_at IS NOT NULL THEN INSERT INTO public.sales_followups(organisation_id,lead_id,assigned_employee_id,created_by_employee_id,context,due_at,priority) VALUES(p_organisation_id,v_lead,p_employee_id,p_employee_id,COALESCE(NULLIF(btrim(p_assignment_note),''),'Initial assigned prospect review'),p_initial_due_at,COALESCE(p_priority,'medium')); END IF;
    INSERT INTO notifications.notifications(organisation_id,recipient_user_id,template_key,payload) VALUES(p_organisation_id,v_user_id,'sales_lead_assigned',jsonb_build_object('title','New prospect assigned','message',COALESCE(NULLIF(btrim(p_assignment_note),''),'A prospect has been assigned to you.'),'href','/workspace/sales/leads/'||v_lead,'eventKey','lead-assignment:'||v_lead||':'||v_now));
    v_count:=v_count+1;
  END LOOP;RETURN v_count;
END $$;

CREATE OR REPLACE FUNCTION public.admin_review_sales_handoff(p_organisation_id text,p_handoff_id uuid,p_actor_user_id uuid,p_action text,p_internal_owner_employee_id uuid DEFAULT NULL,p_message text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,notifications,people AS $$
DECLARE h public.sales_handoffs%ROWTYPE;v_employee uuid;v_user uuid;
BEGIN
  SELECT * INTO h FROM public.sales_handoffs WHERE id=p_handoff_id AND organisation_id=p_organisation_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Handoff not found'; END IF;
  IF p_action='accept' AND h.review_status='accepted' AND h.internal_owner_employee_id IS NOT DISTINCT FROM p_internal_owner_employee_id THEN
    RETURN jsonb_build_object('handoffId',p_handoff_id,'status','accepted');
  END IF;
  IF p_action='accept' THEN
    IF p_internal_owner_employee_id IS NULL THEN RAISE EXCEPTION 'Internal owner is required'; END IF;
    IF NOT EXISTS(SELECT 1 FROM people.employees WHERE id=p_internal_owner_employee_id AND organisation_id::text=p_organisation_id AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Internal owner not found'; END IF;
    UPDATE public.sales_handoffs SET review_status='accepted',internal_owner_employee_id=p_internal_owner_employee_id,commercial_owner_user_id=p_actor_user_id,clarification_request=NULL,reviewed_by=p_actor_user_id,reviewed_at=now() WHERE id=p_handoff_id;
  ELSIF p_action='request_clarification' THEN
    IF NULLIF(btrim(p_message),'') IS NULL THEN RAISE EXCEPTION 'Clarification context is required'; END IF;
    UPDATE public.sales_handoffs SET review_status='needs_clarification',clarification_request=btrim(p_message),reviewed_by=p_actor_user_id,reviewed_at=now() WHERE id=p_handoff_id;
    SELECT handed_off_by_employee_id INTO v_employee FROM public.sales_handoffs WHERE id=p_handoff_id;
    SELECT user_id INTO v_user FROM people.employees WHERE id=v_employee;
    INSERT INTO public.sales_management_feedback(organisation_id,employee_id,lead_id,handoff_id,feedback_type,message,created_by) VALUES(p_organisation_id,v_employee,h.lead_id,p_handoff_id,'handoff',btrim(p_message),p_actor_user_id);
    INSERT INTO notifications.notifications(organisation_id,recipient_user_id,template_key,payload) VALUES(p_organisation_id,v_user,'sales_handoff_clarification',jsonb_build_object('title','Handoff needs clarification','message',btrim(p_message),'href','/workspace/sales/opportunities/'||h.opportunity_id,'eventKey','handoff-clarification:'||p_handoff_id||':'||now()));
  ELSE RAISE EXCEPTION 'Invalid handoff action'; END IF;
  RETURN jsonb_build_object('handoffId',p_handoff_id,'status',CASE WHEN p_action='accept' THEN 'accepted' ELSE 'needs_clarification' END);
END $$;

REVOKE ALL ON FUNCTION public.admin_assign_sales_leads(text,uuid[],uuid,uuid,text,text,timestamptz) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.admin_review_sales_handoff(text,uuid,uuid,text,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_assign_sales_leads(text,uuid[],uuid,uuid,text,text,timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_review_sales_handoff(text,uuid,uuid,text,uuid,text) TO service_role;
COMMIT;
