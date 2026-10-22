import { z } from 'zod'
import { contentRevision, readSession } from './sessions'
import { type GuidedCase } from './cases'
import { type BankKey } from '@/qbank/banks'
import { loadPractice, recordPracticeResponse } from '@/lib/cjis/practice'
import { evolvingRevision } from './evolving-types'
import { reasoningQuestions } from './evolving-content'
import { caseRevision } from './case-coaching'

export const guidedSessionSchema = z
  .object({
    index: z.number().int().min(0).max(5),
    answer: z.number().int().min(0).max(2).nullable(),
    responses: z.array(z.boolean()).max(6),
    complete: z.boolean(),
    attemptId: z.string().max(150).optional(),
    startedAt: z.string().datetime().optional(),
  })
  .refine(
    (value) =>
      value.responses.length === value.index + Number(value.answer !== null) &&
      (!value.complete || (value.index === 5 && value.answer !== null))
  )
export type GuidedSession = z.infer<typeof guidedSessionSchema>
export function readGuidedSession(raw: string | null, story: GuidedCase) {
  return readSession(raw, story.revision ?? caseRevision, guidedSessionSchema)
}
const responseSchema = z.object({
  item_id: z.string(),
  item_version: z.string(),
  case_family_id: z.string(),
  selected_option_id: z.string().nullable(),
  outcome: z.enum(['correct', 'incorrect', 'nonresponse']),
  first_attempt: z.boolean(),
  hints_used: z.number().int().min(0).max(0),
  definitions_used: z.number().int().nonnegative(),
  elapsed_ms: z.number().int().nonnegative(),
  evidence_class: z.enum(['legacy_practice', 'authored_draft_practice']),
  competency_eligible: z.literal(false),
})
export function legacyPracticeSchema(bankKey: BankKey) {
  const bank = loadPractice(bankKey)
  return z
    .object({
      index: z.number().int().min(0).max(4),
      responses: z.array(responseSchema).max(5),
      finished: z.boolean(),
      roundNumber: z.number().int().nonnegative(),
      definitionUses: z.number().int().nonnegative(),
      attemptId: z.string().max(150).optional(),
      startedAt: z.string().datetime().optional(),
    })
    .refine((value) => {
      const items = bank.items.slice(
        value.roundNumber * 5,
        value.roundNumber * 5 + 5
      )
      return (
        value.index < items.length &&
        value.responses.length >= value.index &&
        value.responses.length <= value.index + 1 &&
        (!value.finished ||
          (value.index === items.length - 1 &&
            value.responses.length === items.length)) &&
        value.responses.every((response, position) => {
          try {
            return (
              JSON.stringify(response) ===
              JSON.stringify(
                recordPracticeResponse(
                  items[position]!,
                  bank.version,
                  response.selected_option_id,
                  response.elapsed_ms,
                  [],
                  response.definitions_used
                )
              )
            )
          } catch {
            return false
          }
        })
      )
    })
}
export type LegacyPracticeSession = z.infer<
  ReturnType<typeof legacyPracticeSchema>
>
export function readLegacyPracticeSession(
  raw: string | null,
  bankKey: BankKey
) {
  return readSession(
    raw,
    contentRevision(loadPractice(bankKey)),
    legacyPracticeSchema(bankKey)
  )
}
export const quickSessionSchema = z.object({
  revision: z.literal(evolvingRevision),
  ids: z.array(z.string()).min(5).max(10),
  index: z.number().int().min(0).max(9),
  answers: z.array(z.string()).max(10),
  selected: z.string(),
  complete: z.boolean(),
  attempt: z.number().int().nonnegative(),
  completedAt: z.string().datetime().optional(),
})
export type QuickSession = z.infer<typeof quickSessionSchema>
export function readQuickSession(raw: string | null): QuickSession | null {
  try {
    const parsed = quickSessionSchema.safeParse(JSON.parse(raw ?? 'null'))
    if (!parsed.success) return null
    const s = parsed.data
    return s.index < s.ids.length &&
      s.answers.length === s.index + Number(s.complete) &&
      (!s.complete || s.index === s.ids.length - 1) &&
      new Set(s.ids).size === s.ids.length &&
      s.ids.every((id) =>
        reasoningQuestions.some((question) => question.id === id)
      ) &&
      s.answers.every((id, index) =>
        reasoningQuestions
          .find((question) => question.id === s.ids[index])!
          .options.some((option) => option.id === id)
      ) &&
      (!s.selected ||
        reasoningQuestions
          .find((question) => question.id === s.ids[s.index])!
          .options.some((option) => option.id === s.selected))
      ? s
      : null
  } catch {
    return null
  }
}
