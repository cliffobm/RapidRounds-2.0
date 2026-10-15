import Link from 'next/link'
// Simple test page without AppShell to isolate routing issues
export default function SimpleTestPage() {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-white p-8">
          <h1 className="text-4xl font-bold text-green-600 mb-8">
            ✅ Routing Works!
          </h1>
          
          <div className="max-w-2xl space-y-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-green-900 mb-4">
                Deployment Status: SUCCESS
              </h2>
              <ul className="text-green-800 space-y-2">
                <li>✅ Next.js App Router working</li>
                <li>✅ File-based routing functional</li>
                <li>✅ TypeScript compilation successful</li>
                <li>✅ Static page rendering working</li>
                <li>✅ Vercel deployment complete</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                Next: Test Other Pages
              </h2>
              <div className="space-y-2">
                <p className="text-blue-800">Try these URLs:</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• <Link href="/simple" className="underline hover:text-blue-900">/simple</Link> - Basic page with AppShell</li>
                  <li>• <Link href="/debug" className="underline hover:text-blue-900">/debug</Link> - Environment diagnostics</li>
                  <li>• <Link href="/" className="underline hover:text-blue-900">/</Link> - Full application</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-yellow-900 mb-4">
                If Other Pages Show 404:
              </h2>
              <ol className="text-yellow-800 space-y-1">
                <li>1. Issue is likely with AppShell component or providers</li>
                <li>2. Check browser console for JavaScript errors</li>
                <li>3. Verify environment variables are set in Vercel</li>
                <li>4. Check Supabase connection status</li>
              </ol>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
