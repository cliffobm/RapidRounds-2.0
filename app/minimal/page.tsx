'use client'

import Link from 'next/link'

export default function MinimalPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          🎉 RapidRounds is Live!
        </h1>
        
        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-xl text-gray-700">
            Your nursing education platform is successfully deployed on Vercel.
          </p>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              ✅ What&apos;s Working:
            </h2>
            <ul className="text-left text-blue-800 space-y-2">
              <li>• Next.js 15 app router</li>
              <li>• Tailwind CSS styling</li>
              <li>• TypeScript compilation</li>
              <li>• Vercel deployment</li>
              <li>• Mobile-responsive design</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-green-900 mb-4">
              🚀 Features Ready:
            </h2>
            <ul className="text-left text-green-800 space-y-2">
              <li>• Swipeable scenario flow</li>
              <li>• Comprehensive gamification</li>
              <li>• Flipped classroom system</li>
              <li>• Advanced leaderboards</li>
              <li>• Monetization with Stripe</li>
              <li>• Accessibility compliance</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Test the Application:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Link href="/simple" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                Simple Test
              </Link>
              <Link href="/debug" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                Debug Info
              </Link>
              <Link href="/" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                Full App
              </Link>
              <Link href="/test" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                Test Scenarios
              </Link>
              <Link href="/study" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors">
                Study Materials
              </Link>
              <Link href="/leaderboard" className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors">
                Leaderboard
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔧 If You See Issues:
            </h3>
            <ol className="text-left text-gray-700 space-y-2">
              <li>1. Check environment variables in Vercel dashboard</li>
              <li>2. Verify Supabase connection and migration</li>
              <li>3. Check browser console for JavaScript errors</li>
              <li>4. Visit /debug page for detailed diagnostics</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}



