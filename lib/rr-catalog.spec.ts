import { describe, expect, it } from 'vitest'
import { getPracticeCase, practiceCases } from './rr-catalog'
import { sampleScenarios } from '@/data/sampleData'
import draft from '@/cjis/preview/tavr_case_family.json'

describe('available RR practice cases', () => {
  it('resolves every listed case and preserves all five existing deep links', () => {
    expect(new Set(practiceCases.map((c) => c.code)).size).toBe(6)
    for (const code of [
      'cvd_001',
      'resp_001',
      'endo_001',
      'neuro_001',
      'skin_001',
      'tavr-conduction',
    ]) {
      const scenario = getPracticeCase(code)!
      expect(scenario.questions.length).toBeGreaterThan(0)
      for (const q of scenario.questions) {
        expect(
          q.correctAnswers!.every((answer) =>
            q.options!.some((option) => option.id === answer)
          )
        ).toBe(true)
        expect(q.points).toBe(0)
      }
    }
    expect(getPracticeCase('does-not-exist')).toBeUndefined()
  })
  it('keeps legacy wording, keys, explanations and ordered answers intact', () => {
    const cardiac = getPracticeCase('cvd_001')!
    const source = sampleScenarios.find((s) => s.id === '1')!
    cardiac.questions.forEach((q, index) => {
      const old = source.content.questions[index]!
      expect(q.question).toBe(old.question)
      expect(q.correctAnswers).toEqual(
        Array.isArray(old.correct_answer)
          ? old.correct_answer
          : [old.correct_answer]
      )
      expect(q.reasoning[0]!.text).toBe(old.explanation)
    })
    expect(cardiac.questions[2]!.type).toBe('drag_to_order')
    expect(cardiac.questions[2]!.correctAnswers).not.toBe(
      source.content.questions[2]!.correct_answer
    )
  })
  it('integrates all five original v3 stages as an unscored draft with usable definitions', () => {
    const scenario = getPracticeCase('tavr-conduction')!
    expect(draft.status).toBe('illustrative_draft_not_clinically_approved')
    expect(scenario.questions).toHaveLength(5)
    scenario.questions.forEach((q, i) => {
      expect(q.id).toBe(draft.questions[i]!.id)
      expect(q.question).toBe(draft.questions[i]!.stem)
      expect(q.terms).toHaveLength(4)
      expect(q.reasoning.map((r) => r.label)).toContain('What to reassess')
    })
  })
})
