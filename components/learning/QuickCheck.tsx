'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { reasoningQuestions } from '@/lib/learning/evolving-content'
import {
  evolvingRevision,
  matchesAnswer,
  type ReasoningLevel,
} from '@/lib/learning/evolving-types'
import { ScenarioQuestion, QuestionExplanation } from './EvolvingCases'
import { usePreferences } from '@/components/settings/PreferencesProvider'
import { contentSources } from '@/lib/learning/sources'
const schema = z.object({
  revision: z.literal(evolvingRevision),
  ids: z.array(z.string()).min(5).max(10),
  index: z.number().int().min(0).max(9),
  answers: z.array(z.string()).max(10),
  selected: z.string(),
  complete: z.boolean(),
  attempt: z.number().int().nonnegative(),
})
type QuickSession = z.infer<typeof schema>
const topics = [...new Set(reasoningQuestions.map((q) => q.topic))]
function shuffle<T>(items: T[], seed: number) {
  const result = [...items]
  let state = seed + 12345
  for (let i = result.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const j = state % (i + 1)
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}
export function ReasoningBankCards() {
  return (
    <section className="pathway-section">
      <h2>New clinical reasoning collections</h2>
      <p className="intro-copy">
        36 original draft questions from the new case families. Feedback follows
        the final answer; related case and question attempts are not independent
        transfer evidence.
      </p>
      <div className="topic-grid">
        {topics.map((topic) => (
          <Link
            key={topic}
            className="topic-card tone-violet"
            href={`/quick-check?count=5&topic=${encodeURIComponent(topic)}`}
          >
            <span className="topic-meta">NEW COLLECTION</span>
            <h3>{topic}</h3>
            <span>6 questions · Quick check →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
export function QuickLaunch() {
  return (
    <div className="quick-launch">
      <Link className="rr-button" href="/quick-check?count=5">
        5-question check
      </Link>
      <Link className="rr-button-secondary" href="/quick-check?count=10">
        10-question check
      </Link>
      <Link className="text-link" href="/rr#evolving-title">
        Evolving cases →
      </Link>
    </div>
  )
}
export default function QuickCheck({
  initialCount = 5,
  initialTopic = '',
}: {
  initialCount?: 5 | 10
  initialTopic?: string
}) {
  const { preferences, ready } = usePreferences()
  const [count, setCount] = useState<5 | 10>(initialCount)
  const [topic, setTopic] = useState(
    topics.includes(initialTopic) ? initialTopic : 'All topics'
  )
  const [level, setLevel] = useState<ReasoningLevel | 'all'>(
    initialTopic ? 'all' : preferences.reasoningLevel
  )
  const [session, setSession] = useState<QuickSession | null>(null)
  const [notice, setNotice] = useState('')
  const [loaded, setLoaded] = useState(false)
  const pool = reasoningQuestions.filter(
    (q) =>
      (topic === 'All topics' || q.topic === topic) &&
      (level === 'all' || q.level === level)
  )
  const key = `rapidrounds-quick-v1:${initialCount}:${initialTopic}`
  useEffect(() => {
    try {
      const parsed = schema.safeParse(
        JSON.parse(localStorage.getItem(key) ?? 'null')
      )
      if (parsed.success) {
        const s = parsed.data
        if (
          s.index < s.ids.length &&
          s.answers.length === s.index + Number(s.complete) &&
          (!s.complete || s.index === s.ids.length - 1) &&
          new Set(s.ids).size === s.ids.length &&
          s.ids.every((id) => reasoningQuestions.some((q) => q.id === id)) &&
          s.answers.every((id, i) =>
            reasoningQuestions
              .find((q) => q.id === s.ids[i])!
              .options.some((o) => o.id === id)
          ) &&
          (!s.selected ||
            reasoningQuestions
              .find((q) => q.id === s.ids[s.index])!
              .options.some((o) => o.id === s.selected))
        )
          setSession(s)
        else
          setNotice(
            'The saved check no longer matches this content. Start a new check.'
          )
      }
    } catch {
      setNotice('Saved progress is unavailable in this browser.')
    }
    setLoaded(true)
  }, [key])
  useEffect(() => {
    if (ready && !initialTopic && !session) setLevel(preferences.reasoningLevel)
  }, [ready, preferences.reasoningLevel, initialTopic])
  useEffect(() => {
    if (session && loaded)
      try {
        localStorage.setItem(key, JSON.stringify(session))
      } catch {
        setNotice(
          'Progress could not be saved. Keep this page open to continue.'
        )
      }
  }, [session, key, loaded])
  const start = () => {
    if (pool.length < count) return
    let attempt = 0
    try {
      attempt =
        Number(localStorage.getItem('rapidrounds-quick-attempt') ?? 0) + 1
      if (!Number.isSafeInteger(attempt) || attempt < 1) attempt = 1
      localStorage.setItem('rapidrounds-quick-attempt', String(attempt))
    } catch {
      setNotice('This check will last for the current visit.')
    }
    setSession({
      revision: evolvingRevision,
      ids: shuffle(pool, attempt)
        .slice(0, count)
        .map((q) => q.id),
      index: 0,
      answers: [],
      selected: '',
      complete: false,
      attempt,
    })
  }
  const item = session
    ? reasoningQuestions.find((q) => q.id === session.ids[session.index])!
    : null
  return (
    <div className="rr-experience pathway-layout page-enter">
      <Link className="back-link" href="/quiz">
        ← Practice
      </Link>
      <p className="eyebrow">QUICK KNOWLEDGE CHECK</p>
      <h1>Get straight to the decisions.</h1>
      <p className="review-note">
        Original draft · Feedback after submission · No validated competency
        estimate. These items share the evolving case families.
      </p>
      {notice && <p role="status">{notice}</p>}
      {!loaded ? (
        <p>Loading saved check…</p>
      ) : !session ? (
        <section className="pathway-section">
          <fieldset>
            <legend>Questions in this check</legend>
            <div className="filter-row">
              {([5, 10] as const).map((n) => (
                <button
                  key={n}
                  className={`filter-chip ${n === count ? 'is-active' : ''}`}
                  aria-pressed={n === count}
                  onClick={() => setCount(n)}
                >
                  {n} questions
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Editorial difficulty</legend>
            <div className="filter-row">
              {(['all', 'foundation', 'challenge', 'advanced'] as const).map(
                (value) => (
                  <button
                    key={value}
                    className={`filter-chip ${value === level ? 'is-active' : ''}`}
                    aria-pressed={value === level}
                    onClick={() => setLevel(value)}
                  >
                    {value === 'all' ? 'All levels' : value}
                  </button>
                )
              )}
            </div>
          </fieldset>
          <fieldset>
            <legend>Collection</legend>
            <div className="filter-row">
              {['All topics', ...topics].map((value) => (
                <button
                  key={value}
                  className={`filter-chip ${value === topic ? 'is-active' : ''}`}
                  aria-pressed={value === topic}
                  onClick={() => setTopic(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </fieldset>
          <p>
            {pool.length} draft questions match. Difficulty labels are
            editorial, not calibrated.{' '}
            {pool.length < count
              ? 'Choose fewer questions, all levels or a broader collection.'
              : ''}
          </p>
          <button
            className="rr-button"
            onClick={start}
            disabled={pool.length < count}
          >
            Start {count}-question check
          </button>
        </section>
      ) : session.complete ? (
        <section className="pathway-section">
          <h2>Your feedback</h2>
          <p>
            {
              session.answers.filter((answer, i) =>
                matchesAnswer(
                  reasoningQuestions.find((q) => q.id === session.ids[i])!,
                  [answer]
                )
              ).length
            }{' '}
            of {session.ids.length} choices matched the teaching answers. This
            is a practice result, not proof of clinical competence.
          </p>
          {session.ids.map((id, i) => {
            const question = reasoningQuestions.find((q) => q.id === id)!
            return (
              <details className="source-note" key={id}>
                <summary>
                  Question {i + 1} · {question.topic}
                </summary>
                <p>{question.context}</p>
                <QuestionExplanation
                  question={question}
                  selected={[session.answers[i]!]}
                />
                {question.sources.map((source) => (
                  <p key={source}>
                    <a
                      href={contentSources[source].url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {contentSources[source].title} ↗
                    </a>
                  </p>
                ))}
              </details>
            )
          })}
          <button
            className="rr-button"
            onClick={() => {
              try {
                localStorage.removeItem(key)
              } catch {
                setNotice(
                  'The old check could not be removed from browser storage.'
                )
              }
              setSession(null)
            }}
          >
            Set up another check
          </button>
        </section>
      ) : (
        item && (
          <section className="pathway-section">
            <p>
              Question {session.index + 1} of {session.ids.length} ·{' '}
              {item.topic}
            </p>
            <div className="patient-context">
              <p>{item.context}</p>
            </div>
            <ScenarioQuestion
              question={item}
              selected={session.selected ? [session.selected] : []}
              onChange={(ids) =>
                setSession((previous) =>
                  previous ? { ...previous, selected: ids[0] ?? '' } : null
                )
              }
              seed={session.attempt + session.index}
            />
            <button
              className="rr-button"
              disabled={!session.selected}
              onClick={() =>
                setSession((previous) =>
                  !previous || !previous.selected
                    ? previous
                    : {
                        ...previous,
                        answers: [...previous.answers, previous.selected],
                        index:
                          previous.index === previous.ids.length - 1
                            ? previous.index
                            : previous.index + 1,
                        selected: '',
                        complete: previous.index === previous.ids.length - 1,
                      }
                )
              }
            >
              {session.index === session.ids.length - 1
                ? 'Submit check'
                : 'Save and continue'}
            </button>
          </section>
        )
      )}
    </div>
  )
}
