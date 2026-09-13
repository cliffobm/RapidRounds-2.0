import { describe, expect, it } from 'vitest';
import {
  availableCases, availableLessons, beginSession, caseQuestions, initialLearningState, sessionPool,
  sessionQuestionCounts, studyConcepts, studyItems, studyScenarios,
  type LearningState, type QuestionDifficulty,
} from '../lib/learning';
import { catalogItems } from '../content/catalog';
import { expandedCases, expandedQuestions, expandedScenarios } from '../content/expanded-content';

const START = Date.UTC(2026, 8, 12, 12);
const fresh = (): LearningState => structuredClone(initialLearningState);
const cardiacScenario = catalogItems[0].scenarioId;

describe('custom study sessions', () => {
  it('preserves the original five-question Learn and ten-question Challenge defaults', () => {
    expect(beginSession(fresh(), 'learn', cardiacScenario, START, true).active!.questions).toHaveLength(5);
    expect(beginSession(fresh(), 'challenge', cardiacScenario, START, true).active!.questions).toHaveLength(10);
  });

  it.each(sessionQuestionCounts)('selects %i unique questions when the mixed pool has capacity', questionCount => {
    for (const mode of ['learn', 'challenge'] as const) {
      const session = beginSession(fresh(), mode, 'all', START, true, { questionCount }).active!;
      expect(session.questions).toHaveLength(Math.min(questionCount, sessionPool('all', true).length));
      expect(new Set(session.questions.map(question => question.id)).size).toBe(session.questions.length);
      expect(session.mode).toBe(mode);
      expect(mode === 'learn' ? session.deadline === null : session.deadline! > START).toBe(true);
    }
  });

  it('uses the actual available count for a small pool without duplicating questions', () => {
    const scenarioId = expandedScenarios[0].id;
    const pool = sessionPool(scenarioId, true);
    expect(pool.length).toBeGreaterThan(0);
    expect(pool.length).toBeLessThan(50);
    const started = beginSession(fresh(), 'learn', scenarioId, START, true, { questionCount: 50 });
    expect(started.active!.questions).toHaveLength(pool.length);
    expect(started.active!.questions.every(question => question.scenarioId === scenarioId)).toBe(true);
  });

  it.each(['foundation', 'application', 'advanced'] as QuestionDifficulty[])('filters both the count and selected questions to %s', difficulty => {
    const pool = sessionPool('all', true, { difficulty });
    expect(pool.length).toBeGreaterThan(0);
    const started = beginSession(fresh(), 'challenge', 'all', START, true, { difficulty, questionCount: 50 });
    expect(started.active!.questions).toHaveLength(Math.min(pool.length, 50));
    expect(started.active!.questions.every(question => question.difficulty === difficulty)).toBe(true);
  });

  it('defaults inherited question difficulty to application and can mix several scenarios', () => {
    expect(sessionPool(cardiacScenario, true).every(question => question.difficulty === 'application')).toBe(true);
    const session = beginSession(fresh(), 'learn', 'all', START, true, { questionCount: 50 }).active!;
    expect(new Set(session.questions.map(question => question.scenarioId)).size).toBeGreaterThan(1);
    expect(session.title).toBe('Mixed nursing concepts');
  });

  it('keeps unavailable and unmatched pools empty without starting an attempt', () => {
    const state = fresh();
    expect(sessionPool('all', false)).toEqual([]);
    expect(availableLessons(false)).toEqual([]);
    expect(availableLessons(true).length).toBeGreaterThan(0);
    expect(beginSession(state, 'challenge', 'all', START, false, { questionCount: 50 })).toBe(state);
    expect(sessionPool(cardiacScenario, true, { difficulty: 'foundation' })).toEqual([]);
    expect(beginSession(state, 'challenge', cardiacScenario, START, true, { difficulty: 'foundation' })).toBe(state);
    expect(state.challengeAttempts).toEqual({});
  });

  it('bounds a malformed authored timer and rejects an invalid start time', () => {
    const authored = catalogItems[0];
    const previous = authored.timerSeconds;
    try {
      authored.timerSeconds = 0;
      const session = beginSession(fresh(), 'challenge', cardiacScenario, START, true).active!;
      expect(session.questions.find(question => question.id === authored.id)!.timerSeconds).toBe(60);
      expect(Number.isFinite(session.deadline)).toBe(true);
      expect(session.deadline).toBeGreaterThan(START);
    } finally {
      authored.timerSeconds = previous;
    }
    const state = fresh();
    expect(beginSession(state, 'learn', 'all', Number.NaN, true)).toBe(state);
  });

  it('keeps linked cases complete regardless of question-count and difficulty controls', () => {
    const clinicalCase = availableCases(true)[0];
    const started = beginSession(fresh(), 'case', clinicalCase.id, START, true, { questionCount: 5, difficulty: 'advanced' });
    expect(started.active!.questions).toHaveLength(clinicalCase.stages.length);
  });

  it('integrates expanded scenarios and concepts and uses each case stage’s explicit concept', () => {
    const items = studyItems(true);
    for (const question of expandedQuestions) expect(items.some(item => item.id === question.id)).toBe(true);
    for (const scenario of expandedScenarios) expect(studyScenarios.some(item => item.id === scenario.id)).toBe(true);
    for (const clinicalCase of expandedCases) {
      const questions = caseQuestions(clinicalCase.id, true);
      expect(questions).toHaveLength(clinicalCase.stages.length);
      questions.forEach((question, index) => {
        expect(question.conceptId).toBe(clinicalCase.stages[index].conceptId);
        expect(studyConcepts.some(concept => concept.id === question.conceptId)).toBe(true);
      });
    }
    expect(new Set(studyScenarios.map(scenario => scenario.id)).size).toBe(studyScenarios.length);
    expect(new Set(studyConcepts.map(concept => concept.id)).size).toBe(studyConcepts.length);
  });
});
