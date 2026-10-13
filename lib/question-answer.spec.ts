import { describe, expect, it } from 'vitest'
import { isQuestionAnswerCorrect } from './question-answer'

describe('question answer correctness', () => {
  it('requires exact order without mutating the answer or key', () => {
    const question = { type: 'drag_to_order' as const, correctAnswers: ['b', 'd', 'c', 'a'] }
    const wrong = ['a', 'b', 'c', 'd']
    expect(isQuestionAnswerCorrect(question, wrong)).toBe(false)
    expect(isQuestionAnswerCorrect(question, ['b', 'd', 'c', 'a'])).toBe(true)
    expect(question.correctAnswers).toEqual(['b', 'd', 'c', 'a'])
    expect(wrong).toEqual(['a', 'b', 'c', 'd'])
  })
  it('accepts unordered multi-select answers but rejects missing or repeated options', () => {
    const question = { type: 'multi_select' as const, correctAnswers: ['b', 'a'] }
    expect(isQuestionAnswerCorrect(question, ['a', 'b'])).toBe(true)
    expect(isQuestionAnswerCorrect(question, ['a'])).toBe(false)
    expect(isQuestionAnswerCorrect(question, ['a', 'a'])).toBe(false)
    expect(question.correctAnswers).toEqual(['b', 'a'])
  })
  it('rejects questions without a key and empty answers', () => {
    expect(isQuestionAnswerCorrect({ type: 'multiple_choice' }, ['a'])).toBe(false)
    expect(isQuestionAnswerCorrect({ type: 'drag_to_order', correctAnswers: [] }, [])).toBe(false)
  })
})
