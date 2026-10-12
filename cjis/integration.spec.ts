import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { BANKS, type BankKey } from '@/qbank/banks';
import { getCjisBank, getCjisCatalog } from '@/qbank/cjis';
import { GET } from '@/app/api/cjis/banks/route';
import { shuffleOptions } from '@/packages/adaptive-drill/src/utils/shuffleOptions';
import { makeInitialCard, review } from '@/packages/adaptive-drill/src/scheduler';
import { calculateQuestionScore, gradeScenario } from '@/lib/learning/grade';
import type { ScenarioQuestion } from '@/types';
import { createElement } from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import QuizWithSelector from '@/examples/QuizWithSelector';
vi.mock('@/lib/supabase-client', () => ({ supabaseClient: { from: vi.fn(() => { throw new Error('Unexpected database access'); }) } }));
import { useProgress } from '@/store/useProgress';
afterEach(() => { cleanup(); vi.unstubAllEnvs(); useProgress.setState({ xp: 0, level: 1, scenarioProgress: [] }); localStorage.clear(); });

describe('CJIS bank integration and legacy regression', () => {
  it('keeps the existing quiz bank selector and answer-submission flow working', async () => {
    render(createElement(QuizWithSelector));
    fireEvent.change(screen.getByRole('combobox', { name: 'Select bank' }), { target: { value: 'acute_mi' } });
    const item = BANKS.acute_mi.items[0]!;
    await screen.findByText(item.question);
    const answer = item.options[item.correct_answer.charCodeAt(0) - 65]!;
    const button = screen.getByText(answer, { exact: false }).closest('button');
    expect(button).not.toBeNull();
    fireEvent.click(button!);
    await waitFor(() => expect(screen.queryByText(/No due cards/)).not.toBeNull());
  });
  it.each(Object.keys(BANKS) as BankKey[])('preserves every payload, rationale, and correct answer in %s', key => {
    const original = structuredClone(BANKS[key]), staged = getCjisBank(key);
    expect(staged.items).toHaveLength(original.items.length);
    for (let index = 0; index < original.items.length; index++) {
      const item = original.items[index]!, draft = staged.items[index]!;
      expect(draft.id).toBe(item.id);
      expect(draft.legacy.source_item).toEqual(item);
      expect(draft.rationale.legacy_text).toBe(item.rationale ?? null);
      expect(draft.options.find(option => option.id === draft.correct_option_id)?.text).toBe(item.options[item.correct_answer.charCodeAt(0) - 65]);
      expect(draft.review_status).toBe('draft');
      // Existing shuffled grading remains correct for deterministic permutations.
      for (const seed of [0.01, 0.5, 0.99]) {
        const shuffled = shuffleOptions(item, () => seed);
        expect(shuffled.options[shuffled.correct_answer.charCodeAt(0) - 65]).toBe(item.options[item.correct_answer.charCodeAt(0) - 65]);
      }
    }
    expect(BANKS[key]).toEqual(original);
  });
  it('uses the existing catalog and rejects unknown or stale sidecars', () => {
    expect(getCjisCatalog().map(bank => bank.key)).toEqual(Object.keys(BANKS));
    expect(() => getCjisBank('__proto__' as BankKey)).toThrow('Unknown bank');
    const bank = BANKS.acute_mi, id = bank.items[0]!.id;
    const mapping = { source_version: bank.version, primary_competency: 'analyze_cues', clinical_domain: 'cardiovascular', complexity_level: 3, learning_objective: 'Mapping fixture only' };
    expect(getCjisBank('acute_mi', { [id]: mapping }).items[0]!.primary_competency).toBe('analyze_cues');
    expect(() => getCjisBank('acute_mi', { missing: mapping })).toThrow('Unknown mapping item');
    expect(() => getCjisBank('acute_mi', { [id]: { ...mapping, source_version: 'stale' } })).toThrow('Stale');
  });
  it('leaves scheduler outcomes and persistent learner progress intact', () => {
    const item = BANKS.acute_mi.items[0]!, card = makeInitialCard(item, 0);
    expect(review(card, 'correct', 0).interval).toBe(1);
    expect(review(card, 'incorrect', 0).lapses).toBe(1);
    useProgress.getState().updateScenarioProgress({ scenario_id: 'legacy', score: 80, completed_at: '2026-10-12', correct_count: 4, attempts: 1, time_spent: 60 });
    const state = structuredClone(JSON.parse(localStorage.getItem('progress-storage')!));
    getCjisBank('acute_mi');
    expect(JSON.parse(localStorage.getItem('progress-storage')!)).toEqual(state);
    expect(useProgress.getState().xp).toBe(800);
    expect(useProgress.getState().getAverageScore()).toBe(80);
  });
  it('preserves legacy scoring, speed adjustments, and unanswered-question scoring', () => {
    const question: ScenarioQuestion = { id: 'fixture', type: 'multiple_choice', question: 'Scoring fixture',
      correct_answer: 'B', points: 10, explanation: 'Fixture', category: 'assessment' };
    expect(calculateQuestionScore(question, 'B', 30)).toBe(11);
    expect(calculateQuestionScore(question, 'B', 60)).toBe(10);
    expect(calculateQuestionScore(question, 'B', 301)).toBe(8);
    expect(calculateQuestionScore(question, 'A', 5)).toBe(0);
    expect(gradeScenario([question], []).score).toBe(0);
    expect(gradeScenario([question], []).correctAnswers).toBe(0);
    getCjisBank('acute_mi');
    expect(calculateQuestionScore(question, 'B', 30)).toBe(11);
  });
  it('preview route defaults off and stays unavailable in production', async () => {
    const req = new NextRequest('http://localhost/api/cjis/banks');
    vi.stubEnv('CJIS_PREVIEW_ENABLED', 'false');
    expect((await GET(req)).status).toBe(404);
    vi.stubEnv('CJIS_PREVIEW_ENABLED', 'true'); vi.stubEnv('NODE_ENV', 'production');
    expect((await GET(req)).status).toBe(404);
  });
  it('serves registered staging banks only when development preview is enabled', async () => {
    vi.stubEnv('NODE_ENV', 'development'); vi.stubEnv('CJIS_PREVIEW_ENABLED', 'true');
    expect((await (await GET(new NextRequest('http://localhost/api/cjis/banks'))).json()).banks).toHaveLength(Object.keys(BANKS).length);
    const response = await GET(new NextRequest('http://localhost/api/cjis/banks?bank=acute_mi'));
    expect((await response.json()).items[0].id).toBe(BANKS.acute_mi.items[0]!.id);
    expect((await GET(new NextRequest('http://localhost/api/cjis/banks?bank=__proto__'))).status).toBe(404);
  });
});
