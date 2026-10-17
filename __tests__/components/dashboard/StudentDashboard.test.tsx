import { vi } from 'vitest'
import { getLastInProgressScenario } from '@/lib/db/progress'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StudentDashboard } from '@/components/dashboard/StudentDashboard'
import { User } from '@/types'

// Mock the router
const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock the progress function
vi.mock('@/lib/db/progress', () => ({
  getLastInProgressScenario: vi.fn(),
}))

const mockUser: User = {
  id: 'user1',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  role: 'student',
  institution_id: 'inst1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('StudentDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getLastInProgressScenario).mockResolvedValue(null)
  })

  it('renders dashboard with user information', () => {
    render(<StudentDashboard user={mockUser} />)

    expect(screen.getByText('My Learning Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Welcome back, Test User')).toBeInTheDocument()
  })

  it('renders quick action buttons', () => {
    render(<StudentDashboard user={mockUser} />)

    expect(screen.getByText('Continue Learning')).toBeInTheDocument()
    expect(screen.getByText('View Leaderboard')).toBeInTheDocument()
    expect(screen.getByText('Achievements')).toBeInTheDocument()
  })

  it('navigates to leaderboard when View Leaderboard is clicked', () => {
    render(<StudentDashboard user={mockUser} />)

    const leaderboardButton = screen.getByText('View Leaderboard')
    fireEvent.click(leaderboardButton)

    expect(mockPush).toHaveBeenCalledWith('/leaderboard')
  })

  it('navigates to achievements when Achievements is clicked', () => {
    render(<StudentDashboard user={mockUser} />)

    const achievementsButton = screen.getByText('Achievements')
    fireEvent.click(achievementsButton)

    expect(mockPush).toHaveBeenCalledWith('/achievements')
  })

  it('shows continue learning message when no in-progress scenario', async () => {
    vi.mocked(getLastInProgressScenario).mockResolvedValue(null)

    render(<StudentDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Start a new scenario')).toBeInTheDocument()
    })
  })

  it('shows resume message when in-progress scenario exists', async () => {
    vi.mocked(getLastInProgressScenario).mockResolvedValue({
      progress: { id: 'progress1' },
      scenario: { id: 'scenario1', title: 'Test Scenario' },
    } as any)

    render(<StudentDashboard user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText('Resume: Test Scenario')).toBeInTheDocument()
    })
  })

  it('navigates to scenario when Continue Learning is clicked with in-progress scenario', async () => {
    vi.mocked(getLastInProgressScenario).mockResolvedValue({
      progress: { id: 'progress1' },
      scenario: { id: 'scenario1', title: 'Test Scenario' },
    } as any)

    render(<StudentDashboard user={mockUser} />)

    await waitFor(() => {
      const continueButton = screen.getByText('Continue Learning')
      fireEvent.click(continueButton)
      expect(mockPush).toHaveBeenCalledWith('/scenarios/scenario1')
    })
  })

  it('navigates to scenarios list when Continue Learning is clicked without in-progress scenario', async () => {
    vi.mocked(getLastInProgressScenario).mockResolvedValue(null)

    render(<StudentDashboard user={mockUser} />)

    await waitFor(() => {
      const continueButton = screen.getByText('Continue Learning')
      fireEvent.click(continueButton)
      expect(mockPush).toHaveBeenCalledWith('/scenarios')
    })
  })
})
