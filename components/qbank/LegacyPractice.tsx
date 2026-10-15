'use client'

import { useRef, useState } from 'react'
import BankSelector from '@/components/BankSelector'
import { BANKS, type BankKey } from '@/qbank/banks'
import { competencyRegistry, competencyLabel } from '@/lib/cjis/competencies'
import { loadLegacyPractice, recordPracticeResponse, type PracticeResponse } from '@/lib/cjis/practice'

export default function LegacyPractice() {
  const [bankKey, setBankKey] = useState<BankKey | ''>('')
  return (
    <section className="max-w-3xl mx-auto p-6 space-y-6" aria-label="Question bank practice">
      <h1 className="text-2xl font-bold">Clinical judgment practice</h1>
      <p>Practice with the original Rapid Rounds questions. These draft questions do not contribute to a competency score.</p>
      <details>
        <summary>Clinical judgment competencies</summary>
        <ul>{competencyRegistry.operations.map(operation => <li key={operation}>{competencyLabel(operation)}</li>)}</ul>
        <p>Question complexity and clinical domain are separate from measured difficulty.</p>
      </details>
      <BankSelector value={bankKey} onChange={key => {
        if (Object.prototype.hasOwnProperty.call(BANKS, key)) setBankKey(key as BankKey)
      }} />
      {bankKey ? <PracticeBank key={bankKey} bankKey={bankKey} /> : <p>Choose a topic to begin.</p>}
    </section>
  )
}

function PracticeBank({ bankKey }: { bankKey: BankKey }) {
  const [bank] = useState(() => {
    try { return { data: loadLegacyPractice(bankKey), error: '' } }
    catch (error) { return { data: null, error: error instanceof Error ? error.message : 'Unable to load bank' } }
  })
  const [index, setIndex] = useState(0)
  const [responses, setResponses] = useState<PracticeResponse[]>([])
  const [answer, setAnswer] = useState<PracticeResponse | null>(null)
  const started = useRef(Date.now())
  const submitted = useRef(false)
  if (!bank.data) return <p role="alert">This bank needs content review: {bank.error}</p>
  const item = bank.data.items[index]
  if (!item) return <p>This bank has no practice questions.</p>
  const respond = (selected: string | null) => {
    if (submitted.current) return
    submitted.current = true
    const response = recordPracticeResponse(item, bank.data!.version, selected,
      Math.max(0, Date.now() - started.current), responses)
    setResponses(previous => [...previous, response])
    setAnswer(response)
  }
  const next = () => {
    if (!submitted.current) respond(null)
    setIndex(previous => (previous + 1) % bank.data!.items.length)
    setAnswer(null)
    submitted.current = false
    started.current = Date.now()
  }
  return (
    <article className="space-y-4" aria-label="Practice question">
      <p>Question {index + 1} of {bank.data.items.length} · Draft · Competency mapping pending</p>
      <h2 className="text-lg font-semibold whitespace-pre-line">{item.stem}</h2>
      <ul className="space-y-2">{item.options.map(option => (
        <li key={option.id}>
          <button className="border rounded px-4 py-2 text-left w-full disabled:opacity-60"
            disabled={answer !== null} onClick={() => respond(option.id)}>
            {option.id}. {option.text}
          </button>
        </li>
      ))}</ul>
      {answer && <div role="status">
        <p>{answer.outcome === 'correct' ? 'Correct.' : 'Review the answer.'} Practice feedback only.</p>
        <p>Correct answer: {item.correct_option_id}</p>
        <p>{typeof item.rationale.legacy_text === 'string' ? item.rationale.legacy_text : 'Rationale requires content review.'}</p>
      </div>}
      <button className="border rounded px-4 py-2" onClick={next}>{answer ? 'Next question' : 'Skip question'}</button>
      <p>{responses.filter(response => response.outcome !== 'nonresponse').length} practice responses this session. No competency score calculated.</p>
      <p className="text-sm">Session records stay in memory and reset when you change banks or reload.</p>
    </article>
  )
}
