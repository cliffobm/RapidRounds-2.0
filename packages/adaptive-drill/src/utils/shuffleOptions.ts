import type { QBankItem } from "../types";
export function shuffleOptions(item: QBankItem, rng: () => number = Math.random): QBankItem {
  const pairs = (item.options ?? []).map((opt, i) => ({ opt, idx: i }));
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmpI = pairs[i];
    const tmpJ = pairs[j];
    if (tmpI && tmpJ) [pairs[i], pairs[j]] = [tmpJ, tmpI];
  }
  const newOptions = pairs.map(p => p.opt);
  const correctIndex = (item.correct_answer?.toUpperCase?.().charCodeAt(0) ?? 65) - 65;
  const newIndex = pairs.findIndex(p => p && p.idx === correctIndex);
  const newCorrect = String.fromCharCode(65 + Math.max(0, newIndex));
  return { ...item, options: newOptions, correct_answer: newCorrect };
}
