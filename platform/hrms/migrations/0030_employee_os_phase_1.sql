BEGIN;

DO $$ BEGIN
  CREATE TYPE identity.employee_identity_type AS ENUM ('employee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE identity.workspace_status AS ENUM ('pending','provisioning','active','suspended','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS identity.employee_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES people.organisations(id),
  auth_user_id uuid NOT NULL REFERENCES identity.users(id),
  employee_id uuid NOT NULL REFERENCES people.employees(id),
  email citext NOT NULL,
  identity_type identity.employee_identity_type NOT NULL DEFAULT 'employee',
  workspace_status identity.workspace_status NOT NULL DEFAULT 'pending',
  provisioning_error text,
  provisioned_at timestamptz,
  suspended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, employee_id),
  UNIQUE (organisation_id, email),
  UNIQUE (organisation_id, auth_user_id)
);

CREATE TABLE IF NOT EXISTS onboarding.employee_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES people.organisations(id),
  employee_id uuid NOT NULL REFERENCES people.employees(id),
  identity_id uuid NOT NULL REFERENCES identity.employee_identities(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  checklist jsonb NOT NULL DEFAULT '[{"key":"profile","title":"Complete employee profile","status":"pending"},{"key":"documents","title":"Submit employee documents","status":"pending"},{"key":"policies","title":"Review company policies","status":"pending"}]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, employee_id)
);

CREATE TABLE IF NOT EXISTS recruitment.employee_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES people.organisations(id),
  application_id uuid NOT NULL REFERENCES recruitment.careers_applications(id),
  candidate_id text NOT NULL,
  employee_id uuid NOT NULL REFERENCES people.employees(id),
  identity_id uuid NOT NULL REFERENCES identity.employee_identities(id),
  role_id uuid NOT NULL REFERENCES identity.roles(id),
  onboarding_state_id uuid NOT NULL REFERENCES onboarding.employee_states(id),
  converted_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, application_id)
);

CREATE TABLE IF NOT EXISTS identity.employee_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES people.organisations(id),
  identity_id uuid NOT NULL REFERENCES identity.employee_identities(id),
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS employee_activation_open_uq
  ON identity.employee_activations(identity_id) WHERE consumed_at IS NULL;

INSERT INTO identity.permissions(key, description) VALUES
('workspace.home','Access Employee OS home'),('workspace.work','Access personal work queue'),
('sales.workspace','Access the sales execution workspace'),('employee.resources','Access assigned employee resources'),
('employee.profile','Access employee self-service'),('employee.documents','Access own employment documents'),
('sales.lead.read_assigned','Read assigned leads'),('sales.lead.update_assigned','Update assigned leads'),
('sales.account.read_assigned','Read assigned accounts'),('sales.contact.read_related','Read contacts related to assigned work'),
('sales.contact.create','Create contacts'),('sales.contact.update_related','Update related contacts'),
('sales.opportunity.read_assigned','Read assigned opportunities'),('sales.opportunity.create','Create opportunities'),
('sales.opportunity.update_assigned','Update assigned opportunities'),('sales.activity.read_assigned','Read assigned activities'),
('sales.activity.create','Log sales activities'),('sales.followup.read_assigned','Read assigned follow-ups'),
('sales.followup.create','Create follow-ups'),('sales.followup.update_assigned','Update assigned follow-ups'),
('sales.meeting.read_assigned','Read assigned meetings'),('sales.meeting.create','Schedule meetings'),
('employee.profile.read_own','Read own employee profile'),('employee.profile.update_own','Update own employee profile'),
('employee.documents.read_own','Read own documents'),('employee.attendance.read_own','Read own attendance'),
('employee.attendance.use','Record own attendance'),('employee.leave.read_own','Read own leave'),
('employee.leave.request','Request leave'),('employee.learning.read_assigned','Read assigned learning')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION identity.ensure_bde_role(p_organisation_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, identity AS $$
DECLARE v_role_id uuid;
BEGIN
  INSERT INTO identity.roles(organisation_id,name,description,is_system)
  VALUES(p_organisation_id,'Business Development Executive','Assigned CRM execution with own and assigned scope only',true)
  ON CONFLICT(organisation_id,name) DO UPDATE SET description=EXCLUDED.description
  RETURNING id INTO v_role_id;
  INSERT INTO identity.role_permissions(organisation_id,role_id,permission_id)
  SELECT p_organisation_id,v_role_id,p.id FROM identity.permissions p
  WHERE p.key = ANY(ARRAY['workspace.home','workspace.work','sales.workspace','employee.resources','employee.profile','employee.documents','sales.lead.read_assigned','sales.lead.update_assigned','sales.account.read_assigned','sales.contact.read_related','sales.contact.create','sales.contact.update_related','sales.opportunity.read_assigned','sales.opportunity.create','sales.opportunity.update_assigned','sales.activity.read_assigned','sales.activity.create','sales.followup.read_assigned','sales.followup.create','sales.followup.update_assigned','sales.meeting.read_assigned','sales.meeting.create','employee.profile.read_own','employee.profile.update_own','employee.documents.read_own','employee.attendance.read_own','employee.attendance.use','employee.leave.read_own','employee.leave.request','employee.learning.read_assigned'])
  ON CONFLICT DO NOTHING;
  RETURN v_role_id;
END $$;

COMMIT;
