import { adaptLegacyBank } from '@/cjis/legacy-qbank-adapter.mjs'
import { BANKS, type BankKey } from '@/qbank/banks'
import { authoredQuestions } from '@/lib/learning/authored-questions'
import type { PillarId } from '@/lib/learning/pillars'
import type { SourceId } from '@/lib/learning/sources'

export type PracticeItem = {
  id: string
  case_family_id: string
  stem: string
  prompt: string
  options: { id: string; text: string }[]
  correct_option_id: string
  origin: 'legacy' | 'authored'
  rationaleText: string
  primaryCompetency: PillarId | null
  explanations?: string[]
  reflection?: string
  sources: SourceId[]
}
export function loadPractice(bankKey: BankKey): {
  version: string
  items: PracticeItem[]
} {
  const original = loadLegacyPractice(bankKey)
  const legacy: PracticeItem[] = original.items.map((item) => {
    const source = item.legacy.source as {
      question?: string
      stem?: string | null
    }
    return {
      id: item.id,
      case_family_id: item.case_family_id,
      stem: source.stem ?? '',
      prompt: source.question ?? item.stem,
      options: item.options,
      correct_option_id: item.correct_option_id,
      origin: 'legacy',
      rationaleText:
        typeof item.rationale.legacy_text === 'string'
          ? item.rationale.legacy_text
          : 'Rationale pending content review.',
      primaryCompetency: null,
      sources: [],
    }
  })
  const added: PracticeItem[] = authoredQuestions
    .filter((item) => item.bankKey === bankKey)
    .map((item) => ({
      id: item.id,
      case_family_id: item.id,
      stem: item.context,
      prompt: item.prompt,
      options: item.options,
      correct_option_id: item.correctId,
      origin: 'authored',
      rationaleText:
        item.explanations[
          item.options.findIndex((option) => option.id === item.correctId)
        ]!,
      primaryCompetency: item.primaryCompetency,
      explanations: item.explanations,
      reflection: item.reflection,
      sources: item.sources,
    }))
  return {
    version: `${original.version}:expanded-1`,
    items: [...legacy, ...added],
  }
}

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
  evidence_class: 'legacy_practice' | 'authored_draft_practice'
  competency_eligible: false
}

export function loadLegacyPractice(bankKey: BankKey): {
  version: string
  items: LegacyDraft[]
} {
  const bank = BANKS[bankKey]
  if (!bank) throw new Error('Unknown question bank')
  return {
    version: String(bank.version),
    items: adaptLegacyBank(bank) as LegacyDraft[],
  }
}

export function recordPracticeResponse(
  item: Pick<
    LegacyDraft,
    'id' | 'case_family_id' | 'options' | 'correct_option_id'
  > & { origin?: 'legacy' | 'authored' },
  version: string,
  selected: string | null,
  elapsedMs: number,
  previous: PracticeResponse[] = [],
  definitionsUsed = 0
): PracticeResponse {
  if (!Number.isInteger(definitionsUsed) || definitionsUsed < 0)
    throw new Error('Invalid definition-use count')
  if (
    selected !== null &&
    !item.options.some((option) => option.id === selected)
  )
    throw new Error('Unknown option')
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0)
    throw new Error('Invalid elapsed time')
  return {
    item_id: item.id,
    item_version: version,
    case_family_id: item.case_family_id,
    selected_option_id: selected,
    outcome:
      selected === null
        ? 'nonresponse'
        : selected === item.correct_option_id
          ? 'correct'
          : 'incorrect',
    first_attempt: !previous.some(
      (response) =>
        response.item_id === item.id &&
        response.case_family_id === item.case_family_id
    ),
    hints_used: 0,
    definitions_used: definitionsUsed,
    elapsed_ms: Math.round(elapsedMs),
    evidence_class:
      item.origin === 'authored'
        ? 'authored_draft_practice'
        : 'legacy_practice',
    competency_eligible: false,
  }
}
