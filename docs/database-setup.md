# Database Setup Guide

## Overview
This guide explains how to set up the RapidRounds database schema, including migrations, RLS policies, and seed data.

## Prerequisites
- Supabase project created
- Supabase CLI installed
- Database access credentials

## File Structure
```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql      # Initial schema
│   ├── 002_enhanced_schema.sql     # Enhanced schema with categories/questions
│   └── 003_complete_schema.sql     # Complete consolidated schema
├── seed.sql                        # Basic seed data
└── seed_complete.sql              # Complete seed data with all scenarios
```

## Setup Steps

### 1. Run Migrations
Execute the migrations in order:

```bash
# Run all migrations
supabase db reset

# Or run individual migrations
supabase migration up
```

### 2. Apply Seed Data
Choose one of the seed files:

```bash
# Basic seed data (categories only)
psql -h your-db-host -U postgres -d postgres -f supabase/seed.sql

# Complete seed data (all scenarios and questions)
psql -h your-db-host -U postgres -d postgres -f supabase/seed_complete.sql
```

### 3. Verify Setup
Check that the setup was successful:

```sql
-- Check categories
SELECT * FROM categories ORDER BY sort_order;

-- Check scenarios
SELECT s.title, c.name as category 
FROM scenarios s 
JOIN categories c ON s.category_id = c.id 
WHERE s.is_published = true;

-- Check questions
SELECT q.question_text, s.title as scenario
FROM questions q
JOIN scenarios s ON q.scenario_id = s.id
WHERE q.is_active = true;

-- Check leaderboard view
SELECT * FROM leaderboard_v LIMIT 10;
```

## Schema Features

### Normalized Design
- **Categories**: Normalized table with metadata (icon, color, sort order)
- **Questions**: Separate table for scenario questions with full metadata
- **Student Answers**: Normalized tracking of individual question responses
- **Profile Options**: Flexible user preference storage

### Row Level Security (RLS)
- **Public Read**: Categories, published scenarios, questions, badges
- **Owner Only**: Profile options, student progress, student answers
- **Educator Access**: Educators can view all student data

### Performance Optimizations
- Comprehensive indexing strategy
- Materialized leaderboard view
- Efficient query patterns
- JSONB for flexible data storage

### Data Integrity
- Foreign key constraints
- Check constraints for enums
- Unique constraints for business rules
- Triggers for automatic calculations

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Testing the Setup

### 1. Test RLS Policies
```sql
-- Test as authenticated user
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "test-user-id"}';

-- Should only see own data
SELECT * FROM profile_options;
SELECT * FROM student_progress;
```

### 2. Test Public Access
```sql
-- Test as anonymous user
SET LOCAL role TO anon;

-- Should see public data
SELECT * FROM categories;
SELECT * FROM scenarios WHERE is_published = true;
```

### 3. Test Functions
```sql
-- Test point calculation
SELECT calculate_question_points(
  (SELECT id FROM questions LIMIT 1),
  '"correct answer"'::jsonb
);

-- Test progress update
SELECT update_student_progress(
  'test-student-id'::uuid,
  (SELECT id FROM scenarios LIMIT 1)
);
```

## Troubleshooting

### Common Issues

1. **Migration Fails**: Check for existing constraints or data conflicts
2. **RLS Policy Errors**: Verify user authentication and role setup
3. **Performance Issues**: Check index usage with EXPLAIN ANALYZE
4. **Data Inconsistency**: Verify foreign key relationships

### Debug Commands

```sql
-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## Maintenance

### Regular Tasks
1. **Monitor Performance**: Check slow queries and index usage
2. **Update Statistics**: Run ANALYZE on tables after bulk changes
3. **Clean Up**: Remove old student data as needed
4. **Backup**: Regular database backups

### Scaling Considerations
1. **Partitioning**: Consider partitioning large tables by date
2. **Archiving**: Archive old student progress data
3. **Caching**: Implement application-level caching for frequently accessed data
4. **CDN**: Use CDN for static content and images

## Security Best Practices

1. **Principle of Least Privilege**: Users only access what they need
2. **Regular Audits**: Review RLS policies and user access
3. **Data Encryption**: Ensure sensitive data is encrypted at rest
4. **Access Logging**: Monitor database access patterns
5. **Regular Updates**: Keep database and dependencies updated

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check database logs for error details
4. Contact the development team
