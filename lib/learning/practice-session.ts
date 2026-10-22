import { z } from 'zod'
import type { AttemptRecord } from './attempt-history'
import type { PillarId } from './pillars'
import { matchesAnswer } from './evolving-types'
import { summarizePractice } from './practice-result'
import {
  PRACTICE_LIBRARY_REVISION,
  findPracticeCollection,
  getPracticeQuestion,
  practicePool,
  type PracticeLevel,
} from './practice-library'

export const PRACTICE_SESSIONS_KEY = 'rapidrounds-practice-sessions-v1'
const schema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{6,100}$/),
  revision: z.literal(PRACTICE_LIBRARY_REVISION),
  mode: z.enum(['guided', 'check']),
  collectionId: z.string().max(100),
  title: z.string().min(1).max(150),
  level: z.enum(['all', 'foundation', 'challenge', 'advanced', 'unclassified']),
  ids: z
    .array(z.string())
    .refine((ids) => ids.length === 5 || ids.length === 10),
  index: z.number().int().min(0).max(9),
  answers: z
    .array(z.object({ selected: z.string().nullable(), assisted: z.boolean() }))
    .max(10),
  selected: z.string(),
  assisted: z.boolean(),
  complete: z.boolean(),
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type UnifiedPracticeSession = z.infer<typeof schema>

function validSession(value: unknown): UnifiedPracticeSession | null {
  const parsed = schema.safeParse(value)
  if (!parsed.success) return null
  const session = parsed.data
  if (
    session.index >= session.ids.length ||
    new Set(session.ids).size !== session.ids.length ||
    (session.collectionId !== 'all' &&
      !findPracticeCollection(session.collectionId)) ||
    Date.parse(session.updatedAt) < Date.parse(session.startedAt) ||
    (session.complete &&
      (session.index !== session.ids.length - 1 ||
        session.answers.length !== session.ids.length))
  )
    return null
  const expectedAnswers = session.index + Number(session.complete)
  if (
    session.mode === 'check'
      ? session.answers.length !== expectedAnswers
      : session.answers.length !== expectedAnswers &&
        !(!session.complete && session.answers.length === session.index + 1)
  )
    return null
  if (
    !session.ids.every((id) => {
      const question = getPracticeQuestion(id)
      return (
        question &&
        (session.collectionId === 'all' ||
          question.collectionId === session.collectionId) &&
        (session.level === 'all' || question.level === session.level)
      )
    })
  )
    return null
  if (
    !session.answers.every(
      (answer, index) =>
        answer.selected === null ||
        getPracticeQuestion(session.ids[index]!)!.options.some(
          (option) => option.id === answer.selected
        )
    )
  )
    return null
  const current = getPracticeQuestion(session.ids[session.index]!)!
  if (
    session.selected &&
    !current.options.some((option) => option.id === session.selected)
  )
    return null
  const committed = session.answers[session.index]
  if (
    committed &&
    !session.complete &&
    session.mode === 'guided' &&
    (session.selected !== (committed.selected ?? '') ||
      session.assisted !== committed.assisted)
  )
    return null
  return session
}

function retain(sessions: UnifiedPracticeSession[]) {
  const unique = new Map<string, UnifiedPracticeSession>()
  for (const session of [...sessions].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  ))
    if (!unique.has(session.id)) unique.set(session.id, session)
  const entries = [...unique.values()]
  return [
    ...entries.filter((session) => !session.complete).slice(0, 20),
    ...entries.filter((session) => session.complete).slice(0, 20),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function readPracticeSessions(
  raw: string | null
): UnifiedPracticeSession[] {
  try {
    const value: unknown = JSON.parse(raw ?? '[]')
    if (!Array.isArray(value) || value.length > 200) return []
    return retain(
      value.flatMap((candidate) => {
        const session = validSession(candidate)
        return session ? [session] : []
      })
    )
  } catch {
    return []
  }
}

export function savePracticeSession(session: UnifiedPracticeSession): boolean {
  const valid = validSession(session)
  if (!valid) return false
  try {
    const previous = readPracticeSessions(
      localStorage.getItem(PRACTICE_SESSIONS_KEY)
    )
    const sessions = retain([
      valid,
      ...previous.filter((entry) => entry.id !== valid.id),
    ])
    localStorage.setItem(PRACTICE_SESSIONS_KEY, JSON.stringify(sessions))
    window.dispatchEvent(new Event('rapidrounds-progress'))
    return true
  } catch {
    return false
  }
}

export function practiceOptionSeed(sessionId: string, index: number) {
  let seed = index
  for (const character of sessionId)
    seed = Math.imul(seed ^ character.charCodeAt(0), 16777619)
  return seed >>> 0
}

export function practiceAttemptRecord(
  session: UnifiedPracticeSession,
  source: 'tracked' | 'saved' = 'tracked'
): AttemptRecord {
  const outcomes = session.answers.map((answer, index) => ({
    correct:
      answer.selected !== null &&
      matchesAnswer(getPracticeQuestion(session.ids[index]!)!, [
        answer.selected,
      ]),
    skipped: answer.selected === null,
    assisted: answer.assisted,
  }))
  const result = summarizePractice(outcomes)
  const levels = new Set(
    session.ids.map((id) => getPracticeQuestion(id)!.level)
  )
  const level = levels.size === 1 ? [...levels][0]! : 'mixed'
  const skills = new Map<
    PillarId,
    { skill: PillarId; correct: number; answered: number }
  >()
  session.answers.forEach((answer, index) => {
    const question = getPracticeQuestion(session.ids[index]!)!
    if (!question.skill || answer.selected === null) return
    const skill = skills.get(question.skill) ?? {
      skill: question.skill,
      correct: 0,
      answered: 0,
    }
    skill.answered += 1
    if (outcomes[index]!.correct) skill.correct += 1
    skills.set(question.skill, skill)
  })
  return {
    id: session.id,
    kind: 'practice',
    contentId: session.collectionId,
    title: session.title,
    revision: session.revision,
    level,
    mode: session.mode,
    variant: '',
    correct: result.correct,
    answered: result.answered,
    skipped: result.unanswered,
    assisted: result.assisted,
    completedAt: source === 'tracked' ? session.updatedAt : null,
    source,
    href: `/practice?session=${session.id}`,
    skills: [...skills.values()],
  }
}

export function createPracticeSession({
  mode,
  collectionId = 'all',
  level = 'all',
  count,
  id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
  now = new Date().toISOString(),
}: {
  mode: 'guided' | 'check'
  collectionId?: string
  level?: PracticeLevel | 'all'
  count: 5 | 10
  id?: string
  now?: string
}): UnifiedPracticeSession | null {
  const pool = practicePool(collectionId, level)
  if (pool.length < count) return null
  let seed = practiceOptionSeed(id, count)
  const shuffled = [...pool]
  for (let index = shuffled.length - 1; index > 0; index--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const target = seed % (index + 1)
    ;[shuffled[index], shuffled[target]] = [shuffled[target]!, shuffled[index]!]
  }
  return validSession({
    id,
    revision: PRACTICE_LIBRARY_REVISION,
    mode,
    collectionId,
    title:
      collectionId === 'all'
        ? 'All topics'
        : (findPracticeCollection(collectionId)?.title ?? ''),
    level,
    ids: shuffled.slice(0, count).map((question) => question.id),
    index: 0,
    answers: [],
    selected: '',
    assisted: false,
    complete: false,
    startedAt: now,
    updatedAt: now,
  })
}
