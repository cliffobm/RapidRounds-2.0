import RapidResponse from '@/components/learning/RapidResponse'
import '../rapid-response.css'

export default async function RapidResponsePage({
  searchParams,
}: {
  searchParams: Promise<{
    case?: string | string[]
    session?: string | string[]
  }>
}) {
  const params = await searchParams
  return (
    <RapidResponse
      initialCaseId={typeof params.case === 'string' ? params.case : ''}
      initialSessionId={
        typeof params.session === 'string' ? params.session : ''
      }
    />
  )
}
