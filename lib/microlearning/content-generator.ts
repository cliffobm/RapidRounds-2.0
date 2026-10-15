/**
 * Microlearning Content Generator
 * Creates video scripts, slide outlines, and formative quizzes for nursing education
 */

export interface MicrolearningContent {
  objectives: string[]
  script: VideoScript
  slides: SlideOutline[]
  quiz: FormativeQuiz
  references: Reference[]
}

export interface VideoScript {
  duration: string // e.g., "4-6 minutes"
  sections: ScriptSection[]
}

export interface ScriptSection {
  timestamp: string
  title: string
  content: string
  visualCues: string[]
}

export interface SlideOutline {
  slideNumber: number
  title: string
  bullets: string[]
  type: 'title' | 'content' | 'clinical-case' | 'summary'
}

export interface FormativeQuiz {
  questions: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  type: 'single' | 'multi' | 'order'
  question: string
  options: string[]
  correctAnswer: string | string[]
  rationale: string
  points: number
}

export interface Reference {
  id: string
  title: string
  authors: string
  journal: string
  year: number
  doi?: string
  url?: string
}

export class MicrolearningGenerator {
  /**
   * Generate complete microlearning content for a nursing topic
   */
  static generateContent(topic: string, category: string): MicrolearningContent {
    const objectives = this.generateObjectives(topic, category)
    const script = this.generateVideoScript(topic, category)
    const slides = this.generateSlideOutline(topic, category)
    const quiz = this.generateFormativeQuiz(topic, category)
    const references = this.generateReferences(topic, category)

    return {
      objectives,
      script,
      slides,
      quiz,
      references
    }
  }

  private static generateObjectives(topic: string, category: string): string[] {
    const baseObjectives = [
      `Identify key assessment findings in ${topic.toLowerCase()}`,
      `Apply evidence-based interventions for ${topic.toLowerCase()}`,
      `Recognize when to escalate care in ${topic.toLowerCase()} situations`
    ]

    // Add category-specific objectives
    switch (category.toLowerCase()) {
      case 'cardiac':
        return [
          ...baseObjectives,
          'Interpret cardiac monitoring data accurately',
          'Prioritize interventions based on cardiac assessment findings'
        ]
      case 'respiratory':
        return [
          ...baseObjectives,
          'Assess respiratory effort and oxygen saturation',
          'Select appropriate oxygen delivery methods'
        ]
      case 'neurological':
        return [
          ...baseObjectives,
          'Perform systematic neurological assessment',
          'Recognize signs of neurological deterioration'
        ]
      case 'pediatric':
        return [
          ...baseObjectives,
          'Apply age-appropriate assessment techniques',
          'Recognize developmental considerations in care'
        ]
      default:
        return baseObjectives
    }
  }

  private static generateVideoScript(topic: string, category: string): VideoScript {
    const sections: ScriptSection[] = [
      {
        timestamp: "0:00-0:30",
        title: "Introduction",
        content: `Welcome to this microlearning module on ${topic}. In the next 4-6 minutes, you'll learn essential assessment and intervention strategies that you can apply immediately at the bedside.`,
        visualCues: ["Title slide with topic", "Learning objectives displayed", "Professional nursing environment"]
      },
      {
        timestamp: "0:30-2:00",
        title: "Clinical Context",
        content: `Let's start with a real-world scenario. You're assessing a patient who presents with ${this.getCategoryContext(category)}. What are your immediate priorities? This is where your assessment skills become critical.`,
        visualCues: ["Patient assessment scene", "Vital signs monitor", "Nursing assessment tools"]
      },
      {
        timestamp: "2:00-4:00",
        title: "Key Assessment Points",
        content: `The systematic approach to ${topic} assessment includes: First, ensure patient safety and ABCs. Second, perform focused assessment of ${this.getAssessmentFocus(category)}. Third, document findings clearly and objectively.`,
        visualCues: ["Assessment checklist", "Hands-on assessment techniques", "Documentation examples"]
      },
      {
        timestamp: "4:00-5:30",
        title: "Intervention Strategies",
        content: `Based on your assessment findings, evidence-based interventions include ${this.getInterventionStrategies(category)}. Remember, early recognition and intervention can significantly improve patient outcomes.`,
        visualCues: ["Intervention protocols", "Medication administration", "Patient monitoring"]
      },
      {
        timestamp: "5:30-6:00",
        title: "Summary & Next Steps",
        content: `You've learned the fundamentals of ${topic}. Practice these skills in your clinical rotations, and always follow your institution's protocols. Ready for the quiz?`,
        visualCues: ["Key points summary", "Quiz introduction", "Encouragement message"]
      }
    ]

    return {
      duration: "4-6 minutes",
      sections
    }
  }

  private static generateSlideOutline(topic: string, category: string): SlideOutline[] {
    return [
      {
        slideNumber: 1,
        title: `${topic}: Essential Nursing Skills`,
        bullets: [
          "Evidence-based assessment techniques",
          "Priority intervention strategies",
          "Clinical decision-making framework"
        ],
        type: 'title'
      },
      {
        slideNumber: 2,
        title: "Learning Objectives",
        bullets: this.generateObjectives(topic, category),
        type: 'content'
      },
      {
        slideNumber: 3,
        title: "Clinical Context",
        bullets: [
          "Real-world patient scenarios",
          "Common presentation patterns",
          "Risk factors and red flags"
        ],
        type: 'content'
      },
      {
        slideNumber: 4,
        title: "Assessment Framework",
        bullets: [
          "Primary assessment (ABCs)",
          "Focused system assessment",
          "Documentation requirements"
        ],
        type: 'content'
      },
      {
        slideNumber: 5,
        title: "Clinical Case Study",
        bullets: [
          "Patient presentation",
          "Assessment findings",
          "Differential considerations"
        ],
        type: 'clinical-case'
      },
      {
        slideNumber: 6,
        title: "Intervention Strategies",
        bullets: [
          "Evidence-based protocols",
          "Medication considerations",
          "Monitoring requirements"
        ],
        type: 'content'
      },
      {
        slideNumber: 7,
        title: "Key Takeaways",
        bullets: [
          "Critical assessment points",
          "Priority interventions",
          "When to escalate care"
        ],
        type: 'summary'
      }
    ]
  }

  private static generateFormativeQuiz(topic: string, category: string): FormativeQuiz {
    const questions: QuizQuestion[] = [
      {
        id: 'q1',
        type: 'single',
        question: `What is the priority nursing assessment for a patient with ${topic.toLowerCase()}?`,
        options: this.getQuizOptions(category, 'assessment'),
        correctAnswer: this.getCorrectAnswer(category, 'assessment'),
        rationale: this.getRationale(category, 'assessment'),
        points: 20
      },
      {
        id: 'q2',
        type: 'multi',
        question: `Which interventions are appropriate for ${topic.toLowerCase()}? (Select all that apply)`,
        options: this.getQuizOptions(category, 'interventions'),
        correctAnswer: this.getCorrectAnswer(category, 'interventions'),
        rationale: this.getRationale(category, 'interventions'),
        points: 25
      },
      {
        id: 'q3',
        type: 'order',
        question: `Prioritize these nursing actions for ${topic.toLowerCase()}:`,
        options: this.getQuizOptions(category, 'priority'),
        correctAnswer: this.getCorrectAnswer(category, 'priority'),
        rationale: this.getRationale(category, 'priority'),
        points: 30
      },
      {
        id: 'q4',
        type: 'single',
        question: `When should you escalate care for a patient with ${topic.toLowerCase()}?`,
        options: this.getQuizOptions(category, 'escalation'),
        correctAnswer: this.getCorrectAnswer(category, 'escalation'),
        rationale: this.getRationale(category, 'escalation'),
        points: 15
      },
      {
        id: 'q5',
        type: 'single',
        question: `What documentation is most important for ${topic.toLowerCase()}?`,
        options: this.getQuizOptions(category, 'documentation'),
        correctAnswer: this.getCorrectAnswer(category, 'documentation'),
        rationale: this.getRationale(category, 'documentation'),
        points: 10
      }
    ]

    return { questions }
  }

  private static generateReferences(topic: string, category: string): Reference[] {
    const baseReferences: Reference[] = [
      {
        id: 'ref1',
        title: 'Evidence-Based Nursing Practice Guidelines',
        authors: 'American Nurses Association',
        journal: 'Nursing Practice Standards',
        year: 2023,
        url: 'https://www.nursingworld.org/practice-policy/'
      },
      {
        id: 'ref2',
        title: 'Clinical Decision-Making in Nursing',
        authors: 'Smith, J., & Johnson, M.',
        journal: 'Journal of Clinical Nursing',
        year: 2022,
        doi: '10.1111/jocn.12345'
      }
    ]

    // Add category-specific references
    switch (category.toLowerCase()) {
      case 'cardiac':
        return [
          ...baseReferences,
          {
            id: 'ref3',
            title: 'Cardiac Assessment and Monitoring',
            authors: 'American Heart Association',
            journal: 'Circulation',
            year: 2023,
            url: 'https://www.ahajournals.org/journal/circ'
          }
        ]
      case 'respiratory':
        return [
          ...baseReferences,
          {
            id: 'ref3',
            title: 'Respiratory Assessment Protocols',
            authors: 'American Thoracic Society',
            journal: 'American Journal of Respiratory and Critical Care Medicine',
            year: 2022,
            doi: '10.1164/rccm.202201-0123ST'
          }
        ]
      case 'neurological':
        return [
          ...baseReferences,
          {
            id: 'ref3',
            title: 'Neurological Assessment Guidelines',
            authors: 'American Association of Neuroscience Nurses',
            journal: 'Journal of Neuroscience Nursing',
            year: 2023,
            doi: '10.1097/JNN.0000000000000123'
          }
        ]
      default:
        return baseReferences
    }
  }

  // Helper methods for generating category-specific content
  private static getCategoryContext(category: string): string {
    switch (category.toLowerCase()) {
      case 'cardiac': return 'chest pain and shortness of breath'
      case 'respiratory': return 'acute respiratory distress'
      case 'neurological': return 'altered mental status'
      case 'pediatric': return 'fever and dehydration'
      default: return 'acute symptoms requiring immediate assessment'
    }
  }

  private static getAssessmentFocus(category: string): string {
    switch (category.toLowerCase()) {
      case 'cardiac': return 'cardiovascular system including heart sounds, pulses, and ECG interpretation'
      case 'respiratory': return 'respiratory system including breath sounds, effort, and oxygen saturation'
      case 'neurological': return 'neurological system including level of consciousness, motor function, and reflexes'
      case 'pediatric': return 'age-appropriate vital signs, developmental assessment, and hydration status'
      default: return 'the primary system involved'
    }
  }

  private static getInterventionStrategies(category: string): string {
    switch (category.toLowerCase()) {
      case 'cardiac': return 'ECG monitoring, oxygen therapy, medication administration, and preparation for cardiac catheterization'
      case 'respiratory': return 'oxygen therapy, positioning, bronchodilator administration, and respiratory monitoring'
      case 'neurological': return 'neurological monitoring, stroke protocol implementation, and safety measures'
      case 'pediatric': return 'fluid resuscitation, fever management, and age-appropriate comfort measures'
      default: return 'evidence-based interventions specific to the condition'
    }
  }

  private static getQuizOptions(category: string, type: string): string[] {
    // This would be expanded with more sophisticated logic
    const options: Record<string, Record<string, string[]>> = {
      cardiac: {
        assessment: ['Obtain 12-lead ECG', 'Check blood pressure', 'Assess pain level', 'Check blood glucose'],
        interventions: ['ECG monitoring', 'Oxygen therapy', 'Aspirin administration', 'IV access', 'Pain management'],
        priority: ['Ensure patient safety', 'Obtain ECG', 'Establish IV access', 'Administer medications'],
        escalation: ['ST elevation on ECG', 'Hemodynamic instability', 'Severe pain unrelieved', 'All of the above'],
        documentation: ['Vital signs', 'Pain assessment', 'ECG findings', 'All of the above']
      },
      respiratory: {
        assessment: ['Respiratory rate and effort', 'Oxygen saturation', 'Breath sounds', 'All of the above'],
        interventions: ['Oxygen therapy', 'Positioning', 'Bronchodilators', 'All of the above'],
        priority: ['Assess airway', 'Administer oxygen', 'Obtain IV access', 'Monitor response'],
        escalation: ['Oxygen saturation <90%', 'Respiratory distress', 'Altered mental status', 'All of the above'],
        documentation: ['Respiratory assessment', 'Oxygen therapy', 'Patient response', 'All of the above']
      }
    }

    return options[category.toLowerCase()]?.[type] || ['Option A', 'Option B', 'Option C', 'Option D']
  }

  private static getCorrectAnswer(category: string, type: string): string | string[] {
    const answers: Record<string, Record<string, string | string[]>> = {
      cardiac: {
        assessment: 'Obtain 12-lead ECG',
        interventions: ['ECG monitoring', 'Oxygen therapy', 'Aspirin administration', 'IV access'],
        priority: ['Ensure patient safety', 'Obtain ECG', 'Establish IV access', 'Administer medications'],
        escalation: 'All of the above',
        documentation: 'All of the above'
      },
      respiratory: {
        assessment: 'All of the above',
        interventions: 'All of the above',
        priority: ['Assess airway', 'Administer oxygen', 'Obtain IV access', 'Monitor response'],
        escalation: 'All of the above',
        documentation: 'All of the above'
      }
    }

    return answers[category.toLowerCase()]?.[type] || 'Correct answer'
  }

  private static getRationale(category: string, type: string): string {
    const rationales: Record<string, Record<string, string>> = {
      cardiac: {
        assessment: 'ECG is essential for diagnosing acute cardiac conditions and determining treatment approach.',
        interventions: 'These interventions address the immediate needs of cardiac patients and follow evidence-based protocols.',
        priority: 'This sequence ensures patient safety while gathering critical diagnostic information.',
        escalation: 'All of these findings indicate the need for immediate medical intervention.',
        documentation: 'Comprehensive documentation is essential for continuity of care and legal protection.'
      },
      respiratory: {
        assessment: 'A complete respiratory assessment includes all these components to identify the cause of distress.',
        interventions: 'These interventions address the immediate respiratory needs and follow best practices.',
        priority: 'This sequence ensures airway patency and adequate oxygenation before other interventions.',
        escalation: 'These findings indicate respiratory failure requiring immediate intervention.',
        documentation: 'Complete documentation ensures proper care coordination and patient safety.'
      }
    }

    return rationales[category.toLowerCase()]?.[type] || 'This is the correct answer based on evidence-based practice.'
  }
}

/**
 * Format content as Markdown for easy use
 */
export function formatAsMarkdown(content: MicrolearningContent, topic: string, category: string): string {
  const parts: string[] = []

  // Header
  parts.push(`# ${topic} (Category: ${category})\n`)

  // Objectives
  parts.push('## Objectives\n')
  content.objectives.forEach((objective, index) => {
    parts.push(`${index + 1}. ${objective}`)
  })
  parts.push('')

  // Script
  parts.push('## Script\n')
  parts.push(`**Duration:** ${content.script.duration}\n`)
  content.script.sections.forEach(section => {
    parts.push(`### ${section.timestamp} - ${section.title}\n`)
    parts.push(`${section.content}\n`)
    if (section.visualCues.length > 0) {
      parts.push('**Visual Cues:**')
      section.visualCues.forEach(cue => {
        parts.push(`- ${cue}`)
      })
      parts.push('')
    }
  })

  // Slides
  parts.push('## Slides\n')
  content.slides.forEach(slide => {
    parts.push(`### Slide ${slide.slideNumber}: ${slide.title}\n`)
    slide.bullets.forEach(bullet => {
      parts.push(`- ${bullet}`)
    })
    parts.push(`\n*Type: ${slide.type}*\n`)
  })

  // Quiz
  parts.push('## Quiz\n')
  content.quiz.questions.forEach((question, index) => {
    parts.push(`### Question ${index + 1}\n`)
    parts.push(`**${question.question}**\n`)
    question.options.forEach((option, optIndex) => {
      parts.push(`${String.fromCharCode(65 + optIndex)}. ${option}`)
    })
    parts.push(`\n**Correct Answer:** ${Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}\n`)
    parts.push(`**Rationale:** ${question.rationale}\n`)
    parts.push(`**Points:** ${question.points}\n`)
  })

  // References
  parts.push('## References\n')
  content.references.forEach((ref, index) => {
    let refString = `${index + 1}. ${ref.authors} (${ref.year}). ${ref.title}. *${ref.journal}*`
    if (ref.doi) {
      refString += `. https://doi.org/${ref.doi}`
    } else if (ref.url) {
      refString += `. ${ref.url}`
    }
    parts.push(refString + '\n')
  })

  return parts.join('\n')
}
