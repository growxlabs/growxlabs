BEGIN;

ALTER TABLE recruitment.offers
  ADD COLUMN IF NOT EXISTS fixed_amount numeric(14,2),
  ADD COLUMN IF NOT EXISTS fixed_frequency text CHECK (fixed_frequency IS NULL OR fixed_frequency IN ('monthly','annual')),
  ADD COLUMN IF NOT EXISTS incentive_value_type text CHECK (incentive_value_type IS NULL OR incentive_value_type IN ('percentage','fixed_amount')),
  ADD COLUMN IF NOT EXISTS review_period_days integer,
  ADD COLUMN IF NOT EXISTS post_review_compensation_type text,
  ADD COLUMN IF NOT EXISTS post_review_fixed_amount numeric(14,2),
  ADD COLUMN IF NOT EXISTS post_review_fixed_frequency text CHECK (post_review_fixed_frequency IS NULL OR post_review_fixed_frequency IN ('monthly','annual'));

ALTER TABLE recruitment.offers
  ADD CONSTRAINT offers_review_period_days_positive CHECK (review_period_days IS NULL OR review_period_days > 0),
  ADD CONSTRAINT offers_post_review_amount_positive CHECK (post_review_fixed_amount IS NULL OR post_review_fixed_amount > 0),
  ADD CONSTRAINT offers_post_review_frequency_required CHECK (post_review_fixed_amount IS NULL OR post_review_fixed_frequency IS NOT NULL);

COMMENT ON COLUMN recruitment.offers.fixed_amount IS 'Fixed compensation amount; never infer frequency from this value.';
COMMENT ON COLUMN recruitment.offers.incentive_value_type IS 'Whether incentive_value is a percentage or a currency amount.';

COMMIT;

NOTIFY pgrst, 'reload schema';
