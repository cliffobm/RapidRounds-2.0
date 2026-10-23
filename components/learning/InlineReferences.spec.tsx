import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { referenceParts } from '@/lib/learning/inline-references'
import LegacyPractice from '@/components/qbank/LegacyPractice'
import DecisionCard from './DecisionCard'
import InlineReferenceText from './InlineReferenceText'

beforeEach(() => localStorage.clear())
describe('contextual glossary cards', () => {
  it('defines ventilation abbreviations without mislabeling ventricular tachycardia', () => {
    const text =
      'Tidal volume VT changes minute ventilation VE; GCS describes consciousness.'
    const refs = referenceParts(text).flatMap((part) =>
      part.reference ? [part.reference.id] : []
    )
    expect(refs).toEqual([
      'tidal-volume',
      'minute-ventilation',
      'glasgow-coma-scale',
    ])
    expect(
      referenceParts('Sustained ventricular tachycardia (VT).').some(
        (part) => part.reference?.id === 'tidal-volume'
      )
    ).toBe(false)
    expect(
      referenceParts('VT alone').some(
        (part) => part.reference?.id === 'tidal-volume'
      )
    ).toBe(false)
    expect(
      referenceParts('VT 400 mL; VE 6 L/min')
        .filter((part) => part.reference)
        .map((part) => part.reference!.id)
    ).toEqual(['tidal-volume', 'minute-ventilation'])
  })
  it('preserves every character, matches complete phrases and limits repeated links', () => {
    const text =
      'Aphasia, SpO2 and last known well. Aphasia again; peripheral, permissive and misinformation are plain.'
    const parts = referenceParts(text)
    expect(parts.map((part) => part.text).join('')).toBe(text)
    expect(
      parts.filter((part) => part.reference).map((part) => part.reference!.id)
    ).toEqual(['aphasia', 'spo2', 'last-known-well'])
    expect(
      referenceParts('perfusionist and misinformation, 145 at age 60').some(
        (part) => part.reference
      )
    ).toBe(false)
    expect(
      referenceParts('Baseline and reassessment guide the response.').some(
        (part) => part.reference
      )
    ).toBe(false)
  })
  it('associates named lab measurements and units without interpreting bare numbers', () => {
    expect(
      referenceParts(
        'Myocardial infarction, MI, respiratory rate and hypoxemia.'
      ).some((part) => part.reference)
    ).toBe(false)
    expect(
      referenceParts(
        'Serum sodium 138 mmol/L; potassium 4.2 mmol/L; BUN 18 mg/dL.'
      )
        .filter((part) => part.reference)
        .map((part) => part.reference)
    ).toEqual([
      { kind: 'value', id: 'sodium' },
      { kind: 'value', id: 'potassium' },
      { kind: 'value', id: 'bun' },
    ])
    expect(
      referenceParts(
        'Lactate 4.2 mmol/L, sodium bicarbonate and a sodium-restricted diet.'
      ).some((part) => part.reference?.kind === 'value')
    ).toBe(false)
  })
  it('opens only on activation and closes by keyboard with focus returned', async () => {
    const user = userEvent.setup()
    const lookup = vi.fn()
    render(
      <div className="rr-app">
        <InlineReferenceText text="New aphasia." onLookup={lookup} />
      </div>
    )
    const trigger = screen.getByRole('button', { name: 'Reference: aphasia' })
    trigger.focus()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(lookup).not.toHaveBeenCalled()
    await user.keyboard('{Enter}')
    expect(
      await screen.findByRole('dialog', { name: 'Aphasia' })
    ).toHaveTextContent('Difficulty producing or understanding language.')
    expect(lookup).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog').closest('.rr-app')).not.toBeNull()
    await user.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(trigger).toHaveFocus()
  })
  it('keeps choices selected and persists assistance without changing the question or answer key', async () => {
    const user = userEvent.setup()
    render(<LegacyPractice initialBank="neuro_template" />)
    fireEvent.click(screen.getAllByRole('radio')[0]!)
    await user.click(screen.getByRole('button', { name: 'Reference: aphasia' }))
    expect(screen.getAllByRole('radio')[0]).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Close reference' }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    const read = () =>
      JSON.parse(
        localStorage.getItem('rapidrounds-session-v1:practice:neuro_template')!
      ).state.responses[0]
    expect(read()).toMatchObject({
      outcome: 'correct',
      definitions_used: 1,
      competency_eligible: false,
    })
    await user.click(screen.getByRole('button', { name: 'Reference: aphasia' }))
    expect(await screen.findByRole('dialog', { name: 'Aphasia' })).toBeVisible()
    expect(read().definitions_used).toBe(1)
  })
  it('leaves references disabled by default and keeps answer options free of nested controls', () => {
    const props = {
      title: 'What does aphasia suggest?',
      context: 'New aphasia.',
      options: [{ id: 'A', text: 'Aphasia' }],
      feedback: null,
      onCommit: vi.fn(),
    }
    const view = render(<DecisionCard {...props} />)
    expect(
      screen.queryByRole('button', { name: /Reference:/ })
    ).not.toBeInTheDocument()
    view.rerender(<DecisionCard {...props} enableReferences />)
    expect(screen.getAllByRole('button', { name: /Reference:/ })).toHaveLength(
      2
    )
    expect(document.querySelector('.answer-option button')).toBeNull()
  })
})
