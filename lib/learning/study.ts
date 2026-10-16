import type { PillarId } from './pillars'
type Checkpoint = {
  prompt: string
  options: string[]
  correct: number
  rationale: string
}
export type StudyUnit = {
  id: PillarId
  title: string
  minutes: number
  objective: string
  sections: { heading: string; body: string }[]
  pre: Checkpoint
  post: Checkpoint
  reflection: string
}
export const studyUnits: StudyUnit[] = [
  {
    id: 'recognize_cues',
    title: 'See the signal, not just the numbers.',
    minutes: 5,
    objective:
      'Separate a meaningful change from background information, then explain why it matters.',
    sections: [
      {
        heading: 'Start with a baseline',
        body: 'A finding becomes more useful when you compare it with what is usual for this person. Ask what has changed, when it changed, and who observed the change. The patient’s own account and a family member’s observations can add information that a monitor cannot provide.',
      },
      {
        heading: 'Build a cue cluster',
        body: 'List the relevant findings before naming a diagnosis. Include symptoms, observations, history, trends and context. In the Mr. James case, new confusion and a lower blood pressure are more informative together than either is alone. Keep observations separate from your interpretation.',
      },
      {
        heading: 'Check what is missing',
        body: 'An absent detail is not a normal finding. If you do not know the baseline or timing, identify the gap. Verify unexpected observations using the appropriate assessment process while escalating urgent concerns. Do not delay a response simply to assemble a perfect set of data.',
      },
    ],
    pre: {
      prompt:
        'Which question helps establish whether a finding is a meaningful change?',
      options: [
        'Is this different from the patient’s usual state?',
        'Is this the most interesting fact in the chart?',
        'Does this fit the first diagnosis I thought of?',
      ],
      correct: 0,
      rationale:
        'A baseline comparison makes a change visible before you interpret its cause.',
    },
    post: {
      prompt:
        'A family member reports a new change in alertness. How should you use that information?',
      options: [
        'Ignore it because it is not a monitor value',
        'Treat it as a cue to assess alongside the other findings',
        'Record a diagnosis from that observation alone',
      ],
      correct: 1,
      rationale:
        'A reported change is a cue that adds to the assessment; it is not a diagnosis by itself.',
    },
    reflection:
      'Name one observation, one reported change, and one missing detail in your next case.',
  },
  {
    id: 'analyze_cues',
    title: 'Turn scattered facts into a pattern.',
    minutes: 5,
    objective:
      'Connect related cues and identify evidence that could challenge your first interpretation.',
    sections: [
      {
        heading: 'Connect before you conclude',
        body: 'Analysis asks how findings relate to one another. Group information by the concern it may support, rather than by the order it appears in the chart. Distinguish a description of the patient from an explanation of what could be happening.',
      },
      {
        heading: 'Look for the inconvenient cue',
        body: 'A useful explanation accounts for several findings, but it should survive a check for contradictory information. Ask what does not fit and what else could produce this pattern. Naming uncertainty makes a handover more precise; it does not make it weaker.',
      },
      {
        heading: 'Keep the observation visible',
        body: 'Use language such as “new symptoms together with a new conduction change raise concern for…” rather than treating an unconfirmed interpretation as fact. Communicate the actual observations so the team can examine the same evidence and update the explanation.',
      },
    ],
    pre: {
      prompt: 'What turns cue recognition into cue analysis?',
      options: [
        'Copying the observations into a longer list',
        'Choosing the most familiar diagnosis immediately',
        'Explaining relationships between the findings',
      ],
      correct: 2,
      rationale: 'Analysis connects observations into a meaningful pattern.',
    },
    post: {
      prompt:
        'One finding does not fit your initial explanation. What is the strongest response?',
      options: [
        'Reconsider the pattern and seek clarifying information',
        'Leave the finding out of the handover',
        'Assume every other finding must be wrong',
      ],
      correct: 0,
      rationale:
        'Conflicting evidence is a reason to test an interpretation, not hide a cue.',
    },
    reflection:
      'Write a one-sentence explanation, then name a finding that would make you reconsider it.',
  },
  {
    id: 'prioritize_hypotheses',
    title: 'Decide what cannot wait.',
    minutes: 5,
    objective:
      'Compare concerns using urgency, likelihood and the consequences of delay.',
    sections: [
      {
        heading: 'Priority is a comparison',
        body: 'A hypothesis is a possible explanation that needs evaluation. Prioritizing means comparing those explanations and concerns. Ask how well each fits the available evidence and what could happen if attention is delayed. A familiar problem is not automatically the most urgent problem.',
      },
      {
        heading: 'Separate the task list from the patient’s needs',
        body: 'A schedule can make routine work feel urgent. A new concern may change the order of that work. In a handover, explain why the priority changed rather than simply listing everything that is still unfinished.',
      },
      {
        heading: 'Revisit your priority',
        body: 'Priority is not fixed at the beginning of a case. New cues and a response to care may change which concern deserves attention. Say what would move a concern up or down your list, and which findings require escalation through the local process.',
      },
    ],
    pre: {
      prompt: 'Which consideration belongs in prioritizing a concern?',
      options: [
        'How long the routine task has been on the list',
        'The harm that could follow a delay',
        'Which task requires the least effort',
      ],
      correct: 1,
      rationale:
        'Consequences of delay help distinguish a pressing concern from routine work.',
    },
    post: {
      prompt:
        'New information suggests a more urgent concern than the one you first identified. What should happen?',
      options: [
        'Keep the first priority because it was chosen earlier',
        'Finish every planned task before reconsidering',
        'Update the priority and explain the new evidence',
      ],
      correct: 2,
      rationale:
        'Priorities should respond to new evidence, rather than remain attached to the first interpretation.',
    },
    reflection:
      'Finish this sentence: “This concern comes first because delaying it could…”',
  },
  {
    id: 'generate_solutions',
    title: 'Build a plan with a purpose.',
    minutes: 5,
    objective:
      'Connect an intended outcome with safe options and a reassessment plan.',
    sections: [
      {
        heading: 'Name the desired change',
        body: 'A list of actions is not yet a plan. Begin by identifying what you hope will improve or be clarified. That desired outcome helps you compare possible responses and choose which team members, resources or protocols are relevant.',
      },
      {
        heading: 'Consider options and constraints',
        body: 'Think about what could help, what could cause harm, what needs a prescription or another professional’s assessment, and what lies within your role. A strong plan makes these boundaries explicit instead of treating every possible intervention as interchangeable.',
      },
      {
        heading: 'Make reassessment part of the plan',
        body: 'Decide what information you will use to evaluate the response. Include what should be observed, how concerns will be communicated, and what would lead you to seek further review. Planning and evaluation should connect before the first action is taken.',
      },
    ],
    pre: {
      prompt: 'What makes a plan more useful than an unconnected action list?',
      options: [
        'It links actions to an intended outcome',
        'It includes the largest possible number of tasks',
        'It avoids saying what will be reassessed',
      ],
      correct: 0,
      rationale:
        'A desired outcome gives the actions a purpose and makes evaluation possible.',
    },
    post: {
      prompt: 'Which plan is easiest to evaluate?',
      options: [
        '“Do everything available.”',
        '“Identify the intended change, safe responses, and what to reassess.”',
        '“Choose one intervention and never reconsider it.”',
      ],
      correct: 1,
      rationale:
        'Explicit outcomes, responses and reassessment criteria create a learning loop.',
    },
    reflection:
      'State one intended outcome and one observation you would use to check it.',
  },
  {
    id: 'take_action',
    title: 'Make your next move count.',
    minutes: 5,
    objective:
      'Choose a timely response and communicate a specific request within your role.',
    sections: [
      {
        heading: 'From intention to execution',
        body: 'Taking action is more than knowing what should happen. It includes carrying out the appropriate response, coordinating with others and confirming that a request was received. A good plan can still fail if responsibilities and communication remain vague.',
      },
      {
        heading: 'Make the handover actionable',
        body: 'Describe the situation, the relevant change and your concern, then say what you need. “I need an urgent bedside review” is a clearer request than “the observations are in the chart.” Use your organization’s communication and escalation processes.',
      },
      {
        heading: 'Stay within role and keep observing',
        body: 'Act within your competence, local policy and the directions of the responsible clinical team. Escalating a concern does not end your observation of the patient. Continue to communicate changes and check that the agreed response is moving forward.',
      },
    ],
    pre: {
      prompt: 'Which request is most actionable?',
      options: [
        '“Something is different.”',
        '“Someone should look at the chart.”',
        '“There is a new concerning change; I need a bedside review.”',
      ],
      correct: 2,
      rationale: 'It describes a concern and asks for a specific response.',
    },
    post: {
      prompt:
        'After escalating a concern, which approach best supports coordinated care?',
      options: [
        'Confirm the response and continue appropriate observation',
        'Assume the call alone has resolved the concern',
        'Stop communicating any new findings',
      ],
      correct: 0,
      rationale:
        'Clear follow-through connects an escalation with an actual response.',
    },
    reflection:
      'Give a 20-second handover: situation, change, concern, specific request.',
  },
  {
    id: 'evaluate_outcomes',
    title: 'Close the loop. Then look again.',
    minutes: 5,
    objective:
      'Compare the actual response with the intended outcome and identify the next decision.',
    sections: [
      {
        heading: 'Return to the outcome',
        body: 'Ask whether the intended change occurred. Compare the current picture with the baseline and with the goal of the plan. Completing an action and achieving a useful outcome are different things; evaluation checks the second one.',
      },
      {
        heading: 'Use the whole picture',
        body: 'One improved number may coexist with unresolved concerns. Revisit symptoms, observations, trends and the patient’s account. In the case room, a better displayed heart rate is an invitation to assess the patient’s response, not a reason to stop thinking.',
      },
      {
        heading: 'Let the result inform the next step',
        body: 'An unexpected response can suggest a need to reassess cues, reconsider an explanation or seek further review. Close the loop by communicating what changed, what did not, and what will happen next. Clinical judgment is iterative rather than a one-way checklist.',
      },
    ],
    pre: {
      prompt: 'Which statement best describes evaluation?',
      options: [
        '“The task is finished, so the outcome is achieved.”',
        '“Compare the response with the intended outcome.”',
        '“Only unexpected results need reassessment.”',
      ],
      correct: 1,
      rationale: 'Evaluation checks whether the intended outcome was achieved.',
    },
    post: {
      prompt:
        'One observation improves, but another concern persists. What is the best conclusion?',
      options: [
        'Every goal has been achieved',
        'The remaining concern no longer matters',
        'Reassess the overall response and decide what still needs attention',
      ],
      correct: 2,
      rationale:
        'Evaluation looks at the complete response rather than one favorable measurement.',
    },
    reflection:
      'Name what improved, what remains uncertain, and the next thing you would reassess.',
  },
]
export type StudyRecord = {
  version: 1
  unitId: PillarId
  preCorrect: boolean
  postCorrect: boolean
  completedAt: string
}
export function readStudyRecords(raw: string | null): StudyRecord[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? '[]')
    if (!Array.isArray(parsed)) return []
    const seen = new Set<string>()
    return parsed.filter((entry): entry is StudyRecord => {
      if (
        entry?.version !== 1 ||
        !studyUnits.some((unit) => unit.id === entry.unitId) ||
        typeof entry.preCorrect !== 'boolean' ||
        typeof entry.postCorrect !== 'boolean' ||
        typeof entry.completedAt !== 'string' ||
        seen.has(entry.unitId)
      )
        return false
      seen.add(entry.unitId)
      return true
    })
  } catch {
    return []
  }
}
