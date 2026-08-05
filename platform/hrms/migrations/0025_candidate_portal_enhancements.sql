-- ============================================================================
-- GROWXLABS RECRUITMENT — CANDIDATE PORTAL ENHANCEMENTS MIGRATION
-- Migration: 0025_candidate_portal_enhancements.sql
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS recruitment;

-- ----------------------------------------------------------------------------
-- 1. CANDIDATE OTPS
-- Secure 6-digit verification codes for candidate OTP email login
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 2. CANDIDATE RESCHEDULE REQUESTS
-- Reschedule requests submitted by candidates for scheduled interviews
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recruitment.candidate_reschedule_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  interview_id UUID NOT NULL REFERENCES recruitment.interviews(id) ON DELETE CASCADE,
  application_id UUID NOT NULL,
  candidate_email VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  preferred_times TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, approved, declined
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reschedule_interview ON recruitment.candidate_reschedule_requests(interview_id);
CREATE INDEX IF NOT EXISTS idx_reschedule_app ON recruitment.candidate_reschedule_requests(application_id);

-- ----------------------------------------------------------------------------
-- 3. CANDIDATE OFFER RESPONSES
-- Candidate accept/reject decision records for extended job offers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recruitment.candidate_offer_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  offer_id UUID REFERENCES recruitment.offers(id) ON DELETE SET NULL,
  application_id UUID NOT NULL,
  candidate_email VARCHAR(255) NOT NULL,
  decision VARCHAR(32) NOT NULL, -- accepted, rejected
  notes TEXT,
  responded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_offer_responses_app ON recruitment.candidate_offer_responses(application_id);

-- Enable RLS
ALTER TABLE recruitment.candidate_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.candidate_reschedule_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.candidate_offer_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "candidate_otps_admin_all" ON recruitment.candidate_otps FOR ALL USING (true);
CREATE POLICY "candidate_reschedule_admin_all" ON recruitment.candidate_reschedule_requests FOR ALL USING (true);
CREATE POLICY "candidate_offer_responses_admin_all" ON recruitment.candidate_offer_responses FOR ALL USING (true);
