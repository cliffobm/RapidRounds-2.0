import { expect, it } from 'vitest'
import { clinicalNarrative } from './clinical-narrative'

it('removes known simulation instructions from patient narrative without changing the source', () => {
  const source =
    'Riley reports less pressure but remains lightheaded. Current observations differ from baseline. This is a scripted teaching update, not a prediction of treatment response.'
  expect(clinicalNarrative(source)).toBe(
    'Riley reports less pressure but remains lightheaded. Current observations differ from baseline.'
  )
  expect(source).toContain('scripted teaching update')
  expect(clinicalNarrative('A patient describes pressure after walking.')).toBe(
    'A patient describes pressure after walking.'
  )
})
