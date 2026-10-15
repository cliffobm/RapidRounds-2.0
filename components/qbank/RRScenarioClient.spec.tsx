import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RRScenarioClient from './RRScenarioClient'
import { getPracticeCase } from '@/lib/rr-catalog'
const mocks = vi.hoisted(() => ({ addXP: vi.fn() }))
vi.mock('@/store/useProgress', () => ({
  useProgress: () => ({ addXP: mocks.addXP }),
}))
vi.mock('@/store/useAuth', () => ({
  useAuth: () => ({ user: null, profile: null }),
}))
vi.mock('@/lib/hooks/useAccess', () => ({
  useRationaleAccess: () => ({ canAccess: false, accessCheck: null }),
}))
beforeEach(() => vi.clearAllMocks())

describe('RR guided practice', () => {
  it('locks each submitted response, completes the recovered case, and starts a clean retry without XP', () => {
    const scenario = getPracticeCase('tavr-conduction')!
    render(<RRScenarioClient scenario={scenario} />)
    for (const [i, q] of scenario.questions.entries()) {
      expect(
        screen.getByRole('button', { name: 'Submit Answer' })
      ).toBeDisabled()
      const choice = q.options![i === 0 ? 1 : 0]!
      fireEvent.click(screen.getByRole('button', { name: choice.text }))
      fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }))
      expect(screen.getByRole('button', { name: choice.text })).toBeDisabled()
      expect(screen.getByText('What changed')).toBeVisible()
      fireEvent.click(
        screen.getByRole('button', {
          name: i === 4 ? 'View practice summary' : 'Next decision',
        })
      )
    }
    expect(screen.getByText('4 / 5')).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Every decision teaches something.' })
    ).toBeVisible()
    expect(mocks.addXP).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Practice again' }))
    expect(
      screen.getByRole('heading', { name: 'Decision 1 of 5' })
    ).toBeVisible()
    expect(screen.getByRole('button', { name: 'Submit Answer' })).toBeDisabled()
  })
  it('allows the existing cardiac ordering decision to submit its displayed sequence and finish', () => {
    const scenario = getPracticeCase('cvd_001')!
    render(<RRScenarioClient scenario={scenario} />)
    for (const q of scenario.questions.slice(0, 2)) {
      fireEvent.click(
        screen.getByRole('button', { name: q.correctAnswers![0]! })
      )
      fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }))
      fireEvent.click(screen.getByRole('button', { name: 'Next decision' }))
    }
    expect(screen.getByRole('button', { name: 'Submit Answer' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'View practice summary' })
    )
    expect(screen.getByText('3 / 3')).toBeVisible()
    expect(mocks.addXP).not.toHaveBeenCalled()
  })
})
