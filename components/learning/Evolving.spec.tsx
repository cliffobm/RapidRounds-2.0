import { beforeEach, describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { PreferencesProvider } from '@/components/settings/PreferencesProvider'
import {
  PREFERENCES_KEY,
  defaultPreferences,
  readPreferences,
} from '@/lib/learning/preferences'
import {
  evolvingCases,
  reasoningQuestions,
} from '@/lib/learning/evolving-content'
import {
  newCaseSession,
  readCaseSession,
  evolvingKey,
  offerReturnHandoff,
  acceptReturnHandoff,
} from '@/lib/learning/evolving-session'
import { questionFor, orderedOptions } from '@/lib/learning/evolving-types'
import { contentSources } from '@/lib/learning/sources'
import { readActivities, activityKey } from '@/lib/learning/sessions'
import EvolvingCaseExperience from './EvolvingCases'
import QuickCheck from './QuickCheck'
beforeEach(() => localStorage.clear())
describe('evolving reasoning practice', () => {
  it('records departure time for internal navigation rather than counting reading time as time away', () => {
    const story = evolvingCases[0]!,
      saved = newCaseSession(story, 'foundation', 'handoff', 0, 100)
    localStorage.setItem(evolvingKey(story.id), JSON.stringify(saved))
    const view = render(
      <PreferencesProvider>
        <EvolvingCaseExperience story={story} />
      </PreferencesProvider>
    )
    const now = vi.spyOn(Date, 'now').mockReturnValue(5000)
    try {
      view.unmount()
    } finally {
      now.mockRestore()
    }
    expect(
      JSON.parse(localStorage.getItem(evolvingKey(story.id))!).lastSeen
    ).toBe(5000)
  })
  it('has complete reviewed-shape draft content and distinct clinical paths without generating arbitrary values', () => {
    expect(evolvingCases).toHaveLength(6)
    expect(reasoningQuestions).toHaveLength(36)
    expect(new Set(reasoningQuestions.map((q) => q.id)).size).toBe(36)
    for (const level of ['foundation', 'challenge', 'advanced'])
      expect(reasoningQuestions.filter((q) => q.level === level)).toHaveLength(
        12
      )
    for (const story of evolvingCases) {
      expect(story.paths).toHaveLength(2)
      expect(story.sources.every((source) => contentSources[source])).toBe(true)
      expect(story.paths[0]!.frames.map((f) => f.observation)).not.toEqual(
        story.paths[1]!.frames.map((f) => f.observation)
      )
      expect(story.paths[0]!.frames.map((f) => f.question.prompt)).not.toEqual(
        story.paths[1]!.frames.map((f) => f.question.prompt)
      )
      for (const path of story.paths) {
        expect(path.frames).toHaveLength(6)
        for (const frame of path.frames) {
          for (const question of [frame.question, frame.complex]) {
            expect(
              question.correct.every((id) =>
                question.options.some((option) => option.id === id)
              )
            ).toBe(true)
            expect(
              question.options.every((option) => option.explanation.length > 25)
            ).toBe(true)
          }
          expect(frame.observation.hr).toBeGreaterThan(0)
          expect(frame.observation.spo2).toBeLessThanOrEqual(100)
        }
      }
    }
  })
  it('pins a saved version and option order and rejects malformed or stale state', () => {
    const story = evolvingCases[0]!,
      s = newCaseSession(story, 'challenge', 'handoff', 0, 100)
    const restored = readCaseSession(JSON.stringify(s), story)!
    expect(restored).toEqual(s)
    expect(newCaseSession(story, 'challenge', 'handoff', 1).pathId).not.toBe(
      s.pathId
    )
    const q = questionFor(story.paths[0]!.frames[0]!, 'challenge')
    expect(orderedOptions(q, restored.attempt)).toEqual(
      orderedOptions(q, s.attempt)
    )
    expect(
      readCaseSession(JSON.stringify({ ...s, selected: ['bogus'] }), story)
    ).toBeNull()
    expect(
      readCaseSession(JSON.stringify({ ...s, revision: 'old' }), story)
    ).toBeNull()
  })
  it('offers one opt-in return checkpoint, preserves confirmed answers and never fabricates an error for time away', () => {
    const story = evolvingCases[0]!,
      now = 31 * 60 * 1000
    const first = {
      selected: ['0', '1'],
      rationale: 'The new cognitive change needs review alongside uncertainty.',
      confidence: 'confident' as const,
      assisted: false,
      skipped: false,
    }
    const s = {
      ...newCaseSession(story, 'challenge', 'handoff', 0, 0),
      index: 1,
      answers: [first],
      selected: ['1'],
    }
    expect(offerReturnHandoff({ ...s, clock: 'pause' }, now)).toBe(false)
    expect(offerReturnHandoff(s, 10 * 60 * 1000)).toBe(false)
    const next = acceptReturnHandoff(s, now)
    expect(next.index).toBe(2)
    expect(next.answers[0]).toEqual(first)
    expect(next.answers[1]).toMatchObject({ skipped: true, selected: [] })
    expect(next.selected).toEqual([])
    expect(readCaseSession(JSON.stringify(next), story)).toEqual(next)
    expect(offerReturnHandoff({ ...s, answers: [first, first] }, now)).toBe(
      false
    )
  })
  it('preserves selected answers through reload and holds advanced feedback until the debrief', async () => {
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({ ...defaultPreferences, reasoningLevel: 'advanced' })
    )
    const story = evolvingCases[0]!
    let view = render(
      <PreferencesProvider>
        <EvolvingCaseExperience story={story} />
      </PreferencesProvider>
    )
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Advanced', exact: true })
      ).toHaveAttribute('aria-pressed', 'true')
    )
    fireEvent.click(screen.getByRole('button', { name: 'Start case' }))
    const path = story.paths[0]!
    for (const [index, frame] of path.frames.entries()) {
      const q = frame.complex
      q.correct.forEach((id) =>
        fireEvent.click(
          screen.getByRole('checkbox', {
            name: q.options.find((o) => o.id === id)!.text,
            exact: true,
          })
        )
      )
      fireEvent.change(screen.getByRole('textbox'), {
        target: {
          value:
            'My priority is the changed clinical state; I would reassess alternatives and missing evidence.',
        },
      })
      if (index === 0) {
        view.unmount()
        view = render(
          <PreferencesProvider>
            <EvolvingCaseExperience story={story} />
          </PreferencesProvider>
        )
        q.correct.forEach((id) =>
          expect(
            screen.getByRole('checkbox', {
              name: q.options.find((o) => o.id === id)!.text,
              exact: true,
            })
          ).toBeChecked()
        )
      }
      fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }))
      expect(screen.getByRole('status')).toHaveTextContent(
        'Feedback will appear in the debrief'
      )
      expect(
        screen.queryByText(q.options[0]!.explanation, { exact: true })
      ).not.toBeInTheDocument()
      fireEvent.click(
        screen.getByRole('button', {
          name: index === 5 ? 'View results' : 'Next decision',
        })
      )
    }
    expect(
      screen.getByRole('heading', { name: 'Your case results' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Advanced', exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(readActivities(localStorage.getItem(activityKey))).toEqual([
      expect.objectContaining({ href: '/evolving/fever-neuro' }),
    ])
    fireEvent.click(screen.getByRole('button', { name: 'Try another version' }))
    expect(
      JSON.parse(localStorage.getItem(evolvingKey(story.id))!).pathId
    ).toBe('b')
  })
  it('runs ten unique case-linked questions without feedback leaks and resumes saved choices', async () => {
    let view = render(
      <PreferencesProvider>
        <QuickCheck initialCount={10} />
      </PreferencesProvider>
    )
    await screen.findByRole('button', { name: 'Start 10-question check' })
    fireEvent.click(
      screen.getByRole('button', { name: 'Start 10-question check' })
    )
    const key = 'rapidrounds-quick-v1:10:'
    for (let index = 0; index < 10; index++) {
      const saved = JSON.parse(localStorage.getItem(key)!)
      const item = reasoningQuestions.find((q) => q.id === saved.ids[index])!
      fireEvent.click(
        screen.getByRole('radio', { name: item.options[0]!.text, exact: true })
      )
      if (index === 2) {
        view.unmount()
        view = render(
          <PreferencesProvider>
            <QuickCheck initialCount={10} />
          </PreferencesProvider>
        )
        await waitFor(() =>
          expect(
            screen.getByRole('radio', {
              name: item.options[0]!.text,
              exact: true,
            })
          ).toBeChecked()
        )
      }
      expect(
        screen.queryByText(item.options[0]!.explanation, { exact: true })
      ).not.toBeInTheDocument()
      fireEvent.click(
        screen.getByRole('button', {
          name: index === 9 ? 'Submit check' : 'Save and continue',
        })
      )
    }
    expect(screen.getByText(/10 of 10 questions correct/)).toBeInTheDocument()
    expect(new Set(JSON.parse(localStorage.getItem(key)!).ids).size).toBe(10)
  })
  it('keeps focus and challenge preferences separate from subscription identity', () => {
    expect(
      readPreferences(
        JSON.stringify({
          interfaceMode: 'focus',
          reasoningLevel: 'advanced',
          scenarioClock: 'handoff',
          isSubscriber: true,
        })
      )
    ).toMatchObject({
      interfaceMode: 'focus',
      reasoningLevel: 'advanced',
      scenarioClock: 'handoff',
    })
    expect(
      readPreferences(
        JSON.stringify({
          interfaceMode: 'paid',
          reasoningLevel: 'expert',
          scenarioClock: 'live',
        })
      )
    ).toMatchObject({
      interfaceMode: 'guided',
      reasoningLevel: 'foundation',
      scenarioClock: 'pause',
    })
  })
})
