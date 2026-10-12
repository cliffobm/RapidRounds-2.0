import { useEffect, useMemo, useReducer, useCallback } from "react";
import { initialState, reducer } from "./drillSlice";
import type { QBankItem, UseScenarioDrillArgs } from "./types";

export function useScenarioDrill({ bank, sessionCap = 15, topicFilter, difficultyFilter }: UseScenarioDrillArgs) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const filtered: QBankItem[] = useMemo(() => {
    let items = bank.items;
    if (topicFilter?.length) {
      const set = new Set(topicFilter.map(s => s.toLowerCase()));
      items = items.filter(i => set.has(i.topic.toLowerCase()));
    }
    if (difficultyFilter?.length) {
      const set = new Set(difficultyFilter);
      items = items.filter(i => set.has(i.difficulty));
    }
    return items;
  }, [bank, topicFilter, difficultyFilter]);

  useEffect(() => {
    dispatch({ type: "INIT_FROM_BANK", items: filtered, cfg: { newPerSession: sessionCap } });
  }, [filtered, sessionCap]);

  const current = useMemo(() => {
    const id = state.queue[0];
    return id ? state.cards[id] : undefined;
  }, [state.queue, state.cards]);

  const submit = useCallback((outcome: "correct" | "incorrect") => {
    if (!current) return;
    dispatch({ type: "SUBMIT", payload: { id: current.item.id, outcome } });
    setTimeout(() => dispatch({ type: "REQUEUE" }), 0);
  }, [current]);

  const next = useCallback(() => { dispatch({ type: "REQUEUE" }); }, []);

  const progress = useMemo(() => ({ ...state.stats, queue: state.queue.length }), [state]);

  return {
    card: current?.item,
    queueSize: state.queue.length,
    submit,
    next,
    progress,
    internal: state,
    hydrate: (saved: any) => dispatch({ type: "HYDRATE", state: saved }),
    reset: () => dispatch({ type: "RESET_PROGRESS" }),
  };
}
