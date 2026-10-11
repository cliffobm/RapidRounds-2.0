import { createClient } from '@/lib/supabase/client'
import { StudentAnswer } from '@/types'

export interface AttemptData {
  student_id: string
  scenario_id: string
  answers: StudentAnswer[]
  score: number
  time_spent: number
  completed_at?: string
}

export interface AttemptResult {
  attempt_id: string
  score: number
  total_points: number
  percentage: number
  time_spent: number
  answers: StudentAnswer[]
  achievements_unlocked?: string[]
}

export async function createAttempt(attemptData: AttemptData): Promise<AttemptResult | null> {
  const supabase = createClient()

  try {
    // Calculate total points from questions
    const { data: questions } = await supabase
      .from('questions')
      .select('points')
      .eq('scenario_id', attemptData.scenario_id)
      .eq('is_active', true)

    const totalPoints = questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 1
    const percentage = Math.round((attemptData.score / totalPoints) * 100)

    // Create the attempt record
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .insert({
        student_id: attemptData.student_id,
        scenario_id: attemptData.scenario_id,
        score: attemptData.score,
        total_points: totalPoints,
        percentage: percentage,
        time_spent: attemptData.time_spent,
        completed_at: attemptData.completed_at || new Date().toISOString(),
        status: 'completed'
      })
      .select()
      .single()

    if (attemptError) {
      console.error('Error creating attempt:', attemptError)
      return null
    }

    // Insert individual answers
    const answerInserts = attemptData.answers.map(answer => ({
      attempt_id: attempt.id,
      question_id: answer.question_id,
      answer: answer.answer,
      is_correct: answer.is_correct,
      time_spent: answer.time_spent,
      attempted_at: answer.attempted_at
    }))

    const { error: answersError } = await supabase
      .from('student_answers')
      .insert(answerInserts)

    if (answersError) {
      console.error('Error inserting answers:', answersError)
      // Continue anyway - the attempt was created
    }

    // Update student progress
    await updateStudentProgress(attemptData.student_id, attemptData.scenario_id, {
      status: 'completed',
      score: percentage,
      completed_at: attempt.completed_at,
      time_spent: attemptData.time_spent
    })

    // Check for achievements
    const achievements = await checkAchievements(attemptData.student_id, attemptData.scenario_id, percentage)

    return {
      attempt_id: attempt.id,
      score: attemptData.score,
      total_points: totalPoints,
      percentage: percentage,
      time_spent: attemptData.time_spent,
      answers: attemptData.answers,
      achievements_unlocked: achievements
    }

  } catch (error) {
    console.error('Unexpected error creating attempt:', error)
    return null
  }
}

export async function getAttemptsByStudent(
  studentId: string, 
  limit: number = 20
): Promise<any[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('attempts')
    .select(`
      *,
      scenarios!inner(title, category, difficulty)
    `)
    .eq('student_id', studentId)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching attempts:', error)
    return []
  }

  return data || []
}

export async function getAttemptById(attemptId: string): Promise<any | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('attempts')
    .select(`
      *,
      scenarios!inner(*),
      student_answers(*)
    `)
    .eq('id', attemptId)
    .single()

  if (error) {
    console.error('Error fetching attempt:', error)
    return null
  }

  return data
}

export async function getAttemptsByScenario(
  scenarioId: string,
  limit: number = 50
): Promise<any[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('attempts')
    .select(`
      *,
      profiles!inner(full_name, institution_id)
    `)
    .eq('scenario_id', scenarioId)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching scenario attempts:', error)
    return []
  }

  return data || []
}

async function updateStudentProgress(
  studentId: string, 
  scenarioId: string, 
  updates: any
): Promise<void> {
  const supabase = createClient()

  // Check if progress record exists
  const { data: existingProgress } = await supabase
    .from('student_progress')
    .select('id')
    .eq('student_id', studentId)
    .eq('scenario_id', scenarioId)
    .single()

  if (existingProgress) {
    // Update existing progress
    await supabase
      .from('student_progress')
      .update(updates)
      .eq('id', existingProgress.id)
  } else {
    // Create new progress record
    await supabase
      .from('student_progress')
      .insert({
        student_id: studentId,
        scenario_id: scenarioId,
        status: 'completed',
        ...updates
      })
  }
}

async function checkAchievements(
  studentId: string, 
  scenarioId: string, 
  score: number
): Promise<string[]> {
  const supabase = createClient()
  const achievements: string[] = []

  try {
    // Check for perfect score achievement
    if (score === 100) {
      const { data: perfectScoreAchievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('type', 'perfect_score')
        .single()

      if (perfectScoreAchievement) {
        // Check if student already has this achievement
        const { data: existingAchievement } = await supabase
          .from('student_achievements')
          .select('id')
          .eq('student_id', studentId)
          .eq('achievement_id', perfectScoreAchievement.id)
          .single()

        if (!existingAchievement) {
          // Award the achievement
          await supabase
            .from('student_achievements')
            .insert({
              student_id: studentId,
              achievement_id: perfectScoreAchievement.id,
              earned_at: new Date().toISOString()
            })
          
          achievements.push(perfectScoreAchievement.id)
        }
      }
    }

    // Check for completion count achievements
    const { data: completedScenarios } = await supabase
      .from('student_progress')
      .select('scenario_id')
      .eq('student_id', studentId)
      .eq('status', 'completed')

    const completionCount = completedScenarios?.length || 0

    // Check for milestones (5, 10, 25, 50 completions)
    const milestones = [5, 10, 25, 50]
    for (const milestone of milestones) {
      if (completionCount === milestone) {
        const { data: milestoneAchievement } = await supabase
          .from('achievements')
          .select('id')
          .eq('type', 'completion_milestone')
          .eq('threshold', milestone)
          .single()

        if (milestoneAchievement) {
          const { data: existingAchievement } = await supabase
            .from('student_achievements')
            .select('id')
            .eq('student_id', studentId)
            .eq('achievement_id', milestoneAchievement.id)
            .single()

          if (!existingAchievement) {
            await supabase
              .from('student_achievements')
              .insert({
                student_id: studentId,
                achievement_id: milestoneAchievement.id,
                earned_at: new Date().toISOString()
              })
            
            achievements.push(milestoneAchievement.id)
          }
        }
      }
    }

  } catch (error) {
    console.error('Error checking achievements:', error)
  }

  return achievements
}

export async function getStudentStats(studentId: string): Promise<{
  total_attempts: number
  average_score: number
  total_points: number
  scenarios_completed: number
  perfect_scores: number
} | null> {
  const supabase = createClient()

  try {
    const { data: attempts } = await supabase
      .from('attempts')
      .select('score, total_points, percentage')
      .eq('student_id', studentId)

    if (!attempts || attempts.length === 0) {
      return {
        total_attempts: 0,
        average_score: 0,
        total_points: 0,
        scenarios_completed: 0,
        perfect_scores: 0
      }
    }

    const totalAttempts = attempts.length
    const totalPoints = attempts.reduce((sum, attempt) => sum + (attempt.total_points || 0), 0)
    const averageScore = Math.round(
      attempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / totalAttempts
    )
    const perfectScores = attempts.filter(attempt => attempt.percentage === 100).length

    // Get unique scenarios completed
    const { data: progress } = await supabase
      .from('student_progress')
      .select('scenario_id')
      .eq('student_id', studentId)
      .eq('status', 'completed')

    const scenariosCompleted = new Set(progress?.map(p => p.scenario_id) || []).size

    return {
      total_attempts: totalAttempts,
      average_score: averageScore,
      total_points: totalPoints,
      scenarios_completed: scenariosCompleted,
      perfect_scores: perfectScores
    }

  } catch (error) {
    console.error('Error getting student stats:', error)
    return null
  }
}
