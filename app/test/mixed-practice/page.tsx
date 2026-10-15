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
  Shuffle
} from 'lucide-react'

// Mock mixed practice data - questions from different categories
const mixedPracticeData = {
  scenarios: [
    {
      id: 'mixed-1',
      title: 'Mixed Practice Session',
      setting: 'Various Clinical Settings',
      chiefComplaint: 'Multiple clinical scenarios for comprehensive practice',
      presentingSymptoms: ['Various symptoms across different systems'],
      history: 'This is a mixed practice session combining questions from different clinical areas.',
      patientInfo: {
        name: 'Practice Patient',
        age: 45,
        gender: 'female',
        allergies: ['None known'],
        medications: ['Various as needed'],
        medicalHistory: ['Multiple conditions for practice']
      },
      vitalSigns: {
        heartRate: 80,
        bloodPressure: { systolic: 120, diastolic: 80 },
        temperature: 98.6,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        painLevel: 3
      },
      labResults: {
        'Various Labs': { value: 'Normal', unit: 'range', normal: true, critical: false }
      },
      urgency: 'routine'
    }
  ],
  questions: [
    {
      id: 'mixed-q1',
      type: 'multiple_choice',
      question: 'A 65-year-old patient presents with chest pain. What is the first priority nursing intervention?',
      options: [
        { id: 'a', text: 'Administer pain medication' },
        { id: 'b', text: 'Obtain a 12-lead ECG' },
        { id: 'c', text: 'Check blood pressure' },
        { id: 'd', text: 'Start IV access' }
      ],
      correctAnswers: ['b'],
      explanation: 'The first priority is to obtain a 12-lead ECG to assess for cardiac ischemia or infarction.',
      rationale: {
        hint: 'Think about the ABCs of emergency care and cardiac assessment priorities.',
        full: 'In cardiac emergencies, the 12-lead ECG is the gold standard for immediate assessment of cardiac ischemia. This should be obtained within 10 minutes of arrival for patients with chest pain.'
      },
      points: 15
    },
    {
      id: 'mixed-q2',
      type: 'multi_select',
      question: 'Which of the following are signs of respiratory distress? (Select all that apply)',
      options: [
        { id: 'a', text: 'Tachypnea' },
        { id: 'b', text: 'Cyanosis' },
        { id: 'c', text: 'Use of accessory muscles' },
        { id: 'd', text: 'Bradycardia' }
      ],
      correctAnswers: ['a', 'b', 'c'],
      explanation: 'Tachypnea, cyanosis, and use of accessory muscles are all signs of respiratory distress.',
      rationale: {
        hint: 'Consider what the body does when it cannot get enough oxygen.',
        full: 'Respiratory distress manifests as increased respiratory rate (tachypnea), decreased oxygen saturation (cyanosis), and compensatory use of accessory muscles. Bradycardia would indicate a different problem.'
      },
      points: 20
    },
    {
      id: 'mixed-q3',
      type: 'multiple_choice',
      question: 'A patient with diabetes has a blood glucose level of 45 mg/dL. What is the appropriate immediate intervention?',
      options: [
        { id: 'a', text: 'Administer insulin' },
        { id: 'b', text: 'Give 15g of fast-acting carbohydrate' },
        { id: 'c', text: 'Check blood pressure' },
        { id: 'd', text: 'Start IV fluids' }
      ],
      correctAnswers: ['b'],
      explanation: 'A blood glucose of 45 mg/dL indicates hypoglycemia. The immediate intervention is to give fast-acting carbohydrate.',
      rationale: {
        hint: 'Remember the "Rule of 15" for hypoglycemia treatment.',
        full: 'The Rule of 15 states: give 15g of fast-acting carbohydrate, wait 15 minutes, then recheck blood glucose. If still low, repeat the process.'
      },
      points: 18
    }
  ]
}

export default function MixedPracticePage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set())
  const [showResults, setShowResults] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [startTime] = useState(Date.now())

  const { scenarios, questions } = mixedPracticeData
  const currentScenario = scenarios[0]
  
  const totalQuestions = questions.length
  const answeredQuestions = Object.keys(answers).length
  const isComplete = answeredQuestions === totalQuestions

  // Create swipe items combining scenarios and questions
  const swipeItems: SwipeItem[] = [
    // Scenario card
    {
      id: `scenario-${currentScenario?.id}`,
      isBookmarked: bookmarkedItems.has(`scenario-${currentScenario?.id}`),
      title: currentScenario?.title || '',
      content: currentScenario ? <ScenarioCard scenario={currentScenario as any} /> : <div>No scenario available</div>,
      metadata: {
        category: 'Mixed Practice',
        estimatedTime: '2 min read'
      }
    },
    // Question cards
    ...questions.map((question, index) => ({
      id: question.id,
      title: `Question ${index + 1}`,
      content: (
        <AnswerBlock
        submittedAnswer={answers[question.id]}
          question={question as any}
          onAnswer={(userAnswers) => {
            setAnswers(prev => ({
              ...prev,
              [question.id]: userAnswers
            }))
            
            // Auto-advance to next question or results
            if (index === questions.length - 1) {
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
        difficulty: 'intermediate' as const,
        category: 'Mixed Practice',
        estimatedTime: '3-5 min'
      }
    }))
  ]

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
    
    questions.forEach(question => {
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

  if (showResults) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shuffle className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Mixed Practice Complete!
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Great job completing the mixed practice session
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
            }}
            className="flex items-center space-x-2"
          >
            <Shuffle className="w-4 h-4" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
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
              <Shuffle className="w-6 h-6 text-primary" />
              <span>Mixed Practice</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Questions from different clinical areas
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
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
