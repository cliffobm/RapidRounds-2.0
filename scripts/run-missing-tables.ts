#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables with fallbacks
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'local-development-key'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please run: npm run setup:env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function createMissingTables() {
  console.log('🚀 Checking database connection...')
  
  // First, test basic connection
  try {
    const { data, error } = await supabase.from('scenarios').select('count', { count: 'exact', head: true })
    
    if (!error) {
      console.log('✅ Database connection successful - tables already exist!')
      console.log('🎉 Your database is ready to use')
      return
    }
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('📋 Tables missing - will create them...')
    } else {
      throw error
    }
  } catch (connectionError) {
    console.error('❌ Database connection failed:', connectionError)
    throw connectionError
  }
  
  try {
    console.log('🚀 Creating missing tables...')
    
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'scripts', 'create-missing-tables.sql')
    const sql = readFileSync(sqlPath, 'utf8')
    
    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
          
          // Use the REST API to execute SQL
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'apikey': SUPABASE_KEY
            },
            body: JSON.stringify({ sql: statement })
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ Statement ${i + 1} failed:`, errorText)
            errorCount++
          } else {
            console.log(`✅ Statement ${i + 1} completed`)
            successCount++
          }
        } catch (error) {
          console.error(`❌ Statement ${i + 1} error:`, error)
          errorCount++
        }
      }
    }
    
    console.log(`\n📊 Results: ${successCount} successful, ${errorCount} errors`)
    
    if (errorCount === 0) {
      console.log('🎉 All tables created successfully!')
      return true
    } else {
      console.log('⚠️ Some statements failed. Check the errors above.')
      return false
    }
    
  } catch (error) {
    console.error('❌ Failed to create tables:', error)
    return false
  }
}

async function main() {
  console.log('🔧 RapidRounds Database Setup')
  console.log('=============================')
  
  const success = await createMissingTables()
  
  if (success) {
    console.log('\n✅ Database setup completed!')
    console.log('🔍 Run "npm run check:db" to verify the setup')
  } else {
    console.log('\n❌ Database setup failed.')
    console.log('📖 Please run the SQL manually in your Supabase dashboard:')
    console.log('   1. Go to https://supabase.com/dashboard/project/local-development-project')
    console.log('   2. Open SQL Editor')
    console.log('   3. Copy and run the contents of scripts/create-missing-tables.sql')
  }
}

main().catch(console.error)
