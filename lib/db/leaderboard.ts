import { createClient } from '@/lib/supabase/client'
import { LeaderboardEntry } from '@/types'

// Sample leaderboard data for fallback
const sampleLeaderboardData: LeaderboardEntry[] = [
  {
    student_id: 'student-1',
    student_name: 'Sarah Johnson',
    total_points: 2450,
    scenarios_completed: 12,
    average_score: 87,
    rank: 1,
    institution_id: 'institution-1'
  },
  {
    student_id: 'student-2',
    student_name: 'Michael Chen',
    total_points: 2380,
    scenarios_completed: 11,
    average_score: 85,
    rank: 2,
    institution_id: 'institution-1'
  },
  {
    student_id: 'student-3',
    student_name: 'Emily Rodriguez',
    total_points: 2290,
    scenarios_completed: 10,
    average_score: 83,
    rank: 3,
    institution_id: 'institution-2'
  },
  {
    student_id: 'student-4',
    student_name: 'David Thompson',
    total_points: 2150,
    scenarios_completed: 9,
    average_score: 81,
    rank: 4,
    institution_id: 'institution-1'
  },
  {
    student_id: 'student-5',
    student_name: 'Jessica Williams',
    total_points: 2080,
    scenarios_completed: 8,
    average_score: 79,
    rank: 5,
    institution_id: 'institution-2'
  },
  {
    student_id: 'student-6',
    student_name: 'Alex Martinez',
    total_points: 1950,
    scenarios_completed: 7,
    average_score: 77,
    rank: 6,
    institution_id: 'institution-1'
  },
  {
    student_id: 'student-7',
    student_name: 'Taylor Brown',
    total_points: 1820,
    scenarios_completed: 6,
    average_score: 75,
    rank: 7,
    institution_id: 'institution-2'
  },
  {
    student_id: 'student-8',
    student_name: 'Jordan Davis',
    total_points: 1750,
    scenarios_completed: 5,
    average_score: 73,
    rank: 8,
    institution_id: 'institution-1'
  },
  {
    student_id: 'student-9',
    student_name: 'Casey Wilson',
    total_points: 1680,
    scenarios_completed: 4,
    average_score: 71,
    rank: 9,
    institution_id: 'institution-2'
  },
  {
    student_id: 'student-10',
    student_name: 'Morgan Anderson',
    total_points: 1550,
    scenarios_completed: 3,
    average_score: 69,
    rank: 10,
    institution_id: 'institution-1'
  }
]

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
      .select(`
        student_id,
        profiles!inner(full_name, institution_id),
        score,
        completed_at,
        scenarios!inner(title, category)
      `)
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
      console.warn('Supabase error, falling back to sample leaderboard data:', error)
      return getSampleLeaderboard(filters)
    }

    if (!progressData) {
      return getSampleLeaderboard(filters)
    }

    // Process the data to calculate leaderboard entries
    const studentStats = new Map<string, {
      student_id: string
      student_name: string
      total_points: number
      scenarios_completed: number
      scores: number[]
      institution_id?: string
    }>()

    // Aggregate data by student
    progressData.forEach(entry => {
      const studentId = entry.student_id
      const studentName = (entry.profiles as any)?.full_name || 'Unknown Student'
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
          institution_id: institutionId
        })
      }

      const stats = studentStats.get(studentId)!
      stats.total_points += points
      stats.scenarios_completed += 1
      stats.scores.push(score)
    })

    // Convert to leaderboard entries and calculate ranks
    const leaderboardEntries: LeaderboardEntry[] = Array.from(studentStats.values())
      .map(stats => ({
        student_id: stats.student_id,
        student_name: stats.student_name,
        total_points: stats.total_points,
        scenarios_completed: stats.scenarios_completed,
        average_score: Math.round(stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length),
        rank: 0, // Will be set after sorting
        institution_id: stats.institution_id || ''
      }))
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, limit)

    // Set ranks
    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return leaderboardEntries
  } catch (error) {
    console.warn('Failed to connect to Supabase, using sample leaderboard data:', error)
    return getSampleLeaderboard(filters)
  }
}

function getSampleLeaderboard(filters: LeaderboardFilters = {}): LeaderboardEntry[] {
  const { institutionId, limit = 50 } = filters
  
  let filteredData = [...sampleLeaderboardData]
  
  // Apply institution filter if provided
  if (institutionId) {
    filteredData = filteredData.filter(entry => entry.institution_id === institutionId)
  }
  
  // Apply limit
  return filteredData.slice(0, limit)
}

export async function getUserRank(
  userId: string,
  filters: LeaderboardFilters = {}
): Promise<number | null> {
  const leaderboard = await getLeaderboard(filters)
  const userEntry = leaderboard.find(entry => entry.student_id === userId)
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
  
  const userEntry = leaderboard.find(entry => entry.student_id === userId)

  const userRank = userEntry?.rank || null

  return {
    leaderboard,
    userRank,
    ...(userEntry ? { userEntry } : {})
  }
}
