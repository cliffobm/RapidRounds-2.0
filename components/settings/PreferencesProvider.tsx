'use client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {
  defaultPreferences,
  PREFERENCES_KEY,
  readPreferences,
  type Preferences,
} from '@/lib/learning/preferences'

type Snapshot = {
  preferences: Preferences
  ready: boolean
  storageError: boolean
  isDark: boolean
  motionReduced: boolean
}
// Every consumer hydrates against this exact snapshot, even if a sibling has
// already loaded device settings while a streamed page is still arriving.
const serverSnapshot: Snapshot = {
  preferences: defaultPreferences,
  ready: false,
  storageError: false,
  isDark: false,
  motionReduced: false,
}
const getServerSnapshot = () => serverSnapshot
function createPreferencesStore() {
  let snapshot = serverSnapshot
  let systemDark = false
  let systemMotion = false
  const listeners = new Set<() => void>()
  const publish = (patch: Partial<Snapshot>) => {
    const next = { ...snapshot, ...patch }
    next.isDark =
      next.preferences.theme === 'dark' ||
      (next.preferences.theme === 'system' && systemDark)
    next.motionReduced = next.preferences.reduceMotion || systemMotion
    snapshot = next
    if (next.ready) {
      const root = document.documentElement
      root.classList.toggle('dark', next.isDark)
      root.dataset.rrText = next.preferences.textSize
      root.dataset.rrContrast = String(next.preferences.highContrast)
      root.dataset.rrMotion = String(next.motionReduced)
      root.dataset.rrInterface = next.preferences.interfaceMode
      root.style.colorScheme = next.isDark ? 'dark' : 'light'
    }
    listeners.forEach((listener) => listener())
  }
  const persist = (preferences: Preferences) => {
    let storageError = false
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
      localStorage.setItem('theme', preferences.theme)
    } catch {
      storageError = true
    }
    publish({ preferences, storageError })
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    update: (patch: Partial<Preferences>) =>
      persist(
        readPreferences(JSON.stringify({ ...snapshot.preferences, ...patch }))
      ),
    reset: () => persist({ ...defaultPreferences }),
    initialize: () => {
      let preferences = { ...defaultPreferences }
      let storageError = false
      try {
        const raw = localStorage.getItem(PREFERENCES_KEY)
        preferences = readPreferences(raw)
        const oldTheme = localStorage.getItem('theme')
        if (!raw && ['light', 'dark', 'system'].includes(oldTheme ?? ''))
          preferences.theme = oldTheme as Preferences['theme']
      } catch {
        storageError = true
      }
      const dark = matchMedia('(prefers-color-scheme: dark)')
      const motion = matchMedia('(prefers-reduced-motion: reduce)')
      const syncMedia = () => {
        systemDark = dark.matches
        systemMotion = motion.matches
        publish({})
      }
      systemDark = dark.matches
      systemMotion = motion.matches
      publish({ preferences, storageError, ready: true })
      const syncStorage = (event: StorageEvent) => {
        if (event.key === PREFERENCES_KEY || event.key === null)
          publish({ preferences: readPreferences(event.newValue) })
      }
      dark.addEventListener('change', syncMedia)
      motion.addEventListener('change', syncMedia)
      window.addEventListener('storage', syncStorage)
      return () => {
        dark.removeEventListener('change', syncMedia)
        motion.removeEventListener('change', syncMedia)
        window.removeEventListener('storage', syncStorage)
      }
    },
  }
}
const PreferencesContext = createContext<ReturnType<
  typeof createPreferencesStore
> | null>(null)
export function usePreferences() {
  const store = useContext(PreferencesContext)
  if (!store) throw new Error('PreferencesProvider is required')
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    getServerSnapshot
  )
  return { ...snapshot, update: store.update, reset: store.reset }
}
export function PreferencesProvider({ children }: { children: ReactNode }) {
  // A store belongs to this provider, never to a shared server request/module.
  const [store] = useState(createPreferencesStore)
  useEffect(() => store.initialize(), [store])
  return (
    <PreferencesContext.Provider value={store}>
      {children}
    </PreferencesContext.Provider>
  )
}
