'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { rapidResponseCases } from '@/lib/learning/rapid-response-content'
import {
  RAPID_RESPONSE_KEY,
  createRapidResponseSession,
  readRapidResponseSessions,
  saveRapidResponseSession,
  tickRapidResponse,
  pauseRapidResponse,
  resumeRapidResponse,
  submitRapidResponseAnswer,
  finishRapidResponse,
  continueRapidResponse,
  rapidResponseRemainingMs,
  summarizeRapidResponse,
  rapidResponseAttempt,
  formatResponseTime,
  type RapidResponseSession,
} from '@/lib/learning/rapid-response-session'
import { recordAttempt } from '@/lib/learning/attempt-history'
import { ScenarioQuestion } from './EvolvingCases'
import { PracticeScore, QuestionExplanation } from './PracticeFeedback'
import EcgStrip from './EcgStrip'
import { useResponseSound } from './useResponseSound'

type ResponseCase = (typeof rapidResponseCases)[number]

function ResponseResults({
  story,
  session,
}: {
  story: ResponseCase
  session: RapidResponseSession
}) {
  const result = summarizeRapidResponse(session)
  return (
    <section aria-label="Rapid Response result">
      <h2>Your response review</h2>
      <PracticeScore result={result.score} />
      <dl className="response-result-metrics">
        <div>
          <dt>Active case time</dt>
          <dd>{formatResponseTime(result.activeMs)}</dd>
        </div>
        <div>
          <dt>Timing condition</dt>
          <dd>
            {result.budgetMs === null
              ? 'Untimed'
              : `${formatResponseTime(result.budgetMs)} target`}
          </dd>
        </div>
        <div>
          <dt>Priority decisions to revisit</dt>
          <dd>{result.criticalMisses.length}</dd>
        </div>
      </dl>
      <div className="response-timing-note">
        <p>
          Accuracy and time are reported separately. Active time includes
          reading and choosing while this case is open; pauses and time away are
          excluded. This is a practice measure, not a validated measure of
          comprehension, clinical competence or readiness to respond in real
          care.
        </p>
        <p>
          {result.exceededBudget
            ? 'You continued after the practice time target. No points were deducted for time.'
            : session.mode === 'challenge'
              ? 'The time target is an authored practice setting, not a clinical response standard. No points are awarded for speed.'
              : 'Try the same kind of decision again and compare accuracy alongside time. Faster alone does not mean better reasoning.'}
        </p>
        {result.score.unanswered > 0 ? (
          <p>
            {result.score.unanswered} unanswered decisions are shown below and
            excluded from the accuracy percentage. Priority decisions to revisit
            include incorrect and unanswered priority decisions.
          </p>
        ) : null}
      </div>
      <h2>Decision by decision</h2>
      <div className="response-review-list">
        {story.stages.map((stage, index) => {
          const answer = session.answers[index]
          return (
            <article key={stage.id}>
              <p className="eyebrow">
                DECISION {index + 1}
                {stage.critical ? ' · PRIORITY DECISION' : ''}
              </p>
              <p>{stage.update}</p>
              <ul className="response-observations">
                {stage.observations.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
              {stage.rhythmId ? (
                <EcgStrip rhythmId={stage.rhythmId} concealLabel={false} />
              ) : null}
              {stage.pulseContext ? (
                <p className="response-pulse-context">{stage.pulseContext}</p>
              ) : null}
              <h3>{stage.question.prompt}</h3>
              <p className="quiet-label">
                {answer
                  ? `Active decision time: ${formatResponseTime(answer.elapsedMs)}`
                  : 'Not answered before you finished the case.'}
              </p>
              <QuestionExplanation
                question={stage.question}
                selected={answer?.selected ?? []}
                skipped={!answer}
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default function RapidResponse({
  initialCaseId = '',
  initialSessionId = '',
}: {
  initialCaseId?: string
  initialSessionId?: string
}) {
  const [caseId, setCaseId] = useState(
    rapidResponseCases.some((story) => story.id === initialCaseId)
      ? initialCaseId
      : ''
  )
  const [mode, setMode] = useState<'untimed' | 'challenge'>('untimed')
  const [multiplier, setMultiplier] = useState<1 | 1.5 | 2>(1)
  const [session, setSession] = useState<RapidResponseSession | null>(null)
  const [saved, setSaved] = useState<RapidResponseSession[]>([])
  const [loaded, setLoaded] = useState(false)
  const [notice, setNotice] = useState('')
  const [finishPending, setFinishPending] = useState(false)
  const latest = useRef<RapidResponseSession | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const focusHeading = useRef(false)
  const sound = useResponseSound()
  const soundRef = useRef(sound)
  soundRef.current = sound

  useEffect(() => {
    try {
      const restored = readRapidResponseSessions(
        localStorage.getItem(RAPID_RESPONSE_KEY)
      )
      setSaved(restored)
      const selected = restored.find((entry) => entry.id === initialSessionId)
      if (selected) {
        latest.current = selected
        setSession(selected)
        setCaseId(selected.caseId)
      } else if (initialSessionId) {
        setNotice(
          'That saved attempt is not available on this device. Choose a case to start a new attempt.'
        )
      }
    } catch {
      setNotice(
        'Progress can be used during this visit but cannot be saved on this device.'
      )
    }
    setLoaded(true)
  }, [initialSessionId])

  const commit = useCallback((next: RapidResponseSession) => {
    latest.current = next
    setSession(next)
    setSaved((previous) => [
      ...previous.filter((entry) => entry.id !== next.id),
      next,
    ])
    const persisted = saveRapidResponseSession(next)
    if (!persisted)
      setNotice(
        'Your case is available now, but progress could not be saved on this device.'
      )
    if (
      next.complete &&
      (!persisted || !recordAttempt(rapidResponseAttempt(next)))
    )
      setNotice(
        'Your result is visible, but could not be added to Progress on this device.'
      )
  }, [])

  useEffect(() => {
    if (!session || session.paused || session.complete) return
    let previous = performance.now()
    const interval = window.setInterval(() => {
      const now = performance.now()
      const current = latest.current
      if (current) {
        const next = tickRapidResponse(current, now - previous)
        commit(next)
        const remaining = rapidResponseRemainingMs(next)
        if (remaining !== null && remaining > 0 && !next.paused) {
          const urgency = remaining <= 10000 ? 2 : remaining <= 30000 ? 1 : 0
          soundRef.current.pulse(urgency)
        }
        if (next.paused) soundRef.current.disable()
      }
      previous = now
    }, 1000)
    return () => window.clearInterval(interval)
  }, [session?.id, session?.paused, session?.complete, commit])

  useEffect(() => {
    const savePause = () => {
      const current = latest.current
      if (current && !current.complete) commit(pauseRapidResponse(current))
      soundRef.current.disable()
    }
    const visibility = () => {
      if (document.visibilityState === 'hidden') savePause()
    }
    window.addEventListener('pagehide', savePause)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      savePause()
      window.removeEventListener('pagehide', savePause)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [commit])

  useEffect(() => {
    if (focusHeading.current) {
      heading.current?.focus()
      focusHeading.current = false
    }
  }, [caseId, session?.id, session?.index, session?.complete, session?.paused])

  const story = rapidResponseCases.find(
    (entry) => entry.id === (session?.caseId ?? caseId)
  )
  const stage = session && story ? story.stages[session.index] : null
  const remaining = session ? rapidResponseRemainingMs(session) : null
  const expired = Boolean(
    session &&
      session.mode === 'challenge' &&
      session.budgetMs !== null &&
      session.activeMs >= session.budgetMs &&
      !session.continuedAfterExpiry &&
      !session.complete
  )
  const lastSaved = saved
    .filter((entry) => entry.caseId === caseId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]

  function leaveCase() {
    if (latest.current && !latest.current.complete)
      commit(pauseRapidResponse(latest.current))
    latest.current = null
    sound.disable()
    setSession(null)
    setCaseId('')
    setFinishPending(false)
    focusHeading.current = true
  }

  function start() {
    if (!story) return
    const next = createRapidResponseSession(story.id, { mode, multiplier })
    if (!next) {
      setNotice(
        'This case could not be opened. Choose another case and try again.'
      )
      return
    }
    sound.disable()
    setFinishPending(false)
    setNotice('')
    focusHeading.current = true
    commit(next)
  }

  function finish() {
    if (!latest.current) return
    sound.disable()
    focusHeading.current = true
    setFinishPending(false)
    commit(finishRapidResponse(latest.current))
  }

  return (
    <div className="rr-experience pathway-layout rapid-response page-enter">
      {story ? (
        <button className="back-link" type="button" onClick={leaveCase}>
          ← All response cases
        </button>
      ) : (
        <Link className="back-link" href="/rr">
          ← Case room
        </Link>
      )}
      {!story ? (
        <>
          <header className="response-hero">
            <p className="eyebrow">RAPID RESPONSE</p>
            <h1 ref={heading} tabIndex={-1}>
              Recognize the change. Make the next move.
            </h1>
            <p>
              Short cases for urgent decisions. Assess the patient, connect the
              clues and act on the priority.
            </p>
            <div className="response-hero-links">
              <Link href="/ecg">Explore the ECG rhythm library →</Link>
            </div>
          </header>
          <p className="review-note">
            Original fictional practice · Advanced decisions · Clinical review
            pending
          </p>
          <div className="response-timing-note">
            Start untimed, or choose a Response challenge. Time is a separate
            practice reference; it never determines your accuracy score.
          </div>
          <section
            aria-labelledby="response-cases-title"
            className="pathway-section"
          >
            <h2 id="response-cases-title">Choose your response case</h2>
            {!loaded ? <p role="status">Loading your saved cases…</p> : null}
            <div className="response-case-grid">
              {rapidResponseCases.map((entry) => {
                const unfinished = saved.some(
                  (value) => value.caseId === entry.id && !value.complete
                )
                return (
                  <article key={entry.id} className="response-case-card">
                    <p className="eyebrow">{entry.topic}</p>
                    <h3>{entry.title}</h3>
                    <p>{entry.summary}</p>
                    <div className="response-case-meta">
                      <span>{entry.stages.length} decisions</span>
                      <span>
                        {formatResponseTime(entry.timeBudgetSeconds * 1000)}{' '}
                        optional challenge
                      </span>
                      {unfinished ? <strong>Saved attempt</strong> : null}
                    </div>
                    <button
                      className="rr-button"
                      disabled={!loaded}
                      type="button"
                      aria-label={`Open ${entry.title}`}
                      onClick={() => {
                        focusHeading.current = true
                        setCaseId(entry.id)
                      }}
                    >
                      Choose case <span aria-hidden="true">→</span>
                    </button>
                  </article>
                )
              })}
            </div>
          </section>
        </>
      ) : (
        <>
          <p className="eyebrow">RAPID RESPONSE / {story.topic}</p>
          <h1 ref={heading} tabIndex={-1}>
            {story.title}
          </h1>
          <p className="review-note">
            Fictional adult practice case · Clinical review pending
          </p>
          {!session ? (
            <section aria-label="Response case setup">
              <p>{story.summary}</p>
              {lastSaved ? (
                <section
                  className="response-pause"
                  aria-label="Saved response case"
                >
                  <h2>
                    {lastSaved.complete
                      ? 'Your previous result is saved'
                      : 'Continue your saved case'}
                  </h2>
                  <p>
                    {lastSaved.complete
                      ? 'Review your previous choices and explanations.'
                      : `Decision ${lastSaved.index + 1} of ${story.stages.length}. The clock is paused until you resume.`}
                  </p>
                  <button
                    className="rr-button"
                    type="button"
                    onClick={() => {
                      sound.disable()
                      focusHeading.current = true
                      const restored = lastSaved.complete
                        ? lastSaved
                        : pauseRapidResponse(lastSaved)
                      latest.current = restored
                      setSession(restored)
                    }}
                  >
                    {lastSaved.complete
                      ? 'Review saved result'
                      : 'Open saved case'}
                  </button>
                </section>
              ) : null}
              <div className="response-settings">
                <fieldset>
                  <legend>Choose your timing</legend>
                  <div className="response-mode-choices">
                    <label>
                      <input
                        type="radio"
                        name="response-mode"
                        value="untimed"
                        checked={mode === 'untimed'}
                        onChange={() => setMode('untimed')}
                      />
                      Untimed practice
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="response-mode"
                        value="challenge"
                        checked={mode === 'challenge'}
                        onChange={() => setMode('challenge')}
                      />
                      Response challenge
                    </label>
                  </div>
                  <p>
                    {mode === 'untimed'
                      ? 'Work at your own pace. The clock counts active time for your reflection afterward.'
                      : 'A visible countdown adds pressure. At zero, choose to continue without a limit or review your decisions so far.'}
                  </p>
                </fieldset>
                {mode === 'challenge' ? (
                  <label>
                    Practice time allowance
                    <select
                      value={multiplier}
                      onChange={(event) =>
                        setMultiplier(Number(event.target.value) as 1 | 1.5 | 2)
                      }
                    >
                      <option value={1}>
                        Standard ·{' '}
                        {formatResponseTime(story.timeBudgetSeconds * 1000)}
                      </option>
                      <option value={1.5}>
                        1.5× time ·{' '}
                        {formatResponseTime(story.timeBudgetSeconds * 1500)}
                      </option>
                      <option value={2}>
                        2× time ·{' '}
                        {formatResponseTime(story.timeBudgetSeconds * 2000)}
                      </option>
                    </select>
                  </label>
                ) : null}
                <p>
                  All modes use the same advanced decisions. Feedback follows
                  the case. You can pause, choose additional time or practice
                  without a countdown.
                </p>
              </div>
              <div className="response-actions">
                <button
                  className="rr-button rr-button-mint"
                  type="button"
                  disabled={!loaded}
                  onClick={start}
                >
                  {lastSaved ? 'Start a new attempt' : 'Start case'}
                </button>
              </div>
              <div className="response-timing-note">
                Time includes reading and selecting responses. It cannot
                separate reasoning from reading speed or familiarity. The target
                is for practice and is not a validated measure of competence.
              </div>
            </section>
          ) : session.complete ? (
            <>
              <ResponseResults story={story} session={session} />
              <div className="response-actions">
                <button
                  className="rr-button"
                  type="button"
                  onClick={() => {
                    latest.current = null
                    setSession(null)
                    focusHeading.current = true
                  }}
                >
                  Choose timing for another attempt
                </button>
                <Link className="rr-button rr-button-outline" href="/ecg">
                  Study ECG rhythms
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="response-topline">
                <p>
                  <strong>
                    Decision {session.index + 1} of {story.stages.length}
                  </strong>
                  <br />
                  <span className="quiet-label">
                    {session.mode === 'challenge'
                      ? 'Response challenge'
                      : 'Untimed practice'}
                  </span>
                </p>
                <div
                  className="response-clock"
                  data-urgent={
                    remaining !== null &&
                    remaining <= 30000 &&
                    !session.continuedAfterExpiry
                  }
                  role="timer"
                  aria-live="off"
                  aria-label={
                    remaining === null || session.continuedAfterExpiry
                      ? 'Active case time'
                      : 'Practice time remaining'
                  }
                >
                  <span>
                    {session.continuedAfterExpiry
                      ? 'Continued · active time'
                      : remaining === null
                        ? 'Active time'
                        : 'Time remaining'}
                  </span>
                  <strong>
                    {formatResponseTime(
                      remaining === null || session.continuedAfterExpiry
                        ? session.activeMs
                        : Math.ceil(remaining / 1000) * 1000
                    )}
                  </strong>
                  <small>{session.paused ? 'Paused' : 'Running'}</small>
                </div>
              </div>
              {expired ? (
                <section
                  className="response-pause"
                  role="alert"
                  aria-label="Practice time reached"
                >
                  <h2>Practice time reached</h2>
                  <p>
                    Your choices are saved. Time does not mark this case as
                    failed. Continue at your own pace or review the decisions
                    you have completed.
                  </p>
                  <div className="response-actions">
                    <button
                      className="rr-button"
                      type="button"
                      onClick={() => {
                        if (latest.current)
                          commit(continueRapidResponse(latest.current))
                      }}
                    >
                      Continue without a time limit
                    </button>
                    <button
                      className="rr-button rr-button-outline"
                      type="button"
                      onClick={finish}
                    >
                      Finish and review
                    </button>
                  </div>
                </section>
              ) : session.paused ? (
                <section className="response-pause" aria-label="Case paused">
                  <h2>Your case is paused</h2>
                  <p>
                    Your selected responses are saved. Time away is excluded.
                    Sound stays off until you choose to enable it again.
                  </p>
                  <button
                    className="rr-button"
                    type="button"
                    onClick={() => {
                      if (latest.current)
                        commit(resumeRapidResponse(latest.current))
                    }}
                  >
                    Resume case
                  </button>
                </section>
              ) : stage ? (
                <>
                  <section
                    className="response-current"
                    aria-label="Current patient information"
                  >
                    <h2>Current patient update</h2>
                    <p>{stage.update}</p>
                    <ul className="response-observations">
                      {stage.observations.map((value) => (
                        <li key={value}>{value}</li>
                      ))}
                    </ul>
                    {stage.rhythmId ? (
                      <EcgStrip rhythmId={stage.rhythmId} concealLabel />
                    ) : null}
                    {stage.pulseContext ? (
                      <p className="response-pulse-context">
                        {stage.pulseContext}
                      </p>
                    ) : null}
                  </section>
                  <ScenarioQuestion
                    question={stage.question}
                    selected={session.selected}
                    onChange={(selected) => {
                      if (latest.current)
                        commit({ ...latest.current, selected })
                    }}
                    seed={session.index}
                  />
                  <div className="response-actions">
                    <button
                      className="rr-button rr-button-mint"
                      type="button"
                      disabled={
                        session.selected.length !==
                        stage.question.correct.length
                      }
                      onClick={() => {
                        if (!latest.current) return
                        focusHeading.current = true
                        const next = submitRapidResponseAnswer(latest.current)
                        commit(next)
                        if (next.complete) sound.disable()
                      }}
                    >
                      {session.index === story.stages.length - 1
                        ? 'Submit and review'
                        : 'Save decision and continue'}
                    </button>
                    <button
                      className="rr-button rr-button-outline"
                      type="button"
                      onClick={() => {
                        if (latest.current)
                          commit(pauseRapidResponse(latest.current))
                        sound.disable()
                      }}
                    >
                      Pause case
                    </button>
                  </div>
                  <p className="quiet-label">
                    Feedback is held until your review so later decisions remain
                    a challenge.
                  </p>
                  {remaining !== null && remaining > 0 ? (
                    <div
                      className="response-sound"
                      aria-label="Optional timing sound"
                    >
                      <button
                        type="button"
                        aria-pressed={sound.enabled}
                        onClick={async () => {
                          if (sound.enabled) sound.disable()
                          else await sound.enable()
                        }}
                      >
                        {sound.enabled
                          ? 'Turn timing sound off'
                          : 'Enable quiet timing sound'}
                      </button>
                      {sound.enabled ? (
                        <label>
                          Volume
                          <input
                            type="range"
                            aria-label="Timing sound volume"
                            min={0.01}
                            max={0.12}
                            step={0.01}
                            value={sound.volume}
                            onChange={(event) =>
                              sound.setVolume(Number(event.target.value))
                            }
                          />
                        </label>
                      ) : null}
                      <p>
                        A synthetic timing cue, not the patient’s heart rate. It
                        stays quiet; the cadence may increase near the time
                        target. Sound is optional and resets to off after
                        leaving.
                      </p>
                      {sound.error ? <p role="status">{sound.error}</p> : null}
                    </div>
                  ) : null}
                  {finishPending ? (
                    <section
                      className="response-pause"
                      aria-label="Finish case confirmation"
                    >
                      <h2>Finish this attempt now?</h2>
                      <p>
                        Only submitted decisions are scored. The current draft
                        and later decisions will be listed as unanswered.
                      </p>
                      <div className="response-actions">
                        <button
                          type="button"
                          className="rr-button"
                          onClick={finish}
                        >
                          Finish and review
                        </button>
                        <button
                          type="button"
                          className="rr-button rr-button-outline"
                          onClick={() => setFinishPending(false)}
                        >
                          Keep practicing
                        </button>
                      </div>
                    </section>
                  ) : (
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => setFinishPending(true)}
                    >
                      Finish this attempt early
                    </button>
                  )}
                </>
              ) : null}
            </>
          )}
          <details className="source-note">
            <summary>Sources & practice limits</summary>
            <p>
              Cases and ECGs are authored teaching examples. Scripted changes do
              not predict real patient outcomes. A rhythm strip must be
              considered with the patient’s pulse, perfusion and presentation.
            </p>
            {story.references.map((reference) => (
              <p key={reference.url}>
                <a href={reference.url} target="_blank" rel="noreferrer">
                  {reference.title}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </p>
            ))}
          </details>
        </>
      )}
      {notice ? <p role="status">{notice}</p> : null}
      <p className="quiet-label">
        Saved on this device. Fictional education only; follow current local
        protocols in clinical care.
      </p>
    </div>
  )
}
