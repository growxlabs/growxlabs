BEGIN;

ALTER TABLE documents.categories
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES documents.categories(id),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS metadata_schema jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status people.record_status NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE documents.documents
  ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES documents.documents(id),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS expires_at date,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'NOT_REQUIRED'
    CHECK(verification_status IN ('NOT_REQUIRED','PENDING','APPROVED','REJECTED','REUPLOAD_REQUIRED','EXPIRED')),
  ADD COLUMN IF NOT EXISTS verified_by uuid,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_comment text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE documents.versions
  ADD COLUMN IF NOT EXISTS original_filename text,
  ADD COLUMN IF NOT EXISTS virus_scan_status text NOT NULL DEFAULT 'PENDING'
    CHECK(virus_scan_status IN ('PENDING','CLEAN','INFECTED','FAILED','SKIPPED')),
  ADD COLUMN IF NOT EXISTS upload_status text NOT NULL DEFAULT 'PENDING'
    CHECK(upload_status IN ('PENDING','UPLOADED','FAILED')),
  ADD COLUMN IF NOT EXISTS restored_from_version_id uuid REFERENCES documents.versions(id),
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}';

CREATE TABLE documents.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  document_id uuid NOT NULL REFERENCES documents.documents(id),
  subject_type text NOT NULL CHECK(subject_type IN ('USER','EMPLOYEE','ROLE','DEPARTMENT','ORGANISATION')),
  subject_id uuid, access_level text NOT NULL CHECK(access_level IN ('VIEW','DOWNLOAD','EDIT','VERIFY','MANAGE')),
  granted_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id,subject_type,subject_id,access_level)
);
CREATE INDEX documents_permissions_lookup_idx ON documents.permissions(organisation_id,document_id,subject_type,subject_id);

CREATE TABLE documents.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES people.employees(id), category_id uuid REFERENCES documents.categories(id),
  requested_name text NOT NULL, instructions text, due_at timestamptz, expires_at date,
  status text NOT NULL DEFAULT 'REQUESTED'
    CHECK(status IN ('REQUESTED','UPLOADED','UNDER_REVIEW','APPROVED','REJECTED','EXPIRED')),
  document_id uuid REFERENCES documents.documents(id), workflow_instance_id uuid REFERENCES workflow.instances(id),
  requested_by uuid NOT NULL, submitted_at timestamptz, reviewed_by uuid, reviewed_at timestamptz,
  review_comment text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX documents_requests_employee_idx ON documents.requests(organisation_id,employee_id,status,due_at);

CREATE TABLE documents.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  category_id uuid REFERENCES documents.categories(id), name text NOT NULL, description text,
  document_id uuid REFERENCES documents.documents(id), metadata_schema jsonb NOT NULL DEFAULT '{}',
  acknowledgement_required boolean NOT NULL DEFAULT false, status people.record_status NOT NULL DEFAULT 'active',
  version integer NOT NULL DEFAULT 1, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organisation_id,name)
);

CREATE TABLE documents.acknowledgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  document_id uuid NOT NULL REFERENCES documents.documents(id), version_id uuid NOT NULL REFERENCES documents.versions(id),
  employee_id uuid NOT NULL REFERENCES people.employees(id), acknowledged_by uuid NOT NULL,
  acknowledged_at timestamptz NOT NULL DEFAULT now(), ip_address inet, request_id uuid NOT NULL,
  UNIQUE(document_id,version_id,employee_id)
);
CREATE TRIGGER document_acknowledgements_immutable BEFORE UPDATE OR DELETE ON documents.acknowledgements
FOR EACH ROW EXECUTE FUNCTION people.reject_immutable_change();

CREATE TABLE documents.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  name text NOT NULL, colour text, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organisation_id,name)
);
CREATE TABLE documents.document_tags (
  organisation_id uuid NOT NULL, document_id uuid NOT NULL REFERENCES documents.documents(id),
  tag_id uuid NOT NULL REFERENCES documents.tags(id), created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(document_id,tag_id)
);
CREATE TABLE documents.expiry_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  category_id uuid NOT NULL REFERENCES documents.categories(id), reminder_days integer[] NOT NULL DEFAULT '{90,30,7}',
  escalation_days integer[] NOT NULL DEFAULT '{1,7}', auto_expire boolean NOT NULL DEFAULT true,
  notification_template_key text NOT NULL DEFAULT 'document.expiry_reminder',
  created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organisation_id,category_id)
);
CREATE TABLE documents.outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  topic text NOT NULL, payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz, attempts integer NOT NULL DEFAULT 0, last_error text
);
CREATE INDEX documents_outbox_pending_idx ON documents.outbox(created_at) WHERE published_at IS NULL;
CREATE TABLE documents.expiry_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organisation_id uuid NOT NULL,
  run_date date NOT NULL, status text NOT NULL, processed integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
  UNIQUE(organisation_id,run_date)
);

INSERT INTO identity.permissions(key,description) VALUES
('documents.view_self','View own documents'),
('documents.upload_self','Upload own documents'),
('documents.verify','Verify employee documents'),
('documents.manage','Manage document governance'),
('documents.request','Request employee documents')
ON CONFLICT(key) DO UPDATE SET description=excluded.description;

INSERT INTO identity.role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM identity.roles r CROSS JOIN identity.permissions p
WHERE r.name='Owner' AND p.key LIKE 'documents.%' ON CONFLICT DO NOTHING;

COMMIT;
