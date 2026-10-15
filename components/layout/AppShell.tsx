'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Logo } from '../ui/Logo'
import { Button } from '../ui/Button'
import { ClientOnly } from '../ui/ClientOnly'
import { useAuth } from '@/store/useAuth'
import { useTheme } from '@/app/providers'
import {
  Home,
  TestTube,
  BookOpen,
  Activity,
  User,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react'
import { FabActions } from './FabActions'

const navItems = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Test', icon: TestTube, href: '/test' },
  { label: 'Study', icon: BookOpen, href: '/study' },
  { label: 'RR Scenarios', icon: Activity, href: '/rr' },
  { label: 'Profile', icon: User, href: '/profile' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a
        href="#app-main-content"
        className="sr-only z-[60] rounded-xl bg-surface p-3 text-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <header className="safe-top sticky top-0 z-50 border-b border-edge bg-canvas/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="hidden sm:block">
            <Logo size="md" />
          </div>
          <div className="shrink-0 sm:hidden">
            <Logo size="sm" variant="icon" />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ClientOnly>
              {!loading &&
                (user ? (
                  <>
                    <span className="hidden max-w-[180px] truncate text-sm text-muted md:block">
                      {user.user_metadata?.full_name ||
                        user.user_metadata?.name ||
                        user.email}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await signOut()
                        router.push('/')
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => router.push('/auth/sign-in')}
                  >
                    Sign In
                  </Button>
                ))}
            </ClientOnly>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              aria-pressed={isDark}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="rounded-full border border-edge bg-surface p-3 text-signal hover:bg-surface-raised"
            >
              {isDark ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>
      <main id="app-main-content" className="pb-28" tabIndex={-1}>
        {children}
      </main>
      <nav
        aria-label="Main navigation"
        className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-edge bg-canvas/95 backdrop-blur-xl"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1 px-2 py-2">
          {navItems.map(({ label, icon: Icon, href }) => {
            const active =
              href === '/'
                ? pathname === '/'
                : pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[56px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center text-[11px] font-medium sm:text-xs ${active ? 'bg-signal-soft text-signal' : 'text-muted hover:bg-surface-raised hover:text-ink'}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      <ClientOnly>
        <FabActions userRole={profile?.role || 'student'} />
      </ClientOnly>
    </div>
  )
}
