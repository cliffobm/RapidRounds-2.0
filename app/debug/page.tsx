'use client'

import Link from 'next/link'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [mounted, setMounted] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    
    // Test environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'MISSING'
    }
    
    console.log('Environment variables:', envVars)
    
    // Test if stores can be imported
    try {
      import('@/store/useAuth').then(() => {
        console.log('Auth store imported successfully')
      }).catch(err => {
        console.error('Auth store import failed:', err)
        setErrors(prev => [...prev, `Auth store: ${err.message}`])
      })
      
      import('@/store/useProgress').then(() => {
        console.log('Progress store imported successfully')
      }).catch(err => {
        console.error('Progress store import failed:', err)
        setErrors(prev => [...prev, `Progress store: ${err.message}`])
      })
    } catch (error) {
      console.error('Store import error:', error)
    }
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Status</h2>
          <p className="text-green-600">✅ Page mounted successfully</p>
          <p className="text-green-600">✅ React hydration working</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Environment</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p>App URL: {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</p>
            <p>App Name: {process.env.NEXT_PUBLIC_APP_NAME || 'Not set'}</p>
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</p>
            <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
            <p>Stripe Key: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Not set'}</p>
          </div>
        </div>
        
        {errors.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-red-600">Errors</h2>
            <div className="bg-red-100 p-4 rounded">
              {errors.map((error, index) => (
                <p key={index} className="text-red-800">{error}</p>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h2 className="text-lg font-semibold">Navigation Test</h2>
          <div className="space-x-4">
            <Link href="/" className="text-blue-600 underline">Home</Link>
            <Link href="/test" className="text-blue-600 underline">Test</Link>
            <Link href="/study" className="text-blue-600 underline">Study</Link>
            <Link href="/leaderboard" className="text-blue-600 underline">Leaderboard</Link>
            <Link href="/profile" className="text-blue-600 underline">Profile</Link>
          </div>
        </div>
      </div>
    </div>
  )
}



