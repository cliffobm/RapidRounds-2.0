import { describe, expect, it } from 'vitest';
import { advance, answer, begin, emptyState, playable, restore, score } from '../lib/mobile';
import { CARDIAC_ITEMS } from '../content/cardiac-pack';
const item = CARDIAC_ITEMS[0];
const start = () => begin(emptyState, item.scenarioId, 1000, [item]);
describe('mobile round lifecycle', () => {
  it('blocks unreviewed content from production', () => expect(playable(item.scenarioId, false)).toEqual([]));
  it('allows explicitly enabled preview content', () => expect(playable(item.scenarioId, true).length).toBeGreaterThan(0));
  it('records only one answer for repeated taps', () => {
    const first = answer(start(), item.options.find(o => o.isCorrect)!.id, 2000);
    expect(answer(first, item.options[0].id, 2001).active?.responses).toHaveLength(1);
  });
  it('counts an answer exactly at deadline as timeout', () => {
    const s = start();
    const timed = answer(s, item.options.find(o => o.isCorrect)!.id, s.active!.deadline);
    expect(timed.active!.responses[0]).toMatchObject({ timedOut: true, isCorrect: false, selectedAnswerOptionId: null });
  });
  it('retains deadline across a restart and expires after background time', () => {
    const s = restore(JSON.stringify(start()));
    expect(answer(s, null, s.active!.deadline + 10000).active!.responses[0].timedOut).toBe(true);
  });
  it('does not advance unanswered questions', () => { const s=start(); expect(advance(s)).toBe(s); });
  it('completes once and preserves results across restart', () => {
    const finished = advance(answer(start(), item.options.find(o=>o.isCorrect)!.id, 2000), 3000);
    expect(finished.active).toBeNull();
    expect(advance(finished).history).toHaveLength(1);
    expect(score(restore(JSON.stringify(finished)).history[0]).correctCount).toBe(1);
  });
  it('counts an abandoned attempt for retry penalties', () => {
    const retry = begin({...start(),active:null},item.scenarioId,4000,[item]);
    expect(retry.active!.attempt).toBe(2);
  });
  it('rejects corrupt storage rather than silently overwriting it', () => {
    expect(()=>restore('{')).toThrow();
    expect(()=>restore(JSON.stringify({...emptyState,active:{}}))).toThrow();
  });
  it('has unique stable item and answer IDs and one correct answer per item', () => {
    expect(new Set(CARDIAC_ITEMS.map(i=>i.id)).size).toBe(CARDIAC_ITEMS.length);
    for (const q of CARDIAC_ITEMS) {
      expect(q.options.filter(o=>o.isCorrect)).toHaveLength(1);
      expect(new Set(q.options.map(o=>o.id)).size).toBe(q.options.length);
    }
  });
});
