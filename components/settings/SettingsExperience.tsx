'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  SlidersHorizontal,
  UserRound,
  Eye,
  Target,
  CalendarDays,
  Smartphone,
  Download,
} from 'lucide-react'
import { usePreferences } from './PreferencesProvider'
import { reminderCalendar, type Preferences } from '@/lib/learning/preferences'

export default function SettingsExperience() {
  const {
    preferences: p,
    update,
    ready,
    storageError,
    reset,
  } = usePreferences()
  const [calendarStatus, setCalendarStatus] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const field = (
    key: 'name' | 'pronouns' | 'discipline' | 'unit' | 'experience',
    label: string,
    placeholder: string
  ) => (
    <label className="settings-field">
      {label}
      <input
        value={p[key]}
        maxLength={key === 'pronouns' ? 40 : 80}
        placeholder={placeholder}
        autoComplete={key === 'name' ? 'given-name' : 'off'}
        onChange={(event) => update({ [key]: event.target.value })}
      />
    </label>
  )
  const exportReminder = () => {
    try {
      const blob = new Blob([reminderCalendar(p)], {
        type: 'text/calendar;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'rapidrounds-reminder.ics'
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
      setCalendarStatus(
        'Calendar file created. Open it in your calendar and confirm the repeating event and alert.'
      )
    } catch {
      setCalendarStatus(
        'Could not create the calendar file. Please try again in your browser.'
      )
    }
  }
  return (
    <div className="rr-experience settings-page">
      <Link href="/home" className="text-link">
        <ArrowLeft size={16} /> Back to your learning
      </Link>
      <header className="settings-heading">
        <span className="eyebrow">
          <SlidersHorizontal size={16} /> YOUR APP, YOUR WAY
        </span>
        <h1>Make room for you.</h1>
        <p>A comfortable view. A personal goal. A little space to learn.</p>
      </header>
      <div className="settings-save-status" role="status">
        {!ready
          ? 'Loading your preferences…'
          : storageError
            ? 'Changes work for this visit, but this browser could not save them.'
            : 'Changes save automatically on this device.'}
      </div>
      <nav className="settings-jump" aria-label="Settings sections">
        <a href="#appearance">Display</a>
        <a href="#profile">About you</a>
        <a href="#goals">Goals</a>
        <a href="#reminders">Reminders</a>
      </nav>
      <fieldset disabled={!ready} className="settings-container">
        <legend className="sr-only">Your preferences</legend>
        <section className="settings-card" id="appearance">
          <div className="settings-card-title">
            <Eye />
            <div>
              <h2>Comfort & accessibility</h2>
              <p>Make the experience easier to read and navigate.</p>
            </div>
          </div>
          <fieldset className="settings-choice">
            <legend>Appearance</legend>
            <div>
              {(['system', 'light', 'dark'] as const).map((theme) => (
                <label key={theme}>
                  <input
                    type="radio"
                    name="appearance"
                    value={theme}
                    checked={p.theme === theme}
                    onChange={() => update({ theme })}
                  />
                  <span>
                    {theme === 'system'
                      ? 'Match device'
                      : theme === 'light'
                        ? 'Light'
                        : 'Dark'}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="settings-field">
            Text size
            <select
              value={p.textSize}
              onChange={(event) =>
                update({
                  textSize: event.target.value as Preferences['textSize'],
                })
              }
            >
              <option value="standard">Standard</option>
              <option value="large">Large · 112%</option>
              <option value="larger">Extra large · 125%</option>
            </select>
          </label>
          <label className="settings-toggle">
            <span>
              <strong>Increase contrast</strong>
              <small>Stronger text and boundaries.</small>
            </span>
            <input
              type="checkbox"
              checked={p.highContrast}
              onChange={(event) =>
                update({ highContrast: event.target.checked })
              }
            />
          </label>
          <label className="settings-toggle">
            <span>
              <strong>Reduce motion</strong>
              <small>
                Skip decorative movement and use a still logo. Your device’s
                reduced-motion preference is always respected.
              </small>
            </span>
            <input
              type="checkbox"
              checked={p.reduceMotion}
              onChange={(event) =>
                update({ reduceMotion: event.target.checked })
              }
            />
          </label>
          <p className="settings-hint">
            Keyboard navigation, visible focus, and text feedback are available
            throughout the learning experience. Browser zoom is always
            available.
          </p>
        </section>
        <section className="settings-card" id="profile">
          <div className="settings-card-title">
            <UserRound />
            <div>
              <h2>A little about you</h2>
              <p>Optional details for your learning space.</p>
            </div>
          </div>
          <div className="settings-fields">
            {field('name', 'Preferred name', 'What should we call you?')}
            {field('pronouns', 'Pronouns (optional)', 'e.g. she/her')}
            <label className="settings-field">
              Age range (optional)
              <select
                value={p.ageBand}
                onChange={(event) => update({ ageBand: event.target.value })}
              >
                {[
                  '',
                  '18–24',
                  '25–34',
                  '35–44',
                  '45–54',
                  '55+',
                  'Prefer not to say',
                ].map((value) => (
                  <option key={value} value={value}>
                    {value || 'Choose if you wish'}
                  </option>
                ))}
              </select>
            </label>
            {field(
              'discipline',
              'Discipline or role',
              'e.g. RN, student nurse, respiratory therapist'
            )}
            {field('unit', 'Unit or specialty', 'e.g. Cardiac ICU')}
            {field(
              'experience',
              'Experience level',
              'e.g. New graduate, 2 years in critical care'
            )}
          </div>
          <p className="settings-hint">
            These details are stored only in this browser. They do not change
            question difficulty or assessment results. Leave anything blank,
            especially on a shared device.
          </p>
        </section>
        <section className="settings-card" id="goals">
          <div className="settings-card-title">
            <Target />
            <div>
              <h2>Find your rhythm</h2>
              <p>Choose an achievable intention for your week.</p>
            </div>
          </div>
          <label className="settings-field">
            My learning goal
            <textarea
              maxLength={240}
              rows={3}
              value={p.goal}
              placeholder="e.g. Feel more confident recognizing early deterioration"
              onChange={(event) => update({ goal: event.target.value })}
            />
          </label>
          <div className="settings-fields">
            <label className="settings-field">
              Sessions per week
              <select
                value={p.weeklySessions}
                onChange={(event) =>
                  update({ weeklySessions: Number(event.target.value) })
                }
              >
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <option key={value} value={value}>
                    {value} {value === 1 ? 'session' : 'sessions'}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              Time per session
              <select
                value={p.sessionMinutes}
                onChange={(event) =>
                  update({ sessionMinutes: Number(event.target.value) })
                }
              >
                {[5, 10, 15, 20, 30, 45, 60].map((value) => (
                  <option key={value} value={value}>
                    {value} minutes
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="settings-goal-preview">
            Your intention:{' '}
            <strong>
              {p.weeklySessions} × {p.sessionMinutes} minutes
            </strong>{' '}
            each week.
            <small>
              A target to work toward. Completion and streaks are not tracked
              here.
            </small>
          </div>
        </section>
        <section className="settings-card" id="reminders">
          <div className="settings-card-title">
            <CalendarDays />
            <div>
              <h2>A nudge to return</h2>
              <p>Put your next learning moment on the calendar.</p>
            </div>
          </div>
          <div className="settings-fields">
            <label className="settings-field">
              Remind me to
              <select
                value={p.reminderActivity}
                onChange={(event) =>
                  update({
                    reminderActivity: event.target
                      .value as Preferences['reminderActivity'],
                  })
                }
              >
                <option value="study">Study</option>
                <option value="practice">Practice</option>
              </select>
            </label>
            <label className="settings-field">
              Local time
              <input
                type="time"
                required
                value={p.reminderTime}
                onChange={(event) => {
                  if (event.target.value)
                    update({ reminderTime: event.target.value })
                }}
              />
            </label>
            <label className="settings-field">
              Repeat
              <select
                value={p.reminderFrequency}
                onChange={(event) =>
                  update({
                    reminderFrequency: event.target
                      .value as Preferences['reminderFrequency'],
                  })
                }
              >
                <option value="daily">Every day</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekly">Once a week</option>
              </select>
            </label>
            {p.reminderFrequency === 'weekly' && (
              <label className="settings-field">
                Day
                <select
                  value={p.reminderDay}
                  onChange={(event) =>
                    update({ reminderDay: Number(event.target.value) })
                  }
                >
                  {[
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                  ].map((day, i) => (
                    <option key={day} value={i}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <button
            type="button"
            className="rr-button rr-button-dark"
            onClick={exportReminder}
          >
            <Download size={18} /> Export calendar reminder
          </button>
          <p className="settings-hint">
            Open the downloaded .ics file in Apple Calendar, Google Calendar, or
            Outlook and confirm the import. It requests an alert 5 minutes
            before your session; your calendar controls alert delivery. This
            website does not send push notifications. Changing these settings
            does not update an imported event—edit or delete it in your calendar
            before importing a replacement.
          </p>
          <p role="status" className="settings-hint">
            {calendarStatus}
          </p>
        </section>
        <section className="settings-card">
          <div className="settings-card-title">
            <Smartphone />
            <div>
              <h2>Keep it close</h2>
              <p>A shortcut for the moments between shifts.</p>
            </div>
          </div>
          <p>
            On iPhone, open Safari’s Share menu and choose Add to Home Screen.
            On Android, open your browser menu and look for Add to Home screen.
            This adds a shortcut; an internet connection is still required.
          </p>
          <Link className="text-link" href="/">
            Replay the welcome page →
          </Link>
        </section>
        <section className="settings-card settings-privacy">
          <h2>Your device, your details</h2>
          <p>
            Preferences are not synced to an account. Clearing browser data
            removes them. Each preview website address has its own saved
            settings.
          </p>
          {confirmReset ? (
            <div>
              <p>
                Reset appearance, profile, goals and reminder preferences? Your
                study results and imported calendar events will stay as they
                are.
              </p>
              <button
                type="button"
                className="rr-button rr-button-dark"
                onClick={() => {
                  reset()
                  setConfirmReset(false)
                  setCalendarStatus('')
                }}
              >
                Reset my preferences
              </button>
              <button
                type="button"
                className="settings-cancel"
                onClick={() => setConfirmReset(false)}
              >
                Keep my preferences
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="text-link"
              onClick={() => setConfirmReset(true)}
            >
              Reset preferences on this device
            </button>
          )}
        </section>
      </fieldset>
    </div>
  )
}
