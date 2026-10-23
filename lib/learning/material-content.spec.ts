import { describe, it, expect } from 'vitest'
import { materialQuestions, materialCollections } from './material-questions'
import { materialCases } from './material-cases'
import { materialStudyTopics } from './material-study'
import { contentSources } from './sources'
import {
  createPracticeSession,
  readPracticeSessions,
  practiceAttemptRecord,
} from './practice-session'
import {
  LEGACY_PRACTICE_LIBRARY_REVISION,
  getPracticeQuestion,
  practiceLibrary,
  PRACTICE_LIBRARY_REVISION,
} from './practice-library'
import { newCaseSession, readCaseSession } from './evolving-session'
import { questionFor } from './evolving-types'
import {
  clinicalStudyRevision,
  newClinicalStudySession,
  readClinicalStudySession,
} from './clinical-study-session'
describe('new source-informed learning material', () => {
  it('provides usable level-filtered five-question sets and full ten-question topic sets', () => {
    expect(materialQuestions).toHaveLength(60)
    expect(new Set(materialQuestions.map((q) => q.prompt)).size).toBe(60)
    for (const c of materialCollections) {
      expect(
        createPracticeSession({ mode: 'check', count: 10, collectionId: c.id })
      ).not.toBeNull()
      for (const level of ['foundation', 'challenge', 'advanced'] as const) {
        const s = createPracticeSession({
          mode: 'check',
          count: 5,
          collectionId: c.id,
          level,
        })!
        expect(s).not.toBeNull()
        expect(
          s.ids.every((id) => getPracticeQuestion(id)!.level === level)
        ).toBe(true)
      }
    }
    for (const q of materialQuestions) {
      expect(q.correct).toHaveLength(1)
      expect(q.options.some((o) => o.id === q.correct[0])).toBe(true)
      expect(q.options.every((o) => o.explanation.length > 30)).toBe(true)
      expect(q.sources.length).toBeGreaterThan(0)
      expect(
        q.sources.every((id) => contentSources[id]?.url.startsWith('https://'))
      ).toBe(true)
    }
  })
  it('preserves old drafts and scores with their original library revision, and rejects new questions masquerading as old', () => {
    const ids = practiceLibrary
      .filter((q) =>
        getPracticeQuestion(q.id, LEGACY_PRACTICE_LIBRARY_REVISION)
      )
      .slice(0, 5)
      .map((q) => q.id)
    const base = createPracticeSession({
      mode: 'guided',
      count: 5,
      id: 'preserved-attempt',
    })!
    const old = {
      ...base,
      revision: LEGACY_PRACTICE_LIBRARY_REVISION,
      ids,
      selected: getPracticeQuestion(ids[0]!)!.options[1]!.id,
      answers: [],
    }
    expect(readPracticeSessions(JSON.stringify([old]))).toEqual([old])
    const complete = {
      ...old,
      index: 4,
      complete: true,
      selected: '',
      answers: ids.map((id) => ({
        selected: getPracticeQuestion(id)!.correct[0]!,
        assisted: false,
      })),
    }
    const restored = readPracticeSessions(JSON.stringify([complete]))[0]!
    expect(practiceAttemptRecord(restored)).toMatchObject({
      correct: 5,
      answered: 5,
      revision: LEGACY_PRACTICE_LIBRARY_REVISION,
    })
    expect(LEGACY_PRACTICE_LIBRARY_REVISION).not.toBe(PRACTICE_LIBRARY_REVISION)
    expect(
      readPracticeSessions(
        JSON.stringify([
          { ...old, ids: [materialQuestions[0]!.id, ...ids.slice(1)] },
        ])
      )
    ).toEqual([])
    expect(
      readPracticeSessions(JSON.stringify([{ ...old, revision: 'unknown' }]))
    ).toEqual([])
  })
  it('validates both authored paths and every level through a completed new case', () => {
    expect(materialCases).toHaveLength(2)
    for (const story of materialCases)
      for (let attempt = 0; attempt < 2; attempt++)
        for (const level of ['foundation', 'challenge', 'advanced'] as const) {
          const s = newCaseSession(story, level, 'handoff', attempt),
            path = story.paths[attempt]!
          expect(path.frames).toHaveLength(6)
          const complete = {
            ...s,
            index: 5,
            complete: true,
            answers: path.frames.map((f) => ({
              selected: questionFor(f, level).correct,
              rationale: 'My reasoning evaluates the clinical change.',
              confidence: 'unsure' as const,
              assisted: false,
              skipped: false,
            })),
          }
          expect(
            readCaseSession(JSON.stringify(complete), story)
          ).not.toBeNull()
          for (const f of path.frames) {
            const qs = [f.question, f.challenge, f.advanced]
            expect(new Set(qs.map((q) => q.prompt)).size).toBe(3)
            expect(
              qs.every((q) => q.correct.length >= 1 && q.correct.length <= 3)
            ).toBe(true)
          }
        }
  })
  it('rejects forged lesson completions and altered confirmed answers while retaining a valid draft', () => {
    const topic = materialStudyTopics[0]!,
      s = newClinicalStudySession(topic)
    expect(
      readClinicalStudySession(JSON.stringify({ ...s, draft: 1 }), topic)?.draft
    ).toBe(1)
    expect(
      readClinicalStudySession(JSON.stringify({ ...s, complete: true }), topic)
    ).toBeNull()
    expect(
      readClinicalStudySession(
        JSON.stringify({ ...s, answers: [1], draft: 0 }),
        topic
      )
    ).toBeNull()
    expect(
      readClinicalStudySession(JSON.stringify({ ...s, revision: 'old' }), topic)
    ).toBeNull()
    expect(
      readClinicalStudySession(JSON.stringify({ ...s, draft: 99 }), topic)
    ).toBeNull()
    expect(clinicalStudyRevision(topic)).not.toBe(
      clinicalStudyRevision({ ...topic, title: 'Changed content' })
    )
  })
  it('links every lesson to existing new questions and supplies unambiguous scored checks', () => {
    expect(materialStudyTopics).toHaveLength(4)
    for (const topic of materialStudyTopics) {
      expect(topic.sections).toHaveLength(3)
      expect(
        materialQuestions.some(
          (q) => q.collectionId === topic.practiceCollectionId
        )
      ).toBe(true)
      for (const section of topic.sections) {
        expect(section.check.correct).toBeGreaterThanOrEqual(0)
        expect(section.check.correct).toBeLessThan(section.check.options.length)
        expect(new Set(section.check.options).size).toBe(
          section.check.options.length
        )
        expect(section.example.length).toBeGreaterThan(80)
      }
    }
  })
})
