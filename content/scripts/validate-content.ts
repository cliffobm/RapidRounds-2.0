#!/usr/bin/env tsx

import fs from 'fs/promises'
import path from 'path'
import { z } from 'zod'
import { ContentItemSchema } from './generate-content'

type ContentItem = z.infer<typeof ContentItemSchema>

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  stats: ValidationStats
}

interface ValidationError {
  type: 'schema' | 'content' | 'format'
  message: string
  item?: ContentItem
  field?: string
}

interface ValidationWarning {
  type: 'quality' | 'consistency' | 'best_practice'
  message: string
  item?: ContentItem
  field?: string
}

interface ValidationStats {
  totalItems: number
  validItems: number
  invalidItems: number
  warnings: number
  categories: Record<string, number>
  questionTypes: Record<string, number>
  difficulties: Record<string, number>
}

class ContentValidator {
  private referencePatterns = {
    apa: /\([A-Za-z\s]+,\s*\d{4}\)/g,
    year: /\b(20[12]\d)\b/g,
    citation: /(?:References?|Sources?|Literature)/gi
  }

  private qualityChecks = {
    rationaleLength: { min: 100, max: 1000 },
    promptLength: { min: 20, max: 500 },
    optionLength: { min: 5, max: 200 },
    minOptions: 4,
    maxOptions: 5,
    minReferences: 2,
    maxReferences: 3
  }

  async validateFile(filePath: string): Promise<ValidationResult> {
    console.log(`🔍 Validating content file: ${filePath}`)

    // Read and parse file
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.trim().split('\n').filter(line => line.trim())
    
    const items: ContentItem[] = []
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Parse and validate each item
    for (let i = 0; i < lines.length; i++) {
      try {
        const item = JSON.parse(lines[i] || '{}')
        const validated = ContentItemSchema.parse(item)
        items.push(validated)
      } catch (error) {
        errors.push({
          type: 'schema',
          message: `Line ${i + 1}: ${error}`,
          field: 'json_parse'
        })
      }
    }

    // Validate each item
    for (const item of items) {
      const itemErrors = this.validateItem(item)
      const itemWarnings = this.checkQuality(item)
      
      errors.push(...itemErrors)
      warnings.push(...itemWarnings)
    }

    // Generate statistics
    const stats = this.generateStats(items, errors, warnings)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats
    }
  }

  private validateItem(item: ContentItem): ValidationError[] {
    const errors: ValidationError[] = []

    // Schema validation (already done, but double-check)
    try {
      ContentItemSchema.parse(item)
    } catch (error) {
      errors.push({
        type: 'schema',
        message: `Schema validation failed: ${error}`,
        item,
        field: 'schema'
      })
    }

    // Content validation
    errors.push(...this.validateContent(item))

    return errors
  }

  private validateContent(item: ContentItem): ValidationError[] {
    const errors: ValidationError[] = []

    // Check rationale has references
    if (!this.hasValidReferences(item.rationale)) {
      errors.push({
        type: 'content',
        message: 'Rationale must contain 2-3 APA-style references from last 5-7 years',
        item,
        field: 'rationale'
      })
    }

    // Check correct answers match options
    if (!this.correctAnswersMatchOptions(item)) {
      errors.push({
        type: 'content',
        message: 'Correct answers must match available options',
        item,
        field: 'correct'
      })
    }

    // Check question type consistency
    if (!this.questionTypeConsistent(item)) {
      errors.push({
        type: 'content',
        message: 'Question type does not match options or correct answers',
        item,
        field: 'question_type'
      })
    }

    // Check for brand names
    if (this.containsBrandNames(item)) {
      errors.push({
        type: 'content',
        message: 'Content should not contain brand names, use generic terms',
        item,
        field: 'prompt'
      })
    }

    return errors
  }

  private checkQuality(item: ContentItem): ValidationWarning[] {
    const warnings: ValidationWarning[] = []

    // Check rationale length
    if (item.rationale.length < this.qualityChecks.rationaleLength.min) {
      warnings.push({
        type: 'quality',
        message: 'Rationale is too short, consider adding more detail',
        item,
        field: 'rationale'
      })
    }

    if (item.rationale.length > this.qualityChecks.rationaleLength.max) {
      warnings.push({
        type: 'quality',
        message: 'Rationale is too long, consider condensing',
        item,
        field: 'rationale'
      })
    }

    // Check prompt length
    if (item.prompt.length < this.qualityChecks.promptLength.min) {
      warnings.push({
        type: 'quality',
        message: 'Prompt is too short, consider adding more context',
        item,
        field: 'prompt'
      })
    }

    // Check option lengths
    for (let i = 0; i < item.options.length; i++) {
      const option = item.options[i]
      if (option && option.length < this.qualityChecks.optionLength.min) {
        warnings.push({
          type: 'quality',
          message: `Option ${i + 1} is too short`,
          item,
          field: 'options'
        })
      }
      if (option && option.length > this.qualityChecks.optionLength.max) {
        warnings.push({
          type: 'quality',
          message: `Option ${i + 1} is too long`,
          item,
          field: 'options'
        })
      }
    }

    // Check for reading level
    if (this.hasComplexLanguage(item)) {
      warnings.push({
        type: 'best_practice',
        message: 'Consider simplifying language for better readability',
        item,
        field: 'prompt'
      })
    }

    // Check for PHI indicators
    if (this.containsPHIIndicators(item)) {
      warnings.push({
        type: 'best_practice',
        message: 'Content may contain PHI indicators, review for privacy',
        item,
        field: 'prompt'
      })
    }

    return warnings
  }

  private hasValidReferences(rationale: string): boolean {
    const apaMatches = rationale.match(this.referencePatterns.apa) || []
    const yearMatches = rationale.match(this.referencePatterns.year) || []
    
    // Check for 2-3 references
    if (apaMatches.length < this.qualityChecks.minReferences || 
        apaMatches.length > this.qualityChecks.maxReferences) {
      return false
    }

    // Check for recent years (last 5-7 years)
    const currentYear = new Date().getFullYear()
    const recentYears = yearMatches.filter(year => {
      const yearNum = parseInt(year)
      return yearNum >= currentYear - 7 && yearNum <= currentYear
    })

    return recentYears.length >= this.qualityChecks.minReferences
  }

  private correctAnswersMatchOptions(item: ContentItem): boolean {
    for (const correct of item.correct) {
      if (!item.options.some(option => option.includes(correct))) {
        return false
      }
    }
    return true
  }

  private questionTypeConsistent(item: ContentItem): boolean {
    switch (item.question_type) {
      case 'single':
        return item.correct.length === 1
      case 'multi':
        return item.correct.length > 1
      case 'order':
        return item.correct.length === item.options.length
      default:
        return false
    }
  }

  private containsBrandNames(item: ContentItem): boolean {
    const brandPatterns = [
      /Tylenol/i, /Advil/i, /Motrin/i, /Aspirin/i,
      /Viagra/i, /Lipitor/i, /Prozac/i, /Xanax/i,
      /Crestor/i, /Nexium/i, /Prilosec/i, /Zocor/i
    ]

    const text = `${item.prompt} ${item.options.join(' ')} ${item.rationale}`
    return brandPatterns.some(pattern => pattern.test(text))
  }

  private hasComplexLanguage(item: ContentItem): boolean {
    const complexWords = [
      'paradigm', 'utilize', 'facilitate', 'implement',
      'comprehensive', 'sophisticated', 'multifaceted'
    ]

    const text = `${item.prompt} ${item.rationale}`.toLowerCase()
    return complexWords.some(word => text.includes(word))
  }

  private containsPHIIndicators(item: ContentItem): boolean {
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b[A-Z]{2}\d{6}\b/, // Driver's license
      /\b\d{4}\s\d{4}\s\d{4}\s\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email
    ]

    const text = `${item.prompt} ${item.options.join(' ')} ${item.rationale}`
    return phiPatterns.some(pattern => pattern.test(text))
  }

  private generateStats(items: ContentItem[], errors: ValidationError[], warnings: ValidationWarning[]): ValidationStats {
    const stats: ValidationStats = {
      totalItems: items.length,
      validItems: items.length - errors.length,
      invalidItems: errors.length,
      warnings: warnings.length,
      categories: {},
      questionTypes: {},
      difficulties: {}
    }

    // Count by category
    for (const item of items) {
      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1
      stats.questionTypes[item.question_type] = (stats.questionTypes[item.question_type] || 0) + 1
      stats.difficulties[item.difficulty] = (stats.difficulties[item.difficulty] || 0) + 1
    }

    return stats
  }

  async generateReport(result: ValidationResult, outputPath?: string): Promise<void> {
    const report = this.formatReport(result)
    
    if (outputPath) {
      await fs.writeFile(outputPath, report, 'utf-8')
      console.log(`📊 Report saved to: ${outputPath}`)
    } else {
      console.log(report)
    }
  }

  private formatReport(result: ValidationResult): string {
    const { stats, errors, warnings } = result
    
    let report = `
# Content Validation Report

## Summary
- **Total Items**: ${stats.totalItems}
- **Valid Items**: ${stats.validItems}
- **Invalid Items**: ${stats.invalidItems}
- **Warnings**: ${warnings.length}
- **Status**: ${result.isValid ? '✅ PASSED' : '❌ FAILED'}

## Statistics

### By Category
${Object.entries(stats.categories).map(([cat, count]) => `- ${cat}: ${count}`).join('\n')}

### By Question Type
${Object.entries(stats.questionTypes).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

### By Difficulty
${Object.entries(stats.difficulties).map(([diff, count]) => `- ${diff}: ${count}`).join('\n')}

`

    if (errors.length > 0) {
      report += `
## Errors (${errors.length})

${errors.map((error, i) => `
### Error ${i + 1}
- **Type**: ${error.type}
- **Field**: ${error.field || 'N/A'}
- **Message**: ${error.message}
${error.item ? `- **Item**: ${error.item.scenario_title}` : ''}
`).join('\n')}
`
    }

    if (warnings.length > 0) {
      report += `
## Warnings (${warnings.length})

${warnings.map((warning, i) => `
### Warning ${i + 1}
- **Type**: ${warning.type}
- **Field**: ${warning.field || 'N/A'}
- **Message**: ${warning.message}
${warning.item ? `- **Item**: ${warning.item.scenario_title}` : ''}
`).join('\n')}
`
    }

    return report
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 1) {
    console.log(`
Usage: tsx validate-content.ts <filePath> [outputPath]

Examples:
  tsx validate-content.ts ../categories/cardiovascular/acute-mi.jsonl
  tsx validate-content.ts ../generated/respiratory-copd.jsonl report.md

Options:
  --json    Output results in JSON format
  --quiet   Suppress console output
    `)
    process.exit(1)
  }

  const [filePath, outputPath] = args
  const jsonOutput = args.includes('--json')
  const quiet = args.includes('--quiet')

  try {
    const validator = new ContentValidator()
    const result = await validator.validateFile(filePath || '')
    
    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2))
    } else {
      await validator.generateReport(result, outputPath)
    }

    if (!quiet) {
      console.log(`\n${result.isValid ? '✅' : '❌'} Validation ${result.isValid ? 'passed' : 'failed'}`)
    }

    process.exit(result.isValid ? 0 : 1)
  } catch (error) {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { ContentValidator, type ValidationResult, type ValidationError, type ValidationWarning }
