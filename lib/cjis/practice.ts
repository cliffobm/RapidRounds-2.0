import { adaptLegacyBank } from '@/cjis/legacy-qbank-adapter.mjs'
import { BANKS, type BankKey } from '@/qbank/banks'

export type LegacyDraft = {
  id: string
  case_family_id: string
  stem: string
  options: Array<{ id: string; text: string }>
  correct_option_id: string
  primary_competency: null
  review_status: 'draft'
  legacy: { bank_id: string; source: unknown }
  rationale: { legacy_text: unknown }
}
export type PracticeResponse = {
  item_id: string
  item_version: string
  case_family_id: string
  selected_option_id: string | null
  outcome: 'correct' | 'incorrect' | 'nonresponse'
  first_attempt: boolean
  hints_used: number
  definitions_used: number
  elapsed_ms: number
  evidence_class: 'legacy_practice'
  competency_eligible: false
}

export function loadLegacyPractice(bankKey: BankKey): { version: string; items: LegacyDraft[] } {
  const bank = BANKS[bankKey]
  if (!bank) throw new Error('Unknown question bank')
  return { version: String(bank.version), items: adaptLegacyBank(bank) as LegacyDraft[] }
}

export function recordPracticeResponse(item: LegacyDraft, version: string, selected: string | null,
  elapsedMs: number, previous: PracticeResponse[] = []): PracticeResponse {
  if (selected !== null && !item.options.some(option => option.id === selected)) throw new Error('Unknown option')
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) throw new Error('Invalid elapsed time')
  return {
    item_id: item.id,
    item_version: version,
    case_family_id: item.case_family_id,
    selected_option_id: selected,
    outcome: selected === null ? 'nonresponse' : selected === item.correct_option_id ? 'correct' : 'incorrect',
    first_attempt: !previous.some(response => response.item_id === item.id && response.case_family_id === item.case_family_id),
    hints_used: 0,
    definitions_used: 0,
    elapsed_ms: Math.round(elapsedMs),
    evidence_class: 'legacy_practice',
    competency_eligible: false,
  }
}
