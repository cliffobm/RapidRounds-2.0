'use client'

import { useState } from 'react'
import { AnswerBlock, type Question as UIQuestion } from '@/components/scenario/AnswerBlock'

type Props = {
  title: string
  questions: Array<{
    id: string
    question: string
    options: Array<{ id: string; text: string }>
    points: number
  }>
}

export default function RRScenarioClient({ title, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({})

  const mapped: UIQuestion[] = questions.map(q => ({
    id: q.id,
    type: 'multiple_choice',
    question: q.question,
    options: q.options.map(o => ({ id: o.id, text: o.text })),
    points: q.points,
  }))

  if (!mapped.length) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">{title}</h1>
        <p className="text-slate-600">No questions available for this scenario. Ensure your Supabase project is seeded.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {mapped.map((q, idx) => (
        <div key={q.id} className="border rounded-xl p-4">
          <h2 className="text-lg font-medium mb-2">Question {idx + 1}</h2>
          <AnswerBlock
        submittedAnswer={answers[q.id]}
            question={q}
            onAnswer={(ans) => setAnswers(prev => ({ ...prev, [q.id]: ans }))}
            showRationale={false}
          />
        </div>
      ))}
    </div>
  )
}
