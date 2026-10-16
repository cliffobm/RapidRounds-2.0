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
          {p.name
            ? `Make this moment yours, ${p.name}.`
            : 'Your next small step.'}
        </strong>
        <p>{p.goal || 'A little practice makes room for clearer thinking.'}</p>
        <small>
          Your weekly intention: {p.weeklySessions} sessions ·{' '}
          {p.sessionMinutes} minutes each
        </small>
      </div>
      <Link href="/settings#goals" className="text-link">
        Edit goal →
      </Link>
    </aside>
  )
}
