BEGIN;

-- Keep each delivery number trigger table-specific so a row can never reference another table's columns.
CREATE OR REPLACE FUNCTION public.assign_milestone_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
  IF NEW.milestone_number IS NULL OR btrim(NEW.milestone_number) = '' THEN
    NEW.milestone_number := public.generate_business_document_number('milestone', 'GXL-MLS', COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.assign_task_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
  IF NEW.task_number IS NULL OR btrim(NEW.task_number) = '' THEN
    NEW.task_number := public.generate_business_document_number('task', 'GXL-TSK', COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.assign_deliverable_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
  IF NEW.deliverable_number IS NULL OR btrim(NEW.deliverable_number) = '' THEN
    NEW.deliverable_number := public.generate_business_document_number('deliverable', 'GXL-DEL', COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.assign_project_approval_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
  IF NEW.approval_number IS NULL OR btrim(NEW.approval_number) = '' THEN
    NEW.approval_number := public.generate_business_document_number('project_approval', 'GXL-APR', COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.assign_project_release_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
  IF NEW.release_number IS NULL OR btrim(NEW.release_number) = '' THEN
    NEW.release_number := public.generate_business_document_number('release', 'GXL-REL', COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.assign_change_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
  IF NEW.change_number IS NULL OR btrim(NEW.change_number) = '' THEN
    NEW.change_number := public.generate_business_document_number('change_request', 'GXL-CRQ', COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.assign_support_plan_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
  IF NEW.support_number IS NULL OR btrim(NEW.support_number) = '' THEN
    NEW.support_number := public.generate_business_document_number('support_plan', 'GXL-SUP', COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.assign_support_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR btrim(NEW.ticket_number) = '' THEN
    NEW.ticket_number := public.generate_business_document_number('support_ticket', 'GXL-TKT', COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_delivery_number_project_milestones ON public.project_milestones;
CREATE TRIGGER trg_delivery_number_project_milestones
BEFORE INSERT ON public.project_milestones
FOR EACH ROW EXECUTE FUNCTION public.assign_milestone_number();

DROP TRIGGER IF EXISTS trg_delivery_number_project_tasks ON public.project_tasks;
CREATE TRIGGER trg_delivery_number_project_tasks
BEFORE INSERT ON public.project_tasks
FOR EACH ROW EXECUTE FUNCTION public.assign_task_number();

DROP TRIGGER IF EXISTS trg_delivery_number_project_deliverables ON public.project_deliverables;
CREATE TRIGGER trg_delivery_number_project_deliverables
BEFORE INSERT ON public.project_deliverables
FOR EACH ROW EXECUTE FUNCTION public.assign_deliverable_number();

DROP TRIGGER IF EXISTS trg_delivery_number_project_approvals ON public.project_approvals;
CREATE TRIGGER trg_delivery_number_project_approvals
BEFORE INSERT ON public.project_approvals
FOR EACH ROW EXECUTE FUNCTION public.assign_project_approval_number();

DROP TRIGGER IF EXISTS trg_delivery_number_project_releases ON public.project_releases;
CREATE TRIGGER trg_delivery_number_project_releases
BEFORE INSERT ON public.project_releases
FOR EACH ROW EXECUTE FUNCTION public.assign_project_release_number();

DROP TRIGGER IF EXISTS trg_delivery_number_change_requests ON public.change_requests;
CREATE TRIGGER trg_delivery_number_change_requests
BEFORE INSERT ON public.change_requests
FOR EACH ROW EXECUTE FUNCTION public.assign_change_request_number();

DROP TRIGGER IF EXISTS trg_delivery_number_support_plans ON public.support_plans;
CREATE TRIGGER trg_delivery_number_support_plans
BEFORE INSERT ON public.support_plans
FOR EACH ROW EXECUTE FUNCTION public.assign_support_plan_number();

DROP TRIGGER IF EXISTS trg_delivery_number_support_tickets ON public.support_tickets;
CREATE TRIGGER trg_delivery_number_support_tickets
BEFORE INSERT ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.assign_support_ticket_number();

COMMIT;
