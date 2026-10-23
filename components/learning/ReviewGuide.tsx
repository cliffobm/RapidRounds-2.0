'use client'
import Link from 'next/link'
import { useState } from 'react'
export default function ReviewGuide() {
  const [area, setArea] = useState(''),
    [reference, setReference] = useState(''),
    [finding, setFinding] = useState(''),
    [suggestion, setSuggestion] = useState(''),
    [notice, setNotice] = useState('')
  function download() {
    try {
      const text = `RapidRounds colleague review\nRecorded: ${new Date().toISOString()}\nArea: ${area}\nCase/topic, level and decision: ${reference}\n\nFinding\n${finding}\n\nSuggested correction or evidence\n${suggestion}\n\nReview edition. No patient identifiers or private credentials should be included.\n`
      const url = URL.createObjectURL(
          new Blob([text], { type: 'text/plain;charset=utf-8' })
        ),
        link = document.createElement('a')
      link.href = url
      link.download = 'rapidrounds-review-notes.txt'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice(
        'Your review notes were downloaded. Send the file to the person who invited you.'
      )
    } catch {
      setNotice(
        'The download could not be created. You can copy your notes from the fields below.'
      )
    }
  }
  return (
    <div className="rr-experience pathway-layout review-guide page-enter">
      <p className="eyebrow">COLLEAGUE REVIEW</p>
      <h1>Help shape RapidRounds.</h1>
      <p>
        Try a case, check the teaching and tell us where the experience needs
        work.
      </p>
      <div className="question-actions">
        <Link className="rr-button rr-button-mint" href="/auth/sign-in">
          Tester sign in
        </Link>
        <Link className="rr-button rr-button-outline" href="/home">
          Explore the app
        </Link>
      </div>
      <p className="review-note">
        Use the individual tester account provided by your review organizer.
        Content is also available without sign-in. Progress stays in this
        browser; use separate browser profiles on shared devices.
      </p>
      <section className="pathway-section">
        <h2>A focused 15-minute review</h2>
        <div className="study-grid">
          <article className="study-card">
            <p className="eyebrow">01 · CASE REASONING</p>
            <h3>Follow a changing patient</h3>
            <p>
              Try Challenge or Advanced. Assess realism, the priorities,
              competing choices and the debrief. Replay to review the other
              presentation.
            </p>
            <Link
              className="text-link"
              href="/evolving/medication-shift"
              target="_blank"
              rel="noreferrer"
            >
              Medication case ↗
            </Link>
            <Link
              className="text-link"
              href="/evolving/kidney-trend"
              target="_blank"
              rel="noreferrer"
            >
              Kidney case ↗
            </Link>
          </article>
          <article className="study-card">
            <p className="eyebrow">02 · QUESTION QUALITY</p>
            <h3>Check a short set</h3>
            <p>
              Review the single best answer, plausible alternatives and
              rationales. Flag ambiguity, missing context or a safety concern
              with its topic and question reference.
            </p>
            <Link
              className="text-link"
              href="/practice?collection=medications-safety"
              target="_blank"
              rel="noreferrer"
            >
              Practice questions ↗
            </Link>
          </article>
          <article className="study-card">
            <p className="eyebrow">03 · LEARNING AND USABILITY</p>
            <h3>Study and resume</h3>
            <p>
              Try a topic lesson, reopen it and find your progress. Check
              readability, phone controls, reference cards and light/dark
              settings.
            </p>
            <Link
              className="text-link"
              href="/study"
              target="_blank"
              rel="noreferrer"
            >
              Study lessons ↗
            </Link>
            <Link
              className="text-link"
              href="/settings"
              target="_blank"
              rel="noreferrer"
            >
              Settings ↗
            </Link>
          </article>
        </div>
      </section>
      <section className="pathway-section">
        <h2>Capture your feedback</h2>
        <p>
          Notes stay on this page until downloaded. Nothing is submitted
          automatically. Include fictional case references only, with no patient
          identifiers or passwords.
        </p>
        <form
          className="review-feedback"
          onSubmit={(event) => {
            event.preventDefault()
            download()
          }}
        >
          <label htmlFor="review-area">Review area</label>
          <select
            id="review-area"
            required
            value={area}
            onChange={(event) => setArea(event.target.value)}
          >
            <option value="">Choose an area</option>
            <option>Clinical accuracy or safety</option>
            <option>Question or rationale</option>
            <option>Case realism and difficulty</option>
            <option>Learning material</option>
            <option>Usability or accessibility</option>
          </select>
          <label htmlFor="review-reference">
            Case/topic, level and decision or question reference
          </label>
          <input
            id="review-reference"
            required
            maxLength={300}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />
          <label htmlFor="review-finding">
            What happened or needs correction?
          </label>
          <textarea
            id="review-finding"
            required
            maxLength={5000}
            rows={4}
            value={finding}
            onChange={(event) => setFinding(event.target.value)}
          />
          <label htmlFor="review-suggestion">
            Suggested change and supporting reference (optional)
          </label>
          <textarea
            id="review-suggestion"
            maxLength={5000}
            rows={3}
            value={suggestion}
            onChange={(event) => setSuggestion(event.target.value)}
          />
          <button className="rr-button" type="submit">
            Download review notes
          </button>
        </form>
        {notice && <p role="status">{notice}</p>}
      </section>
      <p className="review-note">
        This review edition contains draft educational material. Human clinical
        signoff and production readiness work are ongoing. Scores are formative
        and do not certify competency.
      </p>
    </div>
  )
}
