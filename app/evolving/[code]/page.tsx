import { notFound } from 'next/navigation'
import { evolvingCases } from '@/lib/learning/evolving-content'
import EvolvingCaseExperience from '@/components/learning/EvolvingCases'
export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const story = evolvingCases.find((item) => item.id === code)
  if (!story) notFound()
  return <EvolvingCaseExperience key={story.id} story={story} />
}
