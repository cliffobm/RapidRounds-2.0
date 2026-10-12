#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
const envPath = join(process.cwd(), '.env.local');
config({ path: envPath });

/**
 * Test rationale generation directly without server-only imports
 */

async function testRationaleGeneration() {
  console.log('🧪 Testing rationale generation...')
  
  // Check if OpenAI API key is set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
    console.log('❌ OpenAI API key not configured')
    return
  }
  
  const testPrompt = "A 45-year-old patient presents with chest pain. The ECG shows ST elevation in leads II, III, and aVF. What is the most likely diagnosis and why?"
  
  try {
    console.log('📝 Test prompt:', testPrompt)
    console.log('⏳ Generating rationale...')
    
    // Import OpenAI directly without server-only
    const OpenAI = require('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a medical education expert. Generate a comprehensive rationale for the given medical scenario or question. 
          Your response should be educational, evidence-based, and help students understand the reasoning behind the correct answer.
          
          Format your response as:
          1. Brief explanation of the correct answer
          2. Key clinical reasoning points
          3. Alternative considerations
          4. Learning takeaways`
        },
        {
          role: "user",
          content: testPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const rationale = response.choices[0]?.message?.content || "Unable to generate rationale"
    
    console.log('✅ Rationale generated successfully!')
    console.log('')
    console.log('📋 Generated Rationale:')
    console.log('─'.repeat(50))
    console.log(rationale)
    console.log('─'.repeat(50))
    console.log('')
    console.log('📊 Model:', 'gpt-4o-mini')
    console.log('🔢 Usage:', response.usage)
    console.log('')
    console.log('🎉 Your rationale generation system is working perfectly!')
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
  }
}

if (require.main === module) {
  testRationaleGeneration()
}

export { testRationaleGeneration }
