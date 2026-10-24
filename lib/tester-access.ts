// Shared redirect validation; contains no credentials or server configuration.
export const TESTER_REVIEW_HOST =
  'rapidrounds-cjis-review-git-aee10c-benjamin-cliffords-projects.vercel.app'
const destinations =
  /^\/(?:home|account|profile|settings|progress|achievements|leaderboard|practice|quiz|quick-check|glossary|ecg|rapid-response|rr(?:\/[a-z0-9-]+)?|evolving\/[a-z0-9-]+|study(?:\/(?:topics\/[a-z0-9-]+|cardiac-fundamentals|wound-care))?|pathway(?:\/transfer)?|review|review-guide|content-review|scenario-library|scenarios?\/[a-z0-9-]+|test(?:\/[a-z0-9-]+)?|reference\/[a-z0-9-]+)$/

export function safeTesterDestination(value: unknown): string {
  if (
    typeof value !== 'string' ||
    value.length > 2000 ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  )
    return '/home'
  try {
    const url = new URL(value, 'https://rapidrounds.local')
    if (
      url.origin !== 'https://rapidrounds.local' ||
      url.pathname.includes('%') ||
      (url.pathname !== '/' && !destinations.test(url.pathname))
    )
      return '/home'
    return url.pathname + url.search + url.hash
  } catch {
    return '/home'
  }
}

export function isPublicTesterResource(
  pathname: string,
  search: string
): boolean {
  if (pathname.startsWith('/_next/static/')) return true
  if (
    [
      '/brand/rapidrounds-metallic.png',
      '/brand/rapidrounds-logo.svg',
      '/favicon.ico',
    ].includes(pathname)
  )
    return true
  if (pathname === '/_next/image') {
    const query = new URLSearchParams(search)
    return (
      query.getAll('url').length === 1 &&
      [
        '/brand/rapidrounds-metallic.png',
        '/brand/rapidrounds-logo.svg',
      ].includes(query.get('url') ?? '')
    )
  }
  return false
}

export const testerPublicPages = [
  '/tester-login',
  '/auth/sign-in',
  '/auth/callback',
  '/auth',
]
