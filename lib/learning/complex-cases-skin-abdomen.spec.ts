import { describe, expect, it } from 'vitest'
import { complexSkinAbdomen } from './complex-cases-skin-abdomen'
import { matchesAnswer } from './evolving-types'

describe('skin and abdominal case reasoning levels', () => {
  it('covers six checkpoints at both levels for both authored paths', () => {
    expect(Object.keys(complexSkinAbdomen).sort()).toEqual([
      'abdomen-turn',
      'skin-systemic',
    ])
    const prompts: string[] = []
    for (const paths of Object.values(complexSkinAbdomen)) {
      expect(Object.keys(paths).sort()).toEqual(['a', 'b'])
      for (const frames of Object.values(paths)) {
        expect(frames).toHaveLength(6)
        for (const frame of frames) {
          expect(frame.challenge.prompt).not.toBe(frame.advanced.prompt)
          expect(
            frame.challenge.options.some((option) =>
              frame.advanced.options.some((other) => other.text === option.text)
            )
          ).toBe(false)
          for (const question of [frame.challenge, frame.advanced]) {
            prompts.push(question.prompt)
            expect(question.prompt).toMatch(/Dara|Alex|Nico|Emery/)
            expect(question.prompt).not.toMatch(/Select the TWO elements/)
            expect(
              new Set(question.options.map((option) => option.id)).size
            ).toBe(question.options.length)
            expect(question.correct.length).toBeGreaterThan(0)
            expect(question.correct.length).toBeLessThan(
              question.options.length
            )
            for (const id of question.correct) {
              expect(question.options.some((option) => option.id === id)).toBe(
                true
              )
            }
            for (const option of question.options) {
              expect(option.text.trim()).not.toBe('')
              expect(option.explanation.trim()).not.toBe('')
            }
            expect(question.reflection.trim()).not.toBe('')
          }
        }
      }
    }
    expect(prompts).toHaveLength(48)
    expect(new Set(prompts).size).toBe(48)
  })

  it('grades exact single and multiple selections, with varied answer positions and counts', () => {
    const positions = new Set<string>()
    const advancedCounts = new Set<number>()
    for (const paths of Object.values(complexSkinAbdomen)) {
      for (const frames of Object.values(paths)) {
        for (const frame of frames) {
          expect(frame.challenge.correct).toHaveLength(1)
          advancedCounts.add(frame.advanced.correct.length)
          for (const question of [frame.challenge, frame.advanced]) {
            question.correct.forEach((id) => positions.add(id))
            expect(
              matchesAnswer(question, [...question.correct].reverse())
            ).toBe(true)
            expect(matchesAnswer(question, [])).toBe(false)
            const distractor = question.options.find(
              (option) => !question.correct.includes(option.id)
            )!
            expect(
              matchesAnswer(question, [...question.correct, distractor.id])
            ).toBe(false)
            if (question.correct.length > 1) {
              expect(matchesAnswer(question, question.correct.slice(1))).toBe(
                false
              )
            }
          }
        }
      }
    }
    expect([...positions].sort()).toEqual(['0', '1', '2', '3'])
    expect([...advancedCounts].sort()).toEqual([1, 2, 3])
  })
})
