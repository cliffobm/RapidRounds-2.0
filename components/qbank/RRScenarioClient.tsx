'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import { AnswerBlock } from '@/components/scenario/AnswerBlock'
import { Button } from '@/components/ui/Button'
import { isQuestionAnswerCorrect } from '@/lib/question-answer'
import type { PracticeCase } from '@/lib/rr-catalog'

export default function RRScenarioClient({
  scenario,
}: {
  scenario: PracticeCase
}) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [assisted, setAssisted] = useState<Record<string, boolean>>({})
  const heading = useRef<HTMLHeadingElement>(null)
  const complete = index >= scenario.questions.length
  const question = scenario.questions[index]
  const submitted = question ? answers[question.id] : undefined
  useEffect(() => {
    if (index > 0) heading.current?.focus()
  }, [index])
  const restart = () => {
    setIndex(0)
    setAnswers({})
    setAssisted({})
  }
  const correctCount = scenario.questions.filter(
    (q) => answers[q.id] && isQuestionAnswerCorrect(q, answers[q.id]!)
  ).length

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/rr"
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted hover:text-signal"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to RR Scenarios
      </Link>
      <header className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">
          {scenario.system} ·{' '}
          {scenario.kind === 'guided' ? 'Guided case' : 'Practice case'}
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-ink">
          {scenario.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Draft learning preview · Untimed · No XP or competency score
        </p>
      </header>
      {complete ? (
        <section
          className="rounded-2xl border border-edge bg-surface p-6 sm:p-8"
          aria-labelledby="practice-summary"
        >
          <CheckCircle2
            className="mb-5 h-9 w-9 text-positive"
            aria-hidden="true"
          />
          <h2
            id="practice-summary"
            ref={heading}
            tabIndex={-1}
            className="text-2xl font-semibold text-ink"
          >
            Every decision teaches something.
          </h2>
          <p className="mt-3 leading-relaxed text-muted">
            You completed all {scenario.questions.length} decisions. Take the
            reasoning into your next practice round.
          </p>
          <dl className="my-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-surface-raised p-5">
              <dt className="text-sm text-muted">
                Practice responses matching the draft key
              </dt>
              <dd className="mt-2 text-3xl font-semibold tabular-nums text-ink">
                {correctCount} / {scenario.questions.length}
              </dd>
            </div>
            <div className="rounded-xl bg-surface-raised p-5">
              <dt className="text-sm text-muted">
                Decisions with definition support
              </dt>
              <dd className="mt-2 text-3xl font-semibold tabular-nums text-ink">
                {Object.keys(assisted).length}
              </dd>
            </div>
          </dl>
          <p className="mb-7 text-sm leading-relaxed text-muted">
            These are descriptive results from draft questions, not a validated
            measure of clinical ability. Responses stay in this visit and clear
            when you leave or restart.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={restart}>
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Practice again
            </Button>
            <Link
              href="/rr"
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-signal"
            >
              Explore another case
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      ) : question ? (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          <aside
            className="rounded-2xl border border-edge bg-surface p-5"
            aria-label="Case context"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Patient brief
            </p>
            {scenario.context.map((text, i) => (
              <p key={i} className="mb-3 text-sm leading-relaxed text-ink">
                {text}
              </p>
            ))}
            <p className="mt-5 border-t border-edge pt-4 text-xs leading-relaxed text-muted">
              Authored practice case. Awaiting clinical review.
            </p>
          </aside>
          <section
            className="min-w-0 rounded-2xl border border-edge bg-surface p-5 sm:p-7"
            aria-label="Case decision"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <h2
                ref={heading}
                tabIndex={-1}
                className="text-sm font-semibold text-ink"
              >
                Decision {index + 1} of {scenario.questions.length}
              </h2>
              <span className="text-xs capitalize text-muted">
                {question.operation}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Case progress"
              aria-valuemin={0}
              aria-valuemax={scenario.questions.length}
              aria-valuenow={index}
              className="mb-7 h-1.5 overflow-hidden rounded-full bg-surface-raised"
            >
              <div
                className="h-full bg-signal"
                style={{
                  width: `${(100 * index) / scenario.questions.length}%`,
                }}
              />
            </div>
            {question.terms.length > 0 && (
              <div className="mb-6 space-y-2 rounded-xl bg-surface-raised p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Explore a term
                </p>
                {question.terms.map((term) => (
                  <details
                    key={term.id}
                    onToggle={(event) => {
                      if (event.currentTarget.open)
                        setAssisted((previous) => ({
                          ...previous,
                          [question.id]: true,
                        }))
                    }}
                  >
                    <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-signal">
                      {term.label}
                    </summary>
                    <p className="pb-3 text-sm leading-relaxed text-ink">
                      {term.definition}
                    </p>
                  </details>
                ))}
              </div>
            )}
            <AnswerBlock
              key={question.id}
              question={question}
              practiceMode
              submittedAnswer={submitted}
              onAnswer={(answer) =>
                setAnswers((previous) => ({
                  ...previous,
                  [question.id]: [...answer],
                }))
              }
            />
            {submitted && (
              <div className="mt-7 border-t border-edge pt-6">
                <p role="status" className="mb-5 font-semibold text-ink">
                  {isQuestionAnswerCorrect(question, submitted)
                    ? 'Your response matches the draft key.'
                    : 'Take another look at the reasoning.'}
                </p>
                <div className="space-y-5">
                  {question.reasoning.map((reason) => (
                    <div key={reason.label}>
                      <h3 className="text-sm font-semibold text-signal">
                        {reason.label}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink">
                        {reason.text}
                      </p>
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-7 w-full sm:w-auto"
                  onClick={() => setIndex((value) => value + 1)}
                >
                  {index === scenario.questions.length - 1
                    ? 'View practice summary'
                    : 'Next decision'}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  )
}
