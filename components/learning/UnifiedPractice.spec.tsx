import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import UnifiedPractice from './UnifiedPractice'
import {
  getPracticeQuestion,
  practiceLibrary,
} from '@/lib/learning/practice-library'
import {
  createPracticeSession,
  PRACTICE_SESSIONS_KEY,
  readPracticeSessions,
  savePracticeSession,
} from '@/lib/learning/practice-session'
import { historyKey, readAttempts } from '@/lib/learning/attempt-history'
import PracticePage from '@/app/practice/page'

const { routerReplace } = vi.hoisted(() => ({ routerReplace: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: routerReplace }),
}))

function savedSession() {
  return readPracticeSessions(localStorage.getItem(PRACTICE_SESSIONS_KEY))[0]!
}
beforeEach(() => {
  localStorage.clear()
  routerReplace.mockClear()
})

describe('UnifiedPractice', () => {
  it('starts with every topic and level available and supports a searchable topic picker', async () => {
    render(<UnifiedPractice />)
    expect(await screen.findByText('196 questions available.')).toBeVisible()
    fireEvent.click(
      screen.getByRole('button', {
        name: /All topics 196 questions/,
      })
    )
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Search practice topics' }),
      { target: { value: 'respiratory' } }
    )
    expect(
      screen.getByRole('button', { name: /Respiratory assessment/ })
    ).toBeVisible()
    expect(
      screen.queryByRole('button', { name: /Heart sounds/ })
    ).not.toBeInTheDocument()
  })

  it('holds all check feedback until the final submission and records one completed attempt', async () => {
    render(
      <UnifiedPractice
        initialCollection="reasoning:fever-neuro"
        initialMode="check"
      />
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'Start 5-question check' })
    )
    for (let index = 0; index < 5; index++) {
      await waitFor(() => expect(savedSession().index).toBe(index))
      const session = savedSession()
      const question = getPracticeQuestion(session.ids[index]!)!
      expect(
        screen.queryByRole('heading', { name: 'Correct', exact: true })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /^Reference:/ })
      ).not.toBeInTheDocument()
      const correct = question.options.find((option) =>
        question.correct.includes(option.id)
      )!
      fireEvent.click(
        screen.getByRole('radio', { name: correct.text, exact: true })
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: index === 4 ? 'Submit check' : 'Save and continue',
        })
      )
    }
    expect(await screen.findByText('100%', { exact: true })).toBeVisible()
    expect(screen.getByText('5 of 5 questions correct')).toBeVisible()
    expect(readAttempts(localStorage.getItem(historyKey))).toHaveLength(1)
    expect(savedSession().complete).toBe(true)
  })

  it('resumes a selected draft and stable question order without revealing check answers', async () => {
    const first = render(<UnifiedPractice initialMode="check" />)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Start 5-question check' })
    )
    const question = getPracticeQuestion(savedSession().ids[0]!)!
    const selected = question.options[1]!
    const optionOrder = screen
      .getAllByRole('radio')
      .map((input) => input.getAttribute('value'))
    fireEvent.click(
      screen.getByRole('radio', { name: selected.text, exact: true })
    )
    const session = savedSession()
    first.unmount()
    render(<UnifiedPractice initialSessionId={session.id} />)
    expect(
      await screen.findByRole('radio', { name: selected.text, exact: true })
    ).toBeChecked()
    expect(
      screen.getAllByRole('radio').map((input) => input.getAttribute('value'))
    ).toEqual(optionOrder)
    expect(
      screen.queryByRole('heading', { name: 'Correct answer' })
    ).not.toBeInTheDocument()
    expect(savedSession().answers).toHaveLength(0)
  })

  it('provides guided glossary support and saves the confirmed answer before advancing', async () => {
    const session = createPracticeSession({
      mode: 'guided',
      count: 5,
      id: 'reference-guided',
    })!
    const referenceQuestion = practiceLibrary.find((question) =>
      /\bsepsis\b/i.test(question.context)
    )!
    session.ids = [
      referenceQuestion.id,
      ...session.ids.filter((id) => id !== referenceQuestion.id),
    ].slice(0, 5)
    savePracticeSession(session)
    render(<UnifiedPractice initialSessionId={session.id} />)
    const trigger = await screen.findAllByRole('button', {
      name: /^Reference: sepsis$/i,
    })
    fireEvent.click(trigger[0]!)
    fireEvent.click(screen.getByRole('button', { name: 'Close reference' }))
    expect(savedSession().assisted).toBe(true)
    const correct = referenceQuestion.options.find((option) =>
      referenceQuestion.correct.includes(option.id)
    )!
    fireEvent.click(
      screen.getByRole('radio', { name: correct.text, exact: true })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }))
    expect(
      await screen.findByRole('heading', { name: 'Correct', exact: true })
    ).toBeVisible()
    expect(savedSession().answers).toEqual([
      { selected: correct.id, assisted: true },
    ])
    expect(savedSession().index).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: 'Next question' }))
    expect(savedSession().index).toBe(1)
    expect(savedSession().selected).toBe('')
    expect(savedSession().assisted).toBe(false)
  })

  it('disables an unavailable ten-question check and offers a broader pool for a narrow level', async () => {
    render(<UnifiedPractice initialCollection="reasoning:fever-neuro" />)
    expect(
      await screen.findByRole('button', { name: '10 questions', exact: true })
    ).toBeDisabled()
    fireEvent.click(screen.getByText('Customize reasoning level'))
    fireEvent.click(
      screen.getByRole('button', { name: 'Advanced', exact: true })
    )
    expect(
      screen.getByRole('button', { name: 'Start 5-question guided practice' })
    ).toBeDisabled()
    fireEvent.click(
      screen.getByRole('button', { name: 'Use all topics and levels' })
    )
    expect(
      screen.getByRole('button', { name: 'Start 5-question guided practice' })
    ).toBeEnabled()
    expect(screen.getByText('196 questions available.')).toBeVisible()
  })

  it('keeps practice usable during the visit when storage fails, without redirecting to an unsaved attempt', async () => {
    render(<UnifiedPractice />)
    const start = await screen.findByRole('button', {
      name: 'Start 5-question guided practice',
    })
    const storageSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota')
      })
    fireEvent.click(start)
    expect((await screen.findAllByRole('radio')).length).toBeGreaterThan(1)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Progress could not be saved'
    )
    expect(routerReplace).not.toHaveBeenCalled()
    storageSpy.mockRestore()
  })

  it('preserves the selected reasoning level through Start another practice and the route remount', async () => {
    const session = createPracticeSession({
      id: 'repeat-advanced',
      mode: 'check',
      count: 5,
      level: 'advanced',
    })!
    session.index = 4
    session.complete = true
    session.answers = session.ids.map((id) => ({
      selected: getPracticeQuestion(id)!.correct[0]!,
      assisted: false,
    }))
    savePracticeSession(session)
    const first = render(<UnifiedPractice initialSessionId={session.id} />)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Start another practice' })
    )
    const url = new URL(
      routerReplace.mock.lastCall![0],
      'https://rapidrounds.local'
    )
    expect(url.searchParams.get('level')).toBe('advanced')
    first.unmount()

    const page = await PracticePage({
      searchParams: Promise.resolve(Object.fromEntries(url.searchParams)),
    })
    render(page)
    expect(
      await screen.findByText('32 questions available at this level.')
    ).toBeVisible()
    fireEvent.click(screen.getByText('Customize reasoning level'))
    expect(
      screen.getByRole('button', { name: 'Advanced', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', {
        name: /^Check Results after the last question$/,
      })
    ).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(
      screen.getByRole('button', { name: 'Start 5-question check' })
    )
    expect(savedSession().id).not.toBe(session.id)
    expect(savedSession().level).toBe('advanced')
  })

  it('validates the route reasoning level and defaults unknown values to All levels', async () => {
    render(
      await PracticePage({ searchParams: Promise.resolve({ level: 'expert' }) })
    )
    expect(await screen.findByText('196 questions available.')).toBeVisible()
    fireEvent.click(screen.getByText('Customize reasoning level'))
    expect(
      screen.getByRole('button', { name: 'All levels', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
  })
})
