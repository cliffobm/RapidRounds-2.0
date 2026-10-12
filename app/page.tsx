'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { 
  TestTube, 
  BookOpen, 
  Trophy, 
  Clock, 
  Target,
  TrendingUp,
  Zap,
  Star,
  PlayCircle,
  Award,
  Users,
  Calendar
} from 'lucide-react'
import { logEvent } from '@/lib/metrics'
import { useAuth } from '@/store/useAuth'
import { useProgress } from '@/store/useProgress'

export default function Home() {
  const { user } = useAuth()
  const { 
    xp, 
    level, 
    streakData, 
    getTotalScenariosCompleted, 
    getAverageScore,
    getProgressToNextLevel 
  } = useProgress()

  useEffect(() => {
    console.log('Home page mounted', { user, xp })
    try {
      logEvent('app_open', { ts: Date.now(), page: 'home' })
    } catch (error) {
      console.error('Error logging event:', error)
    }
  }, [user, xp])

  const userStats = {
    overallProgress: getProgressToNextLevel(),
    currentStreak: streakData?.current_streak || 0,
    totalXP: xp,
    rank: 15, // TODO: Get from leaderboard
    completedScenarios: getTotalScenariosCompleted(),
    averageScore: getAverageScore()
  }

  const recentActivity = [
    {
      id: 1,
      type: 'scenario_completed',
      title: 'Cardiac Emergency Protocol',
      score: 92,
      timestamp: '2 hours ago',
      difficulty: 'Advanced'
    },
    {
      id: 2,
      type: 'lesson_completed',
      title: 'Respiratory Assessment Basics',
      progress: 100,
      timestamp: '1 day ago',
      difficulty: 'Intermediate'
    },
    {
      id: 3,
      type: 'achievement_unlocked',
      title: 'Week Warrior',
      description: '7-day study streak',
      timestamp: '2 days ago',
      rarity: 'rare'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Welcome Hero Section */}
      <div className="mb-8 p-8 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {user ? `Welcome back, ${user.user_metadata?.name || 'Nurse'}!` : 'Welcome to RapidRounds'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {user 
                ? "Ready to continue your clinical learning journey? Let's build on your progress!"
                : "Your comprehensive platform for nursing education through scenario-based practice."
              }
            </p>
            {!user && (
              <div className="flex space-x-3">
                <Button 
                  size="lg"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/auth/sign-in'
                    }
                  }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/study'
                    }
                  }}
                >
                  Learn More
                </Button>
              </div>
            )}
          </div>
          {user && (
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <ProgressRing 
                progress={userStats.overallProgress} 
                size={120} 
                strokeWidth={8}
                label="Overall Progress"
              />
            </div>
          )}
        </div>
      </div>

      {user ? (
        <>
          {/* User Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-2xl mx-auto mb-2">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{userStats.currentStreak}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Day Streak</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-2xl mx-auto mb-2">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{userStats.totalXP.toLocaleString()}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total XP</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-success/10 rounded-2xl mx-auto mb-2">
                  <Target className="w-5 h-5 text-success" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{userStats.completedScenarios}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Scenarios</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-warning/10 rounded-2xl mx-auto mb-2">
                  <Trophy className="w-5 h-5 text-warning" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">#{userStats.rank}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Rank</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <TestTube className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Continue Testing</CardTitle>
                    <CardDescription>Resume your scenario practice</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">Cardiac Scenarios</span>
                    <span className="text-sm font-medium">3/8 complete</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '37.5%' }}></div>
                  </div>
                </div>
                <Button className="w-full">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Resume Testing
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-accent/10 rounded-2xl">
                    <BookOpen className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Study Materials</CardTitle>
                    <CardDescription>Interactive lessons and guides</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">Respiratory Care</span>
                    <span className="text-sm font-medium">75% complete</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Continue Learning
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-warning/10 rounded-2xl">
                    <Trophy className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Leaderboard</CardTitle>
                    <CardDescription>See how you rank</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-600">Your Rank</p>
                    <p className="text-2xl font-bold text-slate-900">#{userStats.rank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">This Week</p>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">+3</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Leaderboard
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Your latest achievements and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex-shrink-0">
                      {activity.type === 'scenario_completed' && (
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <TestTube className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      {activity.type === 'lesson_completed' && (
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <BookOpen className="w-4 h-4 text-accent" />
                        </div>
                      )}
                      {activity.type === 'achievement_unlocked' && (
                        <div className="p-2 bg-warning/10 rounded-lg">
                          <Award className="w-4 h-4 text-warning" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        {activity.score && (
                          <Badge variant="success" size="sm">
                            {activity.score}% Score
                          </Badge>
                        )}
                        {activity.difficulty && (
                          <Badge variant="outline" size="sm">
                            {activity.difficulty}
                          </Badge>
                        )}
                        <span className="text-sm text-slate-500">
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Guest/Onboarding Content */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="text-center">
              <div className="p-4 bg-primary/10 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TestTube className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Scenario-Based Testing</CardTitle>
              <CardDescription>
                Practice with realistic clinical scenarios that mirror real-world situations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="text-center">
              <div className="p-4 bg-accent/10 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-accent" />
              </div>
              <CardTitle>Interactive Learning</CardTitle>
              <CardDescription>
                Comprehensive study materials with interactive lessons and assessments
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="text-center">
              <div className="p-4 bg-warning/10 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-warning" />
              </div>
              <CardTitle>Gamified Progress</CardTitle>
              <CardDescription>
                Track your progress, earn achievements, and compete with peers
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  )
}