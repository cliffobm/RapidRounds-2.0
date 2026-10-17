import Link from 'next/link'
import { practiceTopics } from '@/lib/learning/catalog'
import { guidedCases } from '@/lib/learning/cases'
import { studyUnits } from '@/lib/learning/study'
import { caseRevision } from '@/lib/learning/case-coaching'
export default function ContentReviewPage() {
  return (
    <div className="rr-experience pathway-layout page-enter">
      <Link className="back-link" href="/home">
        ← Your learning
      </Link>
      <p className="eyebrow">CONTENT COVERAGE & REVIEW STATUS</p>
      <h1>
        Know what is
        <br />
        <em>behind the learning.</em>
      </h1>
      <p>
        Rapid Rounds is an educational review edition. Its initial pathway
        focuses on recognizing and communicating adult patient deterioration. No
        activity currently has clinical signoff or a validated passing standard.
      </p>
      <section className="pathway-section">
        <h2>Current coverage</h2>
        <ul>
          <li>
            {studyUnits.length} foundational reasoning units, each with a worked
            example and two checks.
          </li>
          <li>
            {guidedCases.length} guided fictional cases, with{' '}
            {guidedCases.reduce((sum, story) => sum + story.stages.length, 0)}{' '}
            decisions and option-by-option explanations.
          </li>
          <li>
            One new-patient application exercise with three decisions and
            feedback after submission.
          </li>
          <li>
            {practiceTopics.reduce((sum, topic) => sum + topic.items, 0)}{' '}
            inherited questions across {practiceTopics.length} collections;
            these are unmapped draft practice.
          </li>
        </ul>
        <p>
          Case and application revision: {caseRevision}. Clinical reviewer: not
          assigned. Next review date: not assigned. The date identifies an
          editorial revision, not clinical approval.
        </p>
        <ul className="coverage-list">
          {practiceTopics.map((topic) => (
            <li key={topic.key}>
              <Link href={`/quiz?bank=${topic.key}`}>{topic.title}</Link>
              <span>
                {topic.items} items ·{' '}
                {topic.items < 5 ? 'Limited preview' : 'Draft collection'}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="pathway-section">
        <h2>What the results mean</h2>
        <p>
          Completion records participation. Correct answers and paired checks
          provide formative feedback. The six-skill framework, question schema
          and eligibility checks do not validate the content or establish
          clinical competence. No app result should be used for employment,
          licensure or unit competency signoff.
        </p>
        <p>
          Study, activity and session records stay in this browser. They are not
          synced to an account. Browser deletion or a different website address
          can remove access to the saved record.
        </p>
      </section>
      <section className="pathway-section">
        <h2>Before clinical publication</h2>
        <ol>
          <li>
            Assign an educator content owner and an independent clinical
            reviewer.
          </li>
          <li>
            Check objectives, answer keys, distractors, rationales, source
            sections and local-policy boundaries.
          </li>
          <li>
            Resolve disagreements and document reviewer decisions against the
            exact content revision.
          </li>
          <li>Complete editorial, accessibility and learner pilot review.</li>
          <li>
            Publish an approved revision with a review date and correction
            process. Retire or revise content when sources change.
          </li>
        </ol>
        <p>
          Lab tables, drug doses, emergency protocol summaries and calculators
          are withheld pending this review. Permissions for reproduced
          third-party models and media also need resolution before commercial
          release.
        </p>
      </section>
      <section className="pathway-section">
        <h2>Contribute the source material</h2>
        <p>
          Start with three priority topics, existing teaching documents, the
          original question bank and three fictional composite cases with your
          reasoning. Include version dates and permission to use the material.
          Do not include identifiable patient records.
        </p>
        <div className="continue-links">
          <a
            className="rr-button"
            href="/content-intake/question-template.csv"
            download
          >
            Download question intake spreadsheet
          </a>
          <a
            className="rr-button-secondary"
            href="/content-intake/case-template.txt"
            download
          >
            Download case intake template
          </a>
        </div>
        <p>
          These downloads are authoring templates. The review website has no
          patient-record or content-upload feature.
        </p>
      </section>
      <section className="pathway-section">
        <h2>Case source context</h2>
        {guidedCases.map((story) => (
          <div key={story.id}>
            <h3>{story.subtitle}</h3>
            <ul>
              {story.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p>
          Publisher sources inform the drafts; a clinical reviewer still needs
          to verify applicability and exact supporting sections.
        </p>
      </section>
    </div>
  )
}
