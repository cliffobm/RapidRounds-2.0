import { loadPractice } from '@/lib/cjis/practice'
import { practiceTopics } from './catalog'
import { evolvingCases, reasoningQuestions } from './evolving-content'
import {
  legacyEvolvingRevision,
  type EvolvingQuestion,
  type ReasoningLevel,
} from './evolving-types'
import type { PillarId } from './pillars'
import type { SourceId } from './sources'
import { contentRevision } from './sessions'
import { materialCollections, materialQuestions } from './material-questions'
import generatedQualityQuestions from './quality-practice.generated.json'

export type PracticeLevel = ReasoningLevel | 'unclassified'
export type UnifiedPracticeQuestion = EvolvingQuestion & {
  id: string
  revision: string
  context: string
  collectionId: string
  collectionTitle: string
  category: string
  level: PracticeLevel
  sources: SourceId[]
  skill?: PillarId
  origin: 'legacy' | 'authored' | 'reasoning'
}
export type PracticeCollection = {
  id: string
  title: string
  category: string
  count: number
}

const bankQuestions: UnifiedPracticeQuestion[] = practiceTopics.flatMap(
  (topic) => {
    const bank = loadPractice(topic.key)
    return bank.items.map((item) => ({
      id: item.id,
      revision: bank.version,
      context: item.stem,
      prompt: item.prompt,
      options: item.options.map((option, index) => ({
        ...option,
        explanation:
          item.explanations?.[index] ??
          (option.id === item.correct_option_id
            ? item.rationaleText
            : 'Compare this response with the correct answer and its rationale.'),
      })),
      correct: [item.correct_option_id],
      reflection:
        item.reflection ?? 'Which finding most influenced your decision?',
      collectionId: topic.key,
      collectionTitle: topic.title,
      category: topic.category,
      level: 'unclassified' as const,
      sources: item.sources,
      ...(item.primaryCompetency ? { skill: item.primaryCompetency } : {}),
      origin: item.origin,
    }))
  }
)

const caseQuestions: UnifiedPracticeQuestion[] = evolvingCases.flatMap(
  (story) =>
    reasoningQuestions
      .filter((question) => question.id.startsWith(`rr-context-${story.id}-`))
      .map((question, index) => ({
        ...question,
        revision: legacyEvolvingRevision,
        collectionId: `reasoning:${story.id}`,
        collectionTitle: story.topic,
        category: 'Clinical reasoning',
        skill: story.paths[0]!.frames[index]!.skill,
        origin: 'reasoning' as const,
      }))
)

const previousLibraryQuestions: UnifiedPracticeQuestion[] = [
  ...bankQuestions,
  ...caseQuestions,
]
// This is the exact deployed 136-question library. Older attempts remain valid
// only while its question definitions and answer keys still match this hash.
export const LEGACY_PRACTICE_LIBRARY_REVISION = 'practice-1:c8409c89'
const previousLibraryUnchanged =
  `practice-1:${contentRevision(previousLibraryQuestions)}` ===
  LEGACY_PRACTICE_LIBRARY_REVISION
const previousQuestionsById = new Map(
  previousLibraryQuestions.map((q) => [q.id, q])
)
const octoberLibraryQuestions: UnifiedPracticeQuestion[] = [
  ...previousLibraryQuestions,
  ...materialQuestions,
]
// Preserve the exact 196-item revision as well as the earlier 136-item revision.
// Retired items remain reviewable only through their original saved revision.
export const PREVIOUS_PRACTICE_LIBRARY_REVISION = 'practice-1:12faab85'
const octoberLibraryUnchanged =
  `practice-1:${contentRevision(octoberLibraryQuestions)}` ===
  PREVIOUS_PRACTICE_LIBRARY_REVISION
const octoberQuestionsById = new Map(
  octoberLibraryQuestions.map((q) => [q.id, q])
)

export const qualityPracticeQuestions =
  generatedQualityQuestions as UnifiedPracticeQuestion[]
// Fresh attempts use the reviewed authoring contract. Original imported items
// remain available in the legacy bank route and their exact historical maps.
export const practiceLibrary: UnifiedPracticeQuestion[] =
  qualityPracticeQuestions
export const PRACTICE_LIBRARY_REVISION = `practice-1:${contentRevision(practiceLibrary)}`
const questionsById = new Map(
  practiceLibrary.map((question) => [question.id, question])
)
if (questionsById.size !== practiceLibrary.length)
  throw new Error('Practice question IDs must be unique')

export const practiceCollections: PracticeCollection[] = [
  ...practiceTopics.map((topic) => ({
    id: topic.key,
    title: topic.title,
    category: topic.category,
    count: practiceLibrary.filter(
      (question) => question.collectionId === topic.key
    ).length,
  })),
  ...evolvingCases
    .map((story) => ({
      id: `reasoning:${story.id}`,
      title: story.topic,
      category: 'Clinical reasoning',
      count: practiceLibrary.filter(
        (question) => question.collectionId === `reasoning:${story.id}`
      ).length,
    }))
    .filter((collection) => collection.count > 0),
  ...materialCollections.map((collection) => ({
    ...collection,
    count: practiceLibrary.filter(
      (question) => question.collectionId === collection.id
    ).length,
  })),
]

export function getPracticeQuestion(
  id: string,
  revision = PRACTICE_LIBRARY_REVISION
) {
  if (revision === PRACTICE_LIBRARY_REVISION) return questionsById.get(id)
  if (
    revision === PREVIOUS_PRACTICE_LIBRARY_REVISION &&
    octoberLibraryUnchanged
  )
    return octoberQuestionsById.get(id)
  if (revision === LEGACY_PRACTICE_LIBRARY_REVISION && previousLibraryUnchanged)
    return previousQuestionsById.get(id)
  return undefined
}

export function findPracticeCollection(value: string) {
  const normalized = value.trim().toLowerCase()
  return practiceCollections.find(
    (collection) =>
      collection.id.toLowerCase() === normalized ||
      collection.title.toLowerCase() === normalized ||
      collection.id.replace('reasoning:', '') === normalized
  )
}

export function practicePool(
  collectionId = 'all',
  level: PracticeLevel | 'all' = 'all'
) {
  return practiceLibrary.filter(
    (question) =>
      (collectionId === 'all' || question.collectionId === collectionId) &&
      (level === 'all' || question.level === level)
  )
}
