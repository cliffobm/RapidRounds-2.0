import type { ItemWithOptions } from '../domain/types';
import type { RapidRoundResponse } from '../domain/types';

export type RapidRoundScoreBreakdown = {
  totalItems: number;
  correctCount: number;
  incorrectCount: number;
  timedOutCount: number;
  longestStreak: number;
  accuracyPoints: number;
  streakBonus: number;
  speedBonus: number;
  completionBonus: number;
  rawSubtotal: number;
  retryPenaltyMultiplier: number;
  retryPenaltyLabel: string;
  finalScore: number;
  averageResponseMs: number | null;
};

export type ScoreInput = {
  items: ItemWithOptions[];
  responses: RapidRoundResponse[];
  completed: boolean;
  attemptNumber: number;
};

/** Longest run of consecutive correct answers in **question order**. */
function longestCorrectStreakInOrder(
  items: ItemWithOptions[],
  responses: RapidRoundResponse[],
): number {
  const byItem = new Map(responses.map((r) => [r.itemId, r]));
  let best = 0;
  let cur = 0;
  for (const item of items) {
    const r = byItem.get(item.id);
    if (r && r.isCorrect && !r.timedOut) {
      cur += 1;
      best = Math.max(best, cur);
    } else {
      cur = 0;
    }
  }
  return best;
}

export function getRetryPenaltyMultiplier(attemptNumber: number): number {
  if (attemptNumber <= 1) return 1;
  if (attemptNumber === 2) return 0.8;
  return 0.6;
}

export function calculateRapidRoundScore(input: ScoreInput): RapidRoundScoreBreakdown {
  const totalItems = input.items.length;
  const responses = input.responses;
  const byItem = new Map(responses.map((r) => [r.itemId, r]));

  let correctCount = 0;
  let incorrectCount = 0;
  let timedOutCount = 0;
  let responseTimeSum = 0;
  let responseTimeCount = 0;
  const speedRatios: number[] = [];

  for (const item of input.items) {
    const r = byItem.get(item.id);
    if (!r) {
      incorrectCount += 1;
      continue;
    }
    if (r.timedOut) {
      timedOutCount += 1;
      incorrectCount += 1;
      continue;
    }
    if (r.isCorrect) {
      correctCount += 1;
      const maxMs = item.timerSeconds * 1000;
      const ratio = maxMs > 0 ? Math.max(0, Math.min(1, 1 - r.responseMs / maxMs)) : 0;
      speedRatios.push(ratio);
      responseTimeSum += r.responseMs;
      responseTimeCount += 1;
    } else {
      incorrectCount += 1;
    }
  }

  const longestStreak = longestCorrectStreakInOrder(input.items, responses);

  const accuracyPoints = totalItems > 0 ? (correctCount / totalItems) * 70 : 0;
  const streakBonus = totalItems > 0 ? (longestStreak / totalItems) * 15 : 0;
  const speedBonus =
    speedRatios.length > 0 ? (speedRatios.reduce((a, b) => a + b, 0) / speedRatios.length) * 10 : 0;
  const completionBonus = input.completed ? 5 : 0;

  const rawSubtotal = accuracyPoints + streakBonus + speedBonus + completionBonus;
  const retryPenaltyMultiplier = getRetryPenaltyMultiplier(input.attemptNumber);
  const finalScore = Math.round(
    Math.min(100, Math.max(0, rawSubtotal * retryPenaltyMultiplier)),
  );

  const averageResponseMs =
    responseTimeCount > 0 ? Math.round(responseTimeSum / responseTimeCount) : null;

  const retryPenaltyLabel =
    retryPenaltyMultiplier >= 1
      ? 'First attempt (no penalty)'
      : retryPenaltyMultiplier === 0.8
        ? 'Retry penalty ×0.8'
        : 'Retry penalty ×0.6';

  return {
    totalItems,
    correctCount,
    incorrectCount,
    timedOutCount,
    longestStreak,
    accuracyPoints,
    streakBonus,
    speedBonus,
    completionBonus,
    rawSubtotal,
    retryPenaltyMultiplier,
    retryPenaltyLabel,
    finalScore,
    averageResponseMs,
  };
}
