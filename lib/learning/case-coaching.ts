// Original educational drafts. Source context is listed in each case; clinical review is pending.
export const caseRevision = '2026-10-17.1'
export const caseCoaching = {
  sepsis: [
    {
      options: [
        'New confusion with hypotension and rapid breathing',
        'The blood-pressure change alone, treating the other new findings as unrelated',
        'The pneumonia diagnosis alone, reserving reassessment for the next scheduled observations',
      ],
      explanations: [
        'The new findings form a concerning cluster; compare each with baseline and escalate the deterioration.',
        'The pressure matters, but isolating it loses the concurrent changes in cognition and breathing.',
        'An existing diagnosis does not explain away a new change. A scheduled interval should not delay assessment of deterioration.',
      ],
      thinkAloud:
        'I start with what changed, rather than assuming that the admission diagnosis explains everything.',
      missing:
        'What are his oxygen saturation, oxygen requirement, recent urine output and other current assessment findings?',
    },
    {
      options: [
        'An isolated episode of confusion to investigate separately from the circulatory change',
        'Possible infection-related deterioration with impaired perfusion',
        'Medication-related sedation as the working explanation before checking the medication history',
      ],
      explanations: [
        'Assess cognition, but do not separate it from the simultaneous circulatory and respiratory changes.',
        'This interpretation connects the findings while leaving the diagnosis open to clinical assessment.',
        'Medication effects may belong in the differential, but the history is missing and the wider deterioration still needs attention.',
      ],
      thinkAloud:
        'I can name a concerning pattern without claiming that I have established its cause.',
      missing:
        'What recent medicines, fluid balance, investigations or other findings might support or challenge this interpretation?',
    },
    {
      options: [
        'Repeat the full observation set and wait for all results before requesting help',
        'Complete the scheduled antibiotic administration before reassessing the new deterioration',
        'Urgent assessment of this patient’s deterioration',
      ],
      explanations: [
        'Verification can happen alongside escalation; waiting for a complete dataset can delay help.',
        'Scheduled treatment does not replace assessment of a new unstable presentation. Coordinate tasks with the team.',
        'The immediate concern is the new deterioration; redistribute routine work and follow the local escalation process.',
      ],
      thinkAloud:
        'I weigh the harm of delay, not just which task is next on my list.',
      missing:
        'Who can assist immediately, and what escalation route applies in this setting?',
    },
    {
      options: [
        'Urgent clinical review, monitoring and investigation/treatment under the local sepsis pathway',
        'Obtain a complete laboratory panel before discussing a response with the team',
        'Set a plan around the blood-pressure reading without accounting for cognition, breathing or history',
      ],
      explanations: [
        'The plan brings assessment, team support and reassessment together while retaining local protocol boundaries.',
        'Investigations inform care, but a complete set of results is not a prerequisite for escalating deterioration.',
        'A plan based on one number may miss other concerns and patient-specific risks.',
      ],
      thinkAloud:
        'My plan needs an intended outcome, a responsible team and a way to judge the response.',
      missing:
        'What individual risks and local pathway requirements must the team consider?',
    },
    {
      options: [
        '“He has pneumonia and an abnormal pressure; could you review him when available?”',
        '“New confusion, BP 86/50 and RR 29 with pneumonia. I need an urgent bedside review.”',
        '“I think this is sepsis; please review him,” without describing the observed change',
      ],
      explanations: [
        'This communicates a concern but leaves out the new cognitive and respiratory changes and the urgency of the request.',
        'This handover gives observable findings, context and a specific urgent request.',
        'A diagnostic label alone does not give the team the evidence or severity of the change.',
      ],
      thinkAloud:
        'I give the receiving team enough evidence to understand why I need help now.',
      missing:
        'What is the agreed response time, and whom will I contact if the requested help does not arrive?',
    },
    {
      options: [
        'Use the improved blood pressure as the main endpoint while leaving cognition for the routine review',
        'Continue the existing plan unchanged because the heart rate has fallen',
        'Reassess the whole picture and escalate persistent or new concerns',
      ],
      explanations: [
        'Improvement in one measure does not resolve the persistent change in alertness.',
        'A favorable trend is useful, but the plan still needs to account for the remaining abnormal findings.',
        'Compare the whole response with baseline and the agreed goals, then communicate what has and has not improved.',
      ],
      thinkAloud:
        'I look for both improvement and unresolved concerns before closing the loop.',
      missing:
        'Which findings remain abnormal, and what reassessment and escalation plan has the team agreed?',
    },
  ],
  tavr: [
    {
      options: [
        'A slow pulse with hypotension and lightheadedness',
        'The new conduction pattern considered separately from symptoms and blood pressure',
        'Lightheadedness attributed to routine recovery before checking the concurrent observations',
      ],
      explanations: [
        'The symptoms and circulation findings make the slow pulse clinically concerning.',
        'The tracing matters, but it should be interpreted alongside the patient’s condition.',
        'An assumption about routine recovery could obscure a new symptomatic change.',
      ],
      thinkAloud:
        'I connect the monitor with what the patient is experiencing.',
      missing:
        'What was the baseline rhythm and pressure, and does bedside assessment confirm the displayed pulse?',
    },
    {
      options: [
        'A post-procedure medication effect as the explanation before reviewing the medication record',
        'A possible new conduction problem may be contributing to poor perfusion',
        'Monitor artifact as the explanation before comparing the tracing with bedside assessment',
      ],
      explanations: [
        'Medicines may be relevant, but that explanation needs evidence and does not remove the need to assess instability.',
        'This is a working concern to communicate for urgent clinical evaluation, rather than a confirmed rhythm diagnosis.',
        'Artifact should be checked, but it cannot simply be assumed in a symptomatic patient.',
      ],
      thinkAloud:
        'I keep alternative explanations open while communicating the immediate concern.',
      missing:
        'What do the baseline tracing, bedside pulse assessment and recent medication record show?',
    },
    {
      options: [
        'Complete a detailed rhythm classification before requesting assistance',
        'Review all procedural documentation before repeating the bedside assessment',
        'Escalate the symptomatic bradycardia and hypotension now',
      ],
      explanations: [
        'Detailed interpretation supports care, but should not postpone help for current instability.',
        'Records can inform the response; bedside deterioration takes priority.',
        'Current symptoms and circulatory findings justify urgent escalation through the local process.',
      ],
      thinkAloud:
        'I do not need every diagnostic detail before asking for urgent help.',
      missing:
        'Which response team is available, and who will remain with the patient?',
    },
    {
      options: [
        'Continue monitoring, summon urgent help and prepare equipment for the local bradycardia pathway',
        'Prioritize obtaining a complete medication history before mobilizing bedside support',
        'Arrange transfer logistics before establishing a bedside monitoring and response plan',
      ],
      explanations: [
        'Coordinate immediate assessment and support within the local pathway and your role.',
        'The history matters, but should be gathered alongside support for current instability.',
        'Transfer may become necessary; immediate bedside support and team assessment come first.',
      ],
      thinkAloud:
        'I organize parallel tasks so preparation does not replace observation.',
      missing:
        'What equipment and trained staff does the responding team require?',
    },
    {
      options: [
        'Provide the full procedure history before stating the current observations',
        'Give a concise handover and assist the team with ordered stabilization',
        'Focus on obtaining the prior tracing without assigning anyone to communicate the current change',
      ],
      explanations: [
        'Lead with the acute change and request, then add relevant history.',
        'A concise handover and coordinated assistance support the team response.',
        'The prior tracing is useful, but someone must communicate and monitor the current condition.',
      ],
      thinkAloud:
        'I make the urgent concern explicit and clarify who is doing each task.',
      missing:
        'Has the team acknowledged the handover and assigned monitoring and reassessment responsibilities?',
    },
    {
      options: [
        'Use the displayed rate as the main endpoint without confirming the patient’s response',
        'Return to the routine recovery schedule solely because the symptoms have improved',
        'Reassess pulse, perfusion, symptoms and monitoring findings together',
      ],
      explanations: [
        'A displayed rate alone is incomplete evidence of the patient’s response.',
        'Improvement should inform an agreed monitoring plan rather than automatically ending closer observation.',
        'Use bedside findings and monitoring together, and communicate any persistent or recurrent concern.',
      ],
      thinkAloud:
        'I verify that the patient improved, not simply that the screen changed.',
      missing:
        'What ongoing monitoring and response plan has the treating team specified?',
    },
  ],
} as const
