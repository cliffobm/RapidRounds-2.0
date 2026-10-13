// Disposable Auth/Data API simulator for UI tests. This does NOT prove hosted RLS.
import http from 'node:http'

const accounts = new Map(['a', 'b'].map((letter, index) => {
  const id = `00000000-0000-4000-8000-00000000000${index + 1}`
  const email = `learner.${letter}@example.com`
  return [email, {
    user: { id, email, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-10-13T00:00:00Z' },
    profile: { id, full_name: `Learner ${letter.toUpperCase()}`, display_name: null, credentials: [], role: 'student', institution_id: null, subscription_tier: 'free', updated_at: '2026-10-13T00:00:00Z' },
  }]
}))
const json = value => Buffer.from(JSON.stringify(value)).toString('base64url')

http.createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  const reply = (status, data) => { response.writeHead(status, { 'Content-Type': 'application/json' }); response.end(data === undefined ? undefined : JSON.stringify(data)) }
  if (request.method === 'OPTIONS') return reply(204)
  const url = new URL(request.url, 'http://127.0.0.1:54321')
  if (url.pathname === '/health') return reply(200, { simulator: true })
  let text = ''
  for await (const chunk of request) text += chunk
  const body = text ? JSON.parse(text) : {}
  if (url.pathname === '/auth/v1/token') {
    const account = accounts.get(body.email)
    if (!account || body.password !== 'test-password') return reply(400, { msg: 'Invalid login credentials' })
    const expires = Math.floor(Date.now() / 1000) + 3600
    const token = `${json({ alg: 'HS256', typ: 'JWT' })}.${json({ sub: account.user.id, exp: expires, role: 'authenticated' })}.test-signature`
    return reply(200, { user: account.user, access_token: token, refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600, expires_at: expires })
  }
  let account
  try {
    const token = request.headers.authorization?.split(' ')[1]
    const { sub } = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    account = [...accounts.values()].find(value => value.user.id === sub)
  } catch { /* Invalid fixture token. */ }
  if (!account) return reply(401, { message: 'Unauthenticated fixture request' })
  if (url.pathname === '/auth/v1/user') return reply(200, account.user)
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
