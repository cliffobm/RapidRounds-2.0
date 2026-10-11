import { NextResponse, NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    // Runtime-safe user authentication
    const user = await getUserFromRequest(request)
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { priceId } = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Environment check for production-only features
    if (process.env.NODE_ENV === 'production') {
      // Additional production-only validation
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
          { error: 'Payment system not configured' },
          { status: 503 }
        )
      }
    }

    // Browser-only logic check (though this is server-side)
    if (typeof window !== 'undefined') {
      console.warn('Checkout route called in browser - this should not happen')
      return new Response('Method not allowed', { status: 405 })
    }

    // Lazily import dependencies
    const { supabase } = await import('@/lib/supabase')
    const { PaymentService, SUBSCRIPTION_TIERS } = await import('@/lib/payments/stripe')

    // Verify user exists (using authenticated user ID)
    const supabaseClient = supabase
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify price ID is valid
    const validPriceIds = SUBSCRIPTION_TIERS.map(tier => tier.stripePriceId).filter(Boolean)
    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      )
    }

    // Create checkout session (using authenticated user ID)
    const result = await PaymentService.createCheckoutSession(
      user.id,
      priceId,
      `${process.env.NEXT_PUBLIC_APP_URL}/profile?success=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/profile?canceled=true`
    )

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ sessionId: result.sessionId })
  } catch (error) {
    console.error('Checkout route error:', error)
    return new Response('Internal Error', { status: 500 })
  }
}


