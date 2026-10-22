import { beforeEach, describe, expect, it } from 'vitest'
import { loadPractice, recordPracticeResponse } from '@/lib/cjis/practice'
import { guidedCases } from './cases'
import { caseRevision } from './case-coaching'
import { evolvingCases, reasoningQuestions } from './evolving-content'
import { evolvingKey, newCaseSession } from './evolving-session'
import { evolvingRevision, questionFor } from './evolving-types'
import { evolvingAttempt } from './attempt-adapters'
import { historyKey } from './attempt-history'
import { contentRevision, learningStoragePrefix } from './sessions'
import {
  createPracticeSession,
  PRACTICE_SESSIONS_KEY,
  practiceAttemptRecord,
} from './practice-session'
import { getPracticeQuestion } from './practice-library'
import { newStudySession, studySessionKey } from './study-session'
import { studyUnits } from './study'
import { readProgress } from './progress'

const story = evolvingCases[0]!
const guided = guidedCases[0]!
const finishedEvolving = () => ({
  ...newCaseSession(story, 'foundation', 'pause', 0, 100),
  index: 5,
  complete: true,
  answers: story.paths[0]!.frames.map((frame) => ({
    selected: [...questionFor(frame, 'foundation').correct],
    rationale: '',
    confidence: 'unsure' as const,
    assisted: false,
    skipped: false,
  })),
})

function saveGuided() {
  localStorage.setItem(
    `${learningStoragePrefix}case:${guided.id}`,
    JSON.stringify({
      revision: guided.revision ?? caseRevision,
      state: {
        index: 5,
        answer: 0,
        responses: [true, true, false, true, true, true],
        complete: true,
      },
    })
  )
}

function saveQuick() {
  const questions = reasoningQuestions.slice(0, 5)
  localStorage.setItem(
    'rapidrounds-quick-v1:5:',
    JSON.stringify({
      revision: evolvingRevision,
      ids: questions.map((question) => question.id),
      index: 4,
      answers: questions.map((question) => question.correct[0]!),
      selected: '',
      complete: true,
      attempt: 1,
    })
  )
}

beforeEach(() => localStorage.clear())

describe('readProgress integration', () => {
  it('recovers canonical older case, question-bank and quick-check results with unknown completion dates', () => {
    localStorage.setItem(
      evolvingKey(story.id),
      JSON.stringify(finishedEvolving())
    )
    saveGuided()
    saveQuick()
    const bank = loadPractice('acute_mi')
    const items = bank.items.slice(0, 5)
    localStorage.setItem(
      `${learningStoragePrefix}practice:acute_mi`,
      JSON.stringify({
        revision: contentRevision(bank),
        state: {
          index: 4,
          finished: true,
          roundNumber: 0,
          definitionUses: 0,
          responses: items.map((item, index) =>
            recordPracticeResponse(
              item,
              bank.version,
              index === 3 ? null : item.correct_option_id,
              100,
              [],
              index === 0 ? 1 : 0
            )
          ),
        },
      })
    )

    const progress = readProgress()
    expect(progress.storageUnavailable).toBe(false)
    expect(progress.attempts.map((attempt) => attempt.kind).sort()).toEqual([
      'evolving-case',
      'guided-case',
      'legacy-practice',
      'quick-check',
    ])
    expect(
      progress.attempts.every(
        (attempt) => attempt.source === 'saved' && attempt.completedAt === null
      )
    ).toBe(true)
    expect(
      progress.attempts.find((attempt) => attempt.kind === 'evolving-case')
    ).toMatchObject({ correct: 6, answered: 6, variant: 'Version A' })
    expect(
      progress.attempts.find((attempt) => attempt.kind === 'legacy-practice')
    ).toMatchObject({ correct: 4, answered: 4, skipped: 1, assisted: 1 })
  })

  it('keeps the tracked completion and its real timestamp instead of adding its saved fallback twice', () => {
    const session = finishedEvolving()
    const tracked = evolvingAttempt(story, session, '2026-10-22T12:00:00.000Z')
    localStorage.setItem(historyKey, JSON.stringify([tracked]))
    localStorage.setItem(evolvingKey(story.id), JSON.stringify(session))
    localStorage.setItem(
      `rapidrounds-evolving-archive:${story.id}`,
      JSON.stringify([session])
    )

    expect(readProgress().attempts).toEqual([tracked])
  })

  it('does not repurpose a practice session update time as an old completion timestamp', () => {
    const session = createPracticeSession({
      mode: 'check',
      count: 5,
      id: 'saved-practice',
      now: '2026-10-21T10:00:00.000Z',
    })!
    const complete = {
      ...session,
      index: 4,
      complete: true,
      updatedAt: '2026-10-22T10:00:00.000Z',
      answers: session.ids.map((id) => ({
        selected: getPracticeQuestion(id)!.correct[0]!,
        assisted: false,
      })),
    }
    localStorage.setItem(PRACTICE_SESSIONS_KEY, JSON.stringify([complete]))

    expect(readProgress().attempts).toEqual([
      expect.objectContaining({
        id: session.id,
        completedAt: null,
        source: 'saved',
      }),
    ])
    const tracked = practiceAttemptRecord(complete)
    localStorage.setItem(historyKey, JSON.stringify([tracked]))
    expect(readProgress().attempts).toEqual([tracked])
  })

  it('isolates corrupt stored entries without hiding other valid saved work', () => {
    saveGuided()
    saveQuick()
    localStorage.setItem(evolvingKey(story.id), '{broken')
    localStorage.setItem(
      `rapidrounds-evolving-archive:${story.id}`,
      JSON.stringify([null, { complete: true }, finishedEvolving()])
    )
    localStorage.setItem(
      historyKey,
      JSON.stringify([{ id: 'invalid', href: 'javascript:alert(1)' }])
    )

    const progress = readProgress()
    expect(progress.storageUnavailable).toBe(false)
    expect(progress.attempts.map((attempt) => attempt.kind).sort()).toEqual([
      'evolving-case',
      'guided-case',
      'quick-check',
    ])
  })

  it('does not let an out-of-range saved timestamp hide later valid activities', () => {
    localStorage.setItem(
      evolvingKey(story.id),
      JSON.stringify(newCaseSession(story, 'foundation', 'pause', 0, 1e30))
    )
    saveGuided()
    saveQuick()

    const progress = readProgress()
    expect(progress.attempts.map((attempt) => attempt.kind).sort()).toEqual([
      'guided-case',
      'quick-check',
    ])
    expect(progress.storageUnavailable).toBe(false)
  })

  it('resumes valid unfinished practice, evolving cases and study activities without awarding completions', () => {
    const practice = createPracticeSession({
      mode: 'guided',
      count: 5,
      id: 'resume-practice',
      now: '2026-10-22T10:00:00.000Z',
    })!
    localStorage.setItem(PRACTICE_SESSIONS_KEY, JSON.stringify([practice]))
    localStorage.setItem(
      evolvingKey(story.id),
      JSON.stringify(newCaseSession(story, 'challenge', 'pause', 0, 100))
    )
    const unit = studyUnits[0]!
    localStorage.setItem(
      studySessionKey(unit.id),
      JSON.stringify(newStudySession(unit, '2026-10-22T11:00:00.000Z'))
    )

    const progress = readProgress()
    expect(progress.attempts).toEqual([])
    expect(progress.unfinished).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'practice',
          href: '/practice?session=resume-practice',
        }),
        expect.objectContaining({
          kind: 'evolving-case',
          href: `/evolving/${story.id}`,
        }),
        expect.objectContaining({
          kind: 'study',
          href: `/study?pillar=${unit.id}`,
        }),
      ])
    )
  })

  it('opens an earlier check through its original storage key even when its question count was customized', () => {
    saveQuick()
    const raw = localStorage.getItem('rapidrounds-quick-v1:5:')!
    expect(raw).toBeTruthy()
    localStorage.removeItem('rapidrounds-quick-v1:5:')
    localStorage.setItem('rapidrounds-quick-v1:10:', raw)
    expect(readProgress().attempts[0]?.href).toBe('/quick-check?count=10')
  })

  it('reports blocked storage without creating or modifying any progress', () => {
    const storage = {
      length: 0,
      key: () => null,
      getItem: () => {
        throw new Error('blocked')
      },
    }
    expect(readProgress(storage)).toEqual({
      attempts: [],
      unfinished: [],
      storageUnavailable: true,
    })
    expect(localStorage.length).toBe(0)
  })
})
