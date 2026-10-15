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
  Bandage,
  Eye,
  Shield,
  Activity
} from 'lucide-react'

const lessons = [
  {
    id: 'lesson-1',
    title: 'Wound Assessment Fundamentals',
    description: 'Learn systematic wound assessment techniques and documentation',
    duration: '12 min',
    type: 'video',
    completed: false,
    content: 'Master the essential skills of wound assessment including measurement, tissue evaluation, and proper documentation techniques.'
  },
  {
    id: 'lesson-2',
    title: 'Wound Classification and Staging',
    description: 'Understand different wound types and pressure injury staging',
    duration: '15 min',
    type: 'interactive',
    completed: false,
    content: 'Learn to classify wounds by etiology and properly stage pressure injuries using current NPUAP guidelines.'
  },
  {
    id: 'lesson-3',
    title: 'Wound Cleansing and Irrigation',
    description: 'Proper techniques for wound cleansing and irrigation',
    duration: '10 min',
    type: 'video',
    completed: false,
    content: 'Learn evidence-based wound cleansing techniques, irrigation methods, and appropriate solution selection.'
  },
  {
    id: 'lesson-4',
    title: 'Dressing Selection and Application',
    description: 'Choose appropriate dressings based on wound characteristics',
    duration: '18 min',
    type: 'interactive',
    completed: false,
    content: 'Master the art and science of dressing selection based on wound type, exudate level, and healing phase.'
  },
  {
    id: 'lesson-5',
    title: 'Infection Prevention and Control',
    description: 'Recognize and prevent wound infections',
    duration: '14 min',
    type: 'case-study',
    completed: false,
    content: 'Learn to identify signs of wound infection and implement evidence-based infection prevention strategies.'
  },
  {
    id: 'lesson-6',
    title: 'Advanced Wound Therapies',
    description: 'Explore negative pressure therapy and advanced treatments',
    duration: '16 min',
    type: 'video',
    completed: false,
    content: 'Understand advanced wound therapies including NPWT, biological dressings, and adjuvant therapies.'
  },
  {
    id: 'lesson-7',
    title: 'Patient Education and Discharge Planning',
    description: 'Educate patients and families on wound care at home',
    duration: '12 min',
    type: 'interactive',
    completed: false,
    content: 'Develop skills in patient education, family teaching, and coordinating discharge planning for optimal wound healing.'
  }
]

export default function WoundCarePage() {
  const router = useRouter()
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [currentLesson, setCurrentLesson] = useState<any>(null)

  const progress = Math.round((completedLessons.size / lessons.length) * 100)

  const handleStartLesson = (lesson: any) => {
    setCurrentLesson(lesson)
  }

  const handleCompleteLesson = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]))
    setCurrentLesson(null)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Play
      case 'interactive': return Activity
      case 'case-study': return BookOpen
      default: return BookOpen
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-blue-100 text-blue-800'
      case 'interactive': return 'bg-purple-100 text-purple-800'
      case 'case-study': return 'bg-orange-100 text-orange-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  if (currentLesson) {
    const TypeIcon = getTypeIcon(currentLesson.type)
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <p role="status" className="mb-4 text-sm text-slate-600">Lesson completion applies only to this visit.</p>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline"
            onClick={() => setCurrentLesson(null)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lessons</span>
          </Button>
        </div>

        {/* Lesson Content */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-green-50">
                  <TypeIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{currentLesson.title}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {currentLesson.description}
                  </CardDescription>
                </div>
              </div>
              <Badge className={getTypeColor(currentLesson.type)}>
                {currentLesson.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-center space-x-4 text-sm text-slate-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{currentLesson.duration}</span>
                </div>
              </div>
              
              {/* Lesson Content */}
              <div className="prose max-w-none">
                <p className="text-slate-700 leading-relaxed mb-6">
                  {currentLesson.content}
                </p>

                {/* Interactive Content Based on Lesson */}
                {currentLesson.id === 'lesson-1' && (
                  <div className="bg-blue-50 p-6 rounded-lg mb-6">
                    <h4 className="font-semibold text-blue-900 mb-3">Key Assessment Parameters</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-blue-800">Wound Measurements</h5>
                        <ul className="text-blue-700 space-y-1 mt-1">
                          <li>• Length × Width × Depth</li>
                          <li>• Undermining and tunneling</li>
                          <li>• Wound area calculation</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-800">Tissue Assessment</h5>
                        <ul className="text-blue-700 space-y-1 mt-1">
                          <li>• Tissue types and percentages</li>
                          <li>• Wound bed preparation</li>
                          <li>• Periwound skin condition</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {currentLesson.id === 'lesson-2' && (
                  <div className="bg-purple-50 p-6 rounded-lg mb-6">
                    <h4 className="font-semibold text-purple-900 mb-3">Pressure Injury Staging</h4>
                    <div className="space-y-3 text-sm">
                      <div className="border-l-4 border-purple-400 pl-3">
                        <strong>Stage 1:</strong> Non-blanchable erythema of intact skin
                      </div>
                      <div className="border-l-4 border-purple-400 pl-3">
                        <strong>Stage 2:</strong> Partial-thickness skin loss with exposed dermis
                      </div>
                      <div className="border-l-4 border-purple-400 pl-3">
                        <strong>Stage 3:</strong> Full-thickness skin loss
                      </div>
                      <div className="border-l-4 border-purple-400 pl-3">
                        <strong>Stage 4:</strong> Full-thickness skin and tissue loss
                      </div>
                    </div>
                  </div>
                )}

                {currentLesson.id === 'lesson-4' && (
                  <div className="bg-orange-50 p-6 rounded-lg mb-6">
                    <h4 className="font-semibold text-orange-900 mb-3">Dressing Selection Guide</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-orange-800">Dry Wounds</h5>
                        <p className="text-orange-700">Hydrogels, hydrocolloids</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-orange-800">Heavily Exudating</h5>
                        <p className="text-orange-700">Foams, alginates, superabsorbents</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-orange-800">Infected Wounds</h5>
                        <p className="text-orange-700">Silver dressings, antimicrobial options</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-orange-800">Granulating Wounds</h5>
                        <p className="text-orange-700">Non-adherent, maintain moisture</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline"
                onClick={() => setCurrentLesson(null)}
              >
                Back to Lessons
              </Button>
              <Button 
                onClick={() => handleCompleteLesson(currentLesson.id)}
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
              <Bandage className="w-6 h-6 text-green-600" />
              <span>Advanced Wound Care</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Comprehensive wound assessment, treatment planning, and healing promotion
            </p>
          </div>
        </div>
        
        {/* Progress */}
        <div className="flex items-center space-x-4">
          <ProgressRing 
            progress={progress} 
            size={60} 
            strokeWidth={4}
            showLabel={true}
          />
          <div className="text-right">
            <p className="text-sm text-slate-600">Progress</p>
            <p className="text-lg font-semibold">{completedLessons.size}/{lessons.length} lessons</p>
          </div>
        </div>
      </div>

      {/* Course Overview */}
      <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900">Assessment Skills</h3>
              <p className="text-sm text-slate-600">Master systematic wound evaluation</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900">Evidence-Based Care</h3>
              <p className="text-sm text-slate-600">Learn current best practices</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900">Clinical Application</h3>
              <p className="text-sm text-slate-600">Apply knowledge in practice</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lessons.map((lesson, index) => {
          const isCompleted = completedLessons.has(lesson.id)
          const TypeIcon = getTypeIcon(lesson.type)
          
          return (
            <Card 
              key={lesson.id} 
              className={`hover:shadow-md transition-all duration-200 ${
                isCompleted ? 'bg-green-50 border-green-200' : ''
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">
                        {lesson.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {lesson.description}
                      </CardDescription>
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.duration}</span>
                    </div>
                    <Badge size="sm" className={getTypeColor(lesson.type)}>
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {lesson.type}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant={isCompleted ? "outline" : "default"}
                    onClick={() => handleStartLesson(lesson)}
                  >
                    {isCompleted ? 'Review' : 'Start'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Completion Message */}
      {completedLessons.size === lessons.length && (
        <Card className="mt-8 bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Congratulations!</h3>
            <p>You&apos;ve completed the Advanced Wound Care course. You&apos;re now equipped with essential wound care knowledge and skills.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
