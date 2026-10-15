'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <CardTitle className="text-2xl text-slate-900">
            Page Not Found
          </CardTitle>
          <p className="text-slate-600 mt-2">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Link href="/">
              <Button className="w-full flex items-center justify-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </Button>
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
          
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-3">
              Quick navigation:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link href="/test" className="text-blue-600 hover:underline">
                Test Scenarios
              </Link>
              <Link href="/study" className="text-blue-600 hover:underline">
                Study Materials
              </Link>
              <Link href="/leaderboard" className="text-blue-600 hover:underline">
                Leaderboard
              </Link>
              <Link href="/profile" className="text-blue-600 hover:underline">
                Profile
              </Link>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-200">
            <Link href="/debug" className="text-xs text-slate-400 hover:text-slate-600">
              <HelpCircle className="w-3 h-3 inline mr-1" />
              Debug Information
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



