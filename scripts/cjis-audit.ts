import { readFileSync } from 'node:fs'
import { auditQuestionV2 } from '../lib/cjis/question-v2'
import { validateQuestionV2Json } from '../lib/cjis/question-v2-json'

const input = process.argv[2]
if (!input) throw new Error('Provide a JSON question or question-array file.')
const parsed: unknown = JSON.parse(readFileSync(input, 'utf8'))
const questions = Array.isArray(parsed) ? parsed : [parsed]
if (!questions.length) throw new Error('The input contains no questions.')
const results = questions.map((q) => {
  const schemaValid = validateQuestionV2Json(q)
  const schemaErrors = schemaValid
    ? []
    : (validateQuestionV2Json.errors ?? []).map(
        (error) => `${error.instancePath}: ${error.message}`
      )
  const audit = auditQuestionV2(q)
  return {
    ...audit,
    requiresClinicalReview:
      schemaErrors.length > 0 || audit.requiresClinicalReview,
    errors: [...new Set([...schemaErrors, ...audit.errors])],
  }
})
console.log(
  JSON.stringify(
    {
      items: questions.length,
      rejected: results.filter((q) => q.errors.length).length,
      flagged: results.filter((q) => q.flags.length).length,
      clinicalReviewRequired: results.filter((q) => q.requiresClinicalReview)
        .length,
      results,
    },
    null,
    2
  )
)
if (results.some((q) => q.errors.length)) process.exitCode = 1
