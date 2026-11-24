import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  BookOpen,
  Zap,
  Sparkles,
  Layers3,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import JudgmentPillars from './JudgmentPillars'
import LearningIntention from './LearningIntention'
import ContinueLearning from './ContinueLearning'
import { QuickLaunch } from './QuickCheck'
import RapidRoundProgress from './RapidRoundProgress'
import { rapidRoundsBrand as brand } from '@/lib/brand'
export default function HomeExperience() {
  return (
    <div className="rr-experience home-experience page-enter">
      <section className="rr-hero home-hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <Sparkles size={15} /> RAPID ROUNDS / CLINICAL JUDGMENT
          </span>
          <h1>
            {brand.headline[0]}
            <br />
            <em>{brand.headline[1]}</em>
          </h1>
          <p>{brand.supporting}</p>
          <p className="intro-copy">{brand.summary}</p>
          <div className="hero-actions">
            <Link href="/rapid-rounds" className="rr-button rr-button-mint">
              Start a Rapid Round <ArrowRight size={18} />
            </Link>
            <Link href="/practice" className="hero-text-link">
              Practice questions <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="brand-stage">
          <div className="brand-halo" />
          <Logo size="lg" showText={false} />
          <span className="brand-stage-label">
            <Activity size={17} /> {brand.signoff}
          </span>
        </div>
      </section>
      <QuickLaunch />
      <RapidRoundProgress />
      <ContinueLearning />
      <LearningIntention />
      <section className="home-modes" aria-labelledby="home-modes-title">
        <div className="section-heading">
          <div>
            <h2 id="home-modes-title">Choose how to learn</h2>
          </div>
        </div>
        <div className="mode-grid">
          <Link href="/rapid-rounds" className="mode-card tone-coral">
            <Layers3 size={27} />
            <span className="topic-meta">
              ONE PATIENT · FOUR FOCUSED PROMPTS
            </span>
            <h3>Rapid Rounds</h3>
            <p className="intro-copy">
              Connect the clues, explore your decisions, and take a clearer next
              step.
            </p>
            <span className="text-link">
              Meet your first patient <ArrowRight size={17} />
            </span>
          </Link>
          <Link href="/practice" className="mode-card tone-mint">
            <Zap size={27} />
            <span className="topic-meta">QUICK QUESTIONS</span>
            <h3>Practice</h3>
            <p className="intro-copy">
              Answer focused questions and review the reasoning.
            </p>
            <span className="text-link">
              Choose a topic <ArrowRight size={17} />
            </span>
          </Link>
          <Link href="/study" className="mode-card tone-violet">
            <BookOpen size={27} />
            <span className="topic-meta">CLINICAL JUDGMENT</span>
            <h3>Study</h3>
            <p className="intro-copy">
              Build a reasoning skill with a short lesson.
            </p>
            <span className="text-link">
              Choose a skill <ArrowRight size={17} />
            </span>
          </Link>
        </div>
        <Link href="/pathway" className="text-link home-pathway-link">
          Follow the deterioration pathway <ArrowRight size={17} />
        </Link>
      </section>
      <JudgmentPillars />
      <p className="review-note">
        <Link href="/content-review">Educational review edition</Link> ·
        Fictional cases · Clinical review pending. Practice results do not
        establish clinical competence.
      </p>
    </div>
  )
}
