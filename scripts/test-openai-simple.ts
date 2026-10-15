#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
const envPath = join(process.cwd(), '.env.local');
config({ path: envPath });

/**
 * Simple OpenAI API key test without server-only imports
 */

async function testOpenAIKey() {
  console.log('🧪 Testing OpenAI API key...')
  
  // Check if OpenAI API key is set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key
') {
    console.log('❌ OpenAI API key not configured')
    console.log('💡 Please set your actual OpenAI API key in .env.local')
    console.log('   Get your key from: https://platform.openai.com/api-keys')
    return
  }
  
  console.log('✅ OpenAI API key is set')
  console.log('🔑 Key format:', process.env.OPENAI_API_KEY.substring(0, 20) + '...')
  
  // Test the API key by making a simple request
  try {
    const OpenAI = require('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    console.log('⏳ Testing API connection...')
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: "Say 'Hello, OpenAI API is working!' and nothing else."
        }
      ],
      max_tokens: 10,
      temperature: 0,
    })
    
    const message = response.choices[0]?.message?.content
    console.log('✅ API Response:', message)
    console.log('🎉 OpenAI API key is working correctly!')
    
  } catch (error: any) {
    console.log('❌ API test failed:', error.message)
    
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      console.log('💡 This usually means your API key is invalid or expired')
    } else if (error.message.includes('429')) {
      console.log('💡 This usually means you have exceeded your API rate limit')
    } else if (error.message.includes('insufficient_quota')) {
      console.log('💡 This usually means you have exceeded your API quota/billing limit')
    }
  }
}

if (require.main === module) {
  testOpenAIKey()
}

export { testOpenAIKey }
