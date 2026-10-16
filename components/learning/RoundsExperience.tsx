'use client'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  ArrowLeft,
  HeartPulse,
  Activity,
  Clock3,
  Layers3,
  CheckCircle2,
} from 'lucide-react'
import { guidedCases, type GuidedCase } from '@/lib/learning/cases'
import { pillars } from '@/lib/learning/pillars'
import DecisionCard from './DecisionCard'
export function RoundsLobby() {
  return (
    <div className="rr-experience page-enter">
      <section className="rr-hero rounds-hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <Activity size={16} /> RAPID ROUNDS / CASE ROOM
          </span>
          <h1>
            Meet the patient.
            <br />
            <em>Make the connection.</em>
          </h1>
          <p>
            Step into an unfolding story. Notice the change, make your call, and
            discover the reasoning behind every decision.
          </p>
          <Link className="rr-button rr-button-mint" href="/rr/sepsis">
            Enter the case room <ArrowRight size={18} />
          </Link>
          <span className="hero-footnote">
            2 guided cases · 6 decisions in each · Your pace
          </span>
        </div>
        <div className="case-preview" aria-hidden="true">
          <div className="monitor-label">
            <span className="live-dot" /> THE NEXT HANDOVER
          </div>
          <div className="mini-trace">
            <svg viewBox="0 0 300 75">
              <path d="M0 40h65l12-8 11 13 16-35 18 57 17-27h161" />
            </svg>
          </div>
          <div className="monitor-stats">
            <div>
              <small>HR</small>
              <strong>118</strong>
            </div>
            <div>
              <small>BP</small>
              <strong>88/52</strong>
            </div>
            <div>
              <small>RR</small>
              <strong>28</strong>
            </div>
          </div>
          <p>“He was chatting an hour ago.”</p>
          <span>What would you notice first?</span>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">PATIENT STORIES, WITH PURPOSE</p>
          <h2>Your next shift starts here.</h2>
        </div>
        <span className="quiet-label">
          Every case follows all six judgment skills
        </span>
      </div>
      <div className="case-grid">
        {guidedCases.map((story) => (
          <Link
            href={`/rr/${story.id}`}
            key={story.id}
            className={`case-card tone-${story.color}`}
          >
            <div className="case-art">
              <span className="case-category">{story.category}</span>
              <div className="patient-avatar">{story.initials}</div>
              <HeartPulse size={90} className="case-watermark" />
              <span className="case-duration">
                <Clock3 size={14} /> At your pace
              </span>
            </div>
            <div className="case-card-copy">
              <p className="eyebrow">{story.subtitle}</p>
              <h3>{story.title}</h3>
              <p>{story.summary}</p>
              <div className="case-card-bottom">
                <span>
                  <Layers3 size={16} /> 6 guided decisions
                </span>
                <span className="case-cta">
                  Meet your patient <ArrowRight size={17} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="method-note">
        <CheckCircle2 size={22} />
        <div>
          <h3>A complete learning loop.</h3>
          <p>
            Patient context → your decision → explanation → a changing situation
            → a reflective debrief.
          </p>
        </div>
      </div>
      <p className="review-note">
        Fictional educational drafts, pending clinical review. These guided
        cases are not treatment instructions or validated assessments.
      </p>
    </div>
  )
}
export function GuidedRound({ story }: { story: GuidedCase }) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<number | null>(null)
  const [responses, setResponses] = useState<boolean[]>([])
  const [complete, setComplete] = useState(false)
  const step = story.stages[index]!
  const pillar = pillars.find((entry) => entry.id === step.competency)!
  return (
    <div className="rr-experience round-layout page-enter">
      <Link href="/rr" className="back-link">
        <ArrowLeft size={17} /> Case room
      </Link>
      {complete ? (
        <section className="completion-card">
          <span className="completion-icon">
            <CheckCircle2 size={40} />
          </span>
          <p className="eyebrow">HANDOVER COMPLETE</p>
          <h1>
            You saw the story
            <br />
            through all six lenses.
          </h1>
          <p>
            {responses.filter(Boolean).length} of {story.stages.length}{' '}
            decisions matched the teaching answers. This is practice feedback,
            not a competency score.
          </p>
          <div className="debrief-list">
            {pillars.map((entry, position) => (
              <div key={entry.id}>
                <span
                  className={`debrief-dot ${responses[position] ? 'is-correct' : ''}`}
                >
                  {responses[position] ? '✓' : '↗'}
                </span>
                <strong>{entry.title}</strong>
                <span>
                  {responses[position]
                    ? 'Teaching answer selected'
                    : 'Worth another look'}
                </span>
              </div>
            ))}
          </div>
          <div className="reflection-box">
            <h3>Before you move on…</h3>
            <p>
              Which cue changed your priority? What would you tell the next
              nurse in one sentence?
            </p>
          </div>
          <div className="completion-actions">
            <Link href="/study" className="rr-button">
              Strengthen the reasoning <ArrowRight size={18} />
            </Link>
            <Link href="/rr" className="rr-button-secondary">
              Choose another case
            </Link>
          </div>
        </section>
      ) : (
        <>
          <div className="round-heading">
            <div>
              <p className="eyebrow">GUIDED CASE / {story.category}</p>
              <h1>{story.subtitle}</h1>
            </div>
            <span className="round-counter">
              {index + 1}
              <span> / 6</span>
            </span>
          </div>
          <div className="case-stepper" aria-label="Case stages">
            {pillars.map((entry, position) => (
              <span
                className={
                  position === index
                    ? 'is-current'
                    : position < index
                      ? 'is-done'
                      : ''
                }
                key={entry.id}
              >
                <i>{position < index ? '✓' : position + 1}</i>
                <span>{entry.short}</span>
              </span>
            ))}
          </div>
          <div className="patient-panel">
            <div className={`patient-avatar tone-${story.color}`}>
              {story.initials}
            </div>
            <div>
              <h2>{story.patient}</h2>
              <p>{story.setting}</p>
            </div>
            <div className="patient-vitals">
              {['HR / min', 'BP / mmHg', 'RR / min'].map((name, position) => (
                <div key={name}>
                  <small>{name}</small>
                  <strong>{step.vitals[position]}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="question-meta">
            <span className={`skill-tag tone-${pillar.color}`}>
              {pillar.title}
            </span>
            <span>Decision {index + 1} of 6</span>
          </div>
          <DecisionCard
            key={index}
            title={step.prompt}
            context={step.update}
            options={step.options.map((text, position) => ({
              id: String(position),
              text,
            }))}
            feedback={
              answer === null
                ? null
                : {
                    correct: answer === step.correct,
                    correctId: String(step.correct),
                    rationale: step.rationale,
                  }
            }
            onCommit={(value) => {
              if (answer !== null) return
              const chosen = Number(value)
              setAnswer(chosen)
              setResponses((previous) => [...previous, chosen === step.correct])
            }}
            onNext={() => {
              if (index === story.stages.length - 1) setComplete(true)
              else {
                setIndex((value) => value + 1)
                setAnswer(null)
              }
            }}
            nextLabel={index === 5 ? 'See your debrief' : 'Continue the story'}
          />
        </>
      )}
      <details className="source-note">
        <summary>Case sources & review status</summary>
        <p>
          Fictional guided draft. No clinical approval or calibration is
          implied. The story advances after feedback; it does not predict a real
          treatment response.
        </p>
        {story.sources.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noreferrer"
          >
            {source.title} ↗
          </a>
        ))}
      </details>
    </div>
  )
}
