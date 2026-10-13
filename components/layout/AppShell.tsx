'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '../ui/Logo'
import { Button } from '../ui/Button'
import { useAuth } from '@/store/useAuth'
import { useTheme } from '@/app/providers'
import { 
  Home,
  TestTube,
  BookOpen,
  Trophy,
  User,
  Sun,
  Moon,
  LogOut,
  Plus
} from 'lucide-react'
import { FabActions } from './FabActions'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { user, loading, signOut, signInWithGoogle } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const router = useRouter()


  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'test', label: 'Test', icon: TestTube, href: '/test' },
    { id: 'study', label: 'Study', icon: BookOpen, href: '/study' },
    { id: 'rr', label: 'RR Scenarios', icon: Trophy, href: '/rr' },
    { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''} bg-slate-50 dark:bg-slate-900 transition-all duration-300`}>
      <a href="#app-main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white p-3 text-slate-900">Skip to main content</a>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 safe-top shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="hidden sm:block"><Logo size="lg" className="hover:scale-105 transition-transform duration-300" /></div>
            <div className="sm:hidden shrink-0"><Logo size="sm" variant="icon" /></div>
            
            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Auth buttons */}
              {!loading && (
                <div className="flex items-center space-x-2">
                  {user ? (
                    <div className="flex items-center space-x-3">
                      {/* User avatar and email */}
                      <div className="hidden sm:flex items-center space-x-2">
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt={user.email || 'User'}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-medium">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <span className="max-w-[180px] truncate text-sm text-brand-blue dark:text-brand-cloud font-medium">
                          {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSignOut}
                        className="flex items-center space-x-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleSignIn}
                      className="flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Sign in with Google</span>
                    </Button>
                  )}
                </div>
              )}
              
              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="p-3 rounded-2xl bg-gradient-to-r from-brand-cloud to-brand-cloud-light dark:from-brand-navy-5 dark:to-brand-navy-6 hover:from-brand-orange/10 hover:to-brand-blue/10 dark:hover:from-brand-orange/20 dark:hover:to-brand-blue/20 transition-all duration-300 shadow-soft hover:shadow-medium transform hover:-translate-y-0.5"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="w-6 h-6 text-brand-orange" />
                ) : (
                  <Moon className="w-6 h-6 text-brand-blue" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="app-main-content" className="pb-20" role="main" tabIndex={-1}>
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 safe-bottom shadow-strong">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-5 items-center py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = false // TODO: implement active state based on current route
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex min-w-0 flex-col items-center py-3 px-1 sm:px-3 rounded-2xl min-h-[44px] transition-all duration-200 group ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-slate-600 hover:text-primary hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-6 h-6 transition-colors duration-200" />
                  <span className="max-w-full text-center text-xs font-medium mt-1 transition-colors duration-200">
                    {item.label}
                  </span>
                </a>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Floating Action Button */}
      <FabActions userRole={user ? 'educator' : 'student'} />
    </div>
  )
}

