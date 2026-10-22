'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { learningStoragePrefix } from '@/lib/learning/sessions'
import { practiceTopics } from '@/lib/learning/catalog'
import { guidedCases } from '@/lib/learning/cases'
import { evolvingCases } from '@/lib/learning/evolving-content'
import { evolvingKey, readCaseSession } from '@/lib/learning/evolving-session'

export default function ContinueLearning() {
  const [snapshot, setSnapshot] = useState({
    links: [] as { title: string; href: string }[],
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
        const evolvingLinks = evolvingCases.flatMap((story) => {
          const saved = readCaseSession(
            localStorage.getItem(evolvingKey(story.id)),
            story
          )
          return saved && !saved.complete
            ? [
                {
                  title: `Evolving case: ${story.title}`,
                  href: `/evolving/${story.id}`,
                },
              ]
            : []
        })
        setSnapshot({
          links: [...evolvingLinks, ...links],
          unavailable: false,
        })
      } catch {
        setSnapshot({ links: [], unavailable: true })
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
  if (!snapshot.links.length) {
    return snapshot.unavailable ? (
      <p className="storage-notice" role="status">
        Saved progress is unavailable in this browser.
      </p>
    ) : null
  }
  return (
    <section
      className="continue-learning"
      aria-label="Your next learning activity"
    >
      <div>
        <p className="eyebrow">SAVED ON THIS DEVICE</p>
        <h2>Continue learning</h2>
        <p>Resume an unfinished case or question set.</p>
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
      </div>
    </section>
  )
}
