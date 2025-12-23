-- Backfill trial periods for existing users who don't have one
UPDATE profiles
SET 
  trial_ends_at = NOW() + INTERVAL '1 day',
  created_at = NOW()
WHERE trial_ends_at IS NULL;
