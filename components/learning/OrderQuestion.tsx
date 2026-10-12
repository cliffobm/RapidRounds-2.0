'use client'

import React, { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CheckCircleIcon, XCircleIcon, Bars3Icon } from '@heroicons/react/24/outline'

interface OrderQuestionProps {
  question: {
    id: string
    question: string
    options: string[]
    correct_answer: string[]
    points: number
    explanation: string
    category: string
  }
  onAnswer: (answer: string[]) => void
  currentAnswer?: {
    answer: string[]
    is_correct: boolean
  } | undefined
  disabled?: boolean
}

interface SortableItemProps {
  id: string
  children: React.ReactNode
  disabled?: boolean
}

function SortableItem({ id, children, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: disabled ?? false })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
        disabled
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
          : isDragging
          ? 'border-blue-400 bg-blue-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            {...listeners}
            className={`p-1 rounded ${
              disabled ? 'cursor-not-allowed' : 'cursor-grab hover:bg-gray-100'
            }`}
            aria-label="Drag to reorder"
          >
            <Bars3Icon className="w-5 h-5 text-gray-400" />
          </div>
          <span className="text-gray-900">{children}</span>
        </div>
      </div>
    </div>
  )
}

export function OrderQuestion({ question, onAnswer, currentAnswer, disabled }: OrderQuestionProps) {
  const [items, setItems] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [announcement, setAnnouncement] = useState<string>('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Initialize items from question options
  useEffect(() => {
    if (question.options) {
      setItems([...question.options])
    }
  }, [question.options])

  // Check if current order is correct
  useEffect(() => {
    if (currentAnswer) {
      const isAnswerCorrect = JSON.stringify(items) === JSON.stringify(currentAnswer.answer)
      setIsCorrect(isAnswerCorrect)
      
      if (isAnswerCorrect) {
        setAnnouncement('Correct order!')
      } else {
        setAnnouncement('Try again!')
      }
    }
  }, [items, currentAnswer])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string)
      const newIndex = items.indexOf(over.id as string)
      const newItems = arrayMove(items, oldIndex, newIndex)
      
      setItems(newItems)
      
      // Submit answer when order changes
      if (!disabled) {
        onAnswer(newItems)
      }
    }
  }

  const handleItemClick = (item: string) => {
    if (disabled) return
    
    // Move clicked item to the end
    const newItems = items.filter(i => i !== item).concat(item)
    setItems(newItems)
    onAnswer(newItems)
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop to prioritize (or click to move to end):
        </p>
        
        {/* ARIA Live Region for accessibility */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        >
          {announcement}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item, index) => (
              <SortableItem
                key={item}
                id={item}
                disabled={disabled ?? false}
              >
                <div 
                  className="flex items-center justify-between w-full"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="text-gray-900">{item}</span>
                  </div>
                  
                  {currentAnswer && (
                    <div className="flex items-center space-x-2">
                      {currentAnswer.answer[index] === item && (
                        isCorrect ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-red-500" />
                        )
                      )}
                    </div>
                  )}
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Visual feedback for correct/incorrect */}
      {currentAnswer && (
        <div className={`mt-4 p-3 rounded-lg ${
          isCorrect 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {isCorrect ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              isCorrect ? 'text-green-800' : 'text-red-800'
            }`}>
              {isCorrect ? 'Correct order!' : 'Try again!'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
