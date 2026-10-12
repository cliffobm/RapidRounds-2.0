# Vercel Deployment Guide for RapidRounds

## 🚀 Quick Deployment Steps

### 1. Connect to Vercel
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel
```

### 2. Environment Variables Setup

In your **Vercel Dashboard** → **Settings** → **Environment Variables**, add:

#### Required Variables:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RapidRounds
```

#### Optional Variables:
```
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_LEADERBOARDS=true
```

#### AI Features (if using):
```
OPENAI_API_KEY=your_openai_api_key
```

### 3. Important Configuration Notes

#### Environment Variable Scope:
- **Production**: Set for production environment
- **Preview**: Set for preview deployments (optional)
- **Development**: Set for local development (optional)

#### Security:
- Variables **without** `NEXT_PUBLIC_` prefix are server-side only
- Variables **with** `NEXT_PUBLIC_` prefix are exposed to the browser
- **Never** commit API keys to your repository

### 4. Build Configuration

Your `vercel.json` is already configured with:
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 5. Deployment Checklist

- [ ] All environment variables set in Vercel dashboard
- [ ] `NEXT_PUBLIC_APP_URL` updated to your Vercel domain
- [ ] Supabase service role key is correct (not the example one)
- [ ] API keys are rotated if previously exposed
- [ ] Build passes locally (`npm run build`)

### 6. Post-Deployment Verification

1. **Check build logs** in Vercel dashboard
2. **Test API routes** (e.g., `/api/access/rationale`)
3. **Verify Supabase connection** on your live site
4. **Check environment variables** using `/debug` page

### 7. Common Issues & Solutions

#### Build Failures:
- **Missing env vars**: Add all required variables in Vercel dashboard
- **API key errors**: Ensure keys are valid and not expired
- **Supabase connection**: Verify URL and keys are correct

#### Runtime Errors:
- **CORS issues**: Check `NEXT_PUBLIC_APP_URL` matches your domain
- **Authentication**: Verify Supabase configuration
- **API timeouts**: Check function timeout settings in `vercel.json`

### 8. Production Optimizations

Your `next.config.js` already includes:
- ✅ Build optimizations
- ✅ Bundle splitting
- ✅ Image optimization
- ✅ Compression enabled

### 9. Monitoring & Debugging

- **Vercel Analytics**: Enable in dashboard
- **Function logs**: Check Vercel dashboard for API errors
- **Debug page**: Visit `/debug` to verify environment setup

## 🔧 Troubleshooting

### Environment Variables Not Loading:
1. Check variable names match exactly (case-sensitive)
2. Ensure variables are set for the correct environment
3. Redeploy after adding new variables

### Supabase Connection Issues:
1. Verify project URL and keys in Supabase dashboard
2. Check RLS policies are configured correctly
3. Ensure service role key has proper permissions

### API Route Errors:
1. Check function logs in Vercel dashboard
2. Verify all required environment variables are set
3. Test routes locally first with `npm run dev`
