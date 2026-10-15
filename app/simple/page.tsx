'use client'

import Link from 'next/link'

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        RapidRounds - Working! 🎉
      </h1>
      
      <div className="space-y-4">
        <p className="text-gray-700">
          If you can see this page, the deployment is working correctly.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-2">Next Steps:</h2>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Check environment variables in Vercel dashboard</li>
            <li>Verify Supabase connection</li>
            <li>Test the main app at <Link href="/" className="underline">homepage</Link></li>
          </ol>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">✅ Working Features</h3>
            <ul className="text-green-800 text-sm mt-2">
              <li>• Next.js 15 app router</li>
              <li>• Tailwind CSS styling</li>
              <li>• TypeScript compilation</li>
              <li>• Static page rendering</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900">⚠️ Potential Issues</h3>
            <ul className="text-yellow-800 text-sm mt-2">
              <li>• Missing environment variables</li>
              <li>• Supabase connection errors</li>
              <li>• Client-side hydration issues</li>
              <li>• Zustand store initialization</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-2">Quick Navigation Test</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Home
            </Link>
            <Link href="/test" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Test
            </Link>
            <Link href="/study" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Study
            </Link>
            <Link href="/leaderboard" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
              Leaderboard
            </Link>
            <Link href="/profile" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Profile
            </Link>
            <Link href="/debug" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              Debug
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}



