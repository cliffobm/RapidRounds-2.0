import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import StudyExperience from './StudyExperience'
import { readStudyRecords, studyUnits } from '@/lib/learning/study'
import { readStudySession, studySessionKey } from '@/lib/learning/study-session'

const unit = studyUnits[0]!
const saved = () =>
  readStudySession(localStorage.getItem(studySessionKey(unit.id)), unit)
const start = () => render(<StudyExperience initialUnit={unit.id} />)
const answer = (index: number) => {
  fireEvent.click(screen.getAllByRole('radio')[index]!)
  fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
}
const learn = () => {
  answer(unit.pre.correct)
  fireEvent.click(screen.getByRole('button', { name: 'Explore the lesson' }))
}
beforeEach(() => localStorage.clear())

describe('resumable study experience', () => {
  it('restores the submitted before answer and feedback without recording completion', () => {
    const first = start()
    answer(1)
    first.unmount()
    start()
    expect(screen.getAllByRole('radio')[1]).toBeChecked()
    expect(screen.getByRole('status')).toHaveTextContent(unit.pre.rationale)
    expect(saved()).toMatchObject({
      phase: 'before',
      before: { selected: 1, correct: false },
    })
    expect(
      readStudyRecords(localStorage.getItem('rapidrounds-study-v1'))
    ).toEqual([])
  })
  it('restores the lesson and then post-check feedback after separate closes', () => {
    const first = start()
    learn()
    first.unmount()
    const second = start()
    expect(
      screen.getByRole('heading', { name: unit.sections[0]!.heading })
    ).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Apply what you explored' })
    )
    answer(unit.post.correct)
    second.unmount()
    start()
    expect(screen.getAllByRole('radio')[unit.post.correct]).toBeChecked()
    expect(screen.getByRole('status')).toHaveTextContent(unit.post.rationale)
    expect(
      readStudyRecords(localStorage.getItem('rapidrounds-study-v1'))
    ).toEqual([])
    fireEvent.click(
      screen.getByRole('button', { name: 'See your learning snapshot' })
    )
    expect(saved()).toMatchObject({
      phase: 'complete',
      before: { correct: true },
      after: { correct: true },
    })
    expect(
      readStudyRecords(localStorage.getItem('rapidrounds-study-v1'))
    ).toHaveLength(1)
  })
  it('resumes a completed snapshot and requires an explicit replay that retains the first pair', () => {
    const first = start()
    answer(1)
    fireEvent.click(screen.getByRole('button', { name: 'Explore the lesson' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Apply what you explored' })
    )
    answer(unit.post.correct)
    fireEvent.click(
      screen.getByRole('button', { name: 'See your learning snapshot' })
    )
    const baseline = localStorage.getItem('rapidrounds-study-v1')
    first.unmount()
    start()
    expect(
      screen.getByRole('heading', { name: 'You closed the loop.' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Restart checks' }))
    learn()
    fireEvent.click(
      screen.getByRole('button', { name: 'Apply what you explored' })
    )
    answer(0)
    fireEvent.click(
      screen.getByRole('button', { name: 'See your learning snapshot' })
    )
    expect(localStorage.getItem('rapidrounds-study-v1')).toBe(baseline)
  })
  it('rejects corrupt stored progress rather than restoring a false completion', () => {
    localStorage.setItem(
      studySessionKey(unit.id),
      JSON.stringify({ phase: 'complete' })
    )
    start()
    expect(screen.getByText(unit.pre.prompt)).toBeInTheDocument()
    expect(saved()?.phase).toBe('before')
    expect(
      readStudyRecords(localStorage.getItem('rapidrounds-study-v1'))
    ).toEqual([])
  })
  it('keeps the lesson usable with a visible warning when browser persistence is blocked', () => {
    const blocked = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('blocked')
      })
    try {
      start()
      expect(screen.getByRole('status')).toHaveTextContent(
        'browser storage is unavailable'
      )
      learn()
      expect(
        screen.getByRole('heading', { name: unit.sections[0]!.heading })
      ).toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveTextContent('could not be saved')
    } finally {
      blocked.mockRestore()
    }
  })
})
