import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { authoredQuestions } from '@/lib/learning/authored-questions'
import { practiceTopics } from '@/lib/learning/catalog'
import { guidedCases } from '@/lib/learning/cases'
import { loadPractice, recordPracticeResponse } from '@/lib/cjis/practice'
import { isScoredClinicalItem } from '@/lib/cjis/registry'
import { contentSources } from '@/lib/learning/sources'
import { searchGlossary, valueExamples } from '@/lib/learning/glossary'
import GlossaryExperience from './GlossaryExperience'
import LegacyPractice from '@/components/qbank/LegacyPractice'
import { GuidedRound } from './RoundsExperience'
import { readActivities, activityKey } from '@/lib/learning/sessions'

beforeEach(() => localStorage.clear())
describe('original educational content expansion', () => {
  it('fills sparse banks without promoting draft or assisted work to competency evidence', () => {
    expect(authoredQuestions).toHaveLength(32)
    expect(practiceTopics.every((topic) => topic.items >= 5)).toBe(true)
    expect(practiceTopics.reduce((sum, topic) => sum + topic.items, 0)).toBe(
      100
    )
    expect(new Set(authoredQuestions.map((item) => item.id)).size).toBe(32)
    for (const item of authoredQuestions) {
      expect(item.options.map((option) => option.id)).toContain(item.correctId)
      expect(item.explanations).toHaveLength(item.options.length)
      expect(item.sources.every((id) => contentSources[id])).toBe(true)
      expect(item.reviewStatus).toBe('draft')
      expect(isScoredClinicalItem(item)).toBe(false)
      const normalized = loadPractice(item.bankKey).items.find(
        (entry) => entry.id === item.id
      )!
      expect(
        recordPracticeResponse(
          normalized,
          item.version,
          item.correctId,
          0,
          [],
          1
        )
      ).toMatchObject({
        outcome: 'correct',
        definitions_used: 1,
        evidence_class: 'authored_draft_practice',
        competency_eligible: false,
      })
    }
  })
  it('finds abbreviations and spelling variants and keeps values source-specific', () => {
    expect(searchGlossary('SpO2').map((entry) => entry.id)).toContain('spo2')
    expect(searchGlossary('dyspnea').map((entry) => entry.id)).toContain(
      'dyspnoea'
    )
    expect(
      searchGlossary('LKW', 'Neurologic').map((entry) => entry.id)
    ).toEqual(['last-known-well'])
    expect(searchGlossary('zzzz-no-such-term')).toEqual([])
    expect(valueExamples).toHaveLength(6)
    expect(
      valueExamples.every(
        (value) => value.context && contentSources[value.source]
      )
    ).toBe(true)
    render(<GlossaryExperience />)
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'aphasia' },
    })
    expect(screen.getByRole('heading', { name: 'Aphasia' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Values & units' }))
    expect(screen.getByText(/not patient-specific targets/)).toBeInTheDocument()
    expect(screen.getByText('135–145 mEq/L')).toBeInTheDocument()
  })
  it('keeps a selected answer while using the glossary and persists pre-answer assistance through reload', async () => {
    const view = render(<LegacyPractice initialBank="neuro_template" />)
    fireEvent.click(screen.getAllByRole('radio')[0]!)
    const details = screen
      .getByText('Open glossary & value examples')
      .closest('details')!
    details.open = true
    fireEvent(details, new Event('toggle'))
    await waitFor(() =>
      expect(
        screen.getByText(/Reference-assisted practice/)
      ).toBeInTheDocument()
    )
    expect(screen.getAllByRole('radio')[0]).toBeChecked()
    view.unmount()
    render(<LegacyPractice initialBank="neuro_template" />)
    fireEvent.click(screen.getAllByRole('radio')[0]!)
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    const saved = JSON.parse(
      localStorage.getItem('rapidrounds-session-v1:practice:neuro_template')!
    )
    expect(saved.state.responses[0].definitions_used).toBeGreaterThan(0)
    expect(saved.state.responses[0].competency_eligible).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Next question' }))
    const nextItem = authoredQuestions.find(
      (item) => item.bankKey === 'neuro_template'
    )!
    expect(screen.getAllByRole('radio')).toHaveLength(nextItem.options.length)
    expect(
      screen.getAllByRole('button', { name: 'Check answer' })
    ).toHaveLength(1)
    expect(
      screen.queryByText(/Reference-assisted practice/)
    ).not.toBeInTheDocument()
  })
  it('new cases have full independent stories and completed activity remains readable', () => {
    const story = guidedCases.find((entry) => entry.id === 'neuro-change')!
    expect(guidedCases).toHaveLength(6)
    render(<GuidedRound story={story} />)
    for (const [index, step] of story.stages.entries()) {
      fireEvent.click(screen.getAllByRole('radio')[step.correct]!)
      fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
      expect(screen.getByRole('status')).toHaveTextContent(step.rationale)
      fireEvent.click(
        screen.getByRole('button', {
          name: index === 5 ? 'See your debrief' : 'Continue the story',
        })
      )
    }
    expect(readActivities(localStorage.getItem(activityKey))).toEqual([
      expect.objectContaining({ href: '/rr/neuro-change' }),
    ])
  })
})
