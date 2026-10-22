import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { orderedOptions } from './evolving-types'
import {
  PRACTICE_LIBRARY_REVISION,
  getPracticeQuestion,
  practiceLibrary,
} from './practice-library'
import {
  createPracticeSession,
  PRACTICE_SESSIONS_KEY,
  practiceAttemptRecord,
  practiceOptionSeed,
  readPracticeSessions,
  savePracticeSession,
  type UnifiedPracticeSession,
} from './practice-session'

const startedAt = '2026-10-22T12:00:00.000Z'
function attempt(id = 'attempt-first', mode: 'guided' | 'check' = 'guided') {
  return createPracticeSession({ id, mode, count: 5, now: startedAt })!
}
function read(session: UnifiedPracticeSession) {
  return readPracticeSessions(JSON.stringify([session]))[0]
}
function completed(id: string, seconds: number) {
  const session = attempt(id)
  return {
    ...session,
    complete: true,
    index: 4,
    selected: '',
    updatedAt: new Date(Date.parse(startedAt) + seconds * 1000).toISOString(),
    answers: session.ids.map((id) => ({
      selected: getPracticeQuestion(id)!.correct[0]!,
      assisted: false,
    })),
  }
}
beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('unified practice sessions', () => {
  it('keeps question order, answer order and drafts stable through reload', () => {
    const session = attempt()
    session.selected = getPracticeQuestion(session.ids[0]!)!.options[1]!.id
    session.assisted = true
    expect(savePracticeSession(session)).toBe(true)
    const restored = readPracticeSessions(
      localStorage.getItem(PRACTICE_SESSIONS_KEY)
    )[0]!
    expect(restored).toEqual(session)
    const question = getPracticeQuestion(session.ids[0]!)!
    expect(
      orderedOptions(question, practiceOptionSeed(restored.id, 0))
    ).toEqual(orderedOptions(question, practiceOptionSeed(session.id, 0)))
  })

  it('saves a guided answer before advancing and rejects changing a confirmed draft', () => {
    const session = attempt()
    session.selected = getPracticeQuestion(session.ids[0]!)!.options[0]!.id
    session.answers = [{ selected: session.selected, assisted: false }]
    expect(read(session)).toEqual(session)
    const altered = {
      ...session,
      selected: getPracticeQuestion(session.ids[0]!)!.options[1]!.id,
    }
    expect(read(altered)).toBeUndefined()
  })

  it('requires check answers to advance immediately without a feedback stage', () => {
    const session = attempt('attempt-check', 'check')
    session.answers = [
      {
        selected: getPracticeQuestion(session.ids[0]!)!.correct[0]!,
        assisted: false,
      },
    ]
    expect(read(session)).toBeUndefined()
    expect(read({ ...session, index: 1 })).toBeDefined()
  })

  it.each([
    [
      'stale content',
      (session: UnifiedPracticeSession) => ({ ...session, revision: 'old' }),
    ],
    [
      'duplicate questions',
      (session: UnifiedPracticeSession) => ({
        ...session,
        ids: Array(5).fill(session.ids[0]),
      }),
    ],
    [
      'unknown question',
      (session: UnifiedPracticeSession) => ({
        ...session,
        ids: ['unknown', ...session.ids.slice(1)],
      }),
    ],
    [
      'unknown option',
      (session: UnifiedPracticeSession) => ({
        ...session,
        selected: 'unknown',
      }),
    ],
    [
      'false completion',
      (session: UnifiedPracticeSession) => ({ ...session, complete: true }),
    ],
    [
      'wrong collection',
      (session: UnifiedPracticeSession) => ({
        ...session,
        collectionId: 'reasoning:fever-neuro',
      }),
    ],
    [
      'unknown collection',
      (session: UnifiedPracticeSession) => ({
        ...session,
        collectionId: 'unknown',
      }),
    ],
    [
      'invented difficulty',
      (session: UnifiedPracticeSession) => ({ ...session, level: 'advanced' }),
    ],
    [
      'backward time',
      (session: UnifiedPracticeSession) => ({
        ...session,
        updatedAt: '2026-10-21T12:00:00.000Z',
      }),
    ],
  ])(
    'rejects %s while preserving other valid saved attempts',
    (_label, mutate) => {
      const valid = attempt()
      expect(
        readPracticeSessions(JSON.stringify([mutate(valid), valid]))
      ).toEqual([valid])
    }
  )

  it('rejects corrupt storage and insufficient question pools', () => {
    expect(readPracticeSessions('{broken')).toEqual([])
    expect(
      createPracticeSession({
        mode: 'check',
        count: 10,
        collectionId: 'reasoning:fever-neuro',
      })
    ).toBeNull()
    expect(
      createPracticeSession({
        mode: 'check',
        count: 5,
        collectionId: 'reasoning:fever-neuro',
        level: 'advanced',
      })
    ).toBeNull()
  })

  it('gives each attempt its own identity and samples without duplicate question IDs', () => {
    const first = createPracticeSession({ mode: 'check', count: 10 })!
    const second = createPracticeSession({ mode: 'check', count: 10 })!
    expect(first.id).not.toBe(second.id)
    expect(first.ids).not.toEqual(second.ids)
    expect(new Set(first.ids).size).toBe(10)
    expect(first.revision).toBe(PRACTICE_LIBRARY_REVISION)
  })

  it('retains 20 unfinished and 20 recent completed sessions', () => {
    const values = Array.from({ length: 25 }, (_, index) => [
      {
        ...attempt(`pending-${index}`),
        updatedAt: new Date(Date.parse(startedAt) + index * 1000).toISOString(),
      },
      completed(`complete-${index}`, index),
    ]).flat()
    const restored = readPracticeSessions(JSON.stringify(values))
    expect(restored).toHaveLength(40)
    expect(restored.filter((session) => session.complete)).toHaveLength(20)
    expect(restored.some((session) => session.id === 'pending-0')).toBe(false)
    expect(restored.some((session) => session.id === 'complete-24')).toBe(true)
  })

  it('upserts the same attempt without losing another attempt and reports failed storage', () => {
    const first = attempt()
    expect(savePracticeSession(first)).toBe(true)
    expect(savePracticeSession(attempt('attempt-second'))).toBe(true)
    expect(
      savePracticeSession({
        ...first,
        selected: getPracticeQuestion(first.ids[0]!)!.correct[0]!,
      })
    ).toBe(true)
    expect(
      readPracticeSessions(localStorage.getItem(PRACTICE_SESSIONS_KEY))
    ).toHaveLength(2)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(savePracticeSession(first)).toBe(false)
  })

  it('creates consistent history records with stable completion time and no fabricated migration time', () => {
    const session = createPracticeSession({
      id: 'reasoning-history',
      mode: 'check',
      collectionId: 'reasoning:fever-neuro',
      count: 5,
      now: startedAt,
    })!
    session.complete = true
    session.index = 4
    session.updatedAt = '2026-10-22T12:05:00.000Z'
    session.answers = session.ids.map((id, index) => {
      const question = getPracticeQuestion(id)!
      return {
        selected:
          index === 1
            ? null
            : index === 0
              ? question.correct[0]!
              : question.options.find(
                  (option) => !question.correct.includes(option.id)
                )!.id,
        assisted: index < 2,
      }
    })
    const tracked = practiceAttemptRecord(session)
    expect(tracked).toMatchObject({
      id: session.id,
      correct: 1,
      answered: 4,
      skipped: 1,
      assisted: 1,
      level: 'mixed',
      completedAt: session.updatedAt,
      source: 'tracked',
    })
    expect(
      tracked.skills.reduce((total, skill) => total + skill.answered, 0)
    ).toBe(4)
    expect(practiceAttemptRecord(session, 'saved')).toMatchObject({
      completedAt: null,
      source: 'saved',
    })
    expect(practiceAttemptRecord(session).completedAt).toBe(tracked.completedAt)
  })

  it('does not guess a level or competency for imported questions', () => {
    const session = attempt()
    session.ids = practiceLibrary
      .filter((question) => question.origin === 'legacy')
      .slice(0, 5)
      .map((question) => question.id)
    session.complete = true
    session.index = 4
    session.answers = session.ids.map((id) => ({
      selected: getPracticeQuestion(id)!.correct[0]!,
      assisted: false,
    }))
    expect(practiceAttemptRecord(session)).toMatchObject({
      level: 'unclassified',
      skills: [],
    })
  })
})
