import type { PillarId } from './pillars'

export const workedExamples: Record<
  PillarId,
  { observation: string; reasoning: string; pitfall: string; transfer: string }
> = {
  recognize_cues: {
    observation:
      'At handover, a previously conversational patient is now struggling to stay engaged. The current observations differ from those recorded earlier.',
    reasoning:
      'Separate what you observed, what another person reported, and what remains unknown. Compare the trend with the individual baseline rather than relying only on whether a number is flagged.',
    pitfall:
      'Copying an old description of “usual confusion” without checking whether this is a new change.',
    transfer:
      'In a different patient, what baseline information would you need to distinguish a longstanding finding from deterioration?',
  },
  analyze_cues: {
    observation:
      'A patient reports dizziness at the same time as a new slow pulse and lower blood pressure. The medication record has not yet been checked.',
    reasoning:
      'Connect the symptoms and observations into a working concern. Keep medication effects and other explanations open for assessment rather than declaring the first explanation certain.',
    pitfall:
      'Choosing an explanation first, then ignoring findings that do not fit it.',
    transfer:
      'Name one additional finding that could change your working explanation, and explain how.',
  },
  prioritize_hypotheses: {
    observation:
      'You have a new unstable presentation, scheduled education and routine documentation competing for attention.',
    reasoning:
      'Consider the consequences of delay and available help. A task can be important without being the most urgent task at this moment. Communicate what is being deferred or delegated.',
    pitfall: 'Letting the order of the task list determine clinical priority.',
    transfer:
      'What new information would change the priority? Who could safely take on the remaining work?',
  },
  generate_solutions: {
    observation:
      'Your working concern needs an immediate team response, but there is not yet enough information to confirm the cause.',
    reasoning:
      'Frame a plan around an intended outcome, escalation, assessment within your role and an explicit reassessment point. Use the local pathway and team assessment for patient-specific treatment decisions.',
    pitfall:
      'Listing interventions without explaining what they are intended to achieve or how the response will be assessed.',
    transfer:
      'For another concern, state the desired outcome and the evidence you would use to judge progress.',
  },
  take_action: {
    observation:
      'You reach a clinician by phone while a colleague is available at the bedside.',
    reasoning:
      'Lead with the change, relevant observations and a specific request. Confirm the response and allocate responsibilities so that communication and bedside observation happen together.',
    pitfall:
      'Giving a long history before stating the urgent problem, or assuming someone else has requested help.',
    transfer:
      'Say a concise handover aloud. What will you do if the requested response does not arrive?',
  },
  evaluate_outcomes: {
    observation:
      'One monitor value improves, but the patient remains different from baseline.',
    reasoning:
      'Compare multiple findings with the intended outcome. Identify what improved, what did not, and whether the plan needs review. Document and communicate the remaining uncertainty.',
    pitfall:
      'Treating a single improved number as proof that the overall problem has resolved.',
    transfer:
      'Name two different sources of evidence you would use to assess the response in a new patient.',
  },
}

export const transferQuestions = [
  {
    pillar: 'recognize_cues' as const,
    context:
      'Fictional patient Morgan, 64, is receiving ward care for a respiratory infection. Earlier they were alert with BP 124/74, HR 86 and RR 18. They now have BP 94/58, HR 112 and RR 27, and their partner reports new difficulty following the conversation.',
    prompt: 'Which information should lead your initial communication?',
    options: [
      'The new combined change in cognition, breathing and circulation compared with baseline',
      'The respiratory infection diagnosis without the new observations',
      'The current blood pressure without describing the other changes',
    ],
    correct: 0,
    rationale:
      'Lead with the new cluster and baseline comparison. The diagnosis alone or one isolated number leaves out the pattern of deterioration.',
  },
  {
    pillar: 'take_action' as const,
    context:
      'You are requesting help. A colleague can remain at the bedside. The cause of the change is still uncertain.',
    prompt: 'Which handover best supports a timely response?',
    options: [
      '“Could you look at the observations when you next visit the ward?”',
      '“New confusion with BP 94/58, HR 112 and RR 27 during treatment for infection. I need an urgent bedside assessment.”',
      '“I have established the diagnosis; please prescribe treatment,” without giving the observations',
    ],
    correct: 1,
    rationale:
      'Communicate observations, context and an explicit urgent request. Avoid both vague timing and an unconfirmed diagnostic claim.',
  },
  {
    pillar: 'evaluate_outcomes' as const,
    context:
      'Following team assessment and care, the pressure is closer to baseline. Morgan remains less alert and breathing remains faster than earlier. This is a scripted update, not a prediction of treatment response.',
    prompt: 'What should guide your reassessment?',
    options: [
      'The pressure alone because it has improved',
      'The fact that treatment has begun, without comparing the response',
      'The whole response, including the persistent changes, and the team’s reassessment plan',
    ],
    correct: 2,
    rationale:
      'Improvement in one observation is incomplete evidence. Communicate persistent concerns and continue the agreed reassessment process.',
  },
]
