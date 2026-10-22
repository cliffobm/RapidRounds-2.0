import type { AttemptRecord } from './attempt-history'
import { pillars } from './pillars'

export function practicePercentage(
  attempt: Pick<AttemptRecord, 'correct' | 'answered'>
) {
  return attempt.answered
    ? Math.round((attempt.correct / attempt.answered) * 100)
    : null
}

export function comparisonKey(attempt: AttemptRecord) {
  return JSON.stringify([
    attempt.kind,
    attempt.contentId,
    attempt.revision,
    attempt.variant,
    attempt.level,
    attempt.mode,
    attempt.answered + attempt.skipped,
  ])
}

function recordedDate(attempt: AttemptRecord) {
  if (attempt.source !== 'tracked' || !attempt.completedAt) return null
  const time = Date.parse(attempt.completedAt)
  return Number.isFinite(time) ? time : null
}

export function comparePracticeAttempt(
  attempt: AttemptRecord,
  attempts: readonly AttemptRecord[]
) {
  if (recordedDate(attempt) === null) {
    return {
      label: 'saved' as const,
      number: null,
      first: null,
      previous: null,
      firstChange: null,
      previousChange: null,
    }
  }
  const key = comparisonKey(attempt)
  const comparable = attempts
    .filter(
      (candidate) =>
        recordedDate(candidate) !== null && comparisonKey(candidate) === key
    )
    .sort(
      (a, b) => recordedDate(a)! - recordedDate(b)! || a.id.localeCompare(b.id)
    )
  const index = comparable.findIndex((candidate) => candidate.id === attempt.id)
  const first = index > 0 ? comparable[0]! : null
  const previous = index > 0 ? comparable[index - 1]! : null
  const percentage = practicePercentage(attempt)
  const change = (other: AttemptRecord | null) => {
    const earlier = other ? practicePercentage(other) : null
    return percentage !== null && earlier !== null ? percentage - earlier : null
  }

  return {
    label: index > 0 ? ('repeat' as const) : ('first-recorded' as const),
    number: index >= 0 ? index + 1 : 1,
    first,
    previous,
    firstChange: change(first),
    previousChange: change(previous),
  }
}

export function missedPracticeSkills(attempts: readonly AttemptRecord[]) {
  return pillars
    .map((pillar) => ({
      ...pillar,
      missed: attempts.reduce(
        (count, attempt) =>
          count +
          attempt.skills.reduce(
            (sum, skill) =>
              sum +
              (skill.skill === pillar.id
                ? Math.max(0, skill.answered - skill.correct)
                : 0),
            0
          ),
        0
      ),
    }))
    .filter((pillar) => pillar.missed > 0)
    .sort((a, b) => b.missed - a.missed)
}

export function recentPracticeAttempts(attempts: readonly AttemptRecord[]) {
  return [...attempts].sort(
    (a, b) =>
      (recordedDate(b) ?? -1) - (recordedDate(a) ?? -1) ||
      a.id.localeCompare(b.id)
  )
}
