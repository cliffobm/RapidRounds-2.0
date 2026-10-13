import { fetchScenarioQuestionsByCode } from '@/lib/qbank/rr'
import RRScenarioClient from '@/components/qbank/RRScenarioClient'

type Params = { params: Promise<{ code: string }> }

export default async function Page({ params }: Params) {
  const { code } = await params
  try {
    const { scenarioTitle, questions } = await fetchScenarioQuestionsByCode(code)
    return <RRScenarioClient title={scenarioTitle} questions={questions} />
  } catch {
    return <div className="p-8"><h1>Question bank unavailable</h1><p>The RR schema and question-bank RPC need to be configured in the development project.</p><a href="/rr">Back to scenarios</a></div>
  }
}


