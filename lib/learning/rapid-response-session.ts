import { z } from 'zod'
import {
  getRapidResponseCase,
  rapidResponseCases,
  rapidResponseRevision,
} from './rapid-response-content'
import { matchesAnswer } from './evolving-types'
import { contentRevision } from './sessions'
import { newAttemptId, type AttemptRecord } from './attempt-history'
import { summarizePractice } from './practice-result'

export const RAPID_RESPONSE_KEY = 'rapidrounds-rapid-response-v1'
export const RAPID_RESPONSE_REVISION = `${rapidResponseRevision}:${contentRevision(rapidResponseCases)}`
const maximumActiveMs = 24 * 60 * 60 * 1000
const schema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9:_-]{6,150}$/),
  revision: z.literal(RAPID_RESPONSE_REVISION),
  caseId: z.string(),
  mode: z.enum(['untimed', 'challenge']),
  budgetMs: z.number().int().positive().max(maximumActiveMs).nullable(),
  index: z.number().int().min(0).max(9),
  answers: z
    .array(
      z.object({
        selected: z.array(z.string()).min(1).max(4),
        elapsedMs: z.number().int().min(0).max(maximumActiveMs),
        answeredAt: z.string().datetime(),
      })
    )
    .max(10),
  selected: z.array(z.string()).max(4),
  activeMs: z.number().int().min(0).max(maximumActiveMs),
  paused: z.boolean(),
  complete: z.boolean(),
  continuedAfterExpiry: z.boolean(),
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type RapidResponseSession = z.infer<typeof schema>

function valid(value: unknown): RapidResponseSession | null {
  const parsed = schema.safeParse(value)
  if (!parsed.success) return null
  const session = parsed.data
  const story = getRapidResponseCase(session.caseId)
  if (
    !story ||
    session.index >= story.stages.length ||
    session.answers.length > story.stages.length
  )
    return null
  if (
    session.mode === 'untimed'
      ? session.budgetMs !== null || session.continuedAfterExpiry
      : ![1, 1.5, 2].some(
          (factor) =>
            session.budgetMs === story.timeBudgetSeconds * 1000 * factor
        )
  )
    return null
  if (session.continuedAfterExpiry && session.activeMs < session.budgetMs!)
    return null
  if (
    !session.continuedAfterExpiry &&
    session.budgetMs !== null &&
    session.activeMs > session.budgetMs
  )
    return null
  if (session.complete) {
    if (
      !session.paused ||
      session.selected.length ||
      session.index !==
        Math.min(session.answers.length, story.stages.length - 1)
    )
      return null
  } else if (session.answers.length !== session.index) return null
  const isValidSelection = (
    selection: string[],
    index: number,
    submitted: boolean
  ) => {
    const question = story.stages[index]?.question
    return (
      question &&
      new Set(selection).size === selection.length &&
      selection.every((id) =>
        question.options.some((option) => option.id === id)
      ) &&
      (submitted
        ? selection.length === question.correct.length
        : selection.length <= question.correct.length)
    )
  }
  if (
    !session.answers.every((answer, index) =>
      isValidSelection(answer.selected, index, true)
    )
  )
    return null
  if (
    !session.complete &&
    !isValidSelection(session.selected, session.index, false)
  )
    return null
  const usedMs = session.answers.reduce(
    (sum, answer) => sum + answer.elapsedMs,
    0
  )
  if (
    usedMs > session.activeMs ||
    session.updatedAt < session.startedAt ||
    session.answers.some(
      (answer) =>
        answer.answeredAt < session.startedAt ||
        answer.answeredAt > session.updatedAt
    )
  )
    return null
  return session
}

function changed(
  session: RapidResponseSession,
  patch: Partial<RapidResponseSession>,
  now = Date.now()
): RapidResponseSession {
  const timestamp = new Date(
    Math.max(Date.parse(session.updatedAt), now)
  ).toISOString()
  return { ...session, ...patch, updatedAt: timestamp }
}
export function createRapidResponseSession(
  caseId: string,
  options: {
    mode: RapidResponseSession['mode']
    multiplier?: 1 | 1.5 | 2
    id?: string
    now?: number
  }
): RapidResponseSession | null {
  const story = getRapidResponseCase(caseId)
  if (!story) return null
  const timestamp = new Date(options.now ?? Date.now()).toISOString()
  return valid({
    id: options.id ?? newAttemptId('rapid'),
    revision: RAPID_RESPONSE_REVISION,
    caseId,
    mode: options.mode,
    budgetMs:
      options.mode === 'challenge'
        ? story.timeBudgetSeconds * 1000 * (options.multiplier ?? 1)
        : null,
    index: 0,
    answers: [],
    selected: [],
    activeMs: 0,
    paused: false,
    complete: false,
    continuedAfterExpiry: false,
    startedAt: timestamp,
    updatedAt: timestamp,
  })
}
export function readRapidResponseSessions(
  raw: string | null
): RapidResponseSession[] {
  try {
    const values: unknown = JSON.parse(raw ?? '[]')
    if (!Array.isArray(values) || values.length > 200) return []
    const unique = new Map<string, RapidResponseSession>()
    for (const value of values) {
      const session = valid(value)
      if (session && !unique.has(session.id))
        unique.set(session.id, { ...session, paused: true })
    }
    const sorted = [...unique.values()].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    )
    return [
      ...sorted.filter((s) => !s.complete).slice(0, 20),
      ...sorted.filter((s) => s.complete).slice(0, 20),
    ]
  } catch {
    return []
  }
}
export function saveRapidResponseSession(
  session: RapidResponseSession
): boolean {
  const checked = valid(session)
  if (!checked) return false
  try {
    const previous = readRapidResponseSessions(
      localStorage.getItem(RAPID_RESPONSE_KEY)
    )
    const old = previous.find((item) => item.id === session.id)
    // Confirmed decisions and completed results cannot be rewritten by a later save.
    if (
      old &&
      (old.caseId !== session.caseId ||
        old.revision !== session.revision ||
        old.mode !== session.mode ||
        old.budgetMs !== session.budgetMs ||
        old.startedAt !== session.startedAt ||
        old.activeMs > session.activeMs ||
        (old.continuedAfterExpiry && !session.continuedAfterExpiry) ||
        old.answers.length > session.answers.length ||
        old.answers.some(
          (answer, index) =>
            JSON.stringify(answer) !== JSON.stringify(session.answers[index])
        ) ||
        (old.complete &&
          JSON.stringify({ ...old, paused: true }) !==
            JSON.stringify({ ...session, paused: true })))
    )
      return false
    const values = [
      checked,
      ...previous.filter((item) => item.id !== session.id),
    ]
    const retained = [
      ...values.filter((item) => !item.complete).slice(0, 20),
      ...values.filter((item) => item.complete).slice(0, 20),
    ]
    localStorage.setItem(RAPID_RESPONSE_KEY, JSON.stringify(retained))
    window.dispatchEvent(new Event('rapidrounds-progress'))
    return true
  } catch {
    return false
  }
}
export function rapidResponseRemainingMs(session: RapidResponseSession) {
  return session.budgetMs === null
    ? null
    : Math.max(0, session.budgetMs - session.activeMs)
}
export function rapidResponseAwaitingChoice(session: RapidResponseSession) {
  return (
    !session.complete &&
    session.budgetMs !== null &&
    session.activeMs >= session.budgetMs &&
    !session.continuedAfterExpiry
  )
}
export function tickRapidResponse(
  session: RapidResponseSession,
  deltaMs: number,
  now = Date.now()
) {
  if (
    session.paused ||
    session.complete ||
    rapidResponseAwaitingChoice(session) ||
    !Number.isFinite(deltaMs) ||
    deltaMs <= 0
  )
    return session
  // The UI supplies a monotonic foreground delta. A stalled/background tick
  // cannot charge minutes of absence; backgrounding also explicitly pauses.
  const increment = Math.min(2000, Math.round(deltaMs))
  const activeMs = Math.min(
    maximumActiveMs,
    session.activeMs + increment,
    session.budgetMs !== null && !session.continuedAfterExpiry
      ? session.budgetMs
      : maximumActiveMs
  )
  return changed(
    session,
    {
      activeMs,
      paused:
        session.budgetMs !== null &&
        !session.continuedAfterExpiry &&
        activeMs >= session.budgetMs,
    },
    now
  )
}
export function pauseRapidResponse(
  session: RapidResponseSession,
  now = Date.now()
) {
  return session.complete ? session : changed(session, { paused: true }, now)
}
export function resumeRapidResponse(
  session: RapidResponseSession,
  now = Date.now()
) {
  return session.complete || rapidResponseAwaitingChoice(session)
    ? session
    : changed(session, { paused: false }, now)
}
export function continueRapidResponse(
  session: RapidResponseSession,
  now = Date.now()
) {
  return rapidResponseAwaitingChoice(session)
    ? changed(session, { continuedAfterExpiry: true, paused: false }, now)
    : session
}
export function submitRapidResponseAnswer(
  session: RapidResponseSession,
  now = Date.now()
) {
  if (
    session.paused ||
    session.complete ||
    rapidResponseAwaitingChoice(session) ||
    !valid(session)
  )
    return session
  const story = getRapidResponseCase(session.caseId)!
  const question = story.stages[session.index]!.question
  if (session.selected.length !== question.correct.length) return session
  const elapsedMs =
    session.activeMs -
    session.answers.reduce((sum, answer) => sum + answer.elapsedMs, 0)
  const answers = [
    ...session.answers,
    {
      selected: [...session.selected],
      elapsedMs,
      answeredAt: new Date(
        Math.max(Date.parse(session.updatedAt), now)
      ).toISOString(),
    },
  ]
  const complete = answers.length === story.stages.length
  return changed(
    session,
    {
      answers,
      selected: [],
      index: complete ? session.index : session.index + 1,
      complete,
      paused: complete,
    },
    now
  )
}
export function finishRapidResponse(
  session: RapidResponseSession,
  now = Date.now()
) {
  return session.complete
    ? session
    : changed(session, { complete: true, paused: true, selected: [] }, now)
}
export function summarizeRapidResponse(session: RapidResponseSession) {
  const story = getRapidResponseCase(session.caseId)!
  const outcomes = story.stages.map((stage, index) => ({
    correct:
      !!session.answers[index] &&
      matchesAnswer(stage.question, session.answers[index]!.selected),
    skipped: !session.answers[index],
    assisted: false,
  }))
  return {
    score: summarizePractice(outcomes),
    criticalMisses: story.stages.flatMap((stage, index) =>
      stage.critical && !outcomes[index]!.correct ? [index] : []
    ),
    activeMs: session.activeMs,
    budgetMs: session.budgetMs,
    exceededBudget:
      session.budgetMs !== null &&
      (session.activeMs > session.budgetMs || session.continuedAfterExpiry),
  }
}
export function formatResponseTime(ms: number) {
  const seconds = Math.floor(Math.max(0, ms) / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
export function rapidResponseAttempt(
  session: RapidResponseSession,
  source: 'tracked' | 'saved' = 'tracked'
): AttemptRecord {
  const story = getRapidResponseCase(session.caseId)!
  const summary = summarizeRapidResponse(session)
  return {
    id: session.id,
    kind: 'rapid-response',
    contentId: story.id,
    title: story.title,
    revision: session.revision,
    level: 'advanced',
    mode: 'check',
    variant: `${session.mode}:${session.budgetMs ?? 'open'}`,
    correct: summary.score.correct,
    answered: summary.score.answered,
    skipped: summary.score.unanswered,
    assisted: 0,
    completedAt: source === 'tracked' ? session.updatedAt : null,
    source,
    href: `/rapid-response?session=${encodeURIComponent(session.id)}`,
    skills: [],
    timing: {
      activeMs: session.activeMs,
      budgetMs: session.budgetMs,
      mode: session.mode,
      exceededBudget: summary.exceededBudget,
    },
  }
}
