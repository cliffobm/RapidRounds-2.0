'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  activityKey,
  learningStoragePrefix,
  readActivities,
} from '@/lib/learning/sessions'
import { practiceTopics } from '@/lib/learning/catalog'
import { guidedCases } from '@/lib/learning/cases'

export default function ContinueLearning() {
  const [snapshot, setSnapshot] = useState({
    links: [] as { title: string; href: string }[],
    completed: 0,
    unavailable: false,
  })
  useEffect(() => {
    const read = () => {
      try {
        const candidates = [
          ...guidedCases.map((story) => ({
            id: `case:${story.id}`,
            title: story.subtitle,
            href: `/rr/${story.id}`,
          })),
          ...practiceTopics.map((topic) => ({
            id: `practice:${topic.key}`,
            title: topic.title,
            href: `/quiz?bank=${topic.key}`,
          })),
        ]
        const links = candidates
          .filter((candidate) => {
            try {
              const stored = JSON.parse(
                localStorage.getItem(learningStoragePrefix + candidate.id) ??
                  'null'
              )
              const state = stored?.state
              return (
                typeof stored?.revision === 'string' &&
                state &&
                Number.isInteger(state.index) &&
                state.index >= 0 &&
                state.index < 6 &&
                (state.complete === false || state.finished === false) &&
                (state.index > 0 ||
                  (state.answer !== null && state.answer !== undefined) ||
                  state.responses?.length > 0)
              )
            } catch {
              return false
            }
          })
          .map(({ title, href }) => ({ title, href }))
        setSnapshot({
          links,
          completed: readActivities(localStorage.getItem(activityKey)).length,
          unavailable: false,
        })
      } catch {
        setSnapshot({ links: [], completed: 0, unavailable: true })
      }
    }
    read()
    window.addEventListener('storage', read)
    window.addEventListener('rapidrounds-progress', read)
    return () => {
      window.removeEventListener('storage', read)
      window.removeEventListener('rapidrounds-progress', read)
    }
  }, [])
  return (
    <section
      className="continue-learning"
      aria-label="Your next learning activity"
    >
      <div>
        <p className="eyebrow">YOUR NEXT STEP</p>
        <h2>Pick up the thread.</h2>
        <p>
          {snapshot.unavailable
            ? 'Device storage is unavailable. You can still explore the pathway.'
            : `${snapshot.completed} distinct learning activities completed on this device. Activity is not a mastery score.`}
        </p>
      </div>
      <div className="continue-links">
        {snapshot.links.map((link) => (
          <Link
            className="rr-button-secondary"
            key={link.href}
            href={link.href}
          >
            Continue: {link.title} →
          </Link>
        ))}
        <Link className="rr-button" href="/pathway">
          Follow the deterioration pathway →
        </Link>
        <Link className="text-link" href="/content-review">
          Content coverage & review status →
        </Link>
      </div>
    </section>
  )
}
