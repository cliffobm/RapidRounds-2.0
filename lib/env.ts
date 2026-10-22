// Explicit configuration only. Offline practice never contacts the legacy project.
export const DATABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
)
export const offlineFetch: typeof fetch = async () => {
  throw new Error(
    'Database features require an explicitly configured development project'
  )
}

export const REVIEW_AUTH_ONLY =
  process.env.NEXT_PUBLIC_REVIEW_AUTH_ONLY !== 'false'
export const LEGACY_DATABASE_ENABLED = DATABASE_CONFIGURED && !REVIEW_AUTH_ONLY

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  anonKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'offline-placeholder-key',
}

// Application Configuration
export const APP_CONFIG = {
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  environment: process.env.NODE_ENV || 'development',
}

// Feature Flags
export const FEATURES = {
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  notifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
  leaderboards: process.env.NEXT_PUBLIC_ENABLE_LEADERBOARDS !== 'false',
}

// Validate required environment variables
export function validateEnvironment() {
  const errors: string[] = []

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    SUPABASE_CONFIG.url === 'your_supabase_url_here'
  ) {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (
    (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    SUPABASE_CONFIG.anonKey === 'your_supabase_anon_key_here'
  ) {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  if (errors.length > 0 && APP_CONFIG.environment === 'development') {
    console.error('❌ Environment validation failed:', errors)
    console.info(
      'ℹ️ Please check your .env.local file or environment variables'
    )
  }

  return errors.length === 0
}

// Initialize validation on import (client-side only)
if (typeof window !== 'undefined') {
  validateEnvironment()
}

// The review edition uses Supabase Auth only. This is an application request guard,
// not a replacement for database RLS/permissions.
export const supabaseFetch: typeof fetch = async (input, init) => {
  if (!DATABASE_CONFIGURED) return offlineFetch(input, init)
  const url = new URL(
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url
  )
  if (
    REVIEW_AUTH_ONLY &&
    (url.origin !== new URL(SUPABASE_CONFIG.url).origin ||
      !url.pathname.startsWith('/auth/v1/'))
  )
    throw new Error('Cloud data requests are unavailable in the review edition')
  return fetch(input, init)
}
