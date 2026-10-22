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
export default function HomeExperience() {
  return (
    <div className="rr-experience home-experience page-enter">
      <section className="rr-hero home-hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <Sparkles size={15} /> RAPID ROUNDS / CLINICAL JUDGMENT
          </span>
          <h1>
            Think clearly.
            <br />
            <em>Act with purpose.</em>
          </h1>
          <p>
            Practice nursing decisions with patient cases, quick questions and
            focused lessons.
          </p>
          <div className="hero-actions">
            <Link href="/rr" className="rr-button rr-button-mint">
              Browse cases <ArrowRight size={18} />
            </Link>
            <Link href="/quiz" className="hero-text-link">
              Practice questions <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="brand-stage">
          <div className="brand-halo" />
          <Logo size="lg" showText={false} />
          <span className="brand-stage-label">
            <Activity size={17} /> THINK CLEAR. ACT READY.
          </span>
        </div>
      </section>
      <QuickLaunch />
      <ContinueLearning />
      <LearningIntention />
      <section className="home-modes" aria-labelledby="home-modes-title">
        <div className="section-heading">
          <div>
            <h2 id="home-modes-title">Choose how to learn</h2>
          </div>
        </div>
        <div className="mode-grid">
          <Link href="/rr" className="mode-card tone-coral">
            <Layers3 size={27} />
            <span className="topic-meta">PATIENT CASES</span>
            <h3>Rounds</h3>
            <p className="intro-copy">
              Make decisions as a patient’s condition changes.
            </p>
            <span className="text-link">
              Browse cases <ArrowRight size={17} />
            </span>
          </Link>
          <Link href="/quiz" className="mode-card tone-mint">
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
