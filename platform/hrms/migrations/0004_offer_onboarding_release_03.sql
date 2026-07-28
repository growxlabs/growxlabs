CREATE SCHEMA IF NOT EXISTS onboarding;

DO $$ BEGIN CREATE TYPE onboarding.offer_status AS ENUM
  ('draft','pending_approval','approved','sent','accepted','rejected','changes_requested','expired','withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE onboarding.instance_status AS ENUM
  ('pending','in_progress','blocked','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE onboarding.task_status AS ENUM
  ('blocked','pending','in_progress','submitted','completed','waived','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE onboarding.verification_status AS ENUM
  ('pending','verified','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE onboarding.offer_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  name text NOT NULL,
  department_id uuid REFERENCES people.departments(id),
  designation_id uuid REFERENCES people.designations(id),
  default_terms jsonb NOT NULL DEFAULT '{}',
  document_templates jsonb NOT NULL DEFAULT '{}',
  probation_days integer,
  notice_period_days integer,
  status people.record_status NOT NULL DEFAULT 'active',
  version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(organisation_id,name)
);

CREATE TABLE onboarding.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  application_id uuid NOT NULL REFERENCES recruitment.job_applications(id),
  candidate_id uuid NOT NULL REFERENCES recruitment.candidate_profiles(id),
  template_id uuid REFERENCES onboarding.offer_templates(id),
  workflow_instance_id uuid REFERENCES workflow.instances(id),
  status onboarding.offer_status NOT NULL DEFAULT 'draft',
  current_version integer NOT NULL DEFAULT 1,
  expires_at timestamptz,
  sent_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  withdrawn_at timestamptz,
  public_token_hash text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(application_id)
);
CREATE UNIQUE INDEX offers_public_token_uq ON onboarding.offers(public_token_hash) WHERE public_token_hash IS NOT NULL;

CREATE TABLE onboarding.offer_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  offer_id uuid NOT NULL REFERENCES onboarding.offers(id),
  version integer NOT NULL,
  title text NOT NULL,
  joining_date date NOT NULL,
  department_id uuid REFERENCES people.departments(id),
  designation_id uuid REFERENCES people.designations(id),
  manager_employee_id uuid REFERENCES people.employees(id),
  employment_type text NOT NULL,
  work_location text,
  salary_amount numeric(14,2),
  salary_currency char(3),
  benefits jsonb NOT NULL DEFAULT '[]',
  probation_days integer,
  notice_period_days integer,
  terms jsonb NOT NULL DEFAULT '{}',
  change_summary text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(offer_id,version)
);
CREATE TRIGGER offer_versions_immutable BEFORE UPDATE OR DELETE ON onboarding.offer_versions
FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();

CREATE TABLE onboarding.offer_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  offer_id uuid NOT NULL REFERENCES onboarding.offers(id),
  offer_version_id uuid NOT NULL REFERENCES onboarding.offer_versions(id),
  step_key text NOT NULL CHECK(step_key IN ('hiring_manager','hr_manager')),
  sequence integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  approver_user_id uuid,
  comment text,
  decided_at timestamptz,
  UNIQUE(offer_version_id,step_key)
);

CREATE TABLE onboarding.offer_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  offer_id uuid NOT NULL REFERENCES onboarding.offers(id),
  offer_version_id uuid NOT NULL REFERENCES onboarding.offer_versions(id),
  document_id uuid NOT NULL REFERENCES documents.documents(id),
  kind text NOT NULL CHECK(kind IN ('offer_letter','compensation_summary','nda','employment_agreement')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(offer_version_id,kind)
);

CREATE TABLE onboarding.offer_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  offer_id uuid NOT NULL REFERENCES onboarding.offers(id),
  offer_version_id uuid NOT NULL REFERENCES onboarding.offer_versions(id),
  response text NOT NULL CHECK(response IN ('accepted','rejected','changes_requested')),
  comment text,
  ip_address inet,
  user_agent text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER offer_responses_immutable BEFORE UPDATE OR DELETE ON onboarding.offer_responses
FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();

CREATE TABLE onboarding.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  name text NOT NULL,
  department_id uuid REFERENCES people.departments(id),
  status people.record_status NOT NULL DEFAULT 'active',
  version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(organisation_id,name)
);
CREATE TABLE onboarding.template_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  template_id uuid NOT NULL REFERENCES onboarding.templates(id),
  task_key text NOT NULL,
  title text NOT NULL,
  description text,
  assignee_type text NOT NULL CHECK(assignee_type IN ('employee','hr','manager','it')),
  task_type text NOT NULL CHECK(task_type IN ('checklist','document_upload','document_verification','information','approval','asset_request','training')),
  due_offset_days integer NOT NULL DEFAULT 0,
  required boolean NOT NULL DEFAULT true,
  configuration jsonb NOT NULL DEFAULT '{}',
  position integer NOT NULL,
  UNIQUE(template_id,task_key),
  UNIQUE(template_id,position)
);
CREATE TABLE onboarding.template_task_dependencies (
  task_id uuid NOT NULL REFERENCES onboarding.template_tasks(id),
  depends_on_task_id uuid NOT NULL REFERENCES onboarding.template_tasks(id),
  PRIMARY KEY(task_id,depends_on_task_id),
  CHECK(task_id <> depends_on_task_id)
);

CREATE TABLE onboarding.instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  offer_id uuid NOT NULL REFERENCES onboarding.offers(id),
  candidate_id uuid NOT NULL REFERENCES recruitment.candidate_profiles(id),
  employee_id uuid REFERENCES people.employees(id),
  user_id uuid,
  template_id uuid REFERENCES onboarding.templates(id),
  status onboarding.instance_status NOT NULL DEFAULT 'pending',
  target_start_date date NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  UNIQUE(offer_id)
);
CREATE TABLE onboarding.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  instance_id uuid NOT NULL REFERENCES onboarding.instances(id),
  template_task_id uuid REFERENCES onboarding.template_tasks(id),
  task_key text NOT NULL,
  title text NOT NULL,
  description text,
  assignee_type text NOT NULL,
  assignee_user_id uuid,
  task_type text NOT NULL,
  status onboarding.task_status NOT NULL DEFAULT 'pending',
  required boolean NOT NULL DEFAULT true,
  due_at timestamptz,
  configuration jsonb NOT NULL DEFAULT '{}',
  submitted_data jsonb,
  completed_by uuid,
  completed_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  UNIQUE(instance_id,task_key)
);
CREATE INDEX onboarding_tasks_queue_idx ON onboarding.tasks(organisation_id,assignee_user_id,status,due_at);
CREATE TABLE onboarding.task_dependencies (
  task_id uuid NOT NULL REFERENCES onboarding.tasks(id),
  depends_on_task_id uuid NOT NULL REFERENCES onboarding.tasks(id),
  PRIMARY KEY(task_id,depends_on_task_id)
);
CREATE TABLE onboarding.task_documents (
  organisation_id uuid NOT NULL,
  task_id uuid NOT NULL REFERENCES onboarding.tasks(id),
  document_id uuid NOT NULL REFERENCES documents.documents(id),
  added_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(task_id,document_id)
);

CREATE TABLE onboarding.identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  instance_id uuid NOT NULL REFERENCES onboarding.instances(id),
  document_type text NOT NULL CHECK(document_type IN ('aadhaar','pan','passport','driving_licence')),
  document_id uuid REFERENCES documents.documents(id),
  identifier_ciphertext text,
  status onboarding.verification_status NOT NULL DEFAULT 'pending',
  verified_by uuid,
  verification_notes text,
  verified_at timestamptz,
  UNIQUE(instance_id,document_type)
);
CREATE TABLE onboarding.sensitive_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  instance_id uuid NOT NULL REFERENCES onboarding.instances(id),
  kind text NOT NULL CHECK(kind IN ('address','emergency_contact','banking','tax','personal')),
  encrypted_payload text NOT NULL,
  encryption_key_version text NOT NULL,
  submitted_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(instance_id,kind)
);
CREATE TABLE onboarding.background_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  instance_id uuid NOT NULL REFERENCES onboarding.instances(id),
  provider text,
  external_reference text,
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','cleared','failed')),
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE onboarding.asset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  instance_id uuid NOT NULL REFERENCES onboarding.instances(id),
  asset_type text NOT NULL CHECK(asset_type IN ('laptop','monitor','keyboard','mouse','id_card')),
  specifications jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'requested',
  requested_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE onboarding.training_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  instance_id uuid NOT NULL REFERENCES onboarding.instances(id),
  training_key text NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'assigned',
  due_at timestamptz,
  UNIQUE(instance_id,training_key)
);
CREATE TABLE onboarding.probations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  instance_id uuid NOT NULL UNIQUE REFERENCES onboarding.instances(id),
  employee_id uuid REFERENCES people.employees(id),
  manager_employee_id uuid REFERENCES people.employees(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  review_date date NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','active','completed','extended'))
);

CREATE TABLE onboarding.conversion_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  offer_id uuid NOT NULL UNIQUE REFERENCES onboarding.offers(id),
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','retry','completed','failed')),
  step text NOT NULL DEFAULT 'create_employee',
  employee_id uuid,
  user_id uuid,
  invitation_token_encrypted text,
  onboarding_instance_id uuid REFERENCES onboarding.instances(id),
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  last_error text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX conversion_jobs_pending_idx ON onboarding.conversion_jobs(available_at) WHERE status IN ('pending','retry');

CREATE TABLE onboarding.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  offer_id uuid REFERENCES onboarding.offers(id),
  instance_id uuid REFERENCES onboarding.instances(id),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  actor_user_id uuid,
  payload jsonb NOT NULL DEFAULT '{}',
  request_id uuid NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX onboarding_activity_timeline_idx ON onboarding.activities(organisation_id,instance_id,occurred_at DESC);
CREATE TRIGGER onboarding_activity_immutable BEFORE UPDATE OR DELETE ON onboarding.activities
FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();

INSERT INTO identity.permissions(key,description) VALUES
('offer.view','View offers'),
('offer.create','Create and revise offers'),
('offer.approve_manager','Approve offers as hiring manager'),
('offer.approve_hr','Approve offers as HR manager'),
('offer.send','Send approved offers'),
('offer.withdraw','Withdraw offers'),
('onboarding.view','View onboarding records'),
('onboarding.manage','Manage onboarding templates and instances'),
('onboarding.hr_task','Complete HR onboarding tasks'),
('onboarding.manager_task','Complete manager onboarding tasks'),
('onboarding.it_task','Complete IT onboarding tasks'),
('onboarding.employee_task','Complete personal onboarding tasks'),
('onboarding.verify_identity','Verify identity documents'),
('onboarding.view_sensitive','View decrypted onboarding information')
ON CONFLICT(key) DO NOTHING;

INSERT INTO identity.role_permissions(role_id,permission_id)
SELECT role.id, permission.id FROM identity.roles role CROSS JOIN identity.permissions permission
WHERE role.is_system AND lower(role.name)='owner' AND
permission.key LIKE ANY(ARRAY['offer.%','onboarding.%'])
ON CONFLICT DO NOTHING;
