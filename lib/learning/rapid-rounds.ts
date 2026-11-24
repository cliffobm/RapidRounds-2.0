export * from './rapid-rounds-model'
export { rapidRounds } from './rapid-rounds-content'
import { rapidRounds } from './rapid-rounds-content'
import {
  bloomTargets,
  rapidRoundRevision,
  roundCategories,
  roundSkills,
} from './rapid-rounds-model'

export function getRapidRound(id: string, revision = rapidRoundRevision) {
  return revision === rapidRoundRevision
    ? rapidRounds.find((r) => r.id === id)
    : undefined
}
export function rapidRoundBlueprint() {
  const items = rapidRounds.flatMap((r) => r.steps)
  return {
    total: items.length,
    categories: Object.entries(roundCategories).map(([id, v]) => ({
      id,
      ...v,
      actual: items.filter((i) => i.category === id).length,
    })),
    cognition: Object.entries(bloomTargets).map(([id, target]) => ({
      id,
      target,
      actual: items.filter((i) => i.bloom === id).length,
    })),
    skills: Object.entries(roundSkills).map(([id, title]) => ({
      id,
      title,
      actual: items.filter((i) => i.skill === id).length,
    })),
    formats: {
      choice: items.filter((i) => i.format === 'choice').length,
      matrix: items.filter((i) => i.format === 'matrix').length,
    },
    prerequisites: items.filter((i) => i.skill === null).length,
  }
}
