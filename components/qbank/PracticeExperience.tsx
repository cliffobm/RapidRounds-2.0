'use client'
import { useRef, useState } from 'react'
import { z } from 'zod'
import { useLearningSession } from '@/components/learning/useLearningSession'
import { contentRevision, recordActivity } from '@/lib/learning/sessions'
import {
  ArrowLeft,
  ArrowRight,
  HeartPulse,
  Zap,
  Search,
  ArrowUpRight,
  Trophy,
  Layers3,
} from 'lucide-react'
import Link from 'next/link'
import JudgmentPillars from '@/components/learning/JudgmentPillars'
import DecisionCard from '@/components/learning/DecisionCard'
import { ReferenceShelf } from '@/components/learning/GlossaryExperience'
import { contentSources } from '@/lib/learning/sources'
import { pillars } from '@/lib/learning/pillars'
import { practiceTopics } from '@/lib/learning/catalog'
import {
  loadPractice,
  recordPracticeResponse,
  type PracticeResponse,
} from '@/lib/cjis/practice'
import type { BankKey } from '@/qbank/banks'
import {
  QuickLaunch,
  ReasoningBankCards,
} from '@/components/learning/QuickCheck'

export default function LegacyPractice({
  initialBank = '',
}: {
  initialBank?: BankKey | ''
}) {
  const [bankKey, setBankKey] = useState<BankKey | ''>(initialBank)
  const [category, setCategory] = useState('All topics')
  const [search, setSearch] = useState('')
  const topicHeading = useRef<HTMLHeadingElement>(null)
  if (bankKey)
    return (
      <PracticeRound
        key={bankKey}
        bankKey={bankKey}
        onExit={() => setBankKey('')}
      />
    )
  const topics = practiceTopics.filter(
    (topic) =>
      (category === 'All topics' || topic.category === category) &&
      `${topic.title} ${topic.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
  )
  return (
    <div className="rr-experience page-enter">
      <h1 className="focus-only">Practice</h1>
      <QuickLaunch />
      <section className="rr-hero practice-hero learning-hero-compact mode-introduction">
        <div className="hero-copy">
          <span className="hero-kicker">
            <Zap size={15} /> THE PRACTICE LAB
          </span>
          <h1>
            Small rounds.
            <br />
            <em>Big lightbulb moments.</em>
          </h1>
          <p>
            A few questions. A clearer why. Build your clinical reasoning one
            focused round at a time.
          </p>
          <button
            className="rr-button rr-button-mint"
            onClick={() => topicHeading.current?.focus()}
          >
            Choose a topic <ArrowRight size={18} />
          </button>
          <span className="hero-footnote">
            Up to 5 questions · Pause whenever you need
          </span>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="floating-token token-one">
            <HeartPulse size={24} />
            <span>Notice the signal.</span>
          </div>
          <div className="signal-card">
            <span className="signal-label">YOUR NEXT LIGHTBULB MOMENT</span>
            <Zap size={58} strokeWidth={1.4} />
            <strong>Think it through.</strong>
            <span>The rationale is where it clicks.</span>
          </div>
          <div className="floating-token token-two">
            <Layers3 size={20} /> One step at a time
          </div>
        </div>
      </section>
      <ReasoningBankCards />
      <section aria-labelledby="topics-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FOLLOW YOUR CURIOSITY</p>
            <h2 id="topics-title" ref={topicHeading} tabIndex={-1}>
              Choose a practice topic
            </h2>
          </div>
          <label className="rr-search">
            <Search size={17} />
            <span className="sr-only">Search topics</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search topics"
            />
          </label>
        </div>
        <div className="filter-row" aria-label="Filter practice topics">
          {[
            'All topics',
            'Cardiovascular',
            'Critical care',
            'Neuro',
            'Respiratory',
          ].map((value) => (
            <button
              key={value}
              aria-pressed={category === value}
              className={`filter-chip ${category === value ? 'is-active' : ''}`}
              onClick={() => setCategory(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="topic-grid">
          {topics.map((topic, index) => (
            <button
              className={`topic-card tone-${['coral', 'mint', 'blue', 'violet'][index % 4]}`}
              key={topic.key}
              onClick={() => setBankKey(topic.key)}
            >
              <span className="topic-icon">
                <HeartPulse size={24} />
              </span>
              <span className="topic-meta">{topic.category}</span>
              <h3>{topic.title}</h3>
              <span className="quiet-label">
                {topic.items < 5
                  ? 'Preview collection · limited coverage'
                  : 'Draft collection · review pending'}
              </span>
              <span className="topic-bottom">
                <span>
                  {topic.items} question{topic.items === 1 ? '' : 's'} in bank
                </span>
                <ArrowUpRight size={20} />
              </span>
            </button>
          ))}
        </div>
        {!topics.length && (
          <p className="empty-state">
            No topics match yet. Try another search or clear your filters.
          </p>
        )}
      </section>
      <JudgmentPillars compact />
      <p className="review-note">
        Review content · These questions are practice only and are not mapped to
        a validated competency score.
      </p>
    </div>
  )
}

function PracticeRound({
  bankKey,
  onExit,
}: {
  bankKey: BankKey
  onExit: () => void
}) {
  const [bank] = useState(() => {
    try {
      return loadPractice(bankKey)
    } catch {
      return null
    }
  })
  const revision = contentRevision(bank)
  const responseSchema = z.object({
    item_id: z.string(),
    item_version: z.string(),
    case_family_id: z.string(),
    selected_option_id: z.string().nullable(),
    outcome: z.enum(['correct', 'incorrect', 'nonresponse']),
    first_attempt: z.boolean(),
    hints_used: z.literal(0),
    definitions_used: z.number().int().nonnegative(),
    elapsed_ms: z.number().int().nonnegative(),
    evidence_class: z.enum(['legacy_practice', 'authored_draft_practice']),
    competency_eligible: z.literal(false),
  })
  const schema = z
    .object({
      index: z.number().int().min(0).max(4),
      responses: z.array(responseSchema).max(5),
      finished: z.boolean(),
      roundNumber: z.number().int().nonnegative(),
      definitionUses: z.number().int().nonnegative(),
    })
    .refine((value) => {
      const current =
        bank?.items.slice(value.roundNumber * 5, value.roundNumber * 5 + 5) ??
        []
      return (
        value.index < current.length &&
        value.responses.length >= value.index &&
        value.responses.length <= value.index + 1 &&
        (!value.finished ||
          (value.index === current.length - 1 &&
            value.responses.length === current.length)) &&
        value.responses.every((response, position) => {
          try {
            return (
              JSON.stringify(response) ===
              JSON.stringify(
                recordPracticeResponse(
                  current[position]!,
                  bank!.version,
                  response.selected_option_id,
                  response.elapsed_ms,
                  [],
                  response.definitions_used
                )
              )
            )
          } catch {
            return false
          }
        })
      )
    })
  const [session, setSession, notice] = useLearningSession(
    `practice:${bankKey}`,
    revision,
    {
      index: 0,
      responses: [] as PracticeResponse[],
      finished: false,
      roundNumber: 0,
      definitionUses: 0,
    },
    schema
  )
  const { index, responses, finished, roundNumber } = session
  const answer = responses[index] ?? null
  const started = useRef(Date.now())
  const submitted = useRef(answer !== null)
  const topic = practiceTopics.find((entry) => entry.key === bankKey)!
  const items = bank?.items.slice(roundNumber * 5, roundNumber * 5 + 5) ?? []
  const item = items[index]
  if (!bank || !item)
    return (
      <div className="rr-experience">
        <p role="alert">This bank needs content review.</p>
        <button onClick={onExit} className="rr-button">
          Choose another topic
        </button>
      </div>
    )
  const respond = (selected: string | null) => {
    if (submitted.current) return
    submitted.current = true
    const response = recordPracticeResponse(
      item,
      bank.version,
      selected,
      Math.max(0, Date.now() - started.current),
      responses,
      session.definitionUses
    )
    setSession((previous) => ({
      ...previous,
      responses: [...previous.responses, response],
    }))
  }
  const next = () => {
    if (!submitted.current) respond(null)
    if (index === items.length - 1) {
      setSession((previous) => ({ ...previous, finished: true }))
      recordActivity({
        id: `practice:${bankKey}:${revision}:${roundNumber}`,
        title: topic.title,
        href: `/quiz?bank=${bankKey}`,
        completedAt: new Date().toISOString(),
      })
      return
    }
    setSession((previous) => ({
      ...previous,
      index: previous.index + 1,
      definitionUses: 0,
    }))
    submitted.current = false
    started.current = Date.now()
  }
  const correct = responses.filter(
    (response) => response.outcome === 'correct'
  ).length
  const answered = responses.filter(
    (response) => response.outcome !== 'nonresponse'
  ).length
  return (
    <div className="rr-experience round-layout page-enter">
      <button className="back-link" onClick={onExit}>
        <ArrowLeft size={17} /> All topics
      </button>
      {notice && <p role="status">{notice}</p>}
      {finished ? (
        <section className="completion-card">
          <span className="completion-icon">
            <Trophy size={38} />
          </span>
          <p className="eyebrow">ROUND COMPLETE</p>
          <h1>
            A little clearer.
            <br />A little more ready.
          </h1>
          <p>
            {correct} correct · {answered} answered ·{' '}
            {responses.length - answered} skipped
          </p>
          <p>Feedback is for practice, not a competency estimate.</p>
          <div className="completion-actions">
            {(roundNumber + 1) * 5 < bank.items.length && (
              <button
                className="rr-button"
                onClick={() => {
                  setSession((previous) => ({
                    roundNumber: previous.roundNumber + 1,
                    definitionUses: 0,
                    index: 0,
                    responses: [],
                    finished: false,
                  }))
                  submitted.current = false
                  started.current = Date.now()
                }}
              >
                Continue this topic <ArrowRight size={18} />
              </button>
            )}
            <button className="rr-button" onClick={onExit}>
              Choose your next round <ArrowRight size={18} />
            </button>
            <Link href="/study" className="rr-button-secondary">
              Build the reasoning behind it
            </Link>
            <button
              className="rr-button-secondary"
              onClick={() => {
                setSession({
                  roundNumber: 0,
                  definitionUses: 0,
                  index: 0,
                  responses: [],
                  finished: false,
                })
                submitted.current = false
                started.current = Date.now()
              }}
            >
              Replay this topic from the beginning
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="round-heading">
            <div>
              <p className="eyebrow">{topic.category} / PRACTICE</p>
              <h1>{topic.title}</h1>
            </div>
            <span className="round-counter">
              {index + 1}
              <span> / {items.length}</span>
            </span>
          </div>
          <div
            className="round-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={items.length}
            aria-valuenow={index + 1}
            aria-label={`Question ${index + 1} of ${items.length}`}
          >
            {items.map((_, position) => (
              <span
                key={position}
                className={
                  position < index
                    ? 'is-done'
                    : position === index
                      ? 'is-current'
                      : ''
                }
              />
            ))}
          </div>
          <div className="question-meta">
            <span>
              <Zap size={14} /> Question {index + 1} of {items.length}
            </span>
            <span>Single best answer</span>
          </div>
          <p className="review-note">
            {item.origin === 'authored'
              ? 'Authored educational draft · Clinical review pending'
              : 'Imported practice question · Clinical review pending'}
          </p>
          <DecisionCard
            key={item.id}
            enableReferences
            onReferenceLookup={() =>
              setSession((previous) => ({
                ...previous,
                definitionUses: previous.definitionUses + 1,
              }))
            }
            title={item.prompt}
            committedId={answer?.selected_option_id ?? undefined}
            {...(item.stem ? { context: item.stem } : {})}
            options={item.options}
            feedback={
              answer
                ? {
                    correct: answer.outcome === 'correct',
                    correctId: item.correct_option_id,
                    rationale: item.rationaleText,
                    explanations: item.explanations,
                  }
                : null
            }
            onCommit={respond}
            onNext={next}
            nextLabel={
              index === items.length - 1 ? 'Finish round' : 'Next question'
            }
          />
          {answer && item.reflection && (
            <section className="reflection-box">
              <h2>Explain your reasoning</h2>
              <p>{item.reflection}</p>
              {item.primaryCompetency && (
                <Link
                  className="text-link"
                  href={`/study?pillar=${item.primaryCompetency}`}
                >
                  Review{' '}
                  {pillars
                    .find((pillar) => pillar.id === item.primaryCompetency)!
                    .title.toLowerCase()}{' '}
                  →
                </Link>
              )}
            </section>
          )}
          <ReferenceShelf
            key={`reference:${item.id}`}
            onLookup={() => {
              if (!answer)
                setSession((previous) => ({
                  ...previous,
                  definitionUses: previous.definitionUses + 1,
                }))
            }}
          />
          {(session.definitionUses > 0 ||
            (answer?.definitions_used ?? 0) > 0) && (
            <p className="review-note">
              Reference-assisted practice · Glossary use recorded with this
              question.
            </p>
          )}
          {item.sources.length > 0 && (
            <details className="source-note">
              <summary>Question sources & review status</summary>
              <p>
                Original draft, revision {bank.version}. Skill focus is an
                editorial tag; no clinical approval or validated competency
                mapping is implied.
              </p>
              {item.sources.map((id) => (
                <p key={id}>
                  <a
                    href={contentSources[id].url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {contentSources[id].title} ↗
                  </a>
                  <br />
                  {contentSources[id].section}
                </p>
              ))}
            </details>
          )}
          {!answer && (
            <button className="skip-link" onClick={next}>
              Skip this question
            </button>
          )}
          <p className="review-note">
            Practice feedback only · Competency mapping pending. Confirmed
            answers and your place save on this device. Time away is not a
            measure of competence.
          </p>
        </>
      )}
    </div>
  )
}
