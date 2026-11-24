import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FeedbackReports from './FeedbackReports'

const identity = vi.hoisted(() => ({ id: 'tester-a' }))
vi.mock('@/store/useAuth', () => ({
  useAuth: (selector: (s: unknown) => unknown) =>
    selector({ user: { id: identity.id } }),
}))
const fetchMock = vi.fn()
const report = {
  id: 'b8c495e6-959a-4cd7-8572-f3952f376a4c',
  item_id: 'breathing-1',
  item_revision: '2026-11-24.1',
  activity: 'rapid-round',
  prompt: 'Which findings need review?',
  patient_context: 'Jordan is newly confused.',
  selected: ['0:urgent'],
  phase: 'before',
  kind: 'flag',
  reason: 'wording',
  comment: 'Please clarify the baseline.',
  status: 'received',
  reviewer_note: '',
  created_at: '2026-11-24T12:00:00Z',
  reviewed_at: null,
}
const response = (reports = [report], reviewer = false) => ({
  ok: true,
  json: async () => ({ reports, reviewer }),
})
beforeEach(() => {
  identity.id = 'tester-a'
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})
afterEach(() => vi.unstubAllGlobals())

describe('private tester reports and reviewer queue', () => {
  it('shows a tester their reports without reviewer controls', async () => {
    fetchMock.mockResolvedValue(response())
    render(<FeedbackReports />)
    expect(
      await screen.findByText('Please clarify the baseline.')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Your item feedback' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Save review' })
    ).not.toBeInTheDocument()
  })
  it('saves only the review status and explanation for a designated reviewer', async () => {
    fetchMock
      .mockResolvedValueOnce(response([report], true))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ report: { id: report.id } }),
      })
      .mockResolvedValue(response([report], true))
    render(<FeedbackReports />)
    fireEvent.change(await screen.findByLabelText('Reviewer explanation'), {
      target: { value: 'Baseline will be clarified.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save review' }))
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/item-feedback',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            id: report.id,
            status: 'reviewing',
            reviewerNote: 'Baseline will be clarified.',
          }),
        })
      )
    )
    expect(await screen.findByText('Review saved.')).toBeInTheDocument()
  })
  it('clears another account’s visible reports immediately on an account change', async () => {
    fetchMock
      .mockResolvedValueOnce(response())
      .mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Sign in to view feedback.' }),
      })
    const view = render(<FeedbackReports />)
    await screen.findByText('Please clarify the baseline.')
    identity.id = 'tester-b'
    view.rerender(<FeedbackReports />)
    expect(
      screen.queryByText('Please clarify the baseline.')
    ).not.toBeInTheDocument()
    expect(
      await screen.findByText('Sign in to view feedback.')
    ).toBeInTheDocument()
  })
})
