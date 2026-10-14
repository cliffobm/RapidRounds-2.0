import { canSeeFullRationale, getRationaleForDisplay } from '@/lib/rationales'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from './useAuth'

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn() } }))

// Mock Supabase
vi.mock('../lib/supabase-client', () => ({
  supabaseClient: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      })),
    })),
  },
}))

describe('useAuth Store', () => {
  beforeEach(() => {
    // Reset store state
    useAuth.setState({
      user: null,
      session: null,
      profile: null,
      loading: false,
    })
    vi.clearAllMocks()
  })

  describe('Basic State Management', () => {
    it('should initialize with default state', () => {
      const state = useAuth.getState()
      
      expect(state.user).toBeNull()
      expect(state.session).toBeNull()
      expect(state.profile).toBeNull()
      expect(state.loading).toBe(false)
    })

    it('should update user state', () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' } as any
      
      useAuth.getState().setUser(mockUser)
      
      expect(useAuth.getState().user).toBe(mockUser)
    })

    it('should update profile state', () => {
      const mockProfile = {
        id: 'user-123',
        role: 'student' as const,
        subscription_tier: 'free' as const,
        trial_active: false,
        trial_expires_at: null,
        institution_id: null,
        credentials: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
      
      useAuth.getState().setProfile(mockProfile)
      
      expect(useAuth.getState().profile).toBe(mockProfile)
    })
  })

  describe('Authentication Methods', () => {
    it('does not authenticate an unconfirmed signup or send privilege metadata', async () => {
      const { supabaseClient: supabase } = await import('../lib/supabase-client')
      vi.mocked(supabase.auth.signUp).mockResolvedValue({ data: { user: { id: 'unconfirmed' }, session: null }, error: null } as any)
      const result = await useAuth.getState().signUp('new@example.com', 'test-password', { full_name: 'New Learner', role: 'admin' } as any, 'http://localhost:3000/auth/callback?next=%2Fprofile')
      expect(result.session).toBeNull()
      expect(useAuth.getState().user).toBeNull()
      expect(useAuth.getState().session).toBeNull()
      expect(supabase.auth.signUp).toHaveBeenCalledWith({ email: 'new@example.com', password: 'test-password', options: { data: { full_name: 'New Learner' }, emailRedirectTo: 'http://localhost:3000/auth/callback?next=%2Fprofile' } })
    })

    it('loads the database profile when signup immediately returns a session', async () => {
      const { supabaseClient: supabase } = await import('../lib/supabase-client')
      const user = { id: 'new-learner' }
      const session = { user, access_token: 'fixture' }
      const profile = { id: 'new-learner', role: 'student' }
      vi.mocked(supabase.auth.signUp).mockResolvedValue({ data: { user, session }, error: null } as any)
      vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq: () => ({ single: async () => ({ data: profile, error: null }) }) }) } as any)
      await useAuth.getState().signUp('new@example.com', 'test-password')
      expect(useAuth.getState().user).toEqual(user)
      expect(useAuth.getState().session).toEqual(session)
      expect(useAuth.getState().profile).toEqual(profile)
    })

    it('should handle successful sign in', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockSession = { access_token: 'token-123' }

      const { supabaseClient: supabase } = await import('../lib/supabase-client')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      } as any)

      const result = await useAuth.getState().signIn('test@example.com', 'password')
      
      expect(result.error).toBeUndefined()
      expect(useAuth.getState().user).toBe(mockUser)
      expect(useAuth.getState().session).toBe(mockSession)
    })

    it('should handle sign in errors', async () => {
      const mockError = { message: 'Invalid credentials' }

      const { supabaseClient: supabase } = await import('../lib/supabase-client')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as any)

      const result = await useAuth.getState().signIn('test@example.com', 'wrong-password')
      
      expect(result.error).toBe(mockError)
      expect(useAuth.getState().user).toBeNull()
    })

    it('should handle sign out', async () => {
      // Set initial state
      useAuth.setState({
        user: { id: 'user-123' } as any,
        session: { access_token: 'token' } as any,
        profile: { id: 'user-123' } as any,
      })

      const { supabaseClient: supabase } = await import('../lib/supabase-client')
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

      await useAuth.getState().signOut()
      
      expect(useAuth.getState().user).toBeNull()
      expect(useAuth.getState().session).toBeNull()
      expect(useAuth.getState().profile).toBeNull()
    })
  })

  describe('Subscription Helpers', () => {
    it('should correctly identify trial users', () => {
      const mockProfile = {
        id: 'user-123',
        role: 'student' as const,
        subscription_tier: 'free' as const,
        trial_active: true,
        trial_expires_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        institution_id: null,
        credentials: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      useAuth.setState({ profile: mockProfile })
      
      const result = useAuth.getState().isTrialActive()
      expect(result).toBe(true)
    })

    it('should correctly identify expired trials', () => {
      const mockProfile = {
        id: 'user-123',
        role: 'student' as const,
        subscription_tier: 'free' as const,
        trial_active: true,
        trial_expires_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        institution_id: null,
        credentials: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      useAuth.setState({ profile: mockProfile })
      
      const result = useAuth.getState().isTrialActive()
      expect(result).toBe(false)
    })

    it('should correctly identify premium users', () => {
      const mockProfile = {
        id: 'user-123',
        role: 'student' as const,
        subscription_tier: 'premium' as const,
        trial_active: false,
        trial_expires_at: null,
        institution_id: null,
        credentials: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      useAuth.setState({ profile: mockProfile })
      
      const result = useAuth.getState().isPremiumUser()
      expect(result).toBe(true)
    })

    it('should check feature access correctly', () => {
      const mockProfile = {
        id: 'user-123',
        role: 'student' as const,
        subscription_tier: 'free' as const,
        trial_active: false,
        trial_expires_at: null,
        institution_id: null,
        credentials: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      useAuth.setState({ profile: mockProfile })
      
      // Free user should have access to basic features
      expect(useAuth.getState().canAccessFeature('basic_scenarios')).toBe(true)
      
      // Free user should not have access to premium features
      expect(useAuth.getState().canAccessFeature('advanced_analytics')).toBe(false)
    })
  })
})

describe('Helper Functions', () => {
  describe('canSeeFullRationale', () => {
    it('should work with different profile structures', () => {
      expect(canSeeFullRationale({ subscription_tier: 'premium' }, 10)).toBe(true)
      expect(canSeeFullRationale({ subscription_tier: 'free' }, 3)).toBe(true)
      expect(canSeeFullRationale({ subscription_tier: 'free' }, 5)).toBe(false)
      expect(canSeeFullRationale(null, 0)).toBe(false)
    })
  })

  describe('getRationaleForDisplay', () => {
    const mockRationale = {
      hint: 'Consider the symptoms',
      full: 'Complete explanation with evidence'
    }

    it('should return full content when access is granted', () => {
      const result = getRationaleForDisplay(mockRationale, true)
      expect(result).toBe(mockRationale.full)
    })

    it('should return hint when access is denied', () => {
      const result = getRationaleForDisplay(mockRationale, false)
      expect(result).toBe(mockRationale.hint)
    })
  })
})




describe('profile edit payload', () => {
  it('leaves updated_at to the database trigger', async () => {
    const { supabaseClient } = await import('../lib/supabase-client')
    const saved = { id: 'user-123', credentials: ['RN'] } as any
    const update = vi.fn(() => ({ eq: () => ({ select: () => ({ single: async () => ({ data: saved, error: null }) }) }) }))
    vi.mocked(supabaseClient.from).mockReturnValue({ update } as any)
    useAuth.setState({ user: { id: 'user-123' } as any, profile: { id: 'user-123' } as any })
    await useAuth.getState().updateProfile({ credentials: ['RN'] })
    expect(update).toHaveBeenCalledWith({ credentials: ['RN'] })
    expect(useAuth.getState().profile).toEqual(saved)
  })
})


describe('profile response ownership', () => {
  it('ignores an old account response after switching users', async () => {
    const { supabaseClient } = await import('../lib/supabase-client')
    let resolveProfile!: (value: any) => void
    const response = new Promise(resolve => { resolveProfile = resolve })
    vi.mocked(supabaseClient.from).mockReturnValue({ select: () => ({ eq: () => ({ single: () => response }) }) } as any)
    useAuth.setState({ user: { id: 'learner-a' } as any, profile: null })
    const request = useAuth.getState().fetchProfile()
    useAuth.setState({ user: { id: 'learner-b' } as any, profile: null })
    resolveProfile({ data: { id: 'learner-a', role: 'student' }, error: null })
    await request
    expect(useAuth.getState().profile).toBeNull()
  })
})
