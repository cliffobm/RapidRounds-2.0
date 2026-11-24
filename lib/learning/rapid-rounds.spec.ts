import { describe, expect, it } from 'vitest'
import {
  rapidRounds,
  rapidRoundBlueprint,
  getRapidRound,
  gradeRoundPrompt,
  roundSelectionReady,
} from './rapid-rounds'
import {
  createRoundSession,
  readRoundSessions,
  submitRoundChoice,
  nextRoundPrompt,
  summarizeRound,
} from './rapid-round-session'
const correct = (item: (typeof rapidRounds)[number]['steps'][number]) =>
  item.format === 'choice'
    ? [item.correct]
    : item.rows.map((r) => `${r.id}:${r.urgent ? 'urgent' : 'monitor'}`)
describe('blueprint-led Rapid Rounds', () => {
  it('matches the approved category, cognitive and format blueprint without counting matrix rows as extra items', () => {
    const b = rapidRoundBlueprint()
    expect(b.total).toBe(40)
    expect(rapidRounds).toHaveLength(10)
    expect(b.categories.every((c) => c.actual === c.target)).toBe(true)
    expect(b.cognition.every((c) => c.actual === c.target)).toBe(true)
    expect(b.formats).toEqual({ choice: 32, matrix: 8 })
    expect(b.prerequisites).toBe(6)
    expect(b.skills.every((s) => s.actual > 0)).toBe(true)
    expect(b.skills.reduce((n, s) => n + s.actual, 0)).toBe(34)
  })
  it('requires defined outcomes, contextual rationales, alternative explanations and source links', () => {
    const ids = new Set<string>()
    for (const r of rapidRounds) {
      expect(r.steps).toHaveLength(4)
      expect(r.sources.every((s) => new URL(s.url).protocol === 'https:')).toBe(
        true
      )
      for (const p of r.steps) {
        expect(ids.has(p.id)).toBe(false)
        ids.add(p.id)
        expect(p.outcome.length).toBeGreaterThan(20)
        expect(p.mechanism.length).toBeGreaterThan(70)
        expect(['remember', 'understand'].includes(p.bloom)).toBe(
          p.skill === null
        )
        if (p.format === 'choice') {
          expect(p.options).toHaveLength(4)
          expect(p.options.every((o) => o.explanation.length > 30)).toBe(true)
          expect(p.options.filter((o) => o.id === p.correct)).toHaveLength(1)
        } else {
          expect(p.rows).toHaveLength(4)
          expect(p.rows.some((row) => row.urgent)).toBe(true)
          expect(p.rows.some((row) => !row.urgent)).toBe(true)
        }
      }
    }
  })
  it('gives explicit equal partial credit for matrix classifications and rejects duplicate or forged draft choices', () => {
    const p = rapidRounds[0]!.steps[0]!
    expect(p.format).toBe('matrix')
    expect(gradeRoundPrompt(p, correct(p))).toBe(1)
    expect(
      gradeRoundPrompt(p, ['0:urgent', '1:monitor', '2:urgent', '3:monitor'])
    ).toBe(0.75)
    expect(
      roundSelectionReady(p, ['0:urgent', '0:monitor', '2:urgent', '3:monitor'])
    ).toBe(false)
    expect(roundSelectionReady(p, ['forged'])).toBe(false)
  })
  it('keeps first responses immutable and lets a guided learner continue after a miss', () => {
    let s = createRoundSession(rapidRounds[0]!.id)
    s = {
      ...s,
      selected: ['0:monitor', '1:monitor', '2:monitor', '3:monitor'],
      assisted: true,
    }
    s = submitRoundChoice(s)
    expect(s.index).toBe(0)
    expect(s.answers[0]!.assisted).toBe(true)
    const first = structuredClone(s.answers[0])
    expect(
      submitRoundChoice({ ...s, selected: correct(rapidRounds[0]!.steps[0]!) })
        .answers[0]
    ).toEqual(first)
    s = nextRoundPrompt(s)
    expect(s.index).toBe(1)
    expect(s.selected).toEqual([])
    expect(s.assisted).toBe(false)
  })
  it('keeps independent responses together until completion and records no time-based penalty', () => {
    let s = createRoundSession(rapidRounds[0]!.id, 'independent', 300000)
    for (const p of rapidRounds[0]!.steps)
      s = submitRoundChoice({ ...s, selected: correct(p) })
    expect(s.complete).toBe(true)
    expect(summarizeRound(s).every((r) => r.credit === 1)).toBe(true)
    expect(
      summarizeRound({ ...s, elapsedMs: 900000, exceeded: true }).map(
        (r) => r.credit
      )
    ).toEqual([1, 1, 1, 1])
  })
  it('allows knowledge warm-ups to be skipped without classifying them as judgment evidence', () => {
    const s = submitRoundChoice(
      createRoundSession('less-urine-more-context'),
      true
    )
    expect(s.answers[0]!.skipped).toBe(true)
    expect(summarizeRound(s)[0]!.credit).toBeNull()
    expect(
      submitRoundChoice(createRoundSession(rapidRounds[0]!.id), true).answers
    ).toEqual([])
  })
  it('restores valid sessions paused and rejects malformed, incompatible and overwritten responses', () => {
    let s = createRoundSession(rapidRounds[0]!.id)
    s = submitRoundChoice({
      ...s,
      selected: correct(rapidRounds[0]!.steps[0]!),
    })
    expect(readRoundSessions(JSON.stringify([s]))[0]!.paused).toBe(true)
    expect(
      readRoundSessions(JSON.stringify([{ ...s, revision: 'unknown' }]))
    ).toEqual([])
    expect(
      readRoundSessions(
        JSON.stringify([
          {
            ...s,
            answers: [
              { selected: ['forged'], assisted: false, skipped: false },
            ],
          },
        ])
      )
    ).toEqual([])
    expect(readRoundSessions('not-json')).toEqual([])
    expect(getRapidRound(s.roundId, 'unknown')).toBeUndefined()
  })
})
