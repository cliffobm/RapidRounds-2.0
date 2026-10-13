import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfilePage from './page'

const mocks = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn(), state: { user: { id: 'learner-b', email: 'learner.b@example.com' }, profile: null } as any }))
vi.mock('@/lib/db/account-profile', () => ({ loadAccountProfile: mocks.load, saveAccountProfile: mocks.save }))
vi.mock('@/store/useAuth', () => ({ useAuth: Object.assign((selector: any) => selector(mocks.state), { getState: () => mocks.state, setState: vi.fn() }) }))

const record = { id: 'learner-b', full_name: 'Learner B', display_name: null, credentials: [], role: 'student', institution_id: null, subscription_tier: 'free', updated_at: '2026-10-13' }
async function edit() {
  await screen.findByRole('button', { name: 'Edit Profile' })
  fireEvent.click(screen.getByRole('button', { name: 'Edit Profile' }))
}

describe('real learner profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.state = { user: { id: 'learner-b', email: 'learner.b@example.com' }, profile: null }
    mocks.load.mockResolvedValue(record)
    mocks.save.mockResolvedValue(record)
  })
  it('shows the actual account without sample identity or premium statistics', async () => {
    render(<ProfilePage />)
    await edit()
    expect(mocks.load).toHaveBeenCalledWith('learner-b')
    expect(screen.getByText('learner.b@example.com')).toBeInTheDocument()
    expect(screen.getByText('student')).toBeInTheDocument()
    expect(screen.queryByText('Alex Johnson')).not.toBeInTheDocument()
    expect(screen.queryByText('2,340')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Role')).not.toBeInTheDocument()
  })
  it('saves allowed fields and reloads the returned data on remount', async () => {
    const updated = { ...record, display_name: 'Learner B Test', credentials: ['RN', 'CCRN'] }
    mocks.save.mockResolvedValue(updated)
    const view = render(<ProfilePage />)
    await edit()
    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: ' Learner B Test ' } })
    fireEvent.change(screen.getByLabelText('Credentials'), { target: { value: 'RN, CCRN, RN' } })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save Profile' })) })
    expect(mocks.save).toHaveBeenCalledWith('learner-b', { full_name: 'Learner B', display_name: 'Learner B Test', credentials: ['RN', 'CCRN'] })
    expect(await screen.findByText('Profile saved.')).toBeInTheDocument()
    view.unmount()
    mocks.load.mockResolvedValue(updated)
    render(<ProfilePage />)
    await edit()
    expect(screen.getByLabelText('Display name')).toHaveValue('Learner B Test')
  })
  it('keeps edits available after a denied save', async () => {
    mocks.save.mockRejectedValue({ message: 'permission denied' })
    render(<ProfilePage />)
    await edit()
    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Unsaved name' } })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save Profile' })) })
    expect(await screen.findByRole('alert')).toHaveTextContent('Profile was not saved. permission denied')
    expect(screen.getByLabelText('Display name')).toHaveValue('Unsaved name')
    expect(screen.queryByText('Profile saved.')).not.toBeInTheDocument()
  })
  it('cancel discards edits and makes no write', async () => {
    render(<ProfilePage />)
    await edit()
    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Unsaved' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await edit()
    expect(screen.getByLabelText('Display name')).toHaveValue('')
    expect(mocks.save).not.toHaveBeenCalled()
  })
  it('offers a retry for missing profiles rather than a sample record', async () => {
    mocks.load.mockRejectedValueOnce({ message: 'No profile row' })
    render(<ProfilePage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('No profile row')
    expect(screen.queryByText('Alex Johnson')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await screen.findByRole('button', { name: 'Edit Profile' })
  })
  it('clears the previous learner while the new account loads', async () => {
    const view = render(<ProfilePage />)
    await screen.findByRole('button', { name: 'Edit Profile' })
    mocks.state.user = { id: 'learner-a', email: 'learner.a@example.com' }
    let resolve!: (value: any) => void
    mocks.load.mockReturnValueOnce(new Promise(done => { resolve = done }))
    view.rerender(<ProfilePage />)
    expect(screen.queryByText('learner.b@example.com')).not.toBeInTheDocument()
    await act(async () => { resolve({ ...record, id: 'learner-a', full_name: 'Learner A' }) })
    await waitFor(() => expect(screen.getByText('learner.a@example.com')).toBeInTheDocument())
  })
})
