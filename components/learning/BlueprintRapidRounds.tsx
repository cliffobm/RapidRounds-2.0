'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Pause,
  Play,
  Sparkles,
  CheckCircle2,
  Flag,
} from 'lucide-react'
import { useAuth } from '@/store/useAuth'
import {
  rapidRounds,
  getRapidRound,
  roundCategories,
  roundSkills,
  rotateRoundOptions,
  gradeRoundPrompt,
  roundSelectionReady,
  type RapidRound,
  type RoundPrompt,
} from '@/lib/learning/rapid-rounds'
import {
  createRoundSession,
  readRoundSessions,
  submitRoundChoice,
  nextRoundPrompt,
  summarizeRound,
  type RapidRoundSession,
} from '@/lib/learning/rapid-round-session'
import ItemFeedback from './ItemFeedback'

export default function BlueprintRapidRounds({
  initialRoundId = '',
  initialSessionId = '',
}: {
  initialRoundId?: string
  initialSessionId?: string
}) {
  const userId = useAuth((s) => s.user?.id)
  return (
    <RoundExperience
      key={userId ?? 'offline'}
      scope={userId ?? 'offline'}
      initialRoundId={initialRoundId}
      initialSessionId={initialSessionId}
    />
  )
}
const duration = (ms: number) =>
  `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`
function RoundExperience({
  scope,
  initialRoundId,
  initialSessionId,
}: {
  scope: string
  initialRoundId: string
  initialSessionId: string
}) {
  const storageKey = `rr.blueprint.rounds.v1:${scope}`
  const [roundId, setRoundId] = useState(
    getRapidRound(initialRoundId)?.id ?? rapidRounds[0]!.id
  )
  const [mode, setMode] = useState<'guided' | 'independent'>('guided')
  const [budget, setBudget] = useState<number | null>(null)
  const [session, setSession] = useState<RapidRoundSession | null>(null)
  const [saved, setSaved] = useState<RapidRoundSession[]>([])
  const [ready, setReady] = useState(false)
  const [notice, setNotice] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [clueOpen, setClueOpen] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const focusNext = useRef(false)
  useEffect(() => {
    try {
      const records = readRoundSessions(localStorage.getItem(storageKey))
      setSaved(records)
      const resumed = records.find((s) => s.id === initialSessionId)
      if (resumed) {
        setSession(resumed)
        setRoundId(resumed.roundId)
      } else if (initialSessionId)
        setNotice(
          'That saved round is unavailable in this account on this device. You can start a new encounter.'
        )
    } catch {
      setNotice(
        'Browser storage is unavailable. You can still practice during this visit.'
      )
    }
    setReady(true)
  }, [storageKey, initialSessionId])
  useEffect(() => {
    if (!ready || !session) return
    try {
      const records = readRoundSessions(
        localStorage.getItem(storageKey)
      ).filter((s) => s.id !== session.id)
      localStorage.setItem(
        storageKey,
        JSON.stringify([...records, session].slice(-30))
      )
      window.dispatchEvent(new Event('rr-blueprint-progress'))
    } catch {
      setNotice(
        'Progress is available in this visit, but could not be saved on this device.'
      )
    }
  }, [ready, session, storageKey])
  useEffect(() => {
    if (focusNext.current) {
      heading.current?.focus()
      focusNext.current = false
    }
  }, [session?.id, session?.index, session?.complete])
  const answered = session ? session.answers.length > session.index : false
  useEffect(() => {
    if (
      !session ||
      session.complete ||
      session.paused ||
      answered ||
      reportOpen
    )
      return
    let last = performance.now()
    const tick = window.setInterval(() => {
      const now = performance.now(),
        delta = Math.max(0, Math.min(2000, Math.round(now - last)))
      last = now
      if (document.visibilityState !== 'visible') return
      setSession((s) => {
        if (!s || s.complete || s.paused) return s
        const elapsedMs = Math.min(86400000, s.elapsedMs + delta)
        const expired = s.budgetMs !== null && elapsedMs >= s.budgetMs
        return {
          ...s,
          elapsedMs,
          paused: expired,
          exceeded: s.exceeded || expired,
        }
      })
    }, 1000)
    return () => window.clearInterval(tick)
  }, [session?.id, session?.paused, session?.complete, answered, reportOpen])
  useEffect(() => {
    const pause = () => {
      if (document.visibilityState === 'hidden')
        setSession((s) => (s && !s.complete ? { ...s, paused: true } : s))
    }
    document.addEventListener('visibilitychange', pause)
    return () => document.removeEventListener('visibilitychange', pause)
  }, [])
  const round = getRapidRound(session?.roundId ?? roundId, session?.revision)!
  const item = session ? round.steps[session.index]! : null
  const answer = session?.answers[session.index]
  const patch = (v: Partial<RapidRoundSession>) =>
    setSession((s) =>
      s ? { ...s, ...v, updatedAt: new Date().toISOString() } : s
    )
  const start = () => {
    focusNext.current = true
    setClueOpen(false)
    setReportOpen(false)
    setSession(createRoundSession(round.id, mode, budget))
  }
  const leave = () => {
    if (session)
      setSaved((v) => [
        ...v.filter((s) => s.id !== session.id),
        { ...session, paused: !session.complete },
      ])
    setSession(null)
    setReportOpen(false)
    setClueOpen(false)
  }
  const itemReport = (
    prompt: RoundPrompt,
    selected: string[],
    phase: 'before' | 'after'
  ) => ({
    itemId: prompt.id,
    revision: session!.revision,
    activity: 'rapid-round' as const,
    prompt: prompt.prompt,
    patientContext: `${round.handoff}\n${prompt.update}\n${prompt.format === 'choice' ? prompt.options.map((o) => `${selected.includes(o.id) ? 'Selected' : 'Option'}: ${o.text}`).join('\n') : prompt.rows.map((r) => `${r.text} — ${selected.includes(`${r.id}:urgent`) ? 'Prompt follow-up selected' : selected.includes(`${r.id}:monitor`) ? 'No acute change selected' : 'Not classified'}`).join('\n')}${phase === 'after' ? `\nExplanation shown: ${prompt.mechanism}` : ''}`,
    selected,
    phase,
  })
  return (
    <div className="rr-experience blueprint-rounds">
      <div className="round-toplinks">
        <Link href="/home" className="text-link">
          <ArrowLeft size={16} /> Home
        </Link>
        <div>
          <Link href="/rr">Case library</Link>
          <Link href="/blueprint">Learning blueprint</Link>
          <Link href="/feedback">
            <Flag size={15} /> Your feedback
          </Link>
        </div>
      </div>
      {!session ? (
        <>
          <section className="round-welcome">
            <p className="eyebrow">RAPID ROUNDS · SEE MORE. MISS LESS.</p>
            <h1>
              Bring what you know.
              <br />
              <em>Make the next connection.</em>
            </h1>
            <p>One patient. Four focused prompts. A clearer next move.</p>
            <div className="round-recommended">
              <span className="round-pill">
                <Sparkles size={15} /> Start here
              </span>
              <h2>{round.title}</h2>
              <p>{round.focus}</p>
              <p className="quiet-label">
                {round.patient} · About 4–5 minutes plus your debrief · Your
                pace
              </p>
              <fieldset className="round-mode">
                <legend>How would you like to practice?</legend>
                {(['guided', 'independent'] as const).map((value) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name="round-mode"
                      checked={mode === value}
                      onChange={() => setMode(value)}
                    />
                    <span>
                      <strong>
                        {value === 'guided'
                          ? 'Guided round'
                          : 'Independent round'}
                      </strong>
                      <small>
                        {value === 'guided'
                          ? 'Hints available. Understand each decision as you go.'
                          : 'Make your decisions first, then explore the explanations.'}
                      </small>
                    </span>
                  </label>
                ))}
              </fieldset>
              <details className="round-timing-setup">
                <summary>Add an optional time target</summary>
                <label>
                  Time target
                  <select
                    value={budget ?? ''}
                    onChange={(e) =>
                      setBudget(e.target.value ? Number(e.target.value) : null)
                    }
                  >
                    <option value="">No countdown</option>
                    <option value="300000">5 minutes</option>
                    <option value="480000">8 minutes</option>
                  </select>
                </label>
                <p className="quiet-label">
                  You can pause or continue without a limit. Time and accuracy
                  stay separate.
                </p>
              </details>
              <button
                type="button"
                className="rr-button rr-button-mint"
                disabled={!ready}
                onClick={start}
              >
                Start {mode === 'guided' ? 'guided' : 'independent'} round{' '}
                <ArrowRight size={18} />
              </button>
            </div>
          </section>
          {saved.some((s) => !s.complete) && (
            <section className="round-resume">
              <h2>Pick up where you paused</h2>
              {saved
                .filter((s) => !s.complete)
                .slice(-3)
                .reverse()
                .map((s) => (
                  <button
                    key={s.id}
                    className="rr-button-secondary"
                    onClick={() => {
                      focusNext.current = true
                      setSession({ ...s, paused: true })
                    }}
                  >
                    {getRapidRound(s.roundId, s.revision)?.title} · Prompt{' '}
                    {s.index + 1}
                  </button>
                ))}
            </section>
          )}
          <details className="round-catalog">
            <summary>
              Explore all {rapidRounds.length} patient encounters
            </summary>
            <div className="round-catalog-grid">
              {rapidRounds.map((r) => (
                <button
                  key={r.id}
                  className={r.id === round.id ? 'is-selected' : ''}
                  onClick={() => setRoundId(r.id)}
                  aria-pressed={r.id === round.id}
                >
                  <small>{r.patient}</small>
                  <strong>{r.title}</strong>
                  <span>{r.focus}</span>
                  {saved.some((s) => s.roundId === r.id && s.complete) && (
                    <small>Encounter completed</small>
                  )}
                </button>
              ))}
            </div>
          </details>
          <p className="review-note">
            Original educational cases for newly licensed nurses · Clinical
            review pending · Progress saves on this device
          </p>
        </>
      ) : session.complete ? (
        <>
          <p className="eyebrow">
            ROUND COMPLETE ·{' '}
            {session.mode === 'guided'
              ? 'GUIDED PRACTICE'
              : 'INDEPENDENT PRACTICE'}
          </p>
          <h1 ref={heading} tabIndex={-1}>
            Take the next connection with you.
          </h1>
          <RoundDebrief round={round} session={session} />
          <section className="round-build">
            <span className="round-pill">
              <Sparkles size={16} /> Optional extra
            </span>
            <h2>Build the next clue</h2>
            <p>
              Use the idea from this encounter to challenge a working
              explanation.
            </p>
            <button
              className="rr-button-secondary"
              onClick={() => setClueOpen(!clueOpen)}
              aria-expanded={clueOpen}
            >
              {clueOpen ? 'Close activity' : 'Try the clue challenge'}
            </button>
            {clueOpen && (
              <>
                <fieldset className="scenario-question">
                  <legend>{round.clue.prompt}</legend>
                  <div className="answer-list">
                    {rotateRoundOptions(
                      round.clue.options,
                      `${session.id}:clue`
                    ).map((o) => (
                      <label
                        className={`answer-option ${session.clueSelected === o.id ? 'is-chosen' : ''}`}
                        key={o.id}
                      >
                        <input
                          type="radio"
                          name="clue"
                          checked={session.clueSelected === o.id}
                          disabled={session.clueChecked}
                          onChange={() => patch({ clueSelected: o.id })}
                        />
                        <span>{o.text}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {session.clueChecked ? (
                  <div className="round-coaching" role="status">
                    <h3>
                      {session.clueSelected === round.clue.correct
                        ? 'That clue challenges the explanation.'
                        : 'Try weighing the new evidence.'}
                    </h3>
                    <p>
                      {
                        round.clue.options.find(
                          (o) => o.id === session.clueSelected
                        )?.explanation
                      }
                    </p>
                    <p>
                      <strong>A fitting clue:</strong>{' '}
                      {
                        round.clue.options.find(
                          (o) => o.id === round.clue.correct
                        )!.text
                      }
                    </p>
                    <p>{round.clue.takeaway}</p>
                    <button
                      className="text-link"
                      onClick={() =>
                        patch({ clueChecked: false, clueSelected: null })
                      }
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <button
                    className="rr-button-secondary"
                    disabled={session.clueSelected === null}
                    onClick={() =>
                      patch({
                        clueChecked: true,
                        clueFirst: session.clueFirst ?? session.clueSelected,
                      })
                    }
                  >
                    Check the clue
                  </button>
                )}
                <p className="quiet-label">
                  This optional activity is separate from the four first
                  responses. Retries do not replace your first choice.
                </p>
                <ItemFeedback
                  item={{
                    itemId: `${round.id}:clue`,
                    activity: 'rapid-round',
                    revision: session.revision,
                    prompt: round.clue.prompt,
                    patientContext: round.handoff,
                    selected:
                      session.clueSelected === null
                        ? []
                        : [session.clueSelected],
                    phase: session.clueChecked ? 'after' : 'before',
                  }}
                />
              </>
            )}
          </section>
          <div className="round-next">
            <button
              className="rr-button rr-button-mint"
              onClick={() => {
                const next =
                  rapidRounds[
                    (rapidRounds.findIndex((r) => r.id === round.id) + 1) %
                      rapidRounds.length
                  ]!
                leave()
                setRoundId(next.id)
              }}
            >
              Meet another patient <ArrowRight size={18} />
            </button>
            <button className="rr-button-secondary" onClick={leave}>
              Choose an encounter
            </button>
            <Link className="text-link" href="/study">
              Explore a reasoning skill
            </Link>
          </div>
          <section className="round-full-review">
            <h2>Review each prompt</h2>
            {round.steps.map((p, i) => (
              <details key={p.id}>
                <summary>
                  {i + 1}. {p.prompt}
                </summary>
                <RoundExplanation
                  item={p}
                  selected={session.answers[i]!.selected}
                  skipped={session.answers[i]!.skipped}
                />
                <ItemFeedback
                  item={itemReport(p, session.answers[i]!.selected, 'after')}
                />
              </details>
            ))}
          </section>
          <RoundSources round={round} />
        </>
      ) : item ? (
        <>
          <header className="round-active-heading">
            <div>
              <p className="eyebrow">{round.patient}</p>
              <h1 ref={heading} tabIndex={-1}>
                {round.title}
              </h1>
            </div>
            <button className="text-link" onClick={leave}>
              Save and leave
            </button>
          </header>
          <div
            className="round-progress"
            aria-label={`Prompt ${session.index + 1} of 4`}
          >
            {round.steps.map((_, i) => (
              <span
                key={i}
                className={
                  i < session.answers.length
                    ? 'is-done'
                    : i === session.index
                      ? 'is-current'
                      : ''
                }
              >
                {i < session.answers.length ? (
                  <CheckCircle2 size={16} />
                ) : (
                  i + 1
                )}
                <small>
                  {['Notice', 'Connect', 'Choose', 'Reconsider'][i]}
                </small>
              </span>
            ))}
          </div>
          <div className="round-clock">
            <span>
              {session.budgetMs === null
                ? `Active time ${duration(session.elapsedMs)}`
                : `Time target ${duration(Math.max(0, session.budgetMs - session.elapsedMs))}`}
            </span>
            <button
              type="button"
              className="text-link"
              onClick={() =>
                patch({
                  paused: !session.paused,
                  budgetMs:
                    session.paused &&
                    session.budgetMs !== null &&
                    session.elapsedMs >= session.budgetMs
                      ? null
                      : session.budgetMs,
                })
              }
            >
              {session.paused ? <Play size={15} /> : <Pause size={15} />}
              {session.paused ? 'Resume' : 'Pause'}
            </button>
            {reportOpen && <small>Clock paused while writing feedback</small>}
            {answered && <small>Clock paused for explanation</small>}
          </div>
          {session.paused ? (
            <section className="round-pause" aria-label="Round paused">
              <h2>
                {session.budgetMs !== null &&
                session.elapsedMs >= session.budgetMs
                  ? 'Your time target is reached.'
                  : 'Your patient encounter is paused.'}
              </h2>
              <p>Your choices are kept. Take the time you need.</p>
              <button
                className="rr-button"
                onClick={() =>
                  patch({
                    paused: false,
                    budgetMs:
                      session.budgetMs !== null &&
                      session.elapsedMs >= session.budgetMs
                        ? null
                        : session.budgetMs,
                  })
                }
              >
                {session.budgetMs !== null &&
                session.elapsedMs >= session.budgetMs
                  ? 'Continue without a countdown'
                  : 'Resume round'}
              </button>
            </section>
          ) : (
            <>
              <details className="round-handoff" open={session.index === 0}>
                <summary>Patient handoff</summary>
                <p>{round.handoff}</p>
              </details>
              <section className="round-decision">
                <p className="eyebrow">
                  {item.skill === null
                    ? 'KNOWLEDGE WARM-UP'
                    : `DECISION ${session.index + 1}`}{' '}
                  · {roundCategories[item.category].title}
                </p>
                <div className="round-update">
                  <p>{item.update}</p>
                </div>
                <RoundInput
                  item={item}
                  selected={session.selected}
                  disabled={Boolean(answer)}
                  seed={`${session.id}:${session.index}`}
                  onChange={(selected) => patch({ selected })}
                />
                {!answer && session.mode === 'guided' && (
                  <div className="round-hint">
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => patch({ assisted: true })}
                    >
                      <Lightbulb size={17} />{' '}
                      {session.assisted
                        ? 'Thinking prompt'
                        : 'Use a thinking prompt'}
                    </button>
                    {session.assisted && <p>{item.hint}</p>}
                  </div>
                )}
                {answer ? (
                  <>
                    <div className="round-coaching" role="status">
                      <h2>
                        {answer.skipped
                          ? 'Warm-up skipped'
                          : gradeRoundPrompt(item, answer.selected) === 1
                            ? 'That fits the situation.'
                            : 'Let’s connect the clues.'}
                      </h2>
                      {answer.skipped ? (
                        <p>
                          You can return to this prerequisite explanation in the
                          debrief.
                        </p>
                      ) : (
                        <RoundExplanation
                          item={item}
                          selected={answer.selected}
                          compact
                        />
                      )}
                    </div>
                    <button
                      className="rr-button rr-button-mint"
                      disabled={reportOpen}
                      onClick={() => {
                        focusNext.current = true
                        setReportOpen(false)
                        setSession((s) => (s ? nextRoundPrompt(s) : s))
                      }}
                    >
                      {session.index === 3
                        ? 'Take your takeaway'
                        : 'Next patient update'}{' '}
                      <ArrowRight size={17} />
                    </button>
                  </>
                ) : (
                  <div className="question-actions">
                    <button
                      className="rr-button rr-button-mint"
                      disabled={
                        reportOpen ||
                        !roundSelectionReady(item, session.selected)
                      }
                      onClick={() => {
                        focusNext.current = session.mode === 'independent'
                        setSession((s) => (s ? submitRoundChoice(s) : s))
                      }}
                    >
                      {session.mode === 'guided'
                        ? 'Explore this decision'
                        : 'Save decision'}{' '}
                      <ArrowRight size={17} />
                    </button>
                    {item.skill === null && (
                      <button
                        className="text-link"
                        disabled={reportOpen}
                        onClick={() =>
                          setSession((s) =>
                            s ? submitRoundChoice(s, true) : s
                          )
                        }
                      >
                        Skip this warm-up
                      </button>
                    )}
                  </div>
                )}
                <ItemFeedback
                  item={itemReport(
                    item,
                    answer?.selected ?? session.selected,
                    answer ? 'after' : 'before'
                  )}
                  onOpenChange={setReportOpen}
                />
              </section>
            </>
          )}
        </>
      ) : null}
      {notice && (
        <p role="status" className="practice-notice">
          {notice}
        </p>
      )}
    </div>
  )
}
function RoundInput({
  item,
  selected,
  disabled,
  seed,
  onChange,
}: {
  item: RoundPrompt
  selected: string[]
  disabled: boolean
  seed: string
  onChange: (v: string[]) => void
}) {
  return (
    <fieldset className="scenario-question round-question">
      <legend>{item.prompt}</legend>
      {item.format === 'choice' ? (
        <>
          <p>Choose one response.</p>
          <div className="answer-list">
            {rotateRoundOptions(item.options, seed).map((o, i) => (
              <label
                key={o.id}
                className={`answer-option ${selected.includes(o.id) ? 'is-chosen' : ''}`}
              >
                <input
                  type="radio"
                  name={item.id}
                  checked={selected.includes(o.id)}
                  disabled={disabled}
                  onChange={() => onChange([o.id])}
                />
                <span className="answer-letter" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{o.text}</span>
              </label>
            ))}
          </div>
        </>
      ) : (
        <>
          <p>
            Classify every finding. “No acute change” applies only to the
            information in that row.
          </p>
          <div className="round-matrix">
            {item.rows.map((row) => (
              <fieldset key={row.id}>
                <legend>{row.text}</legend>
                <div>
                  {(['urgent', 'monitor'] as const).map((v) => (
                    <label
                      key={v}
                      className={
                        selected.includes(`${row.id}:${v}`) ? 'is-chosen' : ''
                      }
                    >
                      <input
                        type="radio"
                        name={`${item.id}:${row.id}`}
                        checked={selected.includes(`${row.id}:${v}`)}
                        disabled={disabled}
                        onChange={() =>
                          onChange([
                            ...selected.filter(
                              (s) => !s.startsWith(`${row.id}:`)
                            ),
                            `${row.id}:${v}`,
                          ])
                        }
                      />
                      {v === 'urgent' ? 'Prompt follow-up' : 'No acute change'}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </>
      )}
    </fieldset>
  )
}
function RoundExplanation({
  item,
  selected,
  skipped = false,
  compact = false,
}: {
  item: RoundPrompt
  selected: string[]
  skipped?: boolean
  compact?: boolean
}) {
  const credit = skipped ? null : gradeRoundPrompt(item, selected)
  return (
    <div className="round-explanation">
      <p>{item.brief}</p>
      {item.format === 'matrix' && credit !== null && (
        <p className="quiet-label">
          {credit * item.rows.length} of {item.rows.length} classifications
          match. Each row contributes equally to this prompt.
        </p>
      )}
      {!compact && (
        <p className="quiet-label">
          {skipped
            ? 'Not answered; excluded from response totals.'
            : `First response: ${credit === 1 ? 'matches the key' : credit === 0 ? 'needs review' : 'partially matches the key'}`}
        </p>
      )}
      <details open={!compact}>
        <summary>Understand the why</summary>
        <p>{item.mechanism}</p>
        {item.format === 'choice' ? (
          <ul className="round-option-review">
            {item.options.map((o) => (
              <li key={o.id}>
                <strong>
                  {o.id === item.correct
                    ? 'Best response'
                    : selected.includes(o.id)
                      ? 'Your response'
                      : 'Alternative'}
                  : {o.text}
                </strong>
                <p>{o.explanation}</p>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="round-option-review">
            {item.rows.map((row) => (
              <li key={row.id}>
                <strong>
                  {row.text} —{' '}
                  {row.urgent ? 'Prompt follow-up' : 'No acute change'}
                </strong>
                <p>{row.explanation}</p>
              </li>
            ))}
          </ul>
        )}
        <p>
          <strong>Carry this forward:</strong> {item.carryForward}
        </p>
      </details>
    </div>
  )
}
function RoundDebrief({
  round,
  session,
}: {
  round: RapidRound
  session: RapidRoundSession
}) {
  const result = summarizeRound(session),
    decisions = result.filter((r) => r.item.skill !== null)
  const connected = decisions.filter((r) => r.credit === 1),
    revisit = decisions.filter((r) => r.credit !== 1)
  const responded = result.filter((r) => r.credit !== null)
  return (
    <section className="round-debrief" aria-label="Your learning takeaway">
      <div className="round-debrief-lead">
        <CheckCircle2 size={30} />
        <div>
          <p className="eyebrow">{round.title}</p>
          <h2>
            {revisit.length === 0
              ? 'You connected this patient’s changing story.'
              : 'You have a clear next practice target.'}
          </h2>
          <p>{round.focus}</p>
        </div>
      </div>
      {connected.length > 0 && (
        <div>
          <h3>What your responses showed</h3>
          <ul>
            {connected.map((r) => (
              <li key={r.item.id}>{r.item.outcome}</li>
            ))}
          </ul>
        </div>
      )}
      {revisit.length > 0 && (
        <div className="round-next-focus">
          <h3>Your next focus</h3>
          <p>{revisit[0]!.item.carryForward}</p>
          <p>
            Explore the explanation below, then try the idea with another
            patient.
          </p>
        </div>
      )}
      <p className="quiet-label">
        {session.mode === 'guided'
          ? 'Guided responses include the explanations seen earlier in this encounter.'
          : 'Independent responses were made before answer explanations.'}{' '}
        {session.answers.filter((a) => a.assisted).length} thinking prompts
        used. Warm-ups and the optional clue activity stay separate from
        judgment decisions.
      </p>
      <details className="round-response-details">
        <summary>View first-response details</summary>
        <p>
          {responded.filter((r) => r.credit === 1).length} of {responded.length}{' '}
          answered prompts fully matched the key.{' '}
          {result.filter((r) => r.answer?.skipped).length} warm-ups skipped.
        </p>
        <p>
          Prompt credit:{' '}
          {responded.reduce((n, r) => n + (r.credit ?? 0), 0).toFixed(2)} of{' '}
          {responded.length}. A matrix is one prompt worth one point; its four
          rows contribute 0.25 each. These are practice response details, not a
          pass/fail grade.
        </p>
        <p>
          Active decision time: {duration(session.elapsedMs)}.{' '}
          {session.exceeded
            ? 'You continued after the optional target; no points were deducted.'
            : 'Time does not change response credit.'}
        </p>
      </details>
    </section>
  )
}
function RoundSources({ round }: { round: RapidRound }) {
  return (
    <details className="round-sources">
      <summary>Evidence behind this encounter</summary>
      <ul>
        {round.sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title}
            </a>
          </li>
        ))}
      </ul>
      <p className="quiet-label">
        Original fictional practice case. Clinical review pending. Local
        protocols and the stated patient context govern the authored decisions.
      </p>
    </details>
  )
}
