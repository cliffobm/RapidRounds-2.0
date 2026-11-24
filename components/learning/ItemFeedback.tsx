'use client'
import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { Flag, MessageSquare, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/store/useAuth'
import { feedbackReasons, type FeedbackContext } from '@/lib/feedback/schema'

type Props = { item: FeedbackContext; onOpenChange?: (open: boolean) => void }
export default function ItemFeedback(props: Props) {
  const userId = useAuth((s) => s.user?.id)
  return (
    <FeedbackForm
      key={`${userId ?? 'offline'}:${props.item.activity}:${props.item.revision}:${props.item.itemId}`}
      {...props}
      userId={userId}
    />
  )
}
function FeedbackForm({
  item,
  onOpenChange,
  userId,
}: Props & { userId: string | undefined }) {
  const label = useId()
  const key = `rr.feedback.draft.v1:${userId ?? 'offline'}:${item.activity}:${item.revision}:${item.itemId}`
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<'flag' | 'suggestion'>('flag')
  const [reason, setReason] = useState<keyof typeof feedbackReasons>('wording')
  const [comment, setComment] = useState('')
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [notice, setNotice] = useState('')
  const [storageAvailable, setStorageAvailable] = useState(true)
  const submissionId = useRef('')
  const openCallback = useRef(onOpenChange)
  openCallback.current = onOpenChange
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const v = JSON.parse(raw)
        if (typeof v.comment === 'string') setComment(v.comment.slice(0, 4000))
        if (v.kind === 'flag' || v.kind === 'suggestion') setKind(v.kind)
        if (Object.prototype.hasOwnProperty.call(feedbackReasons, v.reason))
          setReason(v.reason)
        if (typeof v.id === 'string') submissionId.current = v.id
      }
    } catch {
      setStorageAvailable(false)
    }
    setReady(true)
    return () => openCallback.current?.(false)
  }, [key])
  useEffect(() => {
    if (!ready || sent || (!comment && !open)) return
    try {
      if (!submissionId.current) submissionId.current = crypto.randomUUID()
      localStorage.setItem(
        key,
        JSON.stringify({ comment, kind, reason, id: submissionId.current })
      )
    } catch {
      setStorageAvailable(false)
    }
  }, [comment, kind, reason, ready, sent, key, open])
  const toggle = (next: boolean, type = kind) => {
    setKind(type)
    setOpen(next)
    openCallback.current?.(next)
  }
  const send = async () => {
    if (busy) return
    setBusy(true)
    setNotice('')
    try {
      if (!submissionId.current) submissionId.current = crypto.randomUUID()
      const response = await fetch('/api/item-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          id: submissionId.current,
          kind,
          reason,
          comment,
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.report?.id)
        throw new Error(result.error ?? 'Feedback could not be sent.')
      setSent(true)
      setOpen(false)
      openCallback.current?.(false)
      try {
        localStorage.removeItem(key)
      } catch {
        /* Sent report is already stored centrally. */
      }
    } catch (error) {
      setNotice(
        `${error instanceof Error ? error.message : 'Feedback could not be sent.'} ${storageAvailable ? 'Your draft remains on this device.' : 'Keep this panel open; browser storage is unavailable.'}`
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <aside className="item-feedback" aria-label="Feedback on this item">
      {sent ? (
        <p className="feedback-received" role="status">
          <CheckCircle2 size={17} /> Received for review.{' '}
          <Link href="/feedback">View your reports</Link>
        </p>
      ) : (
        <>
          <div className="item-feedback-actions">
            <button
              type="button"
              onClick={() => toggle(!open || kind !== 'flag', 'flag')}
              aria-expanded={open && kind === 'flag'}
              aria-controls={label}
            >
              <Flag size={16} /> Flag this item
            </button>
            <button
              type="button"
              onClick={() =>
                toggle(!open || kind !== 'suggestion', 'suggestion')
              }
              aria-expanded={open && kind === 'suggestion'}
              aria-controls={label}
            >
              <MessageSquare size={16} /> Suggest a clarification
            </button>
          </div>
          {open && (
            <div id={label} className="item-feedback-panel">
              <h3>
                {kind === 'flag'
                  ? 'What should we review?'
                  : 'How could this be clearer?'}
              </h3>
              <label htmlFor={`${label}-reason`}>Reason</label>
              <select
                id={`${label}-reason`}
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value as keyof typeof feedbackReasons)
                }
              >
                {Object.entries(feedbackReasons).map(([v, text]) => (
                  <option key={v} value={v}>
                    {text}
                  </option>
                ))}
              </select>
              <label htmlFor={`${label}-comment`}>
                {kind === 'flag' ? 'Add a note (optional)' : 'Your suggestion'}
              </label>
              <textarea
                id={`${label}-comment`}
                rows={3}
                maxLength={4000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What felt unclear, and what would you change?"
              />
              <p className="quiet-label">
                Private to you and designated reviewers. Please leave out real
                patient information.
              </p>
              {!storageAvailable && (
                <p role="status">
                  Browser storage is unavailable. Keep this panel open until
                  your report is sent.
                </p>
              )}
              {notice && <p role="status">{notice}</p>}
              <div className="question-actions">
                <button
                  className="rr-button-secondary"
                  type="button"
                  disabled={
                    busy || (kind === 'suggestion' && comment.trim().length < 3)
                  }
                  onClick={send}
                >
                  {busy
                    ? 'Sending…'
                    : kind === 'flag'
                      ? 'Send flag'
                      : 'Send suggestion'}
                </button>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => toggle(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  )
}
