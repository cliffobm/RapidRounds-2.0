import type { ChoiceDraftV2, QuestionDraftV2 } from '@/lib/cjis/question-v2'
const yes = (
  text: string,
  explanation: string,
  cues: number[]
): ChoiceDraftV2 => ({ text, explanation, cues })
const no = (
  text: string,
  explanation: string,
  plausible: string,
  error: NonNullable<ChoiceDraftV2['error']>,
  cues: number[]
): ChoiceDraftV2 => ({ text, explanation, plausible, error, cues })
type Input = Omit<
  QuestionDraftV2,
  'collectionId' | 'domain' | 'setting' | 'correct'
>
function q(input: Input, index: number): QuestionDraftV2 {
  const shift = index % 4
  return {
    ...input,
    collectionId: 'assessment-safety',
    domain: 'fundamentals',
    setting: 'Adult hospital nursing assessment',
    options: [
      ...input.options.slice(shift),
      ...input.options.slice(0, shift),
    ] as QuestionDraftV2['options'],
    correct: ((4 - shift) % 4) as QuestionDraftV2['correct'],
  }
}
const delirium =
  'https://www.nice.org.uk/guidance/cg103/chapter/Recommendations'
export const assessmentQualityQuestions: QuestionDraftV2[] = [
  q(
    {
      id: 'v2-assess-f-heel',
      topic: 'Early pressure-related tissue changes',
      level: 'foundation',
      primaryCompetency: 'recognize_cues',
      sources: ['pressureInjury'],
      scenario:
        'A bedbound adult with dark skin reports a newly sore heel. The heel feels warmer and firmer than the opposite side. The skin is intact and there is no obvious bright redness. The nurse is performing the scheduled skin assessment.',
      cues: [
        'New localized heel discomfort',
        'Increased warmth and firmness over a pressure area',
        'Intact dark skin without obvious redness',
      ],
      question:
        'Which finding most supports concern for early pressure-related tissue damage?',
      options: [
        yes(
          'Localized discomfort with a change in tissue temperature and firmness',
          'These local tissue changes over a loaded heel warrant focused assessment and pressure relief. Visible redness is not required to recognize concern, particularly when skin color changes are subtle.',
          [0, 1, 2]
        ),
        no(
          'Intact skin without a clearly visible change in surface color',
          'An intact surface does not exclude underlying pressure-related damage. Color alone is insufficient for assessment of this heel.',
          'A learner may look for an open lesion or bright redness before identifying an injury risk.',
          'cue_misinterpretation',
          [2]
        ),
        no(
          'A generalized reduction in mobility during the hospital admission',
          'Immobility explains exposure to pressure but is less specific than the new localized changes when judging this heel.',
          'Immobility is a well-known risk factor and may draw attention away from the current examination.',
          'misprioritization',
          [0, 1]
        ),
        no(
          'The absence of reported discomfort in the patient’s opposite heel',
          'The comparison helps establish asymmetry but does not make the affected heel normal. The positive local findings require attention.',
          'A normal comparison site can sound reassuring when the skin remains intact.',
          'premature_closure',
          [0, 1]
        ),
      ],
      reasoning: [
        'Recognize a meaningful tissue change without depending on visible redness.',
      ],
      debrief:
        'Assess pain, temperature, consistency and skin appearance together. An intact surface and subtle color change do not eliminate the opportunity for early prevention.',
    },
    0
  ),
  q(
    {
      id: 'v2-assess-f-resp-rate',
      topic: 'Verifying a respiratory observation',
      level: 'foundation',
      primaryCompetency: 'take_action',
      sources: ['deterioration'],
      scenario:
        'The electronic chart lists a respiratory rate of 16/min. At the bedside the patient appears to be breathing much faster. The patient is sitting still and has not just exercised. The nurse is about to complete the current observation set.',
      cues: [
        'The charted respiratory rate conflicts with observed breathing.',
        'The patient is resting without a recent exertional explanation.',
      ],
      question: 'Which action best establishes the current respiratory rate?',
      options: [
        yes(
          'Count and assess respirations directly, then record the observed finding.',
          'A fresh direct observation resolves the discrepancy and allows assessment of depth, effort and pattern. A previous value or a different vital sign cannot substitute for the current rate.',
          [0, 1]
        ),
        no(
          'Use the monitor’s heart-rate trend to estimate the respiratory change.',
          'Heart rate may change with respiratory illness but does not measure respiratory rate. It cannot resolve this discrepancy.',
          'Related vital signs can appear to provide a convenient surrogate measurement.',
          'cue_misinterpretation',
          [0]
        ),
        no(
          'Repeat oxygen saturation and use that result to confirm the charted rate.',
          'Oxygen saturation and respiratory rate measure different features. A reassuring saturation would not establish a normal breathing rate.',
          'A digital oxygen reading may seem more objective than visual observation.',
          'cue_misinterpretation',
          [0]
        ),
        no(
          'Ask the patient to breathe slowly before repeating the observation.',
          'Coaching the pattern before counting changes the observation and can conceal the spontaneous abnormality that needs assessment.',
          'Slowing the patient’s breathing may seem a reasonable way to obtain a resting baseline.',
          'misprioritization',
          [0, 1]
        ),
      ],
      reasoning: [
        'Resolve an observation discrepancy using the measurement that directly answers it.',
      ],
      debrief:
        'Verify the variable in question. A normal reading from another device does not settle a conflicting bedside observation.',
    },
    1
  ),
  q(
    {
      id: 'v2-assess-f-transfusion',
      topic: 'Suspected acute transfusion reaction',
      level: 'foundation',
      primaryCompetency: 'take_action',
      sources: ['transfusion'],
      scenario:
        'A red-cell transfusion began ten minutes ago. The patient now develops shaking chills and new back pain. Blood pressure is falling compared with the pre-transfusion value. The nurse is at the bedside with the emergency call system available.',
      cues: [
        'New chills and back pain shortly after transfusion starts',
        'Falling blood pressure',
      ],
      question:
        'Which immediate action best addresses a suspected serious transfusion reaction?',
      options: [
        yes(
          'Stop the transfusion and initiate urgent bedside assessment and help.',
          'Interrupt the possible exposure while assessing airway, breathing and circulation and obtaining urgent assistance. Follow the reaction pathway, preserve the component for investigation and maintain access according to policy without flushing the blood-filled line.',
          [0, 1]
        ),
        no(
          'Reduce the transfusion rate while obtaining a repeat observation set.',
          'A serious reaction is possible; reducing the rate continues the exposure. Repeat observations are needed alongside stopping the transfusion.',
          'A slower infusion can seem a cautious compromise while the cause is still uncertain.',
          'misprioritization',
          [0, 1]
        ),
        no(
          'Stop the transfusion and flush the blood-filled tubing to preserve access.',
          'Stopping is appropriate, but flushing the blood-filled line can deliver additional implicated blood. Maintain access using the institution’s reaction procedure.',
          'Flushing is a familiar way to maintain a patent intravenous line.',
          'cue_misinterpretation',
          [0]
        ),
        no(
          'Stop the transfusion and discard the component before beginning investigation.',
          'The component and administration equipment may be required for investigation. Follow the local handling and notification process rather than discarding evidence.',
          'Removing the suspected cause can be mistaken for disposing of the component immediately.',
          'misprioritization',
          [0, 1]
        ),
      ],
      reasoning: [
        'Recognize a time-linked reaction and interrupt the possible exposure safely.',
      ],
      debrief:
        'Immediate safety actions can begin before the reaction subtype is known. Stop exposure, assess severity and preserve the information needed for investigation.',
    },
    2
  ),
  q(
    {
      id: 'v2-assess-f-toileting',
      topic: 'A practical falls-prevention response',
      level: 'foundation',
      primaryCompetency: 'generate_solutions',
      sources: ['falls', 'sharedDecisions'],
      scenario:
        'A hospitalized adult says they need the toilet now. They became dizzy during the previous transfer. Their call bell is outside their reach. The nurse is helping plan the next transfer.',
      cues: [
        'An immediate toileting need',
        'Dizziness on the previous transfer',
        'Help is not reachable from bed',
      ],
      question:
        'Which plan best addresses the immediate need and transfer risk?',
      options: [
        yes(
          'Arrange timely assisted toileting and place the call bell within reach.',
          'This responds to the need driving the attempted transfer while making assistance usable. The dizziness also requires assessment and an individualized mobility plan.',
          [0, 1, 2]
        ),
        no(
          'Provide the walking frame and ask the patient to transfer when dizziness settles.',
          'A walking aid does not resolve the recent dizziness or the need for assistance during this transfer. Waiting without a practical toileting option may prompt an unassisted attempt.',
          'The patient may normally mobilize with a frame and appear capable when seated.',
          'cue_misinterpretation',
          [0, 1]
        ),
        no(
          'Place a falls-risk sign and ask the patient to call before standing.',
          'A sign and instruction do not help when the call bell remains unreachable. The immediate toileting need also remains unresolved.',
          'Risk identification and reminders are familiar falls-prevention measures.',
          'misprioritization',
          [0, 2]
        ),
        no(
          'Complete the admission falls checklist before arranging the next toilet transfer.',
          'Assessment is valuable, but the immediate need and known transfer difficulty already support assistance. A checklist should not create an avoidable delay.',
          'A completed risk assessment may seem necessary before choosing a mobility intervention.',
          'misprioritization',
          [0, 1]
        ),
      ],
      reasoning: [
        'Match a practical prevention measure to the current trigger and access barrier.',
      ],
      debrief:
        'A prevention plan works when the patient can use it. Address the reason for movement, the transfer difficulty and the availability of help together.',
    },
    3
  ),
  q(
    {
      id: 'v2-assess-f-bleeding',
      topic: 'Controlling accessible external bleeding',
      level: 'foundation',
      primaryCompetency: 'take_action',
      sources: ['traumaAssessment'],
      scenario:
        'An adult has a deep forearm wound after a machinery injury. Blood is flowing continuously from the accessible wound. Emergency assistance has already been requested. Protective equipment and dressings are available.',
      cues: [
        'Continuous visible external blood loss',
        'The bleeding wound is accessible',
      ],
      question: 'Which action should begin while the emergency team arrives?',
      options: [
        yes(
          'Apply firm direct pressure to the accessible bleeding wound.',
          'Direct pressure addresses the immediate source of blood loss while assessment and emergency support continue. Further measures depend on bleeding control, injury and the trained team’s pathway.',
          [0, 1]
        ),
        no(
          'Elevate the arm and assess whether the bleeding rate decreases.',
          'Elevation does not provide the direct hemostatic control needed for continuous significant bleeding from an accessible wound.',
          'Raising a bleeding limb is a familiar first-aid maneuver.',
          'misprioritization',
          [0, 1]
        ),
        no(
          'Assess distal sensation and movement before applying a dressing.',
          'Neurovascular examination is important, but controlling active significant bleeding should not await the full distal assessment.',
          'The mechanism creates a legitimate concern about associated nerve and tendon injury.',
          'misprioritization',
          [0, 1]
        ),
        no(
          'Expose and irrigate the wound to identify the damaged vessel.',
          'Irrigation and detailed exploration do not provide the immediate control required. Repeated manipulation can delay hemostasis.',
          'Identifying the bleeding structure may seem necessary for choosing an effective intervention.',
          'misprioritization',
          [0, 1]
        ),
      ],
      reasoning: [
        'Recognize an immediately controllable threat and select a direct response.',
      ],
      debrief:
        'Control an accessible source of significant blood loss while the wider trauma assessment proceeds. Diagnostic detail should support timely action rather than delay it.',
    },
    4
  ),
  q(
    {
      id: 'v2-assess-c-trend',
      topic: 'Respiratory deterioration despite preserved pressure',
      level: 'challenge',
      primaryCompetency: 'prioritize_hypotheses',
      sources: ['deterioration'],
      scenario:
        'A postoperative patient’s respiratory rate has risen from 16 to 28/min over two hours. They are newly restless and cannot finish the same short walk as earlier. Blood pressure remains 124/76 mmHg. The patient says the pain is unchanged. The nurse is deciding which focused reassessment should lead the next review.',
      cues: [
        'A rising respiratory rate over two hours',
        'New restlessness',
        'Reduced exertional tolerance',
        'Preserved blood pressure with unchanged pain',
      ],
      question:
        'Which focused assessment takes priority for the new tachypnea and reduced walking tolerance?',
      options: [
        yes(
          'Assess work of breathing, oxygenation and the trajectory of symptoms while arranging prompt clinical review.',
          'The respiratory and functional changes converge despite one reassuring vital sign. A focused breathing assessment and escalation address possible deterioration without assuming a specific pulmonary cause.',
          [0, 1, 2, 3]
        ),
        no(
          'Assess postoperative pain during movement and compare the current analgesic schedule with earlier doses.',
          'Pain assessment is useful, but unchanged pain does not adequately account for the new respiratory and functional pattern. It should not displace breathing assessment.',
          'Movement intolerance and rapid breathing can be related to postoperative pain.',
          'misprioritization',
          [0, 2, 3]
        ),
        no(
          'Assess postural blood pressure and oral intake to determine whether the walking difficulty is volume-related.',
          'Volume status may contribute, but positional testing does not first address tachypnea and restlessness. The patient needs current respiratory assessment rather than a narrow mobility explanation.',
          'Postoperative intake can be poor, making orthostatic intolerance plausible.',
          'premature_closure',
          [1, 2, 3]
        ),
        no(
          'Assess leg strength and balance to revise the mobility-assistance level before the next walk.',
          'A mobility assessment will help prevent harm but does not explain or address the evolving resting respiratory findings.',
          'A changed walking ability can initially appear to be a rehabilitation problem.',
          'misprioritization',
          [0, 1, 2]
        ),
      ],
      reasoning: [
        'Integrate respiratory and functional trends rather than weighting blood pressure alone.',
        'Prioritize assessment of the system showing current deterioration.',
      ],
      debrief:
        'A stable blood pressure does not make a changed patient stable. Use converging trends to decide which focused assessment and escalation are needed now.',
    },
    5
  ),
  q(
    {
      id: 'v2-assess-c-postural',
      topic: 'Dizziness after a medication and intake change',
      level: 'challenge',
      primaryCompetency: 'generate_solutions',
      sources: ['falls', 'medicationSafety'],
      scenario:
        'An older adult became lightheaded and nearly fell during a morning transfer. A blood-pressure medicine was increased yesterday. The patient ate and drank little overnight. They feel better after sitting down. No injury or ongoing focal neurologic symptom is reported.',
      cues: [
        'Symptoms occurred during a transfer and improved when seated.',
        'A blood-pressure medicine was increased yesterday.',
        'Intake was reduced overnight.',
        'A near fall occurred.',
      ],
      question:
        'What should the next transfer plan address after the medication change and lightheaded near fall?',
      options: [
        yes(
          'Provide supported transfers and review postural symptoms, observations, intake and the medication change with the team.',
          'Timing suggests potentially interacting contributors to postural symptoms. Supported mobility prevents another fall while assessment and medication review clarify the cause rather than assigning it to a single factor.',
          [0, 1, 2, 3]
        ),
        no(
          'Provide extra oral fluids and repeat an unassisted transfer to determine whether the dizziness has resolved.',
          'Reduced intake may matter, but it does not establish the cause or justify testing recovery through another unassisted near-fall opportunity.',
          'Improvement with sitting and low intake make simple volume depletion seem likely.',
          'premature_closure',
          [0, 2, 3]
        ),
        no(
          'Provide a walking aid and attribute the episode to deconditioning unless resting pressure falls again.',
          'A resting pressure does not reproduce postural physiology, and a walking aid does not resolve a potentially medication-related episode.',
          'Hospitalization commonly reduces strength and confidence with mobility.',
          'cue_misinterpretation',
          [0, 1, 3]
        ),
        no(
          'Provide bed rest for the day and ask the prescriber to reverse the medicine change without further assessment.',
          'Restricting mobility and presuming a medication cause bypasses assessment of intake, observations and other contributors. The team needs evidence for an individualized treatment decision.',
          'The recent dose increase appears to offer a clear and reversible explanation.',
          'misprioritization',
          [1, 2, 3]
        ),
      ],
      reasoning: [
        'Connect symptom timing with recent treatment and intake changes.',
        'Combine immediate transfer support with an assessment that can distinguish contributors.',
      ],
      debrief:
        'Prevent the next fall while investigating why the episode occurred. A plausible cause is a hypothesis to assess, rather than a reason to stop considering the rest of the clinical context.',
    },
    6
  ),
  q(
    {
      id: 'v2-assess-c-confusion',
      topic: 'A collateral baseline for new confusion',
      level: 'challenge',
      primaryCompetency: 'analyze_cues',
      sources: ['deterioration'],
      referenceUrls: [delirium],
      scenario:
        'A patient is unusually quiet and loses track of a conversation this afternoon. Their daughter says they were attentive and managing their own medicines yesterday. The admission note mentions chronic memory difficulty. The patient’s temperature is within the reference range. The nurse is reviewing whether this represents a change from baseline.',
      cues: [
        'New inattention and reduced engagement this afternoon',
        'A relative describes intact function yesterday.',
        'The record contains a chronic memory label.',
        'There is no measured fever.',
      ],
      question: 'Which interpretation should guide the next assessment?',
      options: [
        yes(
          'Treat the recent change as possible delirium and assess contributors using the collateral baseline.',
          'A chronic memory label and absence of fever do not explain away an acute change in attention and function. Use the local delirium assessment process and evaluate underlying causes and deterioration.',
          [0, 1, 2, 3]
        ),
        no(
          'Use the chronic memory note as the baseline and focus on repeated orientation during the next shift.',
          'The note does not resolve the reported acute difference. Orientation support may help, but accepting the historical label risks missing a current illness.',
          'A documented chronic cognitive problem appears to account for difficulty following conversation.',
          'outdated_data',
          [0, 1, 2]
        ),
        no(
          'Use the daughter’s report to exclude chronic impairment and classify the change as an acute infection.',
          'Collateral history supports acute change but does not establish the cause or exclude underlying chronic impairment. Infection is one possibility among several.',
          'A clear recent change often prompts concern for infection in an older adult.',
          'premature_closure',
          [0, 1, 3]
        ),
        no(
          'Use the normal temperature to prioritize sleep disruption before investigating medical contributors.',
          'Delirium can arise without fever, and a normal temperature does not establish a benign explanation. Sleep and environmental factors should be assessed alongside medical causes.',
          'A quiet patient without fever may appear fatigued rather than acutely ill.',
          'cue_misinterpretation',
          [0, 3]
        ),
      ],
      reasoning: [
        'Compare current attention and function with a recent collateral baseline.',
        'Keep acute medical causes open despite a chronic label and reassuring temperature.',
      ],
      debrief:
        'A historical diagnosis is not a substitute for a current baseline comparison. Recognize acute changes in attention and behavior, including quiet presentations, and investigate their causes.',
    },
    7
  ),
  q(
    {
      id: 'v2-assess-c-skin',
      topic: 'Pressure and moisture as coexisting mechanisms',
      level: 'challenge',
      primaryCompetency: 'analyze_cues',
      sources: ['pressureInjury'],
      scenario:
        'An incontinent patient has diffuse superficial irritation across skin exposed to urine. A separate painful area over the sacrum remains discolored after pressure is relieved. The patient has spent most of the day in bed. Barrier care was documented this morning. The nurse is deciding how to reassess the two areas.',
      cues: [
        'Diffuse irritation follows moisture exposure.',
        'A distinct painful area lies over the sacrum.',
        'The sacral change persists after pressure relief.',
        'The patient is mostly bedbound despite barrier care.',
      ],
      question:
        'Which assessment best explains the different prevention needs?',
      options: [
        yes(
          'Assess moisture injury and pressure-related damage separately, then address both exposures in the care plan.',
          'The distribution and persistent focal change suggest that more than one mechanism may be present. Barrier care can help moisture exposure without resolving sacral pressure loading.',
          [0, 1, 2, 3]
        ),
        no(
          'Classify both areas as moisture damage because incontinence explains the skin’s prolonged exposure.',
          'Moisture is relevant but does not adequately explain the separate persistent focal change over a loaded bony area.',
          'Incontinence is an obvious shared exposure across both affected regions.',
          'premature_closure',
          [0, 1, 2]
        ),
        no(
          'Classify both areas as pressure damage because the patient has remained in bed most of the day.',
          'Immobility increases risk but does not remove the need to distinguish diffuse moisture irritation from focal pressure damage.',
          'Bed rest is a strong risk factor and the sacral location is familiar.',
          'cue_misinterpretation',
          [0, 1, 3]
        ),
        no(
          'Judge the response by whether the barrier product reduces visible irritation at the next application.',
          'A moisture intervention’s surface response cannot establish whether the sacral loading problem has been addressed. Both areas and exposures need reassessment.',
          'The most recent intervention was barrier care, so its visible effect seems the natural outcome to track.',
          'misprioritization',
          [0, 1, 2, 3]
        ),
      ],
      reasoning: [
        'Use location, tissue findings and exposure to distinguish potentially coexisting mechanisms.',
        'Match reassessment and prevention to each mechanism rather than selecting one label for all changes.',
      ],
      debrief:
        'Clinical reasoning can support more than one explanation at once. A single successful intervention does not establish that every cause of tissue harm has been addressed.',
    },
    8
  ),
  q(
    {
      id: 'v2-assess-c-transfusion',
      topic: 'Breathlessness developing during transfusion',
      level: 'challenge',
      primaryCompetency: 'take_action',
      sources: ['transfusion'],
      scenario:
        'A patient receiving red cells develops new breathlessness after 45 minutes. Oxygen saturation falls from 96% to 89% on the same oxygen setting. The patient has chronic heart failure and says this feels like a previous fluid episode. There is no rash or recorded fever. The transfusion is still running when the nurse arrives.',
      cues: [
        'Breathlessness developed during transfusion.',
        'Saturation has fallen on unchanged oxygen.',
        'Heart failure provides a plausible fluid-related explanation.',
        'There is no rash or recorded fever.',
      ],
      question: 'Which response best prioritizes the new respiratory change?',
      options: [
        yes(
          'Stop the transfusion, support and assess breathing, and activate the urgent reaction-review pathway.',
          'A serious transfusion-associated complication is possible. Interrupt exposure and assess severity before assuming fluid overload or excluding a reaction because rash and fever are absent.',
          [0, 1, 2, 3]
        ),
        no(
          'Reduce the transfusion rate and request a diuretic because the history favors fluid intolerance.',
          'Fluid overload is plausible, but reducing the rate continues the exposure and selects a mechanism before urgent reaction assessment. The initial safety response should not depend on proving the subtype.',
          'Known heart failure and a familiar symptom pattern point toward circulatory overload.',
          'premature_closure',
          [0, 1, 2]
        ),
        no(
          'Increase oxygen and use the next saturation to decide whether the transfusion should be interrupted.',
          'Oxygen support is appropriate but a transient numerical improvement would not make continued exposure safe during an unexplained new respiratory reaction.',
          'Correcting saturation may seem a useful way to judge whether the event is severe.',
          'misprioritization',
          [0, 1, 3]
        ),
        no(
          'Pause the transfusion and restart at a slower rate once the patient reports less breathlessness.',
          'A subjective response does not identify the cause or establish safe re-exposure after respiratory compromise. Restart decisions require the appropriate clinical review and policy.',
          'Slower administration is commonly used to reduce fluid-related risk in susceptible patients.',
          'cue_misinterpretation',
          [0, 1, 2]
        ),
      ],
      reasoning: [
        'Connect the timing of respiratory deterioration to a possible transfusion-associated event.',
        'Prioritize interruption and assessment before choosing a specific causal treatment.',
      ],
      debrief:
        'A familiar comorbidity can supply a plausible explanation without settling the cause. Begin the safety pathway while the team distinguishes the relevant mechanisms.',
    },
    9
  ),
  q(
    {
      id: 'v2-assess-a-fast',
      topic: 'Hemorrhage concern after a negative FAST',
      level: 'advanced',
      primaryCompetency: 'prioritize_hypotheses',
      sources: ['traumaAssessment'],
      scenario:
        'A patient is reassessed after a road collision. Initial focused ultrasound showed no free intraperitoneal fluid. Over 30 minutes heart rate rises and blood pressure falls despite initial resuscitation. The patient develops pelvic and lower-back pain, while external bleeding is controlled. An early hemoglobin result is near baseline. The trauma team is returning to the bedside.',
      cues: [
        'High-energy collision',
        'Negative initial FAST examination',
        'Worsening hemodynamic trend despite initial resuscitation',
        'New pelvic and lower-back pain',
        'Controlled visible bleeding',
        'Early hemoglobin near baseline',
      ],
      question:
        'Which cause of circulatory deterioration requires renewed investigation despite the negative FAST and early hemoglobin?',
      options: [
        yes(
          'Possible concealed hemorrhage requires renewed source assessment and team-directed investigation matched to current stability.',
          'A negative FAST cannot exclude all intraperitoneal or retroperitoneal bleeding, and an early hemoglobin can lag acute loss. The worsening circulation and pain warrant urgent reassessment without relying on either reassuring test to close the hemorrhage pathway.',
          [0, 1, 2, 3, 4, 5]
        ),
        no(
          'A negative FAST shifts priority toward medication-related hypotension while repeat blood counts clarify whether bleeding exists.',
          'Medication effects can contribute, but the changing physiology and injury pattern already support urgent hemorrhage reassessment. Waiting for a hemoglobin fall gives an early test too much exclusionary weight.',
          'Two initially reassuring tests can make an iatrogenic explanation appear more likely.',
          'cue_misinterpretation',
          [1, 2, 3, 5]
        ),
        no(
          'The pelvic pain establishes the bleeding source, so further reassessment should focus on that region during resuscitation.',
          'The pelvis is important, but pain does not establish the sole source or exclude additional injuries and causes. Reassessment should prioritize likely sources without prematurely narrowing the whole evaluation.',
          'New focal pain offers an anatomical explanation for the deteriorating circulation.',
          'premature_closure',
          [0, 2, 3, 4]
        ),
        no(
          'The initially stable hemoglobin favors pain-related tachycardia, so analgesic response should determine the urgency of investigation.',
          'Pain can increase heart rate, but falling pressure despite initial resuscitation requires a broader urgent assessment. An analgesic response would not exclude concealed blood loss.',
          'Pain and a near-baseline laboratory value create a plausible nonhemorrhagic interpretation.',
          'misprioritization',
          [2, 3, 5]
        ),
      ],
      reasoning: [
        'Reconcile the limitations of early imaging and hemoglobin with the evolving clinical pattern.',
        'Prioritize concealed hemorrhage while keeping a team-directed pathway appropriate to current stability.',
      ],
      conflict:
        'Initial ultrasound and hemoglobin appear reassuring, but circulation is worsening and pain suggests a possible concealed injury.',
      anticipation:
        'Anticipate further circulatory collapse and prepare for a stability-dependent diagnostic and hemostatic response with the trauma team.',
      uncertainty:
        'The information does not establish the bleeding site or show that transfer for a particular imaging test is safe.',
      debrief:
        'Evaluate negative tests in relation to their scope and timing. A worsening patient can require a renewed hemorrhage pathway before a previously reassuring test becomes abnormal.',
    },
    10
  ),
  q(
    {
      id: 'v2-assess-a-head',
      topic: 'Neurologic deterioration after earlier reassuring imaging',
      level: 'advanced',
      primaryCompetency: 'evaluate_outcomes',
      sources: ['headInjury', 'deterioration'],
      scenario:
        'An older adult taking an anticoagulant is observed after a head injury. An earlier CT was reported without an acute bleed. Three hours later the patient vomits twice and becomes harder to keep awake. Their GCS falls from 15 to 13 on repeat assessment. Blood pressure and oxygen saturation remain near baseline. An opioid was given before the change, creating another possible explanation.',
      cues: [
        'Head injury during anticoagulant treatment',
        'Earlier CT without an acute bleed',
        'New repeated vomiting',
        'Reduced arousal',
        'GCS decline from 15 to 13',
        'Preserved pressure and saturation with recent opioid exposure',
      ],
      question:
        'How should the new vomiting and GCS decline be evaluated after an earlier CT without an acute bleed?',
      options: [
        yes(
          'Urgently escalate the neurologic decline and reassess head-injury complications and drug effects in parallel.',
          'An earlier CT and stable peripheral observations do not settle a new neurologic change. Recent opioid exposure is relevant but must not prevent urgent reassessment for intracranial deterioration and a team decision about further investigation.',
          [0, 1, 2, 3, 4, 5]
        ),
        no(
          'Use the recent opioid as the working explanation and let improved arousal determine whether head-injury review is needed.',
          'Drug effect is plausible, but using its response as a gate to injury review risks missing a concurrent complication. The repeated vomiting and documented GCS decline already warrant escalation.',
          'The medication preceded the change and commonly causes sedation and nausea.',
          'premature_closure',
          [2, 3, 4, 5]
        ),
        no(
          'Repeat routine observations and request another scan if pressure or saturation begins to depart from baseline.',
          'Normal pressure and oxygenation do not exclude neurologic deterioration. These are not appropriate prerequisites for escalation of a documented fall in GCS.',
          'Stable vital signs and an earlier normal scan can suggest that a short observation interval is sufficient.',
          'cue_misinterpretation',
          [1, 3, 4, 5]
        ),
        no(
          'Prioritize anticoagulation-reversal preparation as a confirmed bleed and defer the medication assessment to the receiving team.',
          'Urgent review and preparation may be needed, but the nurse cannot infer a confirmed bleed or an independent reversal decision from these findings. Assessing drug effects can occur alongside evaluation of injury complications.',
          'Anticoagulation raises the consequences of a possible intracranial hemorrhage.',
          'misprioritization',
          [0, 1, 2, 4]
        ),
      ],
      reasoning: [
        'Give a new neurologic trend appropriate weight despite prior negative imaging.',
        'Evaluate medication and injury mechanisms concurrently without requiring a peripheral vital-sign change.',
      ],
      conflict:
        'The earlier CT and recent opioid favor reassurance or sedation, while repeated vomiting and a measured GCS decline indicate potentially serious change.',
      anticipation:
        'Anticipate further loss of airway protection and prepare for urgent team-directed reassessment and investigation.',
      uncertainty:
        'The findings establish deterioration, but do not distinguish drug effect, intracranial injury or combined causes.',
      debrief:
        'Reassessment tests whether the patient’s current trajectory fits the previous conclusion. A plausible drug effect does not cancel a time-sensitive injury differential.',
    },
    11
  ),
  q(
    {
      id: 'v2-assess-a-reaction',
      topic: 'An uncertain pulmonary transfusion complication',
      level: 'advanced',
      primaryCompetency: 'analyze_cues',
      sources: ['transfusion'],
      scenario:
        'A transfusion has been stopped because a patient developed acute hypoxemia. They have bilateral crackles and a new bilateral chest opacity. There is chronic kidney disease and a positive fluid balance. The patient is also febrile and blood pressure has fallen. An elevated natriuretic peptide was recorded before transfusion, so its interpretation is limited. The responding team is evaluating the pulmonary complication.',
      cues: [
        'New hypoxemia during transfusion',
        'Bilateral crackles and new opacities',
        'Kidney disease and positive fluid balance',
        'New fever',
        'Falling blood pressure',
        'An elevated biomarker preceded the event',
      ],
      question:
        'What should guide distinction between pulmonary transfusion-reaction mechanisms in this patient?',
      options: [
        yes(
          'Compare circulatory overload, lung injury and other reaction mechanisms using timing, baseline data and current findings.',
          'Several transfusion complications can produce hypoxemia and bilateral opacities. Fluid exposure supports overload, while fever and hypotension require broader assessment; a biomarker already elevated before the event cannot independently establish the cause.',
          [0, 1, 2, 3, 4, 5]
        ),
        no(
          'Treat the positive balance and elevated biomarker as sufficient evidence of overload and use diuretic response to confirm it.',
          'Those findings support a hypothesis but do not settle the competing features or exclude other mechanisms. A treatment response should not substitute for the appropriate urgent reaction investigation.',
          'Kidney disease, accumulated fluid and a familiar biomarker align with a common overload pattern.',
          'premature_closure',
          [2, 3, 4, 5]
        ),
        no(
          'Treat fever and low pressure as sufficient evidence of lung injury and exclude fluid exposure from the working assessment.',
          'Fever and hypotension can occur with several serious reactions. Ignoring fluid exposure discards relevant evidence and incorrectly converts suggestive findings into a confirmed subtype.',
          'Fever and hypotension appear to contrast with a straightforward overload episode.',
          'cue_misinterpretation',
          [1, 2, 3, 4]
        ),
        no(
          'Use the pre-transfusion biomarker to establish chronic congestion and classify the new oxygen decline as expected baseline disease.',
          'The biomarker’s baseline elevation limits its discriminatory value; it does not explain away a new oxygen requirement and new imaging findings during transfusion.',
          'A chronically abnormal marker can make the pulmonary signs appear pre-existing.',
          'outdated_data',
          [0, 1, 5]
        ),
      ],
      reasoning: [
        'Identify evidence shared by several pulmonary reaction mechanisms and assess its specificity.',
        'Use baseline comparisons and discordant current findings to guide continued investigation rather than a premature subtype label.',
      ],
      conflict:
        'Fluid risk supports overload, while fever and falling pressure broaden the differential; the biomarker was abnormal before the event.',
      anticipation:
        'Continue respiratory and hemodynamic reassessment and the reaction investigation while the team determines mechanism-specific treatment.',
      uncertainty:
        'The scenario does not establish TACO, TRALI, sepsis or another reaction subtype, and more than one mechanism may contribute.',
      debrief:
        'A useful advanced synthesis explains why the obvious diagnosis remains uncertain. Identify which findings discriminate, which are shared and which were present before the event.',
    },
    12
  ),
  q(
    {
      id: 'v2-assess-a-skin-response',
      topic: 'Evaluating a pressure-injury prevention plan',
      level: 'advanced',
      primaryCompetency: 'evaluate_outcomes',
      sources: ['pressureInjury', 'nutritionSupport'],
      scenario:
        'A patient’s heel remains intact after a pressure-relief plan was introduced. Recorded repositioning tasks are complete, and the visible color appears unchanged. The patient reports increasing deep heel pain and the tissue feels more boggy. They have lost weight and are eating poorly. During assessment the heel is resting against the mattress despite the documented offloading plan. The team is deciding whether prevention has been effective.',
      cues: [
        'Intact heel with unchanged visible color',
        'Completed repositioning documentation',
        'Increasing deep pain',
        'New boggy tissue',
        'Weight loss and reduced intake',
        'The heel is still loaded despite the plan',
      ],
      question:
        'Which evaluation should determine whether the heel offloading plan has actually worked?',
      options: [
        yes(
          'Reassess tissue and actual offloading effectiveness, revise the plan and address the contributing nutrition risk.',
          'Documentation and surface appearance do not establish that loading was relieved or tissue injury prevented. Worsening pain and consistency plus observed loading require assessment and plan revision, while nutrition risk needs appropriate review.',
          [0, 1, 2, 3, 4, 5]
        ),
        no(
          'Use the completed turning record to confirm pressure relief and prioritize a new support surface for persistent pain.',
          'A different support surface may help, but the record does not establish effective heel offloading. The heel is observed to remain loaded, so actual delivery and local tissue findings need reassessment before relying on the turning record.',
          'A complete record appears to confirm adherence to the prevention protocol.',
          'outdated_data',
          [0, 1, 2, 3, 5]
        ),
        no(
          'Use the weight loss to make nutrition supplementation the main intervention before revising the pressure-relief method.',
          'Nutrition risk is important, but it does not remove the immediate need to address ongoing heel loading and worsening local findings. The two contributors should be managed together.',
          'Weight loss offers a systemic explanation for tissue vulnerability and poor recovery.',
          'misprioritization',
          [2, 3, 4, 5]
        ),
        no(
          'Use unchanged surface color as evidence of stability and increase analgesia while checking offloading at the next scheduled turn.',
          'Color alone does not establish tissue stability. Increasing pain, bogginess and observed loading call for reassessment now rather than treating pain as an isolated symptom.',
          'The most visible outcome seems stable, so pain control may appear to be the remaining problem.',
          'cue_misinterpretation',
          [0, 2, 3, 5]
        ),
      ],
      reasoning: [
        'Separate documented task completion from actual delivery and patient outcome.',
        'Integrate tissue changes, ongoing loading and nutrition risk to revise the prevention plan.',
      ],
      conflict:
        'Completed tasks and an intact surface suggest success, while worsening deep findings and observed heel loading suggest ineffective prevention.',
      anticipation:
        'Recheck the revised offloading method in use and track local tissue findings, comfort and relevant nutrition follow-up.',
      uncertainty:
        'The information does not establish the depth or stage of injury; specialist tissue assessment may be needed.',
      debrief:
        'Evaluate the patient and the intervention as delivered. A completed checklist can coexist with a failed prevention mechanism and a worsening outcome.',
    },
    13
  ),
  q(
    {
      id: 'v2-assess-a-baseline',
      topic: 'Hypoactive change despite reassuring routine observations',
      level: 'advanced',
      primaryCompetency: 'prioritize_hypotheses',
      sources: ['deterioration', 'medicationSafety'],
      referenceUrls: [delirium],
      scenario:
        'A patient with mild chronic cognitive impairment becomes unusually sleepy and stops eating lunch. A family member describes independent conversation and eating at breakfast. Routine temperature and blood pressure remain near baseline. A sedating medicine was added last night, and urine output has fallen today. The patient briefly answers orientation questions correctly but loses attention during the conversation. The nurse is deciding whether the current observation score explains the concern.',
      cues: [
        'A clear change from breakfast function',
        'New sleepiness and reduced intake',
        'Near-baseline temperature and pressure',
        'A new sedating medicine',
        'Falling urine output',
        'Fluctuating attention despite brief correct orientation',
      ],
      question:
        'How should the acute sleepiness and inattention be evaluated despite a reassuring routine observation score?',
      options: [
        yes(
          'Escalate the acute functional and attention change and assess medication, perfusion and other delirium contributors together.',
          'The acute change and fluctuation remain important despite correct brief orientation and stable routine values. Medication effects, organ dysfunction and other causes require assessment without attributing the whole pattern to the chronic label or a single new treatment.',
          [0, 1, 2, 3, 4, 5]
        ),
        no(
          'Use the correct orientation responses to favor ordinary fatigue and repeat the same observations after uninterrupted rest.',
          'Brief orientation does not resolve fluctuating attention or the documented functional decline. Rest may help, but it should not delay assessment of possible acute illness and reduced output.',
          'The patient can answer standard orientation questions and has reassuring routine vital signs.',
          'cue_misinterpretation',
          [0, 1, 2, 4, 5]
        ),
        no(
          'Use the new sedating medicine to establish a drug effect and defer other investigation until the dose is reviewed.',
          'The medicine is a relevant hypothesis but does not explain all current findings or exclude another concurrent cause. Reduced output and acute functional change warrant a broader assessment now.',
          'The treatment change has a plausible time relationship and a known sedating effect.',
          'premature_closure',
          [0, 3, 4, 5]
        ),
        no(
          'Use the chronic cognitive diagnosis to prioritize behavioral support and reserve escalation for a higher observation score.',
          'A chronic diagnosis cannot define this patient’s current baseline, and a score may miss clinically important attention and functional changes. Clinical concern can justify escalation before the score rises.',
          'A pre-existing cognitive label and low score can make the change seem familiar and low acuity.',
          'outdated_data',
          [0, 1, 2, 5]
        ),
      ],
      reasoning: [
        'Compare the current function and attention with a recent person-specific baseline.',
        'Integrate medication exposure and organ findings while recognizing the limits of routine scoring.',
        'Prioritize evaluation of an acute change without presuming a single cause.',
      ],
      conflict:
        'Near-baseline routine observations and brief correct orientation contrast with clear acute functional decline and fluctuating attention.',
      anticipation:
        'Reassess consciousness, intake, output and safety while the team identifies contributors and evaluates response to its plan.',
      uncertainty:
        'The information supports urgent assessment of acute change, but does not establish delirium’s cause or an independent medication change.',
      debrief:
        'Clinical concern can precede an abnormal score. Advanced reasoning uses collateral function, attention and organ trends to recognize a changed patient and keep several plausible causes under review.',
    },
    14
  ),
]
