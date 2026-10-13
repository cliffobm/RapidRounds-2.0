import { describe, it, expect } from 'vitest'
import { initialState, reducer } from './drillSlice'

describe('skipping unanswered cards', () => {
  it('advances to another queued card without grading or mutating progress', () => {
    const state = { ...initialState(), queue: ['first', 'second', 'third'] }
    const next = reducer(state, { type: 'SKIP' })
    expect(next.queue).toEqual(['second', 'third', 'first'])
    expect(next.stats).toEqual({ seen: 0, correct: 0, incorrect: 0 })
    expect(next.history).toEqual([])
    expect(state.queue).toEqual(['first', 'second', 'third'])
  })
  it('keeps empty and single-card queues unchanged', () => {
    for (const queue of [[], ['first']]) {
      const state = { ...initialState(), queue }
      expect(reducer(state, { type: 'SKIP' })).toBe(state)
    }
  })
})
