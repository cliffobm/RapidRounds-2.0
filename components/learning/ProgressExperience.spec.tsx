import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import type { AttemptRecord } from '@/lib/learning/attempt-history'
import type { ProgressSnapshot } from '@/lib/learning/progress'
import ProgressExperience from './ProgressExperience'

const { readProgressMock } = vi.hoisted(() => ({ readProgressMock: vi.fn() }))
vi.mock('@/lib/learning/progress', () => ({ readProgress: readProgressMock }))

function attempt(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return {
    id: 'first',
    kind: 'evolving-case',
    contentId: 'fever-neuro',
    title: 'The headache',
    revision: '1',
    level: 'foundation',
    mode: 'case',
    variant: 'a',
    correct: 3,
    answered: 6,
    skipped: 0,
    assisted: 0,
    completedAt: '2026-10-21T12:00:00.000Z',
    source: 'tracked',
    href: '/evolving/fever-neuro',
    skills: [],
    ...overrides,
  }
}

function snapshot(overrides: Partial<ProgressSnapshot> = {}): ProgressSnapshot {
  return {
    attempts: [],
    unfinished: [],
    storageUnavailable: false,
    ...overrides,
  }
}

beforeEach(() => {
  readProgressMock.mockReset()
  readProgressMock.mockReturnValue(snapshot())
})

describe('ProgressExperience', () => {
  it('offers useful actions before a learner has completed any practice', () => {
    render(<ProgressExperience />)
    expect(
      screen.getByRole('heading', { name: 'Progress', level: 1 })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Practice questions' })
    ).toHaveAttribute('href', '/practice')
    expect(screen.getByRole('link', { name: 'Choose a case' })).toHaveAttribute(
      'href',
      '/rr'
    )
    expect(
      screen.queryByRole('button', { name: 'Export progress' })
    ).not.toBeInTheDocument()
  })

  it('shows scored counts and compares only identical repeated practice', () => {
    readProgressMock.mockReturnValue(
      snapshot({
        attempts: [
          attempt(),
          attempt({
            id: 'repeat',
            correct: 5,
            assisted: 2,
            completedAt: '2026-10-22T12:00:00.000Z',
          }),
          attempt({
            id: 'advanced',
            level: 'advanced',
            correct: 6,
            completedAt: '2026-10-23T12:00:00.000Z',
          }),
        ],
      })
    )
    render(<ProgressExperience />)
    const cards = screen.getAllByRole('article')
    const repeat = cards.find((card) =>
      within(card).queryByText('Repeat practice · recorded attempt 2', {
        exact: true,
      })
    )!
    const advanced = cards.find((card) =>
      within(card).queryByText(/Advanced · Case practice/)
    )!

    expect(within(repeat).getByText('83%', { exact: true })).toBeInTheDocument()
    expect(
      within(repeat).getByText('5 of 6 answered', { exact: true })
    ).toBeInTheDocument()
    expect(
      within(repeat).getByText(
        '+33 percentage points from your first recorded result (50%).',
        { exact: true }
      )
    ).toBeInTheDocument()
    const references = within(repeat)
      .getByText('Recorded reference use', { exact: true })
      .closest('div')!
    expect(
      within(references).getByText('2', { exact: true })
    ).toBeInTheDocument()
    expect(
      within(advanced).getByText('First recorded attempt', { exact: true })
    ).toBeInTheDocument()
    expect(
      within(advanced).queryByText(/percentage points/)
    ).not.toBeInTheDocument()
  })

  it('keeps saved undated results separate without fabricating first-attempt order', () => {
    readProgressMock.mockReturnValue(
      snapshot({
        attempts: [
          attempt(),
          attempt({
            id: 'saved',
            source: 'saved',
            completedAt: null,
            correct: 6,
          }),
        ],
      })
    )
    render(<ProgressExperience />)
    const saved = within(
      screen.getByRole('region', {
        name: 'Earlier saved results · date unknown',
      })
    )

    expect(saved.getByText('100%', { exact: true })).toBeInTheDocument()
    expect(
      saved.getByText('Saved result · completion date not recorded', {
        exact: true,
      })
    ).toBeInTheDocument()
    expect(
      saved.queryByText('First recorded attempt', { exact: true })
    ).not.toBeInTheDocument()
    expect(saved.queryByText(/Repeat practice/)).not.toBeInTheDocument()
    expect(saved.queryByText(/Oct 21/)).not.toBeInTheDocument()
  })

  it('resumes unfinished study and case work without counting it as completed practice', () => {
    readProgressMock.mockReturnValue(
      snapshot({
        unfinished: [
          {
            id: 'study:recognize_cues',
            title: 'Recognize cues',
            href: '/study?pillar=recognize_cues',
            kind: 'study',
            detail: 'Continue the current learning activity',
            updatedAt: null,
          },
          {
            id: 'evolving:fever-neuro',
            title: 'The headache',
            href: '/evolving/fever-neuro',
            kind: 'evolving-case',
            detail: 'Decision 3 of 6',
            updatedAt: '2026-10-22T12:00:00.000Z',
          },
        ],
      })
    )
    render(<ProgressExperience />)
    expect(
      screen.getByRole('link', { name: 'Resume Recognize cues →' })
    ).toHaveAttribute('href', '/study?pillar=recognize_cues')
    expect(
      screen.getByRole('link', { name: 'Resume The headache →' })
    ).toHaveAttribute('href', '/evolving/fever-neuro')
    const completed = screen
      .getByText('Completed practice attempts', { exact: true })
      .closest('div')!
    expect(
      within(completed).getByText('0', { exact: true })
    ).toBeInTheDocument()
  })

  it('filters by activity, topic and reasoning level without mixing comparison groups', () => {
    readProgressMock.mockReturnValue(
      snapshot({
        attempts: [
          attempt(),
          attempt({ id: 'advanced', level: 'advanced' }),
          attempt({
            id: 'quick',
            kind: 'quick-check',
            contentId: 'circulation',
            title: 'Circulation check',
            mode: 'check',
            variant: '',
            href: '/quick-check',
          }),
        ],
      })
    )
    render(<ProgressExperience />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Activity' }), {
      target: { value: 'quick-check' },
    })
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(
      within(screen.getByRole('article')).getByRole('heading', {
        name: 'Circulation check',
      })
    ).toBeInTheDocument()
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Reasoning level' }),
      { target: { value: 'advanced' } }
    )
    expect(
      screen.getByText(/No results match these filters/)
    ).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox', { name: 'Activity' }), {
      target: { value: 'all' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: 'Topic or case' }), {
      target: { value: JSON.stringify(['evolving-case', 'fever-neuro']) },
    })
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(
      within(screen.getByRole('article')).getByText(/Advanced · Case practice/)
    ).toBeInTheDocument()
  })

  it('offers targeted Study links only for known missed decision skills', () => {
    readProgressMock.mockReturnValue(
      snapshot({
        attempts: [
          attempt({
            skills: [
              { skill: 'recognize_cues', correct: 0, answered: 1 },
              { skill: 'take_action', correct: 1, answered: 1 },
            ],
          }),
        ],
      })
    )
    render(<ProgressExperience />)
    const review = within(
      screen.getByRole('region', { name: 'Review from these results' })
    )
    expect(
      review.getByRole('link', { name: 'Recognize cues →' })
    ).toHaveAttribute('href', '/study?pillar=recognize_cues')
    expect(
      review.getByText('1 answer to revisit', { exact: true })
    ).toBeInTheDocument()
    expect(
      review.queryByRole('link', { name: 'Take action →' })
    ).not.toBeInTheDocument()
  })

  it('refreshes after in-app progress events and cross-tab storage updates', () => {
    render(<ProgressExperience />)
    readProgressMock.mockReturnValue(snapshot({ attempts: [attempt()] }))
    fireEvent(window, new Event('rapidrounds-progress'))
    expect(
      screen.getByRole('heading', { name: 'Practice history' })
    ).toBeInTheDocument()
    readProgressMock.mockReturnValue(snapshot({ storageUnavailable: true }))
    fireEvent(window, new Event('storage'))
    expect(screen.getByRole('status')).toHaveTextContent(
      'Saved progress is unavailable in this browser'
    )
    expect(
      screen.getByRole('link', { name: 'Practice questions' })
    ).toBeInTheDocument()
  })

  it('downloads a local JSON export and releases its temporary URL', () => {
    readProgressMock.mockReturnValue(snapshot({ attempts: [attempt()] }))
    const previousCreate = Object.getOwnPropertyDescriptor(
      URL,
      'createObjectURL'
    )
    const previousRevoke = Object.getOwnPropertyDescriptor(
      URL,
      'revokeObjectURL'
    )
    const create = vi.fn((_blob: Blob) => 'blob:rapidrounds-progress')
    const revoke = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: create,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revoke,
    })
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    vi.useFakeTimers()

    try {
      render(<ProgressExperience />)
      fireEvent.click(screen.getByRole('button', { name: 'Export progress' }))

      expect(create).toHaveBeenCalledWith(expect.any(Blob))
      expect(create.mock.calls[0]?.[0]?.type).toBe('application/json')
      expect(click).toHaveBeenCalledOnce()
      expect(screen.getByRole('status')).toHaveTextContent(
        'Your progress export is ready in your downloads.'
      )
      expect(document.querySelector('a[download]')).toBeNull()
      vi.runAllTimers()
      expect(revoke).toHaveBeenCalledWith('blob:rapidrounds-progress')
    } finally {
      vi.useRealTimers()
      click.mockRestore()
      if (previousCreate)
        Object.defineProperty(URL, 'createObjectURL', previousCreate)
      else Reflect.deleteProperty(URL, 'createObjectURL')
      if (previousRevoke)
        Object.defineProperty(URL, 'revokeObjectURL', previousRevoke)
      else Reflect.deleteProperty(URL, 'revokeObjectURL')
    }
  })
})
