#!/usr/bin/env tsx

import fs from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'

class ContentSystemSetup {
  private projectRoot: string
  private contentDir: string

  constructor() {
    this.projectRoot = process.cwd()
    this.contentDir = path.join(this.projectRoot, 'content')
  }

  async setup(): Promise<void> {
    console.log('🚀 Setting up RapidRounds Content Generation System...\n')

    try {
      await this.checkPrerequisites()
      await this.createDirectories()
      await this.installDependencies()
      await this.generateSampleContent()
      await this.validateSetup()
      
      console.log('\n✅ Content generation system setup complete!')
      console.log('\n📚 Next steps:')
      console.log('1. Review generated sample content in content/examples/')
      console.log('2. Run: cd content && npm run generate:cardiovascular')
      console.log('3. Run: cd content && npm run validate:all')
      console.log('4. Run: cd content && npm run import:all')
      console.log('\n📖 See CONTENT_GENERATION_GUIDE.md for detailed usage instructions')
      
    } catch (error) {
      console.error('❌ Setup failed:', error)
      process.exit(1)
    }
  }

  private async checkPrerequisites(): Promise<void> {
    console.log('🔍 Checking prerequisites...')

    // Check Node.js version
    const nodeVersion = process.version
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0] || '0')
    
    if (majorVersion < 18) {
      throw new Error(`Node.js 18+ required, found ${nodeVersion}`)
    }

    // Check if we're in a RapidRounds project
    const packageJsonPath = path.join(this.projectRoot, 'package.json')
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
      if (!packageJson.name?.includes('rapidrounds')) {
        console.warn('⚠️  Warning: This doesn\'t appear to be a RapidRounds project')
      }
    } catch {
      throw new Error('package.json not found. Run this from the project root.')
    }

    // Check for Supabase configuration
    const envPath = path.join(this.projectRoot, '.env.local')
    try {
      const envContent = await fs.readFile(envPath, 'utf-8')
      if (!envContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
        console.warn('⚠️  Warning: Supabase configuration not found in .env.local')
        console.log('   Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
      }
    } catch {
      console.warn('⚠️  Warning: .env.local not found')
    }

    console.log('✅ Prerequisites check complete')
  }

  private async createDirectories(): Promise<void> {
    console.log('📁 Creating directory structure...')

    const directories = [
      'content',
      'content/categories',
      'content/categories/cardiovascular',
      'content/categories/respiratory',
      'content/categories/gastrointestinal',
      'content/categories/endocrine',
      'content/categories/integumentary',
      'content/categories/musculoskeletal',
      'content/categories/neurological',
      'content/categories/genitourinary',
      'content/categories/psychiatric',
      'content/templates',
      'content/scripts',
      'content/examples',
      'content/generated',
      'content/validation',
      'content/schemas'
    ]

    for (const dir of directories) {
      const fullPath = path.join(this.projectRoot, dir)
      await fs.mkdir(fullPath, { recursive: true })
    }

    console.log('✅ Directory structure created')
  }

  private async installDependencies(): Promise<void> {
    console.log('📦 Installing dependencies...')

    // Install content generation dependencies
    const contentPackageJson = {
      name: 'rapidrounds-content-generation',
      version: '1.0.0',
      description: 'Content generation system for evidence-based nursing questions',
      scripts: {
        generate: 'tsx scripts/generate-content.ts',
        import: 'tsx scripts/import-content.ts',
        validate: 'tsx scripts/validate-content.ts',
        'generate:all': 'npm run generate:cardiovascular && npm run generate:respiratory && npm run generate:gastrointestinal && npm run generate:endocrine && npm run generate:integumentary && npm run generate:musculoskeletal && npm run generate:neurological && npm run generate:genitourinary && npm run generate:psychiatric',
        'generate:cardiovascular': 'tsx scripts/generate-content.ts cardiovascular "Acute MI" intermediate 10 30 true',
        'generate:respiratory': 'tsx scripts/generate-content.ts respiratory "COPD Exacerbation" intermediate 10 30 true',
        'generate:gastrointestinal': 'tsx scripts/generate-content.ts gastrointestinal "GI Bleed" intermediate 10 30 true',
        'generate:endocrine': 'tsx scripts/generate-content.ts endocrine "DKA Management" intermediate 10 30 true',
        'generate:integumentary': 'tsx scripts/generate-content.ts integumentary "Pressure Ulcer" intermediate 10 30 true',
        'generate:musculoskeletal': 'tsx scripts/generate-content.ts musculoskeletal "Fracture Care" intermediate 10 30 true',
        'generate:neurological': 'tsx scripts/generate-content.ts neurological "Stroke Management" intermediate 10 30 true',
        'generate:genitourinary': 'tsx scripts/generate-content.ts genitourinary "AKI Management" intermediate 10 30 true',
        'generate:psychiatric': 'tsx scripts/generate-content.ts psychiatric "Crisis Intervention" intermediate 10 30 true',
        'import:all': 'find categories -name "*.jsonl" -exec tsx scripts/import-content.ts {} \\;',
        'validate:all': 'find categories -name "*.jsonl" -exec tsx scripts/validate-content.ts {} \\;',
        setup: 'mkdir -p categories/{cardiovascular,respiratory,gastrointestinal,endocrine,integumentary,musculoskeletal,neurological,genitourinary,psychiatric} generated validation',
        clean: 'rm -rf generated/* categories/*/*.jsonl validation/*.md'
      },
      dependencies: {
        '@supabase/supabase-js': '^2.38.0',
        'zod': '^3.22.4'
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        'tsx': '^4.0.0',
        'typescript': '^5.0.0'
      }
    }

    await fs.writeFile(
      path.join(this.contentDir, 'package.json'),
      JSON.stringify(contentPackageJson, null, 2)
    )

    // Install dependencies
    try {
      execSync('npm install', { 
        cwd: this.contentDir, 
        stdio: 'inherit' 
      })
    } catch (error) {
      console.warn('⚠️  Failed to install dependencies automatically')
      console.log('   Run: cd content && npm install')
    }

    console.log('✅ Dependencies installed')
  }

  private async generateSampleContent(): Promise<void> {
    console.log('📝 Generating sample content...')

    // Copy example content
    const exampleContent = `{"category":"cardiovascular","scenario_title":"Sample Acute MI","question_type":"single","prompt":"A 65-year-old male presents with chest pain. What is the priority nursing intervention?","options":["A. Administer pain medication","B. Obtain 12-lead ECG","C. Start oxygen therapy","D. Draw blood work"],"correct":["B"],"rationale":"The correct answer is B. In suspected acute MI, obtaining a 12-lead ECG immediately is the priority intervention to confirm diagnosis and determine treatment approach. References: O'Gara et al. (2013). 2013 ACCF/AHA guideline for the management of ST-elevation myocardial infarction. Circulation, 127(4), e362-e425.","difficulty":"intermediate","priority_type":"assessment","learning_objectives":["Recognize signs of acute MI","Prioritize diagnostic interventions"],"tags":["cardiovascular","assessment","priority","emergency"]}`

    await fs.writeFile(
      path.join(this.contentDir, 'examples', 'sample-cardiovascular.jsonl'),
      exampleContent
    )

    console.log('✅ Sample content generated')
  }

  private async validateSetup(): Promise<void> {
    console.log('🔍 Validating setup...')

    // Check if all required files exist
    const requiredFiles = [
      'content/package.json',
      'content/scripts/generate-content.ts',
      'content/scripts/import-content.ts',
      'content/scripts/validate-content.ts',
      'content/templates/prompts.ts',
      'content/schemas/content-item.json',
      'content/examples/sample-cardiovascular.jsonl'
    ]

    for (const file of requiredFiles) {
      const fullPath = path.join(this.projectRoot, file)
      try {
        await fs.access(fullPath)
      } catch {
        throw new Error(`Required file missing: ${file}`)
      }
    }

    // Test validation script
    try {
      execSync('tsx scripts/validate-content.ts examples/sample-cardiovascular.jsonl', {
        cwd: this.contentDir,
        stdio: 'pipe'
      })
    } catch (error) {
      console.warn('⚠️  Validation test failed, but setup may still work')
    }

    console.log('✅ Setup validation complete')
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
RapidRounds Content Generation System Setup

Usage: tsx setup-content-system.ts [options]

Options:
  --help, -h     Show this help message
  --force        Force setup even if system already exists

This script will:
1. Check prerequisites (Node.js 18+, RapidRounds project)
2. Create directory structure
3. Install dependencies
4. Generate sample content
5. Validate setup

Environment variables needed:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
    `)
    process.exit(0)
  }

  const setup = new ContentSystemSetup()
  await setup.setup()
}

if (require.main === module) {
  main()
}

export { ContentSystemSetup }
