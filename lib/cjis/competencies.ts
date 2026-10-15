import registry from '@/cjis/competencies.json'

export const competencyRegistry = registry
export const competencyLabel = (operation: string) => operation.replace(/_/g, ' ')
