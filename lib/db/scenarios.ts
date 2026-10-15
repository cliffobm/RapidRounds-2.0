import { createClient } from '@/lib/supabase/client'
import { Scenario } from '@/types'
import { sampleScenarios } from '@/data/sampleData'

export interface ScenarioFilters {
  category?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  institutionId?: string
  isPublished?: boolean
  limit?: number
}

export async function getScenarios(filters: ScenarioFilters = {}): Promise<Scenario[]> {
  const { 
    category, 
    difficulty, 
    institutionId, 
    isPublished = true, 
    limit = 50 
  } = filters

  try {
    const supabase = createClient()
    
    let query = supabase
      .from('scenarios')
      .select(`
        *,
        profiles!scenarios_author_id_fkey(full_name),
        categories!scenarios_category_id_fkey(name, slug, color, icon)
      `)
      .eq('is_published', isPublished)

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }
    
    if (institutionId) {
      query = query.eq('institution_id', institutionId)
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase error, falling back to sample data:', error)
      return getSampleScenarios(filters)
    }

    return data || []
  } catch (error) {
    console.warn('Failed to connect to Supabase, using sample data:', error)
    return getSampleScenarios(filters)
  }
}

function getSampleScenarios(filters: ScenarioFilters = {}): Scenario[] {
  const { 
    category, 
    difficulty, 
    isPublished = true, 
    limit = 50 
  } = filters

  const filteredScenarios = sampleScenarios.filter(scenario => {
    if (isPublished && !scenario.is_published) return false
    if (category && scenario.category !== category) return false
    if (difficulty && scenario.difficulty !== difficulty) return false
    return true
  })

  // Sort by created_at (newest first)
  filteredScenarios.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return filteredScenarios.slice(0, limit)
}

export async function getScenarioById(id: string): Promise<Scenario | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('scenarios')
      .select(`
        *,
        profiles!scenarios_author_id_fkey(full_name),
        categories!scenarios_category_id_fkey(name, slug, color, icon)
      `)
      .eq('id', id)
      .eq('is_published', true)
      .single()

    if (error) {
      console.warn('Supabase error, falling back to sample data:', error)
      return getSampleScenarioById(id)
    }

    return data
  } catch (error) {
    console.warn('Failed to connect to Supabase, using sample data:', error)
    return getSampleScenarioById(id)
  }
}

function getSampleScenarioById(id: string): Scenario | null {
  return sampleScenarios.find(scenario => scenario.id === id) || null
}

export async function getScenarioWithQuestions(id: string): Promise<{
  scenario: Scenario
  questions: any[]
} | null> {
  const supabase = createClient()

  // Get scenario
  const { data: scenario, error: scenarioError } = await supabase
    .from('scenarios')
    .select(`
      *,
      profiles!scenarios_author_id_fkey(full_name),
      categories!scenarios_category_id_fkey(name, slug, color, icon)
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (scenarioError || !scenario) {
    console.error('Error fetching scenario:', scenarioError)
    return null
  }

  // Get questions for this scenario
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('scenario_id', id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (questionsError) {
    console.error('Error fetching questions:', questionsError)
    return null
  }

  return {
    scenario,
    questions: questions || []
  }
}

export async function getCategories(): Promise<any[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.warn('Supabase error, falling back to sample categories:', error)
      return getSampleCategories()
    }

    return data || []
  } catch (error) {
    console.warn('Failed to connect to Supabase, using sample categories:', error)
    return getSampleCategories()
  }
}

function getSampleCategories(): any[] {
  // Extract unique categories from sample scenarios
  const categories = Array.from(new Set(sampleScenarios.map(s => s.category)))
  return categories.map((category, index) => ({
    id: `sample-${index + 1}`,
    name: category,
    slug: category.toLowerCase().replace(/\s+/g, '-'),
    color: getCategoryColor(category),
    icon: getCategoryIcon(category),
    is_active: true,
    sort_order: index + 1
  }))
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Cardiac': '#ef4444',
    'Respiratory': '#3b82f6',
    'Pharmacology': '#8b5cf6',
    'Neurological': '#f59e0b',
    'Pediatric': '#10b981',
    'Gastrointestinal': '#f97316',
    'Endocrine': '#ec4899',
    'Integumentary': '#6b7280',
    'Critical Care': '#dc2626'
  }
  return colors[category] || '#6b7280'
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Cardiac': '❤️',
    'Respiratory': '🫁',
    'Pharmacology': '💊',
    'Neurological': '🧠',
    'Pediatric': '👶',
    'Gastrointestinal': '🫀',
    'Endocrine': '⚕️',
    'Integumentary': '🩹',
    'Critical Care': '🚨'
  }
  return icons[category] || '📋'
}

export async function createScenario(scenarioData: Partial<Scenario>): Promise<Scenario | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('scenarios')
    .insert(scenarioData)
    .select()
    .single()

  if (error) {
    console.error('Error creating scenario:', error)
    return null
  }

  return data
}

export async function updateScenario(id: string, updates: Partial<Scenario>): Promise<Scenario | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('scenarios')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating scenario:', error)
    return null
  }

  return data
}

export async function deleteScenario(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('scenarios')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting scenario:', error)
    return false
  }

  return true
}
