#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkDatabase() {
  console.log('🔍 Checking Supabase database setup...')
  console.log(`📍 Project URL: ${SUPABASE_URL}`)
  
  try {
    // Check if we can connect
    console.log('🔌 Testing connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message)
      return false
    }
    
    console.log('✅ Connection successful!')
    
    // Check for required tables
    const tables = [
      'profiles',
      'institutions', 
      'scenarios',
      'scenario_items',
      'progress',
      'rationales',
      'rationale_usage',
      'bookmarks',
      'lesson_completions'
    ]
    
    console.log('📋 Checking required tables...')
    let allTablesExist = true
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table '${table}' missing or inaccessible`)
          allTablesExist = false
        } else {
          console.log(`✅ Table '${table}' exists`)
        }
      } catch (err) {
        console.log(`❌ Table '${table}' missing or inaccessible`)
        allTablesExist = false
      }
    }
    
    if (allTablesExist) {
      console.log('🎉 All required tables exist!')
      
      // Check for data
      console.log('📊 Checking for existing data...')
      const { data: profileCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      const { data: scenarioCount } = await supabase
        .from('scenarios')
        .select('*', { count: 'exact', head: true })
      
      console.log(`👥 Profiles: ${profileCount || 0}`)
      console.log(`📚 Scenarios: ${scenarioCount || 0}`)
      
      if ((profileCount || 0) === 0 && (scenarioCount || 0) === 0) {
        console.log('💡 Database is set up but empty. Consider running seed data.')
      }
      
      return true
    } else {
      console.log('❌ Some tables are missing. Please run the database setup.')
      return false
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error)
    return false
  }
}

async function main() {
  const success = await checkDatabase()
  
  if (success) {
    console.log('')
    console.log('✅ Database is ready!')
    console.log('🚀 You can now run: npm run dev')
  } else {
    console.log('')
    console.log('❌ Database setup required.')
    console.log('📖 Please follow the manual setup guide: scripts/manual-setup-guide.md')
  }
}

main().catch(console.error)
