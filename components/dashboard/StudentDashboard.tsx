'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'
import { getLastInProgressScenario } from '@/lib/db/progress'

export function StudentDashboard({ user }: { user: User }) {
  const router = useRouter()
  const [scenario, setScenario] = useState<{
    id: string
    title: string
  } | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  useEffect(() => {
    let active = true
    if (!user?.id) return
    setScenario(null)
    setUnavailable(false)
    getLastInProgressScenario(user.id)
      .then((result) => {
        if (active) setScenario(result?.scenario ?? null)
      })
      .catch(() => {
        if (active) setUnavailable(true)
      })
    return () => {
      active = false
    }
  }, [user?.id])
  if (!user) return <p>No user data available</p>
  return (
    <section className="space-y-6">
      <h1>My Learning Dashboard</h1>
      <p>Welcome back, {user.full_name || user.email}</p>
      <p>
        Only saved learning records are shown. Points, ranks and badges are not
        generated as demonstration data.
      </p>
      {unavailable && (
        <p role="status">
          Learning history is unavailable. You can still explore the learning
          activities.
        </p>
      )}
      <div>
        <h2>
          {scenario ? `Resume: ${scenario.title}` : 'Start a new scenario'}
        </h2>
        <button
          className="rr-button"
          onClick={() =>
            router.push(scenario ? `/scenarios/${scenario.id}` : '/scenarios')
          }
        >
          Continue Learning
        </button>
      </div>
      <button
        className="rr-button-secondary"
        onClick={() => router.push('/leaderboard')}
      >
        View Leaderboard
      </button>
      <button
        className="rr-button-secondary"
        onClick={() => router.push('/achievements')}
      >
        Achievements
      </button>
    </section>
  )
}
