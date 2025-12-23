-- Add subscription tracking fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Create function to check if user has active access
CREATE OR REPLACE FUNCTION has_active_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND (
      is_admin = true OR
      trial_ends_at > NOW() OR
      subscription_ends_at > NOW()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the profile creation trigger to include trial period
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, trial_ends_at, created_at)
  VALUES (
    new.id,
    new.email,
    NOW() + INTERVAL '1 day',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION has_active_subscription(UUID) TO authenticated;

COMMENT ON COLUMN profiles.trial_ends_at IS 'End date of 1-day free trial period';
COMMENT ON COLUMN profiles.subscription_ends_at IS 'End date of paid subscription';
COMMENT ON COLUMN profiles.created_at IS 'Profile creation timestamp';
