import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import TesterSignIn from './TesterSignIn'

const { signIn, replace, refresh } = vi.hoisted(() => ({
  signIn: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}))
vi.mock('@/lib/supabase-client', () => ({
  supabaseClient: { auth: { signInWithPassword: signIn } },
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  signIn.mockResolvedValue({ data: { session: null }, error: null })
})

function submit() {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'colleague@example.com' },
  })
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'tester-password' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('TesterSignIn', () => {
  it('explains unavailable setup and prevents authentication requests', () => {
    render(<TesterSignIn configured={false} />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Tester login is not connected yet.'
    )
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled()
    expect(
      screen.getByRole('link', {
        name: 'Continue reviewing without signing in →',
      })
    ).toHaveAttribute('href', '/home')
    expect(signIn).not.toHaveBeenCalled()
    expect(screen.queryByText(/Continue with Google/)).not.toBeInTheDocument()
  })

  it('signs in a provided account then refreshes verified account state', async () => {
    signIn.mockResolvedValue({
      data: { session: { user: { email: 'colleague@example.com' } } },
      error: null,
    })
    render(<TesterSignIn configured />)
    submit()
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/account'))
    expect(signIn).toHaveBeenCalledOnce()
    expect(signIn).toHaveBeenCalledWith({
      email: 'colleague@example.com',
      password: 'tester-password',
    })
    expect(refresh).toHaveBeenCalledOnce()
    expect(screen.getByLabelText('Password')).toHaveValue('')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows accessible credential feedback without leaking a server message', async () => {
    signIn.mockResolvedValue({
      data: { session: null },
      error: { code: 'invalid_credentials', message: 'private server detail' },
    })
    render(<TesterSignIn configured />)
    submit()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email or password was not recognized.'
    )
    expect(screen.queryByText('private server detail')).not.toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  })

  it('explains account confirmation without attempting to send another email', async () => {
    signIn.mockResolvedValue({
      data: { session: null },
      error: { code: 'email_not_confirmed' },
    })
    render(<TesterSignIn configured />)
    submit()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Contact the review organizer to check your tester account.'
    )
    expect(replace).not.toHaveBeenCalled()
  })

  it('handles an offline connection without claiming successful login', async () => {
    signIn.mockRejectedValue(new TypeError('Failed to fetch'))
    render(<TesterSignIn configured />)
    submit()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Check your connection and try again.'
    )
    expect(replace).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })

  it('does not navigate if the SDK reports success without a session', async () => {
    render(<TesterSignIn configured />)
    submit()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not sign you in.'
    )
    expect(replace).not.toHaveBeenCalled()
  })

  it('prevents duplicate requests while sign-in is pending', async () => {
    let resolveSignIn!: (result: unknown) => void
    signIn.mockImplementation(
      () => new Promise((resolve) => (resolveSignIn = resolve))
    )
    const view = render(<TesterSignIn configured />)
    submit()
    fireEvent.submit(view.container.querySelector('form')!)
    expect(signIn).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled()
    resolveSignIn({
      data: { session: null },
      error: { code: 'invalid_credentials' },
    })
    await screen.findByRole('alert')
  })

  it('offers an accessible password visibility toggle and password manager hints', () => {
    render(<TesterSignIn configured />)
    const password = screen.getByLabelText('Password')
    expect(password).toHaveAttribute('type', 'password')
    expect(password).toHaveAttribute('autocomplete', 'current-password')
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'autocomplete',
      'username'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')
    expect(
      screen.getByRole('button', { name: 'Hide password' })
    ).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(password).toHaveAttribute('type', 'password')
    expect(signIn).not.toHaveBeenCalled()
  })
})
