import { beforeEach, describe, expect, it } from 'vitest'
import { rapidResponseCases } from './rapid-response-content'
import { historyKey, readAttempts, recordAttempt } from './attempt-history'
import { readProgress } from './progress'
import {
  RAPID_RESPONSE_KEY,
  createRapidResponseSession,
  readRapidResponseSessions,
  saveRapidResponseSession,
  tickRapidResponse,
  pauseRapidResponse,
  resumeRapidResponse,
  continueRapidResponse,
  finishRapidResponse,
  submitRapidResponseAnswer,
  summarizeRapidResponse,
  rapidResponseAttempt,
} from './rapid-response-session'

const story = rapidResponseCases[0]!
const base = Date.UTC(2026, 9, 23, 12)
const make = (mode: 'untimed' | 'challenge' = 'untimed') =>
  createRapidResponseSession(story.id, {
    mode,
    id: 'response-unit-case',
    now: base,
  })!
beforeEach(() => localStorage.clear())
describe('formative response timing and saved decisions', () => {
  it('counts supplied active time, pauses explicitly and never charges time away on restore', () => {
    let session = tickRapidResponse(make(), 1200, base + 1200)
    session = pauseRapidResponse(session, base + 1300)
    expect(tickRapidResponse(session, 60000, base + 60000).activeMs).toBe(1200)
    expect(saveRapidResponseSession(session)).toBe(true)
    const restored = readRapidResponseSessions(
      localStorage.getItem(RAPID_RESPONSE_KEY)
    )[0]!
    expect(restored.paused).toBe(true)
    expect(restored.activeMs).toBe(1200)
    expect(
      tickRapidResponse(
        resumeRapidResponse(restored, base + 86400000),
        1000,
        base + 86401000
      ).activeMs
    ).toBe(2200)
  })
  it('caps stalled tick deltas and ignores invalid negative time', () => {
    expect(tickRapidResponse(make(), 600000, base + 600000).activeMs).toBe(2000)
    expect(tickRapidResponse(make(), -1000).activeMs).toBe(0)
    expect(tickRapidResponse(make(), Number.NaN).activeMs).toBe(0)
  })
  it('keeps confirmed timestamps valid when the wall clock moves backward', () => {
    let session = tickRapidResponse(make(), 1000, base + 1000)
    session = submitRapidResponseAnswer(
      { ...session, selected: [...story.stages[0]!.question.correct] },
      base - 50000
    )
    expect(session.answers[0]!.answeredAt).toBe(
      new Date(base + 1000).toISOString()
    )
    expect(saveRapidResponseSession(session)).toBe(true)
  })
  it('reaches the countdown without grading or discarding the current draft', () => {
    let session = make('challenge')
    const correct = story.stages[0]!.question.correct
    session = {
      ...session,
      activeMs: session.budgetMs! - 400,
      selected: [...correct],
    }
    session = tickRapidResponse(session, 1000, base + 1000)
    expect(session).toMatchObject({
      activeMs: session.budgetMs,
      paused: true,
      complete: false,
      selected: correct,
      answers: [],
    })
    expect(submitRapidResponseAnswer(session, base + 2000)).toBe(session)
    session = continueRapidResponse(session, base + 2000)
    session = tickRapidResponse(session, 1000, base + 3000)
    session = submitRapidResponseAnswer(session, base + 3000)
    expect(session.answers).toHaveLength(1)
    expect(summarizeRapidResponse(session).exceededBudget).toBe(true)
    expect(summarizeRapidResponse(session).score.correct).toBe(1)
  })
  it('separates an early-finish accuracy percentage from unanswered critical decisions', () => {
    let session = {
      ...make(),
      selected: [...story.stages[0]!.question.correct],
    }
    session = tickRapidResponse(session, 1500, base + 1500)
    session = submitRapidResponseAnswer(session, base + 1500)
    session = finishRapidResponse(session, base + 2000)
    const result = summarizeRapidResponse(session)
    expect(result.score).toMatchObject({
      percentage: 100,
      correct: 1,
      answered: 1,
      unanswered: 3,
    })
    expect(result.criticalMisses).toEqual(
      story.stages.flatMap((stage, index) =>
        stage.critical && index > 0 ? [index] : []
      )
    )
    expect(saveRapidResponseSession(session)).toBe(true)
    expect(
      readRapidResponseSessions(localStorage.getItem(RAPID_RESPONSE_KEY))[0]!
        .answers[0]!.elapsedMs
    ).toBe(1500)
  })
  it('keeps every complete decision and timing record in Progress without rewriting a confirmed result', () => {
    let session = make()
    story.stages.forEach((stage, index) => {
      session = tickRapidResponse(
        { ...session, selected: [...stage.question.correct] },
        1000,
        base + (index + 1) * 1000
      )
      session = submitRapidResponseAnswer(session, base + (index + 1) * 1000)
      expect(saveRapidResponseSession(session)).toBe(true)
    })
    expect(session).toMatchObject({
      complete: true,
      paused: true,
      activeMs: 4000,
    })
    expect(recordAttempt(rapidResponseAttempt(session))).toBe(true)
    const record = readAttempts(localStorage.getItem(historyKey))[0]!
    expect(record).toMatchObject({
      kind: 'rapid-response',
      correct: 4,
      skipped: 0,
      timing: { activeMs: 4000, mode: 'untimed' },
    })
    expect(readProgress().attempts).toHaveLength(1)
    expect(saveRapidResponseSession({ ...session, activeMs: 3999 })).toBe(false)
    expect(
      saveRapidResponseSession({
        ...session,
        updatedAt: new Date(base + 5000).toISOString(),
      })
    ).toBe(false)
  })
  it('preserves pending selection and rejects changed answers, timing conditions and malformed sessions', () => {
    let session = make('challenge')
    session = tickRapidResponse(session, 1000, base + 1000)
    expect(saveRapidResponseSession(session)).toBe(true)
    expect(
      saveRapidResponseSession({ ...session, mode: 'untimed', budgetMs: null })
    ).toBe(false)
    expect(saveRapidResponseSession({ ...session, activeMs: 0 })).toBe(false)
    session = { ...session, selected: [...story.stages[0]!.question.correct] }
    expect(saveRapidResponseSession(session)).toBe(true)
    expect(
      readRapidResponseSessions(localStorage.getItem(RAPID_RESPONSE_KEY))[0]!
        .selected
    ).toEqual(session.selected)
    session = submitRapidResponseAnswer(session, base + 1100)
    expect(saveRapidResponseSession(session)).toBe(true)
    const wrong = story.stages[0]!.question.options.find(
      (option) => !story.stages[0]!.question.correct.includes(option.id)
    )!.id
    const rewritten = {
      ...session,
      answers: [{ ...session.answers[0]!, selected: [wrong] }],
    }
    expect(saveRapidResponseSession(rewritten)).toBe(false)
    expect(
      readRapidResponseSessions(
        JSON.stringify([{ ...session, selected: ['unknown'] }])
      )
    ).toEqual([])
    expect(
      readRapidResponseSessions(JSON.stringify([{ ...session, activeMs: -1 }]))
    ).toEqual([])
  })
  it('offers extended timing and validates resume links separately from existing learning data', () => {
    const extended = createRapidResponseSession(story.id, {
      mode: 'challenge',
      multiplier: 2,
      id: 'extended-response',
      now: base,
    })!
    expect(extended.budgetMs).toBe(story.timeBudgetSeconds * 2000)
    expect(saveRapidResponseSession(extended)).toBe(true)
    expect(readProgress().unfinished).toMatchObject([
      {
        kind: 'rapid-response',
        href: '/rapid-response?session=extended-response',
      },
    ])
    expect(
      createRapidResponseSession('missing', { mode: 'untimed' })
    ).toBeNull()
  })
})
