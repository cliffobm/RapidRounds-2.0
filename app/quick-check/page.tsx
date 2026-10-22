import LegacyCheckEntry from '@/components/learning/LegacyCheckEntry'
import '../practice.css'
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ count?: string; topic?: string }>
}) {
  const params = await searchParams
  return (
    <LegacyCheckEntry
      key={`${params.count}:${params.topic}`}
      initialCount={params.count === '10' ? 10 : 5}
      initialTopic={params.topic?.slice(0, 100) ?? ''}
    />
  )
}
