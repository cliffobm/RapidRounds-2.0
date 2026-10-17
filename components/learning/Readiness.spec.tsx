import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GuidedRound } from './RoundsExperience'
import LegacyPractice from '@/components/qbank/LegacyPractice'
import { TransferExperience, PathwayExperience } from './PathwayExperience'
import { guidedCases } from '@/lib/learning/cases'
import { caseRevision } from '@/lib/learning/case-coaching'
import { transferQuestions } from '@/lib/learning/worked-examples'
import {
  activityKey,
  recordActivity,
  readActivities,
} from '@/lib/learning/sessions'

beforeEach(() => localStorage.clear())
afterEach(() => {
  if (vi.isMockFunction(Storage.prototype.setItem))
    vi.mocked(Storage.prototype.setItem).mockRestore()
})
describe('learning continuity and evidence boundaries', () => {
  it('restores a confirmed case answer and its explanations without allowing resubmission', () => {
    const story = guidedCases[0]!
    const view = render(<GuidedRound story={story} />)
    fireEvent.click(screen.getAllByRole('radio')[1]!)
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByText('Why each option matters'))
    expect(
      screen.getByText(story.stages[0]!.explanations![1]!)
    ).toBeInTheDocument()
    view.unmount()
    render(<GuidedRound story={story} />)
    expect(screen.getAllByRole('radio')[1]).toBeChecked()
    screen
      .getAllByRole('radio')
      .forEach((radio) => expect(radio).toBeDisabled())
    expect(screen.queryByRole('button', { name: 'Check answer' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Continue the story' }))
    expect(screen.getByText('Decision 2 of 6')).toBeInTheDocument()
  })
  it('rejects corrupt, inconsistent and outdated case snapshots', () => {
    const key = 'rapidrounds-session-v1:case:sepsis'
    for (const raw of [
      'broken',
      JSON.stringify({ revision: 'old', state: { index: 5 } }),
      JSON.stringify({
        revision: caseRevision,
        state: { index: 4, answer: null, responses: [], complete: true },
      }),
    ]) {
      localStorage.setItem(key, raw)
      const view = render(<GuidedRound story={guidedCases[0]!} />)
      expect(screen.getByText('Decision 1 of 6')).toBeInTheDocument()
      view.unmount()
    }
  })
  it('restores practice after a skipped question and preserves summary counts', () => {
    const view = render(<LegacyPractice initialBank="vascular_disease_core" />)
    fireEvent.click(screen.getByRole('button', { name: 'Skip this question' }))
    view.unmount()
    render(<LegacyPractice initialBank="vascular_disease_core" />)
    expect(screen.getByText('Question 2 of 5')).toBeInTheDocument()
    for (let index = 0; index < 4; index++)
      fireEvent.click(
        screen.getByRole('button', { name: 'Skip this question' })
      )
    expect(
      screen.getByText('0 correct · 0 answered · 5 skipped')
    ).toBeInTheDocument()
  })
  it('restores practice feedback and a completed round without duplicating a response', () => {
    let view = render(<LegacyPractice initialBank="acute_mi" />)
    fireEvent.click(screen.getAllByRole('radio')[1]!)
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    view.unmount()
    view = render(<LegacyPractice initialBank="acute_mi" />)
    expect(screen.getAllByRole('radio')[1]).toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: 'Next question' }))
    for (let index = 0; index < 4; index++)
      fireEvent.click(
        screen.getByRole('button', { name: 'Skip this question' })
      )
    expect(
      screen.getByText('1 correct · 1 answered · 4 skipped')
    ).toBeInTheDocument()
    view.unmount()
    render(<LegacyPractice initialBank="acute_mi" />)
    expect(
      screen.getByText('1 correct · 1 answered · 4 skipped')
    ).toBeInTheDocument()
    expect(readActivities(localStorage.getItem(activityKey))).toHaveLength(1)
  })
  it('continues learning when browser writes are blocked and reports the limit', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    render(<GuidedRound story={guidedCases[0]!} />)
    expect(screen.getByText(/Progress could not be saved/)).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('radio')[0]!)
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(
      screen.getByRole('button', { name: 'Continue the story' })
    ).toBeInTheDocument()
  })
  it('withholds transfer feedback until all choices are committed and preserves the first snapshot', () => {
    const view = render(<TransferExperience />)
    for (let index = 0; index < 3; index++) {
      expect(screen.queryByText(transferQuestions[0]!.rationale)).toBeNull()
      fireEvent.click(
        screen.getAllByRole('radio')[transferQuestions[index]!.correct]!
      )
      fireEvent.click(
        screen.getByRole('button', {
          name:
            index === 2 ? 'Submit final choice' : 'Save choice and continue',
        })
      )
    }
    expect(screen.getByText(/3 of 3 choices matched/)).toBeInTheDocument()
    expect(screen.getByText(/interval is unknown/)).toBeInTheDocument()
    const first = localStorage.getItem(
      'rapidrounds-session-v1:transfer:deterioration'
    )
    view.unmount()
    render(<TransferExperience />)
    expect(screen.queryByRole('radio')).toBeNull()
    expect(
      localStorage.getItem('rapidrounds-session-v1:transfer:deterioration')
    ).toBe(first)
  })
  it.each([1, 72])(
    'labels a check %s hours after the case using its actual recorded interval',
    (hours) => {
      recordActivity({
        id: `case:sepsis:${caseRevision}`,
        title: 'Case',
        href: '/rr/sepsis',
        completedAt: new Date(Date.now() - hours * 3600000).toISOString(),
      })
      render(<TransferExperience />)
      for (let index = 0; index < 3; index++) {
        fireEvent.click(screen.getAllByRole('radio')[0]!)
        fireEvent.click(
          screen.getByRole('button', {
            name:
              index === 2 ? 'Submit final choice' : 'Save choice and continue',
          })
        )
      }
      expect(
        screen.getByText(
          hours < 48
            ? /Treat this as immediate application/
            : /small delayed application signal/
        )
      ).toBeInTheDocument()
    }
  )
  it('does not count replay completions as extra learning activity', () => {
    const activity = {
      id: `case:sepsis:${caseRevision}`,
      title: 'Case',
      href: '/rr/sepsis',
      completedAt: new Date().toISOString(),
    }
    recordActivity(activity)
    recordActivity(activity)
    expect(readActivities(localStorage.getItem(activityKey))).toHaveLength(1)
    render(<PathwayExperience />)
    expect(
      screen.getByRole('link', { name: /Revisit the guided case/ })
    ).toBeInTheDocument()
  })
})
