export type DifficultyTag = 'easy' | 'medium' | 'hard' | 'critical';

export type ItemType =
  | 'assessment_finding'
  | 'normal_abnormal'
  | 'prioritization'
  | 'intervention'
  | 'clinical_judgment';

export type ClinicalJudgmentStep =
  | 'recognize_cues'
  | 'analyze_cues'
  | 'prioritize_hypotheses'
  | 'generate_solutions'
  | 'take_action'
  | 'evaluate_outcomes';

export type ContentStatus = 'draft' | 'needs_review' | 'approved' | 'published' | 'retired';

export type RapidRoundMode = 'rapid_round' | 'study';

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export type LearningSystem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  isEnabled: boolean;
};

export type Scenario = {
  id: string;
  systemId: string;
  title: string;
  slug: string;
  description: string;
  difficulty: DifficultyTag;
  estimatedMinutes: number;
  isPublished: boolean;
};

export type Item = {
  id: string;
  scenarioId: string;
  systemId: string;
  type: ItemType;
  difficulty: DifficultyTag;
  clinicalJudgmentStep?: ClinicalJudgmentStep;
  stem: string;
  timerSeconds: number;
  status: ContentStatus;
  rationale: string;
  referenceText?: string;
  createdAt: string;
  updatedAt: string;
};

export type AnswerOption = {
  id: string;
  itemId: string;
  text: string;
  isCorrect: boolean;
  rationale: string;
  order: number;
};

export type ItemWithOptions = Item & { options: AnswerOption[] };

export type RapidRoundSession = {
  id: string;
  userId: string | null;
  scenarioId: string;
  startedAt: number;
  completedAt: number | null;
  mode: RapidRoundMode;
  attemptNumber: number;
  retryOfSessionId: string | null;
  rawAccuracy: number;
  score: number;
  maxScore: number;
  accuracyPoints: number;
  streakBonus: number;
  speedBonus: number;
  completionBonus: number;
  retryPenalty: number;
  averageResponseMs: number | null;
  timedOutCount: number;
  correctCount: number;
  incorrectCount: number;
  longestStreak: number;
  itemOrder: string[];
  abandoned: boolean;
};

export type RapidRoundResponse = {
  id: string;
  sessionId: string;
  itemId: string;
  selectedAnswerOptionId: string | null;
  isCorrect: boolean;
  timedOut: boolean;
  responseMs: number;
  answeredAt: number;
};

export type ActiveRoundState = {
  sessionId: string;
  scenarioId: string;
  userId: string | null;
  mode: RapidRoundMode;
  attemptNumber: number;
  retryOfSessionId: string | null;
  startedAt: number;
  itemIds: string[];
  currentIndex: number;
  responses: RapidRoundResponse[];
  completed: boolean;
};

export type ContentReport = {
  id: string;
  itemId: string;
  userId: string | null;
  reason: string;
  details?: string;
  createdAt: string;
  status: ReportStatus;
};
