-- Enable Row Level Security on all tables
ALTER TABLE test_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_types (public read access)
CREATE POLICY "Anyone can view test types"
  ON test_types FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for tests (public read access)
CREATE POLICY "Anyone can view tests"
  ON tests FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for questions (public read access)
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_test_attempts (users can only access their own attempts)
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

-- RLS Policies for user_answers (users can only access their own answers)
CREATE POLICY "Users can view their own answers"
  ON user_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_test_attempts
      WHERE user_test_attempts.id = user_answers.attempt_id
      AND user_test_attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own answers"
  ON user_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_test_attempts
      WHERE user_test_attempts.id = user_answers.attempt_id
      AND user_test_attempts.user_id = auth.uid()
    )
  );

-- RLS Policies for profiles (users can view their own profile)
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
