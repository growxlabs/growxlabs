BEGIN;

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS organisation_id text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS workspace_id text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_employee_id uuid REFERENCES people.employees(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.companies(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS primary_contact_id uuid REFERENCES public.contacts(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent'));
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source_label text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_at timestamptz;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz;
-- Older CRM installations do not consistently have these lifecycle columns.
-- Add them before the employee-scope index and before Employee OS writes to them.
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS leads_employee_scope_idx ON public.leads(organisation_id,assigned_employee_id,status,updated_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.lead_assignment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id text NOT NULL,
  lead_id uuid NOT NULL REFERENCES public.leads(id), previous_employee_id uuid REFERENCES people.employees(id),
  assigned_employee_id uuid NOT NULL REFERENCES people.employees(id), assigned_by uuid NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(), ended_at timestamptz
);
CREATE INDEX IF NOT EXISTS lead_assignment_history_idx ON public.lead_assignment_history(organisation_id,lead_id,assigned_at DESC);

CREATE TABLE IF NOT EXISTS public.lead_qualifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id text NOT NULL, lead_id uuid NOT NULL UNIQUE REFERENCES public.leads(id),
  employee_id uuid NOT NULL REFERENCES people.employees(id), state text NOT NULL DEFAULT 'unqualified' CHECK(state IN ('unqualified','researching','contacting','engaged','qualifying','qualified','disqualified')),
  company_overview text, industry text, operational_context text, digital_environment text, potential_fit text, source_references jsonb NOT NULL DEFAULT '[]',
  need_confirmed boolean NOT NULL DEFAULT false, problem_summary text, current_process text, impact text, urgency text,
  decision_maker_known boolean NOT NULL DEFAULT false, stakeholders text, existing_tools text, timeline text, fit_assessment text,
  qualification_notes text, next_step text, disqualification_reason text, disqualification_notes text, disqualified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sales_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id text NOT NULL, lead_id uuid NOT NULL REFERENCES public.leads(id),
  employee_id uuid NOT NULL REFERENCES people.employees(id), activity_type text NOT NULL CHECK(activity_type IN ('call','email','linkedin','whatsapp','meeting','research','note','other')),
  occurred_at timestamptz NOT NULL DEFAULT now(), outcome text, notes text NOT NULL, next_action text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sales_activities_lead_idx ON public.sales_activities(organisation_id,lead_id,occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.sales_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id text NOT NULL, lead_id uuid NOT NULL REFERENCES public.leads(id),
  opportunity_id uuid, assigned_employee_id uuid NOT NULL REFERENCES people.employees(id), created_by_employee_id uuid NOT NULL REFERENCES people.employees(id),
  context text NOT NULL, due_at timestamptz NOT NULL, priority text NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
  status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','completed','cancelled')), completed_at timestamptz, cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sales_followups_employee_due_idx ON public.sales_followups(organisation_id,assigned_employee_id,status,due_at);

CREATE TABLE IF NOT EXISTS public.sales_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id text NOT NULL, originating_lead_id uuid NOT NULL UNIQUE REFERENCES public.leads(id),
  account_id uuid REFERENCES public.companies(id), primary_contact_id uuid REFERENCES public.contacts(id), owner_employee_id uuid NOT NULL REFERENCES people.employees(id),
  name text NOT NULL, problem_need text NOT NULL, potential_fit text NOT NULL, qualification_summary text NOT NULL,
  stage text NOT NULL DEFAULT 'qualification' CHECK(stage IN ('qualification','qualified','discovery_scheduled','handed_off')),
  next_action text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sales_followups DROP CONSTRAINT IF EXISTS sales_followups_opportunity_id_fkey;
ALTER TABLE public.sales_followups ADD CONSTRAINT sales_followups_opportunity_id_fkey FOREIGN KEY(opportunity_id) REFERENCES public.sales_opportunities(id);
CREATE INDEX IF NOT EXISTS sales_opportunities_owner_idx ON public.sales_opportunities(organisation_id,owner_employee_id,stage,updated_at DESC);

CREATE TABLE IF NOT EXISTS public.sales_discovery_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id text NOT NULL, opportunity_id uuid NOT NULL UNIQUE REFERENCES public.sales_opportunities(id),
  lead_id uuid NOT NULL REFERENCES public.leads(id), scheduled_by_employee_id uuid NOT NULL REFERENCES people.employees(id),
  scheduled_start timestamptz NOT NULL, scheduled_end timestamptz NOT NULL, timezone text NOT NULL, meeting_provider text NOT NULL,
  meeting_url text, prospect_attendees jsonb NOT NULL DEFAULT '[]', internal_employee_ids uuid[] NOT NULL,
  qualification_summary text NOT NULL, agenda_context text NOT NULL, notes text, status text NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), CHECK(scheduled_end > scheduled_start)
);

CREATE TABLE IF NOT EXISTS public.sales_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id text NOT NULL, opportunity_id uuid NOT NULL UNIQUE REFERENCES public.sales_opportunities(id),
  lead_id uuid NOT NULL REFERENCES public.leads(id), discovery_schedule_id uuid NOT NULL REFERENCES public.sales_discovery_schedules(id),
  handed_off_by_employee_id uuid NOT NULL REFERENCES people.employees(id), internal_recipient_employee_ids uuid[] NOT NULL,
  qualification_summary text NOT NULL, discovery_brief jsonb NOT NULL, bde_notes text, handed_off_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO identity.permissions(key,description) VALUES
('sales.leads.read_assigned','Read assigned prospects'),('sales.leads.qualify','Qualify assigned prospects'),
('sales.activities.create','Log activity against assigned prospects'),('sales.followups.manage_own','Manage own sales follow-ups'),
('sales.opportunities.manage_assigned','Manage assigned pre-commercial opportunities'),('sales.meetings.schedule','Schedule discovery meetings'),
('sales.handoff.create','Hand qualified opportunities to the internal team'),('sales.discovery_participant','May participate in sales discovery meetings')
ON CONFLICT(key) DO NOTHING;

INSERT INTO identity.role_permissions(organisation_id,role_id,permission_id)
SELECT r.organisation_id,r.id,p.id FROM identity.roles r CROSS JOIN identity.permissions p
WHERE r.name='Business Development Executive' AND p.key IN ('sales.leads.read_assigned','sales.leads.qualify','sales.activities.create','sales.followups.manage_own','sales.opportunities.manage_assigned','sales.meetings.schedule','sales.handoff.create')
ON CONFLICT DO NOTHING;

ALTER TABLE public.lead_assignment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_discovery_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_handoffs ENABLE ROW LEVEL SECURITY;

COMMIT;
