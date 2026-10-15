-- Create missing tables for RapidRounds
-- Run this in your Supabase SQL Editor

-- Scenario items table (questions/interactions)
CREATE TABLE IF NOT EXISTS scenario_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mcq', 'multi', 'order', 'input')),
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rationales table
CREATE TABLE IF NOT EXISTS rationales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_item_id UUID NOT NULL REFERENCES scenario_items(id) ON DELETE CASCADE,
  hint TEXT NOT NULL,
  full_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress tracking
CREATE TABLE IF NOT EXISTS progress (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  correct_count INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, scenario_id)
);

-- Rationale usage tracking
CREATE TABLE IF NOT EXISTS rationale_usage (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL DEFAULT 'free' CHECK (usage_type IN ('free', 'premium')),
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, usage_type)
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_item_id UUID NOT NULL REFERENCES scenario_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, scenario_item_id)
);

-- Lesson completions
CREATE TABLE IF NOT EXISTS lesson_completions (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INTEGER,
  PRIMARY KEY (user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE scenario_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rationales ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE rationale_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Scenario items: Anyone can read
CREATE POLICY "Anyone can view scenario items" ON scenario_items FOR SELECT USING (true);

-- Rationales: Anyone can read
CREATE POLICY "Anyone can view rationales" ON rationales FOR SELECT USING (true);

-- Progress: Users can read/write their own progress
CREATE POLICY "Users can view own progress" ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON progress FOR UPDATE USING (auth.uid() = user_id);

-- Rationale usage: Users can manage their own usage
CREATE POLICY "Users can view own rationale usage" ON rationale_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rationale usage" ON rationale_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rationale usage" ON rationale_usage FOR UPDATE USING (auth.uid() = user_id);

-- Bookmarks: Users can manage their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Lesson completions: Users can manage their own completions
CREATE POLICY "Users can view own completions" ON lesson_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON lesson_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own completions" ON lesson_completions FOR UPDATE USING (auth.uid() = user_id);
