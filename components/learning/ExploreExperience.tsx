import Link from 'next/link'
import {
  HeartPulse,
  Brain,
  Wind,
  Activity,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react'
import { practiceTopics } from '@/lib/learning/catalog'
const tracks = [
  {
    category: 'Cardiovascular',
    icon: HeartPulse,
    color: 'coral',
    description:
      'Connect chest pain, perfusion, blood pressure and vascular findings.',
  },
  {
    category: 'Critical care',
    icon: Activity,
    color: 'mint',
    description:
      'Explore shock, sepsis and the signals that change your priorities.',
  },
  {
    category: 'Neuro',
    icon: Brain,
    color: 'violet',
    description: 'Start with a focused neurologic assessment question.',
  },
  {
    category: 'Respiratory',
    icon: Wind,
    color: 'blue',
    description: 'Start with a focused respiratory assessment question.',
  },
]
export default function ExploreExperience() {
  return (
    <div className="rr-experience page-enter">
      <header className="explore-intro">
        <p className="eyebrow">EXPLORE YOUR CLINICAL WORLD</p>
        <h1>
          Follow the system.
          <br />
          <em>Find the connection.</em>
        </h1>
        <p>
          Choose a clinical area, then jump into a focused question round. Every
          answer comes with the reasoning behind it.
        </p>
        <div className="catalog-counts">
          <span>
            <strong>
              {practiceTopics.reduce((sum, topic) => sum + topic.items, 0)}
            </strong>{' '}
            questions
          </span>
          <span>
            <strong>{practiceTopics.length}</strong> topic banks
          </span>
          <span>
            <strong>4</strong> clinical areas
          </span>
        </div>
      </header>
      <div className="track-grid">
        {tracks.map(({ category, icon: Icon, color, description }) => {
          const topics = practiceTopics.filter(
            (topic) => topic.category === category
          )
          return (
            <section className={`track-card tone-${color}`} key={category}>
              <div className="track-heading">
                <span className="topic-icon">
                  <Icon size={27} />
                </span>
                <span>
                  {topics.reduce((sum, topic) => sum + topic.items, 0)}{' '}
                  questions
                </span>
              </div>
              <h2>{category}</h2>
              <p>{description}</p>
              <div className="track-topics">
                {topics.map((topic) => (
                  <Link href={`/quiz?bank=${topic.key}`} key={topic.key}>
                    <span>
                      {topic.title}
                      <small>{topic.items} available</small>
                    </span>
                    <ArrowUpRight size={19} />
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
      <div className="method-note">
        <HeartPulse size={27} />
        <div>
          <h3>Want the patient story, too?</h3>
          <p>
            See how a clinical situation changes through six guided decisions.
          </p>
          <Link href="/rr" className="text-link">
            Enter the case room <ArrowRight size={17} />
          </Link>
        </div>
      </div>
      <p className="review-note">
        Bank totals reflect available source questions. The lab presents up to
        five at a time. Legacy questions remain draft practice content.
      </p>
    </div>
  )
}
