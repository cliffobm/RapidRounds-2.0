// lib/supabase.ts - Server-only Supabase client
import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { supabaseFetch } from './env'

// Supabase configuration with proper fallbacks
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'offline-placeholder-key'

// Validate configuration
if (!supabaseUrl || !supabaseKey || supabaseKey === 'placeholder-key') {
  if (process.env.NODE_ENV === 'development') {
    console.error(
      '❌ Missing or invalid Supabase configuration in server client'
    )
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: { fetch: supabaseFetch },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'student' | 'educator' | 'admin'
          credentials: string[]
          institution_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'student' | 'educator' | 'admin'
          credentials?: string[]
          institution_id?: string | null
        }
        Update: {
          role?: 'student' | 'educator' | 'admin'
          credentials?: string[]
          institution_id?: string | null
          updated_at?: string
        }
      }
      scenarios: {
        Row: {
          id: string
          system: string
          title: string
          vignette: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          system: string
          title: string
          vignette: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
        }
        Update: {
          system?: string
          title?: string
          vignette?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          updated_at?: string
        }
      }
      scenario_items: {
        Row: {
          id: string
          scenario_id: string
          type: 'mcq' | 'multi' | 'order' | 'input'
          payload: any
          created_at: string
        }
        Insert: {
          id?: string
          scenario_id: string
          type: 'mcq' | 'multi' | 'order' | 'input'
          payload: any
        }
        Update: {
          type?: 'mcq' | 'multi' | 'order' | 'input'
          payload?: any
        }
      }
      progress: {
        Row: {
          user_id: string
          scenario_id: string
          score: number
          completed_at: string
          correct_count: number
          attempts: number
        }
        Insert: {
          user_id: string
          scenario_id: string
          score: number
          completed_at?: string
          correct_count: number
          attempts?: number
        }
        Update: {
          score?: number
          completed_at?: string
          correct_count?: number
          attempts?: number
        }
      }
      bookmarks: {
        Row: {
          user_id: string
          scenario_item_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          scenario_item_id: string
        }
        Update: never
      }
    }
  }
}
