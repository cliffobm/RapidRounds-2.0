import { describe, expect, it } from 'vitest'
import schema from '@/cjis/question.schema.json'
import { competencyRegistry, validateClinicalItem, isScoredClinicalItem } from './registry'
import { loadLegacyPractice, recordPracticeResponse } from './practice'
import { BANKS, type BankKey } from '@/qbank/banks'

// Synthetic structural fixture only; no new clinical content or reviewed item is implied.
const fixture = () => ({
  id: 'synthetic', case_family_id: 'synthetic-case', stem: 'Synthetic test question with enough characters.',
  options: [{ id: 'A', text: 'Option A' }, { id: 'B', text: 'Option B' }], correct_option_id: 'B',
  primary_competency: 'recognize_cues', clinical_domain: 'cardiovascular', complexity_level: 1,
  learning_objective: 'Synthetic objective', review_status: 'approved', calibration_status: 'calibrated',
  references: ['Synthetic test reference'],
  rationale: { normal_physiology: 'test', pathophysiology: 'test', decisive_cues: 'test',
    correct_answer: 'test', distractors: { A: 'test' }, nursing_implications: 'test', reassessment: 'test' },
})

describe('CJIS registry and release gate', () => {
  it('agrees with the schema enumerations and complexity bounds', () => {
    expect(competencyRegistry.operations).toEqual(schema.properties.primary_competency.enum)
    expect(competencyRegistry.clinical_domains).toEqual(schema.properties.clinical_domain.enum)
    expect(competencyRegistry.complexity_levels.map(entry => entry.level)).toEqual([1, 2, 3, 4, 5])
  })
  it('accepts a complete synthetic item only when approved, calibrated and referenced', () => {
    expect(validateClinicalItem(fixture())).toEqual({ valid: true, errors: [] })
    expect(isScoredClinicalItem(fixture())).toBe(true)
    for (const patch of [{ review_status: 'draft' }, { calibration_status: 'uncalibrated' },
      { calibration_status: undefined }, { references: [] }, { references: [' '] }]) {
      expect(isScoredClinicalItem({ ...fixture(), ...patch })).toBe(false)
    }
  })
  it('rejects unknown metadata, extra fields, missing rationale, and invalid answer relationships', () => {
    for (const patch of [{ primary_competency: 'fake' }, { clinical_domain: 'fake' }, { complexity_level: 6 },
      { review_status: 'fake' }, { learning_objective: '' }, { unexpected: true }, { rationale: {} },
      { correct_option_id: 'Z' }, { options: [{ id: 'A', text: 'A' }, { id: 'A', text: 'B' }] },
      { rationale: { ...fixture().rationale, distractors: {} } }]) {
      expect(validateClinicalItem({ ...fixture(), ...patch }).valid).toBe(false)
      expect(isScoredClinicalItem({ ...fixture(), ...patch })).toBe(false)
    }
    expect(validateClinicalItem(null).valid).toBe(false)
  })
})

describe('actual legacy banks through the runtime adapter', () => {
  for (const key of Object.keys(BANKS) as BankKey[]) {
    it(`preserves all answers in ${key} and excludes them from scoring`, () => {
      const bank = loadLegacyPractice(key)
      expect(bank.items).toHaveLength(BANKS[key].items.length)
      bank.items.forEach((item, index) => {
        const source = BANKS[key].items[index]!
        expect(item.legacy.source).toEqual(source)
        expect(item.correct_option_id).toBe(source.correct_answer)
        expect(item.options.map(option => option.text)).toEqual(source.options)
        expect(item.primary_competency).toBeNull()
        expect(isScoredClinicalItem(item)).toBe(false)
      })
    })
  }
  it('records first attempts, repeats, case identity, version and nonresponses without competency credit', () => {
    const { items, version } = loadLegacyPractice('acute_mi')
    const item = items[0]!
    const first = recordPracticeResponse(item, version, item.correct_option_id, 2500)
    expect(first).toMatchObject({ outcome: 'correct', first_attempt: true, competency_eligible: false,
      item_version: version, case_family_id: item.case_family_id, elapsed_ms: 2500, hints_used: 0, definitions_used: 0 })
    expect(recordPracticeResponse(item, version, 'A', 100, [first])).toMatchObject({ outcome: 'incorrect', first_attempt: false })
    expect(recordPracticeResponse(item, version, null, 200)).toMatchObject({ outcome: 'nonresponse', competency_eligible: false })
    expect(() => recordPracticeResponse(item, version, 'Z', 1)).toThrow()
    expect(() => recordPracticeResponse(item, version, 'A', -1)).toThrow()
  })
})
