-- Drop existing policies for test_types, tests, and questions
DROP POLICY IF EXISTS "Anyone can view test types" ON test_types;
DROP POLICY IF EXISTS "Anyone can view tests" ON tests;
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;

-- Test Types Policies
CREATE POLICY "Anyone can view test types"
  ON test_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert test types"
  ON test_types FOR INSERT
  TO authenticated
  WITH CHECK (is_user_admin());

CREATE POLICY "Admins can update test types"
  ON test_types FOR UPDATE
  TO authenticated
  USING (is_user_admin());

CREATE POLICY "Admins can delete test types"
  ON test_types FOR DELETE
  TO authenticated
  USING (is_user_admin());

-- Tests Policies
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

-- Questions Policies
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (is_user_admin());

CREATE POLICY "Admins can update questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (is_user_admin());

CREATE POLICY "Admins can delete questions"
  ON questions FOR DELETE
  TO authenticated
  USING (is_user_admin());

-- Profiles Policies for Admin Access
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_user_admin());
