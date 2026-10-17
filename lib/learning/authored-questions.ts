import type { BankKey } from '@/qbank/banks'
import type { PillarId } from './pillars'
import type { SourceId } from './sources'
import { expansionRevision } from './sources'

type Choice = [text: string, explanation: string]
export type AuthoredQuestion = {
  id: string
  bankKey: BankKey
  primaryCompetency: PillarId
  context: string
  prompt: string
  options: { id: string; text: string }[]
  correctId: string
  explanations: string[]
  reflection: string
  sources: SourceId[]
  reviewStatus: 'draft'
  version: string
}
function q(
  id: string,
  bankKey: BankKey,
  primaryCompetency: PillarId,
  context: string,
  prompt: string,
  choices: [Choice, Choice, Choice],
  reflection: string,
  sources: SourceId[]
): AuthoredQuestion {
  // The first authored choice is the teaching answer; rotate presentation to avoid a fixed answer position.
  const shift =
    [...id].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 3
  const ordered = choices.map((choice, index) => ({
    choice,
    correct: index === 0,
  }))
  const rotated = [...ordered.slice(shift), ...ordered.slice(0, shift)]
  return {
    id: `rr-draft-${id}`,
    bankKey,
    primaryCompetency,
    context,
    prompt,
    options: rotated.map((entry, index) => ({
      id: String.fromCharCode(65 + index),
      text: entry.choice[0],
    })),
    correctId: String.fromCharCode(
      65 + rotated.findIndex((entry) => entry.correct)
    ),
    explanations: rotated.map((entry) => entry.choice[1]),
    reflection,
    sources,
    reviewStatus: 'draft',
    version: expansionRevision,
  }
}

export const authoredQuestions: AuthoredQuestion[] = [
  q(
    'acs-1',
    'acute_mi',
    'recognize_cues',
    'A 59-year-old reports new chest pressure with nausea and sweating while resting. The discomfort is different from previous indigestion. No ECG has been obtained.',
    'Which description should lead the escalation?',
    [
      [
        'New chest pressure with associated symptoms and a change from the usual pattern',
        'The symptom cluster and change justify timely assessment; the cause remains unconfirmed.',
      ],
      [
        'A history of indigestion, using that history as the main explanation',
        'Past symptoms do not establish the cause of this new episode.',
      ],
      [
        'The nausea alone, without describing the chest pressure',
        'Isolating one symptom loses the clinically relevant combination.',
      ],
    ],
    'What additional timing and symptom information would help the receiving team?',
    ['acs']
  ),
  q(
    'acs-2',
    'acute_mi',
    'analyze_cues',
    'A patient’s chest discomfort has eased. The initial ECG has been reviewed, but planned serial assessment and blood testing are not complete.',
    'Which interpretation avoids premature closure?',
    [
      [
        'Symptom improvement is useful, but the assessment remains incomplete',
        'The trajectory and investigation plan still need review before drawing a conclusion.',
      ],
      [
        'Pain relief establishes a noncardiac cause',
        'A change in discomfort does not independently establish its cause.',
      ],
      [
        'One initial investigation resolves all subsequent concerns',
        'Clinical interpretation may require evolving symptoms and further planned testing.',
      ],
    ],
    'Which new finding would make you revise your initial interpretation?',
    ['acs']
  ),
  q(
    'acs-3',
    'acute_mi',
    'take_action',
    'A ward patient has new chest discomfort. You are calling the response team. A colleague is available to remain with the patient.',
    'Which handover is most useful?',
    [
      [
        'State symptom onset, current observations, associated symptoms and the urgent review request',
        'This provides the receiving team with the change, severity and action requested.',
      ],
      [
        'Read the entire admission history before mentioning the current symptoms',
        'Relevant history helps, but the acute concern and request should be clear early.',
      ],
      [
        'Report “cardiac pain” without the observed symptoms or timing',
        'A label alone hides the evidence and the uncertainty.',
      ],
    ],
    'Who will continue observing the patient while the handover happens?',
    ['acs', 'deterioration']
  ),
  q(
    'acs-4',
    'acute_mi',
    'evaluate_outcomes',
    'After team assessment, a patient reports less chest pressure but now feels faint and has a falling blood-pressure trend.',
    'What should guide the next evaluation?',
    [
      [
        'Reassess the new circulatory symptoms and communicate the changing picture',
        'A new concern matters even when the original symptom improves.',
      ],
      [
        'Use the improved pain rating as the only endpoint',
        'One improved symptom is incomplete evidence of the response.',
      ],
      [
        'Wait for the next planned routine check because a team has already reviewed the patient',
        'A prior review does not remove the need to respond to a subsequent change.',
      ],
    ],
    'What improved, what worsened and what is still unknown?',
    ['acs', 'deterioration']
  ),

  q(
    'sound-1',
    'heart_sounds',
    'analyze_cues',
    'During auscultation you hear a sound between S1 and S2. You have not yet characterized its location, intensity or associated findings.',
    'What is the most defensible documentation?',
    [
      [
        'Describe a possible systolic murmur and the findings that still need assessment',
        'Timing is an observation; further characterization is needed before attributing a cause.',
      ],
      [
        'Name a specific valve lesion from timing alone',
        'Timing alone is insufficient to identify the lesion.',
      ],
      [
        'Document a diastolic murmur because an additional sound was heard',
        'The stated timing is between S1 and S2, not after S2.',
      ],
    ],
    'Which characteristics would make your description reproducible for another examiner?',
    ['auscultation']
  ),
  q(
    'sound-2',
    'heart_sounds',
    'recognize_cues',
    'An older patient has new breathlessness, a rising oxygen requirement and a newly noted extra heart sound. No previous auscultation description is available.',
    'Which finding set should guide your concern?',
    [
      [
        'The extra sound together with the new respiratory changes',
        'The combined change warrants assessment; one sound does not establish the diagnosis.',
      ],
      [
        'The sound alone, disregarding breathing and oxygen needs',
        'Auscultation is one part of the assessment.',
      ],
      [
        'The missing prior description as evidence that the sound must be longstanding',
        'Missing documentation is not evidence of an unchanged finding.',
      ],
    ],
    'What baseline information would reduce uncertainty without delaying assessment?',
    ['auscultation', 'deterioration']
  ),
  q(
    'sound-3',
    'heart_sounds',
    'generate_solutions',
    'A patient’s breathlessness and an uncertain extra sound need review. Background noise makes auscultation difficult.',
    'Which plan best improves the assessment?',
    [
      [
        'Reassess safely in better listening conditions, compare other findings and arrange review based on the patient’s condition',
        'Improving technique and examining the wider picture can occur alongside appropriate escalation.',
      ],
      [
        'Keep repeating auscultation until the sound has a definite name before requesting help',
        'Repeated examination should not postpone help for a deteriorating patient.',
      ],
      [
        'Use the uncertain sound to select a treatment without further assessment',
        'An uncertain finding is insufficient to select patient-specific treatment.',
      ],
    ],
    'How would you communicate uncertainty while still making an actionable request?',
    ['auscultation', 'deterioration']
  ),
  q(
    'sound-4',
    'heart_sounds',
    'evaluate_outcomes',
    'A quieter room makes an extra sound easier to hear. The patient’s breathing effort has increased during the assessment.',
    'What is the priority interpretation?',
    [
      [
        'The clearer sound improves the description, but the worsening breathing still requires a response',
        'Better measurement does not mean the patient’s condition improved.',
      ],
      [
        'A more confident sound classification means the concern is resolved',
        'Diagnostic confidence and clinical improvement are different outcomes.',
      ],
      [
        'The sound should be followed while the new breathing change is left for routine review',
        'A new respiratory change needs attention in the overall assessment.',
      ],
    ],
    'How could improved measurement be mistaken for improvement in the patient?',
    ['auscultation', 'deterioration']
  ),

  q(
    'perfusion-1',
    'multisystem_core_shock',
    'recognize_cues',
    'A patient with several episodes of vomiting is newly lightheaded, has a faster pulse, and has passed less urine than earlier. Their current pressure is still within the printed chart interval.',
    'Which interpretation is most useful?',
    [
      [
        'The combined changes still raise a perfusion concern despite the pressure being within the printed interval',
        'Population intervals do not erase a concerning trend in the individual.',
      ],
      [
        'The printed blood-pressure interval excludes a circulatory concern',
        'A single measurement cannot exclude deterioration.',
      ],
      [
        'Low urine output alone establishes one specific cause',
        'Urine output has several possible explanations and requires context.',
      ],
    ],
    'What would intake, losses and baseline observations add?',
    ['fluids']
  ),
  q(
    'perfusion-2',
    'multisystem_core_shock',
    'analyze_cues',
    'You are assessing possible volume depletion. The patient also has a history of heart failure and chronic kidney disease.',
    'What information most improves the working picture?',
    [
      [
        'Recent intake and losses, baseline function, examination and current trends together',
        'Assessment must account for both possible deficits and patient-specific risks.',
      ],
      [
        'The diagnosis of volume depletion used without checking other findings',
        'A working label needs supporting observations.',
      ],
      [
        'The chronic conditions used as proof that the current change is baseline',
        'Chronic disease does not explain every new symptom.',
      ],
    ],
    'Which findings might challenge the first explanation?',
    ['fluids']
  ),
  q(
    'perfusion-3',
    'multisystem_core_shock',
    'generate_solutions',
    'The team is reviewing a patient with possible impaired perfusion and a complex cardiac history.',
    'Which plan is most appropriate to discuss?',
    [
      [
        'An individualized assessment and response plan with explicit reassessment and local-protocol boundaries',
        'The plan should consider the cause, risks and how the response will be evaluated.',
      ],
      [
        'The same fluid plan for every patient with low blood pressure',
        'A fixed response ignores cause and patient-specific risks.',
      ],
      [
        'A plan based only on the urine-output total without checking timing or other findings',
        'The meaning of a total depends on the interval and wider assessment.',
      ],
    ],
    'What outcome and reassessment point should be explicit in the plan?',
    ['fluids']
  ),
  q(
    'perfusion-4',
    'multisystem_core_shock',
    'evaluate_outcomes',
    'After team-directed care, pressure improves. New breathlessness appears and the patient still feels faint.',
    'What should happen to your interpretation?',
    [
      [
        'Reassess the overall response and urgently communicate the persistent and new concerns',
        'The response includes both improvement and possible new harm or unresolved illness.',
      ],
      [
        'Keep the plan unchanged because the pressure improved',
        'One endpoint does not capture the whole response.',
      ],
      [
        'Assume the new breathing problem has the same cause without assessment',
        'New findings may require the working explanation and plan to change.',
      ],
    ],
    'Which evidence would you use to decide whether the response was beneficial overall?',
    ['fluids', 'deterioration']
  ),

  q(
    'neuro-1',
    'neuro_template',
    'recognize_cues',
    'At handover a patient suddenly has an uneven smile, one arm drifts downward and words are difficult to understand. Routine observations are not markedly different.',
    'Which finding should drive the response?',
    [
      [
        'The sudden focal neurologic change',
        'New focal findings require urgent evaluation even when other observations look reassuring.',
      ],
      [
        'The reassuring routine observations used to postpone review',
        'Routine observations do not exclude a neurologic emergency.',
      ],
      [
        'The speech problem treated as a communication preference without checking baseline',
        'A new speech change must be distinguished from the person’s usual communication.',
      ],
    ],
    'Who can help establish the baseline and timing?',
    ['stroke']
  ),
  q(
    'neuro-2',
    'neuro_template',
    'analyze_cues',
    'A patient was last speaking normally at 09:10. Weakness is discovered at 09:40. No one observed the exact onset.',
    'What should you communicate about timing?',
    [
      [
        'Last known well at 09:10 and discovery at 09:40, with exact onset unknown',
        'Separate what was witnessed from what is inferred.',
      ],
      [
        'Onset at 09:40 because that is when someone noticed the problem',
        'Discovery and onset are not necessarily the same.',
      ],
      [
        'An estimated onset halfway between the two times',
        'An invented midpoint makes the history less reliable.',
      ],
    ],
    'How would you label the source and certainty of each time?',
    ['stroke', 'strokeTiming']
  ),
  q(
    'neuro-3',
    'neuro_template',
    'prioritize_hypotheses',
    'A patient has a new speech problem and arm weakness. A routine analgesic is due and a family member is available to describe the baseline.',
    'Which response best addresses urgency?',
    [
      [
        'Activate the local urgent neurologic response while a colleague gathers baseline and timing',
        'Parallel assessment and information gathering avoid delaying escalation.',
      ],
      [
        'Finish routine medication tasks before initiating the response',
        'Routine work should not postpone assessment of the acute change.',
      ],
      [
        'Obtain a complete family history before requesting help',
        'Useful history can be gathered alongside urgent support.',
      ],
    ],
    'Which tasks can safely occur in parallel?',
    ['stroke', 'deterioration']
  ),
  q(
    'neuro-4',
    'neuro_template',
    'evaluate_outcomes',
    'A patient’s speech and weakness improve before the clinical team arrives. The episode was witnessed.',
    'Which handover is best?',
    [
      [
        'Describe the original deficits, timing and current improvement and continue the urgent evaluation',
        'Improvement does not make the witnessed event irrelevant.',
      ],
      [
        'Cancel the concern because the current examination is better',
        'Transient symptoms can still require urgent clinical evaluation.',
      ],
      [
        'Report only the current findings and omit the earlier episode',
        'That omits information needed to interpret the event.',
      ],
    ],
    'What would be lost if the earlier findings were not documented?',
    ['stroke']
  ),

  q(
    'resp-1',
    'pulm_template',
    'recognize_cues',
    'A patient’s respiratory rate rises from 16 to 30/min. They can now speak only a few words at a time, although the displayed SpO₂ is 96%.',
    'What should guide your concern?',
    [
      [
        'The increased rate and effort despite the reassuring displayed saturation',
        'Oximetry is one measurement; the work of breathing and change in function remain important.',
      ],
      [
        'The saturation alone as evidence that breathing is adequate',
        'Saturation does not capture every aspect of respiratory status.',
      ],
      [
        'The ability to say a few words as evidence that no urgent assessment is needed',
        'Reduced speech tolerance is itself relevant to the breathing assessment.',
      ],
    ],
    'What does the saturation tell you, and what does it not tell you?',
    ['deterioration', 'oximetry']
  ),
  q(
    'resp-2',
    'pulm_template',
    'analyze_cues',
    'A pulse oximeter shows a new low reading on a cold hand with a poor signal. The patient also reports increased breathlessness.',
    'Which approach best handles uncertainty?',
    [
      [
        'Assess the patient and promptly verify the measurement while responding to the clinical concern',
        'Possible artifact and true deterioration can coexist; neither should be assumed away.',
      ],
      [
        'Dismiss the symptoms because the signal may be unreliable',
        'An unreliable device does not invalidate the patient’s report.',
      ],
      [
        'Assume the number is exact and ignore signal quality',
        'Measurement limitations need to be considered alongside symptoms.',
      ],
    ],
    'Which independent findings could help confirm or challenge the reading?',
    ['oximetry', 'deterioration']
  ),
  q(
    'resp-3',
    'pulm_template',
    'take_action',
    'A patient is more drowsy and breathing more slowly than at the last check. SpO₂ is being maintained on supplemental oxygen.',
    'What is the most useful escalation?',
    [
      [
        'State the new alertness and breathing changes, oxygen support and request urgent assessment',
        'Oxygen support and saturation do not substitute for assessment of ventilation and alertness.',
      ],
      [
        'Report the saturation alone without the breathing or alertness changes',
        'That leaves out the important deterioration.',
      ],
      [
        'Wait for the saturation to fall before requesting assessment',
        'Other clinical findings may justify a response before that occurs.',
      ],
    ],
    'Which observations are missing from a saturation-only handover?',
    ['deterioration', 'oximetry']
  ),
  q(
    'resp-4',
    'pulm_template',
    'evaluate_outcomes',
    'After team-directed care, the displayed saturation improves, but the patient is still working harder to breathe than earlier.',
    'Which reassessment is most complete?',
    [
      [
        'Compare effort, rate, alertness, symptoms and oxygen support with the agreed goals',
        'The whole response matters, including how much support is needed.',
      ],
      [
        'Judge recovery from the saturation alone',
        'A better number may coexist with ongoing distress.',
      ],
      [
        'Assume the original cause has resolved because treatment was given',
        'Treatment delivery and treatment response are different observations.',
      ],
    ],
    'What unresolved concern would you include in the next handover?',
    ['deterioration', 'oximetry']
  ),

  q(
    'sepsis-1',
    'sepsis_septic_shock',
    'recognize_cues',
    'A patient receiving care for infection becomes newly confused, breathes faster and has lower pressure than earlier. A high temperature is not recorded.',
    'What should guide your response?',
    [
      [
        'The new combined deterioration in the context of infection',
        'A concerning presentation should not be dismissed solely because fever is absent.',
      ],
      [
        'The absence of fever used to defer assessment',
        'Temperature is only one part of the assessment.',
      ],
      [
        'The infection label used as a complete explanation for confusion',
        'The new change needs assessment rather than being explained away by the label.',
      ],
    ],
    'Which new findings suggest the illness is affecting more than one function?',
    ['sepsis', 'deterioration']
  ),
  q(
    'sepsis-2',
    'sepsis_septic_shock',
    'analyze_cues',
    'A patient with possible infection has reduced urine output. The collection interval and prior output are not documented.',
    'What would improve interpretation?',
    [
      [
        'Clarify timing, baseline and collection reliability while assessing the whole patient',
        'A measurement needs an interval and context to become useful evidence.',
      ],
      [
        'Treat the total as a reliable hourly rate without checking the interval',
        'That invents precision that the record does not support.',
      ],
      [
        'Use the total alone to establish the cause of deterioration',
        'One finding cannot establish the cause.',
      ],
    ],
    'What assumptions are you making about the measurement?',
    ['sepsis', 'fluids']
  ),
  q(
    'sepsis-3',
    'sepsis_septic_shock',
    'generate_solutions',
    'You are coordinating care for infection-related deterioration. One colleague can monitor while another contacts the response team.',
    'Which plan best supports timely care?',
    [
      [
        'Assign observation, escalation and information gathering with an agreed reassessment plan',
        'Clear parallel responsibilities reduce gaps while the team evaluates the cause and response.',
      ],
      [
        'Have everyone gather the same information before anyone escalates',
        'Duplicated preparation can leave the urgent request undone.',
      ],
      [
        'Wait to set a reassessment plan until all investigations are complete',
        'Reassessment should be part of the response to an evolving concern.',
      ],
    ],
    'Who owns each task and how will you confirm it happened?',
    ['sepsis', 'deterioration']
  ),
  q(
    'sepsis-4',
    'sepsis_septic_shock',
    'evaluate_outcomes',
    'A patient’s pressure is closer to baseline after clinical care, but confusion and low urine output persist.',
    'What is the best conclusion?',
    [
      [
        'There is partial improvement with unresolved concerns requiring continued review',
        'Different findings may improve at different rates; communicate what remains abnormal.',
      ],
      [
        'The improved pressure proves all organ-related concerns have resolved',
        'One measure cannot establish that conclusion.',
      ],
      [
        'Persistent confusion can now be labeled usual behavior without checking baseline',
        'The previously documented new change remains relevant.',
      ],
    ],
    'How would you describe partial improvement without overstating recovery?',
    ['sepsis', 'deterioration']
  ),

  q(
    'critical-1',
    'anaphylaxis_mods_trauma_sedation',
    'recognize_cues',
    'During an infusion, a patient develops sudden noisy breathing, difficulty speaking and lightheadedness. No rash is visible.',
    'Which interpretation best supports a safe response?',
    [
      [
        'An acute airway or circulatory concern needs urgent assessment, with a possible reaction among the explanations',
        'Serious allergic reactions can present without visible skin changes; use the local emergency process.',
      ],
      [
        'A serious reaction is excluded because there is no rash',
        'Skin findings are not required for every severe presentation.',
      ],
      [
        'The lightheadedness can be separated from the new breathing problem',
        'The timing and combined changes should be communicated together.',
      ],
    ],
    'What timing and exposure information would help the response team?',
    ['anaphylaxis']
  ),
  q(
    'critical-2',
    'anaphylaxis_mods_trauma_sedation',
    'analyze_cues',
    'Following a procedure, a patient who was alert is now difficult to rouse and breathing more slowly. Recent medicines have not been reviewed.',
    'What should guide your working concern?',
    [
      [
        'A new alertness and breathing change that needs assessment, with medication effects among the possibilities',
        'Keep the possible cause open while responding to the observed deterioration.',
      ],
      [
        'The assumption that sleepiness is expected after any procedure',
        'A general expectation does not explain the magnitude or pattern of the new change.',
      ],
      [
        'A definite medication diagnosis before checking the record or examining the patient',
        'The explanation requires evidence; urgency does not depend on certainty about the cause.',
      ],
    ],
    'What finding could challenge your first explanation?',
    ['deterioration']
  ),
  q(
    'critical-3',
    'anaphylaxis_mods_trauma_sedation',
    'take_action',
    'Two colleagues arrive during an acute deterioration. Both assume the other has called the response team.',
    'Which communication best closes the gap?',
    [
      [
        'Assign the call to a named colleague and confirm that the request was acknowledged',
        'Explicit responsibility and confirmation address the uncompleted escalation.',
      ],
      [
        'Repeat “someone call” without assigning responsibility',
        'A general request may leave the same ambiguity.',
      ],
      [
        'Assume the arrival of colleagues means the response team has been contacted',
        'Their presence does not confirm the request.',
      ],
    ],
    'How will you know the requested action has actually occurred?',
    ['deterioration']
  ),
  q(
    'critical-4',
    'anaphylaxis_mods_trauma_sedation',
    'prioritize_hypotheses',
    'A patient has a new noisy airway and increasing distress. An administrative transfer form is incomplete.',
    'Which task should lead the immediate response?',
    [
      [
        'Obtain urgent bedside support and assess within your role while delegating administrative work',
        'The current clinical concern takes priority over the form.',
      ],
      [
        'Finish the form before contacting support so the record is complete',
        'Administrative completeness should not delay an emergency response.',
      ],
      [
        'Arrange the destination before anyone reassesses the airway',
        'Transfer planning does not replace immediate bedside assessment and support.',
      ],
    ],
    'Which tasks can be delegated without leaving the patient unsupported?',
    ['anaphylaxis', 'deterioration']
  ),

  q(
    'vignette-1',
    'scenario_vignettes',
    'analyze_cues',
    'Handover describes a patient as “always confused,” but a family member says the current behavior is new and the prior chart describes normal conversation.',
    'How should you handle the disagreement?',
    [
      [
        'Clarify baseline and timing using the available accounts, then assess the current change',
        'Conflicting information should trigger verification rather than automatic acceptance of the label.',
      ],
      [
        'Use the handover label as established fact',
        'That risks carrying forward an unsupported interpretation.',
      ],
      [
        'Treat the family account as a confirmed diagnosis',
        'The account is important evidence, but does not establish a diagnosis.',
      ],
    ],
    'Which information is observed, reported or inferred?',
    ['reasoning', 'deterioration']
  ),
  q(
    'vignette-2',
    'scenario_vignettes',
    'prioritize_hypotheses',
    'A patient asks for routine discharge teaching while another has a sudden speech change and one-sided weakness. A colleague can help.',
    'What is the most defensible priority?',
    [
      [
        'Arrange the urgent neurologic response and ask the colleague to coordinate the routine teaching',
        'The consequence of delay determines priority while the remaining work is redistributed.',
      ],
      [
        'Complete teaching first because it was scheduled earlier',
        'Task order is not the same as clinical urgency.',
      ],
      [
        'Gather every detail about both patients before requesting assistance',
        'An exhaustive comparison should not postpone response to a concerning acute change.',
      ],
    ],
    'What makes the cost of delay different between these tasks?',
    ['stroke', 'deterioration']
  ),
  q(
    'vignette-3',
    'scenario_vignettes',
    'take_action',
    'You have described a new patient change by phone, but the receiving clinician has not stated when they will attend.',
    'What best completes the communication?',
    [
      [
        'Confirm the response time, interim plan and what to do if the patient worsens or help does not arrive',
        'A handover needs an agreed next action, not just transmission of information.',
      ],
      [
        'Assume acknowledgment means immediate attendance',
        'Acknowledgment does not establish timing or responsibility.',
      ],
      [
        'Document the call without clarifying the response',
        'Documentation does not replace closing the communication loop.',
      ],
    ],
    'What would count as a closed-loop response?',
    ['deterioration']
  ),
  q(
    'vignette-4',
    'scenario_vignettes',
    'evaluate_outcomes',
    'An intervention was completed, but the planned reassessment findings have not been collected.',
    'Which statement is most accurate?',
    [
      [
        'The intervention is documented, but its effect is not yet established',
        'Doing the action and demonstrating its benefit require different evidence.',
      ],
      [
        'Completion of the action establishes a successful outcome',
        'Delivery is a process measure, not proof of the response.',
      ],
      [
        'The absence of a new complaint proves the intended outcome was achieved',
        'An unreported symptom is not a substitute for planned reassessment.',
      ],
    ],
    'What outcome evidence is still missing?',
    ['reasoning', 'deterioration']
  ),
]
