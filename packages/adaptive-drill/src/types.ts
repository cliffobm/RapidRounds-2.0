export type ChoiceID = string;

export interface QBankItem {
  id: string;
  topic: string;
  difficulty: "easy" | "moderate" | "hard";
  stem?: string;
  question: string;
  options: string[];
  correct_answer: string;
  rationale?: string;
  clinical_pearl?: string;
  tags?: string[];
  assets?: Record<string, string>;
}

export interface DrillCard {
  item: QBankItem;
  due: number;
  ease: number;
  interval: number;
  lapses: number;
  lastOutcome?: "correct" | "incorrect";
}

export interface DrillState {
  cards: Record<string, DrillCard>;
  queue: string[];
  stats: { seen: number; correct: number; incorrect: number };
  history: Array<{ id: string; t: number; outcome: "correct" | "incorrect"; ease: number; interval: number }>;
}

export interface SchedulerConfig { now?: number; newPerSession?: number; maxQueue?: number }
export interface SubmitPayload { id: string; outcome: "correct" | "incorrect" }

export interface UseScenarioDrillArgs {
  bank: { items: QBankItem[] };
  sessionCap?: number;
  topicFilter?: string[];
  difficultyFilter?: Array<QBankItem["difficulty"]>;
}
