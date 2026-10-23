'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { ClinicalTopic } from '@/lib/learning/material-study'
import {
  clinicalStudyKey,
  readClinicalStudySession,
  newClinicalStudySession,
  clinicalStudyAttempt,
  type ClinicalStudySession,
} from '@/lib/learning/clinical-study-session'
import { recordAttempt } from '@/lib/learning/attempt-history'
import { contentSources } from '@/lib/learning/sources'
import InlineReferenceText from './InlineReferenceText'
export default function ClinicalStudy({ topic }: { topic: ClinicalTopic }) {
  const [session, setSession] = useState<ClinicalStudySession | null>(null)
  const [notice, setNotice] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    try {
      const saved = readClinicalStudySession(
        localStorage.getItem(clinicalStudyKey(topic.id)),
        topic
      )
      const current = saved ?? newClinicalStudySession(topic)
      setSession(current)
      if (!saved) {
        localStorage.setItem(
          clinicalStudyKey(topic.id),
          JSON.stringify(current)
        )
        window.dispatchEvent(new Event('rapidrounds-progress'))
      }
    } catch {
      setSession(newClinicalStudySession(topic))
      setNotice(
        'Browser storage is unavailable. This lesson is available for this visit only.'
      )
    }
  }, [topic])
  function update(next: ClinicalStudySession) {
    const saved = { ...next, updatedAt: new Date().toISOString() }
    setSession(saved)
    try {
      localStorage.setItem(clinicalStudyKey(topic.id), JSON.stringify(saved))
      window.dispatchEvent(new Event('rapidrounds-progress'))
    } catch {
      setNotice(
        'Your lesson is visible now but could not be saved on this device.'
      )
    }
    if (saved.complete && !recordAttempt(clinicalStudyAttempt(topic, saved)))
      setNotice(
        'Your result is visible now but could not be saved in Progress.'
      )
  }
  const section = session ? topic.sections[session.index]! : null
  const submitted = session?.answers[session.index]
  const score =
    session?.answers.filter(
      (answer, index) => answer === topic.sections[index]!.check.correct
    ).length ?? 0
  return (
    <div className="rr-experience round-layout page-enter material-study">
      <Link className="back-link" href="/study">
        ← Study
      </Link>
      <p className="eyebrow">CLINICAL STUDY · {topic.minutes} MINUTES</p>
      <h1 ref={heading} tabIndex={-1}>
        {topic.title}
      </h1>
      <p>{topic.objective}</p>
      <p className="review-note">
        Original fictional teaching material · Clinical review pending
      </p>
      {!session ? (
        <p role="status">Loading your lesson…</p>
      ) : session.complete ? (
        <section className="decision-card" aria-label="Clinical study result">
          <p className="eyebrow">LESSON CHECKS</p>
          <h2>{Math.round((score / topic.sections.length) * 100)}%</h2>
          <p>
            {score} of {topic.sections.length} correct
          </p>
          <p>
            These checks describe this guided lesson, not clinical competence or
            lasting improvement.
          </p>
          {topic.sections.map((entry, index) => (
            <details key={entry.heading} className="decision-review">
              <summary>
                {index + 1}. {entry.heading} ·{' '}
                {session.answers[index] === entry.check.correct
                  ? 'Correct'
                  : 'Incorrect'}
              </summary>
              <p>{entry.check.prompt}</p>
              <p>Your answer: {entry.check.options[session.answers[index]!]}</p>
              <p>Correct answer: {entry.check.options[entry.check.correct]}</p>
              <p>{entry.check.rationale}</p>
            </details>
          ))}
          <div className="question-actions">
            <Link
            className="rr-button rr-button-mint"
              href={`/practice?collection=${topic.practiceCollectionId}`}
            >
              Practice this topic
            </Link>
            <button
              className="rr-button rr-button-outline"
              onClick={() => {
                update(newClinicalStudySession(topic))
                heading.current?.focus()
              }}
            >
              Restart lesson
            </button>
          </div>
          {topic.evolvingCaseIds.map((id) => (
            <p key={id}>
              <Link className="text-link" href={`/evolving/${id}`}>
                Apply it in an evolving case →
              </Link>
            </p>
          ))}
          <Link className="text-link" href="/progress">
            View Progress →
          </Link>
        </section>
      ) : (
        section && (
          <>
            <p className="topic-meta">
              Section {session.index + 1} of {topic.sections.length} · Answers
              save on this device
            </p>
            <section className="lesson-reading">
              <h2>{section.heading}</h2>
              <p>
                <InlineReferenceText text={section.body} />
              </p>
              <article className="worked-example">
                <h3>Worked example</h3>
                <p>{section.example}</p>
              </article>
            </section>
            <div className="decision-card">
              <fieldset aria-label={section.check.prompt}>
                <legend>{section.check.prompt}</legend>
                <p className="question-instruction">Select one answer</p>
                <div className="answer-list">
                  {section.check.options.map((text, index) => (
                    <label
                      className={`answer-option ${session.draft === index ? 'is-chosen' : ''}`}
                      key={text}
                    >
                      <input
                        type="radio"
                        name="clinical-study"
                        checked={session.draft === index}
                        disabled={submitted !== undefined}
                        onChange={() => update({ ...session, draft: index })}
                      />
                      <span>{text}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {submitted !== undefined && (
                <div className="answer-feedback" role="status">
                  <h3>
                    {submitted === section.check.correct
                      ? 'Correct'
                      : 'Review this decision'}
                  </h3>
                  <p>
                    Correct answer:{' '}
                    {section.check.options[section.check.correct]}
                  </p>
                  <p>{section.check.rationale}</p>
                </div>
              )}
              <div className="question-actions">
                {submitted === undefined ? (
                  <button
                    className="rr-button"
                    disabled={session.draft === null}
                    onClick={() => {
                      if (session.draft !== null)
                        update({
                          ...session,
                          answers: [...session.answers, session.draft],
                        })
                    }}
                  >
                    Check answer
                  </button>
                ) : (
                  <button
                    className="rr-button"
                    onClick={() => {
                      update(
                        session.index === topic.sections.length - 1
                          ? { ...session, complete: true }
                          : {
                              ...session,
                              index: session.index + 1,
                              draft: null,
                            }
                      )
                      heading.current?.focus()
                    }}
                  >
                    {session.index === topic.sections.length - 1
                      ? 'View lesson results'
                      : 'Next section'}
                  </button>
                )}
              </div>
            </div>
          </>
        )
      )}
      <details className="method-note material-sources">
        <summary>Sources and limits</summary>
        <p>
          Use local clinical pathways. Examples illustrate reasoning; they do
          not provide medication doses or prescribe treatment. Reference lookups
          in this lesson are not tracked.
        </p>
        <ul>
          {topic.sources.map((id) => (
            <li key={id}>
              <a href={contentSources[id].url} target="_blank" rel="noreferrer">
                {contentSources[id].title} ↗
              </a>
              <p>{contentSources[id].section}</p>
            </li>
          ))}
        </ul>
      </details>
      {notice && <p role="status">{notice}</p>}
    </div>
  )
}
