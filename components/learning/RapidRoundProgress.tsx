'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/store/useAuth'
import { getRapidRound, rapidRounds } from '@/lib/learning/rapid-rounds'
import {
  readRoundSessions,
  type RapidRoundSession,
} from '@/lib/learning/rapid-round-session'
export default function RapidRoundProgress({
  showEmpty = false,
}: {
  showEmpty?: boolean
}) {
  const userId = useAuth((s) => s.user?.id)
  const [records, setRecords] = useState<RapidRoundSession[]>([])
  const [unavailable, setUnavailable] = useState(false)
  useEffect(() => {
    const read = () => {
      try {
        setRecords(
          readRoundSessions(
            localStorage.getItem(
              `rr.blueprint.rounds.v1:${userId ?? 'offline'}`
            )
          )
        )
        setUnavailable(false)
      } catch {
        setUnavailable(true)
      }
    }
    read()
    window.addEventListener('storage', read)
    window.addEventListener('rr-blueprint-progress', read)
    return () => {
      window.removeEventListener('storage', read)
      window.removeEventListener('rr-blueprint-progress', read)
    }
  }, [userId])
  if (!records.length && !showEmpty) return null
  const complete = new Set(
    records.filter((s) => s.complete).map((s) => s.roundId)
  )
  const unfinished = [...records].reverse().find((s) => !s.complete)
  return (
    <section
      className="continue-learning"
      aria-label="Your Rapid Rounds practice path"
    >
      <div>
        <p className="eyebrow">YOUR RAPID ROUNDS</p>
        <h2>
          {complete.size
            ? `${complete.size} patient encounters explored`
            : 'Your next connection starts here.'}
        </h2>
        <p>
          {complete.size
            ? `${rapidRounds.length - complete.size} more encounters to explore. Your recent rounds stay on this device for this account.`
            : 'Start with one patient and build from what you know.'}
        </p>
        {unavailable && (
          <p role="status">
            Saved round progress is unavailable in this browser.
          </p>
        )}
      </div>
      <div className="continue-links">
        {unfinished ? (
          <Link
            className="rr-button-secondary"
            href={`/rapid-rounds?resume=${unfinished.id}`}
          >
            Continue: {getRapidRound(unfinished.roundId)?.title} →
          </Link>
        ) : (
          <Link className="rr-button-secondary" href="/rapid-rounds">
            Start a Rapid Round →
          </Link>
        )}
        <Link className="text-link" href="/feedback">
          View your item feedback →
        </Link>
      </div>
    </section>
  )
}
