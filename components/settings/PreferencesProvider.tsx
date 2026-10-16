'use client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  defaultPreferences,
  PREFERENCES_KEY,
  readPreferences,
  type Preferences,
} from '@/lib/learning/preferences'

type Context = {
  preferences: Preferences
  ready: boolean
  storageError: boolean
  isDark: boolean
  motionReduced: boolean
  update: (patch: Partial<Preferences>) => void
  reset: () => void
}
const PreferencesContext = createContext<Context | null>(null)
export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('PreferencesProvider is required')
  return value
}
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>({
    ...defaultPreferences,
  })
  const [ready, setReady] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const [systemDark, setSystemDark] = useState(false)
  const [systemMotion, setSystemMotion] = useState(false)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFERENCES_KEY)
      const loaded = readPreferences(raw)
      const oldTheme = localStorage.getItem('theme')
      if (!raw && ['light', 'dark', 'system'].includes(oldTheme ?? ''))
        loaded.theme = oldTheme as Preferences['theme']
      setPreferences(loaded)
    } catch {
      setStorageError(true)
    }
    setReady(true)
    const dark = matchMedia('(prefers-color-scheme: dark)')
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const syncDark = () => setSystemDark(dark.matches)
    const syncMotion = () => setSystemMotion(motion.matches)
    syncDark()
    syncMotion()
    dark.addEventListener('change', syncDark)
    motion.addEventListener('change', syncMotion)
    const syncStorage = (event: StorageEvent) => {
      if (event.key === PREFERENCES_KEY || event.key === null)
        setPreferences(readPreferences(event.newValue))
    }
    window.addEventListener('storage', syncStorage)
    return () => {
      dark.removeEventListener('change', syncDark)
      motion.removeEventListener('change', syncMotion)
      window.removeEventListener('storage', syncStorage)
    }
  }, [])
  const isDark =
    preferences.theme === 'dark' ||
    (preferences.theme === 'system' && systemDark)
  const motionReduced = preferences.reduceMotion || systemMotion
  useEffect(() => {
    if (!ready) return
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.dataset.rrText = preferences.textSize
    root.dataset.rrContrast = String(preferences.highContrast)
    root.dataset.rrMotion = String(motionReduced)
    root.style.colorScheme = isDark ? 'dark' : 'light'
  }, [
    ready,
    isDark,
    motionReduced,
    preferences.textSize,
    preferences.highContrast,
  ])
  const persist = (next: Preferences) => {
    setPreferences(next)
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next))
      localStorage.setItem('theme', next.theme)
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }
  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        ready,
        storageError,
        isDark,
        motionReduced,
        update: (patch) =>
          persist(
            readPreferences(JSON.stringify({ ...preferences, ...patch }))
          ),
        reset: () => persist({ ...defaultPreferences }),
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}
