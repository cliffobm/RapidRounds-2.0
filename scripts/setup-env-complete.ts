#!/usr/bin/env tsx

import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Create a complete .env.local file with all required environment variables
 */

const envContent = `# =============================================================================
# RAPIDROUNDS ENVIRONMENT CONFIGURATION
# =============================================================================
# This file contains environment variables for local development
# Never commit this file to version control

# =============================================================================
# SUPABASE CONFIGURATION (Required)
# =============================================================================
# Get these from your Supabase project settings: https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-development-key

# Service role key for server-side operations (get from Supabase dashboard)
SUPABASE_SERVICE_ROLE_KEY=local-development-key

# =============================================================================
# AI API KEYS (Required for AI features)
# =============================================================================
# OpenAI API key for rationale generation
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key

# Anthropic API key for Claude AI features (optional)
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=your_anthropic_api_key

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
# Your app's base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RapidRounds

# Node environment (automatically set by Next.js)
NODE_ENV=development

# =============================================================================
# PAYMENT PROCESSING (Optional - for premium features)
# =============================================================================
# Stripe publishable key for payment processing
# Get from: https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# =============================================================================
# FEATURE FLAGS (Optional)
# =============================================================================
# Enable/disable various features
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_LEADERBOARDS=true

# =============================================================================
# SETUP INSTRUCTIONS
# =============================================================================
# 1. Replace placeholder values with your actual API keys
# 2. Get Supabase keys from: https://supabase.com/dashboard
# 3. Get OpenAI key from: https://platform.openai.com/api-keys
# 4. Get Anthropic key from: https://console.anthropic.com/
# 5. Get Stripe key from: https://dashboard.stripe.com/apikeys
# 6. Restart your development server: npm run dev`

function setupCompleteEnvironment() {
  const envPath = join(process.cwd(), '.env.local')
  
  console.log('🔧 Setting up complete RapidRounds environment...')
  
  if (existsSync(envPath)) {
    console.log('⚠️  .env.local already exists - backing up to .env.local.backup')
    const backupPath = join(process.cwd(), '.env.local.backup')
    const fs = require('fs')
    fs.copyFileSync(envPath, backupPath)
  }
  
  try {
    writeFileSync(envPath, envContent)
    console.log('✅ Complete environment configuration created!')
    console.log('📁 File location:', envPath)
    console.log('')
    console.log('🚀 Your environment includes:')
    console.log('   ✅ Supabase configuration (ready to use)')
    console.log('   ✅ Application settings')
    console.log('   ✅ Feature flags')
    console.log('   ⚠️  AI API keys (need to be filled in)')
    console.log('   ⚠️  Payment keys (optional)')
    console.log('')
    console.log('💡 Next steps:')
    console.log('   1. Get your OpenAI API key from: https://platform.openai.com/api-keys')
    console.log('   2. Replace "sk-your-openai-api-key-here" with your actual key')
    console.log('   3. (Optional) Get your Supabase service role key from: https://supabase.com/dashboard')
    console.log('   4. (Optional) Get your Stripe key from: https://dashboard.stripe.com/apikeys')
    console.log('   5. Restart your development server: npm run dev')
    console.log('')
    console.log('🧪 Test your setup:')
    console.log('   npx tsx scripts/test-rationale-generation.ts')
    
  } catch (error) {
    console.error('❌ Failed to create .env.local file:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  setupCompleteEnvironment()
}

export { setupCompleteEnvironment }
