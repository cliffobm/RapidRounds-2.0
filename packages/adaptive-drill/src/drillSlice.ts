import { DrillState, QBankItem, SubmitPayload, SchedulerConfig } from "./types";
import { buildQueue, review, seedFromBank } from "./scheduler";

export const initialState = (): DrillState => ({
  cards: {},
  queue: [],
  stats: { seen: 0, correct: 0, incorrect: 0 },
  history: [],
});

export type Action =
  | { type: "INIT_FROM_BANK"; items: QBankItem[]; cfg?: SchedulerConfig }
  | { type: "SUBMIT"; payload: SubmitPayload; now?: number }
  | { type: "REQUEUE"; now?: number }
  | { type: "RESET_PROGRESS" }
  | { type: "HYDRATE"; state: DrillState };

export function reducer(state: DrillState, action: Action): DrillState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "INIT_FROM_BANK": {
      const seeded = seedFromBank(action.items, state.cards, action.cfg);
      const cards = { ...state.cards, ...seeded };
      const queue = buildQueue(cards, action.cfg);
      return { ...state, cards, queue };
    }
    case "SUBMIT": {
      const now = action.now ?? Date.now();
      const card = state.cards[action.payload.id];
      if (!card) return state;
      const updated = review(card, action.payload.outcome, now);
      const cards = { ...state.cards, [card.item.id]: updated };
      const stats = {
        seen: state.stats.seen + 1,
        correct: state.stats.correct + (action.payload.outcome === "correct" ? 1 : 0),
        incorrect: state.stats.incorrect + (action.payload.outcome === "incorrect" ? 1 : 0),
      };
      const history = state.history.concat([{ id: card.item.id, t: now, outcome: action.payload.outcome, ease: updated.ease, interval: updated.interval }]);
      const queue = state.queue.filter(id => id !== card.item.id);
      return { ...state, cards, stats, history, queue };
    }
    case "REQUEUE": {
      const queue = buildQueue(state.cards, { now: action.now ?? Date.now() });
      return { ...state, queue };
    }
    case "RESET_PROGRESS":
      return initialState();
    default:
      return state;
  }
}
