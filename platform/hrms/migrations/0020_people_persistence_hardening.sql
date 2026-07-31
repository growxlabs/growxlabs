BEGIN;

-- The original designation table predates the shared mutable-reference contract.
-- Add the timestamps required by status and update endpoints without replacing data.
ALTER TABLE people.designations
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS people_departments_org_status_idx
  ON people.departments (organisation_id, status, name)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS people_designations_org_status_idx
  ON people.designations (organisation_id, status, name)
  WHERE deleted_at IS NULL;

INSERT INTO identity.permissions (key, description) VALUES
  ('people.departments.read', 'View departments'),
  ('people.departments.create', 'Create departments'),
  ('people.departments.update', 'Update departments'),
  ('people.departments.archive', 'Archive departments'),
  ('people.employees.read', 'View employees'),
  ('people.employees.create', 'Create employees'),
  ('people.employees.update', 'Update employees'),
  ('people.organisation.manage', 'Manage People organisation structure')
ON CONFLICT (key) DO NOTHING;

COMMIT;
