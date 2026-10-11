import { Scenario, ScenarioState, ScenarioNode, Vital, VitalDelta, Option } from './schema'

export class ScenarioEngine {
  /**
   * Start a new scenario with initial state
   */
  startScenario(scenario: Scenario): ScenarioState {
    return {
      scenarioId: scenario.id,
      currentNodeId: scenario.initialNodeId,
      vitals: [...scenario.initialVitals],
      score: 0,
      timeElapsed: 0,
      choices: [],
      isCompleted: false,
    }
  }

  /**
   * Apply time delay and update vitals based on drift
   */
  applyDelay(state: ScenarioState, minutes: number): ScenarioState {
    const newState = { ...state }
    newState.timeElapsed += minutes

    // Apply vitals drift
    newState.vitals = newState.vitals.map(vital => {
      const delta = state.scenarioId ? this.getVitalDelta(state.scenarioId, vital.name, minutes) : 0
      const newValue = Math.max(0, vital.value + delta)
      
      return {
        ...vital,
        value: newValue,
        trend: this.calculateTrend(vital.value, newValue, vital.trend)
      }
    })

    return newState
  }

  /**
   * Make a choice and advance the scenario
   */
  choose(state: ScenarioState, optionId: string): ScenarioState {
    const currentNode = this.getCurrentNode(state)
    if (!currentNode || !currentNode.options) {
      return state
    }

    const selectedOption = currentNode.options.find(opt => opt.id === optionId)
    if (!selectedOption) {
      return state
    }

    const newState = { ...state }
    
    // Record the choice
    newState.choices.push({
      nodeId: currentNode.id,
      optionId: optionId,
      timestamp: Date.now(),
      timeSpent: 0 // This would be calculated based on actual time spent
    })

    // Apply consequences
    if (selectedOption.consequences) {
      if (selectedOption.consequences.vitalsChange) {
        newState.vitals = this.applyVitalsChange(newState.vitals, selectedOption.consequences.vitalsChange)
      }
      
      if (selectedOption.consequences.nextNodeId) {
        newState.currentNodeId = selectedOption.consequences.nextNodeId
      }
    }

    // Update score
    if (selectedOption.isCorrect) {
      newState.score += this.calculateNodeScore(currentNode)
    }

    // Check if terminal
    const nextNode = this.getNode(state.scenarioId, newState.currentNodeId)
    if (nextNode && nextNode.isTerminal) {
      newState.isCompleted = true
      newState.completedAt = Date.now()
    }

    return newState
  }

  /**
   * Check if the current state is at a terminal node
   */
  isTerminal(state: ScenarioState): boolean {
    const currentNode = this.getCurrentNode(state)
    return currentNode?.isTerminal || false
  }

  /**
   * Calculate final score based on choices and time
   */
  calculateScore(state: ScenarioState): number {
    if (!state.isCompleted) return 0

    const totalPossibleScore = this.getTotalPossibleScore(state.scenarioId)
    const timeBonus = this.calculateTimeBonus(state)
    const accuracyScore = (state.score / totalPossibleScore) * 100
    
    return Math.min(100, Math.max(0, accuracyScore + timeBonus))
  }

  /**
   * Get the next node after making a choice
   */
  getNextNode(state: ScenarioState, optionId: string): ScenarioNode | null {
    const currentNode = this.getCurrentNode(state)
    if (!currentNode || !currentNode.options) return null

    const selectedOption = currentNode.options.find(opt => opt.id === optionId)
    if (!selectedOption || !selectedOption.consequences?.nextNodeId) return null

    return this.getNode(state.scenarioId, selectedOption.consequences.nextNodeId)
  }

  // Private helper methods
  private getCurrentNode(state: ScenarioState): ScenarioNode | null {
    return this.getNode(state.scenarioId, state.currentNodeId)
  }

  private getNode(scenarioId: string, nodeId: string): ScenarioNode | null {
    // This would typically fetch from a scenario store or database
    // For now, we'll return null and let the calling code handle it
    return null
  }

  private getVitalDelta(scenarioId: string, vitalName: string, minutes: number): number {
    // This would fetch from the scenario's vitalsDeltaPerMinute
    // For now, return a simple drift calculation
    const baseDrift = {
      'Heart Rate': -0.5, // Slightly decreasing over time
      'Blood Pressure': 0.2, // Slightly increasing
      'Temperature': 0.1, // Slightly increasing
      'Respiratory Rate': -0.3, // Slightly decreasing
      'Oxygen Saturation': -0.1, // Slightly decreasing
    }
    
    return (baseDrift[vitalName as keyof typeof baseDrift] || 0) * minutes
  }

  private calculateTrend(oldValue: number, newValue: number, currentTrend: string): 'stable' | 'improving' | 'deteriorating' {
    const change = newValue - oldValue
    const threshold = 0.1 // 10% change threshold
    
    if (Math.abs(change) < threshold) return 'stable'
    
    // For vitals, "improving" means moving toward normal range
    // This is a simplified calculation - in reality, it would depend on the vital type
    if (change > 0) return 'deteriorating'
    return 'improving'
  }

  private applyVitalsChange(vitals: Vital[], changes: Partial<VitalDelta>): Vital[] {
    return vitals.map(vital => {
      const change = changes[vital.name]
      if (!change) return vital

      const newValue = Math.max(0, vital.value + (change.perMinute * 0.1)) // Apply over 0.1 minutes
      
      return {
        ...vital,
        value: newValue,
        trend: change.trend
      }
    })
  }

  private calculateNodeScore(node: ScenarioNode): number {
    // Base score for correct choices
    const baseScore = 10
    
    // Bonus for difficult scenarios
    const difficultyMultiplier = {
      'beginner': 1.0,
      'intermediate': 1.2,
      'advanced': 1.5
    }
    
    return baseScore * (difficultyMultiplier[node.type as keyof typeof difficultyMultiplier] || 1.0)
  }

  private getTotalPossibleScore(scenarioId: string): number {
    // This would calculate based on the scenario's total possible points
    // For now, return a default value
    return 100
  }

  private calculateTimeBonus(state: ScenarioState): number {
    // Bonus for completing quickly, penalty for taking too long
    const optimalTime = 15 // minutes
    const timeRatio = state.timeElapsed / optimalTime
    
    if (timeRatio <= 1) {
      return 5 // 5 point bonus for completing on time
    } else if (timeRatio <= 1.5) {
      return 0 // No bonus or penalty
    } else {
      return -Math.min(10, (timeRatio - 1.5) * 10) // Penalty for taking too long
    }
  }
}

// Export singleton instance
export const scenarioEngine = new ScenarioEngine()

// Export convenience functions
export const startScenario = (scenario: Scenario) => scenarioEngine.startScenario(scenario)
export const applyDelay = (state: ScenarioState, minutes: number) => scenarioEngine.applyDelay(state, minutes)
export const choose = (state: ScenarioState, optionId: string) => scenarioEngine.choose(state, optionId)
export const isTerminal = (state: ScenarioState) => scenarioEngine.isTerminal(state)
export const calculateScore = (state: ScenarioState) => scenarioEngine.calculateScore(state)
