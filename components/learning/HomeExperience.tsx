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
    <div className="rr-experience page-enter">
      <h1 className="focus-only">Your learning</h1>
      <QuickLaunch />
      <LearningIntention />
      <ContinueLearning />
      <div className="welcome-line">
        <span>
          <i className="live-dot" /> A LITTLE PRACTICE. A LOT OF POSSIBILITY.
        </span>
        <span>Made for the way you learn.</span>
      </div>
      <section className="rr-hero home-hero mode-introduction">
        <div className="hero-copy">
          <span className="hero-kicker">
            <Sparkles size={15} /> CLINICAL JUDGMENT, MADE ACTIVE
          </span>
          <h1>
            Think clearly.
            <br />
            <em>Act with purpose.</em>
          </h1>
          <p>
            Turn “what do I know?” into “what will I do next?” Patient stories,
            focused practice, and the reasoning that brings it all together.
          </p>
          <div className="hero-actions">
            <Link href="/rr" className="rr-button rr-button-mint">
              Step into a round <ArrowRight size={18} />
            </Link>
            <Link href="/quiz" className="hero-text-link">
              Find your next topic <ArrowUpRight size={17} />
            </Link>
          </div>
          <span className="hero-footnote">
            Your pace. Your next lightbulb moment.
          </span>
        </div>
        <div className="brand-stage">
          <div className="brand-halo" />
          <Logo size="lg" showText={false} />
          <span className="brand-stage-label">
            <Activity size={17} /> THINK CLEAR. ACT READY.
          </span>
          <div className="brand-stage-caption">
            The signal is there.
            <br />
            <strong>Learn to see it.</strong>
          </div>
        </div>
      </section>
      <JudgmentPillars />
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">THREE WAYS TO MAKE IT CLICK</p>
            <h2>Find your rhythm.</h2>
          </div>
        </div>
        <div className="mode-grid">
          <Link href="/rr" className="mode-card tone-coral">
            <Layers3 size={27} />
            <span className="topic-meta">THE CASE ROOM</span>
            <h3>
              A patient.
              <br />A changing story.
            </h3>
            <p>
              Move through six decisions with context, feedback and a reflective
              debrief.
            </p>
            <span className="text-link">
              Meet your patient <ArrowRight size={17} />
            </span>
          </Link>
          <Link href="/quiz" className="mode-card tone-mint">
            <Zap size={27} />
            <span className="topic-meta">THE PRACTICE LAB</span>
            <h3>
              Short rounds.
              <br />A deeper why.
            </h3>
            <p>
              Tap into a topic, test your thinking, and make sense of the
              answer.
            </p>
            <span className="text-link">
              Start a quick round <ArrowRight size={17} />
            </span>
          </Link>
          <Link href="/study" className="mode-card tone-violet">
            <BookOpen size={27} />
            <span className="topic-meta">THE REASONING STUDIO</span>
            <h3>
              Understand it.
              <br />
              Then apply it.
            </h3>
            <p>
              Explore a skill, compare your knowledge checks, and take it into a
              case.
            </p>
            <span className="text-link">
              Build your toolkit <ArrowRight size={17} />
            </span>
          </Link>
        </div>
      </section>
      <p className="review-note">
        Educational review edition · Fictional case drafts and practice
        feedback. No validated competency score or clinical endorsement is
        implied.
      </p>
    </div>
  )
}
