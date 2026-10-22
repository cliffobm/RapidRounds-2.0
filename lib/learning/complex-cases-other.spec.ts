import { describe, expect, it } from 'vitest'
import {
  complexCasesOther,
  otherCaseQuestionSources,
} from './complex-cases-other'

const questions = Object.values(complexCasesOther).flatMap((paths) =>
  Object.values(paths).flatMap((frames) =>
    frames.flatMap((frame) => [frame.challenge, frame.advanced])
  )
)

describe('case-specific Challenge and Advanced content', () => {
  it('covers both paths and all six stages without duplicating level prompts', () => {
    expect(Object.keys(complexCasesOther)).toHaveLength(4)
    expect(questions).toHaveLength(96)
    expect(new Set(questions.map((question) => question.prompt)).size).toBe(96)
    for (const [caseId, paths] of Object.entries(complexCasesOther)) {
      expect(Object.keys(paths).sort()).toEqual(['a', 'b'])
      expect(
        otherCaseQuestionSources[
          caseId as keyof typeof otherCaseQuestionSources
        ].length
      ).toBeGreaterThan(0)
      for (const frames of Object.values(paths)) {
        expect(frames).toHaveLength(6)
        for (const frame of frames) {
          expect(frame.challenge.prompt).not.toBe(frame.advanced.prompt)
          expect(
            frame.challenge.options.map((option) => option.text)
          ).not.toEqual(frame.advanced.options.map((option) => option.text))
        }
      }
    }
  })

  it('has complete rationales, valid distinct keys and unambiguous selection counts', () => {
    for (const question of questions) {
      const ids = question.options.map((option) => option.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(new Set(question.options.map((option) => option.text)).size).toBe(
        ids.length
      )
      expect(question.correct.length).toBeGreaterThan(0)
      expect(question.correct.length).toBeLessThan(ids.length)
      expect(new Set(question.correct).size).toBe(question.correct.length)
      for (const id of question.correct) expect(ids).toContain(id)
      for (const option of question.options) {
        expect(option.explanation.trim().length).toBeGreaterThan(30)
      }
      const requested = question.prompt.includes('Which THREE')
        ? 3
        : question.prompt.includes('Which TWO')
          ? 2
          : 1
      expect(question.correct).toHaveLength(requested)
      expect(question.prompt).not.toContain('elements that best support')
      expect(question.reflection.trim().length).toBeGreaterThan(30)
    }
    expect(
      new Set(questions.map((question) => question.correct.length))
    ).toEqual(new Set([1, 2, 3]))
  })

  it('does not make answer length a reliable single-answer shortcut', () => {
    const single = questions.filter((question) => question.correct.length === 1)
    const longestCorrect = single.filter((question) => {
      const maxLength = Math.max(
        ...question.options.map((option) => option.text.length)
      )
      return question.options.some(
        (option) =>
          question.correct.includes(option.id) &&
          option.text.length === maxLength
      )
    })
    expect(longestCorrect.length / single.length).toBeLessThan(0.5)
    expect(new Set(single.map((question) => question.correct[0])).size).toBe(4)
  })
})
