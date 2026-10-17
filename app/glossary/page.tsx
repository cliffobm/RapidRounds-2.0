import GlossaryExperience from '@/components/learning/GlossaryExperience'
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ term?: string; view?: string }>
}) {
  const params = await searchParams
  return (
    <GlossaryExperience
      initialQuery={(params.term ?? '').slice(0, 100)}
      initialView={params.view === 'values' ? 'values' : 'terms'}
    />
  )
}
