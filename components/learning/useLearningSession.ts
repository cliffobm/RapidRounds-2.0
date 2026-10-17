'use client'
import { useEffect, useState } from 'react'
import type { z } from 'zod'
import { learningStoragePrefix, readSession } from '@/lib/learning/sessions'

// Mounted inside BrowserPage; the server preparation view never reads browser data.
export function useLearningSession<T>(
  id: string,
  revision: string,
  initial: T,
  schema: z.ZodType<T>
) {
  const key = learningStoragePrefix + id
  const [initialRead] = useState(() => {
    try {
      return {
        state:
          readSession(localStorage.getItem(key), revision, schema) ?? initial,
        failed: false,
      }
    } catch {
      return { state: initial, failed: true }
    }
  })
  const [state, setState] = useState(initialRead.state)
  const [notice, setNotice] = useState(
    initialRead.failed
      ? 'Browser storage is unavailable. Progress lasts for this visit only.'
      : ''
  )
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify({ revision, state }))
    } catch {
      setNotice(
        'Progress could not be saved on this device. Keep this page open to continue.'
      )
    }
  }, [key, revision, state])
  return [state, setState, notice] as const
}
