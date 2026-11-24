import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ItemFeedback from './ItemFeedback'
vi.mock('@/store/useAuth', () => ({
  useAuth: (selector: (s: unknown) => unknown) =>
    selector({ user: { id: 'tester-a' } }),
}))
const item = {
  activity: 'rapid-round' as const,
  itemId: 'breathing-1',
  revision: '2026-11-24.1',
  prompt: 'Which findings matter?',
  patientContext: 'Fictional case',
  selected: ['0:urgent'],
}
beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => vi.unstubAllGlobals())
describe('inline tester feedback', () => {
  it('preserves an unsent draft and never claims delivery on a network failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network unavailable'))
    const onOpen = vi.fn()
    render(<ItemFeedback item={item} onOpenChange={onOpen} />)
    fireEvent.click(screen.getByRole('button', { name: 'Flag this item' }))
    fireEvent.change(screen.getByLabelText('Add a note (optional)'), {
      target: { value: 'Please clarify the previous oxygen setting.' },
    })
    expect(onOpen).toHaveBeenCalledWith(true)
    fireEvent.click(screen.getByRole('button', { name: 'Send flag' }))
    await screen.findByText(/Network unavailable/)
    expect(screen.queryByText(/Received for review/)).not.toBeInTheDocument()
    expect(Object.values(localStorage).join(' ')).toContain('Please clarify')
  })
  it('confirms receipt only after a successful shared save and clears the device draft', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ report: { id: 'receipt', status: 'received' } }),
    } as Response)
    render(<ItemFeedback item={item} />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Suggest a clarification' })
    )
    expect(
      screen.getByRole('button', { name: 'Send suggestion' })
    ).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Your suggestion'), {
      target: { value: 'Add the previous respiratory rate.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send suggestion' }))
    await screen.findByText(/Received for review/)
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0]![1]!.body as string)
    expect(body.itemId).toBe(item.itemId)
    expect(body.revision).toBe(item.revision)
    expect(body.selected).toEqual(item.selected)
    expect(body).not.toHaveProperty('user_id')
    expect(localStorage.length).toBe(0)
  })
  it('keeps drafts separate for different questions and revisions', async () => {
    const view = render(<ItemFeedback item={item} />)
    fireEvent.click(screen.getByRole('button', { name: 'Flag this item' }))
    fireEvent.change(screen.getByLabelText('Add a note (optional)'), {
      target: { value: 'Draft for first question' },
    })
    view.rerender(<ItemFeedback item={{ ...item, itemId: 'breathing-2' }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Flag this item' }))
    expect(screen.getByLabelText('Add a note (optional)')).toHaveValue('')
    view.rerender(<ItemFeedback item={item} />)
    fireEvent.click(screen.getByRole('button', { name: 'Flag this item' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Add a note (optional)')).toHaveValue(
        'Draft for first question'
      )
    )
    view.rerender(<ItemFeedback item={{ ...item, revision: 'later' }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Flag this item' }))
    expect(screen.getByLabelText('Add a note (optional)')).toHaveValue('')
  })
})
