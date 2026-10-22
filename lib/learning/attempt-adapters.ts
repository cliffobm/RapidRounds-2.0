import type { AttemptRecord } from './attempt-history'
import type { PillarId } from './pillars'
import { contentRevision } from './sessions'
import { caseRevision } from './case-coaching'
import type { GuidedCase } from './cases'
import type { EvolvingCase } from './evolving-types'
import {
  legacyEvolvingRevision,
  matchesAnswer,
  questionFor,
} from './evolving-types'
import type { EvolvingSession } from './evolving-session'
import type {
  GuidedSession,
  LegacyPracticeSession,
  QuickSession,
} from './legacy-sessions'
import { loadPractice } from '@/lib/cjis/practice'
import type { BankKey } from '@/qbank/banks'
import { practiceTopics } from './catalog'
import { reasoningQuestions } from './evolving-content'

function provenance(completedAt?: string) {
  return {
    completedAt: completedAt ?? null,
    source: completedAt ? ('tracked' as const) : ('saved' as const),
  }
}
function skillsFor(
  values: {
    skill?: PillarId | null | undefined
    correct: boolean
    skipped?: boolean
  }[]
): AttemptRecord['skills'] {
  const counts = new Map<PillarId, { correct: number; answered: number }>()
  for (const value of values) {
    if (!value.skill || value.skipped) continue
    const current = counts.get(value.skill) ?? { correct: 0, answered: 0 }
    current.answered++
    if (value.correct) current.correct++
    counts.set(value.skill, current)
  }
  return [...counts].map(([skill, counts]) => ({ skill, ...counts }))
}
export function evolvingAttempt(
  story: EvolvingCase,
  session: EvolvingSession,
  completedAt?: string
): AttemptRecord {
  const path = story.paths.find((path) => path.id === session.pathId)!
  const outcomes = session.answers.map((answer, index) => ({
    ...answer,
    skill: path.frames[index]!.skill,
    correct:
      !answer.skipped &&
      matchesAnswer(
        questionFor(path.frames[index]!, session.level, session.revision),
        answer.selected
      ),
  }))
  return {
    id: `evolving:${story.id}:${session.revision}:${session.pathId}:${session.level}:${session.attempt}`,
    kind: 'evolving-case',
    contentId: story.id,
    title: story.title,
    revision: session.revision,
    level: session.level,
    mode: 'case',
    variant: `Version ${session.pathId.toUpperCase()}`,
    correct: outcomes.filter((answer) => answer.correct).length,
    answered: outcomes.filter((answer) => !answer.skipped).length,
    skipped: outcomes.filter((answer) => answer.skipped).length,
    assisted: outcomes.filter((answer) => !answer.skipped && answer.assisted)
      .length,
    href: `/evolving/${story.id}`,
    skills: skillsFor(outcomes),
    ...provenance(completedAt),
  }
}
export function guidedAttempt(
  story: GuidedCase,
  session: GuidedSession,
  completedAt?: string
): AttemptRecord {
  return {
    id:
      session.attemptId ??
      `saved:guided:${story.id}:${contentRevision(session.responses)}`,
    kind: 'guided-case',
    contentId: story.id,
    title: story.subtitle,
    revision: story.revision ?? caseRevision,
    level: 'unclassified',
    mode: 'guided',
    variant: '',
    correct: session.responses.filter(Boolean).length,
    answered: session.responses.length,
    skipped: 0,
    assisted: 0,
    href: `/rr/${story.id}`,
    skills: skillsFor(
      session.responses.map((correct, index) => ({
        correct,
        skill: story.stages[index]!.competency,
      }))
    ),
    ...provenance(completedAt),
  }
}
export function legacyPracticeAttempt(
  bankKey: BankKey,
  session: LegacyPracticeSession,
  completedAt?: string
): AttemptRecord {
  const bank = loadPractice(bankKey)
  const items = bank.items.slice(
    session.roundNumber * 5,
    session.roundNumber * 5 + 5
  )
  return {
    id:
      session.attemptId ??
      `saved:legacy:${bankKey}:${session.roundNumber}:${contentRevision(session.responses)}`,
    kind: 'legacy-practice',
    contentId: bankKey,
    title: practiceTopics.find((topic) => topic.key === bankKey)!.title,
    revision: contentRevision(bank),
    level: 'unclassified',
    mode: 'guided',
    variant: `Round ${session.roundNumber + 1}`,
    correct: session.responses.filter((answer) => answer.outcome === 'correct')
      .length,
    answered: session.responses.filter(
      (answer) => answer.outcome !== 'nonresponse'
    ).length,
    skipped: session.responses.filter(
      (answer) => answer.outcome === 'nonresponse'
    ).length,
    assisted: session.responses.filter(
      (answer) =>
        answer.outcome !== 'nonresponse' && answer.definitions_used > 0
    ).length,
    href: `/quiz?bank=${bankKey}`,
    skills: skillsFor(
      session.responses.map((answer, index) => ({
        correct: answer.outcome === 'correct',
        skipped: answer.outcome === 'nonresponse',
        skill: items[index]?.primaryCompetency,
      }))
    ),
    ...provenance(completedAt),
  }
}
export function quickAttempt(
  session: QuickSession,
  storageKey: string,
  topic = '',
  completedAt?: string
): AttemptRecord {
  const questions = session.ids.map(
    (id) => reasoningQuestions.find((question) => question.id === id)!
  )
  const levels = new Set(questions.map((question) => question.level))
  return {
    id: `quick:${contentRevision(storageKey)}:${session.attempt}`,
    kind: 'quick-check',
    contentId: topic || 'all',
    title: topic ? `${topic} check` : 'Mixed quick check',
    revision: legacyEvolvingRevision,
    level: levels.size === 1 ? questions[0]!.level : 'mixed',
    mode: 'check',
    variant: '',
    correct: session.answers.filter((answer, index) =>
      matchesAnswer(questions[index]!, [answer])
    ).length,
    answered: session.answers.length,
    skipped: 0,
    assisted: 0,
    href: `/quick-check?count=${storageKey.match(/^rapidrounds-quick-v1:(5|10):/)?.[1] ?? (session.ids.length === 10 ? 10 : 5)}${topic ? `&topic=${encodeURIComponent(topic)}` : ''}`,
    skills: [],
    ...provenance(completedAt),
  }
}
