import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { StudentAnswer } from '@/types'

export interface ScenarioState {
  scenarioId: string
  currentQuestionIndex: number
  answers: StudentAnswer[]
  startTime: number
  isCompleted: boolean
}

/**
 * Navigation utilities for learning scenarios
 */
export class LearningNavigation {
  private router: ReturnType<typeof useRouter>
  
  constructor(router: ReturnType<typeof useRouter>) {
    this.router = router
  }

  /**
   * Navigate to scenario library
   */
  navigateToScenarioLibrary(): void {
    this.router.push('/scenario-library')
  }

  /**
   * Navigate to specific scenario
   */
  navigateToScenario(scenarioId: string): void {
    this.router.push(`/scenario/${scenarioId}`)
  }

  /**
   * Navigate to scenario completion page
   */
  navigateToCompletion(scenarioId: string, score: number): void {
    this.router.push(`/scenario/${scenarioId}/complete?score=${score}`)
  }

  /**
   * Navigate to next question
   */
  navigateToNextQuestion(currentIndex: number, totalQuestions: number): number | null {
    if (currentIndex < totalQuestions - 1) {
      return currentIndex + 1
    }
    return null // No more questions
  }

  /**
   * Navigate to previous question
   */
  navigateToPreviousQuestion(currentIndex: number): number | null {
    if (currentIndex > 0) {
      return currentIndex - 1
    }
    return null // Already at first question
  }

  /**
   * Handle scenario completion
   */
  handleScenarioCompletion(
    scenarioId: string,
    answers: StudentAnswer[],
    score: number,
    timeSpent: number
  ): void {
    // Save completion data to localStorage for persistence
    this.saveScenarioCompletion(scenarioId, {
      answers,
      score,
      timeSpent,
      completedAt: Date.now()
    })

    // Navigate to scenario library with success message
    this.navigateToScenarioLibrary()
  }

  /**
   * Handle scenario exit
   */
  handleScenarioExit(scenarioId: string, currentState: ScenarioState): void {
    // Save current progress
    this.saveScenarioProgress(scenarioId, currentState)
    
    // Navigate back to scenario library
    this.navigateToScenarioLibrary()
  }

  /**
   * Save scenario progress to localStorage
   */
  saveScenarioProgress(scenarioId: string, state: ScenarioState): void {
    try {
      const key = `scenario_progress_${scenarioId}`
      localStorage.setItem(key, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save scenario progress:', error)
    }
  }

  /**
   * Load scenario progress from localStorage
   */
  loadScenarioProgress(scenarioId: string): ScenarioState | null {
    try {
      const key = `scenario_progress_${scenarioId}`
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to load scenario progress:', error)
      return null
    }
  }

  /**
   * Save scenario completion data
   */
  private saveScenarioCompletion(
    scenarioId: string, 
    completionData: {
      answers: StudentAnswer[]
      score: number
      timeSpent: number
      completedAt: number
    }
  ): void {
    try {
      const key = `scenario_completion_${scenarioId}`
      localStorage.setItem(key, JSON.stringify(completionData))
      
      // Also save to a general completions list
      const completionsKey = 'scenario_completions'
      const existing = localStorage.getItem(completionsKey)
      const completions = existing ? JSON.parse(existing) : []
      
      completions.push({
        scenarioId,
        ...completionData,
        id: `${scenarioId}_${completionData.completedAt}`
      })
      
      localStorage.setItem(completionsKey, JSON.stringify(completions))
    } catch (error) {
      console.error('Failed to save scenario completion:', error)
    }
  }

  /**
   * Clear scenario progress
   */
  clearScenarioProgress(scenarioId: string): void {
    try {
      const key = `scenario_progress_${scenarioId}`
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to clear scenario progress:', error)
    }
  }

  /**
   * Get all completed scenarios
   */
  getCompletedScenarios(): Array<{
    scenarioId: string
    score: number
    timeSpent: number
    completedAt: number
  }> {
    try {
      const completionsKey = 'scenario_completions'
      const existing = localStorage.getItem(completionsKey)
      return existing ? JSON.parse(existing) : []
    } catch (error) {
      console.error('Failed to get completed scenarios:', error)
      return []
    }
  }

  /**
   * Check if scenario is completed
   */
  isScenarioCompleted(scenarioId: string): boolean {
    const completed = this.getCompletedScenarios()
    return completed.some(completion => completion.scenarioId === scenarioId)
  }

  /**
   * Get scenario completion data
   */
  getScenarioCompletion(scenarioId: string): {
    answers: StudentAnswer[]
    score: number
    timeSpent: number
    completedAt: number
  } | null {
    try {
      const key = `scenario_completion_${scenarioId}`
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to get scenario completion:', error)
      return null
    }
  }
}

/**
 * Hook for using learning navigation
 */
export function useLearningNavigation() {
  const router = useRouter()
  return useMemo(() => new LearningNavigation(router), [router])
}

/**
 * Utility functions for URL state management
 */
export function createScenarioUrl(scenarioId: string, questionIndex?: number): string {
  const baseUrl = `/scenario/${scenarioId}`
  return questionIndex !== undefined ? `${baseUrl}?q=${questionIndex}` : baseUrl
}

export function parseScenarioUrl(searchParams: URLSearchParams): {
  questionIndex: number
} {
  const questionIndex = parseInt(searchParams.get('q') || '0', 10)
  return { questionIndex: Math.max(0, questionIndex) }
}

/**
 * State persistence utilities
 */
export function saveToUrlState(state: Partial<ScenarioState>): void {
  try {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    
    if (state.currentQuestionIndex !== undefined) {
      params.set('q', state.currentQuestionIndex.toString())
    }
    
    if (state.isCompleted !== undefined) {
      params.set('completed', state.isCompleted.toString())
    }
    
    const newUrl = `${url.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  } catch (error) {
    console.error('Failed to save to URL state:', error)
  }
}

export function loadFromUrlState(): Partial<ScenarioState> {
  try {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    
    return {
      currentQuestionIndex: parseInt(params.get('q') || '0', 10),
      isCompleted: params.get('completed') === 'true'
    }
  } catch (error) {
    console.error('Failed to load from URL state:', error)
    return {}
  }
}
