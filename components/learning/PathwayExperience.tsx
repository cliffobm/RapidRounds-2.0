'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { ArrowRight } from 'lucide-react'
import { studyUnits, readStudyRecords } from '@/lib/learning/study'
import {
  readActivities,
  activityKey,
  type LearningActivity,
} from '@/lib/learning/sessions'
import { transferQuestions } from '@/lib/learning/worked-examples'
import { caseRevision } from '@/lib/learning/case-coaching'
import { pillars } from '@/lib/learning/pillars'
import { useLearningSession } from './useLearningSession'
import DecisionCard from './DecisionCard'

export function PathwayExperience() {
  const [snapshot, setSnapshot] = useState({
    studied: [] as string[],
    activities: [] as LearningActivity[],
    unavailable: false,
  })
  useEffect(() => {
    try {
      setSnapshot({
        studied: readStudyRecords(
          localStorage.getItem('rapidrounds-study-v1')
        ).map((record) => record.unitId),
        activities: readActivities(localStorage.getItem(activityKey)),
        unavailable: false,
      })
    } catch {
      setSnapshot((previous) => ({ ...previous, unavailable: true }))
    }
  }, [])
  const caseDone = snapshot.activities.find(
    (entry) => entry.id === `case:sepsis:${caseRevision}`
  )
  return (
    <div className="rr-experience page-enter pathway-layout">
      <p className="eyebrow">A CONNECTED LEARNING PATHWAY</p>
      <h1>
        Notice deterioration.
        <br />
        <em>Explain your next move.</em>
      </h1>
      <p>
        For nurses building adult acute-care reasoning. Learn in short sessions,
        apply the six skills in a guided case, then try a new patient without
        immediate hints.
      </p>
      <p className="review-note">
        Educational draft · No clinical signoff, passing standard or competency
        certification. Work in any order; completion records activity, not
        mastery.
      </p>
      <section className="pathway-section">
        <h2>1. Build the reasoning</h2>
        <p>
          Six short lessons with worked examples and paired checks. Your first
          completed checks stay on this device.
        </p>
        <ol className="pathway-list">
          {studyUnits.map((unit) => (
            <li key={unit.id}>
              <Link href={`/study?pillar=${unit.id}`}>
                <span>{unit.title}</span>
                <small>
                  {snapshot.studied.includes(unit.id)
                    ? 'Explored on this device'
                    : `${unit.minutes} min · Start lesson`}{' '}
                  →
                </small>
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <section className="pathway-section">
        <h2>2. Put the skills together</h2>
        <p>
          Follow Mr. James through six decisions. Read the reasoning and
          explanations for every option.
        </p>
        <Link className="rr-button" href="/rr/sepsis">
          {caseDone ? 'Revisit the guided case' : 'Open the guided case'}{' '}
          <ArrowRight size={18} />
        </Link>
        {caseDone && (
          <p>
            Case completed on this device. This records participation, not
            clinical competence.
          </p>
        )}
      </section>
      <section className="pathway-section">
        <h2>3. Apply it to a different patient</h2>
        <p>
          Three decisions with explanations held until you submit all three.
          This small exercise explores application; it is not a validated test.
        </p>
        <Link className="rr-button" href="/pathway/transfer">
          Try the new patient <ArrowRight size={18} />
        </Link>
        <p>
          For a later check, return at least 48 hours after the guided case. The
          result records the interval so immediate practice is not mistaken for
          delayed evidence.
        </p>
        {caseDone && (
          <p>
            Suggested return:{' '}
            {new Date(
              Date.parse(caseDone.completedAt) + 48 * 60 * 60 * 1000
            ).toLocaleString()}{' '}
            (device time).
          </p>
        )}
      </section>
      {snapshot.unavailable && (
        <p role="status">
          Saved activity is unavailable in this browser. You can still use every
          lesson and case.
        </p>
      )}
      <Link className="text-link" href="/content-review">
        Content sources, coverage and review status →
      </Link>
    </div>
  )
}

const transferSchema = z
  .object({
    answers: z.array(z.number().int().min(0).max(2)).max(3),
    completedAt: z.string().datetime().nullable(),
    hoursSinceCase: z.number().nonnegative().nullable(),
  })
  .refine((value) =>
    value.answers.length === 3
      ? value.completedAt !== null
      : value.completedAt === null && value.hoursSinceCase === null
  )
export function TransferExperience() {
  const [session, setSession, notice] = useLearningSession(
    'transfer:deterioration',
    caseRevision,
    {
      answers: [] as number[],
      completedAt: null as string | null,
      hoursSinceCase: null as number | null,
    },
    transferSchema
  )
  const complete = session.answers.length === transferQuestions.length
  const question = transferQuestions[session.answers.length]
  return (
    <div className="rr-experience round-layout page-enter">
      <Link className="back-link" href="/pathway">
        ← Deterioration pathway
      </Link>
      <p className="eyebrow">NEW PATIENT / INDEPENDENT APPLICATION</p>
      <h1>
        A different story.
        <br />
        <em>The same thinking skills.</em>
      </h1>
      <p className="review-note">
        Fictional draft · Three original teaching questions · Review pending.
        Your first submitted choices are kept on this device. Explanations
        appear after all three.
      </p>
      {notice && <p role="status">{notice}</p>}
      {question && (
        <>
          <p>Decision {session.answers.length + 1} of 3</p>
          <DecisionCard
            key={session.answers.length}
            context={question.context}
            title={question.prompt}
            options={question.options.map((text, index) => ({
              id: String(index),
              text,
            }))}
            feedback={null}
            commitLabel={
              session.answers.length === 2
                ? 'Submit final choice'
                : 'Save choice and continue'
            }
            onCommit={(id) =>
              setSession((previous) => {
                const answers = [...previous.answers, Number(id)]
                let hoursSinceCase: number | null = null
                if (answers.length === 3) {
                  try {
                    const activity = readActivities(
                      localStorage.getItem(activityKey)
                    ).find(
                      (entry) => entry.id === `case:sepsis:${caseRevision}`
                    )
                    if (activity)
                      hoursSinceCase = Math.max(
                        0,
                        (Date.now() - Date.parse(activity.completedAt)) /
                          3600000
                      )
                  } catch {
                    /* An unavailable activity log is explicitly recorded as an unknown interval. */
                  }
                }
                return {
                  answers,
                  completedAt:
                    answers.length === 3 ? new Date().toISOString() : null,
                  hoursSinceCase,
                }
              })
            }
          />
        </>
      )}
      {complete && (
        <section className="pathway-section">
          <h2>Your first application snapshot</h2>
          <p>
            {
              session.answers.filter(
                (answer, index) => answer === transferQuestions[index]!.correct
              ).length
            }{' '}
            of 3 choices matched the teaching answers. This is not a competency
            estimate.
          </p>
          <p>
            {session.hoursSinceCase === null
              ? 'No saved guided-case completion was available; the interval is unknown.'
              : session.hoursSinceCase >= 48
                ? 'Completed at least 48 hours after the saved guided case. This is a small delayed application signal, not validated evidence of competence.'
                : 'Completed less than 48 hours after the saved guided case. Treat this as immediate application practice, not a delayed retention check.'}
          </p>
          {transferQuestions.map((item, index) => (
            <article className="transfer-debrief" key={item.pillar}>
              <h3>
                {index + 1}. {item.prompt}
              </h3>
              <p>Your choice: {item.options[session.answers[index]!]}</p>
              <p>Teaching answer: {item.options[item.correct]}</p>
              <p>{item.rationale}</p>
              <Link className="text-link" href={`/study?pillar=${item.pillar}`}>
                Review{' '}
                {pillars
                  .find((pillar) => pillar.id === item.pillar)!
                  .title.toLowerCase()}{' '}
                →
              </Link>
            </article>
          ))}
          <p>
            Later visits show this first snapshot. Revisit the guided case and
            lessons to continue learning.
          </p>
          <Link className="rr-button" href="/pathway">
            Back to your pathway
          </Link>
        </section>
      )}
    </div>
  )
}
