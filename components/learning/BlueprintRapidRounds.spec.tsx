import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BlueprintRapidRounds from './BlueprintRapidRounds'
import { rapidRounds } from '@/lib/learning/rapid-rounds'
vi.mock('@/store/useAuth', () => ({
  useAuth: (selector: (s: unknown) => unknown) =>
    selector({ user: { id: 'tester-a' } }),
}))
beforeEach(() => localStorage.clear())
afterEach(() => vi.useRealTimers())
describe('guided Rapid Round experience', () => {
  it('lets the learner continue after an incorrect response and preserves the first choice in the debrief', () => {
    const story = rapidRounds.find(
      (r) => r.id === 'comfortable-or-too-sedated'
    )!
    render(<BlueprintRapidRounds initialRoundId={story.id} />)
    fireEvent.click(screen.getByRole('button', { name: 'Start guided round' }))
    for (let i = 0; i < 4; i++) {
      const p = story.steps[i]!
      if (p.format !== 'choice') throw Error('Choice fixture expected')
      fireEvent.click(
        screen.getByRole('radio', { name: p.options[i === 0 ? 1 : 0]!.text })
      )
      fireEvent.click(
        screen.getByRole('button', { name: 'Explore this decision' })
      )
      expect(screen.getByRole('status')).toHaveTextContent(
        i === 0 ? 'Let’s connect the clues.' : 'That fits the situation.'
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: i === 3 ? 'Take your takeaway' : 'Next patient update',
        })
      )
    }
    expect(
      screen.getByRole('heading', {
        name: 'Take the next connection with you.',
      })
    ).toBeInTheDocument()
    expect(screen.queryByText(/failed|ground zero/i)).not.toBeInTheDocument()
    expect(
      screen.getByText(/3 of 4 answered prompts fully matched/)
    ).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Try the clue challenge' })
    )
    fireEvent.click(screen.getByLabelText(story.clue.options[0]!.text))
    fireEvent.click(screen.getByRole('button', { name: 'Check the clue' }))
    expect(
      screen.getByText('That clue challenges the explanation.')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/3 of 4 answered prompts fully matched/)
    ).toBeInTheDocument()
  })
  it('requires every matrix row and gives explicit partial-credit feedback', () => {
    render(<BlueprintRapidRounds />)
    fireEvent.click(screen.getByRole('button', { name: 'Start guided round' }))
    expect(
      screen.getByRole('button', { name: 'Explore this decision' })
    ).toBeDisabled()
    const matrix = screen.getByRole('group', {
      name: rapidRounds[0]!.steps[0]!.prompt,
    })
    const radios = within(matrix).getAllByRole('radio', {
      name: 'No acute change',
    })
    radios.forEach((r) => fireEvent.click(r))
    fireEvent.click(
      screen.getByRole('button', { name: 'Explore this decision' })
    )
    expect(
      screen.getByText(
        '1 of 4 classifications match. Each row contributes equally to this prompt.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Next patient update' })
    ).toBeEnabled()
  })
  it('holds explanations until an independent round is complete', () => {
    const story = rapidRounds.find(
      (r) => r.id === 'comfortable-or-too-sedated'
    )!
    render(<BlueprintRapidRounds initialRoundId={story.id} />)
    fireEvent.click(screen.getByRole('radio', { name: /Independent round/ }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Start independent round' })
    )
    const first = story.steps[0]!
    if (first.format !== 'choice') throw Error('Choice fixture expected')
    fireEvent.click(screen.getByRole('radio', { name: first.options[0]!.text }))
    fireEvent.click(screen.getByRole('button', { name: 'Save decision' }))
    expect(screen.queryByText(first.brief)).not.toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: story.steps[1]!.prompt })
    ).toBeInTheDocument()
  })
  it('pauses the active timer while a tester writes feedback', () => {
    vi.useFakeTimers({
      toFake: ['setInterval', 'clearInterval', 'Date', 'performance'],
    })
    render(<BlueprintRapidRounds />)
    fireEvent.click(screen.getByRole('button', { name: 'Start guided round' }))
    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByText('Active time 0:02')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Flag this item' }))
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.getByText('Active time 0:02')).toBeInTheDocument()
    expect(
      screen.getByText('Clock paused while writing feedback')
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByText('Active time 0:03')).toBeInTheDocument()
  })
})
