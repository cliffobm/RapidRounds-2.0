import { describe, expect, it } from 'vitest'
import { feedbackInputSchema, feedbackReviewSchema } from './schema'
const report = {
  id: 'b8c495e6-959a-4cd7-8572-f3952f376a4c',
  itemId: 'breathing-1',
  revision: '2026-11-24.1',
  activity: 'rapid-round',
  prompt: 'Which findings matter?',
  kind: 'flag',
  reason: 'wording',
}
describe('tester feedback contract', () => {
  it('accepts a flag without mandatory typing and requires a useful note for a suggestion', () => {
    expect(feedbackInputSchema.safeParse(report).success).toBe(true)
    expect(
      feedbackInputSchema.safeParse({ ...report, kind: 'suggestion' }).success
    ).toBe(false)
    expect(
      feedbackInputSchema.safeParse({
        ...report,
        kind: 'suggestion',
        comment: 'Clarify the baseline.',
      }).success
    ).toBe(true)
  })
  it('rejects forged owners, review statuses, oversized comments and unsupported activities', () => {
    for (const patch of [
      { user_id: 'another-user' },
      { status: 'updated' },
      { comment: 'x'.repeat(4001) },
      { activity: 'billing' },
    ])
      expect(
        feedbackInputSchema.safeParse({ ...report, ...patch }).success
      ).toBe(false)
  })
  it('requires a reviewer explanation and permits only review fields', () => {
    expect(
      feedbackReviewSchema.safeParse({
        id: report.id,
        status: 'updated',
        reviewerNote: 'Baseline clarified in the next revision.',
      }).success
    ).toBe(true)
    expect(
      feedbackReviewSchema.safeParse({
        id: report.id,
        status: 'updated',
        reviewerNote: '',
      }).success
    ).toBe(false)
    expect(
      feedbackReviewSchema.safeParse({
        id: report.id,
        status: 'updated',
        reviewerNote: 'Changed',
        comment: 'Replace the tester message',
      }).success
    ).toBe(false)
  })
})
