import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/auth/sign-in?error=Could not authenticate user`)
    }

    // If user is successfully authenticated, create or update profile
    if (data.user) {
      const supabaseClient = await createClient()
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
          avatar_url: data.user.user_metadata?.avatar_url || null,
          role: 'student', // Default role
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Error creating/updating profile:', profileError)
        // Continue anyway, profile can be updated later
      }
    }
  }

  // Redirect to home page after successful authentication
  return NextResponse.redirect(`${origin}/`)
}
