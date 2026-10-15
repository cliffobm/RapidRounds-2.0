# Manual Supabase Database Setup Guide

Since the automated setup script requires additional Supabase functions, here's how to set up your database manually:

## Option 1: Supabase Dashboard (Recommended)

### Step 1: Access Your Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Open your project: `local-development-project`
3. Navigate to the **SQL Editor** in the left sidebar

### Step 2: Run the Migration
1. Click **"New Query"** in the SQL Editor
2. Copy the contents of `supabase/migrations/20241214_design_revamp.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** to execute the migration

### Step 3: Verify Setup
Run this query to verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see tables like:
- `profiles`
- `institutions` 
- `scenarios`
- `scenario_items`
- `progress`
- `rationales`
- `rationale_usage`
- `bookmarks`
- `lesson_completions`

### Step 4: Run Seed Data (Optional)
1. Copy the contents of `supabase/seed.sql` or `supabase/seed_complete.sql`
2. Paste and run in the SQL Editor

## Option 2: Using Supabase CLI

If you want to install the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref local-development-project

# Run migrations
supabase db push

# Run seed data
supabase db seed
```

## Option 3: Direct SQL Execution

You can also run the SQL directly using any PostgreSQL client:

```bash
# Using psql (if you have PostgreSQL installed)
psql "postgresql://postgres:[YOUR_PASSWORD]@db.local-development-project.supabase.co:5432/postgres" -f supabase/migrations/20241214_design_revamp.sql
```

## Verification

After setup, you can verify everything is working by:

1. **Check tables exist:**
```sql
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM scenarios;
```

2. **Test your app:**
```bash
npm run dev
```

3. **Check the database in your app:**
   - Go to http://localhost:3000
   - Try to sign up/sign in
   - Check if data appears in your Supabase dashboard

## Troubleshooting

### Common Issues:

1. **"Table already exists"** - This is normal if you've run the migration before
2. **Permission errors** - Make sure you're using the service role key
3. **Connection issues** - Verify your environment variables are correct

### Environment Variables Check:
Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Next Steps

After database setup:
1. Configure authentication providers (Google OAuth)
2. Set up Row Level Security policies
3. Test your application
4. Deploy to production

Your database should now be ready for the RapidRounds application! 🎉
