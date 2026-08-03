BEGIN;

-- Additive delivery/change/support layer. Existing PM and support tables remain intact.
CREATE TABLE IF NOT EXISTS public.project_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL UNIQUE REFERENCES public.consulting_projects(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL, company_id UUID, scope_id UUID NOT NULL REFERENCES public.scopes_of_work(id) ON DELETE RESTRICT,
  agreement_id UUID NOT NULL REFERENCES public.master_service_agreements(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK(status IN ('activation_pending','planning','active','on_hold','at_risk','uat','launch_ready','launched','warranty','support','closure_pending','completed','cancelled','archived')),
  health TEXT NOT NULL DEFAULT 'on_track' CHECK(health IN ('on_track','attention_required','at_risk','on_hold')),
  owner_id UUID, delivery_lead_id UUID, summary JSONB NOT NULL DEFAULT '{}', created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, role TEXT NOT NULL, access_level TEXT NOT NULL DEFAULT 'contributor', active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE, end_date DATE, responsibility TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(project_id,user_id,role)
);
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), milestone_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL, objective TEXT, description TEXT, status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('not_started','planned','in_progress','blocked','internal_review','client_review','approved','completed','cancelled')),
  planned_start DATE, planned_completion DATE, actual_start DATE, actual_completion DATE, owner_id UUID, progress INTEGER NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100), exit_criteria JSONB NOT NULL DEFAULT '[]', created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), task_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL, title TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'backlog' CHECK(status IN ('backlog','ready','in_progress','blocked','review','qa','client_review','completed','cancelled')),
  owner_id UUID, priority TEXT NOT NULL DEFAULT 'medium', due_date DATE, client_visible BOOLEAN NOT NULL DEFAULT false, internal_notes TEXT, acceptance_note TEXT, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.project_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), deliverable_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL, title TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'draft', version INTEGER NOT NULL DEFAULT 1,
  acceptance_criteria JSONB NOT NULL DEFAULT '[]', client_review_status TEXT NOT NULL DEFAULT 'pending', internal_notes TEXT, client_visible BOOLEAN NOT NULL DEFAULT false, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.project_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), approval_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE,
  deliverable_id UUID REFERENCES public.project_deliverables(id) ON DELETE SET NULL, milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
  requested_from UUID NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','under_review','changes_requested','approved','rejected','expired','cancelled')), comment TEXT, decision_at TIMESTAMPTZ, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.project_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), release_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE,
  version TEXT NOT NULL, environment TEXT NOT NULL CHECK(environment IN ('development','staging','production')), status TEXT NOT NULL DEFAULT 'draft', release_notes TEXT, approval_status TEXT NOT NULL DEFAULT 'pending', deployed_at TIMESTAMPTZ, deployed_by UUID, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), change_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE,
  client_id UUID NOT NULL, requested_by UUID NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','under_assessment','quotation_required','awaiting_client_approval','approved','rejected','scheduled','in_progress','completed','cancelled')),
  impact JSONB NOT NULL DEFAULT '{}', pricing JSONB NOT NULL DEFAULT '{}', approved_version INTEGER, decision JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.support_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), support_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE,
  client_id UUID NOT NULL, agreement_id UUID REFERENCES public.master_service_agreements(id) ON DELETE SET NULL, mode TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', starts_on DATE, ends_on DATE, services JSONB NOT NULL DEFAULT '[]', sla_rules JSONB NOT NULL DEFAULT '{}', owner_id UUID, created_by UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ticket_number TEXT UNIQUE NOT NULL, project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE,
  support_plan_id UUID REFERENCES public.support_plans(id) ON DELETE SET NULL, client_id UUID NOT NULL, requester_id UUID NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'question', severity TEXT NOT NULL DEFAULT 'medium', status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','triaged','in_progress','waiting_for_client','waiting_for_third_party','resolved','closed','reopened','cancelled')),
  assigned_agent UUID, business_impact TEXT, internal_notes TEXT, resolved_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.support_ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE, author_id UUID NOT NULL, body TEXT NOT NULL, audience TEXT NOT NULL DEFAULT 'client' CHECK(audience IN ('client','internal')), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.project_delivery_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE, entity_type TEXT NOT NULL, entity_id UUID, event_type TEXT NOT NULL, actor_id UUID, metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.assign_delivery_number() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_TABLE_NAME='project_milestones' AND (NEW.milestone_number IS NULL OR btrim(NEW.milestone_number)='') THEN NEW.milestone_number:=public.generate_business_document_number('milestone','GXL-MLS',COALESCE(NEW.created_at,now())); END IF;
 IF TG_TABLE_NAME='project_tasks' AND (NEW.task_number IS NULL OR btrim(NEW.task_number)='') THEN NEW.task_number:=public.generate_business_document_number('task','GXL-TSK',COALESCE(NEW.created_at,now())); END IF;
 IF TG_TABLE_NAME='project_deliverables' AND (NEW.deliverable_number IS NULL OR btrim(NEW.deliverable_number)='') THEN NEW.deliverable_number:=public.generate_business_document_number('deliverable','GXL-DEL',COALESCE(NEW.created_at,now())); END IF;
 IF TG_TABLE_NAME='project_approvals' AND (NEW.approval_number IS NULL OR btrim(NEW.approval_number)='') THEN NEW.approval_number:=public.generate_business_document_number('project_approval','GXL-APR',COALESCE(NEW.created_at,now())); END IF;
 IF TG_TABLE_NAME='project_releases' AND (NEW.release_number IS NULL OR btrim(NEW.release_number)='') THEN NEW.release_number:=public.generate_business_document_number('release','GXL-REL',COALESCE(NEW.created_at,now())); END IF;
 IF TG_TABLE_NAME='change_requests' AND (NEW.change_number IS NULL OR btrim(NEW.change_number)='') THEN NEW.change_number:=public.generate_business_document_number('change_request','GXL-CRQ',COALESCE(NEW.created_at,now())); END IF;
 IF TG_TABLE_NAME='support_plans' AND (NEW.support_number IS NULL OR btrim(NEW.support_number)='') THEN NEW.support_number:=public.generate_business_document_number('support_plan','GXL-SUP',COALESCE(NEW.created_at,now())); END IF;
 IF TG_TABLE_NAME='support_tickets' AND (NEW.ticket_number IS NULL OR btrim(NEW.ticket_number)='') THEN NEW.ticket_number:=public.generate_business_document_number('support_ticket','GXL-TKT',COALESCE(NEW.created_at,now())); END IF;
 RETURN NEW;
END $$;
DO $$ DECLARE t TEXT; BEGIN FOREACH t IN ARRAY ARRAY['project_milestones','project_tasks','project_deliverables','project_approvals','project_releases','change_requests','support_plans','support_tickets'] LOOP EXECUTE format('DROP TRIGGER IF EXISTS trg_delivery_number_%s ON public.%I',t,t); EXECUTE format('CREATE TRIGGER trg_delivery_number_%s BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.assign_delivery_number()',t,t); END LOOP; END $$;

CREATE INDEX IF NOT EXISTS project_milestones_project_idx ON public.project_milestones(project_id,created_at);
CREATE INDEX IF NOT EXISTS project_tasks_project_idx ON public.project_tasks(project_id,status);
CREATE INDEX IF NOT EXISTS support_tickets_client_idx ON public.support_tickets(client_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS project_delivery_activity_idx ON public.project_delivery_activity(project_id,created_at DESC);
ALTER TABLE public.project_workspaces ENABLE ROW LEVEL SECURITY; ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY; ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY; ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY; ALTER TABLE public.project_deliverables ENABLE ROW LEVEL SECURITY; ALTER TABLE public.project_approvals ENABLE ROW LEVEL SECURITY; ALTER TABLE public.project_releases ENABLE ROW LEVEL SECURITY; ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY; ALTER TABLE public.support_plans ENABLE ROW LEVEL SECURITY; ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY; ALTER TABLE public.support_ticket_comments ENABLE ROW LEVEL SECURITY; ALTER TABLE public.project_delivery_activity ENABLE ROW LEVEL SECURITY;
COMMIT;
