import type {
  AnswerOption,
  ContentStatus,
  DifficultyTag,
  ItemType,
  ItemWithOptions,
} from '../lib/domain/types';

const STAMP = '2026-05-03T12:00:00.000Z';

export function buildMcqItem(
  scenarioId: string,
  systemId: string,
  input: {
    stem: string;
    difficulty: DifficultyTag;
    timerSeconds: number;
    type: ItemType;
    status: ContentStatus;
    stemRationale: string;
    referenceText?: string;
    options: [string, string, string, string];
    correctIndex: 0 | 1 | 2 | 3;
    optionRationales: [string, string, string, string];
  },
): ItemWithOptions {
  // Stable across launches so saved attempts and reports remain attached to the same item.
  const itemId = `${scenarioId}:${encodeURIComponent(input.stem)}`;
  const options: AnswerOption[] = input.options.map((text, idx) => ({
    id: `${itemId}:option:${idx}`,
    itemId,
    text,
    isCorrect: idx === input.correctIndex,
    rationale: input.optionRationales[idx],
    order: idx,
  }));

  return {
    id: itemId,
    scenarioId,
    systemId,
    type: input.type,
    difficulty: input.difficulty,
    stem: input.stem,
    timerSeconds: input.timerSeconds,
    status: input.status,
    rationale: input.stemRationale,
    referenceText: input.referenceText,
    createdAt: STAMP,
    updatedAt: STAMP,
    options,
  };
}
