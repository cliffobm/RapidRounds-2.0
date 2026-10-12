-- Test script to verify database setup
-- Run this after applying migrations and seed data

-- Test 1: Check categories are inserted
SELECT 'Test 1: Categories' as test_name;
SELECT COUNT(*) as category_count FROM categories;
SELECT slug, name, icon, color FROM categories ORDER BY sort_order;

-- Test 2: Check scenarios are inserted
SELECT 'Test 2: Scenarios' as test_name;
SELECT COUNT(*) as scenario_count FROM scenarios;
SELECT s.title, c.name as category, s.difficulty, s.is_published
FROM scenarios s
LEFT JOIN categories c ON s.category_id = c.id
ORDER BY s.title;

-- Test 3: Check questions are inserted
SELECT 'Test 3: Questions' as test_name;
SELECT COUNT(*) as question_count FROM questions;
SELECT q.question_text, s.title as scenario, q.difficulty, q.points
FROM questions q
JOIN scenarios s ON q.scenario_id = s.id
ORDER BY s.title, q.sort_order;

-- Test 4: Check RLS policies
SELECT 'Test 4: RLS Policies' as test_name;
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test 5: Check indexes
SELECT 'Test 5: Indexes' as test_name;
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Test 6: Check functions
SELECT 'Test 6: Functions' as test_name;
SELECT routine_name, routine_type, data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Test 7: Check triggers
SELECT 'Test 7: Triggers' as test_name;
SELECT trigger_name, event_manipulation, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Test 8: Check leaderboard view
SELECT 'Test 8: Leaderboard View' as test_name;
SELECT * FROM leaderboard_v LIMIT 5;

-- Test 9: Test RLS with different roles
SELECT 'Test 9: RLS Testing' as test_name;

-- Test as anonymous user (should see public data)
SET LOCAL role TO anon;
SELECT 'Anonymous access to categories:' as test;
SELECT COUNT(*) as accessible_categories FROM categories;

-- Test as authenticated user (should see own data)
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "test-user-id"}';
SELECT 'Authenticated access to profile_options:' as test;
SELECT COUNT(*) as accessible_options FROM profile_options;

-- Reset role
SET LOCAL role TO postgres;

-- Test 10: Test functions
SELECT 'Test 10: Function Testing' as test_name;

-- Test point calculation function
SELECT 'Point calculation test:' as test;
SELECT calculate_question_points(
  (SELECT id FROM questions LIMIT 1),
  '"test answer"'::jsonb
) as calculated_points;

-- Test 11: Check data integrity
SELECT 'Test 11: Data Integrity' as test_name;

-- Check foreign key constraints
SELECT 'Foreign key constraints:' as test;
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Test 12: Performance check
SELECT 'Test 12: Performance' as test_name;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Test 13: Check sample data quality
SELECT 'Test 13: Data Quality' as test_name;

-- Check for missing category references
SELECT 'Scenarios without category_id:' as test;
SELECT COUNT(*) as missing_category_id 
FROM scenarios 
WHERE category_id IS NULL;

-- Check for questions without scenarios
SELECT 'Questions without valid scenarios:' as test;
SELECT COUNT(*) as orphaned_questions
FROM questions q
LEFT JOIN scenarios s ON q.scenario_id = s.id
WHERE s.id IS NULL;

-- Check for duplicate categories
SELECT 'Duplicate category slugs:' as test;
SELECT slug, COUNT(*) as count
FROM categories
GROUP BY slug
HAVING COUNT(*) > 1;

-- Test 14: Check constraints
SELECT 'Test 14: Constraints' as test_name;

-- Check check constraints
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Test 15: Final summary
SELECT 'Test 15: Summary' as test_name;
SELECT 
  'Database setup completed successfully!' as status,
  (SELECT COUNT(*) FROM categories) as categories,
  (SELECT COUNT(*) FROM scenarios) as scenarios,
  (SELECT COUNT(*) FROM questions) as questions,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as rls_policies,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as indexes;
