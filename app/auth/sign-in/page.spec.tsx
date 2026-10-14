import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SignInPage from './page'

const mocks = vi.hoisted(() => ({ signIn: vi.fn(), signUp: vi.fn(), otp: vi.fn(), reset: vi.fn(), oauth: vi.fn(), replace: vi.fn(), refresh: vi.fn(), search: '' }))
vi.mock('@/store/useAuth', () => ({ useAuth: { getState: () => ({ signIn: mocks.signIn, signUp: mocks.signUp }) } }))
vi.mock('@/lib/supabase-client', () => ({ supabaseClient: { auth: { signInWithOtp: mocks.otp, resetPasswordForEmail: mocks.reset, signInWithOAuth: mocks.oauth } } }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }), useSearchParams: () => new URLSearchParams(mocks.search) }))

function email() { fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'learner.a@example.com' } }) }
async function submit() {
  email()
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-password' } })
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Sign in with email' })) })
}
async function signup() {
  fireEvent.click(screen.getByRole('button', { name: 'Create account', exact: true }))
  email()
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: ' Learner A ' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-password' } })
  fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'test-password' } })
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Create account', exact: true })) })
}

describe('account sign-in options', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;[mocks.signIn, mocks.signUp, mocks.otp, mocks.reset, mocks.oauth].forEach(mock => mock.mockReset())
    vi.stubEnv('NEXT_PUBLIC_AUTH_GOOGLE_ENABLED', 'false')
    mocks.search = ''
  })
  it('signs in and refreshes the server-rendered session', async () => {
    mocks.signIn.mockResolvedValue({})
    render(<SignInPage />)
    await submit()
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/'))
    expect(mocks.signIn).toHaveBeenCalledWith('learner.a@example.com', 'test-password')
    expect(mocks.refresh).toHaveBeenCalledOnce()
  })
  it('honors a protected return path', async () => {
    mocks.search = 'redirectTo=%2Fprofile%3Ftab%3Daccount'
    mocks.signIn.mockResolvedValue({})
    render(<SignInPage />)
    await submit()
    expect(mocks.replace).toHaveBeenCalledWith('/profile?tab=account')
  })
  it('keeps invalid credentials on the form', async () => {
    mocks.signIn.mockResolvedValue({ error: { code: 'invalid_credentials' } })
    render(<SignInPage />)
    await submit()
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid login credentials')
    expect(mocks.replace).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Sign in with email' })).toBeEnabled()
  })
  it('prevents another submission or mode change while sign-in is pending', async () => {
    mocks.signIn.mockReturnValue(new Promise(() => {}))
    render(<SignInPage />)
    await submit()
    expect(screen.getByRole('button', { name: 'Sign in with email' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Create account' })).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
  })
  it('asks for confirmation without treating an unconfirmed signup as signed in', async () => {
    mocks.signUp.mockResolvedValue({ session: null })
    render(<SignInPage />)
    await signup()
    expect(screen.getByRole('status')).toHaveTextContent('Check your email to confirm')
    expect(mocks.replace).not.toHaveBeenCalled()
    expect(mocks.signUp).toHaveBeenCalledWith('learner.a@example.com', 'test-password', { full_name: 'Learner A' }, expect.stringContaining('/auth/callback?next='))
    expect(screen.queryByLabelText('Role')).not.toBeInTheDocument()
  })
  it('continues when signup immediately returns a session', async () => {
    mocks.signUp.mockResolvedValue({ session: { access_token: 'fixture' } })
    render(<SignInPage />)
    await signup()
    expect(mocks.replace).toHaveBeenCalledWith('/')
  })
  it('sends an email link for an existing account without silently creating one', async () => {
    mocks.otp.mockResolvedValue({ error: null })
    render(<SignInPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Email me a sign-in link' }))
    email()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Send sign-in link' })) })
    expect(mocks.otp).toHaveBeenCalledWith({ email: 'learner.a@example.com', options: { shouldCreateUser: false, emailRedirectTo: expect.stringContaining('/auth/callback?next=') } })
    expect(screen.getByRole('status')).toHaveTextContent('If an account exists')
    expect(mocks.replace).not.toHaveBeenCalled()
  })
  it('uses the same neutral notice for an unknown email-link account', async () => {
    mocks.otp.mockResolvedValue({ error: { code: 'otp_disabled' } })
    render(<SignInPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Email me a sign-in link' }))
    email()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Send sign-in link' })) })
    expect(screen.getByRole('status')).toHaveTextContent('If an account exists')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
  it('requests a reset link returning through the session callback to the password editor', async () => {
    mocks.reset.mockResolvedValue({ error: null })
    render(<SignInPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }))
    email()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Send reset link' })) })
    const callback = new URL(mocks.reset.mock.calls[0][1].redirectTo)
    expect(callback.pathname).toBe('/auth/callback')
    expect(callback.searchParams.get('next')).toBe('/auth/reset-password')
    expect(screen.getByRole('status')).toHaveTextContent('If an account exists')
  })
  it('shows rate-limit errors and re-enables the form', async () => {
    mocks.reset.mockResolvedValue({ error: { status: 429 } })
    render(<SignInPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }))
    email()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Send reset link' })) })
    expect(screen.getByRole('alert')).toHaveTextContent('Too many attempts')
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeEnabled()
  })
  it('hides unconfigured social providers', () => {
    render(<SignInPage />)
    expect(screen.queryByRole('button', { name: /Google|GitHub|Discord/ })).not.toBeInTheDocument()
  })
  it('starts configured Google OAuth with the original protected destination', async () => {
    vi.stubEnv('NEXT_PUBLIC_AUTH_GOOGLE_ENABLED', 'true')
    mocks.search = 'redirectTo=%2Fprofile'
    mocks.oauth.mockResolvedValue({ error: null })
    render(<SignInPage />)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' })) })
    const input = mocks.oauth.mock.calls[0][0]
    expect(input.provider).toBe('google')
    expect(new URL(input.options.redirectTo).searchParams.get('next')).toBe('/profile')
  })
  it('recovers from Google configuration failures without an alert dialog', async () => {
    vi.stubEnv('NEXT_PUBLIC_AUTH_GOOGLE_ENABLED', 'true')
    mocks.oauth.mockResolvedValue({ error: { code: 'provider_disabled' } })
    render(<SignInPage />)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' })) })
    expect(screen.getByRole('alert')).toHaveTextContent('Google sign-in is unavailable')
    expect(screen.getByRole('button', { name: 'Sign in with email' })).toBeEnabled()
  })
  it('shows a safe callback failure rather than arbitrary query content', () => {
    mocks.search = 'error=auth_callback_failed&error_description=untrusted'
    render(<SignInPage />)
    expect(screen.getByRole('alert')).toHaveTextContent('invalid, expired, or was already used')
    expect(screen.getByRole('alert')).not.toHaveTextContent('untrusted')
  })
})
