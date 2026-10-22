import UnifiedPractice from '@/components/learning/UnifiedPractice'
import '../practice.css'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    collection?: string
    mode?: string
    count?: string
    session?: string
    level?: string
  }>
}) {
  const params = await searchParams
  const level =
    (
      ['all', 'foundation', 'challenge', 'advanced', 'unclassified'] as const
    ).find((value) => value === params.level) ?? 'all'
  return (
    <UnifiedPractice
      key={`${params.session ?? ''}:${params.collection ?? ''}:${params.mode ?? ''}:${params.count ?? ''}:${level}`}
      initialCollection={params.collection?.slice(0, 100) ?? 'all'}
      initialMode={params.mode === 'check' ? 'check' : 'guided'}
      initialCount={params.count === '10' ? 10 : 5}
      initialLevel={level}
      initialSessionId={params.session?.slice(0, 100) ?? ''}
    />
  )
}
