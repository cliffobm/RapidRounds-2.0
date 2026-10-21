'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePreferences } from '@/components/settings/PreferencesProvider'
import InlineReferenceText from './InlineReferenceText'
import { evolvingCases } from '@/lib/learning/evolving-content'
import {
  evolvingRevision,
  questionFor,
  orderedOptions,
  matchesAnswer,
  type EvolvingCase,
  type EvolvingQuestion,
  type ReasoningLevel,
} from '@/lib/learning/evolving-types'
import {
  newCaseSession,
  readCaseSession,
  evolvingKey,
  offerReturnHandoff,
  acceptReturnHandoff,
  type EvolvingSession,
} from '@/lib/learning/evolving-session'
import { contentSources } from '@/lib/learning/sources'
import { recordActivity } from '@/lib/learning/sessions'

export function EvolvingCaseGallery() {
  return (
    <section className="pathway-section" aria-labelledby="evolving-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE NEXT LEVEL</p>
          <h2 id="evolving-title">A different handover. A deeper decision.</h2>
        </div>
      </div>
      <p className="intro-copy">
        Six evolving case families · Two authored clinical paths each · Three
        support levels. Observations change at story checkpoints; they are
        scripted educational data, not a prediction of treatment response.
      </p>
      <div className="topic-grid">
        {evolvingCases.map((story) => (
          <Link
            key={story.id}
            className="topic-card tone-blue"
            href={`/evolving/${story.id}`}
          >
            <span className="topic-meta">{story.topic}</span>
            <h3>{story.title}</h3>
            <p className="intro-copy">{story.summary}</p>
            <span>2 paths · 6 decisions per path →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
export function LevelControls({
  level,
  setLevel,
  clock,
  setClock,
}: {
  level: ReasoningLevel
  setLevel: (v: ReasoningLevel) => void
  clock: 'pause' | 'handoff'
  setClock: (v: 'pause' | 'handoff') => void
}) {
  return (
    <div className="scenario-controls">
      <fieldset>
        <legend>Reasoning level</legend>
        <div className="filter-row">
          {(['foundation', 'challenge', 'advanced'] as const).map((value) => (
            <button
              type="button"
              className={`filter-chip ${level === value ? 'is-active' : ''}`}
              aria-pressed={level === value}
              key={value}
              onClick={() => setLevel(value)}
            >
              {value === 'foundation'
                ? 'Foundation'
                : value === 'challenge'
                  ? 'Challenge'
                  : 'Advanced'}
            </button>
          ))}
        </div>
      </fieldset>
      <p>
        {level === 'foundation'
          ? 'Single best choices with immediate coaching.'
          : level === 'challenge'
            ? 'Combine two relevant elements, with feedback after each decision.'
            : 'Combine evidence and write a brief rationale. Feedback is held until the debrief; notes are not automatically graded.'}
      </p>
      <label className="scenario-toggle">
        <input
          type="checkbox"
          checked={clock === 'handoff'}
          onChange={(event) =>
            setClock(event.target.checked ? 'handoff' : 'pause')
          }
        />
        Offer a new handoff after 30 minutes away
      </label>
    </div>
  )
}
export function ScenarioQuestion({
  question,
  selected,
  onChange,
  disabled = false,
  seed = 0,
}: {
  question: EvolvingQuestion
  selected: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  seed?: number
}) {
  return (
    <fieldset className="scenario-question">
      <legend>{question.prompt}</legend>
      <p>
        {question.correct.length === 1
          ? 'Choose one response.'
          : `Choose ${question.correct.length} responses.`}
      </p>
      <div className="answer-list">
        {orderedOptions(question, seed).map((option, position) => (
          <label
            className={`answer-option ${selected.includes(option.id) ? 'is-chosen' : ''}`}
            key={option.id}
          >
            <input
              type={question.correct.length === 1 ? 'radio' : 'checkbox'}
              name="scenario-choice"
              checked={selected.includes(option.id)}
              disabled={
                disabled ||
                (question.correct.length > 1 &&
                  selected.length === question.correct.length &&
                  !selected.includes(option.id))
              }
              onChange={() =>
                onChange(
                  question.correct.length === 1
                    ? [option.id]
                    : selected.includes(option.id)
                      ? selected.filter((id) => id !== option.id)
                      : [...selected, option.id]
                )
              }
            />
            <span
              aria-hidden="true"
              className={
                question.correct.length === 1
                  ? 'answer-letter'
                  : 'scenario-checkbox'
              }
            >
              {selected.includes(option.id)
                ? '✓'
                : question.correct.length === 1
                  ? String.fromCharCode(65 + position)
                  : ''}
            </span>
            <span>{option.text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
export function QuestionExplanation({
  question,
  selected,
}: {
  question: EvolvingQuestion
  selected: string[]
}) {
  return (
    <div className="scenario-feedback">
      <p>
        <strong>
          {matchesAnswer(question, selected)
            ? 'Teaching answer matched.'
            : 'Compare the reasoning.'}
        </strong>
      </p>
      <ul>
        {question.options.map((option) => (
          <li key={option.id}>
            <strong>
              {question.correct.includes(option.id) ? 'Teaching choice: ' : ''}
              {option.text}
            </strong>
            <p>{option.explanation}</p>
          </li>
        ))}
      </ul>
      <p>
        <strong>Reflect:</strong> {question.reflection}
      </p>
    </div>
  )
}
export default function EvolvingCaseExperience({
  story,
}: {
  story: EvolvingCase
}) {
  const { preferences, ready } = usePreferences()
  const [session, setSession] = useState<EvolvingSession | null>(() => {
    try {
      return readCaseSession(localStorage.getItem(evolvingKey(story.id)), story)
    } catch {
      return null
    }
  })
  const [level, setLevel] = useState<ReasoningLevel>(
    session?.level ?? preferences.reasoningLevel
  )
  const [clock, setClock] = useState<'pause' | 'handoff'>(
    session?.clock ?? preferences.scenarioClock
  )
  const [notice, setNotice] = useState('')
  const [returnPending, setReturnPending] = useState(() =>
    session ? offerReturnHandoff(session) : false
  )
  const latest = useRef(session)
  useEffect(() => {
    if (ready && !session) {
      setLevel(preferences.reasoningLevel)
      setClock(preferences.scenarioClock)
    }
  }, [ready, preferences.reasoningLevel, preferences.scenarioClock])
  useEffect(() => {
    latest.current = session
    if (session)
      try {
        localStorage.setItem(evolvingKey(story.id), JSON.stringify(session))
      } catch {
        setNotice(
          'Progress could not be saved. Keep this visit open to continue.'
        )
      }
  }, [session, story.id])
  useEffect(() => {
    let active = true
    const saveDeparture = () => {
      if (!latest.current) return
      const value = { ...latest.current, lastSeen: Date.now() }
      latest.current = value
      try {
        localStorage.setItem(evolvingKey(story.id), JSON.stringify(value))
      } catch {
        if (active) setNotice('Progress could not be saved on this device.')
      }
    }
    const visibility = () => {
      if (document.visibilityState === 'hidden') saveDeparture()
      else if (latest.current && offerReturnHandoff(latest.current))
        setReturnPending(true)
    }
    window.addEventListener('pagehide', saveDeparture)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      active = false
      saveDeparture()
      window.removeEventListener('pagehide', saveDeparture)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [story.id])
  const change = (patch: Partial<EvolvingSession>) =>
    setSession((previous) =>
      previous ? { ...previous, ...patch, lastSeen: Date.now() } : previous
    )
  const start = () => {
    if (session) {
      try {
        const key = `rapidrounds-evolving-archive:${story.id}`
        const raw = JSON.parse(localStorage.getItem(key) ?? '[]')
        const history = Array.isArray(raw) ? raw.slice(-19) : []
        localStorage.setItem(key, JSON.stringify([...history, session]))
      } catch {
        setNotice(
          'Earlier attempt could not be archived. The current attempt remains available.'
        )
        return
      }
    }
    setSession(
      newCaseSession(story, level, clock, session ? session.attempt + 1 : 0)
    )
    setReturnPending(false)
    setNotice('')
  }
  const path = session
    ? story.paths.find((p) => p.id === session.pathId)!
    : story.paths[0]!
  const frame = session ? path.frames[session.index]! : null
  const question = frame && session ? questionFor(frame, session.level) : null
  const answer = session?.answers[session.index]
  const title = story.title
  return (
    <div className="rr-experience pathway-layout scenario-layout page-enter">
      <Link className="back-link" href="/rr">
        ← Case room
      </Link>
      <p className="eyebrow">EVOLVING CASE / {story.topic}</p>
      <h1>{title}</h1>
      <p className="review-note">
        Fictional draft · Clinical review pending · Revision {evolvingRevision}.
        No validated competency score or physiologic simulation.
      </p>
      {notice && <p role="status">{notice}</p>}
      {!session ? (
        <section className="pathway-section">
          <p>{story.summary}</p>
          <p>
            Each replay alternates between two authored clinical paths. The
            saved path and selected answers remain stable when you leave.
            Options change position between attempts.
          </p>
          <LevelControls {...{ level, setLevel, clock, setClock }} />
          <button className="rr-button" onClick={start}>
            Start this case
          </button>
        </section>
      ) : session.complete ? (
        <section className="pathway-section">
          <h2>Debrief the decisions</h2>
          <p>
            {
              session.answers.filter(
                (a, i) =>
                  !a.skipped &&
                  matchesAnswer(
                    questionFor(path.frames[i]!, session.level),
                    a.selected
                  )
              ).length
            }{' '}
            teaching answers matched ·{' '}
            {session.answers.filter((a) => !a.skipped).length} decisions
            answered · {session.answers.filter((a) => a.skipped).length} moved
            past at handoff. This is formative feedback, not a mastery estimate.
          </p>
          {session.answers.map((entry, index) => (
            <details key={index} className="source-note">
              <summary>
                Decision {index + 1} ·{' '}
                {entry.skipped
                  ? 'Unanswered before handoff'
                  : entry.assisted
                    ? 'Reference-assisted'
                    : 'Unassisted in-app response'}
              </summary>
              <p>{path.frames[index]!.update}</p>
              {entry.rationale && (
                <p>
                  <strong>Your reasoning note (not graded):</strong>{' '}
                  {entry.rationale}
                </p>
              )}
              <QuestionExplanation
                question={questionFor(path.frames[index]!, session.level)}
                selected={entry.selected}
              />
            </details>
          ))}
          <h3>Change the challenge</h3>
          <LevelControls {...{ level, setLevel, clock, setClock }} />
          <button className="rr-button" onClick={start}>
            Try the next authored version
          </button>
          <Link className="rr-button-secondary" href="/quick-check?count=5">
            Try a quick knowledge check
          </Link>
        </section>
      ) : (
        frame &&
        question && (
          <>
            <div className="scenario-meta">
              <strong>{path.patient}</strong>
              <span>
                {path.label} · {session.level} · Decision {session.index + 1} of{' '}
                {path.frames.length}
              </span>
            </div>
            <p>
              {session.level === 'advanced' ? (
                path.history
              ) : (
                <InlineReferenceText
                  text={path.history}
                  onLookup={
                    answer ? undefined : () => change({ assisted: true })
                  }
                />
              )}
            </p>
            {returnPending ? (
              <section className="handoff-notice" role="status">
                <h2>A new fictional handoff is available</h2>
                <p>
                  You were away for at least 30 minutes. Keep the saved moment,
                  or advance one authored story checkpoint. The unfinished
                  decision is logged as unanswered, not incorrect; confirmed
                  answers stay unchanged. No real-time patient change has been
                  predicted.
                </p>
                <button
                  className="rr-button"
                  onClick={() => {
                    setSession((previous) =>
                      previous
                        ? acceptReturnHandoff({
                            ...previous,
                            lastSeen:
                              latest.current?.lastSeen ?? previous.lastSeen,
                          })
                        : null
                    )
                    setReturnPending(false)
                    setNotice(
                      'New handoff accepted: compare the updated observations with the earlier trend.'
                    )
                  }}
                >
                  Accept the next handoff
                </button>
                <button
                  className="rr-button-secondary"
                  onClick={() => {
                    change({})
                    setReturnPending(false)
                  }}
                >
                  Resume my saved moment
                </button>
              </section>
            ) : (
              <>
                <div
                  className="scenario-chart"
                  role="region"
                  aria-label="Observation trend"
                  tabIndex={0}
                >
                  <table>
                    <caption>Scripted observation trend · Story time</caption>
                    <thead>
                      <tr>
                        <th scope="col">Time</th>
                        <th scope="col">HR /min</th>
                        <th scope="col">BP mmHg</th>
                        <th scope="col">RR /min</th>
                        <th scope="col">Temp °C</th>
                        <th scope="col">SpO₂ %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {path.frames
                        .slice(0, session.index + 1)
                        .map((entry, i) => (
                          <tr key={i}>
                            <th scope="row">
                              T+{entry.observation.minute} min
                            </th>
                            <td>{entry.observation.hr}</td>
                            <td>{entry.observation.bp}</td>
                            <td>{entry.observation.rr}</td>
                            <td>{entry.observation.temperature.toFixed(1)}</td>
                            <td>{entry.observation.spo2}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <section className="patient-context">
                  <h2>
                    Current handover · T+{frame.observation.minute} minutes
                  </h2>
                  <p>
                    {session.level === 'advanced' ? (
                      frame.update
                    ) : (
                      <InlineReferenceText
                        text={frame.update}
                        onLookup={
                          answer ? undefined : () => change({ assisted: true })
                        }
                      />
                    )}
                  </p>
                  {session.index > 0 &&
                    session.answers[session.index - 1]?.selected.length ===
                      0 && (
                      <p className="quiet-label">
                        The previous decision was not answered before this
                        handoff.
                      </p>
                    )}
                </section>
                <ScenarioQuestion
                  question={question}
                  selected={session.selected}
                  onChange={(selected) => change({ selected })}
                  disabled={Boolean(answer)}
                  seed={session.attempt + session.index}
                />
                {!answer && (
                  <>
                    <label className="settings-field">
                      Your reasoning note{' '}
                      {session.level === 'advanced'
                        ? '(explain your priority, one alternative and what would change your plan; at least 30 characters; not automatically graded)'
                        : '(optional)'}
                      <textarea
                        value={session.rationale}
                        maxLength={600}
                        onChange={(event) =>
                          change({ rationale: event.target.value })
                        }
                      />
                    </label>
                    <label className="settings-field">
                      Confidence in this decision
                      <select
                        value={session.confidence}
                        onChange={(event) =>
                          change({
                            confidence: event.target
                              .value as EvolvingSession['confidence'],
                          })
                        }
                      >
                        <option value="unsure">Unsure</option>
                        <option value="somewhat">Somewhat confident</option>
                        <option value="confident">Confident</option>
                      </select>
                    </label>
                    <button
                      className="rr-button"
                      disabled={
                        session.selected.length !== question.correct.length ||
                        (session.level === 'advanced' &&
                          session.rationale.trim().length < 30)
                      }
                      onClick={() =>
                        setSession((previous) =>
                          !previous || previous.answers.length > previous.index
                            ? previous
                            : {
                                ...previous,
                                lastSeen: Date.now(),
                                answers: [
                                  ...previous.answers,
                                  {
                                    selected: previous.selected,
                                    rationale: previous.rationale,
                                    confidence: previous.confidence,
                                    assisted: previous.assisted,
                                    skipped: false,
                                  },
                                ],
                              }
                        )
                      }
                    >
                      Commit decision
                    </button>
                  </>
                )}
                {answer && (
                  <>
                    <div role="status">
                      {session.level === 'advanced' ? (
                        'Decision saved. Feedback will appear in the debrief.'
                      ) : (
                        <QuestionExplanation
                          question={question}
                          selected={answer.selected}
                        />
                      )}
                    </div>
                    {session.level === 'foundation' && (
                      <p>
                        <strong>Reasoning checkpoint:</strong>{' '}
                        {question.reflection}
                      </p>
                    )}
                    <button
                      className="rr-button"
                      onClick={() => {
                        if (session.index === 5) {
                          change({ complete: true })
                          recordActivity({
                            id: `evolving:${story.id}:${session.pathId}:${session.level}:${evolvingRevision}`,
                            title: story.title,
                            href: `/evolving/${story.id}`,
                            completedAt: new Date().toISOString(),
                          })
                        } else
                          change({
                            index: session.index + 1,
                            selected: [],
                            rationale: '',
                            confidence: 'unsure',
                            assisted: false,
                          })
                      }}
                    >
                      {session.index === 5
                        ? 'Open the debrief'
                        : 'Next clinical checkpoint'}
                    </button>
                  </>
                )}
              </>
            )}
          </>
        )
      )}
      <details className="source-note">
        <summary>Sources & limits</summary>
        <p>
          Observations and paths are authored teaching data. Choice-dependent
          support changes the explanation; it does not calculate drug effects or
          predict patient outcomes. The question-bank items share these case
          families and are not independent transfer evidence.
        </p>
        {story.sources.map((id) => (
          <p key={id}>
            <a href={contentSources[id].url} target="_blank" rel="noreferrer">
              {contentSources[id].title} ↗
            </a>
          </p>
        ))}
      </details>
    </div>
  )
}
