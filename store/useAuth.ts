import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Session } from '@supabase/supabase-js'
import { supabaseClient as supabase } from '@/lib/supabase-client'

export interface UserProfile {
  id: string
  role: 'student' | 'educator' | 'admin'
  subscription_tier: 'free' | 'trial' | 'premium'
  trial_active: boolean
  trial_expires_at: string | null
  institution_id: string | null
  credentials: string[]
  created_at: string
  updated_at: string
}

interface AuthState {
  // Auth state
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: any }>
  signInWithGoogle: () => Promise<{ error?: any }>
  signOut: () => Promise<void>
  
  // Profile methods
  fetchProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  
  // Subscription methods
  isTrialActive: () => boolean
  isPremiumUser: () => boolean
  canAccessFeature: (feature: string) => boolean
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      profile: null,
      loading: true,

      // Basic setters
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),

      // Authentication methods
      signIn: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          
          if (error) return { error }
          
          set({ user: data.user, session: data.session })
          await get().fetchProfile()
          
          return {}
        } catch (error) {
          return { error }
        }
      },

      signUp: async (email: string, password: string, metadata = {}) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: metadata
            }
          })
          
          if (error) return { error }
          
          set({ user: data.user, session: data.session })
          
          return {}
        } catch (error) {
          return { error }
        }
      },

      signInWithGoogle: async () => {
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          })
          
          return { error }
        } catch (error) {
          return { error }
        }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, profile: null })
      },

      // Profile methods
      fetchProfile: async () => {
        const { user } = get()
        if (!user) return

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) {
            console.error('Error fetching profile:', error)
            return
          }

          set({ profile: data })
        } catch (error) {
          console.error('Error fetching profile:', error)
        }
      },

      updateProfile: async (updates) => {
        const { user, profile } = get()
        if (!user || !profile) return

        try {
          const { data, error } = await supabase
            .from('profiles')
            .update({
              ...updates
            })
            .eq('id', user.id)
            .select()
            .single()

          if (error) {
            console.error('Error updating profile:', error)
            throw error
          }

          set({ profile: data })
        } catch (error) {
          console.error('Error updating profile:', error)
          throw error
        }
      },

      // Subscription helpers
      isTrialActive: () => {
        const { profile } = get()
        if (!profile) return false
        
        return !!(profile.trial_active && 
               profile.trial_expires_at && 
               new Date(profile.trial_expires_at) > new Date())
      },

      isPremiumUser: () => {
        const { profile } = get()
        return profile?.subscription_tier === 'premium'
      },

      canAccessFeature: (feature: string) => {
        const { profile } = get()
        if (!profile) return false

        const isPremium = get().isPremiumUser()
        const isTrialActive = get().isTrialActive()

        // Premium users have access to everything
        if (isPremium) return true

        // Trial users have access to premium features
        if (isTrialActive) return true

        // Free users have limited access
        const freeFeatures = [
          'basic_scenarios',
          'limited_rationales',
          'basic_progress_tracking'
        ]

        return freeFeatures.includes(feature)
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        profile: state.profile
      })
    }
  )
)

// Initialize auth listener
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    const { setUser, setSession, setLoading, fetchProfile } = useAuth.getState()
    
    setUser(session?.user ?? null)
    setSession(session)
    
    if (session?.user) {
      fetchProfile()
    } else {
      useAuth.setState({ profile: null })
    }
    
    setLoading(false)
  })
}


