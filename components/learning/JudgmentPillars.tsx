'use client'
import { useState } from 'react'
import {
  ScanEye,
  Network,
  ListOrdered,
  Lightbulb,
  Zap,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react'
import { pillars } from '@/lib/learning/pillars'
const icons = [ScanEye, Network, ListOrdered, Lightbulb, Zap, RefreshCw]
export default function JudgmentPillars({
  compact = false,
}: {
  compact?: boolean
}) {
  const [selected, setSelected] = useState(0)
  const active = pillars[selected]!
  return (
    <section
      className={`judgment-system ${compact ? 'is-compact' : ''}`}
      aria-label="Six pillars of clinical judgment"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE RAPID ROUNDS METHOD</p>
          <h2>Six moves. One sharper clinical mind.</h2>
        </div>
        <span className="quiet-label">Built around the NCSBN model</span>
      </div>
      <div className="pillar-grid">
        {pillars.map((pillar, index) => {
          const Icon = icons[index]!
          return (
            <button
              key={pillar.id}
              className={`pillar-card tone-${pillar.color} ${selected === index ? 'is-selected' : ''}`}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              <span className="pillar-top">
                <span className="pillar-number">0{index + 1}</span>
                <Icon size={20} />
              </span>
              <strong>{pillar.short}</strong>
              <span>{pillar.title}</span>
              <span className="pillar-arrow">
                <ArrowUpRight size={16} />
              </span>
            </button>
          )
        })}
      </div>
      <div className={`pillar-explanation tone-${active.color}`}>
        <span className="pillar-number">0{selected + 1}</span>
        <div>
          <h3>{active.question}</h3>
          <p>{active.description}</p>
        </div>
        <a href={`/study?pillar=${active.id}`} className="text-link">
          Explore this skill <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  )
}
