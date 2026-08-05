-- Migration: 0023_recruitment_email_system.sql
-- Description: Creates tables and policies for the recruitment email system.

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Email Templates Table
CREATE TABLE IF NOT EXISTS recruitment.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  template_key TEXT NOT NULL,  -- 'application_received', 'interview_invite', 'assessment_invite', 'offer_extended', 'rejection', 'stage_update', 'general'
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  variables JSONB DEFAULT '[]'::jsonb,  -- list of supported variable names
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organisation_id, template_key)
);

-- 2. Email Logs Table
CREATE TABLE IF NOT EXISTS recruitment.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  template_key TEXT,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  candidate_id TEXT,
  application_id UUID,
  job_id UUID,
  subject TEXT NOT NULL,
  html_body TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'sent', 'failed', 'bounced'
  message_id TEXT,  -- Resend message ID
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. Email Settings Table
CREATE TABLE IF NOT EXISTS recruitment.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL UNIQUE,
  provider TEXT DEFAULT 'resend',
  from_name TEXT DEFAULT 'GrowXLabs',
  from_email TEXT DEFAULT 'noreply@growxlabs.tech',
  reply_to TEXT DEFAULT 'hr@growxlabs.tech',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_org_created ON recruitment.email_logs(organisation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_candidate_id ON recruitment.email_logs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_application_id ON recruitment.email_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON recruitment.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_templates_org_id ON recruitment.email_templates(organisation_id);

-- 5. Updated_at Triggers
DROP TRIGGER IF EXISTS update_recruitment_email_templates_updated_at ON recruitment.email_templates;
CREATE TRIGGER update_recruitment_email_templates_updated_at
BEFORE UPDATE ON recruitment.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_recruitment_email_settings_updated_at ON recruitment.email_settings;
CREATE TRIGGER update_recruitment_email_settings_updated_at
BEFORE UPDATE ON recruitment.email_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Seed Default Templates
INSERT INTO recruitment.email_templates (organisation_id, template_key, name, subject, html_body, variables, is_active)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'application_received',
    'Application Received',
    'Application Received: {{jobTitle}} at GrowXLabs',
    '<!-- HTML rendered by React Email -->',
    '["candidateName", "jobTitle", "companyName"]'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'interview_invite',
    'Interview Invitation',
    'Invitation to Interview with GrowXLabs for {{jobTitle}}',
    '<!-- HTML rendered by React Email -->',
    '["candidateName", "jobTitle", "companyName", "interviewDate", "interviewLink"]'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'assessment_invite',
    'Assessment Invitation',
    'Assessment for {{jobTitle}} at GrowXLabs',
    '<!-- HTML rendered by React Email -->',
    '["candidateName", "jobTitle", "companyName", "assessmentLink", "deadline"]'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'offer_extended',
    'Offer Extended',
    'Offer of Employment: {{jobTitle}} at GrowXLabs',
    '<!-- HTML rendered by React Email -->',
    '["candidateName", "jobTitle", "companyName", "offerLink"]'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'rejection',
    'Application Update',
    'Update regarding your application for {{jobTitle}}',
    '<!-- HTML rendered by React Email -->',
    '["candidateName", "jobTitle", "companyName"]'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'stage_update',
    'Stage Update',
    'Application Update: {{jobTitle}} at GrowXLabs',
    '<!-- HTML rendered by React Email -->',
    '["candidateName", "jobTitle", "companyName", "stageName"]'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'general',
    'Message from GrowXLabs',
    '{{subject}}',
    '<!-- HTML rendered by React Email -->',
    '["candidateName", "messageContent", "companyName", "subject"]'::jsonb,
    true
  )
ON CONFLICT (organisation_id, template_key) DO NOTHING;

-- 7. RLS Policies
-- Enable RLS
ALTER TABLE recruitment.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.email_settings ENABLE ROW LEVEL SECURITY;

-- Provider configuration is intentionally stored separately from secrets. The
-- password is never persisted; SMTP credentials belong in deployment secrets.
ALTER TABLE recruitment.email_settings ADD COLUMN IF NOT EXISTS smtp_host TEXT;
ALTER TABLE recruitment.email_settings ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587;
ALTER TABLE recruitment.email_settings ADD COLUMN IF NOT EXISTS smtp_username TEXT;
ALTER TABLE recruitment.email_settings ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMPTZ;
ALTER TABLE recruitment.email_settings ADD COLUMN IF NOT EXISTS failed_emails_count INTEGER DEFAULT 0;

-- Email Templates Policies
CREATE POLICY "Enable read for authenticated users" ON recruitment.email_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all for admins" ON recruitment.email_templates FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Email Logs Policies
CREATE POLICY "Enable read for authenticated users" ON recruitment.email_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all for admins" ON recruitment.email_logs FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Email Settings Policies
CREATE POLICY "Enable read for authenticated users" ON recruitment.email_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all for admins" ON recruitment.email_settings FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');
