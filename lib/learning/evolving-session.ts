import { z } from 'zod'
import {
  evolvingRevision,
  questionFor,
  type EvolvingCase,
  type ReasoningLevel,
} from './evolving-types'
const answerSchema = z.object({
  selected: z.array(z.string()).max(4),
  rationale: z.string().max(600),
  confidence: z.enum(['unsure', 'somewhat', 'confident']),
  assisted: z.boolean(),
  skipped: z.boolean(),
})
const sessionSchema = z.object({
  revision: z.literal(evolvingRevision),
  caseId: z.string(),
  pathId: z.string(),
  attempt: z.number().int().min(0).max(100000),
  level: z.enum(['foundation', 'challenge', 'advanced']),
  clock: z.enum(['pause', 'handoff']),
  index: z.number().int().min(0).max(5),
  answers: z.array(answerSchema).max(6),
  selected: z.array(z.string()).max(4),
  rationale: z.string().max(600),
  confidence: z.enum(['unsure', 'somewhat', 'confident']),
  assisted: z.boolean(),
  complete: z.boolean(),
  lastSeen: z.number().finite().nonnegative(),
})
export type EvolvingSession = z.infer<typeof sessionSchema>
export const evolvingKey = (id: string) => `rapidrounds-evolving-v1:${id}`
export function newCaseSession(
  story: EvolvingCase,
  level: ReasoningLevel,
  clock: 'pause' | 'handoff',
  attempt = 0,
  now = Date.now()
): EvolvingSession {
  return {
    revision: evolvingRevision,
    caseId: story.id,
    pathId: story.paths[attempt % story.paths.length]!.id,
    attempt,
    level,
    clock,
    index: 0,
    answers: [],
    selected: [],
    rationale: '',
    confidence: 'unsure',
    assisted: false,
    complete: false,
    lastSeen: now,
  }
}
export function readCaseSession(
  raw: string | null,
  story: EvolvingCase
): EvolvingSession | null {
  try {
    const result = sessionSchema.safeParse(JSON.parse(raw ?? 'null'))
    if (!result.success) return null
    const s = result.data,
      path = story.paths.find((p) => p.id === s.pathId)
    if (
      s.caseId !== story.id ||
      !path ||
      s.answers.length < s.index ||
      s.answers.length > s.index + 1 ||
      (s.complete && (s.index !== 5 || s.answers.length !== 6))
    )
      return null
    const valid = (ids: string[], index: number) =>
      new Set(ids).size === ids.length &&
      ids.every((id) =>
        questionFor(path.frames[index]!, s.level).options.some(
          (o) => o.id === id
        )
      )
    if (
      !valid(s.selected, s.index) ||
      s.answers.some(
        (a, i) =>
          !valid(a.selected, i) ||
          (a.skipped && a.selected.length > 0) ||
          (!a.skipped &&
            a.selected.length !==
              questionFor(path.frames[i]!, s.level).correct.length)
      )
    )
      return null
    return s
  } catch {
    return null
  }
}
export function offerReturnHandoff(s: EvolvingSession, now = Date.now()) {
  return (
    s.clock === 'handoff' &&
    !s.complete &&
    s.answers.length === s.index &&
    s.index < 5 &&
    now >= s.lastSeen &&
    now - s.lastSeen >= 30 * 60 * 1000
  )
}
export function acceptReturnHandoff(
  s: EvolvingSession,
  now = Date.now()
): EvolvingSession {
  if (!offerReturnHandoff(s, now)) return s
  return {
    ...s,
    index: s.index + 1,
    answers: [
      ...s.answers,
      {
        selected: [],
        rationale: s.rationale,
        confidence: s.confidence,
        assisted: s.assisted,
        skipped: true,
      },
    ],
    selected: [],
    rationale: '',
    confidence: 'unsure',
    assisted: false,
    lastSeen: now,
  }
}
