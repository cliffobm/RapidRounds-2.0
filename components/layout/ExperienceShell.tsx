'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Layers3,
  Zap,
  BookOpen,
  ChartNoAxesCombined,
  Moon,
  Sun,
  UserRound,
  Settings,
  BookA,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useTheme } from '@/app/providers'
import { useAuth } from '@/store/useAuth'
import { DATABASE_CONFIGURED } from '@/lib/env'
const navigation = [
  { href: '/home', title: 'Home', icon: Home },
  { href: '/rr', title: 'Rounds', icon: Layers3 },
  { href: '/practice', title: 'Practice', icon: Zap },
  { href: '/study', title: 'Study', icon: BookOpen },
  { href: '/progress', title: 'Progress', icon: ChartNoAxesCombined },
]
function NavigationLinks() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <>
      {navigation.map(({ href, title, icon: Icon }) => {
        const active =
          mounted &&
          (pathname?.startsWith(href) ||
            (href === '/practice' &&
              (pathname?.startsWith('/quiz') ||
                pathname?.startsWith('/quick-check'))) ||
            (href === '/rr' &&
              (pathname?.startsWith('/evolving') ||
                pathname?.startsWith('/rapid-response'))) ||
            (href === '/study' &&
              (pathname?.startsWith('/pathway') ||
                pathname?.startsWith('/ecg'))))
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
      })}
    </>
  )
}
function HeaderActions() {
  const pathname = usePathname()
  const { isDark, toggleTheme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <div className="rr-header-actions">
      <Link
        href="/glossary"
        className="rr-icon-button"
        aria-label="Glossary"
        title="Glossary"
      >
        <BookA size={20} />
      </Link>
      <Link
        href="/settings"
        className="rr-icon-button rr-settings-link"
        aria-label="Settings"
        aria-current={mounted && pathname === '/settings' ? 'page' : undefined}
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
          href={mounted && user ? '/account' : '/auth/sign-in'}
          aria-label="Your account"
        >
          <UserRound size={19} />
        </Link>
      )}
    </div>
  )
}
// Keep browser subscriptions inside the controls. Updating the header must not
// re-render the server page slot while Next is still hydrating its content.
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSignInPage =
    pathname === '/tester-login' || pathname === '/auth/sign-in'
  if (isSignInPage)
    return (
      <div className="rr-app rr-login-app">
        <a href="#main-content" className="rr-skip">
          Skip to sign in
        </a>
        <header className="rr-topbar">
          <div className="rr-topbar-inner">
            <Logo size="sm" />
          </div>
        </header>
        {children}
      </div>
    )
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
            <NavigationLinks />
          </nav>
          <HeaderActions />
        </div>
      </header>
      {children}
      <nav className="rr-mobile-nav" aria-label="Mobile navigation">
        <NavigationLinks />
      </nav>
    </div>
  )
}
