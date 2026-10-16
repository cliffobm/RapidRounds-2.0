'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Layers3,
  Zap,
  BookOpen,
  LayoutGrid,
  Moon,
  Sun,
  UserRound,
  Settings,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useTheme } from '@/app/providers'
import { useAuth } from '@/store/useAuth'
import { DATABASE_CONFIGURED } from '@/lib/env'
const navigation = [
  { href: '/home', title: 'Home', icon: Home },
  { href: '/rr', title: 'Rounds', icon: Layers3 },
  { href: '/quiz', title: 'Practice', icon: Zap },
  { href: '/study', title: 'Study', icon: BookOpen },
  { href: '/test', title: 'Explore', icon: LayoutGrid },
]
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isDark, toggleTheme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const links = navigation.map(({ href, title, icon: Icon }) => {
    // The first render must not depend on a cached server pathname.
    const active = mounted && pathname?.startsWith(href)
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? 'page' : undefined}
        className={`rr-nav-item ${active ? 'is-active' : ''}`}
      >
        <Icon size={20} />
        <span>{title}</span>
      </Link>
    )
  })
  return (
    <div className="rr-app">
      <a href="#main-content" className="rr-skip">
        Skip to content
      </a>
      <header className="rr-topbar">
        <div className="rr-topbar-inner">
          <Link href="/" aria-label="Rapid Rounds home">
            <Logo size="sm" />
          </Link>
          <nav className="rr-desktop-nav" aria-label="Main navigation">
            {links}
          </nav>
          <div className="rr-header-actions">
            <Link
              href="/settings"
              className="rr-icon-button rr-settings-link"
              aria-label="Settings"
              aria-current={
                mounted && pathname === '/settings' ? 'page' : undefined
              }
            >
              <Settings size={20} />
            </Link>
            <span className="rr-review-badge">
              <i /> Review edition
            </span>
            <button
              className="rr-icon-button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Use light theme' : 'Use dark theme'}
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            {DATABASE_CONFIGURED && (
              <Link
                className="rr-icon-button"
                href={mounted && user ? '/profile' : '/auth/sign-in'}
                aria-label="Your account"
              >
                <UserRound size={19} />
              </Link>
            )}
          </div>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <nav className="rr-mobile-nav" aria-label="Mobile navigation">
        {links}
      </nav>
    </div>
  )
}
