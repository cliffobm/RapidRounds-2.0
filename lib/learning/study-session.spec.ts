import { describe, expect, it } from 'vitest'
import { contentRevision } from './sessions'
import { studyUnits } from './study'
import {
  newStudySession,
  readStudySession,
  studySessionKey,
} from './study-session'

const unit = studyUnits[0]!
const now = '2026-10-22T14:00:00.000Z'
const before = { selected: unit.pre.correct, correct: true }
const after = { selected: unit.post.correct, correct: true }
const fresh = () => newStudySession(unit, now)
const read = (value: unknown) => readStudySession(JSON.stringify(value), unit)

describe('durable study session validation', () => {
  it('namespaces each unit and pins the complete unit revision', () => {
    expect(studySessionKey(unit.id)).toBe(
      `rapidrounds-study-session-v1:${unit.id}`
    )
    expect(fresh()).toMatchObject({
      unitId: unit.id,
      revision: contentRevision(unit),
      phase: 'before',
    })
    expect(read(fresh())).toEqual(fresh())
  })
  it('accepts committed before feedback, lesson position, post feedback, and completed snapshots', () => {
    for (const value of [
      { ...fresh(), before },
      { ...fresh(), phase: 'learn', before },
      { ...fresh(), phase: 'after', before },
      { ...fresh(), phase: 'after', before, after },
      { ...fresh(), phase: 'complete', before, after, completedAt: now },
    ])
      expect(read(value)).toEqual(value)
  })
  it('rejects stale content, unrelated units, corrupt structures, and invalid timestamps', () => {
    expect(readStudySession('not-json', unit)).toBeNull()
    expect(readStudySession(null, unit)).toBeNull()
    for (const value of [
      { ...fresh(), revision: 'older' },
      { ...fresh(), unitId: studyUnits[1]!.id },
      { ...fresh(), startedAt: 'today' },
      { ...fresh(), updatedAt: '2026-10-21T14:00:00.000Z' },
      {
        ...fresh(),
        phase: 'complete',
        before,
        after,
        completedAt: '2026-10-23T14:00:00.000Z',
      },
    ])
      expect(read(value)).toBeNull()
  })
  it('rejects impossible phase transitions and fabricated answer correctness', () => {
    for (const value of [
      { ...fresh(), before: { selected: 10, correct: false } },
      { ...fresh(), before: { ...before, correct: false } },
      { ...fresh(), after },
      { ...fresh(), phase: 'learn' },
      { ...fresh(), phase: 'learn', before, after },
      { ...fresh(), phase: 'after', after },
      {
        ...fresh(),
        phase: 'after',
        before,
        after: { selected: -1, correct: false },
      },
      { ...fresh(), phase: 'complete', before, completedAt: now },
      { ...fresh(), phase: 'complete', before, after },
      { ...fresh(), before, completedAt: now },
    ])
      expect(read(value)).toBeNull()
  })
})
