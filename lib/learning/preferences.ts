export const PREFERENCES_KEY = 'rapidrounds-preferences-v1'
export type Preferences = {
  interfaceMode: 'guided' | 'focus'
  reasoningLevel: 'foundation' | 'challenge' | 'advanced'
  scenarioClock: 'pause' | 'handoff'
  theme: 'system' | 'light' | 'dark'
  textSize: 'standard' | 'large' | 'larger'
  reduceMotion: boolean
  highContrast: boolean
  name: string
  pronouns: string
  ageBand: string
  discipline: string
  unit: string
  experience: string
  goal: string
  weeklySessions: number
  sessionMinutes: number
  reminderActivity: 'study' | 'practice'
  reminderTime: string
  reminderFrequency: 'daily' | 'weekdays' | 'weekly'
  reminderDay: number
}
export const defaultPreferences: Preferences = {
  interfaceMode: 'guided',
  reasoningLevel: 'foundation',
  scenarioClock: 'pause',
  theme: 'system',
  textSize: 'standard',
  reduceMotion: false,
  highContrast: false,
  name: '',
  pronouns: '',
  ageBand: '',
  discipline: '',
  unit: '',
  experience: '',
  goal: '',
  weeklySessions: 3,
  sessionMinutes: 10,
  reminderActivity: 'study',
  reminderTime: '19:00',
  reminderFrequency: 'weekdays',
  reminderDay: 1,
}
const oneOf = <T extends string>(
  value: unknown,
  choices: readonly T[],
  fallback: T
): T => (choices.includes(value as T) ? (value as T) : fallback)
const text = (value: unknown, max = 80) =>
  typeof value === 'string' ? value.slice(0, max) : ''
const integer = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= min &&
  value <= max
    ? value
    : fallback
export function readPreferences(raw: string | null): Preferences {
  try {
    const p = JSON.parse(raw ?? 'null')
    if (!p || typeof p !== 'object' || Array.isArray(p))
      return { ...defaultPreferences }
    return {
      interfaceMode: oneOf(p.interfaceMode, ['guided', 'focus'], 'guided'),
      reasoningLevel: oneOf(
        p.reasoningLevel,
        ['foundation', 'challenge', 'advanced'],
        'foundation'
      ),
      scenarioClock: oneOf(p.scenarioClock, ['pause', 'handoff'], 'pause'),
      theme: oneOf(p.theme, ['system', 'light', 'dark'], 'system'),
      textSize: oneOf(p.textSize, ['standard', 'large', 'larger'], 'standard'),
      reduceMotion: p.reduceMotion === true,
      highContrast: p.highContrast === true,
      name: text(p.name),
      pronouns: text(p.pronouns, 40),
      ageBand: oneOf(
        p.ageBand,
        ['', '18–24', '25–34', '35–44', '45–54', '55+', 'Prefer not to say'],
        ''
      ),
      discipline: text(p.discipline),
      unit: text(p.unit),
      experience: text(p.experience),
      goal: text(p.goal, 240),
      weeklySessions: integer(p.weeklySessions, 1, 7, 3),
      sessionMinutes: integer(p.sessionMinutes, 5, 60, 10),
      reminderActivity: oneOf(
        p.reminderActivity,
        ['study', 'practice'],
        'study'
      ),
      reminderTime:
        typeof p.reminderTime === 'string' &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(p.reminderTime)
          ? p.reminderTime
          : '19:00',
      reminderFrequency: oneOf(
        p.reminderFrequency,
        ['daily', 'weekdays', 'weekly'],
        'weekdays'
      ),
      reminderDay: integer(p.reminderDay, 0, 6, 1),
    }
  } catch {
    return { ...defaultPreferences }
  }
}

const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
const pad = (n: number) => String(n).padStart(2, '0')
const localDate = (date: Date) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`

// Floating local time keeps the chosen wall-clock hour across DST and travel.
// No profile data, share tokens, or private goal text is exported.
export function reminderCalendar(
  p: Preferences,
  now = new Date(),
  uid = crypto.randomUUID()
): string {
  const [hour, minute] = p.reminderTime.split(':').map(Number)
  const start = new Date(now)
  start.setHours(hour!, minute!, 0, 0)
  if (start <= now) start.setDate(start.getDate() + 1)
  while (
    (p.reminderFrequency === 'weekdays' && [0, 6].includes(start.getDay())) ||
    (p.reminderFrequency === 'weekly' && start.getDay() !== p.reminderDay)
  )
    start.setDate(start.getDate() + 1)
  const recurrence =
    p.reminderFrequency === 'daily'
      ? 'FREQ=DAILY'
      : p.reminderFrequency === 'weekdays'
        ? 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'
        : `FREQ=WEEKLY;BYDAY=${days[p.reminderDay]}`
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RapidRounds//Learning reminders//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}@rapidrounds`,
    `DTSTAMP:${now
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z')}`,
    `DTSTART:${localDate(start)}`,
    `DURATION:PT${p.sessionMinutes}M`,
    `RRULE:${recurrence}`,
    `SUMMARY:Rapid Rounds ${p.reminderActivity}`,
    'DESCRIPTION:Open Rapid Rounds for your learning session.',
    'BEGIN:VALARM',
    'TRIGGER:-PT5M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Your Rapid Rounds learning session starts soon.',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}
