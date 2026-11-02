// Build/test entry point only. The learner app imports generated runtime JSON.
import { compileQuestionV2, auditQuestionV2 } from '@/lib/cjis/question-v2'
import { validateQuestionV2Json } from '@/lib/cjis/question-v2-json'
import { questionV2ToPractice } from '@/lib/cjis/question-v2-runtime'
import { cardiovascularQualityQuestions } from './quality-banks/cardiovascular'
import { medicationQualityQuestions } from './quality-banks/medications'
import { acuteCareQualityQuestions } from './quality-banks/acute-care'
import { renalQualityQuestions } from './quality-banks/renal'
import { caseReasoningQualityQuestions } from './quality-banks/case-reasoning'
import { assessmentQualityQuestions } from './quality-banks/assessment'
import { geneticsQualityQuestions } from './quality-banks/genetics'
import { practiceTopics } from './catalog'
import { evolvingCases } from './evolving-content'
import { materialCollections } from './material-questions'

export const qualityDrafts = [
  ...cardiovascularQualityQuestions,
  ...acuteCareQualityQuestions,
  ...caseReasoningQualityQuestions,
  ...medicationQualityQuestions,
  ...renalQualityQuestions,
  ...assessmentQualityQuestions,
  ...geneticsQualityQuestions,
]
export const qualityCollections = [
  ...practiceTopics.map((q) => ({
    id: q.key,
    title: q.title,
    category: q.category,
  })),
  ...evolvingCases
    .filter((q) =>
      qualityDrafts.some((d) => d.collectionId === `reasoning:${q.id}`)
    )
    .map((q) => ({
      id: `reasoning:${q.id}`,
      title: q.topic,
      category: 'Clinical reasoning',
    })),
  ...materialCollections,
]
export function compileQualityBank() {
  if (
    qualityDrafts.length !== 300 ||
    new Set(qualityDrafts.map((q) => q.id)).size !== 300
  )
    throw new Error('CJIS v2 requires 300 unique authored items.')
  if (qualityCollections.length !== 20)
    throw new Error('Expected all 20 topic collections.')
  for (const collection of qualityCollections)
    for (const level of ['foundation', 'challenge', 'advanced'])
      if (
        qualityDrafts.filter(
          (q) => q.collectionId === collection.id && q.level === level
        ).length !== 5
      )
        throw new Error(
          `${collection.id}: expected five distinct ${level} items.`
        )
  const canonical = qualityDrafts.map(compileQuestionV2)
  for (const q of canonical)
    if (!q.primary_competency)
      throw new Error(
        `${q.id}: assign the clinical judgment skill independently of its reasoning level.`
      )
    else if (!validateQuestionV2Json(q))
      throw new Error(
        `${q.id}: JSON schema rejected output: ${JSON.stringify(validateQuestionV2Json.errors)}`
      )
  const runtime = canonical.map((q, index) => {
    const collection = qualityCollections.find((c) => c.id === q.collection_id)
    if (!collection) throw new Error(`Unknown collection: ${q.collection_id}`)
    return questionV2ToPractice(q, qualityDrafts[index]!.sources, collection)
  })
  const audits = canonical.map(auditQuestionV2)
  const flagged = audits.filter((q) => q.flags.length)
  if (flagged.length)
    throw new Error(
      `Hold flagged items for editorial review before generating the curated bank: ${flagged.map((q) => `${q.id}: ${q.flags.join(' | ')}`).join('; ')}`
    )
  return { canonical, runtime, audits }
}
