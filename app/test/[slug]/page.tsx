'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SwipeDeck, SwipeItem } from '@/components/scenario/SwipeDeck'
import { ScenarioCard, ScenarioData } from '@/components/scenario/ScenarioCard'
import { AnswerBlock, Question } from '@/components/scenario/AnswerBlock'
import { isQuestionAnswerCorrect } from '@/lib/question-answer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Confetti } from '@/components/ui/Confetti'
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  Target,
  CheckCircle
} from 'lucide-react'

// Mock data for demonstration
const mockScenarios: Record<string, { scenarios: ScenarioData[], questions: Question[] }> = {
  cardiac: {
    scenarios: [
      {
        id: 'cardiac-1',
        title: 'Acute Chest Pain Assessment',
        setting: 'Emergency Department',
        chiefComplaint: 'Severe chest pain for 2 hours',
        presentingSymptoms: ['Chest pain', 'Shortness of breath', 'Nausea', 'Diaphoresis'],
        history: 'Patient reports crushing chest pain that started 2 hours ago while at rest.',
        patientInfo: {
          name: 'John Martinez',
          age: 58,
          gender: 'male',
          allergies: ['Penicillin'],
          medications: ['Lisinopril 10mg daily', 'Metformin 500mg BID'],
          medicalHistory: ['Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia']
        },
        vitalSigns: {
          heartRate: 110,
          bloodPressure: { systolic: 160, diastolic: 95 },
          temperature: 98.6,
          respiratoryRate: 22,
          oxygenSaturation: 94,
          painLevel: 8
        },
        labResults: {
          'Troponin I': { value: 2.5, unit: 'ng/mL', normal: false, critical: true },
          'CK-MB': { value: 15, unit: 'ng/mL', normal: false },
          'BNP': { value: 450, unit: 'pg/mL', normal: false }
        },
        urgency: 'critical' as const
      }
    ],
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'Based on the patient presentation and lab results, what is the most likely diagnosis?',
        options: [
          { id: 'a', text: 'Gastroesophageal reflux disease (GERD)' },
          { id: 'b', text: 'ST-elevation myocardial infarction (STEMI)' },
          { id: 'c', text: 'Panic attack' },
          { id: 'd', text: 'Pulmonary embolism' }
        ],
        correctAnswers: ['b'],
        explanation: 'The combination of severe chest pain, elevated troponin levels, and clinical presentation strongly suggests STEMI.',
        rationale: {
          hint: 'Consider the elevated cardiac biomarkers and the nature of the chest pain.',
          full: 'The patient presents with classic symptoms of acute coronary syndrome. The elevated troponin I (2.5 ng/mL) is significantly above normal (<0.04 ng/mL) and indicates myocardial injury. Combined with the crushing chest pain at rest, diaphoresis, and associated symptoms, this strongly suggests ST-elevation myocardial infarction requiring immediate intervention.'
        },
        points: 10
      },
      {
        id: 'q2',
        type: 'multi_select',
        question: 'Which immediate nursing interventions are appropriate for this patient?',
        options: [
          { id: 'a', text: 'Administer oxygen therapy' },
          { id: 'b', text: 'Obtain 12-lead ECG immediately' },
          { id: 'c', text: 'Administer sublingual nitroglycerin' },
          { id: 'd', text: 'Prepare for discharge planning' },
          { id: 'e', text: 'Start IV access for medication administration' }
        ],
        correctAnswers: ['a', 'b', 'c', 'e'],
        explanation: 'Multiple immediate interventions are needed for suspected STEMI.',
        rationale: {
          hint: 'Think about the ABCs and immediate cardiac interventions.',
          full: 'For suspected STEMI, immediate priorities include: oxygen therapy to improve oxygenation (especially with O2 sat of 94%), 12-lead ECG to confirm diagnosis and guide treatment, sublingual nitroglycerin for symptom relief and coronary vasodilation, and IV access for emergency medications. Discharge planning is inappropriate for an acute cardiac event.'
        },
        points: 15
      },
      {
        id: 'q3',
        type: 'drag_to_order',
        question: 'Arrange these interventions in order of priority (first to last):',
        options: [
          { id: 'a', text: 'Call cardiology for emergency consultation' },
          { id: 'b', text: 'Perform initial assessment and obtain vital signs' },
          { id: 'c', text: 'Administer aspirin and prepare for catheterization' },
          { id: 'd', text: 'Obtain 12-lead ECG and laboratory studies' }
        ],
        correctAnswers: ['b', 'd', 'c', 'a'],
        explanation: 'Proper prioritization follows assessment, diagnosis, treatment, then consultation.',
        rationale: {
          hint: 'Follow the nursing process and emergency protocols.',
          full: 'Priority order follows emergency protocols: 1) Initial assessment establishes baseline and identifies immediate threats, 2) ECG and labs provide diagnostic information, 3) Treatment with aspirin and cath lab preparation addresses the underlying problem, 4) Cardiology consultation coordinates ongoing care.'
        },
        points: 20
      }
    ]
  },
  respiratory: {
    scenarios: [
      {
        id: 'respiratory-1',
        title: 'Acute Respiratory Distress',
        setting: 'Medical-Surgical Unit',
        chiefComplaint: 'Difficulty breathing and cough',
        presentingSymptoms: ['Dyspnea', 'Productive cough', 'Chest tightness', 'Wheezing'],
        history: 'Patient with COPD exacerbation, increased shortness of breath over 3 days.',
        patientInfo: {
          name: 'Mary Johnson',
          age: 67,
          gender: 'female',
          allergies: ['Sulfa drugs'],
          medications: ['Albuterol inhaler', 'Prednisone 20mg daily'],
          medicalHistory: ['COPD', 'Hypertension', 'Former smoker (40 pack-years)']
        },
        vitalSigns: {
          heartRate: 105,
          bloodPressure: { systolic: 145, diastolic: 88 },
          temperature: 100.2,
          respiratoryRate: 28,
          oxygenSaturation: 88,
          painLevel: 4
        },
        labResults: {
          'ABG pH': { value: 7.32, unit: '', normal: false },
          'PaCO2': { value: 58, unit: 'mmHg', normal: false },
          'PaO2': { value: 65, unit: 'mmHg', normal: false }
        },
        urgency: 'high' as const
      }
    ],
    questions: [
      {
        id: 'resp-q1',
        type: 'multiple_choice',
        question: 'What is the priority intervention for this patient?',
        options: [
          { id: 'a', text: 'Administer high-flow oxygen at 15L/min' },
          { id: 'b', text: 'Give nebulized albuterol treatment' },
          { id: 'c', text: 'Position patient in high Fowler\'s position' },
          { id: 'd', text: 'Prepare for intubation' }
        ],
        correctAnswers: ['c'],
        explanation: 'Positioning helps maximize lung expansion and reduces work of breathing.',
        rationale: {
          hint: 'Consider immediate interventions that don\'t require equipment.',
          full: 'High Fowler\'s position (90-degree upright) is the immediate priority as it maximizes lung expansion, reduces work of breathing, and improves ventilation-perfusion matching. While oxygen and bronchodilators are important, positioning is the first intervention that can be implemented immediately.'
        },
        points: 15
      }
    ]
  },
  neurological: {
    scenarios: [
      {
        id: 'neuro-1',
        title: 'Acute Stroke Assessment',
        setting: 'Emergency Department',
        chiefComplaint: 'Sudden weakness and speech difficulty',
        presentingSymptoms: ['Right-sided weakness', 'Slurred speech', 'Facial drooping', 'Confusion'],
        history: 'Patient found by family with sudden onset neurological symptoms 2 hours ago.',
        patientInfo: {
          name: 'Robert Chen',
          age: 72,
          gender: 'male',
          allergies: ['None known'],
          medications: ['Warfarin 5mg daily', 'Metoprolol 50mg BID'],
          medicalHistory: ['Atrial fibrillation', 'Hypertension', 'Diabetes Type 2']
        },
        vitalSigns: {
          heartRate: 88,
          bloodPressure: { systolic: 185, diastolic: 95 },
          temperature: 98.4,
          respiratoryRate: 18,
          oxygenSaturation: 96,
          painLevel: 2
        },
        labResults: {
          'INR': { value: 2.8, unit: '', normal: true },
          'Glucose': { value: 180, unit: 'mg/dL', normal: false },
          'CT Head': { value: 'No acute hemorrhage', unit: '', normal: true }
        },
        urgency: 'critical' as const
      }
    ],
    questions: [
      {
        id: 'neuro-q1',
        type: 'multiple_choice',
        question: 'What is the most appropriate immediate assessment tool for this patient?',
        options: [
          { id: 'a', text: 'Glasgow Coma Scale' },
          { id: 'b', text: 'NIH Stroke Scale (NIHSS)' },
          { id: 'c', text: 'Mini-Mental State Exam' },
          { id: 'd', text: 'Braden Scale' }
        ],
        correctAnswers: ['b'],
        explanation: 'The NIH Stroke Scale is the standard assessment tool for stroke patients.',
        rationale: {
          hint: 'Consider stroke-specific assessment tools.',
          full: 'The NIH Stroke Scale (NIHSS) is the gold standard for assessing stroke severity and neurological deficits. It provides objective, quantifiable measurements of neurological function and helps guide treatment decisions, including thrombolytic therapy eligibility.'
        },
        points: 20
      }
    ]
  },
  musculoskeletal: {
    scenarios: [
      {
        id: 'musculo-1',
        title: 'Hip Fracture Post-Op Care',
        setting: 'Orthopedic Unit',
        chiefComplaint: 'Post-operative hip fracture repair',
        presentingSymptoms: ['Hip pain', 'Limited mobility', 'Surgical site discomfort'],
        history: 'Patient underwent hip fracture repair yesterday after fall at home.',
        patientInfo: {
          name: 'Eleanor Davis',
          age: 78,
          gender: 'female',
          allergies: ['Codeine'],
          medications: ['Acetaminophen 650mg q6h', 'Enoxaparin 40mg daily'],
          medicalHistory: ['Osteoporosis', 'Hypertension', 'Osteoarthritis']
        },
        vitalSigns: {
          heartRate: 78,
          bloodPressure: { systolic: 135, diastolic: 82 },
          temperature: 99.1,
          respiratoryRate: 16,
          oxygenSaturation: 95,
          painLevel: 6
        },
        labResults: {
          'Hemoglobin': { value: 9.2, unit: 'g/dL', normal: false },
          'Hematocrit': { value: 28, unit: '%', normal: false }
        },
        urgency: 'low' as const
      }
    ],
    questions: [
      {
        id: 'musculo-q1',
        type: 'multiple_choice',
        question: 'What is the priority concern for this post-operative patient?',
        options: [
          { id: 'a', text: 'Risk for infection' },
          { id: 'b', text: 'Risk for deep vein thrombosis' },
          { id: 'c', text: 'Risk for falls' },
          { id: 'd', text: 'Risk for constipation' }
        ],
        correctAnswers: ['b'],
        explanation: 'Hip fracture patients are at very high risk for DVT due to immobility and surgery.',
        rationale: {
          hint: 'Consider complications specific to orthopedic surgery and immobility.',
          full: 'Hip fracture patients have the highest risk for venous thromboembolism due to the combination of trauma, surgery, immobility, and advanced age. The patient is appropriately on enoxaparin prophylaxis, but DVT prevention remains the priority concern.'
        },
        points: 15
      }
    ]
  },
  renal: {
    scenarios: [
      {
        id: 'renal-1',
        title: 'Acute Kidney Injury',
        setting: 'Intensive Care Unit',
        chiefComplaint: 'Decreased urine output and confusion',
        presentingSymptoms: ['Oliguria', 'Confusion', 'Nausea', 'Fatigue'],
        history: 'Patient developed decreased urine output after major surgery 2 days ago.',
        patientInfo: {
          name: 'Michael Torres',
          age: 65,
          gender: 'male',
          allergies: ['Iodine'],
          medications: ['Furosemide 40mg BID', 'Lisinopril 10mg daily'],
          medicalHistory: ['Chronic kidney disease Stage 3', 'Diabetes', 'Hypertension']
        },
        vitalSigns: {
          heartRate: 95,
          bloodPressure: { systolic: 165, diastolic: 92 },
          temperature: 98.8,
          respiratoryRate: 20,
          oxygenSaturation: 94,
          painLevel: 3
        },
        labResults: {
          'Creatinine': { value: 3.2, unit: 'mg/dL', normal: false, critical: true },
          'BUN': { value: 68, unit: 'mg/dL', normal: false },
          'Potassium': { value: 5.8, unit: 'mEq/L', normal: false, critical: true }
        },
        urgency: 'high' as const
      }
    ],
    questions: [
      {
        id: 'renal-q1',
        type: 'multiple_choice',
        question: 'What is the most concerning laboratory value requiring immediate intervention?',
        options: [
          { id: 'a', text: 'Elevated creatinine' },
          { id: 'b', text: 'Elevated BUN' },
          { id: 'c', text: 'Hyperkalemia' },
          { id: 'd', text: 'All values are equally concerning' }
        ],
        correctAnswers: ['c'],
        explanation: 'Hyperkalemia poses immediate risk of cardiac arrhythmias.',
        rationale: {
          hint: 'Consider which lab value poses the most immediate life-threatening risk.',
          full: 'Hyperkalemia (K+ 5.8 mEq/L) is the most immediately life-threatening finding as it can cause fatal cardiac arrhythmias. While elevated creatinine and BUN indicate kidney dysfunction, hyperkalemia requires urgent treatment with calcium gluconate, insulin/glucose, or dialysis.'
        },
        points: 20
      }
    ]
  },
  integumentary: {
    scenarios: [
      {
        id: 'integument-1',
        title: 'Pressure Injury Assessment',
        setting: 'Long-term Care Facility',
        chiefComplaint: 'Skin breakdown on sacrum',
        presentingSymptoms: ['Stage 3 pressure injury', 'Pain with movement', 'Drainage from wound'],
        history: 'Bedridden patient developed pressure injury over past 2 weeks despite turning schedule.',
        patientInfo: {
          name: 'Dorothy Wilson',
          age: 84,
          gender: 'female',
          allergies: ['Latex'],
          medications: ['Multivitamin daily', 'Docusate 100mg BID'],
          medicalHistory: ['Dementia', 'Immobility', 'Malnutrition', 'Incontinence']
        },
        vitalSigns: {
          heartRate: 72,
          bloodPressure: { systolic: 128, diastolic: 75 },
          temperature: 99.8,
          respiratoryRate: 16,
          oxygenSaturation: 96,
          painLevel: 5
        },
        labResults: {
          'Albumin': { value: 2.8, unit: 'g/dL', normal: false },
          'Prealbumin': { value: 12, unit: 'mg/dL', normal: false }
        },
        urgency: 'low' as const
      }
    ],
    questions: [
      {
        id: 'integument-q1',
        type: 'multiple_choice',
        question: 'What is the most important factor contributing to poor wound healing in this patient?',
        options: [
          { id: 'a', text: 'Advanced age' },
          { id: 'b', text: 'Malnutrition' },
          { id: 'c', text: 'Immobility' },
          { id: 'd', text: 'Incontinence' }
        ],
        correctAnswers: ['b'],
        explanation: 'Malnutrition severely impairs wound healing by reducing protein synthesis.',
        rationale: {
          hint: 'Look at the laboratory values and consider wound healing requirements.',
          full: 'Low albumin (2.8 g/dL, normal 3.5-5.0) and prealbumin (12 mg/dL, normal 15-40) indicate protein-energy malnutrition. Adequate protein is essential for wound healing, collagen synthesis, and immune function. While age, immobility, and incontinence contribute to pressure injury development, malnutrition is the primary barrier to healing.'
        },
        points: 15
      }
    ]
  }
}

export default function TestCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set())
  const [showResults, setShowResults] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [startTime] = useState(Date.now())

  const categoryData = mockScenarios[slug]
  
  useEffect(() => {
    if (!categoryData) {
      router.push('/test')
    }
  }, [categoryData, router])

  if (!categoryData) {
    return <div>Loading...</div>
  }

  const { scenarios, questions } = categoryData
  const currentScenario = scenarios[currentScenarioIndex]
  const currentQuestion = questions[currentQuestionIndex]
  
  const totalQuestions = questions.length
  const answeredQuestions = Object.keys(answers).length
  const isComplete = answeredQuestions === totalQuestions

  // Create swipe items combining scenarios and questions
  const swipeItems: SwipeItem[] = currentScenario ? [
    // Scenario card
    {
      id: `scenario-${currentScenario.id}`,
      title: currentScenario.title,
      content: <ScenarioCard scenario={currentScenario} />,
      metadata: {
        category: 'Patient Information',
        estimatedTime: '2 min read'
      }
    },
    // Question cards
    ...questions.map((question, index) => ({
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
            
            // Auto-advance to next question or results
            if (index === questions.length - 1) {
              setShowResults(true)
              setShowConfetti(true)
            }
          }}
          showRationale={!!answers[question.id]}
          userTier="trial" // Mock user tier
          rationaleCount={0}
          maxFreeRationales={5}
        />
      ),
      isBookmarked: bookmarkedItems.has(question.id),
      metadata: {
        difficulty: 'intermediate' as const,
        category: 'Clinical Question',
        estimatedTime: '3-5 min'
      }
    }))
  ] : []

  const handleSwipeLeft = (item: SwipeItem, index: number) => {
    // Handle next item logic
    console.log('Swiped left (next):', item.title)
  }

  const handleSwipeRight = (item: SwipeItem, index: number) => {
    // Handle bookmark logic
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
      // Ordering questions require the exact sequence, not just the same items.
      if (isQuestionAnswerCorrect(question, userAnswers)) {
        earnedPoints += question.points
      }
    })

    return {
      score: Math.round((earnedPoints / totalPoints) * 100),
      earnedPoints,
      totalPoints
    }
  }

  const { score, earnedPoints, totalPoints } = calculateScore()
  const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60) // minutes

  if (showResults) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
        
        {/* Results Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-4">
            <Trophy className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Scenario Complete!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Great work on completing the {currentScenario?.title || 'scenario'}
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-gradient-to-r from-success/5 to-primary/5 p-8 rounded-2xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {score}%
              </div>
              <p className="text-slate-600 dark:text-slate-400">Final Score</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {earnedPoints}/{totalPoints}
              </div>
              <p className="text-slate-600 dark:text-slate-400">Points Earned</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {timeSpent}m
              </div>
              <p className="text-slate-600 dark:text-slate-400">Time Spent</p>
            </div>
          </div>
        </div>

        {/* Performance Badges */}
        <div className="flex justify-center space-x-4 mb-8">
          {score >= 90 && (
            <Badge variant="success" className="px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              Excellent Performance
            </Badge>
          )}
          {score >= 80 && score < 90 && (
            <Badge variant="warning" className="px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              Good Performance
            </Badge>
          )}
          {timeSpent <= 10 && (
            <Badge variant="secondary" className="px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              Quick Completion
            </Badge>
          )}
          {bookmarkedItems.size > 0 && (
            <Badge variant="outline" className="px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              {bookmarkedItems.size} Bookmarked
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/test')}
          >
            Try Another Scenario
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              // Reset state for retry
              setAnswers({})
              setBookmarkedItems(new Set())
              setShowResults(false)
              setShowConfetti(false)
            }}
          >
            Retry This Scenario
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/study')}
          >
            Study Materials
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/test')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Categories</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentScenario?.title || 'Scenario'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {answeredQuestions} of {totalQuestions} questions completed
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-slate-600 dark:text-slate-400">Time Elapsed</p>
            <p className="font-semibold text-slate-900 dark:text-white">
              {Math.round((Date.now() - startTime) / 1000 / 60)}m
            </p>
          </div>
        </div>
      </div>

      {/* Swipe Deck */}
      <SwipeDeck
        items={swipeItems}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        className="mb-8"
      />
    </div>
  )
}
