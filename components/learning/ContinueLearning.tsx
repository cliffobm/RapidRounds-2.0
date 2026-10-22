'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { readProgress, type ResumeActivity } from '@/lib/learning/progress'
export default function ContinueLearning() {
  const [snapshot, setSnapshot] = useState({
    links: [] as ResumeActivity[],
    unavailable: false,
  })
  useEffect(() => {
    const read = () => {
      const progress = readProgress()
      setSnapshot({
        links: progress.unfinished,
        unavailable: progress.storageUnavailable,
      })
    }
    read()
    window.addEventListener('storage', read)
    window.addEventListener('rapidrounds-progress', read)
    return () => {
      window.removeEventListener('storage', read)
      window.removeEventListener('rapidrounds-progress', read)
    }
  }, [])
  if (!snapshot.links.length)
    return snapshot.unavailable ? (
      <p className="storage-notice" role="status">
        Saved progress is unavailable in this browser.
      </p>
    ) : null
  return (
    <section
      className="continue-learning"
      aria-label="Your next learning activity"
    >
      <div>
        <p className="eyebrow">SAVED ON THIS DEVICE</p>
        <h2>Continue learning</h2>
        <p>Pick up where you left off.</p>
      </div>
      <div className="continue-links">
        {snapshot.links.slice(0, 3).map((link) => (
          <Link className="rr-button-secondary" key={link.id} href={link.href}>
            Continue: {link.title} →
          </Link>
        ))}
        <Link className="text-link" href="/progress">
          View all progress
          {snapshot.links.length > 3
            ? ` (${snapshot.links.length} unfinished)`
            : ''}{' '}
          →
        </Link>
      </div>
    </section>
  )
}
