import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Session } from '@supabase/supabase-js'
import { supabaseClient as supabase } from '@/lib/supabase-client'
import { authCallbackUrl } from '@/lib/auth/redirects'

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
  signUp: (email: string, password: string, metadata?: { full_name?: string }, emailRedirectTo?: string) => Promise<{ error?: any; session?: Session | null }>
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
          
          set({ user: data.user, session: data.session, profile: null })
          await get().fetchProfile()
          
          return {}
        } catch (error) {
          return { error }
        }
      },

      signUp: async (email: string, password: string, metadata = {}, emailRedirectTo = authCallbackUrl(window.location.origin)) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: metadata.full_name },
              emailRedirectTo,
            }
          })
          
          if (error) return { error }
          
          // A user returned without a session still needs to confirm their email.
          if (data.session) {
            set({ user: data.user, session: data.session, profile: null })
            await get().fetchProfile()
          }
          return { session: data.session }
        } catch (error) {
          return { error }
        }
      },

      signInWithGoogle: async () => {
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: authCallbackUrl(window.location.origin)
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

          if (get().user?.id === user.id) set({ profile: data })
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

          if (get().user?.id === user.id) set({ profile: data })
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

// Restore cookie sessions and follow sign-in/sign-out changes, including other tabs.
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((_event, session) => {
    const previousUserId = useAuth.getState().user?.id
    useAuth.setState({
      user: session?.user ?? null,
      session,
      loading: false,
      ...(previousUserId !== session?.user.id || !session ? { profile: null } : {}),
    })

    // Supabase auth callbacks hold an internal lock. Fetch after it is released.
    if (session?.user) {
      const userId = session.user.id
      setTimeout(() => {
        if (useAuth.getState().user?.id === userId) void useAuth.getState().fetchProfile()
      }, 0)
    }
  })
}
