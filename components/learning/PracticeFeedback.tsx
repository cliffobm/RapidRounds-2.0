import {
  matchesAnswer,
  type EvolvingQuestion,
} from '@/lib/learning/evolving-types'
import { summarizePractice } from '@/lib/learning/practice-result'
import { getPracticeExplanation } from '@/lib/learning/practice-explanations'
import InlineReferenceText from './InlineReferenceText'

export function PracticeScore({
  result,
  noun = 'decisions',
}: {
  result: ReturnType<typeof summarizePractice>
  noun?: 'decisions' | 'questions'
}) {
  return (
    <section className="practice-score" aria-label="Practice result">
      <div className="practice-score-main">
        <p className="eyebrow">PRACTICE SCORE</p>
        <strong className="practice-score-value">
          {result.percentage === null
            ? 'No scored decisions'
            : `${result.percentage}%`}
        </strong>
        <p>
          {result.correct} of {result.answered} {noun} correct
        </p>
      </div>
      <dl className="practice-score-counts">
        <div>
          <dt>Correct</dt>
          <dd>{result.correct}</dd>
        </div>
        <div>
          <dt>Incorrect</dt>
          <dd>{result.incorrect}</dd>
        </div>
        <div>
          <dt>Not answered</dt>
          <dd>{result.unanswered}</dd>
        </div>
      </dl>
      {result.assisted > 0 && (
        <p>Reference support used: {result.assisted}. No points deducted.</p>
      )}
      <details className="score-method">
        <summary>How your score is calculated</summary>
        <p>
          Correct answers divided by answered {noun}, rounded to the nearest
          percent. Each decision earns one point when all required responses are
          correct. Unanswered handoff decisions are excluded. Reasoning notes
          and confidence are not graded.
        </p>
        <p>
          This score describes this practice attempt; it does not establish
          clinical competence.
        </p>
      </details>
    </section>
  )
}

export function QuestionExplanation({
  question,
  selected,
  skipped = false,
  variant = 'review',
}: {
  question: EvolvingQuestion & { id?: string }
  selected: string[]
  skipped?: boolean
  variant?: 'brief' | 'review'
}) {
  const explanation = getPracticeExplanation(question.id)
  const outcome = skipped
    ? 'unanswered'
    : matchesAnswer(question, selected)
      ? 'correct'
      : 'incorrect'
  const chosen = question.options.filter((option) =>
    selected.includes(option.id)
  )
  const correct = question.options.filter((option) =>
    question.correct.includes(option.id)
  )
  const mistaken = chosen.filter(
    (option) => !question.correct.includes(option.id)
  )
  const other = question.options.filter(
    (option) =>
      !selected.includes(option.id) && !question.correct.includes(option.id)
  )
  const explainOption = (option: EvolvingQuestion['options'][number]) =>
    explanation?.options.find((entry) => entry.optionId === option.id)?.why ??
    option.explanation
  if (variant === 'brief')
    return (
      <div
        className="scenario-feedback answer-review brief-answer"
        data-outcome={outcome}
      >
        <h3 className="feedback-result">
          {outcome === 'unanswered'
            ? 'Not answered'
            : outcome === 'correct'
              ? 'Correct'
              : 'Incorrect'}
        </h3>
        <p>
          <strong>{correct.map((option) => option.text).join(' · ')}</strong>
        </p>
        <p>
          <InlineReferenceText
            text={
              explanation?.brief ??
              correct.map((option) => option.explanation).join(' ')
            }
          />
        </p>
        <p className="quiet-label">Full answer review follows your results.</p>
      </div>
    )
  return (
    <div className="scenario-feedback answer-review" data-outcome={outcome}>
      <h3 className="feedback-result">
        {outcome === 'unanswered'
          ? 'Not answered'
          : outcome === 'correct'
            ? 'Correct'
            : 'Incorrect'}
      </h3>
      <section aria-label="Your answer">
        <h4>Your answer</h4>
        {skipped ? (
          <p>
            No answer submitted before the handoff. This decision is excluded
            from your score.
          </p>
        ) : (
          <ul>
            {chosen.map((option) => (
              <li key={option.id}>{option.text}</li>
            ))}
          </ul>
        )}
      </section>
      <section aria-label="Correct answer">
        <h4>
          {correct.length === 1
            ? 'Correct answer'
            : `Correct answers — all ${correct.length} required`}
        </h4>
        {correct.map((option) => (
          <div key={option.id}>
            <p>
              <strong>{option.text}</strong>
            </p>
            <p>
              <InlineReferenceText text={explainOption(option)} />
            </p>
          </div>
        ))}
      </section>
      {explanation && (
        <>
          <section aria-label="Clinical reasoning" className="deep-reasoning">
            <h4>Clinical reasoning</h4>
            {explanation.reasoning.map((paragraph, index) => (
              <p key={index}>
                <InlineReferenceText text={paragraph} />
              </p>
            ))}
          </section>
          {explanation.terms?.length ? (
            <section aria-label="Key terms">
              <h4>Key terms</h4>
              <dl className="rationale-terms">
                {explanation.terms.map((entry) => (
                  <div key={entry.term}>
                    <dt>{entry.term}</dt>
                    <dd>{entry.definition}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
          {explanation.workedExample ? (
            <section className="rationale-example" aria-label="Worked example">
              <h4>Worked example</h4>
              <p>{explanation.workedExample}</p>
            </section>
          ) : null}
          {explanation.caveat ? (
            <section aria-label="Context matters">
              <h4>Context matters</h4>
              <p>{explanation.caveat}</p>
            </section>
          ) : null}
        </>
      )}
      {mistaken.length > 0 && (
        <section aria-label="Why your answer was incorrect">
          <h4>Why your answer was incorrect</h4>
          {mistaken.map((option) => (
            <p key={option.id}>
              <InlineReferenceText text={explainOption(option)} />
            </p>
          ))}
        </section>
      )}
      {other.length > 0 && (
        <details className="other-options">
          <summary>Other options</summary>
          {other.map((option) => (
            <div key={option.id}>
              <p>
                <strong>{option.text}</strong>
              </p>
              <p>
                <InlineReferenceText text={explainOption(option)} />
              </p>
            </div>
          ))}
        </details>
      )}
      {explanation ? (
        <>
          <p className="feedback-takeaway">
            <strong>Takeaway:</strong> {explanation.takeaway}
          </p>
          <section
            aria-label="Rationale references"
            className="rationale-references"
          >
            <h4>References</h4>
            <ul>
              {explanation.references.map((reference) => (
                <li key={reference.url}>
                  <a href={reference.url} target="_blank" rel="noreferrer">
                    {reference.title}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
      <p className="feedback-reflection">
        <strong>Reflection:</strong> {question.reflection}
      </p>
    </div>
  )
}
