import { useEffect, useState, useRef } from 'react'
import { performance } from '@/lib/accessibility'

// Performance monitoring hook
export function usePerformance(componentName: string) {
  const renderStartTime = useRef<number>(Date.now())
  const [renderTime, setRenderTime] = useState<number>(0)

  useEffect(() => {
    const endTime = Date.now()
    const duration = endTime - renderStartTime.current
    setRenderTime(duration)

    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.warn(`Slow render detected in ${componentName}: ${duration}ms`)
    }
  }, [componentName])

  return { renderTime }
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = performance.createIntersectionObserver(
      (entries) => {
        const [entry] = entries
        setIsIntersecting(entry?.isIntersecting || false)
        
        if (entry?.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      options
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, hasIntersected, options])

  return { isIntersecting, hasIntersected }
}

// Debounced value hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttled callback hook
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useRef<T | undefined>(undefined)
  const lastRan = useRef<number>(Date.now())

  useEffect(() => {
    throttledCallback.current = performance.throttle(callback, delay) as T
  }, [callback, delay])

  return throttledCallback.current || callback
}

// Local storage hook with error handling
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      setError(true)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
      setError(false)
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
      setError(true)
    }
  }

  return [storedValue, setValue, error]
}

// Media query hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// Reduced motion preference hook
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

// Viewport size hook
export function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateSize()
    const throttledUpdate = performance.throttle(updateSize, 100)
    
    window.addEventListener('resize', throttledUpdate)
    return () => window.removeEventListener('resize', throttledUpdate)
  }, [])

  return size
}

// Online status hook
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return isOnline
}


