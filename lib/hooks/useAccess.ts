import { useState, useEffect } from 'react'
import { useAuth } from '@/store/useAuth'
import { AccessCheck } from '@/lib/access'

export function useRationaleAccess(questionId?: string) {
  const { user, profile } = useAuth()
  const [accessCheck, setAccessCheck] = useState<AccessCheck | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let active = true
    const checkAccess = async () => {
      if (!user || !profile) {
        setAccessCheck(null)
        setLoading(false)
        setError(null)
        return
      }

      try {
        setAccessCheck(null)
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/access/rationale?userId=${user.id}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to check access')
        }
        
        if (active) setAccessCheck(data.access)
      } catch (err) {
        console.error('Error checking rationale access:', err)
        if (active) setError('Failed to check access')
      } finally {
        if (active) setLoading(false)
      }
    }

    checkAccess()
    return () => { active = false }
  }, [user, profile, questionId, revision])

  return {
    accessCheck,
    canAccess: accessCheck?.hasAccess || false,
    loading,
    error,
    refresh: () => {
      if (user && profile) {
        // Re-trigger the effect
        setRevision(value => value + 1)
      }
    }
  }
}

export function useScenarioAccess(scenarioId?: string) {
  const { user, profile } = useAuth()
  const [accessCheck, setAccessCheck] = useState<AccessCheck | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !profile || !scenarioId) {
        setAccessCheck(null)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // For now, use the same endpoint - we could create a separate scenario access endpoint
        const response = await fetch(`/api/access/rationale?userId=${user.id}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to check access')
        }
        
        setAccessCheck(data.access)
      } catch (err) {
        console.error('Error checking scenario access:', err)
        setError('Failed to check access')
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user, profile, scenarioId])

  return {
    accessCheck,
    canAccess: accessCheck?.hasAccess || false,
    loading,
    error
  }
}

export function useFeatureAccess(feature: string) {
  const { user, profile } = useAuth()
  const [accessCheck, setAccessCheck] = useState<AccessCheck | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !profile) {
        setAccessCheck(null)
        return
      }

      try {
        setLoading(true)
        
        // For now, use the same endpoint - we could create a separate feature access endpoint
        const response = await fetch(`/api/access/rationale?userId=${user.id}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to check access')
        }
        
        setAccessCheck(data.access)
      } catch (err) {
        console.error('Error checking feature access:', err)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user, profile, feature])

  return {
    accessCheck,
    canAccess: accessCheck?.hasAccess || false,
    loading
  }
}

// Hook for handling payments
export function usePayments() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const createCheckoutSession = async (priceId: string) => {
    if (!user) {
      throw new Error('User must be logged in to make payments')
    }

    try {
      setLoading(true)
      
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          priceId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(m => 
        m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      )

      if (stripe) {
        await stripe.redirectToCheckout({
          sessionId: data.sessionId
        })
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const startFreeTrial = async () => {
    if (!user) {
      throw new Error('User must be logged in to start trial')
    }

    try {
      setLoading(true)
      
      // Update user profile to start trial
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7-day trial

      const { updateProfile } = useAuth.getState()
      await updateProfile({
        subscription_tier: 'trial',
        trial_active: true,
        trial_expires_at: expiresAt.toISOString()
      })

      return { success: true }
    } catch (error) {
      console.error('Error starting trial:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    createCheckoutSession,
    startFreeTrial,
    loading
  }
}
