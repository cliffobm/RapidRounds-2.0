#!/usr/bin/env tsx

import fs from 'fs/promises'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { ContentItemSchema } from './generate-content'

// Database types (matching your schema)
interface Database {
  public: {
    Tables: {
      scenarios: {
        Row: {
          id: string
          title: string
          description: string | null
          content: any
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          category: string
          category_id: string | null
          is_custom: boolean
          author_id: string | null
          institution_id: string | null
          is_published: boolean
          estimated_duration: number
          learning_objectives: string[]
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content: any
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          category: string
          category_id?: string | null
          is_custom?: boolean
          author_id?: string | null
          institution_id?: string | null
          is_published?: boolean
          estimated_duration: number
          learning_objectives: string[]
          tags: string[]
        }
      }
      questions: {
        Row: {
          id: string
          scenario_id: string
          question_text: string
          question_type: 'multiple_choice' | 'text' | 'priority' | 'assessment' | 'true_false'
          options: any
          correct_answer: any
          explanation: string | null
          rationale: string | null
          points: number
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          category: string
          time_limit: number | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          scenario_id: string
          question_text: string
          question_type: 'multiple_choice' | 'text' | 'priority' | 'assessment' | 'true_false'
          options?: any
          correct_answer: any
          explanation?: string | null
          rationale?: string | null
          points?: number
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          category: string
          time_limit?: number | null
          sort_order?: number
          is_active?: boolean
        }
      }
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number
          is_active?: boolean
        }
      }
    }
  }
}

type ContentItem = z.infer<typeof ContentItemSchema>

class ContentImporter {
  private supabase: any
  private categoryMap: Map<string, string> = new Map()

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseKey)
  }

  async importFromFile(filePath: string, authorId?: string): Promise<void> {
    console.log(`📁 Importing content from: ${filePath}`)

    // Read and parse JSONL file
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.trim().split('\n').filter(line => line.trim())
    
    const items: ContentItem[] = []
    for (const line of lines) {
      try {
        const item = JSON.parse(line)
        const validated = ContentItemSchema.parse(item)
        items.push(validated)
      } catch (error) {
        console.warn(`⚠️  Skipping invalid item: ${error}`)
      }
    }

    if (items.length === 0) {
      throw new Error('No valid items found in file')
    }

    console.log(`📊 Found ${items.length} valid items`)

    // Group items by scenario
    const scenarioGroups = this.groupItemsByScenario(items)
    
    // Import each scenario group
    for (const [scenarioTitle, scenarioItems] of scenarioGroups) {
      await this.importScenario(scenarioTitle, scenarioItems, authorId)
    }

    console.log(`✅ Import completed successfully`)
  }

  private groupItemsByScenario(items: ContentItem[]): Map<string, ContentItem[]> {
    const groups = new Map<string, ContentItem[]>()
    
    for (const item of items) {
      const key = `${item.category}-${item.scenario_title}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(item)
    }
    
    return groups
  }

  private async importScenario(title: string, items: ContentItem[], authorId?: string): Promise<void> {
    if (items.length === 0) return

    const firstItem = items[0]
    if (!firstItem) return
    
    const categoryId = await this.getOrCreateCategory(firstItem.category)

    // Create scenario
    const scenarioData = {
      title: firstItem.scenario_title,
      description: `Generated scenario for ${firstItem.category} system`,
      content: {
        patient_info: this.generatePatientInfo(firstItem.category),
        vital_signs: this.generateVitalSigns(firstItem.category),
        history: this.generateHistory(firstItem.category),
        presentation: this.generatePresentation(firstItem.category),
        questions: items.map(item => this.convertToScenarioQuestion(item)),
        rationales: items.map(item => this.convertToScenarioRationale(item)),
        resources: []
      },
      difficulty: firstItem.difficulty,
      category: firstItem.category,
      category_id: categoryId,
      is_custom: false,
      author_id: authorId || null,
      institution_id: null,
      is_published: true,
      estimated_duration: this.calculateEstimatedDuration(items),
      learning_objectives: this.extractLearningObjectives(items),
      tags: this.extractTags(items)
    }

    const { data: scenario, error: scenarioError } = await this.supabase
      .from('scenarios')
      .insert(scenarioData)
      .select()
      .single()

    if (scenarioError) {
      throw new Error(`Failed to create scenario: ${scenarioError.message}`)
    }

    console.log(`📝 Created scenario: ${scenario.title} (ID: ${scenario.id})`)

    // Create questions
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!item) continue
      const questionData = {
        scenario_id: scenario.id,
        question_text: item.prompt,
        question_type: this.mapQuestionType(item.question_type),
        options: item.options,
        correct_answer: item.correct,
        explanation: item.rationale,
        rationale: item.rationale,
        points: this.calculatePoints(item),
        difficulty: item.difficulty,
        category: item.priority_type || 'assessment',
        time_limit: this.calculateTimeLimit(item),
        sort_order: i + 1,
        is_active: true
      }

      const { error: questionError } = await this.supabase
        .from('questions')
        .insert(questionData)

      if (questionError) {
        console.warn(`⚠️  Failed to create question: ${questionError.message}`)
      }
    }

    console.log(`❓ Created ${items.length} questions for scenario`)
  }

  private async getOrCreateCategory(categorySlug: string): Promise<string> {
    // Check if category already exists
    if (this.categoryMap.has(categorySlug)) {
      return this.categoryMap.get(categorySlug)!
    }

    const { data: existingCategory } = await this.supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (existingCategory) {
      this.categoryMap.set(categorySlug, existingCategory.id)
      return existingCategory.id
    }

    // Create new category
    const categoryData = {
      slug: categorySlug,
      name: this.getCategoryName(categorySlug),
      description: this.getCategoryDescription(categorySlug),
      icon: this.getCategoryIcon(categorySlug),
      color: this.getCategoryColor(categorySlug),
      sort_order: this.getCategorySortOrder(categorySlug),
      is_active: true
    }

    const { data: newCategory, error } = await this.supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`)
    }

    this.categoryMap.set(categorySlug, newCategory.id)
    return newCategory.id
  }

  private mapQuestionType(questionType: string): 'multiple_choice' | 'text' | 'priority' | 'assessment' | 'true_false' {
    switch (questionType) {
      case 'single':
      case 'multi':
        return 'multiple_choice'
      case 'order':
        return 'priority'
      default:
        return 'multiple_choice'
    }
  }

  private calculatePoints(item: ContentItem): number {
    switch (item.question_type) {
      case 'order':
        return 15
      case 'multi':
        return 10
      case 'single':
        return 5
      default:
        return 5
    }
  }

  private calculateTimeLimit(item: ContentItem): number {
    switch (item.question_type) {
      case 'order':
        return 120 // 2 minutes for ordering
      case 'multi':
        return 90  // 1.5 minutes for multiple choice
      case 'single':
        return 60  // 1 minute for single choice
      default:
        return 60
    }
  }

  private calculateEstimatedDuration(items: ContentItem[]): number {
    // Base time + time per question
    const baseTime = 5 // minutes
    const timePerQuestion = items.reduce((total, item) => {
      return total + (this.calculateTimeLimit(item) / 60)
    }, 0)
    
    return Math.ceil(baseTime + timePerQuestion)
  }

  private extractLearningObjectives(items: ContentItem[]): string[] {
    const objectives = new Set<string>()
    
    for (const item of items) {
      if (item.learning_objectives) {
        item.learning_objectives.forEach(obj => objectives.add(obj))
      }
    }
    
    return Array.from(objectives)
  }

  private extractTags(items: ContentItem[]): string[] {
    const tags = new Set<string>()
    
    for (const item of items) {
      if (item.tags) {
        item.tags.forEach(tag => tags.add(tag))
      }
    }
    
    return Array.from(tags)
  }

  private convertToScenarioQuestion(item: ContentItem): any {
    return {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.mapQuestionType(item.question_type),
      question: item.prompt,
      options: item.options,
      correct_answer: item.correct,
      points: this.calculatePoints(item),
      explanation: item.rationale,
      category: item.priority_type || 'assessment'
    }
  }

  private convertToScenarioRationale(item: ContentItem): any {
    return {
      question_id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      explanation: item.rationale,
      evidence: this.extractEvidence(item.rationale),
      references: this.extractReferences(item.rationale),
      tier: 'free'
    }
  }

  private extractEvidence(rationale: string): string[] {
    // Extract evidence statements from rationale
    const evidencePattern = /(?:Evidence|Research shows|Studies indicate)[^.]*\./gi
    const matches = rationale.match(evidencePattern) || []
    return matches.map(match => match.trim())
  }

  private extractReferences(rationale: string): string[] {
    // Extract references from rationale
    const referencePattern = /\([^)]*\d{4}[^)]*\)/g
    const matches = rationale.match(referencePattern) || []
    return matches.map(match => match.replace(/[()]/g, '').trim())
  }

  // Helper methods for generating scenario content
  private generatePatientInfo(category: string): any {
    const patientTemplates = {
      cardiovascular: {
        name: 'John D.',
        age: 65,
        gender: 'male',
        weight: 180,
        height: 70,
        allergies: ['Penicillin'],
        medications: ['Metoprolol', 'Lisinopril'],
        medical_history: ['Hypertension', 'Hyperlipidemia']
      },
      respiratory: {
        name: 'Mary S.',
        age: 58,
        gender: 'female',
        weight: 140,
        height: 65,
        allergies: ['None known'],
        medications: ['Albuterol inhaler'],
        medical_history: ['COPD', 'Smoking history']
      }
      // Add more templates as needed
    }
    
    return patientTemplates[category as keyof typeof patientTemplates] || {
      name: 'Patient',
      age: 50,
      gender: 'other',
      weight: 160,
      height: 68,
      allergies: [],
      medications: [],
      medical_history: []
    }
  }

  private generateVitalSigns(category: string): any {
    const vitalTemplates = {
      cardiovascular: {
        temperature: 98.6,
        blood_pressure: { systolic: 140, diastolic: 90 },
        heart_rate: 95,
        respiratory_rate: 20,
        oxygen_saturation: 98,
        pain_level: 6
      },
      respiratory: {
        temperature: 100.2,
        blood_pressure: { systolic: 120, diastolic: 80 },
        heart_rate: 110,
        respiratory_rate: 28,
        oxygen_saturation: 88,
        pain_level: 4
      }
    }
    
    return vitalTemplates[category as keyof typeof vitalTemplates] || {
      temperature: 98.6,
      blood_pressure: { systolic: 120, diastolic: 80 },
      heart_rate: 80,
      respiratory_rate: 16,
      oxygen_saturation: 98,
      pain_level: 0
    }
  }

  private generateHistory(category: string): string {
    return `Patient presents with ${category}-related symptoms requiring immediate assessment and intervention.`
  }

  private generatePresentation(category: string): string {
    return `Patient arrives in emergency department with acute ${category} symptoms. Immediate nursing assessment and intervention required.`
  }

  // Category helper methods
  private getCategoryName(slug: string): string {
    const names: Record<string, string> = {
      cardiovascular: 'Cardiovascular System',
      respiratory: 'Respiratory System',
      gastrointestinal: 'Gastrointestinal System',
      endocrine: 'Endocrine System',
      integumentary: 'Integumentary System',
      musculoskeletal: 'Musculoskeletal System',
      neurological: 'Neurological System',
      genitourinary: 'Genitourinary System',
      psychiatric: 'Psychiatric/Mental Health'
    }
    return names[slug] || slug
  }

  private getCategoryDescription(slug: string): string {
    const descriptions: Record<string, string> = {
      cardiovascular: 'Heart, blood vessels, and circulatory system conditions',
      respiratory: 'Lungs, breathing, and oxygenation disorders',
      gastrointestinal: 'Digestive system and GI tract conditions',
      endocrine: 'Hormonal and metabolic disorders',
      integumentary: 'Skin, wounds, and dermatological conditions',
      musculoskeletal: 'Bones, joints, and muscle disorders',
      neurological: 'Brain, spinal cord, and nervous system conditions',
      genitourinary: 'Kidney, urinary, and reproductive system disorders',
      psychiatric: 'Mental health and behavioral conditions'
    }
    return descriptions[slug] || 'Medical condition category'
  }

  private getCategoryIcon(slug: string): string {
    const icons: Record<string, string> = {
      cardiovascular: 'heart',
      respiratory: 'lungs',
      gastrointestinal: 'stomach',
      endocrine: 'hormones',
      integumentary: 'skin',
      musculoskeletal: 'bones',
      neurological: 'brain',
      genitourinary: 'kidney',
      psychiatric: 'brain-heart'
    }
    return icons[slug] || 'medical'
  }

  private getCategoryColor(slug: string): string {
    const colors: Record<string, string> = {
      cardiovascular: '#DC2626',
      respiratory: '#0EA5E9',
      gastrointestinal: '#059669',
      endocrine: '#D97706',
      integumentary: '#7C3AED',
      musculoskeletal: '#DB2777',
      neurological: '#9333EA',
      genitourinary: '#0891B2',
      psychiatric: '#BE185D'
    }
    return colors[slug] || '#6B7280'
  }

  private getCategorySortOrder(slug: string): number {
    const orders: Record<string, number> = {
      cardiovascular: 1,
      respiratory: 2,
      gastrointestinal: 3,
      endocrine: 4,
      integumentary: 5,
      musculoskeletal: 6,
      neurological: 7,
      genitourinary: 8,
      psychiatric: 9
    }
    return orders[slug] || 10
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 1) {
    console.log(`
Usage: tsx import-content.ts <filePath> [authorId]

Examples:
  tsx import-content.ts ../categories/cardiovascular/acute-mi.jsonl
  tsx import-content.ts ../generated/respiratory-copd.jsonl user-123

Environment variables required:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
    `)
    process.exit(1)
  }

  const [filePath, authorId] = args

  try {
    const importer = new ContentImporter()
    await importer.importFromFile(filePath || '', authorId || '')
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { ContentImporter }
