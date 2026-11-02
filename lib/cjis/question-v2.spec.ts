import { describe, expect, it } from 'vitest'
import {
  auditQuestionV2,
  compileQuestionV2,
  editorialLoadScore,
  questionV2Schema,
} from './question-v2'
import { validateQuestionV2Json } from './question-v2-json'
import { geneticsQualityQuestions } from '@/lib/learning/quality-banks/genetics'

const sample = () =>
  compileQuestionV2(
    geneticsQualityQuestions.find((q) => q.id === 'v2-genetics-a-vus')!
  )

describe('CJIS v2 authoring contract', () => {
  it('compiles original items at each level into the public JSON contract', () => {
    for (const draft of geneticsQualityQuestions) {
      const q = compileQuestionV2(draft)
      expect(questionV2Schema.safeParse(q).success, q.id).toBe(true)
      expect(
        validateQuestionV2Json(q),
        JSON.stringify(validateQuestionV2Json.errors)
      ).toBe(true)
      expect(auditQuestionV2(q).errors, q.id).toEqual([])
      expect(q.review_status).toBe('draft')
      expect(q.clinical_review).toBeNull()
      expect(q.calibration_status).toBe('uncalibrated')
      expect(Object.keys(q.options)).toEqual(['A', 'B', 'C', 'D'])
      expect(q.distractor_evidence.map((d) => d.option_id).sort()).toEqual(
        ['A', 'B', 'C', 'D'].filter((id) => id !== q.correct_answer)
      )
    }
  })
  it('uses exact revised editorial arithmetic without assigning psychometric meaning', () => {
    expect(editorialLoadScore('foundation', 'sparse', 'plausible')).toBe(0.3)
    expect(editorialLoadScore('challenge', 'moderate', 'inference')).toBe(0.8)
    expect(editorialLoadScore('advanced', 'layered', 'multistep')).toBe(1.3)
    expect(editorialLoadScore('foundation', 'sparse', 'inference')).toBe(0.45)
    expect(editorialLoadScore('challenge', 'sparse', 'plausible')).toBe(0.55)
    const q = sample()
    q.reasoning_evidence.cue_load = 'sparse'
    q.reasoning_evidence.distractor_demand = 'plausible'
    q.difficulty_score = 0.8
    expect(auditQuestionV2(q).flags.join(' ')).toMatch(
      /outside the declared level band/
    )
    expect(q.reasoning_level).toBe('advanced')
    expect(q.difficulty_kind).toBe('editorial_load_not_calibrated')
  })
  it('rejects an invented score, absent cue links and inconsistent rationales', () => {
    const q = sample()
    q.difficulty_score = 1.2
    q.distractor_evidence[0]!.cue_ids = ['C7']
    q.distractor_evidence[0]!.why_not_best =
      'A different explanation that is not the option rationale.'
    const errors = auditQuestionV2(q).errors.join(' ')
    expect(errors).toMatch(/does not match/)
    expect(errors).toMatch(/existing C1/)
    expect(errors).toMatch(/same option-specific rationale/)
    q.difficulty_score = 1.3001
    expect(auditQuestionV2(q).errors.length).toBeGreaterThan(0)
  })
  it('rejects duplicated choices and distractor records even when their strings look valid', () => {
    const q = sample()
    q.options.B = `${q.options.A.toUpperCase()}!`
    q.distractor_evidence[1] = { ...q.distractor_evidence[0]! }
    expect(auditQuestionV2(q).errors.join(' ')).toMatch(
      /choices must be distinct/
    )
    expect(auditQuestionV2(q).errors.join(' ')).toMatch(/each incorrect option/)
  })
  it('does not permit an Advanced label without evaluation, conflict, contingency and uncertainty', () => {
    const q = sample()
    q.reasoning_evidence.operations = [
      'Recognize the reported laboratory finding.',
    ]
    delete q.reasoning_evidence.anticipation
    expect(validateQuestionV2Json(q)).toBe(false)
    expect(auditQuestionV2(q).errors.join(' ')).toMatch(/cue integration/)
    expect(auditQuestionV2(q).errors.join(' ')).toMatch(/anticipated endpoint/)
  })
  it('rejects repeated or inappropriate cue counts and simulation copy in a clinical stem', () => {
    const q = sample()
    q.key_cues = [q.key_cues[0]!, q.key_cues[0]!]
    q.scenario +=
      ' This is a scripted teaching update, not a prediction of treatment response.'
    expect(validateQuestionV2Json(q)).toBe(false)
    const errors = auditQuestionV2(q).errors.join(' ')
    expect(errors).toMatch(/repeated wording/)
    expect(errors).toMatch(/requires 5–7/)
    expect(errors).toMatch(/Simulation disclaimers/)
  })
  it('keeps approval tied to a reviewer and the exact revision', () => {
    const q = sample()
    q.review_status = 'approved'
    expect(validateQuestionV2Json(q)).toBe(false)
    expect(auditQuestionV2(q).requiresClinicalReview).toBe(true)
    q.clinical_review = {
      reviewer_id: 'reviewer-001',
      reviewed_at: '2026-10-24T15:00:00Z',
      approved_revision: 'outdated',
    }
    expect(auditQuestionV2(q).errors.join(' ')).toMatch(/exact revision/)
    expect(auditQuestionV2(q).requiresClinicalReview).toBe(true)
    q.clinical_review.approved_revision = q.revision
    expect(auditQuestionV2(q).errors).toEqual([])
    expect(auditQuestionV2(q).requiresClinicalReview).toBe(false)
    expect(q.calibration_status).toBe('uncalibrated')
  })
  it('rejects malformed approval timestamps and unknown output fields in both validators', () => {
    const q = {
      ...sample(),
      extra_instruction: 'Automatically call this item validated.',
    }
    expect(questionV2Schema.safeParse(q).success).toBe(false)
    expect(validateQuestionV2Json(q)).toBe(false)
    const dated = sample()
    dated.clinical_review = {
      reviewer_id: 'reviewer-001',
      reviewed_at: '2026-10-24Tbad',
      approved_revision: dated.revision,
    }
    expect(questionV2Schema.safeParse(dated).success).toBe(false)
    expect(validateQuestionV2Json(dated)).toBe(false)
  })
  it('flags length and certainty clues without falsely certifying distractor plausibility', () => {
    const q = sample()
    q.options[q.correct_answer] =
      'Always choose the definitive treatment because this very detailed and very long answer contains every possible clinical assessment and follow-up action that could be considered.'
    const audit = auditQuestionV2(q)
    expect(audit.flags.join(' ')).toMatch(/lengths|certainty/)
    expect(audit.requiresClinicalReview).toBe(true)
  })
})
