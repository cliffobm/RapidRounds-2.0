import type { SourceId } from './sources'
import type { PillarId } from './pillars'
export const evolvingRevision = '2026-10-21.1'
export type ReasoningLevel = 'foundation' | 'challenge' | 'advanced'
export type EvolvingQuestion = {
  prompt: string
  options: { id: string; text: string; explanation: string }[]
  correct: string[]
  reflection: string
}
export type Observation = {
  minute: number
  hr: number
  bp: string
  rr: number
  temperature: number
  spo2: number
  note: string
}
export type CaseFrame = {
  skill: PillarId
  update: string
  evidence: string[]
  question: EvolvingQuestion
  complex: EvolvingQuestion
  observation: Observation
}
export type CasePath = {
  id: string
  label: string
  patient: string
  history: string
  frames: CaseFrame[]
}
export type EvolvingCase = {
  id: string
  title: string
  topic: string
  summary: string
  sources: SourceId[]
  paths: CasePath[]
}
export type ReasoningQuestion = EvolvingQuestion & {
  id: string
  context: string
  topic: string
  level: ReasoningLevel
  sources: SourceId[]
  reviewStatus: 'draft'
}
export function choiceQuestion(
  prompt: string,
  choices: [[string, string], [string, string], [string, string]],
  reflection: string
): EvolvingQuestion {
  return {
    prompt,
    options: choices.map(([text, explanation], index) => ({
      id: String(index),
      text,
      explanation,
    })),
    correct: ['0'],
    reflection,
  }
}
export function evidenceQuestion(
  prompt: string,
  choices: [string, string, string, string],
  explanations: [string, string, string, string],
  reflection: string
): EvolvingQuestion {
  return {
    prompt,
    options: choices.map((text, index) => ({
      id: String(index),
      text,
      explanation: explanations[index]!,
    })),
    correct: ['0', '1'],
    reflection,
  }
}
export function questionFor(frame: CaseFrame, level: ReasoningLevel) {
  return level === 'foundation' ? frame.question : frame.complex
}
export function orderedOptions(question: EvolvingQuestion, seed: number) {
  const offset = Math.abs(seed) % question.options.length
  return [
    ...question.options.slice(offset),
    ...question.options.slice(0, offset),
  ]
}
export function matchesAnswer(question: EvolvingQuestion, selected: string[]) {
  return (
    [...selected].sort().join('|') === [...question.correct].sort().join('|')
  )
}
