import { describe, expect, it } from 'vitest'
import { getPracticeQuestion, practicePool } from './practice-library'
import { getPracticeExplanation, practiceExplanations } from './practice-explanations'

describe('supplemental practice explanations', () => {
  it('covers every question in respiratory assessment and critical care essentials', () => {
    const targeted = [
      ...practicePool('pulm_template'),
      ...practicePool('anaphylaxis_mods_trauma_sedation'),
    ]
    expect(targeted).toHaveLength(13)
    expect(Object.keys(practiceExplanations).sort()).toEqual(targeted.map(({ id }) => id).sort())
    for (const question of targeted) {
      const explanation = getPracticeExplanation(question.id)!
      expect(explanation.reasoning.length).toBeGreaterThanOrEqual(2)
      expect(explanation.brief.trim()).not.toBe('')
      expect(explanation.takeaway.trim()).not.toBe('')
      // Each actual answer option, including the correct one, has a specific review explanation.
      expect(explanation.options.map(({ optionId }) => optionId).sort()).toEqual(question.options.map(({ id }) => id).sort())
      expect(new Set(explanation.options.map(({ why }) => why)).size).toBe(question.options.length)
      expect(explanation.references.length).toBeGreaterThan(0)
      for (const reference of explanation.references) expect(new URL(reference.url).protocol).toBe('https:')
    }
  })

  it('explains the ventilation calculation without equating minute and alveolar ventilation', () => {
    const explanation = getPracticeExplanation('pulm-demo-1')!
    expect(getPracticeQuestion('pulm-demo-1')!.correct).toEqual(['B'])
    expect(explanation.terms?.map(({ term }) => term).join(' ')).toContain('V̇A')
    expect(explanation.workedExample).toContain('4.2 L/min')
    expect(explanation.workedExample).toContain('3.0 L/min')
    expect(explanation.reasoning.join(' ')).toContain('does not guarantee')
    expect(explanation.caveat).toContain('air trapping')
  })

  it('retains the trauma answer while explaining important limits of the abbreviated stem', () => {
    const id = '43fda3ea-d1a3-45ec-95fa-5471fb5c0152'
    const explanation = getPracticeExplanation(id)!
    expect(getPracticeQuestion(id)!.correct).toEqual(['B'])
    expect(explanation.caveat).toContain('<C>ABCDE')
    expect(explanation.caveat).toContain('catastrophic')
    expect(explanation.reasoning.join(' ')).toContain('GCS 12 alone does not decide')
  })

  it('does not invent a deep explanation for an uncovered or missing question', () => {
    expect(getPracticeExplanation('missing')).toBeUndefined()
    expect(getPracticeExplanation()).toBeUndefined()
  })
})
