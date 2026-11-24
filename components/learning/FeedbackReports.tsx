'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/store/useAuth'
import {
  feedbackReasons,
  feedbackStatuses,
  type FeedbackReport,
} from '@/lib/feedback/schema'
export default function FeedbackReports() {
  const userId = useAuth((s) => s.user?.id)
  return <FeedbackReportList key={userId ?? 'offline'} />
}
function FeedbackReportList() {
  const [reports, setReports] = useState<FeedbackReport[]>([])
  const [reviewer, setReviewer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState('all')
  const refresh = useCallback(async () => {
    setNotice('')
    try {
      const response = await fetch('/api/item-feedback', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok)
        throw new Error(data.error ?? 'Reports could not be loaded.')
      setReports(data.reports)
      setReviewer(data.reviewer)
    } catch (e) {
      setReports([])
      setReviewer(false)
      setNotice(e instanceof Error ? e.message : 'Reports could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    void refresh()
  }, [refresh])
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh()
    }, 30000)
    return () => window.clearInterval(interval)
  }, [refresh])
  return (
    <div className="rr-experience feedback-reports">
      <Link href="/home" className="text-link">
        ← Home
      </Link>
      <p className="eyebrow">MAKE RAPID ROUNDS BETTER</p>
      <h1>{reviewer ? 'Tester feedback review' : 'Your item feedback'}</h1>
      <p>
        {reviewer
          ? 'Review exact item revisions, explain decisions, and keep testers informed.'
          : 'Your flags, suggestions and reviewer responses. Reports from other testers stay private.'}
      </p>
      <div className="question-actions">
        <button
          className="rr-button-secondary"
          type="button"
          onClick={() => void refresh()}
        >
          Refresh reports
        </button>
        <label>
          Status{' '}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {Object.entries(feedbackStatuses).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </label>
      </div>
      {notice && <p role="status">{notice}</p>}
      {loading ? (
        <p>Loading reports…</p>
      ) : !notice && reports.length === 0 ? (
        <p>
          No reports yet. Flag an item or add a suggestion beneath a question.
        </p>
      ) : null}
      {reports
        .filter((r) => filter === 'all' || r.status === filter)
        .map((report) => (
          <Report
            key={report.id}
            report={report}
            reviewer={reviewer}
            onSaved={refresh}
          />
        ))}
      <p className="quiet-label">
        Showing the latest 200 visible reports. Refreshes while this page is
        open.
      </p>
    </div>
  )
}
function Report({
  report,
  reviewer,
  onSaved,
}: {
  report: FeedbackReport
  reviewer: boolean
  onSaved: () => Promise<void>
}) {
  const [status, setStatus] = useState(
    report.status === 'received' ? 'reviewing' : report.status
  )
  const [note, setNote] = useState(report.reviewer_note)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const save = async () => {
    setBusy(true)
    setNotice('')
    try {
      const r = await fetch('/api/item-feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: report.id, status, reviewerNote: note }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error ?? 'Review could not be saved.')
      setNotice('Review saved.')
      await onSaved()
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Review could not be saved.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <article className="feedback-report">
      <p className="eyebrow">
        {feedbackStatuses[report.status]} · {feedbackReasons[report.reason]}
      </p>
      <h2>{report.prompt}</h2>
      <p className="quiet-label">
        {report.activity} · {report.item_id} · revision {report.item_revision}
      </p>
      {report.patient_context && (
        <details>
          <summary>Patient context when reported</summary>
          <p>{report.patient_context}</p>
        </details>
      )}
      <p>{report.comment || 'Flag submitted without a written note.'}</p>
      <p className="quiet-label">
        {report.phase === 'before'
          ? 'Before answer feedback'
          : 'After answering'}{' '}
        · {new Date(report.created_at).toLocaleString()}
      </p>
      {report.reviewer_note && (
        <div className="reviewer-response">
          <strong>Reviewer response</strong>
          <p>{report.reviewer_note}</p>
        </div>
      )}
      {reviewer && (
        <div className="reviewer-controls">
          <label>
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              {Object.entries(feedbackStatuses)
                .filter(([v]) => v !== 'received')
                .map(([v, text]) => (
                  <option key={v} value={v}>
                    {text}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Reviewer explanation
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={4000}
            />
          </label>
          <button
            className="rr-button-secondary"
            disabled={busy || note.trim().length < 3}
            onClick={save}
          >
            {busy ? 'Saving…' : 'Save review'}
          </button>
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
    </article>
  )
}
