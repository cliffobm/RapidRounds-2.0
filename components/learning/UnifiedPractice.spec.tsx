import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import UnifiedPractice from './UnifiedPractice'
import {
  getPracticeQuestion,
  practiceCollections,
  practicePool,
  PREVIOUS_PRACTICE_LIBRARY_REVISION,
} from '@/lib/learning/practice-library'
import {
  createPracticeSession,
  PRACTICE_SESSIONS_KEY,
  readPracticeSessions,
  savePracticeSession,
} from '@/lib/learning/practice-session'
import { historyKey, readAttempts } from '@/lib/learning/attempt-history'
import PracticePage from '@/app/practice/page'
import { materialQuestions } from '@/lib/learning/material-questions'
import { loadPractice } from '@/lib/cjis/practice'

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
  it('resumes and scores a retired 196-item revision against its original questions', async () => {
    const ids = materialQuestions
      .filter(
        (q) => q.collectionId === 'renal-metabolic' && q.level === 'advanced'
      )
      .map((q) => q.id)
    const old = {
      ...createPracticeSession({
        id: 'old-material-draft',
        collectionId: 'renal-metabolic',
        level: 'advanced',
        mode: 'check',
        count: 5,
      })!,
      revision: PREVIOUS_PRACTICE_LIBRARY_REVISION,
      ids,
    }
    expect(savePracticeSession(old)).toBe(true)
    render(<UnifiedPractice initialSessionId={old.id} />)
    for (const [index, id] of ids.entries()) {
      const question = getPracticeQuestion(id, old.revision)!
      const correct = question.options.find(
        (o) => o.id === question.correct[0]
      )!
      expect(
        await screen.findByText(question.context, { exact: true })
      ).toBeVisible()
      fireEvent.click(
        screen.getByRole('radio', { name: correct.text, exact: true })
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: index === 4 ? 'Submit check' : 'Save and continue',
          exact: true,
        })
      )
    }
    expect(await screen.findByText('5 of 5 questions correct')).toBeVisible()
    expect(savedSession().revision).toBe(old.revision)
    expect(savedSession().ids).toEqual(ids)
  })
  it('shows searchable topic choices immediately and makes all topics discoverable without a dropdown', async () => {
    render(<UnifiedPractice />)
    expect(await screen.findByText('300 questions available.')).toBeVisible()
    expect(screen.getByText('Selected topic')).toBeVisible()
    expect(
      screen.getByText('Questions from across all clinical areas.')
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: /Mixed topics 300 questions/ })
    ).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(
      screen.getByRole('button', {
        name: `View all ${practiceCollections.length} topics`,
      })
    )
    for (const topic of practiceCollections)
      expect(
        screen.getByRole('button', {
          name: new RegExp(topic.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        })
      ).toBeVisible()
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

  it('starts a topic-specific attempt and preserves the selected draft on resume', async () => {
    const first = render(<UnifiedPractice initialMode="check" />)
    fireEvent.change(
      await screen.findByRole('textbox', { name: 'Search practice topics' }),
      { target: { value: 'respiratory' } }
    )
    fireEvent.click(
      screen.getByRole('button', { name: /Respiratory assessment/ })
    )
    expect(
      screen.getByText('Every question comes from this topic.')
    ).toBeVisible()
    expect(screen.getByRole('button', { name: 'Change topic' })).toHaveFocus()
    expect(
      screen.queryByRole('textbox', { name: 'Search practice topics' })
    ).not.toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Start 5-question check' })
    )
    const session = savedSession()
    expect(session.collectionId).toBe('pulm_template')
    expect(
      session.ids.every(
        (id) => getPracticeQuestion(id)!.collectionId === 'pulm_template'
      )
    ).toBe(true)
    const option = getPracticeQuestion(session.ids[0]!)!.options[1]!
    fireEvent.click(
      screen.getByRole('radio', { name: option.text, exact: true })
    )
    expect(
      screen.queryByRole('button', { name: 'Change topic' })
    ).not.toBeInTheDocument()
    first.unmount()
    render(<UnifiedPractice initialSessionId={session.id} />)
    expect(
      await screen.findByRole('radio', { name: option.text, exact: true })
    ).toBeChecked()
    expect(savedSession().ids).toEqual(session.ids)
    expect(savedSession().collectionId).toBe('pulm_template')
    expect(savedSession().answers).toHaveLength(0)
  })

  it('keeps topic deep links clear and adjusts question counts when a chosen level has only five items', async () => {
    render(
      <UnifiedPractice
        initialCollection="medications-safety"
        initialCount={10}
      />
    )
    expect(
      await screen.findByText('Medication decisions', { exact: true })
    ).toBeVisible()
    expect(screen.getByRole('button', { name: 'Change topic' })).toBeVisible()
    expect(
      screen.queryByRole('textbox', { name: 'Search practice topics' })
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Customize reasoning level'))
    fireEvent.click(
      screen.getByRole('button', { name: 'Advanced', exact: true })
    )
    expect(
      screen.getByRole('button', { name: '10 questions', exact: true })
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: '5 questions', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByText(
        `${practicePool('medications-safety', 'advanced').length} questions available at this level.`
      )
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Change topic' }))
    fireEvent.click(
      screen.getByRole('button', { name: /Mixed topics 300 questions/ })
    )
    expect(
      screen.getByText('Questions from across all clinical areas.')
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Advanced', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: '10 questions', exact: true })
    ).toBeEnabled()
    fireEvent.click(
      screen.getByRole('button', { name: 'Start 5-question guided practice' })
    )
    expect(savedSession().collectionId).toBe('all')
    expect(savedSession().level).toBe('advanced')
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
    const bank = loadPractice('sepsis_septic_shock')
    const reference = bank.items.find((item) => /\bsepsis\b/i.test(item.stem))!
    const referenceQuestion = getPracticeQuestion(
      reference.id,
      PREVIOUS_PRACTICE_LIBRARY_REVISION
    )!
    session.revision = PREVIOUS_PRACTICE_LIBRARY_REVISION
    session.ids = [
      reference.id,
      ...bank.items
        .filter((item) => item.id !== reference.id)
        .map((item) => item.id),
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

  it('offers a full Advanced set in a previously sparse topic and disables only the unavailable ten-question count', async () => {
    render(<UnifiedPractice initialCollection="reasoning:fever-neuro" />)
    expect(
      await screen.findByRole('button', { name: '10 questions', exact: true })
    ).toBeEnabled()
    fireEvent.click(screen.getByText('Customize reasoning level'))
    fireEvent.click(
      screen.getByRole('button', { name: 'Advanced', exact: true })
    )
    expect(
      screen.getByRole('button', { name: 'Start 5-question guided practice' })
    ).toBeEnabled()
    expect(
      screen.getByRole('button', { name: '10 questions', exact: true })
    ).toBeDisabled()
    expect(
      screen.getByText('5 questions available at this level.')
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Change topic' }))
    fireEvent.click(
      screen.getByRole('button', { name: /Mixed topics 300 questions/ })
    )
    expect(
      screen.getByRole('button', { name: 'Start 5-question guided practice' })
    ).toBeEnabled()
    expect(
      screen.getByText('100 questions available at this level.')
    ).toBeVisible()
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
      await screen.findByText('100 questions available at this level.')
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
    expect(await screen.findByText('300 questions available.')).toBeVisible()
    fireEvent.click(screen.getByText('Customize reasoning level'))
    expect(
      screen.getByRole('button', { name: 'All levels', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
  })
  it('uses current levelled questions for a retired unclassified setup link', async () => {
    render(<UnifiedPractice initialLevel="unclassified" />)
    expect(await screen.findByText('300 questions available.')).toBeVisible()
    fireEvent.click(screen.getByText('Customize reasoning level'))
    expect(
      screen.getByRole('button', { name: 'All levels', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.queryByRole('button', { name: 'Level not assigned', exact: true })
    ).not.toBeInTheDocument()
  })
  it('starts a current levelled set after reviewing a completed unclassified attempt', async () => {
    const base = createPracticeSession({
      id: 'old-unclassified-review',
      collectionId: 'pulm_template',
      mode: 'check',
      count: 5,
    })!
    const ids = loadPractice('pulm_template').items.map((q) => q.id)
    const old = {
      ...base,
      revision: PREVIOUS_PRACTICE_LIBRARY_REVISION,
      level: 'unclassified' as const,
      ids,
      complete: true,
      index: 4,
      answers: ids.map((id) => ({
        selected: getPracticeQuestion(id, PREVIOUS_PRACTICE_LIBRARY_REVISION)!
          .correct[0]!,
        assisted: false,
      })),
    }
    expect(savePracticeSession(old)).toBe(true)
    render(<UnifiedPractice initialSessionId={old.id} />)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Start another practice' })
    )
    expect(screen.getByText('15 questions available.')).toBeVisible()
    fireEvent.click(screen.getByText('Customize reasoning level'))
    expect(
      screen.getByRole('button', { name: 'All levels', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Start 5-question check',
        exact: true,
      })
    )
    expect(savedSession().ids.every((id) => id.startsWith('v2-'))).toBe(true)
    expect(savedSession().revision).not.toBe(old.revision)
  })
})
