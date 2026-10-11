import { NextResponse, NextRequest } from "next/server";
import { getUserFromRequest } from '@/lib/auth/server'

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  try {
    // Runtime-safe user authentication
    const user = await getUserFromRequest(req)
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { scenarioItemId, prompt, generate } = await req.json()

    if (!scenarioItemId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Lazily import AccessControl to avoid build-time initialization
    const { AccessControl } = await import('@/lib/access')
    
    // Get user counters using authenticated user ID
    const counters = await AccessControl.getUserCounters(user.id)
    
    // Check access
    const accessCheck = await AccessControl.canSeeFullRationale(user.id, counters)

    // If user wants to generate rationale and has access
    if (generate && prompt && accessCheck.hasAccess) {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'AI features not available - missing API key' },
          { status: 503 }
        )
      }

      try {
        // Dynamically import AI only when needed to avoid build-time initialization
        const { generateRationale } = await import('@/lib/ai')
        const rationaleResult = await generateRationale({ prompt })
        
        if (!rationaleResult.ok) {
          return NextResponse.json(
            { error: rationaleResult.error || 'Failed to generate rationale' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          access: accessCheck,
          counters,
          rationale: rationaleResult.data
        })
      } catch (error: any) {
        console.error('Rationale generation error:', error)
        return NextResponse.json(
          { error: 'Failed to generate rationale' },
          { status: 500 }
        )
      }
    }

    // Return access information without generating rationale
    return NextResponse.json({
      access: accessCheck,
      counters
    })
  } catch (error: any) {
    console.error('Rationale route error:', error)
    // Never throw during build; always catch and return JSON error
    return NextResponse.json(
      { error: error?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Runtime-safe user authentication
    const user = await getUserFromRequest(req)
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Browser-only logic check (though this is server-side)
    if (typeof window !== 'undefined') {
      console.warn('GET rationale route called in browser - this should not happen')
      return new Response('Method not allowed', { status: 405 })
    }

    // Lazily import AccessControl
    const { AccessControl } = await import('@/lib/access')

    // Get user's current usage stats using authenticated user ID
    const counters = await AccessControl.getUserCounters(user.id)
    const accessCheck = await AccessControl.canSeeFullRationale(user.id, counters)

    return NextResponse.json({
      access: accessCheck,
      counters,
      limits: {
        freeRationales: 5,
        freeScenarios: 5
      }
    })
  } catch (error: any) {
    console.error('Rationale route error:', error)
    // Never throw during build; always catch and return JSON error
    return NextResponse.json(
      { error: error?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}



