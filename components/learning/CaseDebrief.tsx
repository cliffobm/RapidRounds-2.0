'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  type EvolvingCase,
  questionFor,
  matchesAnswer,
} from '@/lib/learning/evolving-types'
import type { EvolvingSession } from '@/lib/learning/evolving-session'
import { summarizePractice } from '@/lib/learning/practice-result'
import { pillars } from '@/lib/learning/pillars'
import { PracticeScore, QuestionExplanation } from './PracticeFeedback'

export default function CaseDebrief({
  story,
  session,
}: {
  story: EvolvingCase
  session: EvolvingSession
}) {
  const [filter, setFilter] = useState<'all' | 'review'>('all')
  const reviewHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (filter === 'review') reviewHeading.current?.focus()
  }, [filter])
  const path = story.paths.find((path) => path.id === session.pathId)!
  const decisions = session.answers.map((answer, index) => {
    const frame = path.frames[index]!
    const question = questionFor(frame, session.level, session.revision)
    const correct = !answer.skipped && matchesAnswer(question, answer.selected)
    return {
      answer,
      index,
      frame,
      question,
      correct,
      skill: pillars.find((pillar) => pillar.id === frame.skill)!,
    }
  })
  const result = summarizePractice(
    decisions.map((decision) => ({
      correct: decision.correct,
      skipped: decision.answer.skipped,
      assisted: decision.answer.assisted,
    }))
  )
  const missed = decisions.filter(
    (decision) => !decision.correct && !decision.answer.skipped
  )
  return (
    <div className="case-debrief">
      <p className="eyebrow">CASE COMPLETE · {session.level}</p>
      <h2>Your case results</h2>
      <PracticeScore result={result} />
      <section className="debrief-next" aria-labelledby="review-next-title">
        <h3 id="review-next-title">
          {missed.length ? 'Review next' : 'Your next challenge'}
        </h3>
        {missed.length ? (
          <>
            <p>Focus your next practice on:</p>
            <ul>
              {missed.map((decision) => (
                <li key={decision.index}>
                  <Link href={`/study?pillar=${decision.skill.id}`}>
                    {decision.skill.title}
                  </Link>
                  <span>Decision {decision.index + 1}</span>
                </li>
              ))}
            </ul>
            <button
              className="rr-button-secondary"
              onClick={() => {
                setFilter('review')
                reviewHeading.current?.focus()
              }}
            >
              Review incorrect decisions
            </button>
          </>
        ) : (
          <p>
            {result.answered
              ? 'You answered every scored decision correctly. Try another version or increase the reasoning level below.'
              : 'Complete another version to receive a practice score.'}
          </p>
        )}
      </section>
      <div className="debrief-heading">
        <h3 tabIndex={-1} ref={reviewHeading}>
          Decision review
        </h3>
        {missed.length > 0 && (
          <div className="filter-row" aria-label="Filter decision review">
            <button
              className={`filter-chip ${filter === 'all' ? 'is-active' : ''}`}
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              All decisions ({decisions.length})
            </button>
            <button
              className={`filter-chip ${filter === 'review' ? 'is-active' : ''}`}
              aria-pressed={filter === 'review'}
              onClick={() => setFilter('review')}
            >
              Incorrect ({missed.length})
            </button>
          </div>
        )}
      </div>
      {decisions
        .filter(
          (decision) =>
            filter === 'all' || (!decision.correct && !decision.answer.skipped)
        )
        .map(({ answer, index, frame, question, correct, skill }) => (
          <details
            className="decision-review"
            key={`${index}:${filter}`}
            open={filter === 'review'}
          >
            <summary>
              <span className="decision-review-title">
                <span className="decision-number">{index + 1}</span>
                <span>{skill.title}</span>
              </span>
              <span
                className="decision-outcome"
                data-outcome={
                  answer.skipped
                    ? 'unanswered'
                    : correct
                      ? 'correct'
                      : 'incorrect'
                }
              >
                {answer.skipped
                  ? 'Not answered'
                  : correct
                    ? 'Correct'
                    : 'Incorrect'}
              </span>
            </summary>
            <div className="decision-review-body">
              <p className="quiet-label">
                Decision {index + 1} ·{' '}
                {answer.assisted
                  ? 'Reference support used'
                  : 'No in-app references used'}
              </p>
              <p>{frame.update}</p>
              <h4 className="review-question">{question.prompt}</h4>
              <QuestionExplanation
                question={question}
                selected={answer.selected}
                skipped={answer.skipped}
              />
              {answer.rationale && (
                <div className="reasoning-note">
                  <h4>Your saved reasoning note · not graded</h4>
                  <p>{answer.rationale}</p>
                </div>
              )}
            </div>
          </details>
        ))}
    </div>
  )
}
