import BlueprintRapidRounds from '@/components/learning/BlueprintRapidRounds'
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ case?: string; resume?: string }>
}) {
  const params = await searchParams
  return (
    <BlueprintRapidRounds
      initialRoundId={params.case ?? ''}
      initialSessionId={params.resume ?? ''}
    />
  )
}
