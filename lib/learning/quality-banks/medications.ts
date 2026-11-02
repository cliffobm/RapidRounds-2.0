import type {
  ChoiceDraftV2,
  DistractorErrorV2,
  QuestionDraftV2,
} from '@/lib/cjis/question-v2'
import type { SourceId } from '@/lib/learning/sources'

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
type Row = Omit<
  QuestionDraftV2,
  'id' | 'collectionId' | 'domain' | 'setting' | 'options' | 'correct'
> & { key: string; choices: QuestionDraftV2['options'] }
function make({ key, choices, ...row }: Row, index: number): QuestionDraftV2 {
  const offset = index % 4
  return {
    ...row,
    id: `v2-med-${key}`,
    collectionId: 'medications-safety',
    domain: 'pharmacology',
    setting: 'Adult inpatient medication assessment',
    options: [
      ...choices.slice(offset),
      ...choices.slice(0, offset),
    ] as QuestionDraftV2['options'],
    correct: ((4 - offset) % 4) as QuestionDraftV2['correct'],
  }
}

export const medicationQualityQuestions: QuestionDraftV2[] = [
  {
    key: 'f1',
    topic: 'Symptomatic hypoglycemia before a meal',
    level: 'foundation',
    primaryCompetency: 'take_action',
    sources: ['insulinSafety'],
    scenario:
      'An adult with diabetes becomes sweaty and shaky before lunch. A bedside glucose result is below the local hypoglycemia threshold. The patient is alert and can swallow safely. The unit hypoglycemia protocol is available.',
    cues: [
      'Sweating and shakiness with confirmed low glucose',
      'Alert with safe swallowing',
    ],
    question: 'Which action should begin under the protocol?',
    choices: [
      yes(
        'Give the protocol’s rapid-acting carbohydrate treatment.',
        'Confirmed symptomatic hypoglycemia requires prompt treatment. Safe swallowing permits the oral pathway in the local protocol, followed by the specified recheck and prevention review.',
        [0, 1]
      ),
      no(
        'Arrange the usual lunch and use its arrival as the treatment.',
        'A routine meal may be delayed and is not a substitute for prompt protocol treatment with an appropriate rapid carbohydrate source.',
        'The symptoms occurred just before a meal.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Repeat the glucose after obtaining a venous laboratory sample.',
        'The confirmed bedside result and symptoms support immediate treatment under the protocol. Waiting for a laboratory sample delays correction.',
        'Laboratory testing may seem more definitive than a bedside result.',
        'misprioritization',
        [0]
      ),
      no(
        'Offer a low-carbohydrate snack to avoid rebound hyperglycemia.',
        'Avoiding carbohydrate does not correct the current problem. Treatment should address the low glucose before concerns about a later rise.',
        'The learner may overapply a general diabetes dietary restriction.',
        'cue_misinterpretation',
        [0, 1]
      ),
    ],
    reasoning: [
      'Recognize confirmed hypoglycemia and match the treatment route to swallowing safety.',
    ],
    debrief:
      'Treat the immediate low glucose using the local protocol, then reassess. The patient’s current glucose and swallowing ability determine the initial pathway.',
  },
  {
    key: 'f2',
    topic: 'Ventilatory impairment after an opioid',
    level: 'foundation',
    primaryCompetency: 'recognize_cues',
    sources: ['opioidSafety'],
    scenario:
      'A postoperative patient received an opioid recently. The patient is difficult to arouse. Breaths are shallow and occur six times per minute. The nurse is assessing for medication-related harm.',
    cues: [
      'Recent opioid exposure',
      'Difficult to arouse',
      'Shallow respiratory rate of six',
    ],
    question:
      'Which finding indicates the most immediate medication-related threat?',
    choices: [
      yes(
        'Inadequate ventilation with depressed responsiveness.',
        'Marked sedation and shallow bradypnea indicate a threat to effective ventilation. This requires immediate respiratory assessment and support, emergency escalation and protocol-directed reversal when indicated.',
        [0, 1, 2]
      ),
      no(
        'Reduced pain reporting from the intended analgesic effect.',
        'A reduced pain report does not account for inability to arouse and dangerously slow shallow breathing. These are harm cues rather than a desired endpoint.',
        'Analgesia and sedation can occur together after an opioid.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'Sleep interruption caused by routine postoperative observations.',
        'The observed depth and rate of breathing distinguish the situation from an ordinary sleep or comfort issue.',
        'A postoperative patient may normally sleep after pain relief.',
        'premature_closure',
        [1, 2]
      ),
      no(
        'The need to assess bowel motility after opioid administration.',
        'Bowel effects matter but are not the immediate threat presented by impaired consciousness and ventilation.',
        'Constipation is a familiar opioid adverse effect.',
        'misprioritization',
        [0, 1, 2]
      ),
    ],
    reasoning: [
      'Identify respiratory and consciousness cues of immediate opioid harm.',
    ],
    debrief:
      'Recognize harm using the patient’s breathing and arousability. A familiar medicine’s common nonurgent effects should not distract from a current respiratory threat.',
  },
  {
    key: 'f3',
    topic: 'A discrepancy during medicines reconciliation',
    level: 'foundation',
    primaryCompetency: 'analyze_cues',
    sources: ['medicationSafety'],
    scenario:
      'A patient’s admission list names an anticoagulant. The patient says a different anticoagulant replaced it last month. Both medicines appear on the current administration record. No dose has yet been given on the unit.',
    cues: [
      'Patient reports a recent anticoagulant replacement',
      'Both medicines appear as active orders',
    ],
    question: 'What does this discrepancy require before administration?',
    choices: [
      yes(
        'Verify the intended regimen with reliable records and the prescribing team.',
        'The discrepancy could lead to unintended duplicate anticoagulation. Reconciliation should establish what changed, compare reliable sources and clarify the active orders before administration.',
        [0, 1]
      ),
      no(
        'Use the admission list as the final record of the intended regimen.',
        'An admission list may contain an outdated medicine. The patient’s reported change and duplicate orders require verification.',
        'The list is already documented in the clinical record.',
        'outdated_data',
        [0, 1]
      ),
      no(
        'Choose the newer medicine based on the patient’s recollection alone.',
        'The patient’s information is important but does not independently settle the prescription, timing or stop instructions. The active orders still need clarification.',
        'A recent change reported by the patient may seem sufficient to identify the current medicine.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'Give both orders while pharmacy investigates whether the overlap was intended.',
        'Possible duplicate anticoagulation should be clarified before exposure rather than treated as an assumed intentional overlap.',
        'Some medication transitions can include a planned overlap.',
        'cue_misinterpretation',
        [0, 1]
      ),
    ],
    reasoning: [
      'Distinguish a documented order from a verified current medication plan.',
    ],
    debrief:
      'A discrepancy is information to resolve before giving a medicine. Compare records and the person’s account rather than selecting whichever source appears most convenient.',
  },
  {
    key: 'f4',
    topic: 'A new reaction during blood administration',
    level: 'foundation',
    primaryCompetency: 'take_action',
    sources: ['transfusion'],
    scenario:
      'An adult is receiving a red-cell transfusion. New rigors and back discomfort develop during the infusion. The patient also reports feeling suddenly unwell. The nurse is at the bedside.',
    cues: [
      'New rigors and back discomfort during transfusion',
      'Sudden subjective deterioration',
    ],
    question: 'Which action should the nurse take first?',
    choices: [
      yes(
        'Stop the transfusion and initiate the suspected-reaction assessment.',
        'New symptoms during transfusion require stopping exposure and assessing the patient under the local reaction pathway. Escalation, vital signs and identity checks follow promptly; do not assume a benign reaction.',
        [0, 1]
      ),
      no(
        'Reduce the infusion rate and assess whether the symptoms settle.',
        'Reducing the rate continues exposure during a possible serious reaction. The transfusion should be stopped while the patient is assessed.',
        'A slower infusion is familiar when symptoms appear related to administration.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Obtain a temperature and use the result to decide whether to stop.',
        'A temperature is useful, but stopping should not wait for it when new systemic symptoms arise during transfusion.',
        'Rigors commonly direct attention to a fever measurement.',
        'misprioritization',
        [0]
      ),
      no(
        'Treat the discomfort as positional pain and reassess after repositioning.',
        'Positioning may relieve ordinary discomfort but does not explain the simultaneous rigors and sudden illness during exposure.',
        'Back discomfort can arise from prolonged bed positioning.',
        'premature_closure',
        [0, 1]
      ),
    ],
    reasoning: [
      'Recognize a possible reaction and remove the exposure while assessment begins.',
    ],
    debrief:
      'Link new symptoms to the timing of an infusion without prematurely assigning a reaction type. Stop the exposure and assess before selecting symptom-specific treatment.',
  },
  {
    key: 'f5',
    topic: 'A recorded severe medicine allergy',
    level: 'foundation',
    primaryCompetency: 'take_action',
    sources: ['medicationSafety', 'anaphylaxis'],
    scenario:
      'A patient is prescribed an antibiotic. The record lists previous throat swelling after that same medicine. The patient confirms the history. The first dose has not been administered.',
    cues: [
      'Previous throat swelling after the prescribed antibiotic',
      'The patient confirms the same-medicine reaction',
    ],
    question: 'What should happen before the first dose?',
    choices: [
      yes(
        'Withhold the dose pending urgent clarification of a safe treatment plan.',
        'A confirmed history of airway swelling with the same medicine is a serious safety concern. The prescriber and pharmacist should clarify the plan before exposure; do not infer safety from a new order.',
        [0, 1]
      ),
      no(
        'Administer slowly with emergency equipment available at the bedside.',
        'A slower rate and rescue equipment do not make routine re-exposure to a confirmed severe same-drug reaction safe. A specialist-supervised plan would need explicit assessment and orders.',
        'Slower administration may appear to reduce the chance or severity of a reaction.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'Use the new prescription as confirmation that the previous reaction was reviewed.',
        'A prescription is not evidence that the documented reaction was considered. The confirmed discrepancy needs direct clarification.',
        'The learner may assume electronic prescribing has already checked the allergy.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'Give an antihistamine before the dose to reduce the previous reaction risk.',
        'Premedication cannot be assumed to prevent serious airway or circulatory anaphylaxis and does not replace clarification of the treatment plan.',
        'Antihistamines are familiar treatments for some allergy symptoms.',
        'misprioritization',
        [0, 1]
      ),
    ],
    reasoning: [
      'Recognize a confirmed severe same-medicine allergy as a barrier to routine administration.',
    ],
    debrief:
      'Resolve a serious allergy conflict before exposure. Safety equipment, a slower rate and a new prescription do not by themselves establish that re-exposure is appropriate.',
  },
  {
    key: 'c1',
    topic: 'Insulin timing when a meal is delayed',
    level: 'challenge',
    primaryCompetency: 'generate_solutions',
    sources: ['insulinSafety'],
    scenario:
      'A patient is due a rapid-acting mealtime insulin dose. The current glucose is within the agreed inpatient target. A planned procedure has unexpectedly delayed lunch. The patient is unsure when they will be allowed to eat. The existing orders do not address this change.',
    cues: [
      'Rapid-acting mealtime dose is due',
      'Current glucose within the individualized target',
      'Meal delayed by a procedure',
      'Timing of intake uncertain',
      'No order addressing the change',
    ],
    question: 'Which plan best coordinates insulin with the changed intake?',
    choices: [
      yes(
        'Clarify the mealtime dose and monitoring plan with the team before administration.',
        'Prandial insulin should be coordinated with actual intake. The unexpected delay and absence of an applicable instruction require clarification, while basal and correction components are considered separately.',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Give the scheduled mealtime dose and ask the patient to eat as soon as the procedure finishes.',
        'An uncertain fasting interval can separate the insulin effect from carbohydrate intake and increase hypoglycemia risk.',
        'The dose is scheduled and the current glucose is in range.',
        'misprioritization',
        [0, 1, 2, 3]
      ),
      no(
        'Hold every insulin component until the patient has completed a full meal.',
        'Holding all components conflates mealtime, basal and correction needs. The appropriate plan depends on diabetes type, current status and the orders.',
        'Avoiding insulin during fasting may seem the simplest way to prevent hypoglycemia.',
        'cue_misinterpretation',
        [0, 2, 3, 4]
      ),
      no(
        'Use the preprocedure glucose to determine the mealtime dose without revisiting the intake plan.',
        'A current glucose alone does not account for the loss of the expected meal. Intake timing is a separate treatment determinant.',
        'The glucose result is a clear measurable basis for dosing decisions.',
        'premature_closure',
        [0, 1, 2]
      ),
    ],
    reasoning: [
      'Integrate the medicine’s purpose with uncertain carbohydrate intake.',
      'Select a clarification and monitoring plan instead of applying a uniform hold-or-give rule.',
    ],
    debrief:
      'Separate insulin components by purpose. When meal timing changes, reassess the prandial plan without assuming that every insulin need disappears.',
  },
  {
    key: 'c2',
    topic: 'Basal insulin during fasting in type 1 diabetes',
    level: 'challenge',
    primaryCompetency: 'generate_solutions',
    sources: ['insulinSafety'],
    scenario:
      'An adult with type 1 diabetes is fasting for a procedure. The patient usually receives basal and mealtime insulin. An overnight note says to hold insulin because no food is permitted. The glucose is currently within target and the basal dose is due. No individualized fasting plan is documented.',
    cues: [
      'Type 1 diabetes',
      'Fasting for a procedure',
      'Basal insulin due',
      'Current glucose within target',
      'Nonspecific instruction to hold insulin',
    ],
    question: 'Which plan best prevents an avoidable treatment gap?',
    choices: [
      yes(
        'Clarify an individualized basal, correction and monitoring plan before following the blanket hold instruction.',
        'People with type 1 diabetes need basal insulin even when not eating. A prescriber-directed fasting plan should distinguish basal needs from prandial doses and specify monitoring rather than applying a blanket omission.',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Follow the hold instruction until glucose rises enough to require correction insulin.',
        'Correction alone does not replace basal insulin requirements in type 1 diabetes. Waiting for hyperglycemia creates an avoidable insulin gap.',
        'The current glucose is in range and the patient is not eating.',
        'cue_misinterpretation',
        [0, 1, 3, 4]
      ),
      no(
        'Use the usual mealtime dose instead of basal insulin because the procedure is expected to be brief.',
        'The components have different purposes and time profiles. Substitution without an individualized order does not provide a safe fasting plan.',
        'A short fasting period may make a shorter-acting dose seem more controllable.',
        'misprioritization',
        [1, 2, 4]
      ),
      no(
        'Give the full home schedule and assess for hypoglycemia after the procedure.',
        'Continuing the entire home schedule ignores the changed nutritional intake. The right response preserves basal needs while clarifying the adjusted regimen.',
        'Maintaining the usual schedule appears to avoid omitted insulin.',
        'premature_closure',
        [0, 1, 2]
      ),
    ],
    reasoning: [
      'Distinguish basal physiological need from meal-related insulin.',
      'Resolve the fasting-order conflict with an individualized monitored plan.',
    ],
    debrief:
      'A normal glucose does not prove that basal insulin can be omitted in type 1 diabetes. Address the changed intake while preventing an unintended interruption in essential treatment.',
  },
  {
    key: 'c3',
    topic: 'Delayed medication toxicity risk with kidney dysfunction',
    level: 'challenge',
    primaryCompetency: 'analyze_cues',
    sources: ['medicationSafety', 'aki'],
    scenario:
      'A patient taking a renally cleared sedating medicine develops an acute illness. Kidney function has worsened since admission. Over the next day the patient becomes progressively sleepier. The medicine has continued at the home dose. There has been no recent dose increase.',
    cues: [
      'Renally cleared sedating medicine',
      'New kidney dysfunction',
      'Progressive sleepiness over a day',
      'Unchanged home dose',
    ],
    question: 'Which interpretation should guide the medication review?',
    choices: [
      yes(
        'The unchanged dose may now produce greater exposure because clearance has changed.',
        'A stable prescribed dose does not ensure stable exposure when kidney function worsens. Assess current harm and arrange supervised medication review while considering other causes of sleepiness.',
        [0, 1, 2, 3]
      ),
      no(
        'The absence of a dose increase makes the medicine a less relevant explanation than the acute illness.',
        'Both the illness and medicine may contribute. Reduced clearance can increase exposure without a dose change.',
        'Adverse effects are often associated with starting or increasing a medicine.',
        'outdated_data',
        [0, 1, 3]
      ),
      no(
        'The new sleepiness establishes an allergy to the medicine and should be entered as such.',
        'The pattern suggests possible accumulation or another physiological cause rather than establishing an immune-mediated allergy.',
        'A new unwanted effect can be mistaken for a new allergy.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'The medication review should wait until kidney function returns to baseline so the usual dose can be compared.',
        'Current harm needs assessment while clearance is impaired. Waiting for recovery misses the period in which treatment adjustment may be needed.',
        'The home dose was previously tolerated under baseline conditions.',
        'misprioritization',
        [1, 2, 3]
      ),
    ],
    reasoning: [
      'Connect changing clearance to delayed exposure despite an unchanged dose.',
      'Retain competing causes while prioritizing current safety review.',
    ],
    debrief:
      'Medication exposure depends on the current patient, not just the prescription. Review established medicines when organ function changes.',
  },
  {
    key: 'c4',
    topic: 'Anticoagulation after an unwitnessed fall',
    level: 'challenge',
    primaryCompetency: 'prioritize_hypotheses',
    sources: ['headInjury', 'medicationSafety'],
    scenario:
      'An anticoagulated patient has an unwitnessed fall overnight. At first they deny pain and have no visible scalp injury. An hour later the patient reports a new headache and appears more confused than baseline. The next anticoagulant dose is due. A clinician has not yet reviewed the new symptoms.',
    cues: [
      'Anticoagulant exposure',
      'Unwitnessed fall',
      'Initially reassuring surface examination',
      'New headache and confusion an hour later',
      'Next dose due before clinician review',
    ],
    question:
      'Which concern should lead the urgent review of the next dose and assessment?',
    choices: [
      yes(
        'Possible intracranial injury despite the initially reassuring appearance.',
        'New neurological symptoms after a fall in an anticoagulated person require urgent assessment. Clarifying medication decisions should occur with the treating team rather than assuming the next dose is safe from the surface examination.',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Medication-related dizziness as the main explanation for the fall and later confusion.',
        'Dizziness may contribute to the fall but does not safely explain the new post-fall headache and neurological change. Intracranial injury must be considered urgently.',
        'Anticoagulated patients may also take medicines associated with falls.',
        'premature_closure',
        [1, 3]
      ),
      no(
        'Anxiety about the fall because the first assessment showed no injury.',
        'An earlier normal-looking assessment cannot exclude evolving internal injury. The new symptoms change the risk assessment.',
        'The absence of a scalp injury offers visible reassurance.',
        'outdated_data',
        [0, 2, 3]
      ),
      no(
        'The indication for anticoagulation as sufficient reason to continue dosing before reassessment.',
        'The indication remains important, but it must be balanced against possible acute bleeding with clinician review. It does not settle the immediate safety question.',
        'Omission of anticoagulation can increase thrombotic risk.',
        'misprioritization',
        [0, 3, 4]
      ),
    ],
    reasoning: [
      'Integrate anticoagulant exposure with a delayed change after possible head injury.',
      'Prioritize an urgent competing bleeding risk before the next medication decision.',
    ],
    debrief:
      'A new symptom after an initially reassuring assessment can change medication safety. Escalate the evolving risk rather than relying on the earlier appearance.',
  },
  {
    key: 'c5',
    topic: 'A medication change missing from discharge records',
    level: 'challenge',
    primaryCompetency: 'evaluate_outcomes',
    sources: ['medicationSafety', 'sharedDecisions'],
    scenario:
      'A patient is preparing to leave hospital after several medication changes. The printed discharge list contains a medicine the clinician stopped yesterday. The patient’s own pill organizer still contains that medicine. During teach-back the patient says they will restart everything in the organizer tonight. Transport has arrived.',
    cues: [
      'Recent medication changes',
      'Stopped medicine remains on the printed list',
      'Medicine remains in the pill organizer',
      'Teach-back indicates planned restart',
      'Imminent discharge',
    ],
    question:
      'Which response best evaluates and corrects the discharge safety problem?',
    choices: [
      yes(
        'Reconcile the final regimen, correct the written plan and repeat teach-back before the patient leaves.',
        'The records, available medicines and patient interpretation conflict. Correcting all three through reconciliation and teach-back addresses a foreseeable restart error before the transition.',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Ask the patient to remember the verbal stop instruction and keep the printed list for reference.',
        'A contradictory written list and stocked organizer can undermine a verbal correction. The final plan and understanding need alignment.',
        'A short verbal clarification seems sufficient when transport is waiting.',
        'misprioritization',
        [1, 2, 3, 4]
      ),
      no(
        'Use the printed list as the current prescription because it was generated for discharge.',
        'The list conflicts with a documented recent stop and the patient’s plan. Its format does not establish accuracy.',
        'A formal discharge document appears more current than an earlier note.',
        'outdated_data',
        [0, 1, 3]
      ),
      no(
        'Send the discrepancy to primary care for review while the patient continues the organizer regimen.',
        'This transfers an identified immediate risk into the next setting. The regimen should be clarified and communicated before the patient resumes it.',
        'Primary care may know the long-term regimen better.',
        'premature_closure',
        [1, 2, 3, 4]
      ),
    ],
    reasoning: [
      'Use teach-back to detect a discrepancy between the intended plan and likely patient action.',
      'Correct the regimen and verify understanding before the care transition.',
    ],
    debrief:
      'Successful discharge education is demonstrated by an accurate plan the patient can follow. A printed document or completed teaching box does not by itself establish that outcome.',
  },
  {
    key: 'a1',
    topic: 'Normal saturation with opioid-related ventilatory risk',
    level: 'advanced',
    primaryCompetency: 'analyze_cues',
    sources: ['opioidSafety', 'medicationSafety'],
    scenario:
      'A postoperative adult receives an opioid after another sedating medicine. The patient is on supplemental oxygen and saturation remains within the prescribed range. Over thirty minutes the patient becomes harder to arouse, with shallow slow breaths and pauses. The oxygen waveform remains reliable. The last pain score was improved. The nurse is deciding whether the saturation supports the current plan.',
    cues: [
      'Opioid and another sedating medicine',
      'Supplemental oxygen',
      'Saturation within target with reliable waveform',
      'Increasing difficulty arousing over thirty minutes',
      'Shallow slow breaths with pauses',
      'Improved earlier pain score',
    ],
    question:
      'Which evaluation best explains the discrepancy and guides the immediate response?',
    choices: [
      yes(
        'Assess and support ventilation urgently, escalating possible combined sedative harm despite the saturation.',
        'Supplemental oxygen can preserve saturation while ventilation deteriorates. The consciousness and breathing trend requires immediate assessment, respiratory support and protocol-directed medication review or reversal; a good pain response does not establish safety.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Verify saturation at a second site and use agreement to decide whether respiratory support is needed.',
        'The waveform is reliable and independent breathing and consciousness findings already indicate risk. Saturation verification cannot exclude hypoventilation and should not postpone support.',
        'A second measurement seems a rigorous way to reconcile an alarming bedside impression with a normal value.',
        'cue_misinterpretation',
        [1, 2, 3, 4]
      ),
      no(
        'Reduce the next opioid dose and reassess arousability when the expected peak effect has passed.',
        'A future dose adjustment does not address current shallow breathing and pauses. The present threat requires assessment and support before waiting for drug effects to diminish.',
        'The timing and improved analgesia suggest a dose-related effect that might wear off.',
        'misprioritization',
        [0, 3, 4, 5]
      ),
      no(
        'Interpret the patient as comfortably asleep because pain and oxygenation have both improved.',
        'Improved pain and target saturation do not explain worsening arousability and inadequate breathing. They should not override the current independent harm cues.',
        'Two familiar treatment endpoints appear favorable.',
        'premature_closure',
        [1, 2, 3, 4, 5]
      ),
    ],
    reasoning: [
      'Distinguish oxygenation from ventilation in the presence of supplemental oxygen.',
      'Integrate co-sedative exposure and evolving respiratory signs to prioritize current support.',
    ],
    conflict:
      'Reassuring saturation and analgesia coexist with progressively impaired arousal and breathing.',
    anticipation:
      'Prepare for further respiratory deterioration and recurrent sedation while the team supports ventilation and reviews the medicines.',
    uncertainty:
      'The observations suggest medication-related impairment but do not exclude other postoperative causes or determine a reversal dose.',
    debrief:
      'Advanced medication assessment tests whether a reassuring monitor measures the threatened function. Oxygenation can appear adequate while ventilation and consciousness worsen.',
  },
  {
    key: 'a2',
    topic: 'Recurrent hypoglycemia after initial correction',
    level: 'advanced',
    primaryCompetency: 'evaluate_outcomes',
    sources: ['insulinSafety', 'aki', 'medicationSafety'],
    scenario:
      'An adult treated with insulin and another glucose-lowering medicine develops hypoglycemia during an acute illness. Protocol treatment initially restores glucose and alertness. Forty minutes later sweating returns and a repeat bedside glucose is low again. The patient has eaten little and kidney function has worsened. The home medication schedule is still active. The clinician is reviewing the recurrence.',
    cues: [
      'Insulin plus another glucose-lowering medicine',
      'Initial response to protocol treatment',
      'Recurrent symptoms and confirmed low glucose forty minutes later',
      'Poor intake',
      'Worsening kidney function',
      'Home schedule remains active',
    ],
    question:
      'Which plan best evaluates the recurrent event and prevents further harm?',
    choices: [
      yes(
        'Retreat the low glucose and arrange extended monitoring with review of the regimen, intake and kidney function.',
        'The recurrence means the first correction did not resolve the underlying risk. Ongoing medicine effects, poor intake and changing clearance need supervised review while immediate hypoglycemia is treated and follow-up monitoring is maintained.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Repeat the initial carbohydrate treatment and return to routine checks once the next value reaches target.',
        'Immediate retreatment is necessary, but a second target value does not resolve the recurring exposure and intake risks. Monitoring and regimen review must account for recurrence.',
        'The first treatment successfully restored glucose and consciousness.',
        'outdated_data',
        [1, 2, 3, 4, 5]
      ),
      no(
        'Attribute recurrence to poor intake and retain the home regimen once a full meal is provided.',
        'Food is part of the problem, but kidney changes and ongoing medicine effects may prolong risk. One meal cannot establish that the home regimen is now safe.',
        'Reduced intake is a clear and modifiable precipitant.',
        'premature_closure',
        [0, 2, 3, 4, 5]
      ),
      no(
        'Focus on kidney testing before further glucose treatment to determine whether drug clearance is responsible.',
        'Renal assessment informs prevention, but it should not delay treatment of the current confirmed low glucose. The cause can be evaluated in parallel.',
        'The new organ dysfunction offers a plausible explanation for delayed medication effects.',
        'misprioritization',
        [2, 4]
      ),
    ],
    reasoning: [
      'Interpret recurrence as evidence that the initial treatment corrected a value but not the continuing risk.',
      'Integrate intake, clearance and medicine exposure into a monitored prevention plan.',
    ],
    conflict:
      'The initial normal glucose suggests correction, but recurrence and changing clinical conditions show that the risk remains active.',
    anticipation:
      'Plan further surveillance and team-directed regimen changes to prevent another low glucose after the immediate response.',
    uncertainty:
      'The relative contribution of each medicine, intake and renal change requires review of the actual agents and timing.',
    debrief:
      'A transient response is not a completed evaluation. Recurrent harm should change both the monitoring horizon and the medication plan.',
  },
  {
    key: 'a3',
    topic: 'Apparent anticoagulant overlap during a transition',
    level: 'advanced',
    primaryCompetency: 'generate_solutions',
    sources: ['medicationSafety'],
    scenario:
      'A patient was switched between anticoagulants in another service. The transfer list contains both agents with overlapping dates. The patient recalls being told to stop one but cannot identify which. The latest administration record does not clarify the last doses. Kidney function has declined during the admission. The next anticoagulant dose is due and there is no overt bleeding.',
    cues: [
      'Recent transition between anticoagulants',
      'Two active agents with overlapping dates',
      'Patient recalls a stop instruction',
      'Last administered doses uncertain',
      'New decline in kidney function',
      'Dose due without overt bleeding',
    ],
    question:
      'Which plan best resolves the competing bleeding and interruption risks?',
    choices: [
      yes(
        'Promptly verify the transition and last doses with the treating team and pharmacy before selecting the next dose.',
        'A safe decision requires the intended transition, actual recent exposure and current clearance. The absence of visible bleeding does not establish that duplicate administration is safe, while a prompt individualized plan avoids an unnecessary prolonged interruption.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Continue both listed agents until a coagulation result demonstrates excessive anticoagulant effect.',
        'Coagulation tests have agent-specific limitations and cannot substitute for knowing the regimen and last doses. Giving both creates avoidable exposure before the discrepancy is resolved.',
        'Some anticoagulant transitions intentionally overlap and the patient has no visible bleeding.',
        'cue_misinterpretation',
        [0, 1, 3, 4, 5]
      ),
      no(
        'Choose the agent most recently added to the list and treat the older entry as an inactive record.',
        'The list date does not establish the transition sequence, last exposure or current dose appropriateness. It is a plausible hypothesis that still needs verification.',
        'A replacement medicine is commonly entered more recently than the discontinued one.',
        'premature_closure',
        [0, 1, 2, 3]
      ),
      no(
        'Hold anticoagulation until the routine outpatient appointment so neither duplicate agent can be administered.',
        'Avoiding duplicate dosing matters, but an open-ended interruption may expose the patient to thrombosis. The discrepancy requires a prompt supervised plan, not indefinite deferral.',
        'Holding both appears to eliminate the immediate bleeding risk.',
        'misprioritization',
        [0, 1, 3, 5]
      ),
    ],
    reasoning: [
      'Identify why transfer records do not establish actual anticoagulant exposure.',
      'Balance duplicate-dose harm against interruption risk through prompt verified transition planning.',
    ],
    conflict:
      'Both medicines appear active and the patient has no visible bleeding, yet the intended replacement and last doses are unknown and clearance has changed.',
    anticipation:
      'Communicate the clarified start and stop instructions across records so a later shift or discharge does not recreate the overlap.',
    uncertainty:
      'The correct agent, next dose and timing cannot be inferred without the actual transition instructions and recent administrations.',
    debrief:
      'Medication reconciliation should resolve the decision that must be made now. A safe transition requires both prevention of duplicate exposure and avoidance of an unsupported prolonged treatment gap.',
  },
  {
    key: 'a4',
    topic: 'A changing potassium risk across several medicines',
    level: 'advanced',
    primaryCompetency: 'prioritize_hypotheses',
    sources: ['aki', 'hyperkalaemia', 'medicationSafety'],
    scenario:
      'A patient with chronic heart failure takes several medicines that can increase potassium. A recent illness has reduced intake and kidney function. Potassium is now 6.8 mmol/L on a nonhemolyzed sample, compared with 4.9 mmol/L last week. The ECG has no obvious new changes and the patient feels mildly weak. A potassium supplement remains on the administration record. The next scheduled medicines are due.',
    cues: [
      'Several potassium-raising medicines',
      'Acute decline in kidney function',
      'Reduced intake during illness',
      'Nonhemolyzed potassium 6.8 mmol/L, rising from 4.9 mmol/L',
      'No obvious new ECG change',
      'Mild weakness',
      'Active potassium supplement and medicines due',
    ],
    question:
      'Which plan best handles the current risk and the medication contribution?',
    choices: [
      yes(
        'Escalate the confirmed potassium urgently and clarify the supplement and contributing medicines within the acute plan.',
        'A reassuring ECG does not exclude dangerous hyperkalemia. Current potassium, impaired excretion and ongoing exposure require urgent clinician-directed assessment and medication review rather than routine administration or a single-drug explanation.',
        [0, 1, 3, 4, 5, 6]
      ),
      no(
        'Use the unchanged ECG to continue the heart-failure regimen and stop the supplement at the next routine review.',
        'The ECG cannot reliably exclude dangerous hyperkalemia. The confirmed marked elevation and acute kidney change require urgent review before further potassium exposure.',
        'The chronic regimen has benefit and the ECG appears reassuring.',
        'cue_misinterpretation',
        [0, 1, 3, 4, 6]
      ),
      no(
        'Remove the supplement and assume the potassium will normalize without an acute reassessment.',
        'Stopping a contributing source may be part of the plan, but it does not immediately correct the current elevation or address reduced excretion and other medicines.',
        'The supplement is a visible and readily reversible cause.',
        'premature_closure',
        [0, 1, 3, 6]
      ),
      no(
        'Treat the weakness as dehydration and give additional fluid before discussing the potassium result.',
        'Fluid decisions depend on the heart-failure state and current assessment. The confirmed potassium requires urgent parallel attention rather than waiting for a fluid response.',
        'Poor intake and acute kidney dysfunction can suggest hypovolemia.',
        'misprioritization',
        [1, 2, 3, 5]
      ),
    ],
    reasoning: [
      'Weigh a confirmed biochemical hazard against limited ECG reassurance.',
      'Integrate reduced clearance and multiple exposures into urgent treatment and medication clarification.',
    ],
    conflict:
      'The patient seems only mildly symptomatic with an unchanged ECG, while the confirmed potassium and clearance change indicate significant risk.',
    anticipation:
      'Anticipate arrhythmia and recurrent elevation, with appropriate monitoring and repeat measurements under the acute pathway.',
    uncertainty:
      'The required acute treatment and individual medicine changes depend on the exact potassium, agent list, renal status and clinical examination.',
    debrief:
      'A quiet clinical appearance can coexist with a serious medication-related biochemical risk. Address the present hazard and the continuing exposure together.',
  },
  {
    key: 'a5',
    topic: 'Discharge readiness with conflicting medication instructions',
    level: 'advanced',
    primaryCompetency: 'evaluate_outcomes',
    sources: ['medicationSafety', 'sharedDecisions'],
    scenario:
      'An older adult is discharged after an admission involving several medication changes. The patient can name each medicine from a printed list but uses a different home organizer. Two discontinued medicines remain in that organizer. A relative offers to manage it but is available only twice a week. During teach-back the patient describes taking an additional dose when symptoms recur. The pharmacy has not yet received the final stop instructions.',
    cues: [
      'Several changes during admission',
      'Accurate naming from the printed list',
      'Discontinued medicines remain in the organizer',
      'Limited practical support',
      'Teach-back suggests unscheduled extra doses',
      'Pharmacy lacks final stop instructions',
    ],
    question:
      'Which finding should determine whether the medication transition is ready?',
    choices: [
      yes(
        'An accurate usable regimen demonstrated in teach-back, with the organizer and receiving pharmacy aligned.',
        'Naming medicines is not enough when the tools, planned dosing and next-setting records conflict. Readiness requires a workable coordinated plan and confirmation that the patient or support person can carry it out safely.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Accurate naming of the medicines, with an invitation to call if the home organizer causes confusion.',
        'Recall from a list does not resolve incorrect available medicines or a stated plan for extra dosing. Waiting for the patient to encounter confusion transfers a known risk home.',
        'Name recall appears to demonstrate successful teaching.',
        'cue_misinterpretation',
        [1, 2, 4]
      ),
      no(
        'The relative’s agreement to manage medicines, with detailed instructions sent during the next routine visit.',
        'The relative’s limited availability and missing current instructions leave a gap now. Support must be workable and coordinated before it is treated as a solution.',
        'Family assistance may appear to compensate for the patient’s dosing uncertainty.',
        'premature_closure',
        [2, 3, 4, 5]
      ),
      no(
        'A signed discharge list, with the community pharmacy expected to identify discrepancies at the next refill.',
        'A signed document does not verify implementation, and the pharmacy cannot reliably reconcile uncommunicated stop instructions. Known discrepancies need correction before the transition.',
        'Formal documentation and pharmacy checks are familiar safety barriers.',
        'outdated_data',
        [0, 2, 4, 5]
      ),
    ],
    reasoning: [
      'Distinguish recall of information from the ability to implement the actual regimen.',
      'Evaluate the person, tools and receiving-service communication as one transition process.',
    ],
    conflict:
      'The patient performs well on medicine-name recall but describes unsafe implementation using outdated supplies and incompletely informed services.',
    anticipation:
      'Prevent early duplicate or extra doses by correcting supplies, practical support and cross-setting communication before the first home administration.',
    uncertainty:
      'The amount of support required should be determined with the patient; age or one teach-back error does not establish incapacity.',
    debrief:
      'Evaluate medication education through safe implementation. A coherent written list is useful only when the patient’s actions, available medicines and receiving team use the same plan.',
  },
].map((row, index) => make(row as Row, index))
