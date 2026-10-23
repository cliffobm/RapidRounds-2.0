'use client'

import Link from 'next/link'
import { useId, useState } from 'react'
import {
  ECG_CALIBRATION_SOURCE,
  ECG_RHYTHMS,
  type EcgCategory,
} from '@/lib/learning/ecg-rhythms'
import EcgStrip from './EcgStrip'

const categories: readonly ('All' | EcgCategory)[] = [
  'All',
  'Sinus',
  'Atrial & SVT',
  'Ventricular & arrest',
  'AV blocks',
]

export default function EcgLibrary() {
  const searchId = useId()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'All' | EcgCategory>('All')
  const normalized = search.trim().toLowerCase()
  const visible = ECG_RHYTHMS.filter((rhythm) => {
    if (category !== 'All' && rhythm.category !== category) return false
    const searchable =
      `${rhythm.label} ${rhythm.id} ${rhythm.category} ${rhythm.features.join(' ')}`.toLowerCase()
    // Short ECG abbreviations should not match the middle of unrelated words.
    return (
      !normalized ||
      (normalized.length <= 3
        ? searchable.split(/[^\p{L}\p{N}]+/u).includes(normalized)
        : searchable.includes(normalized))
    )
  })
  return (
    <div className="rr-experience ecg-library page-enter">
      <Link href="/practice" className="back-link">
        ← Practice
      </Link>
      <p className="eyebrow">ECG REFERENCE</p>
      <h1>Read the rhythm. Assess the patient.</h1>
      <p className="ecg-library-intro">
        Explore 17 teaching examples before putting rhythm recognition into a
        patient scenario. Compare rate, regularity, P waves, PR intervals and
        QRS width.
      </p>
      <aside className="ecg-context-note" aria-label="How to use these strips">
        <p>
          <strong>The monitor is only part of the assessment.</strong> PEA and
          pulseless VT require clinical pulse assessment. SVT here means a
          regular narrow-complex example; a rapid ventricular response is
          specifically shown with atrial fibrillation.
        </p>
        <p>
          These original single-channel drawings simplify ECG features. They are
          not patient recordings or substitutes for a diagnostic 12-lead ECG.
          Clinical review is pending.
        </p>
      </aside>
      <section
        className="ecg-library-controls"
        aria-label="Find an ECG example"
      >
        <label htmlFor={searchId}>Find a rhythm</label>
        <input
          id={searchId}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Try atrial fibrillation, VT or AV block"
        />
        <div
          className="ecg-category-buttons"
          role="group"
          aria-label="Rhythm category"
        >
          {categories.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <p role="status">{visible.length} of 17 examples</p>
      </section>
      <div className="ecg-library-list">
        {visible.map((rhythm) => (
          <article
            key={rhythm.id}
            className="ecg-library-card"
            aria-labelledby={`rhythm-${rhythm.id}`}
          >
            <p className="eyebrow">{rhythm.category}</p>
            <h2 id={`rhythm-${rhythm.id}`}>{rhythm.label}</h2>
            <EcgStrip rhythmId={rhythm.id} concealLabel={false} />
            <div className="ecg-teaching-details">
              <div>
                <h3>What to notice</h3>
                <ul>
                  {rhythm.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Connect it to the patient</h3>
                <p>{rhythm.pulseContext}</p>
                <p>{rhythm.clinicalContext}</p>
              </div>
            </div>
            <details className="ecg-sources">
              <summary>Clinical references</summary>
              <ul>
                {rhythm.sourceUrls.map((url, index) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer">
                      {url.includes('PMC')
                        ? 'JCS/JHRS arrhythmia diagnosis guideline'
                        : url.includes('jacc')
                          ? 'ACC/AHA atrial fibrillation guideline'
                          : url.includes('nsw')
                            ? 'NSW Emergency Care Institute · SVT'
                            : 'AHA 2025 Adult Advanced Life Support'}
                      {rhythm.sourceUrls.length > 1 ? ` · ${index + 1}` : ''}{' '}
                      (opens a new tab)
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </article>
        ))}
      </div>
      {visible.length === 0 ? (
        <p>No rhythms match. Try a different term or select All.</p>
      ) : null}
      <p className="ecg-calibration-note">
        Illustrated grid ratio: 25 mm/s and 10 mm/mV. Screen size changes the
        physical size of a square, so use the printed time and voltage labels
        rather than a ruler.{' '}
        <a href={ECG_CALIBRATION_SOURCE} target="_blank" rel="noreferrer">
          Calibration reference (opens a new tab)
        </a>
        .
      </p>
    </div>
  )
}
