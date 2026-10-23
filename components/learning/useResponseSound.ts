'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

export function useResponseSound() {
  const context = useRef<AudioContext | null>(null)
  const lastPulse = useRef(0)
  const enabledRef = useRef(false)
  const [enabled, setEnabled] = useState(false)
  const [volume, updateVolume] = useState(0.05)
  const [error, setError] = useState('')
  const setVolume = useCallback((value: number) => {
    if (Number.isFinite(value)) updateVolume(Math.min(0.12, Math.max(0, value)))
  }, [])
  const disable = useCallback(() => {
    enabledRef.current = false
    setEnabled(false)
    const old = context.current
    context.current = null
    if (old && old.state !== 'closed') void old.close().catch(() => {})
  }, [])
  const enable = useCallback(async () => {
    try {
      if (typeof window.AudioContext !== 'function')
        throw new Error('unavailable')
      const active = context.current ?? new window.AudioContext()
      context.current = active
      await active.resume()
      if (
        context.current !== active ||
        document.visibilityState !== 'visible'
      ) {
        if (active.state !== 'closed') await active.close()
        return
      }
      enabledRef.current = true
      setEnabled(true)
      setError('')
      lastPulse.current = 0
    } catch {
      disable()
      setError('Monitor sound is unavailable. The visual timer still works.')
    }
  }, [disable])
  const pulse = useCallback(
    (urgency: 0 | 1 | 2) => {
      const active = context.current
      const minimumGap = urgency === 2 ? 1000 : urgency === 1 ? 1500 : 2000
      const now = performance.now()
      if (
        !enabledRef.current ||
        !active ||
        active.state !== 'running' ||
        document.visibilityState !== 'visible' ||
        now - lastPulse.current < minimumGap
      )
        return
      lastPulse.current = now
      try {
        const oscillator = active.createOscillator()
        const gain = active.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.value = 660
        const start = active.currentTime
        const amplitude = Math.min(0.12, volume * (1 + urgency * 0.2))
        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(amplitude, start + 0.008)
        gain.gain.linearRampToValueAtTime(0, start + 0.08)
        oscillator.connect(gain)
        gain.connect(active.destination)
        oscillator.start(start)
        oscillator.stop(start + 0.09)
        oscillator.onended = () => {
          oscillator.disconnect()
          gain.disconnect()
        }
      } catch {
        disable()
        setError('Monitor sound stopped. The visual timer still works.')
      }
    },
    [volume, disable]
  )
  useEffect(() => {
    const hide = () => {
      if (document.visibilityState !== 'visible') disable()
    }
    document.addEventListener('visibilitychange', hide)
    return () => {
      document.removeEventListener('visibilitychange', hide)
      enabledRef.current = false
      const old = context.current
      context.current = null
      if (old && old.state !== 'closed') void old.close().catch(() => {})
    }
  }, [disable])
  return { enabled, volume, setVolume, enable, disable, pulse, error }
}
