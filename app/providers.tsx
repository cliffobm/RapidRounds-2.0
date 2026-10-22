'use client'

import { LEGACY_DATABASE_ENABLED } from '@/lib/env'
import { useEffect, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/Toast'
import { Toaster } from 'react-hot-toast'
import {
  PreferencesProvider,
  usePreferences,
} from '@/components/settings/PreferencesProvider'
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

export function useTheme() {
  const { preferences, update, isDark } = usePreferences()
  return {
    isDark,
    theme: preferences.theme,
    toggleTheme: () => update({ theme: isDark ? 'light' : 'dark' }),
    setTheme: (theme: 'light' | 'dark' | 'system') => update({ theme }),
  }
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
          if (user && LEGACY_DATABASE_ENABLED) {
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
      <PreferencesProvider>
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
      </PreferencesProvider>
    </QueryClientProvider>
  )
}

export default Providers
