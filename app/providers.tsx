'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { resolveTheme, type ThemePreference } from '@/lib/theme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/Toast'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '@/store/useAuth'
import { useProgress } from '@/store/useProgress'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
})

// Theme context for dark mode
interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false)

  const applyTheme = (theme: ThemePreference) => {
    const dark = resolveTheme(
      theme,
      window.matchMedia('(prefers-color-scheme: dark)').matches
    )
    document.documentElement.classList.toggle('dark', dark)
    setIsDark(dark)
  }

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => {
      let stored: string | null = null
      try {
        stored = localStorage.getItem('theme')
      } catch {
        /* Use system preference. */
      }
      applyTheme(stored === 'light' || stored === 'dark' ? stored : 'system')
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'theme' || event.key === null) sync()
    }
    sync()
    media.addEventListener('change', sync)
    window.addEventListener('storage', onStorage)
    return () => {
      media.removeEventListener('change', sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const setTheme = (theme: ThemePreference) => {
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* Keep in-memory theme usable. */
    }
    applyTheme(theme)
  }

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme: () => setTheme(isDark ? 'light' : 'dark'),
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

function Providers({ children }: { children: ReactNode }) {
  // Initialize stores
  useEffect(() => {
    console.log('Providers initializing...')
    try {
      // Initialize auth state
      const authStore = useAuth.getState()
      authStore.setLoading(false)

      // Initialize progress sync
      const progressStore = useProgress.getState()

      // Auto-sync every 5 minutes if user is logged in
      const syncInterval = setInterval(
        () => {
          const { user } = useAuth.getState()
          if (user) {
            progressStore.syncToServer()
          }
        },
        5 * 60 * 1000
      )

      console.log('Providers initialized successfully')
      return () => clearInterval(syncInterval)
    } catch (error) {
      console.error('Error initializing providers:', error)
      return undefined
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#16a34a',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default Providers
