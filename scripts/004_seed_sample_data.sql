-- Seed sample test types
INSERT INTO test_types (id, name, description, time_limit) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Mathematics', 'Test your math skills with various problems', 600),
  ('00000000-0000-0000-0000-000000000002', 'General Knowledge', 'Test your knowledge on various topics', 900),
  ('00000000-0000-0000-0000-000000000003', 'Programming', 'Test your programming knowledge', 1200)
ON CONFLICT (id) DO NOTHING;

-- Seed a sample Mathematics test
INSERT INTO tests (id, test_type_id, title) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Basic Math Quiz')
ON CONFLICT (id) DO NOTHING;

-- Seed sample questions for Mathematics test
INSERT INTO questions (test_id, question_text, image_url, correct_answer, answer_0, answer_1, answer_2, answer_3, order_index) VALUES
  ('10000000-0000-0000-0000-000000000001', 'What is 15 + 27?', '/placeholder.svg?height=200&width=400', 2, '40', '41', '42', '43', 1),
  ('10000000-0000-0000-0000-000000000001', 'What is the square root of 144?', '/placeholder.svg?height=200&width=400', 1, '11', '12', '13', '14', 2),
  ('10000000-0000-0000-0000-000000000001', 'What is 8 × 7?', '/placeholder.svg?height=200&width=400', 3, '54', '55', '54', '56', 3),
  ('10000000-0000-0000-0000-000000000001', 'What is 100 ÷ 4?', '/placeholder.svg?height=200&width=400', 0, '25', '20', '30', '24', 4),
  ('10000000-0000-0000-0000-000000000001', 'What is 5² (5 squared)?', '/placeholder.svg?height=200&width=400', 1, '10', '25', '20', '15', 5)
ON CONFLICT DO NOTHING;

-- Seed a sample General Knowledge test
INSERT INTO tests (id, test_type_id, title) VALUES
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'World Facts Quiz')
ON CONFLICT (id) DO NOTHING;

-- Seed sample questions for General Knowledge test
INSERT INTO questions (test_id, question_text, image_url, correct_answer, answer_0, answer_1, answer_2, answer_3, order_index) VALUES
  ('10000000-0000-0000-0000-000000000002', 'What is the capital of France?', '/placeholder.svg?height=200&width=400', 1, 'London', 'Paris', 'Berlin', 'Madrid', 1),
  ('10000000-0000-0000-0000-000000000002', 'Which planet is known as the Red Planet?', '/placeholder.svg?height=200&width=400', 2, 'Venus', 'Jupiter', 'Mars', 'Saturn', 2),
  ('10000000-0000-0000-0000-000000000002', 'Who painted the Mona Lisa?', '/placeholder.svg?height=200&width=400', 0, 'Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Donatello', 3),
  ('10000000-0000-0000-0000-000000000002', 'What is the largest ocean on Earth?', '/placeholder.svg?height=200&width=400', 3, 'Atlantic', 'Indian', 'Arctic', 'Pacific', 4),
  ('10000000-0000-0000-0000-000000000002', 'In which year did World War II end?', '/placeholder.svg?height=200&width=400', 1, '1944', '1945', '1946', '1943', 5)
ON CONFLICT DO NOTHING;

-- Seed a sample Programming test
INSERT INTO tests (id, test_type_id, title) VALUES
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'JavaScript Basics Quiz')
ON CONFLICT (id) DO NOTHING;

-- Seed sample questions for Programming test
INSERT INTO questions (test_id, question_text, image_url, correct_answer, answer_0, answer_1, answer_2, answer_3, order_index) VALUES
  ('10000000-0000-0000-0000-000000000003', 'Which keyword is used to declare a variable in JavaScript?', '/placeholder.svg?height=200&width=400', 1, 'var only', 'var, let, const', 'variable', 'declare', 1),
  ('10000000-0000-0000-0000-000000000003', 'What does JSON stand for?', '/placeholder.svg?height=200&width=400', 2, 'Java Syntax Object Notation', 'Just Some Object Notation', 'JavaScript Object Notation', 'Java Standard Object Notation', 2),
  ('10000000-0000-0000-0000-000000000003', 'Which method is used to add an element to the end of an array?', '/placeholder.svg?height=200&width=400', 0, 'push()', 'add()', 'append()', 'insert()', 3),
  ('10000000-0000-0000-0000-000000000003', 'What is the result of typeof null in JavaScript?', '/placeholder.svg?height=200&width=400', 3, 'null', 'undefined', 'number', 'object', 4),
  ('10000000-0000-0000-0000-000000000003', 'Which operator is used for strict equality in JavaScript?', '/placeholder.svg?height=200&width=400', 1, '==', '===', '=', '!=', 5)
ON CONFLICT DO NOTHING;
