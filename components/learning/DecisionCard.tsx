'use client'
import { useState } from 'react'
import { ArrowRight, Check, CheckCircle2, Lightbulb } from 'lucide-react'
export type DecisionOption = { id: string; text: string }
export type DecisionFeedback = {
  correct: boolean
  correctId: string
  rationale: string
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
}: {
  title: string
  context?: string
  options: DecisionOption[]
  feedback: DecisionFeedback | null
  onCommit: (id: string) => void
  onNext?: () => void
  nextLabel?: string
  label?: string
}) {
  const [selected, setSelected] = useState('')
  return (
    <div className="decision-card">
      {context && (
        <div className="patient-context">
          <span className="eyebrow">THE SITUATION</span>
          <p>{context}</p>
        </div>
      )}
      <fieldset disabled={feedback !== null}>
        <legend>{title}</legend>
        <p className="question-instruction">{label}</p>
        <div className="answer-list">
          {options.map((option, index) => (
            <label
              key={option.id}
              className={`answer-option ${selected === option.id ? 'is-chosen' : ''} ${feedback?.correctId === option.id ? 'is-correct' : ''} ${feedback && selected === option.id && !feedback.correct ? 'is-incorrect' : ''}`}
            >
              <input
                type="radio"
                name="decision"
                value={option.id}
                checked={selected === option.id}
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
            Check answer <Check size={17} />
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
