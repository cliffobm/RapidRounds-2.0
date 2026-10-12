#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-development-key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RapidRounds

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_LEADERBOARDS=true

# OAuth Configuration (Add your OAuth app credentials here)
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
# GITHUB_CLIENT_ID=your_github_client_id
# GITHUB_CLIENT_SECRET=your_github_client_secret
# DISCORD_CLIENT_ID=your_discord_client_id
# DISCORD_CLIENT_SECRET=your_discord_client_secret
`;

const envPath = path.join(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
  fs.copyFileSync(envPath, envPath + '.backup');
}

fs.writeFileSync(envPath, envContent);
console.log('✅ Created .env.local file');
console.log('📝 Please add your OAuth credentials to the .env.local file');
console.log('🔧 Configure OAuth providers in Supabase Dashboard');
console.log('📖 See scripts/setup-oauth.md for detailed instructions');



