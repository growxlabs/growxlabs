BEGIN;

CREATE TABLE IF NOT EXISTS public.sales_followup_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id text NOT NULL,
  followup_id uuid NOT NULL REFERENCES public.sales_followups(id), lead_id uuid NOT NULL REFERENCES public.leads(id),
  employee_id uuid NOT NULL REFERENCES people.employees(id), event_type text NOT NULL CHECK(event_type IN ('rescheduled','completed','cancelled')),
  previous_due_at timestamptz, new_due_at timestamptz, outcome text, notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sales_followup_events_history_idx ON public.sales_followup_events(organisation_id,followup_id,created_at DESC);

ALTER TABLE public.sales_discovery_schedules ADD COLUMN IF NOT EXISTS prepared_at timestamptz;
ALTER TABLE public.sales_discovery_schedules ADD COLUMN IF NOT EXISTS preparation_notes text;
ALTER TABLE public.sales_discovery_schedules ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.sales_discovery_schedules ADD COLUMN IF NOT EXISTS outcome text;
ALTER TABLE public.sales_discovery_schedules ADD COLUMN IF NOT EXISTS key_points text;
ALTER TABLE public.sales_discovery_schedules ADD COLUMN IF NOT EXISTS next_step text;
ALTER TABLE public.sales_discovery_schedules ADD COLUMN IF NOT EXISTS attended_by_employee_ids uuid[] NOT NULL DEFAULT '{}';

CREATE UNIQUE INDEX IF NOT EXISTS employee_notification_event_uq
  ON notifications.notifications(organisation_id,recipient_user_id,template_key,((payload->>'eventKey')))
  WHERE payload ? 'eventKey';

ALTER TABLE public.sales_followup_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.complete_employee_sales_followup(
  p_organisation_id text, p_followup_id uuid, p_employee_id uuid, p_outcome text,
  p_notes text, p_next_followup_at timestamptz DEFAULT NULL, p_next_context text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE current_followup public.sales_followups%ROWTYPE; activity_id uuid; next_id uuid;
BEGIN
  SELECT * INTO current_followup FROM public.sales_followups
  WHERE id=p_followup_id AND organisation_id=p_organisation_id AND assigned_employee_id=p_employee_id AND status='open' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'follow-up not found'; END IF;
  INSERT INTO public.sales_activities(organisation_id,lead_id,employee_id,activity_type,outcome,notes,next_action)
  VALUES(p_organisation_id,current_followup.lead_id,p_employee_id,'call',p_outcome,COALESCE(NULLIF(btrim(p_notes),''),p_outcome),CASE WHEN p_next_followup_at IS NULL THEN NULL ELSE 'Follow-up scheduled' END)
  RETURNING id INTO activity_id;
  UPDATE public.sales_followups SET status='completed',completed_at=now(),updated_at=now() WHERE id=p_followup_id;
  INSERT INTO public.sales_followup_events(organisation_id,followup_id,lead_id,employee_id,event_type,previous_due_at,outcome,notes)
  VALUES(p_organisation_id,p_followup_id,current_followup.lead_id,p_employee_id,'completed',current_followup.due_at,p_outcome,p_notes);
  IF p_next_followup_at IS NOT NULL THEN
    INSERT INTO public.sales_followups(organisation_id,lead_id,assigned_employee_id,created_by_employee_id,context,due_at,priority)
    VALUES(p_organisation_id,current_followup.lead_id,p_employee_id,p_employee_id,COALESCE(NULLIF(btrim(p_next_context),''),current_followup.context),p_next_followup_at,current_followup.priority)
    RETURNING id INTO next_id;
  END IF;
  RETURN jsonb_build_object('followupId',p_followup_id,'activityId',activity_id,'nextFollowupId',next_id);
END $$;
REVOKE ALL ON FUNCTION public.complete_employee_sales_followup(text,uuid,uuid,text,text,timestamptz,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_employee_sales_followup(text,uuid,uuid,text,text,timestamptz,text) TO service_role;
COMMIT;
