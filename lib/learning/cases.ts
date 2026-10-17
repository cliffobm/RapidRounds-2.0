import type { PillarId } from './pillars'
import { caseCoaching } from './case-coaching'
export type CaseStep = {
  competency: PillarId
  update: string
  prompt: string
  options: string[]
  correct: number
  rationale: string
  vitals: [string, string, string]
  explanations?: string[]
  thinkAloud?: string
  missing?: string
}
export type GuidedCase = {
  id: string
  title: string
  subtitle: string
  category: string
  color: string
  initials: string
  patient: string
  setting: string
  summary: string
  sources: { title: string; url: string }[]
  stages: CaseStep[]
}
// Fictional, authored educational drafts. Stage tags describe the exercise design,
// not validated item mappings. Incorrect choices are debriefed before the story advances.
const originalCases: GuidedCase[] = [
  {
    id: 'sepsis',
    title: 'A change you cannot ignore.',
    subtitle: 'The deteriorating patient',
    category: 'Critical care',
    color: 'mint',
    initials: 'MJ',
    patient: 'Mr. James · 72 years',
    setting: 'Medical ward · Afternoon handover',
    summary:
      'A patient being treated for pneumonia is suddenly confused. The numbers tell one story. His daughter tells you another.',
    sources: [
      {
        title: 'NICE NG253: managing suspected sepsis',
        url: 'https://www.nice.org.uk/guidance/ng253/chapter/Managing-suspected-sepsis',
      },
    ],
    stages: [
      {
        competency: 'recognize_cues',
        update:
          'Mr. James has pneumonia. His daughter says he was chatting an hour ago; now he is confused. BP is 88/52 mmHg, HR 118/min, RR 28/min. He normally has a BP around 130/76.',
        prompt: 'Which finding cluster needs your immediate attention?',
        options: [
          'New confusion with hypotension and rapid breathing',
          'His age and the time of the afternoon handover',
          'His daughter visiting outside the usual visiting time',
        ],
        correct: 0,
        rationale:
          'A new mental-status change with low blood pressure and rapid breathing signals deterioration. Recognize the change from his usual state.',
        vitals: ['118', '88/52', '28'],
      },
      {
        competency: 'analyze_cues',
        update:
          'The nurse confirms that these findings are new. Mr. James has a suspected infection and has passed less urine than usual. No further test results are available yet.',
        prompt: 'Which interpretation best connects the findings?',
        options: [
          'Confusion is expected in every older adult',
          'Possible infection-related deterioration with impaired perfusion',
          'A low urine output proves a specific diagnosis on its own',
        ],
        correct: 1,
        rationale:
          'Infection plus new changes in circulation, cognition and urine output raises concern for sepsis. The pattern needs urgent assessment, not a diagnosis from one sign.',
        vitals: ['118', '88/52', '28'],
      },
      {
        competency: 'prioritize_hypotheses',
        update:
          'A colleague is available to help. Routine tasks include replacing a dressing and preparing discharge paperwork for another stable patient.',
        prompt: 'Which concern takes priority?',
        options: [
          'Finish all routine tasks before reassessing',
          'Complete discharge paperwork to free a bed',
          'Urgent assessment of this patient’s deterioration',
        ],
        correct: 2,
        rationale:
          'The potential harm of delaying assessment outweighs routine work. Escalate the unstable patient’s needs and redistribute tasks.',
        vitals: ['120', '86/50', '29'],
      },
      {
        competency: 'generate_solutions',
        update:
          'You are preparing an urgent handover to the clinical team. The cause and severity still need assessment.',
        prompt: 'Which plan is most appropriate to discuss?',
        options: [
          'Urgent clinical review, monitoring and investigation/treatment under the local sepsis pathway',
          'Wait for a high temperature before escalating',
          'Use the same treatment for every patient regardless of assessment',
        ],
        correct: 0,
        rationale:
          'An urgent, individualized pathway should guide assessment and treatment. Collect appropriate samples without delaying time-critical treatment.',
        vitals: ['120', '86/50', '29'],
      },
      {
        competency: 'take_action',
        update:
          'You have the clinical team on the phone. They need a clear picture of the change and what you are requesting.',
        prompt: 'Which escalation communicates the situation most clearly?',
        options: [
          '“He seems a bit different; I will call tomorrow.”',
          '“New confusion, BP 86/50 and RR 29 with pneumonia. I need an urgent bedside review.”',
          '“The observations are in the chart.”',
        ],
        correct: 1,
        rationale:
          'State the specific deterioration and request immediate review using your local escalation process. Continue appropriate observation and care within your role.',
        vitals: ['120', '86/50', '29'],
      },
      {
        competency: 'evaluate_outcomes',
        update:
          'After the team’s assessment and treatment, BP rises to 102/64 and HR falls to 100. Mr. James remains less alert than his usual self. This is the guided story’s next stage, rather than a prediction of treatment response.',
        prompt: 'What is the best next evaluation?',
        options: [
          'One better blood pressure means all concerns are resolved',
          'Stop observations now that treatment has started',
          'Reassess the whole picture and escalate persistent or new concerns',
        ],
        correct: 2,
        rationale:
          'Review trends and the patient’s overall response, not one improved number. Persistent altered alertness still needs attention and reassessment.',
        vitals: ['100', '102/64', '24'],
      },
    ],
  },
  {
    id: 'tavr',
    title: 'The rhythm changes. You respond.',
    subtitle: 'Post-TAVR conduction change',
    category: 'Cardiovascular',
    color: 'coral',
    initials: 'AL',
    patient: 'Alex Lee · 78 years',
    setting: 'Cardiac recovery · Post procedure',
    summary:
      'A new conduction change, a slow pulse, and a patient who says, “I feel lightheaded.” Follow the signals from recognition to reassessment.',
    sources: [
      {
        title: 'AHA 2025: adult advanced life support, bradycardia management',
        url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support',
      },
      {
        title: 'ACC: conduction disturbances after TAVR',
        url: 'https://www.acc.org/latest-in-cardiology/ten-points-to-remember/2020/10/20/20/59/2020-acc-expert-consensus-conduction-disturbances',
      },
    ],
    stages: [
      {
        competency: 'recognize_cues',
        update:
          'Following TAVR, Alex develops a new wide-QRS conduction abnormality with intermittent nonconducted P waves. Pulse is 36/min, BP 82/48 mmHg, and Alex is lightheaded.',
        prompt: 'Which finding cluster signals the most urgent change?',
        options: [
          'A slow pulse with hypotension and lightheadedness',
          'The planned meal after the procedure',
          'The name of the ward on the admission form',
        ],
        correct: 0,
        rationale:
          'A slow rate together with hypotension and symptoms is concerning for hemodynamic compromise. Assess the patient, not just the monitor.',
        vitals: ['36', '82/48', '22'],
      },
      {
        competency: 'analyze_cues',
        update:
          'The monitor change is new after a valve procedure. Alex remains symptomatic. The clinical team must interpret the rhythm and assess the cause.',
        prompt: 'What connection should guide your escalation?',
        options: [
          'Any monitor change after TAVR is harmless',
          'A possible new conduction problem may be contributing to poor perfusion',
          'Lightheadedness rules out a rhythm-related problem',
        ],
        correct: 1,
        rationale:
          'New conduction disturbances can occur after TAVR. Symptoms and perfusion findings help communicate why the change needs urgent evaluation.',
        vitals: ['36', '82/48', '22'],
      },
      {
        competency: 'prioritize_hypotheses',
        update:
          'Routine discharge education is scheduled. Alex’s pulse remains slow and symptoms persist.',
        prompt: 'Which concern should take priority?',
        options: [
          'Complete discharge education before calling for help',
          'Wait until the next routine observation round',
          'Escalate the symptomatic bradycardia and hypotension now',
        ],
        correct: 2,
        rationale:
          'Current instability takes priority over routine discharge work. Do not let the planned workflow obscure an acute change.',
        vitals: ['34', '80/46', '23'],
      },
      {
        competency: 'generate_solutions',
        update:
          'You are coordinating with the response team and preparing the bedside environment.',
        prompt: 'Which plan best supports timely team care?',
        options: [
          'Continue monitoring, summon urgent help and prepare equipment for the local bradycardia pathway',
          'Remove the monitor to reduce anxiety',
          'Send Alex to walk alone to test the symptoms',
        ],
        correct: 0,
        rationale:
          'Support assessment and treatment under the local bradycardia pathway. Be ready to assist with pacing and other prescribed interventions if indicated.',
        vitals: ['34', '80/46', '23'],
      },
      {
        competency: 'take_action',
        update:
          'The response team is arriving. A colleague can help you prepare and communicate.',
        prompt: 'Which action is appropriate within your role?',
        options: [
          'Leave Alex unobserved while locating paperwork',
          'Give a concise handover and assist the team with ordered stabilization',
          'Assume permanent pacing is required without team evaluation',
        ],
        correct: 1,
        rationale:
          'Communicate the change, support monitoring and assist the team. Decisions about pacing strategy require qualified clinical assessment.',
        vitals: ['34', '80/46', '23'],
      },
      {
        competency: 'evaluate_outcomes',
        update:
          'After team-directed stabilization, the displayed rate is 70/min and BP is 108/64. Alex reports less lightheadedness. The guided case advances after debriefing regardless of your previous answer.',
        prompt: 'Which reassessment is most meaningful?',
        options: [
          'The displayed rate alone proves adequate circulation',
          'Improvement means no further monitoring is needed',
          'Reassess pulse, perfusion, symptoms and monitoring findings together',
        ],
        correct: 2,
        rationale:
          'A monitor rate alone does not establish adequate perfusion. Evaluate the patient’s response and continue the agreed monitoring plan.',
        vitals: ['70', '108/64', '18'],
      },
    ],
  },
]
export const guidedCases: GuidedCase[] = originalCases.map((story) => ({
  ...story,
  stages: story.stages.map((step, index) => ({
    ...step,
    ...caseCoaching[story.id as keyof typeof caseCoaching][index],
    options: [
      ...caseCoaching[story.id as keyof typeof caseCoaching][index]!.options,
    ],
    explanations: [
      ...caseCoaching[story.id as keyof typeof caseCoaching][index]!
        .explanations,
    ],
  })),
}))
