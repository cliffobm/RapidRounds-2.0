import { beforeEach, describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ClinicalStudy from './ClinicalStudy'
import { materialStudyTopics } from '@/lib/learning/material-study'
import { clinicalStudyKey } from '@/lib/learning/clinical-study-session'
import { readProgress } from '@/lib/learning/progress'
import { PreferencesProvider } from '@/components/settings/PreferencesProvider'
beforeEach(() => localStorage.clear())
const topic = materialStudyTopics[0]!
const open = () =>
  render(
    <PreferencesProvider>
      <ClinicalStudy topic={topic} />
    </PreferencesProvider>
  )
describe('clinical topic lessons', () => {
  it('restores a selected draft and a confirmed answer after leaving the lesson', async () => {
    let view = open()
    const text = topic.sections[0]!.check.options[1]!
    fireEvent.click(
      await screen.findByRole('radio', { name: text, exact: true })
    )
    view.unmount()
    view = open()
    expect(
      await screen.findByRole('radio', { name: text, exact: true })
    ).toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    view.unmount()
    open()
    expect(await screen.findByRole('status')).toHaveTextContent(
      topic.sections[0]!.check.rationale
    )
    expect(
      screen.getByRole('radio', { name: text, exact: true })
    ).toBeDisabled()
  })
  it('records the actual lesson result once and restarts without rewriting earlier history', async () => {
    open()
    for (const [index, section] of topic.sections.entries()) {
      fireEvent.click(
        await screen.findByRole('radio', {
          name: section.check.options[section.check.correct]!,
          exact: true,
        })
      )
      fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
      fireEvent.click(
        screen.getByRole('button', {
          name: index === 2 ? 'View lesson results' : 'Next section',
        })
      )
    }
    expect(
      await screen.findByRole('region', { name: 'Clinical study result' })
    ).toHaveTextContent('100%')
    const first = readProgress().attempts.find((a) => a.kind === 'study')!
    expect(first).toMatchObject({ correct: 3, answered: 3 })
    fireEvent.click(screen.getByRole('button', { name: 'Restart lesson' }))
    expect(readProgress().attempts.find((a) => a.id === first.id)).toEqual(
      first
    )
    expect(
      JSON.parse(localStorage.getItem(clinicalStudyKey(topic.id))!).complete
    ).toBe(false)
    expect(
      readProgress().unfinished.some(
        (a) => a.href === `/study/topics/${topic.id}`
      )
    ).toBe(true)
  })
})
