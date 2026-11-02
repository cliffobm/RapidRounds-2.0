import type { QuestionV2 } from './question-v2'
import type { UnifiedPracticeQuestion } from '@/lib/learning/practice-library'
import { contentSources, type SourceId } from '@/lib/learning/sources'

/** Build-time adapter. Runtime uses the generated data, without authoring validators. */
export function questionV2ToPractice(
  q: QuestionV2,
  sources: SourceId[],
  collection: { title: string; category: string }
): UnifiedPracticeQuestion {
  return {
    id: q.id,
    revision: `${q.schema_version}:${q.revision}`,
    context: q.scenario,
    prompt: q.question,
    options: (['A', 'B', 'C', 'D'] as const).map((id) => ({
      id,
      text: q.options[id],
      explanation: q.distractor_analysis[id],
    })),
    correct: [q.correct_answer],
    reflection: 'What new evidence would make you reconsider this decision?',
    collectionId: q.collection_id,
    collectionTitle: collection.title,
    category: collection.category,
    level: q.reasoning_level,
    sources,
    origin: 'authored',
    ...(q.primary_competency ? { skill: q.primary_competency } : {}),
    review: {
      schemaVersion: '2.0',
      keyCues: q.key_cues,
      reasoning: q.reasoning_evidence.operations,
      debrief: q.debrief,
      ...(q.reasoning_evidence.conflicting_evidence
        ? { conflict: q.reasoning_evidence.conflicting_evidence }
        : {}),
      ...(q.reasoning_evidence.anticipation
        ? { anticipation: q.reasoning_evidence.anticipation }
        : {}),
      ...(q.reasoning_evidence.uncertainty
        ? { uncertainty: q.reasoning_evidence.uncertainty }
        : {}),
      references: q.references.map((url) => ({
        url,
        title:
          Object.values(contentSources).find((source) => source.url === url)
            ?.title ?? `Clinical reference — ${new URL(url).hostname}`,
      })),
    },
  }
}
