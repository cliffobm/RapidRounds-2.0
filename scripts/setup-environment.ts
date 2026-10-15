#!/usr/bin/env tsx

import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const envContent = `# ===========================================
# RAPIDROUNDS ENVIRONMENT CONFIGURATION
# ===========================================
# Copy this file to .env.local and fill in your actual values

# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
# Get these from your Supabase project dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here'}
SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'}

# ===========================================
# GOOGLE OAUTH CONFIGURATION
# ===========================================
# Get these from Google Cloud Console → APIs & Services → Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
# Your app URLs (update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# ===========================================
# DATABASE CONFIGURATION
# ===========================================
# For local development (if using local Supabase)
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres

# ===========================================
# OPTIONAL: EMAIL CONFIGURATION
# ===========================================
# For sending notifications (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# ===========================================
# OPTIONAL: ANALYTICS
# ===========================================
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_LEADERBOARDS=true

# ===========================================
# PRODUCTION OVERRIDES
# ===========================================
# These will be set automatically by Vercel
# NEXT_PUBLIC_APP_URL=http://localhost:3000
# NEXTAUTH_URL=https://your-domain.vercel.app
`

function createEnvFile() {
  const envPath = join(process.cwd(), '.env.local')
  
  if (existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Skipping creation.')
    console.log('   If you need to update it, please do so manually.')
    return
  }
  
  try {
    writeFileSync(envPath, envContent)
    console.log('✅ Created .env.local file')
    console.log('📝 Please update the values in .env.local with your actual credentials')
  } catch (error) {
    console.error('❌ Error creating .env.local:', error)
  }
}

function main() {
  console.log('🚀 Setting up environment configuration...')
  createEnvFile()
  
  console.log('\n📋 Next steps:')
  console.log('1. Update .env.local with your Supabase credentials')
  console.log('2. Set up Google OAuth in Google Cloud Console')
  console.log('3. Configure OAuth providers in Supabase dashboard')
  console.log('4. Deploy to Vercel')
}

main()
