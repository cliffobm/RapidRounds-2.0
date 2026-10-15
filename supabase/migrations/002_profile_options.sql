-- Create profile options tables
CREATE TABLE aspirations_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE goals_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE learning_challenges_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create join tables for user selections
CREATE TABLE user_aspirations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  aspiration_id UUID REFERENCES aspirations_options(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, aspiration_id)
);

CREATE TABLE user_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals_options(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, goal_id)
);

CREATE TABLE user_learning_challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES learning_challenges_options(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Add display_name to profiles table
ALTER TABLE profiles ADD COLUMN display_name TEXT;

-- Enable RLS on new tables
ALTER TABLE aspirations_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_challenges_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_aspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_challenges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for options tables (readable by all)
CREATE POLICY "Options are readable" ON aspirations_options
  FOR SELECT USING (true);

CREATE POLICY "Goals options are readable" ON goals_options
  FOR SELECT USING (true);

CREATE POLICY "Learning challenges options are readable" ON learning_challenges_options
  FOR SELECT USING (true);

-- Create RLS policies for join tables (users can manage their own selections)
CREATE POLICY "Users can manage own aspirations" ON user_aspirations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own goals" ON user_goals
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own learning challenges" ON user_learning_challenges
  FOR ALL USING (user_id = auth.uid());

-- Insert sample data for options
INSERT INTO aspirations_options (name, description) VALUES
('Critical Care Nurse', 'Specialize in intensive care and emergency medicine'),
('Nurse Educator', 'Teach and mentor future nursing professionals'),
('Clinical Research', 'Conduct research to advance nursing practice'),
('Pediatric Nurse', 'Specialize in caring for children and infants'),
('Mental Health Nurse', 'Focus on psychiatric and mental health care'),
('Surgical Nurse', 'Assist in operating rooms and surgical procedures'),
('Community Health Nurse', 'Work in public health and community settings'),
('Nurse Practitioner', 'Provide advanced practice nursing care'),
('Nurse Manager', 'Lead nursing teams and departments'),
('Travel Nurse', 'Work temporary assignments in different locations');

INSERT INTO goals_options (name, description) VALUES
('Complete 50 scenarios this month', 'Finish 50 nursing scenarios to improve clinical skills'),
('Achieve 90% average score', 'Maintain high performance across all scenarios'),
('Earn 5 new badges', 'Unlock 5 achievement badges through learning'),
('Master cardiac scenarios', 'Become proficient in cardiac care scenarios'),
('Complete all beginner scenarios', 'Finish all entry-level nursing scenarios'),
('Study 2 hours daily', 'Dedicate consistent time to learning'),
('Join study group', 'Collaborate with peers for better learning'),
('Attend nursing conference', 'Participate in professional development'),
('Get clinical rotation placement', 'Secure hands-on clinical experience'),
('Pass NCLEX on first attempt', 'Successfully complete nursing licensure exam');

INSERT INTO learning_challenges_options (name, description) VALUES
('Time management with clinical rotations', 'Balancing study time with clinical practice'),
('Balancing theory with practical application', 'Connecting classroom learning to real-world practice'),
('Building confidence in emergency situations', 'Developing skills for high-pressure scenarios'),
('Memorizing drug interactions', 'Learning complex medication relationships'),
('Understanding complex pathophysiology', 'Grasping advanced disease processes'),
('Managing stress and burnout', 'Maintaining mental health during intense study'),
('Improving critical thinking skills', 'Developing clinical reasoning abilities'),
('Learning new technology', 'Adapting to digital healthcare tools'),
('Working in team environments', 'Collaborating effectively with healthcare teams'),
('Staying updated with best practices', 'Keeping current with evolving nursing standards');

-- Create indexes for better performance
CREATE INDEX idx_user_aspirations_user ON user_aspirations(user_id);
CREATE INDEX idx_user_goals_user ON user_goals(user_id);
CREATE INDEX idx_user_learning_challenges_user ON user_learning_challenges(user_id);
CREATE INDEX idx_aspirations_options_name ON aspirations_options(name);
CREATE INDEX idx_goals_options_name ON goals_options(name);
CREATE INDEX idx_learning_challenges_options_name ON learning_challenges_options(name);
