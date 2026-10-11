'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SwipeDeck, SwipeItem } from '@/components/scenario/SwipeDeck'
import { ScenarioCard, ScenarioData } from '@/components/scenario/ScenarioCard'
import { AnswerBlock, Question } from '@/components/scenario/AnswerBlock'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Confetti } from '@/components/ui/Confetti'
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  Target,
  CheckCircle,
  Brain,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

// Adaptive testing algorithm - adjusts difficulty based on performance
const adaptiveQuestions = [
  // Easy questions
  {
    id: 'adaptive-easy-1',
    type: 'multiple_choice',
    question: 'What is the normal range for adult heart rate?',
    options: [
      { id: 'a', text: '60-100 bpm' },
      { id: 'b', text: '40-60 bpm' },
      { id: 'c', text: '100-120 bpm' },
      { id: 'd', text: '120-140 bpm' }
    ],
    correctAnswers: ['a'],
    explanation: 'The normal adult heart rate is 60-100 beats per minute.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 'adaptive-easy-2',
    type: 'multiple_choice',
    question: 'Which vital sign is most important to monitor in a patient with chest pain?',
    options: [
      { id: 'a', text: 'Temperature' },
      { id: 'b', text: 'Blood pressure' },
      { id: 'c', text: 'Heart rate' },
      { id: 'd', text: 'All of the above' }
    ],
    correctAnswers: ['d'],
    explanation: 'All vital signs are important, but blood pressure and heart rate are particularly critical in cardiac assessment.',
    difficulty: 'easy',
    points: 10
  },
  // Medium questions
  {
    id: 'adaptive-medium-1',
    type: 'multiple_choice',
    question: 'A patient presents with acute shortness of breath and chest pain. The ECG shows ST elevation in leads II, III, and aVF. What is the most likely diagnosis?',
    options: [
      { id: 'a', text: 'Anterior MI' },
      { id: 'b', text: 'Inferior MI' },
      { id: 'c', text: 'Lateral MI' },
      { id: 'd', text: 'Pericarditis' }
    ],
    correctAnswers: ['b'],
    explanation: 'ST elevation in leads II, III, and aVF indicates an inferior myocardial infarction.',
    difficulty: 'medium',
    points: 20
  },
  {
    id: 'adaptive-medium-2',
    type: 'multi_select',
    question: 'Which of the following are contraindications for thrombolytic therapy? (Select all that apply)',
    options: [
      { id: 'a', text: 'Active bleeding' },
      { id: 'b', text: 'Recent surgery' },
      { id: 'c', text: 'Hypertension >180/110' },
      { id: 'd', text: 'Age >75 years' }
    ],
    correctAnswers: ['a', 'b', 'c'],
    explanation: 'Active bleeding, recent surgery, and severe hypertension are contraindications for thrombolytics.',
    difficulty: 'medium',
    points: 25
  },
  // Hard questions
  {
    id: 'adaptive-hard-1',
    type: 'multiple_choice',
    question: 'A 72-year-old patient with a history of atrial fibrillation presents with acute stroke symptoms. The last known normal was 2.5 hours ago. What is the most appropriate immediate intervention?',
    options: [
      { id: 'a', text: 'Administer tPA immediately' },
      { id: 'b', text: 'Obtain CT scan first' },
      { id: 'c', text: 'Check INR and platelet count' },
      { id: 'd', text: 'Start anticoagulation therapy' }
    ],
    correctAnswers: ['b'],
    explanation: 'CT scan must be obtained first to rule out hemorrhage before considering thrombolytic therapy.',
    difficulty: 'hard',
    points: 30
  },
  {
    id: 'adaptive-hard-2',
    type: 'multiple_choice',
    question: 'A patient with septic shock has a MAP of 55 mmHg despite fluid resuscitation. The patient is on norepinephrine 0.1 mcg/kg/min. What is the next appropriate step?',
    options: [
      { id: 'a', text: 'Increase norepinephrine dose' },
      { id: 'b', text: 'Add vasopressin' },
      { id: 'c', text: 'Add dobutamine' },
      { id: 'd', text: 'Start hydrocortisone' }
    ],
    correctAnswers: ['b'],
    explanation: 'Vasopressin should be added as a second-line vasopressor in septic shock when norepinephrine alone is insufficient.',
    difficulty: 'hard',
    points: 35
  }
]

export default function AdaptiveTestPage() {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set())
  const [showResults, setShowResults] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [startTime] = useState(Date.now())
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [performanceHistory, setPerformanceHistory] = useState<boolean[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])

  // Initialize with easy questions
  useEffect(() => {
    const easyQuestions = adaptiveQuestions.filter(q => q.difficulty === 'easy')
    setSelectedQuestions(easyQuestions.slice(0, 2) as Question[])
  }, [])

  const totalQuestions = selectedQuestions.length
  const answeredQuestions = Object.keys(answers).length
  const isComplete = answeredQuestions === totalQuestions

  // Adaptive algorithm
  const adjustDifficulty = (isCorrect: boolean) => {
    setPerformanceHistory(prev => [...prev, isCorrect])
    
    const recentPerformance = performanceHistory.slice(-3) // Last 3 answers
    const correctCount = recentPerformance.filter(Boolean).length
    
    if (correctCount >= 2 && currentDifficulty === 'easy') {
      setCurrentDifficulty('medium')
      const mediumQuestions = adaptiveQuestions.filter(q => q.difficulty === 'medium')
      setSelectedQuestions(prev => [...prev, ...mediumQuestions.slice(0, 2) as Question[]])
    } else if (correctCount >= 2 && currentDifficulty === 'medium') {
      setCurrentDifficulty('hard')
      const hardQuestions = adaptiveQuestions.filter(q => q.difficulty === 'hard')
      setSelectedQuestions(prev => [...prev, ...hardQuestions.slice(0, 2) as Question[]])
    } else if (correctCount <= 1 && currentDifficulty === 'hard') {
      setCurrentDifficulty('medium')
    } else if (correctCount <= 1 && currentDifficulty === 'medium') {
      setCurrentDifficulty('easy')
    }
  }

  // Create swipe items
  const swipeItems: SwipeItem[] = selectedQuestions.map((question, index) => ({
    id: question.id,
    title: `Question ${index + 1}`,
    content: (
      <AnswerBlock
        question={question}
        onAnswer={(userAnswers) => {
          setAnswers(prev => ({
            ...prev,
            [question.id]: userAnswers
          }))
          
          // Check if answer is correct
          const isCorrect = question.correctAnswers?.every(correct => userAnswers.includes(correct)) &&
                           userAnswers.every(answer => question.correctAnswers?.includes(answer))
          
          adjustDifficulty(isCorrect || false)
          
          // Auto-advance to next question or results
          if (index === selectedQuestions.length - 1) {
            setShowResults(true)
            setShowConfetti(true)
          }
        }}
        showRationale={!!answers[question.id]}
        userTier="trial"
        rationaleCount={0}
        maxFreeRationales={5}
      />
    ),
    isBookmarked: bookmarkedItems.has(question.id),
    metadata: {
      difficulty: currentDifficulty === 'easy' ? 'beginner' : currentDifficulty === 'medium' ? 'intermediate' : 'advanced',
      category: 'Adaptive Test',
      estimatedTime: '3-5 min'
    }
  }))

  const handleSwipeLeft = (item: SwipeItem, index: number) => {
    console.log('Swiped left (next):', item.title)
  }

  const handleSwipeRight = (item: SwipeItem, index: number) => {
    const itemId = item.id
    setBookmarkedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const calculateScore = () => {
    let totalPoints = 0
    let earnedPoints = 0
    
    selectedQuestions.forEach(question => {
      totalPoints += question.points
      const userAnswers = answers[question.id] || []
      const isCorrect = question.correctAnswers?.every(correct => userAnswers.includes(correct)) &&
                       userAnswers.every(answer => question.correctAnswers?.includes(answer))
      
      if (isCorrect) {
        earnedPoints += question.points
      }
    })
    
    return { earnedPoints, totalPoints, percentage: Math.round((earnedPoints / totalPoints) * 100) }
  }

  const { earnedPoints, totalPoints, percentage } = calculateScore()
  const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60) // minutes

  const getDifficultyIcon = () => {
    switch (currentDifficulty) {
      case 'easy': return <TrendingUp className="w-4 h-4 text-success" />
      case 'medium': return <Target className="w-4 h-4 text-warning" />
      case 'hard': return <TrendingDown className="w-4 h-4 text-danger" />
    }
  }

  const getDifficultyColor = () => {
    switch (currentDifficulty) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'danger'
    }
  }

  if (showResults) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Adaptive Test Complete!
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Your performance determined the difficulty level
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm text-center">
            <Trophy className="w-8 h-8 text-warning mx-auto mb-3" />
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {percentage}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Overall Score
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm text-center">
            <Target className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {earnedPoints}/{totalPoints}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Points Earned
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm text-center">
            <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {timeSpent}m
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Time Spent
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Button 
            variant="outline"
            onClick={() => router.push('/test')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Categories</span>
          </Button>
          <Button 
            onClick={() => {
              setShowResults(false)
              setAnswers({})
              setBookmarkedItems(new Set())
              setCurrentDifficulty('easy')
              setPerformanceHistory([])
              const easyQuestions = adaptiveQuestions.filter(q => q.difficulty === 'easy')
              setSelectedQuestions(easyQuestions.slice(0, 2) as Question[])
            }}
            className="flex items-center space-x-2"
          >
            <Brain className="w-4 h-4" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline"
            onClick={() => router.push('/test')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Brain className="w-6 h-6 text-primary" />
              <span>Adaptive Test</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Difficulty adjusts based on your performance
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant={getDifficultyColor() as any} className="flex items-center space-x-1">
            {getDifficultyIcon()}
            <span className="capitalize">{currentDifficulty}</span>
          </Badge>
          <Badge variant="outline">
            {answeredQuestions}/{totalQuestions} completed
          </Badge>
          <Badge variant="secondary">
            {timeSpent}m elapsed
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Progress
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {Math.round((answeredQuestions / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Swipe Deck */}
      <SwipeDeck
        items={swipeItems}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        showHints={true}
      />
    </div>
  )
}
