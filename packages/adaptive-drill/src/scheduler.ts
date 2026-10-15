import { DrillCard, QBankItem, SchedulerConfig } from "./types";

export function makeInitialCard(item: QBankItem, now = Date.now()): DrillCard {
  return { item, due: now, ease: 2.5, interval: 0, lapses: 0 };
}

export function review(card: DrillCard, outcome: "correct" | "incorrect", now = Date.now()): DrillCard {
  let ease = card.ease;
  if (outcome === "correct") {
    ease = Math.max(1.3, ease + 0.1);
    let nextIntervalDays = 0;
    if (card.interval === 0) nextIntervalDays = 1;
    else if (card.interval === 1) nextIntervalDays = 3;
    else nextIntervalDays = Math.ceil(card.interval * ease);
    return { ...card, ease, interval: nextIntervalDays, due: now + nextIntervalDays * 86400000, lastOutcome: outcome };
  } else {
    ease = Math.max(1.3, ease - 0.2);
    const lapses = card.lapses + 1;
    const nextIntervalDays = 1;
    return { ...card, ease, interval: nextIntervalDays, due: now + nextIntervalDays * 86400000, lapses, lastOutcome: outcome };
  }
}

export function buildQueue(cards: Record<string, DrillCard>, cfg: SchedulerConfig = {}): string[] {
  const { now = Date.now(), maxQueue = 50 } = cfg;
  return Object.values(cards)
    .filter(c => c.due <= now)
    .sort((a, b) => a.due - b.due)
    .slice(0, maxQueue)
    .map(c => c.item.id);
}

export function seedFromBank(items: QBankItem[], existing: Record<string, DrillCard>, { now = Date.now(), newPerSession = 10 }: SchedulerConfig = {}): Record<string, DrillCard> {
  const toAdd: Record<string, DrillCard> = {};
  const candidates = items.filter(i => !existing[i.id]).slice(0, newPerSession);
  for (const it of candidates) toAdd[it.id] = makeInitialCard(it, now);
  return toAdd;
}
