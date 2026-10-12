# Environment Variables Configuration

This document outlines all the environment variables required for RapidRounds to function properly.

## Required Environment Variables

### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### AI API Keys
```bash
OPENAI_API_KEY=your_openai_api_key
```

### Application Configuration
```bash
NEXT_PUBLIC_APP_URL=https://rapid-rounds-one.vercel.app/
NEXT_PUBLIC_APP_NAME=RapidRounds
```

## Optional Environment Variables

### Payment Processing
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Feature Flags
```bash
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_LEADERBOARDS=true
```

## Setup Instructions

1. **Create `.env.local` file** in your project root
2. **Copy the required variables** from above
3. **Fill in your actual values**:
   - Get Supabase credentials from your project settings
   - Get OpenAI/Anthropic API keys from their respective platforms
   - Set your app URL (localhost for development, your domain for production)

## Vercel Deployment

When deploying to Vercel, add these environment variables in:
**Vercel Dashboard → Settings → Environment Variables**

### Important Notes:
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Variables without the prefix are server-side only (more secure)
- Never commit `.env.local` to version control
- If you previously shared API keys in logs/chat, **rotate them immediately**

## Security Best Practices

1. **Rotate API keys** if they were ever exposed
2. **Use different keys** for development and production
3. **Never hardcode** API keys in your source code
4. **Use server-side variables** for sensitive data (no `NEXT_PUBLIC_` prefix)
