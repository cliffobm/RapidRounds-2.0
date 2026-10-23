import { describe, it, expect } from 'vitest'
import { evolvingCases } from './evolving-content'
import {
  evolvingRevision,
  legacyEvolvingRevision,
  matchesAnswer,
  questionFor,
} from './evolving-types'
import { newCaseSession, readCaseSession } from './evolving-session'
import { evolvingAttempt } from './attempt-adapters'

describe('distinct clinical reasoning levels', () => {
  it('authors 192 distinct higher-level questions across every case, path and checkpoint', () => {
    const prompts: string[] = []
    for (const story of evolvingCases)
      for (const path of story.paths)
        for (const frame of path.frames) {
          const questions = ['foundation', 'challenge', 'advanced'].map(
            (level) =>
              questionFor(
                frame,
                level as 'foundation' | 'challenge' | 'advanced'
              )
          )
          expect(new Set(questions.map((q) => q.prompt)).size).toBe(3)
          expect(
            new Set(
              questions.map((q) => JSON.stringify(q.options.map((o) => o.text)))
            ).size
          ).toBe(3)
          for (const q of questions.slice(1)) {
            prompts.push(q.prompt)
            expect(q.prompt).not.toMatch(
              /Select the TWO elements that best support|Which comparison is most useful/
            )
            expect(q.options.length).toBeGreaterThanOrEqual(3)
            expect(new Set(q.options.map((o) => o.id)).size).toBe(
              q.options.length
            )
            expect(q.correct.length).toBeGreaterThan(0)
            expect(q.correct.length).toBeLessThan(q.options.length)
            expect(
              q.correct.every((id) => q.options.some((o) => o.id === id))
            ).toBe(true)
            expect(q.options.every((o) => o.explanation.length > 25)).toBe(true)
          }
        }
    expect(prompts).toHaveLength(192)
    expect(new Set(prompts).size).toBe(192)
  })
  it('retains earlier case questions and scores instead of rescoring them with the updated keys', () => {
    const story = evolvingCases[0]!,
      path = story.paths[0]!
    const old = {
      ...newCaseSession(story, 'advanced', 'pause'),
      revision: legacyEvolvingRevision,
      index: 5,
      complete: true,
      answers: path.frames.map((frame) => ({
        selected: [...frame.complex.correct],
        rationale: '',
        confidence: 'unsure' as const,
        assisted: false,
        skipped: false,
      })),
    }
    const restored = readCaseSession(JSON.stringify(old), story)!
    expect(restored.revision).toBe(legacyEvolvingRevision)
    expect(evolvingAttempt(story, restored)).toMatchObject({
      correct: 6,
      answered: 6,
      revision: legacyEvolvingRevision,
    })
    expect(questionFor(path.frames[0]!, 'advanced', restored.revision)).toBe(
      path.frames[0]!.complex
    )
    expect(
      questionFor(path.frames[0]!, 'advanced', evolvingRevision).prompt
    ).not.toBe(path.frames[0]!.complex.prompt)
  })
  it('validates complete current attempts at every level using the actual selection count', () => {
    for (const story of evolvingCases)
      for (let attempt = 0; attempt < 2; attempt++)
        for (const level of ['foundation', 'challenge', 'advanced'] as const) {
          const session = newCaseSession(story, level, 'pause', attempt)
          const path = story.paths[attempt]!
          const complete = {
            ...session,
            complete: true,
            index: 5,
            answers: path.frames.map((frame) => ({
              selected: [...questionFor(frame, level).correct],
              rationale: '',
              confidence: 'unsure' as const,
              assisted: false,
              skipped: false,
            })),
          }
          expect(
            readCaseSession(JSON.stringify(complete), story)
          ).not.toBeNull()
          expect(evolvingAttempt(story, complete).correct).toBe(6)
          expect(
            path.frames.every((frame, i) =>
              matchesAnswer(
                questionFor(frame, level),
                complete.answers[i]!.selected
              )
            )
          ).toBe(true)
        }
  })
})
