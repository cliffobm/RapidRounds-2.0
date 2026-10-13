'use client'

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, AlertDescription } from '@/components/ui/Alert'

export default function TestOAuthPage() {
  const [origin, setOrigin] = useState('Loading')
  useEffect(() => { setOrigin(window.location.origin) }, [])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')
  const supabase = supabaseClient

  const testOAuthProvider = async (provider: 'google' | 'github' | 'discord') => {
    setLoading(true)
    setResult('')
    setError('')
    
    try {
      console.log(`Testing ${provider} OAuth...`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error(`${provider} OAuth error:`, error)
        setError(`${provider}: ${error.message}`)
      } else {
        console.log(`${provider} OAuth success:`, data)
        setResult(`${provider}: OAuth initiated successfully`)
      }
    } catch (err: any) {
      console.error(`${provider} OAuth exception:`, err)
      setError(`${provider}: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>OAuth Provider Test</CardTitle>
          <CardDescription>
            Test OAuth providers to verify configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => testOAuthProvider('google')}
              disabled={loading}
              className="w-full"
            >
              Test Google OAuth
            </Button>
            
            <Button
              onClick={() => testOAuthProvider('github')}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Test GitHub OAuth
            </Button>
            
            <Button
              onClick={() => testOAuthProvider('discord')}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Test Discord OAuth
            </Button>
          </div>

          {result && (
            <Alert>
              <AlertDescription className="text-green-600">
                ✅ {result}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                ❌ {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <p className="text-sm text-gray-600">
              Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}
            </p>
            <p className="text-sm text-gray-600">
              Current URL: {origin}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
