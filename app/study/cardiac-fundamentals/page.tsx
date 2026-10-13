'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Clock, 
  BookOpen,
  Heart,
  Activity,
  Zap
} from 'lucide-react'

const lessons = [
  {
    id: 'lesson-1',
    title: 'Cardiac Anatomy and Physiology',
    description: 'Understanding the structure and function of the heart',
    duration: '8 min',
    type: 'video',
    completed: true,
    content: 'Learn about the four chambers of the heart, blood flow, and cardiac cycle.'
  },
  {
    id: 'lesson-2',
    title: 'ECG Basics and Interpretation',
    description: 'Reading and interpreting electrocardiograms',
    duration: '12 min',
    type: 'interactive',
    completed: true,
    content: 'Master the fundamentals of ECG interpretation including normal sinus rhythm and common abnormalities.'
  },
  {
    id: 'lesson-3',
    title: 'Cardiac Assessment Techniques',
    description: 'Physical examination and assessment skills',
    duration: '10 min',
    type: 'video',
    completed: false,
    content: 'Learn proper techniques for cardiac auscultation, palpation, and assessment.'
  },
  {
    id: 'lesson-4',
    title: 'Common Cardiac Conditions',
    description: 'Recognition and management of cardiac disorders',
    duration: '15 min',
    type: 'interactive',
    completed: false,
    content: 'Study myocardial infarction, heart failure, arrhythmias, and other common conditions.'
  },
  {
    id: 'lesson-5',
    title: 'Emergency Cardiac Protocols',
    description: 'Critical interventions for cardiac emergencies',
    duration: '18 min',
    type: 'simulation',
    completed: false,
    content: 'Practice emergency protocols for cardiac arrest, acute MI, and other critical situations.'
  },
  {
    id: 'lesson-6',
    title: 'Cardiac Medications',
    description: 'Understanding cardiac pharmacology',
    duration: '12 min',
    type: 'interactive',
    completed: false,
    content: 'Learn about antiarrhythmics, antihypertensives, and other cardiac medications.'
  }
]

export default function CardiacFundamentalsPage() {
  const router = useRouter()
  const [courseLessons, setCourseLessons] = useState(lessons)
  const [currentLesson, setCurrentLesson] = useState(lessons[2]) // Start with first incomplete lesson
  const [showLesson, setShowLesson] = useState(false)

  const completedLessons = courseLessons.filter(lesson => lesson.completed).length
  const progress = (completedLessons / lessons.length) * 100

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />
      case 'interactive': return <Activity className="w-4 h-4" />
      case 'simulation': return <Zap className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-blue-100 text-blue-800'
      case 'interactive': return 'bg-purple-100 text-purple-800'
      case 'simulation': return 'bg-orange-100 text-orange-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  if (showLesson) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <p role="status" className="mb-4 text-sm text-slate-600">Lesson completion applies only to this visit.</p>
        <div className="mb-6">
          <Button 
            variant="outline"
            onClick={() => setShowLesson(false)}
            className="flex items-center space-x-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course</span>
          </Button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentLesson?.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {currentLesson?.description}
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {getTypeIcon(currentLesson?.type || '')}
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {currentLesson?.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {currentLesson?.content}
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{currentLesson?.duration}</span>
                </span>
                <Badge className={getTypeColor(currentLesson?.type || '')}>
                  {currentLesson?.type}
                </Badge>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                Lesson Content
              </h3>
              <div className="space-y-3">
                <p className="text-slate-700 dark:text-slate-300">
                  This lesson covers the essential concepts and skills needed to master {currentLesson?.title?.toLowerCase()}. 
                  You&apos;ll learn through interactive content, videos, and practical exercises.
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  Take your time to understand each concept before moving on to the next lesson. 
                  The knowledge you gain here will be essential for your clinical practice.
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline"
                onClick={() => setShowLesson(false)}
              >
                Back to Course
              </Button>
              <Button 
                onClick={() => {
                  // Mark lesson as completed
                  const updatedLessons = courseLessons.map(lesson => 
                    lesson.id === currentLesson?.id ? { ...lesson, completed: true } : lesson
                  )
                  setCourseLessons(updatedLessons)
                  // Find next incomplete lesson
                  const nextLesson = updatedLessons.find(lesson => !lesson.completed)
                  if (nextLesson) {
                    setCurrentLesson(nextLesson)
                  } else {
                    setShowLesson(false)
                  }
                }}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Complete</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline"
            onClick={() => router.push('/study')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Study</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-600" />
              <span>Cardiac Assessment Fundamentals</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Master the basics of cardiac assessment and care
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <ProgressRing 
            progress={progress} 
            size={80} 
            strokeWidth={6}
            label="Progress"
          />
        </div>
      </div>

      {/* Course Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Course Overview</CardTitle>
          <CardDescription>
            Learn the fundamentals of cardiac assessment through interactive lessons and practical exercises
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {lessons.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total Lessons
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                75 min
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total Duration
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {completedLessons}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Completed
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Lessons
        </h2>
        {courseLessons.map((lesson, index) => (
          <Card 
            key={lesson.id} 
            className={`hover:shadow-md transition-all duration-200 cursor-pointer ${
              lesson.completed ? 'border-success/20 bg-success/5' : ''
            }`}
            onClick={() => {
              setCurrentLesson(lesson)
              setShowLesson(true)
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {lesson.completed ? (
                      <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-success" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          {index + 1}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {lesson.title}
                      </h3>
                      <Badge className={getTypeColor(lesson.type)}>
                        {getTypeIcon(lesson.type)}
                        <span className="ml-1 capitalize">{lesson.type}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {lesson.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{lesson.duration}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); setCurrentLesson(lesson); setShowLesson(true) }}>
                    {lesson.completed ? 'Review' : 'Start'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
