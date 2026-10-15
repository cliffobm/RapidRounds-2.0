import { competencyRegistry as registry } from './competencies'
import schema from '@/cjis/question.schema.json'
import Ajv2020 from 'ajv/dist/2020'

// The JSON files are the source of truth for both runtime checks and the UI.
export { competencyRegistry, competencyLabel } from './competencies'
const validator = new Ajv2020({ allErrors: true }).compile(schema)

type ClinicalItem = {
  id: string
  case_family_id: string
  stem: string
  options: Array<{ id: string; text: string }>
  correct_option_id: string
  primary_competency: string
  clinical_domain: string
  complexity_level: number
  learning_objective: string
  rationale: Record<string, unknown>
  review_status: string
  calibration_status?: string
  references?: string[]
}

export function validateClinicalItem(value: unknown): { valid: boolean; errors: string[] } {
  if (!validator(value)) {
    return { valid: false, errors: (validator.errors ?? []).map(error => `${error.instancePath}: ${error.message}`) }
  }
  const item = value as ClinicalItem
  const errors: string[] = []
  const ids = item.options.map(option => option.id)
  if (new Set(ids).size !== ids.length || ids.some(id => !id.trim())) errors.push('Option IDs must be unique and nonempty')
  if (!ids.includes(item.correct_option_id)) errors.push('Correct answer must identify an existing option')
  if (item.options.some(option => !option.text.trim())) errors.push('Option text cannot be empty')
  if (!item.learning_objective.trim()) errors.push('Learning objective cannot be empty')
  if (!registry.operations.includes(item.primary_competency)) errors.push('Unknown competency')
  if (!registry.clinical_domains.includes(item.clinical_domain)) errors.push('Unknown clinical domain')
  if (!registry.complexity_levels.some(entry => entry.level === item.complexity_level)) errors.push('Unknown complexity')
  const distractors = item.rationale.distractors as Record<string, string>
  for (const [key, text] of Object.entries(item.rationale)) {
    if (key !== 'distractors' && typeof text === 'string' && !text.trim()) errors.push(`Empty rationale: ${key}`)
  }
  for (const id of ids.filter(id => id !== item.correct_option_id)) {
    if (!distractors[id]?.trim()) errors.push(`Missing distractor explanation: ${id}`)
  }
  return { valid: errors.length === 0, errors }
}

// Eligibility is a gate, not a psychometric score or a competency estimate.
export function isScoredClinicalItem(value: unknown): boolean {
  if (!validateClinicalItem(value).valid) return false
  const item = value as ClinicalItem
  return item.review_status === 'approved' && item.calibration_status === 'calibrated' &&
    Boolean(item.references?.length && item.references.every(reference => reference.trim()))
}
