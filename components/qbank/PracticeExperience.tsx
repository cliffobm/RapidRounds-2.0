'use client'
import { useRef, useState } from 'react'
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
import { practiceTopics } from '@/lib/learning/catalog'
import {
  loadLegacyPractice,
  recordPracticeResponse,
  type PracticeResponse,
} from '@/lib/cjis/practice'
import type { BankKey } from '@/qbank/banks'

export default function LegacyPractice({
  initialBank = '',
}: {
  initialBank?: BankKey | ''
}) {
  const [bankKey, setBankKey] = useState<BankKey | ''>(initialBank)
  const [category, setCategory] = useState('All topics')
  const [search, setSearch] = useState('')
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
      <section className="rr-hero practice-hero">
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
            onClick={() => setBankKey('cv_hypertensive_crises')}
          >
            Start a quick round <ArrowRight size={18} />
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
      <section aria-labelledby="topics-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FOLLOW YOUR CURIOSITY</p>
            <h2 id="topics-title">Pick your next round.</h2>
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
        Review content · These legacy questions are practice only and are not
        mapped to a validated competency score.
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
      return loadLegacyPractice(bankKey)
    } catch {
      return null
    }
  })
  const [index, setIndex] = useState(0)
  const [responses, setResponses] = useState<PracticeResponse[]>([])
  const [answer, setAnswer] = useState<PracticeResponse | null>(null)
  const [finished, setFinished] = useState(false)
  const [roundNumber, setRoundNumber] = useState(0)
  const started = useRef(Date.now())
  const submitted = useRef(false)
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
      responses
    )
    setResponses((previous) => [...previous, response])
    setAnswer(response)
  }
  const next = () => {
    if (!submitted.current) respond(null)
    if (index === items.length - 1) {
      setFinished(true)
      return
    }
    setIndex((value) => value + 1)
    setAnswer(null)
    submitted.current = false
    started.current = Date.now()
  }
  const correct = responses.filter(
    (response) => response.outcome === 'correct'
  ).length
  const answered = responses.filter(
    (response) => response.outcome !== 'nonresponse'
  ).length
  const original = item.legacy.source as {
    question?: string
    stem?: string | null
  }
  return (
    <div className="rr-experience round-layout page-enter">
      <button className="back-link" onClick={onExit}>
        <ArrowLeft size={17} /> All topics
      </button>
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
                  setRoundNumber((value) => value + 1)
                  setIndex(0)
                  setResponses([])
                  setAnswer(null)
                  setFinished(false)
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
          <DecisionCard
            key={item.id}
            title={original.question ?? item.stem}
            {...(original.stem ? { context: original.stem } : {})}
            options={item.options}
            feedback={
              answer
                ? {
                    correct: answer.outcome === 'correct',
                    correctId: item.correct_option_id,
                    rationale:
                      typeof item.rationale.legacy_text === 'string'
                        ? item.rationale.legacy_text
                        : 'Rationale pending content review.',
                  }
                : null
            }
            onCommit={respond}
            onNext={next}
            nextLabel={
              index === items.length - 1 ? 'Finish round' : 'Next question'
            }
          />
          {!answer && (
            <button className="skip-link" onClick={next}>
              Skip this question
            </button>
          )}
          <p className="review-note">
            Practice feedback only · Competency mapping pending. Session records
            reset when you leave this round.
          </p>
        </>
      )}
    </div>
  )
}
