import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import RapidResponse from './RapidResponse'
import { rapidResponseCases } from '@/lib/learning/rapid-response-content'
import {
  RAPID_RESPONSE_KEY,
  createRapidResponseSession,
  type RapidResponseSession,
} from '@/lib/learning/rapid-response-session'

const story = rapidResponseCases[0]!
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const saved = () =>
  JSON.parse(
    localStorage.getItem(RAPID_RESPONSE_KEY)!
  ) as RapidResponseSession[]

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers({
    toFake: [
      'setInterval',
      'clearInterval',
      'setTimeout',
      'clearTimeout',
      'Date',
      'performance',
    ],
  })
})
afterEach(() => vi.useRealTimers())

function start(mode: 'untimed' | 'challenge' = 'untimed') {
  const view = render(<RapidResponse initialCaseId={story.id} />)
  if (mode === 'challenge')
    fireEvent.click(
      screen.getByRole('radio', { name: 'Response challenge', exact: true })
    )
  fireEvent.click(
    screen.getByRole('button', { name: 'Start case', exact: true })
  )
  return view
}

function choose(
  index: number,
  ids: string[] = story.stages[index]!.question.correct
) {
  const question = story.stages[index]!.question
  for (const id of ids) {
    const option = question.options.find((entry) => entry.id === id)!
    fireEvent.click(
      screen.getByRole(question.correct.length === 1 ? 'radio' : 'checkbox', {
        name: new RegExp(escape(option.text)),
      })
    )
  }
}

describe('Rapid Response practice experience', () => {
  it('makes the countdown optional and offers visible additional time before starting', () => {
    render(<RapidResponse />)
    expect(
      screen.getByRole('link', { name: /Explore the ECG rhythm library/ })
    ).toHaveAttribute('href', '/ecg')
    expect(screen.getAllByRole('button', { name: /^Open / })).toHaveLength(
      rapidResponseCases.length
    )
    fireEvent.click(screen.getByRole('button', { name: `Open ${story.title}` }))
    expect(
      screen.getByRole('radio', { name: 'Untimed practice', exact: true })
    ).toBeChecked()
    expect(
      screen.queryByRole('combobox', { name: 'Practice time allowance' })
    ).not.toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('radio', { name: 'Response challenge', exact: true })
    )
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Practice time allowance' }),
      { target: { value: '2' } }
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Start case', exact: true })
    )
    expect(saved()[0]!.budgetMs).toBe(story.timeBudgetSeconds * 2000)
    expect(
      screen.getByRole('button', { name: 'Enable quiet timing sound' })
    ).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('timer')).toHaveAttribute('aria-live', 'off')
  })

  it('holds explanations until the review and records accuracy independently of time', () => {
    start()
    for (const [index, stage] of story.stages.entries()) {
      expect(
        screen.queryByRole('heading', { name: 'Correct', exact: true })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(stage.question.reflection)
      ).not.toBeInTheDocument()
      act(() => vi.advanceTimersByTime(2000))
      choose(index)
      fireEvent.click(
        screen.getByRole('button', {
          name:
            index === story.stages.length - 1
              ? 'Submit and review'
              : 'Save decision and continue',
        })
      )
    }
    const result = screen.getByRole('region', { name: 'Rapid Response result' })
    expect(
      within(result).getByRole('region', { name: 'Practice result' })
    ).toHaveTextContent('100%')
    expect(result).toHaveTextContent('Active case time')
    expect(result).toHaveTextContent('not a validated measure')
    expect(
      within(result).getAllByRole('region', { name: /^Correct answer/ })
    ).toHaveLength(story.stages.length)
    expect(saved()[0]).toMatchObject({
      complete: true,
      paused: true,
      activeMs: story.stages.length * 2000,
    })
  })

  it('saves a draft and returns explicitly paused without charging time away', () => {
    let view = start()
    choose(0)
    act(() => vi.advanceTimersByTime(3000))
    fireEvent.click(
      screen.getByRole('button', { name: 'Pause case', exact: true })
    )
    const previous = saved()[0]!
    expect(previous.activeMs).toBe(3000)
    expect(previous.selected).toEqual(story.stages[0]!.question.correct)
    view.unmount()
    act(() => vi.advanceTimersByTime(300000))
    view = render(<RapidResponse initialSessionId={previous.id} />)
    expect(screen.getByRole('region', { name: 'Case paused' })).toBeVisible()
    expect(saved()[0]!.activeMs).toBe(3000)
    fireEvent.click(
      screen.getByRole('button', { name: 'Resume case', exact: true })
    )
    for (const id of story.stages[0]!.question.correct) {
      const option = story.stages[0]!.question.options.find(
        (entry) => entry.id === id
      )!
      expect(
        screen.getByRole(
          story.stages[0]!.question.correct.length === 1 ? 'radio' : 'checkbox',
          { name: new RegExp(escape(option.text)) }
        )
      ).toBeChecked()
    }
    act(() => vi.advanceTimersByTime(1000))
    expect(saved()[0]!.activeMs).toBe(4000)
  })

  it('stops at the time target without failing or submitting and lets the learner continue', () => {
    const session = createRapidResponseSession(story.id, { mode: 'challenge' })!
    session.activeMs = session.budgetMs! - 1000
    localStorage.setItem(RAPID_RESPONSE_KEY, JSON.stringify([session]))
    render(<RapidResponse initialSessionId={session.id} />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Resume case', exact: true })
    )
    act(() => vi.advanceTimersByTime(1000))
    const expiry = screen.getByRole('alert', { name: 'Practice time reached' })
    expect(expiry).toHaveTextContent('does not mark this case as failed')
    expect(saved()[0]).toMatchObject({
      complete: false,
      paused: true,
      answers: [],
    })
    expect(
      screen.queryByRole('region', { name: 'Rapid Response result' })
    ).not.toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue without a time limit' })
    )
    expect(screen.getByRole('timer')).toHaveTextContent('Continued')
    expect(saved()[0]).toMatchObject({
      continuedAfterExpiry: true,
      paused: false,
    })
    choose(0)
    fireEvent.click(
      screen.getByRole('button', { name: 'Save decision and continue' })
    )
    expect(saved()[0]!.answers).toHaveLength(1)
  })

  it('keeps early unanswered decisions separate from incorrect answers and does not grade a draft', () => {
    start()
    choose(0)
    fireEvent.click(
      screen.getByRole('button', { name: 'Finish this attempt early' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Finish and review', exact: true })
    )
    const result = screen.getByRole('region', { name: 'Rapid Response result' })
    expect(result).toHaveTextContent('No scored decisions')
    expect(result).toHaveTextContent(
      `${story.stages.length} unanswered decisions`
    )
    expect(saved()[0]).toMatchObject({
      answers: [],
      selected: [],
      complete: true,
    })
  })
})
