import { notFound } from 'next/navigation'
import { getPracticeCase } from '@/lib/rr-catalog'
import RRScenarioClient from '@/components/qbank/RRScenarioClient'

type Params = { params: Promise<{ code: string }> }
export default async function Page({ params }: Params) {
  const { code } = await params
  const scenario = getPracticeCase(code)
  if (!scenario) notFound()
  return <RRScenarioClient key={scenario.code} scenario={scenario} />
}
