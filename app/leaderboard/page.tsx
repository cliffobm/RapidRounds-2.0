import Link from 'next/link'
export default function LeaderboardPage() {
  return (
    <div className="rr-experience pathway-layout page-enter">
      <p className="eyebrow">SHARED LEARNING</p>
      <h1>
        Your progress.
        <br />
        <em>Your own pace.</em>
      </h1>
      <section className="pathway-section">
        <h2>Shared leaderboards are not enabled</h2>
        <p>
          This review edition keeps learning activity on your device. There is
          no verified shared ranking, institution comparison or peer score. No
          rank has been assigned to you.
        </p>
        <p>
          A future shared experience needs authenticated records, clear
          participation choices and appropriate interpretation of learning
          results.
        </p>
        <Link href="/home" className="rr-button">
          See your saved learning activity →
        </Link>
      </section>
      <Link href="/pathway" className="text-link">
        Continue the deterioration pathway →
      </Link>
    </div>
  )
}
