import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PreferencesProvider } from './PreferencesProvider'
import SettingsExperience from './SettingsExperience'
import LandingExperience from '@/components/learning/LandingExperience'
import {
  defaultPreferences,
  PREFERENCES_KEY,
  readPreferences,
  reminderCalendar,
} from '@/lib/learning/preferences'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
})
describe('device preferences and calendar reminders', () => {
  it('recovers malformed storage and rejects out-of-range or injected values', () => {
    expect(readPreferences('{bad')).toEqual(defaultPreferences)
    expect(readPreferences('[]')).toEqual(defaultPreferences)
    const parsed = readPreferences(
      JSON.stringify({
        theme: 'evil',
        weeklySessions: -3,
        sessionMinutes: 1000,
        reminderTime: '25:99',
        name: 'a'.repeat(100),
        highContrast: 'true',
      })
    )
    expect(parsed).toMatchObject({
      theme: 'system',
      weeklySessions: 3,
      sessionMinutes: 10,
      reminderTime: '19:00',
      highContrast: false,
    })
    expect(parsed.name).toHaveLength(80)
  })
  it('exports a weekday recurrence starting on the next eligible local day, without personal data', () => {
    const p = {
      ...defaultPreferences,
      name: 'Private name',
      goal: 'Private goal',
      reminderTime: '19:00',
    }
    const calendar = reminderCalendar(p, new Date(2026, 9, 16, 20), 'test-uid')
    expect(calendar).toContain('DTSTART:20261019T190000\r\n')
    expect(calendar).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR')
    expect(calendar).toContain('DURATION:PT10M')
    expect(calendar).toContain('TRIGGER:-PT5M')
    expect(calendar).not.toMatch(/Private|https|_vercel_share/)
    expect(calendar.split('\r\n').every((line) => line.length <= 75)).toBe(true)
  })
  it('exports daily and weekly reminders at the requested hour, including month rollover', () => {
    expect(
      reminderCalendar(
        { ...defaultPreferences, reminderFrequency: 'daily' },
        new Date(2026, 11, 31, 23),
        'daily'
      )
    ).toContain('DTSTART:20270101T190000')
    const weekly = reminderCalendar(
      {
        ...defaultPreferences,
        reminderFrequency: 'weekly',
        reminderDay: 0,
        reminderActivity: 'practice',
        sessionMinutes: 20,
      },
      new Date(2026, 9, 16, 12),
      'weekly'
    )
    expect(weekly).toContain('DTSTART:20261018T190000')
    expect(weekly).toContain('RRULE:FREQ=WEEKLY;BYDAY=SU')
    expect(weekly).toContain('SUMMARY:Rapid Rounds practice')
    expect(weekly).toContain('DURATION:PT20M')
  })
  it('persists profile and display changes, and resets preferences without deleting study results', async () => {
    localStorage.setItem('rapidrounds-study-v1', '[{"unit":"example"}]')
    const view = render(
      <PreferencesProvider>
        <SettingsExperience />
      </PreferencesProvider>
    )
    fireEvent.change(screen.getByLabelText('Preferred name'), {
      target: { value: 'Alex' },
    })
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }))
    fireEvent.change(screen.getByLabelText('Text size'), {
      target: { value: 'larger' },
    })
    fireEvent.click(screen.getByRole('checkbox', { name: /Increase contrast/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Reduce motion/ }))
    await waitFor(() =>
      expect(document.documentElement.dataset.rrMotion).toBe('true')
    )
    expect(document.documentElement).toHaveClass('dark')
    view.unmount()
    render(
      <PreferencesProvider>
        <SettingsExperience />
      </PreferencesProvider>
    )
    expect(screen.getByLabelText('Preferred name')).toHaveValue('Alex')
    expect(screen.getByLabelText('Text size')).toHaveValue('larger')
    fireEvent.click(
      screen.getByRole('button', { name: 'Reset preferences on this device' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Reset my preferences' })
    )
    expect(JSON.parse(localStorage.getItem(PREFERENCES_KEY)!)).toEqual(
      defaultPreferences
    )
    expect(localStorage.getItem('rapidrounds-study-v1')).toBe(
      '[{"unit":"example"}]'
    )
  })
  it('handles unavailable device storage without crashing or claiming it was saved', () => {
    const spy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('blocked')
      })
    render(
      <PreferencesProvider>
        <SettingsExperience />
      </PreferencesProvider>
    )
    fireEvent.change(screen.getByLabelText('Preferred name'), {
      target: { value: 'Alex' },
    })
    expect(screen.getByText(/could not save them/)).toBeInTheDocument()
    expect(screen.getByLabelText('Preferred name')).toHaveValue('Alex')
    spy.mockRestore()
  })
  it('uses the recovered logo and skips the video for reduced motion', () => {
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({ ...defaultPreferences, reduceMotion: true })
    )
    render(
      <PreferencesProvider>
        <LandingExperience />
      </PreferencesProvider>
    )
    expect(
      screen.getByRole('img', { name: 'Rapid Rounds metallic RR logo' })
    ).toHaveAttribute('src', expect.stringContaining('rapidrounds-metallic'))
    expect(
      screen.queryByRole('button', { name: 'Play original introduction' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Enter Rapid Rounds/ })
    ).toHaveAttribute('href', '/home')
  })
})
