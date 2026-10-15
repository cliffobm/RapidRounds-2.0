import { ScenarioQuestion, StudentAnswer } from '@/types'

export interface GradingResult {
  score: number
  maxScore: number
  percentage: number
  isPerfect: boolean
  correctAnswers: number
  totalQuestions: number
}

/**
 * Grade a single question answer
 */
export function gradeQuestion(
  question: ScenarioQuestion,
  answer: string | string[]
): boolean {
  if (question.type === 'priority') {
    // For priority questions, compare the order of items
    const correctAnswer = Array.isArray(question.correct_answer) 
      ? question.correct_answer 
      : [question.correct_answer]
    
    return JSON.stringify(answer) === JSON.stringify(correctAnswer)
  }
  
  if (Array.isArray(answer)) {
    const correctAnswer = Array.isArray(question.correct_answer) 
      ? question.correct_answer 
      : [question.correct_answer]
    
    // Sort both arrays for comparison (for multiple choice questions)
    return JSON.stringify(answer.sort()) === JSON.stringify(correctAnswer.sort())
  }
  
  return answer === question.correct_answer
}

/**
 * Calculate the score for a single question
 */
export function calculateQuestionScore(
  question: ScenarioQuestion,
  answer: string | string[],
  timeSpent: number
): number {
  const isCorrect = gradeQuestion(question, answer)
  
  if (!isCorrect) {
    return 0
  }
  
  // Base score from question points
  let score = question.points
  
  // Time bonus for quick answers (within 30 seconds)
  if (timeSpent <= 30) {
    score = Math.round(score * 1.1) // 10% bonus
  }
  
  // Time penalty for very slow answers (over 5 minutes)
  if (timeSpent > 300) {
    score = Math.round(score * 0.8) // 20% penalty
  }
  
  return score
}

/**
 * Grade a complete scenario
 */
export function gradeScenario(
  questions: ScenarioQuestion[],
  answers: StudentAnswer[]
): GradingResult {
  let totalScore = 0
  let maxScore = 0
  let correctAnswers = 0
  
  questions.forEach(question => {
    maxScore += question.points
    
    const answer = answers.find(a => a.question_id === question.id)
    if (answer) {
      const isCorrect = gradeQuestion(question, answer.answer)
      if (isCorrect) {
        correctAnswers++
        totalScore += calculateQuestionScore(question, answer.answer, answer.time_spent)
      }
    }
  })
  
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  const isPerfect = correctAnswers === questions.length && percentage >= 95
  
  return {
    score: totalScore,
    maxScore,
    percentage,
    isPerfect,
    correctAnswers,
    totalQuestions: questions.length
  }
}

/**
 * Get grade letter based on percentage
 */
export function getGradeLetter(percentage: number): string {
  if (percentage >= 95) return 'A+'
  if (percentage >= 90) return 'A'
  if (percentage >= 85) return 'B+'
  if (percentage >= 80) return 'B'
  if (percentage >= 75) return 'C+'
  if (percentage >= 70) return 'C'
  if (percentage >= 65) return 'D+'
  if (percentage >= 60) return 'D'
  return 'F'
}

/**
 * Get performance feedback based on score
 */
export function getPerformanceFeedback(result: GradingResult): string {
  if (result.isPerfect) {
    return "Excellent work! You demonstrated mastery of all concepts."
  }
  
  if (result.percentage >= 90) {
    return "Great job! You have a strong understanding of the material."
  }
  
  if (result.percentage >= 80) {
    return "Good work! You understand most concepts well."
  }
  
  if (result.percentage >= 70) {
    return "Not bad! Consider reviewing the areas you missed."
  }
  
  if (result.percentage >= 60) {
    return "You're on the right track, but more study is needed."
  }
  
  return "Consider reviewing the material and trying again."
}

/**
 * Calculate time-based score adjustments
 */
export function calculateTimeAdjustment(
  totalTimeSpent: number, // in minutes
  estimatedDuration: number // in minutes
): number {
  const timeRatio = totalTimeSpent / estimatedDuration
  
  // Bonus for completing quickly
  if (timeRatio <= 0.8) {
    return 5 // 5 point bonus
  }
  
  // Penalty for taking too long
  if (timeRatio >= 1.5) {
    return -10 // 10 point penalty
  }
  
  return 0 // No adjustment
}
