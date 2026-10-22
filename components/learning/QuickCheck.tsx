'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  readQuickSession,
  type QuickSession,
} from '@/lib/learning/legacy-sessions'
import { recordAttempt } from '@/lib/learning/attempt-history'
import { quickAttempt } from '@/lib/learning/attempt-adapters'
import { findPracticeCollection } from '@/lib/learning/practice-library'
import { reasoningQuestions } from '@/lib/learning/evolving-content'
import {
  evolvingRevision,
  matchesAnswer,
  type ReasoningLevel,
} from '@/lib/learning/evolving-types'
import { ScenarioQuestion } from './EvolvingCases'
import { QuestionExplanation, PracticeScore } from './PracticeFeedback'
import { summarizePractice } from '@/lib/learning/practice-result'
import { usePreferences } from '@/components/settings/PreferencesProvider'
import { contentSources } from '@/lib/learning/sources'
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
            href={`/practice?mode=check&count=5&collection=${encodeURIComponent(findPracticeCollection(topic)?.id ?? 'all')}`}
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
      <Link className="rr-button" href="/practice?mode=check&count=5">
        5-question check
      </Link>
      <Link
        className="rr-button-secondary"
        href="/practice?mode=check&count=10"
      >
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
      const raw = localStorage.getItem(key)
      const restored = readQuickSession(raw)
      if (restored) setSession(restored)
      else if (raw)
        setNotice(
          'The saved check no longer matches this content. Start a new check.'
        )
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
      <Link className="back-link" href="/practice">
        ← Practice
      </Link>
      <p className="eyebrow">QUICK KNOWLEDGE CHECK</p>
      <h1>Quick check</h1>
      <p className="review-note">
        Draft practice questions · Feedback after submission
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
            <legend>Reasoning level</legend>
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
            {pool.length} questions available.{' '}
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
          <h2>Your results</h2>
          <PracticeScore
            noun="questions"
            result={summarizePractice(
              session.answers.map((answer, i) => ({
                correct: matchesAnswer(
                  reasoningQuestions.find((q) => q.id === session.ids[i])!,
                  [answer]
                ),
              }))
            )}
          />
          {session.ids.map((id, i) => {
            const question = reasoningQuestions.find((q) => q.id === id)!
            return (
              <details className="source-note question-review" key={id}>
                <summary>
                  Question {i + 1} ·{' '}
                  {matchesAnswer(question, [session.answers[i]!])
                    ? 'Correct'
                    : 'Incorrect'}{' '}
                  · {question.topic}
                </summary>
                <p>{question.context}</p>
                <h3>{question.prompt}</h3>
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
              onClick={() => {
                if (!session.selected) return
                const complete = session.index === session.ids.length - 1
                const completedAt = new Date().toISOString()
                const next: QuickSession = {
                  ...session,
                  answers: [...session.answers, session.selected],
                  index: complete ? session.index : session.index + 1,
                  selected: '',
                  complete,
                  ...(complete ? { completedAt } : {}),
                }
                if (
                  complete &&
                  !recordAttempt(
                    quickAttempt(next, key, initialTopic, completedAt)
                  )
                )
                  setNotice(
                    'Your result is visible, but could not be added to Progress on this device.'
                  )
                setSession(next)
              }}
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
