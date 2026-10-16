'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Play,
  Pause,
  Activity,
  BookOpen,
  Layers3,
  Zap,
} from 'lucide-react'
import { usePreferences } from '@/components/settings/PreferencesProvider'
export default function LandingExperience() {
  const { ready, motionReduced } = usePreferences()
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const showVideo = playing && !motionReduced
  return (
    <div className="rr-landing">
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="landing-kicker">
            <Activity size={16} /> FIND YOUR CLINICAL RHYTHM
          </p>
          <h1>
            Think faster.
            <br />
            <em>Decide better.</em>
          </h1>
          <p className="landing-description">
            Build the judgment behind the next decision. Small moments of
            practice. Patient stories that stay with you.
          </p>
          <div className="landing-actions">
            <Link href="/home" className="rr-button rr-button-mint">
              Enter Rapid Rounds <ArrowRight size={19} />
            </Link>
            <Link href="/settings" className="landing-secondary">
              Make it yours →
            </Link>
          </div>
          <p className="landing-note">
            Your pace. No account needed for this review edition.
          </p>
        </div>
        <div className="landing-identity">
          <div className="landing-logo-stage">
            {showVideo ? (
              <video
                className="landing-film"
                src="/brand/rapidrounds-intro.mp4"
                poster="/brand/rapidrounds-metallic.png"
                autoPlay
                muted
                playsInline
                onEnded={() => setPlaying(false)}
                onError={() => {
                  setPlaying(false)
                  setFailed(true)
                }}
                aria-label="Original Rapid Rounds animated logo introduction"
              />
            ) : (
              <Image
                className="landing-logo"
                src="/brand/rapidrounds-metallic.png"
                alt="Rapid Rounds metallic RR logo"
                width={600}
                height={600}
                priority
                sizes="(max-width: 760px) 85vw, 520px"
              />
            )}
          </div>
          <div className="landing-brand-caption">
            <span>RAPID ROUNDS</span>
            <small>THE REASONING. THE RESPONSE. THE RHYTHM.</small>
          </div>
          {ready && !motionReduced && (
            <button
              type="button"
              className="landing-play"
              onClick={() => setPlaying(!playing)}
            >
              {showVideo ? <Pause size={15} /> : <Play size={15} />}
              {showVideo ? 'Stop introduction' : 'Play original introduction'}
            </button>
          )}
          {motionReduced && (
            <p className="landing-note">Still logo · reduced motion enabled</p>
          )}
          {failed && (
            <p role="status" className="landing-note">
              The video could not load. Your original logo is shown instead.
            </p>
          )}
        </div>
      </section>
      <section className="landing-paths" aria-label="Ways to learn">
        <Link href="/rr">
          <Layers3 />
          <span>
            Step into a story<strong>Patient rounds</strong>
          </span>
          <ArrowRight />
        </Link>
        <Link href="/quiz">
          <Zap />
          <span>
            Make one clear choice<strong>Focused practice</strong>
          </span>
          <ArrowRight />
        </Link>
        <Link href="/study">
          <BookOpen />
          <span>
            Understand the why<strong>Reasoning studio</strong>
          </span>
          <ArrowRight />
        </Link>
      </section>
      <footer className="landing-footer">
        <p>Six clinical judgment pillars. One connected way to learn.</p>
        <span>
          Educational review edition · Faculty review pending · For learning,
          outside patient care.
        </span>
      </footer>
    </div>
  )
}
