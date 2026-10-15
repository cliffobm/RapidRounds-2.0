'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { 
  Play, 
  Clock, 
  BookOpen, 
  Video, 
  FileText, 
  CheckCircle, 
  Lock,
  Star,
  Users,
  Award,
  TrendingUp
} from 'lucide-react'

export interface Lesson {
  id: string
  title: string
  description: string
  type: 'video' | 'reading' | 'interactive' | 'assessment'
  duration: number // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites?: string[]
  isCompleted: boolean
  isLocked: boolean
  progress: number // 0-100
  rating?: number // 1-5 stars
  enrollmentCount?: number
  lastUpdated?: string
  instructor?: {
    name: string
    avatar?: string
    credentials?: string
  }
  learningObjectives: string[]
  tags: string[]
}

interface LessonCardProps {
  lesson: Lesson
  onStart: (lesson: Lesson) => void
  onContinue: (lesson: Lesson) => void
  variant?: 'default' | 'compact' | 'featured'
  showProgress?: boolean
  className?: string
}

export function LessonCard({ 
  lesson, 
  onStart, 
  onContinue, 
  variant = 'default',
  showProgress = true,
  className = '' 
}: LessonCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video
      case 'reading': return BookOpen
      case 'interactive': return Play
      case 'assessment': return FileText
      default: return BookOpen
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800'
      case 'reading': return 'bg-blue-100 text-blue-800'
      case 'interactive': return 'bg-purple-100 text-purple-800'
      case 'assessment': return 'bg-green-100 text-green-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success'
      case 'intermediate': return 'warning'
      case 'advanced': return 'danger'
      default: return 'secondary'
    }
  }

  const TypeIcon = getTypeIcon(lesson.type)
  const hasStarted = lesson.progress > 0
  const canAccess = !lesson.isLocked

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        <Card className={`cursor-pointer transition-all duration-200 ${
          lesson.isCompleted ? 'border-success bg-success/5' : 
          lesson.isLocked ? 'border-slate-200 bg-slate-50 opacity-60' : 
          'hover:shadow-md'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {lesson.isLocked ? (
                  <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-slate-400" />
                  </div>
                ) : (
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    lesson.isCompleted ? 'bg-success/10' : 'bg-primary/10'
                  }`}>
                    {lesson.isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-success" />
                    ) : (
                      <TypeIcon className="w-6 h-6 text-primary" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className={`font-semibold truncate ${
                    lesson.isLocked ? 'text-slate-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {lesson.title}
                  </h3>
                  <Badge className={getTypeColor(lesson.type)} size="sm">
                    {lesson.type}
                  </Badge>
                </div>
                <p className={`text-sm mb-2 ${
                  lesson.isLocked ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {lesson.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{lesson.duration}m</span>
                    </span>
                    {lesson.rating && (
                      <span className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-current text-yellow-500" />
                        <span>{lesson.rating}</span>
                      </span>
                    )}
                  </div>
                  {showProgress && lesson.progress > 0 && (
                    <div className="text-xs font-medium text-primary">
                      {lesson.progress}%
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0">
                {canAccess && (
                  <Button
                    size="sm"
                    variant={lesson.isCompleted ? "outline" : "primary"}
                    onClick={() => hasStarted ? onContinue(lesson) : onStart(lesson)}
                  >
                    {lesson.isCompleted ? 'Review' : hasStarted ? 'Continue' : 'Start'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (variant === 'featured') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/80 rounded-xl">
                  <TypeIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <Badge variant="outline" className="bg-white/80 mb-2">
                    Featured Lesson
                  </Badge>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {lesson.title}
                  </h3>
                </div>
              </div>
              {showProgress && (
                <ProgressRing 
                  progress={lesson.progress} 
                  size={60} 
                  strokeWidth={4}
                  showLabel={false}
                />
              )}
            </div>
            
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              {lesson.description}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{lesson.duration} minutes</span>
              </span>
              {lesson.enrollmentCount && (
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{lesson.enrollmentCount.toLocaleString()} enrolled</span>
                </span>
              )}
              {lesson.rating && (
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-current text-yellow-500" />
                  <span>{lesson.rating} rating</span>
                </span>
              )}
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                  Learning Objectives
                </h4>
                <ul className="space-y-1">
                  {lesson.learningObjectives.slice(0, 3).map((objective, index) => (
                    <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(lesson.type)} size="sm">
                    {lesson.type}
                  </Badge>
                  <Badge variant={getDifficultyColor(lesson.difficulty) as any} size="sm">
                    {lesson.difficulty}
                  </Badge>
                </div>
                
                <Button
                  size="lg"
                  onClick={() => hasStarted ? onContinue(lesson) : onStart(lesson)}
                  disabled={lesson.isLocked}
                >
                  {lesson.isCompleted ? (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      Review
                    </>
                  ) : hasStarted ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Continue
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Learning
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className={`cursor-pointer transition-all duration-200 ${
        lesson.isCompleted ? 'border-success bg-success/5' : 
        lesson.isLocked ? 'border-slate-200 bg-slate-50 opacity-60' : 
        'hover:shadow-lg'
      }`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${
                lesson.isLocked ? 'bg-slate-200' :
                lesson.isCompleted ? 'bg-success/10' : 'bg-primary/10'
              }`}>
                {lesson.isLocked ? (
                  <Lock className="w-6 h-6 text-slate-400" />
                ) : lesson.isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : (
                  <TypeIcon className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Badge className={getTypeColor(lesson.type)} size="sm">
                    {lesson.type}
                  </Badge>
                  <Badge variant={getDifficultyColor(lesson.difficulty) as any} size="sm">
                    {lesson.difficulty}
                  </Badge>
                </div>
                <CardTitle className={`text-lg ${
                  lesson.isLocked ? 'text-slate-400' : ''
                }`}>
                  {lesson.title}
                </CardTitle>
              </div>
            </div>
            
            {showProgress && lesson.progress > 0 && (
              <ProgressRing 
                progress={lesson.progress} 
                size={50} 
                strokeWidth={4}
                showLabel={false}
              />
            )}
          </div>
          
          <CardDescription className={lesson.isLocked ? 'text-slate-400' : ''}>
            {lesson.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Prerequisites */}
            {lesson.prerequisites && lesson.prerequisites.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Prerequisites:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {lesson.prerequisites.map((prereq, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {prereq}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Learning Objectives */}
            {lesson.learningObjectives.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      You&apos;ll Learn:
                </h4>
                <ul className="space-y-1">
                  {lesson.learningObjectives.slice(0, 2).map((objective, index) => (
                    <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 text-success mt-1 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Metadata */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration}m</span>
                </span>
                {lesson.rating && (
                  <span className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <span>{lesson.rating}</span>
                  </span>
                )}
                {lesson.enrollmentCount && (
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{lesson.enrollmentCount}</span>
                  </span>
                )}
              </div>
              
              {canAccess && (
                <Button
                  onClick={() => hasStarted ? onContinue(lesson) : onStart(lesson)}
                  disabled={lesson.isLocked}
                  variant={lesson.isCompleted ? "outline" : "primary"}
                >
                  {lesson.isCompleted ? (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      Review
                    </>
                  ) : hasStarted ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Continue
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
