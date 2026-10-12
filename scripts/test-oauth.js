#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Test OAuth provider configuration
async function testOAuthProviders() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'local-development-key';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔍 Testing OAuth Provider Configuration...\n');
  
  const providers = ['google', 'github', 'discord'];
  
  for (const provider of providers) {
    try {
      console.log(`Testing ${provider} provider...`);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });
      
      if (error) {
        if (error.message.includes('provider is not enabled')) {
          console.log(`❌ ${provider}: Provider not enabled in Supabase`);
        } else {
          console.log(`❌ ${provider}: ${error.message}`);
        }
      } else {
        console.log(`✅ ${provider}: Provider is configured and working`);
      }
    } catch (err) {
      console.log(`❌ ${provider}: ${err.message}`);
    }
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project: local-development-project');
  console.log('3. Navigate to Authentication → Providers');
  console.log('4. Enable each provider (Google, GitHub, Discord)');
  console.log('5. Add OAuth app credentials for each provider');
  console.log('\n📖 See scripts/setup-oauth.md for detailed instructions');
}

testOAuthProviders().catch(console.error);

