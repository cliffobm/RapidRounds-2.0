import 'server-only'
import { supabase } from '@/lib/supabase'

// Minimal shape matching components/scenario/AnswerBlock.Question
export type RRQuestion = {
  id: string
  type: 'multiple_choice'
  question: string
  options: Array<{ id: string; text: string }>
  correctAnswers?: string[]
  points: number
}

export async function fetchScenarioQuestionsByCode(code: string): Promise<{ scenarioTitle: string; questions: RRQuestion[] }> {
  // Calls rr.get_scenario_questions(scenario_code text)
  const { data, error } = await supabase
    .rpc('rr.get_scenario_questions', { scenario_code: code })

  if (error) {
    // Provide clearer error for common misconfigurations
    const hint =
      'Ensure NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are set and the rr schema + RPCs are migrated into the target project.'
    throw new Error(`Failed to fetch scenario questions for code "${code}": ${error.message}. ${hint}`)
  }

  // data rows shape per migration: one row per option; need to group by question_id
  const byQuestion = new Map<string, { stem: string; options: Array<{ id: string; text: string }>; }>()
  let scenarioTitle = code

  for (const row of (data as any[] || [])) {
    const qid = row.question_id as string
    const stem = row.stem as string
    const optId = row.option_id as string
    const optIdx = row.option_idx as number
    const optText = row.option_text as string

    if (!byQuestion.has(qid)) {
      byQuestion.set(qid, { stem, options: [] })
    }
    const q = byQuestion.get(qid)!
    q.options.push({ id: String(optIdx), text: optText })
  }

  const questions: RRQuestion[] = Array.from(byQuestion.entries()).map(([id, q]) => ({
    id,
    type: 'multiple_choice',
    question: q.stem,
    options: q.options,
    points: 10,
  }))

  return { scenarioTitle, questions }
}


