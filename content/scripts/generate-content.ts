#!/usr/bin/env tsx

import fs from 'fs/promises'
import path from 'path'
import { z } from 'zod'
import { CATEGORY_PROMPTS, DIFFICULTY_LEVELS, QUESTION_TYPES, PRIORITY_TYPES, SYSTEM_PROMPT } from '../templates/prompts'

// Content item schema validation
export const ContentItemSchema = z.object({
  category: z.enum([
    'cardiovascular', 'respiratory', 'gastrointestinal', 'endocrine',
    'integumentary', 'musculoskeletal', 'neurological', 'genitourinary', 'psychiatric'
  ]),
  scenario_title: z.string().min(5).max(100),
  question_type: z.enum(['single', 'multi', 'order']),
  prompt: z.string().min(20).max(500),
  options: z.array(z.string().min(5).max(200)).min(4).max(5),
  correct: z.array(z.string()).min(1),
  rationale: z.string().min(100).max(1000),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('intermediate'),
  priority_type: z.enum(['assessment', 'intervention', 'evaluation', 'planning']).optional().default('assessment'),
  learning_objectives: z.array(z.string()).max(5).optional(),
  tags: z.array(z.string()).max(10).optional()
})

export type ContentItem = z.infer<typeof ContentItemSchema>

interface GenerationConfig {
  category: keyof typeof CATEGORY_PROMPTS
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  numItems: number
  priorityPercentage: number
  includeOrderQuestion: boolean
}

class ContentGenerator {
  private outputDir: string
  private categoriesDir: string

  constructor() {
    this.outputDir = path.join(process.cwd(), 'content', 'generated')
    this.categoriesDir = path.join(process.cwd(), 'content', 'categories')
  }

  async generateContent(config: GenerationConfig): Promise<void> {
    console.log(`🎯 Generating ${config.numItems} items for ${config.category} - ${config.title}`)
    
    // Validate category exists
    if (!(config.category in CATEGORY_PROMPTS)) {
      throw new Error(`Invalid category: ${config.category}`)
    }

    // Create output directories
    await this.ensureDirectories()

    // Generate content items
    const items: ContentItem[] = []
    
    // Calculate distribution
    const priorityCount = Math.floor(config.numItems * (config.priorityPercentage / 100))
    const regularCount = config.numItems - priorityCount
    const orderCount = config.includeOrderQuestion ? 1 : 0

    console.log(`📊 Distribution: ${priorityCount} priority, ${regularCount} regular, ${orderCount} order`)

    // Generate priority/assessment items
    for (let i = 0; i < priorityCount; i++) {
      const item = await this.generatePriorityItem(config)
      items.push(item)
    }

    // Generate regular items
    for (let i = 0; i < regularCount; i++) {
      const item = await this.generateRegularItem(config)
      items.push(item)
    }

    // Generate order question if requested
    if (config.includeOrderQuestion) {
      const item = await this.generateOrderItem(config)
      items.push(item)
    }

    // Validate all items
    const validatedItems = this.validateItems(items)

    // Save to JSONL file
    await this.saveToJSONL(config, validatedItems)

    console.log(`✅ Generated ${validatedItems.length} items successfully`)
  }

  private async generatePriorityItem(config: GenerationConfig): Promise<ContentItem> {
    // This would integrate with AI service (OpenAI, Claude, etc.)
    // For now, return a template structure
    const priorityType = this.getRandomPriorityType()
    const categoryInfo = CATEGORY_PROMPTS[config.category as keyof typeof CATEGORY_PROMPTS]
    
    return {
      category: config.category,
      scenario_title: config.title,
      question_type: 'single',
      prompt: `What is the priority ${priorityType} action for a patient with ${this.getRandomCondition(config.category)}?`,
      options: [
        'A. Monitor vital signs every 4 hours',
        'B. Assess airway, breathing, and circulation immediately',
        'C. Administer prescribed medications',
        'D. Document patient history'
      ],
      correct: ['B'],
      rationale: `The correct answer is B. In any emergency situation, the ABCs (Airway, Breathing, Circulation) take priority. This follows the systematic approach to patient assessment and ensures immediate life-threatening issues are addressed first. Option A is routine monitoring, not priority assessment. Option C should only be done after assessment. Option D is important but not the immediate priority. References: American Heart Association (2020). Basic Life Support Provider Manual. Jones & Bartlett Learning.`,
      difficulty: config.difficulty,
      priority_type: priorityType,
      learning_objectives: [`Demonstrate priority ${priorityType} skills`],
      tags: [config.category, priorityType, 'priority']
    }
  }

  private async generateRegularItem(config: GenerationConfig): Promise<ContentItem> {
    const questionType = this.getRandomQuestionType()
    const categoryInfo = CATEGORY_PROMPTS[config.category as keyof typeof CATEGORY_PROMPTS]
    
    return {
      category: config.category,
      scenario_title: config.title,
      question_type: questionType,
      prompt: `A patient presents with ${this.getRandomSymptom(config.category)}. What is the most appropriate nursing intervention?`,
      priority_type: this.getRandomPriorityType(),
      options: [
        'A. Apply warm compress to affected area',
        'B. Administer oxygen via nasal cannula',
        'C. Position patient in high Fowler\'s position',
        'D. All of the above'
      ],
      correct: questionType === 'multi' ? ['B', 'C'] : ['D'],
      rationale: `The correct answer is ${questionType === 'multi' ? 'B and C' : 'D'}. ${this.getRationaleExplanation(config.category)}. References: Lewis et al. (2020). Medical-Surgical Nursing: Assessment and Management of Clinical Problems. Elsevier.`,
      difficulty: config.difficulty,
      learning_objectives: [`Apply ${config.category} nursing interventions`],
      tags: [config.category, 'intervention']
    }
  }

  private async generateOrderItem(config: GenerationConfig): Promise<ContentItem> {
    const categoryInfo = CATEGORY_PROMPTS[config.category as keyof typeof CATEGORY_PROMPTS]
    
    return {
      category: config.category,
      scenario_title: config.title,
      question_type: 'order',
      prompt: `Prioritize these nursing interventions for a patient with ${this.getRandomCondition(config.category)}:`,
      options: [
        'Assess vital signs',
        'Administer oxygen',
        'Obtain IV access',
        'Notify physician',
        'Document findings'
      ],
      correct: [
        'Administer oxygen',
        'Obtain IV access', 
        'Assess vital signs',
        'Notify physician',
        'Document findings'
      ],
      rationale: `The correct order prioritizes immediate life-saving interventions first. Oxygen administration addresses airway/breathing, IV access enables medication administration, vital signs provide baseline data, physician notification ensures medical oversight, and documentation maintains continuity of care. References: Potter & Perry (2021). Fundamentals of Nursing. Elsevier.`,
      difficulty: config.difficulty,
      priority_type: 'intervention',
      learning_objectives: [`Demonstrate priority setting in ${config.category} care`],
      tags: [config.category, 'priority', 'order']
    }
  }

  private getRandomPriorityType(): 'assessment' | 'intervention' | 'evaluation' | 'planning' {
    const types = ['assessment', 'intervention', 'evaluation', 'planning'] as const
    const index = Math.floor(Math.random() * types.length)
    return types[index]!
  }

  private getRandomQuestionType(): 'single' | 'multi' | 'order' {
    const types = ['single', 'multi'] as const
    const index = Math.floor(Math.random() * types.length)
    return types[index]!
  }

  private getRandomCondition(category: string): string {
    const conditions = {
      cardiovascular: ['chest pain', 'hypertension', 'heart failure'],
      respiratory: ['shortness of breath', 'pneumonia', 'COPD exacerbation'],
      gastrointestinal: ['abdominal pain', 'nausea', 'GI bleeding'],
      endocrine: ['diabetes', 'hypoglycemia', 'thyroid disorder'],
      integumentary: ['pressure ulcer', 'wound infection', 'burns'],
      musculoskeletal: ['fracture', 'joint pain', 'muscle weakness'],
      neurological: ['headache', 'seizure', 'altered mental status'],
      genitourinary: ['urinary retention', 'kidney stones', 'UTI'],
      psychiatric: ['anxiety', 'depression', 'confusion']
    }
    
    const categoryConditions = conditions[category as keyof typeof conditions] || ['medical condition']
    const index = Math.floor(Math.random() * categoryConditions.length)
    return categoryConditions[index]!
  }

  private getRandomSymptom(category: string): string {
    const symptoms = {
      cardiovascular: ['chest pain radiating to left arm', 'dyspnea on exertion', 'edema'],
      respiratory: ['productive cough', 'wheezing', 'cyanosis'],
      gastrointestinal: ['severe abdominal pain', 'vomiting', 'diarrhea'],
      endocrine: ['polyuria', 'polydipsia', 'weight loss'],
      integumentary: ['redness and swelling', 'drainage', 'warmth'],
      musculoskeletal: ['limited range of motion', 'swelling', 'deformity'],
      neurological: ['confusion', 'weakness', 'numbness'],
      genitourinary: ['dysuria', 'frequency', 'urgency'],
      psychiatric: ['agitation', 'withdrawal', 'hallucinations']
    }
    
    const categorySymptoms = symptoms[category as keyof typeof symptoms] || ['unusual symptoms']
    const index = Math.floor(Math.random() * categorySymptoms.length)
    return categorySymptoms[index]!
  }

  private getRationaleExplanation(category: string): string {
    const explanations = {
      cardiovascular: 'Cardiovascular conditions require immediate assessment of circulation and cardiac function',
      respiratory: 'Respiratory conditions prioritize airway management and oxygenation',
      gastrointestinal: 'GI conditions focus on pain management and fluid balance',
      endocrine: 'Endocrine disorders require careful monitoring of metabolic status',
      integumentary: 'Skin conditions need infection prevention and wound care',
      musculoskeletal: 'Musculoskeletal issues require pain management and mobility assessment',
      neurological: 'Neurological conditions need immediate neurological assessment',
      genitourinary: 'GU conditions require fluid balance and infection monitoring',
      psychiatric: 'Psychiatric conditions need safety assessment and therapeutic communication'
    }
    
    return explanations[category as keyof typeof explanations] || 'This condition requires appropriate nursing assessment and intervention'
  }

  private validateItems(items: ContentItem[]): ContentItem[] {
    const validatedItems: ContentItem[] = []
    
    for (const item of items) {
      try {
        const validated = ContentItemSchema.parse(item)
        validatedItems.push(validated)
      } catch (error) {
        console.warn(`⚠️  Validation failed for item: ${item.scenario_title}`)
        console.warn(`Error: ${error}`)
      }
    }
    
    return validatedItems
  }

  private async saveToJSONL(config: GenerationConfig, items: ContentItem[]): Promise<void> {
    const filename = `${config.category}-${config.title.toLowerCase().replace(/\s+/g, '-')}.jsonl`
    const filepath = path.join(this.categoriesDir, config.category, filename)
    
    const jsonlContent = items.map(item => JSON.stringify(item)).join('\n')
    await fs.writeFile(filepath, jsonlContent, 'utf-8')
    
    console.log(`💾 Saved to: ${filepath}`)
  }

  private async ensureDirectories(): Promise<void> {
    // Create main directories
    await fs.mkdir(this.outputDir, { recursive: true })
    await fs.mkdir(this.categoriesDir, { recursive: true })
    
    // Create category directories
    for (const category of Object.keys(CATEGORY_PROMPTS)) {
      const categoryDir = path.join(this.categoriesDir, category)
      await fs.mkdir(categoryDir, { recursive: true })
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 4) {
    console.log(`
Usage: tsx generate-content.ts <category> <title> <difficulty> <numItems> [priorityPercentage] [includeOrder]

Examples:
  tsx generate-content.ts cardiovascular "Acute MI" intermediate 10
  tsx generate-content.ts respiratory "COPD Exacerbation" advanced 15 30 true
  tsx generate-content.ts endocrine "DKA Management" beginner 8 25 false

Categories: ${Object.keys(CATEGORY_PROMPTS).join(', ')}
Difficulties: beginner, intermediate, advanced
    `)
    process.exit(1)
  }

  const [category, title, difficulty, numItems, priorityPercentage = '30', includeOrder = 'true'] = args

  const config: GenerationConfig = {
    category: category as keyof typeof CATEGORY_PROMPTS,
    title: title || 'Generated Content',
    difficulty: (difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
    numItems: parseInt(numItems || '5'),
    priorityPercentage: parseInt(priorityPercentage),
    includeOrderQuestion: includeOrder === 'true'
  }

  try {
    const generator = new ContentGenerator()
    await generator.generateContent(config)
  } catch (error) {
    console.error('❌ Generation failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { ContentGenerator, type GenerationConfig }
