/**
 * Migration script to move mock data to Supabase database
 * This script migrates sample scenarios and user data to the database
 */

import { createClient } from '@supabase/supabase-js'
import { sampleScenarios, sampleUsers } from '../data/sampleData'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface MigrationResult {
  success: boolean
  message: string
  data?: any
  error?: any
}

async function migrateScenarios(): Promise<MigrationResult> {
  try {
    console.log('Starting scenario migration...')
    
    // First, create categories if they don't exist
    const categories = [
      { slug: 'cardiac', name: 'Cardiac', description: 'Cardiovascular system assessment and interventions' },
      { slug: 'respiratory', name: 'Respiratory', description: 'Respiratory system assessment and oxygen therapy' },
      { slug: 'neurological', name: 'Neurological', description: 'Neurological assessment and stroke protocols' },
      { slug: 'pediatric', name: 'Pediatric', description: 'Pediatric-specific assessment and care' },
      { slug: 'pharmacology', name: 'Pharmacology', description: 'Medication administration and safety' }
    ]

    for (const category of categories) {
      const { error: categoryError } = await supabase
        .from('categories')
        .upsert(category, { onConflict: 'slug' })
      
      if (categoryError) {
        console.error('Error creating category:', categoryError)
      }
    }

    // Get category IDs
    const { data: categoryData, error: categoryFetchError } = await supabase
      .from('categories')
      .select('id, slug')

    if (categoryFetchError) {
      throw new Error(`Failed to fetch categories: ${categoryFetchError.message}`)
    }

    const categoryMap = new Map(categoryData.map(cat => [cat.slug, cat.id]))

    // Migrate scenarios
    const migratedScenarios = []
    
    for (const scenario of sampleScenarios) {
      // Get category ID
      const categoryId = categoryMap.get(scenario.category.toLowerCase())
      
      if (!categoryId) {
        console.warn(`Category not found for scenario: ${scenario.category}`)
        continue
      }

      // Transform scenario data to match database schema
      const scenarioData = {
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        content: scenario.content,
        difficulty: scenario.difficulty,
        category_id: categoryId,
        is_custom: scenario.is_custom,
        author_id: scenario.author_id,
        institution_id: scenario.institution_id,
        is_published: scenario.is_published,
        estimated_duration: scenario.estimated_duration,
        learning_objectives: scenario.learning_objectives,
        created_at: scenario.created_at,
        updated_at: scenario.updated_at
      }

      const { data, error } = await supabase
        .from('scenarios')
        .upsert(scenarioData, { onConflict: 'id' })

      if (error) {
        console.error(`Error migrating scenario ${scenario.id}:`, error)
        continue
      }

      migratedScenarios.push(scenarioData)

      // Migrate questions for this scenario
      if (scenario.content.questions) {
        for (const question of scenario.content.questions) {
          const questionData = {
            scenario_id: scenario.id,
            question_text: question.question,
            question_type: question.type,
            options: question.options ? { options: question.options } : null,
            correct_answer: question.correct_answer,
            explanation: question.explanation,
            rationale: question.rationale,
            points: question.points,
            difficulty: scenario.difficulty,
            category: question.category,
            time_limit: null,
            sort_order: 0,
            is_active: true
          }

          const { error: questionError } = await supabase
            .from('questions')
            .upsert(questionData, { onConflict: 'scenario_id,question_text' })

          if (questionError) {
            console.error(`Error migrating question for scenario ${scenario.id}:`, questionError)
          }
        }
      }
    }

    return {
      success: true,
      message: `Successfully migrated ${migratedScenarios.length} scenarios`,
      data: migratedScenarios
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to migrate scenarios',
      error
    }
  }
}

async function migrateUsers(): Promise<MigrationResult> {
  try {
    console.log('Starting user migration...')
    
    const migratedUsers = []
    
    for (const user of sampleUsers) {
      const userData = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: user.role,
        institution_id: user.institution_id,
        created_at: user.created_at,
        updated_at: user.updated_at
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(userData, { onConflict: 'id' })

      if (error) {
        console.error(`Error migrating user ${user.id}:`, error)
        continue
      }

      migratedUsers.push(userData)
    }

    return {
      success: true,
      message: `Successfully migrated ${migratedUsers.length} users`,
      data: migratedUsers
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to migrate users',
      error
    }
  }
}

async function migrateSampleProgress(): Promise<MigrationResult> {
  try {
    console.log('Starting sample progress migration...')
    
    // Create some sample progress entries for demonstration
    const sampleProgress = [
      {
        student_id: '2', // Alex Johnson
        scenario_id: '1', // Cardiac Assessment
        score: 85,
        status: 'completed',
        completed_at: new Date().toISOString(),
        time_spent: 12
      },
      {
        student_id: '2',
        scenario_id: '2', // Respiratory Assessment
        score: 92,
        status: 'completed',
        completed_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        time_spent: 10
      },
      {
        student_id: '2',
        scenario_id: '3', // Medication Administration
        score: 78,
        status: 'completed',
        completed_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        time_spent: 15
      }
    ]

    const migratedProgress = []
    
    for (const progress of sampleProgress) {
      const { data, error } = await supabase
        .from('student_progress')
        .upsert(progress, { onConflict: 'student_id,scenario_id' })

      if (error) {
        console.error(`Error migrating progress for student ${progress.student_id}:`, error)
        continue
      }

      migratedProgress.push(progress)
    }

    return {
      success: true,
      message: `Successfully migrated ${migratedProgress.length} progress entries`,
      data: migratedProgress
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to migrate sample progress',
      error
    }
  }
}

async function migrateSampleAnswers(): Promise<MigrationResult> {
  try {
    console.log('Starting sample answers migration...')
    
    // Create sample answers for completed scenarios
    const sampleAnswers = [
      {
        student_id: '2',
        question_id: 'q1', // This would need to be the actual question ID from the database
        scenario_id: '1',
        answer: 'Obtain 12-lead ECG',
        is_correct: true,
        points_earned: 10,
        time_spent: 30,
        attempt_number: 1
      },
      {
        student_id: '2',
        question_id: 'q2',
        scenario_id: '1',
        answer: 'Aspirin',
        is_correct: true,
        points_earned: 10,
        time_spent: 25,
        attempt_number: 1
      }
    ]

    const migratedAnswers = []
    
    for (const answer of sampleAnswers) {
      const { data, error } = await supabase
        .from('student_answers')
        .upsert(answer, { onConflict: 'student_id,question_id,attempt_number' })

      if (error) {
        console.error(`Error migrating answer for student ${answer.student_id}:`, error)
        continue
      }

      migratedAnswers.push(answer)
    }

    return {
      success: true,
      message: `Successfully migrated ${migratedAnswers.length} answer entries`,
      data: migratedAnswers
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to migrate sample answers',
      error
    }
  }
}

async function main() {
  console.log('Starting migration of mock data to database...')
  
  const results = []
  
  // Migrate in order
  results.push(await migrateScenarios())
  results.push(await migrateUsers())
  results.push(await migrateSampleProgress())
  results.push(await migrateSampleAnswers())
  
  // Print results
  console.log('\n=== Migration Results ===')
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.message}`)
    if (result.error) {
      console.error('Error details:', result.error)
    }
  })
  
  const successCount = results.filter(r => r.success).length
  const totalCount = results.length
  
  console.log(`\nMigration completed: ${successCount}/${totalCount} operations successful`)
  
  if (successCount === totalCount) {
    console.log('✅ All migrations completed successfully!')
  } else {
    console.log('⚠️ Some migrations failed. Check the logs above for details.')
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  main().catch(console.error)
}

export { migrateScenarios, migrateUsers, migrateSampleProgress, migrateSampleAnswers }