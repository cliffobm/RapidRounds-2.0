'use client'
import { useEffect, useState } from 'react'
import QuickCheck from './QuickCheck'
import UnifiedPractice from './UnifiedPractice'
import { readQuickSession } from '@/lib/learning/legacy-sessions'
import { findPracticeCollection } from '@/lib/learning/practice-library'
export default function LegacyCheckEntry({
  initialCount,
  initialTopic,
}: {
  initialCount: 5 | 10
  initialTopic: string
}) {
  const [legacy, setLegacy] = useState<boolean | null>(null)
  useEffect(() => {
    try {
      setLegacy(
        Boolean(
          readQuickSession(
            localStorage.getItem(
              `rapidrounds-quick-v1:${initialCount}:${initialTopic}`
            )
          )
        )
      )
    } catch {
      setLegacy(false)
    }
  }, [initialCount, initialTopic])
  if (legacy === null)
    return (
      <div className="rr-experience">
        <p>Loading saved practice…</p>
      </div>
    )
  return legacy ? (
    <QuickCheck initialCount={initialCount} initialTopic={initialTopic} />
  ) : (
    <UnifiedPractice
      initialCount={initialCount}
      initialMode="check"
      initialCollection={findPracticeCollection(initialTopic)?.id ?? 'all'}
    />
  )
}
