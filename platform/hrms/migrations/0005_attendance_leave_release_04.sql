CREATE SCHEMA IF NOT EXISTS attendance;
CREATE SCHEMA IF NOT EXISTS leave;

-- Attendance configuration is versioned. Historical summaries retain the
-- exact policy version used by the deterministic calculator.
CREATE TABLE attendance.policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  name text NOT NULL, status people.record_status NOT NULL DEFAULT 'active',
  current_version integer NOT NULL DEFAULT 1, created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz, UNIQUE(organisation_id,name)
);
CREATE TABLE attendance.policy_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  policy_id uuid NOT NULL REFERENCES attendance.policies(id), version integer NOT NULL,
  standard_minutes integer NOT NULL CHECK(standard_minutes BETWEEN 1 AND 1440),
  full_day_minutes integer NOT NULL, half_day_minutes integer NOT NULL,
  grace_minutes integer NOT NULL DEFAULT 0, late_threshold_minutes integer NOT NULL DEFAULT 0,
  early_departure_threshold_minutes integer NOT NULL DEFAULT 0,
  paid_break_minutes integer NOT NULL DEFAULT 0, overtime_after_minutes integer NOT NULL DEFAULT 0,
  missing_punch_action text NOT NULL DEFAULT 'missing_punch',
  weekend_rules jsonb NOT NULL DEFAULT '{}', remote_check_in boolean NOT NULL DEFAULT true,
  gps_required boolean NOT NULL DEFAULT false, geofence_required boolean NOT NULL DEFAULT false,
  manual_entry_allowed boolean NOT NULL DEFAULT false, regularisation_limit_days integer NOT NULL DEFAULT 7,
  rounding_minutes integer NOT NULL DEFAULT 1 CHECK(rounding_minutes BETWEEN 1 AND 60),
  specification jsonb NOT NULL DEFAULT '{}', effective_from date NOT NULL,
  effective_to date, published_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(policy_id,version),
  CHECK(effective_to IS NULL OR effective_to>=effective_from)
);
CREATE TABLE attendance.policy_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  policy_id uuid NOT NULL REFERENCES attendance.policies(id),
  employee_id uuid REFERENCES people.employees(id), department_id uuid REFERENCES people.departments(id),
  effective_from date NOT NULL, effective_to date, created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK((employee_id IS NOT NULL)::integer+(department_id IS NOT NULL)::integer=1),
  CHECK(effective_to IS NULL OR effective_to>=effective_from)
);
CREATE INDEX attendance_policy_assignment_resolution_idx ON attendance.policy_assignments(organisation_id,employee_id,department_id,effective_from DESC);

CREATE TABLE attendance.work_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  name text NOT NULL, timezone text NOT NULL, is_flexible boolean NOT NULL DEFAULT false,
  status people.record_status NOT NULL DEFAULT 'active', version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz,
  UNIQUE(organisation_id,name)
);
CREATE TABLE attendance.work_schedule_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  schedule_id uuid NOT NULL REFERENCES attendance.work_schedules(id), day_of_week smallint NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
  is_working_day boolean NOT NULL, expected_start time, expected_end time,
  expected_minutes integer NOT NULL DEFAULT 0 CHECK(expected_minutes BETWEEN 0 AND 1440),
  UNIQUE(schedule_id,day_of_week)
);
CREATE TABLE attendance.work_schedule_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  schedule_id uuid NOT NULL REFERENCES attendance.work_schedules(id),
  employee_id uuid REFERENCES people.employees(id), department_id uuid REFERENCES people.departments(id),
  work_location text, effective_from date NOT NULL, effective_to date, created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK((employee_id IS NOT NULL)::integer+(department_id IS NOT NULL)::integer+(work_location IS NOT NULL)::integer=1),
  CHECK(effective_to IS NULL OR effective_to>=effective_from)
);

CREATE TABLE attendance.shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  name text NOT NULL, code text NOT NULL, shift_type text NOT NULL CHECK(shift_type IN ('fixed','flexible','night','split','rotating')),
  start_time time, end_time time, expected_minutes integer NOT NULL,
  crosses_midnight boolean NOT NULL DEFAULT false, flexible_window_minutes integer NOT NULL DEFAULT 0,
  status people.record_status NOT NULL DEFAULT 'active', version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz,
  UNIQUE(organisation_id,code)
);
CREATE TABLE attendance.shift_break_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  shift_id uuid NOT NULL REFERENCES attendance.shifts(id), name text NOT NULL,
  duration_minutes integer NOT NULL, paid boolean NOT NULL DEFAULT false,
  starts_after_minutes integer, UNIQUE(shift_id,name)
);
CREATE TABLE attendance.shift_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  shift_id uuid NOT NULL REFERENCES attendance.shifts(id),
  employee_id uuid REFERENCES people.employees(id), department_id uuid REFERENCES people.departments(id),
  effective_from date NOT NULL, effective_to date, rotation_specification jsonb,
  created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  CHECK((employee_id IS NOT NULL)::integer+(department_id IS NOT NULL)::integer=1),
  CHECK(effective_to IS NULL OR effective_to>=effective_from)
);

CREATE TABLE attendance.holiday_calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  name text NOT NULL, location text, legal_entity_id uuid REFERENCES people.legal_entities(id),
  effective_from date NOT NULL, effective_to date, status people.record_status NOT NULL DEFAULT 'active',
  version integer NOT NULL DEFAULT 1, created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organisation_id,name), CHECK(effective_to IS NULL OR effective_to>=effective_from)
);
CREATE TABLE attendance.holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  calendar_id uuid NOT NULL REFERENCES attendance.holiday_calendars(id), holiday_date date NOT NULL,
  name text NOT NULL, is_optional boolean NOT NULL DEFAULT false, recurring_rule jsonb,
  created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(calendar_id,holiday_date,name)
);
CREATE TABLE attendance.holiday_calendar_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  calendar_id uuid NOT NULL REFERENCES attendance.holiday_calendars(id),
  employee_id uuid REFERENCES people.employees(id), location text, legal_entity_id uuid REFERENCES people.legal_entities(id),
  effective_from date NOT NULL, effective_to date, created_by uuid NOT NULL,
  CHECK((employee_id IS NOT NULL)::integer+(location IS NOT NULL)::integer+(legal_entity_id IS NOT NULL)::integer=1)
);

CREATE TABLE attendance.geofences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  name text NOT NULL, centre_latitude numeric(9,6) NOT NULL, centre_longitude numeric(9,6) NOT NULL,
  radius_metres integer NOT NULL CHECK(radius_metres>0), work_location text,
  status people.record_status NOT NULL DEFAULT 'active', created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE attendance.geofence_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  geofence_id uuid NOT NULL REFERENCES attendance.geofences(id),
  employee_id uuid REFERENCES people.employees(id), department_id uuid REFERENCES people.departments(id),
  effective_from date NOT NULL, effective_to date,
  CHECK((employee_id IS NOT NULL)::integer+(department_id IS NOT NULL)::integer=1)
);

CREATE TABLE attendance.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES people.employees(id),
  event_type text NOT NULL CHECK(event_type IN ('CHECK_IN','CHECK_OUT','BREAK_START','BREAK_END','MANUAL_CHECK_IN','MANUAL_CHECK_OUT','CORRECTION')),
  occurred_at timestamptz NOT NULL, source text NOT NULL CHECK(source IN ('WEB','MOBILE','ADMIN','IMPORT','SYSTEM')),
  timezone text NOT NULL, latitude numeric(9,6), longitude numeric(9,6),
  accuracy_metres integer, captured_at timestamptz, ip_address inet, device_id text,
  notes text, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}', request_id uuid NOT NULL, idempotency_key text,
  CHECK((latitude IS NULL)=(longitude IS NULL)), UNIQUE(organisation_id,employee_id,idempotency_key)
);
CREATE INDEX attendance_event_timeline_idx ON attendance.events(organisation_id,employee_id,occurred_at);
CREATE TRIGGER attendance_events_immutable BEFORE UPDATE OR DELETE ON attendance.events
FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();

CREATE TABLE attendance.daily_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES people.employees(id), work_date date NOT NULL,
  policy_version_id uuid REFERENCES attendance.policy_versions(id),
  schedule_id uuid REFERENCES attendance.work_schedules(id), shift_id uuid REFERENCES attendance.shifts(id),
  first_check_in timestamptz, last_check_out timestamptz,
  scheduled_minutes integer NOT NULL DEFAULT 0, worked_minutes integer NOT NULL DEFAULT 0,
  break_minutes integer NOT NULL DEFAULT 0, overtime_minutes integer NOT NULL DEFAULT 0,
  late_minutes integer NOT NULL DEFAULT 0, early_departure_minutes integer NOT NULL DEFAULT 0,
  status text NOT NULL CHECK(status IN ('PRESENT','ABSENT','PARTIAL','HALF_DAY','ON_LEAVE','HOLIDAY','WEEK_OFF','MISSING_PUNCH','PENDING_REVIEW')),
  is_regularised boolean NOT NULL DEFAULT false, violations jsonb NOT NULL DEFAULT '[]',
  calculation_version integer NOT NULL, calculated_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1, UNIQUE(organisation_id,employee_id,work_date)
);
CREATE INDEX attendance_summary_month_idx ON attendance.daily_summaries(organisation_id,work_date,employee_id);

CREATE TABLE attendance.regularisation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES people.employees(id), work_date date NOT NULL,
  reason_type text NOT NULL CHECK(reason_type IN ('missing_check_in','missing_check_out','incorrect_time','incorrect_shift','work_from_home','official_duty','other')),
  requested_check_in timestamptz, requested_check_out timestamptz, reason text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','SUBMITTED','PENDING_MANAGER','PENDING_HR','APPROVED','REJECTED','CANCELLED')),
  workflow_instance_id uuid REFERENCES workflow.instances(id), created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), version integer NOT NULL DEFAULT 1
);
CREATE TABLE attendance.regularisation_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  request_id uuid NOT NULL REFERENCES attendance.regularisation_requests(id),
  workflow_step text NOT NULL, approver_user_id uuid, decision text CHECK(decision IN ('approved','rejected')),
  comment text, decided_at timestamptz, correlation_request_id uuid NOT NULL,
  UNIQUE(request_id,workflow_step)
);
CREATE TABLE attendance.regularisation_evidence (
  organisation_id uuid NOT NULL, request_id uuid NOT NULL REFERENCES attendance.regularisation_requests(id),
  document_id uuid NOT NULL REFERENCES documents.documents(id), created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(request_id,document_id)
);

-- Leave type keys are stable records, never organisation-specific enums.
CREATE TABLE leave.types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  key text NOT NULL, name text NOT NULL, paid boolean NOT NULL DEFAULT true,
  requires_balance boolean NOT NULL DEFAULT true, requires_attachment boolean NOT NULL DEFAULT false,
  minimum_quantity numeric(8,2) NOT NULL DEFAULT .5, maximum_quantity numeric(8,2),
  half_day_supported boolean NOT NULL DEFAULT true, hour_based_supported boolean NOT NULL DEFAULT false,
  notice_days integer NOT NULL DEFAULT 0, backdated_allowed boolean NOT NULL DEFAULT false,
  future_limit_days integer, consecutive_limit_days integer, eligibility_rules jsonb NOT NULL DEFAULT '{}',
  probation_eligible boolean NOT NULL DEFAULT false, carry_forward_supported boolean NOT NULL DEFAULT false,
  encashment_supported boolean NOT NULL DEFAULT false, negative_balance_allowed boolean NOT NULL DEFAULT false,
  manager_approval_required boolean NOT NULL DEFAULT true, hr_approval_required boolean NOT NULL DEFAULT false,
  status people.record_status NOT NULL DEFAULT 'active', version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz,
  UNIQUE(organisation_id,key)
);
CREATE TABLE leave.policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  name text NOT NULL, status people.record_status NOT NULL DEFAULT 'active',
  current_version integer NOT NULL DEFAULT 1, created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz, UNIQUE(organisation_id,name)
);
CREATE TABLE leave.policy_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  policy_id uuid NOT NULL REFERENCES leave.policies(id), version integer NOT NULL,
  accrual_frequency text NOT NULL CHECK(accrual_frequency IN ('none','monthly','quarterly','annual')),
  joining_proration boolean NOT NULL DEFAULT true, probation_rules jsonb NOT NULL DEFAULT '{}',
  weekend_treatment text NOT NULL DEFAULT 'exclude', holiday_treatment text NOT NULL DEFAULT 'exclude',
  sandwich_rule jsonb NOT NULL DEFAULT '{}', approval_chain jsonb NOT NULL DEFAULT '{}',
  cancellation_rules jsonb NOT NULL DEFAULT '{}', effective_from date NOT NULL, effective_to date,
  published_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(policy_id,version),
  CHECK(effective_to IS NULL OR effective_to>=effective_from)
);
CREATE TABLE leave.policy_type_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  policy_version_id uuid NOT NULL REFERENCES leave.policy_versions(id),
  leave_type_id uuid NOT NULL REFERENCES leave.types(id),
  annual_entitlement numeric(8,2) NOT NULL DEFAULT 0, accrual_amount numeric(8,2) NOT NULL DEFAULT 0,
  carry_forward_limit numeric(8,2), expiry_months integer, maximum_balance numeric(8,2),
  negative_balance_limit numeric(8,2) NOT NULL DEFAULT 0, required_documentation jsonb NOT NULL DEFAULT '{}',
  UNIQUE(policy_version_id,leave_type_id)
);
CREATE TABLE leave.policy_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  policy_id uuid NOT NULL REFERENCES leave.policies(id),
  employee_id uuid REFERENCES people.employees(id), department_id uuid REFERENCES people.departments(id),
  effective_from date NOT NULL, effective_to date, created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK((employee_id IS NOT NULL)::integer+(department_id IS NOT NULL)::integer=1),
  CHECK(effective_to IS NULL OR effective_to>=effective_from)
);

CREATE TABLE leave.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES people.employees(id),
  leave_type_id uuid NOT NULL REFERENCES leave.types(id),
  policy_version_id uuid NOT NULL REFERENCES leave.policy_versions(id),
  start_date date NOT NULL, end_date date NOT NULL,
  total_quantity numeric(8,2) NOT NULL, reason text NOT NULL,
  contact_during_leave text, delegation_notes text, timezone text NOT NULL,
  attachment_document_id uuid REFERENCES documents.documents(id),
  status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','SUBMITTED','PENDING_APPROVAL','APPROVED','REJECTED','WITHDRAWN','CANCELLED')),
  workflow_instance_id uuid REFERENCES workflow.instances(id), created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1, legacy_id text, CHECK(end_date>=start_date)
);
CREATE INDEX leave_request_employee_dates_idx ON leave.requests(organisation_id,employee_id,start_date,end_date);
CREATE TABLE leave.request_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  request_id uuid NOT NULL REFERENCES leave.requests(id), leave_date date NOT NULL,
  duration_type text NOT NULL CHECK(duration_type IN ('full_day','first_half','second_half','hours')),
  quantity numeric(8,2) NOT NULL, is_working_day boolean NOT NULL,
  is_holiday boolean NOT NULL DEFAULT false, is_weekly_off boolean NOT NULL DEFAULT false,
  is_chargeable boolean NOT NULL, UNIQUE(request_id,leave_date)
);
CREATE TABLE leave.approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  request_id uuid NOT NULL REFERENCES leave.requests(id), workflow_step text NOT NULL,
  approver_user_id uuid, decision text CHECK(decision IN ('approved','rejected')),
  comment text, decided_at timestamptz, correlation_request_id uuid NOT NULL,
  UNIQUE(request_id,workflow_step)
);
CREATE TABLE leave.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES people.employees(id),
  leave_type_id uuid NOT NULL REFERENCES leave.types(id),
  policy_version_id uuid REFERENCES leave.policy_versions(id),
  entry_type text NOT NULL CHECK(entry_type IN ('OPENING_BALANCE','ALLOCATION','ACCRUAL','USAGE','REVERSAL','ADJUSTMENT','CARRY_FORWARD','EXPIRY','ENCASHMENT','CORRECTION')),
  quantity numeric(8,2) NOT NULL, effective_date date NOT NULL,
  reference_type text NOT NULL, reference_id uuid, reason text NOT NULL,
  created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}', idempotency_key text,
  UNIQUE(organisation_id,idempotency_key)
);
CREATE INDEX leave_ledger_balance_idx ON leave.ledger_entries(organisation_id,employee_id,leave_type_id,effective_date);
CREATE TRIGGER leave_ledger_immutable BEFORE UPDATE OR DELETE ON leave.ledger_entries
FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();

CREATE TABLE leave.accrual_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  period_start date NOT NULL, period_end date NOT NULL, status text NOT NULL DEFAULT 'preview',
  dry_run boolean NOT NULL DEFAULT true, idempotency_key text NOT NULL,
  processed integer NOT NULL DEFAULT 0, failed integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
  UNIQUE(organisation_id,idempotency_key)
);
CREATE TABLE leave.accrual_run_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  run_id uuid NOT NULL REFERENCES leave.accrual_runs(id), employee_id uuid NOT NULL,
  leave_type_id uuid NOT NULL, quantity numeric(8,2) NOT NULL, status text NOT NULL,
  ledger_entry_id uuid REFERENCES leave.ledger_entries(id), error text,
  UNIQUE(run_id,employee_id,leave_type_id)
);
CREATE TABLE leave.carry_forward_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  from_year integer NOT NULL, to_year integer NOT NULL, status text NOT NULL DEFAULT 'preview',
  dry_run boolean NOT NULL DEFAULT true, idempotency_key text NOT NULL, created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
  UNIQUE(organisation_id,idempotency_key)
);
CREATE TABLE leave.carry_forward_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  run_id uuid NOT NULL REFERENCES leave.carry_forward_runs(id), employee_id uuid NOT NULL,
  leave_type_id uuid NOT NULL, available_quantity numeric(8,2) NOT NULL,
  carried_quantity numeric(8,2) NOT NULL, expires_at date, ledger_entry_id uuid REFERENCES leave.ledger_entries(id),
  UNIQUE(run_id,employee_id,leave_type_id)
);
CREATE TABLE leave.comp_off_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES people.employees(id), attendance_summary_id uuid REFERENCES attendance.daily_summaries(id),
  worked_date date NOT NULL, requested_quantity numeric(8,2) NOT NULL,
  status text NOT NULL DEFAULT 'SUBMITTED', reason text, created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE leave.comp_off_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  request_id uuid NOT NULL UNIQUE REFERENCES leave.comp_off_requests(id),
  ledger_entry_id uuid NOT NULL REFERENCES leave.ledger_entries(id), expires_at date
);

CREATE TABLE attendance.domain_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  topic text NOT NULL, payload jsonb NOT NULL, request_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz,
  attempts integer NOT NULL DEFAULT 0, last_error text
);
CREATE TABLE leave.domain_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  topic text NOT NULL, payload jsonb NOT NULL, request_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz,
  attempts integer NOT NULL DEFAULT 0, last_error text
);
CREATE INDEX attendance_outbox_pending_idx ON attendance.domain_outbox(created_at) WHERE published_at IS NULL;
CREATE INDEX leave_outbox_pending_idx ON leave.domain_outbox(created_at) WHERE published_at IS NULL;

CREATE TABLE attendance.scheduled_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  operation text NOT NULL, batch_key text NOT NULL, status text NOT NULL,
  processed integer NOT NULL DEFAULT 0, failed integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}', UNIQUE(organisation_id,operation,batch_key)
);

CREATE TABLE attendance.legacy_migration_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  source_table text NOT NULL, legacy_id text NOT NULL, canonical_employee_id uuid,
  target_type text NOT NULL, target_id uuid, status text NOT NULL,
  error text, imported_at timestamptz, metadata jsonb NOT NULL DEFAULT '{}',
  UNIQUE(organisation_id,source_table,legacy_id,target_type)
);
CREATE TABLE leave.legacy_migration_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  source_table text NOT NULL, legacy_id text NOT NULL, canonical_employee_id uuid,
  target_type text NOT NULL, target_id uuid, status text NOT NULL,
  error text, imported_at timestamptz, metadata jsonb NOT NULL DEFAULT '{}',
  UNIQUE(organisation_id,source_table,legacy_id,target_type)
);

INSERT INTO identity.permissions(key,description) VALUES
('attendance.view_self','View personal attendance'),
('attendance.clock_self','Record personal attendance events'),
('attendance.view_team','View permitted team attendance'),
('attendance.view_all','View all attendance'),
('attendance.correct','Create authorised attendance corrections'),
('attendance.regularisation.submit','Submit attendance regularisation'),
('attendance.regularisation.approve','Approve attendance regularisation'),
('attendance.policy.view','View attendance policies'),
('attendance.policy.manage','Manage attendance policies'),
('attendance.shift.manage','Manage shifts'),
('attendance.schedule.manage','Manage schedules'),
('attendance.holiday.manage','Manage holiday calendars'),
('leave.view_self','View personal leave'),
('leave.request','Request leave'),
('leave.cancel_self','Withdraw or cancel personal leave'),
('leave.view_team','View permitted team leave'),
('leave.approve_team','Approve team leave'),
('leave.view_all','View all leave'),
('leave.manage_all','Manage leave administration'),
('leave.policy.view','View leave policies'),
('leave.policy.manage','Manage leave policies'),
('leave.balance.adjust','Adjust leave balances'),
('leave.ledger.view','View leave ledger'),
('leave.accrual.run','Run leave accrual'),
('leave.carry_forward.run','Run carry forward')
ON CONFLICT(key) DO NOTHING;

INSERT INTO identity.role_permissions(role_id,permission_id)
SELECT role.id,permission.id FROM identity.roles role CROSS JOIN identity.permissions permission
WHERE role.is_system AND lower(role.name)='owner'
AND (permission.key LIKE 'attendance.%' OR permission.key LIKE 'leave.%')
ON CONFLICT DO NOTHING;
