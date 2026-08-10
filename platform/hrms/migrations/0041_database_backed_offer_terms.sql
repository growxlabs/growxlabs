BEGIN;

ALTER TABLE recruitment.offers
  ADD COLUMN IF NOT EXISTS compensation_type text,
  ADD COLUMN IF NOT EXISTS fixed_stipend numeric(14,2),
  ADD COLUMN IF NOT EXISTS stipend_period text,
  ADD COLUMN IF NOT EXISTS incentive_type text,
  ADD COLUMN IF NOT EXISTS incentive_value numeric(14,2),
  ADD COLUMN IF NOT EXISTS incentive_basis text,
  ADD COLUMN IF NOT EXISTS payment_timing text,
  ADD COLUMN IF NOT EXISTS compensation_notes text;

CREATE TABLE IF NOT EXISTS recruitment.offer_term_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  name text NOT NULL,
  engagement_type text NOT NULL,
  employment_type text NOT NULL,
  designation_id uuid REFERENCES people.designations(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','retired')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, name)
);

CREATE TABLE IF NOT EXISTS recruitment.offer_term_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  template_id uuid NOT NULL REFERENCES recruitment.offer_term_templates(id),
  version integer NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','retired')),
  effective_from timestamptz,
  effective_until timestamptz,
  working_terms text NOT NULL,
  confidentiality_ip_terms text NOT NULL,
  termination_terms text NOT NULL,
  acceptance_instructions text NOT NULL,
  created_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, version),
  CHECK (status <> 'approved' OR approved_at IS NOT NULL)
);

CREATE OR REPLACE FUNCTION recruitment.protect_approved_offer_term_version()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = 'approved' THEN
    RAISE EXCEPTION 'Approved offer term template versions are immutable';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END $$;

DROP TRIGGER IF EXISTS protect_approved_offer_term_version ON recruitment.offer_term_template_versions;
CREATE TRIGGER protect_approved_offer_term_version
BEFORE UPDATE OR DELETE ON recruitment.offer_term_template_versions
FOR EACH ROW EXECUTE FUNCTION recruitment.protect_approved_offer_term_version();

ALTER TABLE recruitment.offer_term_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment.offer_term_template_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS offer_term_templates_service ON recruitment.offer_term_templates;
CREATE POLICY offer_term_templates_service ON recruitment.offer_term_templates
  FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS offer_term_template_versions_service ON recruitment.offer_term_template_versions;
CREATE POLICY offer_term_template_versions_service ON recruitment.offer_term_template_versions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

WITH template AS (
  INSERT INTO recruitment.offer_term_templates (
    organisation_id, name, engagement_type, employment_type, designation_id, status
  )
  SELECT
    '8e7d6c54-68f1-4d19-9bf5-c20fe6c37721'::uuid,
    'Founding BDE Internship',
    'Founding Internship',
    'Internship',
    d.id,
    'active'
  FROM people.designations d
  WHERE d.organisation_id = '8e7d6c54-68f1-4d19-9bf5-c20fe6c37721'::uuid
    AND upper(d.code) = 'BDE'
    AND d.deleted_at IS NULL
  LIMIT 1
  ON CONFLICT (organisation_id, name) DO UPDATE SET
    designation_id = EXCLUDED.designation_id,
    employment_type = EXCLUDED.employment_type,
    engagement_type = EXCLUDED.engagement_type,
    status = 'active',
    updated_at = now()
  RETURNING id, organisation_id
)
INSERT INTO recruitment.offer_term_template_versions (
  organisation_id, template_id, version, status, effective_from,
  working_terms, confidentiality_ip_terms, termination_terms,
  acceptance_instructions, approved_at
)
SELECT
  organisation_id,
  id,
  1,
  'approved',
  now(),
  'This is a founding internship in Business Development with GrowXLabs. Your primary responsibilities are to research prospective companies, identify relevant decision-makers, conduct approved outbound outreach, qualify prospects, maintain accurate lead and follow-up records, and schedule qualified meetings for the GrowXLabs team. You will work remotely unless GrowXLabs confirms another arrangement in writing. You are expected to maintain regular communication with your reporting manager, keep assigned lead records up to date, attend scheduled team meetings, and complete agreed follow-ups within the required timelines. You may communicate with prospects and qualify opportunities, but you are not authorised to issue proposals, quotations, contracts, agreements, invoices, pricing commitments, or other commercial commitments on behalf of GrowXLabs unless separately authorised in writing. Your incentive entitlement, if applicable, will be governed by the compensation and incentive terms stated in this offer.',
  'During your internship you may have access to non-public information belonging to GrowXLabs, its clients, prospects, partners, or team members. You must keep this information confidential and must not share, copy, publish, forward, or use it for any purpose outside your GrowXLabs responsibilities without written authorisation. Confidential information includes client and prospect information, contact lists, pricing, proposals, credentials, internal documents, product plans, source code, technical material, research, sales information, and other information that has not been made public by GrowXLabs. Any work product you create specifically as part of your assigned GrowXLabs responsibilities must be handled according to the intellectual-property terms stated in your engagement documents and applicable law. Your confidentiality obligations continue after your internship ends for information that remains confidential.',
  'Either you or GrowXLabs may end the internship by giving the notice stated in this offer. GrowXLabs may end the internship without completing the normal notice period in cases of serious misconduct, fraud, deliberate misuse of company or client information, serious confidentiality or security violations, or another material breach of the terms of the internship, subject to applicable law. Any earned and payable incentive or other amount due up to the effective end date will be handled according to the compensation terms and applicable requirements.',
  'Please review this offer carefully. To accept it, open your secure GrowXLabs candidate portal and select Accept Offer before the offer expiry date shown in this document. Your acceptance applies to the exact offer version displayed in the portal. If any information is incorrect or you would like clarification before accepting, contact GrowXLabs before submitting your acceptance. If you do not accept the offer before the expiry date, the offer may expire and GrowXLabs may issue a revised offer if appropriate.',
  now()
FROM template
ON CONFLICT (template_id, version) DO NOTHING;

COMMIT;

NOTIFY pgrst, 'reload schema';
