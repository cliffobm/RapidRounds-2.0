import type { LearningState, StudyQuestion, StudyResponse, StudySession } from './learning';

export type ResponseReward = {
  itemId: string; version: string; conceptId: string; sessionId: string;
  earned: number; max: number; xp: number; at: number;
};
export type CompletionReward = { sessionId: string; mode: 'learn' | 'review' | 'case'; xp: number; at: number };
export type RewardLedger = {
  version: 1;
  responses: Record<string, ResponseReward>;
  completions: Record<string, CompletionReward>;
  activeDays: string[];
};
export type RewardBadge = { id: string; label: string; description: string; earned: boolean };
export type RewardSummary = { xp: number; level: number; nextLevelXp: number; badges: RewardBadge[]; streak: number; activeDays: number };

const completionXp = { learn: 15, review: 10, case: 25 } as const;
const own = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);
const rewardKey = (itemId: string, version: string) => JSON.stringify([itemId, version]);
const emptyLedger = (): RewardLedger => ({ version: 1, responses: {}, completions: {}, activeDays: [] });
function dayKey(at: number): string {
  const date = new Date(at);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
const ordinal = (day: string) => Date.parse(`${day}T00:00:00Z`) / 86_400_000;
const answerXp = (earned: number, max: number) => 3 + Math.round(7 * earned / max);
function markDay(ledger: RewardLedger, at: number): RewardLedger {
  const day = dayKey(at);
  return ledger.activeDays.includes(day) ? ledger : { ...ledger, activeDays: [...ledger.activeDays, day].sort() };
}

/** Award a genuine new interaction once per exact item/version, across all modes. */
export function recordResponseReward(ledger: RewardLedger | undefined, question: StudyQuestion, response: StudyResponse, sessionId: string): RewardLedger | undefined {
  // Old saved answers have no marker and are never backfilled into XP.
  if (!response.rewardEligible || response.timedOut || !Number.isFinite(response.submittedAt)) return ledger;
  const current = markDay(ledger ?? emptyLedger(), response.submittedAt);
  const key = rewardKey(question.id, question.version);
  if (own(current.responses, key)) return current;
  return { ...current, responses: { ...current.responses, [key]: {
    itemId: question.id, version: question.version, conceptId: question.conceptId, sessionId,
    earned: response.earned, max: response.max, xp: answerXp(response.earned, response.max), at: response.submittedAt,
  } } };
}

/** Completion bonuses require newly rewarded items; replaying a known round cannot farm XP. */
export function recordCompletionReward(ledger: RewardLedger | undefined, session: StudySession): RewardLedger | undefined {
  if (!ledger || session.mode === 'challenge' || session.completedAt === null ||
      session.responses.length !== session.questions.length || own(ledger.completions, session.id) ||
      !Object.values(ledger.responses).some(reward => reward.sessionId === session.id)) return ledger;
  const current = markDay(ledger, session.completedAt);
  return { ...current, completions: { ...current.completions, [session.id]: {
    sessionId: session.id, mode: session.mode, xp: completionXp[session.mode], at: session.completedAt,
  } } };
}

export function rewardSummary(state: Pick<LearningState, 'rewardLedger'>, now = Date.now()): RewardSummary {
  const ledger = state.rewardLedger;
  const responses = Object.values(ledger?.responses ?? {});
  const completions = Object.values(ledger?.completions ?? {});
  const xp = [...responses, ...completions].reduce((total, reward) => total + reward.xp, 0);
  const days = [...new Set(ledger?.activeDays ?? [])].sort();
  const dayNumbers = days.map(ordinal);
  const today = ordinal(dayKey(now));
  const latest = dayNumbers.at(-1);
  let streak = 0;
  if (latest === today || latest === today - 1) {
    for (let i = dayNumbers.length - 1; i >= 0 && dayNumbers[i] === latest - streak; i--) streak++;
  }
  let longest = 0;
  let run = 0;
  dayNumbers.forEach((day, index) => { run = index > 0 && day === dayNumbers[index - 1] + 1 ? run + 1 : 1; longest = Math.max(longest, run); });
  const level = Math.floor(xp / 100) + 1;
  return {
    xp, level, nextLevelXp: level * 100, streak, activeDays: days.length,
    badges: [
      { id: 'first-step', label: 'First step', description: 'Attempt your first new question.', earned: responses.length > 0 },
      { id: 'round-complete', label: 'Round complete', description: 'Complete a learning session with new questions.', earned: completions.length > 0 },
      { id: 'concept-explorer', label: 'Concept explorer', description: 'Explore five different concepts.', earned: new Set(responses.map(r => r.conceptId)).size >= 5 },
      { id: 'case-complete', label: 'Case complete', description: 'Complete an unfolding case with new decisions.', earned: completions.some(r => r.mode === 'case') },
      { id: 'three-day-rhythm', label: 'Three-day rhythm', description: 'Study on three consecutive days.', earned: longest >= 3 },
      { id: 'seven-study-days', label: 'Seven study days', description: 'Build a habit across seven study days.', earned: days.length >= 7 },
    ],
  };
}

/** Validate persisted reward totals independently from the trimmed session history. */
export function validRewardLedger(value: unknown): value is RewardLedger {
  const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
  const text = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
  const validDay = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(ordinal(v)) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;
  if (!record(value) || value.version !== 1 || !record(value.responses) || !record(value.completions) ||
      !Array.isArray(value.activeDays) || !value.activeDays.every(validDay) || new Set(value.activeDays).size !== value.activeDays.length) return false;
  const responses = Object.values(value.responses);
  if (!Object.entries(value.responses).every(([key, reward]) => record(reward) &&
      [reward.itemId, reward.version, reward.conceptId, reward.sessionId].every(text) &&
      key === rewardKey(reward.itemId as string, reward.version as string) &&
      typeof reward.earned === 'number' && typeof reward.max === 'number' && Number.isFinite(reward.earned) && Number.isFinite(reward.max) &&
      reward.max > 0 && reward.earned >= 0 && reward.earned <= reward.max && reward.xp === answerXp(reward.earned, reward.max) && Number.isFinite(reward.at))) return false;
  return Object.entries(value.completions).every(([key, reward]) => record(reward) && reward.sessionId === key &&
    (reward.mode === 'learn' || reward.mode === 'review' || reward.mode === 'case') && reward.xp === completionXp[reward.mode] &&
    Number.isFinite(reward.at) && responses.some(response => record(response) && response.sessionId === key));
}
