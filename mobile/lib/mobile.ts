import { CARDIAC_PACK } from '../content/cardiac-pack';
import type { ItemWithOptions, RapidRoundResponse } from './domain/types';
import { calculateRapidRoundScore } from './rapidRound/scoring';

export type Round = { id: string; scenarioId: string; attempt: number; items: ItemWithOptions[]; responses: RapidRoundResponse[]; index: number; startedAt: number; deadline: number; completedAt: number | null };
export type State = { version: 1; active: Round | null; history: Round[]; attempts: Record<string, number>; reports: {itemId: string; reason: string; createdAt: number}[] };
export const emptyState: State = { version: 1, active: null, history: [], attempts: {}, reports: [] };
export const previewContent = process.env.EXPO_PUBLIC_CONTENT_PREVIEW === 'true';
export function playable(scenarioId: string, preview = previewContent) {
  return CARDIAC_PACK.items.filter(i => i.scenarioId === scenarioId && (i.status === 'published' || (preview && i.status === 'needs_review')));
}
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export function begin(state: State, scenarioId: string, now = Date.now(), items = playable(scenarioId)): State {
  if (!items.length) return state;
  const selected = shuffle(items).slice(0, 10).map(i => ({ ...i, options: shuffle(i.options) }));
  const attempt = (state.attempts[scenarioId] ?? 0) + 1;
  return { ...state, attempts: { ...state.attempts, [scenarioId]: attempt }, active: { id: `${now}-${Math.random().toString(36).slice(2)}`, scenarioId, attempt, items: selected, responses: [], index: 0, startedAt: now, deadline: now + selected[0].timerSeconds * 1000, completedAt: null } };
}
export function answer(state: State, optionId: string | null, now = Date.now()): State {
  const r = state.active;
  if (!r || r.completedAt || r.responses.length > r.index) return state;
  const item = r.items[r.index];
  const timedOut = now >= r.deadline;
  if (!timedOut && !item.options.some(o => o.id === optionId)) return state;
  const response: RapidRoundResponse = { id: `${r.id}:${r.index}`, sessionId: r.id, itemId: item.id, selectedAnswerOptionId: timedOut ? null : optionId, isCorrect: !timedOut && item.options.some(o => o.id === optionId && o.isCorrect), timedOut, responseMs: Math.max(0, Math.min(item.timerSeconds * 1000, now - (r.deadline - item.timerSeconds * 1000))), answeredAt: now };
  return { ...state, active: { ...r, responses: [...r.responses, response] } };
}
export function advance(state: State, now = Date.now()): State {
  const r = state.active;
  if (!r || r.responses.length !== r.index + 1) return state;
  if (r.index + 1 === r.items.length) {
    const completed = { ...r, completedAt: now };
    return { ...state, active: null, history: [completed, ...state.history].slice(0, 100) };
  }
  return { ...state, active: { ...r, index: r.index + 1, deadline: now + r.items[r.index + 1].timerSeconds * 1000 } };
}
export const score = (round: Round) => calculateRapidRoundScore({ items: round.items, responses: round.responses, completed: round.completedAt !== null, attemptNumber: round.attempt });
export function restore(raw: string | null): State {
  if (!raw) return emptyState;
  const s = JSON.parse(raw);
  if (s.version !== 1 || !Array.isArray(s.history) || !Array.isArray(s.reports) || !s.attempts || typeof s.attempts !== 'object') throw new Error('Invalid saved state');
  const validRound = (r: Round) => r && typeof r.id === 'string' && Array.isArray(r.items) && r.items.length > 0 && r.items.every(i => typeof i.stem === 'string' && Array.isArray(i.options) && i.options.length > 1 && i.timerSeconds > 0) && Array.isArray(r.responses) && Number.isInteger(r.index) && r.index >= 0 && r.index < r.items.length && Number.isFinite(r.deadline) && Number.isInteger(r.attempt) && r.attempt > 0;
  if ((s.active !== null && !validRound(s.active)) || !s.history.every(validRound) || !Object.values(s.attempts).every(n => Number.isInteger(n) && Number(n) > 0)) throw new Error('Invalid saved rounds');
  return s;
}
