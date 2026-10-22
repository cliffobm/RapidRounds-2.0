import { describe, expect, it } from 'vitest'
import type { AttemptRecord } from './attempt-history'
import {
  comparePracticeAttempt,
  comparisonKey,
  missedPracticeSkills,
  practicePercentage,
  recentPracticeAttempts,
} from './progress-view'

function attempt(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return {
    id: 'first',
    kind: 'evolving-case',
    contentId: 'fever-neuro',
    title: 'The headache',
    revision: '1',
    level: 'foundation',
    mode: 'case',
    variant: 'a',
    correct: 3,
    answered: 6,
    skipped: 0,
    assisted: 0,
    completedAt: '2026-10-21T12:00:00.000Z',
    source: 'tracked',
    href: '/evolving/fever-neuro',
    skills: [],
    ...overrides,
  }
}

describe('practice progress presentation', () => {
  it('uses answered decisions as the denominator, rounds and handles no scored decisions', () => {
    expect(
      practicePercentage(attempt({ correct: 4, answered: 5, skipped: 1 }))
    ).toBe(80)
    expect(practicePercentage(attempt({ correct: 2, answered: 3 }))).toBe(67)
    expect(
      practicePercentage(attempt({ correct: 0, answered: 0, skipped: 6 }))
    ).toBeNull()
  })

  it('compares an identical repeat with the earliest retained result and the previous repeat', () => {
    const first = attempt()
    const second = attempt({
      id: 'second',
      correct: 4,
      completedAt: '2026-10-22T12:00:00.000Z',
    })
    const third = attempt({
      id: 'third',
      correct: 5,
      completedAt: '2026-10-23T12:00:00.000Z',
    })
    const records = [third, first, second]
    const original = [...records]

    expect(comparePracticeAttempt(first, records)).toMatchObject({
      label: 'first-recorded',
      number: 1,
      first: null,
      previous: null,
    })
    expect(comparePracticeAttempt(third, records)).toMatchObject({
      label: 'repeat',
      number: 3,
      first,
      previous: second,
      firstChange: 33,
      previousChange: 16,
    })
    expect(records).toEqual(original)
  })

  it.each([
    { kind: 'guided-case' as const },
    { contentId: 'pancreas-balance' },
    { revision: '2' },
    { variant: 'b' },
    { level: 'advanced' as const },
    { mode: 'check' as const },
    { answered: 5 },
  ])('keeps incomparable results separate: %j', (difference) => {
    const first = attempt()
    const later = attempt({
      id: 'later',
      completedAt: '2026-10-22T12:00:00.000Z',
      ...difference,
    })
    expect(comparisonKey(first)).not.toBe(comparisonKey(later))
    expect(comparePracticeAttempt(later, [first, later])).toMatchObject({
      label: 'first-recorded',
      number: 1,
      firstChange: null,
    })
  })

  it('includes reference-assisted repeat practice without changing the comparison group', () => {
    const first = attempt()
    const later = attempt({
      id: 'later',
      assisted: 2,
      correct: 6,
      completedAt: '2026-10-22T12:00:00.000Z',
    })
    expect(comparisonKey(first)).toBe(comparisonKey(later))
    expect(comparePracticeAttempt(later, [first, later])).toMatchObject({
      label: 'repeat',
      firstChange: 50,
    })
  })

  it('never gives saved undated results a first-attempt or repeat position', () => {
    const saved = attempt({
      id: 'saved',
      source: 'saved',
      completedAt: null,
      correct: 6,
    })
    const tracked = attempt()
    expect(comparePracticeAttempt(saved, [saved, tracked])).toMatchObject({
      label: 'saved',
      number: null,
      first: null,
      previous: null,
      firstChange: null,
    })
    expect(comparePracticeAttempt(tracked, [saved, tracked])).toMatchObject({
      label: 'first-recorded',
      number: 1,
    })
  })

  it('does not use a missing or invalid completion date as comparison evidence', () => {
    const missing = attempt({ id: 'missing', completedAt: null })
    const invalid = attempt({ id: 'invalid', completedAt: 'bad-date' })
    expect(comparePracticeAttempt(missing, [missing])).toMatchObject({
      label: 'saved',
      number: null,
    })
    expect(comparePracticeAttempt(invalid, [invalid])).toMatchObject({
      label: 'saved',
      number: null,
    })
  })

  it('does not fabricate a percentage change when an attempt has no scored answers', () => {
    const first = attempt({ correct: 0, answered: 0, skipped: 6 })
    const later = attempt({
      id: 'later',
      completedAt: '2026-10-22T12:00:00.000Z',
    })
    expect(comparePracticeAttempt(later, [first, later])).toMatchObject({
      label: 'repeat',
      firstChange: null,
      previousChange: null,
    })
  })

  it('sorts dated practice newest first without mutating the source array', () => {
    const first = attempt()
    const later = attempt({
      id: 'later',
      completedAt: '2026-10-22T12:00:00.000Z',
    })
    const saved = attempt({ id: 'saved', source: 'saved', completedAt: null })
    const records = [first, saved, later]
    expect(recentPracticeAttempts(records)).toEqual([later, first, saved])
    expect(records).toEqual([first, saved, later])
  })

  it('suggests study only for known skills with missed answered decisions', () => {
    expect(
      missedPracticeSkills([
        attempt({
          skills: [
            { skill: 'recognize_cues', correct: 0, answered: 2 },
            { skill: 'take_action', correct: 1, answered: 1 },
          ],
        }),
        attempt({
          id: 'later',
          skills: [
            { skill: 'recognize_cues', correct: 1, answered: 2 },
            { skill: 'analyze_cues', correct: 0, answered: 1 },
          ],
        }),
      ]).map(({ id, missed }) => ({ id, missed }))
    ).toEqual([
      { id: 'recognize_cues', missed: 3 },
      { id: 'analyze_cues', missed: 1 },
    ])
  })
})
