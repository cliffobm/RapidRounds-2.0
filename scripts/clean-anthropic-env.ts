#!/usr/bin/env tsx

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Remove Anthropic-related environment variables from .env.local
 */

function cleanAnthropicEnvironment() {
  const envPath = join(process.cwd(), '.env.local')
  
  console.log('🧹 Cleaning up Anthropic environment variables...')
  
  if (!existsSync(envPath)) {
    console.error('❌ .env.local file not found!')
    process.exit(1)
  }
  
  try {
    let content = readFileSync(envPath, 'utf8')
    
    // Remove Anthropic-related lines
    const lines = content.split('\n')
    const cleanedLines = lines.filter(line => {
      // Keep lines that don't contain Anthropic references
      return !line.includes('ANTHROPIC_API_KEY') && 
             !line.includes('Anthropic') && 
             !line.includes('anthropic') &&
             !line.includes('Claude') &&
             !line.includes('claude')
    })
    
    const cleanedContent = cleanedLines.join('\n')
    
    // Only write if content changed
    if (cleanedContent !== content) {
      writeFileSync(envPath, cleanedContent)
      console.log('✅ Removed Anthropic environment variables')
    } else {
      console.log('✅ No Anthropic variables found to remove')
    }
    
    console.log('')
    console.log('🚀 Your environment is now clean and focused on OpenAI!')
    console.log('💡 Next: Add your OpenAI API key to .env.local')
    
  } catch (error) {
    console.error('❌ Failed to clean environment file:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  cleanAnthropicEnvironment()
}

export { cleanAnthropicEnvironment }
