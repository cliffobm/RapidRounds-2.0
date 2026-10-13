import type { Question } from '@/components/scenario/AnswerBlock'

export function isQuestionAnswerCorrect(question: Pick<Question, 'type' | 'correctAnswers'>, answers: string[]): boolean {
  const correct = question.correctAnswers
  if (!correct?.length || answers.length !== correct.length) return false
  if (question.type === 'drag_to_order') return answers.every((answer, index) => answer === correct[index])
  // Compare copies: never mutate a submitted sequence or the source answer key.
  return JSON.stringify([...answers].sort()) === JSON.stringify([...correct].sort())
}
