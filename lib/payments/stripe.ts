import Stripe from 'stripe'

// Initialize Stripe only if the secret key is available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia' as any,
}) : null

export interface SubscriptionTier {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  stripePriceId: string
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Access to 5 scenarios per month',
      'Basic progress tracking',
      'Limited rationale access (5 free)',
      'Community leaderboards'
    ],
    stripePriceId: ''
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    interval: 'month',
    features: [
      'Unlimited scenario access',
      'Full rationale explanations',
      'Advanced progress analytics',
      'Priority support',
      'Offline content download',
      'Custom study plans',
      'Institution leaderboards'
    ],
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || ''
  }
]

export interface TrialStatus {
  active: boolean
  expiresAt: Date | null
  rationalesUsed: number
  maxRationales: number
}

export class PaymentService {
  // Check if user is within trial period
  static isTrialActive(userProfile: any): boolean {
    if (!userProfile.trial_active || !userProfile.trial_expires_at) {
      return false
    }
    
    return new Date(userProfile.trial_expires_at) > new Date()
  }

  // Check if user has premium access
  static hasPremiumAccess(userProfile: any): boolean {
    return userProfile.subscription_tier === 'premium' || this.isTrialActive(userProfile)
  }

  // Get trial status
  static getTrialStatus(userProfile: any): TrialStatus {
    const isActive = this.isTrialActive(userProfile)
    const expiresAt = userProfile.trial_expires_at ? new Date(userProfile.trial_expires_at) : null
    
    return {
      active: isActive,
      expiresAt,
      rationalesUsed: userProfile.trial_rationales_used || 0,
      maxRationales: 5 // First 5 scenarios get full rationales
    }
  }

  // Create checkout session
  static async createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string } | { error: string }> {
    if (!stripe) {
      return { error: 'Stripe is not configured' }
    }
    
    try {
      const session = await stripe.checkout.sessions.create({
        // customer_email: undefined, // Will be filled by Stripe
        client_reference_id: userId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        metadata: {
          userId
        }
      })

      return { sessionId: session.id }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return { error: 'Failed to create checkout session' }
    }
  }

  // Create customer portal session
  static async createPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<{ url: string } | { error: string }> {
    if (!stripe) {
      return { error: 'Stripe is not configured' }
    }
    
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })

      return { url: session.url }
    } catch (error) {
      console.error('Error creating portal session:', error)
      return { error: 'Failed to create portal session' }
    }
  }

  // Handle webhook events
  static async handleWebhook(
    body: string,
    signature: string
  ): Promise<void> {
    if (!stripe) {
      throw new Error('Stripe is not configured')
    }
    
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
    
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      throw new Error('Invalid webhook signature')
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  }

  private static async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.client_reference_id
    if (!userId) return

    try {
      // Update user profile with subscription
      const { supabaseClient } = await import('@/lib/supabase-client')
      const { error } = await supabaseClient
        .from('profiles')
        .update({
          subscription_tier: 'premium',
          stripe_customer_id: session.customer as string,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user subscription:', error)
      }
    } catch (error) {
      console.error('Error handling checkout completion:', error)
    }
  }

  private static async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    // Handle successful payment
    console.log('Payment succeeded:', invoice.id)
  }

  private static async handlePaymentFailed(invoice: Stripe.Invoice) {
    // Handle failed payment
    console.log('Payment failed:', invoice.id)
  }

  private static async handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string
    
    try {
      // Find user by customer ID and downgrade
      const { supabaseClient } = await import('@/lib/supabase-client')
      const { error } = await supabaseClient
        .from('profiles')
        .update({
          subscription_tier: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', customerId)

      if (error) {
        console.error('Error downgrading user subscription:', error)
      }
    } catch (error) {
      console.error('Error handling subscription cancellation:', error)
    }
  }
}

// Client-side helpers
export const getSubscriptionTier = (tierId: string): SubscriptionTier | null => {
  return SUBSCRIPTION_TIERS.find(tier => tier.id === tierId) || null
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}


