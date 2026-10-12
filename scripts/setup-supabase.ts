#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...')
  
  try {
    // Read and execute the initial schema
    const schemaPath = join(process.cwd(), 'supabase', 'migrations', '001_initial_schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    
    const { error } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (error) {
      console.error('❌ Error setting up database:', error)
      return false
    }
    
    console.log('✅ Database schema created successfully')
    
    // Test the connection
    const { data, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Error testing database connection:', testError)
      return false
    }
    
    console.log('✅ Database connection test successful')
    return true
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    return false
  }
}

async function main() {
  const success = await setupDatabase()
  
  if (success) {
    console.log('\n🎉 Supabase setup complete!')
    console.log('\nNext steps:')
    console.log('1. Configure OAuth providers in Supabase dashboard')
    console.log('2. Set up Google OAuth in Google Cloud Console')
    console.log('3. Update your .env.local file with the credentials')
    console.log('4. Deploy to Vercel')
  } else {
    console.log('\n❌ Setup failed. Please check the errors above.')
    process.exit(1)
  }
}

main()
