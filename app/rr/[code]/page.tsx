import { guidedCases } from '@/lib/learning/cases'
import { GuidedRound } from '@/components/learning/RoundsExperience'
import { notFound } from 'next/navigation'
export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const story = guidedCases.find(entry => entry.id === code)
  if (!story) notFound()
  return <GuidedRound key={story.id} story={story} />
}
