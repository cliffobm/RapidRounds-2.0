import Link from 'next/link'
import { Activity, ArrowRight, BookOpen, Clock3, Layers3 } from 'lucide-react'
import { practiceCases } from '@/lib/rr-catalog'

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 max-w-2xl">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-signal">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Clinical judgment practice
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          RR Scenarios
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Start with a patient. Work through the decisions. Understand the
          reasoning behind your next move.
        </p>
      </header>
      <div className="mb-8 flex flex-wrap gap-3 text-xs font-medium text-muted">
        <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface px-3 py-2">
          <Layers3 className="h-4 w-4" aria-hidden="true" />
          {practiceCases.length} available cases
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface px-3 py-2">
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          Untimed learning
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface px-3 py-2">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Feedback at every step
        </span>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {practiceCases.map((scenario, index) => (
          <article
            key={scenario.code}
            className={`flex flex-col overflow-hidden rounded-2xl border bg-surface ${scenario.kind === 'guided' ? 'border-signal' : 'border-edge'}`}
          >
            <div className="flex items-center justify-between gap-3 border-b border-edge bg-signal-soft px-6 py-4">
              <span className="text-xs font-semibold tracking-wide text-signal">
                {scenario.system}
              </span>
              <span className="font-mono text-xs text-muted">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <span className="mb-3 text-xs font-medium text-muted">
                {scenario.kind === 'guided'
                  ? 'CJIS guided case · v3 draft'
                  : 'Bundled practice case'}
              </span>
              <h2 className="text-xl font-semibold leading-snug text-ink">
                {scenario.title}
              </h2>
              <p className="mb-6 mt-3 flex-1 text-sm leading-relaxed text-muted">
                {scenario.description}
              </p>
              <p className="mb-4 text-xs text-muted">
                {scenario.questions.length} decisions · Draft learning content
              </p>
              <Link
                href={`/rr/${scenario.code}`}
                className="inline-flex min-h-12 items-center justify-between gap-3 rounded-xl bg-signal px-4 py-3 text-sm font-semibold text-signal-contrast hover:opacity-90"
                aria-label={`Start ${scenario.title}`}
              >
                Start case
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
        Development learning preview. These authored cases are awaiting clinical
        review. Practice feedback is descriptive and does not award XP or a
        validated competency score.
      </p>
    </div>
  )
}
