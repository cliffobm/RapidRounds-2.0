import QuickCheck from '@/components/learning/QuickCheck'
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ count?: string; topic?: string }>
}) {
  const params = await searchParams
  return (
    <QuickCheck
      key={`${params.count}:${params.topic}`}
      initialCount={params.count === '10' ? 10 : 5}
      initialTopic={params.topic?.slice(0, 100) ?? ''}
    />
  )
}
