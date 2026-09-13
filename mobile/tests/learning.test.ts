import { describe, expect, it } from 'vitest';
import {
  addReport, availableCases, beginSession, caseQuestions, dueConcepts, initialLearningState, migrateLegacy,
  nextQuestion, restoreLearning, reviewItems, studyItems, submitResponse,
  type Confidence, type LearningState, type StudyQuestion,
} from '../lib/learning';
import { advance, answer, begin, emptyState } from '../lib/mobile';
import { CARDIAC_ITEMS } from '../content/cardiac-pack';
import { catalogItems, migrateItemId, migrateOptionId } from '../content/catalog';
import { expandedQuestions } from '../content/expanded-content';
import type { NgnResponse } from '../lib/ngn';

const DAY = 86_400_000;
const START = Date.UTC(2026, 8, 11, 12);
const scenarioId = catalogItems[0].scenarioId;
const fresh = (): LearningState => structuredClone(initialLearningState);
const startLearn = (state = fresh(), now = START) => beginSession(state, 'learn', scenarioId, now, true);
function correctAnswer(question: StudyQuestion): NgnResponse {
  const rubric = question.rubric;
  return rubric.format === 'matrix' || rubric.format === 'cloze'
    ? { selectedIds: [], rowAnswers: Object.fromEntries(rubric.rows.map(row => [row.id, row.correctOptionId])) }
    : { selectedIds: [...rubric.correctIds], rowAnswers: {} };
}
function wrongAnswer(question: StudyQuestion): NgnResponse {
  const rubric = question.rubric;
  if (rubric.format !== 'single') throw new Error('Use this helper only for catalog single-choice questions.');
  return { selectedIds: [rubric.options.find(option => !rubric.correctIds.includes(option.id))!.id], rowAnswers: {} };
}
function completeCorrect(state: LearningState, now = START + 1000, confidence: Confidence = 'sure'): LearningState {
  let result = state;
  let tick = now;
  while (result.active) {
    if (result.active.responses.length === result.active.index) {
      result = submitResponse(result, correctAnswer(result.active.questions[result.active.index]), confidence, tick++);
    }
    result = nextQuestion(result, tick++);
  }
  return result;
}

describe('learning modes and completion', () => {
  it('exposes real preview items while keeping unreviewed content out of production', () => {
    expect(studyItems(true)).toHaveLength(catalogItems.length + expandedQuestions.length);
    expect(studyItems(false)).toEqual([]);
    expect(availableCases(true).length).toBeGreaterThan(0);
    expect(availableCases(false)).toEqual([]);
    expect(beginSession(fresh(), 'learn', scenarioId, START, false).active).toBeNull();
  });

  it('keeps Learn untimed through a long interruption and resume', () => {
    const started = startLearn();
    expect(started.active!.deadline).toBeNull();
    const resumed = restoreLearning(JSON.stringify(started), true);
    const submitted = submitResponse(resumed, correctAnswer(resumed.active!.questions[0]), 'sure', START + 3 * DAY);
    expect(submitted.active!.responses[0]).toMatchObject({ correct: true, timedOut: false, elapsedMs: 3 * DAY });
    expect(nextQuestion(submitted, START + 3 * DAY).active!.deadline).toBeNull();
  });

  it('keeps Challenge attempts and retry penalties separate from Learn sessions', () => {
    let state = completeCorrect(startLearn());
    expect(state.challengeAttempts).toEqual({});
    expect(state.history[0].challengeScore).toBeUndefined();
    state = beginSession(state, 'challenge', scenarioId, START + 10_000, true);
    expect(state.active!.attempt).toBe(1);
    expect(state.challengeAttempts[scenarioId]).toBe(1);
    state = completeCorrect(state, START + 10_001);
    expect(state.history[0].challengeScore).toBeDefined();
    state = completeCorrect(startLearn(state, START + 20_000), START + 20_001);
    expect(state.history[0].attempt).toBe(1);
    expect(state.history[0].challengeScore).toBeUndefined();
    expect(state.challengeAttempts[scenarioId]).toBe(1);
    state = beginSession(state, 'challenge', scenarioId, START + 30_000, true);
    expect(state.active!.attempt).toBe(2);
  });

  it('counts abandoned Challenge attempts while preventing accidental replacement of an active session', () => {
    const first = beginSession(fresh(), 'challenge', scenarioId, START, true);
    expect(beginSession(first, 'learn', scenarioId, START + 100, true)).toBe(first);
    const retry = beginSession({ ...first, active: null }, 'challenge', scenarioId, START + 1000, true);
    expect(retry.active!.attempt).toBe(2);
  });

  it('treats the exact Challenge deadline as timeout even with a correct choice', () => {
    const started = beginSession(fresh(), 'challenge', scenarioId, START, true);
    const submitted = submitResponse(started, correctAnswer(started.active!.questions[0]), 'sure', started.active!.deadline!);
    expect(submitted.active!.responses[0]).toMatchObject({ timedOut: true, correct: false, earned: 0, value: { selectedIds: [], rowAnswers: {} } });
    expect(submitted.active!.responses[0].max).toBeGreaterThan(0);
  });

  it('rejects incomplete answers and duplicate submits without inflating evidence', () => {
    const started = startLearn();
    expect(submitResponse(started, { selectedIds: [], rowAnswers: {} }, 'sure', START + 1000)).toBe(started);
    expect(nextQuestion(started)).toBe(started);
    const first = submitResponse(started, correctAnswer(started.active!.questions[0]), 'somewhat', START + 1000);
    expect(submitResponse(first, wrongAnswer(first.active!.questions[0]), 'sure', START + 1001)).toBe(first);
    expect(first.active!.responses).toHaveLength(1);
    expect(first.concepts[first.active!.questions[0].conceptId].attempts).toBe(1);
  });

  it('saves a completed session once and restores its evidence', () => {
    const complete = completeCorrect(startLearn());
    expect(complete.active).toBeNull();
    expect(complete.history).toHaveLength(1);
    expect(complete.history[0].responses).toHaveLength(complete.history[0].questions.length);
    expect(nextQuestion(complete)).toBe(complete);
    expect(restoreLearning(JSON.stringify(complete), true)).toEqual(complete);
  });

  it('rejects persisted completed sessions with a missing final response', () => {
    const complete = completeCorrect(startLearn());
    const damaged = {
      ...complete,
      history: [{ ...complete.history[0], responses: complete.history[0].responses.slice(0, -1) }],
    };
    expect(() => restoreLearning(JSON.stringify(damaged))).toThrow();
  });
});

describe('review scheduling and evidence', () => {
  it('makes a confidently wrong concept immediately due and prioritizes an unseen item', () => {
    const started = startLearn();
    const question = started.active!.questions[0];
    const submitted = submitResponse(started, wrongAnswer(question), 'sure', START + 1000);
    expect(submitted.concepts[question.conceptId]).toMatchObject({ needsSupport: true, dueAt: START + 1000, firstAttempts: 1, firstCorrect: 0 });
    expect(dueConcepts(submitted, START + 999)).toEqual([]);
    expect(dueConcepts(submitted, START + 1000)[0].id).toBe(question.conceptId);
    const review = reviewItems(submitted, START + 1000, true);
    expect(review[0].conceptId).toBe(question.conceptId);
    expect(review[0].id).not.toBe(question.id);
    const reviewState = beginSession({ ...submitted, active: null }, 'review', '', START + 1000, true);
    expect(reviewState.active!.mode).toBe('review');
    expect(reviewState.active!.deadline).toBeNull();
  });

  it('uses a short review interval for a correct but unsure answer', () => {
    const started = startLearn();
    const question = started.active!.questions[0];
    const submitted = submitResponse(started, correctAnswer(question), 'unsure', START + 1000);
    expect(submitted.concepts[question.conceptId]).toMatchObject({ needsSupport: true, dueAt: START + 1000 + DAY, intervalStep: 0 });
  });

  it('separates first-attempt evidence from repeated answers across sessions', () => {
    const first = completeCorrect(startLearn());
    const second = completeCorrect(startLearn(first, START + 10_000), START + 10_001);
    // Two five-item Learn sessions exhaust this ten-item scenario; the next must repeat.
    const thirdStart = startLearn(second, START + 20_000);
    const question = thirdStart.active!.questions[0];
    const before = second.concepts[question.conceptId];
    expect(before.seenIds).toContain(question.id);
    const repeated = submitResponse(thirdStart, correctAnswer(question), 'sure', START + 20_001);
    expect(repeated.active!.responses[0].exposure).toBe('repeat');
    expect(repeated.concepts[question.conceptId]).toMatchObject({
      firstAttempts: before.firstAttempts,
      firstCorrect: before.firstCorrect,
      attempts: before.attempts + 1,
    });
  });

  it('does not increase the spaced-review interval for multiple successes on the same day', () => {
    const first = completeCorrect(startLearn());
    const second = completeCorrect(startLearn(first, START + 10_000), START + 10_001);
    for (const concept of Object.values(second.concepts)) expect(concept.intervalStep).toBe(0);
    const later = startLearn(second, START + DAY);
    const question = later.active!.questions[0];
    const submitted = submitResponse(later, correctAnswer(question), 'sure', START + DAY + 1000);
    expect(submitted.concepts[question.conceptId]).toMatchObject({ intervalStep: 1, dueAt: START + 4 * DAY + 1000 });
    const sameDayStart = startLearn({ ...submitted, active: null }, START + DAY + 2000);
    // Hold the real catalog question constant so random session ordering cannot
    // turn this into a test of two different concepts' review intervals.
    const sameDay = { ...sameDayStart, active: { ...sameDayStart.active!, questions: [question] } };
    const repeated = submitResponse(sameDay, correctAnswer(question), 'sure', START + DAY + 3000);
    expect(repeated.concepts[question.conceptId].intervalStep).toBe(1);
  });
});

describe('unfolding case evidence', () => {
  it('withholds an entire linked case when any stage is unavailable for the current release mode', () => {
    const clinicalCase = availableCases(true)[0];
    const mutable = clinicalCase as unknown as { status: string; stages: { status: string }[] };
    const parentStatus = mutable.status;
    const stageStatuses = mutable.stages.map(stage => stage.status);
    try {
      mutable.status = 'published';
      mutable.stages.forEach(stage => { stage.status = 'published'; });
      expect(availableCases(false).some(item => item.id === clinicalCase.id)).toBe(true);
      expect(caseQuestions(clinicalCase.id, false)).toHaveLength(clinicalCase.stages.length);
      mutable.stages[1].status = 'needs_review';
      expect(availableCases(false).some(item => item.id === clinicalCase.id)).toBe(false);
      expect(caseQuestions(clinicalCase.id, false)).toEqual([]);
      expect(caseQuestions(clinicalCase.id, true)).toHaveLength(clinicalCase.stages.length);
      mutable.stages[1].status = 'draft';
      expect(availableCases(true).some(item => item.id === clinicalCase.id)).toBe(false);
      expect(caseQuestions(clinicalCase.id, true)).toEqual([]);
    } finally {
      mutable.status = parentStatus;
      mutable.stages.forEach((stage, index) => { stage.status = stageStatuses[index]; });
    }
  });

  it('reveals only earlier chart entries as history and keeps future changes hidden', () => {
    const clinicalCase = availableCases(true)[0];
    const questions = caseQuestions(clinicalCase.id, true);
    expect(questions[0].previousChart).toEqual([]);
    expect(questions[2].previousChart).toEqual([...clinicalCase.stages[0].chart, ...clinicalCase.stages[1].chart]);
    expect(questions[2].chart).toEqual([clinicalCase.patient, ...clinicalCase.stages[2].chart]);
    const visibleAtThirdStage = [...questions[2].previousChart!, ...questions[2].chart!];
    for (const futureEntry of clinicalCase.stages[3].chart) expect(visibleAtThirdStage).not.toContain(futureEntry);
  });

  it('offers usable concept review questions the day after completing a case', () => {
    const completed = completeCorrect(beginSession(fresh(), 'case', availableCases(true)[0].id, START, true));
    const nextDay = START + DAY + 10_000;
    const due = dueConcepts(completed, nextDay);
    expect(due.length).toBeGreaterThan(0);
    const review = reviewItems(completed, nextDay, true);
    expect(review.length).toBeGreaterThan(0);
    for (const concept of due) expect(review.some(question => question.conceptId === concept.id)).toBe(true);
    const session = beginSession(completed, 'review', '', nextDay, true);
    expect(session.active!.mode).toBe('review');
    expect(session.active!.questions.length).toBeGreaterThan(0);
    expect(session.active!.questions.every(question => !completed.concepts[question.conceptId].seenIds.includes(question.id))).toBe(true);
  });

  it('commits no case evidence until the final stage is completed', () => {
    let state = beginSession(fresh(), 'case', availableCases(true)[0].id, START, true);
    const count = state.active!.questions.length;
    expect(count).toBeGreaterThan(1);
    let now = START + 1000;
    for (let i = 0; i < count; i++) {
      expect(state.active!.index).toBe(i);
      expect(state.active!.deadline).toBeNull();
      state = submitResponse(state, correctAnswer(state.active!.questions[i]), 'sure', now++);
      expect(state.concepts).toEqual({});
      expect(state.history).toEqual([]);
      if (i < count - 1) state = nextQuestion(state, now++);
    }
    expect(state.active!.responses).toHaveLength(count);
    state = nextQuestion(state, now);
    expect(state.active).toBeNull();
    expect(state.history[0]).toMatchObject({ mode: 'case', completedAt: now });
    expect(state.history[0].responses.every(response => response.correct)).toBe(true);
    expect(Object.values(state.concepts).reduce((sum, concept) => sum + concept.attempts, 0)).toBe(count);
    expect(nextQuestion(state)).toBe(state);
  });

  it('preserves pending case answers across restart without prematurely publishing evidence', () => {
    const started = beginSession(fresh(), 'case', availableCases(true)[0].id, START, true);
    const submitted = submitResponse(started, correctAnswer(started.active!.questions[0]), 'sure', START + 1000);
    const resumed = restoreLearning(JSON.stringify(submitted), true);
    expect(resumed.active!.responses).toHaveLength(1);
    expect(resumed.concepts).toEqual({});
    expect(submitResponse(resumed, correctAnswer(resumed.active!.questions[0]), 'sure', START + 1001)).toBe(resumed);
    expect(completeCorrect(resumed, START + 2000).history).toHaveLength(1);
  });
});

describe('persisted content publication gates', () => {
  it('withholds preview sessions in production while preserving evidence, reports, and reversible snapshots', () => {
    const completed = completeCorrect(startLearn());
    const pending = beginSession(completed, 'case', availableCases(true)[0].id, START + DAY, true);
    const original = addReport(pending, pending.active!.questions[0], 'Please verify this explanation.', START + DAY + 1000);
    const production = restoreLearning(JSON.stringify(original), false);
    expect(production.active).toBeNull();
    expect(production.history).toEqual([]);
    expect(production.withheldSessions).toHaveLength(2);
    expect(production.concepts).toEqual(original.concepts);
    expect(production.reports).toEqual(original.reports);
    expect(production.challengeAttempts).toEqual(original.challengeAttempts);
    expect(restoreLearning(JSON.stringify(production), true)).toEqual(original);
  });

  it('does not trust a saved published flag when the current catalog still requires review', () => {
    const original = startLearn();
    const forged = { ...original, active: { ...original.active!, questions: original.active!.questions.map(question => ({ ...question, status: 'published' })) } };
    const production = restoreLearning(JSON.stringify(forged), false);
    expect(production.active).toBeNull();
    expect(production.withheldSessions![0].id).toBe(original.active!.id);
  });

  it('allows a current published snapshot and withholds a superseded content version', () => {
    const original = startLearn();
    const question = original.active!.questions[0];
    const authored = catalogItems.find(item => item.id === question.id)!;
    const priorStatus = authored.status;
    try {
      authored.status = 'published';
      const published = { ...original, active: { ...original.active!, questions: [{ ...question, status: 'published' }] } };
      expect(restoreLearning(JSON.stringify(published), false).active).toEqual(published.active);
      const superseded = { ...published, active: { ...published.active, questions: [{ ...published.active.questions[0], version: 'outdated-version' }] } };
      expect(restoreLearning(JSON.stringify(superseded), false).active).toBeNull();
    } finally {
      authored.status = priorStatus;
    }
  });

  it('rejects corrupt withheld snapshots instead of letting them bypass saved-data validation', () => {
    const production = restoreLearning(JSON.stringify(startLearn()), false);
    const damaged = { ...production, withheldSessions: [{ ...production.withheldSessions![0], questions: [] }] };
    expect(() => restoreLearning(JSON.stringify(damaged), false)).toThrow();
  });

  it('withholds an unpublished legacy session and restores it when preview is enabled again', () => {
    const old = begin(emptyState, CARDIAC_ITEMS[0].scenarioId, START, [CARDIAC_ITEMS[0]]);
    const production = migrateLegacy(JSON.stringify(old), false);
    expect(production.active).toBeNull();
    expect(production.withheldSessions).toHaveLength(1);
    const preview = restoreLearning(JSON.stringify(production), true);
    expect(preview.active!.id).toBe(old.active!.id);
    expect(preview.active!.deadline).toBe(old.active!.deadline);
    expect(preview.challengeAttempts).toEqual(old.attempts);
  });
});

describe('version-one migration', () => {
  it('migrates historical scores, original item aliases, attempts, and content reports', () => {
    const item = CARDIAC_ITEMS[0];
    const correctId = item.options.find(option => option.isCorrect)!.id;
    const completed = advance(answer(begin(emptyState, item.scenarioId, START, [item]), correctId, START + 1000), START + 2000);
    const old = { ...completed, reports: [{ itemId: item.id, reason: 'Please verify this explanation.', createdAt: START + 3000 }] };
    const migrated = migrateLegacy(JSON.stringify(old), true);
    expect(migrated.version).toBe(2);
    expect(migrated.challengeAttempts).toEqual(old.attempts);
    expect(migrated.history).toHaveLength(1);
    expect(migrated.history[0]).toMatchObject({ mode: 'challenge', completedAt: START + 2000, attempt: 1 });
    expect(migrated.history[0].questions[0]).toMatchObject({ id: migrateItemId(item.id), version: 'legacy-1' });
    expect(migrated.history[0].responses[0]).toMatchObject({ questionId: migrateItemId(item.id), correct: true, exposure: 'repeat', value: { selectedIds: [migrateOptionId(correctId)], rowAnswers: {} } });
    expect(migrated.history[0].challengeScore!.correctCount).toBe(1);
    expect(migrated.concepts).toEqual({});
    expect(migrated.reports[0]).toMatchObject({ questionId: migrateItemId(item.id), version: 'legacy-1', reason: old.reports[0].reason, status: 'open' });
    expect(restoreLearning(JSON.stringify(migrated), true)).toEqual(migrated);
  });

  it('preserves a pending legacy deadline and safely finishes the migrated round', () => {
    const item = CARDIAC_ITEMS[0];
    const old = begin(emptyState, item.scenarioId, START, [item]);
    const migrated = migrateLegacy(JSON.stringify(old), true);
    expect(migrated.active!.deadline).toBe(old.active!.deadline);
    const timedOut = submitResponse(migrated, correctAnswer(migrated.active!.questions[0]), 'sure', old.active!.deadline + 1000);
    expect(timedOut.active!.responses[0]).toMatchObject({ timedOut: true, earned: 0 });
    expect(nextQuestion(timedOut, old.active!.deadline + 1001).history).toHaveLength(1);
  });

  it('returns empty data for a new install and rejects corrupt legacy storage', () => {
    expect(migrateLegacy(null)).toEqual(initialLearningState);
    expect(() => migrateLegacy('{')).toThrow();
    expect(() => migrateLegacy(JSON.stringify({ ...emptyState, active: {} }))).toThrow();
  });
});
