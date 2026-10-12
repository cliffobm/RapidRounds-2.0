'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { BadgeGallery } from '@/components/gamification/BadgeGallery'
import { StreakMeter } from '@/components/gamification/StreakMeter'
import { Confetti } from '@/components/ui/Confetti'
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  TrendingUp, 
  Users, 
  Building, 
  Calendar,
  Target,
  Zap,
  Award,
  Filter,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Flame
} from 'lucide-react'

// Mock data for demonstration
interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  institution?: string
  totalXP: number
  rank: number
  streak: number
  scenariosCompleted: number
  averageScore: number
  badges: number
  weeklyXP: number
  monthlyXP: number
  isCurrentUser?: boolean
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    institution: 'Metro Health University',
    totalXP: 15420,
    rank: 1,
    streak: 28,
    scenariosCompleted: 156,
    averageScore: 94,
    badges: 23,
    weeklyXP: 1240,
    monthlyXP: 4850
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    institution: 'City College of Nursing',
    totalXP: 14890,
    rank: 2,
    streak: 21,
    scenariosCompleted: 142,
    averageScore: 91,
    badges: 19,
    weeklyXP: 980,
    monthlyXP: 4200
  },
  {
    id: '3',
    name: 'Jennifer Kim',
    institution: 'Metro Health University',
    totalXP: 13750,
    rank: 3,
    streak: 15,
    scenariosCompleted: 134,
    averageScore: 89,
    badges: 17,
    weeklyXP: 720,
    monthlyXP: 3900
  },
  {
    id: '4',
    name: 'You',
    institution: 'Metro Health University',
    totalXP: 12340,
    rank: 15,
    streak: 7,
    scenariosCompleted: 98,
    averageScore: 87,
    badges: 12,
    weeklyXP: 540,
    monthlyXP: 2340,
    isCurrentUser: true
  }
]

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'global' | 'institution'>('global')
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'alltime'>('weekly')
  const [showConfetti, setShowConfetti] = useState(false)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500'
      case 2: return 'text-slate-400'
      case 3: return 'text-amber-600'
      default: return 'text-slate-600 dark:text-slate-400'
    }
  }

  const getXPForPeriod = (entry: LeaderboardEntry) => {
    switch (timeFilter) {
      case 'weekly': return entry.weeklyXP
      case 'monthly': return entry.monthlyXP
      case 'alltime': return entry.totalXP
      default: return entry.totalXP
    }
  }

  const currentUser = mockLeaderboard.find(entry => entry.isCurrentUser)
  const filteredLeaderboard = mockLeaderboard.filter(entry => 
    activeTab === 'global' || entry.institution === currentUser?.institution
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-warning/10 rounded-2xl">
            <Trophy className="w-8 h-8 text-warning" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Leaderboards
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Compete with peers and track your progress
            </p>
          </div>
        </div>
      </div>

      {/* Your Rank Card */}
      {currentUser && (
        <Card className="mb-8 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Your Current Rank
                  </h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`text-2xl font-bold ${getRankColor(currentUser.rank)}`}>
                      {getRankIcon(currentUser.rank)}
                    </span>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <div>{currentUser.totalXP.toLocaleString()} XP</div>
                      <div>{currentUser.scenariosCompleted} scenarios completed</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="font-medium text-slate-900 dark:text-white">
                    {currentUser.streak} day streak
                  </span>
                </div>
                <Badge variant="outline">
                  {currentUser.averageScore}% avg score
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
            <Button
            variant={activeTab === 'global' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('global')}
            className="flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span className={activeTab === 'global' ? 'text-white' : ''}>Global</span>
          </Button>
          <Button
            variant={activeTab === 'institution' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('institution')}
            className="flex items-center space-x-2"
          >
            <Building className="w-4 h-4" />
            <span className={activeTab === 'institution' ? 'text-white' : ''}>Institution</span>
          </Button>
        </div>

        {/* Time Filter */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
          {(['weekly', 'monthly', 'alltime'] as const).map((filter) => (
            <Button
              key={filter}
              variant={timeFilter === filter ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTimeFilter(filter)}
            >
              {filter === 'weekly' ? 'Weekly' : filter === 'monthly' ? 'Monthly' : 'All Time'}
            </Button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {filteredLeaderboard.slice(0, 3).map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`text-center hover:shadow-lg transition-all duration-200 ${
              index === 0 ? 'border-yellow-200 bg-gradient-to-b from-yellow-50 to-yellow-100' :
              index === 1 ? 'border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100' :
              'border-amber-200 bg-gradient-to-b from-amber-50 to-amber-100'
            }`}>
              <CardContent className="p-6">
                <div className="text-4xl mb-3">
                  {getRankIcon(entry.rank)}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                  {entry.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {entry.institution}
                </p>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">
                    {getXPForPeriod(entry).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">XP</div>
                  
                  <div className="flex items-center justify-center space-x-4 text-xs text-slate-500 mt-3">
                    <span>{entry.scenariosCompleted} scenarios</span>
                    <span>{entry.averageScore}% avg</span>
                    <span>{entry.streak}🔥</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>
                {activeTab === 'global' ? 'Global' : 'Institution'} Rankings
              </span>
            </CardTitle>
            <Badge variant="outline">
              {filteredLeaderboard.length} participants
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredLeaderboard.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  entry.isCurrentUser ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`text-xl font-bold ${getRankColor(entry.rank)} min-w-[3rem] text-center`}>
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {entry.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {entry.name}
                          </h3>
                          {entry.isCurrentUser && (
                            <Badge variant="accent" size="sm">You</Badge>
                          )}
                          {entry.rank <= 3 && (
                            <Badge variant="warning" size="sm">Top 3</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {entry.institution}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        {getXPForPeriod(entry).toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">XP</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Flame className="w-4 h-4 text-accent" />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {entry.streak}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">streak</div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      aria-label={expandedUser === entry.id ? 'Collapse details' : 'Expand details'}
                      aria-expanded={expandedUser === entry.id}
                      aria-controls={`lb-details-${entry.id}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedUser(expandedUser === entry.id ? null : entry.id)
                      }}
                    >
                      {expandedUser === entry.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedUser === entry.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
                      id={`lb-details-${entry.id}`}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {entry.scenariosCompleted}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            Scenarios
                          </div>
                        </div>
                        <div className="text-center">
                          <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {entry.averageScore}%
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            Avg Score
                          </div>
                        </div>
                        <div className="text-center">
                          <Award className="w-6 h-6 text-warning mx-auto mb-2" />
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {entry.badges}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            Badges
                          </div>
                        </div>
                        <div className="text-center">
                          <Calendar className="w-6 h-6 text-accent mx-auto mb-2" />
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {entry.weeklyXP}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            Weekly XP
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Showcase */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Recent Achievements
          </h2>
          <Button variant="outline" size="sm">
            <Award className="w-4 h-4 mr-2" />
            View All Badges
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <Crown className="w-12 h-12 text-warning mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Week Warrior
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Maintained a 7-day study streak
              </p>
              <Badge variant="warning" className="mt-3">
                Rare Achievement
              </Badge>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Star className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Perfect Score
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Achieved 100% on a scenario
              </p>
              <Badge variant="accent" className="mt-3">
                Uncommon Achievement
              </Badge>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Medal className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Fast Learner
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Completed 10 scenarios in one week
              </p>
              <Badge variant="success" className="mt-3">
                Common Achievement
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Motivational CTA */}
      <Card className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Climb the Rankings!
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Complete more scenarios, maintain your streak, and earn achievements to rise up the leaderboard.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/test'}
            >
              <Target className="w-4 h-4 mr-2" />
              Practice Scenarios
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = '/study'}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Study Materials
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
