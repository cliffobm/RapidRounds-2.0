import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import {
  getPracticeQuestion,
  PREVIOUS_PRACTICE_LIBRARY_REVISION,
} from '@/lib/learning/practice-library'
import { QuestionExplanation } from './PracticeFeedback'
import { compileQuestionV2 } from '@/lib/cjis/question-v2'
import { questionV2ToPractice } from '@/lib/cjis/question-v2-runtime'
import { geneticsQualityQuestions } from '@/lib/learning/quality-banks/genetics'

describe('layered answer feedback', () => {
  it('keeps CJIS authoring evidence out of brief feedback and provides the complete debrief after submission', () => {
    const draft = geneticsQualityQuestions.find(
      (q) => q.id === 'v2-genetics-a-vus'
    )!
    const question = questionV2ToPractice(
      compileQuestionV2(draft),
      draft.sources,
      { title: 'Genetics & shared decisions', category: 'Person-centered care' }
    )
    const mistaken = question.options.find(
      (o) => !question.correct.includes(o.id)
    )!
    const view = render(
      <QuestionExplanation
        question={question}
        selected={[mistaken.id]}
        variant="brief"
      />
    )
    expect(
      screen.queryByRole('region', { name: 'Key cues' })
    ).not.toBeInTheDocument()
    expect(screen.queryByText(question.review!.debrief)).not.toBeInTheDocument()
    view.rerender(
      <QuestionExplanation question={question} selected={[mistaken.id]} />
    )
    expect(screen.getByRole('region', { name: 'Key cues' })).toHaveTextContent(
      question.review!.keyCues[0]!
    )
    expect(
      screen.getByRole('region', { name: 'Clinical reasoning' })
    ).toHaveTextContent(question.review!.reasoning[0]!)
    expect(
      screen.getByRole('region', { name: 'Why your answer was incorrect' })
    ).toHaveTextContent(mistaken.explanation)
    expect(
      screen.getByRole('region', { name: 'Reassessment and uncertainty' })
    ).toHaveTextContent(question.review!.uncertainty!)
    expect(
      screen.getByRole('region', { name: 'Clinical judgment debrief' })
    ).toHaveTextContent(question.review!.debrief)
    expect(
      within(
        screen.getByRole('region', { name: 'Rationale references' })
      ).getAllByRole('link')
    ).toHaveLength(question.review!.references.length)
  })
  it('keeps guided feedback short and reserves the worked example for final review', () => {
    const question = getPracticeQuestion(
      'pulm-demo-1',
      PREVIOUS_PRACTICE_LIBRARY_REVISION
    )!
    const view = render(
      <QuestionExplanation
        question={question}
        selected={['B']}
        variant="brief"
      />
    )
    expect(
      screen.getByRole('heading', { name: 'Correct', exact: true })
    ).toBeVisible()
    expect(
      screen.getByText(/Smaller breaths can reduce lung distension/)
    ).toBeVisible()
    expect(
      screen.queryByRole('region', { name: 'Clinical reasoning' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Worked example' })
    ).not.toBeInTheDocument()
    view.rerender(<QuestionExplanation question={question} selected={['B']} />)
    expect(
      screen.getByRole('region', { name: 'Clinical reasoning' })
    ).toHaveTextContent('V̇E = VT × respiratory rate')
    expect(
      screen.getByRole('region', { name: 'Worked example' })
    ).toHaveTextContent('4.2 L/min')
    expect(
      screen.getByRole('region', { name: 'Worked example' })
    ).toHaveTextContent('3.0 L/min')
    expect(screen.getByRole('region', { name: 'Key terms' })).toHaveTextContent(
      'Plateau pressure'
    )
    expect(
      within(
        screen.getByRole('region', { name: 'Rationale references' })
      ).getAllByRole('link')
    ).toHaveLength(3)
  })

  it('explains the selected wrong option and the limits of the short trauma stem', () => {
    const question = getPracticeQuestion(
      '43fda3ea-d1a3-45ec-95fa-5471fb5c0152',
      PREVIOUS_PRACTICE_LIBRARY_REVISION
    )!
    render(<QuestionExplanation question={question} selected={['D']} />)
    expect(
      screen.getByRole('heading', { name: 'Incorrect', exact: true })
    ).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Why your answer was incorrect' })
    ).toHaveTextContent(
      'transfer to imaging must not delay essential airway support'
    )
    expect(
      screen.getByRole('region', { name: 'Clinical reasoning' })
    ).toHaveTextContent('GCS 12 alone does not decide the procedure')
    expect(
      screen.getByRole('region', { name: 'Context matters' })
    ).toHaveTextContent('catastrophic bleeding')
  })

  it('labels three required answers correctly without turning unanswered work into a wrong answer', () => {
    const question = {
      prompt: 'Synthetic three-choice decision',
      options: ['a', 'b', 'c'].map((id) => ({
        id,
        text: id,
        explanation: `Explanation ${id}`,
      })),
      correct: ['a', 'b', 'c'],
      reflection: 'Review the choices.',
    }
    render(<QuestionExplanation question={question} selected={[]} skipped />)
    expect(
      screen.getByRole('heading', { name: 'Not answered', exact: true })
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Correct answers — all 3 required' })
    ).toBeVisible()
    expect(
      screen.queryByRole('heading', { name: 'Incorrect', exact: true })
    ).not.toBeInTheDocument()
  })
})
