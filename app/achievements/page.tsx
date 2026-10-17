import Link from 'next/link'
import ContinueLearning from '@/components/learning/ContinueLearning'
export default function AchievementsPage() {
  return (
    <div className="rr-experience pathway-layout page-enter">
      <p className="eyebrow">YOUR LEARNING ACTIVITY</p>
      <h1>
        Small steps.
        <br />
        <em>A visible record.</em>
      </h1>
      <p>
        Completed activities are recorded on this device. They represent
        participation, not clinical mastery, a verified rank or an awarded
        credential.
      </p>
      <ContinueLearning />
      <Link href="/content-review" className="text-link">
        Understand the content and its review status →
      </Link>
    </div>
  )
}
