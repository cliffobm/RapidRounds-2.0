import { createClient } from '@/lib/supabase/client'
import { StudentProgress, Scenario } from '@/types'

export async function getLastInProgressScenario(userId: string): Promise<{
  progress: StudentProgress
  scenario: Scenario
} | null> {
  const supabase = createClient()

  const { data: progressData, error } = await supabase
    .from('student_progress')
    .select(`
      *,
      scenarios!inner(*)
    `)
    .eq('student_id', userId)
    .eq('status', 'in_progress')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !progressData) {
    return null
  }

  return {
    progress: progressData,
    scenario: progressData.scenarios
  }
}

export async function getRecentProgress(userId: string, limit: number = 5): Promise<StudentProgress[]> {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, returning empty progress data')
      return []
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from('student_progress')
      .select(`
        *,
        scenarios!inner(title, category, difficulty)
      `)
      .eq('student_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent progress:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return []
    }

    return data || []
  } catch (err) {
    console.error('Unexpected error in getRecentProgress:', err)
    return []
  }
}

export async function updateProgress(
  userId: string,
  scenarioId: string,
  updates: Partial<StudentProgress>
): Promise<StudentProgress | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('student_progress')
    .update(updates)
    .eq('student_id', userId)
    .eq('scenario_id', scenarioId)
    .select()
    .single()

  if (error) {
    console.error('Error updating progress:', error)
    return null
  }

  return data
}

export async function createProgress(
  userId: string,
  scenarioId: string,
  initialData: Partial<StudentProgress> = {}
): Promise<StudentProgress | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('student_progress')
    .insert({
      student_id: userId,
      scenario_id: scenarioId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      ...initialData
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating progress:', error)
    return null
  }

  return data
}
