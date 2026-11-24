export const rapidRoundRevision = '2026-11-24.1'
export const roundCategories = {
  respiratory: { title: 'Respiratory deterioration', target: 8 },
  perfusion: { title: 'Perfusion and cardiac changes', target: 8 },
  infection: { title: 'Infection and sepsis recognition', target: 6 },
  fluids: { title: 'Fluid and electrolyte disturbances', target: 6 },
  medication: { title: 'Medication effects and safety', target: 6 },
  communication: { title: 'Communication and escalation', target: 4 },
  reassessment: { title: 'Reassessment and response to care', target: 2 },
} as const
export const roundSkills = {
  recognize: 'Recognize cues',
  analyze: 'Analyze cues',
  prioritize: 'Prioritize hypotheses',
  generate: 'Generate solutions',
  act: 'Take action',
  evaluate: 'Evaluate outcomes',
} as const
export const bloomTargets = {
  remember: 2,
  understand: 4,
  apply: 18,
  analyze: 16,
} as const
export type RoundCategory = keyof typeof roundCategories
export type RoundSkill = keyof typeof roundSkills
export type RoundBloom = keyof typeof bloomTargets
export type RoundOption = { id: string; text: string; explanation: string }
export type RoundChoice = {
  format: 'choice'
  options: RoundOption[]
  correct: string
}
export type RoundMatrix = {
  format: 'matrix'
  rows: { id: string; text: string; urgent: boolean; explanation: string }[]
}
export type RoundPrompt = {
  id: string
  category: RoundCategory
  bloom: RoundBloom
  skill: RoundSkill | null
  outcome: string
  update: string
  prompt: string
  hint: string
  brief: string
  mechanism: string
  carryForward: string
} & (RoundChoice | RoundMatrix)
export type ClueActivity = {
  prompt: string
  options: RoundOption[]
  correct: string
  takeaway: string
}
export type RapidRound = {
  id: string
  title: string
  patient: string
  handoff: string
  focus: string
  sources: { title: string; url: string }[]
  steps: RoundPrompt[]
  clue: ClueActivity
}
export function gradeRoundPrompt(item: RoundPrompt, selected: string[]) {
  if (item.format === 'choice')
    return selected.length === 1 && selected[0] === item.correct ? 1 : 0
  const correct = item.rows.filter((r) =>
    selected.includes(`${r.id}:${r.urgent ? 'urgent' : 'monitor'}`)
  ).length
  return correct / item.rows.length
}
export function roundSelectionReady(item: RoundPrompt, selected: string[]) {
  if (item.format === 'choice')
    return (
      selected.length === 1 && item.options.some((o) => o.id === selected[0])
    )
  return (
    selected.length === item.rows.length &&
    item.rows.every(
      (r) =>
        selected.filter(
          (v) => v === `${r.id}:urgent` || v === `${r.id}:monitor`
        ).length === 1
    )
  )
}
export function rotateRoundOptions<T>(options: T[], seed: string) {
  const offset =
    [...seed].reduce((n, c) => n + c.charCodeAt(0), 0) % options.length
  return [...options.slice(offset), ...options.slice(0, offset)]
}
