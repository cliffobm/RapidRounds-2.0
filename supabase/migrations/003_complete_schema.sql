-- Complete schema migration for RapidRounds nursing education platform
-- This migration consolidates all schema changes and ensures proper setup

-- Drop existing constraints and indexes that might conflict
DROP INDEX IF EXISTS idx_scenarios_category;
DROP INDEX IF EXISTS idx_scenarios_difficulty;
DROP INDEX IF EXISTS idx_scenarios_published;

-- Create categories table (normalized)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table (normalized)
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'text', 'priority', 'assessment', 'true_false')),
  options JSONB, -- For multiple choice options
  correct_answer JSONB NOT NULL, -- Can be string, array, or object
  explanation TEXT,
  rationale TEXT,
  points INTEGER DEFAULT 1,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category TEXT, -- Assessment, Intervention, Evaluation, Planning
  time_limit INTEGER, -- in seconds
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile_options table for user preferences
CREATE TABLE IF NOT EXISTS profile_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  option_key TEXT NOT NULL,
  option_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, option_key)
);

-- Create scenario_categories junction table (many-to-many)
CREATE TABLE IF NOT EXISTS scenario_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scenario_id, category_id)
);

-- Create student_answers table (normalized)
CREATE TABLE IF NOT EXISTS student_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  answer JSONB NOT NULL,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  attempt_number INTEGER DEFAULT 1,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, question_id, attempt_number)
);

-- Update scenarios table to use category_id instead of category text
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create leaderboard view
CREATE OR REPLACE VIEW leaderboard_v WITH (security_invoker = true) AS
SELECT
  p.id as student_id,
  p.full_name as student_name,
  p.institution_id,
  COALESCE(SUM(sa.points_earned), 0) as total_points,
  COUNT(DISTINCT sp.scenario_id) as scenarios_completed,
  COALESCE(AVG(sp.score), 0) as average_score,
  COUNT(DISTINCT sb.badge_id) as badges_earned,
  MAX(sp.completed_at) as last_activity,
  ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(sa.points_earned), 0) DESC, COUNT(DISTINCT sp.scenario_id) DESC) as rank
FROM profiles p
LEFT JOIN student_progress sp ON p.id = sp.student_id AND sp.status = 'completed'
LEFT JOIN student_answers sa ON p.id = sa.student_id
LEFT JOIN student_badges sb ON p.id = sb.student_id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.institution_id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_scenario ON questions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);
CREATE INDEX IF NOT EXISTS idx_profile_options_user ON profile_options(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_options_key ON profile_options(option_key);
CREATE INDEX IF NOT EXISTS idx_scenario_categories_scenario ON scenario_categories(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_categories_category ON scenario_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_student ON student_answers(student_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_question ON student_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_scenario ON student_answers(scenario_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_answered_at ON student_answers(answered_at);

-- Recreate scenario indexes with new structure
CREATE INDEX IF NOT EXISTS idx_scenarios_category_id ON scenarios(category_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_difficulty ON scenarios(difficulty);
CREATE INDEX IF NOT EXISTS idx_scenarios_published ON scenarios(is_published);
CREATE INDEX IF NOT EXISTS idx_scenarios_tags ON scenarios USING GIN(tags);

-- Enable RLS on new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
DROP POLICY IF EXISTS "Questions are readable for published scenarios" ON questions;
DROP POLICY IF EXISTS "Users can manage own profile options" ON profile_options;
DROP POLICY IF EXISTS "Scenario categories are publicly readable" ON scenario_categories;
DROP POLICY IF EXISTS "Students can manage own answers" ON student_answers;
DROP POLICY IF EXISTS "Educators can view all answers" ON student_answers;

-- RLS Policies for categories (public read)
CREATE POLICY "Categories are publicly readable" ON categories
  FOR SELECT USING (is_active = true);

-- RLS Policies for questions (public read for published scenarios)
CREATE POLICY "Questions are readable for published scenarios" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM scenarios
      WHERE id = questions.scenario_id AND is_published = true
    )
  );

-- RLS Policies for profile_options (owner only)
CREATE POLICY "Users can manage own profile options" ON profile_options
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for scenario_categories (public read)
CREATE POLICY "Scenario categories are publicly readable" ON scenario_categories
  FOR SELECT USING (true);

-- RLS Policies for student_answers (owner only)
CREATE POLICY "Students can manage own answers" ON student_answers
  FOR ALL USING (student_id = auth.uid());

-- RLS Policies for student_answers (educators can view)
CREATE POLICY "Educators can view all answers" ON student_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('educator', 'admin')
    )
  );

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profile_options_updated_at ON profile_options;
CREATE TRIGGER update_profile_options_updated_at BEFORE UPDATE ON profile_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate question points
CREATE OR REPLACE FUNCTION calculate_question_points(
  p_question_id UUID,
  p_answer JSONB
) RETURNS INTEGER AS $$
DECLARE
  question_record questions%ROWTYPE;
  points INTEGER := 0;
BEGIN
  SELECT * INTO question_record FROM questions WHERE id = p_question_id;

  IF question_record.correct_answer = p_answer THEN
    points := question_record.points;
  END IF;

  RETURN points;
END;
$$ LANGUAGE plpgsql;

-- Create function to update student progress
CREATE OR REPLACE FUNCTION update_student_progress(
  p_student_id UUID,
  p_scenario_id UUID
) RETURNS VOID AS $$
DECLARE
  total_points INTEGER;
  total_questions INTEGER;
  score_percentage INTEGER;
BEGIN
  -- Calculate total points earned
  SELECT COALESCE(SUM(points_earned), 0) INTO total_points
  FROM student_answers
  WHERE student_id = p_student_id AND scenario_id = p_scenario_id;

  -- Calculate total possible points
  SELECT COALESCE(SUM(points), 0) INTO total_questions
  FROM questions
  WHERE scenario_id = p_scenario_id AND is_active = true;

  -- Calculate score percentage
  IF total_questions > 0 THEN
    score_percentage := (total_points * 100) / total_questions;
  ELSE
    score_percentage := 0;
  END IF;

  -- Update or insert student progress
  INSERT INTO student_progress (student_id, scenario_id, score, status, completed_at)
  VALUES (p_student_id, p_scenario_id, score_percentage, 'completed', NOW())
  ON CONFLICT (student_id, scenario_id)
  DO UPDATE SET
    score = score_percentage,
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically calculate points when student answers
CREATE OR REPLACE FUNCTION calculate_student_answer_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate points earned for this answer
  NEW.points_earned := calculate_question_points(NEW.question_id, NEW.answer);

  -- Determine if answer is correct
  NEW.is_correct := (NEW.points_earned > 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate points
DROP TRIGGER IF EXISTS calculate_points_trigger ON student_answers;
CREATE TRIGGER calculate_points_trigger
  BEFORE INSERT OR UPDATE ON student_answers
  FOR EACH ROW EXECUTE FUNCTION calculate_student_answer_points();

-- Create function to update scenario completion when all questions answered
CREATE OR REPLACE FUNCTION check_scenario_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_questions INTEGER;
  answered_questions INTEGER;
BEGIN
  -- Count total active questions for this scenario
  SELECT COUNT(*) INTO total_questions
  FROM questions
  WHERE scenario_id = NEW.scenario_id AND is_active = true;

  -- Count answered questions for this student and scenario
  SELECT COUNT(DISTINCT question_id) INTO answered_questions
  FROM student_answers
  WHERE student_id = NEW.student_id AND scenario_id = NEW.scenario_id;

  -- If all questions answered, update progress
  IF answered_questions >= total_questions THEN
    PERFORM update_student_progress(NEW.student_id, NEW.scenario_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check scenario completion
DROP TRIGGER IF EXISTS check_completion_trigger ON student_answers;
CREATE TRIGGER check_completion_trigger
  AFTER INSERT OR UPDATE ON student_answers
  FOR EACH ROW EXECUTE FUNCTION check_scenario_completion();
