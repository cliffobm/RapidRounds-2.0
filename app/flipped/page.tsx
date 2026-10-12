'use client'

import { useState } from 'react'
import { LessonCard, Lesson } from '@/components/flipped/LessonCard'
import { Checkpoint, CheckpointData } from '@/components/flipped/Checkpoint'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Confetti } from '@/components/ui/Confetti'
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Target, 
  Star,
  TrendingUp,
  Award,
  CheckCircle,
  Play,
  Filter
} from 'lucide-react'

// Mock lesson data
const mockLessons: Lesson[] = [
  {
    id: 'cardiac-fundamentals',
    title: 'Cardiac Assessment Fundamentals',
    description: 'Master the essentials of cardiac assessment, ECG interpretation, and emergency protocols for comprehensive patient care.',
    type: 'video',
    duration: 45,
    difficulty: 'beginner',
    prerequisites: [],
    isCompleted: false,
    isLocked: false,
    progress: 0,
    rating: 4.8,
    enrollmentCount: 1250,
    instructor: {
      name: 'Dr. Sarah Chen, RN',
      credentials: 'MSN, CCRN',
    },
    learningObjectives: [
      'Perform systematic cardiac assessment using inspection, palpation, and auscultation',
      'Interpret basic ECG rhythms and identify common arrhythmias',
      'Recognize signs and symptoms of cardiac emergencies',
      'Apply evidence-based interventions for cardiac patients'
    ],
    tags: ['cardiac', 'assessment', 'ECG', 'emergency']
  },
  {
    id: 'respiratory-care',
    title: 'Respiratory Care Essentials',
    description: 'Comprehensive guide to respiratory assessment, oxygen therapy, and ventilator management in clinical practice.',
    type: 'interactive',
    duration: 60,
    difficulty: 'intermediate',
    prerequisites: ['cardiac-fundamentals'],
    isCompleted: true,
    isLocked: false,
    progress: 100,
    rating: 4.9,
    enrollmentCount: 980,
    instructor: {
      name: 'Prof. Michael Torres, RRT',
      credentials: 'PhD, RRT-ACCS',
    },
    learningObjectives: [
      'Assess respiratory function using various techniques and tools',
      'Select appropriate oxygen therapy modalities for different conditions',
      'Monitor patients on mechanical ventilation safely',
      'Recognize and respond to respiratory emergencies'
    ],
    tags: ['respiratory', 'oxygen', 'ventilator', 'assessment']
  },
  {
    id: 'medication-safety',
    title: 'Medication Administration Safety',
    description: 'Critical safety protocols for medication administration, dosage calculations, and error prevention strategies.',
    type: 'assessment',
    duration: 35,
    difficulty: 'advanced',
    prerequisites: ['cardiac-fundamentals', 'respiratory-care'],
    isCompleted: false,
    isLocked: false,
    progress: 60,
    rating: 4.7,
    enrollmentCount: 1100,
    instructor: {
      name: 'Dr. Lisa Rodriguez, PharmD',
      credentials: 'PharmD, BCPS',
    },
    learningObjectives: [
      'Apply the five rights of medication administration consistently',
      'Calculate medication dosages accurately using various methods',
      'Implement error prevention strategies in medication management',
      'Recognize and manage adverse drug reactions'
    ],
    tags: ['medication', 'safety', 'dosage', 'prevention']
  },
  {
    id: 'wound-care-advanced',
    title: 'Advanced Wound Care Management',
    description: 'Evidence-based wound assessment, treatment planning, and healing promotion techniques for complex wounds.',
    type: 'reading',
    duration: 50,
    difficulty: 'intermediate',
    prerequisites: ['cardiac-fundamentals'],
    isCompleted: false,
    isLocked: true,
    progress: 0,
    rating: 4.6,
    enrollmentCount: 750,
    instructor: {
      name: 'Dr. Jennifer Kim, CWON',
      credentials: 'MSN, CWON, CFCN',
    },
    learningObjectives: [
      'Assess wound characteristics using standardized tools',
      'Develop evidence-based wound care plans',
      'Select appropriate dressings for different wound types',
      'Monitor wound healing progress and adjust treatment'
    ],
    tags: ['wound', 'healing', 'assessment', 'treatment']
  }
]

// Mock checkpoint data
const mockCheckpoint: CheckpointData = {
  id: 'cardiac-checkpoint-1',
  title: 'Cardiac Assessment Checkpoint',
  description: 'Test your understanding of cardiac assessment fundamentals before proceeding to advanced topics.',
  questions: [
    {
      id: 'q1',
      question: 'What is the normal range for adult heart rate at rest?',
      type: 'multiple_choice',
      options: ['40-60 bpm', '60-100 bpm', '80-120 bpm', '100-140 bpm'],
      correctAnswer: '60-100 bpm',
      explanation: 'The normal resting heart rate for adults is 60-100 beats per minute. Rates below 60 are bradycardia, and rates above 100 are tachycardia.',
      points: 10,
      difficulty: 'easy'
    },
    {
      id: 'q2',
      question: 'The best location to assess the apical pulse is:',
      type: 'multiple_choice',
      options: [
        'Second intercostal space, right sternal border',
        'Fifth intercostal space, left midclavicular line',
        'Fourth intercostal space, left sternal border',
        'Third intercostal space, right midclavicular line'
      ],
      correctAnswer: 'Fifth intercostal space, left midclavicular line',
      explanation: 'The apical pulse is best assessed at the point of maximal impulse (PMI), which is typically located at the fifth intercostal space at the left midclavicular line.',
      points: 15,
      difficulty: 'medium'
    },
    {
      id: 'q3',
      question: 'Chest pain that worsens with inspiration is most likely:',
      type: 'true_false',
      correctAnswer: 'True',
      explanation: 'Pleuritic chest pain, which worsens with inspiration, is typically associated with pleural inflammation rather than cardiac causes.',
      points: 10,
      difficulty: 'medium'
    }
  ],
  passingScore: 80,
  timeLimit: 10,
  maxAttempts: 3,
  learningObjective: 'Demonstrate understanding of basic cardiac assessment principles'
}

export default function FlippedPage() {
  const [lessons, setLessons] = useState(mockLessons)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [showCheckpoint, setShowCheckpoint] = useState(false)
  const [checkpointAttempts, setCheckpointAttempts] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'video' | 'interactive' | 'reading' | 'assessment'>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  const handleStartLesson = (lesson: Lesson) => {
    if (lesson.isLocked) return
    setSelectedLesson(lesson)
  }

  const handleContinueLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
  }

  const handleCompleteLesson = (lessonId: string) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === lessonId 
        ? { ...lesson, progress: 100, isCompleted: true }
        : lesson
    ))
    setSelectedLesson(null)
    setShowConfetti(true)
    
    // Unlock dependent lessons
    setLessons(prev => prev.map(lesson => {
      if (lesson.prerequisites?.includes(lessonId)) {
        return { ...lesson, isLocked: false }
      }
      return lesson
    }))
  }

  const handleCheckpointComplete = (score: number, passed: boolean, answers: Record<string, string>) => {
    console.log('Checkpoint completed:', { score, passed, answers })
    if (passed) {
      setShowConfetti(true)
      // Unlock next lessons or scenarios
    }
    setShowCheckpoint(false)
  }

  const handleCheckpointRetry = () => {
    setCheckpointAttempts(prev => prev + 1)
    // Reset checkpoint state for retry
  }

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    if (filterType !== 'all' && lesson.type !== filterType) return false
    if (filterDifficulty !== 'all' && lesson.difficulty !== filterDifficulty) return false
    return true
  })

  // Calculate statistics
  const totalLessons = lessons.length
  const completedLessons = lessons.filter(l => l.isCompleted).length
  const inProgressLessons = lessons.filter(l => l.progress > 0 && !l.isCompleted).length
  const totalStudyTime = lessons.reduce((acc, lesson) => acc + lesson.duration, 0)
  const completedStudyTime = lessons.filter(l => l.isCompleted).reduce((acc, lesson) => acc + lesson.duration, 0)

  if (showCheckpoint) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
        <Checkpoint
          checkpoint={mockCheckpoint}
          onComplete={handleCheckpointComplete}
          onRetry={handleCheckpointRetry}
          attemptCount={checkpointAttempts}
        />
      </div>
    )
  }

  if (selectedLesson) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
        
        {/* Lesson Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedLesson(null)}
            className="mb-4"
          >
            ← Back to Lessons
          </Button>
          
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8 rounded-2xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant="outline">{selectedLesson.type}</Badge>
                  <Badge variant={
                    selectedLesson.difficulty === 'beginner' ? 'success' :
                    selectedLesson.difficulty === 'intermediate' ? 'warning' : 'danger'
                  }>
                    {selectedLesson.difficulty}
                  </Badge>
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    {selectedLesson.duration}m
                  </Badge>
                </div>
                
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  {selectedLesson.title}
                </h1>
                
                <p className="text-slate-700 dark:text-slate-300 mb-6">
                  {selectedLesson.description}
                </p>
                
                <div className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <span>{selectedLesson.rating} rating</span>
                  </span>
                  <span>{selectedLesson.enrollmentCount?.toLocaleString()} enrolled</span>
                  <span>By {selectedLesson.instructor?.name}</span>
                </div>
              </div>
              
              <ProgressRing 
                progress={selectedLesson.progress} 
                size={100} 
                strokeWidth={8}
                label="Progress"
              />
            </div>
          </div>
        </div>

        {/* Lesson Content Placeholder */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Lesson Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Play className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Interactive Lesson Content
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                This would contain the actual lesson content - videos, interactive modules, readings, etc.
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => handleCompleteLesson(selectedLesson.id)}>
                  Mark as Complete
                </Button>
                <Button variant="outline" onClick={() => setShowCheckpoint(true)}>
                  Take Checkpoint
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Objectives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Learning Objectives</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {selectedLesson.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-accent/10 rounded-2xl">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Flipped Classroom
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Master fundamentals through interactive micro-lessons (5–10 min each)
            </p>
          </div>
        </div>
      </div>

      {/* Progress Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {completedLessons}/{totalLessons}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Lessons Completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Play className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {inProgressLessons}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {completedStudyTime}m
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Study Time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {Math.round((completedLessons / totalLessons) * 100)}%
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-slate-500" />
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Type:</span>
              <div className="flex space-x-2">
                {['all', 'video', 'interactive', 'reading', 'assessment'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type as any)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Level:</span>
              <div className="flex space-x-2">
                {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={filterDifficulty === difficulty ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterDifficulty(difficulty as any)}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Lesson */}
      {filteredLessons.length > 0 && filteredLessons[0] && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Featured Lesson
          </h2>
          <LessonCard
            lesson={filteredLessons[0]}
            onStart={handleStartLesson}
            onContinue={handleContinueLesson}
            variant="featured"
            className="mb-6"
          />
        </div>
      )}

      {/* All Lessons */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          All Lessons ({filteredLessons.length})
        </h2>
        <div className="space-y-4">
          {filteredLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onStart={handleStartLesson}
              onContinue={handleContinueLesson}
              variant="compact"
            />
          ))}
        </div>
      </div>

      {/* Checkpoint CTA */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <Award className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Ready for a Checkpoint?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Test your knowledge and unlock advanced scenarios
          </p>
          <Button onClick={() => setShowCheckpoint(true)}>
            Take Checkpoint Assessment
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
