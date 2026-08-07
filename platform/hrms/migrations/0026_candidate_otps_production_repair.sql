-- Production repair: candidate portal OTP storage.
-- Idempotent because 0025_candidate_portal_enhancements.sql may not have been
-- applied in every environment.
CREATE SCHEMA IF NOT EXISTS recruitment;

CREATE TABLE IF NOT EXISTS recruitment.candidate_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp_code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_candidate_otps_email ON recruitment.candidate_otps(email);
ALTER TABLE recruitment.candidate_otps ENABLE ROW LEVEL SECURITY;
-- No client policy is created: OTP access is server-only through Supabase's
-- service role, which bypasses RLS. This prevents browser-side table access.

-- Ask PostgREST/Supabase to reload its schema cache after the table exists.
NOTIFY pgrst, 'reload schema';
