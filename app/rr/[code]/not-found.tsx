import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-ink">Case not found</h1>
      <p className="mt-4 text-muted">
        Choose an available case from the scenario library.
      </p>
      <Link
        href="/rr"
        className="mt-6 inline-flex min-h-11 items-center font-semibold text-signal"
      >
        Back to RR Scenarios
      </Link>
    </div>
  )
}
