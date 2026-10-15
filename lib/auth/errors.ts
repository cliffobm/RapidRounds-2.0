export function authErrorMessage(error: unknown, fallback: string): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
  const status = error && typeof error === 'object' && 'status' in error ? error.status : undefined
  if (status === 429 || code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }
  if (code === 'invalid_credentials') return 'Invalid login credentials'
  if (code === 'email_not_confirmed') return 'Confirm your email before signing in. Check your inbox and spam folder.'
  if (code === 'weak_password') return 'Choose a stronger password with at least 8 characters.'
  if (code === 'signup_disabled') return 'New accounts are not available right now. Please try again later.'
  return fallback
}
