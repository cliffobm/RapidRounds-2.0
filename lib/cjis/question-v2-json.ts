import Ajv2020 from 'ajv/dist/2020'
import { z } from 'zod'
import schema from '@/cjis/question.v2.schema.json'

// Authoring/build tools only. Do not import this validator into the learner UI.
const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  strictRequired: false,
})
ajv.addFormat(
  'date-time',
  (value: string) => z.string().datetime().safeParse(value).success
)
export const validateQuestionV2Json = ajv.compile(schema)
