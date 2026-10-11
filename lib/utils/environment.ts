// lib/utils/environment.ts

/**
 * Environment detection utilities
 * Safe patterns for browser vs server environment checks
 */

export const isBrowser = typeof window !== 'undefined'
export const isServer = typeof window === 'undefined'
export const isProduction = process.env.NODE_ENV === 'production'
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isTest = process.env.NODE_ENV === 'test'

/**
 * Execute code only in browser environment
 */
export function browserOnly<T>(fn: () => T): T | null {
  if (typeof window !== 'undefined') {
    return fn()
  }
  return null
}

/**
 * Execute code only in server environment
 */
export function serverOnly<T>(fn: () => T): T | null {
  if (typeof window === 'undefined') {
    return fn()
  }
  return null
}

/**
 * Execute code only in production
 */
export function productionOnly<T>(fn: () => T): T | null {
  if (process.env.NODE_ENV === 'production') {
    return fn()
  }
  return null
}

/**
 * Safe localStorage access (browser-only)
 */
export function safeLocalStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  return null
}

/**
 * Safe sessionStorage access (browser-only)
 */
export function safeSessionStorage() {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage
  }
  return null
}

/**
 * Safe window object access (browser-only)
 */
export function safeWindow() {
  if (typeof window !== 'undefined') {
    return window
  }
  return null
}

/**
 * Safe document object access (browser-only)
 */
export function safeDocument() {
  if (typeof window !== 'undefined' && window.document) {
    return window.document
  }
  return null
}

/**
 * Environment-aware logging
 */
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args)
    }
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args)
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args)
  },
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }
}

/**
 * Safe API call with environment checks
 */
export async function safeApiCall<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T | null> {
  try {
    // Only make API calls in browser or server environments
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'test') {
      logger.warn('API call blocked in test environment')
      return null
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    logger.error('API call failed:', error)
    return null
  }
}
