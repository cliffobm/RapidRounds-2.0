'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  glossaryEntries,
  searchGlossary,
  valueExamples,
} from '@/lib/learning/glossary'
import { contentSources } from '@/lib/learning/sources'

export function GlossaryBrowser({
  initialQuery = '',
  initialView = 'terms',
  compact = false,
}: {
  initialQuery?: string
  initialView?: 'terms' | 'values'
  compact?: boolean
}) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState('All terms')
  const [view, setView] = useState(initialView)
  const entries = searchGlossary(query, category)
  const values = valueExamples.filter((value) =>
    `${value.name} ${value.example} ${value.context}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  )
  const shown = compact && !query ? entries.slice(0, 6) : entries
  return (
    <div className="glossary-browser">
      <div className="filter-row" aria-label="Reference collection">
        <button
          className={`filter-chip ${view === 'terms' ? 'is-active' : ''}`}
          aria-pressed={view === 'terms'}
          onClick={() => {
            setView('terms')
            setQuery('')
          }}
        >
          Medical terms
        </button>
        <button
          className={`filter-chip ${view === 'values' ? 'is-active' : ''}`}
          aria-pressed={view === 'values'}
          onClick={() => {
            setView('values')
            setQuery('')
          }}
        >
          Values & units
        </button>
      </div>
      <label className="glossary-search">
        Search the reference
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value.slice(0, 100))}
          placeholder="Try SpO2, aphasia or sodium"
        />
      </label>
      {view === 'terms' && (
        <div className="filter-row" aria-label="Terminology categories">
          {[
            'All terms',
            ...new Set(glossaryEntries.map((entry) => entry.category)),
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
      )}
      {view === 'terms' ? (
        <>
          <p aria-live="polite">
            {entries.length} matching terms
            {compact && !query && entries.length > shown.length
              ? ` · Showing ${shown.length}; search to find another term`
              : ''}
            .
          </p>
          {shown.map((entry) => (
            <article
              className="glossary-entry"
              key={entry.id}
              id={`term-${entry.id}`}
            >
              <h3>{entry.term}</h3>
              <p>{entry.definition}</p>
              <p>
                <strong>Reasoning connection:</strong> {entry.reasoning}
              </p>
              {entry.aliases.length > 0 && (
                <p className="quiet-label">
                  Also searched as: {entry.aliases.join(', ')}
                </p>
              )}
              <a
                href={contentSources[entry.source].url}
                target="_blank"
                rel="noreferrer"
              >
                Source context: {contentSources[entry.source].title} ↗
              </a>
            </article>
          ))}
          {!entries.length && (
            <p>
              No matching term. Try a shorter word, a spelling variant or
              another category.
            </p>
          )}
        </>
      ) : (
        <>
          <p className="review-note">
            Educational adult examples, not patient-specific targets or
            critical-value thresholds. Use the reporting laboratory’s interval,
            measurement method, baseline and local clinical plan. Values vary by
            population and setting.
          </p>
          {values.map((value) => (
            <article className="glossary-entry" key={value.id}>
              <h3>{value.name}</h3>
              <strong className="reference-value">{value.example}</strong>
              <p>{value.context}</p>
              <a
                href={contentSources[value.source].url}
                target="_blank"
                rel="noreferrer"
              >
                Check the source interval ↗
              </a>
            </article>
          ))}
          {!values.length && (
            <p>No matching value example. Try its test name or unit.</p>
          )}
        </>
      )}
    </div>
  )
}
export function ReferenceShelf({ onLookup }: { onLookup?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <details
      className="reference-shelf"
      onToggle={(event) => {
        const next = event.currentTarget.open
        setOpen(next)
        if (next) onLookup?.()
      }}
    >
      <summary>Open glossary & value examples</summary>
      {open && (
        <>
          <p>
            Your current question stays in place.
            {onLookup
              ? ' Reference use before confirming a practice answer is recorded as assistance.'
              : ' Definitions support learning; they do not establish a diagnosis.'}
          </p>
          <GlossaryBrowser compact />
          <Link
            className="text-link"
            href="/glossary"
            target="_blank"
            rel="noreferrer"
          >
            Open the full reference in a new tab →
          </Link>
        </>
      )}
    </details>
  )
}
export default function GlossaryExperience({
  initialQuery = '',
  initialView = 'terms',
}: {
  initialQuery?: string
  initialView?: 'terms' | 'values'
}) {
  return (
    <div className="rr-experience pathway-layout page-enter">
      <Link className="back-link" href="/study">
        ← Reasoning studio
      </Link>
      <p className="eyebrow">THE CLINICAL LANGUAGE BANK</p>
      <h1>
        Know the word.
        <br />
        <em>Connect the meaning.</em>
      </h1>
      <p>
        Search {glossaryEntries.length} terms, abbreviations and spelling
        variants. Each entry connects the definition to a reasoning habit; six
        source-specific value examples explain units and context.
      </p>
      <p className="review-note">
        Original educational draft · Updated October 21, 2026 · Human clinical
        review pending. Definitions and values are for learning outside patient
        care.
      </p>
      <GlossaryBrowser initialQuery={initialQuery} initialView={initialView} />
    </div>
  )
}
