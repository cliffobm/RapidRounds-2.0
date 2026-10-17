import { vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { OrderQuestion } from '../OrderQuestion'

// Mock question data for Cardiac Assessment Q3
const mockQuestion = {
  id: 'q3',
  type: 'priority' as const,
  question: 'Prioritize these nursing interventions:',
  options: [
    'Administer oxygen',
    'Obtain IV access',
    'Monitor vital signs',
    'Prepare for cardiac catheterization',
  ],
  correct_answer: [
    'Administer oxygen',
    'Obtain IV access',
    'Monitor vital signs',
    'Prepare for cardiac catheterization',
  ],
  points: 15,
  explanation:
    'Oxygen first to improve oxygenation, then IV access for medications, continuous monitoring, and preparation for definitive treatment.',
  category: 'planning' as const,
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndContext>{children}</DndContext>
)

describe('OrderQuestion', () => {
  it('renders question options correctly', () => {
    render(
      <TestWrapper>
        <OrderQuestion question={mockQuestion} onAnswer={() => {}} />
      </TestWrapper>
    )

    expect(
      screen.getByText('Prioritize these nursing interventions:')
    ).toBeInTheDocument()
    expect(screen.getByText('Administer oxygen')).toBeInTheDocument()
    expect(screen.getByText('Obtain IV access')).toBeInTheDocument()
    expect(screen.getByText('Monitor vital signs')).toBeInTheDocument()
    expect(
      screen.getByText('Prepare for cardiac catheterization')
    ).toBeInTheDocument()
  })

  it('shows correct order when answer is provided', () => {
    const correctAnswer = {
      answer: mockQuestion.correct_answer,
      is_correct: true,
    }

    render(
      <TestWrapper>
        <OrderQuestion
          question={mockQuestion}
          onAnswer={() => {}}
          currentAnswer={correctAnswer}
        />
      </TestWrapper>
    )

    expect(screen.getAllByText('Correct order!')).toHaveLength(2)
  })

  it('shows try again when answer is incorrect', () => {
    const incorrectAnswer = {
      answer: [
        'Obtain IV access',
        'Administer oxygen',
        'Monitor vital signs',
        'Prepare for cardiac catheterization',
      ],
      is_correct: false,
    }

    render(
      <TestWrapper>
        <OrderQuestion
          question={mockQuestion}
          onAnswer={() => {}}
          currentAnswer={incorrectAnswer}
        />
      </TestWrapper>
    )

    expect(screen.getAllByText('Try again!')).toHaveLength(2)
  })

  it('calls onAnswer when item is clicked', () => {
    const onAnswerMock = vi.fn()

    render(
      <TestWrapper>
        <OrderQuestion question={mockQuestion} onAnswer={onAnswerMock} />
      </TestWrapper>
    )

    // Click on the first item
    const firstItem = screen.getByText('Administer oxygen')
    fireEvent.click(firstItem)

    // Should call onAnswer with the reordered array
    expect(onAnswerMock).toHaveBeenCalledWith([
      'Obtain IV access',
      'Monitor vital signs',
      'Prepare for cardiac catheterization',
      'Administer oxygen',
    ])
  })
})
