import { describe, it, expect } from 'vitest';
import { calculateRapidRoundScore, getRetryPenaltyMultiplier } from '../lib/rapidRound/scoring';
import type { ItemWithOptions, RapidRoundResponse } from '../lib/domain/types';

function mockItem(id: string, timerSeconds: number): ItemWithOptions {
  return {
    id,
    scenarioId: 's',
    systemId: 'sys',
    type: 'clinical_judgment',
    difficulty: 'medium',
    stem: 'Q',
    timerSeconds,
    status: 'published',
    rationale: 'r',
    createdAt: '',
    updatedAt: '',
    options: [
      {
        id: 'a1',
        itemId: id,
        text: 'x',
        isCorrect: true,
        rationale: '',
        order: 0,
      },
      {
        id: 'a2',
        itemId: id,
        text: 'y',
        isCorrect: false,
        rationale: '',
        order: 1,
      },
    ],
  };
}

describe('getRetryPenaltyMultiplier', () => {
  it('returns 1 for first attempt', () => {
    expect(getRetryPenaltyMultiplier(1)).toBe(1);
  });
  it('returns 0.8 for second attempt', () => {
    expect(getRetryPenaltyMultiplier(2)).toBe(0.8);
  });
  it('returns 0.6 for third+ attempts', () => {
    expect(getRetryPenaltyMultiplier(3)).toBe(0.6);
    expect(getRetryPenaltyMultiplier(10)).toBe(0.6);
  });
});

describe('calculateRapidRoundScore', () => {
  it('scores perfect completion with max streak', () => {
    const items = [mockItem('1', 60), mockItem('2', 60)];
    const responses: RapidRoundResponse[] = [
      {
        id: 'r1',
        sessionId: 'sess',
        itemId: '1',
        selectedAnswerOptionId: 'a1',
        isCorrect: true,
        timedOut: false,
        responseMs: 1000,
        answeredAt: 1,
      },
      {
        id: 'r2',
        sessionId: 'sess',
        itemId: '2',
        selectedAnswerOptionId: 'a1',
        isCorrect: true,
        timedOut: false,
        responseMs: 1000,
        answeredAt: 2,
      },
    ];
    const out = calculateRapidRoundScore({
      items,
      responses,
      completed: true,
      attemptNumber: 1,
    });
    expect(out.correctCount).toBe(2);
    expect(out.timedOutCount).toBe(0);
    expect(out.longestStreak).toBe(2);
    expect(out.completionBonus).toBe(5);
    expect(out.finalScore).toBeGreaterThan(90);
    expect(out.finalScore).toBeLessThanOrEqual(100);
  });

  it('counts timeouts as incorrect', () => {
    const items = [mockItem('1', 10)];
    const responses: RapidRoundResponse[] = [
      {
        id: 'r1',
        sessionId: 'sess',
        itemId: '1',
        selectedAnswerOptionId: null,
        isCorrect: false,
        timedOut: true,
        responseMs: 10000,
        answeredAt: 1,
      },
    ];
    const out = calculateRapidRoundScore({
      items,
      responses,
      completed: true,
      attemptNumber: 1,
    });
    expect(out.incorrectCount).toBe(1);
    expect(out.timedOutCount).toBe(1);
    expect(out.speedBonus).toBe(0);
  });

  it('applies retry penalty to second attempt', () => {
    const items = [mockItem('1', 60)];
    const responses: RapidRoundResponse[] = [
      {
        id: 'r1',
        sessionId: 'sess',
        itemId: '1',
        selectedAnswerOptionId: 'a1',
        isCorrect: true,
        timedOut: false,
        responseMs: 500,
        answeredAt: 1,
      },
    ];
    const first = calculateRapidRoundScore({
      items,
      responses,
      completed: true,
      attemptNumber: 1,
    });
    const second = calculateRapidRoundScore({
      items,
      responses,
      completed: true,
      attemptNumber: 2,
    });
    expect(second.finalScore).toBe(Math.round(Math.min(100, first.rawSubtotal * 0.8)));
  });
});
