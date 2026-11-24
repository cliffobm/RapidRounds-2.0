import { z } from 'zod'

export const feedbackReasons = {
  wording: 'Wording is unclear',
  answer: 'Answer may be questionable',
  rationale: 'Explanation needs clarification',
  context: 'Important patient information is missing',
  evidence: 'Evidence may need updating',
  audience: 'Does not fit a newly licensed nurse',
  other: 'Another suggestion',
} as const
export const feedbackStatuses = {
  received: 'Received',
  reviewing: 'Under review',
  updated: 'Updated',
  explained: 'Explanation provided',
} as const
export const feedbackActivities = [
  'rapid-round',
  'practice',
  'evolving',
  'rapid-response',
  'guided',
  'legacy',
  'study',
] as const
export type FeedbackContext = {
  itemId: string
  revision: string
  activity: (typeof feedbackActivities)[number]
  prompt: string
  patientContext?: string
  selected?: string[]
  phase?: 'before' | 'after'
}
export const feedbackInputSchema = z
  .object({
    id: z.string().uuid(),
    itemId: z.string().min(1).max(180),
    revision: z.string().min(1).max(160),
    activity: z.enum(feedbackActivities),
    prompt: z.string().min(1).max(5000),
    patientContext: z.string().max(8000).optional(),
    selected: z.array(z.string().max(180)).max(20).default([]),
    phase: z.enum(['before', 'after']).default('before'),
    kind: z.enum(['flag', 'suggestion']),
    reason: z.enum([
      'wording',
      'answer',
      'rationale',
      'context',
      'evidence',
      'audience',
      'other',
    ]),
    comment: z.string().trim().max(4000).default(''),
  })
  .strict()
  .refine((v) => v.kind === 'flag' || v.comment.length >= 3, {
    path: ['comment'],
    message: 'Add a short suggestion before sending.',
  })
export const feedbackReviewSchema = z
  .object({
    id: z.string().uuid(),
    status: z.enum(['reviewing', 'updated', 'explained']),
    reviewerNote: z.string().trim().min(3).max(4000),
  })
  .strict()
export type FeedbackInput = z.infer<typeof feedbackInputSchema>
export type FeedbackReport = {
  id: string
  item_id: string
  item_revision: string
  activity: FeedbackContext['activity']
  prompt: string
  patient_context: string
  selected: string[]
  phase: 'before' | 'after'
  kind: 'flag' | 'suggestion'
  reason: keyof typeof feedbackReasons
  comment: string
  status: keyof typeof feedbackStatuses
  reviewer_note: string
  created_at: string
  reviewed_at: string | null
}
