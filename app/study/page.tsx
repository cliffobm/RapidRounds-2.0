import StudyExperience from '@/components/learning/StudyExperience'
import { pillars, type PillarId } from '@/lib/learning/pillars'
export default async function Page({ searchParams }: { searchParams: Promise<{ pillar?: string }> }) {
  const { pillar } = await searchParams
  const initialUnit = pillars.some(entry => entry.id === pillar) ? pillar as PillarId : ''
  return <StudyExperience key={initialUnit} initialUnit={initialUnit} />
}
