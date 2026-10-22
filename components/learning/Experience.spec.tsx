import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GuidedRound } from './RoundsExperience'
import StudyExperience from './StudyExperience'
import JudgmentPillars from './JudgmentPillars'
import { guidedCases } from '@/lib/learning/cases'
import { studyUnits, readStudyRecords } from '@/lib/learning/study'
import { historyKey, readAttempts } from '@/lib/learning/attempt-history'
import { competencyRegistry } from '@/lib/cjis/competencies'

beforeEach(() => localStorage.clear())
describe('clinical judgment learning experience', () => {
  it('gives every fictional case six ordered decisions, resolvable answers and a debrief', () => {
    for (const story of guidedCases) {
      expect(story.stages.map((step) => step.competency)).toEqual(
        competencyRegistry.operations
      )
      expect(story.sources.length).toBeGreaterThan(0)
      story.stages.forEach((step) => {
        expect(step.options[step.correct]).toBeTruthy()
        expect(step.rationale.length).toBeGreaterThan(50)
        expect(step.vitals).toHaveLength(3)
      })
    }
  })
  it('advances through all stages with feedback before showing a real debrief', () => {
    const story = guidedCases[0]!
    render(<GuidedRound story={story} />)
    for (const [index, step] of story.stages.entries()) {
      expect(screen.getByText(`Decision ${index + 1} of 6`)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Check answer' })
      ).toBeDisabled()
      fireEvent.click(screen.getAllByRole('radio')[step.correct]!)
      fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
      expect(screen.getByRole('status')).toHaveTextContent(step.rationale)
      fireEvent.click(
        screen.getByRole('button', {
          name: index === 5 ? 'See your debrief' : 'Continue the story',
        })
      )
    }
    expect(screen.getByText(/6 of 6 decisions correct/)).toBeInTheDocument()
    expect(readAttempts(localStorage.getItem(historyKey))).toMatchObject([
      {
        kind: 'guided-case',
        correct: 6,
        answered: 6,
        skipped: 0,
        source: 'tracked',
      },
    ])
    expect(
      screen.getByText(/does not establish clinical competence/)
    ).toBeInTheDocument()
  })
  it('makes the six pillars explorable without claiming mastery', () => {
    render(<JudgmentPillars />)
    fireEvent.click(screen.getByRole('button', { name: /06.*Reassess/s }))
    expect(
      screen.getByRole('heading', { name: 'Did it make a difference?' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Explore this skill/ })
    ).toHaveAttribute('href', '/study?pillar=evaluate_outcomes')
  })
  it('uses distinct pre/post questions and preserves the first paired result across later reviews', () => {
    render(<StudyExperience initialUnit="recognize_cues" />)
    const unit = studyUnits[0]!
    fireEvent.click(screen.getAllByRole('radio')[1]!)
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Explore the lesson' }))
    unit.sections.forEach((section) =>
      expect(
        screen.getByRole('heading', { name: section.heading })
      ).toBeInTheDocument()
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Apply what you explored' })
    )
    expect(screen.getByText(unit.post.prompt)).toBeInTheDocument()
    expect(unit.pre.prompt).not.toBe(unit.post.prompt)
    fireEvent.click(screen.getAllByRole('radio')[unit.post.correct]!)
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'See your learning snapshot' })
    )
    const original = readStudyRecords(
      localStorage.getItem('rapidrounds-study-v1')
    )
    expect(original).toHaveLength(1)
    expect(original[0]).toMatchObject({
      unitId: unit.id,
      preCorrect: false,
      postCorrect: true,
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Explore another skill' })
    )
    expect(
      screen.getByText('/ 6 units explored').parentElement
    ).toHaveTextContent('1 / 6 units explored')
    fireEvent.click(
      screen.getByRole('button', {
        name: /See the signal, not just the numbers/,
      })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Restart checks' }))
    fireEvent.click(screen.getAllByRole('radio')[unit.pre.correct]!)
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Explore the lesson' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Apply what you explored' })
    )
    fireEvent.click(screen.getAllByRole('radio')[0]!)
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'See your learning snapshot' })
    )
    expect(
      readStudyRecords(localStorage.getItem('rapidrounds-study-v1'))
    ).toEqual(original)
  })
  it('ignores corrupt or unrelated persisted study data', () => {
    expect(readStudyRecords('bad-json')).toEqual([])
    expect(
      readStudyRecords(
        JSON.stringify([
          {
            version: 1,
            unitId: 'fake',
            preCorrect: true,
            postCorrect: true,
            completedAt: 'today',
          },
        ])
      )
    ).toEqual([])
    const first = {
      version: 1,
      unitId: 'recognize_cues',
      preCorrect: false,
      postCorrect: true,
      completedAt: '2026-10-16',
    }
    expect(
      readStudyRecords(JSON.stringify([first, { ...first, preCorrect: true }]))
    ).toEqual([first])
  })
})
