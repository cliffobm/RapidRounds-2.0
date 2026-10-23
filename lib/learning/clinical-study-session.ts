import { z } from 'zod'
import type { ClinicalTopic } from './material-study'
import { contentRevision } from './sessions'
import type { AttemptRecord } from './attempt-history'
export const clinicalStudyKey = (id: string) =>
  `rapidrounds-clinical-study-v1:${id}`
export const clinicalStudyRevision = (topic: ClinicalTopic) =>
  `clinical-study:${contentRevision(topic)}`
const schema = z.object({
  id: z.string().min(6).max(150),
  topicId: z.string(),
  revision: z.string(),
  index: z.number().int().min(0),
  answers: z.array(z.number().int().min(0)).max(20),
  draft: z.number().int().min(0).nullable(),
  complete: z.boolean(),
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type ClinicalStudySession = z.infer<typeof schema>
export function newClinicalStudySession(
  topic: ClinicalTopic
): ClinicalStudySession {
  const now = new Date().toISOString()
  return {
    id: `study:${crypto.randomUUID()}`,
    topicId: topic.id,
    revision: clinicalStudyRevision(topic),
    index: 0,
    answers: [],
    draft: null,
    complete: false,
    startedAt: now,
    updatedAt: now,
  }
}
export function readClinicalStudySession(
  raw: string | null,
  topic: ClinicalTopic
): ClinicalStudySession | null {
  try {
    const result = schema.safeParse(JSON.parse(raw ?? 'null'))
    if (!result.success) return null
    const s = result.data
    if (
      s.topicId !== topic.id ||
      s.revision !== clinicalStudyRevision(topic) ||
      s.index >= topic.sections.length ||
      Date.parse(s.updatedAt) < Date.parse(s.startedAt)
    )
      return null
    if (s.answers.length !== s.index && s.answers.length !== s.index + 1)
      return null
    if (
      s.complete &&
      (s.index !== topic.sections.length - 1 ||
        s.answers.length !== topic.sections.length)
    )
      return null
    if (
      !s.answers.every(
        (answer, index) => answer < topic.sections[index]!.check.options.length
      )
    )
      return null
    if (
      s.draft !== null &&
      s.draft >= topic.sections[s.index]!.check.options.length
    )
      return null
    if (s.answers[s.index] !== undefined && s.draft !== s.answers[s.index])
      return null
    return s
  } catch {
    return null
  }
}
export function clinicalStudyAttempt(
  topic: ClinicalTopic,
  s: ClinicalStudySession
): AttemptRecord {
  return {
    id: s.id,
    kind: 'study',
    contentId: topic.id,
    title: topic.title,
    revision: s.revision,
    level: 'unclassified',
    mode: 'guided',
    variant: '',
    correct: s.answers.filter(
      (answer, index) => answer === topic.sections[index]!.check.correct
    ).length,
    answered: s.answers.length,
    skipped: 0,
    assisted: 0,
    completedAt: s.updatedAt,
    source: 'tracked',
    href: `/study/topics/${topic.id}`,
    skills: [],
  }
}
