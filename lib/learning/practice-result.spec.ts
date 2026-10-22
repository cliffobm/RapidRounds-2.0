import { describe, expect, it } from 'vitest'
import { summarizePractice, type PracticeOutcome } from './practice-result'

describe('summarizePractice', () => {
  it('excludes an unanswered handoff from the score denominator', () => {
    expect(
      summarizePractice([
        { correct: true },
        { correct: true },
        { correct: true },
        { correct: true },
        { correct: false },
        { correct: false, skipped: true },
      ])
    ).toEqual({
      correct: 4,
      answered: 5,
      incorrect: 1,
      unanswered: 1,
      assisted: 0,
      percentage: 80,
    })
  })

  it('awards normal credit for reference-assisted answers and excludes skipped assistance', () => {
    expect(
      summarizePractice([
        { correct: true, assisted: true },
        { correct: false, assisted: true },
        { correct: true, skipped: true, assisted: true },
      ])
    ).toEqual({
      correct: 1,
      answered: 2,
      incorrect: 1,
      unanswered: 1,
      assisted: 2,
      percentage: 50,
    })
  })

  it('returns no percentage when there are no decisions', () => {
    expect(summarizePractice([])).toEqual({
      correct: 0,
      answered: 0,
      incorrect: 0,
      unanswered: 0,
      assisted: 0,
      percentage: null,
    })
  })

  it('returns no percentage when every decision was skipped', () => {
    expect(
      summarizePractice([
        { correct: false, skipped: true },
        { correct: true, skipped: true, assisted: true },
      ])
    ).toEqual({
      correct: 0,
      answered: 0,
      incorrect: 0,
      unanswered: 2,
      assisted: 0,
      percentage: null,
    })
  })

  it('reports 100 percent for an entirely correct attempt', () => {
    expect(summarizePractice([{ correct: true }, { correct: true }])).toEqual({
      correct: 2,
      answered: 2,
      incorrect: 0,
      unanswered: 0,
      assisted: 0,
      percentage: 100,
    })
  })

  it('reports zero percent for an entirely incorrect attempt', () => {
    expect(summarizePractice([{ correct: false }, { correct: false }])).toEqual(
      {
        correct: 0,
        answered: 2,
        incorrect: 2,
        unanswered: 0,
        assisted: 0,
        percentage: 0,
      }
    )
  })

  it('rounds non-integer percentages to the nearest whole percent', () => {
    expect(
      summarizePractice([
        { correct: true },
        { correct: true },
        { correct: false },
      ]).percentage
    ).toBe(67)
  })

  it('does not mutate its input array or outcomes', () => {
    const outcomes: readonly PracticeOutcome[] = Object.freeze([
      Object.freeze({ correct: true, assisted: true }),
      Object.freeze({ correct: false, skipped: true }),
    ])
    const before = JSON.stringify(outcomes)

    summarizePractice(outcomes)

    expect(JSON.stringify(outcomes)).toBe(before)
  })
})
