import type { GuidedCase, CaseStep } from './cases'
import { contentSources, expansionRevision, type SourceId } from './sources'
import { pillars } from './pillars'
type Decision = {
  update: string
  prompt: string
  choices: [string, string, string]
  explanations: [string, string, string]
  thinking: string
  missing: string
  vitals: [string, string, string]
}
function story(
  meta: Omit<GuidedCase, 'stages' | 'sources'>,
  sources: SourceId[],
  decisions: Decision[]
): GuidedCase {
  return {
    ...meta,
    revision: expansionRevision,
    sources: sources.map((id) => ({
      title: contentSources[id].title,
      url: contentSources[id].url,
    })),
    stages: decisions.map((decision, index): CaseStep => {
      const shift = (index + meta.id.length) % 3
      const order = [0, 1, 2].slice(shift).concat([0, 1, 2].slice(0, shift))
      return {
        competency: pillars[index]!.id,
        update: decision.update,
        prompt: decision.prompt,
        options: order.map((position) => decision.choices[position]!),
        correct: order.indexOf(0),
        explanations: order.map((position) => decision.explanations[position]!),
        rationale: decision.explanations[0],
        thinkAloud: decision.thinking,
        missing: decision.missing,
        vitals: decision.vitals,
      }
    }),
  }
}
export const additionalCases: GuidedCase[] = [
  story(
    {
      id: 'chest-pain',
      title: 'A pressure that changes the plan.',
      subtitle: 'New chest discomfort',
      category: 'Cardiovascular',
      color: 'coral',
      initials: 'RS',
      patient: 'Riley Shah · 61 years',
      setting: 'Adult ward · Before mobilization',
      summary:
        'New chest pressure, nausea and a changing story. Build an urgent handover without assuming you already know the diagnosis.',
      objective:
        'Recognize a concerning symptom pattern, communicate uncertainty and reassess beyond the pain score.',
    },
    ['acs', 'deterioration'],
    [
      {
        update:
          'Riley, admitted for an unrelated problem, reports new chest pressure at rest with nausea and sweating. The episode started about ten minutes ago and feels different from previous reflux. No ECG has been reviewed yet.',
        prompt: 'Which information most changes your priority?',
        choices: [
          'The new symptom cluster and change from Riley’s usual symptoms',
          'The reflux history as the main explanation',
          'The planned mobilization time',
        ],
        explanations: [
          'The new pattern calls for timely clinical assessment; its cause remains unconfirmed.',
          'A past explanation does not establish the cause of this new episode.',
          'The schedule matters less than the current clinical change.',
        ],
        thinking: 'I separate the observed symptoms from the label “reflux.”',
        missing:
          'What are the exact onset, associated symptoms, baseline observations and current assessment findings?',
        vitals: ['108', '106/68', '24'],
      },
      {
        update:
          'Riley says the pressure comes and goes. There is no test result that establishes the cause. A colleague asks whether this is definitely a heart attack.',
        prompt: 'Which interpretation is most defensible?',
        choices: [
          'A concerning acute presentation that needs evaluation for cardiac and other causes',
          'A confirmed myocardial infarction based on symptoms alone',
          'A noncardiac cause because the pressure is intermittent',
        ],
        explanations: [
          'This communicates urgency and uncertainty without overstating what the evidence establishes.',
          'Symptoms alone do not confirm that diagnosis.',
          'An intermittent pattern does not establish a benign cause.',
        ],
        thinking:
          'My working concern can be urgent without being a confirmed diagnosis.',
        missing:
          'Which additional findings and investigations will help the clinical team distinguish the possible causes?',
        vitals: ['110', '104/66', '24'],
      },
      {
        update:
          'Discharge teaching for a stable neighboring patient is scheduled. Riley now feels faint. A colleague is available to help.',
        prompt: 'What should lead the next response?',
        choices: [
          'Escalate Riley’s new symptoms and coordinate bedside assessment while delegating routine work',
          'Finish the scheduled teaching before calling for assessment',
          'Wait until every investigation is available before requesting help',
        ],
        explanations: [
          'The consequence of delaying assessment takes priority over routine work.',
          'The schedule should not postpone assessment of the acute change.',
          'Useful investigation can occur alongside an urgent response.',
        ],
        thinking:
          'I prioritize possible harm from delay rather than the order of the task list.',
        missing:
          'Who will remain with Riley and what urgent response process applies?',
        vitals: ['112', '98/62', '25'],
      },
      {
        update:
          'You are organizing help and sharing the available observations. Riley’s relevant medicines and allergies need to be checked. Treatment decisions will follow the local pathway and clinical assessment.',
        prompt: 'Which plan best supports safe team care?',
        choices: [
          'Coordinate urgent review, observations and requested investigations while clarifying patient-specific risks and reassessment',
          'Select the same treatment plan for every chest-pain presentation',
          'Focus on the pain score without checking the circulatory symptoms',
        ],
        explanations: [
          'A coordinated plan links the concern, patient context and evaluation of response.',
          'A fixed plan ignores different causes, contraindications and clinical findings.',
          'The faintness and observations are part of the same changing picture.',
        ],
        thinking:
          'I help assemble the information that makes the team’s decisions safer.',
        missing:
          'What history, medicines, allergies and pathway requirements need confirmation?',
        vitals: ['112', '98/62', '25'],
      },
      {
        update:
          'The receiving clinician asks why the review is urgent. Your colleague can continue bedside observation.',
        prompt: 'Which handover best supports the response?',
        choices: [
          '“New chest pressure with nausea and sweating, now faint with BP 98/62. Symptoms began about ten minutes ago. I need an urgent bedside review.”',
          '“Riley has reflux; could you review when convenient?”',
          '“I have diagnosed a heart attack,” without the observations or symptom timing',
        ],
        explanations: [
          'This describes the change, urgency, timing and request without pretending the cause is established.',
          'The reflux label may obscure the new findings and urgency.',
          'A diagnosis without supporting observations leaves the team without key information.',
        ],
        thinking:
          'I lead with the current change, then give the relevant background.',
        missing:
          'Has the response time and interim observation plan been confirmed?',
        vitals: ['112', '98/62', '25'],
      },
      {
        update:
          'After team assessment and care, Riley reports less pressure but remains lightheaded. Current observations are still different from baseline. This is a scripted teaching update, not a prediction of treatment response.',
        prompt: 'What should guide your next evaluation?',
        choices: [
          'Reassess symptoms, circulation and the agreed plan, and communicate the persistent faintness',
          'Use pain relief alone to conclude the event has resolved',
          'Return to routine checks without reviewing the remaining change',
        ],
        explanations: [
          'The whole response includes persistent concerns as well as improvement.',
          'One improved symptom does not establish overall recovery.',
          'The reassessment plan must account for the remaining abnormal findings.',
        ],
        thinking:
          'I distinguish symptom relief from resolution of the underlying concern.',
        missing:
          'Which endpoints has the treating team specified, and what remains different from baseline?',
        vitals: ['102', '100/64', '22'],
      },
    ]
  ),
  story(
    {
      id: 'neuro-change',
      title: 'The words suddenly will not come.',
      subtitle: 'Sudden neurologic change',
      category: 'Neuro',
      color: 'violet',
      initials: 'JM',
      patient: 'Jordan Morgan · 68 years',
      setting: 'Adult ward · Morning conversation',
      summary:
        'A familiar conversation changes abruptly. Separate last known well from discovery, mobilize help and reassess when symptoms improve.',
      objective:
        'Recognize focal neurologic change, establish reliable timing and communicate an urgent assessment request.',
    },
    ['stroke', 'strokeTiming', 'deterioration'],
    [
      {
        update:
          'At 09:10 Jordan spoke normally with a nurse. At 09:35 a relative notices an uneven smile, difficulty speaking and right-arm weakness. The exact onset was not witnessed.',
        prompt: 'Which finding should drive the response?',
        choices: [
          'The sudden focal neurologic changes compared with the last known baseline',
          'The routine observations being near earlier values',
          'The absence of a headache as reassurance',
        ],
        explanations: [
          'The new focal findings warrant urgent evaluation even without markedly changed routine observations.',
          'These observations do not exclude a neurologic emergency.',
          'A headache is not required for a concerning focal presentation.',
        ],
        thinking:
          'I do not let reassuring routine numbers override a new focal change.',
        missing:
          'Who witnessed the last normal interaction and when were the symptoms discovered?',
        vitals: ['88', '146/84', '18'],
      },
      {
        update:
          'The relative confirms discovery at 09:35. The nurse confirms normal speech and movement at 09:10. The clinical team will evaluate possible stroke and other causes.',
        prompt: 'Which timing statement is reliable?',
        choices: [
          'Last known well 09:10; discovered at 09:35; exact onset unknown',
          'Onset definitely at 09:35',
          'Onset estimated as the midpoint between the two observations',
        ],
        explanations: [
          'This separates witnessed facts from uncertainty and preserves both useful times.',
          'Discovery does not prove when the symptoms began.',
          'An invented midpoint adds false precision to the history.',
        ],
        thinking:
          'I label what is known, who reported it and what remains uncertain.',
        missing:
          'Are there other witnesses or documentation that could refine the timeline?',
        vitals: ['88', '146/84', '18'],
      },
      {
        update:
          'Jordan is awaiting routine medication and breakfast. The new speech and arm changes are still present. A colleague can obtain the chart and relevant history.',
        prompt: 'Which priority best addresses the current concern?',
        choices: [
          'Activate the local urgent neurologic response while gathering information in parallel',
          'Complete routine morning tasks first',
          'Wait for a full history before contacting the response team',
        ],
        explanations: [
          'The acute change needs timely assessment; information gathering can occur alongside escalation.',
          'Routine tasks should not delay an urgent response to the new findings.',
          'A complete history is useful but should not be a prerequisite for requesting help.',
        ],
        thinking: 'I ask for help early and coordinate the supporting tasks.',
        missing:
          'Who is assigned to the urgent call and who will remain with Jordan?',
        vitals: ['90', '148/86', '19'],
      },
      {
        update:
          'The local response is activated. The team requests baseline function, symptom timing, current assessment and recent medicines. Treatment eligibility has not been established.',
        prompt: 'Which plan is most appropriate within your role?',
        choices: [
          'Support the urgent pathway, prepare the requested information and continue agreed monitoring',
          'Assume the presentation establishes a specific stroke subtype',
          'Choose definitive treatment before the required clinical evaluation',
        ],
        explanations: [
          'The plan supports qualified assessment without making unsupported diagnostic or treatment assumptions.',
          'The observed symptoms do not establish the subtype or cause.',
          'Patient-specific treatment requires the appropriate clinical evaluation and local pathway.',
        ],
        thinking:
          'I keep the pathway moving while preserving the boundary between observation and diagnosis.',
        missing:
          'Which additional bedside checks and information has the response team requested?',
        vitals: ['90', '148/86', '19'],
      },
      {
        update:
          'You are handing over to the arriving team. Jordan still has impaired speech and right-arm weakness.',
        prompt: 'Which handover provides the clearest evidence?',
        choices: [
          '“Normal speech and movement witnessed at 09:10; deficits found at 09:35. Right-arm weakness and speech change persist; exact onset unknown.”',
          '“Symptoms began at 09:35,” without identifying the discovery time',
          '“Probably confused,” without describing the focal changes',
        ],
        explanations: [
          'This preserves baseline, timing, observed deficits and uncertainty.',
          'This incorrectly turns discovery into a confirmed onset.',
          'A vague label loses the specific neurologic findings.',
        ],
        thinking:
          'I describe what changed rather than substituting a broad label.',
        missing:
          'Has the team confirmed the next assessment and observation responsibilities?',
        vitals: ['90', '148/86', '19'],
      },
      {
        update:
          'During team evaluation Jordan’s speech becomes clearer and arm movement improves. The episode and earlier deficits were witnessed. This change is scripted, not predicted from a treatment choice.',
        prompt: 'What should the reassessment communicate?',
        choices: [
          'The original deficits, reliable times and the degree of current improvement while evaluation continues',
          'That the earlier concern can be removed because the examination improved',
          'Only the current findings, omitting the earlier episode',
        ],
        explanations: [
          'An improving presentation still needs the earlier evidence and urgent evaluation to be interpreted properly.',
          'Improvement does not make the witnessed event irrelevant.',
          'Omitting the episode would lose important clinical information.',
        ],
        thinking:
          'A better examination does not erase the event that prompted the response.',
        missing:
          'Which findings persist and what ongoing evaluation plan has the team agreed?',
        vitals: ['86', '142/82', '18'],
      },
    ]
  ),
  story(
    {
      id: 'respiratory-change',
      title: 'Look beyond the saturation.',
      subtitle: 'Increasing work of breathing',
      category: 'Respiratory',
      color: 'blue',
      initials: 'CP',
      patient: 'Casey Patel · 57 years',
      setting: 'Adult ward · Evening review',
      summary:
        'Breathing becomes harder while one monitor value looks reassuring. Check the patient, the measurement and the changing support requirements.',
      objective:
        'Integrate breathing effort, rate, alertness and oximetry instead of relying on one displayed value.',
    },
    ['deterioration', 'oximetry'],
    [
      {
        update:
          'Casey’s respiratory rate has risen from 16 to 30/min. They now pause after a few words and use more effort to breathe. The displayed SpO₂ is 96% on prescribed oxygen.',
        prompt: 'Which change needs attention first?',
        choices: [
          'The increased effort, rate and reduced ability to speak',
          'The displayed saturation considered alone',
          'The fact that oxygen is already prescribed',
        ],
        explanations: [
          'The new pattern warrants prompt assessment despite a reassuring displayed saturation.',
          'Saturation is one measurement and does not capture the whole breathing assessment.',
          'Existing treatment does not establish that the current breathing is adequate.',
        ],
        thinking:
          'I assess the person’s breathing rather than letting one number close the assessment.',
        missing:
          'What are the prescribed target, current oxygen support, baseline findings and other symptoms?',
        vitals: ['110', '118/72', '30'],
      },
      {
        update:
          'The oximeter signal is inconsistent on a cool hand. Casey remains breathless. The reason for the change has not been established.',
        prompt:
          'Which interpretation best handles the conflicting information?',
        choices: [
          'Possible measurement error and a real clinical change both need attention',
          'The poor signal proves the symptoms can be ignored',
          'The displayed number must be exact because it came from a device',
        ],
        explanations: [
          'Verify the reading while assessing and responding to the patient’s condition.',
          'Measurement uncertainty does not invalidate the patient’s symptoms.',
          'Device readings have limitations and must be interpreted with the assessment.',
        ],
        thinking:
          'Artifact and deterioration are not mutually exclusive possibilities.',
        missing:
          'Can the signal be checked promptly and compared with independent clinical findings?',
        vitals: ['112', '116/70', '30'],
      },
      {
        update:
          'A colleague is available. Casey’s effort remains increased and speech is limited. A routine medication round is in progress.',
        prompt: 'Which response best prioritizes the current change?',
        choices: [
          'Request urgent clinical assessment and maintain bedside support while checking the measurement',
          'Finish the routine round before reassessing',
          'Keep troubleshooting the monitor without arranging patient assessment',
        ],
        explanations: [
          'Assessment and measurement checks can occur in parallel without delaying support.',
          'Routine work should not postpone a response to this new breathing difficulty.',
          'A technical check alone leaves the clinical concern unaddressed.',
        ],
        thinking:
          'I do not make a perfect signal a prerequisite for asking for help.',
        missing:
          'Who will assess Casey, who will check the equipment and who has made the urgent request?',
        vitals: ['114', '114/70', '31'],
      },
      {
        update:
          'The team requests the trajectory, oxygen device and support, prescribed target, alertness and current assessment. A patient-specific plan is being formed.',
        prompt: 'Which plan best supports the team’s assessment?',
        choices: [
          'Provide the requested information, follow the local respiratory response plan and agree reassessment endpoints',
          'Apply one oxygen target to every patient without checking the prescribed plan',
          'Change the plan according to the displayed saturation alone',
        ],
        explanations: [
          'The plan needs patient context, the required support and a way to evaluate the response.',
          'Targets and care must account for the individual and local clinical plan.',
          'A single value is incomplete evidence for changing the whole plan.',
        ],
        thinking:
          'The support needed to achieve a number is part of what that number means.',
        missing:
          'What treatment and reassessment responsibilities has the team specified?',
        vitals: ['114', '114/70', '31'],
      },
      {
        update:
          'You are handing over while a colleague stays at the bedside. The displayed saturation remains near the earlier value but breathing effort is worse.',
        prompt: 'Which message best communicates the concern?',
        choices: [
          '“Rate rose from 16 to 31, speech is limited and effort is worse. SpO₂ is 96% on prescribed oxygen; I need urgent review.”',
          '“Saturation is 96%,” without the breathing assessment',
          '“The monitor is unreliable,” without describing Casey’s symptoms',
        ],
        explanations: [
          'This communicates the trajectory and the discrepancy that makes the patient assessment essential.',
          'The number alone omits the deterioration.',
          'Signal concerns matter, but they do not replace a description of the patient.',
        ],
        thinking:
          'I explicitly communicate the findings that a reassuring number could obscure.',
        missing:
          'Has the receiving team confirmed when they will attend and what to do if Casey worsens?',
        vitals: ['114', '114/70', '31'],
      },
      {
        update:
          'After team-directed care, Casey’s displayed saturation is higher. Breathing is still faster than baseline and more support is required than earlier. This is a scripted update.',
        prompt: 'Which reassessment is most meaningful?',
        choices: [
          'Compare effort, rate, alertness, symptoms and support needs with the agreed goals',
          'Use the higher saturation alone to declare recovery',
          'Assume treatment delivery proves the intended outcome',
        ],
        explanations: [
          'The whole response and support requirements determine what has and has not improved.',
          'A better displayed value can coexist with unresolved respiratory difficulty.',
          'An action and its effect are different pieces of evidence.',
        ],
        thinking:
          'I reassess both the outcome and the amount of support required to achieve it.',
        missing:
          'Which concerns persist and what change would trigger another escalation?',
        vitals: ['104', '118/74', '26'],
      },
    ]
  ),
  story(
    {
      id: 'fluid-loss',
      title: 'The trend tells a quieter story.',
      subtitle: 'Fluid loss and perfusion concern',
      category: 'Critical care',
      color: 'mint',
      initials: 'DA',
      patient: 'Drew Allen · 73 years',
      setting: 'Adult ward · Overnight handover',
      summary:
        'Poor intake, ongoing losses and a changing baseline. Build a working concern while accounting for a complex cardiac and renal history.',
      objective:
        'Connect losses and perfusion findings, avoid a one-size-fits-all response and evaluate benefits alongside new concerns.',
    },
    ['fluids', 'deterioration'],
    [
      {
        update:
          'Drew has had repeated vomiting and limited intake. Compared with earlier, the pulse is faster, pressure is lower and standing produces lightheadedness. There is a history of heart failure and kidney disease.',
        prompt: 'Which information is most relevant to the new concern?',
        choices: [
          'The combination of losses, reduced intake and changing circulation-related findings',
          'The blood pressure considered only against a population interval',
          'The chronic diagnoses used to explain away all new symptoms',
        ],
        explanations: [
          'The pattern warrants assessment and baseline comparison without establishing a single cause.',
          'A population interval does not erase an important individual trend.',
          'Chronic disease increases the need for context rather than making new changes irrelevant.',
        ],
        thinking:
          'I start by connecting the trajectory with what has been lost and taken in.',
        missing:
          'What are the quantities and timing of losses, recent intake, usual observations and current examination findings?',
        vitals: ['112', '102/64', '22'],
      },
      {
        update:
          'Urine output appears lower, but the chart does not state the collection interval. Drew’s usual renal function and medicines need review.',
        prompt: 'Which interpretation preserves uncertainty?',
        choices: [
          'Possible volume-related deterioration with other explanations still requiring assessment',
          'A definite cause established from the urine total alone',
          'No concern because the urine measurement is incomplete',
        ],
        explanations: [
          'The clinical pattern needs evaluation; the incomplete measurement should be clarified rather than overinterpreted.',
          'The missing interval and wider context prevent that conclusion.',
          'Uncertainty about one measurement does not remove the remaining clinical concern.',
        ],
        thinking:
          'I can act on a concern while making the limitations of the evidence explicit.',
        missing:
          'Is the collection reliable, over what interval, and what is usual for Drew?',
        vitals: ['114', '100/62', '23'],
      },
      {
        update:
          'Drew remains lightheaded. A colleague can gather the chart while routine discharge tasks for another stable patient continue.',
        prompt: 'What should take priority?',
        choices: [
          'Arrange prompt assessment of Drew’s change and delegate routine work',
          'Complete the stable patient’s paperwork before contacting help',
          'Wait for every prior record before reassessing Drew',
        ],
        explanations: [
          'The current change and risk from delay determine priority.',
          'Administrative tasks should not delay assessment of deterioration.',
          'Baseline records help, but a complete file is not required before responding to a new concern.',
        ],
        thinking:
          'I organize work around the patient’s current needs and the available help.',
        missing:
          'Who will remain with Drew and who is making the clinical review request?',
        vitals: ['116', '96/60', '24'],
      },
      {
        update:
          'The team is evaluating the cause and considering the cardiac and renal history. A patient-specific response and monitoring plan are needed.',
        prompt: 'Which plan is most appropriate to discuss?',
        choices: [
          'An individualized response under the local pathway with explicit monitoring for benefit and new concerns',
          'A fixed fluid plan for every similar blood-pressure reading',
          'A plan based only on the losses without considering comorbidities or examination',
        ],
        explanations: [
          'Assessment must balance the current concern with patient-specific risks and reassessment.',
          'One number is not enough to select the same response for everyone.',
          'Losses are important but are not the only relevant information.',
        ],
        thinking:
          'I ask what outcome we want and what could indicate that the plan needs to change.',
        missing:
          'Which observations, investigations and clinical endpoints will guide the treating team’s decisions?',
        vitals: ['116', '96/60', '24'],
      },
      {
        update:
          'You are summarizing the concern to the treating team. Drew’s fluid balance record is incomplete.',
        prompt: 'Which handover best supports the assessment?',
        choices: [
          'Describe intake and losses, baseline-to-current trends, symptoms, comorbidities and the gaps in the record',
          'State a precise fluid deficit despite the incomplete record',
          'Report the chronic kidney diagnosis without the new changes',
        ],
        explanations: [
          'The team needs both the evidence and its limits to individualize assessment.',
          'An invented precise deficit obscures uncertainty.',
          'A diagnosis alone does not describe the current problem.',
        ],
        thinking:
          'I communicate missing data as missing data rather than filling in a plausible number.',
        missing:
          'Who will clarify the chart and when will the current assessment be repeated?',
        vitals: ['116', '96/60', '24'],
      },
      {
        update:
          'After team-directed care, the pressure improves, but Drew reports new breathlessness. The initial lightheadedness has not fully resolved. This update is scripted.',
        prompt: 'What should happen to the evaluation?',
        choices: [
          'Reassess the whole response and urgently communicate the persistent symptoms and new breathlessness',
          'Continue unchanged because the blood pressure improved',
          'Assign the new breathlessness to the original cause without assessing it',
        ],
        explanations: [
          'Evaluation must include possible new problems as well as the intended benefit.',
          'A favorable pressure trend does not account for the new concern.',
          'A new symptom may require the working explanation and plan to be revised.',
        ],
        thinking:
          'A response can have improvement and unresolved or new concerns at the same time.',
        missing:
          'What does the new respiratory assessment show, and how should the team’s plan change?',
        vitals: ['106', '110/68', '28'],
      },
    ]
  ),
]
