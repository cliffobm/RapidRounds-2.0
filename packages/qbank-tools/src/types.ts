export type Difficulty = "easy" | "moderate" | "hard";
export interface QBankItem { id: string; topic: string; difficulty: Difficulty; stem?: string; question: string; options: string[]; correct_answer: string; rationale?: string; clinical_pearl?: string; tags?: string[]; assets?: Record<string,string>; }
export interface QBank { version: string; bank_id: string; title: string; source_note?: string; items: QBankItem[]; }
