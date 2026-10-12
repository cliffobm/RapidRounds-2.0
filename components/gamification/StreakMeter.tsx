'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  Flame, 
  Calendar, 
  Target, 
  TrendingUp, 
  Award,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Trophy
} from 'lucide-react'

export interface StreakData {
  current: number
  longest: number
  lastActivity: Date
  isActive: boolean
  target: number
  weeklyGoal: number
  weeklyProgress: number
  streakHistory: Array<{
    date: Date
    completed: boolean
    activities: string[]
  }>
}

interface StreakMeterProps {
  streakData: StreakData
  onStartActivity?: () => void
  variant?: 'full' | 'compact' | 'widget'
  showHistory?: boolean
  className?: string
}

export function StreakMeter({ 
  streakData, 
  onStartActivity,
  variant = 'full',
  showHistory = true,
  className = '' 
}: StreakMeterProps) {
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-600 bg-purple-100'
    if (streak >= 14) return 'text-orange-600 bg-orange-100'
    if (streak >= 7) return 'text-yellow-600 bg-yellow-100'
    if (streak >= 3) return 'text-green-600 bg-green-100'
    return 'text-slate-600 bg-slate-100'
  }

  const getStreakTitle = (streak: number) => {
    if (streak >= 30) return 'Streak Master!'
    if (streak >= 14) return 'On Fire!'
    if (streak >= 7) return 'Week Warrior'
    if (streak >= 3) return 'Getting Started'
    return 'New Streak'
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '👑'
    if (streak >= 14) return '🔥'
    if (streak >= 7) return '⚡'
    if (streak >= 3) return '🌟'
    return '🎯'
  }

  const isStreakAtRisk = () => {
    const now = new Date()
    const lastActivity = new Date(streakData.lastActivity)
    const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)
    return hoursSinceLastActivity > 20 && streakData.isActive // At risk if no activity for 20+ hours
  }

  const getDaysUntilTarget = () => {
    return Math.max(0, streakData.target - streakData.current)
  }

  const getWeeklyProgressPercentage = () => {
    return Math.min(100, (streakData.weeklyProgress / streakData.weeklyGoal) * 100)
  }

  if (variant === 'widget') {
    return (
      <Card className={`hover:shadow-md transition-all duration-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${getStreakColor(streakData.current)}`}>
              <Flame className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {streakData.current} Day Streak
                </h3>
                <span className="text-lg">{getStreakEmoji(streakData.current)}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getStreakTitle(streakData.current)}
              </p>
              {isStreakAtRisk() && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="w-3 h-3 text-warning" />
                  <span className="text-xs text-warning">Streak at risk!</span>
                </div>
              )}
            </div>
            {onStartActivity && (
              <Button size="sm" onClick={onStartActivity}>
                Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Current Streak */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${getStreakColor(streakData.current)}`}>
              <Flame className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {streakData.current}
              <span className="text-lg ml-1 text-slate-500">days</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              {getStreakTitle(streakData.current)} {getStreakEmoji(streakData.current)}
            </p>
            {isStreakAtRisk() && (
              <Badge variant="warning" className="mb-4">
                <AlertCircle className="w-3 h-3 mr-1" />
                Streak at risk
              </Badge>
            )}
            {onStartActivity && (
              <Button onClick={onStartActivity} className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Keep Streak Alive
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Weekly Goal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Progress</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {streakData.weeklyProgress}/{streakData.weeklyGoal} days
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <motion.div 
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getWeeklyProgressPercentage()}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {Math.round(getWeeklyProgressPercentage())}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Full variant
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${getStreakColor(streakData.current)}`}>
              <Flame className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {streakData.current}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Current Streak</p>
            <p className="text-xs text-slate-500 mt-2">
              {getStreakTitle(streakData.current)} {getStreakEmoji(streakData.current)}
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-warning/10">
              <Trophy className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {streakData.longest}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Longest Streak</p>
            <p className="text-xs text-slate-500 mt-2">Personal record</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-primary/10">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {getDaysUntilTarget()}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Days to Target</p>
            <p className="text-xs text-slate-500 mt-2">Goal: {streakData.target} days</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Weekly Progress</span>
            </div>
            <Badge variant="outline">
              {streakData.weeklyProgress}/{streakData.weeklyGoal} days
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
              <motion.div 
                className="bg-gradient-to-r from-primary to-accent h-4 rounded-full flex items-center justify-end pr-3"
                initial={{ width: 0 }}
                animate={{ width: `${getWeeklyProgressPercentage()}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <span className="text-xs font-medium text-white">
                  {Math.round(getWeeklyProgressPercentage())}%
                </span>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const dayData = streakData.streakHistory[i]
                const isToday = i === 6 // Assuming last item is today
                
                return (
                  <div key={i} className="text-center">
                    <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1 ${
                      dayData?.completed 
                        ? 'bg-success text-white' 
                        : isToday && !dayData?.completed
                          ? 'bg-warning/20 text-warning border-2 border-warning'
                          : 'bg-slate-200 text-slate-400'
                    }`}>
                      {dayData?.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : isToday ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {isStreakAtRisk() ? 'Your streak is at risk!' : 'Keep your streak alive!'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {isStreakAtRisk() 
                  ? 'Complete an activity today to maintain your streak.'
                  : 'Great job! Complete another activity to extend your streak.'
                }
              </p>
              <div className="flex items-center space-x-4 text-sm text-slate-500">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Last activity: {streakData.lastActivity.toLocaleDateString()}</span>
                </span>
                {streakData.isActive && (
                  <Badge variant="success" size="sm">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
            
            {onStartActivity && (
              <div className="flex space-x-2">
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View History
                </Button>
                <Button onClick={onStartActivity}>
                  <Zap className="w-4 h-4 mr-2" />
                  Start Activity
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Streak History */}
      {showHistory && streakData.streakHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {streakData.streakHistory.slice(-7).reverse().map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      day.completed ? 'bg-success text-white' : 'bg-slate-300 text-slate-600'
                    }`}>
                      {day.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-current" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {day.date.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      {day.activities.length > 0 && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {day.activities.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={day.completed ? 'success' : 'outline'} size="sm">
                    {day.completed ? 'Completed' : 'Missed'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
