#!/usr/bin/env tsx

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Fix missing environment variables in .env.local
 */

function fixEnvironment() {
  const envPath = join(process.cwd(), '.env.local')
  
  console.log('🔧 Fixing missing environment variables...')
  
  if (!existsSync(envPath)) {
    console.error('❌ .env.local file not found!')
    process.exit(1)
  }
  
  try {
    let content = readFileSync(envPath, 'utf8')
    
    // Check what's missing and add it
    const missingVars = []
    
    if (!content.includes('NEXT_PUBLIC_APP_NAME=')) {
      missingVars.push('NEXT_PUBLIC_APP_NAME=RapidRounds')
    }
    
    if (!content.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
      missingVars.push('SUPABASE_SERVICE_ROLE_KEY=local-development-key')
    }
    
    if (missingVars.length === 0) {
      console.log('✅ All required environment variables are already present!')
      return
    }
    
    // Add missing variables before the feature flags section
    const insertPoint = content.indexOf('# ===========================================\n# FEATURE FLAGS')
    if (insertPoint === -1) {
      // If no feature flags section, append at the end
      content += '\n\n# ===========================================\n# MISSING VARIABLES\n# ===========================================\n'
      content += missingVars.join('\n') + '\n'
    } else {
      // Insert before feature flags
      const beforeFlags = content.substring(0, insertPoint)
      const afterFlags = content.substring(insertPoint)
      content = beforeFlags + 
        '# ===========================================\n' +
        '# MISSING VARIABLES\n' +
        '# ===========================================\n' +
        missingVars.join('\n') + '\n\n' +
        afterFlags
    }
    
    writeFileSync(envPath, content)
    
    console.log('✅ Added missing environment variables:')
    missingVars.forEach(v => console.log(`   ${v.split('=')[0]}`))
    console.log('')
    console.log('🚀 Your environment is now properly configured!')
    console.log('💡 Note: You may need to update SUPABASE_SERVICE_ROLE_KEY with your actual service role key from Supabase')
    
  } catch (error) {
    console.error('❌ Failed to fix environment file:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  fixEnvironment()
}

export { fixEnvironment }
