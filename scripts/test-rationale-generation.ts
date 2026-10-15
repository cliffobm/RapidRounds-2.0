#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
const envPath = join(process.cwd(), '.env.local');
config({ path: envPath });

import { generateRationale } from '../lib/ai';

/**
 * Test the rationale generation functionality
 */

async function testRationaleGeneration() {
  console.log('🧪 Testing rationale generation...')
  
  // Check if OpenAI API key is set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
    console.log('❌ OpenAI API key not configured')
    console.log('💡 Please set your actual OpenAI API key in .env.local')
    console.log('   Get your key from: https://platform.openai.com/api-keys')
    return
  }
  
  const testPrompt = "A 45-year-old patient presents with chest pain. The ECG shows ST elevation in leads II, III, and aVF. What is the most likely diagnosis and why?"
  
  try {
    console.log('📝 Test prompt:', testPrompt)
    console.log('⏳ Generating rationale...')
    
    const result = await generateRationale({ prompt: testPrompt })
    
    if (result.ok) {
      console.log('✅ Rationale generated successfully!')
      console.log('')
      console.log('📋 Generated Rationale:')
      console.log('─'.repeat(50))
      console.log(result.data.rationale)
      console.log('─'.repeat(50))
      console.log('')
      console.log('📊 Model:', result.data.model)
      console.log('🔢 Usage:', result.data.usage)
    } else {
      console.log('❌ Failed to generate rationale:', result.error)
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
  }
}

if (require.main === module) {
  testRationaleGeneration()
}

export { testRationaleGeneration }
