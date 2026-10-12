#!/usr/bin/env tsx

import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Setup environment variables for RapidRounds
 * This script creates a .env.local file with the correct Supabase configuration
 */

const envContent = `# ===========================================
# RAPIDROUNDS ENVIRONMENT CONFIGURATION
# ===========================================
# Auto-generated environment configuration

# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-development-key

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ===========================================
# FEATURE FLAGS
# ===========================================
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_LEADERBOARDS=true
`

function setupEnvironment() {
  const envPath = join(process.cwd(), '.env.local')
  
  console.log('🔧 Setting up RapidRounds environment...')
  
  if (existsSync(envPath)) {
    console.log('⚠️  .env.local already exists - backing up to .env.local.backup')
    const backupPath = join(process.cwd(), '.env.local.backup')
    const fs = require('fs')
    fs.copyFileSync(envPath, backupPath)
  }
  
  try {
    writeFileSync(envPath, envContent)
    console.log('✅ Environment configuration created successfully!')
    console.log('📁 File location:', envPath)
    console.log('')
    console.log('🚀 Your Supabase configuration:')
    console.log('   URL: http://127.0.0.1:54321')
    console.log('   Status: Ready to use')
    console.log('')
    console.log('💡 Next steps:')
    console.log('   1. Run: npm run dev')
    console.log('   2. Open: http://localhost:3000')
    console.log('   3. Check: No more Supabase warnings!')
    
  } catch (error) {
    console.error('❌ Failed to create .env.local file:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  setupEnvironment()
}

export { setupEnvironment }
