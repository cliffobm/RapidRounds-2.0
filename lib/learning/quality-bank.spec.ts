import { describe, expect, it } from 'vitest'
import {
  compileQualityBank,
  qualityDrafts,
  qualityCollections,
} from './quality-bank-authoring'
import generated from './quality-practice.generated.json'
import examples from '@/cjis/examples/question-v2.examples.json'
import { pillars } from './pillars'
import {
  getPracticeQuestion,
  PREVIOUS_PRACTICE_LIBRARY_REVISION,
  LEGACY_PRACTICE_LIBRARY_REVISION,
  PRACTICE_LIBRARY_REVISION,
  practiceLibrary,
} from './practice-library'
import {
  createPracticeSession,
  practiceAttemptRecord,
  readPracticeSessions,
} from './practice-session'
import { materialQuestions } from './material-questions'
import { reasoningQuestions } from './evolving-content'

describe('CJIS v2 bank and saved attempt compatibility', () => {
  it('exports exactly the validated source records used by the app, with five questions at each level in all 20 topics', () => {
    const result = compileQualityBank()
    expect(result.runtime).toEqual(generated)
    expect(examples).toEqual(
      result.canonical.filter((q) =>
        examples.some((example) => example.id === q.id)
      )
    )
    expect(result.canonical).toHaveLength(300)
    expect(qualityCollections).toHaveLength(20)
    expect(
      result.audits.every(
        (q) => q.errors.length === 0 && q.requiresClinicalReview
      )
    ).toBe(true)
    const skills = new Set(pillars.map((p) => p.id))
    for (const q of result.canonical) {
      expect(q.primary_competency, q.id).toBeDefined()
      expect(skills.has(q.primary_competency!), q.id).toBe(true)
      expect(q.distractor_evidence).toHaveLength(3)
      expect(q.review_status).toBe('draft')
      expect(q.calibration_status).toBe('uncalibrated')
    }
    expect(
      new Set(qualityDrafts.map((q) => `${q.scenario}|${q.question}`)).size
    ).toBe(300)
    expect(
      new Set(
        qualityDrafts.map((q) =>
          JSON.stringify(q.options.map((o) => o.text).sort())
        )
      ).size
    ).toBe(300)
  })
  it('holds flagged wording out of the curated learner bank without automatically changing its reasoning level', () => {
    const draft = qualityDrafts[0]!
    const option = draft.options[draft.correct]
    const original = option.text
    try {
      option.text = `Always ${original}`
      expect(() => compileQualityBank()).toThrow(
        /Hold flagged items for editorial review/
      )
      expect(draft.level).toBe('foundation')
    } finally {
      option.text = original
    }
  })
  it('creates complete five-question attempts for every topic and level without cross-topic leakage', () => {
    for (const topic of qualityCollections)
      for (const level of ['foundation', 'challenge', 'advanced'] as const) {
        const attempt = createPracticeSession({
          collectionId: topic.id,
          level,
          mode: 'check',
          count: 5,
        })!
        expect(attempt, `${topic.id}/${level}`).not.toBeNull()
        expect(attempt.ids).toHaveLength(5)
        for (const id of attempt.ids) {
          const q = getPracticeQuestion(id)!
          expect(q.collectionId).toBe(topic.id)
          expect(q.level).toBe(level)
          expect(q.review?.schemaVersion).toBe('2.0')
          expect(q.correct).toHaveLength(1)
        }
      }
  })
  it('keeps all retired definitions accessible only through the deployed 196-item revision', () => {
    for (const original of [...reasoningQuestions, ...materialQuestions]) {
      const q = getPracticeQuestion(
        original.id,
        PREVIOUS_PRACTICE_LIBRARY_REVISION
      )!
      expect(q, original.id).toBeDefined()
      expect(q.prompt).toBe(original.prompt)
      expect(q.options).toEqual(original.options)
      expect(q.correct).toEqual(original.correct)
      expect(getPracticeQuestion(original.id)).toBeUndefined()
    }
    expect(PREVIOUS_PRACTICE_LIBRARY_REVISION).not.toBe(
      PRACTICE_LIBRARY_REVISION
    )
    expect(
      getPracticeQuestion(generated[0]!.id, PREVIOUS_PRACTICE_LIBRARY_REVISION)
    ).toBeUndefined()
    expect(
      getPracticeQuestion(
        materialQuestions[0]!.id,
        LEGACY_PRACTICE_LIBRARY_REVISION
      )
    ).toBeUndefined()
  })
  it('restores a prior material draft and score without replacing its questions with new versions', () => {
    const ids = materialQuestions
      .filter(
        (q) => q.collectionId === 'renal-metabolic' && q.level === 'advanced'
      )
      .map((q) => q.id)
    const attempt = {
      ...createPracticeSession({
        collectionId: 'renal-metabolic',
        level: 'advanced',
        mode: 'check',
        count: 5,
      })!,
      revision: PREVIOUS_PRACTICE_LIBRARY_REVISION,
      ids,
    }
    attempt.index = 4
    attempt.complete = true
    attempt.answers = ids.map((id) => ({
      selected: getPracticeQuestion(id, attempt.revision)!.correct[0]!,
      assisted: false,
    }))
    const restored = readPracticeSessions(JSON.stringify([attempt]))[0]!
    expect(restored).toEqual(attempt)
    expect(practiceAttemptRecord(restored)).toMatchObject({
      correct: 5,
      answered: 5,
      revision: PREVIOUS_PRACTICE_LIBRARY_REVISION,
    })
    expect(practiceLibrary).toHaveLength(300)
    expect(practiceLibrary.every((q) => !ids.includes(q.id))).toBe(true)
  })
})
