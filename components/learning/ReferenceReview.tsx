import Link from 'next/link'
export default function ReferenceReview({ title }: { title: string }) {
  return (
    <div className="rr-experience round-layout page-enter">
      <Link className="back-link" href="/study">
        ← Reasoning studio
      </Link>
      <p className="eyebrow">REFERENCE COLLECTION / REVIEW PENDING</p>
      <h1>{title}</h1>
      <section className="pathway-section">
        <h2>This collection needs clinical review</h2>
        <p>
          The inherited tables and calculation tools have been withdrawn from
          the review edition while their sources, units, formulas, ranges and
          patient-specific limitations are checked. No drug dosing or clinical
          calculation tool is available on this page.
        </p>
        <p>
          For patient care, use your organization’s approved resources and
          clinical escalation process. Rapid Rounds currently provides fictional
          learning activities outside patient care.
        </p>
        <Link className="rr-button" href="/content-review">
          See the content review plan →
        </Link>
      </section>
      <section className="pathway-section">
        <h2>Publisher resources</h2>
        <p>
          External sources open on the publisher’s website. Their inclusion does
          not mean that Rapid Rounds has received clinical approval.
        </p>
        <ul className="resource-list">
          <li>
            <a
              href="https://www.nice.org.uk/guidance/ng253"
              target="_blank"
              rel="noreferrer"
            >
              NICE adult suspected sepsis guideline ↗
            </a>
          </li>
          <li>
            <a
              href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support"
              target="_blank"
              rel="noreferrer"
            >
              AHA adult advanced life support guideline ↗
            </a>
          </li>
          <li>
            <a
              href="https://www.acc.org/guidelines"
              target="_blank"
              rel="noreferrer"
            >
              ACC guidelines and clinical policy ↗
            </a>
          </li>
        </ul>
      </section>
    </div>
  )
}
