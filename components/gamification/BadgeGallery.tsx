'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Crown, 
  Shield, 
  Award, 
  Medal,
  Flame,
  Heart,
  Brain,
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  Lock
} from 'lucide-react'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'performance' | 'consistency' | 'learning' | 'social' | 'milestone'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  isUnlocked: boolean
  unlockedAt?: Date
  progress?: {
    current: number
    total: number
  }
  requirements: string[]
  xpReward: number
}

interface BadgeGalleryProps {
  achievements: Achievement[]
  showLocked?: boolean
  variant?: 'grid' | 'showcase' | 'compact'
  onBadgeClick?: (achievement: Achievement) => void
  className?: string
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  target: Target,
  zap: Zap,
  crown: Crown,
  shield: Shield,
  award: Award,
  medal: Medal,
  flame: Flame,
  heart: Heart,
  brain: Brain,
  book: BookOpen,
  users: Users,
  clock: Clock,
  trending: TrendingUp,
  check: CheckCircle
}

export function BadgeGallery({ 
  achievements, 
  showLocked = true, 
  variant = 'grid',
  onBadgeClick,
  className = '' 
}: BadgeGalleryProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-slate-100 text-slate-800 border-slate-200'
      case 'uncommon': return 'bg-green-100 text-green-800 border-green-200'
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-slate-200'
      case 'uncommon': return 'shadow-green-200'
      case 'rare': return 'shadow-blue-200'
      case 'epic': return 'shadow-purple-200'
      case 'legendary': return 'shadow-yellow-200'
      default: return 'shadow-slate-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return Target
      case 'consistency': return Flame
      case 'learning': return Brain
      case 'social': return Users
      case 'milestone': return Trophy
      default: return Award
    }
  }

  const filteredAchievements = showLocked 
    ? achievements 
    : achievements.filter(a => a.isUnlocked)

  if (variant === 'showcase') {
    const recentUnlocked = achievements
      .filter(a => a.isUnlocked && a.unlockedAt)
      .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
      .slice(0, 3)

    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Recent Achievements
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Your latest unlocked badges and milestones
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentUnlocked.map((achievement, index) => {
            const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Award
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`text-center hover:shadow-lg transition-all duration-200 cursor-pointer ${getRarityGlow(achievement.rarity)}`}>
                  <CardHeader className="pb-4">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${getRarityColor(achievement.rarity)}`}>
                      <IconComponent className="w-10 h-10" />
                    </div>
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Badge className={getRarityColor(achievement.rarity)} size="sm">
                        {achievement.rarity}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        +{achievement.xpReward} XP
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Unlocked {achievement.unlockedAt?.toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
        
        {recentUnlocked.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No achievements yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Complete scenarios and lessons to earn your first badges!
            </p>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`space-y-4 ${className}`}>
        {filteredAchievements.map((achievement) => {
          const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Award
          
          return (
            <motion.div
              key={achievement.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onBadgeClick?.(achievement)}
              className="cursor-pointer"
            >
              <Card className={`transition-all duration-200 ${
                achievement.isUnlocked 
                  ? `hover:shadow-md ${getRarityGlow(achievement.rarity)}` 
                  : 'opacity-60'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      achievement.isUnlocked 
                        ? getRarityColor(achievement.rarity)
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {achievement.isUnlocked ? (
                        <IconComponent className="w-6 h-6" />
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-semibold truncate ${
                          achievement.isUnlocked 
                            ? 'text-slate-900 dark:text-white' 
                            : 'text-slate-500'
                        }`}>
                          {achievement.title}
                        </h3>
                        <Badge className={getRarityColor(achievement.rarity)} size="sm">
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className={`text-sm mb-2 ${
                        achievement.isUnlocked 
                          ? 'text-slate-600 dark:text-slate-400' 
                          : 'text-slate-400'
                      }`}>
                        {achievement.description}
                      </p>
                      
                      {achievement.progress && !achievement.isUnlocked && (
                        <div className="mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-slate-500">Progress</span>
                            <span className="text-xs font-medium text-slate-700">
                              {achievement.progress.current}/{achievement.progress.total}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(achievement.progress.current / achievement.progress.total) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <span>+{achievement.xpReward} XP</span>
                          {achievement.unlockedAt && (
                            <span>• {achievement.unlockedAt.toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    )
  }

  // Default grid variant
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {achievements.filter(a => a.isUnlocked).length}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Unlocked</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {achievements.reduce((acc, a) => acc + (a.isUnlocked ? a.xpReward : 0), 0)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">XP Earned</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Crown className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {achievements.filter(a => a.isUnlocked && a.rarity === 'legendary').length}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Legendary</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {Math.round((achievements.filter(a => a.isUnlocked).length / achievements.length) * 100)}%
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Categories */}
      {['performance', 'consistency', 'learning', 'social', 'milestone'].map(category => {
        const categoryAchievements = filteredAchievements.filter(a => a.category === category)
        if (categoryAchievements.length === 0) return null
        
        const CategoryIcon = getCategoryIcon(category)
        
        return (
          <div key={category}>
            <div className="flex items-center space-x-2 mb-4">
              <CategoryIcon className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                {category} Achievements
              </h3>
              <Badge variant="outline" size="sm">
                {categoryAchievements.filter(a => a.isUnlocked).length}/{categoryAchievements.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryAchievements.map((achievement) => {
                const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Award
                
                return (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => onBadgeClick?.(achievement)}
                    className="cursor-pointer"
                  >
                    <Card className={`text-center transition-all duration-200 ${
                      achievement.isUnlocked 
                        ? `hover:shadow-lg ${getRarityGlow(achievement.rarity)}` 
                        : 'opacity-60'
                    }`}>
                      <CardContent className="p-4">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                          achievement.isUnlocked 
                            ? getRarityColor(achievement.rarity)
                            : 'bg-slate-200 text-slate-400'
                        }`}>
                          {achievement.isUnlocked ? (
                            <IconComponent className="w-8 h-8" />
                          ) : (
                            <Lock className="w-8 h-8" />
                          )}
                        </div>
                        
                        <h4 className={`font-semibold mb-1 ${
                          achievement.isUnlocked 
                            ? 'text-slate-900 dark:text-white' 
                            : 'text-slate-500'
                        }`}>
                          {achievement.title}
                        </h4>
                        
                        <p className={`text-xs mb-3 ${
                          achievement.isUnlocked 
                            ? 'text-slate-600 dark:text-slate-400' 
                            : 'text-slate-400'
                        }`}>
                          {achievement.description}
                        </p>
                        
                        <div className="flex items-center justify-center space-x-1">
                          <Badge className={getRarityColor(achievement.rarity)} size="sm">
                            {achievement.rarity}
                          </Badge>
                        </div>
                        
                        {achievement.progress && !achievement.isUnlocked && (
                          <div className="mt-3">
                            <div className="text-xs text-slate-500 mb-1">
                              {achievement.progress.current}/{achievement.progress.total}
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                              <div 
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${(achievement.progress.current / achievement.progress.total) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="text-xs text-slate-500 mt-2">
                          +{achievement.xpReward} XP
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}



