import { z } from 'zod'
import { pillars } from './pillars'

export const historyKey = 'rapidrounds-attempt-history-v1'
export const progressEvent = 'rapidrounds-progress'
const kinds = [
  'study',
  'practice',
  'guided-case',
  'evolving-case',
  'legacy-practice',
  'quick-check',
] as const
const levels = [
  'foundation',
  'challenge',
  'advanced',
  'mixed',
  'unclassified',
] as const
export function isLearningHref(value: string) {
  if (!value.startsWith('/') || value.startsWith('//')) return false
  try {
    const url = new URL(value, 'https://rapidrounds.local')
    return (
      url.origin === 'https://rapidrounds.local' &&
      /^\/(practice|quick-check|quiz|study|study\/topics\/(medications-safety|renal-metabolic|assessment-safety|person-centered-genetics)|pathway\/transfer|rr\/(sepsis|tavr|chest-pain|neuro-change|respiratory-change|fluid-loss)|evolving\/(fever-neuro|pancreas-balance|skin-systemic|leg-to-lung|abdomen-turn|nutrition-context|medication-shift|kidney-trend))$/.test(
        url.pathname
      ) &&
      value.length <= 500
    )
  } catch {
    return false
  }
}
const count = z.number().int().min(0).max(100)
const recordSchema = z
  .object({
    id: z.string().min(1).max(240),
    kind: z.enum(kinds),
    contentId: z.string().min(1).max(150),
    title: z.string().min(1).max(180),
    revision: z.string().min(1).max(150),
    level: z.enum(levels),
    mode: z.enum(['guided', 'check', 'case']),
    variant: z.string().max(150),
    correct: count,
    answered: count,
    skipped: count,
    assisted: count,
    completedAt: z.string().datetime().nullable(),
    source: z.enum(['tracked', 'saved']),
    href: z.string().refine(isLearningHref),
    skills: z
      .array(
        z.object({
          skill: z
            .string()
            .refine((value) => pillars.some((pillar) => pillar.id === value))
            .transform((value) => value as (typeof pillars)[number]['id']),
          correct: count,
          answered: count,
        })
      )
      .max(6),
  })
  .refine(
    (record) =>
      record.correct <= record.answered &&
      record.assisted <= record.answered &&
      record.answered + record.skipped <= 100 &&
      record.answered + record.skipped > 0 &&
      (record.source === 'saved'
        ? record.completedAt === null
        : record.completedAt !== null) &&
      record.skills.every((skill) => skill.correct <= skill.answered) &&
      new Set(record.skills.map((skill) => skill.skill)).size ===
        record.skills.length
  )
export type AttemptRecord = z.infer<typeof recordSchema>
export function readAttempts(raw: string | null): AttemptRecord[] {
  try {
    const values: unknown = JSON.parse(raw ?? '[]')
    if (!Array.isArray(values) || values.length > 500) return []
    const seen = new Set<string>()
    return values
      .flatMap((value) => {
        const parsed = recordSchema.safeParse(value)
        if (!parsed.success || seen.has(parsed.data.id)) return []
        seen.add(parsed.data.id)
        return [parsed.data]
      })
      .slice(-200)
  } catch {
    return []
  }
}
export function recordAttempt(record: AttemptRecord): boolean {
  const parsed = recordSchema.safeParse(record)
  if (!parsed.success) return false
  try {
    const existing = readAttempts(localStorage.getItem(historyKey))
    if (existing.some((item) => item.id === parsed.data.id)) return true
    localStorage.setItem(
      historyKey,
      JSON.stringify([...existing, parsed.data].slice(-200))
    )
    window.dispatchEvent(new Event(progressEvent))
    return true
  } catch {
    return false
  }
}
export function newAttemptId(prefix: string) {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return `${prefix}:${id}`
}
