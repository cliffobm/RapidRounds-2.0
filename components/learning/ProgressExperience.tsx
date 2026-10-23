'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AttemptRecord } from '@/lib/learning/attempt-history'
import { readProgress, type ProgressSnapshot } from '@/lib/learning/progress'
import {
  comparePracticeAttempt,
  missedPracticeSkills,
  practicePercentage,
  recentPracticeAttempts,
} from '@/lib/learning/progress-view'

const kinds: Record<AttemptRecord['kind'], string> = {
  study: 'Clinical study',
  practice: 'Practice questions',
  'guided-case': 'Guided case',
  'evolving-case': 'Evolving case',
  'legacy-practice': 'Question bank',
  'quick-check': 'Quick check',
}
const levels: Record<AttemptRecord['level'], string> = {
  foundation: 'Foundation',
  challenge: 'Challenge',
  advanced: 'Advanced',
  mixed: 'Mixed levels',
  unclassified: 'Level not recorded',
}
const modes: Record<AttemptRecord['mode'], string> = {
  guided: 'Guided practice',
  check: 'Knowledge check',
  case: 'Case practice',
}
const emptySnapshot: ProgressSnapshot = {
  attempts: [],
  unfinished: [],
  storageUnavailable: false,
}

function topicKey(attempt: AttemptRecord) {
  return JSON.stringify([attempt.kind, attempt.contentId])
}

function formattedDate(date: string | null) {
  if (!date || !Number.isFinite(Date.parse(date))) return 'Date not recorded'
  return new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function pointChange(change: number) {
  if (change === 0) return 'No change'
  return `${change > 0 ? '+' : '−'}${Math.abs(change)} percentage points`
}

function ResultCard({
  attempt,
  attempts,
}: {
  attempt: AttemptRecord
  attempts: AttemptRecord[]
}) {
  const comparison = comparePracticeAttempt(attempt, attempts)
  const percentage = practicePercentage(attempt)
  const saved = comparison.label === 'saved'
  return (
    <article className="progress-result">
      <div className="progress-result-heading">
        <div>
          <p className="eyebrow">{kinds[attempt.kind]}</p>
          <h3>
            <Link href={attempt.href}>{attempt.title}</Link>
          </h3>
          <p className="progress-result-meta">
            {levels[attempt.level]} · {modes[attempt.mode]}
            {attempt.variant ? ` · ${attempt.variant}` : ''}
          </p>
        </div>
        <div className="progress-result-score">
          <strong>{percentage === null ? '—' : `${percentage}%`}</strong>
          <span>
            {percentage === null ? 'No scored answers' : 'Practice score'}
          </span>
        </div>
      </div>
      <p className="progress-result-date">
        {saved ? (
          'Saved result · completion date not recorded'
        ) : (
          <time dateTime={attempt.completedAt!}>
            {formattedDate(attempt.completedAt)}
          </time>
        )}
      </p>
      <dl className="progress-result-counts">
        <div>
          <dt>Correct</dt>
          <dd>
            {attempt.correct} of {attempt.answered} answered
          </dd>
        </div>
        <div>
          <dt>Not answered</dt>
          <dd>{attempt.skipped}</dd>
        </div>
        <div>
          <dt>Recorded reference use</dt>
          <dd>
            {attempt.kind === 'guided-case' || attempt.kind === 'study'
              ? 'Not recorded'
              : attempt.assisted}
          </dd>
        </div>
      </dl>
      {saved ? (
        <p className="progress-comparison">
          Earlier saved result. Its position in your attempt history is unknown.
        </p>
      ) : (
        <div className="progress-comparison">
          <p>
            <strong>
              {comparison.label === 'first-recorded'
                ? 'First recorded attempt'
                : `Repeat practice · recorded attempt ${comparison.number}`}
            </strong>
          </p>
          {comparison.first && (
            <p>
              {comparison.firstChange === null
                ? 'No score comparison available.'
                : `${pointChange(comparison.firstChange)} from your first recorded result`}
              {comparison.firstChange !== null &&
                ` (${practicePercentage(comparison.first)}%).`}
            </p>
          )}
          {comparison.previous &&
            comparison.number! > 2 &&
            comparison.previousChange !== null && (
              <p>
                {pointChange(comparison.previousChange)} since the previous
                comparable result.
              </p>
            )}
        </div>
      )}
      <details className="progress-record-details">
        <summary>Result details</summary>
        <p>
          Content revision: {attempt.revision}. Comparisons use the same
          activity, content version, case variant, reasoning level, practice
          mode and number of decisions. Reference use does not reduce your
          score. Unanswered handoffs are excluded.
        </p>
      </details>
      <Link className="progress-revisit" href={attempt.href}>
        Open activity →
      </Link>
    </article>
  )
}

export default function ProgressExperience() {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>(emptySnapshot)
  const [loaded, setLoaded] = useState(false)
  const [activity, setActivity] = useState('all')
  const [topic, setTopic] = useState('all')
  const [level, setLevel] = useState('all')
  const [exportNotice, setExportNotice] = useState('')
  useEffect(() => {
    const refresh = () => {
      setSnapshot(readProgress())
      setLoaded(true)
    }
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener('rapidrounds-progress', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('rapidrounds-progress', refresh)
    }
  }, [])

  const available = snapshot.attempts.filter(
    (attempt) => activity === 'all' || attempt.kind === activity
  )
  const topics = [
    ...new Map(
      available.map((attempt) => [
        topicKey(attempt),
        { key: topicKey(attempt), title: attempt.title },
      ])
    ).values(),
  ].sort((a, b) => a.title.localeCompare(b.title))
  const filtered = snapshot.attempts.filter(
    (attempt) =>
      (activity === 'all' || attempt.kind === activity) &&
      (topic === 'all' || topicKey(attempt) === topic) &&
      (level === 'all' || attempt.level === level)
  )
  const tracked = recentPracticeAttempts(filtered).filter(
    (attempt) =>
      comparePracticeAttempt(attempt, snapshot.attempts).label !== 'saved'
  )
  const saved = filtered.filter(
    (attempt) =>
      comparePracticeAttempt(attempt, snapshot.attempts).label === 'saved'
  )
  const review = missedPracticeSkills(filtered).slice(0, 3)
  const trackedTotal = snapshot.attempts.filter(
    (attempt) =>
      comparePracticeAttempt(attempt, snapshot.attempts).label !== 'saved'
  ).length

  function exportProgress() {
    try {
      const blob = new Blob(
        [
          JSON.stringify(
            {
              format: 'rapidrounds-progress-export-v1',
              exportedAt: new Date().toISOString(),
              attempts: snapshot.attempts,
              unfinished: snapshot.unfinished,
            },
            null,
            2
          ),
        ],
        { type: 'application/json' }
      )
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rapidrounds-progress-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setExportNotice('Your progress export is ready in your downloads.')
    } catch {
      setExportNotice(
        'The export could not be downloaded in this browser. Your saved progress is unchanged.'
      )
    }
  }

  return (
    <div className="rr-experience pathway-layout progress-experience page-enter">
      <p className="eyebrow">YOUR LEARNING</p>
      <h1>Progress</h1>
      <p className="progress-lead">
        Pick up where you left off. See what to practice next.
      </p>
      <p className="progress-local-note">
        Saved in this browser on this device. Practice results describe these
        attempts, not clinical competence.
      </p>
      {!loaded ? (
        <p role="status">Loading your saved progress…</p>
      ) : (
        <>
          {snapshot.storageUnavailable && (
            <p className="storage-notice" role="status">
              Saved progress is unavailable in this browser. New activities are
              still available below.
            </p>
          )}
          <section
            className="progress-overview"
            aria-label="Your activity summary"
          >
            <div>
              <strong>{trackedTotal}</strong>
              <span>Completed practice attempts</span>
            </div>
            <div>
              <strong>{snapshot.unfinished.length}</strong>
              <span>Activities to continue</span>
            </div>
            <div>
              <strong>{snapshot.attempts.length - trackedTotal}</strong>
              <span>Earlier saved results</span>
            </div>
          </section>
          {snapshot.unfinished.length > 0 && (
            <section
              className="progress-resume"
              aria-labelledby="progress-resume-heading"
            >
              <h2 id="progress-resume-heading">Continue learning</h2>
              <ul>
                {snapshot.unfinished.map((item) => (
                  <li key={item.id}>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.detail}</p>
                    </div>
                    <Link className="rr-button-secondary" href={item.href}>
                      Resume {item.title} →
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {!snapshot.attempts.length ? (
            <section
              className="progress-empty"
              aria-labelledby="progress-empty-heading"
            >
              <h2 id="progress-empty-heading">Your next round starts here</h2>
              <p>Finish a question set or case to save your result here.</p>
              <div className="quick-launch">
                <Link className="rr-button" href="/practice">
                  Practice questions
                </Link>
                <Link className="rr-button-secondary" href="/rr">
                  Choose a case
                </Link>
              </div>
            </section>
          ) : (
            <>
              <section
                className="progress-history"
                aria-labelledby="progress-history-heading"
              >
                <div className="progress-section-heading">
                  <div>
                    <h2 id="progress-history-heading">Practice history</h2>
                    <p>
                      Compare repeat practice within the same case version,
                      level and mode.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rr-button-secondary"
                    onClick={exportProgress}
                  >
                    Export progress
                  </button>
                </div>
                <details className="progress-history-method">
                  <summary>About this history</summary>
                  <p>
                    Up to 200 recorded practice attempts are retained in this
                    browser. First recorded means the earliest comparable result
                    still available here, not your first exposure to the
                    content. Repeated cases can become familiar. Scores across
                    different cases, levels or modes are not combined into an
                    average. Study activities appear under Continue learning
                    while they are unfinished; they are not included in practice
                    scores.
                  </p>
                </details>
                {exportNotice && <p role="status">{exportNotice}</p>}
                <div
                  className="progress-filters"
                  role="group"
                  aria-label="Filter results"
                >
                  <label>
                    Activity
                    <select
                      value={activity}
                      onChange={(event) => {
                        setActivity(event.target.value)
                        setTopic('all')
                      }}
                    >
                      <option value="all">All activities</option>
                      {Object.entries(kinds).map(([key, label]) => (
                        <option value={key} key={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Topic or case
                    <select
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                    >
                      <option value="all">All topics and cases</option>
                      {topics.map((item) => (
                        <option value={item.key} key={item.key}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Reasoning level
                    <select
                      value={level}
                      onChange={(event) => setLevel(event.target.value)}
                    >
                      <option value="all">All levels</option>
                      {Object.entries(levels).map(([key, label]) => (
                        <option value={key} key={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <p aria-live="polite" className="progress-result-total">
                  {filtered.length}{' '}
                  {filtered.length === 1 ? 'result' : 'results'} in this view
                </p>
                {review.length > 0 && (
                  <section
                    className="progress-study"
                    aria-labelledby="progress-study-heading"
                  >
                    <h3 id="progress-study-heading">
                      Review from these results
                    </h3>
                    <p>
                      Revisit the decision skills behind your missed answers.
                    </p>
                    <ul>
                      {review.map((skill) => (
                        <li key={skill.id}>
                          <Link href={`/study?pillar=${skill.id}`}>
                            {skill.title} →
                          </Link>
                          <span>
                            {skill.missed}{' '}
                            {skill.missed === 1 ? 'answer' : 'answers'} to
                            revisit
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {tracked.length > 0 && (
                  <div className="progress-results-grid">
                    {tracked.map((attempt) => (
                      <ResultCard
                        key={attempt.id}
                        attempt={attempt}
                        attempts={snapshot.attempts}
                      />
                    ))}
                  </div>
                )}
                {saved.length > 0 && (
                  <section
                    className="progress-saved"
                    aria-labelledby="progress-saved-heading"
                  >
                    <h3 id="progress-saved-heading">
                      Earlier saved results · date unknown
                    </h3>
                    <p>
                      These results were recovered from saved activities. Their
                      completion time and attempt order were not recorded, so
                      they are kept separate from comparisons.
                    </p>
                    <div className="progress-results-grid">
                      {saved.map((attempt) => (
                        <ResultCard
                          key={attempt.id}
                          attempt={attempt}
                          attempts={snapshot.attempts}
                        />
                      ))}
                    </div>
                  </section>
                )}
                {!filtered.length && (
                  <p className="progress-filter-empty">
                    No results match these filters. Choose another activity or
                    level.
                  </p>
                )}
              </section>
            </>
          )}
        </>
      )}
    </div>
  )
}
