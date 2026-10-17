import { z } from 'zod'

export const learningStoragePrefix = 'rapidrounds-session-v1:'
export function contentRevision(value: unknown): string {
  let hash = 2166136261
  for (const character of JSON.stringify(value))
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619)
  return (hash >>> 0).toString(16)
}
export function readSession<T>(
  raw: string | null,
  revision: string,
  schema: z.ZodType<T>
): T | null {
  try {
    const envelope = JSON.parse(raw ?? 'null')
    if (envelope?.revision !== revision) return null
    const result = schema.safeParse(envelope.state)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

const activitySchema = z.object({
  id: z.string().max(150),
  title: z.string().max(150),
  href: z
    .string()
    .regex(
      /^\/(rr\/(sepsis|tavr|chest-pain|neuro-change|respiratory-change|fluid-loss)|quiz\?bank=[a-z_]+|study\?pillar=[a-z_]+)$/
    ),
  completedAt: z.string().datetime(),
})
export type LearningActivity = z.infer<typeof activitySchema>
export function readActivities(raw: string | null): LearningActivity[] {
  try {
    const parsed = z
      .array(activitySchema)
      .max(200)
      .safeParse(JSON.parse(raw ?? '[]'))
    return parsed.success ? parsed.data : []
  } catch {
    return []
  }
}
export const activityKey = 'rapidrounds-activity-v1'
export function recordActivity(activity: LearningActivity) {
  try {
    const current = readActivities(localStorage.getItem(activityKey))
    // One completion per content revision. Replays do not inflate session totals.
    if (!current.some((entry) => entry.id === activity.id)) {
      localStorage.setItem(
        activityKey,
        JSON.stringify([...current, activity].slice(-200))
      )
      window.dispatchEvent(new Event('rapidrounds-progress'))
    }
    return true
  } catch {
    return false
  }
}
