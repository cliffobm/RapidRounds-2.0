'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/store/useAuth'
import { useProgress } from '@/store/useProgress'
import { useRationaleAccess } from '@/lib/hooks/useAccess'
import { isQuestionAnswerCorrect } from '@/lib/question-answer'
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  GripVertical,
  Lock,
  Crown,
  Lightbulb,
  Zap,
  Gift
} from 'lucide-react'

export interface QuestionOption {
  id: string
  text: string
  isCorrect?: boolean
}

export interface Question {
  id: string
  type: 'multiple_choice' | 'multi_select' | 'drag_to_order' | 'text_input'
  question: string
  options?: QuestionOption[]
  correctAnswers?: string[]
  explanation?: string
  rationale?: {
    hint: string
    full: string
  }
  points: number
}

interface AnswerBlockProps {
  question: Question
  onAnswer: (answers: string[]) => void
  showRationale?: boolean
  userTier?: 'free' | 'trial' | 'premium'
  rationaleCount?: number
  maxFreeRationales?: number
  disabled?: boolean
  submittedAnswer?: string[] | undefined
  onCorrectAnswer?: () => void
  passingThreshold?: number
  className?: string
}

// Sortable item for drag-to-order questions
function SortableItem({ id, label, disabled, children }: { id: string; label: string; disabled: boolean; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled, transition: null })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-move hover:shadow-md"
    >
      <button ref={setActivatorNodeRef} type="button" {...attributes} {...listeners} disabled={disabled} aria-label={`Reorder ${label}`} className="touch-none cursor-grab active:cursor-grabbing p-2">
        <GripVertical className="w-4 h-4 text-slate-400" />
      </button>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

export function AnswerBlock({
  question,
  onAnswer,
  showRationale = false,
  userTier = 'free',
  rationaleCount = 0,
  maxFreeRationales = 5,
  disabled = false,
  submittedAnswer,
  onCorrectAnswer,
  passingThreshold = 80,
  className = ''
}: AnswerBlockProps) {
  const { user, profile } = useAuth()
  const { addXP } = useProgress()
  const { accessCheck, canAccess: canSeeFullRationale } = useRationaleAccess(question.id)
  
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(submittedAnswer || [])
  const [textAnswer, setTextAnswer] = useState(submittedAnswer?.[0] || '')
  const [orderItems, setOrderItems] = useState<string[]>(
    submittedAnswer || question.options?.map(opt => opt.id) || []
  )
  const [showExplanation, setShowExplanation] = useState(false)
  const [submitted, setSubmitted] = useState(Boolean(submittedAnswer))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )


  const handleMultipleChoice = useCallback((optionId: string) => {
    if (disabled || submitted) return
    setSelectedAnswers([optionId])
  }, [disabled, submitted])

  const handleMultiSelect = useCallback((optionId: string) => {
    if (disabled || submitted) return
    setSelectedAnswers(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    )
  }, [disabled, submitted])

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || disabled || submitted) return

    if (active.id !== over.id) {
      setOrderItems(items => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const hasAnswer = question.type === 'drag_to_order'
    ? orderItems.length > 0
    : question.type === 'text_input' ? Boolean(textAnswer.trim()) : selectedAnswers.length > 0

  const handleSubmit = () => {
    if (disabled || submitted || !hasAnswer) return

    let answers: string[] = []
    
    switch (question.type) {
      case 'multiple_choice':
      case 'multi_select':
        answers = selectedAnswers
        break
      case 'drag_to_order':
        answers = orderItems
        break
      case 'text_input':
        answers = [textAnswer.trim()]
        break
    }

    setSubmitted(true)
    onAnswer(answers)
    
    // Check if answer is correct and trigger confetti
    const isCorrect = isQuestionAnswerCorrect(question, answers)
    
    // Award XP for correct answers
    if (isCorrect) {
      addXP(question.points)
      
      if (onCorrectAnswer) {
        setTimeout(() => onCorrectAnswer(), 500) // Delay for visual feedback
      }
    }
    
    // Track rationale usage if user will see it and it's a free usage
    if (user && canSeeFullRationale && accessCheck?.reason === 'free_limit') {
      // This will be tracked server-side when rationale is actually viewed
      console.log('Free rationale will be consumed')
    }
  }

  const isAnswerCorrect = (optionId: string) => {
    return question.correctAnswers?.includes(optionId) || false
  }

  const getOptionStatus = (optionId: string) => {
    if (!submitted) return 'default'
    
    const isSelected = selectedAnswers.includes(optionId)
    const isCorrect = isAnswerCorrect(optionId)
    
    if (isSelected && isCorrect) return 'correct'
    if (isSelected && !isCorrect) return 'incorrect'
    if (!isSelected && isCorrect) return 'missed'
    return 'default'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct': return 'bg-success/10 border-success text-success'
      case 'incorrect': return 'bg-danger/10 border-danger text-danger'
      case 'missed': return 'bg-warning/10 border-warning text-warning'
      default: return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
    }
  }

  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const status = getOptionStatus(option.id)
              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleMultipleChoice(option.id)}
                  disabled={disabled || submitted}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${getStatusColor(status)} ${
                    selectedAnswers.includes(option.id) && !submitted
                      ? 'border-primary bg-primary/5'
                      : ''
                  } ${
                    disabled || submitted ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
                  }`}
                  whileHover={!disabled && !submitted ? { scale: 1.02 } : {}}
                  whileTap={!disabled && !submitted ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                    {submitted && (
                      <div className="flex items-center space-x-2">
                        {status === 'correct' && <CheckCircle className="w-5 h-5 text-success" />}
                        {status === 'incorrect' && <XCircle className="w-5 h-5 text-danger" />}
                        {status === 'missed' && <CheckCircle className="w-5 h-5 text-warning" />}
                      </div>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        )

      case 'multi_select':
        return (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Select all that apply:
            </p>
            {question.options?.map((option) => {
              const status = getOptionStatus(option.id)
              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleMultiSelect(option.id)}
                  disabled={disabled || submitted}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${getStatusColor(status)} ${
                    selectedAnswers.includes(option.id) && !submitted
                      ? 'border-primary bg-primary/5'
                      : ''
                  } ${
                    disabled || submitted ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
                  }`}
                  whileHover={!disabled && !submitted ? { scale: 1.02 } : {}}
                  whileTap={!disabled && !submitted ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                    <div className="flex items-center space-x-2">
                      {selectedAnswers.includes(option.id) && !submitted && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                      {submitted && (
                        <>
                          {status === 'correct' && <CheckCircle className="w-5 h-5 text-success" />}
                          {status === 'incorrect' && <XCircle className="w-5 h-5 text-danger" />}
                          {status === 'missed' && <CheckCircle className="w-5 h-5 text-warning" />}
                        </>
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )

      case 'drag_to_order':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Drag to arrange in the correct order (first to last):
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={orderItems} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {orderItems.map((itemId, index) => {
                    const option = question.options?.find(opt => opt.id === itemId)
                    if (!option) return null
                    
                    return (
                      <SortableItem key={itemId} id={itemId} label={option.text} disabled={disabled || submitted}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" size="sm">
                              {index + 1}
                            </Badge>
                            <span className="font-medium">{option.text}</span>
                          </div>
                          {submitted && (
                            <div className="flex items-center space-x-2">
                              {question.correctAnswers?.[index] === itemId ? (
                                <CheckCircle className="w-5 h-5 text-success" />
                              ) : (
                                <XCircle className="w-5 h-5 text-danger" />
                              )}
                            </div>
                          )}
                        </div>
                      </SortableItem>
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )

      case 'text_input':
        return (
          <div className="space-y-4">
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={disabled || submitted}
              placeholder="Enter your answer here..."
              className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none min-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
              rows={4}
            />
            {submitted && question.correctAnswers && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                    Sample Answer:
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {question.correctAnswers[0]}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return <div>Unsupported question type</div>
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Question */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {question.question}
        </h3>
        <div className="flex items-center space-x-2 mb-4">
          <Badge variant="outline" size="sm">
            {question.type.replace('_', ' ')}
          </Badge>
          <Badge variant="secondary" size="sm">
            {question.points} {question.points === 1 ? 'point' : 'points'}
          </Badge>
        </div>
      </div>

      {/* Answer Options */}
      {renderQuestion()}

      {/* Submit Button */}
      {!submitted && (
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={disabled || !hasAnswer}
            size="lg"
          >
            Submit Answer
          </Button>
        </div>
      )}

      {/* Rationale */}
      {submitted && (showRationale || question.rationale) && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <span>Explanation</span>
                  </h4>
                  {!canSeeFullRationale && (
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">
                        {maxFreeRationales - rationaleCount} free explanations left
                      </span>
                    </div>
                  )}
                </div>

                {canSeeFullRationale ? (
                  <div className="space-y-3">
                    {/* Show access reason */}
                    {accessCheck && (
                      <div className="flex items-center space-x-2 mb-3">
                        {accessCheck.reason === 'premium' && (
                          <Badge variant="accent" size="sm">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium Access
                          </Badge>
                        )}
                        {accessCheck.reason === 'trial' && (
                          <Badge variant="warning" size="sm">
                            <Gift className="w-3 h-3 mr-1" />
                            Trial Access
                          </Badge>
                        )}
                        {accessCheck.reason === 'free_limit' && (
                          <Badge variant="outline" size="sm">
                            <Zap className="w-3 h-3 mr-1" />
                            {accessCheck.remainingFree} free explanations left
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {question.explanation && (
                      <p className="text-slate-700 dark:text-slate-300">
                        {question.explanation}
                      </p>
                    )}
                    
                    {question.rationale?.full && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {question.rationale.full}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Show hint content */}
                    {question.rationale?.hint && (
                      <p className="text-slate-700 dark:text-slate-300">
                        {question.rationale.hint}
                      </p>
                    )}
                    
                    {/* Upgrade prompt */}
                    <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/20">
                      <div className="flex items-center space-x-3 mb-3">
                        <Crown className="w-5 h-5 text-primary" />
                        <span className="font-medium text-slate-900 dark:text-white">
                          Unlock Full Explanation
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {accessCheck?.message || 'Get detailed rationales with clinical reasoning and evidence-based explanations.'}
                      </p>
                      
                      {accessCheck?.reason === 'exceeded_limit' && (
                        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
                          <p className="text-sm text-warning-700 dark:text-warning-300">
                            You&apos;ve used all {maxFreeRationales} free explanations. Upgrade to continue learning with full rationales.
                          </p>
                        </div>
                      )}
                      
                      <div className="flex space-x-3">
                        <Button disabled title="Not connected yet" variant="primary" size="sm">
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Premium
                        </Button>
                        {profile?.subscription_tier === 'free' && (
                          <Button disabled title="Not connected yet" variant="outline" size="sm">
                            <Gift className="w-4 h-4 mr-2" />
                            Start Free Trial
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
