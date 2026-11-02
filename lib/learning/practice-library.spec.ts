import { describe, expect, it } from 'vitest'
import { loadPractice } from '@/lib/cjis/practice'
import { practiceTopics } from './catalog'
import { reasoningQuestions } from './evolving-content'
import {
  findPracticeCollection,
  getPracticeQuestion,
  practiceCollections,
  practiceLibrary,
  practicePool,
  PREVIOUS_PRACTICE_LIBRARY_REVISION,
} from './practice-library'

describe('unified practice library', () => {
  it('contains 300 unique v2 questions in 20 complete collections', () => {
    expect(practiceLibrary).toHaveLength(300)
    expect(new Set(practiceLibrary.map((question) => question.id)).size).toBe(
      300
    )
    expect(practiceCollections).toHaveLength(20)
    expect(
      practiceCollections.reduce(
        (total, collection) => total + collection.count,
        0
      )
    ).toBe(300)
    expect(
      practiceCollections.every((collection) => collection.count === 15)
    ).toBe(true)
    expect(
      practiceLibrary.every(
        (question) => question.review?.schemaVersion === '2.0'
      )
    ).toBe(true)
  })

  it('preserves every existing question key, stem, prompt, option and answer key', () => {
    for (const topic of practiceTopics) {
      const original = loadPractice(topic.key)
      for (const item of original.items) {
        expect(getPracticeQuestion(item.id)).toBeUndefined()
        const question = getPracticeQuestion(
          item.id,
          PREVIOUS_PRACTICE_LIBRARY_REVISION
        )!
        expect(question.context).toBe(item.stem)
        expect(question.prompt).toBe(item.prompt)
        expect(question.options.map(({ id, text }) => ({ id, text }))).toEqual(
          item.options
        )
        expect(question.correct).toEqual([item.correct_option_id])
        expect(question.revision).toBe(original.version)
        expect(question.level).toBe('unclassified')
        expect(question.skill).toBe(item.primaryCompetency ?? undefined)
      }
    }
  })

  it('preserves all declared reasoning levels without inventing labels for other questions', () => {
    expect(practicePool('all', 'unclassified')).toHaveLength(0)
    for (const original of reasoningQuestions) {
      const question = getPracticeQuestion(
        original.id,
        PREVIOUS_PRACTICE_LIBRARY_REVISION
      )!
      expect(question.prompt).toBe(original.prompt)
      expect(question.context).toBe(original.context)
      expect(question.options).toEqual(original.options)
      expect(question.correct).toEqual(original.correct)
      expect(question.level).toBe(original.level)
    }
    for (const level of ['foundation', 'challenge', 'advanced'] as const)
      expect(practicePool('all', level)).toHaveLength(100)
    for (const collection of practiceCollections)
      for (const level of ['foundation', 'challenge', 'advanced'] as const)
        expect(
          practicePool(collection.id, level),
          `${collection.id}/${level}`
        ).toHaveLength(5)
  })

  it('resolves old bank keys and new collection topic names for redirects', () => {
    expect(findPracticeCollection('pulm_template')?.title).toBe(
      'Respiratory assessment'
    )
    expect(findPracticeCollection('Infection & neurology')?.id).toBe(
      'reasoning:fever-neuro'
    )
    expect(findPracticeCollection('fever-neuro')?.id).toBe(
      'reasoning:fever-neuro'
    )
    expect(findPracticeCollection('unknown')).toBeUndefined()
  })
})
