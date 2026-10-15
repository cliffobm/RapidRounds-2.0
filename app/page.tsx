'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Activity,
  BookOpen,
  TestTube,
  Flame,
  Target,
  Sparkles,
} from 'lucide-react'
import { BrandIntro } from '@/components/brand/BrandIntro'
import { Card } from '@/components/ui/Card'
import { ClientOnly } from '@/components/ui/ClientOnly'
import { useAuth } from '@/store/useAuth'
import { useProgress } from '@/store/useProgress'

const paths = [
  {
    title: 'Follow a patient',
    text: 'Notice the cues. Make a decision. Explore the reasoning.',
    href: '/rr',
    icon: Activity,
    label: 'Explore RR Scenarios',
  },
  {
    title: 'Build your foundation',
    text: 'Revisit a concept and connect it to your next clinical decision.',
    href: '/study',
    icon: BookOpen,
    label: 'Browse study materials',
  },
  {
    title: 'Practice your recall',
    text: 'Choose a topic and work through a focused question round.',
    href: '/test',
    icon: TestTube,
    label: 'Choose a test',
  },
]

export default function Home() {
  const { user } = useAuth()
  const { xp, level, streakData, getTotalScenariosCompleted } = useProgress()
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <BrandIntro />
          <ClientOnly>
            {user && (
              <p className="mt-7 text-sm font-medium text-muted">
                Welcome back
                {user.user_metadata?.full_name
                  ? `, ${user.user_metadata.full_name}`
                  : ''}
                .
              </p>
            )}
          </ClientOnly>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.12] tracking-tight text-ink sm:text-5xl">
            Build your judgment.
            <br />
            <span className="text-signal">One decision at a time.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            Realistic practice for the moments that matter. Connect what you
            notice to why it matters, then decide what comes next.
          </p>
          <Link
            href="/rr"
            className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl bg-signal px-6 py-3 font-semibold text-signal-contrast hover:opacity-90"
          >
            Start a round <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 to-emerald-400" />
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-signal">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Guided case spotlight
          </p>
          <h2 className="mt-5 text-2xl font-semibold leading-tight text-ink">
            Something is changing.
          </h2>
          <p className="mt-3 leading-relaxed text-muted">
            Follow the post-TAVR case from normal conduction to recognizing a
            change and evaluating a response.
          </p>
          <div className="my-6 flex flex-wrap gap-2 text-xs font-medium text-muted">
            <span className="rounded-full border border-edge px-3 py-1.5">
              5 stages
            </span>
            <span className="rounded-full border border-edge px-3 py-1.5">
              Untimed
            </span>
            <span className="rounded-full border border-edge px-3 py-1.5">
              Draft learning preview
            </span>
          </div>
          <Link
            href="/rr/tavr-conduction"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-signal hover:underline"
          >
            Open guided case{' '}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Card>
      </section>
      <section aria-labelledby="practice-paths">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Your next step
            </p>
            <h2
              id="practice-paths"
              className="mt-2 text-2xl font-semibold text-ink"
            >
              Choose how you practice.
            </h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {paths.map(({ title, text, href, icon: Icon, label }) => (
            <Card key={href} className="flex flex-col p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-signal-soft text-signal">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-ink">{title}</h3>
              <p className="mb-5 mt-2 flex-1 text-sm leading-relaxed text-muted">
                {text}
              </p>
              <Link
                href={href}
                className="inline-flex min-h-11 items-center justify-between gap-2 text-sm font-semibold text-signal"
              >
                {label}
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>
            </Card>
          ))}
        </div>
      </section>
      <section
        aria-labelledby="practice-progress"
        className="rounded-2xl border border-edge bg-surface px-5 py-6 sm:px-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="practice-progress" className="text-lg font-semibold text-ink">
            Your practice on this device
          </h2>
          <Link
            href="/leaderboard"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-signal hover:underline"
          >
            View leaderboard
          </Link>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {[
            { label: 'Practice XP', value: xp, icon: Sparkles },
            { label: 'Level', value: level, icon: Target },
            {
              label: 'Day streak',
              value: streakData?.current_streak || 0,
              icon: Flame,
            },
            {
              label: 'Rounds completed',
              value: getTotalScenariosCompleted(),
              icon: Activity,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label}>
              <dt className="flex items-center gap-2 text-xs text-muted">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </dt>
              <dd className="mt-2 text-2xl font-semibold tabular-nums text-ink">
                <ClientOnly fallback="—">{value}</ClientOnly>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 border-t border-edge pt-4 text-xs leading-relaxed text-muted">
          Development preview. Practice progress on this device is shared
          between accounts; cloud progress sync is still being completed. Guided
          draft cases do not award XP or competency scores.
        </p>
      </section>
    </div>
  )
}
