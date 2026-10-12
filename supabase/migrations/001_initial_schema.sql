-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'educator', 'admin')),
  institution_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create institutions table
CREATE TABLE institutions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scenarios table
CREATE TABLE scenarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES profiles(id),
  institution_id UUID REFERENCES institutions(id),
  is_published BOOLEAN DEFAULT FALSE,
  estimated_duration INTEGER DEFAULT 15, -- in minutes
  learning_objectives TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student progress table
CREATE TABLE student_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score INTEGER,
  time_spent INTEGER DEFAULT 0, -- in minutes
  attempts INTEGER DEFAULT 0,
  answers JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, scenario_id)
);

-- Create badges table
CREATE TABLE badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria JSONB NOT NULL,
  points INTEGER DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('scenario', 'streak', 'achievement', 'social')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student badges table
CREATE TABLE student_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

-- Create lessons table (for flipped classroom)
CREATE TABLE lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  duration INTEGER DEFAULT 10, -- in minutes
  prerequisites UUID[] DEFAULT '{}', -- scenario IDs
  learning_objectives TEXT[],
  is_published BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES profiles(id),
  institution_id UUID REFERENCES institutions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student lesson progress table
CREATE TABLE student_lesson_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0,
  quiz_score INTEGER,
  time_spent INTEGER DEFAULT 0, -- in minutes
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- Create entitlements table (for monetization)
CREATE TABLE entitlements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'trial' CHECK (tier IN ('trial', 'basic', 'premium', 'enterprise')),
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  completed_scenarios UUID[] DEFAULT '{}',
  total_scenarios_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_institution ON profiles(institution_id);
CREATE INDEX idx_scenarios_category ON scenarios(category);
CREATE INDEX idx_scenarios_difficulty ON scenarios(difficulty);
CREATE INDEX idx_scenarios_published ON scenarios(is_published);
CREATE INDEX idx_student_progress_student ON student_progress(student_id);
CREATE INDEX idx_student_progress_scenario ON student_progress(scenario_id);
CREATE INDEX idx_student_progress_status ON student_progress(status);
CREATE INDEX idx_student_badges_student ON student_badges(student_id);
CREATE INDEX idx_entitlements_user ON entitlements(user_id);
CREATE INDEX idx_entitlements_tier ON entitlements(tier);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can read their own profile and educators can read all profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Educators can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin')
    )
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Scenarios: Published scenarios are readable by all, custom scenarios by author
CREATE POLICY "Published scenarios are readable" ON scenarios
  FOR SELECT USING (is_published = true);

CREATE POLICY "Authors can manage own scenarios" ON scenarios
  FOR ALL USING (author_id = auth.uid());

CREATE POLICY "Educators can manage all scenarios" ON scenarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin')
    )
  );

-- Student progress: Students can manage their own progress
CREATE POLICY "Students can manage own progress" ON student_progress
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Educators can view all progress" ON student_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin')
    )
  );

-- Badges: Readable by all
CREATE POLICY "Badges are readable" ON badges
  FOR SELECT USING (true);

-- Student badges: Students can view their own badges
CREATE POLICY "Students can view own badges" ON student_badges
  FOR SELECT USING (student_id = auth.uid());

-- Lessons: Similar to scenarios
CREATE POLICY "Published lessons are readable" ON lessons
  FOR SELECT USING (is_published = true);

CREATE POLICY "Authors can manage own lessons" ON lessons
  FOR ALL USING (author_id = auth.uid());

-- Student lesson progress: Students can manage their own progress
CREATE POLICY "Students can manage own lesson progress" ON student_lesson_progress
  FOR ALL USING (student_id = auth.uid());

-- Entitlements: Users can view their own entitlements
CREATE POLICY "Users can view own entitlements" ON entitlements
  FOR SELECT USING (user_id = auth.uid());

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entitlements_updated_at BEFORE UPDATE ON entitlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default badges
INSERT INTO badges (name, description, icon, criteria, points, category) VALUES
('First Steps', 'Complete your first scenario', '🎯', '{"type": "scenarios_completed", "value": 1}', 10, 'scenario'),
('Quick Learner', 'Complete 5 scenarios', '⚡', '{"type": "scenarios_completed", "value": 5}', 25, 'scenario'),
('Scenario Master', 'Complete 25 scenarios', '🏆', '{"type": "scenarios_completed", "value": 25}', 100, 'scenario'),
('Perfect Score', 'Get 100% on a scenario', '💯', '{"type": "score_threshold", "value": 100}', 50, 'achievement'),
('Streak Starter', 'Complete scenarios for 3 days in a row', '🔥', '{"type": "streak_days", "value": 3}', 30, 'streak'),
('Week Warrior', 'Complete scenarios for 7 days in a row', '⚔️', '{"type": "streak_days", "value": 7}', 75, 'streak'),
('Cardiac Expert', 'Complete all cardiac scenarios', '❤️', '{"type": "category_mastery", "category": "Cardiac"}', 40, 'achievement'),
('Neuro Specialist', 'Complete all neurological scenarios', '🧠', '{"type": "category_mastery", "category": "Neurological"}', 40, 'achievement');
