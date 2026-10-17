import { createClient } from '@/lib/supabase/client'
import { LeaderboardEntry } from '@/types'

export interface LeaderboardFilters {
  timeFilter?: 'all' | 'week' | 'month'
  institutionId?: string
  limit?: number
}

export async function getLeaderboard(
  filters: LeaderboardFilters = {}
): Promise<LeaderboardEntry[]> {
  const { timeFilter = 'all', institutionId, limit = 50 } = filters

  try {
    const supabase = createClient()

    // Build the query based on time filter
    let query = supabase
      .from('student_progress')
      .select(
        `
        student_id,
        profiles!inner(full_name, institution_id),
        score,
        completed_at,
        scenarios!inner(title, category)
      `
      )
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .not('score', 'is', null)

    // Apply time filter
    if (timeFilter === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      query = query.gte('completed_at', weekAgo.toISOString())
    } else if (timeFilter === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      query = query.gte('completed_at', monthAgo.toISOString())
    }

    // Apply institution filter if provided
    if (institutionId) {
      query = query.eq('profiles.institution_id', institutionId)
    }

    const { data: progressData, error } = await query

    if (error) {
      console.warn('Leaderboard unavailable:', error)
      return []
    }

    if (!progressData) {
      return []
    }

    // Process the data to calculate leaderboard entries
    const studentStats = new Map<
      string,
      {
        student_id: string
        student_name: string
        total_points: number
        scenarios_completed: number
        scores: number[]
        institution_id?: string
      }
    >()

    // Aggregate data by student
    progressData.forEach((entry) => {
      const studentId = entry.student_id
      const studentName =
        (entry.profiles as any)?.full_name || 'Unknown Student'
      const institutionId = (entry.profiles as any)?.institution_id || ''
      const score = entry.score || 0
      const points = Math.round(score * 10) // Convert percentage to points

      if (!studentStats.has(studentId)) {
        studentStats.set(studentId, {
          student_id: studentId,
          student_name: studentName,
          total_points: 0,
          scenarios_completed: 0,
          scores: [],
          institution_id: institutionId,
        })
      }

      const stats = studentStats.get(studentId)!
      stats.total_points += points
      stats.scenarios_completed += 1
      stats.scores.push(score)
    })

    // Convert to leaderboard entries and calculate ranks
    const leaderboardEntries: LeaderboardEntry[] = Array.from(
      studentStats.values()
    )
      .map((stats) => ({
        student_id: stats.student_id,
        student_name: stats.student_name,
        total_points: stats.total_points,
        scenarios_completed: stats.scenarios_completed,
        average_score: Math.round(
          stats.scores.reduce((sum, score) => sum + score, 0) /
            stats.scores.length
        ),
        rank: 0, // Will be set after sorting
        institution_id: stats.institution_id || '',
      }))
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, limit)

    // Set ranks
    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return leaderboardEntries
  } catch (error) {
    console.warn('Leaderboard unavailable:', error)
    return []
  }
}

export async function getUserRank(
  userId: string,
  filters: LeaderboardFilters = {}
): Promise<number | null> {
  const leaderboard = await getLeaderboard(filters)
  const userEntry = leaderboard.find((entry) => entry.student_id === userId)
  return userEntry?.rank || null
}

export async function getLeaderboardWithUserRank(
  userId: string,
  filters: LeaderboardFilters = {}
): Promise<{
  leaderboard: LeaderboardEntry[]
  userRank: number | null
  userEntry?: LeaderboardEntry
}> {
  const leaderboard = await getLeaderboard(filters)

  const userEntry = leaderboard.find((entry) => entry.student_id === userId)

  const userRank = userEntry?.rank || null

  return {
    leaderboard,
    userRank,
    ...(userEntry ? { userEntry } : {}),
  }
}
