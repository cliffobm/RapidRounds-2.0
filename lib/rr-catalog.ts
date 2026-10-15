import { sampleScenarios } from '@/data/sampleData'
import tavr from '@/cjis/preview/tavr_case_family.json'
import glossary from '@/cjis/preview/glossary.json'
import type { Question } from '@/components/scenario/AnswerBlock'

export type PracticeQuestion = Question & {
  operation: string
  terms: Array<{ id: string; label: string; definition: string }>
  reasoning: Array<{ label: string; text: string }>
}
export interface PracticeCase {
  code: string
  title: string
  description: string
  system: string
  kind: 'guided' | 'practice'
  questions: PracticeQuestion[]
  context: string[]
}

const legacyCases = [
  { code: 'cvd_001', id: '1', system: 'Cardiovascular' },
  { code: 'resp_001', id: '2', system: 'Respiratory' },
  { code: 'endo_001', id: '7', system: 'Endocrine' },
  { code: 'neuro_001', id: '4', system: 'Neurological' },
  { code: 'skin_001', id: '8', system: 'Skin & tissue' },
]

const guided: PracticeCase = {
  code: 'tavr-conduction',
  title: tavr.title,
  system: 'Cardiovascular',
  kind: 'guided',
  description:
    'Follow five linked decisions, with definitions and the physiology behind each answer.',
  context: [
    'A guided post-TAVR learning case. Each stage introduces the information needed for that decision.',
  ],
  questions: tavr.questions.map((q) => ({
    id: q.id,
    type: 'multiple_choice',
    question: q.stem,
    options: q.options.map((o) => ({ id: o.id, text: o.text })),
    correctAnswers: [q.correct_option_id],
    points: 0,
    operation: q.primary_operation.replace(/_/g, ' '),
    terms: q.glossary_terms.flatMap((term) => {
      const key = term.toLowerCase().replace(/ /g, '_') as keyof typeof glossary
      const found = glossary[key]
      return found
        ? [{ id: key, label: found.label, definition: found.plain }]
        : []
    }),
    reasoning: [
      { label: 'Normal function', text: q.rationale.normal },
      { label: 'What changed', text: q.rationale.change },
      { label: 'Connect the cues', text: q.rationale.cue_mechanism },
      { label: 'Why this answer fits', text: q.rationale.correct_reason },
      { label: 'What to reassess', text: q.rationale.nursing_implications },
    ],
  })),
}

export const practiceCases: PracticeCase[] = [
  guided,
  ...legacyCases.map(({ code, id, system }) => {
    const source = sampleScenarios.find((s) => s.id === id)
    if (!source) throw new Error(`Missing bundled practice case: ${code}`)
    return {
      code,
      title: source.title,
      description: source.description || '',
      system,
      kind: 'practice' as const,
      context: [source.content.history, source.content.presentation],
      questions: source.content.questions.map((q) => ({
        id: `${code}:${q.id}`,
        type:
          q.type === 'priority'
            ? ('drag_to_order' as const)
            : ('multiple_choice' as const),
        question: q.question,
        options: (q.options || []).map((text) => ({ id: text, text })),
        correctAnswers: Array.isArray(q.correct_answer)
          ? [...q.correct_answer]
          : [q.correct_answer],
        points: 0,
        operation: q.category,
        terms: [],
        reasoning: [{ label: 'Reasoning', text: q.explanation }],
      })),
    }
  }),
]

export function getPracticeCase(code: string): PracticeCase | undefined {
  return practiceCases.find((s) => s.code === code)
}
