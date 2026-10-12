'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Scenario, ScenarioQuestion, StudentAnswer } from '@/types'
import { 
  HeartIcon, 
  UserIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { OrderQuestion } from '@/components/learning/OrderQuestion'
import { Confetti } from '@/components/ui/Confetti'
import { gradeScenario, GradingResult } from '@/lib/learning/grade'
import { useLearningNavigation, ScenarioState } from '@/lib/learning/nav'

interface ScenarioViewerProps {
  scenario: Scenario
  onComplete: (answers: StudentAnswer[], score: number, timeSpent: number) => void
  onExit: () => void
}

export function ScenarioViewer({ scenario, onComplete, onExit }: ScenarioViewerProps) {
  const router = useRouter()
  const navigation = useLearningNavigation()
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<StudentAnswer[]>([])
  const [startTime] = useState(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [showRationale, setShowRationale] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null)

  const questions: ScenarioQuestion[] = Array.isArray(scenario.content.questions) ? scenario.content.questions : []
  const totalQuestions = questions.length
  const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
  const safeIndex = totalQuestions > 0 ? clamp(currentQuestionIndex, 0, totalQuestions - 1) : 0
  const q = questions[safeIndex] as ScenarioQuestion | undefined
  const isLastQuestion = totalQuestions > 0 && safeIndex === totalQuestions - 1
  const isFirstQuestion = currentQuestionIndex === 0

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = navigation.loadScenarioProgress(scenario.id)
    if (savedProgress) {
      const idx = clamp(savedProgress.currentQuestionIndex, 0, Math.max(0, totalQuestions - 1))
      setCurrentQuestionIndex(idx)
      setAnswers(savedProgress.answers)
    }
  }, [scenario.id, navigation, totalQuestions])

  // Save progress whenever state changes
  useEffect(() => {
    const currentState: ScenarioState = {
      scenarioId: scenario.id,
      currentQuestionIndex,
      answers,
      startTime,
      isCompleted: false
    }
    navigation.saveScenarioProgress(scenario.id, currentState)
  }, [currentQuestionIndex, answers, scenario.id, startTime, navigation])

  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestionIndex])

  const handleAnswer = (answer: string | string[]) => {
    
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    if (!q) return
    const isCorrect = Array.isArray(answer) 
      ? JSON.stringify(answer.sort()) === JSON.stringify(Array.isArray(q.correct_answer) ? q.correct_answer.sort() : [q.correct_answer])
      : answer === q.correct_answer

    const studentAnswer: StudentAnswer = {
      question_id: q.id,
      answer,
      is_correct: isCorrect,
      time_spent: timeSpent,
      attempted_at: new Date().toISOString()
    }

    setAnswers(prev => [...prev, studentAnswer])
    setShowRationale(true)
  }

  const handleNext = () => {
    if (totalQuestions === 0) return
    if (isLastQuestion) {
      const totalTime = Math.floor((Date.now() - startTime) / 1000 / 60) // in minutes
      
      // Grade the scenario using the new grading system
      const result = gradeScenario(questions, answers)
      setGradingResult(result)
      
      // Call the original onComplete callback
      onComplete(answers, result.percentage, totalTime)
      
      // Show confetti if perfect score after a brief delay
      if (result.isPerfect) {
        setTimeout(() => {
          setShowConfetti(true)
        }, 500)
      }
      
      // Navigate to scenario library after a delay
      setTimeout(() => {
        navigation.handleScenarioCompletion(scenario.id, answers, result.percentage, totalTime)
      }, 2000)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowRationale(false)
    }
  }

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1)
      setShowRationale(false)
    }
  }

  const handleExit = () => {
    const currentState: ScenarioState = {
      scenarioId: scenario.id,
      currentQuestionIndex,
      answers,
      startTime,
      isCompleted: false
    }
    navigation.handleScenarioExit(scenario.id, currentState)
    onExit()
  }

  const getAnswerForCurrentQuestion = () => {
    if (!q) return undefined
    return answers.find(a => a.question_id === q.id)
  }

  const renderQuestion = () => {
    if (!q) return null
    
    const currentAnswer = getAnswerForCurrentQuestion()

    switch (q.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {q.options?.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => !currentAnswer && handleAnswer(option)}
                disabled={!!currentAnswer}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  currentAnswer
                    ? currentAnswer.answer === option
                      ? currentAnswer.is_correct
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-red-500 bg-red-50 text-red-800'
                      : 'border-gray-200 bg-gray-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {currentAnswer && currentAnswer.answer === option && (
                    currentAnswer.is_correct ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )
                  )}
                </div>
              </button>
            ))}
          </div>
        )

      case 'priority':
        return (
          <OrderQuestion
            question={{
              ...q,
              options: q.options || [],
              correct_answer: Array.isArray(q.correct_answer) 
                ? q.correct_answer 
                : [q.correct_answer]
            }}
            onAnswer={(answer) => handleAnswer(answer)}
            currentAnswer={currentAnswer ? {
              answer: Array.isArray(currentAnswer.answer) ? currentAnswer.answer : [currentAnswer.answer],
              is_correct: currentAnswer.is_correct
            } : undefined}
            disabled={!!currentAnswer}
          />
        )

      case 'text':
        return (
          <textarea
            placeholder="Enter your answer..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            onChange={(e) => {
              if (!currentAnswer) {
                handleAnswer(e.target.value)
              }
            }}
            disabled={!!currentAnswer}
          />
        )

      default:
        return <div>Question type not supported</div>
    }
  }

  if (totalQuestions === 0) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No questions available</h2>
        <p className="text-gray-600">This scenario doesn't have any questions.</p>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Confetti Animation */}
      <Confetti 
        active={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{scenario.title}</h1>
              <p className="text-sm text-gray-600">Question {safeIndex + 1} of {totalQuestions}</p>
            </div>
            <button
              onClick={handleExit}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            >
              Exit Scenario
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalQuestions ? (((safeIndex + 1) / totalQuestions) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Information */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-100 rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Patient Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-slate-900">{scenario.content.patient_info.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-800">
                    {scenario.content.patient_info.age} year old {scenario.content.patient_info.gender}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-slate-900 mb-2">Vital Signs</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-slate-800">
                    <div>BP: {scenario.content.vital_signs.blood_pressure.systolic}/{scenario.content.vital_signs.blood_pressure.diastolic}</div>
                    <div>HR: {scenario.content.vital_signs.heart_rate} bpm</div>
                    <div>RR: {scenario.content.vital_signs.respiratory_rate}</div>
                    <div>O2: {scenario.content.vital_signs.oxygen_saturation}%</div>
                    <div>Temp: {scenario.content.vital_signs.temperature}°F</div>
                    <div>Pain: {scenario.content.vital_signs.pain_level}/10</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-slate-900 mb-2">Allergies</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-800">
                    {scenario.content.patient_info.allergies.length > 0 
                      ? scenario.content.patient_info.allergies.join(', ')
                      : 'No known allergies'
                    }
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-slate-900 mb-2">Current Medications</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-800">
                    {scenario.content.patient_info.medications.length > 0 
                      ? scenario.content.patient_info.medications.join(', ')
                      : 'None'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {q?.category}
                  </span>
                  <span className="text-sm text-gray-500">
                  {q?.points} points
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {q?.question}
                </h2>
              </div>

              {renderQuestion()}

              {showRationale && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                  <p className="text-blue-800">{q?.explanation}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={isFirstQuestion}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                  aria-label={isFirstQuestion ? "No previous question" : "Go to previous question"}
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  disabled={!getAnswerForCurrentQuestion()}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label={isLastQuestion ? "Complete scenario" : "Go to next question"}
                >
                  {isLastQuestion ? 'Complete Scenario' : 'Next'}
                  {!isLastQuestion && <ArrowRightIcon className="w-4 h-4 ml-2" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
