import { z } from 'zod'
import { contentRevision } from './sessions'
import type { StudyUnit } from './study'

const answerSchema = z
  .object({
    selected: z.number().int().nonnegative(),
    correct: z.boolean(),
  })
  .strict()
const timestamp = z.string().datetime()
const studySessionSchema = z
  .object({
    version: z.literal(1),
    unitId: z.string(),
    revision: z.string(),
    phase: z.enum(['before', 'learn', 'after', 'complete']),
    before: answerSchema.nullable(),
    after: answerSchema.nullable(),
    startedAt: timestamp,
    updatedAt: timestamp,
    completedAt: timestamp.nullable(),
  })
  .strict()

export type StudySession = z.infer<typeof studySessionSchema>
export const studySessionKey = (id: string) =>
  `rapidrounds-study-session-v1:${id}`

export function newStudySession(
  unit: StudyUnit,
  now = new Date().toISOString()
): StudySession {
  return {
    version: 1,
    unitId: unit.id,
    revision: contentRevision(unit),
    phase: 'before',
    before: null,
    after: null,
    startedAt: now,
    updatedAt: now,
    completedAt: null,
  }
}

export function readStudySession(
  raw: string | null,
  unit: StudyUnit
): StudySession | null {
  try {
    const parsed = studySessionSchema.safeParse(JSON.parse(raw ?? 'null'))
    if (!parsed.success) return null
    const session = parsed.data
    const validAnswer = (
      answer: StudySession['before'],
      checkpoint: StudyUnit['pre']
    ) =>
      answer === null ||
      (answer.selected < checkpoint.options.length &&
        answer.correct === (answer.selected === checkpoint.correct))
    if (
      session.unitId !== unit.id ||
      session.revision !== contentRevision(unit) ||
      !validAnswer(session.before, unit.pre) ||
      !validAnswer(session.after, unit.post) ||
      Date.parse(session.updatedAt) < Date.parse(session.startedAt) ||
      (session.completedAt !== null &&
        (Date.parse(session.completedAt) < Date.parse(session.startedAt) ||
          Date.parse(session.completedAt) > Date.parse(session.updatedAt))) ||
      (session.phase === 'before' && session.after !== null) ||
      (session.phase !== 'before' && session.before === null) ||
      (session.phase === 'learn' && session.after !== null) ||
      (session.phase === 'complete' &&
        (session.after === null || session.completedAt === null)) ||
      (session.phase !== 'complete' && session.completedAt !== null)
    )
      return null
    return session
  } catch {
    return null
  }
}
