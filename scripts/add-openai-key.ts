#!/usr/bin/env tsx

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Add OpenAI API key to .env.local
 */

function addOpenAIKey() {
  const envPath = join(process.cwd(), '.env.local')
  
  console.log('🔧 Adding OpenAI API key to environment...')
  
  if (!existsSync(envPath)) {
    console.error('❌ .env.local file not found!')
    process.exit(1)
  }
  
  try {
    let content = readFileSync(envPath, 'utf8')
    
    // Check if OpenAI key already exists
    if (content.includes('OPENAI_API_KEY=')) {
      console.log('✅ OpenAI API key already exists in .env.local')
      return
    }
    
    // Add OpenAI key section
    const openaiSection = `
# ===========================================
# AI API KEYS (Required for AI features)
# ===========================================
# OpenAI API key for rationale generation
OPENAI_API_KEY=your_openai_api_key
```
`

    content += openaiSection

    writeFileSync(envPath, content)

    console.log('✅ Added OpenAI API key placeholder to .env.local')
    console.log('')
    console.log('🚀 Next steps:')
    console.log('   1. Get your OpenAI API key from: https://platform.openai.com/api-keys')
    console.log('   2. Replace "sk-your-openai-api-key-here" with your actual key')
    console.log('   3. Restart your development server: npm run dev')
    
  } catch (error) {
    console.error('❌ Failed to add OpenAI key:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  addOpenAIKey()
}

export { addOpenAIKey }
