'use client'

import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { BrandMark } from '@/components/ui/Logo'

// A brief inline entrance: it never covers content or delays navigation.
export function BrandIntro() {
  const [replay, setReplay] = useState(0)
  const [animate, setAnimate] = useState(false)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    try {
      if (sessionStorage.getItem('rr-brand-intro-v2')) return
      sessionStorage.setItem('rr-brand-intro-v2', 'seen')
      setAnimate(true)
    } catch {
      /* A static mark is available when storage is blocked. */
    }
  }, [])
  return (
    <div className="flex items-center justify-between gap-4">
      <div
        key={replay}
        className={`flex items-center gap-4 ${animate ? 'rr-brand-entrance' : ''}`}
        data-testid="brand-intro"
      >
        <BrandMark className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" />
        <div className="rr-name-reveal">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">
            Rapid Rounds 2.0
          </p>
          <p className="mt-2 text-sm font-medium text-muted">
            Think critically.
            <br />
            <span className="text-ink">Act confidently.</span>
          </p>
        </div>
      </div>
      <button
        type="button"
        aria-label="Replay logo intro"
        title="Replay logo intro"
        onClick={() => {
          setAnimate(true)
          setReplay((value) => value + 1)
        }}
        className="min-h-11 min-w-11 rounded-full p-3 text-muted hover:bg-surface-raised hover:text-signal motion-reduce:hidden"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
