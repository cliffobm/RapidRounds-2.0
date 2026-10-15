#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function runSQL(sql: string, description: string) {
  console.log(`📝 ${description}...`)
  
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec', { sql: statement })
        if (error) {
          console.error(`❌ Error in statement: ${statement.substring(0, 100)}...`)
          console.error('Error:', error)
          return false
        }
      }
    }
    
    console.log(`✅ ${description} completed`)
    return true
  } catch (error) {
    console.error(`❌ ${description} failed:`, error)
    return false
  }
}

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...')
  
  try {
    // Read the main migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20241214_design_revamp.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    
    // Run the migration
    const migrationSuccess = await runSQL(migrationSQL, 'Running database migration')
    if (!migrationSuccess) {
      return false
    }
    
    // Test the connection by querying a table
    console.log('🔍 Testing database connection...')
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Error testing database connection:', error)
      return false
    }
    
    console.log('✅ Database connection test successful')
    
    // Check if we have any data
    const { data: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Found ${profileCount || 0} profiles in database`)
    
    return true
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    return false
  }
}

async function main() {
  const success = await setupDatabase()
  
  if (success) {
    console.log('🎉 Database setup completed successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Run seed data: npm run seed')
    console.log('2. Start development: npm run dev')
    console.log('3. Check your Supabase dashboard for the new tables')
  } else {
    console.log('❌ Database setup failed. Please check the errors above.')
    process.exit(1)
  }
}

main().catch(console.error)
