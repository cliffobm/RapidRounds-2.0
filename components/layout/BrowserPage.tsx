'use client'
import { Suspense, useEffect, useState, type ReactNode } from 'react'

function PreparingPage() {
  return (
    <div className="rr-experience" role="status">
      <p>Preparing your learning space…</p>
    </div>
  )
}

// Learning interactions depend on device preferences and browser storage.
// Keep the initial server/client DOM identical, then mount the page as a
// browser view. The header, main landmark and metadata remain server rendered.
export default function BrowserPage({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  if (!ready) return <PreparingPage />
  return <Suspense fallback={<PreparingPage />}>{children}</Suspense>
}
