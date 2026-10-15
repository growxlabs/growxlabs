-- Migration 0043: Dedicated Healthcare Workspace OTP Storage
-- Exclusively used for Healthcare Lead Manager OTP passwordless login at /h

CREATE SCHEMA IF NOT EXISTS identity;

CREATE TABLE IF NOT EXISTS identity.healthcare_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp_code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_healthcare_otps_email ON identity.healthcare_otps(email);
CREATE INDEX IF NOT EXISTS idx_healthcare_otps_active ON identity.healthcare_otps(email, created_at DESC) WHERE consumed_at IS NULL;

ALTER TABLE identity.healthcare_otps ENABLE ROW LEVEL SECURITY;

-- Grant service_role server-side access (bypasses RLS for secure server-only operations)
GRANT ALL ON TABLE identity.healthcare_otps TO service_role;
GRANT ALL ON TABLE identity.healthcare_otps TO postgres;

-- Also ensure service_role has access to employee_otps if it was created
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'identity' AND tablename = 'employee_otps') THEN
    GRANT ALL ON TABLE identity.employee_otps TO service_role;
    GRANT ALL ON TABLE identity.employee_otps TO postgres;
  END IF;
END $$;

-- Ask PostgREST/Supabase to reload its schema cache
NOTIFY pgrst, 'reload schema';
