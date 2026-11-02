import { z } from 'zod'
import { contentSources, type SourceId } from '@/lib/learning/sources'
import { pillars, type PillarId } from '@/lib/learning/pillars'

export type ReasoningLevelV2 = 'foundation' | 'challenge' | 'advanced'
export type DistractorErrorV2 =
  | 'misprioritization'
  | 'cue_misinterpretation'
  | 'premature_closure'
  | 'outdated_data'
export type ClinicalDomainV2 =
  | 'cardiovascular'
  | 'respiratory'
  | 'neurologic'
  | 'renal'
  | 'endocrine_metabolic'
  | 'sepsis_infectious'
  | 'multisystem'
  | 'pharmacology'
  | 'fundamentals'
  | 'person_centered'
export type ChoiceDraftV2 = {
  text: string
  explanation: string
  /** Required for incorrect choices: why a learner could reasonably choose it. */
  plausible?: string
  /** Intended author trap, never a diagnosis of the learner. */
  error?: DistractorErrorV2
  /** Zero-based indices into this draft's decision-relevant cues. */
  cues: number[]
}
/** Compact authoring input. The canonical exporter produces the versioned JSON contract. */
export type QuestionDraftV2 = {
  id: string
  collectionId: string
  topic: string
  domain: ClinicalDomainV2
  level: ReasoningLevelV2
  /** Editorial skill tag independent of the reasoning level; not a competence claim. */
  primaryCompetency?: PillarId
  setting: string
  scenario: string
  cues: string[]
  question: string
  options: [ChoiceDraftV2, ChoiceDraftV2, ChoiceDraftV2, ChoiceDraftV2]
  correct: 0 | 1 | 2 | 3
  /** Explicit reasoning operations; Advanced needs at least two linked steps. */
  reasoning: string[]
  /** Advanced: identify the competing or contradictory evidence. */
  conflict?: string
  /** Advanced: a specific complication, reassessment endpoint or next contingency. */
  anticipation?: string
  /** Advanced: what the information does not establish. */
  uncertainty?: string
  debrief: string
  sources: SourceId[]
  referenceUrls?: string[]
  cueLoad?: 'sparse' | 'moderate' | 'layered'
  distractorDemand?: 'plausible' | 'inference' | 'multistep'
}

export const QUESTION_V2_REVISION = '2026-11-02.1'
export const EDITORIAL_RUBRIC_V2 = {
  version: 'editorial-2.0',
  reasoning: { foundation: 15, challenge: 40, advanced: 65 },
  cues: { sparse: 5, moderate: 15, layered: 25 },
  distractors: { plausible: 10, inference: 25, multistep: 40 },
  bands: { foundation: [30, 60], challenge: [60, 100], advanced: [100, 131] },
} as const
export function editorialLoadScore(
  level: ReasoningLevelV2,
  cueLoad: keyof typeof EDITORIAL_RUBRIC_V2.cues,
  distractorDemand: keyof typeof EDITORIAL_RUBRIC_V2.distractors
) {
  // Integer hundredths prevent floating-point boundary errors. This is an
  // unvalidated authoring convention, never a learner or psychometric score.
  return (
    (EDITORIAL_RUBRIC_V2.reasoning[level] +
      EDITORIAL_RUBRIC_V2.cues[cueLoad] +
      EDITORIAL_RUBRIC_V2.distractors[distractorDemand]) /
    100
  )
}

const optionIds = ['A', 'B', 'C', 'D'] as const
const optionId = z.enum(optionIds)
const text = z.string().trim().min(8).max(6000)
const cueId = z.string().regex(/^C[1-7]$/)
const optionTexts = z.object({ A: text, B: text, C: text, D: text }).strict()
export const questionV2Schema = z
  .object({
    schema_version: z.literal('2.0'),
    id: z.string().regex(/^v2-[a-z0-9-]+$/),
    revision: z.string().min(1).max(80),
    collection_id: z.string().min(1).max(100),
    topic: text,
    clinical_domain: z.enum([
      'cardiovascular',
      'respiratory',
      'neurologic',
      'renal',
      'endocrine_metabolic',
      'sepsis_infectious',
      'multisystem',
      'pharmacology',
      'fundamentals',
      'person_centered',
    ]),
    reasoning_level: z.enum(['foundation', 'challenge', 'advanced']),
    primary_competency: z
      .enum(pillars.map((p) => p.id) as [PillarId, ...PillarId[]])
      .optional(),
    difficulty_score: z.number().min(0.3).max(1.3),
    difficulty_kind: z.literal('editorial_load_not_calibrated'),
    learner_context: z.object({ setting: text, audience: text }).strict(),
    scenario: text,
    key_cues: z.array(text).min(2).max(7),
    question: text,
    options: optionTexts,
    correct_answer: optionId,
    rationale: text,
    distractor_analysis: optionTexts,
    debrief: text,
    reasoning_evidence: z
      .object({
        cue_load: z.enum(['sparse', 'moderate', 'layered']),
        distractor_demand: z.enum(['plausible', 'inference', 'multistep']),
        operations: z.array(text).min(1).max(8),
        decisive_cue_ids: z.array(cueId).min(1).max(7),
        single_best_justification: text,
        conflicting_evidence: text.optional(),
        anticipation: text.optional(),
        uncertainty: text.optional(),
      })
      .strict(),
    distractor_evidence: z
      .array(
        z
          .object({
            option_id: optionId,
            intended_error: z.enum([
              'misprioritization',
              'cue_misinterpretation',
              'premature_closure',
              'outdated_data',
            ]),
            why_plausible: text,
            why_not_best: text,
            cue_ids: z.array(cueId).min(1).max(7),
          })
          .strict()
      )
      .length(3),
    references: z.array(z.string().url().startsWith('https://')).min(1).max(12),
    review_status: z.enum(['draft', 'clinical_review', 'approved']),
    clinical_review: z
      .object({
        reviewer_id: text,
        reviewed_at: z.string().datetime(),
        approved_revision: z.string().min(1),
      })
      .strict()
      .nullable(),
    calibration_status: z.literal('uncalibrated'),
  })
  .strict()
export type QuestionV2 = z.infer<typeof questionV2Schema>
export type QuestionAuditV2 = {
  id: string
  errors: string[]
  flags: string[]
  requiresClinicalReview: boolean
}

function normalized(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}
function wordCount(value: string) {
  return value.trim().split(/\s+/).length
}

export function auditQuestionV2(value: unknown): QuestionAuditV2 {
  const parsed = questionV2Schema.safeParse(value)
  if (!parsed.success)
    return {
      id:
        typeof value === 'object' && value !== null && 'id' in value
          ? String(value.id)
          : 'unknown',
      errors: parsed.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`
      ),
      flags: [],
      requiresClinicalReview: true,
    }
  const q = parsed.data
  const errors: string[] = [],
    flags: string[] = []
  const unique = (values: string[]) => new Set(values).size === values.length
  const validCues = new Set(q.key_cues.map((_, i) => `C${i + 1}`))
  const cueLinks = [
    q.reasoning_evidence.decisive_cue_ids,
    ...q.distractor_evidence.map((d) => d.cue_ids),
  ]
  if (
    cueLinks.some((ids) => !unique(ids) || ids.some((id) => !validCues.has(id)))
  )
    errors.push(
      'Cue references must be unique and name existing C1…Cn cue positions.'
    )
  if (!unique(Object.values(q.options).map(normalized)))
    errors.push(
      'Answer choices must be distinct after normalizing punctuation and case.'
    )
  if (!unique(q.key_cues.map(normalized)))
    errors.push(
      'Decision cues must be distinct; repeated wording cannot inflate cue count.'
    )
  const wrongIds = optionIds.filter((id) => id !== q.correct_answer)
  if (
    !unique(q.distractor_evidence.map((d) => d.option_id)) ||
    wrongIds.some(
      (id) => !q.distractor_evidence.some((d) => d.option_id === id)
    )
  )
    errors.push(
      'Exactly one evidence record is required for each incorrect option, with none for the keyed option.'
    )
  if (
    q.distractor_evidence.some(
      (d) => d.why_not_best !== q.distractor_analysis[d.option_id]
    )
  )
    errors.push(
      'Distractor analysis and evidence must contain the same option-specific rationale.'
    )
  if (
    q.rationale !== q.distractor_analysis[q.correct_answer] ||
    q.rationale !== q.reasoning_evidence.single_best_justification
  )
    errors.push(
      'The keyed explanation and one-best-answer justification must agree.'
    )
  const cueCounts = {
    foundation: [2, 3],
    challenge: [3, 5],
    advanced: [5, 7],
  } as const
  const [minCues, maxCues] = cueCounts[q.reasoning_level]
  if (q.key_cues.length < minCues || q.key_cues.length > maxCues)
    errors.push(
      `${q.reasoning_level} requires ${minCues}–${maxCues} decision-relevant cue units.`
    )
  const sentences = q.scenario.match(/[.!?](?:\s|$)/g)?.length ?? 0
  if (sentences < 4 || sentences > 6)
    errors.push(
      'The scenario must have 4–6 sentences; sentence length does not establish clinical reasoning quality.'
    )
  if (
    /scripted teaching|prediction of treatment response|guided story.s next stage/i.test(
      q.scenario
    )
  )
    errors.push(
      'Simulation disclaimers belong in case information, not in the clinical scenario.'
    )
  const score = editorialLoadScore(
    q.reasoning_level,
    q.reasoning_evidence.cue_load,
    q.reasoning_evidence.distractor_demand
  )
  if (Math.abs(q.difficulty_score - score) > 1e-9)
    errors.push(
      'difficulty_score does not match its declared editorial components.'
    )
  const [lower, upper] = EDITORIAL_RUBRIC_V2.bands[q.reasoning_level]
  if (Math.round(score * 100) < lower || Math.round(score * 100) >= upper)
    flags.push(
      'Editorial score falls outside the declared level band; review the profile without automatically reducing clinical complexity.'
    )
  if (
    q.reasoning_level !== 'foundation' &&
    q.reasoning_evidence.operations.length < 2
  )
    errors.push(
      'Challenge and Advanced require explicit cue integration plus a subsequent reasoning operation.'
    )
  if (
    q.reasoning_level !== 'foundation' &&
    q.reasoning_evidence.decisive_cue_ids.length < 2
  )
    errors.push(
      'Challenge and Advanced must identify at least two decisive cues for integration.'
    )
  if (
    q.reasoning_level === 'advanced' &&
    (!q.reasoning_evidence.conflicting_evidence ||
      !q.reasoning_evidence.anticipation ||
      !q.reasoning_evidence.uncertainty)
  )
    errors.push(
      'Advanced requires competing evidence, an anticipated endpoint/contingency and an explicit limit to certainty.'
    )
  if (
    q.review_status === 'approved' &&
    (!q.clinical_review || q.clinical_review.approved_revision !== q.revision)
  )
    errors.push(
      'Clinical approval must identify a reviewer, date and this exact revision.'
    )
  const lengths = Object.values(q.options).map(wordCount)
  const keyedLength = wordCount(q.options[q.correct_answer])
  const otherLengths = wrongIds.map((id) => wordCount(q.options[id]))
  if (
    keyedLength > Math.max(...otherLengths) * 1.35 ||
    Math.max(...lengths) > Math.min(...lengths) * 2.5
  )
    flags.push(
      'Option lengths may cue the answer; review parallel scope and wording.'
    )
  if (
    Object.values(q.options).some((o) =>
      /\b(always|never|only|obviously|definitely)\b/i.test(o)
    )
  )
    flags.push(
      'Review absolutes or certainty wording for a linguistic giveaway or a justified clinical exception.'
    )
  if (
    Object.values(q.options).some((o) =>
      /all of the above|none of the above/i.test(o)
    )
  )
    errors.push(
      'Use four independently assessable clinical alternatives, not all/none-of-the-above options.'
    )
  if (
    Object.values(q.distractor_analysis).some((r) =>
      /compare.*correct answer|this.*incorrect|not the best answer\.?$/i.test(r)
    )
  )
    flags.push(
      'A rationale may be generic rather than explaining the decisive clinical distinction.'
    )
  if (
    q.reasoning_level === 'advanced' &&
    new Set(q.distractor_evidence.map((d) => d.intended_error)).size < 2
  )
    flags.push(
      'Advanced distractors use one intended error category; review whether competing reasoning paths are represented.'
    )
  if (
    q.distractor_evidence.some(
      (d) => normalized(d.why_plausible) === normalized(d.why_not_best)
    )
  )
    flags.push(
      'A distractor repeats its rejection as its plausibility explanation; review the competing reasoning path.'
    )
  return {
    id: q.id,
    errors,
    flags,
    requiresClinicalReview:
      errors.length > 0 ||
      q.review_status !== 'approved' ||
      !q.clinical_review ||
      q.clinical_review.approved_revision !== q.revision,
  }
}

export function compileQuestionV2(draft: QuestionDraftV2): QuestionV2 {
  const profile = {
    foundation: ['sparse', 'plausible'],
    challenge: ['moderate', 'inference'],
    advanced: ['layered', 'multistep'],
  } as const
  const cueLoad = draft.cueLoad ?? profile[draft.level][0]
  const demand = draft.distractorDemand ?? profile[draft.level][1]
  const options = Object.fromEntries(
    draft.options.map((o, i) => [optionIds[i], o.text])
  ) as QuestionV2['options']
  const analysis = Object.fromEntries(
    draft.options.map((o, i) => [optionIds[i], o.explanation])
  ) as QuestionV2['distractor_analysis']
  const refs = [
    ...new Set([
      ...draft.sources.map((id) => contentSources[id].url),
      ...(draft.referenceUrls ?? []),
    ]),
  ]
  const q: QuestionV2 = {
    schema_version: '2.0',
    id: draft.id,
    revision: QUESTION_V2_REVISION,
    collection_id: draft.collectionId,
    topic: draft.topic,
    clinical_domain: draft.domain,
    reasoning_level: draft.level,
    ...(draft.primaryCompetency
      ? { primary_competency: draft.primaryCompetency }
      : {}),
    difficulty_score: editorialLoadScore(draft.level, cueLoad, demand),
    difficulty_kind: 'editorial_load_not_calibrated',
    learner_context: {
      setting: draft.setting,
      audience: 'Nursing learners practising formative clinical judgment',
    },
    scenario: draft.scenario,
    key_cues: draft.cues,
    question: draft.question,
    options,
    correct_answer: optionIds[draft.correct],
    rationale: draft.options[draft.correct].explanation,
    distractor_analysis: analysis,
    debrief: draft.debrief,
    reasoning_evidence: {
      cue_load: cueLoad,
      distractor_demand: demand,
      operations: draft.reasoning,
      decisive_cue_ids: draft.options[draft.correct].cues.map(
        (i) => `C${i + 1}`
      ),
      single_best_justification: draft.options[draft.correct].explanation,
      ...(draft.conflict ? { conflicting_evidence: draft.conflict } : {}),
      ...(draft.anticipation ? { anticipation: draft.anticipation } : {}),
      ...(draft.uncertainty ? { uncertainty: draft.uncertainty } : {}),
    },
    distractor_evidence: draft.options.flatMap((o, i) =>
      i === draft.correct
        ? []
        : [
            {
              option_id: optionIds[i]!,
              intended_error: o.error!,
              why_plausible: o.plausible!,
              why_not_best: o.explanation,
              cue_ids: o.cues.map((c) => `C${c + 1}`),
            },
          ]
    ),
    references: refs,
    review_status: 'draft',
    clinical_review: null,
    calibration_status: 'uncalibrated',
  }
  const audit = auditQuestionV2(q)
  if (audit.errors.length)
    throw new Error(`${draft.id}: ${audit.errors.join(' | ')}`)
  return q
}
