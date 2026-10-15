import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider, useTheme } from './providers'
import { themeInitScript } from '@/lib/theme'
vi.mock('@/store/useAuth', () => ({ useAuth: vi.fn() }))
vi.mock('@/store/useProgress', () => ({ useProgress: vi.fn() }))
function Control() {
  const { isDark, toggleTheme } = useTheme()
  return <button onClick={toggleTheme}>{isDark ? 'Dark' : 'Light'}</button>
}
beforeEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
  vi.clearAllMocks()
})

describe('single html theme state', () => {
  it('cycles stored dark → light → dark and persists the selected mode', () => {
    localStorage.setItem('theme', 'dark')
    const first = render(
      <ThemeProvider>
        <Control />
      </ThemeProvider>
    )
    expect(document.documentElement).toHaveClass('dark')
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }))
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('light')
    fireEvent.click(screen.getByRole('button', { name: 'Light' }))
    first.unmount()
    render(
      <ThemeProvider>
        <Control />
      </ThemeProvider>
    )
    expect(screen.getByRole('button', { name: 'Dark' })).toBeVisible()
  })
  it('responds to another tab changing the theme without leaving a nested dark class', () => {
    render(
      <ThemeProvider>
        <Control />
      </ThemeProvider>
    )
    localStorage.setItem('theme', 'dark')
    act(() =>
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'theme', newValue: 'dark' })
      )
    )
    expect(document.documentElement).toHaveClass('dark')
    localStorage.setItem('theme', 'light')
    act(() =>
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'theme', newValue: 'light' })
      )
    )
    expect(document.documentElement).not.toHaveClass('dark')
    expect(screen.getByRole('button', { name: 'Light' })).toBeVisible()
  })
  it('applies the saved theme before hydration', () => {
    localStorage.setItem('theme', 'dark')
    window.eval(themeInitScript)
    expect(document.documentElement).toHaveClass('dark')
    localStorage.setItem('theme', 'light')
    window.eval(themeInitScript)
    expect(document.documentElement).not.toHaveClass('dark')
  })
})
