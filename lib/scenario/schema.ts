export interface Vital {
  name: string
  value: number
  unit: string
  normalRange: [number, number]
  criticalRange?: [number, number]
  trend: 'stable' | 'improving' | 'deteriorating'
}

export interface VitalDelta {
  [key: string]: {
    perMinute: number
    trend: 'stable' | 'improving' | 'deteriorating'
  }
}

export interface Option {
  id: string
  text: string
  isCorrect: boolean
  rationale: string
  hint?: string
  consequences?: {
    vitalsChange?: Partial<VitalDelta>
    nextNodeId?: string
  }
}

export interface ScenarioNode {
  id: string
  type: 'question' | 'action' | 'observation' | 'terminal'
  title: string
  description: string
  content: string
  options?: Option[]
  vitals?: Vital[]
  timeRequired?: number // minutes
  isTerminal?: boolean
  score?: number
  rationale?: string
  hints?: string[]
}

export interface Scenario {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  estimatedTime: number // minutes
  learningObjectives: string[]
  prerequisites?: string[]
  
  // Starting state
  initialVitals: Vital[]
  initialNodeId: string
  
  // Vitals drift over time
  vitalsDeltaPerMinute: VitalDelta
  
  // Scenario structure
  nodes: { [nodeId: string]: ScenarioNode }
  
  // Metadata
  author?: string
  version: string
  lastUpdated: string
  tags: string[]
}

export interface ScenarioState {
  scenarioId: string
  currentNodeId: string
  vitals: Vital[]
  score: number
  timeElapsed: number // minutes
  choices: Array<{
    nodeId: string
    optionId: string
    timestamp: number
    timeSpent: number
  }>
  isCompleted: boolean
  completedAt?: number
}

export interface ScenarioResult {
  scenarioId: string
  finalScore: number
  timeSpent: number
  choices: Array<{
    nodeId: string
    optionId: string
    isCorrect: boolean
    timeSpent: number
  }>
  vitalsHistory: Array<{
    timestamp: number
    vitals: Vital[]
  }>
  completedAt: number
  feedback: {
    strengths: string[]
    areasForImprovement: string[]
    keyLearningPoints: string[]
  }
}

// Helper types for scenario engine
export interface ScenarioEngine {
  startScenario: (scenario: Scenario) => ScenarioState
  applyDelay: (state: ScenarioState, minutes: number) => ScenarioState
  choose: (state: ScenarioState, optionId: string) => ScenarioState
  isTerminal: (state: ScenarioState) => boolean
  calculateScore: (state: ScenarioState) => number
  getNextNode: (state: ScenarioState, optionId: string) => ScenarioNode | null
}

// Rationale gating types
export interface Entitlement {
  userId: string
  tier: 'trial' | 'basic' | 'premium' | 'enterprise'
  trialStartDate?: string
  trialEndDate?: string
  completedScenarios: string[]
  totalScenariosCompleted: number
}

export interface RationaleAccess {
  hasFullAccess: boolean
  hasTrialAccess: boolean
  hasPaidAccess: boolean
  remainingTrialScenarios: number
  canAccessRationale: (scenarioId: string, nodeId: string) => boolean
}
