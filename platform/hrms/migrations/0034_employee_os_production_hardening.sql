BEGIN;

-- The Identity service consumes identity.invitations. Delivery metadata permits
-- safe retry without persisting plaintext activation tokens.
ALTER TABLE identity.invitations ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
ALTER TABLE identity.invitations ADD COLUMN IF NOT EXISTS delivery_error text;
CREATE INDEX IF NOT EXISTS identity_invitations_open_user_idx
  ON identity.invitations(organisation_id,user_id,expires_at DESC) WHERE accepted_at IS NULL;

-- Employee OS is intentionally accessed through organisation/ownership-scoped
-- service-role APIs. Direct PostgREST access has RLS enabled and no broad policy.
ALTER TABLE identity.employee_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.employee_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding.employee_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.employee_conversions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS employee_identity_workspace_idx
  ON identity.employee_identities(organisation_id,workspace_status,employee_id);
CREATE INDEX IF NOT EXISTS employee_conversion_application_idx
  ON recruitment.employee_conversions(organisation_id,application_id);
CREATE INDEX IF NOT EXISTS lead_qualification_employee_state_idx
  ON public.lead_qualifications(organisation_id,employee_id,state,updated_at DESC);
CREATE INDEX IF NOT EXISTS discovery_employee_schedule_idx
  ON public.sales_discovery_schedules(organisation_id,scheduled_by_employee_id,status,scheduled_start);
CREATE INDEX IF NOT EXISTS handoff_employee_review_idx
  ON public.sales_handoffs(organisation_id,handed_off_by_employee_id,review_status,handed_off_at DESC);

COMMIT;
