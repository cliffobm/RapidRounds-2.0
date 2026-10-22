import { z } from 'zod'
import { historyKey, readAttempts, type AttemptRecord } from './attempt-history'
import { guidedCases } from './cases'
import { evolvingCases } from './evolving-content'
import { evolvingKey, readCaseSession } from './evolving-session'
import { learningStoragePrefix, readSession } from './sessions'
import { practiceTopics } from './catalog'
import {
  readGuidedSession,
  readLegacyPracticeSession,
  readQuickSession,
} from './legacy-sessions'
import {
  evolvingAttempt,
  guidedAttempt,
  legacyPracticeAttempt,
  quickAttempt,
} from './attempt-adapters'
import {
  PRACTICE_SESSIONS_KEY,
  readPracticeSessions,
  practiceAttemptRecord,
} from './practice-session'
import { studyUnits } from './study'
import { readStudySession, studySessionKey } from './study-session'
import { caseRevision } from './case-coaching'

export type ResumeActivity = {
  id: string
  title: string
  href: string
  kind: AttemptRecord['kind'] | 'study' | 'application'
  detail: string
  updatedAt: string | null
}
export type ProgressSnapshot = {
  attempts: AttemptRecord[]
  unfinished: ResumeActivity[]
  storageUnavailable: boolean
}
export type ProgressStorage = Pick<Storage, 'getItem' | 'key' | 'length'>
function safeTimestamp(value: number): string | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}
export function readProgress(storage?: ProgressStorage): ProgressSnapshot {
  const result: ProgressSnapshot = {
    attempts: [],
    unfinished: [],
    storageUnavailable: false,
  }
  try {
    const saved = storage ?? localStorage
    result.attempts = readAttempts(saved.getItem(historyKey))
    const add = (record: AttemptRecord) => {
      if (!result.attempts.some((item) => item.id === record.id))
        result.attempts.push(record)
    }
    for (const session of readPracticeSessions(
      saved.getItem(PRACTICE_SESSIONS_KEY)
    )) {
      if (session.complete) add(practiceAttemptRecord(session, 'saved'))
      else
        result.unfinished.push({
          id: session.id,
          title: session.title,
          href: `/practice?session=${encodeURIComponent(session.id)}`,
          kind: 'practice',
          detail: `${session.mode === 'check' ? 'Knowledge check' : 'Guided practice'} · Question ${session.index + 1} of ${session.ids.length}`,
          updatedAt: session.updatedAt,
        })
    }
    for (const story of evolvingCases) {
      const current = readCaseSession(
        saved.getItem(evolvingKey(story.id)),
        story
      )
      if (current?.complete) add(evolvingAttempt(story, current))
      else if (current)
        result.unfinished.push({
          id: `evolving:${story.id}`,
          title: story.title,
          href: `/evolving/${story.id}`,
          kind: 'evolving-case',
          detail: `${current.level} · Decision ${current.index + 1} of 6`,
          updatedAt: safeTimestamp(current.lastSeen),
        })
      try {
        const archive = JSON.parse(
          saved.getItem(`rapidrounds-evolving-archive:${story.id}`) ?? '[]'
        )
        if (Array.isArray(archive) && archive.length <= 20)
          for (const value of archive) {
            const session = readCaseSession(JSON.stringify(value), story)
            if (session?.complete) add(evolvingAttempt(story, session))
          }
      } catch {
        /* Ignore a malformed old archive without hiding valid work. */
      }
    }
    for (const story of guidedCases) {
      const session = readGuidedSession(
        saved.getItem(`${learningStoragePrefix}case:${story.id}`),
        story
      )
      if (session?.complete) add(guidedAttempt(story, session))
      else if (session)
        result.unfinished.push({
          id: `guided:${story.id}`,
          title: story.subtitle,
          href: `/rr/${story.id}`,
          kind: 'guided-case',
          detail: `Guided case · Decision ${session.index + 1} of 6`,
          updatedAt: session.startedAt ?? null,
        })
    }
    for (const topic of practiceTopics) {
      const session = readLegacyPracticeSession(
        saved.getItem(`${learningStoragePrefix}practice:${topic.key}`),
        topic.key
      )
      if (session?.finished) add(legacyPracticeAttempt(topic.key, session))
      else if (session)
        result.unfinished.push({
          id: `legacy:${topic.key}`,
          title: topic.title,
          href: `/quiz?bank=${topic.key}`,
          kind: 'legacy-practice',
          detail: `Saved earlier practice · Question ${session.index + 1}`,
          updatedAt: session.startedAt ?? null,
        })
    }
    for (let index = 0; index < Math.min(saved.length, 500); index++) {
      const key = saved.key(index)
      const match = key?.match(/^rapidrounds-quick-v1:(5|10):(.*)$/)
      if (
        !key ||
        !match ||
        (match[2] && !evolvingCases.some((story) => story.topic === match[2]))
      )
        continue
      const session = readQuickSession(saved.getItem(key))
      if (!session) continue
      if (session.complete) add(quickAttempt(session, key, match[2]))
      else
        result.unfinished.push({
          id: key,
          title: match[2] ? `${match[2]} check` : 'Quick check',
          href: `/quick-check?count=${match[1]}${match[2] ? `&topic=${encodeURIComponent(match[2])}` : ''}`,
          kind: 'quick-check',
          detail: `Saved earlier check · Question ${session.index + 1} of ${session.ids.length}`,
          updatedAt: null,
        })
    }
    for (const unit of studyUnits) {
      const session = readStudySession(
        saved.getItem(studySessionKey(unit.id)),
        unit
      )
      if (session && session.phase !== 'complete')
        result.unfinished.push({
          id: `study:${unit.id}`,
          title: unit.title,
          href: `/study?pillar=${unit.id}`,
          kind: 'study',
          detail:
            session.phase === 'learn'
              ? 'Continue lesson'
              : session.phase === 'before'
                ? 'Starting knowledge check'
                : 'Application knowledge check',
          updatedAt: session.updatedAt,
        })
    }
    const application = readSession(
      saved.getItem(`${learningStoragePrefix}transfer:deterioration`),
      caseRevision,
      z
        .object({
          answers: z.array(z.number().int().min(0).max(2)).max(3),
          completedAt: z.string().datetime().nullable(),
          hoursSinceCase: z.number().nonnegative().nullable(),
        })
        .refine((value) =>
          value.answers.length === 3
            ? value.completedAt !== null
            : value.completedAt === null && value.hoursSinceCase === null
        )
    )
    if (
      application &&
      application.answers.length < 3 &&
      application.answers.length > 0
    )
      result.unfinished.push({
        id: 'application:deterioration',
        title: 'Independent application',
        href: '/pathway/transfer',
        kind: 'application',
        detail: `Decision ${application.answers.length + 1} of 3`,
        updatedAt: null,
      })
    result.unfinished.sort(
      (left, right) =>
        (right.updatedAt ? Date.parse(right.updatedAt) : 0) -
        (left.updatedAt ? Date.parse(left.updatedAt) : 0)
    )
  } catch {
    result.storageUnavailable = true
  }
  return result
}
