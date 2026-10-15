import Ajv2020 from 'ajv/dist/2020.js';
import schema from './question.schema.json' with { type: 'json' };
import registry from './competencies.json' with { type: 'json' };
export const COMPETENCY_REGISTRY = registry;
const validateSchema = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
const nonblank = value => typeof value === 'string' && value.trim().length > 0;
export function validateRegistryConsistency() {
  const errors = [];
  for (const [field, values] of [['primary_competency', registry.operations], ['clinical_domain', registry.clinical_domains]]) {
    if (JSON.stringify(schema.properties[field].enum) !== JSON.stringify(values)) errors.push(field + ' schema differs from competency registry');
  }
  if (JSON.stringify(registry.complexity_levels.map(value => value.level)) !== JSON.stringify([1, 2, 3, 4, 5])) errors.push('Unsupported complexity registry');
  return errors;
}
export function validateCompetencyMapping(mapping) {
  const errors = [];
  if (!registry.operations.includes(mapping?.primary_competency)) errors.push('Unknown primary_competency');
  if (!registry.clinical_domains.includes(mapping?.clinical_domain)) errors.push('Unknown clinical_domain');
  if (!registry.complexity_levels.some(value => value.level === mapping?.complexity_level)) errors.push('Unknown complexity_level');
  if (!nonblank(mapping?.learning_objective)) errors.push('Missing learning_objective');
  return errors;
}
export function applyCompetencyMapping(draft, mapping) {
  const errors = validateCompetencyMapping(mapping);
  if (mapping?.source_version !== draft.legacy.bank_version) errors.push('Stale source_version');
  if (errors.length) throw new Error(errors.join('; '));
  // Mapping authorizes metadata only; it does not authorize review or calibration status.
  return { ...structuredClone(draft), primary_competency: mapping.primary_competency,
    clinical_domain: mapping.clinical_domain, complexity_level: mapping.complexity_level,
    learning_objective: mapping.learning_objective, migration_status: 'needs_rationale_and_clinical_review' };
}
export function validateAuthoredQuestion(question) {
  const errors = validateRegistryConsistency();
  if (!validateSchema(question)) errors.push(...validateSchema.errors.map(error => `${error.instancePath || '/'} ${error.message}`));
  if (!question || typeof question !== 'object') return errors;
  for (const field of ['id', 'case_family_id', 'stem']) if (!nonblank(question[field])) errors.push(field + ' must be nonblank');
  errors.push(...validateCompetencyMapping(question));
  const options = Array.isArray(question.options) ? question.options : [], ids = options.map(option => option?.id);
  if (ids.some(id => !nonblank(id)) || new Set(ids).size !== ids.length) errors.push('Option IDs must be nonblank and unique');
  if (!ids.includes(question.correct_option_id)) errors.push('Correct option is not a member of options');
  if (options.some(option => !nonblank(option?.text))) errors.push('Option text must be nonblank');
  const incorrectIds = ids.filter(id => id !== question.correct_option_id), distractors = question.rationale?.distractors;
  for (const field of ['normal_physiology', 'pathophysiology', 'decisive_cues', 'correct_answer', 'nursing_implications', 'reassessment']) {
    if (!nonblank(question.rationale?.[field])) errors.push('Missing rationale.' + field);
  }
  if (!distractors || typeof distractors !== 'object' || Array.isArray(distractors) || incorrectIds.some(id => !nonblank(distractors[id])) || Object.keys(distractors).some(id => !incorrectIds.includes(id))) {
    errors.push('Every incorrect option needs exactly one distractor rationale');
  }
  if (question.review_status === 'approved' && (!Array.isArray(question.references) || !question.references.length || !question.references.every(nonblank))) errors.push('Approved questions require references');
  return errors;
}
export function isEligibleForCompetencyEvidence(question) {
  return question?.review_status === 'approved' && question?.calibration_status === 'calibrated' && validateAuthoredQuestion(question).length === 0;
}
