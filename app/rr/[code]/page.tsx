import { fetchScenarioQuestionsByCode } from '@/lib/qbank/rr'
import RRScenarioClient from '@/components/qbank/RRScenarioClient'

type Params = { params: { code: string } }

export default async function Page({ params }: Params) {
  const code = params.code
  const { scenarioTitle, questions } = await fetchScenarioQuestionsByCode(code)
  return <RRScenarioClient title={scenarioTitle} questions={questions} />
}


