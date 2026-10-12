# OAuth Setup Guide for RapidRounds

## Current Issues:
1. **OAuth Providers Not Enabled**: The error "Unsupported provider: provider is not enabled" means the OAuth providers need to be configured in Supabase
2. **Missing Environment Variables**: You need a `.env.local` file with proper configuration

## Step 1: Create Environment File

Create a `.env.local` file in your project root with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-development-key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RapidRounds

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_LEADERBOARDS=true
```

## Step 2: Configure OAuth Providers in Supabase

### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set authorized redirect URIs:
   - `http://127.0.0.1:54321/auth/v1/callback`
   - `http://localhost:3000/auth/callback`
6. Copy Client ID and Client Secret
7. In Supabase Dashboard → Authentication → Providers → Google:
   - Enable Google provider
   - Add your Client ID and Client Secret

### GitHub OAuth Setup:
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL:
   - `http://127.0.0.1:54321/auth/v1/callback`
   - `http://localhost:3000/auth/callback`
4. Copy Client ID and Client Secret
5. In Supabase Dashboard → Authentication → Providers → GitHub:
   - Enable GitHub provider
   - Add your Client ID and Client Secret

### Discord OAuth Setup:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 → General
4. Add redirect URI:
   - `http://127.0.0.1:54321/auth/v1/callback`
   - `http://localhost:3000/auth/callback`
5. Copy Client ID and Client Secret
6. In Supabase Dashboard → Authentication → Providers → Discord:
   - Enable Discord provider
   - Add your Client ID and Client Secret

## Step 3: Test OAuth Flow

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/auth/sign-in`
3. Test each OAuth provider button
4. Verify users are redirected back after authentication

## Troubleshooting:

- **"Provider not enabled"**: Make sure you've enabled the provider in Supabase Dashboard
- **"Invalid redirect URI"**: Check that your redirect URIs match exactly
- **"Client ID not found"**: Verify your Client ID and Secret are correct
- **React errors**: The app should work once OAuth is properly configured

## Security Notes:

- Never commit `.env.local` to version control
- Use different OAuth apps for development and production
- Rotate API keys if they were ever exposed in logs



