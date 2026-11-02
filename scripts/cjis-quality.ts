import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  compileQualityBank,
  qualityCollections,
} from '../lib/learning/quality-bank-authoring'

const action = process.argv[2] ?? 'check'
const bank = compileQualityBank()
const runtimeFile = resolve('lib/learning/quality-practice.generated.json')
const generated = `${JSON.stringify(bank.runtime, null, 2)}\n`
if (action === 'generate') writeFileSync(runtimeFile, generated)
else if (action === 'check') {
  if (readFileSync(runtimeFile, 'utf8').replace(/\r\n/g, '\n') !== generated)
    throw new Error(
      'Generated Practice data is stale. Run npm run cjis:generate.'
    )
} else if (action === 'export') {
  const destination = process.argv[3]
  if (!destination)
    throw new Error('Provide a destination JSON file after export.')
  writeFileSync(
    resolve(destination),
    `${JSON.stringify(bank.canonical, null, 2)}\n`
  )
} else throw new Error('Use check, generate, or export <output.json>.')
const flagged = bank.audits.filter((q) => q.flags.length)
console.log(
  JSON.stringify(
    {
      action,
      items: bank.canonical.length,
      topics: qualityCollections.length,
      perTopicPerLevel: 5,
      errors: 0,
      flagged: flagged.map((q) => ({ id: q.id, flags: q.flags })),
      clinicalReviewRequired: bank.audits.filter(
        (q) => q.requiresClinicalReview
      ).length,
      calibrated: 0,
    },
    null,
    2
  )
)
