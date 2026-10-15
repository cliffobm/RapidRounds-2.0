import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'
import { AppShell } from './AppShell'

const state = vi.hoisted(() => ({
  user: null as any,
  profile: null,
  loading: true,
  signOut: vi.fn(),
}))
vi.mock('@/store/useAuth', () => ({ useAuth: () => state }))
vi.mock('@/app/providers', () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}))
vi.mock('./FabActions', () => ({ FabActions: () => null }))
afterEach(() => {
  state.user = null
  state.loading = true
})

it('hydrates the shell when cookie restoration changes auth before hydration completes', async () => {
  const container = document.createElement('div')
  document.body.append(container)
  container.innerHTML = renderToString(
    <AppShell>
      <p>Practice content</p>
    </AppShell>
  )
  state.user = {
    id: 'learner',
    email: 'learner@example.test',
    user_metadata: {},
  }
  state.loading = false
  const recover = vi.fn()
  let root: ReturnType<typeof hydrateRoot>
  await act(async () => {
    root = hydrateRoot(
      container,
      <AppShell>
        <p>Practice content</p>
      </AppShell>,
      { onRecoverableError: recover }
    )
  })
  expect(recover).not.toHaveBeenCalled()
  expect(container.textContent).toContain('Sign Out')
  await act(async () => root.unmount())
  container.remove()
})
