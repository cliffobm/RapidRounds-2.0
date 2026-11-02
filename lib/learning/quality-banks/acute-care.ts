import type {
  QuestionDraftV2,
  ChoiceDraftV2,
  DistractorErrorV2,
  ClinicalDomainV2,
  ReasoningLevelV2,
} from '@/lib/cjis/question-v2'
import type { SourceId } from '@/lib/learning/sources'

// Original editorial drafts. Rotation changes position, never the clinical key.
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
  'conflict' | 'anticipation' | 'uncertainty' | 'referenceUrls'
>
// Each target is assigned from the actual prompt, independently of difficulty.
const primarySkills: Record<
  string,
  NonNullable<QuestionDraftV2['primaryCompetency']>
> = {
  'Airway symptoms after an antibiotic': 'take_action',
  'External bleeding after a laceration': 'take_action',
  'Breathing after procedural sedation': 'take_action',
  'Chest injury with unequal air entry': 'prioritize_hypotheses',
  'Urine output during infection': 'analyze_cues',
  'Persistent breathing compromise after epinephrine': 'take_action',
  'Compensated blood loss after trauma': 'analyze_cues',
  'Oxygen masking sedation-related hypoventilation': 'analyze_cues',
  'Traumatic respiratory collapse before imaging': 'take_action',
  'Organ dysfunction despite a falling temperature': 'evaluate_outcomes',
  'Recurrent airway symptoms after apparent recovery': 'evaluate_outcomes',
  'Pelvic trauma with a negative FAST': 'prioritize_hypotheses',
  'Head injury complicated by falling perfusion': 'generate_solutions',
  'Partial arousal after opioid reversal': 'evaluate_outcomes',
  'Infection resuscitation with competing fluid signals': 'evaluate_outcomes',
  'Sudden focal neurologic change': 'take_action',
  'Oral medication after a new stroke': 'take_action',
  'A changed consciousness score': 'take_action',
  'Airway position after a seizure': 'take_action',
  'Abrupt severe headache onset': 'recognize_cues',
  'Persistent focal deficits after glucose correction': 'evaluate_outcomes',
  'A focal deficit that resolved': 'generate_solutions',
  'Failure to recover after seizure': 'evaluate_outcomes',
  'New symptoms after a reassuring head scan': 'evaluate_outcomes',
  'Suspected meningitis with deteriorating physiology': 'take_action',
  'Wake-up deficit with uncertain onset': 'generate_solutions',
  'Focal deficit with anticoagulation uncertainty': 'generate_solutions',
  'Thunderclap headache after delayed negative imaging': 'analyze_cues',
  'Unequal recovery after head injury and opioid treatment':
    'evaluate_outcomes',
  'Focal weakness after an unwitnessed seizure': 'prioritize_hypotheses',
  'Tidal volume and minute ventilation': 'analyze_cues',
  'Oximetry versus ventilation': 'analyze_cues',
  'Speech limitation in asthma': 'recognize_cues',
  'New dyspnea after immobilization': 'prioritize_hypotheses',
  'Coughing during oral intake': 'take_action',
  'Equal minute volume with different breathing patterns': 'analyze_cues',
  'A quieter chest during worsening asthma': 'evaluate_outcomes',
  'Hypercapnia despite acceptable saturation': 'analyze_cues',
  'Improved saturation at greater oxygen support': 'evaluate_outcomes',
  'Vomiting during noninvasive ventilation': 'take_action',
  'Worsening acidosis during a technically improved NIV trial':
    'evaluate_outcomes',
  'Carbon dioxide divergence during circulatory deterioration': 'analyze_cues',
  'A normalizing carbon dioxide in exhausted asthma': 'evaluate_outcomes',
  'New pleuritic pain during pneumonia treatment': 'prioritize_hypotheses',
  'Low saturation with uncertain signal quality': 'generate_solutions',
  'A new reaction during transfusion': 'take_action',
  'Symptomatic low glucose with safe swallowing': 'take_action',
  'Volume-loss findings at intake': 'take_action',
  'An ulcer without pain in diabetes': 'analyze_cues',
  'A change from the cognitive baseline': 'recognize_cues',
  'An early hemoglobin after gastrointestinal bleeding': 'analyze_cues',
  'Respiratory change during transfusion in heart failure':
    'generate_solutions',
  'Potassium before insulin in ketoacidosis': 'take_action',
  'Fever after recent cytotoxic treatment': 'take_action',
  'New abdominal findings after analgesia': 'evaluate_outcomes',
  'Persistent neurologic deficit after glucose correction':
    'generate_solutions',
  'Fever improves while perfusion worsens': 'evaluate_outcomes',
  'Dyspnea with competing transfusion mechanisms': 'generate_solutions',
  'A reassuring pain score after trauma': 'evaluate_outcomes',
  'Low intake with hyperglycemia and kidney dysfunction': 'generate_solutions',
  'A newly cold and numb foot': 'prioritize_hypotheses',
  'A swollen calf after immobility': 'recognize_cues',
  'New back pain with known aneurysm': 'prioritize_hypotheses',
  'Arterial assessment before leg compression': 'take_action',
  'New chest symptoms during DVT assessment': 'prioritize_hypotheses',
  'A sensory change during limb ischemia assessment': 'prioritize_hypotheses',
  'Circulatory change after femoral access': 'prioritize_hypotheses',
  'A negative initial proximal venous ultrasound': 'generate_solutions',
  'A high ankle-brachial index in diabetes': 'analyze_cues',
  'Back pain in an aneurysm surveillance patient': 'generate_solutions',
  'A pulse after limb reperfusion': 'prioritize_hypotheses',
  'Breathlessness during anticoagulation with evidence of bleeding':
    'generate_solutions',
  'Motor change after a reassuring initial limb examination':
    'evaluate_outcomes',
  'A normal pressure in a painful aneurysm presentation': 'generate_solutions',
  'A negative scan before new pulmonary symptoms': 'generate_solutions',
}
let position = 0
function draft(
  collectionId: string,
  domain: ClinicalDomainV2,
  level: ReasoningLevelV2,
  topic: string,
  scenario: string,
  cues: string[],
  question: string,
  choices: QuestionDraftV2['options'],
  reasoning: string[],
  debrief: string,
  sources: SourceId[],
  advanced: Advanced = {}
): QuestionDraftV2 {
  const correct = (position++ % 4) as 0 | 1 | 2 | 3
  const options = choices.map(
    (_, index) => choices[(index - correct + 4) % 4]
  ) as QuestionDraftV2['options']
  const primaryCompetency = primarySkills[topic]
  if (!primaryCompetency)
    throw new Error(`Assign a prompt-specific competency for ${topic}`)
  return {
    id: `v2-ac-${collectionId.replace(/_/g, '-')}-${level}-${topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-$/, '')}`,
    collectionId,
    domain,
    level,
    topic,
    primaryCompetency,
    setting: 'Adult acute care',
    scenario,
    cues,
    question,
    options,
    correct,
    reasoning,
    debrief,
    sources,
    ...advanced,
  }
}
const acute = (
  level: ReasoningLevelV2,
  topic: string,
  scenario: string,
  cues: string[],
  question: string,
  options: QuestionDraftV2['options'],
  reasoning: string[],
  debrief: string,
  sources: SourceId[],
  advanced?: Advanced
) =>
  draft(
    'anaphylaxis_mods_trauma_sedation',
    'multisystem',
    level,
    topic,
    scenario,
    cues,
    question,
    options,
    reasoning,
    debrief,
    sources,
    advanced
  )
const neuro = (
  level: ReasoningLevelV2,
  topic: string,
  scenario: string,
  cues: string[],
  question: string,
  options: QuestionDraftV2['options'],
  reasoning: string[],
  debrief: string,
  sources: SourceId[],
  advanced?: Advanced
) =>
  draft(
    'neuro_template',
    'neurologic',
    level,
    topic,
    scenario,
    cues,
    question,
    options,
    reasoning,
    debrief,
    sources,
    advanced
  )
const pulm = (
  level: ReasoningLevelV2,
  topic: string,
  scenario: string,
  cues: string[],
  question: string,
  options: QuestionDraftV2['options'],
  reasoning: string[],
  debrief: string,
  sources: SourceId[],
  advanced?: Advanced
) =>
  draft(
    'pulm_template',
    'respiratory',
    level,
    topic,
    scenario,
    cues,
    question,
    options,
    reasoning,
    debrief,
    sources,
    advanced
  )
const vignette = (
  level: ReasoningLevelV2,
  topic: string,
  scenario: string,
  cues: string[],
  question: string,
  options: QuestionDraftV2['options'],
  reasoning: string[],
  debrief: string,
  sources: SourceId[],
  advanced?: Advanced
) =>
  draft(
    'scenario_vignettes',
    'multisystem',
    level,
    topic,
    scenario,
    cues,
    question,
    options,
    reasoning,
    debrief,
    sources,
    advanced
  )
const vascular = (
  level: ReasoningLevelV2,
  topic: string,
  scenario: string,
  cues: string[],
  question: string,
  options: QuestionDraftV2['options'],
  reasoning: string[],
  debrief: string,
  sources: SourceId[],
  advanced?: Advanced
) =>
  draft(
    'vascular_disease_core',
    'cardiovascular',
    level,
    topic,
    scenario,
    cues,
    question,
    options,
    reasoning,
    debrief,
    sources,
    advanced
  )

export const acuteCareQualityQuestions: QuestionDraftV2[] = [
  acute(
    'foundation',
    'Airway symptoms after an antibiotic',
    'An adult develops throat tightness during an antibiotic infusion. Their voice becomes hoarse and wheezing is audible. The infusion has been stopped and emergency help is coming. An emergency anaphylaxis protocol is available at the bedside.',
    ['Recent antibiotic exposure', 'New hoarseness', 'Wheezing'],
    'Which treatment should the nurse initiate under the emergency protocol?',
    [
      yes(
        'Intramuscular epinephrine',
        'Airway and breathing involvement after exposure requires prompt epinephrine; adjuncts do not replace it.',
        [0, 1, 2]
      ),
      no(
        'Nebulized bronchodilator',
        'It may relieve wheeze but does not address upper-airway swelling or systemic anaphylaxis.',
        'The most audible symptom is wheezing.',
        'misprioritization',
        [1, 2]
      ),
      no(
        'Intravenous antihistamine',
        'Antihistamines do not treat life-threatening airway or breathing compromise.',
        'An allergic trigger suggests an allergy medicine.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Intravenous corticosteroid',
        'A corticosteroid is not the immediate rescue treatment for airway compromise.',
        'Inflammatory swelling may suggest a steroid.',
        'misprioritization',
        [1]
      ),
    ],
    ['Recognize anaphylaxis with respiratory involvement'],
    'Match threatened airway or breathing to emergency treatment rather than the most familiar allergy medicine.',
    ['anaphylaxis']
  ),
  acute(
    'foundation',
    'External bleeding after a laceration',
    'A patient arrives with a deep forearm laceration. Blood continues to flow onto the stretcher. The hand is warm and the patient follows instructions. A colleague is obtaining the trauma equipment.',
    ['Active external bleeding', 'Accessible forearm wound'],
    'Which bedside intervention should begin first?',
    [
      yes(
        'Apply firm direct pressure',
        'Direct pressure addresses the accessible source of blood loss immediately.',
        [0, 1]
      ),
      no(
        'Elevate the injured arm',
        'Elevation alone is inadequate control of active significant bleeding.',
        'The bleeding limb can be raised easily.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Irrigate the open wound',
        'Cleaning does not control current hemorrhage and delays hemostasis.',
        'An open traumatic wound needs cleaning.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Assess distal sensation first',
        'Neurovascular assessment is important, but active hemorrhage needs simultaneous or earlier control.',
        'The hand may have associated nerve injury.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Identify an immediately controllable threat'],
    'Prioritize control of visible blood loss before completing secondary injury assessments.',
    ['traumaAssessment']
  ),
  acute(
    'foundation',
    'Breathing after procedural sedation',
    'A patient is recovering after procedural sedation. Respirations are shallow at six per minute and the patient is difficult to arouse. Oxygen and rescue equipment are present. The procedural clinician remains in the room.',
    ['Respiratory rate six with shallow breaths', 'Difficult to arouse'],
    'Which action addresses the immediate physiologic problem?',
    [
      yes(
        'Open the airway and support ventilation',
        'Depressed consciousness with shallow bradypnea threatens effective ventilation.',
        [0, 1]
      ),
      no(
        'Increase oxygen and reassess saturation',
        'Oxygen may improve saturation without correcting inadequate ventilation.',
        'Sedated patients often receive supplemental oxygen.',
        'cue_misinterpretation',
        [0]
      ),
      no(
        'Stimulate and repeat the sedation score',
        'Stimulation helps assess responsiveness but is insufficient if ventilation remains inadequate.',
        'Arousal can transiently improve breathing.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Position upright and reassess breath sounds',
        'Positioning alone does not provide the needed ventilatory support.',
        'Positioning can reduce airway obstruction.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Recognize inadequate ventilation'],
    'Respiratory support responds to inadequate breathing even before a saturation decline becomes apparent.',
    ['opioidSafety']
  ),
  acute(
    'foundation',
    'Chest injury with unequal air entry',
    'A patient has blunt left-sided chest trauma. Breath sounds are markedly reduced on the left and breathing is labored. A trauma clinician is approaching. The nurse is preparing a focused handover.',
    [
      'Blunt chest trauma',
      'Unilateral reduction in breath sounds',
      'Labored breathing',
    ],
    'Which concern should lead the handover?',
    [
      yes(
        'Possible pleural air impairing ventilation',
        'Trauma with unilateral reduced air entry and distress raises concern for pneumothorax.',
        [0, 1, 2]
      ),
      no(
        'Possible bronchospasm impairing ventilation',
        'Bronchospasm usually produces diffuse expiratory findings rather than a traumatic unilateral change.',
        'Respiratory distress may suggest airway narrowing.',
        'cue_misinterpretation',
        [1, 2]
      ),
      no(
        'Possible sedation impairing respiratory drive',
        'No sedative exposure is described, and the asymmetric examination needs explanation.',
        'Poor ventilation can reflect depressed drive.',
        'premature_closure',
        [1, 2]
      ),
      no(
        'Possible contusion causing isolated pain',
        'Contusion remains possible, but isolated pain does not adequately explain markedly unequal air entry.',
        'The mechanism can cause a painful contusion.',
        'premature_closure',
        [0, 1]
      ),
    ],
    ['Link asymmetric findings to the injured system'],
    'Use the distribution of examination findings to identify a threat without claiming a confirmed diagnosis.',
    ['traumaAssessment']
  ),
  acute(
    'foundation',
    'Urine output during infection',
    'A patient is receiving care for a severe infection. Urine output has been ten milliliters in the past hour. The tubing is patent and the collection bag is below the bladder. The nurse is reviewing organ-perfusion observations.',
    ['Severe infection', 'Low output despite patent drainage'],
    'What does this finding require the nurse to assess?',
    [
      yes(
        'Possible impaired renal perfusion',
        'Low output in this context can indicate organ dysfunction and needs clinical assessment.',
        [0, 1]
      ),
      no(
        'Possible catheter obstruction',
        'The drainage system has been checked and is patent; another cause needs consideration.',
        'Low catheter output commonly prompts an obstruction check.',
        'outdated_data',
        [1]
      ),
      no(
        'Possible urinary urgency',
        'Urgency does not explain reduced measured output through a patent catheter.',
        'Urinary symptoms can accompany infection.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Possible expected fluid conservation',
        'Conservation may occur physiologically, but labeling this expected could miss impaired perfusion.',
        'Acute illness can reduce intake and urine volume.',
        'premature_closure',
        [0, 1]
      ),
    ],
    ['Recognize a potential organ-dysfunction cue'],
    'Reduced urine output is a clinical finding to interpret with perfusion, not a stand-alone diagnosis of its cause.',
    ['sepsis', 'aki']
  ),
  acute(
    'challenge',
    'Persistent breathing compromise after epinephrine',
    'A patient received protocol-directed epinephrine for anaphylaxis five minutes ago. The rash has faded, but wheezing persists and speech remains limited to short phrases. Blood pressure is still below the patient’s baseline. The nurse has emergency assistance at the bedside.',
    [
      'Five minutes since initial epinephrine',
      'Rash improving',
      'Persistent limited speech and wheeze',
      'Blood pressure remains low',
    ],
    'Which finding should drive the next protocol reassessment?',
    [
      yes(
        'Persistent breathing and circulation compromise',
        'Airway, breathing and circulation response determines ongoing emergency treatment, not fading skin findings.',
        [0, 2, 3]
      ),
      no(
        'Extent of the remaining skin eruption',
        'Skin improvement does not establish resolution of respiratory or circulatory anaphylaxis.',
        'The rash was the first visible reaction.',
        'misprioritization',
        [1, 2, 3]
      ),
      no(
        'Time until an antihistamine becomes effective',
        'Waiting for an adjunct would leave active life-threatening compromise untreated.',
        'An adjunct may already have been prescribed.',
        'misprioritization',
        [0, 2, 3]
      ),
      no(
        'Whether wheeze resembles prior mild asthma',
        'Prior asthma does not explain concurrent post-exposure hypotension or remove the anaphylaxis concern.',
        'The patient recognizes the sound from asthma episodes.',
        'premature_closure',
        [2, 3]
      ),
    ],
    [
      'Compare response across affected systems',
      'Prioritize persistent ABC compromise over skin improvement',
    ],
    'Reassess the outcomes that define immediate danger; improvement in one system may coexist with ongoing anaphylaxis.',
    ['anaphylaxis']
  ),
  acute(
    'challenge',
    'Compensated blood loss after trauma',
    'A motorcyclist initially had a blood pressure of 126/78 and heart rate of 92. Twenty minutes later the pressure is 118/76 and heart rate is 124. The patient is increasingly restless with cool hands. No major external bleeding is visible.',
    [
      'Rising heart rate over twenty minutes',
      'Blood pressure remains near normal',
      'New restlessness',
      'Cool peripheral skin',
    ],
    'Which interpretation should prompt the next trauma reassessment?',
    [
      yes(
        'Possible occult blood loss with compensation',
        'A preserved pressure can coexist with worsening tissue perfusion and hidden hemorrhage.',
        [0, 1, 2, 3]
      ),
      no(
        'Adequate circulation with pain-related tachycardia',
        'Pain may contribute, but cool skin and changing mentation make that explanation insufficient.',
        'Blood pressure appears reassuring and trauma is painful.',
        'premature_closure',
        [1, 2, 3]
      ),
      no(
        'Isolated anxiety with stable hemodynamics',
        'Restlessness plus progressive tachycardia and cool extremities warrants a perfusion assessment.',
        'The patient is frightened after a crash.',
        'cue_misinterpretation',
        [0, 2, 3]
      ),
      no(
        'Measurement variation without a meaningful trend',
        'Multiple concordant clinical changes support deterioration rather than isolated monitor variation.',
        'The systolic pressure changed only modestly.',
        'outdated_data',
        [0, 1, 2, 3]
      ),
    ],
    [
      'Integrate serial observations',
      'Recognize compensation before hypotension',
    ],
    'Trend heart rate, mentation and skin perfusion together instead of using a normal pressure as a rule-out test for hemorrhage.',
    ['traumaAssessment', 'deterioration']
  ),
  acute(
    'challenge',
    'Oxygen masking sedation-related hypoventilation',
    'After an opioid-assisted procedure, a patient’s oxygen saturation remains 97% on supplemental oxygen. Over ten minutes respiratory rate falls from fourteen to seven. The patient now needs repeated stimulation to keep breathing deeply. The capnography trend rises despite a consistent waveform.',
    [
      'Respiratory rate falling',
      'Increasing stimulation needed',
      'Rising carbon dioxide trend',
      'Saturation maintained on oxygen',
    ],
    'Which response best addresses this trend?',
    [
      yes(
        'Support ventilation and call for immediate sedation review',
        'Declining ventilation and consciousness take priority even when supplemental oxygen maintains saturation.',
        [0, 1, 2, 3]
      ),
      no(
        'Titrate oxygen downward and repeat oximetry',
        'Lowering oxygen does not treat ventilatory impairment and may expose the patient to hypoxemia.',
        'A high saturation can make excess oxygen seem central.',
        'cue_misinterpretation',
        [2, 3]
      ),
      no(
        'Increase stimulation and continue the recovery pathway',
        'Repeated stimulation is not reliable sustained ventilation or adequate management of deterioration.',
        'Breathing temporarily improves when the patient is prompted.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'Check the capnography connection before changing care',
        'A consistent waveform plus concordant clinical deterioration makes artifact a secondary concern.',
        'Equipment error can alter carbon dioxide readings.',
        'misprioritization',
        [0, 1, 2]
      ),
    ],
    [
      'Distinguish oxygenation from ventilation',
      'Prioritize a deteriorating respiratory trend',
    ],
    'A satisfactory saturation on oxygen does not offset shallow breathing, sedation and evidence of carbon dioxide retention.',
    ['opioidSafety', 'ventilatoryFailure']
  ),
  acute(
    'challenge',
    'Traumatic respiratory collapse before imaging',
    'A patient with chest trauma becomes rapidly more breathless while awaiting imaging. Oxygen saturation falls and systolic pressure drops to 78. Right-sided breath sounds are now absent. The trauma clinician is at the bedside and decompression equipment is ready.',
    [
      'Rapid respiratory deterioration',
      'New hypotension',
      'Absent right air entry',
      'Chest trauma',
    ],
    'Which preparation should take priority?',
    [
      yes(
        'Prepare immediate clinician-led chest decompression',
        'Severe respiratory compromise and instability with suspected tension pneumothorax justify treatment before imaging.',
        [0, 1, 2, 3]
      ),
      no(
        'Prepare transfer for confirmatory chest CT',
        'Transport and confirmation would delay treatment of a clinical life threat in an unstable patient.',
        'CT can distinguish several traumatic chest injuries.',
        'misprioritization',
        [0, 1, 3]
      ),
      no(
        'Prepare analgesia followed by a repeat chest examination',
        'Pain treatment does not address the combination of absent air entry and hemodynamic collapse.',
        'Chest pain can cause shallow breathing.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'Prepare bronchodilator therapy with oxygen escalation',
        'Bronchodilation will not decompress trapped pleural air or resolve obstructive shock.',
        'The immediate presentation includes severe breathlessness.',
        'cue_misinterpretation',
        [1, 2, 3]
      ),
    ],
    [
      'Link respiratory asymmetry to circulatory collapse',
      'Prioritize treatment before confirmatory transport',
    ],
    'Imaging supports care when safe; it should not delay clinician-led treatment of suspected tension physiology in an unstable patient.',
    ['traumaAssessment']
  ),
  acute(
    'challenge',
    'Organ dysfunction despite a falling temperature',
    'A patient receiving treatment for infection has a lower temperature than earlier. During the same two hours, urine output falls and the patient becomes inattentive. Respiratory rate rises from twenty to thirty. The nurse is asked whether the treatment appears effective.',
    [
      'Temperature falling after treatment',
      'Urine output falling',
      'New inattention',
      'Respiratory rate rising',
    ],
    'Which report best supports the next clinical decision?',
    [
      yes(
        'Escalate possible organ dysfunction despite temperature improvement',
        'Worsening respiratory, renal and mental-status observations outweigh an isolated improvement in fever.',
        [0, 1, 2, 3]
      ),
      no(
        'Report fever control and continue the current observation interval',
        'Temperature alone does not demonstrate adequate perfusion or reversal of organ dysfunction.',
        'Fever is often used to track infection response.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'Request treatment for agitation before repeating observations',
        'Inattention may reflect deterioration; suppressing it does not evaluate the cause.',
        'New behavior changes can disrupt monitoring.',
        'misprioritization',
        [2, 3]
      ),
      no(
        'Attribute low output to earlier poor oral intake',
        'Earlier intake does not adequately explain simultaneous respiratory and cognitive deterioration.',
        'The patient drank little before admission.',
        'outdated_data',
        [1, 2, 3]
      ),
    ],
    [
      'Compare treatment response with new organ findings',
      'Prioritize converging deterioration cues',
    ],
    'Judge infection response through organ function and repeated assessment rather than a single improving variable.',
    ['sepsis', 'deterioration']
  ),
  acute(
    'advanced',
    'Recurrent airway symptoms after apparent recovery',
    'A patient treated for anaphylaxis initially regained normal speech and blood pressure. Forty minutes later the patient develops hoarseness and dizziness without a recurrent rash. Blood pressure falls to 86/54 and the infusion trigger has remained disconnected. The patient received a bronchodilator earlier and wheeze is now minimal. The emergency clinician is still available in the unit.',
    [
      'Documented initial response',
      'Recurrent hoarseness',
      'New hypotension',
      'No recurrent rash',
      'Trigger remains removed',
      'Minimal wheeze after bronchodilator',
    ],
    'Which plan best evaluates this change and anticipates the immediate risk?',
    [
      yes(
        'Reactivate the anaphylaxis response and reassess airway and perfusion',
        'Recurrent airway and circulatory compromise can occur without rash; urgent reassessment and protocol treatment address renewed risk.',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Treat residual bronchospasm and reassess after the next nebulizer',
        'Minimal wheeze does not account for hoarseness and shock; a bronchodilator cannot replace systemic emergency treatment.',
        'There was wheeze during the first reaction.',
        'premature_closure',
        [1, 2, 5]
      ),
      no(
        'Investigate vasovagal symptoms while maintaining the observation schedule',
        'Dizziness and hypotension could be vasovagal, but recurrent airway symptoms make that a dangerous early closure.',
        'The trigger is removed and the skin remains clear.',
        'cue_misinterpretation',
        [1, 2, 3, 4]
      ),
      no(
        'Prioritize delayed medication effects and repeat allergy documentation',
        'Documentation and medication review are useful later but do not address active airway and circulation threats.',
        'Several rescue medicines were recently administered.',
        'misprioritization',
        [1, 2, 5]
      ),
    ],
    [
      'Reopen the differential after an initial response',
      'Identify renewed ABC compromise despite absent skin findings',
      'Anticipate recurrent airway obstruction and shock',
    ],
    'Treatment response is provisional; a new dangerous pattern warrants renewed evaluation even when the original trigger and rash are absent.',
    ['anaphylaxis'],
    {
      conflict:
        'Initial recovery and clear skin contrast with recurrent hoarseness and hypotension.',
      anticipation:
        'Recurrent airway obstruction or circulatory collapse requires immediate reassessment.',
      uncertainty:
        'The pattern supports recurrent anaphylaxis but does not exclude other causes of hypotension.',
    }
  ),
  acute(
    'advanced',
    'Pelvic trauma with a negative FAST',
    'A patient with a high-energy pelvic injury has a negative initial FAST examination. After initial resuscitation, systolic pressure briefly rises to 110 but falls to 84 during reassessment. Heart rate is 132 and the patient becomes confused. The abdomen is not distended, while pelvic pain remains severe. Hemoglobin from arrival was within the laboratory range and no external bleeding is seen.',
    [
      'High-energy pelvic mechanism',
      'Transient pressure response then recurrent hypotension',
      'Tachycardia',
      'New confusion',
      'Negative initial FAST',
      'Initial hemoglobin within range',
      'No external bleeding',
    ],
    'Which handover most appropriately guides the next trauma decision?',
    [
      yes(
        'Suspect uncontrolled occult hemorrhage and request immediate source-control review',
        'Transient response with poor perfusion demands an urgent hemorrhage pathway; FAST and early hemoglobin do not exclude pelvic or retroperitoneal bleeding.',
        [0, 1, 2, 3, 4, 5, 6]
      ),
      no(
        'Repeat focused abdominal imaging to localize loss before escalating the source-control pathway',
        'Repeat imaging may help selectively, but should not gate resuscitation and source-control assessment in renewed instability.',
        'The first rapid imaging test was negative.',
        'misprioritization',
        [1, 3, 4]
      ),
      no(
        'Use an analgesia response and repeat pressure to distinguish pain-related sympathetic changes',
        'Pain can drive tachycardia, but recurrent hypotension and confusion are not safely explained by pain.',
        'The patient reports severe pelvic pain.',
        'premature_closure',
        [0, 1, 2, 3]
      ),
      no(
        'Use a repeat hemoglobin threshold to determine when blood-product preparation is needed',
        'Early concentration can remain normal in acute bleeding and cannot overrule serial perfusion findings.',
        'The available laboratory result appears reassuring.',
        'outdated_data',
        [1, 3, 5]
      ),
    ],
    [
      'Interpret transient resuscitation response',
      'Reconcile negative tests with persistent perfusion failure',
      'Anticipate continuing concealed hemorrhage',
    ],
    'Dynamic perfusion and mechanism guide escalation when early tests have important blind spots.',
    ['traumaAssessment'],
    {
      conflict:
        'Negative FAST and normal early hemoglobin contrast with recurrent shock.',
      anticipation:
        'Further decompensation without definitive bleeding control.',
      uncertainty: 'The bleeding location and volume remain unconfirmed.',
    }
  ),
  acute(
    'advanced',
    'Head injury complicated by falling perfusion',
    'A patient with a head injury becomes less responsive during trauma resuscitation. The initial team focused on intracranial injury because a scalp wound was present. Blood pressure now falls from 122/76 to 82/50 while the pulse rises to 128. The patient also has abdominal tenderness and cool extremities. Pupils remain equal and glucose is normal.',
    [
      'Decreasing responsiveness',
      'Marked falling blood pressure',
      'Rising pulse',
      'Abdominal tenderness',
      'Cool extremities',
      'Equal pupils and normal glucose',
    ],
    'Which reassessment plan best protects the patient while testing the working explanation?',
    [
      yes(
        'Reassess extracranial hemorrhage while supporting cerebral oxygenation and perfusion',
        'Hypotension with abdominal and systemic perfusion findings requires a renewed bleeding survey while preventing secondary brain injury.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Complete a focused intracranial reassessment before revising the extracranial bleeding evaluation',
        'Serial pupils matter, but equal pupils cannot exclude brain injury or explain systemic hemorrhagic signs.',
        'Consciousness change followed an obvious head injury.',
        'premature_closure',
        [0, 1, 3, 5]
      ),
      no(
        'Use a fluid-restrictive strategy until the risk of cerebral swelling has been clarified',
        'A blanket restriction despite profound hypotension risks secondary ischemic brain injury and ignores suspected blood loss.',
        'Intracranial swelling is a concern after head trauma.',
        'cue_misinterpretation',
        [0, 1, 4]
      ),
      no(
        'Prioritize sedation and brain imaging to define the injury before revising the perfusion plan',
        'CT planning should follow immediate stabilization and threat assessment in this deteriorating patient.',
        'Urgent brain imaging may be necessary.',
        'misprioritization',
        [0, 1, 3]
      ),
    ],
    [
      'Challenge anchoring on the head injury',
      'Integrate systemic shock cues',
      'Anticipate secondary ischemic brain injury',
    ],
    'A declining neurologic examination can have simultaneous intracranial and systemic causes; address threats to both.',
    ['traumaAssessment', 'headInjury'],
    {
      conflict:
        'The visible head injury anchors attention, but circulatory and abdominal changes suggest another active threat.',
      anticipation:
        'Hypotension and hypoxia can worsen secondary brain injury.',
      uncertainty:
        'Neither equal pupils nor systemic shock establishes the intracranial diagnosis.',
    }
  ),
  acute(
    'advanced',
    'Partial arousal after opioid reversal',
    'An older adult with renal impairment becomes somnolent after opioid analgesia. Following protocol-directed reversal, the patient opens their eyes and answers a question. Ten minutes later respirations become shallow again at eight per minute. Saturation is 96% on oxygen, and the last opioid dose was given over an hour ago. The patient’s pain is increasing and the recovery unit is preparing a transfer.',
    [
      'Renal impairment',
      'Recent opioid exposure',
      'Temporary response to reversal',
      'Recurrent shallow bradypnea',
      'Saturation maintained with oxygen',
      'Transfer planned despite recurrence',
    ],
    'Which disposition plan best accounts for the evolving evidence?',
    [
      yes(
        'Maintain monitored rescue-capable care and reassess recurrent ventilatory impairment',
        'Recurrent impairment after temporary reversal needs ongoing respiratory support and clinician review before transfer.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Transfer with continuous oximetry and oxygen after the initial arousal response',
        'The earlier response is not sustained and oxygen saturation does not demonstrate adequate ventilation.',
        'The patient briefly became conversational.',
        'outdated_data',
        [2, 3, 4, 5]
      ),
      no(
        'Prioritize a revised analgesia plan to improve respiratory depth before disposition review',
        'Pain needs treatment, but additional opioid before assessing recurrent bradypnea may worsen respiratory impairment.',
        'Pain has returned after reversal.',
        'misprioritization',
        [1, 3]
      ),
      no(
        'Use an intermittent sedation score to determine readiness once the patient can answer a question',
        'A brief arousal response and intermittent score do not establish sustained ventilation after recurrent bradypnea. The disposition must account for the recurrent impairment and need for rescue-capable monitoring.',
        'Responsiveness is a familiar recovery criterion and may improve transiently after stimulation.',
        'premature_closure',
        [0, 1, 3]
      ),
    ],
    [
      'Evaluate whether reversal produced a sustained response',
      'Distinguish oxygenation from ventilation',
      'Anticipate resedation during transfer',
    ],
    'A brief return of responsiveness does not establish durable respiratory recovery or readiness for a less monitored setting.',
    ['opioidSafety', 'medicationSafety'],
    {
      conflict:
        'Brief conversation and normal saturation contrast with recurrent shallow bradypnea.',
      anticipation:
        'Recurrent ventilatory impairment may occur beyond the initial rescue response.',
      uncertainty:
        'Drug effect is likely but alternative contributors still require assessment.',
    }
  ),
  acute(
    'advanced',
    'Infection resuscitation with competing fluid signals',
    'A patient with infection and reduced cardiac reserve receives a prescribed fluid challenge. Mean arterial pressure rises slightly, but capillary refill remains prolonged and urine output stays low. New crackles appear and the oxygen requirement increases. The patient is more attentive but still reports breathlessness. Another fluid bolus is on the proposed plan.',
    [
      'Infection with limited cardiac reserve',
      'Small pressure improvement',
      'Persistent prolonged refill',
      'Persistent low urine output',
      'New crackles',
      'Rising oxygen requirement',
      'Improved attention',
    ],
    'What should the nurse request before the next bolus?',
    [
      yes(
        'Immediate reassessment of fluid responsiveness and respiratory intolerance',
        'Persistent poor perfusion plus new congestion requires individualized review rather than reflexively repeating fluid.',
        [0, 1, 2, 3, 4, 5, 6]
      ),
      no(
        'A repeat of the initial fluid challenge using urine output as the next response target',
        'Urine output alone cannot establish ongoing fluid responsiveness; new respiratory intolerance changes the risk.',
        'Renal perfusion has not recovered.',
        'cue_misinterpretation',
        [3, 4, 5]
      ),
      no(
        'A decongestion-first plan using the new crackles as the dominant treatment endpoint',
        'Congestion is important, but persistent shock requires integrated hemodynamic review before choosing fluid removal.',
        'New crackles suggest excess lung water.',
        'premature_closure',
        [1, 2, 3, 4]
      ),
      no(
        'Continuation of the present strategy while comparing attention at the next observation',
        'One improving sign does not resolve persistent hypoperfusion and increasing respiratory support.',
        'Mental status often reflects improved circulation.',
        'outdated_data',
        [2, 3, 5, 6]
      ),
    ],
    [
      'Weigh perfusion benefit against respiratory harm',
      'Identify an incomplete resuscitation response',
      'Anticipate worsening pulmonary edema',
    ],
    'Evaluate treatment across systems; persisting hypoperfusion does not automatically justify more of a treatment that is producing harm.',
    ['fluids', 'sepsis'],
    {
      conflict:
        'Small pressure and attention gains coexist with poor perfusion and new respiratory intolerance.',
      anticipation:
        'Additional fluid could worsen respiratory failure without restoring organ perfusion.',
      uncertainty:
        'The bedside observations do not establish volume responsiveness or the optimal next hemodynamic therapy.',
    }
  ),
  neuro(
    'foundation',
    'Sudden focal neurologic change',
    'A hospitalized adult suddenly develops right arm weakness. Their speech becomes difficult to understand. They were speaking normally with the nurse a few minutes earlier. The nurse is at the bedside.',
    [
      'Sudden unilateral weakness',
      'New speech change',
      'Recent normal function',
    ],
    'Which response is most appropriate?',
    [
      yes(
        'Activate the acute stroke response',
        'Sudden focal deficits require immediate stroke assessment.',
        [0, 1, 2]
      ),
      no(
        'Complete a routine fall-risk reassessment',
        'Fall prevention matters but cannot replace time-sensitive neurologic evaluation.',
        'New weakness increases fall risk.',
        'misprioritization',
        [0]
      ),
      no(
        'Repeat strength testing after assisted walking',
        'Walking adds risk and delays evaluation of an acute focal change.',
        'Mobility can clarify functional weakness.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Request a speech-therapy assessment first',
        'Speech therapy may follow, but the new deficit needs emergency assessment first.',
        'The speech difficulty is prominent.',
        'misprioritization',
        [1, 2]
      ),
    ],
    ['Recognize an acute focal deficit'],
    'A sudden focal change initiates a time-sensitive pathway before rehabilitation assessments.',
    ['stroke']
  ),
  neuro(
    'foundation',
    'Oral medication after a new stroke',
    'An adult admitted with a new stroke is due oral medication. Swallow safety has not yet been assessed. The patient coughs when managing saliva. The nurse is preparing the medication round.',
    ['Swallow safety unassessed', 'Cough with saliva'],
    'Which action is appropriate before giving the tablets?',
    [
      yes(
        'Withhold oral intake pending a validated swallow screen',
        'An unassessed swallow with coughing creates aspiration risk.',
        [0, 1]
      ),
      no(
        'Crush the tablets into soft food',
        'Changing consistency does not establish that swallowing is safe.',
        'Soft food seems easier to swallow.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Give one tablet with a small sip',
        'An informal medication trial is not a validated screen and may cause aspiration.',
        'A small amount may appear low risk.',
        'premature_closure',
        [0]
      ),
      no(
        'Use a straw to control the water',
        'A straw does not establish airway protection.',
        'Controlled amounts seem easier to manage.',
        'cue_misinterpretation',
        [0, 1]
      ),
    ],
    ['Identify an aspiration-risk cue'],
    'Assess swallow safety before oral intake; changing texture is not a substitute for screening.',
    ['stroke', 'deterioration']
  ),
  neuro(
    'foundation',
    'A changed consciousness score',
    'A patient is observed after a head injury. The previous Glasgow Coma Scale score was fifteen. The patient now opens their eyes only to voice and is newly confused. The nurse repeats the examination and confirms the change.',
    [
      'Documented neurologic baseline',
      'Confirmed reduction in responsiveness',
      'New confusion',
    ],
    'What should the nurse do with this result?',
    [
      yes(
        'Escalate the confirmed neurologic deterioration',
        'A confirmed decline after head injury needs urgent reassessment.',
        [0, 1, 2]
      ),
      no(
        'Use the prior score for the observation chart',
        'Earlier function cannot replace the current examination.',
        'The earlier score was normal.',
        'outdated_data',
        [0, 1]
      ),
      no(
        'Complete discharge teaching while the patient is awake',
        'Being awake does not negate a significant decline from baseline.',
        'The patient still responds to voice.',
        'premature_closure',
        [1, 2]
      ),
      no(
        'Reassess after the scheduled rest period',
        'New confusion and reduced responsiveness should not await routine checks.',
        'Sleepiness can follow an exhausting injury.',
        'cue_misinterpretation',
        [1, 2]
      ),
    ],
    ['Compare current findings with baseline'],
    'Neurologic observation detects change; a previously normal assessment does not clear a new decline.',
    ['headInjury']
  ),
  neuro(
    'foundation',
    'Airway position after a seizure',
    'A patient’s generalized seizure has stopped. They are breathing spontaneously but remain drowsy. Saliva pools at the mouth and no trauma is suspected. The nurse is supporting recovery.',
    [
      'Post-seizure drowsiness',
      'Secretions pooling with spontaneous breathing',
    ],
    'Which positioning action best supports immediate airway safety?',
    [
      yes(
        'Place the patient in a lateral recovery position',
        'Lateral positioning supports drainage while the patient recovers airway control.',
        [0, 1]
      ),
      no(
        'Position flat with the chin flexed',
        'Chin flexion can worsen upper-airway obstruction and does not promote drainage.',
        'A flat surface facilitates observation.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Sit the patient unsupported at the bedside',
        'Drowsiness makes unsupported sitting unsafe and does not ensure airway protection.',
        'Upright posture can help breathing in alert patients.',
        'cue_misinterpretation',
        [0]
      ),
      no(
        'Turn the head while leaving the body supine',
        'A full recovery position better supports drainage and a stable airway than head turning alone.',
        'Turning the face may allow some saliva to escape.',
        'misprioritization',
        [1]
      ),
    ],
    ['Recognize impaired secretion management'],
    'Match positioning to airway control and consciousness while continuing respiratory observation.',
    ['deterioration']
  ),
  neuro(
    'foundation',
    'Abrupt severe headache onset',
    'An adult describes a headache that reached maximum intensity within seconds. They say it is unlike previous headaches. The patient can currently speak clearly. The nurse is obtaining the initial symptom history.',
    ['Abrupt peak intensity', 'Different from previous headaches'],
    'Which feature most strongly supports urgent evaluation for a secondary cause?',
    [
      yes(
        'The headache reached maximum intensity within seconds',
        'A thunderclap onset is a red flag requiring urgent investigation.',
        [0]
      ),
      no(
        'The patient can describe the headache clearly',
        'Clear speech does not exclude a dangerous intracranial cause.',
        'Preserved conversation seems neurologically reassuring.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'The patient has experienced headaches before',
        'Prior headaches do not explain a distinctly different abrupt event.',
        'A headache history suggests a familiar pattern.',
        'outdated_data',
        [1]
      ),
      no(
        'The pain remains severe during the interview',
        'Severity matters, but the abrupt onset pattern is the more discriminating feature here.',
        'Pain intensity often drives triage.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Recognize a secondary-headache red flag'],
    'The onset pattern can be more discriminating than pain severity or a normal conversation.',
    ['suddenHeadache']
  ),
  neuro(
    'challenge',
    'Persistent focal deficits after glucose correction',
    'A patient develops unilateral weakness with a low bedside glucose. Protocol-directed treatment returns glucose to the normal range. Fifteen minutes later the weakness and word-finding difficulty remain. The patient’s alertness has improved.',
    [
      'Low glucose treated',
      'Glucose normalized',
      'Persistent unilateral weakness',
      'Persistent language deficit',
      'Improved alertness',
    ],
    'Which action best follows the reassessment?',
    [
      yes(
        'Continue urgent stroke evaluation for persistent focal deficits',
        'Correcting one mimic does not explain residual focal deficits.',
        [1, 2, 3, 4]
      ),
      no(
        'Repeat glucose treatment before contacting the stroke team',
        'The current glucose is normal and persistent focal findings need another explanation.',
        'Hypoglycemia caused some initial symptoms.',
        'outdated_data',
        [0, 1, 2]
      ),
      no(
        'Observe until all symptoms resolve after glucose recovery',
        'Waiting assumes hypoglycemia explains the entire presentation despite discordant recovery.',
        'Mental status already improved with treatment.',
        'premature_closure',
        [2, 3, 4]
      ),
      no(
        'Begin rehabilitation assessment for residual weakness',
        'Rehabilitation follows acute evaluation rather than replacing time-sensitive diagnostic care.',
        'Persistent weakness may require therapy.',
        'misprioritization',
        [2, 3]
      ),
    ],
    [
      'Compare expected and observed response',
      'Prioritize unexplained focal deficits',
    ],
    'Reassess after treating a mimic; residual focal changes keep time-sensitive alternatives active.',
    ['stroke', 'reasoning']
  ),
  neuro(
    'challenge',
    'A focal deficit that resolved',
    'A patient had ten minutes of left arm weakness and speech difficulty at home. Both symptoms resolved before arrival. The current examination is normal. The episode occurred an hour ago and was clearly different from baseline.',
    [
      'Transient focal weakness',
      'Transient speech change',
      'Recent resolution',
      'Normal current examination',
    ],
    'Which plan should the nurse support?',
    [
      yes(
        'Urgent assessment for a transient ischemic event',
        'Resolution does not eliminate the need for urgent evaluation and prevention planning.',
        [0, 1, 2, 3]
      ),
      no(
        'Routine follow-up because the examination is now normal',
        'A normal later examination does not negate the recent focal episode.',
        'The presenting problem has disappeared.',
        'premature_closure',
        [2, 3]
      ),
      no(
        'Recreate symptoms with supervised exercise before referral',
        'Provoking symptoms is not needed and delays assessment of a recent neurologic event.',
        'There is no current deficit to examine.',
        'misprioritization',
        [0, 2, 3]
      ),
      no(
        'Document muscle fatigue as the working explanation',
        'Combined unilateral weakness and language change is not adequately explained by isolated muscle fatigue.',
        'The weakness was brief and recovered.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
    ],
    [
      'Interpret a transient focal pattern',
      'Prioritize evaluation despite resolution',
    ],
    'History remains diagnostic evidence when a dangerous intermittent event is no longer visible.',
    ['stroke']
  ),
  neuro(
    'challenge',
    'Failure to recover after seizure',
    'A patient’s convulsion stopped twenty minutes ago. Earlier seizures were followed by progressive awakening within several minutes. The patient remains unresponsive and has intermittent subtle facial twitching. Glucose and oxygen saturation are satisfactory.',
    [
      'Recovery slower than prior baseline',
      'Persistent unresponsiveness',
      'Intermittent focal twitching',
      'Glucose and oxygenation satisfactory',
    ],
    'Which request best addresses the current concern?',
    [
      yes(
        'Urgent assessment for ongoing seizure activity',
        'Absent expected recovery plus subtle motor activity requires evaluation for continuing seizure.',
        [0, 1, 2, 3]
      ),
      no(
        'Extend routine postictal observation without review',
        'The atypical course and continuing motor signs argue against assuming ordinary recovery.',
        'Postictal drowsiness can last after a seizure.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'Administer oral maintenance medication immediately',
        'An unresponsive patient cannot safely take oral medication and needs urgent assessment.',
        'A missed maintenance dose may have triggered the event.',
        'misprioritization',
        [1, 2]
      ),
      no(
        'Attribute twitching to recovery-related shivering',
        'Intermittent facial motor activity with absent recovery needs investigation before that conclusion.',
        'Small movements can be nonspecific.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
    ],
    [
      'Compare recovery with baseline',
      'Recognize possible ongoing neurologic activity',
    ],
    'A postictal label should be revisited when recovery stalls or new motor findings appear.',
    ['deterioration', 'reasoning']
  ),
  neuro(
    'challenge',
    'New symptoms after a reassuring head scan',
    'A patient on anticoagulation had a reassuring initial CT after a fall. Two hours later the headache intensifies and vomiting begins. The nurse confirms a new decrease in verbal responsiveness. No additional sedating medicine has been given.',
    [
      'Anticoagulant exposure',
      'Earlier reassuring CT',
      'Worsening headache and new vomiting',
      'New responsiveness decline',
    ],
    'Which response best uses the new information?',
    [
      yes(
        'Request urgent reassessment for evolving intracranial injury',
        'New neurologic deterioration supersedes reassurance from an earlier scan.',
        [0, 1, 2, 3]
      ),
      no(
        'Treat nausea and continue the original discharge plan',
        'Symptom treatment should not replace reassessment of new neurologic decline.',
        'The initial investigation was reassuring.',
        'outdated_data',
        [1, 2, 3]
      ),
      no(
        'Attribute vomiting to a concussion without further review',
        'Concussion is possible but cannot safely explain deterioration without reassessment.',
        'Vomiting can occur after minor head injury.',
        'premature_closure',
        [2, 3]
      ),
      no(
        'Repeat the medication history before escalating the examination',
        'History is useful, but a confirmed neurologic decline needs immediate clinical review.',
        'Anticoagulation changes bleeding risk.',
        'misprioritization',
        [0, 3]
      ),
    ],
    [
      'Interpret change after an earlier negative test',
      'Prioritize current neurologic function',
    ],
    'A negative investigation is time-bound evidence, not permanent clearance of subsequent deterioration.',
    ['headInjury']
  ),
  neuro(
    'challenge',
    'Suspected meningitis with deteriorating physiology',
    'A patient has fever, severe headache and neck stiffness. While preparations for lumbar puncture are discussed, blood pressure falls and the patient becomes less alert. Respiratory rate increases. The treatment team is present but antibiotics have not yet started.',
    [
      'Meningeal symptoms with fever',
      'Falling blood pressure',
      'Declining alertness',
      'Increasing respiratory rate',
      'Treatment not yet initiated',
    ],
    'Which priority should the nurse raise?',
    [
      yes(
        'Stabilization and urgent treatment without delaying for lumbar puncture',
        'Deterioration changes procedural safety and makes treatment delay hazardous.',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Complete lumbar puncture before any treatment is given',
        'Diagnostic yield does not justify delaying urgent treatment in an unstable patient.',
        'Pretreatment samples can improve organism identification.',
        'misprioritization',
        [1, 2, 4]
      ),
      no(
        'Complete the full neurologic history before activating escalation',
        'History cannot take priority over worsening circulation and consciousness.',
        'The headache diagnosis remains uncertain.',
        'misprioritization',
        [1, 2, 3]
      ),
      no(
        'Control the fever before reassessing procedural readiness',
        'Reducing temperature does not correct the immediate instability or treat the underlying emergency.',
        'Fever can contribute to tachypnea and discomfort.',
        'cue_misinterpretation',
        [0, 1, 2, 3]
      ),
    ],
    [
      'Recognize instability during diagnostic planning',
      'Prioritize stabilization and treatment',
    ],
    'Investigations support the diagnosis, but instability can alter their timing and urgency.',
    ['meningitis', 'sepsis']
  ),
  neuro(
    'advanced',
    'Wake-up deficit with uncertain onset',
    'A patient wakes at 06:30 with aphasia and arm weakness. A spouse reports normal conversation at 22:00 before sleep. The patient briefly awakened at 03:00 but did not speak or move out of bed. Glucose is normal and the deficit remains disabling. Blood pressure is elevated, and the stroke team is assembling.',
    [
      'Normal function documented at 22:00',
      'Deficit discovered at 06:30',
      'Unassessed awakening at 03:00',
      'Persistent aphasia and weakness',
      'Normal glucose',
      'Elevated blood pressure',
    ],
    'Which handover best preserves treatment options without inventing onset certainty?',
    [
      yes(
        'Report 22:00 last-known-well and 06:30 discovery for urgent specialist selection',
        'Separate known normal function from discovery; specialist imaging and criteria determine eligibility.',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Report 03:00 onset because the patient awakened then',
        'Awakening without a neurologic assessment does not establish normal function or symptom onset.',
        'The intermediate awakening seems temporally informative.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'Report 06:30 onset and prepare treatment on that time alone',
        'Discovery is not known onset and cannot independently establish eligibility.',
        'That is when the deficit was first observed.',
        'premature_closure',
        [0, 1, 3]
      ),
      no(
        'Report the event as outside treatment consideration before imaging',
        'Uncertain onset does not justify excluding specialist assessment and imaging-based options.',
        'The last confirmed normal state was overnight.',
        'premature_closure',
        [0, 1, 3]
      ),
    ],
    [
      'Distinguish last-known-well from discovery',
      'Preserve uncertainty during time-sensitive escalation',
      'Anticipate specialist imaging-based selection',
    ],
    'Accurate uncertainty is useful clinical information; falsely precise timing can distort a treatment decision.',
    ['strokeTiming', 'stroke'],
    {
      conflict:
        'A reported overnight awakening provides no assessed neurologic baseline.',
      anticipation:
        'Specialist imaging and eligibility assessment may identify time-sensitive options.',
      uncertainty: 'Actual onset during sleep is unknown.',
    }
  ),
  neuro(
    'advanced',
    'Focal deficit with anticoagulation uncertainty',
    'A patient develops aphasia and hemiparesis shortly after admission. The medication list includes an anticoagulant, but the last dose is uncertain. Glucose is low and is corrected promptly. Alertness improves while the focal deficit remains. The family reports no prior weakness, and urgent brain imaging is being arranged.',
    [
      'New aphasia and hemiparesis',
      'Anticoagulant listed',
      'Last dose unknown',
      'Glucose corrected',
      'Alertness improved but focal deficit persists',
      'No prior focal baseline',
    ],
    'Which nursing handover best guides immediate evaluation?',
    [
      yes(
        'Maintain stroke activation and reconcile anticoagulant timing during imaging preparation',
        'Persistent focal findings require urgent imaging; medication uncertainty must be communicated without prematurely choosing a stroke type or treatment.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Extend observation of the glucose response before revising the diagnostic pathway',
        'Current normoglycemia with persistent focal deficits argues against treating the old glucose as the entire explanation.',
        'Some symptoms improved after glucose treatment.',
        'outdated_data',
        [3, 4]
      ),
      no(
        'Lead with an anticoagulant-related hemorrhage hypothesis and request a hemorrhage-focused pathway',
        'Anticoagulant exposure raises bleeding concern but does not establish hemorrhage without imaging.',
        'Anticoagulation increases bleeding risk.',
        'premature_closure',
        [1, 2]
      ),
      no(
        'Complete medication verification before continuing the reperfusion-selection pathway',
        'Medication clarification is urgent but should occur alongside imaging and specialist assessment, not block the pathway.',
        'Uncertain anticoagulant exposure affects treatment eligibility.',
        'misprioritization',
        [0, 1, 2, 4]
      ),
    ],
    [
      'Reassess a treated mimic',
      'Separate risk factors from confirmed stroke type',
      'Anticipate treatment implications of uncertain anticoagulation',
    ],
    'Parallel assessment preserves time while making medication-related uncertainty explicit to the decision maker.',
    ['stroke', 'medicationSafety', 'reasoning'],
    {
      conflict:
        'Improved alertness after glucose correction contrasts with unchanged focal deficits.',
      anticipation:
        'Imaging and anticoagulant information affect safe treatment selection.',
      uncertainty:
        'Stroke type and recent anticoagulant activity remain unknown.',
    }
  ),
  neuro(
    'advanced',
    'Thunderclap headache after delayed negative imaging',
    'A patient presents twelve hours after an abrupt maximal headache. The initial CT is reported as showing no acute hemorrhage. Pain improves after analgesia, but the patient recalls brief collapse at onset and still has neck discomfort. The examination is currently nonfocal. Discharge is proposed because the scan and current examination are reassuring.',
    [
      'Abrupt maximal onset',
      'Twelve-hour delay before CT',
      'Negative initial CT',
      'Collapse at onset',
      'Persistent neck discomfort',
      'Analgesic response',
      'Nonfocal examination',
    ],
    'Which concern should the nurse raise before discharge?',
    [
      yes(
        'Residual subarachnoid hemorrhage risk requiring senior diagnostic review',
        'Timing affects the meaning of a negative CT; the red-flag history warrants review of further investigation despite symptom relief.',
        [0, 1, 2, 3, 4, 5, 6]
      ),
      no(
        'A primary-headache discharge pathway based on analgesic response and the nonfocal examination',
        'Analgesic improvement does not discriminate migraine from a dangerous secondary headache.',
        'Pain improved and examination is nonfocal.',
        'premature_closure',
        [0, 3, 5, 6]
      ),
      no(
        'A symptom-resolution threshold for discharge after another supervised analgesic trial',
        'Symptom resolution cannot settle the diagnostic question created by the onset history and imaging timing.',
        'Clinical comfort often supports discharge readiness.',
        'cue_misinterpretation',
        [0, 1, 3, 5]
      ),
      no(
        'A CT-based exclusion strategy without adjusting for the interval from headache onset',
        'The interval from onset changes test interpretation and should be included in senior review.',
        'The scan report uses reassuring language.',
        'cue_misinterpretation',
        [1, 2]
      ),
    ],
    [
      'Interpret a negative test in its timing context',
      'Separate symptom relief from diagnostic exclusion',
      'Anticipate missed hemorrhage risk',
    ],
    'A reassuring test result must answer the actual clinical question at the time it was performed.',
    ['suddenHeadache', 'reasoning'],
    {
      conflict:
        'Negative CT and improved pain contrast with a red-flag onset history and delayed scanning.',
      anticipation:
        'A missed hemorrhage may have serious subsequent complications.',
      uncertainty:
        'Further testing is a senior diagnostic decision; the available data do not exclude every secondary cause.',
    }
  ),
  neuro(
    'advanced',
    'Unequal recovery after head injury and opioid treatment',
    'A patient with head trauma receives opioid analgesia and later becomes drowsy. Assisted ventilation and protocol-directed reversal improve respiratory rate. The patient still localizes less strongly with the left arm and now has unequal pupils. Blood pressure and glucose are satisfactory. Earlier documentation showed equal pupils and symmetric movement.',
    [
      'Head trauma',
      'Opioid exposure',
      'Ventilation improves after reversal',
      'Persistent asymmetric movement',
      'New unequal pupils',
      'Prior symmetric examination',
      'Satisfactory glucose and pressure',
    ],
    'Which plan best addresses the residual findings?',
    [
      yes(
        'Continue respiratory support as needed and obtain urgent neurologic reassessment',
        'A partial drug response does not explain new focal signs; intracranial deterioration must be assessed urgently.',
        [0, 2, 3, 4, 5, 6]
      ),
      no(
        'Use a further reversal-response trial as the next test of the persistent neurologic findings',
        'New focal findings after trauma are not safely managed as an isolated opioid effect.',
        'Some respiratory findings improved after reversal.',
        'premature_closure',
        [1, 2, 3, 4]
      ),
      no(
        'Return to the original neurologic schedule after the respiratory rescue endpoint is achieved',
        'Respiratory recovery does not offset new focal neurologic deterioration.',
        'The immediate respiratory emergency improved.',
        'outdated_data',
        [2, 3, 4, 5]
      ),
      no(
        'Optimize analgesia and then compare the lateralized examination with the arrival findings',
        'Pain treatment must be coordinated with urgent evaluation of a new potentially life-threatening focal change.',
        'Reversal can restore severe pain.',
        'misprioritization',
        [1, 3, 4]
      ),
    ],
    [
      'Evaluate which findings reversal did and did not explain',
      'Compare focal findings with baseline',
      'Anticipate intracranial deterioration',
    ],
    'Different findings may have different causes; a successful treatment response should not close the whole differential.',
    ['headInjury', 'opioidSafety'],
    {
      conflict:
        'Improved breathing coexists with new focal neurologic abnormalities.',
      anticipation:
        'An evolving intracranial lesion may threaten further neurologic function.',
      uncertainty:
        'Opioid effect and intracranial injury can coexist; imaging and specialist review are needed.',
    }
  ),
  neuro(
    'advanced',
    'Focal weakness after an unwitnessed seizure',
    'A patient is found after an apparent seizure with new right-sided weakness. The patient is gradually more alert but the weakness remains unchanged thirty minutes later. A family member says the seizure may have started with speech arrest. Glucose is normal and no prior postictal weakness is documented. The exact last-known-well time is uncertain.',
    [
      'Persistent unilateral weakness',
      'Partial recovery of alertness',
      'Possible focal onset with speech arrest',
      'Normal glucose',
      'No documented postictal weakness',
      'Uncertain last-known-well',
    ],
    'Which plan best balances the competing explanations?',
    [
      yes(
        'Seek urgent stroke and seizure assessment while clarifying the time history',
        'Postictal paresis is possible, but seizure can accompany stroke and persistent focal deficits need time-sensitive evaluation.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use a postictal recovery observation period as the next test of the weakness',
        'This assumes the cause before excluding a time-sensitive structural event.',
        'Weakness can follow a focal seizure.',
        'premature_closure',
        [0, 2, 4]
      ),
      no(
        'Follow the seizure-recovery pathway using improving alertness as the main response endpoint',
        'Improving global arousal does not explain an unchanged focal deficit.',
        'Postictal consciousness is recovering.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Reconstruct the witnessed seizure sequence before selecting the acute neurologic pathway',
        'History clarification should occur in parallel rather than delay assessment.',
        'Treatment decisions depend on accurate timing.',
        'misprioritization',
        [0, 5]
      ),
    ],
    [
      'Compare global recovery with persistent focal dysfunction',
      'Retain competing etiologies',
      'Anticipate time-sensitive diagnostic options',
    ],
    'A plausible seizure-related explanation does not exclude a concurrent cause of the seizure and persistent deficit.',
    ['stroke', 'strokeTiming', 'reasoning'],
    {
      conflict: 'Alertness improves while the focal deficit remains unchanged.',
      anticipation:
        'Delaying structural evaluation may lose treatment opportunities.',
      uncertainty:
        'Postictal paresis, stroke or another lesion cannot be distinguished from these findings alone.',
    }
  ),
  pulm(
    'foundation',
    'Tidal volume and minute ventilation',
    'A patient breathes twelve times per minute. Each breath moves an expired tidal volume of five hundred milliliters. The monitor displays total expired minute ventilation. The nurse is checking which calculation matches that display.',
    [
      'Respiratory rate twelve per minute',
      'Expired tidal volume five hundred milliliters',
    ],
    'Which value represents total expired minute ventilation?',
    [
      yes(
        'Six liters per minute',
        'Minute ventilation equals tidal volume multiplied by respiratory rate: 0.5 times twelve equals six liters per minute.',
        [0, 1]
      ),
      no(
        'Half a liter per minute',
        'This is the volume of one breath, not the total per minute.',
        'The tidal-volume value is directly displayed.',
        'cue_misinterpretation',
        [1]
      ),
      no(
        'Twelve liters per minute',
        'Rate alone cannot be expressed as a gas volume without multiplying by tidal volume.',
        'The rate is twelve and the requested unit includes minutes.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Four liters per minute',
        'An alveolar estimate requires dead-space information; it is not the specified total expired volume.',
        'A learner may subtract assumed dead-space ventilation.',
        'premature_closure',
        [0, 1]
      ),
    ],
    ['Distinguish volume per breath from volume per minute'],
    'Minute ventilation describes total gas moved each minute; alveolar ventilation additionally accounts for dead space.',
    ['ventilationMechanics']
  ),
  pulm(
    'foundation',
    'Oximetry versus ventilation',
    'A patient on oxygen is drowsy and breathing shallowly. Saturation is 98%. The nurse is concerned about carbon dioxide retention. A clinician requests information about ventilation.',
    ['Shallow breathing with drowsiness', 'Normal saturation on oxygen'],
    'Which measurement most directly helps assess carbon dioxide retention?',
    [
      yes(
        'Arterial carbon dioxide tension',
        'PaCO2 evaluates carbon dioxide clearance; oxygen saturation does not measure it.',
        [0, 1]
      ),
      no(
        'A repeat oxygen saturation',
        'Oximetry measures oxygenation, not carbon dioxide clearance.',
        'Saturation is the familiar continuous respiratory measurement.',
        'cue_misinterpretation',
        [1]
      ),
      no(
        'The oxygen flow-meter setting',
        'Oxygen delivery is context, not a measurement of retained carbon dioxide.',
        'Supplemental oxygen can mask a saturation decline.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'The inspiratory breath-sound intensity',
        'Auscultation supports assessment but does not quantify carbon dioxide retention.',
        'Shallow breathing can produce quiet breath sounds.',
        'misprioritization',
        [0]
      ),
    ],
    ['Separate oxygenation from ventilation'],
    'A normal saturation on oxygen does not answer whether alveolar ventilation is adequate.',
    ['ventilatoryFailure', 'oximetry']
  ),
  pulm(
    'foundation',
    'Speech limitation in asthma',
    'A patient with asthma is seated upright and visibly working to breathe. They can say only one or two words between breaths. They ask for help with the next inhaler treatment. The nurse is assessing severity.',
    ['Marked work of breathing', 'Speech limited to one or two words'],
    'Which interpretation best fits the speech finding?',
    [
      yes(
        'Significant respiratory compromise requiring urgent assessment',
        'Severe speech limitation reflects substantial breathing difficulty and warrants escalation.',
        [0, 1]
      ),
      no(
        'Mild bronchospasm suitable for routine reassessment',
        'One- or two-word speech is not a mild functional limitation.',
        'The patient can still communicate a request.',
        'cue_misinterpretation',
        [1]
      ),
      no(
        'Isolated anxiety requiring relaxation before treatment',
        'Anxiety may coexist, but severe work of breathing cannot be reduced to anxiety.',
        'The patient appears distressed.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'Primarily an inhaler-technique problem requiring teaching',
        'Technique may need review later, but current respiratory compromise comes first.',
        'The patient requests help with the inhaler.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Recognize a functional marker of respiratory severity'],
    'How much a patient can say per breath is part of severity assessment, not merely a communication preference.',
    ['deterioration'],
    {
      referenceUrls: [
        'https://ginasthma.org/wp-content/uploads/2026/05/GINA-2026-Strategy-Report-WMS.pdf',
      ],
    }
  ),
  pulm(
    'foundation',
    'New dyspnea after immobilization',
    'A patient recovering from hip surgery develops sudden breathlessness. They have been largely immobile for several days. The nurse begins an immediate respiratory assessment. The patient reports pain on deep inspiration.',
    ['Recent surgery with immobility', 'Sudden dyspnea', 'Pleuritic pain'],
    'Which potential complication should be included urgently in the assessment?',
    [
      yes(
        'Pulmonary embolism',
        'The risk context plus sudden dyspnea and pleuritic pain warrants urgent evaluation for PE.',
        [0, 1, 2]
      ),
      no(
        'Uncomplicated dependent atelectasis',
        'Atelectasis is possible postoperatively but should not close assessment of a sudden thromboembolic pattern.',
        'Immobility commonly reduces lung expansion.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'Expected exertional deconditioning',
        'Abrupt symptoms at rest are not adequately explained by gradual loss of conditioning.',
        'The patient has been inactive for days.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Isolated incisional discomfort',
        'Pain from the hip incision does not explain new pleuritic chest pain and dyspnea.',
        'The patient recently had surgery.',
        'premature_closure',
        [0, 1, 2]
      ),
    ],
    ['Recognize a thromboembolic symptom pattern'],
    'Risk factors guide the differential; the clinical pattern prompts evaluation rather than proving PE.',
    ['vte']
  ),
  pulm(
    'foundation',
    'Coughing during oral intake',
    'A drowsy inpatient begins coughing during assisted oral feeding. Their voice becomes wet after a sip. The nurse is holding the next spoonful. The patient remains able to breathe and cough.',
    ['Drowsiness during feeding', 'Cough and wet voice after swallowing'],
    'Which action is most appropriate now?',
    [
      yes(
        'Pause oral intake and assess swallow and airway safety',
        'Feeding-related cough and a wet voice suggest impaired swallow safety.',
        [0, 1]
      ),
      no(
        'Continue with smaller spoonfuls',
        'Smaller portions do not establish safe swallowing in a drowsy patient.',
        'Reducing bolus size may seem to reduce risk.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'Offer water to clear the wet voice',
        'More oral liquid may worsen aspiration when swallow safety is uncertain.',
        'A wet voice can seem like retained material to wash down.',
        'cue_misinterpretation',
        [1]
      ),
      no(
        'Finish the meal before documenting the episode',
        'Nutrition does not take priority over an active safety concern during swallowing.',
        'The patient may have poor nutritional intake.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Recognize signs of unsafe swallowing'],
    'Stop the exposure and assess when swallowing produces airway warning signs.',
    ['deterioration', 'nutritionSupport']
  ),
  pulm(
    'challenge',
    'Equal minute volume with different breathing patterns',
    'A patient changes from five-hundred-milliliter breaths at twelve per minute to two-hundred-fifty-milliliter breaths at twenty-four per minute. Total minute ventilation remains six liters per minute. For this comparison, anatomic dead space remains one hundred fifty milliliters per breath. Carbon dioxide begins to rise.',
    [
      'Tidal volume halves',
      'Respiratory rate doubles',
      'Total minute ventilation unchanged',
      'Dead space unchanged per breath',
      'Carbon dioxide rising',
    ],
    'Which explanation best fits the change?',
    [
      yes(
        'More of each minute ventilates dead space, reducing alveolar ventilation',
        'Alveolar ventilation falls from 4.2 to 2.4 liters per minute because dead space occupies more of each smaller breath.',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Alveolar ventilation is unchanged because total minute volume is unchanged',
        'Equal total volumes can have different effective gas-exchanging volumes.',
        'The displayed minute ventilation is identical.',
        'cue_misinterpretation',
        [0, 2, 3]
      ),
      no(
        'Alveolar ventilation increases because more breaths reach the lungs',
        'Higher frequency does not offset the greater dead-space fraction in this example.',
        'The respiratory rate doubles.',
        'cue_misinterpretation',
        [0, 1, 3]
      ),
      no(
        'Carbon dioxide rises because oxygen flow was not doubled',
        'Oxygen delivery does not correct the demonstrated loss of effective ventilation.',
        'Both oxygen and carbon dioxide are respiratory gases.',
        'premature_closure',
        [2, 3, 4]
      ),
    ],
    [
      'Calculate effective ventilation from each pattern',
      'Connect lower alveolar ventilation with reduced carbon dioxide clearance',
    ],
    'Rate and tidal volume must be interpreted together; identical minute volumes do not imply identical alveolar ventilation.',
    ['ventilationMechanics', 'ventilatoryFailure']
  ),
  pulm(
    'challenge',
    'A quieter chest during worsening asthma',
    'After initial asthma treatment, wheezing becomes less audible. The patient is now exhausted and can barely speak. Air entry is poorer than before and oxygen saturation is falling. The respiratory rate has slowed despite continuing effort.',
    [
      'Less wheeze with poorer air entry',
      'Exhaustion',
      'Worsening speech',
      'Falling saturation',
      'Slowing rate despite effort',
    ],
    'Which response best reflects the reassessment?',
    [
      yes(
        'Escalate for impending ventilatory failure',
        'Less sound with declining airflow and exhaustion indicates worsening, not improvement.',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Reduce treatment because bronchospasm sounds improved',
        'Less wheeze can reflect critically low airflow when other severity markers worsen.',
        'The wheeze was louder before treatment.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'Prioritize coached slow breathing before calling for review',
        'Coaching cannot substitute for emergency evaluation of exhaustion and falling oxygenation.',
        'A slower pattern may seem less distressed.',
        'misprioritization',
        [1, 3, 4]
      ),
      no(
        'Repeat inhaler-technique teaching before changing the care level',
        'Teaching may matter later but is inappropriate as the first response to this deterioration.',
        'Poor delivery can explain treatment failure.',
        'misprioritization',
        [1, 2, 3]
      ),
    ],
    [
      'Interpret breath sounds alongside airflow and function',
      'Recognize respiratory fatigue',
    ],
    'An apparently quieter chest can be dangerous when speech, effort and gas exchange are worsening.',
    ['deterioration', 'ventilatoryFailure'],
    {
      referenceUrls: [
        'https://ginasthma.org/wp-content/uploads/2026/05/GINA-2026-Strategy-Report-WMS.pdf',
      ],
    }
  ),
  pulm(
    'challenge',
    'Hypercapnia despite acceptable saturation',
    'A patient with a COPD exacerbation remains within their prescribed oxygen saturation target. Over an hour the patient becomes more drowsy. The blood gas shows rising carbon dioxide with a falling pH despite initial treatment. Work of breathing remains increased.',
    [
      'Saturation within individualized target',
      'Increasing drowsiness',
      'Rising carbon dioxide and falling pH',
      'Persistent work of breathing',
    ],
    'Which request should take priority?',
    [
      yes(
        'Urgent review for ventilatory support and repeat gas assessment',
        'Persistent hypercapnic acidosis and worsening alertness require escalation, not reassurance from oximetry.',
        [0, 1, 2, 3]
      ),
      no(
        'Continue oxygen alone because the target has been achieved',
        'Target saturation does not establish adequate carbon dioxide clearance.',
        'The oxygen prescription appears satisfied.',
        'premature_closure',
        [0, 2]
      ),
      no(
        'Reduce all respiratory support to limit carbon dioxide retention',
        'Ventilatory failure needs assessment and support; indiscriminate withdrawal can worsen hypoxemia.',
        'Excess oxygen can be a concern in susceptible patients.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'Repeat oximetry before acting on the blood gas',
        'The gas and clinical change are concordant and answer a problem oximetry cannot measure.',
        'Pulse oximetry is immediate and familiar.',
        'misprioritization',
        [0, 1, 2]
      ),
    ],
    [
      'Integrate pH, carbon dioxide and consciousness',
      'Distinguish oxygen target achievement from ventilatory recovery',
    ],
    'Follow the variable relevant to the failure: satisfactory oxygenation cannot exclude hypercapnic acidosis.',
    ['ventilatoryFailure', 'oximetry'],
    {
      referenceUrls: [
        'https://www.nice.org.uk/guidance/ng115/chapter/Recommendations',
      ],
    }
  ),
  pulm(
    'challenge',
    'Improved saturation at greater oxygen support',
    'A patient with pneumonia had a saturation of 91% on low-flow oxygen. Two hours later saturation is 95%, but the oxygen device now delivers substantially more support. Respiratory rate has risen and the patient cannot finish a sentence. A handover describes oxygenation as improved.',
    [
      'Higher displayed saturation',
      'Substantially increased oxygen support',
      'Rising respiratory rate',
      'Reduced speech capacity',
    ],
    'Which correction should the nurse make to the handover?',
    [
      yes(
        'Oxygen needs and respiratory effort have worsened despite the higher saturation',
        'The amount of support and functional deterioration change the meaning of the saturation increase.',
        [0, 1, 2, 3]
      ),
      no(
        'Gas exchange has recovered because saturation exceeds the earlier value',
        'A higher number on much greater support does not establish recovery.',
        'The displayed saturation improved by four points.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'The remaining problem is primarily anxiety about the new device',
        'Anxiety cannot safely explain rising support needs and impaired speech.',
        'A larger device may distress the patient.',
        'premature_closure',
        [1, 2, 3]
      ),
      no(
        'The respiratory trend is uninterpretable until the device is reduced',
        'Clinical deterioration can be recognized without deliberately reducing necessary support.',
        'Different devices make direct number comparison difficult.',
        'misprioritization',
        [1, 2, 3]
      ),
    ],
    [
      'Account for treatment intensity when interpreting observations',
      'Prioritize increased respiratory support needs',
    ],
    'A response is assessed in context: a better number can conceal worsening disease when support has increased.',
    ['deterioration', 'oximetry']
  ),
  pulm(
    'challenge',
    'Vomiting during noninvasive ventilation',
    'A patient receiving noninvasive ventilation starts vomiting into the mask. They are becoming less able to follow instructions. Oxygenation falls during the episode. The nurse has suction and emergency assistance immediately available.',
    [
      'Active vomiting into the interface',
      'Declining cooperation and alertness',
      'Falling oxygenation',
      'Assistance and suction available',
    ],
    'Which immediate response is most appropriate?',
    [
      yes(
        'Remove the interface, protect the airway and summon urgent support',
        'Vomiting with impaired airway control creates an immediate aspiration threat requiring airway-focused rescue.',
        [0, 1, 2, 3]
      ),
      no(
        'Tighten the mask to restore the oxygenation reading',
        'A tighter interface can trap vomit and worsen the airway threat.',
        'A leak may reduce delivered ventilatory support.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'Increase pressure support before addressing the emesis',
        'Pressure adjustment does not clear vomit or establish airway protection.',
        'Falling saturation suggests inadequate support.',
        'misprioritization',
        [0, 1, 2]
      ),
      no(
        'Pause feeding and leave the interface undisturbed',
        'Stopping further intake does not address the vomit already inside the mask or declining alertness.',
        'Reducing gastrointestinal triggers may seem sufficient.',
        'premature_closure',
        [0, 1]
      ),
    ],
    [
      'Recognize a new airway contraindication to the current interface',
      'Prioritize airway protection over device optimization',
    ],
    'Device-based support must be reconsidered when the patient can no longer safely manage secretions or emesis.',
    ['deterioration'],
    {
      referenceUrls: [
        'https://publications.ersnet.org/index.php/highwire/markup/item_fulltext/694321',
      ],
    }
  ),
  pulm(
    'advanced',
    'Worsening acidosis during a technically improved NIV trial',
    'A patient with hypercapnic respiratory failure begins noninvasive ventilation. A large mask leak is corrected and saturation reaches the prescribed target. After an hour, pH has fallen further and carbon dioxide has risen. Respiratory rate remains high and the patient is now less responsive. The escalation plan permits invasive support if needed.',
    [
      'Leak corrected',
      'Target saturation achieved',
      'Worsening pH',
      'Rising carbon dioxide',
      'Persistent tachypnea',
      'Declining responsiveness',
      'Invasive support within agreed plan',
    ],
    'Which evaluation best guides the next step?',
    [
      yes(
        'Request urgent expert reassessment for NIV failure and airway escalation',
        'Technical improvement without physiologic recovery, especially worsening consciousness, requires urgent reassessment against the escalation plan.',
        [0, 1, 2, 3, 4, 5, 6]
      ),
      no(
        'Extend the corrected-mask trial and use the next gas to determine whether escalation is needed',
        'Correcting delivery does not offset worsening acidosis and consciousness.',
        'A known technical cause has just been fixed.',
        'premature_closure',
        [0, 2, 3, 5]
      ),
      no(
        'Use the achieved oxygen target to continue the current support while assessing comfort',
        'Oxygenation is only one outcome and does not establish ventilatory recovery.',
        'The visible saturation alarm has resolved.',
        'cue_misinterpretation',
        [1, 2, 3, 5]
      ),
      no(
        'Optimize mask tolerance with a sedation review before reassessing the ventilatory strategy',
        'Sedation may further impair ventilation and airway protection; the worsening physiology needs expert assessment.',
        'Agitation or fatigue can interfere with an interface.',
        'misprioritization',
        [2, 3, 5]
      ),
    ],
    [
      'Distinguish technical success from physiologic success',
      'Integrate serial gas and consciousness changes',
      'Anticipate airway failure',
    ],
    'A functioning device is not evidence of effective treatment; physiologic response and the agreed rescue plan determine whether to continue.',
    ['ventilatoryFailure', 'deterioration'],
    {
      conflict:
        'A corrected leak and acceptable saturation coexist with worsening ventilation and alertness.',
      anticipation:
        'Further decline may make airway protection and invasive support necessary.',
      uncertainty:
        'The responsible team must determine the cause of failure and safest support strategy.',
      referenceUrls: ['https://pmc.ncbi.nlm.nih.gov/articles/PMC5890056/'],
    }
  ),
  pulm(
    'advanced',
    'Carbon dioxide divergence during circulatory deterioration',
    'A ventilated patient’s expired minute volume remains unchanged. Arterial carbon dioxide rises while end-tidal carbon dioxide falls. The waveform and circuit remain intact, but blood pressure drops and peripheral perfusion worsens. Oxygen requirement has increased and the patient recently underwent major surgery. The team is evaluating a new gas-exchange problem.',
    [
      'Unchanged expired minute volume',
      'Rising arterial carbon dioxide',
      'Falling end-tidal carbon dioxide',
      'Intact waveform and circuit',
      'New hypotension with poor perfusion',
      'Increased oxygen need',
      'Recent major surgery',
    ],
    'Which interpretation best informs the next assessment?',
    [
      yes(
        'Increased ineffective ventilation or reduced pulmonary perfusion requiring urgent cause assessment',
        'The widening arterial-to-expired gap with shock raises dead-space or perfusion concerns; unchanged total ventilation does not ensure effective clearance.',
        [0, 1, 2, 3, 4, 5, 6]
      ),
      no(
        'Improved clearance requiring confirmation by another end-tidal trend at the current support',
        'The arterial rise and shock contradict interpreting the end-tidal fall as recovery.',
        'A falling end-tidal value can follow increased ventilation.',
        'cue_misinterpretation',
        [1, 2, 4]
      ),
      no(
        'An occult circuit leak requiring a technical correction trial before revisiting pulmonary perfusion',
        'A leak needs assessment, but the intact circuit and perfusion change require a broader explanation.',
        'End-tidal readings can fall with leaks.',
        'premature_closure',
        [0, 2, 3, 4]
      ),
      no(
        'Increased carbon dioxide production requiring a metabolism-focused review before perfusion reassessment',
        'Increased production alone does not adequately explain falling expired carbon dioxide with concurrent circulatory collapse.',
        'Arterial carbon dioxide can rise with increased production.',
        'premature_closure',
        [1, 2, 4]
      ),
    ],
    [
      'Compare arterial and expired gas trends',
      'Integrate circulation with effective gas exchange',
      'Anticipate a serious perfusion-related cause',
    ],
    'A gas value has meaning within ventilation and perfusion; a lower end-tidal reading during shock can be a warning rather than recovery.',
    ['ventilationMechanics', 'vte', 'deterioration'],
    {
      conflict:
        'Total minute ventilation is stable while arterial and expired carbon dioxide move in opposite directions.',
      anticipation:
        'An evolving perfusion disorder may cause further shock and impaired gas exchange.',
      uncertainty:
        'The pattern is not diagnostic of PE and requires urgent differential assessment.',
    }
  ),
  pulm(
    'advanced',
    'A normalizing carbon dioxide in exhausted asthma',
    'A patient with severe asthma initially had a low arterial carbon dioxide. After treatment, carbon dioxide enters the laboratory reference range. Air entry is now very quiet, speech is limited to single words and the patient is becoming drowsy. Oxygen support has increased while saturation remains similar. Respiratory rate is lower than on arrival.',
    [
      'Carbon dioxide rises from low to reference range',
      'Very quiet air entry',
      'Single-word speech',
      'New drowsiness',
      'Increasing oxygen support',
      'Similar saturation',
      'Falling respiratory rate',
    ],
    'Which interpretation should guide escalation?',
    [
      yes(
        'Possible respiratory muscle exhaustion despite a reference-range carbon dioxide',
        'The gas trend with worsening airflow and consciousness may indicate failing ventilation rather than normalization.',
        [0, 1, 2, 3, 4, 5, 6]
      ),
      no(
        'Resolving hyperventilation confirmed by a normal laboratory value',
        'A reference-range result cannot overrule the direction of change and worsening clinical severity.',
        'The gas result has moved into the printed normal interval.',
        'cue_misinterpretation',
        [0, 1, 3]
      ),
      no(
        'Successful bronchodilation because wheeze and respiratory rate decreased',
        'Less wheeze with poor entry and drowsiness is a dangerous combination, not a reliable treatment response.',
        'Two familiar distress markers have decreased.',
        'premature_closure',
        [1, 3, 6]
      ),
      no(
        'An oxygen-delivery problem requiring an increased oxygen target before revising ventilatory support',
        'Oxygen may be necessary but does not address threatened ventilation and airway control.',
        'The device requirement has increased.',
        'misprioritization',
        [3, 4, 5]
      ),
    ],
    [
      'Interpret a reference-range result within its trend',
      'Reconcile quieter breathing with worsening function',
      'Anticipate ventilatory arrest',
    ],
    'Normalization of a number may represent loss of compensation; assess trajectory and reserve rather than range alone.',
    ['ventilatoryFailure', 'deterioration'],
    {
      conflict:
        'Carbon dioxide enters the reference range while airflow, consciousness and support needs worsen.',
      anticipation: 'Exhaustion can progress to respiratory arrest.',
      uncertainty:
        'A single blood gas cannot establish respiratory reserve or exclude other complications.',
      referenceUrls: [
        'https://ginasthma.org/wp-content/uploads/2026/05/GINA-2026-Strategy-Report-WMS.pdf',
      ],
    }
  ),
  pulm(
    'advanced',
    'New pleuritic pain during pneumonia treatment',
    'A patient being treated for pneumonia had gradually improving fever and cough. Today the patient develops abrupt pleuritic pain and a new oxygen requirement. Heart rate rises to 126 and the patient nearly faints while transferring. The chest radiograph has not substantially changed. The patient has been bedbound and one calf is newly swollen.',
    [
      'Improving original infection symptoms',
      'Abrupt pleuritic pain',
      'New oxygen requirement',
      'Tachycardia with near-syncope',
      'Unchanged radiograph',
      'Immobility',
      'New unilateral calf swelling',
    ],
    'Which plan best addresses the new pattern?',
    [
      yes(
        'Escalate for a new thromboembolic complication with immediate stability assessment',
        'The abrupt risk-linked pattern warrants urgent PE evaluation rather than assuming progression of the existing pneumonia.',
        [0, 1, 2, 3, 4, 5, 6]
      ),
      no(
        'Request a different antibiotic as the first response to pneumonia failure',
        'Antibiotic failure is possible but does not adequately account for the abrupt vascular pattern and calf finding.',
        'An infection is already being treated.',
        'premature_closure',
        [0, 1, 3, 6]
      ),
      no(
        'Use radiographic progression as the threshold for expanding the pulmonary differential',
        'A similar radiograph does not exclude PE or explain acute oxygenation and circulatory symptoms.',
        'Imaging appears stable.',
        'cue_misinterpretation',
        [2, 3, 4]
      ),
      no(
        'Use an analgesia and lung-expansion response to assess whether immobility explains the new symptoms',
        'Near-syncope, tachycardia and new oxygen needs require assessment before further exertion.',
        'Immobility can cause pain and poor lung expansion.',
        'misprioritization',
        [2, 3, 5]
      ),
    ],
    [
      'Compare a new syndrome with the original illness trajectory',
      'Integrate venous and pulmonary cues',
      'Anticipate hemodynamic deterioration',
    ],
    'A pre-existing diagnosis should not absorb a new pattern that it does not explain well.',
    ['vte', 'reasoning'],
    {
      conflict:
        'Improving pneumonia and stable imaging contrast with abrupt pleuritic and circulatory symptoms.',
      anticipation:
        'A thromboembolic event may progress to hemodynamic instability.',
      uncertainty:
        'PE is suspected, not proven; other causes of acute dyspnea still require evaluation.',
    }
  ),
  pulm(
    'advanced',
    'Low saturation with uncertain signal quality',
    'A postoperative patient’s finger oximeter suddenly reads 82%. The waveform is poor and the hand is cold, but the patient also reports new breathlessness. Respiratory rate is thirty and heart rate has increased. The patient can answer questions and an alternate sensor is available. Oxygen tubing remains connected at the prescribed setting.',
    [
      'Low displayed saturation',
      'Poor waveform and cold hand',
      'New subjective dyspnea',
      'Tachypnea',
      'Rising heart rate',
      'Preserved conversation',
      'Oxygen delivery connected',
    ],
    'Which plan best handles both measurement uncertainty and clinical risk?',
    [
      yes(
        'Assess and support breathing while promptly checking saturation at a reliable site',
        'Signal quality needs verification in parallel with assessment because real symptoms make dismissing the low value unsafe.',
        [0, 1, 2, 3, 4, 5, 6]
      ),
      no(
        'Use preserved conversation and poor waveform quality to prioritize a technical correction trial',
        'Poor signal is plausible, but new dyspnea and tachypnea require immediate evaluation.',
        'Cold hands and a poor waveform often distort readings.',
        'premature_closure',
        [1, 2, 3]
      ),
      no(
        'Use the displayed saturation to classify gas-exchange severity and select support before validating the signal',
        'Urgent care may be needed, but confirming measurement quality remains useful and can occur concurrently.',
        'The displayed number is markedly abnormal.',
        'cue_misinterpretation',
        [0, 1, 5]
      ),
      no(
        'Establish a reliable peripheral signal before deciding whether the respiratory trend needs escalation',
        'A technical correction should not delay assessment of symptomatic respiratory deterioration.',
        'Warming can improve peripheral signal.',
        'misprioritization',
        [1, 2, 3, 4]
      ),
    ],
    [
      'Appraise measurement reliability',
      'Integrate independent clinical signs',
      'Anticipate harm from either dismissing or overinterpreting artifact',
    ],
    'Uncertain measurements call for verification alongside clinical care, not a choice between checking the device and assessing the patient.',
    ['oximetry', 'deterioration'],
    {
      conflict:
        'Poor signal suggests artifact while dyspnea, tachypnea and tachycardia support a real problem.',
      anticipation:
        'Delaying care could miss hypoxemia, while unverified readings can misdirect treatment.',
      uncertainty:
        'The true saturation and cause of the symptoms are not yet established.',
    }
  ),
]

acuteCareQualityQuestions.push(
  vignette(
    'foundation',
    'A new reaction during transfusion',
    'A patient develops chills and back discomfort during a red-cell transfusion. These symptoms were absent before the unit started. The nurse is at the bedside and the transfusion is still running. An institutional transfusion-reaction pathway is available.',
    [
      'New chills during red-cell transfusion',
      'New back discomfort during transfusion',
    ],
    'Which action should begin the reaction pathway?',
    [
      yes(
        'Stop the transfusion and assess the patient',
        'New symptoms during transfusion require stopping the suspected exposure and immediate assessment while the reaction pathway is activated.',
        [0, 1]
      ),
      no(
        'Slow the transfusion and repeat observations',
        'Slowing preserves exposure to a potentially harmful unit. The new symptom combination warrants stopping it while assessing the cause.',
        'A mild infusion intolerance may improve at a lower rate.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Give the prescribed antipyretic and reassess',
        'Symptom relief does not address the possible reaction or prevent further exposure. Assessment follows immediate interruption of the transfusion.',
        'Chills often prompt a temperature-focused response.',
        'premature_closure',
        [0]
      ),
      no(
        'Check the compatibility paperwork before interruption',
        'Verification is part of investigation, but it should not delay stopping the exposure and assessing the patient.',
        'A compatibility error is a serious potential cause.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Recognize a new transfusion-associated symptom pattern'],
    'Stop a possible harmful exposure before trying to classify the reaction or treat an isolated symptom.',
    ['transfusion']
  ),
  vignette(
    'foundation',
    'Symptomatic low glucose with safe swallowing',
    'An awake patient with diabetes becomes sweaty and shaky. A bedside glucose check is 48 mg/dL. They can follow instructions and swallow safely. A hypoglycemia protocol and fast-acting oral carbohydrate are available.',
    [
      'Glucose 48 mg/dL with adrenergic symptoms',
      'Awake and able to swallow safely',
    ],
    'Which intervention is appropriate under the protocol?',
    [
      yes(
        'Give fast-acting oral carbohydrate and recheck as directed',
        'The confirmed low glucose needs prompt correction, and safe swallowing supports the oral route. Rechecking establishes whether the initial correction was adequate.',
        [0, 1]
      ),
      no(
        'Give a protein-rich snack and recheck at the next meal',
        'Protein alone does not provide the rapid carbohydrate required for an acute symptomatic low glucose. Waiting until the next meal delays confirmation of recovery.',
        'A snack can help sustain glucose after initial treatment.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Give the scheduled insulin with the next food portion',
        'Insulin may worsen the current low glucose. The immediate task is correction and reassessment under the hypoglycemia pathway.',
        'Food and insulin are usually coordinated in inpatient care.',
        'cue_misinterpretation',
        [0]
      ),
      no(
        'Request a laboratory glucose before beginning treatment',
        'A laboratory test may clarify an unreliable reading, but this confirmed bedside value with matching symptoms warrants prompt treatment rather than waiting.',
        'Laboratory measurements may seem more definitive than point-of-care results.',
        'misprioritization',
        [0, 1]
      ),
    ],
    [
      'Match confirmed hypoglycemia and swallowing ability to an appropriate initial route',
    ],
    'Use the measured abnormality and the patient’s ability to protect the airway to choose prompt treatment, then verify the response.',
    ['insulinSafety']
  ),
  vignette(
    'foundation',
    'Volume-loss findings at intake',
    'A patient has had repeated vomiting and diarrhea. They report dizziness when sitting up and have a dry mouth. They are speaking normally without breathlessness. The nurse is preparing the initial focused assessment.',
    [
      'Recent gastrointestinal fluid losses',
      'Postural dizziness with dry mucosa',
    ],
    'Which assessment is most directly related to the presenting problem?',
    [
      yes(
        'Assess circulating-volume and perfusion findings',
        'The losses and postural symptoms suggest possible volume depletion. Circulatory assessment can establish the current physiologic effect without assuming the cause is already proven.',
        [0, 1]
      ),
      no(
        'Assess for a primary swallowing impairment',
        'The history concerns loss of fluid rather than difficulty swallowing. A swallowing assessment does not address the main current cue cluster.',
        'Dry mouth can be associated with difficulty eating or swallowing.',
        'cue_misinterpretation',
        [1]
      ),
      no(
        'Assess for a primary vestibular disorder',
        'A vestibular problem is possible in a broader dizziness assessment, but the recent losses and postural symptoms make circulation the more directly supported focus.',
        'Dizziness is commonly associated with inner-ear disorders.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'Assess for an isolated anxiety-related symptom',
        'Anxiety does not adequately account for the fluid-loss history. The initial assessment should address the physiologic risk before assigning a psychological explanation.',
        'The patient is alert and may appear otherwise well.',
        'premature_closure',
        [0, 1]
      ),
    ],
    ['Connect a loss history with relevant circulation assessment'],
    'Recognition questions should connect the clinical pattern to the most relevant assessment rather than require a diagnosis from incomplete information.',
    ['fluids']
  ),
  vignette(
    'foundation',
    'An ulcer without pain in diabetes',
    'A patient with diabetes has a new plantar ulcer. They report little discomfort, and sensation to light touch around the foot is reduced. The ulcer is visible when the dressing is removed. The nurse is deciding whether the absence of pain is reassuring.',
    [
      'Visible plantar ulcer in diabetes',
      'Reduced sensation around the affected foot',
      'Little reported pain',
    ],
    'Which interpretation best explains the limited pain report?',
    [
      yes(
        'Reduced sensation can mask the severity of tissue injury',
        'Neuropathy can reduce protective pain sensation. A low pain score therefore does not establish that the wound is superficial or safe to defer.',
        [0, 1, 2]
      ),
      no(
        'Limited pain suggests the ulcer has already entered healing',
        'Pain alone cannot establish a healing phase, particularly with reduced sensation. Wound assessment is needed.',
        'Improving pain often accompanies healing in other injuries.',
        'cue_misinterpretation',
        [1, 2]
      ),
      no(
        'Limited pain suggests a venous rather than diabetic cause',
        'The location and reduced sensation do not support deciding wound etiology from pain intensity alone.',
        'Some chronic vascular wounds cause less pain than acute arterial injury.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'Reduced sensation makes the pain score a useful measure of depth',
        'Neuropathy weakens the relationship between pain and tissue injury. Pain intensity is not a reliable way to estimate wound depth here.',
        'A numerical pain score is a familiar measure for documenting injury.',
        'cue_misinterpretation',
        [1, 2]
      ),
    ],
    ['Recognize that sensory loss changes the meaning of an absent symptom'],
    'An absent symptom is reassuring only when the patient can reliably perceive and report it.',
    ['deterioration'],
    {
      referenceUrls: [
        'https://www.nice.org.uk/guidance/ng19/chapter/Recommendations',
      ],
    }
  ),
  vignette(
    'foundation',
    'A change from the cognitive baseline',
    'An older adult is admitted for an acute illness. The family says the patient was normally oriented yesterday. Today the patient is inattentive and disoriented. The nurse is deciding what to communicate in the handover.',
    [
      'New inattention and disorientation',
      'A normally oriented baseline yesterday',
    ],
    'Which finding should lead the handover?',
    [
      yes(
        'An acute cognitive change requiring assessment for a reversible cause',
        'The rapid change from baseline supports assessment for delirium and an acute precipitant. It should not be assumed to represent chronic dementia.',
        [0, 1]
      ),
      no(
        'A likely chronic memory disorder requiring routine screening',
        'A chronic disorder does not explain the documented rapid onset. Acute causes require timely assessment even if later cognitive screening is useful.',
        'Age and disorientation may trigger an assumption of dementia.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'A communication difficulty best addressed by repeating orientation',
        'Orientation support can help, but it does not replace assessment of the new cognitive change and its cause.',
        'Repeated orientation is a familiar supportive nursing action.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'A sleep-related change to compare with the following night’s behavior',
        'Sleep disruption may contribute, but the known acute baseline change should be assessed now rather than assigned to sleep alone.',
        'Hospital sleep disruption commonly affects attention.',
        'cue_misinterpretation',
        [0, 1]
      ),
    ],
    ['Distinguish a new cognitive change from a presumed chronic baseline'],
    'A reliable baseline comparison can identify deterioration even when an individual observation is nonspecific.',
    ['deterioration'],
    {
      referenceUrls: [
        'https://www.nice.org.uk/guidance/cg103/chapter/Recommendations',
      ],
    }
  ),
  vignette(
    'challenge',
    'An early hemoglobin after gastrointestinal bleeding',
    'A patient has passed a large black stool and vomited blood. The first hemoglobin remains close to the recent baseline. Over the next 30 minutes, heart rate rises and the patient becomes pale and faint. Blood pressure is lower than at arrival. The nurse is preparing an escalation call.',
    [
      'Recent overt gastrointestinal bleeding',
      'Initial hemoglobin near baseline',
      'Increasing heart rate over 30 minutes',
      'New pallor and faintness with falling pressure',
    ],
    'Which interpretation should guide the call?',
    [
      yes(
        'Possible ongoing circulatory compromise despite the initial hemoglobin',
        'A concentration measured early in acute bleeding may not reflect the total loss. The evolving perfusion findings require escalation and reassessment rather than reassurance from the initial number.',
        [0, 1, 2, 3]
      ),
      no(
        'A stable blood count makes a medication effect the leading explanation',
        'Medication effects can be considered, but a recent bleeding history with worsening circulation cannot be explained away by an early near-baseline concentration.',
        'A recent laboratory result may seem more objective than nonspecific bedside symptoms.',
        'cue_misinterpretation',
        [0, 1, 3]
      ),
      no(
        'The visible blood establishes severity more accurately than the circulation trend',
        'Visible loss helps identify the problem, but it may underestimate ongoing loss and does not replace repeated perfusion assessment.',
        'A directly observed bleeding episode appears easier to quantify than dizziness and pulse changes.',
        'misprioritization',
        [0, 2, 3]
      ),
      no(
        'The hemoglobin should be repeated before changing the observation intensity',
        'A repeat count may be needed, but the current trend warrants closer assessment and escalation without waiting for another laboratory confirmation.',
        'Serial blood counts are part of bleeding assessment.',
        'misprioritization',
        [1, 2, 3]
      ),
    ],
    [
      'Recognize the timing limitation of a concentration measurement',
      'Integrate bleeding history with a worsening circulation trend',
    ],
    'Dynamic bedside findings can outweigh an early reassuring laboratory concentration when acute loss is occurring.',
    ['fluids', 'deterioration']
  ),
  vignette(
    'challenge',
    'Respiratory change during transfusion in heart failure',
    'A patient with heart failure develops dyspnea during the second red-cell unit. Blood pressure is higher than before transfusion and crackles are now audible. There is no new rash or wheeze. The transfusion has been stopped and help has been requested. The team asks for the most useful additional information.',
    [
      'Dyspnea developing during the second unit',
      'Known heart failure',
      'New crackles with rising pressure',
      'No rash or wheeze',
    ],
    'Which information best helps distinguish a circulatory-load problem from other transfusion reactions?',
    [
      yes(
        'The transfusion rate, cumulative fluid balance and preceding respiratory findings',
        'Rate, total fluid exposure and change from baseline help evaluate circulatory overload while the full reaction pathway investigates other causes. The pattern suggests a mechanism but does not prove it.',
        [0, 1, 2, 3]
      ),
      no(
        'The patient’s prior antibiotic allergies and most recent skin examination',
        'Allergy history may be relevant, but it is less discriminating for a load-related respiratory change with rising pressure and crackles than the fluid exposure and baseline.',
        'A reaction during infusion can suggest an allergic mechanism.',
        'misprioritization',
        [0, 2, 3]
      ),
      no(
        'The product’s expiry date and storage history before delivery to the ward',
        'Product investigation is part of the pathway, but it does not directly assess whether the current physiology followed an excessive circulatory load.',
        'The temporal link to transfusion makes product quality a plausible concern.',
        'misprioritization',
        [0, 1, 2]
      ),
      no(
        'The pretransfusion hemoglobin and planned target after the second unit',
        'The indication for transfusion matters, but the current respiratory complication is better distinguished by exposure, balance and baseline findings.',
        'The target hemoglobin explains why the second unit was prescribed.',
        'premature_closure',
        [0, 1, 2]
      ),
    ],
    [
      'Integrate a new respiratory pattern with host risk and timing',
      'Select the additional evidence that best distinguishes competing mechanisms',
    ],
    'Use mechanism-focused information during a reaction assessment without prematurely declaring that one reaction type is confirmed.',
    ['transfusion', 'fluids']
  ),
  vignette(
    'challenge',
    'Potassium before insulin in ketoacidosis',
    'A patient with diabetic ketoacidosis has received initial fluid treatment. Potassium is now 3.1 mmol/L, below the local reference range. An insulin infusion is prescribed but has not started. The patient remains acidotic and is receiving cardiac monitoring. The nurse is checking the treatment sequence against the protocol.',
    [
      'Diabetic ketoacidosis with persistent acidosis',
      'Potassium 3.1 mmol/L after initial fluids',
      'Insulin prescribed but not started',
      'Cardiac monitoring is in place',
    ],
    'Which action best addresses the immediate treatment risk?',
    [
      yes(
        'Clarify the insulin start and arrange protocol-directed potassium correction first',
        'Insulin can lower extracellular potassium further. A low pretreatment potassium requires the team to correct that risk and confirm the appropriate insulin timing under the ketoacidosis pathway.',
        [0, 1, 2, 3]
      ),
      no(
        'Start insulin and reserve potassium replacement for a new ECG change',
        'The low potassium itself is relevant to risk; waiting for an ECG abnormality can miss further depletion during insulin treatment.',
        'The acidosis needs treatment and ECG monitoring is already available.',
        'misprioritization',
        [0, 1, 3]
      ),
      no(
        'Start insulin at the planned time and use improving glucose to guide potassium testing',
        'Glucose response cannot substitute for potassium monitoring. Insulin may improve glucose while worsening an already low potassium.',
        'Glucose is the most visible treatment-response measure in diabetes care.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'Repeat potassium after more fluids and defer notifying the prescriber until then',
        'A repeat result can inform treatment, but the current low value is sufficient to clarify an imminent insulin start and arrange correction.',
        'Fluid treatment can change laboratory values and a repeat may seem more representative.',
        'misprioritization',
        [1, 2]
      ),
    ],
    [
      'Recognize that treatment changes potassium distribution',
      'Prioritize correction of a current risk before the next treatment step',
    ],
    'Treatment sequencing is part of clinical judgment: an intervention for one abnormality can worsen another unless the current data are integrated.',
    ['insulinSafety', 'hyperkalaemia'],
    { referenceUrls: ['https://doi.org/10.2337/dci24-0032'] }
  ),
  vignette(
    'challenge',
    'Fever after recent cytotoxic treatment',
    'A patient received cytotoxic cancer treatment one week ago. They now report fever and shaking chills. They are alert, but the heart rate is increasing. The most recent neutrophil count was taken before treatment. The nurse is selecting the appropriate assessment pathway.',
    [
      'Recent cytotoxic treatment',
      'New fever with rigors',
      'Increasing heart rate',
      'Available neutrophil count predates treatment',
    ],
    'Which response best uses the timing and current findings?',
    [
      yes(
        'Activate urgent assessment for possible neutropenic sepsis and obtain current investigations',
        'The post-treatment timing and infection symptoms warrant urgent assessment. A count obtained before cytotoxic treatment does not establish the current neutrophil state.',
        [0, 1, 2, 3]
      ),
      no(
        'Use the pretreatment count to select a routine fever assessment appointment',
        'The earlier count cannot establish current neutrophil status after cytotoxic treatment, and the symptom trend warrants urgent evaluation.',
        'A documented normal count may appear to exclude neutropenia.',
        'outdated_data',
        [0, 1, 3]
      ),
      no(
        'Repeat the temperature after an antipyretic before deciding on escalation',
        'Antipyretic response does not exclude a serious infection in this treatment context. It should not determine whether urgent assessment occurs.',
        'A fall in fever can be mistaken for a reassuring treatment response.',
        'misprioritization',
        [0, 1, 2]
      ),
      no(
        'Wait for a confirmed low neutrophil count before using the sepsis pathway',
        'Suspected neutropenic sepsis is time-sensitive; current tests should be obtained within urgent assessment rather than used to postpone it.',
        'A laboratory threshold can seem necessary before selecting a specialized pathway.',
        'premature_closure',
        [0, 1, 2, 3]
      ),
    ],
    [
      'Account for how treatment changes the meaning of an older laboratory result',
      'Prioritize a time-sensitive pathway from the current pattern',
    ],
    'A recent normal result may have little exclusionary value after a treatment that can change the measured risk.',
    ['sepsis', 'deterioration'],
    {
      referenceUrls: [
        'https://www.nice.org.uk/guidance/cg151/chapter/Recommendations',
      ],
    }
  ),
  vignette(
    'challenge',
    'New abdominal findings after analgesia',
    'A patient is being observed for undifferentiated abdominal pain. The reported pain decreases after prescribed analgesia. During the following hour, the abdomen becomes more distended and the heart rate rises. The patient feels faint when sitting up. The nurse must decide whether the improvement in pain supports the current plan.',
    [
      'Undifferentiated abdominal pain under observation',
      'Lower pain score after analgesia',
      'Increasing distension and heart rate over an hour',
      'New positional faintness',
    ],
    'Which reassessment should take priority?',
    [
      yes(
        'Reassess circulation and the abdomen and escalate the new objective changes',
        'Analgesia can reduce pain without resolving the underlying process. Distension and evolving perfusion symptoms require a new evaluation of the patient’s trajectory.',
        [0, 1, 2, 3]
      ),
      no(
        'Use the improved pain score to progress oral intake and mobility',
        'The pain response does not account for the new distension and circulatory symptoms. Progressing activity before reassessment may miss deterioration.',
        'Pain relief often precedes functional recovery.',
        'premature_closure',
        [1, 2, 3]
      ),
      no(
        'Focus on an analgesic adverse effect and reassess after the drug wears off',
        'A medication effect is possible, but it does not justify postponing evaluation of the abdominal and circulatory trend.',
        'Dizziness can occur after analgesia.',
        'cue_misinterpretation',
        [1, 2, 3]
      ),
      no(
        'Repeat the pain score before deciding whether the abdomen needs review',
        'A repeated pain score is less discriminating than the new physical and perfusion findings. The reassessment should not depend on pain returning.',
        'Pain is a familiar escalation trigger in abdominal presentations.',
        'misprioritization',
        [1, 2, 3]
      ),
    ],
    [
      'Separate symptom relief from resolution of disease',
      'Prioritize a worsening objective trend over one improved symptom',
    ],
    'Reassessment tests whether the whole clinical pattern is improving, not whether a single treated symptom has become less noticeable.',
    ['abdominalCare', 'deterioration']
  ),
  vignette(
    'advanced',
    'Persistent neurologic deficit after glucose correction',
    'A patient using insulin develops confusion and right-arm weakness. Bedside glucose is low and is corrected promptly under protocol. The repeat glucose is in range and attention improves, but the unilateral weakness persists. Last known well was 40 minutes earlier. The patient takes an anticoagulant. The stroke team is available through the emergency pathway.',
    [
      'Initial hypoglycemia with confusion',
      'Glucose restored to the local target',
      'Attention improves after correction',
      'Persistent unilateral weakness',
      'Last known well 40 minutes ago',
      'Anticoagulant use',
    ],
    'Which plan best evaluates the remaining deficit?',
    [
      yes(
        'Activate stroke assessment with the corrected glucose, persistent deficit, onset time and anticoagulant history',
        'Hypoglycemia can mimic stroke, but persistent focal deficit after correction requires urgent stroke evaluation. Onset and anticoagulant history inform the team’s diagnostic and treatment assessment without establishing treatment eligibility here.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Continue the hypoglycemia pathway and reassess weakness after the next scheduled glucose check',
        'Serial glucose checks remain important, but the corrected value and persistent focal deficit create a separate time-sensitive concern that should not wait.',
        'The initial low glucose offers a coherent explanation for the original symptoms.',
        'premature_closure',
        [0, 1, 3, 4]
      ),
      no(
        'Treat the anticoagulant history as evidence against an ischemic process and request routine neurologic review',
        'Anticoagulation does not exclude ischemic stroke and also makes hemorrhage relevant. Urgent assessment is needed rather than assuming the mechanism.',
        'Anticoagulants reduce thromboembolic risk and may seem to rule out clot-related disease.',
        'cue_misinterpretation',
        [3, 4, 5]
      ),
      no(
        'Reclassify the event as a glucose-related episode because cognition improved with treatment',
        'A partial response does not explain the persistent lateralized weakness. Each unresolved finding must be reconsidered after the reversible cause is corrected.',
        'The improvement in attention supports at least part of the original explanation.',
        'premature_closure',
        [1, 2, 3]
      ),
    ],
    [
      'Use the treatment response to separate resolved from persistent findings',
      'Integrate residual focal deficit and time-critical treatment context',
      'Anticipate harm from diagnostic closure',
    ],
    'A successful initial intervention can clarify the remaining problem rather than end the assessment.',
    ['stroke', 'strokeTiming', 'insulinSafety'],
    {
      conflict:
        'Cognition improves with glucose while a focal motor deficit remains.',
      anticipation:
        'Delay may narrow time-sensitive options; continue glucose surveillance during urgent stroke evaluation.',
      uncertainty:
        'The remaining deficit does not establish ischemia versus hemorrhage or determine treatment eligibility.',
    }
  ),
  vignette(
    'advanced',
    'Fever improves while perfusion worsens',
    'A patient is receiving treatment for suspected infection. Temperature falls after an antipyretic and the patient says the chills have eased. Over the next hour urine output falls and mentation becomes slower. Blood pressure is lower than the patient’s usual baseline despite remaining above a familiar alert threshold. The patient has heart failure and new basal crackles after initial fluid. A repeat lactate is not yet available.',
    [
      'Suspected infection under treatment',
      'Fever and chills improve after antipyretic',
      'Falling urine output over an hour',
      'Slower mentation',
      'Pressure lower than personal baseline',
      'Heart failure with new crackles after fluid',
    ],
    'Which reassessment plan best addresses the competing findings?',
    [
      yes(
        'Escalate organ-perfusion changes and reassess fluid tolerance, source and hemodynamic support with the team',
        'The symptomatic response does not establish improved perfusion. The combined renal, cognitive and pressure changes warrant reassessment, while crackles and heart failure argue against reflex additional fluid without evaluating tolerance.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use the falling temperature to continue the current plan until the repeat lactate clarifies response',
        'A falling temperature after an antipyretic cannot override new organ-perfusion concerns. Lactate is adjunctive evidence and should not postpone bedside reassessment.',
        'Improving fever and a pending biomarker may make waiting feel evidence-based.',
        'misprioritization',
        [1, 2, 3, 4]
      ),
      no(
        'Use the falling urine output to repeat the initial fluid strategy before reassessing the respiratory findings',
        'Oliguria may suggest inadequate perfusion, but new crackles and heart failure require assessment of fluid tolerance and competing mechanisms before repeating a previous strategy.',
        'Low output after infection often raises concern for inadequate circulating volume.',
        'outdated_data',
        [2, 4, 5]
      ),
      no(
        'Attribute the lower pressure to the patient’s heart failure and focus reassessment on diuresis alone',
        'Congestion may coexist with impaired perfusion and infection. A single-cause plan does not integrate the new cognitive and renal deterioration or establish the safest support.',
        'Crackles after fluid strongly suggest a congestive component.',
        'premature_closure',
        [0, 2, 3, 5]
      ),
    ],
    [
      'Distinguish symptom control from organ-perfusion recovery',
      'Integrate hypoperfusion with limited fluid tolerance',
      'Select a reassessment that can revise support rather than repeat the prior plan',
    ],
    'Evaluate response across independent domains and use treatment intolerance to refine the next intervention.',
    ['sepsis', 'fluids', 'deterioration'],
    {
      conflict:
        'Fever improves while renal, cognitive and pressure findings worsen, with signs of limited fluid tolerance.',
      anticipation:
        'Monitor for pulmonary deterioration and progressive organ dysfunction while the team adjusts support.',
      uncertainty:
        'The information does not establish fluid responsiveness, the infection source or the required hemodynamic treatment.',
    }
  ),
  vignette(
    'advanced',
    'Dyspnea with competing transfusion mechanisms',
    'An older adult develops dyspnea and hypoxemia during a red-cell transfusion. The transfusion is stopped and the reaction pathway is activated. Pressure has risen, crackles are new and the fluid balance is positive. The patient also has fever, so a load-related explanation is not yet established. They have chronic heart failure and were breathing comfortably before the unit. The team is preparing investigation and supportive care.',
    [
      'Respiratory deterioration during transfusion',
      'New crackles and rising pressure',
      'Positive cumulative balance',
      'New fever',
      'Chronic heart failure',
      'Comfortable breathing before the unit',
    ],
    'Which evaluation plan best supports immediate care without prematurely classifying the reaction?',
    [
      yes(
        'Assess respiratory and circulatory status while comparing fluid exposure and investigating the full reaction differential',
        'Load-related findings are important, but fever and the temporal link require the broader reaction investigation. Immediate support and mechanism-focused evidence gathering can occur together without declaring overload or another reaction proven.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Classify the event as overload from the positive balance and narrow investigation to diuretic response',
        'The balance and host risk support overload, but they do not exclude other transfusion complications. A response to treatment alone cannot replace the reaction investigation.',
        'The pressure rise, crackles and heart failure form a persuasive circulatory pattern.',
        'premature_closure',
        [1, 2, 3, 4]
      ),
      no(
        'Classify the fever as an allergic reaction and use antihistamine response to decide whether to restart',
        'Fever with respiratory compromise is not sufficient to diagnose an allergic mechanism or justify restart. The broader physiologic pattern and investigation remain necessary.',
        'An infusion-related symptom cluster may be interpreted as allergy.',
        'cue_misinterpretation',
        [0, 1, 3]
      ),
      no(
        'Prioritize the baseline heart-failure history and regard transfusion timing as coincidental until testing returns',
        'Prior heart failure does not explain away a new deterioration during transfusion. The suspected exposure and new baseline change warrant the reaction pathway while test results are pending.',
        'An established chronic diagnosis offers an available explanation for crackles.',
        'outdated_data',
        [0, 4, 5]
      ),
    ],
    [
      'Weigh a likely mechanism without treating it as confirmed',
      'Integrate host risk, exposure timing and discordant fever',
      'Preserve broad investigation while supporting current physiology',
    ],
    'A plausible leading explanation should organize investigation, not erase alternatives that change immediate safety decisions.',
    ['transfusion', 'fluids'],
    {
      conflict:
        'Circulatory-load findings favor overload while fever leaves additional transfusion complications in the differential.',
      anticipation:
        'Reassess oxygen need, pressure and fluid tolerance and communicate any worsening during investigation.',
      uncertainty:
        'No single finding here establishes TACO, TRALI, hemolysis or infection.',
    }
  ),
  vignette(
    'advanced',
    'A reassuring pain score after trauma',
    'A patient with blunt abdominal trauma reports less pain after analgesia. The initial hemoglobin was near baseline and the abdominal examination was limited by guarding. Ninety minutes later the heart rate rises and pressure trends downward. The abdomen appears more distended and urine output has decreased. The patient remains awake and asks to walk to the bathroom. No repeat imaging or blood count has yet been reviewed.',
    [
      'Blunt abdominal trauma',
      'Pain decreases after analgesia',
      'Early hemoglobin near baseline',
      'Rising pulse and falling pressure over 90 minutes',
      'Increasing distension',
      'Reduced urine output with preserved alertness',
    ],
    'Which plan best evaluates whether apparent comfort represents recovery?',
    [
      yes(
        'Escalate possible concealed loss, repeat focused perfusion and abdominal assessment and reassess safe activity',
        'The evolving circulatory, abdominal and renal findings may indicate concealed bleeding despite comfort, alertness and an early hemoglobin. Reassessment and trauma-team review should precede walking or reassurance.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Progress assisted walking because pain and alertness have improved, then repeat observations afterward',
        'Analgesic response and preserved consciousness do not establish hemodynamic recovery. Activity could provoke further compromise before the deteriorating trend is assessed.',
        'Functional activity is often used as a recovery marker once pain is controlled.',
        'misprioritization',
        [1, 3, 4, 5]
      ),
      no(
        'Repeat the blood count and make escalation depend on a measurable hemoglobin decrease',
        'A repeat count is relevant but should not become a prerequisite when current perfusion findings already suggest deterioration. Concentration and total blood loss are not interchangeable.',
        'Serial hemoglobin seems to offer an objective threshold for intervention.',
        'cue_misinterpretation',
        [2, 3, 4, 5]
      ),
      no(
        'Attribute the falling pressure to analgesia and compare it with the next scheduled medication dose',
        'A medication effect is possible, but it does not adequately resolve the concurrent distension and oliguria after trauma. A narrow attribution risks missing ongoing injury.',
        'Analgesia can reduce sympathetic tone and blood pressure.',
        'premature_closure',
        [0, 1, 3, 4, 5]
      ),
    ],
    [
      'Identify findings that analgesia and an early count cannot exclude',
      'Integrate multi-domain trends to evaluate concealed loss',
      'Anticipate positional or exertional deterioration',
    ],
    'Comfort is one outcome of care, while recovery requires a coherent improvement in the underlying physiologic pattern.',
    ['traumaAssessment', 'deterioration', 'fluids'],
    {
      conflict:
        'Comfort and alertness improve while circulation, abdominal findings and urine output worsen.',
      anticipation:
        'Avoid unassessed exertion and prepare for urgent trauma reassessment if the trajectory continues.',
      uncertainty:
        'The site and volume of any concealed bleeding are not established by the available observations.',
    }
  ),
  vignette(
    'advanced',
    'Low intake with hyperglycemia and kidney dysfunction',
    'An older adult with diabetes presents after several days of poor intake. They are drowsy, markedly hyperglycemic and clinically dehydrated. Kidney function has worsened from baseline. There is also chronic heart failure and a prior episode of pulmonary edema during fluid treatment. Blood ketones and measured osmolality are pending. The team asks which observations should guide the first phase of treatment review.',
    [
      'Several days of reduced intake',
      'Marked hyperglycemia with drowsiness',
      'Clinical dehydration',
      'Acute decline in kidney function',
      'Heart failure with prior fluid intolerance',
      'Ketones and osmolality not yet available',
    ],
    'Which monitoring plan best balances correction of the deficit with treatment-related risk?',
    [
      yes(
        'Trend mentation, perfusion, fluid balance, respiratory status and protocol-directed metabolic results together',
        'The presentation requires urgent metabolic assessment and individualized fluid review. Combining neurologic, circulatory, renal and respiratory response with glucose, electrolytes and osmolality helps detect both persistent deficit and unsafe correction or overload.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use the glucose fall as the primary endpoint and adjust observation frequency when it reaches the target',
        'Glucose alone cannot establish safe correction of osmolality, adequate perfusion or fluid tolerance. The comorbidities make multi-domain monitoring especially important.',
        'Glucose is rapidly available and directly reflects the dominant measured abnormality.',
        'cue_misinterpretation',
        [1, 3, 4, 5]
      ),
      no(
        'Use the dehydration findings to repeat a standard fluid schedule before comparing respiratory response',
        'A deficit may require fluid, but prior intolerance and kidney dysfunction require individualized reassessment rather than an unreviewed standard schedule.',
        'Dehydration is prominent and often improves with replacement.',
        'misprioritization',
        [2, 3, 4]
      ),
      no(
        'Use the heart-failure history to prioritize negative fluid balance until the osmolality result is available',
        'A prior overload episode does not establish current congestion. Prioritizing net fluid removal without integrating the present deficit and perfusion could worsen the acute problem.',
        'Previous pulmonary edema is a memorable and serious treatment complication.',
        'outdated_data',
        [2, 3, 4, 5]
      ),
    ],
    [
      'Integrate a current fluid deficit with limited renal and cardiac tolerance',
      'Identify complementary endpoints beyond glucose',
      'Anticipate complications from both persistent deficit and overly rapid or excessive correction',
    ],
    'Advanced monitoring links treatment to the patient’s current physiology and competing risks rather than one laboratory target or a previous episode.',
    ['insulinSafety', 'aki', 'fluids'],
    {
      conflict:
        'The patient needs assessment of dehydration while cardiac and renal history increase the risk of harmful fluid accumulation.',
      anticipation:
        'Escalate worsening cognition, perfusion or respiratory findings and review the pace of metabolic correction.',
      uncertainty:
        'Pending ketones and osmolality prevent classification of the metabolic crisis from glucose alone.',
      referenceUrls: ['https://doi.org/10.2337/dci24-0032'],
    }
  )
)

acuteCareQualityQuestions.push(
  vascular(
    'foundation',
    'A newly cold and numb foot',
    'A patient develops sudden pain in one foot. That foot is colder than the other and the patient describes new numbness. The patient was walking comfortably earlier today. The nurse is preparing the first focused assessment.',
    [
      'Sudden unilateral foot pain',
      'New coldness and numbness',
      'Normal function earlier today',
    ],
    'Which concern should guide the immediate escalation?',
    [
      yes(
        'Acute arterial perfusion impairment',
        'Abrupt pain with coldness and sensory change raises concern for acute limb ischemia, which requires urgent assessment of limb viability.',
        [0, 1, 2]
      ),
      no(
        'Chronic venous insufficiency',
        'Venous disease more often produces swelling and chronic skin changes. It does not adequately explain an abrupt cold, numb foot.',
        'Vascular symptoms in the lower limb may be grouped together as venous disease.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'A distal sensory neuropathy',
        'Neuropathy can cause numbness, but the sudden painful temperature change is a perfusion warning rather than an isolated sensory complaint.',
        'Numbness is a familiar neuropathy symptom.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'An acute joint inflammation',
        'A joint process can cause pain but does not adequately explain a cold foot with new distal sensory change.',
        'The patient localizes the discomfort to the foot.',
        'cue_misinterpretation',
        [0, 1]
      ),
    ],
    ['Recognize the pattern of acute threatened arterial supply'],
    'A sudden change in temperature and sensation changes a painful limb from a routine complaint to a possible perfusion emergency.',
    ['deterioration'],
    {
      referenceUrls: [
        'https://www.ahajournals.org/doi/full/10.1161/CIR.0000000000001251',
      ],
    }
  ),
  vascular(
    'foundation',
    'A swollen calf after immobility',
    'A patient has spent several days largely in bed after surgery. One calf is newly swollen and tender compared with the other. There is no breathlessness or chest discomfort at present. The nurse is selecting the appropriate assessment pathway.',
    [
      'Recent surgery with reduced mobility',
      'New unilateral calf swelling and tenderness',
    ],
    'Which problem requires assessment from this pattern?',
    [
      yes(
        'Possible deep vein thrombosis',
        'Recent surgery and immobility with new unilateral swelling support assessment for DVT. The pattern is not diagnostic, but it warrants the appropriate clinical probability and testing pathway.',
        [0, 1]
      ),
      no(
        'Expected bilateral dependent edema',
        'Dependent edema is commonly bilateral and does not adequately explain a new tender unilateral calf in this risk context.',
        'Immobility can cause dependent swelling.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'A resolving postoperative fluid deficit',
        'A systemic volume deficit does not explain focal swelling and tenderness in one calf.',
        'Fluid shifts are common after surgery.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'A chronic arterial claudication pattern',
        'Claudication is usually exertional discomfort relieved by rest, rather than new tender calf swelling after immobility.',
        'Calf symptoms can be associated with arterial disease.',
        'cue_misinterpretation',
        [0, 1]
      ),
    ],
    ['Connect venous risk factors with a new unilateral finding'],
    'Use the pattern to select an assessment pathway while avoiding a diagnosis based on symptoms alone.',
    ['vte']
  ),
  vascular(
    'foundation',
    'New back pain with known aneurysm',
    'An older adult has a known abdominal aortic aneurysm. They develop sudden severe back pain and feel faint. The pain is different from their usual mechanical back discomfort. The nurse is taking the first handover.',
    [
      'Known abdominal aortic aneurysm',
      'New severe back pain with faintness',
      'Pain differs from the usual back symptoms',
    ],
    'Which concern should lead the urgent assessment?',
    [
      yes(
        'A symptomatic or rupturing aortic aneurysm',
        'A known aneurysm with new severe back pain and circulatory symptoms warrants urgent evaluation for an aortic complication, even without a palpable mass.',
        [0, 1, 2]
      ),
      no(
        'An exacerbation of chronic mechanical back pain',
        'The new character and faintness in a patient with an aneurysm make a vascular cause important to assess before assigning the familiar musculoskeletal diagnosis.',
        'The patient already has a history of back discomfort.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'A urinary obstruction causing referred pain',
        'Urinary disease can cause back pain but does not explain away the aneurysm-related risk and faintness in this presentation.',
        'Renal and urinary pain can radiate to the back.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'A medication-related postural episode',
        'Medication effects may cause faintness, but they do not account for the new severe back pain in the context of an aneurysm.',
        'Faintness often prompts a medication or postural review.',
        'misprioritization',
        [0, 1]
      ),
    ],
    ['Recognize a high-risk change within a known vascular condition'],
    'An established benign symptom history should not absorb a new pattern with a different risk context.',
    ['deterioration'],
    {
      referenceUrls: [
        'https://www.nice.org.uk/guidance/ng156/chapter/Recommendations',
      ],
    }
  ),
  vascular(
    'foundation',
    'Arterial assessment before leg compression',
    'A patient has a lower-leg ulcer and edema. The referral suggests a venous cause, but pedal pulses are difficult to feel. No arterial assessment result accompanies the referral. The nurse is considering the proposed strong compression dressing.',
    [
      'Possible venous ulcer with edema',
      'Pedal pulses difficult to feel',
      'Arterial supply has not been assessed',
    ],
    'What information should be clarified before applying strong compression?',
    [
      yes(
        'Whether arterial perfusion is adequate for the proposed compression',
        'A venous appearance does not exclude coexisting arterial disease. The arterial assessment and local pathway should establish the safety and appropriate level of compression.',
        [0, 1, 2]
      ),
      no(
        'Whether the edema improves with one overnight compression trial',
        'A trial response does not establish safe arterial supply before strong compression. Reduced pulses require assessment rather than a therapeutic test.',
        'Compression is a standard treatment for venous edema.',
        'misprioritization',
        [0, 1, 2]
      ),
      no(
        'Whether the ulcer pain decreases after a stronger dressing',
        'Pain relief cannot establish adequate perfusion and may be unreliable in neuropathy. The arterial question must be resolved first.',
        'Symptom improvement can be used to judge many wound treatments.',
        'cue_misinterpretation',
        [1, 2]
      ),
      no(
        'Whether the referral diagnosis is recent enough to replace pulse assessment',
        'A recent label does not replace evaluating a current perfusion concern or establish that arterial testing was performed.',
        'A specialist referral may appear to have already settled wound etiology.',
        'premature_closure',
        [0, 1, 2]
      ),
    ],
    ['Identify the missing safety assessment before a vascular intervention'],
    'A likely venous problem can coexist with arterial impairment; treatment safety depends on the current perfusion assessment.',
    ['deterioration'],
    {
      referenceUrls: [
        'https://www.nice.org.uk/guidance/htg677/chapter/2-The-diagnostic-tests',
      ],
    }
  ),
  vascular(
    'foundation',
    'New chest symptoms during DVT assessment',
    'A patient is awaiting testing for a swollen calf. They suddenly report pleuritic chest pain and shortness of breath. These symptoms were absent at triage. The nurse is at the bedside.',
    [
      'Calf symptoms under DVT assessment',
      'New sudden pleuritic pain and breathlessness',
    ],
    'Which concern should guide immediate reassessment?',
    [
      yes(
        'Possible pulmonary embolism with assessment of current stability',
        'A new cardiopulmonary syndrome in this venous-risk context warrants urgent assessment for PE and its physiologic effects.',
        [0, 1]
      ),
      no(
        'A musculoskeletal pain episode from remaining in bed',
        'Immobility can cause discomfort, but sudden pleuritic pain with breathlessness requires assessment of a more serious cause first.',
        'The patient has been resting while waiting for testing.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'A routine extension of the original calf-pain assessment',
        'The new respiratory symptoms change the immediate assessment priority rather than simply adding another local leg symptom.',
        'The calf problem is the established reason for presentation.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'An anxiety response to the pending ultrasound result',
        'Anxiety is possible, but it should not be assigned before evaluating a sudden respiratory symptom cluster with a thromboembolic risk context.',
        'Waiting for tests can cause distress and breathlessness.',
        'premature_closure',
        [0, 1]
      ),
    ],
    ['Recognize a new organ-system threat within a venous presentation'],
    'Reassess the active problem when new symptoms imply a complication beyond the original body region.',
    ['vte']
  ),
  vascular(
    'challenge',
    'A sensory change during limb ischemia assessment',
    'A patient is being assessed for abrupt unilateral foot pain. The foot was cool but movement was preserved on arrival. During the next 20 minutes, toe numbness increases and the patient has difficulty moving the toes. The pedal arterial signal remains difficult to obtain. The vascular team has not yet reviewed the latest findings.',
    [
      'Abrupt painful cool foot',
      'Preserved movement at arrival',
      'Increasing numbness over 20 minutes',
      'New difficulty moving toes',
      'Pedal arterial signal difficult to obtain',
    ],
    'Which change most increases the urgency of the handover?',
    [
      yes(
        'The progression from preserved movement to new motor difficulty',
        'Progressive sensory loss with new motor impairment raises concern for increasing limb threat and requires immediate communication to the vascular team.',
        [1, 2, 3, 4]
      ),
      no(
        'The persistence of pain despite an unchanged description of the foot',
        'Pain matters, but the new motor deficit and progressive sensation change are more direct evidence of increasing limb threat than persistence of the original symptom alone.',
        'Pain was the initial dominant symptom and often drives urgency.',
        'misprioritization',
        [0, 2, 3]
      ),
      no(
        'The fact that an arterial signal was difficult to obtain on both assessments',
        'The signal is important, but an unchanged technical finding should not overshadow the new functional deficit that changes the trajectory.',
        'Repeated difficulty finding a signal appears to provide objective confirmation.',
        'outdated_data',
        [1, 3, 4]
      ),
      no(
        'The absence of a completed vascular review at the original examination',
        'The missing review is relevant to process, but the most urgent new clinical information is progression to motor difficulty.',
        'An incomplete specialist assessment may seem the primary reason for escalation.',
        'misprioritization',
        [1, 2, 3]
      ),
    ],
    [
      'Compare current neurologic function with the arrival examination',
      'Prioritize a new limb-viability finding within the existing ischemic pattern',
    ],
    'Serial examination can change urgency even when the initial diagnosis and some observations remain the same.',
    ['deterioration'],
    {
      referenceUrls: [
        'https://www.ahajournals.org/doi/full/10.1161/CIR.0000000000001251',
      ],
    }
  ),
  vascular(
    'challenge',
    'Circulatory change after femoral access',
    'A patient returns from a procedure using femoral arterial access. The visible puncture dressing is dry and there is no large groin swelling. Over the next hour they develop back discomfort and lightheadedness. Heart rate rises and pressure falls from the postprocedure baseline. The nurse is assessing for a procedure-related complication.',
    [
      'Recent femoral arterial access',
      'Dry dressing without a large visible hematoma',
      'New back discomfort and lightheadedness',
      'Rising pulse and falling pressure over an hour',
    ],
    'Which concern warrants urgent escalation despite the appearance of the groin?',
    [
      yes(
        'Possible concealed access-related bleeding',
        'A dry puncture site does not exclude bleeding into a deeper or retroperitoneal space. The procedure context and evolving circulatory symptoms require urgent assessment.',
        [0, 1, 2, 3]
      ),
      no(
        'Expected discomfort from lying flat with a stable access site',
        'Positional discomfort may occur, but it does not adequately explain the worsening circulation trend. The visible site cannot establish absence of deeper bleeding.',
        'Prolonged supine positioning commonly causes back discomfort.',
        'premature_closure',
        [1, 2, 3]
      ),
      no(
        'A localized puncture-site infection developing beneath the dressing',
        'The immediate timing and circulation trend make bleeding more urgent to assess than a new localized infection without supporting local findings.',
        'Any invasive access carries an infection risk.',
        'cue_misinterpretation',
        [0, 2, 3]
      ),
      no(
        'A vasovagal episode established by the symptom of lightheadedness',
        'Lightheadedness is nonspecific, and the progressive trend with back pain after arterial access requires consideration of concealed bleeding rather than a symptom-based label.',
        'Postprocedural dizziness can be associated with a vagal response.',
        'premature_closure',
        [0, 2, 3]
      ),
    ],
    [
      'Identify the limit of a reassuring surface examination',
      'Integrate procedure timing, pain location and a circulation trend',
    ],
    'A visible access site is only one part of the bleeding assessment; internal loss may present through a changing physiologic pattern.',
    ['deterioration'],
    {
      referenceUrls: [
        'https://cvquality.acc.org/docs/default-source/pci-bleeding-risk-checklist/6-post-pci-procedure-groin-bleed-instructionspdf.pdf',
        'https://www.scai.org/quality-improvement-tools/qi-tips/quality-initiatives-prevent-and-manage-major-femoral-access-site',
      ],
    }
  ),
  vascular(
    'challenge',
    'A negative initial proximal venous ultrasound',
    'A patient has a clinically likely DVT presentation. The initial proximal leg ultrasound is negative, but the D-dimer is positive. There are no new chest symptoms or instability. The local pathway follows NICE recommendations for this testing combination. The patient asks whether the negative scan ends follow-up.',
    [
      'Clinically likely DVT presentation',
      'Negative initial proximal ultrasound',
      'Positive D-dimer',
      'No current chest symptoms or instability',
    ],
    'Which follow-up should be explained under this pathway?',
    [
      yes(
        'Arrange the recommended repeat proximal ultrasound and provide return precautions',
        'This result combination requires planned repeat proximal ultrasound under the stated pathway, rather than treating the first negative scan as complete exclusion. New cardiopulmonary symptoms require urgent reassessment.',
        [0, 1, 2, 3]
      ),
      no(
        'End DVT follow-up because the imaging result outweighs the positive D-dimer',
        'A negative proximal scan does not end the stated pathway when D-dimer is positive and the presentation remains clinically likely.',
        'Imaging appears more definitive than a nonspecific laboratory marker.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'Repeat D-dimer and use normalization to decide whether another scan is needed',
        'The stated pathway calls for repeat ultrasound; D-dimer normalization is not a substitute for the recommended imaging follow-up.',
        'Repeating the abnormal test may seem a practical way to establish improvement.',
        'cue_misinterpretation',
        [1, 2]
      ),
      no(
        'Treat the positive D-dimer as a confirmed DVT and omit further diagnostic imaging',
        'D-dimer is not specific enough to confirm DVT. The combination requires the appropriate follow-up rather than diagnostic closure in the opposite direction.',
        'A positive result plus leg symptoms can appear to confirm a clot despite one negative scan.',
        'premature_closure',
        [0, 1, 2]
      ),
    ],
    [
      'Interpret a test combination within its diagnostic pathway',
      'Choose follow-up that addresses the limitations of the initial assessment',
    ],
    'A negative test can require planned reassessment when the pretest context and another result leave the question unresolved.',
    ['vte']
  ),
  vascular(
    'challenge',
    'A high ankle-brachial index in diabetes',
    'A patient with diabetes has a nonhealing toe wound. The foot is cool and pedal pulses are difficult to detect. An ankle-brachial index is above the laboratory range for compressible arteries. The wound has not improved over several weeks. The nurse is reviewing whether the result establishes adequate arterial supply.',
    [
      'Diabetes with a nonhealing toe wound',
      'Cool foot with weak pedal findings',
      'Ankle-brachial index above the compressible range',
      'Failure to heal over several weeks',
    ],
    'Which interpretation best guides further assessment?',
    [
      yes(
        'Noncompressible vessels may make the index misleading; obtain the recommended alternative perfusion assessment',
        'Arterial stiffness can produce a high index that does not establish adequate distal perfusion. The wound and examination warrant further assessment, often including toe pressure or other vascular testing under the pathway.',
        [0, 1, 2, 3]
      ),
      no(
        'A high index shows increased arterial pressure and makes ischemia unlikely',
        'A high value beyond the compressible range may reflect noncompressibility rather than effective tissue perfusion. It cannot override the wound and examination.',
        'A larger pressure ratio may be interpreted as stronger blood supply.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'A high index identifies venous disease as the main reason for poor healing',
        'The index assesses an arterial relationship and does not diagnose venous insufficiency. The arterial concern remains unresolved.',
        'Venous disease is a common alternative explanation for a chronic wound.',
        'premature_closure',
        [1, 2, 3]
      ),
      no(
        'An unchanged index is sufficient follow-up until the wound becomes painful',
        'Pain may be unreliable in diabetes and an index affected by noncompressibility cannot safely serve as the sole follow-up measure.',
        'Stable test results and little pain can appear reassuring in a chronic wound.',
        'outdated_data',
        [0, 1, 2, 3]
      ),
    ],
    [
      'Recognize a measurement limitation specific to the patient context',
      'Prioritize alternative perfusion evidence over a misleading numerical result',
    ],
    'A numerical test is useful only when its assumptions hold; reconcile it with the physical examination and healing trajectory.',
    ['deterioration'],
    {
      referenceUrls: [
        'https://www.ahajournals.org/doi/full/10.1161/CIR.0000000000001251',
      ],
    }
  ),
  vascular(
    'challenge',
    'Back pain in an aneurysm surveillance patient',
    'A patient with an aneurysm under surveillance develops new constant back pain. The last surveillance scan was stable four months ago. Current pressure is near the patient’s usual value, but they look pale and feel faint when sitting up. There has been no recent lifting injury. The nurse is deciding whether to use routine surveillance or acute assessment.',
    [
      'Known aneurysm with a previously stable scan',
      'New constant back pain',
      'Current pressure near usual baseline',
      'Pallor and positional faintness',
      'No clear mechanical trigger',
    ],
    'Which plan best accounts for the timing of the available evidence?',
    [
      yes(
        'Arrange urgent assessment of a possible symptomatic aneurysm using the current findings',
        'A previously stable scan cannot exclude a new symptomatic complication. Current pain and circulatory symptoms warrant acute assessment despite an initially familiar pressure.',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Bring the surveillance scan forward and manage the pain through the routine clinic',
        'Routine surveillance is not designed to assess a new potentially symptomatic complication with faintness and pallor.',
        'The aneurysm already has an established follow-up pathway.',
        'outdated_data',
        [0, 1, 3]
      ),
      no(
        'Use the normal pressure to prioritize a mechanical back-pain assessment',
        'One near-baseline pressure cannot exclude a serious aortic problem in this context. The absence of a mechanical trigger and new faintness require vascular consideration.',
        'Hemodynamic stability can appear inconsistent with a serious vascular complication.',
        'cue_misinterpretation',
        [1, 2, 3, 4]
      ),
      no(
        'Use the prior stable size to postpone vascular review until pain persists overnight',
        'A stable measurement four months earlier does not establish the cause or safety of today’s new symptoms. Waiting adds delay without resolving the risk.',
        'Slow aneurysm growth during surveillance may appear to make an acute change unlikely.',
        'outdated_data',
        [0, 1, 3]
      ),
    ],
    [
      'Distinguish surveillance information from evidence about a new acute presentation',
      'Prioritize the current symptom and perfusion pattern',
    ],
    'A stable chronic measurement should not become a reason to defer assessment of a new, clinically different event.',
    ['deterioration'],
    {
      referenceUrls: [
        'https://www.nice.org.uk/guidance/ng156/chapter/Recommendations',
      ],
    }
  ),
  vascular(
    'advanced',
    'A pulse after limb reperfusion',
    'A patient is monitored after revascularization of an ischemic leg. A pedal signal is now present and the foot is warmer than before the procedure. During the next hour calf pain intensifies despite analgesia and the muscle compartment feels tense. Passive toe movement worsens pain and sensation is changing. The patient interprets the restored signal as proof that the leg is recovering. The vascular team is available for immediate review.',
    [
      'Recent limb revascularization',
      'Restored pedal signal and warmth',
      'Escalating calf pain despite analgesia',
      'Tense compartment',
      'Pain with passive movement',
      'New sensory change',
    ],
    'Which evaluation should take priority despite the restored arterial signal?',
    [
      yes(
        'Urgent surgical assessment for compartment pressure injury during serial neurovascular reassessment',
        'Reperfusion can restore a distal signal while swelling threatens tissue within a compartment. The pain, tension and sensory trend require urgent surgical evaluation; a pulse does not exclude this complication.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Routine observation of reperfusion discomfort using the restored signal as the main recovery endpoint',
        'Some discomfort can follow intervention, but the escalating pain, tense compartment and sensory change are not adequately explained by a reassuring signal.',
        'Warmth and a returning signal are expected signs of successful revascularization.',
        'premature_closure',
        [1, 2, 3, 4, 5]
      ),
      no(
        'Analgesic adjustment followed by examination at the next standard vascular observation interval',
        'Analgesia does not address the possible pressure-related threat. New neurologic and passive-movement findings require review sooner than a routine interval.',
        'Pain after an invasive procedure can reasonably prompt a medication review.',
        'misprioritization',
        [2, 3, 4, 5]
      ),
      no(
        'Assessment for recurrent arterial occlusion based primarily on whether the restored signal disappears',
        'Reocclusion remains a differential, but waiting for signal loss misses the pressure-related pattern that can exist with a distal pulse. Surgical reassessment should occur now.',
        'Loss of a previously absent pulse is a familiar threshold for limb-threat escalation.',
        'cue_misinterpretation',
        [0, 1, 3, 4, 5]
      ),
    ],
    [
      'Separate restored large-vessel flow from tissue safety within a swollen compartment',
      'Integrate pain behavior and neurologic change to identify an evolving post-reperfusion complication',
    ],
    'Successful treatment changes the risk landscape; evaluate new complications rather than using the original success measure as a universal safety marker.',
    ['compartment', 'deterioration'],
    {
      conflict:
        'A restored distal signal suggests successful flow while a tense painful compartment and sensory change suggest a new tissue threat.',
      anticipation:
        'Further delay can worsen neuromuscular injury even if the signal remains present.',
      uncertainty:
        'The observations support urgent assessment but do not replace surgical evaluation or pressure measurement when indicated.',
      referenceUrls: [
        'https://www.ahajournals.org/doi/full/10.1161/CIR.0000000000001251',
      ],
    }
  ),
  vascular(
    'advanced',
    'Breathlessness during anticoagulation with evidence of bleeding',
    'A patient being treated for DVT develops new breathlessness and near-syncope. Oxygen need and heart rate have increased. They report taking the anticoagulant as prescribed, but also passed a black stool today. Hemoglobin has fallen from yesterday. The calf is less swollen, and the patient assumes the clot is resolving. Current pressure is lower than their usual baseline.',
    [
      'DVT under anticoagulant treatment',
      'New breathlessness and near-syncope',
      'Increasing oxygen need and heart rate',
      'Reported adherence to anticoagulation',
      'Black stool with falling hemoglobin',
      'Lower pressure despite improving calf swelling',
    ],
    'Which evaluation plan best addresses the competing explanations for deterioration?',
    [
      yes(
        'Escalate instability and assess both thromboembolic progression and bleeding with urgent team review of anticoagulation',
        'Treatment and less calf swelling do not exclude PE, while melena and a falling count introduce a major bleeding concern. The team needs immediate stability assessment and coordinated diagnostic and anticoagulation review rather than a single-mechanism assumption.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Treat the improved calf and adherence as evidence against PE and focus the assessment on gastrointestinal blood loss',
        'Bleeding is important, but current adherence and local improvement do not exclude a new thromboembolic complication. The respiratory and circulatory pattern needs broader urgent assessment.',
        'The bleeding evidence is concrete and the original leg symptoms have improved.',
        'premature_closure',
        [1, 2, 3, 4, 5]
      ),
      no(
        'Treat the respiratory deterioration as anticoagulation failure and prioritize dose intensification before bleeding review',
        'The black stool, falling count and pressure change make bleeding highly relevant to the safety of further anticoagulation. Treatment failure cannot be established or managed from respiratory symptoms alone.',
        'A known clot and new oxygen need strongly suggest thromboembolic progression.',
        'misprioritization',
        [0, 1, 2, 4, 5]
      ),
      no(
        'Use the reported adherence to defer urgent testing until the next scheduled blood count',
        'Adherence does not establish treatment success or exclude a treatment complication. New instability warrants assessment without waiting for routine monitoring.',
        'Appropriate medication use can be mistaken for evidence that the main risks are controlled.',
        'cue_misinterpretation',
        [1, 2, 3, 4, 5]
      ),
    ],
    [
      'Evaluate a new syndrome despite improvement in the original local symptom',
      'Integrate a competing treatment complication into diagnostic and medication review',
      'Anticipate harm from assuming either bleeding or thrombosis alone',
    ],
    'Treatment can reduce one risk while introducing another. A changing patient requires a plan that evaluates both before escalating a potentially harmful intervention.',
    ['vte', 'deterioration'],
    {
      conflict:
        'Local clot symptoms improve during reported treatment adherence, but new cardiopulmonary findings coexist with evidence of bleeding.',
      anticipation:
        'Monitor for worsening shock or respiratory compromise while the team resolves the immediate anticoagulation and investigation plan.',
      uncertainty:
        'Neither PE progression nor the location and severity of bleeding is established from these findings alone.',
    }
  ),
  vascular(
    'advanced',
    'Motor change after a reassuring initial limb examination',
    'An adult with atrial fibrillation develops abrupt unilateral foot pain. At arrival the limb is cool, but movement and sensation are documented as intact. The patient has recently missed anticoagulant doses. Forty minutes later pain is less prominent after analgesia, yet sensation is reduced and ankle movement is weak. The opposite limb remains warm with normal movement. The initial nonurgent imaging request has not yet been completed.',
    [
      'Atrial fibrillation with missed anticoagulant doses',
      'Abrupt unilateral pain and coolness',
      'Initially intact movement and sensation',
      'Pain reduced after analgesia',
      'New sensory loss and weak ankle movement',
      'Imaging pending under the original priority',
    ],
    'Which action best reflects the change in limb threat?',
    [
      yes(
        'Immediately update the vascular team with the new neurologic deficit and request reassessment of imaging and intervention urgency',
        'The evolving sensory and motor deficit indicates a more threatened limb despite lower pain. The initial priority must be revised using the current examination rather than waiting within the original nonurgent plan.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Retain the original imaging priority because the pain score has improved and the patient is more comfortable',
        'Analgesia does not restore perfusion, and new motor and sensory changes outweigh symptom relief as markers of increasing limb threat.',
        'The visible response to treatment can be mistaken for improvement in the underlying process.',
        'premature_closure',
        [2, 3, 4, 5]
      ),
      no(
        'Repeat the original examination schedule before reporting a partial movement change',
        'Waiting for complete motor loss delays reassessment of an already worsening neurologic pattern. Partial weakness is a material change.',
        'A complete loss of function may seem a clearer threshold for emergency action.',
        'misprioritization',
        [2, 4, 5]
      ),
      no(
        'Focus the handover on missed anticoagulation and defer the new examination until the embolic source is confirmed',
        'The embolic context matters, but limb viability and current deterioration determine immediate urgency. Source confirmation should not postpone communicating the new deficit.',
        'An identifiable cause may seem necessary before changing the treatment pathway.',
        'misprioritization',
        [0, 1, 4, 5]
      ),
    ],
    [
      'Reassess whether the original urgency still matches the current neurologic findings',
      'Weigh objective function against analgesic symptom relief',
      'Anticipate delay-related tissue injury',
    ],
    'Advanced reassessment updates the working plan when the patient changes, even when a treatment has improved one symptom.',
    ['deterioration'],
    {
      conflict:
        'Pain is less prominent while objective sensory and motor function deteriorate.',
      anticipation:
        'Further delay risks progression of limb injury; report exact onset and serial function findings.',
      uncertainty:
        'An embolic cause is plausible but not proven, and the specialist assessment determines the revascularization strategy.',
      referenceUrls: [
        'https://www.ahajournals.org/doi/full/10.1161/CIR.0000000000001251',
      ],
    }
  ),
  vascular(
    'advanced',
    'A normal pressure in a painful aneurysm presentation',
    'A patient with a known abdominal aneurysm presents with new severe back and abdominal pain. The last surveillance measurement was below the usual elective repair threshold. Supine pressure is currently within the patient’s usual range. The patient is pale, becomes faint on movement and has a rising pulse. Analgesia has reduced the reported pain. The emergency team is deciding whether the old surveillance plan remains appropriate.',
    [
      'Known abdominal aortic aneurysm',
      'Prior size below the elective threshold',
      'New severe back and abdominal pain',
      'Usual-range supine pressure',
      'Pallor, movement-related faintness and rising pulse',
      'Lower pain score after analgesia',
    ],
    'Which plan best evaluates the current risk?',
    [
      yes(
        'Use the symptomatic aortic emergency pathway with repeated perfusion assessment and urgent vascular input',
        'Elective size thresholds and an earlier scan do not determine the safety of a new symptomatic presentation. The pain and evolving perfusion findings require urgent aortic assessment despite a familiar supine pressure and analgesic response.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use the prior diameter to arrange expedited outpatient imaging while observing the analgesic response',
        'The prior elective threshold is not a rule-out test for today’s symptomatic complication. Outpatient surveillance does not address the current perfusion concerns.',
        'A documented size below the elective threshold may sound like an objective safety boundary.',
        'outdated_data',
        [0, 1, 2, 4]
      ),
      no(
        'Use the supine pressure to exclude rupture and direct assessment toward musculoskeletal pain',
        'A single preserved pressure does not exclude a serious aortic process, especially with pallor, faintness and a rising pulse. The current pattern requires evaluation rather than exclusion by one value.',
        'Rupture is commonly associated with profound hypotension.',
        'cue_misinterpretation',
        [2, 3, 4]
      ),
      no(
        'Use the pain reduction to continue routine observation until another hemodynamic threshold is crossed',
        'Analgesia can alter pain without resolving the cause. Waiting for a predefined collapse threshold ignores the already changed clinical presentation.',
        'A better pain score and familiar pressure suggest partial improvement.',
        'premature_closure',
        [2, 3, 4, 5]
      ),
    ],
    [
      'Separate elective surveillance criteria from acute symptomatic risk',
      'Integrate relative perfusion change with a high-risk pain pattern',
      'Anticipate deterioration despite initial compensation',
    ],
    'A threshold designed for elective decisions cannot substitute for assessment of a new emergency presentation.',
    ['deterioration'],
    {
      conflict:
        'A prior low-risk surveillance measurement and preserved supine pressure coexist with a new high-risk symptom and perfusion pattern.',
      anticipation:
        'Avoid unnecessary exertion and monitor for deterioration during urgent specialist evaluation and transfer planning.',
      uncertainty:
        'The observations do not establish rupture or define anatomy; imaging and specialist assessment are needed when clinically appropriate.',
      referenceUrls: [
        'https://www.nice.org.uk/guidance/ng156/chapter/Recommendations',
      ],
    }
  ),
  vascular(
    'advanced',
    'A negative scan before new pulmonary symptoms',
    'A patient with a clinically likely DVT presentation had a negative proximal ultrasound yesterday. The D-dimer was positive and a repeat scan was planned. Today the patient develops sudden pleuritic pain, tachycardia and a new oxygen requirement. The calf is no more swollen than yesterday. The patient says the negative scan means a clot cannot explain the chest symptoms. Blood pressure is lower than on the previous visit.',
    [
      'Clinically likely DVT with negative proximal scan yesterday',
      'Positive D-dimer and planned repeat scan',
      'New sudden pleuritic pain',
      'Tachycardia with new oxygen requirement',
      'Unchanged calf swelling',
      'Lower pressure than the prior visit',
    ],
    'Which reassessment plan best addresses the changed presentation?',
    [
      yes(
        'Initiate urgent PE and stability assessment rather than waiting for the planned leg-scan follow-up',
        'The prior test left a venous question unresolved and does not exclude a new pulmonary event. Current respiratory and circulatory changes alter the immediate pathway, independent of whether calf swelling has progressed.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Bring the repeat leg scan forward and make chest assessment depend on whether it confirms DVT',
        'A leg result can contribute, but the new pulmonary syndrome requires direct urgent assessment. A confirmed leg clot is not a prerequisite for evaluating possible PE.',
        'Repeating the original incomplete test seems an orderly way to establish the cause.',
        'misprioritization',
        [0, 1, 2, 3, 5]
      ),
      no(
        'Use the unchanged calf findings and negative scan to prioritize a nonvascular chest-pain diagnosis',
        'Neither unchanged calf size nor the earlier proximal scan excludes PE. The new symptom and physiology pattern must drive reassessment.',
        'Two apparently reassuring leg findings may seem to reduce the probability of a vascular cause.',
        'premature_closure',
        [0, 2, 3, 4, 5]
      ),
      no(
        'Continue the original follow-up interval because the D-dimer already accounted for the thrombotic risk',
        'A positive D-dimer did not resolve the diagnosis, and a previously appropriate interval does not remain adequate after new cardiopulmonary deterioration.',
        'A documented diagnostic plan may be treated as sufficient coverage of the risk.',
        'outdated_data',
        [1, 2, 3, 5]
      ),
    ],
    [
      'Recognize what the prior imaging did and did not answer',
      'Reprioritize the pathway when a new organ-system syndrome develops',
      'Anticipate hemodynamic progression',
    ],
    'A follow-up plan is conditional on clinical stability; new symptoms can create a different urgent diagnostic task.',
    ['vte', 'deterioration'],
    {
      conflict:
        'A reassuring initial leg image and unchanged calf coexist with a new pulmonary and circulatory syndrome.',
      anticipation:
        'Escalate worsening oxygenation or pressure and provide the prior test timing and results to the acute team.',
      uncertainty:
        'PE is a working concern, not a confirmed diagnosis, and the earlier scan does not identify today’s cause.',
    }
  )
)
