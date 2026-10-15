#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

function runCommand(command: string, description: string) {
  console.log(`\n🔄 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} completed`)
  } catch (error) {
    console.error(`❌ ${description} failed:`, error)
    return false
  }
  return true
}

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...')
  
  // Check if Node.js is installed
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim()
    console.log(`✅ Node.js ${nodeVersion} is installed`)
  } catch {
    console.error('❌ Node.js is not installed. Please install Node.js 20+ first.')
    return false
  }
  
  // Check if npm is installed
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim()
    console.log(`✅ npm ${npmVersion} is installed`)
  } catch {
    console.error('❌ npm is not installed. Please install npm first.')
    return false
  }
  
  return true
}

function main() {
  console.log('🚀 RapidRounds Quick Setup')
  console.log('==========================')
  
  // Check prerequisites
  if (!checkPrerequisites()) {
    console.log('\n❌ Prerequisites not met. Please install the required tools first.')
    process.exit(1)
  }
  
  // Install dependencies
  if (!runCommand('npm install', 'Installing dependencies')) {
    console.log('\n❌ Failed to install dependencies. Please check your internet connection.')
    process.exit(1)
  }
  
  // Set up environment
  if (!runCommand('npm run setup:env', 'Setting up environment configuration')) {
    console.log('\n❌ Failed to set up environment. Please check the setup script.')
    process.exit(1)
  }
  
  console.log('\n🎉 Quick setup completed!')
  console.log('\n📋 Next steps:')
  console.log('1. Update .env.local with your Supabase credentials')
  console.log('2. Set up Google OAuth in Google Cloud Console')
  console.log('3. Configure OAuth providers in Supabase dashboard')
  console.log('4. Run: npm run setup:supabase')
  console.log('5. Run: npm run dev')
  console.log('6. Deploy to Vercel when ready')
  
  console.log('\n📖 For detailed instructions, see SETUP_GUIDE.md')
}

main()
