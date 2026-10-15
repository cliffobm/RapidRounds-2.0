// lib/env.ts - Centralized environment configuration

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'local-development-key'
}

// Application Configuration
export const APP_CONFIG = {
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  environment: process.env.NODE_ENV || 'development'
}

// Feature Flags
export const FEATURES = {
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  notifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
  leaderboards: process.env.NEXT_PUBLIC_ENABLE_LEADERBOARDS !== 'false'
}

// Validate required environment variables
export function validateEnvironment() {
  const errors: string[] = []
  
  if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url === 'your_supabase_url_here') {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_URL')
  }
  
  if (!SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey === 'your_supabase_anon_key_here') {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  
  if (errors.length > 0 && APP_CONFIG.environment === 'development') {
    console.error('❌ Environment validation failed:', errors)
    console.info('ℹ️ Please check your .env.local file or environment variables')
  }
  
  return errors.length === 0
}

// Initialize validation on import (client-side only)
if (typeof window !== 'undefined') {
  validateEnvironment()
}
