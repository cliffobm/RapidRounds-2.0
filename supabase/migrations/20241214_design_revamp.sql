-- Design Revamp Migration
-- Adds tables for the new RapidRounds design system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (enhanced)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'educator', 'admin')),
  credentials TEXT[] DEFAULT '{}',
  institution_id UUID REFERENCES institutions(id),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'trial', 'premium')),
  trial_active BOOLEAN DEFAULT false,
  trial_expires_at TIMESTAMP WITH TIME ZONE,
  trial_rationales_used INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Institutions table
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scenarios table (enhanced)
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system TEXT NOT NULL,
  title TEXT NOT NULL,
  vignette TEXT NOT NULL,
  difficulty TEXT DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category TEXT,
  estimated_duration INTEGER DEFAULT 30, -- minutes
  learning_objectives TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extend the existing legacy tables; CREATE TABLE IF NOT EXISTS does not add columns.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credentials TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'trial', 'premium'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_active BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_rationales_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS system TEXT;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS vignette TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_min INTEGER DEFAULT 10;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'video';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'beginner';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Scenario items table (questions/interactions)
CREATE TABLE IF NOT EXISTS scenario_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mcq', 'multi', 'order', 'input')),
  payload JSONB NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rationales table
CREATE TABLE IF NOT EXISTS rationales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_item_id UUID NOT NULL REFERENCES scenario_items(id) ON DELETE CASCADE,
  hint TEXT NOT NULL,
  "full" TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress tracking
CREATE TABLE IF NOT EXISTS progress (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  correct_count INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 1,
  time_spent INTEGER DEFAULT 0, -- seconds
  PRIMARY KEY (user_id, scenario_id)
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_item_id UUID NOT NULL REFERENCES scenario_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, scenario_item_id)
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  duration_min INTEGER NOT NULL,
  content_url TEXT,
  content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'reading', 'interactive', 'assessment')),
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  prerequisites UUID[] DEFAULT '{}',
  learning_objectives TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lesson checkpoints
CREATE TABLE IF NOT EXISTS lesson_checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB,
  answer_key TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lesson completions
CREATE TABLE IF NOT EXISTS lesson_completions (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  time_spent INTEGER DEFAULT 0, -- seconds
  PRIMARY KEY (user_id, lesson_id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('performance', 'consistency', 'learning', 'social', 'milestone')),
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  xp_reward INTEGER DEFAULT 0,
  requirements JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress JSONB DEFAULT '{}',
  PRIMARY KEY (user_id, achievement_id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope TEXT NOT NULL CHECK (scope IN ('global', 'institution')),
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'alltime')),
  institution_id UUID REFERENCES institutions(id),
  data JSONB NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rationale usage tracking
CREATE TABLE IF NOT EXISTS rationale_usage (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('free', 'premium')),
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, usage_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scenarios_system_difficulty ON scenarios(system, difficulty);
CREATE INDEX IF NOT EXISTS idx_progress_user_scenario ON progress(user_id, scenario_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_lesson ON lesson_completions(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_scenario_items_scenario ON scenario_items(scenario_id);
CREATE INDEX IF NOT EXISTS idx_rationales_scenario_item ON rationales(scenario_item_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_scope_period ON leaderboards(scope, period);
CREATE INDEX IF NOT EXISTS idx_rationale_usage_user ON rationale_usage(user_id);

-- Row Level Security (RLS) Policies

-- Profiles: Users can read/update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Public read access for scenarios and lessons
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published scenarios" ON scenarios FOR SELECT USING (is_published = true);

ALTER TABLE scenario_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view scenario items" ON scenario_items FOR SELECT USING (true);

ALTER TABLE rationales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view rationales" ON rationales FOR SELECT USING (true);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published lessons" ON lessons FOR SELECT USING (is_published = true);

ALTER TABLE lesson_checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lesson checkpoints" ON lesson_checkpoints FOR SELECT USING (true);

-- Progress: Users can read/write their own progress
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON progress FOR UPDATE USING (auth.uid() = user_id);

-- Bookmarks: Users can manage their own bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Lesson completions: Users can manage their own completions
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own completions" ON lesson_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON lesson_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own completions" ON lesson_completions FOR UPDATE USING (auth.uid() = user_id);

-- User achievements: Users can view their own achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements: Public read access
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (is_active = true);

-- Leaderboards: Public read access
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view leaderboards" ON leaderboards FOR SELECT USING (true);

-- Rationale usage: Users can view/update their own usage
ALTER TABLE rationale_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage" ON rationale_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON rationale_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON rationale_usage FOR UPDATE USING (auth.uid() = user_id);

-- Functions for common operations

-- Function to get user's current streak
CREATE OR REPLACE FUNCTION get_user_streak(user_uuid UUID)
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER, last_activity TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
  -- This is a simplified version - in production you'd calculate based on daily activity
  RETURN QUERY
  SELECT
    7 as current_streak,
    15 as longest_streak,
    NOW() as last_activity;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Function to calculate leaderboard rankings
CREATE OR REPLACE FUNCTION calculate_leaderboard(
  scope_param TEXT DEFAULT 'global',
  period_param TEXT DEFAULT 'weekly',
  institution_uuid UUID DEFAULT NULL
)
RETURNS TABLE(
  user_id UUID,
  total_xp INTEGER,
  scenarios_completed INTEGER,
  average_score NUMERIC,
  rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT
      p.user_id,
      COALESCE(SUM(p.score * 10), 0)::INTEGER as total_xp,
      COUNT(p.scenario_id)::INTEGER as scenarios_completed,
      COALESCE(AVG(p.score), 0)::NUMERIC as average_score
    FROM progress p
    JOIN profiles pr ON p.user_id = pr.id
    WHERE
      (scope_param = 'global' OR pr.institution_id = institution_uuid)
      AND (
        period_param = 'alltime' OR
        (period_param = 'weekly' AND p.completed_at >= NOW() - INTERVAL '7 days') OR
        (period_param = 'monthly' AND p.completed_at >= NOW() - INTERVAL '30 days')
      )
    GROUP BY p.user_id
  )
  SELECT
    us.user_id,
    us.total_xp,
    us.scenarios_completed,
    us.average_score,
    ROW_NUMBER() OVER (ORDER BY us.total_xp DESC)::INTEGER as rank
  FROM user_stats us
  ORDER BY us.total_xp DESC;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_scenarios_updated_at ON scenarios;
CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_institutions_updated_at ON institutions;
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data

-- Sample institution
INSERT INTO institutions (id, name, domain) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Metro Health University', 'metro.edu')
ON CONFLICT (id) DO NOTHING;

-- Sample achievements
INSERT INTO achievements (id, title, description, icon, category, rarity, xp_reward, requirements) VALUES
  (uuid_generate_v5(uuid_ns_url(), 'rapidrounds:achievement-first-scenario'), 'First Steps', 'Completed your first scenario', 'star', 'milestone', 'common', 50, '{"scenarios_completed": 1}'),
  (uuid_generate_v5(uuid_ns_url(), 'rapidrounds:achievement-week-warrior'), 'Week Warrior', 'Maintained a 7-day study streak', 'flame', 'consistency', 'rare', 200, '{"streak_days": 7}'),
  (uuid_generate_v5(uuid_ns_url(), 'rapidrounds:achievement-perfect-score'), 'Perfect Score', 'Achieved 100% on a scenario', 'trophy', 'performance', 'uncommon', 150, '{"perfect_scores": 1}'),
  (uuid_generate_v5(uuid_ns_url(), 'rapidrounds:achievement-cardiac-master'), 'Cardiac Master', 'Complete all cardiac scenarios', 'heart', 'learning', 'epic', 500, '{"cardiac_scenarios": 12}'),
  (uuid_generate_v5(uuid_ns_url(), 'rapidrounds:achievement-speed-demon'), 'Speed Demon', 'Complete a scenario in under 5 minutes', 'zap', 'performance', 'rare', 300, '{"fast_completion": 1}'),
  (uuid_generate_v5(uuid_ns_url(), 'rapidrounds:achievement-scholar'), 'Scholar', 'Complete 10 lessons', 'book', 'learning', 'uncommon', 250, '{"lessons_completed": 10}'),
  (uuid_generate_v5(uuid_ns_url(), 'rapidrounds:achievement-mentor'), 'Mentor', 'Help 5 students in discussion forums', 'users', 'social', 'rare', 400, '{"students_helped": 5}'),
  (uuid_generate_v5(uuid_ns_url(), 'rapidrounds:achievement-century'), 'Century Club', 'Complete 100 scenarios', 'award', 'milestone', 'legendary', 1000, '{"scenarios_completed": 100}')
ON CONFLICT (id) DO NOTHING;

-- Sample scenarios
INSERT INTO scenarios (id, system, title, vignette, difficulty, category, content) VALUES
  (uuid_generate_v5(uuid_ns_url(), 'rapidrounds:scenario-cardiac-1'), 'Cardiovascular', 'Acute Chest Pain Assessment', 'A 58-year-old male presents to the ED with crushing chest pain...', 'intermediate', 'cardiac', '{}'::jsonb),
  (uuid_generate_v5(uuid_ns_url(), 'rapidrounds:scenario-respiratory-1'), 'Respiratory', 'COPD Exacerbation Management', 'A 65-year-old female with history of COPD presents with increased dyspnea...', 'beginner', 'respiratory', '{}'::jsonb),
  (uuid_generate_v5(uuid_ns_url(), 'rapidrounds:scenario-neuro-1'), 'Neurological', 'Stroke Recognition and Response', 'A 72-year-old male brought by family for sudden onset weakness...', 'advanced', 'neurological', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Sample lessons
INSERT INTO lessons (id, title, description, duration_min, content_type, difficulty, learning_objectives, is_published, content) VALUES
  (uuid_generate_v5(uuid_ns_url(), 'rapidrounds:lesson-cardiac-fundamentals'), 'Cardiac Assessment Fundamentals', 'Master the essentials of cardiac assessment and ECG interpretation', 45, 'video', 'beginner',
   ARRAY['Perform systematic cardiac assessment', 'Interpret basic ECG rhythms', 'Recognize cardiac emergencies'], true, '{}'::jsonb),
  (uuid_generate_v5(uuid_ns_url(), 'rapidrounds:lesson-respiratory-care'), 'Respiratory Care Essentials', 'Comprehensive guide to respiratory assessment and oxygen therapy', 60, 'interactive', 'intermediate',
   ARRAY['Assess respiratory function', 'Select oxygen therapy', 'Monitor ventilation'], true, '{}'::jsonb),
  (uuid_generate_v5(uuid_ns_url(), 'rapidrounds:lesson-medication-safety'), 'Medication Administration Safety', 'Critical safety protocols for medication administration', 35, 'assessment', 'advanced',
   ARRAY['Apply five rights of medication', 'Calculate dosages', 'Prevent medication errors'], true, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;




-- Keep billing/role/tenant/identity fields admin-controlled after adding columns.
REVOKE UPDATE ON profiles FROM PUBLIC, anon, authenticated;
GRANT UPDATE (full_name, avatar_url, display_name, credentials) ON profiles TO authenticated;
