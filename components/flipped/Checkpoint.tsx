'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Lightbulb, 
  Target,
  Clock,
  RotateCcw,
  ArrowRight,
  Trophy
} from 'lucide-react'

export interface CheckpointQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'short_answer'
  options?: string[]
  correctAnswer: string | string[]
  explanation: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface CheckpointData {
  id: string
  title: string
  description: string
  questions: CheckpointQuestion[]
  passingScore: number // percentage
  timeLimit?: number // in minutes
  maxAttempts?: number
  learningObjective: string
}

interface CheckpointProps {
  checkpoint: CheckpointData
  onComplete: (score: number, passed: boolean, answers: Record<string, string>) => void
  onRetry?: () => void
  attemptCount?: number
  className?: string
}

export function Checkpoint({ 
  checkpoint, 
  onComplete, 
  onRetry,
  attemptCount = 0,
  className = '' 
}: CheckpointProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    checkpoint.timeLimit ? checkpoint.timeLimit * 60 : null
  )
  const [startTime] = useState(Date.now())

  const currentQuestion = checkpoint.questions[currentQuestionIndex]
  const totalQuestions = checkpoint.questions.length
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const hasAnswered = currentQuestion && answers[currentQuestion.id]

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || showResults) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          handleSubmitAll()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, showResults])

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmitAll()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmitAll = () => {
    const score = calculateScore()
    const passed = score >= checkpoint.passingScore
    setShowResults(true)
    onComplete(score, passed, answers)
  }

  const calculateScore = () => {
    let correctAnswers = 0
    let totalPoints = 0
    let earnedPoints = 0

    checkpoint.questions.forEach(question => {
      totalPoints += question.points
      const userAnswer = answers[question.id]
      
      if (userAnswer) {
        const isCorrect = Array.isArray(question.correctAnswer)
          ? question.correctAnswer.includes(userAnswer)
          : question.correctAnswer === userAnswer
        
        if (isCorrect) {
          correctAnswers++
          earnedPoints += question.points
        }
      }
    })

    return Math.round((earnedPoints / totalPoints) * 100)
  }

  const getQuestionStatus = (questionIndex: number) => {
    const question = checkpoint.questions[questionIndex]
    if (!question) return 'unanswered'
    
    const userAnswer = answers[question.id]
    
    if (!userAnswer) return 'unanswered'
    
    const isCorrect = Array.isArray(question.correctAnswer)
      ? question.correctAnswer.includes(userAnswer)
      : question.correctAnswer === userAnswer
    
    return isCorrect ? 'correct' : 'incorrect'
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'hard': return 'text-red-600 bg-red-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  if (showResults) {
    const score = calculateScore()
    const passed = score >= checkpoint.passingScore
    const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60)

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Results Header */}
        <Card className={`border-l-4 ${passed ? 'border-l-success bg-success/5' : 'border-l-danger bg-danger/5'}`}>
          <CardHeader className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              passed ? 'bg-success/10' : 'bg-danger/10'
            }`}>
              {passed ? (
                <Trophy className="w-8 h-8 text-success" />
              ) : (
                <XCircle className="w-8 h-8 text-danger" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {passed ? 'Checkpoint Passed!' : 'Checkpoint Not Passed'}
            </CardTitle>
            <p className={`text-lg font-semibold ${passed ? 'text-success' : 'text-danger'}`}>
              {score}% ({score >= checkpoint.passingScore ? 'Pass' : 'Fail'})
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Passing score: {checkpoint.passingScore}%
            </p>
          </CardHeader>
        </Card>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {score}%
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Score</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {timeSpent}m
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Time Spent</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {checkpoint.questions.filter((_, i) => getQuestionStatus(i) === 'correct').length}/{totalQuestions}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Correct</p>
            </CardContent>
          </Card>
        </div>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checkpoint.questions.map((question, index) => {
                const status = getQuestionStatus(index)
                const userAnswer = answers[question.id]
                
                return (
                  <div key={question.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" size="sm">
                            Question {index + 1}
                          </Badge>
                          <Badge className={getDifficultyColor(question.difficulty)} size="sm">
                            {question.difficulty}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {question.question}
                        </h4>
                      </div>
                      <div className="flex-shrink-0">
                        {status === 'correct' && <CheckCircle className="w-6 h-6 text-success" />}
                        {status === 'incorrect' && <XCircle className="w-6 h-6 text-danger" />}
                        {status === 'unanswered' && <AlertCircle className="w-6 h-6 text-warning" />}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Your answer: </span>
                        <span className={status === 'correct' ? 'text-success' : status === 'incorrect' ? 'text-danger' : 'text-slate-500'}>
                          {userAnswer || 'No answer'}
                        </span>
                      </div>
                      {status === 'incorrect' && (
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">Correct answer: </span>
                          <span className="text-success">
                            {Array.isArray(question.correctAnswer) 
                              ? question.correctAnswer.join(', ') 
                              : question.correctAnswer
                            }
                          </span>
                        </div>
                      )}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-slate-700 dark:text-slate-300">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          {!passed && onRetry && (
            checkpoint.maxAttempts === undefined || attemptCount < checkpoint.maxAttempts
          ) && (
            <Button
              variant="outline"
              onClick={onRetry}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => window.history.back()}
            className="flex items-center space-x-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Continue Learning</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-primary" />
                <span>{checkpoint.title}</span>
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {checkpoint.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentQuestionIndex + 1}/{totalQuestions}
              </div>
              {timeRemaining !== null && (
                <div className={`text-sm font-medium ${
                  timeRemaining < 300 ? 'text-danger' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {formatTime(timeRemaining)}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ProgressRing 
            progress={((currentQuestionIndex + 1) / totalQuestions) * 100} 
            size={60} 
            strokeWidth={4}
            showLabel={false}
          />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {Object.keys(answers).length} answered
            </p>
          </div>
        </div>
        
        {/* Question indicators */}
        <div className="flex space-x-1">
          {checkpoint.questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentQuestionIndex 
                  ? 'bg-primary' 
                  : answers[checkpoint.questions[index]?.id || '']
                    ? 'bg-success'
                    : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Current Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" size="sm">
                    Question {currentQuestionIndex + 1}
                  </Badge>
                  <Badge className={getDifficultyColor(currentQuestion?.difficulty || 'easy')} size="sm">
                    {currentQuestion?.difficulty}
                  </Badge>
                  <Badge variant="secondary" size="sm">
                    {currentQuestion?.points} {currentQuestion?.points === 1 ? 'point' : 'points'}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-lg">
                {currentQuestion?.question}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {currentQuestion?.type === 'multiple_choice' && currentQuestion?.options?.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion?.id || '', option)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      answers[currentQuestion?.id || ''] === option
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        answers[currentQuestion?.id] === option
                          ? 'border-primary bg-primary'
                          : 'border-slate-300'
                      }`} />
                      <span className="font-medium">{option}</span>
                    </div>
                  </motion.button>
                ))}
                
                {currentQuestion?.type === 'true_false' && (
                  <div className="grid grid-cols-2 gap-4">
                    {['True', 'False'].map((option) => (
                      <motion.button
                        key={option}
                        onClick={() => handleAnswer(currentQuestion?.id || '', option)}
                        className={`p-4 text-center rounded-xl border-2 transition-all duration-200 ${
                          answers[currentQuestion?.id] === option
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="font-medium">{option}</span>
                      </motion.button>
                    ))}
                  </div>
                )}
                
                {currentQuestion?.type === 'short_answer' && (
                  <textarea
                    value={answers[currentQuestion?.id] || ''}
                    onChange={(e) => handleAnswer(currentQuestion?.id || '', e.target.value)}
                    placeholder="Enter your answer here..."
                    className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={4}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Passing score: {checkpoint.passingScore}%
        </div>
        
        <Button
          onClick={handleNext}
          disabled={!hasAnswered}
          variant={isLastQuestion ? "success" : "primary"}
        >
          {isLastQuestion ? 'Submit Checkpoint' : 'Next Question'}
        </Button>
      </div>
    </div>
  )
}
