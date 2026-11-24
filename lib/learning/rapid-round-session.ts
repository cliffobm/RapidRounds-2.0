import { z } from 'zod'
import {
  getRapidRound,
  gradeRoundPrompt,
  rapidRoundRevision,
  roundSelectionReady,
  type RoundPrompt,
} from './rapid-rounds'
const answerSchema = z.object({
  selected: z.array(z.string()).max(4),
  assisted: z.boolean(),
  skipped: z.boolean(),
})
const sessionSchema = z.object({
  id: z.string().uuid(),
  roundId: z.string(),
  revision: z.string(),
  mode: z.enum(['guided', 'independent']),
  index: z.number().int().min(0).max(3),
  selected: z.array(z.string()).max(4),
  assisted: z.boolean(),
  answers: z.array(answerSchema).max(4),
  complete: z.boolean(),
  elapsedMs: z.number().int().min(0).max(86400000),
  budgetMs: z.number().int().min(60000).max(3600000).nullable(),
  exceeded: z.boolean(),
  paused: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  clueSelected: z.string().nullable(),
  clueFirst: z.string().nullable(),
  clueChecked: z.boolean(),
})
export type RapidRoundSession = z.infer<typeof sessionSchema>
export function createRoundSession(
  roundId: string,
  mode: RapidRoundSession['mode'] = 'guided',
  budgetMs: number | null = null
): RapidRoundSession {
  if (!getRapidRound(roundId)) throw new Error('Unknown round')
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    roundId,
    revision: rapidRoundRevision,
    mode,
    index: 0,
    selected: [],
    assisted: false,
    answers: [],
    complete: false,
    elapsedMs: 0,
    budgetMs,
    exceeded: false,
    paused: false,
    createdAt: now,
    updatedAt: now,
    clueSelected: null,
    clueFirst: null,
    clueChecked: false,
  }
}
export function readRoundSessions(raw: string | null): RapidRoundSession[] {
  try {
    const records: unknown = JSON.parse(raw ?? '[]')
    if (!Array.isArray(records) || records.length > 100) return []
    const seen = new Set<string>()
    return records
      .flatMap((value) => {
        const parsed = sessionSchema.safeParse(value)
        if (!parsed.success) return []
        const s = parsed.data,
          round = getRapidRound(s.roundId, s.revision)
        if (
          !round ||
          seen.has(s.id) ||
          (s.complete && s.answers.length !== 4) ||
          s.answers.length < s.index ||
          s.answers.length > s.index + 1
        )
          return []
        if (
          s.answers.some((a, i) =>
            a.skipped
              ? round.steps[i]!.skill !== null || a.selected.length !== 0
              : !roundSelectionReady(round.steps[i]!, a.selected)
          )
        )
          return []
        if (s.selected.length && !validDraft(round.steps[s.index]!, s.selected))
          return []
        if (
          [s.clueSelected, s.clueFirst].some(
            (id) => id !== null && !round.clue.options.some((o) => o.id === id)
          )
        )
          return []
        seen.add(s.id)
        return [{ ...s, paused: !s.complete }]
      })
      .slice(-30)
  } catch {
    return []
  }
}
function validDraft(item: RoundPrompt, values: string[]) {
  if (item.format === 'choice')
    return values.length === 1 && item.options.some((o) => o.id === values[0])
  return (
    values.every((v) =>
      item.rows.some((r) => v === `${r.id}:urgent` || v === `${r.id}:monitor`)
    ) &&
    item.rows.every(
      (r) => values.filter((v) => v.startsWith(`${r.id}:`)).length <= 1
    )
  )
}
export function submitRoundChoice(
  s: RapidRoundSession,
  skip = false
): RapidRoundSession {
  const round = getRapidRound(s.roundId, s.revision)
  if (!round || s.complete || s.paused || s.answers.length > s.index) return s
  const item = round.steps[s.index]!
  if (skip ? item.skill !== null : !roundSelectionReady(item, s.selected))
    return s
  const answers = [
    ...s.answers,
    {
      selected: skip ? [] : [...s.selected],
      assisted: s.assisted,
      skipped: skip,
    },
  ]
  const updated = { ...s, answers, updatedAt: new Date().toISOString() }
  if (s.mode === 'independent')
    return s.index === 3
      ? { ...updated, complete: true, paused: true }
      : { ...updated, index: s.index + 1, selected: [], assisted: false }
  return updated
}
export function nextRoundPrompt(s: RapidRoundSession): RapidRoundSession {
  if (s.complete || s.answers.length !== s.index + 1) return s
  return s.index === 3
    ? {
        ...s,
        complete: true,
        paused: true,
        updatedAt: new Date().toISOString(),
      }
    : {
        ...s,
        index: s.index + 1,
        selected: [],
        assisted: false,
        updatedAt: new Date().toISOString(),
      }
}
export function summarizeRound(s: RapidRoundSession) {
  const round = getRapidRound(s.roundId, s.revision)!
  return round.steps.map((item, i) => ({
    item,
    answer: s.answers[i],
    credit:
      s.answers[i] && !s.answers[i]!.skipped
        ? gradeRoundPrompt(item, s.answers[i]!.selected)
        : null,
  }))
}
