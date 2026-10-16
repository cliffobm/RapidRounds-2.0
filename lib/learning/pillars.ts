export const pillars = [
  {
    id: 'recognize_cues',
    title: 'Recognize cues',
    short: 'Notice',
    question: 'What matters here?',
    color: 'mint',
    description:
      'Find the meaningful signals in the patient story. Separate a change in condition from background noise.',
  },
  {
    id: 'analyze_cues',
    title: 'Analyze cues',
    short: 'Connect',
    question: 'What do the signals mean?',
    color: 'blue',
    description:
      'Connect findings into a pattern. Check what supports your interpretation and what does not fit.',
  },
  {
    id: 'prioritize_hypotheses',
    title: 'Prioritize hypotheses',
    short: 'Prioritize',
    question: 'What cannot wait?',
    color: 'coral',
    description:
      'Weigh likely explanations against the harm of delay. Decide which concern needs attention first.',
  },
  {
    id: 'generate_solutions',
    title: 'Generate solutions',
    short: 'Plan',
    question: 'What could help?',
    color: 'violet',
    description:
      'Build a focused plan with a desired outcome, safe options, and the support you will need.',
  },
  {
    id: 'take_action',
    title: 'Take action',
    short: 'Act',
    question: 'What will you do next?',
    color: 'amber',
    description:
      'Translate the plan into a timely response within your role. Communicate, escalate, and coordinate.',
  },
  {
    id: 'evaluate_outcomes',
    title: 'Evaluate outcomes',
    short: 'Reassess',
    question: 'Did it make a difference?',
    color: 'teal',
    description:
      'Compare the response with the intended outcome. Reassess the patient and adapt the plan.',
  },
] as const
export type PillarId = (typeof pillars)[number]['id']
