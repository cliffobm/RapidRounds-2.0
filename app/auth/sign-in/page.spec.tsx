import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SignInPage from './page'

const mocks = vi.hoisted(() => ({ signIn: vi.fn(), replace: vi.fn(), refresh: vi.fn() }))
vi.mock('@/store/useAuth', () => ({ useAuth: { getState: () => ({ signIn: mocks.signIn }) } }))
vi.mock('@/lib/supabase-client', () => ({ supabaseClient: { auth: {} } }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }) }))

async function submit() {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'learner.a@example.com' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-password' } })
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Sign in with email' })) })
}

describe('email sign-in', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.signIn.mockReset() })
  it('signs in and refreshes the server-rendered session', async () => {
    mocks.signIn.mockResolvedValue({})
    render(<SignInPage />)
    await submit()
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/'))
    expect(mocks.signIn).toHaveBeenCalledWith('learner.a@example.com', 'test-password')
    expect(mocks.refresh).toHaveBeenCalledOnce()
  })
  it('keeps invalid credentials on the form and displays the error', async () => {
    mocks.signIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
    render(<SignInPage />)
    await submit()
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid login credentials')
    expect(mocks.replace).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Sign in with email' })).toBeEnabled()
  })
  it('prevents another submission while sign-in is pending', async () => {
    mocks.signIn.mockReturnValue(new Promise(() => {}))
    render(<SignInPage />)
    await submit()
    expect(screen.getByRole('button', { name: 'Sign in with email' })).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
  })
})
