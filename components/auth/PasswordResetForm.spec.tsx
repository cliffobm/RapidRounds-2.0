import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PasswordResetForm } from './PasswordResetForm'

const updateUser = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase-client', () => ({ supabaseClient: { auth: { updateUser } } }))
const fill = (confirmation = 'new-password') => {
  fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'new-password' } })
  fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: confirmation } })
}
describe('password recovery', () => {
  beforeEach(() => updateUser.mockReset())
  it('rejects a mismatched confirmation before calling Auth', async () => {
    render(<PasswordResetForm />)
    fill('different-password')
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Update password' })) })
    expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match')
    expect(updateUser).not.toHaveBeenCalled()
  })
  it('updates the session user password, clears the inputs, and provides a profile link', async () => {
    updateUser.mockResolvedValue({ error: null })
    render(<PasswordResetForm />)
    fill()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Update password' })) })
    expect(updateUser).toHaveBeenCalledWith({ password: 'new-password' })
    expect(screen.getByRole('status')).toHaveTextContent('Your password has been updated')
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Continue to profile' })).toHaveAttribute('href', '/profile')
  })
  it('keeps the form usable when a session expires', async () => {
    updateUser.mockResolvedValue({ error: { code: 'session_not_found' } })
    render(<PasswordResetForm />)
    fill()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Update password' })) })
    expect(screen.getByRole('alert')).toHaveTextContent('Request a new reset link')
    expect(screen.getByRole('button', { name: 'Update password' })).toBeEnabled()
  })
})
