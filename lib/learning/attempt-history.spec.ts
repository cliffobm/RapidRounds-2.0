import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  historyKey,
  isLearningHref,
  progressEvent,
  readAttempts,
  recordAttempt,
  type AttemptRecord,
} from './attempt-history'

function record(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return {
    id: 'attempt-1',
    kind: 'practice',
    contentId: 'all',
    title: 'All topics',
    revision: '1',
    level: 'foundation',
    mode: 'check',
    variant: '',
    correct: 4,
    answered: 5,
    skipped: 0,
    assisted: 1,
    completedAt: '2026-10-22T12:00:00.000Z',
    source: 'tracked',
    href: '/practice?session=attempt-1',
    skills: [],
    ...overrides,
  }
}

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('attempt history', () => {
  it('retains valid entries beside corrupt entries and deduplicates repeated IDs', () => {
    const valid = record()
    expect(
      readAttempts(
        JSON.stringify([
          null,
          { ...valid, id: 'invalid', correct: 9 },
          valid,
          { ...valid, correct: 5 },
          { ...valid, id: 'later' },
        ])
      )
    ).toEqual([valid, record({ id: 'later' })])
    expect(readAttempts('broken-json')).toEqual([])
  })

  it.each([
    'https://example.com/practice',
    '//example.com/practice',
    'javascript:alert(1)',
    '/\\example.com/practice',
    '/admin',
  ])('rejects unsafe or non-learning destinations: %s', (href) => {
    expect(isLearningHref(href)).toBe(false)
    expect(readAttempts(JSON.stringify([record({ href })]))).toEqual([])
    expect(recordAttempt(record({ href }))).toBe(false)
  })

  it('accepts internal resume destinations and enforces timestamp provenance', () => {
    expect(isLearningHref('/evolving/fever-neuro')).toBe(true)
    expect(isLearningHref('/study?pillar=recognize_cues')).toBe(true)
    const saved = record({ id: 'saved', source: 'saved', completedAt: null })
    expect(readAttempts(JSON.stringify([saved]))).toEqual([saved])
    expect(
      readAttempts(
        JSON.stringify([
          record({ completedAt: null }),
          record({ id: 'false-time', source: 'saved' }),
        ])
      )
    ).toEqual([])
  })

  it('bounds retained history to the newest 200 appended records', () => {
    const records = Array.from({ length: 205 }, (_, index) =>
      record({ id: `attempt-${index}` })
    )
    localStorage.setItem(historyKey, JSON.stringify(records))
    expect(
      readAttempts(localStorage.getItem(historyKey)).map((item) => item.id)
    ).toEqual(records.slice(-200).map((item) => item.id))
    expect(recordAttempt(record({ id: 'latest' }))).toBe(true)
    const retained = readAttempts(localStorage.getItem(historyKey))
    expect(retained).toHaveLength(200)
    expect(retained[0]?.id).toBe('attempt-6')
    expect(retained.at(-1)?.id).toBe('latest')
  })

  it('stores an attempt and publishes one progress update even when save is retried', () => {
    const changed = vi.fn()
    window.addEventListener(progressEvent, changed)
    try {
      expect(recordAttempt(record())).toBe(true)
      expect(recordAttempt(record())).toBe(true)
      expect(readAttempts(localStorage.getItem(historyKey))).toHaveLength(1)
      expect(changed).toHaveBeenCalledOnce()
    } finally {
      window.removeEventListener(progressEvent, changed)
    }
  })

  it('returns false without overwriting existing history when storage is blocked', () => {
    localStorage.setItem(historyKey, JSON.stringify([record()]))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(recordAttempt(record({ id: 'new' }))).toBe(false)
    expect(readAttempts(localStorage.getItem(historyKey))).toEqual([record()])
  })
})
