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
} from './practice-library'

describe('unified practice library', () => {
  it('contains all 196 unique questions in 20 collections', () => {
    expect(practiceLibrary).toHaveLength(196)
    expect(new Set(practiceLibrary.map((question) => question.id)).size).toBe(
      196
    )
    expect(practiceCollections).toHaveLength(20)
    expect(
      practiceCollections.reduce(
        (total, collection) => total + collection.count,
        0
      )
    ).toBe(196)
  })

  it('preserves every existing question key, stem, prompt, option and answer key', () => {
    for (const topic of practiceTopics) {
      const original = loadPractice(topic.key)
      for (const item of original.items) {
        const question = getPracticeQuestion(item.id)!
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
    expect(practicePool('all', 'unclassified')).toHaveLength(100)
    for (const original of reasoningQuestions) {
      const question = getPracticeQuestion(original.id)!
      expect(question.prompt).toBe(original.prompt)
      expect(question.context).toBe(original.context)
      expect(question.options).toEqual(original.options)
      expect(question.correct).toEqual(original.correct)
      expect(question.level).toBe(original.level)
    }
    expect(practicePool('all', 'advanced')).toHaveLength(32)
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
