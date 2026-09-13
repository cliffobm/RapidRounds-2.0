import { describe, expect, it } from 'vitest';
import {
  availableCases, beginSession, initialLearningState, nextQuestion, restoreLearning,
  studyItems, submitResponse, type LearningState, type StudyQuestion,
} from '../lib/learning';
import { rewardSummary, validRewardLedger } from '../lib/rewards';
import { catalogItems } from '../content/catalog';
import type { NgnResponse } from '../lib/ngn';

const START = new Date(2026, 8, 12, 12).getTime();
const DAY = 86_400_000;
const scenario = catalogItems[0].scenarioId;
const fresh = (): LearningState => structuredClone(initialLearningState);
const learn = (state = fresh(), now = START) => beginSession(state, 'learn', scenario, now, true);
function correctValue(question: StudyQuestion): NgnResponse {
  const rubric = question.rubric;
  return rubric.format === 'matrix' || rubric.format === 'cloze'
    ? { selectedIds: [], rowAnswers: Object.fromEntries(rubric.rows.map(row => [row.id, row.correctOptionId])) }
    : { selectedIds: [...rubric.correctIds], rowAnswers: {} };
}
function complete(state: LearningState, now = START + 1000): LearningState {
  let result = state;
  let clock = now;
  while (result.active) {
    if (result.active.responses.length === result.active.index) {
      result = submitResponse(result, correctValue(result.active.questions[result.active.index]), 'sure', clock++);
    }
    result = nextQuestion(result, clock++);
  }
  return result;
}
function repeatOne(state: LearningState, question: StudyQuestion, now: number): LearningState {
  const started = learn(state, now);
  return complete({ ...started, active: { ...started.active!, questions: [question] } }, now + 1000);
}

describe('persistent learning rewards', () => {
  it('starts without retroactive rewards and awards first response effort plus correctness only once', () => {
    const started = learn();
    expect(rewardSummary(started, START)).toMatchObject({ xp: 0, level: 1, activeDays: 0, streak: 0 });
    const answer = correctValue(started.active!.questions[0]);
    const submitted = submitResponse(started, answer, 'sure', START + 1000);
    expect(rewardSummary(submitted, START + 1000)).toMatchObject({ xp: 10, level: 1, activeDays: 1, streak: 1 });
    expect(submitResponse(submitted, answer, 'sure', START + 1001)).toBe(submitted);
    expect(validRewardLedger(submitted.rewardLedger)).toBe(true);
  });

  it('rewards an honest incorrect attempt without rewarding a timed-out blank', () => {
    const started = learn();
    const rubric = started.active!.questions[0].rubric;
    if (rubric.format !== 'single') throw new Error('This test uses a catalog single-choice item.');
    const wrongId = rubric.options.find(option => !rubric.correctIds.includes(option.id))!.id;
    const wrong = submitResponse(started, { selectedIds: [wrongId], rowAnswers: {} }, 'sure', START + 1000);
    expect(rewardSummary(wrong, START).xp).toBe(3);
    const challenge = beginSession(fresh(), 'challenge', scenario, START, true);
    const timedOut = submitResponse(challenge, { selectedIds: [], rowAnswers: {} }, 'unsure', challenge.active!.deadline!);
    expect(rewardSummary(timedOut, START)).toMatchObject({ xp: 0, activeDays: 0 });
  });

  it('awards completion once and prevents farming newly created sessions of already rewarded items', () => {
    const first = complete(learn());
    expect(rewardSummary(first, START).xp).toBe(65);
    expect(rewardSummary(nextQuestion(first), START).xp).toBe(65);
    const second = complete(learn(first, START + 10_000), START + 10_001);
    expect(rewardSummary(second, START).xp).toBe(130);
    const repeated = complete(learn(second, START + 20_000), START + 20_001);
    expect(rewardSummary(repeated, START).xp).toBe(130);
    expect(Object.keys(repeated.rewardLedger!.completions)).toHaveLength(2);
    expect(rewardSummary(repeated, START).level).toBe(2);
  });

  it('awards proportional correctness XP for a partially correct multi-response answer', () => {
    const question = studyItems(true).find(item => item.rubric.format === 'multiple' && item.rubric.correctIds.length > 1)!;
    expect(question).toBeDefined();
    if (question.rubric.format !== 'multiple') throw new Error('Expected a multiple-response item.');
    const started = learn();
    const oneQuestion = { ...started, active: { ...started.active!, questions: [question] } };
    const partial = submitResponse(oneQuestion, { selectedIds: [question.rubric.correctIds[0]], rowAnswers: {} }, 'somewhat', START + 1000);
    expect(partial.active!.responses[0].correct).toBe(false);
    expect(rewardSummary(partial, START).xp).toBeGreaterThan(3);
    expect(rewardSummary(partial, START).xp).toBeLessThan(10);
  });

  it('awards the Review completion bonus while keeping Challenge completion separate from XP', () => {
    const started = learn();
    const rubric = started.active!.questions[0].rubric;
    if (rubric.format !== 'single') throw new Error('Expected a single-choice item.');
    const wrongId = rubric.options.find(option => !rubric.correctIds.includes(option.id))!.id;
    const wrong = submitResponse(started, { selectedIds: [wrongId], rowAnswers: {} }, 'sure', START + 1000);
    const review = beginSession({ ...wrong, active: null }, 'review', '', START + 2000, true);
    expect(review.active!.questions).toHaveLength(1);
    const reviewed = complete(review, START + 3000);
    expect(rewardSummary(reviewed, START).xp).toBe(23);
    expect(Object.values(reviewed.rewardLedger!.completions)[0].mode).toBe('review');
    const challenged = complete(beginSession(fresh(), 'challenge', scenario, START, true));
    expect(rewardSummary(challenged, START).xp).toBe(100);
    expect(Object.keys(challenged.rewardLedger!.completions)).toHaveLength(0);
  });

  it('keeps earned XP and anti-farming identities after session history is trimmed', () => {
    const completed = complete(learn());
    const question = completed.history[0].questions[0];
    const trimmed = restoreLearning(JSON.stringify({ ...completed, history: [] }), true);
    expect(rewardSummary(trimmed, START).xp).toBe(65);
    const repeated = repeatOne(trimmed, question, START + DAY);
    expect(rewardSummary(repeated, START + DAY).xp).toBe(65);
    expect(rewardSummary(repeated, START + DAY).activeDays).toBe(2);
  });

  it('distinguishes a revised item version from farming the exact previous version', () => {
    const completed = complete(learn());
    const question = completed.history[0].questions[0];
    const updated = repeatOne(completed, { ...question, version: `${question.version}-revised` }, START + DAY);
    expect(rewardSummary(updated, START + DAY).xp).toBe(90);
    const repeated = repeatOne(updated, { ...question, version: `${question.version}-revised` }, START + 2 * DAY);
    expect(rewardSummary(repeated, START + 2 * DAY).xp).toBe(90);
  });

  it('defers all case XP until completion so intermediate rewards cannot reveal answers', () => {
    const started = beginSession(fresh(), 'case', availableCases(true)[0].id, START, true);
    const submitted = submitResponse(started, correctValue(started.active!.questions[0]), 'sure', START + 1000);
    expect(rewardSummary(submitted, START).xp).toBe(0);
    const count = submitted.active!.questions.length;
    const completed = complete(restoreLearning(JSON.stringify(submitted), true), START + 2000);
    const summary = rewardSummary(completed, START);
    expect(summary.xp).toBe(count * 10 + 25);
    expect(summary.badges.find(badge => badge.id === 'case-complete')!.earned).toBe(true);
    const replay = complete(beginSession(completed, 'case', availableCases(true)[0].id, START + DAY, true), START + DAY + 1000);
    expect(rewardSummary(replay, START + DAY).xp).toBe(summary.xp);
  });

  it('does not backfill old history or old case responses when rewards are introduced', () => {
    const completed = complete(learn());
    const { rewardLedger, ...oldState } = completed;
    const history = oldState.history.map(session => ({ ...session, responses: session.responses.map(({ rewardEligible, ...response }) => response) }));
    const restored = restoreLearning(JSON.stringify({ ...oldState, history }), true);
    expect(rewardSummary(restored, START).xp).toBe(0);
    const started = beginSession(fresh(), 'case', availableCases(true)[0].id, START, true);
    const answered = submitResponse(started, correctValue(started.active!.questions[0]), 'sure', START + 1000);
    const oldCase = { ...answered, active: { ...answered.active!, responses: answered.active!.responses.map(({ rewardEligible, ...response }) => response) } };
    const result = complete(restoreLearning(JSON.stringify(oldCase), true), START + 2000);
    expect(rewardSummary(result, START).xp).toBe((started.active!.questions.length - 1) * 10 + 25);
  });

  it('counts study days once, keeps consistency badges after a break, and allows repeated practice without more XP', () => {
    let state = complete(learn());
    const question = state.history[0].questions[0];
    state = repeatOne(state, question, START + 10_000);
    expect(rewardSummary(state, START).activeDays).toBe(1);
    state = repeatOne(state, question, START + DAY);
    state = repeatOne(state, question, START + 2 * DAY);
    const summary = rewardSummary(state, START + 2 * DAY + 2000);
    expect(summary).toMatchObject({ xp: 65, activeDays: 3, streak: 3 });
    expect(summary.badges.find(badge => badge.id === 'three-day-rhythm')!.earned).toBe(true);
    const afterBreak = rewardSummary(restoreLearning(JSON.stringify({ ...state, history: [] }), true), START + 6 * DAY);
    expect(afterBreak.streak).toBe(0);
    expect(afterBreak.badges.find(badge => badge.id === 'three-day-rhythm')!.earned).toBe(true);
  });

  it('rejects corrupted reward values without silently replacing the ledger', () => {
    const completed = complete(learn());
    const ledger = structuredClone(completed.rewardLedger!);
    Object.values(ledger.responses)[0].xp += 1000;
    expect(validRewardLedger(ledger)).toBe(false);
    expect(() => restoreLearning(JSON.stringify({ ...completed, rewardLedger: ledger }), true)).toThrow('Invalid reward data');
    const duplicateDays = { ...completed.rewardLedger!, activeDays: ['2026-09-12', '2026-09-12'] };
    expect(validRewardLedger(duplicateDays)).toBe(false);
  });
});
