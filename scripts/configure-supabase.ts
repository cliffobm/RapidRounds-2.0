#!/usr/bin/env tsx

import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = 'http://127.0.0.1:54321'

const envContent = `# ===========================================
# RAPIDROUNDS ENVIRONMENT CONFIGURATION
# ===========================================
# Your Supabase project is configured with the URL below

# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
# Your Supabase URL (already configured)
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}

# Get these from your Supabase project dashboard → Settings → API
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
# NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
# NEXTAUTH_URL=https://your-domain.vercel.app
`

function createEnvFile() {
  const envPath = join(process.cwd(), '.env.local')
  
  if (existsSync(envPath)) {
    console.log('⚠️  .env.local already exists.')
    console.log('   Your Supabase URL is already configured: ' + SUPABASE_URL)
    console.log('   Please update the other values in .env.local')
    return
  }
  
  try {
    writeFileSync(envPath, envContent)
    console.log('✅ Created .env.local file with your Supabase URL')
    console.log('📝 Please update the other values in .env.local with your actual credentials')
  } catch (error) {
    console.error('❌ Error creating .env.local:', error)
  }
}

function main() {
  console.log('🚀 Configuring Supabase for RapidRounds...')
  console.log('📍 Supabase URL: ' + SUPABASE_URL)
  
  createEnvFile()
  
  console.log('\n📋 Next steps:')
  console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/local-development-project')
  console.log('2. Go to Settings → API')
  console.log('3. Copy your "anon public" key and "service_role" key')
  console.log('4. Update .env.local with these keys')
  console.log('5. Set up Google OAuth in Google Cloud Console')
  console.log('6. Configure OAuth providers in Supabase dashboard')
  console.log('7. Run: npm run setup:supabase')
  console.log('8. Run: npm run dev')
  
  console.log('\n🔗 Quick links:')
  console.log('• Supabase Dashboard: https://supabase.com/dashboard/project/local-development-project')
  console.log('• Google Cloud Console: https://console.cloud.google.com/')
  console.log('• Vercel Dashboard: https://vercel.com/dashboard')
}

main()
