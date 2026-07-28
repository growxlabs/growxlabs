CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE SCHEMA IF NOT EXISTS people;
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS workflow;
CREATE SCHEMA IF NOT EXISTS documents;
CREATE SCHEMA IF NOT EXISTS notifications;

CREATE TYPE identity.account_status AS ENUM ('invited','active','suspended');
CREATE TYPE people.record_status AS ENUM ('active','inactive','archived');
CREATE TYPE people.employment_status AS ENUM ('active','probation','notice','suspended','terminated');
CREATE TYPE notifications.channel AS ENUM ('email','in_app');

CREATE TABLE people.organisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  currency char(3) NOT NULL DEFAULT 'INR',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE people.business_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES people.organisations(id),
  workspace_id uuid,
  name text NOT NULL,
  status people.record_status NOT NULL DEFAULT 'active',
  UNIQUE (organisation_id, name)
);

CREATE TABLE people.legal_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES people.organisations(id),
  workspace_id uuid,
  business_unit_id uuid REFERENCES people.business_units(id),
  name text NOT NULL,
  registration_number text,
  status people.record_status NOT NULL DEFAULT 'active'
);

CREATE TABLE identity.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  workspace_id uuid,
  email citext NOT NULL,
  display_name text,
  password_hash text,
  status identity.account_status NOT NULL DEFAULT 'invited',
  failed_login_count integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  version integer NOT NULL DEFAULT 1,
  invited_at timestamptz,
  activated_at timestamptz,
  suspended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, email)
);

CREATE TABLE identity.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  workspace_id uuid,
  user_id uuid NOT NULL REFERENCES identity.users(id),
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE identity.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  description text NOT NULL
);

CREATE TABLE identity.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  workspace_id uuid,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  UNIQUE (organisation_id, name)
);

CREATE TABLE identity.role_permissions (
  organisation_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES identity.roles(id),
  permission_id uuid NOT NULL REFERENCES identity.permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE identity.user_roles (
  organisation_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES identity.users(id),
  role_id uuid NOT NULL REFERENCES identity.roles(id),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE people.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES people.organisations(id),
  workspace_id uuid,
  business_unit_id uuid REFERENCES people.business_units(id),
  legal_entity_id uuid REFERENCES people.legal_entities(id),
  parent_id uuid REFERENCES people.departments(id),
  head_employee_id uuid,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  annual_budget numeric(18,2),
  status people.record_status NOT NULL DEFAULT 'active',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (organisation_id, code)
);

CREATE TABLE people.designations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES people.organisations(id),
  workspace_id uuid,
  business_unit_id uuid REFERENCES people.business_units(id),
  legal_entity_id uuid REFERENCES people.legal_entities(id),
  department_id uuid REFERENCES people.departments(id),
  parent_id uuid REFERENCES people.designations(id),
  name text NOT NULL,
  code text NOT NULL,
  level integer,
  salary_band_min numeric(18,2),
  salary_band_max numeric(18,2),
  status people.record_status NOT NULL DEFAULT 'active',
  version integer NOT NULL DEFAULT 1,
  deleted_at timestamptz,
  UNIQUE (organisation_id, code),
  CHECK (salary_band_max IS NULL OR salary_band_min IS NULL OR salary_band_max >= salary_band_min)
);

CREATE TABLE people.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES people.organisations(id),
  workspace_id uuid,
  business_unit_id uuid REFERENCES people.business_units(id),
  legal_entity_id uuid REFERENCES people.legal_entities(id),
  user_id uuid,
  employee_number text NOT NULL,
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  preferred_name text,
  profile_photo_document_id uuid,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (organisation_id, employee_number),
  UNIQUE (organisation_id, user_id)
);

ALTER TABLE people.departments
  ADD CONSTRAINT departments_head_fk FOREIGN KEY (head_employee_id) REFERENCES people.employees(id);

CREATE TABLE people.employment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES people.organisations(id),
  workspace_id uuid,
  business_unit_id uuid REFERENCES people.business_units(id),
  legal_entity_id uuid REFERENCES people.legal_entities(id),
  employee_id uuid NOT NULL REFERENCES people.employees(id),
  department_id uuid REFERENCES people.departments(id),
  designation_id uuid REFERENCES people.designations(id),
  manager_employee_id uuid REFERENCES people.employees(id),
  joining_date date NOT NULL,
  end_date date,
  employment_type text NOT NULL,
  work_location text,
  status people.employment_status NOT NULL DEFAULT 'active',
  version integer NOT NULL DEFAULT 1,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_to timestamptz,
  CHECK (employee_id <> manager_employee_id)
);

CREATE UNIQUE INDEX employment_current_uq ON people.employment_records(employee_id) WHERE valid_to IS NULL;
CREATE INDEX employment_manager_idx ON people.employment_records(organisation_id, manager_employee_id) WHERE valid_to IS NULL;

CREATE OR REPLACE FUNCTION people.prevent_reporting_cycle() RETURNS trigger AS $$
DECLARE has_cycle boolean;
BEGIN
  IF NEW.manager_employee_id IS NULL THEN RETURN NEW; END IF;
  WITH RECURSIVE manager_chain AS (
    SELECT er.manager_employee_id
    FROM people.employment_records er
    WHERE er.employee_id = NEW.manager_employee_id AND er.valid_to IS NULL
    UNION ALL
    SELECT er.manager_employee_id
    FROM people.employment_records er
    JOIN manager_chain mc ON er.employee_id = mc.manager_employee_id
    WHERE er.valid_to IS NULL AND mc.manager_employee_id IS NOT NULL
  )
  SELECT EXISTS(
    SELECT 1 FROM manager_chain WHERE manager_employee_id = NEW.employee_id
  ) INTO has_cycle;
  IF has_cycle OR NEW.employee_id = NEW.manager_employee_id THEN
    RAISE EXCEPTION 'reporting hierarchy cannot contain a cycle';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER employment_reporting_cycle
BEFORE INSERT OR UPDATE OF manager_employee_id ON people.employment_records
FOR EACH ROW EXECUTE FUNCTION people.prevent_reporting_cycle();

CREATE TABLE people.employee_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES people.employees(id), kind text NOT NULL,
  line_1 text NOT NULL, line_2 text, city text NOT NULL, region text, postal_code text, country_code char(2) NOT NULL,
  deleted_at timestamptz
);
CREATE TABLE people.employee_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES people.employees(id), kind text NOT NULL,
  value text NOT NULL, is_primary boolean NOT NULL DEFAULT false, is_private boolean NOT NULL DEFAULT false,
  deleted_at timestamptz
);
CREATE TABLE people.employee_emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES people.employees(id), name text NOT NULL,
  relationship text NOT NULL, phone text NOT NULL, email citext, deleted_at timestamptz
);
CREATE TABLE people.employee_identifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES people.employees(id), kind text NOT NULL,
  encrypted_value bytea NOT NULL, value_fingerprint text NOT NULL, country_code char(2),
  deleted_at timestamptz, UNIQUE (organisation_id, kind, value_fingerprint)
);

CREATE TABLE people.employee_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES people.employees(id),
  event_type text NOT NULL,
  previous_value jsonb,
  new_value jsonb NOT NULL,
  effective_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  actor_user_id uuid NOT NULL,
  request_id uuid NOT NULL
);

CREATE OR REPLACE FUNCTION people.reject_immutable_change() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'immutable records cannot be changed'; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER employee_history_immutable BEFORE UPDATE OR DELETE ON people.employee_history
FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();

CREATE TABLE audit.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  workspace_id uuid,
  actor_user_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  previous_value jsonb,
  new_value jsonb,
  ip_address inet,
  request_id uuid NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_entity_idx ON audit.events(organisation_id, entity_type, entity_id, occurred_at DESC);
CREATE TRIGGER audit_events_immutable BEFORE UPDATE OR DELETE ON audit.events
FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();

CREATE TABLE workflow.definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL, workspace_id uuid,
  key text NOT NULL, name text NOT NULL, status people.record_status NOT NULL DEFAULT 'active',
  UNIQUE (organisation_id, key)
);
CREATE TABLE workflow.versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  definition_id uuid NOT NULL REFERENCES workflow.definitions(id), version integer NOT NULL,
  specification jsonb NOT NULL, published_at timestamptz, UNIQUE (definition_id, version)
);
CREATE TABLE workflow.instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  version_id uuid NOT NULL REFERENCES workflow.versions(id), entity_type text NOT NULL,
  entity_id uuid NOT NULL, state text NOT NULL, started_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz
);
CREATE TABLE workflow.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  instance_id uuid NOT NULL REFERENCES workflow.instances(id), task_key text NOT NULL,
  assignee_user_id uuid, status text NOT NULL, due_at timestamptz, completed_at timestamptz
);
CREATE TABLE workflow.transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  version_id uuid NOT NULL REFERENCES workflow.versions(id), from_state text NOT NULL,
  to_state text NOT NULL, condition jsonb
);
CREATE TABLE workflow.history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  instance_id uuid NOT NULL REFERENCES workflow.instances(id), from_state text,
  to_state text NOT NULL, actor_user_id uuid NOT NULL, payload jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER workflow_history_immutable BEFORE UPDATE OR DELETE ON workflow.history
FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();

CREATE TABLE documents.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  workspace_id uuid, name text NOT NULL, retention_days integer, UNIQUE (organisation_id, name)
);
CREATE TABLE documents.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL, workspace_id uuid,
  category_id uuid REFERENCES documents.categories(id), owner_entity_type text NOT NULL,
  owner_entity_id uuid NOT NULL, name text NOT NULL, status people.record_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE TABLE documents.versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  document_id uuid NOT NULL REFERENCES documents.documents(id), version integer NOT NULL,
  storage_object_key text NOT NULL UNIQUE, content_type text NOT NULL, size_bytes bigint NOT NULL,
  checksum_sha256 text NOT NULL, uploaded_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, version)
);
CREATE TABLE documents.access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  document_id uuid NOT NULL REFERENCES documents.documents(id), version_id uuid REFERENCES documents.versions(id),
  actor_user_id uuid NOT NULL, action text NOT NULL, ip_address inet, request_id uuid NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER document_access_immutable BEFORE UPDATE OR DELETE ON documents.access_logs
FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();

CREATE TABLE notifications.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL, workspace_id uuid,
  recipient_user_id uuid NOT NULL, template_key text NOT NULL, payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
CREATE TABLE notifications.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  notification_id uuid NOT NULL REFERENCES notifications.notifications(id),
  channel notifications.channel NOT NULL, status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0, provider_message_id text, last_error text,
  scheduled_at timestamptz NOT NULL DEFAULT now(), delivered_at timestamptz
);
CREATE TABLE notifications.outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  topic text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  last_error text
);
CREATE INDEX notification_outbox_pending_idx ON notifications.outbox(created_at) WHERE published_at IS NULL;

INSERT INTO identity.permissions (key, description) VALUES
('employee.view','View employee directory and basic profiles'),
('employee.edit','Edit employee records'),
('employee.edit_self','Edit permitted fields on the current employee profile'),
('employee.view_sensitive','View protected employee fields'),
('department.manage','Manage departments'),
('designation.manage','Manage designations'),
('manager.view_team','View direct and indirect reports'),
('manager.edit_team','Edit permitted team fields'),
('organisation.manage','Manage organisation settings')
ON CONFLICT (key) DO NOTHING;
