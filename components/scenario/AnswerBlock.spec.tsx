import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnswerBlock, Question } from './AnswerBlock'

const mockAddXP = vi.hoisted(() => vi.fn())

it('restores a submitted answer without another submission or XP award', () => {
  mockAddXP.mockClear()
  const answer = vi.fn()
  render(<AnswerBlock question={mockMCQQuestion} onAnswer={answer} submittedAnswer={['b']} />)
  expect(screen.queryByRole('button', { name: 'Submit Answer' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: '60-100 bpm' })).toBeDisabled()
  expect(answer).not.toHaveBeenCalled()
  expect(mockAddXP).not.toHaveBeenCalled()
})

// Mock dependencies
vi.mock('@/store/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-123' },
    profile: { subscription_tier: 'free' }
  })
}))

vi.mock('@/store/useProgress', () => ({
  useProgress: () => ({
    addXP: mockAddXP
  })
}))

vi.mock('@/lib/hooks/useAccess', () => ({
  useRationaleAccess: () => ({
    accessCheck: {
      hasAccess: true,
      reason: 'free_limit',
      remainingFree: 3
    },
    canAccess: true
  })
}))

const mockMCQQuestion: Question = {
  id: 'q1',
  type: 'multiple_choice',
  question: 'What is the normal heart rate range for adults?',
  options: [
    { id: 'a', text: '40-60 bpm' },
    { id: 'b', text: '60-100 bpm' },
    { id: 'c', text: '80-120 bpm' },
    { id: 'd', text: '100-140 bpm' }
  ],
  correctAnswers: ['b'],
  explanation: 'Normal adult heart rate is 60-100 bpm',
  rationale: {
    hint: 'Consider normal physiological ranges',
    full: 'The normal resting heart rate for healthy adults is 60-100 beats per minute...'
  },
  points: 10
}

const mockMultiSelectQuestion: Question = {
  id: 'q2',
  type: 'multi_select',
  question: 'Which of the following are signs of cardiac distress?',
  options: [
    { id: 'a', text: 'Chest pain' },
    { id: 'b', text: 'Shortness of breath' },
    { id: 'c', text: 'Normal appetite' },
    { id: 'd', text: 'Diaphoresis' }
  ],
  correctAnswers: ['a', 'b', 'd'],
  explanation: 'Multiple signs indicate cardiac distress',
  points: 15
}

const mockOrderQuestion: Question = {
  id: 'q3',
  type: 'drag_to_order',
  question: 'Order these interventions by priority:',
  options: [
    { id: 'a', text: 'Call for help' },
    { id: 'b', text: 'Assess airway' },
    { id: 'c', text: 'Check pulse' },
    { id: 'd', text: 'Start CPR if needed' }
  ],
  correctAnswers: ['a', 'b', 'c', 'd'],
  explanation: 'Follow emergency protocol sequence',
  points: 20
}

describe('AnswerBlock', () => {
  const mockOnAnswer = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Ordering submission', () => {
    it('submits the displayed order without requiring a multiple-choice selection', () => {
      render(<AnswerBlock question={mockOrderQuestion} onAnswer={mockOnAnswer} />)
      const submit = screen.getByRole('button', { name: 'Submit Answer' })
      expect(submit).toBeEnabled()
      fireEvent.click(submit)
      expect(mockOnAnswer).toHaveBeenCalledWith(['a', 'b', 'c', 'd'])
      expect(mockOnAnswer).toHaveBeenCalledOnce()
      expect(screen.getByRole('button', { name: 'Reorder Call for help' })).toBeDisabled()
    })
    it('does not reward a sequence containing all the right items in the wrong order', () => {
      const correct = vi.fn()
      render(<AnswerBlock question={{ ...mockOrderQuestion, correctAnswers: ['b', 'a', 'c', 'd'] }} onAnswer={mockOnAnswer} onCorrectAnswer={correct} />)
      fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }))
      expect(correct).not.toHaveBeenCalled()
      expect(mockAddXP).not.toHaveBeenCalled()
      expect(mockOnAnswer).toHaveBeenCalledWith(['a', 'b', 'c', 'd'])
    })
    it('keeps empty or externally disabled ordering questions unsubmitable', () => {
      const view = render(<AnswerBlock question={{ ...mockOrderQuestion, options: [] }} onAnswer={mockOnAnswer} />)
      expect(screen.getByRole('button', { name: 'Submit Answer' })).toBeDisabled()
      view.unmount()
      render(<AnswerBlock question={mockOrderQuestion} onAnswer={mockOnAnswer} disabled />)
      expect(screen.getByRole('button', { name: 'Submit Answer' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Reorder Call for help' })).toBeDisabled()
    })
  })

  describe('Multiple Choice Questions', () => {
    it('renders question and options correctly', () => {
      render(
        <AnswerBlock
          question={mockMCQQuestion}
          onAnswer={mockOnAnswer}
        />
      )
      
      expect(screen.getByText('What is the normal heart rate range for adults?')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /40-60 bpm/ })).toBeInTheDocument()
      expect(screen.getByText('60-100 bpm')).toBeInTheDocument()
      expect(screen.getByText('80-120 bpm')).toBeInTheDocument()
      expect(screen.getByText('100-140 bpm')).toBeInTheDocument()
    })

    it('allows selecting an option', async () => {
      const user = userEvent.setup()
      
      render(
        <AnswerBlock
          question={mockMCQQuestion}
          onAnswer={mockOnAnswer}
        />
      )
      
      const correctOption = screen.getByText('60-100 bpm')
      await user.click(correctOption)
      
      // Submit button should be enabled
      const submitButton = screen.getByText('Submit Answer')
      expect(submitButton).not.toBeDisabled()
      
      await user.click(submitButton)
      
      expect(mockOnAnswer).toHaveBeenCalledWith(['b'])
    })

    it('disables options after submission', async () => {
      const user = userEvent.setup()
      
      render(
        <AnswerBlock
          question={mockMCQQuestion}
          onAnswer={mockOnAnswer}
        />
      )
      
      const option = screen.getByText('60-100 bpm')
      await user.click(option)
      
      const submitButton = screen.getByText('Submit Answer')
      await user.click(submitButton)
      
      // Options should be disabled after submission
      const buttons = screen.getAllByRole('button')
      const optionButtons = buttons.filter(btn => 
        btn.textContent?.includes('bpm')
      )
      
      optionButtons.forEach(btn => {
        expect(btn).toBeDisabled()
      })
    })
  })

  describe('Multi-Select Questions', () => {
    it('allows selecting multiple options', async () => {
      const user = userEvent.setup()
      
      render(
        <AnswerBlock
          question={mockMultiSelectQuestion}
          onAnswer={mockOnAnswer}
        />
      )
      
      expect(screen.getByText('Select all that apply:')).toBeInTheDocument()
      
      // Select multiple correct options
      await user.click(screen.getByText('Chest pain'))
      await user.click(screen.getByText('Shortness of breath'))
      await user.click(screen.getByText('Diaphoresis'))
      
      const submitButton = screen.getByText('Submit Answer')
      await user.click(submitButton)
      
      expect(mockOnAnswer).toHaveBeenCalledWith(['a', 'b', 'd'])
    })

    it('allows deselecting options', async () => {
      const user = userEvent.setup()
      
      render(
        <AnswerBlock
          question={mockMultiSelectQuestion}
          onAnswer={mockOnAnswer}
        />
      )
      
      // Select and then deselect an option
      const chestPainOption = screen.getByText('Chest pain')
      await user.click(chestPainOption)
      await user.click(chestPainOption) // Deselect
      
      // Select other options
      await user.click(screen.getByText('Shortness of breath'))
      
      const submitButton = screen.getByText('Submit Answer')
      await user.click(submitButton)
      
      expect(mockOnAnswer).toHaveBeenCalledWith(['b'])
    })
  })

  describe('Text Input Questions', () => {
    const mockTextQuestion: Question = {
      id: 'q4',
      type: 'text_input',
      question: 'Describe the patient\'s condition:',
      correctAnswers: ['Sample answer'],
      explanation: 'Text explanation',
      points: 5
    }

    it('renders text input correctly', () => {
      render(
        <AnswerBlock
          question={mockTextQuestion}
          onAnswer={mockOnAnswer}
        />
      )
      
      expect(screen.getByText('Describe the patient\'s condition:')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your answer here...')).toBeInTheDocument()
    })

    it('submits text input correctly', async () => {
      const user = userEvent.setup()
      
      render(
        <AnswerBlock
          question={mockTextQuestion}
          onAnswer={mockOnAnswer}
        />
      )
      
      const textInput = screen.getByPlaceholderText('Enter your answer here...')
      await user.type(textInput, 'Patient shows signs of cardiac distress')
      
      const submitButton = screen.getByText('Submit Answer')
      await user.click(submitButton)
      
      expect(mockOnAnswer).toHaveBeenCalledWith(['Patient shows signs of cardiac distress'])
    })

    it('disables submit button for empty text input', () => {
      render(
        <AnswerBlock
          question={mockTextQuestion}
          onAnswer={mockOnAnswer}
        />
      )
      
      const submitButton = screen.getByText('Submit Answer')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <AnswerBlock
          question={mockMCQQuestion}
          onAnswer={mockOnAnswer}
        />
      )
      
      // Question should be properly labeled
      const questionElement = screen.getByText('What is the normal heart rate range for adults?')
      expect(questionElement).toBeInTheDocument()
      
      // Options should be clickable buttons
      const options = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('bpm')
      )
      expect(options).toHaveLength(4)
      
      // Submit button should be present
      const submitButton = screen.getByText('Submit Answer')
      expect(submitButton).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <AnswerBlock
          question={mockMCQQuestion}
          onAnswer={mockOnAnswer}
        />
      )
      
      // Tab to first option
      await user.tab()
      const firstOption = screen.getByRole('button', { name: /40-60 bpm/ })
      expect(firstOption).toHaveFocus()
      
      // Press Enter to select
      await user.keyboard('{Enter}')
      
      // Traverse the remaining answer buttons before the submit button.
      for (let i = 0; i < mockMCQQuestion.options!.length; i++) await user.tab()
      const submitButton = screen.getByText('Submit Answer')
      expect(submitButton).toHaveFocus()
      
      // Press Enter to submit
      await user.keyboard('{Enter}')
      
      expect(mockOnAnswer).toHaveBeenCalledWith(['a'])
    })
  })

  describe('Rationale Display', () => {
    it('shows rationale after submission', async () => {
      const user = userEvent.setup()
      
      render(
        <AnswerBlock
          question={mockMCQQuestion}
          onAnswer={mockOnAnswer}
          showRationale={true}
        />
      )
      
      // Select an answer and submit
      await user.click(screen.getByText('60-100 bpm'))
      await user.click(screen.getByText('Submit Answer'))
      
      // Wait for rationale to appear
      await waitFor(() => {
        expect(screen.getByText('Explanation')).toBeInTheDocument()
        expect(screen.getByText('Normal adult heart rate is 60-100 bpm')).toBeInTheDocument()
      })
    })

    it('shows access badges correctly', async () => {
      const user = userEvent.setup()
      
      render(
        <AnswerBlock
          question={mockMCQQuestion}
          onAnswer={mockOnAnswer}
          showRationale={true}
        />
      )
      
      await user.click(screen.getByText('60-100 bpm'))
      await user.click(screen.getByText('Submit Answer'))
      
      await waitFor(() => {
        expect(screen.getByText('3 free explanations left')).toBeInTheDocument()
      })
    })
  })

  describe('Disabled State', () => {
    it('disables all interactions when disabled prop is true', () => {
      render(
        <AnswerBlock
          question={mockMCQQuestion}
          onAnswer={mockOnAnswer}
          disabled={true}
        />
      )
      
      const options = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('bpm')
      )
      
      options.forEach(option => {
        expect(option).toBeDisabled()
      })
      
      const submitButton = screen.getByText('Submit Answer')
      expect(submitButton).toBeDisabled()
    })
  })
})
