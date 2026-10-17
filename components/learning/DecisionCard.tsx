'use client'
import { useState } from 'react'
import { ArrowRight, Check, CheckCircle2, Lightbulb } from 'lucide-react'
import InlineReferenceText from './InlineReferenceText'
import { referenceParts } from '@/lib/learning/inline-references'
export type DecisionOption = { id: string; text: string }
export type DecisionFeedback = {
  correct: boolean
  correctId: string
  rationale: string
  explanations?: string[] | undefined
}
export default function DecisionCard({
  title,
  context,
  options,
  feedback,
  onCommit,
  onNext,
  nextLabel = 'Continue',
  label = 'Select one answer',
  committedId,
  commitLabel = 'Check answer',
  enableReferences = false,
  onReferenceLookup,
}: {
  title: string
  context?: string
  options: DecisionOption[]
  feedback: DecisionFeedback | null
  onCommit: (id: string) => void
  onNext?: () => void
  nextLabel?: string
  label?: string
  committedId?: string | undefined
  commitLabel?: string
  enableReferences?: boolean
  onReferenceLookup?: (() => void) | undefined
}) {
  const [selected, setSelected] = useState('')
  const hasReferences =
    enableReferences &&
    [context ?? '', title].some((text) =>
      referenceParts(text).some((part) => part.reference)
    )
  const lookup = feedback ? undefined : onReferenceLookup
  return (
    <div className="decision-card">
      {context && (
        <div className="patient-context">
          <span className="eyebrow">THE SITUATION</span>
          <p>
            {enableReferences ? (
              <InlineReferenceText text={context} onLookup={lookup} />
            ) : (
              context
            )}
          </p>
        </div>
      )}
      {hasReferences && (
        <p className="inline-reference-hint">
          Underlined terms open a reference card.
          {onReferenceLookup
            ? ' Lookups before answering are recorded as assistance.'
            : ''}
        </p>
      )}
      <fieldset aria-label={title}>
        <legend>
          {enableReferences ? (
            <InlineReferenceText text={title} onLookup={lookup} />
          ) : (
            title
          )}
        </legend>
        <p className="question-instruction">{label}</p>
        <div className="answer-list">
          {options.map((option, index) => (
            <label
              key={option.id}
              className={`answer-option ${(committedId ?? selected) === option.id ? 'is-chosen' : ''} ${feedback?.correctId === option.id ? 'is-correct' : ''} ${feedback && (committedId ?? selected) === option.id && !feedback.correct ? 'is-incorrect' : ''}`}
            >
              <input
                type="radio"
                disabled={feedback !== null}
                name="decision"
                value={option.id}
                checked={(committedId ?? selected) === option.id}
                onChange={() => setSelected(option.id)}
              />
              <span className="answer-letter" aria-hidden="true">
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option.text}</span>
              {feedback?.correctId === option.id && (
                <Check size={19} aria-label="Correct answer" />
              )}
            </label>
          ))}
        </div>
      </fieldset>
      {feedback ? (
        <div
          className={`answer-feedback ${feedback.correct ? 'is-correct' : ''}`}
          role="status"
        >
          <span className="feedback-icon">
            {feedback.correct ? (
              <CheckCircle2 size={22} />
            ) : (
              <Lightbulb size={22} />
            )}
          </span>
          <div>
            <h3>
              {feedback.correct
                ? 'You connected the dots.'
                : 'A useful learning moment.'}
            </h3>
            <p>{feedback.rationale}</p>
            {feedback.explanations && (
              <details className="option-explanations">
                <summary>Why each option matters</summary>
                <ul>
                  {options.map((option, index) => (
                    <li key={option.id}>
                      <strong>{option.text}</strong>
                      <p>{feedback.explanations![index]}</p>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      ) : null}
      <div className="question-actions">
        {!feedback ? (
          <button
            className="rr-button"
            disabled={!selected}
            onClick={() => onCommit(selected)}
          >
            {commitLabel} <Check size={17} />
          </button>
        ) : (
          onNext && (
            <button className="rr-button" onClick={onNext}>
              {nextLabel}
              <ArrowRight size={18} />
            </button>
          )
        )}
      </div>
    </div>
  )
}
