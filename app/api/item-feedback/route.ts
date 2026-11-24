import { NextRequest, NextResponse } from 'next/server'
import { feedbackIdentity } from '@/lib/feedback/server'
import {
  feedbackInputSchema,
  feedbackReviewSchema,
} from '@/lib/feedback/schema'
export const dynamic = 'force-dynamic'
const headers = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
}
const reply = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers })
const unavailable = (status: number) =>
  reply(
    {
      error:
        status === 401
          ? 'Sign in to send or view tester feedback.'
          : status === 403
            ? 'This account does not have feedback access.'
            : 'Shared feedback is unavailable. Your draft can stay on this device.',
    },
    status
  )
function sameOrigin(request: NextRequest) {
  return (
    request.headers.get('origin') === request.nextUrl.origin &&
    request.headers.get('sec-fetch-site') !== 'cross-site'
  )
}
async function body(request: NextRequest) {
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new Error('JSON required')
  const raw = await request.text()
  if (raw.length > 24000) throw new Error('Request too large')
  return JSON.parse(raw) as unknown
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return reply({ error: 'Send feedback from this app.' }, 403)
  try {
    const identity = await feedbackIdentity()
    if (!identity.client || !identity.user) return unavailable(identity.status)
    let input: unknown
    try {
      input = await body(request)
    } catch {
      return reply(
        { error: 'Send a JSON feedback report within the size limit.' },
        400
      )
    }
    const parsed = feedbackInputSchema.safeParse(input)
    if (!parsed.success)
      return reply(
        { error: 'Check the comment and item details before sending.' },
        400
      )
    const v = parsed.data
    // Retrying the same submission never creates duplicate reports.
    const existing = await identity.client
      .from('rr_item_feedback')
      .select('id,status')
      .eq('id', v.id)
      .eq('user_id', identity.user.id)
      .maybeSingle()
    if (existing.error) return unavailable(503)
    if (existing.data) return reply({ report: existing.data })
    const count = await identity.client
      .from('rr_item_feedback')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', identity.user.id)
      .gte('created_at', new Date(Date.now() - 5 * 60000).toISOString())
    if (count.error) return unavailable(503)
    if ((count.count ?? 0) >= 20)
      return reply(
        {
          error:
            'You have sent several reports. Your draft is saved; try again in a few minutes.',
        },
        429
      )
    const result = await identity.client
      .from('rr_item_feedback')
      .insert({
        id: v.id,
        user_id: identity.user.id,
        item_id: v.itemId,
        item_revision: v.revision,
        activity: v.activity,
        prompt: v.prompt,
        patient_context: v.patientContext ?? '',
        selected: v.selected,
        phase: v.phase,
        kind: v.kind,
        reason: v.reason,
        comment: v.comment,
      })
      .select('id,status')
      .single()
    if (result.error) return unavailable(503)
    return reply({ report: result.data }, 201)
  } catch {
    return reply(
      { error: 'Feedback could not be sent. Keep your draft and try again.' },
      503
    )
  }
}
export async function GET() {
  try {
    const identity = await feedbackIdentity()
    if (!identity.client) return unavailable(identity.status)
    const result = await identity.client
      .from('rr_item_feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (result.error) return unavailable(503)
    return reply({ reports: result.data, reviewer: identity.reviewer })
  } catch {
    return unavailable(503)
  }
}
export async function PATCH(request: NextRequest) {
  if (!sameOrigin(request))
    return reply({ error: 'Review feedback from this app.' }, 403)
  try {
    const identity = await feedbackIdentity()
    if (!identity.client) return unavailable(identity.status)
    if (!identity.reviewer) return unavailable(403)
    let input: unknown
    try {
      input = await body(request)
    } catch {
      return reply({ error: 'Send a JSON review within the size limit.' }, 400)
    }
    const parsed = feedbackReviewSchema.safeParse(input)
    if (!parsed.success)
      return reply(
        { error: 'Choose a status and add a reviewer explanation.' },
        400
      )
    const result = await identity.client
      .from('rr_item_feedback')
      .update({
        status: parsed.data.status,
        reviewer_note: parsed.data.reviewerNote,
      })
      .eq('id', parsed.data.id)
      .select('id,status,reviewer_note,reviewed_at')
      .single()
    if (result.error) return unavailable(503)
    return reply({ report: result.data })
  } catch {
    return unavailable(503)
  }
}
