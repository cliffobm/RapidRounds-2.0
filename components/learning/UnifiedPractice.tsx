'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Search } from 'lucide-react'
import {
  findPracticeCollection,
  getPracticeQuestion,
  practiceCollections,
  practiceLibrary,
  practicePool,
  type PracticeLevel,
  type UnifiedPracticeQuestion,
} from '@/lib/learning/practice-library'
import {
  createPracticeSession,
  PRACTICE_SESSIONS_KEY,
  practiceAttemptRecord,
  practiceOptionSeed,
  readPracticeSessions,
  savePracticeSession,
  type UnifiedPracticeSession,
} from '@/lib/learning/practice-session'
import { recordAttempt } from '@/lib/learning/attempt-history'
import { matchesAnswer, orderedOptions } from '@/lib/learning/evolving-types'
import { summarizePractice } from '@/lib/learning/practice-result'
import { contentSources } from '@/lib/learning/sources'
import InlineReferenceText from './InlineReferenceText'
import { PracticeScore, QuestionExplanation } from './PracticeFeedback'

export type UnifiedPracticeProps = {
  initialCollection?: string
  initialMode?: 'guided' | 'check'
  initialCount?: 5 | 10
  initialLevel?: PracticeLevel | 'all'
  initialSessionId?: string
}

function QuestionContext({
  question,
  references,
  onLookup,
}: {
  question: UnifiedPracticeQuestion
  references: boolean
  onLookup?: (() => void) | undefined
}) {
  if (!question.context) return null
  return (
    <div className="patient-context">
      <p>
        {references ? (
          <InlineReferenceText text={question.context} onLookup={onLookup} />
        ) : (
          question.context
        )}
      </p>
    </div>
  )
}

export default function UnifiedPractice({
  initialCollection = 'all',
  initialMode = 'guided',
  initialCount = 5,
  initialLevel = 'all',
  initialSessionId = '',
}: UnifiedPracticeProps) {
  const router = useRouter()
  const [collectionId, setCollectionId] = useState(
    findPracticeCollection(initialCollection)?.id ?? 'all'
  )
  const [mode, setMode] = useState<'guided' | 'check'>(initialMode)
  const [count, setCount] = useState<5 | 10>(initialCount)
  const [level, setLevel] = useState<PracticeLevel | 'all'>(
    ['all', 'foundation', 'challenge', 'advanced', 'unclassified'].includes(
      initialLevel
    )
      ? initialLevel
      : 'all'
  )
  const [showTopics, setShowTopics] = useState(
    !findPracticeCollection(initialCollection)
  )
  const [showAllTopics, setShowAllTopics] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All areas')
  const [session, setSession] = useState<UnifiedPracticeSession | null>(null)
  const [saved, setSaved] = useState<UnifiedPracticeSession[]>([])
  const [loaded, setLoaded] = useState(false)
  const [notice, setNotice] = useState('')
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect'>('all')
  const heading = useRef<HTMLHeadingElement>(null)
  const topicButton = useRef<HTMLButtonElement>(null)
  const focusHeading = useRef(false)

  useEffect(() => {
    try {
      const stored = readPracticeSessions(
        localStorage.getItem(PRACTICE_SESSIONS_KEY)
      )
      setSaved(stored.filter((entry) => !entry.complete))
      if (initialSessionId) {
        const current = stored.find((entry) => entry.id === initialSessionId)
        if (current) setSession(current)
        else
          setNotice(
            'This saved attempt is unavailable or its content has changed. You can start a new practice session.'
          )
      }
    } catch {
      setNotice(
        'Saved progress is unavailable in this browser. You can practice during this visit.'
      )
    }
    setLoaded(true)
  }, [initialSessionId])

  useEffect(() => {
    if (!loaded || !session) return
    if (!savePracticeSession(session))
      setNotice(
        'Progress could not be saved on this device. Keep this page open to continue.'
      )
    if (session.complete && !recordAttempt(practiceAttemptRecord(session)))
      setNotice(
        'Your results are shown below, but this attempt could not be added to your progress history.'
      )
  }, [session, loaded])

  useEffect(() => {
    if (focusHeading.current) {
      heading.current?.focus()
      focusHeading.current = false
    }
  }, [session?.id, session?.index, session?.complete])

  const pool = practicePool(collectionId, level)
  const collection = findPracticeCollection(collectionId)
  const categories = [
    ...new Set(practiceCollections.map((entry) => entry.category)),
  ]
  const visibleCollections = practiceCollections.filter(
    (entry) =>
      (category === 'All areas' || entry.category === category) &&
      `${entry.title} ${entry.category}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
  )
  const filteredTopics = search.trim() !== '' || category !== 'All areas'
  const displayedCollections =
    showAllTopics || filteredTopics
      ? visibleCollections
      : visibleCollections.slice(0, 6)
  const question = session
    ? getPracticeQuestion(session.ids[session.index]!)!
    : null
  const answer = session?.answers[session.index]

  const change = (patch: Partial<UnifiedPracticeSession>) =>
    setSession((previous) =>
      previous
        ? { ...previous, ...patch, updatedAt: new Date().toISOString() }
        : null
    )
  const chooseCollection = (id: string) => {
    setCollectionId(id)
    if (
      practicePool(id, level).length < 10 &&
      practicePool(id, level).length >= 5
    )
      setCount(5)
    setShowTopics(false)
    setSearch('')
    setCategory('All areas')
    topicButton.current?.focus()
  }
  const start = () => {
    const next = createPracticeSession({ mode, collectionId, level, count })
    if (!next) return
    const persisted = savePracticeSession(next)
    focusHeading.current = true
    setSession(next)
    setNotice(
      persisted
        ? ''
        : 'Progress could not be saved. Keep this page open to continue.'
    )
    if (persisted)
      router.replace(`/practice?session=${next.id}`, { scroll: false })
  }
  const submit = () => {
    if (!session || !session.selected || answer) return
    const answers = [
      ...session.answers,
      { selected: session.selected, assisted: session.assisted },
    ]
    if (session.mode === 'guided') change({ answers })
    else {
      focusHeading.current = true
      change({
        answers,
        index:
          session.index === session.ids.length - 1
            ? session.index
            : session.index + 1,
        selected: '',
        assisted: false,
        complete: session.index === session.ids.length - 1,
      })
    }
  }
  const next = () => {
    if (!session || !answer) return
    focusHeading.current = true
    change(
      session.index === session.ids.length - 1
        ? { complete: true }
        : { index: session.index + 1, selected: '', assisted: false }
    )
  }
  const setupAgain = () => {
    if (!session) return
    setCollectionId(session.collectionId)
    setMode(session.mode)
    setCount(session.ids.length === 10 ? 10 : 5)
    setLevel(session.level)
    setSession(null)
    setReviewFilter('all')
    setNotice('')
    focusHeading.current = true
    router.replace(
      `/practice?collection=${encodeURIComponent(session.collectionId)}&mode=${session.mode}&count=${session.ids.length}&level=${session.level}`,
      { scroll: false }
    )
  }

  return (
    <div className="rr-experience unified-practice page-enter">
      <p className="eyebrow">PRACTICE</p>
      <h1 tabIndex={-1} ref={heading}>
        {session?.complete
          ? 'Your results'
          : session
            ? session.title
            : 'Practice your next decision'}
      </h1>
      {notice ? (
        <p className="practice-notice" role="status">
          {notice}
        </p>
      ) : null}
      {!loaded ? (
        <p>Loading saved practice…</p>
      ) : !session ? (
        <>
          <p className="intro-copy">
            Focus on a topic or mix your practice. Then choose your feedback
            style and five or ten questions.
          </p>
          {saved.length ? (
            <section
              className="practice-resume"
              aria-labelledby="practice-resume-title"
            >
              <h2 id="practice-resume-title">Continue practice</h2>
              {saved.slice(0, 3).map((entry) => (
                <Link
                  key={entry.id}
                  className="rr-button-secondary"
                  href={`/practice?session=${entry.id}`}
                >
                  {entry.title} · {entry.mode === 'guided' ? 'Guided' : 'Check'}{' '}
                  · Question {entry.index + 1} of {entry.ids.length}
                </Link>
              ))}
            </section>
          ) : null}
          <section className="practice-setup" aria-label="Set up practice">
            <fieldset>
              <legend>Topic</legend>
              <div className="practice-topic-selection">
                <div>
                  <span className="practice-topic-label">Selected topic</span>
                  <strong>{collection?.title ?? 'Mixed topics'}</strong>
                  <p>
                    {collection
                      ? 'Every question comes from this topic.'
                      : 'Questions from across all clinical areas.'}
                  </p>
                </div>
                <button
                  ref={topicButton}
                  className="rr-button-secondary"
                  aria-expanded={showTopics}
                  aria-controls="practice-topic-options"
                  onClick={() => setShowTopics(!showTopics)}
                >
                  {showTopics ? 'Done choosing' : 'Change topic'}
                </button>
              </div>
              {showTopics ? (
                <div
                  className="practice-topic-options"
                  id="practice-topic-options"
                >
                  <label className="rr-search">
                    <Search size={18} aria-hidden="true" />
                    <span className="sr-only">Search practice topics</span>
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Find a topic"
                    />
                  </label>
                  <div
                    className="filter-row"
                    aria-label="Filter clinical areas"
                  >
                    {['All areas', ...categories].map((value) => (
                      <button
                        key={value}
                        className={`filter-chip ${category === value ? 'is-active' : ''}`}
                        aria-pressed={category === value}
                        onClick={() => setCategory(value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <div className="practice-topic-grid">
                    <button
                      className={`practice-topic-card ${collectionId === 'all' ? 'is-selected' : ''}`}
                      aria-pressed={collectionId === 'all'}
                      onClick={() => chooseCollection('all')}
                    >
                      <small>Across clinical areas</small>
                      <strong>Mixed topics</strong>
                      <span>{practiceLibrary.length} questions</span>
                    </button>
                    {displayedCollections.map((entry) => (
                      <button
                        key={entry.id}
                        className={`practice-topic-card ${collectionId === entry.id ? 'is-selected' : ''}`}
                        aria-pressed={collectionId === entry.id}
                        onClick={() => chooseCollection(entry.id)}
                      >
                        <small>{entry.category}</small>
                        <strong>{entry.title}</strong>
                        <span>{entry.count} questions</span>
                      </button>
                    ))}
                  </div>
                  {!filteredTopics && visibleCollections.length > 6 ? (
                    <button
                      className="practice-topic-more text-link"
                      aria-expanded={showAllTopics}
                      onClick={() => setShowAllTopics(!showAllTopics)}
                    >
                      {showAllTopics
                        ? 'Show fewer topics'
                        : `View all ${practiceCollections.length} topics`}
                    </button>
                  ) : null}
                  {!visibleCollections.length ? (
                    <p role="status">
                      No topics match. Try a different search or area.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </fieldset>
            <fieldset>
              <legend>Feedback style</legend>
              <div className="practice-mode-grid">
                {(['guided', 'check'] as const).map((value) => (
                  <button
                    key={value}
                    className={`practice-mode ${mode === value ? 'is-selected' : ''}`}
                    aria-pressed={mode === value}
                    onClick={() => setMode(value)}
                  >
                    <strong>{value === 'guided' ? 'Guided' : 'Check'}</strong>
                    <span>
                      {value === 'guided'
                        ? 'Feedback after each answer'
                        : 'Results after the last question'}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Questions</legend>
              <div className="filter-row">
                {([5, 10] as const).map((value) => (
                  <button
                    key={value}
                    className={`filter-chip ${count === value ? 'is-active' : ''}`}
                    aria-pressed={count === value}
                    disabled={pool.length < value}
                    onClick={() => setCount(value)}
                  >
                    {value} questions
                  </button>
                ))}
              </div>
            </fieldset>
            <details className="practice-customize">
              <summary>Customize reasoning level</summary>
              <fieldset>
                <legend className="sr-only">Reasoning level</legend>
                <div className="filter-row">
                  {(
                    [
                      'all',
                      'foundation',
                      'challenge',
                      'advanced',
                      'unclassified',
                    ] as const
                  ).map((value) => (
                    <button
                      key={value}
                      className={`filter-chip ${level === value ? 'is-active' : ''}`}
                      aria-pressed={level === value}
                      onClick={() => {
                        setLevel(value)
                        if (
                          practicePool(collectionId, value).length < 10 &&
                          practicePool(collectionId, value).length >= 5
                        )
                          setCount(5)
                      }}
                    >
                      {value === 'all'
                        ? 'All levels'
                        : value === 'unclassified'
                          ? 'Level not assigned'
                          : value[0]!.toUpperCase() + value.slice(1)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <p>
                Levels reflect authored labels. Questions without a declared
                level remain available in All levels.
              </p>
            </details>
            <p className="practice-availability" role="status">
              {pool.length} questions available
              {level !== 'all' ? ' at this level' : ''}.
              {pool.length < count
                ? ' Choose all topics or broaden the reasoning level to start.'
                : ''}
            </p>
            {pool.length < count ? (
              <button
                className="text-link"
                onClick={() => {
                  setCollectionId('all')
                  setLevel('all')
                }}
              >
                Use all topics and levels
              </button>
            ) : null}
            <button
              className="rr-button"
              disabled={pool.length < count}
              onClick={start}
            >
              Start {count}-question{' '}
              {mode === 'guided' ? 'guided practice' : 'check'}{' '}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </section>
          <p className="review-note">
            Draft educational questions · Clinical review pending · Progress
            saves on this device
          </p>
        </>
      ) : session.complete ? (
        <>
          <p>
            {session.title} ·{' '}
            {session.mode === 'guided' ? 'Guided practice' : 'Knowledge check'}{' '}
            · {session.ids.length} questions
          </p>
          <PracticeScore
            noun="questions"
            result={summarizePractice(
              session.answers.map((entry, index) => ({
                correct:
                  entry.selected !== null &&
                  matchesAnswer(getPracticeQuestion(session.ids[index]!)!, [
                    entry.selected,
                  ]),
                skipped: entry.selected === null,
                assisted: entry.assisted,
              }))
            )}
          />
          <section
            aria-labelledby="practice-review-title"
            className="practice-review"
          >
            <h2 id="practice-review-title">Question review</h2>
            <div className="filter-row" aria-label="Filter question review">
              {(['all', 'incorrect'] as const).map((value) => (
                <button
                  key={value}
                  className={`filter-chip ${reviewFilter === value ? 'is-active' : ''}`}
                  aria-pressed={reviewFilter === value}
                  onClick={() => setReviewFilter(value)}
                >
                  {value === 'all' ? 'All questions' : 'Incorrect only'}
                </button>
              ))}
            </div>
            {session.ids.map((id, index) => {
              const item = getPracticeQuestion(id)!
              const response = session.answers[index]!
              const correct =
                response.selected !== null &&
                matchesAnswer(item, [response.selected])
              if (
                reviewFilter === 'incorrect' &&
                (correct || response.selected === null)
              )
                return null
              return (
                <details
                  className="decision-review"
                  key={`${id}:${reviewFilter}`}
                  open={reviewFilter === 'incorrect'}
                >
                  <summary>
                    <span className="decision-review-title">
                      <span className="decision-number">{index + 1}</span>
                      <span>{item.collectionTitle}</span>
                    </span>
                    <span
                      className="decision-outcome"
                      data-outcome={
                        response.selected === null
                          ? 'unanswered'
                          : correct
                            ? 'correct'
                            : 'incorrect'
                      }
                    >
                      {response.selected === null
                        ? 'Not answered'
                        : correct
                          ? 'Correct'
                          : 'Incorrect'}
                    </span>
                  </summary>
                  <div className="decision-review-body">
                    <QuestionContext question={item} references={false} />
                    <h3 className="review-question">{item.prompt}</h3>
                    {response.selected === null ? (
                      <p>
                        No answer was submitted. This question is excluded from
                        the score.
                      </p>
                    ) : (
                      <QuestionExplanation
                        question={item}
                        selected={[response.selected]}
                      />
                    )}
                    {response.assisted ? (
                      <p className="quiet-label">
                        Reference support used · No points deducted
                      </p>
                    ) : null}
                  </div>
                </details>
              )
            })}
            {reviewFilter === 'incorrect' &&
            session.answers.every(
              (entry, index) =>
                entry.selected === null ||
                matchesAnswer(getPracticeQuestion(session.ids[index]!)!, [
                  entry.selected,
                ])
            ) ? (
              <p>No incorrect answers in this attempt.</p>
            ) : null}
          </section>
          <div className="practice-actions">
            <button className="rr-button" onClick={setupAgain}>
              Start another practice
            </button>
            <Link href="/rr" className="rr-button-secondary">
              Choose a case
            </Link>
          </div>
        </>
      ) : question ? (
        <section
          className="practice-question-panel"
          aria-label="Current practice question"
        >
          <div className="question-meta">
            <span>
              {session.mode === 'guided'
                ? 'Guided practice'
                : 'Knowledge check'}
            </span>
            <span>
              Question {session.index + 1} of {session.ids.length}
            </span>
          </div>
          <div
            className="practice-progress"
            role="progressbar"
            aria-label="Questions completed"
            aria-valuemin={0}
            aria-valuemax={session.ids.length}
            aria-valuenow={
              session.mode === 'guided' ? session.answers.length : session.index
            }
          >
            <span
              style={{
                width: `${(session.answers.length / session.ids.length) * 100}%`,
              }}
            />
          </div>
          <p className="quiet-label">{question.collectionTitle}</p>
          <QuestionContext
            question={question}
            references={session.mode === 'guided'}
            onLookup={!answer ? () => change({ assisted: true }) : undefined}
          />
          <fieldset className="scenario-question">
            <legend>
              {session.mode === 'guided' ? (
                <InlineReferenceText
                  text={question.prompt}
                  onLookup={
                    !answer ? () => change({ assisted: true }) : undefined
                  }
                />
              ) : (
                question.prompt
              )}
            </legend>
            <p>Choose one response.</p>
            <div className="answer-list">
              {orderedOptions(
                question,
                practiceOptionSeed(session.id, session.index)
              ).map((option, index) => (
                <label
                  key={option.id}
                  className={`answer-option ${session.selected === option.id ? 'is-chosen' : ''}`}
                >
                  <input
                    type="radio"
                    name={`practice-${session.id}-${session.index}`}
                    value={option.id}
                    checked={session.selected === option.id}
                    disabled={Boolean(answer)}
                    onChange={() => change({ selected: option.id })}
                  />
                  <span className="answer-letter" aria-hidden="true">
                    {session.selected === option.id
                      ? '✓'
                      : String.fromCharCode(65 + index)}
                  </span>
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {answer ? (
            <>
              <p className="sr-only" role="status">
                Answer saved.{' '}
                {answer.selected === null
                  ? 'Not answered.'
                  : matchesAnswer(question, [answer.selected])
                    ? 'Correct.'
                    : 'Incorrect.'}
              </p>
              {answer.selected === null ? (
                <p>
                  No answer was submitted. This question is excluded from your
                  score.
                </p>
              ) : (
                <QuestionExplanation
                  question={question}
                  selected={[answer.selected]}
                  variant="brief"
                />
              )}
              <button className="rr-button" onClick={next}>
                {session.index === session.ids.length - 1
                  ? 'View results'
                  : 'Next question'}
              </button>
            </>
          ) : (
            <button
              className="rr-button"
              disabled={!session.selected}
              onClick={submit}
            >
              {session.mode === 'check' &&
              session.index === session.ids.length - 1
                ? 'Submit check'
                : session.mode === 'check'
                  ? 'Save and continue'
                  : 'Submit answer'}
            </button>
          )}
          {session.assisted ? (
            <p className="quiet-label">
              Reference support used for this question.
            </p>
          ) : null}
          {session.mode === 'guided' && answer ? (
            <details className="practice-customize">
              <summary>Question sources & review status</summary>
              <p>Question reference: {question.id}</p>
              <p>
                {question.origin === 'legacy'
                  ? 'Imported practice question'
                  : 'Authored practice question'}{' '}
                · Clinical review pending · Revision {question.revision}
              </p>
              {question.sources.map((source) => (
                <p key={source}>
                  <a
                    href={contentSources[source].url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {contentSources[source].title} ↗
                  </a>
                </p>
              ))}
            </details>
          ) : null}
          <p className="review-note">
            Your answers and place save on this device. Time away does not
            affect your score.
          </p>
        </section>
      ) : null}
    </div>
  )
}
