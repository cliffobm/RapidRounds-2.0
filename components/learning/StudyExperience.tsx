'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Sparkles,
  Target,
  ArrowUpRight,
} from 'lucide-react'
import { pillars, type PillarId } from '@/lib/learning/pillars'
import {
  studyUnits,
  readStudyRecords,
  type StudyRecord,
  type StudyUnit,
} from '@/lib/learning/study'
import DecisionCard from './DecisionCard'
import { workedExamples } from '@/lib/learning/worked-examples'
import { recordActivity } from '@/lib/learning/sessions'
import {
  newStudySession,
  readStudySession,
  studySessionKey,
  type StudySession as SavedStudySession,
} from '@/lib/learning/study-session'
const storageKey = 'rapidrounds-study-v1'
export default function StudyExperience({
  initialUnit = '',
}: {
  initialUnit?: PillarId | ''
}) {
  const [selected, setSelected] = useState<PillarId | ''>(initialUnit)
  const [records, setRecords] = useState<StudyRecord[]>([])
  const [storageNotice, setStorageNotice] = useState('')
  useEffect(() => {
    try {
      setRecords(readStudyRecords(localStorage.getItem(storageKey)))
    } catch {
      setStorageNotice(
        'Progress is available for this visit only; browser storage is unavailable.'
      )
    }
  }, [])
  const save = (record: StudyRecord) => {
    recordActivity({
      id: `study:${record.unitId}:1`,
      title: studyUnits.find((unit) => unit.id === record.unitId)!.title,
      href: `/study?pillar=${record.unitId}`,
      completedAt: record.completedAt,
    })
    // Keep the first paired result for each unit so later reviews do not rewrite the baseline.
    const updated = records.some((entry) => entry.unitId === record.unitId)
      ? records
      : [...records, record]
    setRecords(updated)
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {
      setStorageNotice(
        'Your result is visible now but could not be saved on this device.'
      )
    }
  }
  const unit = studyUnits.find((entry) => entry.id === selected)
  if (unit)
    return (
      <StudySession
        key={unit.id}
        unit={unit}
        onExit={() => setSelected('')}
        onComplete={save}
        storageNotice={storageNotice}
      />
    )
  return (
    <div className="rr-experience page-enter">
      <section className="study-intro">
        <div>
          <p className="eyebrow">THE REASONING STUDIO</p>
          <h1>
            Go beyond
            <br />
            <em>“I got it right.”</em>
          </h1>
          <p>
            Understand why. Work through a short lesson, check your thinking,
            then carry the skill into a patient story.
          </p>
        </div>
        <div className="study-progress-card">
          <span className="study-progress-orb">
            <BookOpen size={34} />
          </span>
          <div>
            <span className="eyebrow">YOUR LEARNING LOOP</span>
            <strong>
              {records.length} <small>/ 6 units explored</small>
            </strong>
            <p>Real activity. Saved on this device.</p>
          </div>
          <div className="study-progress-track">
            <span style={{ width: `${(records.length / 6) * 100}%` }} />
          </div>
        </div>
      </section>
      <div className="learning-loop">
        <span>
          <Target size={18} /> Check your starting point
        </span>
        <ArrowRight size={17} />
        <span>
          <BookOpen size={18} /> Build the reasoning
        </span>
        <ArrowRight size={17} />
        <span>
          <Sparkles size={18} /> Try a new application
        </span>
      </div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">A SKILL FOR EVERY DECISION</p>
          <h2>Your six-part thinking toolkit.</h2>
        </div>
        <span className="quiet-label">About 5 minutes per unit</span>
      </div>
      <div className="study-grid">
        {studyUnits.map((entry, index) => {
          const pillar = pillars[index]!
          const result = records.find((record) => record.unitId === entry.id)
          return (
            <button
              className={`study-card tone-${pillar.color}`}
              key={entry.id}
              onClick={() => setSelected(entry.id)}
            >
              <div className="study-card-top">
                <span className="pillar-number">0{index + 1}</span>
                {result ? (
                  <span className="unit-complete">
                    <CheckCircle2 size={15} /> Explored
                  </span>
                ) : (
                  <span>
                    <Clock3 size={14} /> {entry.minutes} min
                  </span>
                )}
              </div>
              <span className="topic-meta">{pillar.title}</span>
              <h3>{entry.title}</h3>
              <p>{entry.objective}</p>
              <div className="study-card-bottom">
                <span>
                  {result
                    ? `First checks: ${Number(result.preCorrect)}/1 before · ${Number(result.postCorrect)}/1 after`
                    : '3 reading sections + worked example + 2 checks'}
                </span>
                <ArrowUpRight size={20} />
              </div>
            </button>
          )
        })}
      </div>
      <div className="method-note">
        <Sparkles size={24} />
        <div>
          <h3>Learn it here. Connect it in a case.</h3>
          <p>
            Paired checks show your first responses before and after a lesson.
            They are a small recall signal, not proof of lasting improvement or
            clinical competency.
          </p>
          <Link href="/rr" className="text-link">
            Take it to the case room <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <div className="reference-links">
        <Link href="/pathway">Follow the deterioration pathway →</Link>
        <strong>Keep a reference close.</strong>
        <Link href="/glossary">Medical terms & value examples ↗</Link>
        <Link href="/reference/lab-values">Lab values ↗</Link>
        <Link href="/reference/drug-reference">Drug reference ↗</Link>
        <Link href="/reference/calculators">Calculators ↗</Link>
      </div>
      {storageNotice && <p role="status">{storageNotice}</p>}
      <p className="review-note">
        Educational review edition. Reasoning framework:{' '}
        <a
          href="https://www.ncsbn.org/public-files/NGN_Winter19.pdf"
          target="_blank"
          rel="noreferrer"
        >
          NCSBN Clinical Judgment Measurement Model
        </a>
        . Not affiliated with or endorsed by NCSBN.
      </p>
    </div>
  )
}
function StudySession({
  unit,
  onExit,
  onComplete,
  storageNotice,
}: {
  unit: StudyUnit
  onExit: () => void
  onComplete: (record: StudyRecord) => void
  storageNotice: string
}) {
  const [session, setSession] = useState<SavedStudySession>(() =>
    newStudySession(unit)
  )
  const [sessionNotice, setSessionNotice] = useState('')
  useEffect(() => {
    try {
      const saved = readStudySession(
        localStorage.getItem(studySessionKey(unit.id)),
        unit
      )
      const current = saved ?? newStudySession(unit)
      setSession(current)
      if (!saved)
        localStorage.setItem(studySessionKey(unit.id), JSON.stringify(current))
    } catch {
      setSessionNotice(
        'This study session is available for this visit only; browser storage is unavailable.'
      )
    }
  }, [unit])
  const updateSession = (next: SavedStudySession) => {
    const updated = { ...next, updatedAt: new Date().toISOString() }
    setSession(updated)
    try {
      localStorage.setItem(studySessionKey(unit.id), JSON.stringify(updated))
    } catch {
      setSessionNotice(
        'Your study progress is visible now but could not be saved on this device.'
      )
    }
  }
  const phase = session.phase
  const before = session.before?.correct ?? null
  const after = session.after?.correct ?? null
  const choice =
    (phase === 'before' ? session.before : session.after)?.selected ?? null
  const pillar = pillars.find((entry) => entry.id === unit.id)!
  const checkpoint = phase === 'before' ? unit.pre : unit.post
  return (
    <div className="rr-experience round-layout page-enter">
      <button className="back-link" onClick={onExit}>
        <ArrowLeft size={17} /> Reasoning studio
      </button>
      <div className="round-heading">
        <div>
          <p className="eyebrow">{pillar.title}</p>
          <h1>{unit.title}</h1>
        </div>
      </div>
      <div className="study-phase">
        <span className={phase === 'before' ? 'is-active' : ''}>
          01 / Before
        </span>
        <span className={phase === 'learn' ? 'is-active' : ''}>
          02 / Explore
        </span>
        <span
          className={
            phase === 'after' || phase === 'complete' ? 'is-active' : ''
          }
        >
          03 / Apply
        </span>
      </div>
      {(phase === 'before' || phase === 'after') && (
        <>
          <p className="study-session-note">
            {phase === 'before'
              ? 'Start with one quick check. Getting it wrong is useful information.'
              : 'A different question. Apply the idea you just explored.'}
          </p>
          <DecisionCard
            key={phase}
            title={checkpoint.prompt}
            options={checkpoint.options.map((text, index) => ({
              id: String(index),
              text,
            }))}
            feedback={
              choice === null
                ? null
                : {
                    correct: choice === checkpoint.correct,
                    correctId: String(checkpoint.correct),
                    rationale: checkpoint.rationale,
                  }
            }
            committedId={choice === null ? undefined : String(choice)}
            onCommit={(value) => {
              if (choice !== null) return
              const selected = Number(value)
              if (
                !Number.isInteger(selected) ||
                selected < 0 ||
                selected >= checkpoint.options.length
              )
                return
              updateSession({
                ...session,
                [phase === 'before' ? 'before' : 'after']: {
                  selected,
                  correct: selected === checkpoint.correct,
                },
              })
            }}
            onNext={() => {
              if (phase === 'before') {
                updateSession({ ...session, phase: 'learn' })
              } else if (before !== null && after !== null) {
                const completedAt = new Date().toISOString()
                onComplete({
                  version: 1,
                  unitId: unit.id,
                  preCorrect: before,
                  postCorrect: after,
                  completedAt,
                })
                updateSession({ ...session, phase: 'complete', completedAt })
              }
            }}
            nextLabel={
              phase === 'before'
                ? 'Explore the lesson'
                : 'See your learning snapshot'
            }
          />
        </>
      )}
      {phase === 'learn' && (
        <section className="lesson-reading">
          <div className="lesson-objective">
            <Target size={22} />
            <p>{unit.objective}</p>
          </div>
          {unit.sections.map((section, index) => (
            <article key={section.heading}>
              <span className="reading-number">0{index + 1}</span>
              <div>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </div>
            </article>
          ))}
          <article className="worked-example">
            <BookOpen size={24} />
            <div>
              <h2>Worked example: make the reasoning visible</h2>
              <h3>What you notice</h3>
              <p>{workedExamples[unit.id].observation}</p>
              <h3>Reasoning walkthrough</h3>
              <p>{workedExamples[unit.id].reasoning}</p>
              <h3>A common trap</h3>
              <p>{workedExamples[unit.id].pitfall}</p>
              <h3>Try it in a different situation</h3>
              <p>{workedExamples[unit.id].transfer}</p>
              <p className="review-note">
                Original fictional teaching example · Clinical review pending.
              </p>
            </div>
          </article>
          <div className="reflection-box">
            <p className="eyebrow">TRY SAYING IT OUT LOUD</p>
            <p>{unit.reflection}</p>
          </div>
          <button
            className="rr-button"
            onClick={() => {
              updateSession({ ...session, phase: 'after' })
            }}
          >
            Apply what you explored <ArrowRight size={18} />
          </button>
        </section>
      )}
      {phase === 'complete' && (
        <section className="completion-card">
          <span className="completion-icon">
            <Sparkles size={38} />
          </span>
          <p className="eyebrow">YOUR LEARNING SNAPSHOT</p>
          <h2>You closed the loop.</h2>
          <div className="paired-result">
            <div>
              <span>Before the lesson</span>
              <strong>
                {Number(before)}
                <small>/1</small>
              </strong>
            </div>
            <ArrowRight size={24} />
            <div>
              <span>After the lesson</span>
              <strong>
                {Number(after)}
                <small>/1</small>
              </strong>
            </div>
          </div>
          <p>
            Two different checks of the same concept. One session cannot
            establish lasting learning or clinical competence.
          </p>
          <p>
            Your first completed pair is kept on this device; later reviews do
            not replace it.
          </p>
          <div className="completion-actions">
            <Link href="/rr" className="rr-button">
              Apply it in a patient story <ArrowRight size={17} />
            </Link>
            <button onClick={onExit} className="rr-button-secondary">
              Explore another skill
            </button>
            <button
              onClick={() => updateSession(newStudySession(unit))}
              className="rr-button-secondary"
            >
              Restart checks
            </button>
          </div>
        </section>
      )}
      {(sessionNotice || storageNotice) && (
        <p role="status">{sessionNotice || storageNotice}</p>
      )}
    </div>
  )
}
