import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LegacyPractice from './LegacyPractice'
import { BANKS } from '@/qbank/banks'

describe('quiz CJIS integration', () => {
  it('lists the competencies and renders an actual adapted bank with practice-only feedback', () => {
    render(<LegacyPractice />)
    expect(screen.getByText('recognize cues')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Select bank'), { target: { value: 'acute_mi' } })
    expect(screen.getByText(/Competency mapping pending/)).toBeInTheDocument()
    const item = BANKS.acute_mi.items[0]!
    const answerIndex = item.correct_answer.charCodeAt(0) - 65
    const button = screen.getByRole('button', { name: `${item.correct_answer}. ${item.options[answerIndex]}` })
    fireEvent.click(button)
    expect(screen.getByRole('status')).toHaveTextContent('Correct. Practice feedback only.')
    expect(button).toBeDisabled()
    expect(screen.getByText(/1 practice responses this session/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next question' }))
    expect(screen.queryByRole('status')).toBeNull()
    fireEvent.click(button)
    expect(screen.getByText(/2 practice responses this session/)).toBeInTheDocument()
    expect(screen.getByText(/No competency score calculated/)).toBeInTheDocument()
  })
  it('resets answers and counts on bank changes and does not count skips as answers', () => {
    render(<LegacyPractice />)
    fireEvent.change(screen.getByLabelText('Select bank'), { target: { value: 'acute_mi' } })
    fireEvent.click(screen.getByRole('button', { name: 'Skip question' }))
    expect(screen.getByText(/0 practice responses this session/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^A\./ }))
    fireEvent.change(screen.getByLabelText('Select bank'), { target: { value: 'vascular_disease_core' } })
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByText(/0 practice responses this session/)).toBeInTheDocument()
    expect(screen.getByText(/Question 1 of 30/)).toBeInTheDocument()
  })
})
