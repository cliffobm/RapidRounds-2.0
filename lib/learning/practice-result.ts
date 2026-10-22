export type PracticeOutcome = {
  correct: boolean
  skipped?: boolean
  assisted?: boolean
}

export function summarizePractice(outcomes: readonly PracticeOutcome[]) {
  let correct = 0
  let answered = 0
  let unanswered = 0
  let assisted = 0

  for (const outcome of outcomes) {
    if (outcome.skipped) {
      unanswered += 1
      continue
    }

    answered += 1
    if (outcome.correct) correct += 1
    if (outcome.assisted) assisted += 1
  }

  return {
    correct,
    answered,
    incorrect: answered - correct,
    unanswered,
    assisted,
    percentage: answered ? Math.round((correct / answered) * 100) : null,
  }
}
