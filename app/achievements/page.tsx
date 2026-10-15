'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/store/useAuth'
import { getAchievementsWithStatus, AchievementWithStatus } from '@/lib/db/achievements'
import { 
  TrophyIcon, 
  StarIcon, 
  LockClosedIcon,
  CheckCircleIcon,
  FireIcon,
  AcademicCapIcon,
  HeartIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

export default function AchievementsPage() {
  const { user } = useAuth()
  const [revision, setRevision] = useState(0)
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all')

  useEffect(() => {
    let active = true
    setAchievements([])
    setError(null)
    if (!user) { setLoading(false); return }
    setLoading(true)
    getAchievementsWithStatus(user.id).then(data => { if (active) setAchievements(data) })
      .catch(() => { if (active) setError('Failed to load achievements data') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user?.id, revision])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'scenario': return <AcademicCapIcon className="w-6 h-6" />
      case 'streak': return <FireIcon className="w-6 h-6" />
      case 'achievement': return <StarIcon className="w-6 h-6" />
      case 'social': return <HeartIcon className="w-6 h-6" />
      default: return <TrophyIcon className="w-6 h-6" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'scenario': return 'bg-blue-100 text-blue-600'
      case 'streak': return 'bg-orange-100 text-orange-600'
      case 'achievement': return 'bg-purple-100 text-purple-600'
      case 'social': return 'bg-pink-100 text-pink-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const filteredAchievements = achievements.filter(achievement => {
    switch (filter) {
      case 'earned': return achievement.is_earned
      case 'locked': return !achievement.is_earned
      default: return true
    }
  })

  const earnedCount = achievements.filter(a => a.is_earned).length
  const totalCount = achievements.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cloud to-white dark:from-brand-ink dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-blue dark:text-brand-cloud mb-4">
            Achievements
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track your learning milestones and unlock new badges
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl2 shadow-card p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-orange mb-2">
                {earnedCount}/{totalCount}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Achievements Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {Math.round((earnedCount / totalCount) * 100)}%
              </div>
              <div className="text-gray-600 dark:text-gray-300">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {achievements.filter(a => a.is_earned).reduce((sum, a) => sum + a.points, 0)}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Total Points Earned</div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['all', 'earned', 'locked'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-white dark:bg-gray-600 text-brand-orange shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {filterType === 'all' ? 'All' : filterType === 'earned' ? 'Earned' : 'Locked'}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading achievements...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => setRevision(value => value + 1)}
              className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">No achievements found for the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white dark:bg-gray-800 rounded-xl2 shadow-card p-6 transition-all duration-200 ${
                  achievement.is_earned 
                    ? 'ring-2 ring-green-200 dark:ring-green-800' 
                    : 'opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    achievement.is_earned 
                      ? getCategoryColor(achievement.category)
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                  }`}>
                    {achievement.is_earned ? (
                      getCategoryIcon(achievement.category)
                    ) : (
                      <LockClosedIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-brand-orange">
                      +{achievement.points}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {achievement.name}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {achievement.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{achievement.category}</span>
                    {achievement.is_earned && (
                      <span className="text-green-600 font-medium flex items-center">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Earned
                      </span>
                    )}
                  </div>

                  {achievement.earned_at && (
                    <div className="text-xs text-gray-500">
                      Earned {new Date(achievement.earned_at).toLocaleDateString()}
                    </div>
                  )}

                  {achievement.progress && !achievement.is_earned && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progress</span>
                        <span>{achievement.progress.current}/{achievement.progress.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-brand-orange h-2 rounded-full transition-all duration-300"
                          style={{ width: `${achievement.progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Motivational Message */}
        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Keep learning to unlock more achievements!
          </p>
          <div className="inline-flex items-center space-x-2 text-brand-orange font-medium">
            <span>🏆</span>
            <span>Every scenario completed brings you closer to your next badge!</span>
          </div>
        </div>
      </div>
    </div>
  )
}
