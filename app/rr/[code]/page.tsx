import { fetchScenarioQuestionsByCode } from '@/lib/qbank/rr'
import RRScenarioClient from '@/components/qbank/RRScenarioClient'

type Params = { params: Promise<{ code: string }> }

export default async function Page({ params }: Params) {
  const { code } = await params
  const { scenarioTitle, questions } = await fetchScenarioQuestionsByCode(code)
  return <RRScenarioClient title={scenarioTitle} questions={questions} />
}


