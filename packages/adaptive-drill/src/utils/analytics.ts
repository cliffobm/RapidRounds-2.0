import type { DrillState } from "../types";
export function missRatesByTopic(state: DrillState) {
  const acc: Record<string, { seen: number; incorrect: number }> = {};
  for (const h of state.history) {
    const topic = state.cards[h.id]?.item.topic ?? "Unknown";
    if (!acc[topic]) acc[topic] = { seen: 0, incorrect: 0 };
    acc[topic].seen += 1;
    if (h.outcome === "incorrect") acc[topic].incorrect += 1;
  }
  return Object.entries(acc).map(([topic, v]) => ({ topic, seen: v.seen, incorrect: v.incorrect, missRate: v.seen ? v.incorrect / v.seen : 0 })).sort((a, b) => b.missRate - a.missRate);
}
