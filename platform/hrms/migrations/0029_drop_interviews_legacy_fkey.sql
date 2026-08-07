-- ============================================================================
-- GROWXLABS RECRUITMENT — INTERVIEWS LEGACY CONSTRAINT CLEANUP
-- Migration: 0029_drop_interviews_legacy_fkey.sql
-- ============================================================================

-- Drop legacy foreign key constraint pointing to obsolete job_applications table
ALTER TABLE recruitment.interviews DROP CONSTRAINT IF EXISTS interviews_application_id_fkey;
