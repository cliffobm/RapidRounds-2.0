// Disposable Auth/Data API simulator for UI tests. Never use for real accounts.
// It exercises PKCE/session cookies but does NOT prove Google consent or hosted RLS.
import http from 'node:http'
import { createHash, randomUUID } from 'node:crypto'

const accounts = new Map()
function addAccount(email, fullName, password = 'test-password', confirmed = true) {
  const id = randomUUID()
  const account = {
    password, confirmed,
    user: { id, email, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: { full_name: fullName }, created_at: '2026-10-14T00:00:00Z' },
    profile: { id, email, full_name: fullName, display_name: null, credentials: [], role: 'student', institution_id: null, subscription_tier: 'free', updated_at: '2026-10-14T00:00:00Z' },
  }
  accounts.set(email, account)
  return account
}
addAccount('learner.a@example.com', 'Learner A')
addAccount('learner.b@example.com', 'Learner B')
const codes = new Map()
const mailbox = new Map()
const json = value => Buffer.from(JSON.stringify(value)).toString('base64url')
function session(account) {
  const expires = Math.floor(Date.now() / 1000) + 3600
  const token = `${json({ alg: 'HS256', typ: 'JWT' })}.${json({ sub: account.user.id, exp: expires, role: 'authenticated' })}.test-signature`
  return { user: account.user, access_token: token, refresh_token: `test-refresh-${account.user.id}`, token_type: 'bearer', expires_in: 3600, expires_at: expires }
}
function createLink(account, redirectTo, challenge, type) {
  const code = randomUUID()
  codes.set(code, { account, challenge, type })
  const link = new URL(redirectTo)
  link.searchParams.set('code', code)
  mailbox.set(account.user.email, { link: link.toString(), type })
  return link.toString()
}

http.createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS')
  const reply = (status, data) => { response.writeHead(status, { 'Content-Type': 'application/json' }); response.end(data === undefined ? undefined : JSON.stringify(data)) }
  if (request.method === 'OPTIONS') return reply(204)
  const url = new URL(request.url, 'http://127.0.0.1:54321')
  if (url.pathname === '/health') return reply(200, { simulator: true })
  if (url.pathname === '/__test/mail') return reply(200, mailbox.get(url.searchParams.get('email')) ?? {})
  let text = ''
  for await (const chunk of request) text += chunk
  const body = text ? JSON.parse(text) : {}
  if (url.pathname === '/auth/v1/settings') return reply(200, { external: { email: true, google: true }, disable_signup: false, mailer_autoconfirm: false })
  if (url.pathname === '/auth/v1/signup') {
    let account = accounts.get(body.email)
    if (!account) account = addAccount(body.email, body.data?.full_name ?? '', body.password, false)
    createLink(account, url.searchParams.get('redirect_to'), body.code_challenge, 'signup')
    return reply(200, account.user)
  }
  if (url.pathname === '/auth/v1/otp' || url.pathname === '/auth/v1/recover') {
    const account = accounts.get(body.email)
    if (account) createLink(account, url.searchParams.get('redirect_to'), body.code_challenge, url.pathname.endsWith('/otp') ? 'magiclink' : 'recovery')
    return reply(200, {})
  }
  if (url.pathname === '/auth/v1/authorize') {
    if (url.searchParams.get('provider') !== 'google') return reply(400, { code: 'provider_disabled' })
    const email = 'google.learner@example.com'
    const account = accounts.get(email) ?? addAccount(email, 'Google Learner')
    const link = createLink(account, url.searchParams.get('redirect_to'), url.searchParams.get('code_challenge'), 'google')
    response.writeHead(302, { Location: link }); response.end(); return
  }
  if (url.pathname === '/auth/v1/token') {
    if (url.searchParams.get('grant_type') === 'pkce') {
      const pending = codes.get(body.auth_code)
      const challenge = createHash('sha256').update(body.code_verifier ?? '').digest('base64url')
      if (!pending || !body.code_verifier || !pending.challenge || challenge !== pending.challenge) return reply(400, { code: 'flow_state_not_found', msg: 'Invalid or used PKCE code' })
      codes.delete(body.auth_code)
      pending.account.confirmed = true
      return reply(200, session(pending.account))
    }
    const account = accounts.get(body.email)
    if (!account || body.password !== account.password) return reply(400, { code: 'invalid_credentials', msg: 'Invalid login credentials' })
    if (!account.confirmed) return reply(400, { code: 'email_not_confirmed', msg: 'Email not confirmed' })
    return reply(200, session(account))
  }
  let account
  try {
    const token = request.headers.authorization?.split(' ')[1]
    const { sub } = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    account = [...accounts.values()].find(value => value.user.id === sub)
  } catch { /* Invalid fixture token. */ }
  if (!account) return reply(401, { message: 'Unauthenticated fixture request' })
  if (url.pathname === '/auth/v1/user') {
    if (request.method === 'PUT' && body.password) account.password = body.password
    return reply(200, account.user)
  }
  if (url.pathname === '/auth/v1/logout') return reply(204)
  if (url.pathname === '/rest/v1/profiles') {
    if (url.searchParams.get('id') !== `eq.${account.user.id}`) return reply(403, { message: 'Wrong account filter' })
    if (request.method === 'PATCH') {
      if (Object.keys(body).some(key => !['full_name', 'display_name', 'credentials'].includes(key))) return reply(403, { message: 'Protected field in payload' })
      Object.assign(account.profile, body, { updated_at: new Date().toISOString() })
    }
    return reply(200, account.profile)
  }
  return reply(404, { message: 'Fixture endpoint not implemented' })
}).listen(54321, '127.0.0.1')
