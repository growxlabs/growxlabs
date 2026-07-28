BEGIN;
CREATE SCHEMA IF NOT EXISTS hrms_integration;
CREATE TABLE hrms_integration.release05_deliveries(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),source_outbox_id uuid NOT NULL UNIQUE,
 organisation_id uuid NOT NULL,event_topic text NOT NULL,status text NOT NULL,
 attempts integer NOT NULL DEFAULT 0,last_error text,created_at timestamptz NOT NULL DEFAULT now(),
 completed_at timestamptz
);
CREATE TABLE hrms_integration.offboarding_events(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organisation_id uuid NOT NULL,employee_id uuid NOT NULL REFERENCES people.employees(id),
 event_type text NOT NULL DEFAULT 'offboarding.started',status text NOT NULL DEFAULT 'PENDING',
 requested_by uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),completed_at timestamptz,
 UNIQUE(organisation_id,employee_id,event_type)
);
COMMIT;
