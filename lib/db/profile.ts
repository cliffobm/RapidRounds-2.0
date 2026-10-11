import { supabaseClient } from '@/lib/supabase-client'

export interface ProfileOption {
  id: string
  name: string
  description?: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  display_name?: string
  avatar_url?: string
  role: 'student' | 'educator' | 'admin'
  institution_id?: string
  created_at: string
  updated_at: string
  aspirations: ProfileOption[]
  goals: ProfileOption[]
  learning_challenges: ProfileOption[]
}

export interface ProfileFormData {
  display_name?: string
  aspiration_ids: string[]
  goal_ids: string[]
  learning_challenge_ids: string[]
}

// Fetch all available options
export async function fetchProfileOptions() {
  const supabase = supabaseClient
  
  const [aspirationsResult, goalsResult, challengesResult] = await Promise.all([
    supabase.from('aspirations_options').select('*').order('name'),
    supabase.from('goals_options').select('*').order('name'),
    supabase.from('learning_challenges_options').select('*').order('name')
  ])

  if (aspirationsResult.error) throw aspirationsResult.error
  if (goalsResult.error) throw goalsResult.error
  if (challengesResult.error) throw challengesResult.error

  return {
    aspirations: aspirationsResult.data || [],
    goals: goalsResult.data || [],
    learning_challenges: challengesResult.data || []
  }
}

// Fetch user profile with selections
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = supabaseClient

  // Get basic profile info
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError) throw profileError
  if (!profile) return null

  // Get user selections
  const [aspirationsResult, goalsResult, challengesResult] = await Promise.all([
    supabase
      .from('user_aspirations')
      .select(`
        aspiration_id,
        aspirations_options!inner(id, name, description)
      `)
      .eq('user_id', userId),
    supabase
      .from('user_goals')
      .select(`
        goal_id,
        goals_options!inner(id, name, description)
      `)
      .eq('user_id', userId),
    supabase
      .from('user_learning_challenges')
      .select(`
        challenge_id,
        learning_challenges_options!inner(id, name, description)
      `)
      .eq('user_id', userId)
  ])

  if (aspirationsResult.error) throw aspirationsResult.error
  if (goalsResult.error) throw goalsResult.error
  if (challengesResult.error) throw challengesResult.error

  return {
    ...profile,
    aspirations: aspirationsResult.data?.map(item => item.aspirations_options) || [],
    goals: goalsResult.data?.map(item => item.goals_options) || [],
    learning_challenges: challengesResult.data?.map(item => item.learning_challenges_options) || []
  }
}

// Update user profile
export async function updateUserProfile(userId: string, formData: ProfileFormData) {
  const supabase = supabaseClient

  // Start a transaction-like operation
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      display_name: formData.display_name,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (profileError) throw profileError

  // Update aspirations
  const { error: aspirationsError } = await supabase
    .from('user_aspirations')
    .delete()
    .eq('user_id', userId)

  if (aspirationsError) throw aspirationsError

  if (formData.aspiration_ids.length > 0) {
    const { error: insertAspirationsError } = await supabase
      .from('user_aspirations')
      .insert(
        formData.aspiration_ids.map(aspiration_id => ({
          user_id: userId,
          aspiration_id
        }))
      )

    if (insertAspirationsError) throw insertAspirationsError
  }

  // Update goals
  const { error: goalsError } = await supabase
    .from('user_goals')
    .delete()
    .eq('user_id', userId)

  if (goalsError) throw goalsError

  if (formData.goal_ids.length > 0) {
    const { error: insertGoalsError } = await supabase
      .from('user_goals')
      .insert(
        formData.goal_ids.map(goal_id => ({
          user_id: userId,
          goal_id
        }))
      )

    if (insertGoalsError) throw insertGoalsError
  }

  // Update learning challenges
  const { error: challengesError } = await supabase
    .from('user_learning_challenges')
    .delete()
    .eq('user_id', userId)

  if (challengesError) throw challengesError

  if (formData.learning_challenge_ids.length > 0) {
    const { error: insertChallengesError } = await supabase
      .from('user_learning_challenges')
      .insert(
        formData.learning_challenge_ids.map(challenge_id => ({
          user_id: userId,
          challenge_id
        }))
      )

    if (insertChallengesError) throw insertChallengesError
  }

  return { success: true }
}
