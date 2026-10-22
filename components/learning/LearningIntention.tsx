'use client'
import Link from 'next/link'
import { usePreferences } from '@/components/settings/PreferencesProvider'
export default function LearningIntention() {
  const { preferences: p, ready } = usePreferences()
  if (!ready || (!p.name && !p.goal)) return null
  return (
    <aside className="learning-intention">
      <div>
        <strong>
          {p.name ? `${p.name}’s learning goal` : 'Your learning goal'}
        </strong>
        {p.goal ? <p>{p.goal}</p> : null}
        <small>
          {p.weeklySessions} sessions each week · {p.sessionMinutes} minutes
          each
        </small>
      </div>
      <Link href="/settings#goals" className="text-link">
        Edit goal →
      </Link>
    </aside>
  )
}
