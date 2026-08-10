BEGIN;

ALTER TABLE recruitment.offers
  ADD COLUMN IF NOT EXISTS document_ready_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'not_sent',
  ADD COLUMN IF NOT EXISTS delivery_error text,
  ADD COLUMN IF NOT EXISTS email_message_id text;

ALTER TABLE recruitment.offers
  DROP CONSTRAINT IF EXISTS recruitment_offers_delivery_status_check;
ALTER TABLE recruitment.offers
  ADD CONSTRAINT recruitment_offers_delivery_status_check
  CHECK (delivery_status IN ('not_sent','sending','sent','failed'));

CREATE UNIQUE INDEX IF NOT EXISTS recruitment_offer_version_document_uq
  ON recruitment.offer_versions(offer_id, version)
  WHERE document_id IS NOT NULL;

COMMIT;
