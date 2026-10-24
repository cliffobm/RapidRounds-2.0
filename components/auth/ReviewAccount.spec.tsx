import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ReviewAccount from './ReviewAccount'

const { signOut, navigate } = vi.hoisted(() => ({
  signOut: vi.fn(),
  navigate: vi.fn(),
}))
vi.mock('@/store/useAuth', () => ({
  useAuth: { getState: () => ({ signOut }) },
}))

beforeEach(() => {
  vi.clearAllMocks()
  signOut.mockResolvedValue(undefined)
})

describe('ReviewAccount', () => {
  it('returns a gated tester to the dedicated login page after signing out', async () => {
    render(
      <ReviewAccount
        navigate={navigate}
        email="colleague@example.com"
        requireSignIn
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith('/tester-login?status=signed-out')
    )
    expect(signOut).toHaveBeenCalledOnce()
  })

  it('shows verified identity with honest progress limits and review links', () => {
    render(<ReviewAccount navigate={navigate} email="colleague@example.com" />)
    expect(
      screen.getByRole('heading', { name: 'Your review account' })
    ).toBeVisible()
    expect(
      screen.getByText('colleague@example.com', { exact: true })
    ).toBeVisible()
    expect(screen.getByText('Progress stays on this device.')).toBeVisible()
    expect(
      screen.getByText(/do not sync between devices or accounts/)
    ).toBeVisible()
    expect(
      screen.getByText(/Signing out does not erase saved practice/)
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Review Home' })).toHaveAttribute(
      'href',
      '/home'
    )
    expect(
      screen.getByRole('link', { name: 'Practice questions →' })
    ).toHaveAttribute('href', '/practice')
    expect(
      screen.getByRole('link', { name: 'View Progress →' })
    ).toHaveAttribute('href', '/progress')
    expect(signOut).not.toHaveBeenCalled()
  })

  it('opens a fresh document on the compatible sign-in route after signing out', async () => {
    render(<ReviewAccount navigate={navigate} email="colleague@example.com" />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith('/auth/sign-in?status=signed-out')
    )
    expect(signOut).toHaveBeenCalledOnce()
  })

  it('keeps a failed sign-out visible and does not navigate as if it succeeded', async () => {
    signOut.mockRejectedValue(new Error('Private backend detail'))
    render(<ReviewAccount navigate={navigate} email="colleague@example.com" />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your session may still be active.'
    )
    expect(screen.queryByText('Private backend detail')).not.toBeInTheDocument()
    expect(navigate).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeEnabled()
  })

  it('prevents repeated sign-out while a request is pending', async () => {
    let resolveSignOut!: () => void
    signOut.mockImplementation(
      () => new Promise<void>((resolve) => (resolveSignOut = resolve))
    )
    render(<ReviewAccount navigate={navigate} email="colleague@example.com" />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    const pending = screen.getByRole('button', { name: 'Signing out…' })
    expect(pending).toBeDisabled()
    fireEvent.click(pending)
    expect(signOut).toHaveBeenCalledOnce()
    resolveSignOut()
    await waitFor(() => expect(navigate).toHaveBeenCalledOnce())
  })
})
