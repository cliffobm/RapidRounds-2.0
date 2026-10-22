import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { evolvingCases } from '@/lib/learning/evolving-content'
import {
  newCaseSession,
  type EvolvingSession,
} from '@/lib/learning/evolving-session'
import { questionFor, type ReasoningLevel } from '@/lib/learning/evolving-types'
import CaseDebrief from './CaseDebrief'

const story = evolvingCases[0]!
const path = story.paths[0]!

function mixedAttempt(level: ReasoningLevel = 'foundation'): EvolvingSession {
  return {
    ...newCaseSession(story, level, 'handoff'),
    complete: true,
    index: 5,
    answers: path.frames.map((frame, index) => {
      const question = questionFor(frame, level)
      const incorrect = question.options.find(
        (option) => !question.correct.includes(option.id)
      )!.id
      return {
        selected:
          index === 4
            ? []
            : index === 5
              ? [...question.correct.slice(1), incorrect]
              : [...question.correct],
        rationale:
          level === 'advanced' && index === 0
            ? 'My priority is the new cognitive change; I would reassess alternative causes and additional evidence.'
            : '',
        confidence: 'confident',
        assisted: index === 1 || index === 4,
        skipped: index === 4,
      }
    }),
  }
}

function decisionRow(container: HTMLElement, index: number) {
  const row = container.querySelectorAll<HTMLDetailsElement>(
    'details.decision-review'
  )[index]
  if (!row) throw new Error(`Decision ${index + 1} was not rendered`)
  return row
}

describe('CaseDebrief', () => {
  it('shows an immediately understandable score and excludes the unanswered handoff', () => {
    render(<CaseDebrief story={story} session={mixedAttempt()} />)

    const score = within(
      screen.getByRole('region', { name: 'Practice result' })
    )
    expect(score.getByText('80%', { exact: true })).toBeInTheDocument()
    expect(
      score.getByText('4 of 5 decisions correct', { exact: true })
    ).toBeInTheDocument()
    expect(score.getByText('Correct', { exact: true })).toBeInTheDocument()
    expect(score.getByText('Incorrect', { exact: true })).toBeInTheDocument()
    expect(score.getByText('Not answered', { exact: true })).toBeInTheDocument()
    expect(
      score.getByText(/Unanswered handoff decisions are excluded/)
    ).toBeInTheDocument()
  })

  it('counts only answered reference use without deducting credit', () => {
    render(<CaseDebrief story={story} session={mixedAttempt()} />)

    const score = within(
      screen.getByRole('region', { name: 'Practice result' })
    )
    expect(score.getByText('80%', { exact: true })).toBeInTheDocument()
    expect(
      score.getByText('Reference support used: 1. No points deducted.')
    ).toBeInTheDocument()
    expect(
      score.queryByText('Reference support used: 2. No points deducted.')
    ).not.toBeInTheDocument()
  })

  it('labels each decision summary as Correct, Incorrect or Not answered', () => {
    const view = render(<CaseDebrief story={story} session={mixedAttempt()} />)

    for (let index = 0; index < 6; index++) {
      const summary = decisionRow(view.container, index).querySelector(
        'summary'
      )!
      expect(
        within(summary).getByText(
          index === 4 ? 'Not answered' : index === 5 ? 'Incorrect' : 'Correct',
          { exact: true }
        )
      ).toBeInTheDocument()
    }
    expect(
      screen.queryByText(/teaching answers? matched/i)
    ).not.toBeInTheDocument()
  })

  it('opens incorrect decisions with the question, selected answer and correct answer', () => {
    const view = render(<CaseDebrief story={story} session={mixedAttempt()} />)
    const question = questionFor(path.frames[5]!, 'foundation')
    const wrong = question.options.find(
      (option) => !question.correct.includes(option.id)
    )!
    const correct = question.options.find((option) =>
      question.correct.includes(option.id)
    )!

    fireEvent.click(
      screen.getByRole('button', { name: 'Review incorrect decisions' })
    )

    const rows = view.container.querySelectorAll<HTMLDetailsElement>(
      'details.decision-review'
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toHaveAttribute('open')
    const row = within(rows[0]!)
    expect(row.getByRole('heading', { name: question.prompt })).toBeVisible()
    expect(
      within(row.getByRole('region', { name: 'Your answer' })).getByText(
        wrong.text,
        { exact: true }
      )
    ).toBeVisible()
    expect(
      within(row.getByRole('region', { name: 'Correct answer' })).getByText(
        correct.text,
        { exact: true }
      )
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Incorrect (1)' })
    ).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'All decisions (6)' }))
    expect(
      view.container.querySelectorAll('details.decision-review')
    ).toHaveLength(6)
  })

  it('explains that an unanswered handoff is excluded without marking it incorrect', () => {
    const view = render(<CaseDebrief story={story} session={mixedAttempt()} />)
    const skipped = decisionRow(view.container, 4)
    fireEvent.click(skipped.querySelector('summary')!)
    const row = within(skipped)

    expect(
      row.getByText(
        'No answer submitted before the handoff. This decision is excluded from your score.',
        { exact: true }
      )
    ).toBeInTheDocument()
    expect(
      row.queryByText('Incorrect', { exact: true })
    ).not.toBeInTheDocument()
    expect(
      row.queryByRole('heading', { name: 'Why your answer was incorrect' })
    ).not.toBeInTheDocument()
    expect(skipped.querySelector('[data-outcome="incorrect"]')).toBeNull()
  })

  it('keeps the Advanced reasoning note distinct from graded answer choices', () => {
    const session = mixedAttempt('advanced')
    const view = render(<CaseDebrief story={story} session={session} />)
    const first = decisionRow(view.container, 0)
    fireEvent.click(first.querySelector('summary')!)
    const row = within(first)

    expect(
      row.getByText('Your reasoning note · not graded', { exact: true })
    ).toBeInTheDocument()
    expect(
      row.getByText(session.answers[0]!.rationale, { exact: true })
    ).toBeInTheDocument()
    expect(screen.getByText('80%', { exact: true })).toBeInTheDocument()
  })
})
