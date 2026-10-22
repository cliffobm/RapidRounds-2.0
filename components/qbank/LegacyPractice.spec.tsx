import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LegacyPractice from './LegacyPractice'
import { BANKS } from '@/qbank/banks'

describe('mobile practice flow', () => {
  it('replaces the dropdown with topics and requires confirmation before grading', () => {
    render(<LegacyPractice />)
    expect(screen.queryByRole('combobox')).toBeNull()
    fireEvent.click(
      screen.getByRole('button', { name: /Acute coronary syndromes/ })
    )
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled()
    const item = BANKS.acute_mi.items[0]!
    fireEvent.click(
      screen.getAllByRole('radio')[item.correct_answer.charCodeAt(0) - 65]!
    )
    expect(screen.queryByRole('status')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'You connected the dots.'
    )
    screen
      .getAllByRole('radio')
      .forEach((option) => expect(option).toBeDisabled())
    fireEvent.click(screen.getByRole('button', { name: 'Next question' }))
    for (let i = 0; i < 4; i++)
      fireEvent.click(
        screen.getByRole('button', { name: 'Skip this question' })
      )
    expect(
      screen.getByText('1 correct · 1 answered · 4 skipped')
    ).toBeInTheDocument()
    expect(screen.getByText(/not a competency estimate/)).toBeInTheDocument()
  })
  it('filters topics, caps rounds at five and records skipped questions accurately', () => {
    render(<LegacyPractice />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Search topics' }), {
      target: { value: 'vascular disease' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Vascular disease/ }))
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument()
    for (let i = 0; i < 5; i++)
      fireEvent.click(
        screen.getByRole('button', { name: 'Skip this question' })
      )
    expect(
      screen.getByText('0 correct · 0 answered · 5 skipped')
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Continue this topic/ }))
    expect(
      screen.getByRole('group', {
        name: BANKS.vascular_disease_core.items[5]!.question,
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'All topics' }))
    expect(screen.queryByRole('status')).toBeNull()
    expect(
      screen.getByRole('heading', { name: 'Choose a practice topic' })
    ).toBeInTheDocument()
  })
})
