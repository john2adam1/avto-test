-- Redesign schema: One test per category, one question per test
-- This script restructures the database to match the new requirements

-- First, drop existing foreign key constraints
ALTER TABLE IF EXISTS tests DROP CONSTRAINT IF EXISTS tests_test_type_id_fkey;
ALTER TABLE IF EXISTS questions DROP CONSTRAINT IF EXISTS questions_test_id_fkey;
ALTER TABLE IF EXISTS user_test_attempts DROP CONSTRAINT IF EXISTS user_test_attempts_test_id_fkey;
ALTER TABLE IF EXISTS user_answers DROP CONSTRAINT IF EXISTS user_answers_question_id_fkey;

-- Drop old tables (data will be lost - this is intentional for redesign)
DROP TABLE IF EXISTS user_answers CASCADE;
DROP TABLE IF EXISTS user_test_attempts CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS tests CASCADE;

-- Create new simplified tests table (one test per category)
-- Each test has one question with image and 4 answers directly in the test
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type_id UUID NOT NULL UNIQUE REFERENCES test_types(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  image_url TEXT,
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  answer_0 TEXT NOT NULL,
  answer_1 TEXT NOT NULL,
  answer_2 TEXT NOT NULL,
  answer_3 TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_test_attempts table (simplified - no separate answers table needed)
CREATE TABLE IF NOT EXISTS user_test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  selected_answer INTEGER NOT NULL CHECK (selected_answer >= 0 AND selected_answer <= 3),
  is_correct BOOLEAN NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER, -- in seconds
  score INTEGER, -- 0 or 100 (pass/fail)
  passed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tests_test_type_id ON tests(test_type_id);
CREATE INDEX IF NOT EXISTS idx_user_test_attempts_user_id ON user_test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_test_attempts_test_id ON user_test_attempts(test_id);

-- Add constraint to ensure one test per category
CREATE UNIQUE INDEX IF NOT EXISTS idx_tests_test_type_unique ON tests(test_type_id);

