-- Update RLS policies for the new simplified schema

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view tests" ON tests;
DROP POLICY IF EXISTS "Admins can insert tests" ON tests;
DROP POLICY IF EXISTS "Admins can update tests" ON tests;
DROP POLICY IF EXISTS "Admins can delete tests" ON tests;
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
DROP POLICY IF EXISTS "Admins can insert questions" ON questions;
DROP POLICY IF EXISTS "Admins can update questions" ON questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON questions;
DROP POLICY IF EXISTS "Users can view their own test attempts" ON user_test_attempts;
DROP POLICY IF EXISTS "Users can insert their own test attempts" ON user_test_attempts;
DROP POLICY IF EXISTS "Users can update their own test attempts" ON user_test_attempts;
DROP POLICY IF EXISTS "Users can view their own answers" ON user_answers;
DROP POLICY IF EXISTS "Users can insert their own answers" ON user_answers;

-- Tests Policies (one test per category)
CREATE POLICY "Anyone can view tests"
  ON tests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert tests"
  ON tests FOR INSERT
  TO authenticated
  WITH CHECK (is_user_admin());

CREATE POLICY "Admins can update tests"
  ON tests FOR UPDATE
  TO authenticated
  USING (is_user_admin());

CREATE POLICY "Admins can delete tests"
  ON tests FOR DELETE
  TO authenticated
  USING (is_user_admin());

-- User Test Attempts Policies
CREATE POLICY "Users can view their own test attempts"
  ON user_test_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test attempts"
  ON user_test_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test attempts"
  ON user_test_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

