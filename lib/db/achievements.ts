import { createClient } from '@/lib/supabase/client'
import { Badge, StudentBadge, StudentProgress } from '@/types'

export interface AchievementWithStatus extends Badge {
  is_earned: boolean
  earned_at?: string
  progress?: {
    current: number
    target: number
    percentage: number
  }
}

export async function getAllAchievements(): Promise<Badge[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('category', { ascending: true })
    .order('points', { ascending: true })

  if (error) {
    console.error('Error fetching achievements:', error)
    return []
  }

  return data || []
}

export async function getUserAchievements(userId: string): Promise<StudentBadge[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('student_badges')
    .select(`
      *,
      badges!inner(*)
    `)
    .eq('student_id', userId)
    .order('earned_at', { ascending: false })

  if (error) {
    console.error('Error fetching user achievements:', error)
    return []
  }

  return data || []
}

export async function getAchievementsWithStatus(userId: string): Promise<AchievementWithStatus[]> {
  const [allAchievements, userAchievements, userProgress] = await Promise.all([
    getAllAchievements(),
    getUserAchievements(userId),
    getUserProgressForAchievements(userId)
  ])

  const earnedBadgeIds = new Set(userAchievements.map(ab => ab.badge_id))
  const earnedBadgesMap = new Map(userAchievements.map(ab => [ab.badge_id, ab]))

  return allAchievements.map(badge => {
    const isEarned = earnedBadgeIds.has(badge.id)
    const earnedBadge = earnedBadgesMap.get(badge.id)
    
    let progress = undefined
    if (!isEarned) {
      progress = calculateAchievementProgress(badge, userProgress)
    }

    return {
      ...badge,
      is_earned: isEarned,
      earned_at: earnedBadge?.earned_at || '',
      progress: progress || { current: 0, target: 0, percentage: 0 }
    }
  })
}

async function getUserProgressForAchievements(userId: string): Promise<{
  scenariosCompleted: number
  totalScore: number
  averageScore: number
  currentStreak: number
  categoryProgress: Map<string, number>
  perfectScores: number
}> {
  const supabase = createClient()

  const { data: progressData, error } = await supabase
    .from('student_progress')
    .select(`
      score,
      completed_at,
      scenarios!inner(category)
    `)
    .eq('student_id', userId)
    .eq('status', 'completed')
    .not('completed_at', 'is', null)
    .not('score', 'is', null)

  if (error) {
    console.error('Error fetching user progress for achievements:', error)
    return {
      scenariosCompleted: 0,
      totalScore: 0,
      averageScore: 0,
      currentStreak: 0,
      categoryProgress: new Map(),
      perfectScores: 0
    }
  }

  const completedScenarios = progressData || []
  const scenariosCompleted = completedScenarios.length
  const totalScore = completedScenarios.reduce((sum, p) => sum + (p.score || 0), 0)
  const averageScore = scenariosCompleted > 0 ? Math.round(totalScore / scenariosCompleted) : 0
  const perfectScores = completedScenarios.filter(p => p.score === 100).length

  // Calculate category progress
  const categoryProgress = new Map<string, number>()
  completedScenarios.forEach(p => {
    const category = (p.scenarios as any)?.category || 'Unknown'
    categoryProgress.set(category, (categoryProgress.get(category) || 0) + 1)
  })

  // Calculate current streak (simplified - would need more complex logic for actual streak calculation)
  const currentStreak = calculateCurrentStreak(completedScenarios)

  return {
    scenariosCompleted,
    totalScore,
    averageScore,
    currentStreak,
    categoryProgress,
    perfectScores
  }
}

function calculateCurrentStreak(completedScenarios: any[]): number {
  if (completedScenarios.length === 0) return 0

  // Sort by completion date (most recent first)
  const sortedScenarios = completedScenarios
    .filter(p => p.completed_at)
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())

  let streak = 0
  let currentDate = new Date()
  
  for (const scenario of sortedScenarios) {
    const completionDate = new Date(scenario.completed_at)
    const daysDiff = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === streak) {
      streak++
      currentDate = completionDate
    } else if (daysDiff > streak) {
      break
    }
  }

  return streak
}

function calculateAchievementProgress(badge: Badge, userProgress: any): {
  current: number
  target: number
  percentage: number
} {
  const { criteria } = badge
  const { type, value, category } = criteria

  let current = 0
  let target = value

  switch (type) {
    case 'scenarios_completed':
      current = userProgress.scenariosCompleted
      break
    case 'score_threshold':
      current = userProgress.averageScore
      break
    case 'streak_days':
      current = userProgress.currentStreak
      break
    case 'category_mastery':
      if (category) {
        current = userProgress.categoryProgress.get(category) || 0
        // For category mastery, we might need to know total scenarios in that category
        // For now, we'll use a placeholder target
        target = 5 // This should be dynamic based on available scenarios
      }
      break
  }

  const percentage = Math.min(Math.round((current / target) * 100), 100)

  return {
    current,
    target,
    percentage
  }
}

export async function checkAndAwardAchievements(userId: string): Promise<StudentBadge[]> {
  const [achievements, userProgress] = await Promise.all([
    getAllAchievements(),
    getUserProgressForAchievements(userId)
  ])

  const newBadges: StudentBadge[] = []

  for (const achievement of achievements) {
    const { criteria } = achievement
    const { type, value, category } = criteria

    let shouldAward = false

    switch (type) {
      case 'scenarios_completed':
        shouldAward = userProgress.scenariosCompleted >= value
        break
      case 'score_threshold':
        shouldAward = userProgress.averageScore >= value
        break
      case 'streak_days':
        shouldAward = userProgress.currentStreak >= value
        break
      case 'category_mastery':
        if (category) {
          const categoryCount = userProgress.categoryProgress.get(category) || 0
          shouldAward = categoryCount >= value
        }
        break
    }

    if (shouldAward) {
      // Check if user already has this badge
      const supabase = createClient()
      const { data: existingBadge } = await supabase
        .from('student_badges')
        .select('id')
        .eq('student_id', userId)
        .eq('badge_id', achievement.id)
        .single()

      if (!existingBadge) {
        // Award the badge
        const { data: newBadge, error } = await supabase
          .from('student_badges')
          .insert({
            student_id: userId,
            badge_id: achievement.id,
            earned_at: new Date().toISOString()
          })
          .select()
          .single()

        if (!error && newBadge) {
          newBadges.push(newBadge)
        }
      }
    }
  }

  return newBadges
}
