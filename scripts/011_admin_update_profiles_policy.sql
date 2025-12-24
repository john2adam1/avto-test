-- Allow admins to update other users' profiles (for admin management)
-- This policy allows admins to update is_admin, subscription fields, etc.

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_user_admin())
  WITH CHECK (is_user_admin());

-- Also allow admins to view all profiles (if not already present from 006_admin_rls_policies.sql)
-- This is a safety check - the policy from 006 should already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles"
      ON profiles FOR SELECT
      TO authenticated
      USING (is_user_admin());
  END IF;
END $$;

