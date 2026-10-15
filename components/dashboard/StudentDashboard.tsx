'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Badge, StudentBadge } from '@/types'
import { getLastInProgressScenario } from '@/lib/db/progress'
import { 
  TrophyIcon, 
  StarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  PlayIcon,
  FireIcon,
  AcademicCapIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'

interface StudentDashboardProps {
  user: User
}

interface StudentStats {
  totalPoints: number
  scenariosCompleted: number
  currentStreak: number
  badgesEarned: number
  averageScore: number
  timeSpent: number
  rank: number
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  // Safety check for user
  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500">No user data available</p>
        </div>
      </div>
    )
  }
  
  return <StudentDashboardContent user={user} />
}

function StudentDashboardContent({ user }: StudentDashboardProps) {
  const router = useRouter()
  const [stats, setStats] = useState<StudentStats>({
    totalPoints: 0,
    scenariosCompleted: 0,
    currentStreak: 0,
    badgesEarned: 0,
    averageScore: 0,
    timeSpent: 0,
    rank: 0
  })
  const [lastInProgressScenario, setLastInProgressScenario] = useState<{
    progress: any
    scenario: any
  } | null>(null)

  const [recentBadges, setRecentBadges] = useState<StudentBadge[]>([
    {
      id: '1',
      student_id: user.id,
      badge_id: 'scenario_master',
      earned_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      student_id: user.id,
      badge_id: 'streak_7',
      earned_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ])

  const [availableBadges] = useState<Badge[]>([
    {
      id: 'scenario_master',
      name: 'Scenario Master',
      description: 'Complete 10 scenarios',
      icon: '🎯',
      criteria: { type: 'scenarios_completed', value: 10 },
      points: 100,
      category: 'scenario'
    },
    {
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      criteria: { type: 'streak_days', value: 7 },
      points: 50,
      category: 'streak'
    },
    {
      id: 'high_scorer',
      name: 'High Scorer',
      description: 'Achieve 90% average score',
      icon: '⭐',
      criteria: { type: 'score_threshold', value: 90 },
      points: 75,
      category: 'achievement'
    }
  ])

  useEffect(() => {
    let active = true
    const loadUserData = async () => {
      try {
        // Load last in-progress scenario
        const lastScenario = await getLastInProgressScenario(user.id)
        if (!active) return
        setLastInProgressScenario(lastScenario)

        // Simulate loading other stats (in real app, these would come from API)
        setStats({
          totalPoints: 1250,
          scenariosCompleted: 8,
          currentStreak: 5,
          badgesEarned: 3,
          averageScore: 87,
          timeSpent: 12.5,
          rank: 2
        })
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    void loadUserData()
    return () => { active = false }
  }, [user.id])

  const getBadgeById = (badgeId: string) => {
    return availableBadges.find(badge => badge.id === badgeId)
  }

  const handleContinueLearning = () => {
    if (lastInProgressScenario) {
      // Navigate to the scenario viewer with the in-progress scenario
      router.push(`/scenarios/${lastInProgressScenario.scenario.id}`)
    } else {
      // No in-progress scenario, go to scenarios list
      router.push('/scenarios')
    }
  }

  const handleViewLeaderboard = () => {
    router.push('/leaderboard')
  }

  const handleViewAchievements = () => {
    router.push('/achievements')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Learning Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.full_name || user.email}</p>
        </div>
        <div className="flex items-center space-x-2">
          <TrophyIcon className="w-6 h-6 text-yellow-500" />
          <span className="text-lg font-semibold text-gray-900">#{stats.rank}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Points</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPoints.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Keep learning to earn more!</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scenarios Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scenariosCompleted}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Great progress!</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{stats.currentStreak} days</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FireIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Keep it up!</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
            </div>
                         <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
               <AcademicCapIcon className="w-6 h-6 text-blue-600" />
             </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Excellent work!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Badges */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrophyIcon className="w-5 h-5 mr-2 text-yellow-500" />
              Recent Badges
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentBadges.map((studentBadge) => {
                const badge = getBadgeById(studentBadge.badge_id)
                if (!badge) return null
                
                return (
                  <div key={studentBadge.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{badge.name}</h4>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                      <p className="text-xs text-gray-500">
                        Earned {new Date(studentBadge.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        +{badge.points} pts
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpenIcon className="w-5 h-5 mr-2 text-blue-500" />
              Learning Progress
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Weekly Goal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Weekly Goal</span>
                  <span className="text-sm text-gray-500">5/7 scenarios</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '71%' }} />
                </div>
              </div>

              {/* Time Spent */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Time Spent This Week</span>
                  <span className="text-sm text-gray-500">{stats.timeSpent}h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '62%' }} />
                </div>
              </div>

              {/* Category Progress */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Category Mastery</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cardiac</span>
                    <span className="text-sm font-medium text-gray-900">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Respiratory</span>
                    <span className="text-sm font-medium text-gray-900">72%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pharmacology</span>
                    <span className="text-sm font-medium text-gray-900">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={handleContinueLearning}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <PlayIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Continue Learning</h3>
          <p className="text-sm text-gray-600">
            {lastInProgressScenario 
              ? `Resume: ${lastInProgressScenario.scenario.title}`
              : 'Start a new scenario'
            }
          </p>
        </button>

        <button 
          onClick={handleViewLeaderboard}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
            <TrophyIcon className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">View Leaderboard</h3>
          <p className="text-sm text-gray-600">See how you rank</p>
        </button>

        <button 
          onClick={handleViewAchievements}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <StarIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Achievements</h3>
          <p className="text-sm text-gray-600">View all your badges</p>
        </button>
      </div>
    </div>
  )
}
