import type {
  ChoiceDraftV2,
  ClinicalDomainV2,
  DistractorErrorV2,
  QuestionDraftV2,
  ReasoningLevelV2,
} from '@/lib/cjis/question-v2'
import type { SourceId } from '@/lib/learning/sources'

// Original clinical vignettes. These drafts require clinical review and response-data calibration.
const yes = (
  text: string,
  explanation: string,
  cues: number[]
): ChoiceDraftV2 => ({ text, explanation, cues })
const no = (
  text: string,
  explanation: string,
  plausible: string,
  error: DistractorErrorV2,
  cues: number[]
): ChoiceDraftV2 => ({ text, explanation, plausible, error, cues })
type Advanced = Pick<
  QuestionDraftV2,
  'conflict' | 'anticipation' | 'uncertainty'
>
function group(
  collectionId: string,
  domain: ClinicalDomainV2,
  sources: SourceId[]
) {
  let position = 0
  return (
    id: string,
    level: ReasoningLevelV2,
    topic: string,
    scenario: string,
    cues: string[],
    question: string,
    choices: QuestionDraftV2['options'],
    reasoning: string[],
    debrief: string,
    advanced: Partial<Advanced> = {}
  ): QuestionDraftV2 => {
    const offset = position++ % 4
    const options = [
      ...choices.slice(offset),
      ...choices.slice(0, offset),
    ] as QuestionDraftV2['options']
    return {
      id: `v2-cr-${id}`,
      collectionId,
      domain,
      sources,
      setting: 'Adult acute care and clinical follow-up',
      level,
      topic,
      scenario,
      cues,
      question,
      options,
      correct: ((4 - offset) % 4) as QuestionDraftV2['correct'],
      reasoning,
      debrief,
      ...advanced,
    }
  }
}
const neuro = group('reasoning:fever-neuro', 'neurologic', [
  'meningitis',
  'suddenHeadache',
  'deterioration',
])
const pancreas = group('reasoning:pancreas-balance', 'multisystem', [
  'pancreatitis',
  'fluids',
  'aki',
])
const skin = group('reasoning:skin-systemic', 'sepsis_infectious', [
  'cellulitis',
  'deepSkinInfection',
  'deterioration',
])
const leg = group('reasoning:leg-to-lung', 'cardiovascular', [
  'vte',
  'deterioration',
  'medicationSafety',
])
const abdomen = group('reasoning:abdomen-turn', 'multisystem', [
  'abdominalCare',
  'appendicitis',
  'deterioration',
])
const nutrition = group('reasoning:nutrition-context', 'person_centered', [
  'nutritionSupport',
  'coeliac',
  'sharedDecisions',
])

const feverNeuro: QuestionDraftV2[] = [
  neuro(
    'fever-f1',
    'foundation',
    'Fever with neck stiffness',
    'An adult arrives with fever and a new severe headache. Moving the neck is painful and stiff. The patient is awake and can give a history. The nurse is deciding which concern to communicate first.',
    ['Fever with a new severe headache', 'Painful neck stiffness'],
    'Which concern should lead the urgent clinical handover?',
    [
      yes(
        'Possible central nervous system infection',
        'The combination raises concern for meningitis and needs urgent assessment; an awake patient can still have serious infection.',
        [0, 1]
      ),
      no(
        'Possible primary tension headache',
        'Tension headache does not adequately explain the fever and neck stiffness together.',
        'Headache and neck muscle discomfort are common in tension headache.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Possible isolated cervical strain',
        'A strain may cause movement pain but does not account for the febrile severe-headache syndrome.',
        'Neck movement is painful.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'Possible uncomplicated febrile illness',
        'The meningeal symptom pattern makes an uncomplicated illness an insufficient working explanation.',
        'The patient is alert and has a fever.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Recognize a red-flag symptom combination.'],
    'Recognize the syndrome before assigning a familiar benign cause. Alertness does not remove the need to evaluate fever with meningeal symptoms.'
  ),
  neuro(
    'fever-f2',
    'foundation',
    'Meningitis without a rash',
    'A patient has fever, headache and neck stiffness. A skin examination finds no rash. The patient asks whether the clear skin means meningitis is ruled out. The nurse is explaining why urgent assessment is continuing.',
    ['Fever, headache and neck stiffness', 'No rash on examination'],
    'Which explanation best interprets the absent rash?',
    [
      yes(
        'A clear skin examination does not exclude meningitis.',
        'A rash is not required for meningitis. The existing symptom combination still warrants urgent assessment.',
        [0, 1]
      ),
      no(
        'A clear skin examination favors a noninfectious headache.',
        'Absence of rash cannot by itself shift this symptom cluster to a noninfectious explanation.',
        'A rash is strongly associated with meningococcal illness in teaching materials.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'A rash is expected before neurological symptoms develop.',
        'There is no dependable sequence requiring a rash before neurological symptoms.',
        'Learners may imagine a fixed sequence of infection signs.',
        'outdated_data',
        [0, 1]
      ),
      no(
        'Neck stiffness is less significant when a rash is absent.',
        'The absence of one sign does not make the existing meningeal finding unimportant.',
        'Combining positive and negative findings may seem to reduce concern.',
        'premature_closure',
        [0, 1]
      ),
    ],
    ['Recognize the limited exclusion value of an absent sign.'],
    'Use absent findings according to their actual diagnostic limits. Do not require every textbook feature before escalating a concerning presentation.'
  ),
  neuro(
    'fever-f3',
    'foundation',
    'New confusion during a febrile illness',
    'A patient is being assessed for fever and headache. Their partner says they are usually fully oriented. The patient now repeatedly asks where they are. The nurse is preparing the next assessment.',
    [
      'Usually fully oriented at baseline',
      'New repetitive disorientation during fever and headache',
    ],
    'Which finding should the nurse identify as acute deterioration?',
    [
      yes(
        'The change from usual orientation to repeated disorientation',
        'An acute change from baseline suggests neurological dysfunction and needs prompt assessment in this setting.',
        [0, 1]
      ),
      no(
        'The partner’s concern about the unfamiliar environment',
        'The environment may affect comfort, but it does not explain away an objectively new cognitive change.',
        'Hospital environments can be confusing.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'The patient’s ability to ask the same question clearly',
        'Clear speech does not establish intact orientation or exclude acute neurological illness.',
        'Preserved verbal output can appear reassuring.',
        'premature_closure',
        [1]
      ),
      no(
        'The established history of headache during the illness',
        'The headache is relevant, but the newly altered orientation is the change demanding priority.',
        'The presenting symptom has already prompted investigation.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Compare present cognition with the person’s baseline.'],
    'A meaningful neurological assessment is a comparison with baseline, not simply a statement that the patient can speak.'
  ),
  neuro(
    'fever-f4',
    'foundation',
    'Sudden maximal headache',
    'A patient describes a headache that reached maximum intensity in seconds. They have never experienced a similar headache. They can speak clearly and walk into the assessment area. The nurse is selecting the most important onset detail for handover.',
    [
      'Maximum headache intensity within seconds',
      'No previous similar headache',
    ],
    'Which feature most strongly supports urgent evaluation for a secondary cause?',
    [
      yes(
        'The abrupt onset at maximum intensity',
        'A sudden maximal headache is a red flag for a serious secondary cause even when the initial interaction appears normal.',
        [0, 1]
      ),
      no(
        'The ability to walk into the assessment area',
        'Walking does not negate a concerning onset pattern and is not the feature supporting a secondary cause.',
        'Normal mobility can suggest preserved neurological function.',
        'cue_misinterpretation',
        [0]
      ),
      no(
        'The absence of a previous headache diagnosis',
        'Lack of a prior diagnosis is relevant, but the explosive onset is the more decisive red flag here.',
        'A first headache may appear to be the principal risk feature.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'The patient’s ability to describe the event clearly',
        'A coherent history does not exclude serious intracranial pathology.',
        'A clear account can look incompatible with a neurological emergency.',
        'premature_closure',
        [0]
      ),
    ],
    ['Recognize a high-risk onset pattern.'],
    'How a headache began can be more informative than how well the patient looks during the first conversation.'
  ),
  neuro(
    'fever-f5',
    'foundation',
    'A reversible contributor to altered consciousness',
    'An adult with a febrile headache becomes difficult to engage. They use insulin at home. The emergency team is assessing airway and breathing. A bedside glucose meter is immediately available.',
    [
      'New reduced engagement',
      'Insulin treatment at home',
      'Airway and breathing assessment is underway',
    ],
    'Which bedside test should the nurse obtain promptly alongside the emergency assessment?',
    [
      yes(
        'Capillary blood glucose',
        'Hypoglycemia is a rapidly identifiable and treatable contributor to altered consciousness; checking it can occur alongside assessment for infection and neurological causes.',
        [0, 1, 2]
      ),
      no(
        'A repeat temperature measurement',
        'Temperature is relevant but does not identify an immediately reversible metabolic contributor as directly as glucose in this patient.',
        'Fever is central to the presenting illness.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'A urine specimen for ketones',
        'Ketones may be indicated later, but they do not replace a prompt glucose measurement during altered consciousness.',
        'Insulin use suggests a diabetes-related problem.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'A formal orientation questionnaire',
        'A questionnaire documents cognition but does not identify the readily testable metabolic contributor.',
        'The change is primarily noticed in cognition.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Identify an immediately testable reversible contributor.'],
    'Pursue reversible contributors in parallel with assessment of the major suspected illness. Checking glucose does not establish that infection or another neurological cause is absent.'
  ),
  neuro(
    'fever-c1',
    'challenge',
    'Temperature improvement with worsening cognition',
    'A patient is under observation for fever and severe headache. After an antipyretic, temperature falls from 39.2°C to 37.8°C. Over the same hour, the patient becomes slower to answer and needs repeated prompting. Their partner says this is new. The nurse is deciding whether the observation plan needs to change.',
    [
      'Temperature fell after an antipyretic',
      'Responses have become slower over an hour',
      'Repeated prompting is newly needed',
      'Partner confirms a change from baseline',
    ],
    'Which finding should drive the next action?',
    [
      yes(
        'Escalate the neurological decline despite the lower temperature.',
        'The cognitive trend is deterioration; an antipyretic response does not establish resolution of the underlying cause.',
        [0, 1, 2, 3]
      ),
      no(
        'Continue the current plan because the temperature is responding.',
        'This gives a treatment-responsive vital sign more weight than worsening neurological function.',
        'Temperature is an easily measured treatment endpoint.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'Repeat the temperature before interpreting the slower responses.',
        'Confirming temperature does not resolve the new cognitive change and should not postpone reassessment.',
        'A discrepant trajectory may seem to reflect an inaccurate temperature.',
        'misprioritization',
        [0, 1, 2]
      ),
      no(
        'Attribute the slower responses to fatigue after the fever.',
        'Fatigue is possible but cannot adequately account for acute decline without reassessment.',
        'The patient has been ill and may be exhausted.',
        'premature_closure',
        [1, 2, 3]
      ),
    ],
    [
      'Compare the trajectories of temperature and neurological function.',
      'Prioritize the worsening organ-function trend.',
    ],
    'Evaluate treatment response across relevant systems. Improvement in a symptom or temperature is not evidence that a new neurological decline is benign.'
  ),
  neuro(
    'fever-c2',
    'challenge',
    'Reassuring blood count in a concerning syndrome',
    'A patient has worsening fever, headache and photophobia over six hours. Neck stiffness is now present. The first white cell count is within the laboratory range. The patient remains awake. The nurse is preparing an updated handover.',
    [
      'Worsening symptoms over six hours',
      'New neck stiffness',
      'White cell count within range',
      'Preserved wakefulness',
    ],
    'Which interpretation best guides the handover?',
    [
      yes(
        'The evolving clinical syndrome still needs urgent assessment despite the blood count.',
        'A normal white cell count cannot independently exclude meningitis. The worsening symptom pattern remains clinically important.',
        [0, 1, 2, 3]
      ),
      no(
        'The blood count lowers concern enough to observe until the next routine round.',
        'The normal result does not outweigh progression of the meningeal symptom pattern.',
        'An objective laboratory value seems more reliable than symptoms.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'The preserved wakefulness makes repeat blood testing the priority.',
        'Wakefulness does not remove the need for clinical review, and repeat blood testing alone does not address the evolving syndrome.',
        'Severe neurological infection is often associated with reduced consciousness.',
        'misprioritization',
        [1, 2, 3]
      ),
      no(
        'The normal blood count favors migraine as the current working diagnosis.',
        'Migraine cannot be established from a normal white cell count in a progressively febrile meningeal presentation.',
        'Photophobia and headache are familiar migraine symptoms.',
        'premature_closure',
        [0, 1, 2]
      ),
    ],
    [
      'Interpret the limited exclusion value of one test.',
      'Integrate the symptom trajectory into urgency.',
    ],
    'A reassuring screening result is not a substitute for interpreting the whole syndrome and its trajectory.'
  ),
  neuro(
    'fever-c3',
    'challenge',
    'Investigation timing and antimicrobial treatment',
    'The team strongly suspects bacterial meningitis. Blood cultures have been obtained and antibiotics are prescribed. A lumbar puncture cannot be performed for several hours because the appropriate clinician is unavailable. The patient has no established alternative diagnosis. The nurse is checking the treatment sequence.',
    [
      'Strong clinical suspicion of bacterial meningitis',
      'Blood cultures already obtained',
      'Antibiotics are prescribed',
      'Lumbar puncture will be delayed for hours',
    ],
    'Which treatment sequence should the nurse clarify with the team?',
    [
      yes(
        'Give the prescribed antibiotics promptly rather than wait for the delayed lumbar puncture.',
        'Diagnostic sampling is useful, but a clinically significant lumbar-puncture delay should not postpone treatment of suspected bacterial meningitis.',
        [0, 1, 2, 3]
      ),
      no(
        'Hold antibiotics until cerebrospinal fluid has been collected for an uncontaminated culture.',
        'Preserving culture yield does not justify hours of treatment delay in this scenario.',
        'Antibiotics can reduce the diagnostic yield of later samples.',
        'misprioritization',
        [0, 3]
      ),
      no(
        'Repeat blood cultures near the lumbar puncture and then begin the prescribed treatment.',
        'Cultures have already been obtained; repeating them at a later procedure does not justify delaying treatment now.',
        'Synchronizing samples may seem to improve diagnostic completeness.',
        'misprioritization',
        [1, 2, 3]
      ),
      no(
        'Use the absence of a confirmed diagnosis to request symptom treatment before antibiotics.',
        'Confirmation may follow treatment; strong suspicion and a prolonged sampling delay require a timely antimicrobial plan.',
        'Avoiding unnecessary antibiotics is a legitimate general concern.',
        'premature_closure',
        [0, 2, 3]
      ),
    ],
    [
      'Balance diagnostic yield against the harm of treatment delay.',
      'Apply the sequence appropriate to a delayed investigation.',
    ],
    'A good sequence protects both diagnosis and timely care. Sampling should precede antibiotics when safe and prompt, but significant delays change the balance.'
  ),
  neuro(
    'fever-c4',
    'challenge',
    'New focal findings before lumbar puncture',
    'A patient is awaiting lumbar puncture for suspected meningitis. During preparation, the nurse observes a new unequal pupil response and right arm weakness. The patient was moving both arms normally earlier. Blood samples have been obtained. The team has prescribed initial treatment.',
    [
      'Lumbar puncture is planned',
      'New abnormal pupil response',
      'New focal weakness compared with earlier assessment',
      'Blood samples and initial treatment plan are ready',
    ],
    'What should the nurse communicate before proceeding with the procedure?',
    [
      yes(
        'Report the new focal findings and request urgent reassessment of lumbar-puncture safety.',
        'New focal neurological signs and abnormal pupillary reactions require reassessment for intracranial pathology; the lumbar puncture should not proceed without review of these findings.',
        [0, 1, 2, 3]
      ),
      no(
        'Complete the lumbar puncture quickly because the new signs increase diagnostic urgency.',
        'Increased urgency does not remove procedural safety concerns from new focal signs.',
        'A definitive cerebrospinal fluid result appears more urgent as symptoms worsen.',
        'misprioritization',
        [0, 1, 2]
      ),
      no(
        'Repeat the arm assessment after analgesia before reporting a focal change.',
        'Analgesia does not explain the abnormal pupil response; delaying communication risks missing significant deterioration.',
        'Pain can affect cooperation with motor testing.',
        'cue_misinterpretation',
        [1, 2]
      ),
      no(
        'Record the new findings as the preprocedure baseline and continue the planned sequence.',
        'A new abnormal baseline must trigger reassessment rather than merely documentation.',
        'Preprocedure documentation is a familiar nursing requirement.',
        'outdated_data',
        [0, 1, 2]
      ),
    ],
    [
      'Compare new focal findings with the earlier examination.',
      'Reassess the safety of a previously appropriate plan.',
    ],
    'A plan can become unsafe when the patient changes. Reassess procedure readiness using current findings, while maintaining timely stabilization and treatment.'
  ),
  neuro(
    'fever-c5',
    'challenge',
    'Pain relief without neurological recovery',
    'A patient with a severe headache receives prescribed analgesia. Pain falls from eight to three out of ten. Over the next thirty minutes, the patient vomits twice and becomes less attentive. The initial neurological assessment was normal. The nurse is choosing the next evaluation.',
    [
      'Substantial pain relief after analgesia',
      'Repeated new vomiting',
      'Reduced attention over thirty minutes',
      'Earlier neurological assessment was normal',
    ],
    'Which comparison should guide the next evaluation?',
    [
      yes(
        'Repeat and compare the neurological examination with baseline while escalating the new changes.',
        'Analgesia changes pain intensity, not necessarily the underlying disease. New vomiting and reduced attention warrant a current neurological comparison and clinical review.',
        [0, 1, 2, 3]
      ),
      no(
        'Use the improved pain score as the main endpoint and review nausea at the next medication round.',
        'This gives symptom relief priority over new neurological and vomiting changes.',
        'Pain was the original dominant symptom and has responded.',
        'misprioritization',
        [0, 1, 2]
      ),
      no(
        'Compare the current vomiting with the medication’s side-effect list before repeating neurological observations.',
        'Medication effects are possible, but they should be evaluated alongside rather than before reassessment of a changing neurological presentation.',
        'Analgesics can cause nausea or sedation.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'Use the normal initial examination to concentrate on hydration and oral tolerance.',
        'An earlier normal examination cannot establish the present neurological state.',
        'The previous assessment appears to have excluded a neurological deficit.',
        'outdated_data',
        [1, 2, 3]
      ),
    ],
    [
      'Distinguish symptom improvement from recovery of neurological function.',
      'Prioritize a new examination over an outdated reassuring assessment.',
    ],
    'Judge response by current relevant function. A lower pain score should not overshadow new findings that were absent at the first examination.'
  ),
  neuro(
    'fever-a1',
    'advanced',
    'Imaging, airway risk and treatment sequencing',
    'A patient with suspected bacterial meningitis has become progressively less responsive over thirty minutes. The GCS is now eight and the pupil response has become abnormal. Blood cultures have been collected and initial antibiotics are ready. A CT slot is available immediately, but the patient is not protecting the airway. A lumbar puncture had been planned before this decline. The nurse is coordinating the next sequence with the emergency team.',
    [
      'Progressive fall in consciousness over thirty minutes',
      'GCS now eight',
      'New abnormal pupil response',
      'Unprotected airway',
      'Cultures collected and antibiotics ready',
      'CT and lumbar puncture are being considered',
    ],
    'Which sequence best addresses the competing priorities?',
    [
      yes(
        'Stabilize airway and circulation, give timely prescribed treatment, and image before reconsidering lumbar puncture.',
        'The unprotected airway needs stabilization and the new neurological findings make lumbar puncture unsafe pending review. Imaging should not delay stabilization or timely antibiotics after available blood sampling.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Transfer directly to the available CT slot, then give antibiotics and decide whether airway support is needed.',
        'Imaging availability does not outrank an unprotected airway or justify treatment delay.',
        'Immediate imaging appears to offer the fastest explanation for the neurological decline.',
        'misprioritization',
        [2, 3, 4, 5]
      ),
      no(
        'Secure diagnostic cerebrospinal fluid first, then stabilize for imaging and begin antimicrobial treatment.',
        'New focal/pupillary findings and depressed consciousness change lumbar-puncture safety; diagnostic yield cannot justify this sequence.',
        'A cerebrospinal fluid sample may seem essential before antibiotics alter the result.',
        'outdated_data',
        [0, 2, 3, 5]
      ),
      no(
        'Give antibiotics and repeat the GCS after an interval before changing the existing lumbar-puncture plan.',
        'Antibiotics do not immediately resolve an unprotected airway or the procedural safety concerns. Waiting to see a neurological response is inappropriate.',
        'Treating the suspected cause might seem sufficient to reverse the decline.',
        'premature_closure',
        [0, 1, 2, 3]
      ),
    ],
    [
      'Reassess procedure safety from new neurological findings.',
      'Order stabilization, treatment and investigation to prevent avoidable harm.',
    ],
    'Advanced sequencing requires revisiting the original diagnostic plan when the airway and examination change.',
    {
      conflict:
        'An immediately available diagnostic scan competes with an unprotected airway and time-sensitive treatment.',
      anticipation:
        'Prevent aspiration or further deterioration during transfer and reconsider lumbar puncture only after the relevant safety concerns are addressed.',
      uncertainty:
        'The cause of the pupillary change is not established; it requires urgent evaluation rather than an assumed diagnosis.',
    }
  ),
  neuro(
    'fever-a2',
    'advanced',
    'Muted inflammatory signs in an immunosuppressed patient',
    'An adult receiving immunosuppressive treatment develops headache and increasing confusion over eight hours. Temperature is 37.2°C and the white cell count is not elevated. Their family reports normally independent cognition. Neck movement is uncomfortable and oral intake has fallen. The initial note describes a possible medication effect. The nurse is preparing an escalation request.',
    [
      'Immunosuppressive treatment',
      'Progressive headache and confusion over eight hours',
      'Normal-range temperature',
      'No white cell elevation',
      'New neck discomfort',
      'Reduced intake and a change from independent baseline',
    ],
    'Which assessment plan best handles the apparently reassuring findings?',
    [
      yes(
        'Request urgent evaluation for infection and other acute causes while reviewing medications and current neurological function.',
        'Immunosuppression can alter the presentation of infection. The acute cognitive and meningeal changes require assessment even without fever or leukocytosis, while medication and metabolic contributors remain relevant.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Prioritize medication reconciliation and defer infection assessment unless fever or leukocytosis develops.',
        'This makes two absent inflammatory signs prerequisites for evaluating a concerning syndrome in an immunosuppressed patient.',
        'Medication effects are plausible and the usual infection markers are absent.',
        'premature_closure',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Treat reduced intake as the main explanation and assess cognition after oral hydration has been restored.',
        'Poor intake may contribute, but it does not adequately explain the whole progressive neurological presentation or justify deferring review.',
        'Dehydration commonly contributes to confusion.',
        'misprioritization',
        [1, 4, 5]
      ),
      no(
        'Use the initial medication-effect impression to guide observation while arranging nonurgent laboratory review.',
        'A prior working impression must be reconsidered when neurological symptoms progress; it is not an exclusion of infection or other acute pathology.',
        'The first assessment already proposed a plausible cause.',
        'outdated_data',
        [0, 1, 4, 5]
      ),
    ],
    [
      'Interpret negative inflammatory markers in the host context.',
      'Maintain competing causes while prioritizing the progressive neurological syndrome.',
    ],
    'Reassuring findings have different weight in different patients. Advanced reasoning adjusts interpretation to the host and the trajectory.',
    {
      conflict:
        'Normal temperature and blood count conflict with a progressive neurological syndrome in an immunosuppressed host.',
      anticipation:
        'Escalate further decline in consciousness, focal signs or instability and support timely investigation and treatment.',
      uncertainty:
        'The symptoms do not establish infection, drug toxicity or dehydration as the sole cause.',
    }
  ),
  neuro(
    'fever-a3',
    'advanced',
    'Sedation as a competing explanation',
    'A patient with a febrile headache receives a prescribed opioid for pain. Thirty minutes later they are difficult to wake, with shallow breathing at eight per minute. Saturation is 97% on supplemental oxygen. A new left-sided weakness is also observed and was absent earlier. Bedside glucose is within range. The nurse is deciding whether the decline is explained by the medicine.',
    [
      'Recent opioid exposure',
      'Difficult arousal with shallow bradypnea',
      'Normal saturation on supplemental oxygen',
      'New unilateral weakness',
      'Earlier examination lacked focal weakness',
      'Bedside glucose within range',
    ],
    'Which immediate plan best avoids premature attribution?',
    [
      yes(
        'Support ventilation and escalate the focal neurological change while initiating the local opioid-rescue pathway as indicated.',
        'Opioid-related hypoventilation is plausible and needs immediate support, but it does not sufficiently explain a new unilateral deficit. Supplemental oxygen can preserve saturation despite inadequate ventilation.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use a reversal response to decide whether a neurological review is necessary after the breathing improves.',
        'A reversal response may identify a contributing drug effect but cannot exclude a concurrent focal neurological problem.',
        'A reversible medicine effect offers an efficient diagnostic test.',
        'premature_closure',
        [0, 1, 3, 4]
      ),
      no(
        'Prioritize urgent neurological imaging while using the normal saturation to defer ventilatory support.',
        'A normal saturation on oxygen does not establish adequate ventilation; airway and breathing support must accompany neurological escalation.',
        'The new focal deficit is highly concerning and saturation looks reassuring.',
        'misprioritization',
        [1, 2, 3]
      ),
      no(
        'Treat the weakness as reduced effort from sedation and repeat the examination when the opioid wears off.',
        'New unilateral weakness cannot be dismissed as generalized sedation without urgent reassessment.',
        'Sedation can reduce cooperation during a motor examination.',
        'cue_misinterpretation',
        [0, 3, 4]
      ),
    ],
    [
      'Recognize ventilatory impairment despite preserved oxygen saturation.',
      'Separate a plausible medication contribution from unexplained focal findings.',
    ],
    'A response to one treatment may explain part of a decline without explaining all of it. Stabilize the immediate physiologic threat while pursuing the remaining discordant evidence.',
    {
      conflict:
        'The timing supports a drug effect, while a new unilateral deficit suggests an additional neurological process.',
      anticipation:
        'Prevent progression to respiratory arrest and reassess focal function without waiting for drug clearance.',
      uncertainty:
        'Neither opioid toxicity nor a specific intracranial cause is confirmed by the available observations.',
    }
  ),
  neuro(
    'fever-a4',
    'advanced',
    'Purpura and shock before a planned procedure',
    'A patient with suspected meningococcal illness is awaiting a lumbar puncture. A purpuric rash is spreading rapidly and systolic pressure has fallen from 112 to 84 mmHg. The patient is increasingly confused with cool limbs. Platelet and coagulation results are pending. Blood samples have already been obtained. The procedure team asks whether preparation can continue.',
    [
      'Rapidly spreading purpura',
      'Falling systolic pressure',
      'Increasing confusion',
      'Cool peripheral perfusion',
      'Bleeding-risk results pending',
      'Blood samples obtained before the planned lumbar puncture',
    ],
    'Which plan best responds to the change in risk?',
    [
      yes(
        'Escalate shock and bleeding-risk concerns, stabilize and treat promptly, and defer lumbar puncture pending reassessment.',
        'Shock, rapidly spreading purpura and possible bleeding risk make the planned procedure unsafe now. Stabilization and timely treatment take priority over obtaining cerebrospinal fluid.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Proceed with lumbar puncture while the patient can still cooperate, then address the blood-pressure decline.',
        'Cooperation does not establish procedural safety in shock and spreading purpura.',
        'A rapidly narrowing diagnostic opportunity may seem to favor immediate sampling.',
        'misprioritization',
        [0, 1, 2, 4]
      ),
      no(
        'Wait for the coagulation panel before escalating because the rash may reflect a localized skin process.',
        'The concurrent hypotension, confusion and cool limbs already establish urgent systemic deterioration, regardless of pending results.',
        'Purpura has several possible causes and laboratory confirmation seems clarifying.',
        'premature_closure',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Use the initial procedure plan and add closer monitoring during specimen collection.',
        'Monitoring does not correct the new shock or unresolved procedure hazards. The plan must change with the patient.',
        'The team has already selected the procedure and can observe continuously.',
        'outdated_data',
        [0, 1, 3, 5]
      ),
    ],
    [
      'Integrate perfusion and bleeding-risk findings to reassess a planned procedure.',
      'Prioritize stabilization and treatment while preserving later diagnostic options.',
    ],
    'Do not let procedural momentum outrank a deteriorating patient. A safe sequence changes when new systemic and bleeding concerns appear.',
    {
      conflict:
        'Diagnostic sampling is desirable, but the patient has newly developed shock and potentially hazardous bleeding risk.',
      anticipation:
        'Prepare for further hemodynamic decline and reassess procedural readiness only after stabilization and safety review.',
      uncertainty:
        'Coagulopathy and the organism are not yet confirmed; neither uncertainty makes the current deterioration less urgent.',
    }
  ),
  neuro(
    'fever-a5',
    'advanced',
    'Worsening despite an initial treatment response',
    'A patient treated for suspected meningitis is less febrile on the second day. Their headache has improved, but new confusion and a focal seizure occur. Sodium has fallen compared with admission and fluid balance is positive. The initial CT was reported without an acute abnormality. Antibiotics have been administered on schedule. The nurse is preparing a focused escalation.',
    [
      'Lower fever and improved headache',
      'New confusion and focal seizure',
      'Sodium has fallen since admission',
      'Positive fluid balance',
      'Earlier CT had no acute finding',
      'Antibiotics administered as prescribed',
    ],
    'Which evaluation best addresses the new deterioration?',
    [
      yes(
        'Escalate the seizure and neurological change, reassessing electrolytes and intracranial or treatment-related complications together.',
        'An initial symptomatic response does not exclude complications or a metabolic contribution. The new seizure requires urgent assessment, current laboratory review and reconsideration of neurological causes despite earlier imaging.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Attribute the seizure to the sodium trend and postpone neurological reassessment until sodium improves.',
        'The sodium change is relevant but does not establish the sole cause of a focal seizure or exclude an intracranial complication.',
        'A new electrolyte abnormality provides a tangible reversible explanation.',
        'premature_closure',
        [1, 2, 3]
      ),
      no(
        'Use the earlier normal CT to focus the review on antimicrobial side effects without further neurological evaluation.',
        'Earlier imaging does not define the current neurological state or rule out a new process.',
        'An established normal scan seems to have settled the structural question.',
        'outdated_data',
        [1, 4, 5]
      ),
      no(
        'Interpret the lower fever as treatment success and manage the seizure as a separate isolated event.',
        'The new neurological and metabolic findings must be integrated with the illness and treatment course, rather than detached from them.',
        'The original infection indicators have improved.',
        'cue_misinterpretation',
        [0, 1, 2, 3]
      ),
    ],
    [
      'Integrate new neurological and metabolic findings despite partial clinical improvement.',
      'Reopen the differential and use current evidence rather than an earlier scan.',
    ],
    'Evaluation of response includes searching for complications and competing causes. Improving infection markers do not close the assessment when neurological function worsens.',
    {
      conflict:
        'Fever and pain improve while new focal neurological dysfunction and electrolyte change appear.',
      anticipation:
        'Prepare for recurrent seizures and worsening consciousness while the team evaluates current sodium, volume status and neurological causes.',
      uncertainty:
        'The degree and cause of the sodium change and the seizure mechanism require further assessment; a single explanation is not established.',
    }
  ),
]

const pancreasBalance: QuestionDraftV2[] = [
  pancreas(
    'pancreas-f1',
    'foundation',
    'Vomiting and fluid loss',
    'A patient with acute pancreatitis has vomited repeatedly. Their mouth is dry and they feel thirsty. Prescribed fluid assessment is beginning. The nurse is identifying the most direct history of external loss.',
    ['Repeated vomiting', 'Dry mouth and thirst'],
    'Which history most directly quantifies an external fluid loss?',
    [
      yes(
        'The frequency and approximate volume of the vomit',
        'The amount and timing of emesis help characterize an actual external loss relevant to fluid assessment.',
        [0, 1]
      ),
      no(
        'The severity of the epigastric pain',
        'Pain severity matters for care but does not quantify the external fluid loss.',
        'Pain is a dominant pancreatitis symptom.',
        'misprioritization',
        [0]
      ),
      no(
        'The time since the last solid meal',
        'Food intake alone does not quantify fluid lost through vomiting.',
        'Reduced intake can accompany vomiting and dehydration.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'The patient’s previous episodes of pancreatitis',
        'Past episodes provide context but do not measure the current loss.',
        'A familiar illness pattern may seem useful for estimating current needs.',
        'outdated_data',
        [0]
      ),
    ],
    ['Identify an observation that directly measures the relevant loss.'],
    'Make fluid history specific. An estimated loss and its timing are more useful than substituting pain intensity or a prior illness pattern.'
  ),
  pancreas(
    'pancreas-f2',
    'foundation',
    'Urine output and renal perfusion',
    'A patient with pancreatitis has produced 15 mL of urine in the last hour. The drainage tubing is unkinked and the catheter is draining freely. The nurse is checking the fluid record. The patient is awaiting a clinical review.',
    ['Low recent urine output', 'No obvious drainage obstruction'],
    'Which concern should the nurse communicate from these observations?',
    [
      yes(
        'Possible reduced renal perfusion requiring assessment',
        'Low urine output after checking drainage can signal reduced perfusion or another kidney problem and warrants assessment in context.',
        [0, 1]
      ),
      no(
        'Confirmed chronic kidney disease requiring baseline education',
        'A single low-output period does not establish chronic disease.',
        'Kidney disease can reduce urine output.',
        'premature_closure',
        [0]
      ),
      no(
        'Expected pancreatic fluid loss through the urinary catheter',
        'Low output is not a direct route of pancreatic fluid loss; it is a possible sign of impaired renal function or perfusion.',
        'The patient has a condition associated with fluid shifts.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'A catheter drainage problem requiring routine replacement',
        'The current checks do not establish a drainage problem, and replacement alone does not assess perfusion.',
        'Mechanical catheter problems commonly cause low recorded output.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Recognize low output as a possible organ-perfusion signal.'],
    'Check measurement and drainage before interpreting low output, then assess the patient rather than assuming a device explanation.'
  ),
  pancreas(
    'pancreas-f3',
    'foundation',
    'Edema and circulating volume',
    'A patient with pancreatitis has swollen ankles. Their mouth is dry and they report little intake. The nurse is preparing a fluid assessment. The patient asks whether the swelling means they have enough fluid in the circulation.',
    ['Peripheral edema', 'Dry mouth with low intake'],
    'Which explanation is most accurate?',
    [
      yes(
        'Tissue swelling does not by itself establish adequate circulating volume.',
        'Fluid can accumulate in tissues while the effective circulation remains inadequate. The assessment must include perfusion, losses, intake and other findings.',
        [0, 1]
      ),
      no(
        'Ankle swelling establishes excess fluid in the bloodstream.',
        'Peripheral edema identifies tissue fluid accumulation, not the adequacy of intravascular volume.',
        'Visible swelling looks like clear evidence of excess fluid.',
        'cue_misinterpretation',
        [0]
      ),
      no(
        'Dry mouth establishes that the ankle swelling is unrelated.',
        'Both findings may coexist in the same fluid-distribution problem; dry mouth does not separate their causes.',
        'The findings seem to point in opposite directions.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'Low intake means the swelling must be an old baseline finding.',
        'Current intake cannot determine how long edema has been present or exclude current fluid shifts.',
        'Low intake seems inconsistent with new swelling.',
        'outdated_data',
        [0, 1]
      ),
    ],
    ['Distinguish tissue fluid accumulation from effective circulation.'],
    'Interpret the compartment involved. A visible fluid excess in tissues cannot substitute for a complete assessment of perfusion and fluid distribution.'
  ),
  pancreas(
    'pancreas-f4',
    'foundation',
    'A new oxygen requirement',
    'A patient with pancreatitis was breathing comfortably on room air. They now report breathlessness and require supplemental oxygen to maintain the prescribed target. The nurse is reviewing the change. A clinical review can be requested immediately.',
    [
      'New breathlessness compared with baseline',
      'New supplemental oxygen requirement',
    ],
    'Which change should lead the escalation?',
    [
      yes(
        'The new respiratory compromise',
        'A new oxygen requirement with breathlessness indicates deterioration that needs prompt assessment.',
        [0, 1]
      ),
      no(
        'The continuing need for pancreatic pain assessment',
        'Pain assessment remains relevant, but the new breathing change has higher immediate priority.',
        'Pain can limit breathing in pancreatitis.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'The effectiveness of oxygen in restoring the displayed saturation',
        'Reaching a target on added oxygen does not explain or remove the new requirement.',
        'A corrected saturation can appear to show recovery.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'The diagnosis of pancreatitis already recorded in the chart',
        'The diagnosis provides context but does not evaluate the new respiratory change.',
        'Breathlessness may be regarded as part of the known illness.',
        'premature_closure',
        [0, 1]
      ),
    ],
    ['Recognize a new requirement for physiologic support.'],
    'Improvement in a supported measurement is different from recovery of the underlying function. Report new support requirements as changes from baseline.'
  ),
  pancreas(
    'pancreas-f5',
    'foundation',
    'Food withholding in uncomplicated recovery',
    'A patient recovering from acute pancreatitis is hungry. They are not vomiting and no procedure or other contraindication to eating is planned. A generic handover note says to rest the pancreas. The nurse is clarifying the nutrition plan.',
    [
      'Hunger without current vomiting',
      'No planned procedure or other stated contraindication',
      'A nonspecific instruction to rest the pancreas',
    ],
    'Which point should the nurse clarify with the treating team?',
    [
      yes(
        'Whether oral intake can resume according to the current clinical plan',
        'Acute pancreatitis alone is not a reason to withhold food without a clear clinical indication. The team should specify a plan based on current tolerance and needs.',
        [0, 1, 2]
      ),
      no(
        'Whether food should remain withheld until the patient has no residual pain',
        'Complete absence of pain is not a universal prerequisite for resuming intake.',
        'Pain may be interpreted as evidence that eating will worsen inflammation.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Whether intravenous nutrition should replace oral intake during pancreatic recovery',
        'Parenteral nutrition is not the default when oral or enteral intake is appropriate.',
        'Avoiding the gastrointestinal tract can sound protective.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Whether the generic handover instruction can be continued without a review date',
        'The nonspecific instruction does not identify a current contraindication or a reassessment plan.',
        'Maintaining the existing plan seems consistent with continuity of care.',
        'outdated_data',
        [0, 1, 2]
      ),
    ],
    ['Identify when an old routine lacks a current clinical indication.'],
    'Clarify nutrition restrictions with a reason and a review point. A disease label alone should not substitute for a current feeding assessment.'
  ),
  pancreas(
    'pancreas-c1',
    'challenge',
    'Persistent losses despite a normal pressure',
    'A patient with pancreatitis has vomited throughout the morning. Blood pressure remains close to baseline, but pulse has risen from 86 to 112 and urine output has fallen over four hours. The patient feels faint when sitting up. The nurse is reviewing the fluid plan. A repeat clinical assessment is available.',
    [
      'Ongoing vomiting',
      'Rising pulse over four hours',
      'Falling urine output',
      'Preserved blood pressure with positional faintness',
    ],
    'Which interpretation should guide the next review?',
    [
      yes(
        'Possible evolving volume or perfusion deficit despite preserved blood pressure',
        'Compensated blood pressure does not exclude a deficit when losses, tachycardia, low output and presyncope converge.',
        [0, 1, 2, 3]
      ),
      no(
        'Adequate circulation because blood pressure remains at baseline',
        'This overweights one maintained vital sign and ignores several worsening perfusion-related findings.',
        'Blood pressure is commonly used as the principal circulation marker.',
        'cue_misinterpretation',
        [1, 2, 3]
      ),
      no(
        'Pain-related tachycardia as the main explanation for the entire trend',
        'Pain may contribute to pulse rate but does not sufficiently explain the combined losses, falling output and faintness.',
        'Pancreatitis commonly causes severe pain.',
        'premature_closure',
        [0, 1, 2, 3]
      ),
      no(
        'A chronic low-output pattern requiring comparison at the next daily review',
        'The documented four-hour decline is an acute change, not an established chronic pattern.',
        'Renal output can vary across a day.',
        'outdated_data',
        [1, 2, 3]
      ),
    ],
    [
      'Integrate losses and several perfusion trends.',
      'Prioritize review before hypotension develops.',
    ],
    'Use trends that reveal compensation. A maintained blood pressure does not cancel evidence of worsening effective circulation.'
  ),
  pancreas(
    'pancreas-c2',
    'challenge',
    'Fluid response with emerging intolerance',
    'A patient with pancreatitis receives prescribed fluid replacement. Pulse and dizziness improve, but over the next hour breathlessness appears and crackles are heard. Oxygen requirement increases from baseline. The fluid infusion remains running at the earlier rate. The nurse is deciding what to reassess.',
    [
      'Some initial perfusion symptoms improved',
      'New crackles and breathlessness',
      'Increasing oxygen requirement over an hour',
      'Earlier fluid rate is still running',
    ],
    'Which action best addresses the new information?',
    [
      yes(
        'Request prompt reassessment of respiratory status and the ongoing fluid prescription.',
        'Benefits and harms of fluid treatment must be reassessed together. New respiratory findings may indicate intolerance or another complication and require review of the continuing plan.',
        [0, 1, 2, 3]
      ),
      no(
        'Maintain the original rate because improved dizziness confirms the fluid plan is effective.',
        'Initial benefit does not establish continued tolerance when new respiratory findings appear.',
        'The treatment improved the original symptoms.',
        'outdated_data',
        [0, 1, 2, 3]
      ),
      no(
        'Use the higher oxygen setting to complete the planned fluid amount before reassessment.',
        'Additional oxygen supports oxygenation but does not resolve the reason for the new requirement or establish fluid tolerance.',
        'The respiratory measurement may return to target on oxygen.',
        'misprioritization',
        [1, 2, 3]
      ),
      no(
        'Attribute the crackles to shallow breathing and concentrate on analgesia alone.',
        'Shallow breathing is possible, but the new cluster requires broader assessment before assigning a cause.',
        'Pancreatic pain can impair deep breathing.',
        'premature_closure',
        [1, 2]
      ),
    ],
    [
      'Compare initial benefit with emerging treatment intolerance.',
      'Reassess a continuing prescription using current respiratory findings.',
    ],
    'A successful early response does not make a treatment plan self-validating. Monitor for newly emerging harm and revisit the ongoing dose or rate with the team.'
  ),
  pancreas(
    'pancreas-c3',
    'challenge',
    'Creatinine trend and low output',
    'A patient with pancreatitis has had little intake for two days. Creatinine has risen from the recorded baseline and urine output is declining. A medication review shows recent NSAID use. Blood pressure is not markedly low. The nurse is preparing the renal-risk handover.',
    [
      'Poor intake for two days',
      'Creatinine rise from baseline',
      'Declining urine output',
      'Recent NSAID exposure',
      'No marked hypotension',
    ],
    'Which handover best supports the next clinical assessment?',
    [
      yes(
        'Report possible acute kidney injury and request review of volume status, exposures and obstruction.',
        'The baseline change and low output warrant AKI assessment; intake, medications and drainage/obstruction need review even without pronounced hypotension.',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Report chronic renal impairment and focus on teaching long-term fluid restriction.',
        'An acute rise from baseline does not establish chronic kidney disease or a fluid-restriction requirement.',
        'Raised creatinine is often associated with established kidney disease.',
        'cue_misinterpretation',
        [1, 2]
      ),
      no(
        'Report dehydration as confirmed and use repeat creatinine as the sole treatment endpoint.',
        'Volume depletion is plausible but not confirmed as the only cause; kidney injury assessment needs clinical context and output, not one endpoint.',
        'Poor intake provides a straightforward explanation.',
        'premature_closure',
        [0, 1, 2, 3]
      ),
      no(
        'Report the low output at the next scheduled review because pressure is preserved.',
        'Preserved pressure does not exclude AKI or remove the need to assess a worsening renal trend.',
        'Marked hypotension is often expected before perfusion-related injury.',
        'misprioritization',
        [1, 2, 4]
      ),
    ],
    [
      'Recognize acute renal change from baseline.',
      'Integrate potentially reversible contributors rather than assuming one cause.',
    ],
    'A useful AKI handover includes the change, timing and possible contributors. Neither a normal pressure nor a plausible dehydration story completes the assessment.'
  ),
  pancreas(
    'pancreas-c4',
    'challenge',
    'A biomarker falls while function worsens',
    'A patient with pancreatitis has a lower lipase value than yesterday. Over the same period, urine output decreases and supplemental oxygen is newly needed. Pain is slightly better after analgesia. The nurse is reviewing whether recovery is progressing. The patient remains under active inpatient care.',
    [
      'Lipase is lower than yesterday',
      'Urine output has decreased',
      'New oxygen requirement',
      'Pain improved after analgesia',
    ],
    'Which assessment provides the strongest basis for the next care decision?',
    [
      yes(
        'The worsening renal and respiratory function despite the falling lipase.',
        'Organ-function trends guide concern about deterioration; a falling pancreatic enzyme value does not establish clinical recovery.',
        [0, 1, 2, 3]
      ),
      no(
        'The enzyme decline because it directly measures recovery of all affected organs.',
        'Lipase does not directly measure respiratory or renal recovery.',
        'A quantitative disease-linked marker appears objective.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'The improved pain score because less pain implies less systemic inflammation.',
        'Analgesia can improve pain independently of the systemic trajectory.',
        'Pain is the patient’s most noticeable symptom.',
        'premature_closure',
        [1, 2, 3]
      ),
      no(
        'The previous day’s assessment because the enzyme trend confirms that plan remains suitable.',
        'Current functional deterioration requires reassessment rather than reliance on an earlier plan.',
        'A favorable laboratory trend may seem to validate continuity.',
        'outdated_data',
        [0, 1, 2]
      ),
    ],
    [
      'Separate disease-marker change from organ-function response.',
      'Prioritize deteriorating function when indicators disagree.',
    ],
    'Choose endpoints that answer the clinical question. A biomarker trend cannot stand in for the patient’s current respiratory and renal function.'
  ),
  pancreas(
    'pancreas-c5',
    'challenge',
    'Nutrition after several days of poor intake',
    'A patient with moderately severe pancreatitis has taken very little food for four days. Vomiting has settled, but intake remains below estimated needs. The patient is becoming weaker and the team has not documented a nutrition route. An instruction to remain nil by mouth is copied forward from admission. The nurse is preparing the care-plan review.',
    [
      'Minimal food for four days',
      'Vomiting has settled',
      'Intake remains inadequate with increasing weakness',
      'No current nutrition route or documented reason for ongoing restriction',
    ],
    'Which issue should be prioritized in the review?',
    [
      yes(
        'A timely nutrition assessment and an individualized oral or enteral plan.',
        'Continuing inadequate intake requires an active plan. In pancreatitis, enteral nutrition is generally preferred when oral intake is insufficient and the gut can be used; the old restriction needs a current reason.',
        [0, 1, 2, 3]
      ),
      no(
        'Continuing bowel rest until pancreatic enzymes return to the local reference range.',
        'Enzyme normalization is not a universal prerequisite for nutrition, and prolonged inadequate intake carries harm.',
        'Resting the pancreas is a familiar older concept.',
        'outdated_data',
        [0, 1, 3]
      ),
      no(
        'Starting parenteral nutrition as the default because pancreatitis prevents use of the gut.',
        'Pancreatitis does not itself establish that oral or enteral nutrition is contraindicated.',
        'Avoiding pancreatic stimulation can seem protective.',
        'cue_misinterpretation',
        [1, 2, 3]
      ),
      no(
        'Using oral fluid tolerance as sufficient evidence that nutrition needs are being met.',
        'Fluid tolerance does not establish adequate energy or protein intake.',
        'The patient has improved enough to drink.',
        'premature_closure',
        [0, 1, 2]
      ),
    ],
    [
      'Identify continuing nutritional deficit despite symptom improvement.',
      'Replace an outdated restriction with an assessed route and review plan.',
    ],
    'Recovery planning requires a nutrition endpoint as well as symptom control. Document why intake is restricted and when that restriction will be reassessed.'
  ),
  pancreas(
    'pancreas-a1',
    'advanced',
    'Low perfusion with respiratory intolerance',
    'A patient with pancreatitis has persistent low urine output and cool extremities after initial fluids. Pressure has improved, but respiratory rate and oxygen requirement are rising. New bilateral crackles are present and fluid balance is positive. The patient has a history of heart failure. Creatinine is also increasing. The nurse is asked whether the earlier fluid strategy should simply continue.',
    [
      'Persistent low output and cool extremities',
      'Improved blood pressure',
      'Rising respiratory rate and oxygen requirement',
      'New bilateral crackles',
      'Positive fluid balance with heart-failure history',
      'Increasing creatinine',
    ],
    'Which plan best addresses the competing perfusion and respiratory findings?',
    [
      yes(
        'Request urgent hemodynamic and respiratory reassessment before further fluid, using current response and tolerance to guide the team’s plan.',
        'Persistent perfusion problems coexist with possible fluid intolerance. The team needs a current assessment of circulation, respiratory function and other causes of low output rather than automatic continuation or a single presumed volume state.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Continue the earlier replacement strategy until urine output recovers, using blood pressure as the safety endpoint.',
        'This ignores emerging respiratory harm and assumes every low-output state is fluid responsive.',
        'Low output and cool skin suggest inadequate circulation.',
        'misprioritization',
        [0, 1, 2, 3]
      ),
      no(
        'Treat positive balance as proof of adequate circulation and focus the review on reducing fluid exposure alone.',
        'Positive balance and crackles do not establish adequate effective circulation or explain all causes of organ dysfunction.',
        'The respiratory findings and heart-failure history strongly suggest congestion.',
        'premature_closure',
        [0, 3, 4, 5]
      ),
      no(
        'Use the improved pressure to continue routine monitoring while the next creatinine result determines escalation.',
        'Pressure recovery does not negate worsening respiratory and renal function, and waiting for another result delays assessment.',
        'An objective renal marker may seem needed to confirm ongoing deterioration.',
        'cue_misinterpretation',
        [1, 2, 3, 5]
      ),
    ],
    [
      'Recognize that poor perfusion and fluid intolerance can coexist.',
      'Evaluate current treatment response before selecting further support.',
    ],
    'Advanced fluid reasoning avoids treating volume status as a single visible number. Integrate perfusion and tolerance and ask what intervention is likely to help the current physiology.',
    {
      conflict:
        'Improved pressure conflicts with persistent renal/peripheral compromise and emerging respiratory intolerance.',
      anticipation:
        'Prepare for escalation of respiratory or circulatory support if either trajectory worsens during reassessment.',
      uncertainty:
        'The findings do not establish fluid responsiveness or whether congestion, inflammation or another process explains the respiratory decline.',
    }
  ),
  pancreas(
    'pancreas-a2',
    'advanced',
    'Pain relief with a concerning abdominal trajectory',
    'A patient with pancreatitis reports less pain after analgesia. Over two hours the abdomen becomes more distended and firm. Respiratory effort increases, urine output falls and pressure begins to decline. Fluid balance is markedly positive. The last examination described a soft abdomen. The nurse is preparing an urgent handover.',
    [
      'Pain improved after analgesia',
      'Increasing abdominal distension and firmness over two hours',
      'Increasing respiratory effort',
      'Falling urine output',
      'Declining pressure with positive fluid balance',
      'Earlier abdomen was soft',
    ],
    'Which evaluation should the nurse request?',
    [
      yes(
        'Urgent assessment of the evolving abdominal findings and associated organ dysfunction, including pressure-related complications.',
        'The combination of a newly tense abdomen and respiratory, renal and circulatory changes raises concern for a significant complication. Pain relief does not exclude it; the team should assess current abdominal and systemic physiology.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Repeat analgesic assessment and attribute the reduced output to the earlier sedating medication.',
        'Medication may affect symptoms but does not explain the newly firm distension and multi-system decline sufficiently.',
        'The changes follow analgesia and the patient reports less pain.',
        'premature_closure',
        [0, 1, 2, 3]
      ),
      no(
        'Continue the previous abdominal observation plan because a softer examination was documented recently.',
        'The current examination has changed substantially, so the earlier finding cannot establish safety.',
        'A recent clinician examination may feel more reliable than a new bedside change.',
        'outdated_data',
        [1, 2, 3, 5]
      ),
      no(
        'Treat the low pressure as isolated volume loss and increase fluid without reassessing the abdominal and respiratory changes.',
        'A narrow volume-loss response can overlook pressure-related or other complications and possible harm from additional fluid.',
        'Pancreatitis often causes intravascular volume depletion.',
        'cue_misinterpretation',
        [1, 2, 3, 4]
      ),
    ],
    [
      'Integrate a changing abdominal examination with multi-organ dysfunction.',
      'Anticipate a complication that may make reflex fluid treatment harmful.',
    ],
    'Pain intensity is not a reliable stand-in for abdominal physiology. A changing examination plus organ dysfunction requires a fresh assessment of the mechanism.',
    {
      conflict:
        'Reported pain relief appears reassuring while abdominal firmness and respiratory, renal and circulatory findings worsen.',
      anticipation:
        'Prepare for rapid escalation if respiratory effort, output or circulation deteriorates further while the team evaluates the complication.',
      uncertainty:
        'A pressure-related complication is a concern, not a confirmed diagnosis; further clinical assessment and appropriate measurements are needed.',
    }
  ),
  pancreas(
    'pancreas-a3',
    'advanced',
    'Fever after initial improvement',
    'A patient with severe pancreatitis has begun to improve after several days. New fever and confusion develop, with a rising oxygen requirement and lower urine output. A prior scan showed a pancreatic collection without established infection. The intravenous line site is also tender. There is no microbiology result yet. The nurse is preparing a deterioration review.',
    [
      'Initial improvement followed by new fever',
      'New confusion',
      'Increasing oxygen requirement',
      'Lower urine output',
      'Previously noninfected pancreatic collection',
      'Tender intravenous line site without microbiology confirmation',
    ],
    'Which evaluation plan best handles the possible sources?',
    [
      yes(
        'Escalate systemic deterioration and evaluate pancreatic and nonpancreatic sources while obtaining timely team-directed investigations and treatment.',
        'New organ dysfunction needs urgent review. A pancreatic collection is one potential source, but the line and other sites must also be considered; neither prior imaging nor an obvious candidate establishes the current source.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Attribute the fever to the known pancreatic collection and defer assessment of other sites until cultures identify an organism.',
        'This closes the source assessment prematurely and delays consideration of the tender line or other causes.',
        'The patient already has a visible pancreatic abnormality.',
        'premature_closure',
        [0, 4, 5]
      ),
      no(
        'Use the earlier scan to classify the fever as sterile inflammation and continue the prior observation schedule.',
        'The prior absence of established infection does not exclude a new infection or another source during later deterioration.',
        'Sterile inflammation commonly causes fever in pancreatitis.',
        'outdated_data',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Prioritize local treatment of the tender line and judge systemic recovery from the next temperature reading.',
        'A local action and temperature endpoint do not address the concurrent neurological, respiratory and renal changes or broader source uncertainty.',
        'The line site is a tangible new abnormality.',
        'misprioritization',
        [0, 1, 2, 3, 5]
      ),
    ],
    [
      'Recognize renewed systemic deterioration after improvement.',
      'Maintain source uncertainty while arranging urgent organ assessment and timely care.',
    ],
    'A known abnormality can attract attention without explaining a new decline. Evaluate multiple sources and current organ function rather than inheriting an old source label.',
    {
      conflict:
        'A previously noninfected collection offers reassurance, while new systemic dysfunction and a tender line suggest a changed situation.',
      anticipation:
        'Monitor for further circulatory or respiratory decline and revise source-control planning as new evidence becomes available.',
      uncertainty:
        'The source and presence of infected necrosis are not established from fever or prior imaging alone.',
    }
  ),
  pancreas(
    'pancreas-a4',
    'advanced',
    'Renal decline with an uncertain fluid state',
    'A patient with pancreatitis has a rising creatinine and persistent oliguria. They had vomiting initially, but now have peripheral edema and a positive fluid balance. The catheter drains freely and bladder scanning shows little retained urine. Oxygen requirement has increased slightly. A prior note calls the problem dehydration. The nurse is preparing a nephrology and medical review.',
    [
      'Rising creatinine with persistent oliguria',
      'Earlier vomiting',
      'Current edema and positive fluid balance',
      'Patent catheter with little bladder retention',
      'Increasing oxygen requirement',
      'An earlier dehydration label',
    ],
    'Which reassessment best avoids committing to the wrong fluid strategy?',
    [
      yes(
        'Reassess effective circulation, fluid tolerance, medication exposures and other AKI causes before selecting further fluid treatment.',
        'The current picture is not settled by the earlier loss history or current edema. Low retention reduces concern for bladder obstruction, while perfusion, renal injury and fluid intolerance still require integrated assessment.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use the original dehydration diagnosis to continue replacement until creatinine returns to baseline.',
        'An old label cannot establish current fluid responsiveness, particularly with edema and rising oxygen needs.',
        'The illness began with obvious external losses.',
        'outdated_data',
        [0, 1, 2, 4, 5]
      ),
      no(
        'Use the edema to exclude a perfusion deficit and attribute oliguria to intrinsic kidney disease.',
        'Tissue edema does not establish effective circulating volume or prove the mechanism of AKI.',
        'Edema and positive balance look inconsistent with volume depletion.',
        'cue_misinterpretation',
        [0, 2, 4]
      ),
      no(
        'Replace the urinary catheter and reassess output before discussing the respiratory change.',
        'Current drainage checks and the bladder scan do not support a simple retention explanation, and the respiratory trend matters now.',
        'A mechanical cause is readily reversible.',
        'misprioritization',
        [0, 3, 4]
      ),
    ],
    [
      'Distinguish tissue fluid, effective circulation and drainage findings.',
      'Use the current mixed picture to avoid an automatic fluid prescription.',
    ],
    'A low-output patient may have several overlapping mechanisms. Reassess the current state and treatment tolerance rather than treating a past label or visible edema as a diagnosis.',
    {
      conflict:
        'Earlier external losses point toward depletion, but current edema and respiratory change raise concern about tolerance of additional fluid.',
      anticipation:
        'Escalate worsening respiratory support needs or persistent renal decline and monitor the response to any team-directed treatment change.',
      uncertainty:
        'The observations do not establish the dominant AKI mechanism or the patient’s fluid responsiveness.',
    }
  ),
  pancreas(
    'pancreas-a5',
    'advanced',
    'Selecting recovery endpoints',
    'A patient recovering from pancreatitis wants discharge because pain and lipase have decreased. They still need oxygen above baseline and become dizzy when walking to the bathroom. Oral intake remains poor and creatinine has not returned toward baseline. At rest the blood pressure is acceptable. The last fluid plan was written before the mobilization attempt. The nurse is preparing the readiness review.',
    [
      'Lower pain and lipase',
      'Ongoing oxygen requirement above baseline',
      'Dizziness with mobilization',
      'Poor oral intake',
      'Persistent creatinine elevation',
      'Acceptable resting pressure with an older fluid plan',
    ],
    'Which review best evaluates readiness for a lower level of care?',
    [
      yes(
        'Assess respiratory and renal trajectory, functional perfusion and oral intake against baseline before revising the care level.',
        'Recovery requires adequate and sustainable function, not just lower pain and enzymes. Current support needs, mobility symptoms, intake and renal trends should determine the review and updated plan.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use reduced pain and lipase as the principal criteria and arrange the remaining checks after discharge.',
        'The unresolved organ and functional findings need assessment before a lower level of care is selected.',
        'The disease-associated symptoms and laboratory marker have improved.',
        'premature_closure',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Use resting pressure as evidence of stable circulation and concentrate the review on an oral analgesic regimen.',
        'A resting measurement does not resolve exertional dizziness or the other unresolved support needs.',
        'A normal pressure is an easily communicated stability marker.',
        'cue_misinterpretation',
        [1, 2, 5]
      ),
      no(
        'Continue the earlier fluid plan and repeat discharge assessment after another routine laboratory panel.',
        'An older plan should be reviewed in light of new functional symptoms and oxygen needs, rather than simply extended until another panel.',
        'Repeating objective tests can seem more decisive than reassessing function.',
        'outdated_data',
        [1, 2, 4, 5]
      ),
    ],
    [
      'Choose recovery endpoints matched to the affected organs and everyday function.',
      'Identify unresolved risks before changing the care setting.',
    ],
    'Evaluate whether improvement is sustainable without the current level of support. Recovery is a functional and physiological judgment, not a laboratory finish line.',
    {
      conflict:
        'Pain and enzyme improvement conflict with persistent respiratory, renal, nutritional and functional limitations.',
      anticipation:
        'Plan reassessment of mobility, intake and support requirements, including contingencies if symptoms recur with activity.',
      uncertainty:
        'The final discharge decision depends on a current team assessment and an appropriate follow-up plan, not these observations alone.',
    }
  ),
]

const skinSystemic: QuestionDraftV2[] = [
  skin(
    'skin-f1',
    'foundation',
    'A possible skin entry site',
    'A patient has a warm, tender red area around a cracked heel. The redness began near the crack. The nurse is gathering a focused skin history. The patient has no known recent injection at the site.',
    ['Cracked heel skin', 'Warm tender redness beginning around the crack'],
    'Which finding provides a possible route for infection?',
    [
      yes(
        'The break in the skin at the heel',
        'A break in the skin barrier provides a possible entry route; it does not alone prove the organism or depth of infection.',
        [0, 1]
      ),
      no(
        'The warmth of the surrounding skin',
        'Warmth is an inflammatory finding rather than the entry route.',
        'Warmth is a prominent sign of infection.',
        'cue_misinterpretation',
        [1]
      ),
      no(
        'The absence of a recent injection',
        'No injection does not exclude another route through the cracked skin.',
        'Injections can provide an entry site.',
        'premature_closure',
        [0]
      ),
      no(
        'The tenderness of the red area',
        'Tenderness describes local inflammation but does not identify the barrier defect.',
        'Pain often draws attention to the affected site.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Distinguish an entry route from an inflammatory sign.'],
    'Describe the barrier defect and surrounding findings separately. This makes the assessment clearer without asserting a confirmed cause.'
  ),
  skin(
    'skin-f2',
    'foundation',
    'A reproducible skin baseline',
    'A patient is starting treatment for a red lower-leg lesion. The visible border can be identified. No size or photograph is documented. The nurse is planning the next observation.',
    ['An identifiable border of redness', 'No documented size or image'],
    'Which documentation best supports a later comparison?',
    [
      yes(
        'Record the measured extent and location, using a dated border mark or image according to policy.',
        'A reproducible baseline allows later comparison of extent and should accompany symptoms and systemic observations.',
        [0, 1]
      ),
      no(
        'Record that the leg looks inflamed and the patient agrees it is red.',
        'This confirms appearance but does not provide a reproducible extent for comparison.',
        'Agreement with the patient may seem sufficient confirmation.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Record the antibiotic name as the baseline for judging skin improvement.',
        'The treatment does not describe the original lesion extent.',
        'A treatment start is an important time point.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Record the patient’s previous cellulitis treatment as the expected response.',
        'A previous episode cannot establish this lesion’s baseline or course.',
        'The patient may recognize a familiar problem.',
        'outdated_data',
        [0, 1]
      ),
    ],
    ['Select a baseline measurement suitable for serial comparison.'],
    'A useful baseline is specific enough that another clinician can recognize a true change rather than a difference in description.'
  ),
  skin(
    'skin-f3',
    'foundation',
    'Pain disproportionate to the visible lesion',
    'A patient has a small red patch on the calf. They report deep severe pain extending beyond the patch. The nurse has confirmed the location of the discomfort. A clinician is available for review.',
    [
      'A small visible red patch',
      'Deep severe pain extending beyond visible redness',
    ],
    'Which concern should be highlighted in the review request?',
    [
      yes(
        'Possible deeper tissue involvement despite limited surface change',
        'Pain out of proportion to visible findings or extending beyond them can indicate a deeper process and warrants prompt assessment.',
        [0, 1]
      ),
      no(
        'A mild superficial process because the red patch is small',
        'Surface size does not establish depth or explain severe pain beyond the lesion.',
        'A small area looks less threatening than extensive redness.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'An inaccurate pain score because the visible change is limited',
        'The discrepancy requires assessment rather than dismissal of the patient’s report.',
        'The visible lesion appears insufficient to explain the reported intensity.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'A need to establish a larger border before reporting the pain',
        'Waiting for visible extension can delay assessment of a deeper problem.',
        'Skin spread is a familiar way to identify progression.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Recognize discordance between surface appearance and reported pain.'],
    'Assess discrepancies rather than forcing them to fit the visible lesion. The skin surface can underestimate the extent of a deeper process.'
  ),
  skin(
    'skin-f4',
    'foundation',
    'Systemic change during a skin infection',
    'A patient is being treated for a lower-leg skin infection. They become newly confused and their respiratory rate is 28 per minute. Their usual conversation is coherent. The nurse is deciding whether a local wound review is sufficient.',
    [
      'New confusion compared with baseline',
      'Respiratory rate 28 during an infection',
    ],
    'Which review is needed from these findings?',
    [
      yes(
        'Prompt systemic deterioration assessment',
        'New cognitive and respiratory changes suggest systemic illness and cannot be managed as a local skin issue alone.',
        [0, 1]
      ),
      no(
        'A routine dressing review focused on the wound edge',
        'Local assessment is useful but does not address the acute systemic changes.',
        'The known problem is located in the leg.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'A pain review before interpreting the respiratory rate',
        'Pain may affect breathing but does not adequately explain the new confusion without broader assessment.',
        'Pain can increase respiratory rate.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'A reassurance discussion about the unfamiliar care environment',
        'The environment cannot be assumed to account for an acute change during infection.',
        'Unfamiliar settings can be unsettling.',
        'cue_misinterpretation',
        [0, 1]
      ),
    ],
    ['Recognize systemic organ-function changes around a local infection.'],
    'A local source can produce a systemic problem. New cognitive or breathing changes should broaden the assessment promptly.'
  ),
  skin(
    'skin-f5',
    'foundation',
    'Blistering over an infected area',
    'A patient has a painful red skin lesion. A new dark blister has formed over the area. The nurse is checking changes since the previous examination. The patient can describe the symptom clearly.',
    ['Painful red lesion', 'New dark blister over the lesion'],
    'Which change warrants prompt clinical reassessment?',
    [
      yes(
        'The new dark blister on the painful lesion',
        'New bullous or dark skin change can be a concerning progression and needs assessment for deeper or more severe infection.',
        [0, 1]
      ),
      no(
        'The patient’s ability to provide a clear symptom history',
        'Clear speech does not establish that a local process is mild.',
        'A coherent patient can appear generally well.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'The absence of a recorded change in lesion dimensions',
        'A concerning tissue change can matter even when size has not yet been remeasured.',
        'Extent is a familiar measure of skin progression.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'The need to choose a protective dressing before reporting the change',
        'Dressing selection should not delay reassessment of a potentially significant new finding.',
        'Blisters require protection from rupture.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Recognize a potentially serious change in tissue appearance.'],
    'Serial assessment includes tissue quality, sensation and pain as well as the edge of redness.'
  ),
  skin(
    'skin-c1',
    'challenge',
    'Rapid pain escalation despite a small border change',
    'A patient began treatment for presumed cellulitis this morning. Over three hours, redness has expanded only slightly but pain has doubled and tenderness extends well beyond the edge. Heart rate has risen from 88 to 118. The nurse is preparing a review request. The next antibiotic dose is not yet due.',
    [
      'Treatment began this morning',
      'Severe pain escalation over three hours',
      'Tenderness beyond the visible edge',
      'Rising heart rate despite little border change',
    ],
    'Which change should determine the urgency of review?',
    [
      yes(
        'The rapid pain and systemic trajectory beyond the visible lesion',
        'Rapidly worsening deep pain and tachycardia raise concern for a deeper or more severe process despite limited surface spread.',
        [1, 2, 3]
      ),
      no(
        'The small amount of border spread because it is the most reproducible measure',
        'A small surface change cannot outweigh disproportionate pain and systemic deterioration.',
        'The border is easy to compare objectively.',
        'cue_misinterpretation',
        [1, 2, 3]
      ),
      no(
        'The time remaining until the next antibiotic dose',
        'The dosing schedule does not determine the urgency of evaluating new deterioration.',
        'Symptoms may be attributed to incomplete antibiotic exposure.',
        'misprioritization',
        [0, 1, 3]
      ),
      no(
        'The initial cellulitis diagnosis because early treatment commonly takes time',
        'Expected response time does not justify ignoring a new high-risk trajectory.',
        'Some inflammation persists early in appropriate treatment.',
        'outdated_data',
        [0, 1, 2, 3]
      ),
    ],
    [
      'Compare surface change with pain and systemic trends.',
      'Prioritize urgent reassessment when the trajectory is disproportionate.',
    ],
    'Expected treatment lag should not become a reason to overlook rapidly changing risk.'
  ),
  skin(
    'skin-c2',
    'challenge',
    'A respiratory change during antibiotic administration',
    'A patient with cellulitis starts an intravenous antibiotic. Within minutes, new wheeze and a hoarse voice develop. A raised itchy rash appears away from the infected leg. The patient previously had no breathing symptoms. Emergency treatment resources are at the bedside.',
    [
      'Symptoms begin within minutes of antibiotic exposure',
      'New wheeze and hoarse voice',
      'New itchy rash distant from infection',
      'No previous respiratory symptoms',
    ],
    'Which pathway should the nurse activate first?',
    [
      yes(
        'The emergency anaphylaxis pathway while stopping the suspected exposure',
        'The timing and new airway/breathing involvement with generalized skin symptoms support suspected anaphylaxis requiring immediate emergency care.',
        [0, 1, 2, 3]
      ),
      no(
        'The cellulitis progression pathway with the antibiotic continued as prescribed',
        'Progression of the leg infection does not explain the abrupt exposure-linked airway and generalized rash pattern.',
        'The patient is already being treated for an infection.',
        'outdated_data',
        [0, 1, 2]
      ),
      no(
        'A routine infusion-rate review followed by reassessment when the bag is complete',
        'New airway and breathing symptoms require an emergency response rather than an infusion adjustment alone.',
        'Infusion reactions can sometimes be rate related.',
        'misprioritization',
        [0, 1, 2]
      ),
      no(
        'A bronchodilator-focused review with rash documentation after breathing settles',
        'Bronchodilator treatment may be an adjunct but does not address the full suspected anaphylaxis syndrome or the exposure.',
        'Wheeze is a prominent treatable symptom.',
        'premature_closure',
        [0, 1, 2]
      ),
    ],
    [
      'Integrate exposure timing with new airway and skin findings.',
      'Switch from the established infection plan to the appropriate emergency pathway.',
    ],
    'A new problem during treatment may require a different pathway. Use timing and distribution to avoid attributing every change to the original infection.'
  ),
  skin(
    'skin-c3',
    'challenge',
    'Infection concern without a fever',
    'An adult receiving immunosuppressive therapy has a painful skin lesion. Over the afternoon, pain and surrounding swelling increase and the patient becomes less engaged. Temperature remains 37.0°C. Their usual cognition is clear. The nurse is reviewing the significance of the absent fever.',
    [
      'Immunosuppressive therapy',
      'Increasing pain and swelling over hours',
      'New reduced engagement',
      'No fever despite a change from baseline',
    ],
    'Which interpretation should guide escalation?',
    [
      yes(
        'Possible significant infection despite a muted temperature response',
        'The host context and evolving local/systemic findings require assessment; lack of fever does not exclude serious infection.',
        [0, 1, 2, 3]
      ),
      no(
        'A noninfectious cause because the temperature has remained normal',
        'A normal temperature is insufficient to exclude infection in this host and trajectory.',
        'Fever is a familiar marker of infection.',
        'cue_misinterpretation',
        [0, 1, 2, 3]
      ),
      no(
        'Medication-related fatigue as a sufficient explanation for the reduced engagement',
        'Fatigue may contribute, but it does not explain the progressive local findings and acute cognitive change.',
        'Immunosuppressive medicines can cause fatigue.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'A need to repeat temperature before communicating the new local changes',
        'Repeating one observation should not delay review of a concerning multi-domain trajectory.',
        'Confirming a measurement seems a prudent first step.',
        'misprioritization',
        [1, 2, 3]
      ),
    ],
    [
      'Interpret an absent fever within the host context.',
      'Integrate progressive local findings with a new systemic change.',
    ],
    'Interpret temperature as one part of a patient-specific assessment rather than a gatekeeper for escalation.'
  ),
  skin(
    'skin-c4',
    'challenge',
    'A maintained pressure with falling organ function',
    'A patient with an infected leg has a blood pressure similar to admission. Over four hours urine output falls and the patient becomes intermittently confused. Respiratory rate rises from 18 to 28. The leg remains painful. The nurse is deciding whether the existing local treatment plan is sufficient.',
    [
      'Pressure remains near admission value',
      'Falling urine output over four hours',
      'New intermittent confusion',
      'Rising respiratory rate',
    ],
    'Which conclusion best guides the next action?',
    [
      yes(
        'The organ-function changes require systemic deterioration review despite preserved pressure.',
        'Renal, cognitive and respiratory changes can indicate systemic compromise before hypotension appears.',
        [0, 1, 2, 3]
      ),
      no(
        'The maintained pressure supports continuing local treatment until the skin border expands.',
        'This makes hypotension or visible spread a prerequisite despite existing systemic changes.',
        'Pressure and lesion extent are familiar severity indicators.',
        'cue_misinterpretation',
        [0, 1, 2, 3]
      ),
      no(
        'The lower output should be managed as a separate urinary issue before reviewing the infection.',
        'A urinary check may be needed, but the simultaneous cognitive and respiratory changes require integration.',
        'Low output can arise from a mechanical drainage problem.',
        'premature_closure',
        [1, 2, 3]
      ),
      no(
        'The respiratory rate should be attributed to leg pain until analgesia has been repeated.',
        'Pain is a possible contributor but does not sufficiently explain the combined organ trends.',
        'Pain commonly increases respiratory rate.',
        'misprioritization',
        [1, 2, 3]
      ),
    ],
    [
      'Integrate several organ-function trends.',
      'Avoid using one compensated vital sign to exclude systemic compromise.',
    ],
    'Systemic assessment is warranted when several functions change together, even if one familiar vital sign remains stable.'
  ),
  skin(
    'skin-c5',
    'challenge',
    'Less pain with newly reduced sensation',
    'A patient is being observed for a painful skin infection. The pain score has fallen, but the center of the lesion is now numb and darker. Swelling continues to increase over the next hour. The patient has not received additional analgesia. The nurse is assessing whether the lower score represents recovery.',
    [
      'Lower pain without additional analgesia',
      'New central numbness',
      'Darker tissue',
      'Increasing swelling over an hour',
    ],
    'Which interpretation should guide the review?',
    [
      yes(
        'The sensory and tissue changes are concerning despite the lower pain score.',
        'Reduced pain can be falsely reassuring when accompanied by numbness and worsening tissue appearance. These changes need prompt reassessment.',
        [0, 1, 2, 3]
      ),
      no(
        'The lower pain score is the strongest evidence that antibiotics are working.',
        'Pain improvement cannot establish recovery when sensation and tissue appearance worsen.',
        'Pain is a commonly tracked treatment endpoint.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'The numbness indicates reduced inflammation and should be documented as expected improvement.',
        'New loss of sensation is not a dependable marker of healing in an evolving painful lesion.',
        'Less sensation may be mistaken for less inflammatory stimulation.',
        'premature_closure',
        [1, 2, 3]
      ),
      no(
        'The swelling should be remeasured at the original observation interval before reporting the change.',
        'The current combination already warrants reassessment; maintaining the old interval gives insufficient weight to new tissue findings.',
        'Serial measurement is valuable for detecting progression.',
        'outdated_data',
        [1, 2, 3]
      ),
    ],
    [
      'Distinguish reduced symptom reporting from improved tissue function.',
      'Integrate sensory and visual changes into urgency.',
    ],
    'A lower pain score is not always improvement. Evaluate it together with sensation, tissue appearance and the trajectory.'
  ),
  skin(
    'skin-a1',
    'advanced',
    'Surgical concern before definitive imaging',
    'An adult with a lower-leg lesion has rapidly increasing deep pain and tenderness beyond the red edge. Heart rate is rising and the patient is newly confused. Pressure is still preserved and no crepitus is felt. Initial antibiotics have been given. A CT scan can be arranged in an hour. The nurse is coordinating the urgent review.',
    [
      'Rapidly increasing deep pain',
      'Tenderness beyond the visible edge',
      'Rising pulse with new confusion',
      'Preserved pressure',
      'No palpable crepitus',
      'Antibiotics given with imaging delayed an hour',
    ],
    'Which plan best addresses the risk while diagnostic certainty is incomplete?',
    [
      yes(
        'Seek immediate senior and surgical assessment while continuing stabilization and team-directed antimicrobial care.',
        'The clinical trajectory raises concern for a deep aggressive process. Absence of crepitus and preserved pressure do not exclude it, and imaging should not become a prerequisite for urgent surgical assessment.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Complete the CT before surgical discussion so the referral can specify the depth of infection.',
        'Imaging may help but should not delay urgent assessment when the clinical findings are strongly concerning.',
        'A precise imaging result can make a referral more focused.',
        'misprioritization',
        [0, 1, 2, 5]
      ),
      no(
        'Broaden antibiotic coverage and use the next dose response to determine whether a surgical referral is needed.',
        'Antimicrobials do not replace assessment for a process that may require source control; waiting for a response can delay that decision.',
        'Antibiotics have only recently started.',
        'premature_closure',
        [0, 1, 2, 5]
      ),
      no(
        'Repeat border measurements frequently and request surgical review if crepitus or hypotension develops.',
        'Crepitus and hypotension are not required before seeking urgent review of the current high-risk trajectory.',
        'These findings seem like clearer evidence of advanced disease.',
        'cue_misinterpretation',
        [0, 1, 2, 3, 4]
      ),
    ],
    [
      'Weigh a high-risk clinical trajectory against absent late signs.',
      'Avoid a diagnostic sequence that delays possible source-control assessment.',
    ],
    'Advanced reasoning acts on a credible time-sensitive risk without pretending the diagnosis is already confirmed.',
    {
      conflict:
        'Preserved pressure and absent crepitus appear reassuring, while pain, extent of tenderness and cognition are worsening quickly.',
      anticipation:
        'Prepare for further systemic decline and support a rapid source-control decision if the assessment confirms concern.',
      uncertainty:
        'The depth and organism are not established; definitive diagnosis may require surgical evaluation.',
    }
  ),
  skin(
    'skin-a2',
    'advanced',
    'A low-risk test profile with worsening clinical findings',
    'A patient with a painful swollen thigh has relatively modest inflammatory laboratory results. Imaging reports edema without visible gas. Over two hours the pain becomes deep and severe, tenderness extends farther and the patient becomes tachypneic. They are taking an immunosuppressive medicine. Pressure has not fallen. The first note favored uncomplicated cellulitis.',
    [
      'Modest inflammatory laboratory abnormalities',
      'Edema without gas on imaging',
      'Rapidly worsening deep pain and tenderness',
      'New tachypnea',
      'Immunosuppressive treatment',
      'Preserved pressure with an earlier cellulitis label',
    ],
    'Which evidence should most strongly change the review plan?',
    [
      yes(
        'The progressive clinical trajectory warrants urgent reassessment despite the apparently low-risk test profile.',
        'Absence of gas or striking laboratory abnormalities does not reliably exclude deep infection, particularly in an immunosuppressed patient with rapid progression.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'The no-gas report supports completing the uncomplicated cellulitis pathway before requesting further review.',
        'No gas is not a definitive exclusion of a deeper aggressive process and does not resolve the current progression.',
        'Gas is a memorable imaging sign of severe infection.',
        'cue_misinterpretation',
        [1, 2, 3]
      ),
      no(
        'The modest laboratory results support treating the pain as a separate analgesic problem.',
        'This detaches pain from the worsening tenderness and systemic change without a sufficient explanation.',
        'Objective results may seem more trustworthy than a severe pain report.',
        'premature_closure',
        [0, 2, 3, 4]
      ),
      no(
        'The preserved pressure supports keeping the initial diagnosis while repeating laboratory tests later.',
        'Current clinical changes require review rather than reliance on the earlier label or waiting for a test threshold.',
        'Maintained pressure suggests some physiological reserve.',
        'outdated_data',
        [0, 2, 3, 5]
      ),
    ],
    [
      'Evaluate the limits of negative imaging and laboratory findings.',
      'Reopen an earlier diagnosis when the clinical course becomes discordant.',
    ],
    'Testing supplements clinical assessment; it does not erase a worsening trajectory. Reassess what a negative finding actually excludes.',
    {
      conflict:
        'Apparently reassuring tests and preserved pressure conflict with rapid pain progression and a new respiratory sign in a higher-risk host.',
      anticipation:
        'Arrange prompt senior review for deeper disease and monitor for further respiratory, cognitive or circulatory change.',
      uncertainty:
        'The current findings do not prove a necrotizing process or establish that the imaging has excluded it.',
    }
  ),
  skin(
    'skin-a3',
    'advanced',
    'Local lesion with uncertain systemic source',
    'An immunosuppressed patient has a small inflamed hand wound. They now have rigors, confusion and a falling pressure. The hand border has barely changed, while an indwelling line is newly tender. The patient has also developed a cough. Blood cultures are pending. The nurse is preparing the emergency source assessment.',
    [
      'Immunosuppressed host',
      'Small wound with little border change',
      'Rigors and new confusion',
      'Falling pressure',
      'Tender indwelling line',
      'New cough with cultures pending',
    ],
    'Which evaluation strategy best avoids anchoring on the visible wound?',
    [
      yes(
        'Stabilize systemic deterioration while assessing the wound, line and respiratory tract as competing sources.',
        'The systemic decline requires urgent care and a broad source assessment. The visible wound may matter, but its presence does not establish the source or exclude another concurrent infection.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Focus source-control planning on the hand wound and consider other sites if wound treatment fails.',
        'This assumes the visible lesion explains the systemic decline and delays assessment of two other plausible sources.',
        'The wound is the most obvious known abnormality.',
        'premature_closure',
        [1, 2, 4, 5]
      ),
      no(
        'Treat the line as the confirmed source because its tenderness is new and the hand border is stable.',
        'New tenderness raises concern but does not confirm the line as the source or exclude respiratory and wound contributions.',
        'The line is a plausible route of bloodstream infection.',
        'cue_misinterpretation',
        [1, 4, 5]
      ),
      no(
        'Complete source localization before escalating treatment so antimicrobial selection can be precise.',
        'Localization and sampling should proceed promptly alongside stabilization; unresolved source identity should not delay urgent treatment of deterioration.',
        'Targeted treatment and stewardship are legitimate goals.',
        'misprioritization',
        [0, 2, 3, 4, 5]
      ),
    ],
    [
      'Separate systemic severity from the size of a visible lesion.',
      'Maintain several plausible sources while arranging timely treatment and investigation.',
    ],
    'The most visible finding is not necessarily the source. Treat the deteriorating physiology while gathering evidence that can distinguish credible sources.',
    {
      conflict:
        'A nearly unchanged small wound appears mild, while systemic findings suggest a much more serious illness with several possible sources.',
      anticipation:
        'Prepare for further shock and revise source-control priorities as examination and microbiology clarify the problem.',
      uncertainty:
        'The wound, line and respiratory tract remain hypotheses rather than confirmed sources.',
    }
  ),
  skin(
    'skin-a4',
    'advanced',
    'Interpreting a mixed early treatment response',
    'A patient began oral treatment for cellulitis yesterday. The red edge is one centimeter beyond the original mark, but pain, tenderness and swelling have decreased. Temperature and pulse have returned toward baseline and the patient is walking more easily. There is no new deep pain, blistering or sensory loss. They can take the prescribed medicine and have reliable follow-up. The nurse is reviewing whether the small border change means treatment has failed.',
    [
      'Only one day of treatment',
      'Small border extension',
      'Improved pain, tenderness and swelling',
      'Improved systemic observations',
      'Improved function without deep tissue warning signs',
      'Treatment access and reliable follow-up',
    ],
    'Which plan best fits the whole response?',
    [
      yes(
        'Document the mixed trajectory, continue the clinician-agreed plan and arrange reassessment with explicit deterioration advice.',
        'A small early extension alone does not establish failure when symptoms, systemic findings and function improve. Continued close review and clear return triggers are appropriate, while recognizing that the diagnosis and response still need reassessment if the course changes.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Classify any extension as treatment failure and request immediate broad-spectrum intravenous treatment.',
        'This gives the border change decisive weight despite several improving domains and no stated new red flags.',
        'A marked border makes extension an objective finding.',
        'cue_misinterpretation',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Use the improved pulse and temperature to end monitoring of the lesion and omit a planned review.',
        'Improvement is reassuring but does not remove the need for reassessment and safety-net advice during early treatment.',
        'The systemic response appears favorable.',
        'premature_closure',
        [0, 1, 3, 5]
      ),
      no(
        'Request urgent deep-tissue imaging based on the border alone before continuing oral treatment.',
        'Imaging is not automatically required for a small early border change without a concerning pain, function or systemic trajectory.',
        'A deeper process is a serious possibility in skin infections.',
        'misprioritization',
        [1, 2, 3, 4]
      ),
    ],
    [
      'Weigh one unfavorable indicator against several improving clinical domains.',
      'Choose proportionate follow-up rather than reflex escalation or premature closure.',
    ],
    'Advanced reasoning also prevents unnecessary escalation. Interpret an early mixed response in context and specify what future changes would reverse the plan.',
    {
      conflict:
        'The border extends slightly while pain, swelling, observations and function improve.',
      anticipation:
        'Advise urgent reassessment for rapid spread, worsening pain, systemic illness, new blistering or sensory change, and review if improvement does not continue.',
      uncertainty:
        'Early improvement does not prove the diagnosis or guarantee eventual resolution; the planned review remains important.',
    }
  ),
  skin(
    'skin-a5',
    'advanced',
    'An injured limb with competing explanations for pain',
    'A patient has a lower-leg injury in a cast and a small nearby abrasion. Pain increases markedly and is worse when the toes are passively moved. The calf feels tense and the patient reports new tingling. The foot remains warm with a palpable pulse. Temperature is normal and the abrasion has only mild surrounding redness. The nurse is deciding which urgent concern should guide review.',
    [
      'Recent limb injury in a cast',
      'Escalating pain with passive toe movement',
      'Tense calf',
      'New tingling',
      'Warm foot with palpable pulse',
      'Normal temperature and a mildly red abrasion',
    ],
    'Which assessment pathway should take priority?',
    [
      yes(
        'Urgent review for a pressure-related limb complication, including assessment of the cast and neurovascular function.',
        'Escalating pain with passive movement, tense swelling and sensory change after injury raise concern for compartment syndrome. A pulse can remain present; mild skin redness should not anchor the assessment on cellulitis.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Prioritize a superficial-infection review and use the preserved pulse to exclude a pressure-related problem.',
        'A palpable pulse does not exclude compartment syndrome, and the pain pattern and sensory change need urgent limb assessment.',
        'The abrasion provides a visible possible source of pain and redness.',
        'cue_misinterpretation',
        [1, 2, 3, 4, 5]
      ),
      no(
        'Treat the pain as expected postinjury swelling and repeat the examination after the next analgesic dose.',
        'The escalating pain, passive-movement pain and sensory change are not sufficiently explained as routine swelling.',
        'Pain and swelling are common after injury.',
        'premature_closure',
        [0, 1, 2, 3]
      ),
      no(
        'Arrange a nonurgent skin photograph and compare redness before asking for cast review.',
        'Measuring a mild skin change delays assessment of a time-sensitive limb threat.',
        'Serial skin comparison is useful for tracking infection.',
        'misprioritization',
        [0, 1, 2, 3, 5]
      ),
    ],
    [
      'Distinguish a visible skin finding from a deeper injury-related pattern.',
      'Interpret preserved distal pulse within the limits of the suspected complication.',
    ],
    'Advanced differential reasoning asks which explanation accounts for the distribution and mechanism of the findings. A normal pulse cannot exclude every limb-threatening process.',
    {
      conflict:
        'The foot looks perfused and the abrasion suggests infection, while the pain pattern and tense compartment suggest another urgent mechanism.',
      anticipation:
        'Escalate promptly to prevent progressive nerve and muscle injury and repeat documented neurovascular assessment during urgent review.',
      uncertainty:
        'The scenario raises concern for compartment syndrome but does not establish compartment pressure or a definitive diagnosis.',
    }
  ),
]

const legToLung: QuestionDraftV2[] = [
  leg(
    'leg-f1',
    'foundation',
    'Unilateral calf symptoms after immobility',
    'A patient returns after a long period of reduced mobility. One calf is newly swollen and tender. The other leg is unchanged. The nurse is arranging a focused clinical assessment.',
    ['Recent reduced mobility', 'New unilateral calf swelling and tenderness'],
    'Which concern should the nurse include in the assessment request?',
    [
      yes(
        'Possible deep vein thrombosis',
        'Immobility with new unilateral calf symptoms warrants assessment for DVT; these findings do not confirm it.',
        [0, 1]
      ),
      no(
        'Generalized fluid retention as the established cause',
        'Generalized retention is less consistent with a new unilateral change and cannot be assumed.',
        'Swelling is commonly associated with fluid retention.',
        'cue_misinterpretation',
        [1]
      ),
      no(
        'Muscle deconditioning as a sufficient explanation',
        'Deconditioning does not sufficiently explain a newly swollen tender calf.',
        'The patient has been inactive.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'Chronic venous symptoms requiring the usual annual review',
        'The acute change requires assessment rather than being assigned a chronic course.',
        'Venous disorders can cause leg swelling.',
        'outdated_data',
        [0, 1]
      ),
    ],
    ['Recognize a risk factor and a compatible focal symptom pattern.'],
    'Raise a focused possibility without calling it confirmed. New unilateral symptoms require a different assessment from generalized edema.'
  ),
  leg(
    'leg-f2',
    'foundation',
    'Chest symptoms after a leg problem',
    'A patient awaiting assessment of a swollen calf suddenly becomes short of breath. They describe pain on taking a deep breath. A nurse is at the bedside. Emergency assistance can be summoned immediately.',
    [
      'A swollen calf under assessment',
      'Sudden breathlessness with pleuritic pain',
    ],
    'Which response has the highest priority?',
    [
      yes(
        'Assess airway, breathing and circulation and summon urgent clinical assistance.',
        'Sudden respiratory symptoms in this context raise concern for PE or another acute cardiopulmonary problem and require immediate assessment.',
        [0, 1]
      ),
      no(
        'Complete the calf measurement before reassessing the chest symptoms.',
        'Leg measurements should not delay assessment of a new respiratory threat.',
        'The calf was the original problem being investigated.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Ask the patient to walk briefly to determine whether the breathlessness resolves.',
        'Provoking exertion is not the priority during unexplained sudden dyspnea and chest pain.',
        'Exercise tolerance can help assess breathlessness in stable patients.',
        'cue_misinterpretation',
        [1]
      ),
      no(
        'Treat the chest discomfort as anxiety related to the pending leg investigation.',
        'Anxiety may coexist but cannot be assumed to explain acute cardiopulmonary symptoms.',
        'Waiting for a possible clot diagnosis may be frightening.',
        'premature_closure',
        [0, 1]
      ),
    ],
    ['Recognize a new time-sensitive cardiopulmonary change.'],
    'A new breathing problem changes the priority of a leg assessment. Stabilization and urgent review come before completing the original task.'
  ),
  leg(
    'leg-f3',
    'foundation',
    'A possible bleeding sign during anticoagulation',
    'A patient is taking an anticoagulant for a recent DVT. They report a new black, tarry stool. They are speaking comfortably with the nurse. The next assessment is being planned.',
    ['Current anticoagulant treatment', 'New black tarry stool'],
    'Which concern requires prompt clinical assessment?',
    [
      yes(
        'Possible gastrointestinal bleeding as an adverse event during anticoagulant treatment',
        'New tarry stool can indicate gastrointestinal bleeding, which is particularly important during anticoagulant treatment.',
        [0, 1]
      ),
      no(
        'Expected evidence that the anticoagulant is dissolving the clot',
        'Tarry stool is not an expected sign of clot resolution.',
        'The patient recently began clot treatment.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'A dietary change as the established explanation',
        'Diet can affect stool color, but a new tarry description during anticoagulation warrants assessment rather than assumption.',
        'Food and iron can darken stool.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'A routine medication-adherence question at the next visit',
        'Adherence matters, but possible bleeding needs a current assessment.',
        'Anticoagulant education is an important follow-up task.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Recognize a possible adverse event from treatment context.'],
    'Watch for treatment harm as actively as the original disease. A comfortable conversation does not exclude a clinically significant bleed.'
  ),
  leg(
    'leg-f4',
    'foundation',
    'A clear anticoagulant history',
    'A patient with suspected PE says they take a blood thinner. They cannot recall its name. A family member can access the current medication list. The nurse is preparing the clinician’s handover.',
    [
      'Reported blood thinner without a name',
      'Current medication list is accessible',
    ],
    'Which clarification is most useful immediately?',
    [
      yes(
        'Verify the exact medicine, prescribed regimen and last dose.',
        'The specific drug and timing affect treatment and bleeding-risk decisions; the phrase blood thinner is insufficient.',
        [0, 1]
      ),
      no(
        'Record the tablet color as the main medication identifier.',
        'Color alone is unreliable because formulations and manufacturers vary.',
        'Patients often recognize tablets visually.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Record that the patient is anticoagulated and leave the exact drug for discharge.',
        'The drug and last dose matter during the acute treatment decision, not only at discharge.',
        'The broad treatment category seems to convey the main risk.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Use the medicine listed in a previous admission without confirming the current regimen.',
        'An older record may not represent current treatment or the last dose.',
        'Existing records may seem more authoritative than patient recall.',
        'outdated_data',
        [0, 1]
      ),
    ],
    ['Identify the medication details needed for a current decision.'],
    'Medication categories are a starting point. Verify the actual drug, regimen and timing before relying on the history.'
  ),
  leg(
    'leg-f5',
    'foundation',
    'A normal saturation in suspected PE',
    'A patient develops sudden pleuritic chest pain and breathlessness. Pulse oximetry reads 97% on room air. The patient asks whether the number excludes a lung clot. The nurse is explaining the ongoing assessment.',
    ['Sudden pleuritic pain with breathlessness', 'Room-air saturation 97%'],
    'Which explanation best interprets the saturation?',
    [
      yes(
        'A normal saturation does not by itself exclude pulmonary embolism.',
        'Oxygen saturation is one observation and is not a standalone exclusion test for PE.',
        [0, 1]
      ),
      no(
        'The saturation makes pulmonary embolism unlikely enough to end assessment.',
        'A normal reading alone cannot determine clinical probability or replace the appropriate diagnostic pathway.',
        'Hypoxemia is commonly associated with PE.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'The saturation proves the pain arises outside the chest.',
        'The number does not establish the source of pain or exclude cardiopulmonary disease.',
        'Normal oxygenation may seem incompatible with a lung problem.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'The saturation supports waiting to reassess unless the value falls.',
        'Other symptoms and risk factors can require assessment before desaturation occurs.',
        'A falling number appears an objective trigger for urgency.',
        'misprioritization',
        [0, 1]
      ),
    ],
    [
      'Interpret the limited exclusion value of a normal physiologic measurement.',
    ],
    'A measurement can describe present oxygenation without answering the diagnostic question.'
  ),
  leg(
    'leg-c1',
    'challenge',
    'New head symptoms after a fall during treatment',
    'A patient treated with an anticoagulant for DVT fell earlier today. They initially reported no injury and continued their activities. Two hours later they develop a new headache and nausea. Their usual neurological function is independent. The nurse is asked whether to wait for the routine clinic review.',
    [
      'Anticoagulant treatment',
      'Fall earlier today',
      'Delayed new headache and nausea',
      'Initially reassuring report',
    ],
    'Which action best addresses the new information?',
    [
      yes(
        'Arrange urgent assessment of possible head injury and communicate the anticoagulant and symptom timing.',
        'Anticoagulation and new symptoms after a fall warrant urgent assessment; the earlier reassuring report does not settle current risk.',
        [0, 1, 2, 3]
      ),
      no(
        'Use the initial denial of injury to continue routine follow-up unless a visible bruise appears.',
        'An earlier denial and absence of bruising cannot exclude an intracranial injury.',
        'The patient initially felt well and completed normal activities.',
        'outdated_data',
        [0, 1, 2, 3]
      ),
      no(
        'Attribute nausea and headache to the anticoagulant and review tolerance at the next prescription visit.',
        'The temporal link to a fall requires injury assessment before assigning a medication side effect.',
        'Headache and nausea can have medication-related causes.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'Repeat the pain score after rest before communicating the fall history.',
        'Symptom reassessment can accompany care but should not delay communication of this risk pattern.',
        'Rest may improve a benign headache.',
        'misprioritization',
        [0, 1, 2]
      ),
    ],
    [
      'Integrate medication risk with delayed symptoms after trauma.',
      'Reassess an initially reassuring event when the trajectory changes.',
    ],
    'A new symptom can change the meaning of an earlier event. Include exposure, timing and the change from baseline in the handover.'
  ),
  leg(
    'leg-c2',
    'challenge',
    'Improving leg symptoms with new dyspnea',
    'A patient’s calf pain is improving after DVT treatment begins. Later that day they develop sudden dyspnea and pleuritic chest pain. Heart rate has increased from the morning baseline. They have received the prescribed anticoagulant. The nurse is deciding whether the improving leg is reassuring.',
    [
      'Improved calf pain after treatment',
      'New sudden dyspnea and pleuritic pain',
      'Rising heart rate',
      'Prescribed anticoagulant administered',
    ],
    'Which interpretation should guide the next action?',
    [
      yes(
        'The new cardiopulmonary symptoms require urgent review despite improving calf pain and treatment.',
        'Improving local symptoms and anticoagulation do not exclude PE or another acute cardiopulmonary problem.',
        [0, 1, 2, 3]
      ),
      no(
        'The improving calf pain establishes a favorable clot trajectory and supports routine observation.',
        'Local symptom improvement cannot establish that the new chest symptoms are benign.',
        'The original problem is responding to treatment.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'The recorded anticoagulant dose excludes a thromboembolic explanation for symptoms today.',
        'Treatment reduces risk but does not make acute thromboembolic disease impossible or identify another cause.',
        'The correct medicine has already been given.',
        'premature_closure',
        [1, 2, 3]
      ),
      no(
        'The next calf measurement should determine whether chest-symptom review is necessary.',
        'The acute cardiopulmonary changes require their own assessment without waiting for a local measurement.',
        'Serial calf measurements track the original problem.',
        'misprioritization',
        [0, 1, 2]
      ),
    ],
    [
      'Separate local response from a new cardiopulmonary trajectory.',
      'Escalate new symptoms despite an apparently effective treatment.',
    ],
    'Treatment response is specific to the endpoint measured. A less painful leg does not answer a new breathing question.'
  ),
  leg(
    'leg-c3',
    'challenge',
    'A positive D-dimer in clinical context',
    'A patient is being assessed for possible PE. A D-dimer result is elevated after recent surgery. The clinician has not completed the clinical-probability assessment. The patient is hemodynamically stable. The nurse is preparing to explain the next diagnostic step.',
    [
      'Elevated D-dimer',
      'Recent surgery',
      'Clinical probability not yet completed',
      'Current hemodynamic stability',
    ],
    'Which explanation best describes what the result establishes?',
    [
      yes(
        'The result needs interpretation within the clinical pathway and does not confirm PE by itself.',
        'D-dimer can be elevated for several reasons, including after surgery. Clinical probability and appropriate imaging determine the next diagnostic step.',
        [0, 1, 2, 3]
      ),
      no(
        'The positive result confirms PE and removes the need for imaging assessment.',
        'A positive D-dimer is not specific enough to confirm PE.',
        'The test is commonly associated with clot investigation.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'The surgical history makes the result irrelevant and excludes a thromboembolic cause.',
        'Surgery can both elevate D-dimer and increase thromboembolic risk; it does not make the whole assessment irrelevant.',
        'A known cause of a false-positive result seems to explain the test.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'The stable pressure supports postponing review unless breathlessness worsens.',
        'Hemodynamic stability does not remove the need to complete an appropriate PE assessment.',
        'Unstable circulation is a familiar marker of severe PE.',
        'misprioritization',
        [0, 2, 3]
      ),
    ],
    [
      'Distinguish a nonspecific positive test from diagnostic confirmation.',
      'Integrate the test with pretest context and the next pathway step.',
    ],
    'A positive test can justify the next assessment without proving the diagnosis. Know what question the test can and cannot answer.'
  ),
  leg(
    'leg-c4',
    'challenge',
    'Symptoms despite prophylaxis',
    'A postoperative patient has received every prescribed prophylactic anticoagulant dose. On the fourth day they develop unilateral calf swelling. The leg was symmetric yesterday. The patient says the injections should prevent a clot. The nurse is preparing the focused assessment.',
    [
      'Postoperative reduced mobility',
      'Prophylactic doses administered',
      'New unilateral calf swelling since yesterday',
      'Patient believes prophylaxis excludes clot',
    ],
    'Which response best guides care?',
    [
      yes(
        'Explain that prophylaxis lowers risk but the new unilateral symptoms still require assessment.',
        'Preventive treatment does not eliminate risk; a new compatible symptom pattern needs clinical evaluation.',
        [0, 1, 2, 3]
      ),
      no(
        'Use complete prophylaxis records to classify the swelling as ordinary postoperative edema.',
        'The medication record does not establish the cause of new unilateral swelling.',
        'The preventive regimen was correctly followed.',
        'premature_closure',
        [1, 2]
      ),
      no(
        'Treat the new swelling as evidence that prophylaxis doses were administered incorrectly.',
        'A clot can occur despite appropriate prophylaxis; the symptom does not prove an administration error.',
        'Preventive treatment is often misunderstood as a guarantee.',
        'cue_misinterpretation',
        [1, 2, 3]
      ),
      no(
        'Repeat both calf measurements tomorrow before communicating the new asymmetry.',
        'Documenting measurements is useful, but waiting a day delays assessment of a new focal finding.',
        'A repeat measurement may distinguish true change from variation.',
        'misprioritization',
        [0, 2]
      ),
    ],
    [
      'Distinguish reduced risk from zero risk.',
      'Act on a new symptom despite a completed preventive plan.',
    ],
    'Prevention changes probability; it does not remove the need to assess a new compatible problem.'
  ),
  leg(
    'leg-c5',
    'challenge',
    'A bleeding trajectory during anticoagulation',
    'A patient taking anticoagulation for PE becomes dizzy while sitting up. Over several hours the pulse has risen and pressure has fallen from baseline. New flank pain is reported. There is no visible external bleeding. The nurse is preparing an urgent review.',
    [
      'Current anticoagulation for PE',
      'Rising pulse and falling pressure over hours',
      'Positional dizziness',
      'New flank pain without visible bleeding',
    ],
    'Which possibility should be highlighted alongside the known PE?',
    [
      yes(
        'Possible concealed bleeding with circulatory compromise',
        'Anticoagulation, flank pain and worsening perfusion raise concern for internal bleeding even without external blood loss.',
        [0, 1, 2, 3]
      ),
      no(
        'Improving PE with expected positional intolerance',
        'The worsening circulatory trend is not an established recovery pattern and requires urgent reassessment.',
        'Patients can feel weak during recovery.',
        'premature_closure',
        [1, 2, 3]
      ),
      no(
        'A recurrent clot as the established cause of every new symptom',
        'Recurrence is a consideration, but treatment-related bleeding is a credible competing explanation that must not be missed.',
        'The original diagnosis provides an available explanation.',
        'outdated_data',
        [0, 1, 3]
      ),
      no(
        'A minor musculoskeletal pain problem because no bleeding is visible',
        'Visible bleeding is not required for significant concealed loss.',
        'Flank discomfort can be musculoskeletal.',
        'cue_misinterpretation',
        [0, 1, 2, 3]
      ),
    ],
    [
      'Integrate treatment exposure with signs of possible concealed loss.',
      'Broaden the differential beyond the original diagnosis.',
    ],
    'A new decline during treatment may be caused by the illness, the treatment or another process. Include concealed harm in the assessment.'
  ),
  leg(
    'leg-a1',
    'advanced',
    'Suspected PE with competing bleeding risk',
    'A patient has sudden dyspnea, pleuritic pain and a newly swollen calf after recent major surgery. Clinical assessment indicates a high probability of PE. Imaging is delayed and interim therapeutic anticoagulation is being considered. The surgical drain has become more bloody and hemoglobin has fallen from the morning value. Pressure is currently maintained. The nurse is reviewing the proposed next dose with the team.',
    [
      'High-probability PE presentation',
      'Recent major surgery',
      'Imaging delay',
      'New bloody drain output',
      'Falling hemoglobin',
      'Maintained pressure with interim treatment under consideration',
    ],
    'Which plan best addresses both time-sensitive risks?',
    [
      yes(
        'Seek urgent senior review of the new bleeding evidence while coordinating prompt PE assessment and a monitored treatment decision.',
        'Interim treatment may be indicated in a PE pathway, but new active-bleeding evidence materially changes the benefit–risk decision. The nurse should urgently communicate both risks rather than automatically give or indefinitely withhold treatment.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Give the proposed therapeutic dose using the PE probability alone and review the drain after imaging.',
        'This does not incorporate new evidence that may represent an important treatment contraindication or hazard.',
        'Delayed imaging in likely PE can justify interim treatment.',
        'misprioritization',
        [0, 2, 3, 4]
      ),
      no(
        'Treat the bleeding as the confirmed cause of dyspnea and cancel the PE diagnostic pathway.',
        'Bleeding is a serious competing problem but does not exclude PE in this high-risk presentation.',
        'Blood loss can cause tachycardia and breathlessness.',
        'premature_closure',
        [0, 3, 4]
      ),
      no(
        'Wait for pressure to fall before revisiting the interim anticoagulation plan.',
        'Active bleeding evidence can matter before hypotension develops; maintained pressure is not a sufficient safety endpoint.',
        'Hemodynamic stability may look like tolerance of the current situation.',
        'cue_misinterpretation',
        [3, 4, 5]
      ),
    ],
    [
      'Integrate thrombotic probability with newly changed bleeding risk.',
      'Escalate a time-sensitive treatment decision without independently assuming either diagnosis.',
    ],
    'Advanced reasoning recognizes when a pathway needs an individualized risk decision. Communicate the evidence that changes the balance and preserve urgency for both possible harms.',
    {
      conflict:
        'Likely PE favors timely anticoagulation, while new postoperative bleeding evidence may make that treatment hazardous.',
      anticipation:
        'Monitor for worsening oxygenation or circulation and expedite diagnostic and specialist decisions rather than allowing either risk to wait unreviewed.',
      uncertainty:
        'The scenario does not establish the bleeding source or the safest anticoagulant strategy; that decision requires senior assessment.',
    }
  ),
  leg(
    'leg-a2',
    'advanced',
    'New dyspnea with renal change during treatment',
    'A patient taking an anticoagulant for DVT develops new dyspnea and weakness. There is no new pleuritic pain, but hemoglobin has fallen and stool is dark. Kidney function has deteriorated during an acute illness. The patient says every dose was taken. Pulse is rising while pressure is still near baseline. The nurse is preparing a medication and deterioration review.',
    [
      'New dyspnea and weakness during anticoagulation',
      'Falling hemoglobin',
      'Dark stool',
      'Deteriorating kidney function',
      'Reported adherence',
      'Rising pulse with preserved pressure',
    ],
    'Which review best avoids assuming treatment failure?',
    [
      yes(
        'Assess possible bleeding and current drug exposure while evaluating other causes of dyspnea, including recurrent thromboembolism.',
        'The anemia and stool change support possible bleeding, and renal change may affect the safety of some anticoagulants. Dyspnea still needs a current cardiopulmonary assessment rather than an automatic recurrence label or a single-cause assumption.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Interpret dyspnea as recurrent PE and request stronger anticoagulation before reviewing the hemoglobin trend.',
        'This risks worsening a possible bleed and fails to integrate the new anemia, stool and renal findings.',
        'Dyspnea in a patient with a clot history strongly suggests recurrence.',
        'premature_closure',
        [0, 1, 2, 3]
      ),
      no(
        'Use complete adherence to exclude recurrence and assess gastrointestinal bleeding as the sole problem.',
        'Adherence does not exclude recurrence, and the cause of dyspnea is not established solely by the stool history.',
        'The bleeding evidence offers a coherent alternative explanation.',
        'cue_misinterpretation',
        [0, 1, 2, 4]
      ),
      no(
        'Continue the original anticoagulant plan because the initial kidney function supported the prescription.',
        'The current renal and bleeding findings may change treatment safety; an older baseline cannot establish present suitability.',
        'The treatment was appropriately selected at diagnosis.',
        'outdated_data',
        [1, 2, 3, 5]
      ),
    ],
    [
      'Interpret dyspnea using both disease and treatment-harm hypotheses.',
      'Reassess medication safety when organ function changes.',
    ],
    'Do not let a recurrent symptom automatically trigger more of the original treatment. Reassess what has changed in the patient and the regimen.',
    {
      conflict:
        'A clot history makes recurrence plausible, while anemia, dark stool and renal decline make treatment-related harm a competing concern.',
      anticipation:
        'Escalate worsening circulation or breathing and support urgent review of the exact drug, timing and current organ function.',
      uncertainty:
        'The actual bleeding source, drug exposure and presence of recurrent PE are not established by these observations.',
    }
  ),
  leg(
    'leg-a3',
    'advanced',
    'Escalating support despite a maintained pressure',
    'A patient with confirmed PE has a systolic pressure above 100 mmHg. Over an hour they become more tachycardic and require more oxygen. They are now cool and intermittently confused, with less urine output. The first assessment had categorized them as stable. The patient is taking a beta blocker at home. The nurse is deciding whether the care level remains appropriate.',
    [
      'Confirmed PE',
      'Maintained systolic pressure',
      'Increasing tachycardia and oxygen requirement',
      'New coolness and confusion',
      'Falling urine output',
      'Earlier stable classification and beta-blocker history',
    ],
    'Which evaluation best guides the next care-level decision?',
    [
      yes(
        'Escalate possible worsening cardiopulmonary compromise using perfusion and support trends, rather than waiting for hypotension.',
        'New organ hypoperfusion and escalating oxygen needs indicate a changed trajectory despite maintained pressure. The previous risk assessment must be revisited by the team.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Keep the current care level until systolic pressure crosses the local hypotension threshold.',
        'A single pressure threshold should not override new cognitive, renal and respiratory deterioration.',
        'Hypotension is central to high-risk PE classifications.',
        'cue_misinterpretation',
        [1, 2, 3, 4]
      ),
      no(
        'Use the original stable classification to focus the review on anxiety and comfort measures.',
        'The initial classification does not define the current state after several functions worsen.',
        'The patient was assessed and found stable earlier.',
        'outdated_data',
        [2, 3, 4, 5]
      ),
      no(
        'Increase oxygen support and use the next saturation value as the principal measure of recovery.',
        'Supported oxygenation alone does not evaluate perfusion, right-heart strain or overall clinical trajectory.',
        'Oxygen is the most visible increasing treatment requirement.',
        'misprioritization',
        [2, 3, 4]
      ),
    ],
    [
      'Recognize deteriorating perfusion despite maintained pressure.',
      'Reassess a previous risk category using current support needs and organ function.',
    ],
    'Risk classification is time dependent. Escalate a changing patient rather than waiting for the final familiar sign of collapse.',
    {
      conflict:
        'Maintained pressure and an earlier stable label conflict with worsening oxygen needs and organ-perfusion findings.',
      anticipation:
        'Prepare for further circulatory or respiratory deterioration and urgent reassessment of monitoring and treatment options.',
      uncertainty:
        'The mechanism and severity of right-heart compromise require clinical evaluation; these observations do not specify a definitive rescue treatment.',
    }
  ),
  leg(
    'leg-a4',
    'advanced',
    'A negative chest study with persistent leg findings',
    'A patient is investigated for dyspnea and a swollen calf. Chest imaging does not identify PE. The calf remains newly tender and larger than the opposite side. The patient has a recent immobility history and no established alternative cause of the leg change. Interim treatment was started while imaging was pending. The nurse is clarifying the next diagnostic and medication plan.',
    [
      'No PE identified on chest imaging',
      'Persistent new unilateral calf swelling',
      'Ongoing calf tenderness',
      'Recent immobility',
      'No established alternative leg diagnosis',
      'Interim treatment began before imaging',
    ],
    'Which clarification best addresses the remaining diagnostic question?',
    [
      yes(
        'Ask whether leg-vein imaging is indicated for the persistent DVT suspicion and clarify treatment after review of both questions.',
        'A negative PE study does not exclude DVT. The persistent leg findings need their own pathway assessment, with treatment decisions based on the completed evaluation and any other indication for anticoagulation.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use the negative chest study to close both the PE and DVT assessments and stop further leg investigation.',
        'The chest study does not answer whether a leg-vein thrombosis is present.',
        'Both suspected conditions are parts of the same thromboembolic process.',
        'cue_misinterpretation',
        [0, 1, 2, 3]
      ),
      no(
        'Treat the persistent calf findings as confirmation of DVT and continue the interim regimen without diagnostic review.',
        'The findings warrant assessment but are not diagnostic by themselves.',
        'The symptoms and risk history form a convincing pattern.',
        'premature_closure',
        [1, 2, 3, 4, 5]
      ),
      no(
        'Repeat chest imaging before investigating the leg because dyspnea prompted the initial referral.',
        'The remaining focal leg question can require its own assessment; repeating a completed study is not automatically the best next step.',
        'The chest symptoms were the most alarming initial feature.',
        'misprioritization',
        [0, 1, 2, 4]
      ),
    ],
    [
      'Separate the diagnostic questions answered by chest and leg imaging.',
      'Plan follow-up and treatment review for the unresolved hypothesis.',
    ],
    'A negative study closes only the question it can answer. Identify the residual hypothesis before ending the diagnostic pathway.',
    {
      conflict:
        'The negative chest result is reassuring for PE, but persistent focal leg findings leave a separate thrombotic question unresolved.',
      anticipation:
        'Provide clear return advice for new chest symptoms and ensure the leg assessment and interim-treatment decision are explicitly completed.',
      uncertainty:
        'The calf findings do not confirm DVT, and the final treatment plan depends on the clinical and imaging assessment.',
    }
  ),
  leg(
    'leg-a5',
    'advanced',
    'Possible recurrence on anticoagulation',
    'A patient returns with new unilateral leg symptoms after several weeks of anticoagulation. They report taking the tablets, but the refill record suggests a possible gap. A new interacting medicine was prescribed recently. Kidney function and weight have changed since the initial prescription. The symptoms resemble the original event, but no new imaging has been obtained. The patient asks whether the drug has failed.',
    [
      'New leg symptoms during anticoagulation',
      'Reported adherence with a possible refill gap',
      'Recently added interacting medicine',
      'Changed kidney function',
      'Changed weight since prescription',
      'No new diagnostic confirmation',
    ],
    'Which review best evaluates apparent treatment failure?',
    [
      yes(
        'Verify recurrence and review adherence, the exact regimen, interactions and current patient factors before selecting a treatment change.',
        'Symptoms need diagnostic assessment, while apparent failure may reflect exposure, adherence, interactions or a changed clinical context. A coordinated review should determine whether recurrence is present and why before labeling drug failure.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Label the medicine ineffective and request a stronger regimen based on symptom similarity alone.',
        'Similar symptoms do not establish recurrence or identify the reason for inadequate protection, and empiric escalation can increase harm.',
        'A repeat symptom pattern suggests that the original treatment did not work.',
        'premature_closure',
        [0, 1, 2, 5]
      ),
      no(
        'Use the patient’s reported adherence to exclude exposure problems and focus on a new thrombophilia diagnosis.',
        'The refill discrepancy, interactions and changed patient factors still require review; reported adherence is important but not the whole exposure assessment.',
        'The patient confidently describes taking the medicine.',
        'cue_misinterpretation',
        [1, 2, 3, 4]
      ),
      no(
        'Retain the initial regimen because its dose was appropriate when treatment began.',
        'Suitability at initiation does not resolve current exposure or changed kidney function, weight and interacting treatment.',
        'The original prescription was clinically checked.',
        'outdated_data',
        [2, 3, 4, 5]
      ),
    ],
    [
      'Distinguish suspected recurrence from confirmed treatment failure.',
      'Evaluate modifiable exposure and patient factors before selecting a new strategy.',
    ],
    'Treatment failure is a conclusion requiring evidence. Confirm the event and investigate the regimen and current patient before assigning that label.',
    {
      conflict:
        'Reported adherence suggests adequate treatment, while refill, interaction and physiological changes make actual exposure uncertain.',
      anticipation:
        'Arrange prompt diagnostic review and a clear interim plan for symptom escalation while the team assesses thrombosis and bleeding risks.',
      uncertainty:
        'Neither recurrent thrombosis nor drug failure is established from symptoms and the reported history alone.',
    }
  ),
]

const abdomenTurn: QuestionDraftV2[] = [
  abdomen(
    'abdomen-f1',
    'foundation',
    'Pain that changes location',
    'A patient reports abdominal pain that began around the umbilicus. It is now concentrated in the right lower quadrant. The nurse is taking the initial history. The patient can point to the present location.',
    [
      'Pain began around the umbilicus',
      'Pain is now in the right lower quadrant',
    ],
    'Which history detail is most important to preserve in the handover?',
    [
      yes(
        'The migration from central to right lower abdominal pain',
        'The change in location is a useful diagnostic cue and should be preserved with its timing rather than reduced to a single current site.',
        [0, 1]
      ),
      no(
        'The current location without the earlier pain history',
        'This loses the migration pattern, which can contribute to assessment of an evolving abdominal process.',
        'The current examination usually focuses on where pain is now.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'The ability to identify a location as evidence of a mild condition',
        'Localizing pain does not establish mild severity or exclude an acute process.',
        'A coherent specific account may appear reassuring.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'The initial central pain as evidence of a resolved gastrointestinal upset',
        'The later focal pain is part of the same evolving history and should not be disconnected from the onset.',
        'Central pain can accompany common benign gastrointestinal illness.',
        'premature_closure',
        [0, 1]
      ),
    ],
    ['Recognize a clinically useful change in pain distribution.'],
    'Preserve the sequence of an evolving symptom. A current pain location and the path to that location can carry different information.'
  ),
  abdomen(
    'abdomen-f2',
    'foundation',
    'Guarding during abdominal assessment',
    'A patient with abdominal pain lies very still. The abdomen tightens involuntarily during gentle examination. The nurse is completing a focused assessment. A clinician is available for review.',
    ['Avoidance of movement', 'Involuntary abdominal guarding'],
    'Which finding should the nurse highlight as a red flag?',
    [
      yes(
        'The involuntary guarding during gentle assessment',
        'Guarding can indicate peritoneal irritation and warrants prompt clinical assessment in this context.',
        [0, 1]
      ),
      no(
        'The patient’s ability to remain still for examination',
        'Remaining still may be a response to pain with movement rather than evidence of a mild process.',
        'Cooperation can be mistaken for clinical stability.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'The need for a complete bowel-history questionnaire before review',
        'History is useful, but completing a routine questionnaire should not delay communication of a red flag.',
        'A thorough history is part of abdominal assessment.',
        'misprioritization',
        [1]
      ),
      no(
        'The absence of a confirmed diagnosis as a reason to observe routinely',
        'A red flag warrants assessment before diagnostic certainty is available.',
        'Nonspecific pain often resolves without intervention.',
        'premature_closure',
        [0, 1]
      ),
    ],
    ['Identify a concerning abdominal examination finding.'],
    'Communicate red flags directly. A definitive diagnostic label is not required before requesting a focused review.'
  ),
  abdomen(
    'abdomen-f3',
    'foundation',
    'Syncope with abdominal pain',
    'An adult has sudden abdominal pain. They briefly lose consciousness while seated. The nurse is present and the patient is now responding. Emergency assessment equipment is nearby.',
    ['Sudden abdominal pain', 'Brief loss of consciousness'],
    'Which assessment priority follows from this combination?',
    [
      yes(
        'Prompt airway, breathing and circulation assessment with urgent assistance',
        'Syncope with acute abdominal pain can indicate a serious circulatory or other emergency and requires immediate physiologic assessment.',
        [0, 1]
      ),
      no(
        'Detailed food history before repeating observations',
        'A food history does not address the immediate risk associated with syncope.',
        'Abdominal pain is often linked to eating.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Routine constipation assessment after the patient rests',
        'Constipation cannot be assumed to explain sudden pain with loss of consciousness.',
        'Constipation is a common abdominal complaint.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'A standing blood-pressure assessment as the first bedside step',
        'Provoking an upright response is not the priority before assessing a recently syncopal patient with acute pain.',
        'Syncope may be related to postural pressure changes.',
        'cue_misinterpretation',
        [0, 1]
      ),
    ],
    ['Recognize an immediate physiologic risk from symptom combination.'],
    'Assess the unstable event first. A detailed abdominal history follows urgent evaluation of airway, breathing and circulation.'
  ),
  abdomen(
    'abdomen-f4',
    'foundation',
    'Relevant pregnancy history',
    'An adult of reproductive potential has new lower abdominal pain. The last menstrual period is not recorded. The patient is able to answer privately. The nurse is preparing the initial assessment.',
    [
      'New lower abdominal pain',
      'Pregnancy status and menstrual history are undocumented',
    ],
    'Which history should the nurse clarify promptly?',
    [
      yes(
        'The last menstrual period and possibility of pregnancy',
        'Pregnancy-related causes can change urgency, diagnostic choices and treatment; a private relevant history is important.',
        [0, 1]
      ),
      no(
        'The patient’s preferred pain medicine as the principal missing history',
        'Pain preferences matter, but they do not replace clarifying a potentially important diagnostic context.',
        'Pain relief is an immediate patient concern.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'The absence of pregnancy information as evidence that pregnancy is unlikely',
        'An undocumented history is missing information, not a negative finding.',
        'Prior clinicians may be assumed to have checked the history.',
        'outdated_data',
        [1]
      ),
      no(
        'The patient’s age as sufficient evidence to assign a gastrointestinal cause',
        'Age alone does not determine the cause or exclude pregnancy-related disease.',
        'Common gastrointestinal causes are available explanations.',
        'premature_closure',
        [0, 1]
      ),
    ],
    ['Identify a missing history that changes the assessment pathway.'],
    'Missing information is not reassurance. Ask privately about relevant reproductive history rather than inferring it from the record.'
  ),
  abdomen(
    'abdomen-f5',
    'foundation',
    'Analgesia during diagnostic assessment',
    'A patient has severe abdominal pain and prescribed analgesia is available. The diagnosis has not yet been confirmed. The nurse has documented initial observations and a pain assessment. A repeat assessment is planned after treatment.',
    [
      'Severe pain with prescribed analgesia',
      'Diagnosis remains under assessment',
      'Baseline and repeat assessment are available',
    ],
    'Which approach best supports both comfort and clinical assessment?',
    [
      yes(
        'Give the prescribed analgesia with appropriate monitoring and continue reassessment.',
        'Appropriate analgesia can be provided during assessment; monitoring and repeat examination help evaluate response and evolving findings.',
        [0, 1, 2]
      ),
      no(
        'Withhold analgesia until the exact diagnosis is documented.',
        'A diagnosis is not a universal prerequisite for appropriate pain treatment during acute abdominal assessment.',
        'There is a traditional concern that analgesia masks the diagnosis.',
        'outdated_data',
        [0, 1]
      ),
      no(
        'Use the pain score after treatment as the sole diagnostic test.',
        'Pain response cannot establish or exclude a specific abdominal cause.',
        'A response to analgesia is easy to measure.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'Give the medicine and omit the repeat abdominal assessment if pain improves.',
        'Symptom improvement does not replace monitoring for evolving findings or treatment effects.',
        'A lower score appears to demonstrate successful care.',
        'premature_closure',
        [0, 2]
      ),
    ],
    [
      'Recognize that pain relief and ongoing diagnostic assessment can coexist.',
    ],
    'Treat pain within scope while preserving serial assessment. Relief does not end the diagnostic process.'
  ),
  abdomen(
    'abdomen-c1',
    'challenge',
    'Brief relief followed by generalized pain',
    'A patient awaiting review for focal right lower abdominal pain suddenly reports relief. Within an hour, pain returns across the whole abdomen and movement becomes very painful. The pulse has risen from the earlier baseline. No new analgesia was given. The nurse is evaluating the apparent improvement.',
    [
      'Initial focal right lower pain',
      'Brief spontaneous relief without analgesia',
      'New generalized movement-sensitive pain',
      'Rising pulse over the interval',
    ],
    'Which action best responds to this sequence?',
    [
      yes(
        'Escalate the new generalized findings and request prompt reassessment for a complication.',
        'Brief relief followed by more generalized pain and a worsening vital sign can indicate progression rather than recovery.',
        [0, 1, 2, 3]
      ),
      no(
        'Record spontaneous resolution as the main outcome and review pain at the next routine round.',
        'The later generalized pain and pulse trend contradict sustained resolution.',
        'The patient initially described a clear improvement.',
        'outdated_data',
        [1, 2, 3]
      ),
      no(
        'Attribute the diffuse pain to anxiety about the original focal diagnosis.',
        'Anxiety does not adequately explain the evolving distribution and physiological change without reassessment.',
        'A pending surgical review may be stressful.',
        'premature_closure',
        [0, 2, 3]
      ),
      no(
        'Use the absence of additional analgesia to conclude that the underlying process is settling.',
        'The lack of medication explains why relief was spontaneous, but does not establish the cause or negate subsequent deterioration.',
        'Spontaneous relief can appear more convincing than medication-related relief.',
        'cue_misinterpretation',
        [1, 2, 3]
      ),
    ],
    [
      'Interpret a sequence rather than selecting its most reassuring moment.',
      'Prioritize new generalized and systemic changes.',
    ],
    'A symptom can briefly improve during disease progression. The full time sequence determines whether relief is reassuring.'
  ),
  abdomen(
    'abdomen-c2',
    'challenge',
    'A changing examination after analgesia',
    'An adult has received prescribed analgesia for abdominal pain. Their pain score falls, but guarding is more pronounced on the next examination. Pulse has risen and the patient feels faint when sitting up. The earlier examination was less focal. The nurse is deciding whether to request another review.',
    [
      'Lower pain after analgesia',
      'Increasing guarding on serial examination',
      'Rising pulse with positional faintness',
      'Earlier examination was less focal',
    ],
    'Which assessment should guide the next decision?',
    [
      yes(
        'The worsening examination and perfusion-related trend despite pain relief.',
        'Analgesia can reduce pain while the underlying process evolves. New guarding and circulatory symptoms warrant review.',
        [0, 1, 2, 3]
      ),
      no(
        'The lower pain score as the main evidence that observation remains sufficient.',
        'A symptom response cannot outweigh new objective and functional changes.',
        'Pain was the original reason for treatment.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'The earlier less focal examination as the best indicator of current risk.',
        'Serial assessment is valuable because the examination can change; earlier findings do not establish present safety.',
        'The original assessment may have been performed by a senior clinician.',
        'outdated_data',
        [1, 2, 3]
      ),
      no(
        'The sitting-related faintness as a separate issue to review after the abdominal work-up.',
        'The new perfusion-related symptom should be integrated into the current abdominal assessment.',
        'Postural symptoms can have benign causes.',
        'premature_closure',
        [1, 2]
      ),
    ],
    [
      'Integrate serial examination with current functional and vital-sign changes.',
      'Distinguish analgesic effect from disease response.',
    ],
    'Use a current examination after pain treatment. The purpose is to improve comfort while continuing to detect meaningful change.'
  ),
  abdomen(
    'abdomen-c3',
    'challenge',
    'An early reassuring blood result',
    'A patient has worsening right lower abdominal pain over six hours. New guarding is present and appetite has fallen. The first white cell count was within range. The patient has not developed a fever. The nurse is preparing an updated clinical review.',
    [
      'Progressive focal pain over six hours',
      'New guarding',
      'Reduced appetite',
      'Initial white cell count within range and no fever',
    ],
    'Which interpretation best supports the next assessment?',
    [
      yes(
        'The evolving examination still needs review despite the initial blood count and absent fever.',
        'A single normal blood count and absence of fever do not exclude an acute abdominal process when focal findings progress.',
        [0, 1, 2, 3]
      ),
      no(
        'The normal blood count makes the new guarding most consistent with muscle tension.',
        'The test does not establish the cause of the guarding or exclude an evolving intra-abdominal problem.',
        'A reassuring laboratory result can make a noninflammatory explanation attractive.',
        'cue_misinterpretation',
        [0, 1, 3]
      ),
      no(
        'The absence of fever supports postponing review until a repeat blood count is abnormal.',
        'Waiting for another sign can delay care despite a progressively concerning examination.',
        'Fever and leukocytosis are familiar infection indicators.',
        'misprioritization',
        [0, 1, 3]
      ),
      no(
        'The initial test result should define the working diagnosis through the current observation period.',
        'An earlier test does not override new clinical evidence.',
        'The original assessment established an observation plan.',
        'outdated_data',
        [0, 1, 3]
      ),
    ],
    [
      'Recognize the limitations of early negative findings.',
      'Give appropriate weight to a progressive physical examination.',
    ],
    'A reassuring test has a time and a scope. Reassess when the clinical question changes.'
  ),
  abdomen(
    'abdomen-c4',
    'challenge',
    'Epigastric discomfort with an exertional pattern',
    'An older patient reports epigastric discomfort that began while climbing stairs. They are nauseated and sweaty, and the discomfort persists at rest. They describe it as indigestion. No diagnostic assessment has been completed. The nurse is selecting the first pathway for review.',
    [
      'Exertional onset of epigastric discomfort',
      'Persistence at rest',
      'Nausea and diaphoresis',
      'An indigestion description without diagnostic assessment',
    ],
    'Which evaluation should be prioritized?',
    [
      yes(
        'Prompt assessment for a possible acute coronary syndrome, including an ECG.',
        'Epigastric discomfort with an exertional pattern and autonomic symptoms can be an ischemic presentation and needs timely cardiac assessment.',
        [0, 1, 2, 3]
      ),
      no(
        'A food-intolerance review before considering a cardiac cause.',
        'The exertional and autonomic pattern makes a cardiac assessment more urgent than routine dietary exploration.',
        'The patient calls the symptom indigestion.',
        'misprioritization',
        [0, 1, 2, 3]
      ),
      no(
        'An antacid response as the deciding test for whether an ECG is needed.',
        'Symptom response to an antacid cannot reliably exclude myocardial ischemia.',
        'A familiar gastrointestinal treatment may seem diagnostically useful.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'A gastrointestinal working diagnosis based on the abdominal location.',
        'Pain location alone does not establish the affected system.',
        'Epigastric symptoms commonly have gastrointestinal causes.',
        'premature_closure',
        [0, 1, 2, 3]
      ),
    ],
    [
      'Integrate onset and associated symptoms rather than relying on location alone.',
      'Select the time-sensitive assessment pathway.',
    ],
    'An anatomical description is not a diagnosis. Use the pattern and context to consider serious causes outside the obvious organ system.'
  ),
  abdomen(
    'abdomen-c5',
    'challenge',
    'A return visit after an uncertain diagnosis',
    'A patient returns twelve hours after discharge with an uncertain abdominal diagnosis. Pain is now localized, vomiting has continued and they cannot keep fluids down. The earlier examination and observations were reassuring. The discharge advice said to return for worsening symptoms. The nurse is receiving the patient.',
    [
      'Return within twelve hours',
      'New localization of pain',
      'Persistent vomiting with failed oral fluids',
      'Earlier reassuring examination',
      'Explicit return advice for worsening symptoms',
    ],
    'Which approach best uses the prior visit?',
    [
      yes(
        'Reassess the current presentation and compare the new findings with the previous examination.',
        'A return with worsening or changed symptoms requires a fresh assessment; the earlier visit supplies a comparison, not a guarantee of safety.',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Use the earlier reassuring assessment to continue the original home-care plan unchanged.',
        'The current symptoms are the very changes that warranted return and require reassessment.',
        'A recent complete assessment may feel sufficient.',
        'outdated_data',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Treat the return as evidence of anxiety about an already excluded condition.',
        'An uncertain diagnosis and a changed trajectory do not support that conclusion.',
        'Reattendance can be misread as reassurance seeking.',
        'premature_closure',
        [0, 1, 2, 3]
      ),
      no(
        'Repeat the original questionnaire before obtaining current observations.',
        'Repeating documentation should not delay current physiologic assessment and comparison of new symptoms.',
        'A consistent form can seem to ensure a thorough process.',
        'misprioritization',
        [0, 1, 2]
      ),
    ],
    [
      'Recognize that a return visit can represent an evolving illness.',
      'Use prior findings as a baseline for a new assessment.',
    ],
    'Safety-net advice works only if the return is treated as new evidence. Reassessment should ask what changed and what the earlier evaluation could not yet show.'
  ),
  abdomen(
    'abdomen-a1',
    'advanced',
    'Apparent pain improvement with worsening circulation',
    'A patient under observation for suspected appendicitis reports less focal pain after a period of severe discomfort. The abdomen is now diffusely tender and movement is very painful. Pulse rises to 124 and pressure falls compared with admission. The patient is newly confused and urine output has declined. No extra analgesia was given. The last plan was routine serial observation.',
    [
      'Spontaneous reduction in focal pain',
      'New diffuse movement-sensitive tenderness',
      'Rising pulse',
      'Falling pressure',
      'New confusion and low output',
      'Earlier routine observation plan',
    ],
    'Which plan best evaluates the changed situation?',
    [
      yes(
        'Escalate systemic deterioration and request urgent abdominal reassessment for a complication while supporting circulation.',
        'The new diffuse examination and perfusion/organ changes outweigh the apparently improved focal pain. A complication or another acute cause requires urgent reassessment rather than continuation of routine observation.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use the spontaneous pain reduction to continue observation and repeat the abdominal examination at the planned interval.',
        'The later examination and systemic deterioration contradict a simple recovery interpretation.',
        'Spontaneous improvement can seem stronger evidence than medication-related relief.',
        'outdated_data',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Attribute the circulatory changes to poor intake and replace fluids before reconsidering the abdominal diagnosis.',
        'Poor intake may contribute, but it does not explain the new diffuse examination; stabilization and diagnostic reassessment should proceed together.',
        'Vomiting and reduced intake commonly cause hypovolemia.',
        'premature_closure',
        [1, 2, 3, 4]
      ),
      no(
        'Prioritize repeat inflammatory blood tests and use their trend to decide whether surgical review is needed.',
        'New clinical deterioration already justifies urgent review and should not wait for another laboratory threshold.',
        'Inflammatory markers offer objective evidence of progression.',
        'misprioritization',
        [1, 2, 3, 4]
      ),
    ],
    [
      'Interpret transient pain relief within the complete clinical sequence.',
      'Combine new abdominal and organ-perfusion findings to change urgency.',
    ],
    'The meaning of pain relief depends on the accompanying trajectory. A deteriorating examination and organ function require escalation even when one symptom briefly improves.',
    {
      conflict:
        'Less focal pain appears favorable while diffuse tenderness, circulation and cognition worsen.',
      anticipation:
        'Prepare for further shock and support timely evaluation of possible perforation or another complication requiring source control.',
      uncertainty:
        'The complication and source are not confirmed; the current findings establish urgency rather than a definitive diagnosis.',
    }
  ),
  abdomen(
    'abdomen-a2',
    'advanced',
    'Lower abdominal pain with uncertain pregnancy status',
    'An adult of reproductive potential has unilateral lower abdominal pain and light vaginal bleeding. Their period is late, but they use contraception and a home pregnancy test was negative several days ago. They now feel faint and shoulder-tip discomfort has appeared. Pulse is rising, while resting pressure remains acceptable. No current pregnancy test or imaging has been performed. The nurse is preparing an urgent assessment.',
    [
      'Unilateral lower abdominal pain',
      'Light vaginal bleeding with a late period',
      'Contraception and an earlier negative home test',
      'New faintness and shoulder-tip discomfort',
      'Rising pulse with maintained resting pressure',
      'No current pregnancy assessment',
    ],
    'Which evaluation best addresses the immediate uncertainty?',
    [
      yes(
        'Request urgent assessment for a pregnancy-related or other bleeding emergency, including current testing and circulatory review.',
        'The symptom pattern requires urgent assessment despite contraception and an earlier negative home test. Current pregnancy status, possible internal bleeding and other causes must be evaluated without waiting for hypotension.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use contraception and the earlier home test to prioritize a routine menstrual-pain assessment.',
        'Neither establishes the current absence of pregnancy or explains the new perfusion-related symptoms.',
        'Two apparently reassuring pregnancy-related facts can seem conclusive.',
        'cue_misinterpretation',
        [1, 2, 3, 4]
      ),
      no(
        'Repeat the home test after another missed period before arranging imaging review.',
        'This delays assessment of a potentially time-sensitive bleeding presentation.',
        'An early home test can be negative and repeating it later seems logical.',
        'misprioritization',
        [0, 1, 3, 4, 5]
      ),
      no(
        'Treat the visible vaginal loss as the full explanation for the symptoms and measure pads before further escalation.',
        'Visible loss may not reflect internal bleeding and does not establish the cause of faintness or shoulder-tip pain.',
        'Quantifying external blood loss is a useful nursing task.',
        'premature_closure',
        [1, 3, 4]
      ),
    ],
    [
      'Interpret earlier negative information within its timing limitations.',
      'Integrate possible concealed loss and current symptoms to select urgent assessment.',
    ],
    'A historical negative test does not answer a changed acute question. Assess current risk and the limitations of the available evidence.',
    {
      conflict:
        'Contraception and an earlier negative home test appear reassuring, while current symptoms raise concern for a pregnancy-related bleeding emergency.',
      anticipation:
        'Prepare for circulatory decline and ensure urgent senior review while current testing clarifies the pathway.',
      uncertainty:
        'Pregnancy and the cause of bleeding are not established; other abdominal or gynecological causes remain possible.',
    }
  ),
  abdomen(
    'abdomen-a3',
    'advanced',
    'Flank pain and concealed bleeding risk',
    'An older adult taking an anticoagulant develops sudden flank and abdominal pain. They describe a previous kidney stone and say this feels similar. Over an hour they become pale and faint, with rising pulse and lower pressure. Hemoglobin is lower than the most recent baseline. There is no visible blood in stool or urine. The nurse is preparing the emergency handover.',
    [
      'Older patient on anticoagulation',
      'Sudden flank and abdominal pain',
      'A similar previous kidney-stone experience',
      'Worsening pallor and presyncope over an hour',
      'Rising pulse and falling pressure with lower hemoglobin',
      'No visible external bleeding',
    ],
    'Which assessment plan best avoids anchoring on the prior stone?',
    [
      yes(
        'Escalate possible concealed hemorrhage or another vascular emergency while evaluating renal and other abdominal causes.',
        'The worsening circulatory pattern and hemoglobin change require urgent evaluation for internal bleeding or another serious cause. A similar previous pain and absent visible blood do not settle the diagnosis.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use the familiar pain pattern to prioritize renal-colic treatment and review circulation after symptom control.',
        'A prior experience cannot account for the current perfusion and hemoglobin changes sufficiently to defer broader assessment.',
        'Patients may accurately recognize recurrent stone pain.',
        'premature_closure',
        [1, 2, 3, 4]
      ),
      no(
        'Use the absence of visible blood to lower bleeding concern and await routine renal imaging.',
        'Significant internal bleeding can occur without blood in stool or urine.',
        'Visible blood is an accessible marker of bleeding.',
        'cue_misinterpretation',
        [0, 3, 4, 5]
      ),
      no(
        'Repeat the hemoglobin before escalating because the older value may not be directly comparable.',
        'A repeat may be useful, but the acute circulatory deterioration already warrants urgent clinical review.',
        'Laboratory changes can reflect sampling or baseline differences.',
        'misprioritization',
        [3, 4, 5]
      ),
    ],
    [
      'Recognize that a familiar symptom pattern can coexist with new high-risk evidence.',
      'Prioritize concealed hemorrhage and vascular assessment while retaining alternatives.',
    ],
    'Ask whether the present findings fit the old diagnosis completely. New perfusion changes can require a different emergency pathway.',
    {
      conflict:
        'The patient’s familiar stone story conflicts with a new bleeding-risk context and progressive circulatory compromise.',
      anticipation:
        'Support urgent imaging and treatment decisions and monitor for further shock rather than provoking mobilization.',
      uncertainty:
        'The scenario does not identify a bleeding source or establish a vascular diagnosis; urgent assessment must distinguish the possibilities.',
    }
  ),
  abdomen(
    'abdomen-a4',
    'advanced',
    'Pain relief with inadequate ventilation',
    'An older patient receives prescribed opioid analgesia for acute abdominal pain. Pain decreases, but they become difficult to arouse and breathe shallowly at seven per minute. Saturation reads 98% on supplemental oxygen. A partner says they were fully awake before treatment. The abdominal examination still needs review. The nurse is deciding what to prioritize.',
    [
      'Recent opioid administration',
      'Pain relief',
      'New difficult arousal',
      'Shallow breathing at seven per minute',
      'Normal saturation on supplemental oxygen',
      'Previously awake with an unresolved abdominal diagnosis',
    ],
    'Which sequence best addresses the immediate risk while preserving the abdominal assessment?',
    [
      yes(
        'Support airway and ventilation, summon help and follow the local opioid-rescue pathway, then continue reassessment of the abdomen.',
        'Ventilatory impairment requires immediate support despite the normal saturation on oxygen. The medicine may contribute, but stabilizing breathing does not end the unresolved abdominal assessment.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Maintain the oxygen setting and wait for arousal because saturation is above the target.',
        'Oxygenation can remain normal during hypoventilation on supplemental oxygen; waiting risks further respiratory compromise.',
        'The displayed oxygen number appears normal.',
        'cue_misinterpretation',
        [2, 3, 4]
      ),
      no(
        'Complete the diagnostic abdominal examination first while the patient is less uncomfortable.',
        'The immediate ventilation problem takes priority over completing the diagnostic examination.',
        'Analgesia can improve cooperation with abdominal examination.',
        'misprioritization',
        [1, 2, 3, 5]
      ),
      no(
        'Classify the abdominal problem as improved and document the drowsiness as the expected treatment endpoint.',
        'Pain relief does not establish diagnostic recovery, and difficult arousal with bradypnea is not an acceptable endpoint to dismiss.',
        'Sedation can accompany opioid analgesia.',
        'premature_closure',
        [1, 2, 3, 5]
      ),
    ],
    [
      'Distinguish oxygenation from effective ventilation after analgesia.',
      'Sequence rescue care before continued diagnostic reassessment.',
    ],
    'A treatment can improve one symptom while creating an immediate risk. Evaluate arousal and breathing, not just pain and saturation.',
    {
      conflict:
        'Pain and displayed saturation look improved while consciousness and ventilation worsen.',
      anticipation:
        'Monitor for recurrent respiratory depression according to the rescue pathway and reassess the unresolved abdominal condition after stabilization.',
      uncertainty:
        'The opioid is a plausible contributor, but response to rescue does not establish the cause of the abdominal illness.',
    }
  ),
  abdomen(
    'abdomen-a5',
    'advanced',
    'A changing return presentation in an older adult',
    'An older adult returns a day after assessment for nonspecific abdominal pain. The earlier tests were not diagnostic and the patient initially tolerated fluids. Today pain is less prominent, but they are newly confused and cannot manage their usual walking distance. Intake has fallen and urine output is reduced. Temperature is not elevated, while pulse and respiratory rate have risen. Their relative says this behavior is unlike baseline.',
    [
      'Return after an uncertain diagnosis',
      'Less prominent pain',
      'New confusion and reduced walking function',
      'Poor intake and lower urine output',
      'No fever with rising pulse and respiratory rate',
      'Clear collateral change from baseline',
    ],
    'Which evaluation best addresses the current risk?',
    [
      yes(
        'Perform a new systemic and abdominal assessment, using functional and organ changes to guide urgency rather than pain intensity alone.',
        'Older adults may have less prominent pain or fever during serious illness. The new cognitive, functional, renal and vital-sign changes require reassessment of the abdomen and competing systemic causes.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use the lower pain intensity and absent fever to continue the previous home-care plan with extra fluids.',
        'These reassuring features do not negate the new organ and functional decline.',
        'Pain and fever are familiar indicators of an acute abdominal process.',
        'cue_misinterpretation',
        [1, 2, 3, 4]
      ),
      no(
        'Attribute the confusion to age and the recent hospital visit, then reassess when the patient is rested.',
        'A collateral-confirmed acute change should not be assigned to age or environment without assessment.',
        'Unfamiliar care settings can affect older adults.',
        'premature_closure',
        [0, 2, 5]
      ),
      no(
        'Repeat the earlier test panel and use diagnostic confirmation before changing the observation level.',
        'Current clinical deterioration can require escalation before a definitive test result.',
        'The previous visit did not identify a diagnosis.',
        'misprioritization',
        [0, 2, 3, 4, 5]
      ),
    ],
    [
      'Interpret less prominent classic symptoms in the context of new organ and functional decline.',
      'Reopen an uncertain diagnosis using current and collateral evidence.',
    ],
    'A return visit in an older adult may announce deterioration through function and cognition. Evaluate the current person rather than expecting a classic pain-and-fever pattern.',
    {
      conflict:
        'Less pain and no fever appear reassuring, while cognition, mobility, intake and organ-related observations deteriorate.',
      anticipation:
        'Escalate worsening consciousness, circulation or breathing and avoid an unsafe discharge based on symptom intensity alone.',
      uncertainty:
        'The observations do not establish an abdominal infection or another single cause; the differential remains broad.',
    }
  ),
]

const nutritionContext: QuestionDraftV2[] = [
  nutrition(
    'nutrition-f1',
    'foundation',
    'Unintentional weight change',
    'A patient says their clothes have become loose. They were not trying to lose weight. A current weight can be obtained today. The nurse is beginning nutrition screening.',
    [
      'Looser clothes without intended weight loss',
      'Current weight can be measured',
    ],
    'Which additional information is most useful for assessing the change?',
    [
      yes(
        'A reliable previous weight and the time over which the change occurred',
        'Nutrition screening needs the amount and timing of unintentional loss, not just a current measurement.',
        [0, 1]
      ),
      no(
        'The patient’s preferred clothing size as the main measure of nutritional status',
        'Clothing changes are a useful prompt but cannot quantify the amount and timing of weight loss.',
        'The patient first noticed the change through clothing.',
        'cue_misinterpretation',
        [0]
      ),
      no(
        'The current weight alone as sufficient evidence to rule out nutritional risk',
        'A current weight cannot show the trajectory or exclude significant recent loss.',
        'A measured number appears more objective than recalled change.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'A previous admission’s diet order before asking about the present weight change',
        'An old diet order does not establish the amount or timing of the current loss.',
        'Previous records can seem like a quick source of nutrition information.',
        'outdated_data',
        [0, 1]
      ),
    ],
    [
      'Identify the missing denominator and timing for a meaningful weight comparison.',
    ],
    'Screen nutritional trajectory, not just body size. A current measurement needs a reliable comparison and an interval.'
  ),
  nutrition(
    'nutrition-f2',
    'foundation',
    'Duration of reduced intake',
    'A patient reports eating very little. The record says poor appetite but gives no duration. The nurse is conducting a nutrition screen. The patient can describe their recent meals.',
    ['Very low reported intake', 'Duration is not documented'],
    'Which question most directly fills the missing screening information?',
    [
      yes(
        'For how many days have you eaten much less than usual?',
        'Duration of reduced intake helps identify nutritional risk and informs safe nutrition planning.',
        [0, 1]
      ),
      no(
        'Which food was your favorite before this illness began?',
        'Preferences can help tailor a plan, but they do not establish the duration of the current deficit.',
        'Preferred foods can encourage intake.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Does your current body size seem normal to you?',
        'Perceived body size does not quantify how long intake has been inadequate.',
        'Visible thinness is commonly associated with malnutrition.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Was your last hospital menu similar to the menu offered here?',
        'A past menu does not establish the duration of the present intake problem.',
        'Previous hospital experiences may affect appetite.',
        'outdated_data',
        [0, 1]
      ),
    ],
    ['Recognize the time dimension needed to assess a nutritional deficit.'],
    'A statement such as poor intake needs a duration and an estimate of what is actually being consumed.'
  ),
  nutrition(
    'nutrition-f3',
    'foundation',
    'Coughing during oral intake',
    'A patient coughs repeatedly when drinking water. Their voice becomes wet after swallowing. The nurse is present during the drink. A local swallowing-safety pathway is available.',
    ['Repeated coughing with water', 'Wet voice after swallowing'],
    'Which next step best addresses the immediate feeding concern?',
    [
      yes(
        'Pause the current drink and arrange assessment through the swallowing-safety pathway.',
        'These findings raise concern about swallowing safety. The current intake should be paused while appropriate assessment and a safe plan are arranged.',
        [0, 1]
      ),
      no(
        'Offer a larger volume to see whether the cough resolves after several swallows.',
        'A larger trial may increase risk and does not replace a swallowing assessment.',
        'A small sip may be mistaken for an unrepresentative test.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Record poor appetite and encourage completion of the drink before review.',
        'The immediate problem is swallowing safety rather than willingness to eat or drink.',
        'Low intake is a common nutrition concern.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'Use the previous normal diet order to continue the drink unchanged.',
        'A prior order does not establish current swallowing safety when new signs are present.',
        'The diet was previously authorized.',
        'outdated_data',
        [0, 1]
      ),
    ],
    ['Recognize signs that require a swallowing-safety assessment.'],
    'Assess the ability to swallow safely before treating low intake as an appetite problem.'
  ),
  nutrition(
    'nutrition-f4',
    'foundation',
    'Diet context before coeliac testing',
    'A patient is being assessed for possible coeliac disease. They currently eat a gluten-containing diet. Blood testing is planned, but the patient wants to stop gluten today. The nurse is preparing pretest teaching.',
    [
      'Coeliac testing is planned',
      'Current diet contains gluten',
      'The patient plans to stop gluten before testing',
    ],
    'Which point should the nurse explain?',
    [
      yes(
        'Changing gluten intake before testing can affect interpretation, so agree the diagnostic diet plan with the clinical team.',
        'Gluten restriction can affect the accuracy of the diagnostic process. The patient should understand the reason for the agreed testing diet and discuss concerns before changing it.',
        [0, 1, 2]
      ),
      no(
        'Stopping gluten today makes the planned test more specific for coeliac disease.',
        'Removing the exposure does not improve the routine serological diagnostic process.',
        'Avoiding a suspected trigger may seem to make testing safer and clearer.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'Symptom improvement after gluten withdrawal can replace the planned diagnostic assessment.',
        'A symptom response is not specific enough to establish coeliac disease and does not substitute for the agreed assessment.',
        'An elimination diet provides an observable response.',
        'premature_closure',
        [0, 2]
      ),
      no(
        'The diet can be changed freely because the laboratory measures inherited risk rather than current immune markers.',
        'Routine coeliac serology is not simply a genetic-risk test and depends on diagnostic context.',
        'Coeliac disease has an inherited component.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
    ],
    ['Recognize a pretest behavior that changes interpretation.'],
    'Preparation is part of diagnostic quality. Explain why a diet plan matters and involve the patient in a tolerable, clinically appropriate testing approach.'
  ),
  nutrition(
    'nutrition-f5',
    'foundation',
    'Food access as part of assessment',
    'A patient has not followed a recommended meal plan. They say the suggested foods cost more than their weekly food budget. They still want help improving intake. The nurse is reviewing the plan.',
    [
      'Recommended foods exceed the patient’s budget',
      'The patient wants help improving intake',
    ],
    'Which response best identifies the next assessment need?',
    [
      yes(
        'Ask what foods and support are affordable and available in the patient’s usual setting.',
        'The stated barrier is access, so an effective plan must be based on realistic resources and preferences.',
        [0, 1]
      ),
      no(
        'Repeat the original food list to confirm that the patient remembers the recommendations.',
        'Memory is not the stated barrier; repeating an unaffordable plan does not address access.',
        'Education is a familiar response to an uncompleted plan.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Record lack of motivation as the main cause of the unsuccessful plan.',
        'The patient has expressed willingness and a concrete financial barrier.',
        'Failure to follow advice can be misread as lack of interest.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Use the previous meal plan unchanged because it met the nutritional targets on paper.',
        'A technically adequate plan is not effective if it cannot be implemented.',
        'The plan was designed by a qualified professional.',
        'outdated_data',
        [0, 1]
      ),
    ],
    ['Distinguish a resource barrier from a knowledge or motivation problem.'],
    'A useful nutrition plan must be possible in the patient’s life. Assess access before labeling an uncompleted plan.'
  ),
  nutrition(
    'nutrition-c1',
    'challenge',
    'Weight loss despite a normal-range BMI',
    'A patient’s BMI is within the usual adult range. They have unintentionally lost a substantial proportion of their weight over three months. Intake has fallen because meals provoke abdominal symptoms. Their clothes are increasingly loose and they feel weaker. The nurse is reviewing a note that says normal BMI, no nutrition concern.',
    [
      'BMI remains within the usual range',
      'Substantial unintentional loss over three months',
      'Reduced intake due to symptoms',
      'New weakness and loose clothes',
    ],
    'Which interpretation best guides the next step?',
    [
      yes(
        'The weight-loss and intake trajectory warrants nutrition assessment despite the current BMI.',
        'A normal-range BMI does not exclude clinically important unintentional loss or inadequate intake.',
        [0, 1, 2, 3]
      ),
      no(
        'The BMI excludes malnutrition until the patient crosses into the underweight range.',
        'Risk assessment includes trajectory and intake, not a BMI threshold alone.',
        'BMI is a familiar screening number.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'The abdominal symptoms should be diagnosed before documenting any nutritional risk.',
        'Assessment of the cause and nutritional deficit can proceed together; diagnostic uncertainty does not remove the current risk.',
        'Treating the cause may restore intake.',
        'misprioritization',
        [1, 2, 3]
      ),
      no(
        'The previous no-concern note should remain the plan until the next scheduled weight check.',
        'The documented loss and functional changes already warrant reassessment.',
        'Maintaining the recorded plan may seem consistent.',
        'outdated_data',
        [0, 1, 2, 3]
      ),
    ],
    [
      'Integrate current size with weight and intake trends.',
      'Identify risk that a single screening number can miss.',
    ],
    'Evaluate nutrition over time. A current body-size category cannot erase a meaningful loss trajectory.'
  ),
  nutrition(
    'nutrition-c2',
    'challenge',
    'Negative serology after gluten restriction',
    'A patient has persistent loose stools and weight loss. Coeliac serology is reported negative, but they had largely stopped gluten several weeks before the sample. Their symptoms remain unexplained. They are reluctant to reintroduce foods that seem to worsen symptoms. The nurse is preparing the follow-up discussion.',
    [
      'Persistent symptoms and weight loss',
      'Negative coeliac serology',
      'Gluten restriction before the sample',
      'Concern about reintroducing symptom-provoking foods',
    ],
    'Which next step best addresses the result and the patient’s concern?',
    [
      yes(
        'Explain the test limitation and arrange specialist discussion of an acceptable diagnostic plan.',
        'Prior gluten restriction can reduce the usefulness of testing. Specialist review can address persistent suspicion and the person’s ability or willingness to follow a diagnostic diet.',
        [0, 1, 2, 3]
      ),
      no(
        'Use the negative result to close the coeliac assessment and continue unrestricted reassurance.',
        'The dietary context limits exclusion, and ongoing symptoms still require assessment.',
        'A negative laboratory result appears definitive.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'Treat symptom improvement off gluten as confirmation and remove the need for further review.',
        'Response to restriction is not specific enough to establish the diagnosis or explain persistent symptoms.',
        'The patient has noticed a diet–symptom relationship.',
        'premature_closure',
        [0, 2, 3]
      ),
      no(
        'Tell the patient to restart a fixed diet immediately without discussing tolerance or the diagnostic options.',
        'The clinical plan should account for the person’s symptoms and preferences, particularly when they are reluctant to reintroduce gluten.',
        'Testing accuracy depends on an appropriate exposure.',
        'misprioritization',
        [2, 3]
      ),
    ],
    [
      'Interpret a negative result in relation to pretest diet.',
      'Select a shared specialist plan rather than forcing a binary diagnosis.',
    ],
    'An inconclusive test context needs explanation and a feasible next step. Diagnostic quality and patient participation are linked.'
  ),
  nutrition(
    'nutrition-c3',
    'challenge',
    'Fluid intake without adequate nutrition',
    'A patient has been drinking water and tea but eating almost no food for six days. Their fluid chart appears complete. They report weakness and have lost weight. The current note describes intake as adequate because drinks are being finished. The nurse is reviewing the plan.',
    [
      'Water and tea are consumed',
      'Almost no food for six days',
      'Weakness and weight loss',
      'Intake labeled adequate from fluid completion',
    ],
    'Which assessment should correct the current interpretation?',
    [
      yes(
        'Quantify energy and protein intake separately from fluid intake and request nutrition review.',
        'A complete fluid record does not show that energy and protein needs are being met. Prolonged little intake requires nutritional assessment and an appropriate plan.',
        [0, 1, 2, 3]
      ),
      no(
        'Use the fluid total as a practical substitute for overall nutritional adequacy.',
        'Hydration volume and nutrient intake answer different questions.',
        'Finishing drinks is a visible sign of oral tolerance.',
        'cue_misinterpretation',
        [0, 1, 3]
      ),
      no(
        'Wait for dehydration signs before changing the intake plan.',
        'Nutritional deficit can be important without dehydration and should not wait for a separate problem.',
        'Poor intake is often linked primarily to dehydration.',
        'misprioritization',
        [0, 1, 2]
      ),
      no(
        'Use the existing adequate-intake note until a formal calorie count has been completed over several more days.',
        'The current history already indicates a substantial deficit requiring review; more detailed measurement should not delay recognition.',
        'A formal count may seem necessary before challenging a recorded conclusion.',
        'outdated_data',
        [1, 2, 3]
      ),
    ],
    [
      'Separate fluid tolerance from nutritional adequacy.',
      'Use duration and functional change to prioritize review.',
    ],
    'Measure the resource actually in deficit. A patient can drink enough fluid while receiving very little energy or protein.'
  ),
  nutrition(
    'nutrition-c4',
    'challenge',
    'A feasible plan after unsuccessful teaching',
    'A patient accurately explains their meal plan but has continued to lose weight. The prescribed supplements are unaffordable and their usual foods are not included in the examples. They prepare meals with limited equipment. They still want to improve strength. The nurse is deciding what to change in the next teaching visit.',
    [
      'Accurate recall of the existing plan',
      'Continued weight loss',
      'Unaffordable supplements and mismatched food examples',
      'Limited cooking equipment with a goal of better strength',
    ],
    'Which plan best addresses the reason implementation has failed?',
    [
      yes(
        'Co-design affordable options using familiar foods and available equipment, then agree measurable intake and review goals.',
        'Knowledge is present; access and practicality are the barriers. A tailored plan should preserve nutritional aims while fitting resources and checking actual uptake.',
        [0, 1, 2, 3]
      ),
      no(
        'Repeat the same supplement instructions using a longer written explanation.',
        'Additional information does not solve the stated cost, food-fit and equipment barriers.',
        'More detailed teaching may seem the standard response to poor progress.',
        'misprioritization',
        [0, 2, 3]
      ),
      no(
        'Use the accurate explanation as proof that the nutrition intervention is complete.',
        'Understanding does not establish access or adequate intake, and weight continues to decline.',
        'Teach-back is an important check of understanding.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'Retain the original plan because changing food examples would alter the nutritional treatment.',
        'Foods and delivery methods can often be adapted with dietetic input while preserving treatment goals.',
        'A standardized plan appears to protect technical accuracy.',
        'outdated_data',
        [1, 2, 3]
      ),
    ],
    [
      'Distinguish understanding from the ability to implement a plan.',
      'Generate a practical solution linked to the patient’s goal.',
    ],
    'Successful education requires more than recall. Evaluate whether the person can obtain, prepare and use the agreed options.'
  ),
  nutrition(
    'nutrition-c5',
    'challenge',
    'Low electrolytes before nutrition support',
    'A patient has eaten almost nothing for more than ten days. Weight has fallen markedly and baseline phosphate is below range. Nutrition support is being planned for today. The patient is eager to receive a large meal. The nurse is checking what preparation is needed.',
    [
      'Almost no intake for more than ten days',
      'Marked weight loss',
      'Low baseline phosphate',
      'Nutrition support is about to begin',
    ],
    'Which action should be prioritized before implementing the feeding plan?',
    [
      yes(
        'Request an expert refeeding-risk plan with appropriate nutrition progression, supplementation and monitoring.',
        'The duration, loss and low phosphate identify high risk for refeeding problems. The patient needs a coordinated plan rather than an unrestricted catch-up approach.',
        [0, 1, 2, 3]
      ),
      no(
        'Provide a full catch-up intake because the low phosphate reflects a deficit that food will quickly correct.',
        'Rapid feeding can worsen electrolyte shifts in a high-risk patient; replacement and feeding require coordinated monitoring.',
        'Restoring a deficit quickly seems intuitively beneficial.',
        'cue_misinterpretation',
        [0, 2, 3]
      ),
      no(
        'Use hunger as evidence that the metabolic risk has resolved.',
        'Appetite does not establish electrolyte stability or low refeeding risk.',
        'Feeling hungry can be interpreted as readiness for normal intake.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'Start the routine plan and add laboratory monitoring if symptoms develop.',
        'High risk is already identifiable before symptoms; the plan should include prevention and monitoring from the outset.',
        'Symptoms are a familiar trigger for additional checks.',
        'misprioritization',
        [0, 1, 2, 3]
      ),
    ],
    [
      'Integrate prefeeding history and biochemistry to identify risk.',
      'Plan safe implementation rather than waiting for harm.',
    ],
    'Nutrition is treatment with predictable risks in some patients. Use the prefeeding assessment to design monitoring and progression before complications appear.'
  ),
  nutrition(
    'nutrition-a1',
    'advanced',
    'A new metabolic trajectory after feeding begins',
    'A severely undernourished patient begins nutrition support after prolonged minimal intake. Baseline phosphate was within range. On the second day, phosphate, potassium and magnesium have fallen, with new weakness and palpitations. Fluid balance is positive and ankle edema has appeared. The patient is pleased that their weight has increased. The nurse is evaluating whether the early gain shows successful recovery.',
    [
      'Prolonged minimal intake with severe undernutrition',
      'Nutrition support began recently',
      'Initially normal phosphate',
      'New falls in phosphate, potassium and magnesium',
      'Weakness and palpitations',
      'Positive fluid balance, edema and early weight gain',
    ],
    'Which evaluation best addresses the changed risk?',
    [
      yes(
        'Escalate possible refeeding-related complications and request immediate review of electrolytes, rhythm, fluid status and the feeding plan.',
        'The timing, electrolyte shifts and symptoms raise concern for refeeding problems despite a normal baseline phosphate. Early weight gain with edema may reflect fluid rather than restored tissue, and the plan needs urgent expert review.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use the normal baseline phosphate to treat the new changes as unrelated to nutrition progression.',
        'A normal prefeeding value does not exclude later shifts after feeding begins.',
        'Baseline screening may be misread as a lasting clearance.',
        'outdated_data',
        [0, 1, 2, 3]
      ),
      no(
        'Interpret the weight gain as the main recovery endpoint and continue the planned increase before reviewing electrolytes.',
        'Fluid-associated gain is not proof of nutritional recovery, and the new symptoms and electrolyte declines require current assessment.',
        'Weight restoration is an important long-term goal.',
        'cue_misinterpretation',
        [3, 4, 5]
      ),
      no(
        'Attribute the palpitations to anxiety about feeding and repeat the nutrition review at the routine weekly visit.',
        'The documented electrolyte changes and weakness provide a physiological concern that should not be deferred or assigned to anxiety.',
        'Feeding after prolonged restriction can be distressing.',
        'premature_closure',
        [1, 3, 4, 5]
      ),
    ],
    [
      'Interpret the timing of new biochemical and fluid changes after nutrition starts.',
      'Distinguish apparent weight success from emerging treatment harm.',
    ],
    'Evaluate a treatment by its current metabolic and functional effects. A favorable-looking weight change can conceal fluid and electrolyte complications.',
    {
      conflict:
        'Weight has increased and baseline phosphate was normal, while current electrolytes, symptoms and fluid findings suggest new harm.',
      anticipation:
        'Monitor for arrhythmia or respiratory weakness and support expert-directed revision and replacement with close reassessment.',
      uncertainty:
        'The exact contribution of refeeding and other causes requires review; the scenario does not prescribe a feeding rate or replacement dose.',
    }
  ),
  nutrition(
    'nutrition-a2',
    'advanced',
    'Weight gain with persistent nutritional deficit',
    'A patient with chronic heart failure is recovering from an acute illness. Weight has risen over four days, but food records show less than half of planned intake. Edema and breathlessness have increased and fluid balance is positive. The patient says they must be gaining strength because the scale is higher. Their grip and usual walking function have not improved. The nurse is reviewing nutrition progress with the team.',
    [
      'Chronic heart failure',
      'Four-day weight gain',
      'Persistently inadequate recorded intake',
      'Edema and breathlessness',
      'Positive fluid balance',
      'No improvement in strength or function',
    ],
    'Which assessment best evaluates whether the nutrition plan is working?',
    [
      yes(
        'Interpret weight alongside fluid status, actual nutrient intake and function, and review the nutrition and fluid plans together.',
        'The scale change may reflect fluid accumulation rather than tissue recovery. Inadequate intake and unchanged function remain concerns, while respiratory and edema findings require review of fluid tolerance.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use the weight increase as the main evidence of nutrition success and reduce dietary support.',
        'Weight gain in a fluid-overloaded patient does not establish adequate nutrition or restored tissue.',
        'Weight is a familiar nutrition outcome.',
        'cue_misinterpretation',
        [1, 2, 3, 4, 5]
      ),
      no(
        'Treat the edema as a reason to suspend the nutrition assessment until the fluid problem is fully resolved.',
        'Fluid and nutrition needs coexist; postponing assessment leaves the documented nutrient deficit unaddressed.',
        'Fluid correction may make later weights easier to interpret.',
        'misprioritization',
        [2, 3, 4, 5]
      ),
      no(
        'Keep the original plan because the admission weight and calculated targets were appropriate.',
        'A valid initial calculation does not establish current intake, tolerance or response after several days.',
        'The original plan was quantitatively assessed.',
        'outdated_data',
        [1, 2, 3, 4, 5]
      ),
    ],
    [
      'Separate fluid-related weight change from nutritional tissue recovery.',
      'Integrate intake, function and treatment tolerance in a revised plan.',
    ],
    'Use several outcome domains when one measure is confounded. The scale alone cannot establish recovery during changing fluid balance.',
    {
      conflict:
        'The scale suggests gain, while food intake and function suggest ongoing deficit and clinical findings suggest fluid accumulation.',
      anticipation:
        'Monitor worsening breathlessness and reassess achievable intake and function as fluid status changes.',
      uncertainty:
        'The proportion of weight change due to fluid versus tissue is not established by the scale alone.',
    }
  ),
  nutrition(
    'nutrition-a3',
    'advanced',
    'Negative IgA serology in an IgA-deficient patient',
    'An adult has persistent loose stools, iron deficiency and unintentional weight loss. Their sibling has coeliac disease. IgA tissue transglutaminase is negative, but total IgA is markedly deficient. The patient has continued to eat gluten during testing. Symptoms have not resolved with general dietary advice. The nurse is preparing the next diagnostic discussion.',
    [
      'Persistent loose stools with iron deficiency',
      'Unintentional weight loss',
      'First-degree relative with coeliac disease',
      'Negative IgA tissue transglutaminase',
      'Marked total IgA deficiency',
      'Continued gluten exposure and persistent symptoms',
    ],
    'Which follow-up best interprets the negative result?',
    [
      yes(
        'Request review of IgA-related test limitations and appropriate alternative testing or specialist assessment.',
        'IgA deficiency limits interpretation of an IgA-based negative result. The persistent symptoms and family context support review of appropriate IgG-based testing and specialist assessment rather than closing the diagnosis.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use continued gluten exposure to treat the negative IgA result as a reliable exclusion despite the low total IgA.',
        'Appropriate gluten exposure does not correct the limitation of an IgA-based test in an IgA-deficient person.',
        'The patient followed the pretest diet correctly.',
        'cue_misinterpretation',
        [3, 4, 5]
      ),
      no(
        'Diagnose coeliac disease from the family history and symptoms without reviewing the serology limitations.',
        'The history raises suspicion but does not establish the diagnosis; an appropriate diagnostic pathway remains necessary.',
        'The symptom and family pattern is compelling.',
        'premature_closure',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Repeat the same IgA test after another interval and defer specialist review until it becomes positive.',
        'Repeating the same test without accounting for IgA deficiency may reproduce the same limitation and delay evaluation.',
        'A later sample may appear more sensitive as symptoms persist.',
        'misprioritization',
        [3, 4, 5]
      ),
    ],
    [
      'Identify how the assay mechanism limits a negative result.',
      'Integrate persistent clinical suspicion with the appropriate next diagnostic pathway.',
    ],
    'A correctly timed test can still be unsuitable for a particular patient. Interpret a negative result using both exposure and the biological requirements of the assay.',
    {
      conflict:
        'The negative disease-specific IgA result appears reassuring, while total IgA deficiency limits its meaning and the clinical context remains concerning.',
      anticipation:
        'Ensure ongoing weight loss and iron deficiency are evaluated while the diagnostic pathway is clarified.',
      uncertainty:
        'Coeliac disease is not confirmed; alternative causes and specialist interpretation remain necessary.',
    }
  ),
  nutrition(
    'nutrition-a4',
    'advanced',
    'A nutrition decision with different goals',
    'A competent adult with a prolonged illness has inadequate oral intake. The team proposes temporary tube feeding, but the patient wants to discuss burdens and alternatives first. Their family asks the nurse to proceed today because they fear further weakness. The patient accurately explains the likely benefits and risks and is not in an immediate emergency. There are several clinically reasonable support options. The nurse is planning the next conversation.',
    [
      'Inadequate oral intake with a proposed temporary tube',
      'The competent patient wants further discussion',
      'Family pressure to proceed today',
      'Accurate understanding of benefits and risks',
      'No immediate emergency',
      'Several clinically reasonable options',
    ],
    'Which plan best supports an informed and clinically useful decision?',
    [
      yes(
        'Clarify the patient’s goals, compare reasonable options and agree a consent-based plan with explicit review points.',
        'The patient’s understanding and capacity support an informed choice. A structured discussion should compare benefits, burdens and alternatives against their goals, involving family as the patient wishes and planning review of the nutritional risk.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use the family’s urgency to authorize tube placement, then obtain the patient’s preference before feeding begins.',
        'Consent is needed for the intervention; family concern does not authorize proceeding for a competent adult who requests discussion.',
        'Temporary tube placement may be seen as a reversible compromise.',
        'misprioritization',
        [1, 2, 3, 4]
      ),
      no(
        'Treat the request for more discussion as refusal and remove nutrition support from the care plan.',
        'Wanting discussion is not a settled refusal, and nutritional care can continue through a shared plan and review.',
        'Respecting autonomy may be mistaken for ending the clinical conversation.',
        'premature_closure',
        [0, 1, 5]
      ),
      no(
        'Repeat the technical benefits of tube feeding until the patient’s choice matches the team’s recommendation.',
        'Information should support a voluntary decision, not be used as pressure toward a predetermined choice.',
        'The team’s recommendation aims to prevent further decline.',
        'cue_misinterpretation',
        [1, 3, 5]
      ),
    ],
    [
      'Separate family concern from the patient’s authorization.',
      'Integrate clinical risk and the patient’s goals into a reviewed support plan.',
    ],
    'A clinically appropriate option still requires a patient-centered decision. Understanding is demonstrated by the ability to weigh options, not by agreement with the preferred intervention.',
    {
      conflict:
        'The team and family prioritize rapid nutritional support, while the informed patient needs a fuller discussion of burdens and alternatives.',
      anticipation:
        'Agree what will be monitored and when to revisit the plan if intake, function or clinical risk changes.',
      uncertainty:
        'The scenario does not identify one universally best feeding route; the decision depends on the person’s goals and clinical assessment.',
    }
  ),
  nutrition(
    'nutrition-a5',
    'advanced',
    'A discharge plan that works outside the ward',
    'A patient recovering from severe illness can swallow safely and explains their nutrition instructions accurately. Weight and strength remain below baseline. The proposed plan relies on supplements that are not covered and meals prepared by a relative who is away most weekdays. The patient has limited transport but can use a telephone. Recorded ward intake meets the plan when meals are delivered. The team is deciding how to make follow-up safe and effective.',
    [
      'Safe swallowing and accurate understanding',
      'Persistent weight and strength deficit',
      'Unaffordable proposed supplements',
      'Caregiver unavailable most weekdays',
      'Limited transport with telephone access',
      'Adequate ward intake depends on delivered meals',
    ],
    'Which transition plan best tests whether nutrition goals are achievable at home?',
    [
      yes(
        'Arrange affordable food access and practical meal support, with agreed intake goals and accessible early follow-up.',
        'Ward success under delivered-meal conditions does not establish home feasibility. The plan should address cost and preparation, use available communication and monitor actual intake and function after transition.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use accurate teach-back and ward intake as sufficient evidence that the standard home plan will succeed.',
        'Understanding and supported ward intake do not solve the identified home access barriers.',
        'Teach-back and measured intake are reassuring indicators.',
        'premature_closure',
        [0, 2, 3, 5]
      ),
      no(
        'Require the same supplement regimen and arrange a distant in-person review before considering alternatives.',
        'This retains the financial and transport barriers rather than tailoring a clinically acceptable plan.',
        'A standardized regimen and face-to-face review can seem more reliable.',
        'misprioritization',
        [2, 3, 4]
      ),
      no(
        'Use the relative’s previous caregiving role as assurance that meal preparation will remain available.',
        'Current weekday unavailability changes the practical support, so an earlier role cannot establish present capacity.',
        'The relative has been a trusted source of help.',
        'outdated_data',
        [3, 4, 5]
      ),
    ],
    [
      'Distinguish success in a supported setting from feasibility after transition.',
      'Generate a practical plan and select follow-up endpoints that can reveal failure early.',
    ],
    'A transition plan is effective only if its assumptions hold in the next setting. Verify access and support, then measure real intake and function rather than knowledge alone.',
    {
      conflict:
        'The patient performs well on the ward and understands the plan, but home cost, meal preparation and transport conditions differ.',
      anticipation:
        'Agree early contact for inadequate intake, new swallowing problems or declining function and arrange a route to revise the plan promptly.',
      uncertainty:
        'Home success cannot be inferred before access and actual uptake are checked; the precise support package depends on available services.',
    }
  ),
]

const skillByItem: Record<
  string,
  NonNullable<QuestionDraftV2['primaryCompetency']>
> = {
  'fever-f1': 'recognize_cues',
  'fever-f2': 'analyze_cues',
  'fever-f3': 'recognize_cues',
  'fever-f4': 'recognize_cues',
  'fever-f5': 'take_action',
  'fever-c1': 'prioritize_hypotheses',
  'fever-c2': 'analyze_cues',
  'fever-c3': 'take_action',
  'fever-c4': 'take_action',
  'fever-c5': 'evaluate_outcomes',
  'fever-a1': 'generate_solutions',
  'fever-a2': 'prioritize_hypotheses',
  'fever-a3': 'take_action',
  'fever-a4': 'take_action',
  'fever-a5': 'evaluate_outcomes',
  'pancreas-f1': 'recognize_cues',
  'pancreas-f2': 'analyze_cues',
  'pancreas-f3': 'analyze_cues',
  'pancreas-f4': 'take_action',
  'pancreas-f5': 'generate_solutions',
  'pancreas-c1': 'analyze_cues',
  'pancreas-c2': 'evaluate_outcomes',
  'pancreas-c3': 'prioritize_hypotheses',
  'pancreas-c4': 'evaluate_outcomes',
  'pancreas-c5': 'generate_solutions',
  'pancreas-a1': 'generate_solutions',
  'pancreas-a2': 'prioritize_hypotheses',
  'pancreas-a3': 'prioritize_hypotheses',
  'pancreas-a4': 'analyze_cues',
  'pancreas-a5': 'evaluate_outcomes',
  'skin-f1': 'recognize_cues',
  'skin-f2': 'take_action',
  'skin-f3': 'recognize_cues',
  'skin-f4': 'take_action',
  'skin-f5': 'recognize_cues',
  'skin-c1': 'prioritize_hypotheses',
  'skin-c2': 'take_action',
  'skin-c3': 'analyze_cues',
  'skin-c4': 'analyze_cues',
  'skin-c5': 'evaluate_outcomes',
  'skin-a1': 'generate_solutions',
  'skin-a2': 'analyze_cues',
  'skin-a3': 'prioritize_hypotheses',
  'skin-a4': 'evaluate_outcomes',
  'skin-a5': 'prioritize_hypotheses',
  'leg-f1': 'recognize_cues',
  'leg-f2': 'take_action',
  'leg-f3': 'recognize_cues',
  'leg-f4': 'recognize_cues',
  'leg-f5': 'analyze_cues',
  'leg-c1': 'take_action',
  'leg-c2': 'analyze_cues',
  'leg-c3': 'analyze_cues',
  'leg-c4': 'analyze_cues',
  'leg-c5': 'prioritize_hypotheses',
  'leg-a1': 'generate_solutions',
  'leg-a2': 'prioritize_hypotheses',
  'leg-a3': 'evaluate_outcomes',
  'leg-a4': 'generate_solutions',
  'leg-a5': 'evaluate_outcomes',
  'abdomen-f1': 'recognize_cues',
  'abdomen-f2': 'recognize_cues',
  'abdomen-f3': 'take_action',
  'abdomen-f4': 'recognize_cues',
  'abdomen-f5': 'take_action',
  'abdomen-c1': 'evaluate_outcomes',
  'abdomen-c2': 'evaluate_outcomes',
  'abdomen-c3': 'analyze_cues',
  'abdomen-c4': 'prioritize_hypotheses',
  'abdomen-c5': 'analyze_cues',
  'abdomen-a1': 'evaluate_outcomes',
  'abdomen-a2': 'prioritize_hypotheses',
  'abdomen-a3': 'prioritize_hypotheses',
  'abdomen-a4': 'take_action',
  'abdomen-a5': 'analyze_cues',
  'nutrition-f1': 'recognize_cues',
  'nutrition-f2': 'recognize_cues',
  'nutrition-f3': 'take_action',
  'nutrition-f4': 'analyze_cues',
  'nutrition-f5': 'recognize_cues',
  'nutrition-c1': 'analyze_cues',
  'nutrition-c2': 'generate_solutions',
  'nutrition-c3': 'analyze_cues',
  'nutrition-c4': 'generate_solutions',
  'nutrition-c5': 'generate_solutions',
  'nutrition-a1': 'evaluate_outcomes',
  'nutrition-a2': 'evaluate_outcomes',
  'nutrition-a3': 'analyze_cues',
  'nutrition-a4': 'generate_solutions',
  'nutrition-a5': 'generate_solutions',
}

export const caseReasoningQualityQuestions: QuestionDraftV2[] = [
  ...feverNeuro,
  ...pancreasBalance,
  ...skinSystemic,
  ...legToLung,
  ...abdomenTurn,
  ...nutritionContext,
].map((q) => {
  const key = q.id.replace('v2-cr-', '')
  const primaryCompetency = skillByItem[key]
  if (!primaryCompetency)
    throw new Error(`Missing decision-specific skill for ${q.id}`)
  // Additional primary evidence is attached only to the items that need it.
  const extraSources: SourceId[] =
    key === 'fever-f5'
      ? ['insulinSafety']
      : key === 'fever-a3' || key === 'abdomen-a4'
        ? ['opioidSafety']
        : key === 'skin-a5'
          ? ['compartment']
          : key === 'skin-c2'
            ? ['anaphylaxis']
            : []
  const referenceUrls =
    key === 'pancreas-a2'
      ? ['https://doi.org/10.1016/j.pan.2025.04.020']
      : key === 'abdomen-a2'
        ? ['https://www.nice.org.uk/guidance/ng126/chapter/recommendations']
        : []
  return {
    ...q,
    primaryCompetency,
    sources: [...new Set([...q.sources, ...extraSources])],
    ...(referenceUrls.length ? { referenceUrls } : {}),
  }
})
