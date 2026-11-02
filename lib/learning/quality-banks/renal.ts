import type {
  ChoiceDraftV2,
  DistractorErrorV2,
  QuestionDraftV2,
} from '@/lib/cjis/question-v2'

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
type RenalInput = Omit<
  QuestionDraftV2,
  'collectionId' | 'setting' | 'options' | 'correct'
> & { options: QuestionDraftV2['options'] }
let position = 0
function renal(q: RenalInput): QuestionDraftV2 {
  const correct = (position++ % 4) as QuestionDraftV2['correct']
  const options = q.options.map(
    (_, i) => q.options[(i - correct + 4) % 4]
  ) as QuestionDraftV2['options']
  return {
    ...q,
    options,
    correct,
    collectionId: 'renal-metabolic',
    setting: 'Adult acute medical care',
  }
}
const crisisReference = ['https://doi.org/10.2337/dci24-0032']

export const renalQualityQuestions: QuestionDraftV2[] = [
  renal({
    id: 'v2-renal-f-creatinine',
    topic: 'A relative change in creatinine',
    domain: 'renal',
    level: 'foundation',
    primaryCompetency: 'analyze_cues',
    scenario:
      'A patient is admitted with an acute illness. Creatinine is 1.4 mg/dL, compared with 0.8 mg/dL two days ago. The current result is only slightly above the laboratory reference range. The nurse is deciding how to report the finding.',
    cues: [
      'Creatinine increased from 0.8 to 1.4 mg/dL in two days.',
      'The current value is only slightly outside the laboratory range.',
    ],
    question:
      'Which interpretation best reflects the importance of this result?',
    options: [
      yes(
        'A substantial acute rise from baseline requires assessment for kidney injury',
        'The relative and absolute changes from baseline matter in an acute illness. A modest-looking current value can represent an important acute decline in kidney function.',
        [0, 1]
      ),
      no(
        'A value near the reference range makes significant acute change unlikely',
        'The reference range does not replace the personal baseline or the timing of change. This rise is clinically important despite its proximity to the range.',
        'Reference ranges are a familiar first screen for laboratory abnormalities.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'The result is most consistent with a stable chronic kidney baseline',
        'A documented change over two days does not support assuming stability or chronicity.',
        'A mild elevation may be associated with chronic kidney disease.',
        'premature_closure',
        [0]
      ),
      no(
        'The result becomes meaningful after a third elevated measurement next week',
        'The current acute change already warrants assessment; another result may refine the trend but is not needed to recognize the concern.',
        'Repeated measurements are often used to confirm persistent abnormalities.',
        'misprioritization',
        [0, 1]
      ),
    ],
    reasoning: [
      'Interpret the current value against the patient’s recent baseline.',
    ],
    debrief:
      'A laboratory reference interval is not a substitute for a patient-specific trend. Recognize a clinically important change even when the final number does not look extreme.',
    sources: ['aki'],
  }),
  renal({
    id: 'v2-renal-f-output',
    topic: 'Sustained low urine output',
    domain: 'renal',
    level: 'foundation',
    primaryCompetency: 'recognize_cues',
    scenario:
      'A 70-kg adult produces 20 mL of urine per hour for six hours. The urinary catheter and tubing have been checked and are patent. The patient is being treated for an acute illness. The nurse is reviewing the urine record.',
    cues: [
      'Output is 20 mL/hour in a 70-kg adult for six hours.',
      'The drainage system is patent.',
    ],
    question: 'Which interpretation should guide further assessment?',
    options: [
      yes(
        'Sustained oliguria requires assessment of kidney function and perfusion',
        'The rate is below 0.5 mL/kg/hour and has persisted. Patency reduces one mechanical explanation but does not establish the cause or eliminate the need for assessment.',
        [0, 1]
      ),
      no(
        'A patent catheter makes the low output an expected observation',
        'Patency confirms that a drainage obstruction is less likely; it does not make inadequate production normal.',
        'A common reversible cause has already been checked.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'The output is adequate because each hour contains measurable urine',
        'Producing some urine does not establish an adequate rate. Body weight and the duration of low output are relevant.',
        'Any continued output may feel reassuring compared with anuria.',
        'cue_misinterpretation',
        [0]
      ),
      no(
        'The pattern establishes dehydration as the cause of kidney dysfunction',
        'Oliguria can reflect several mechanisms. It calls for assessment rather than a definitive volume diagnosis from output alone.',
        'Low output is often associated with fluid deficit.',
        'premature_closure',
        [0, 1]
      ),
    ],
    reasoning: [
      'Recognize a sustained output abnormality using weight and duration.',
    ],
    debrief:
      'A checked catheter answers a drainage question. It does not answer whether the kidneys are producing enough urine or why output has fallen.',
    sources: ['aki'],
  }),
  renal({
    id: 'v2-renal-f-potassium',
    topic: 'Severe potassium elevation without ECG changes',
    domain: 'renal',
    level: 'foundation',
    primaryCompetency: 'analyze_cues',
    scenario:
      'A nonhemolyzed sample shows potassium of 6.8 mmol/L. The patient has acute kidney dysfunction. The initial ECG has no characteristic hyperkalemic changes. The nurse is preparing the escalation call.',
    cues: [
      'Potassium 6.8 mmol/L in a nonhemolyzed sample.',
      'Acute kidney dysfunction.',
      'Initial ECG without characteristic changes.',
    ],
    question: 'Which interpretation best supports the immediate plan?',
    options: [
      yes(
        'Severe hyperkalemia remains urgent despite the initial ECG appearance',
        'A normal-looking ECG does not exclude dangerous hyperkalemia or protect against arrhythmia. The confirmed severe value and kidney context warrant the urgent pathway.',
        [0, 1, 2]
      ),
      no(
        'The ECG indicates that the potassium elevation is clinically tolerated',
        'ECG findings are variable and cannot establish safety at this potassium concentration.',
        'ECG monitoring is commonly used to judge electrolyte-related cardiac effects.',
        'cue_misinterpretation',
        [0, 2]
      ),
      no(
        'The ECG makes a collection artifact the most likely explanation',
        'The nonhemolyzed result and kidney dysfunction support a real concern. ECG appearance does not identify a spurious sample.',
        'Marked hyperkalemia without ECG changes can appear internally inconsistent.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'The potassium becomes urgent if a repeat ECG shows QRS widening',
        'Waiting for an electrical complication delays assessment and treatment of an already severe abnormality.',
        'QRS widening is a familiar marker of serious potassium toxicity.',
        'misprioritization',
        [0, 2]
      ),
    ],
    reasoning: [
      'Recognize the limit of ECG reassurance in severe hyperkalemia.',
    ],
    debrief:
      'Use the ECG as part of assessment, not as a gate that must become abnormal before a severe potassium result matters.',
    sources: ['hyperkalaemia', 'aki'],
  }),
  renal({
    id: 'v2-renal-f-medicine',
    topic: 'A medicine exposure during fluid loss',
    domain: 'renal',
    level: 'foundation',
    primaryCompetency: 'recognize_cues',
    scenario:
      'A patient has had vomiting and poor intake for three days. They have also taken an over-the-counter NSAID regularly for back pain. Creatinine has increased from the recent baseline. The nurse is collecting information for a medication review.',
    cues: [
      'Vomiting with poor intake for three days.',
      'Regular NSAID exposure during the illness.',
      'Creatinine has risen from baseline.',
    ],
    question:
      'Which exposure is most relevant to highlight as a potential contributor to kidney injury?',
    options: [
      yes(
        'The NSAID used during the volume-loss illness',
        'NSAIDs can worsen kidney perfusion, particularly during hypovolemia. The exposure should be included in a supervised review rather than being overlooked because it was purchased without a prescription.',
        [0, 1, 2]
      ),
      no(
        'The use of oral rehydration fluid between vomiting episodes',
        'Appropriate oral replacement does not have the same renal-risk implication as the described NSAID exposure. The overall fluid plan still requires assessment.',
        'The patient has taken several products during the illness.',
        'cue_misinterpretation',
        [0, 1]
      ),
      no(
        'The absence of a newly prescribed antibiotic',
        'Not receiving an antibiotic is not a nephrotoxic exposure and does not explain the medication-related risk in the history.',
        'Infection and antibiotics are familiar considerations in acute kidney injury.',
        'misprioritization',
        [1, 2]
      ),
      no(
        'The fact that the back pain began before the vomiting',
        'The order of symptoms may matter diagnostically, but it does not replace identifying a medicine that can worsen kidney perfusion during fluid loss.',
        'A symptom that predates the illness can attract attention as an underlying cause.',
        'misprioritization',
        [0, 1, 2]
      ),
    ],
    reasoning: [
      'Identify a medicine–illness combination that increases renal risk.',
    ],
    debrief:
      'Medication reconciliation includes nonprescription products and the circumstances in which they are being used.',
    sources: ['aki', 'medicationSafety'],
  }),
  renal({
    id: 'v2-renal-f-retention',
    topic: 'Low output with bladder discomfort',
    domain: 'renal',
    level: 'foundation',
    primaryCompetency: 'take_action',
    scenario:
      'A postoperative patient has passed little urine. They report suprapubic pressure and repeated unsuccessful attempts to void. There is no urinary catheter. A bladder scanner is available under the unit pathway.',
    cues: [
      'Little urine passed after surgery.',
      'Suprapubic pressure with unsuccessful voiding.',
      'No urinary catheter is present.',
    ],
    question: 'Which focused assessment should the nurse perform next?',
    options: [
      yes(
        'Assess bladder volume using the retention pathway',
        'The pressure and unsuccessful voiding raise concern for retention. A bladder assessment helps distinguish impaired emptying from low urine production.',
        [0, 1, 2]
      ),
      no(
        'Assess oral intake as the sole explanation for the low output',
        'Intake matters, but it does not address the focal pressure and repeated inability to void.',
        'Postoperative patients may have reduced oral intake.',
        'premature_closure',
        [0, 1]
      ),
      no(
        'Assess the wound for a urinary leak before checking the bladder',
        'A leak is not supported by the described findings. Retention is a more directly testable explanation for pressure with failed voiding.',
        'Recent surgery can create concern about a procedural complication.',
        'misprioritization',
        [0, 1]
      ),
      no(
        'Assess daily weight before evaluating whether the bladder is full',
        'Daily weight can inform overall balance but does not promptly distinguish retention in this symptomatic patient.',
        'Weight is a useful measure of fluid balance.',
        'misprioritization',
        [0, 1, 2]
      ),
    ],
    reasoning: [
      'Select a focused assessment that separates retention from low production.',
    ],
    debrief:
      'Low measured output has more than one mechanism. A focused bedside assessment can identify a reversible emptying problem without assuming volume depletion.',
    sources: ['aki'],
  }),
  renal({
    id: 'v2-renal-c-fluid',
    topic: 'Oliguria with new fluid intolerance',
    domain: 'renal',
    level: 'challenge',
    primaryCompetency: 'evaluate_outcomes',
    scenario:
      'A patient with acute kidney injury remains oliguric after a prescribed fluid bolus. Pressure has changed little. New crackles and increasing oxygen need appear during reassessment. The patient has chronic heart failure. Another bolus is listed as an optional step pending review.',
    cues: [
      'Oliguria persists after a fluid bolus.',
      'Pressure changes little after treatment.',
      'New crackles and rising oxygen need.',
      'Chronic heart failure.',
    ],
    question:
      'Which action best uses the observed response before the optional next bolus?',
    options: [
      yes(
        'Request reassessment of perfusion and fluid tolerance before further fluid',
        'The limited response and new respiratory findings suggest that repeating the same approach may cause harm. The team should reassess the mechanism, current congestion and alternatives to further fluid.',
        [0, 1, 2, 3]
      ),
      no(
        'Repeat the bolus because urine output has not reached the desired rate',
        'Output is important, but it cannot alone determine additional fluid when respiratory tolerance is worsening and the initial response was limited.',
        'Persistent oliguria often prompts a concern about insufficient circulating volume.',
        'misprioritization',
        [0, 1, 2]
      ),
      no(
        'Use the small pressure change as evidence that the bolus was too small',
        'A small pressure response does not establish that a larger amount is safe or beneficial, especially with new crackles and oxygen need.',
        'An inadequate response may be interpreted as an inadequate dose of the same treatment.',
        'cue_misinterpretation',
        [1, 2, 3]
      ),
      no(
        'Attribute the crackles to baseline heart failure and continue the original fluid sequence',
        'The crackles are new during the current treatment. A chronic diagnosis should not obscure a change indicating reduced tolerance.',
        'Heart failure provides an existing explanation for lung findings.',
        'outdated_data',
        [2, 3]
      ),
    ],
    reasoning: [
      'Compare the intended perfusion response with observed benefit and harm.',
      'Prioritize reassessment when a treatment produces limited benefit and new intolerance.',
    ],
    debrief:
      'A treatment response includes adverse effects as well as the target number. Reassess the mechanism when repeating the initial plan could worsen another organ system.',
    sources: ['aki', 'fluids'],
  }),
  renal({
    id: 'v2-renal-c-sample',
    topic: 'A hemolyzed potassium result',
    domain: 'renal',
    level: 'challenge',
    primaryCompetency: 'generate_solutions',
    scenario:
      'A clinically stable patient has potassium of 6.3 mmol/L in a markedly hemolyzed sample. Kidney function was normal on a sample taken earlier today. The patient has no new weakness and the ECG shows no characteristic changes. The laboratory requests a repeat specimen. The nurse is coordinating the next assessment.',
    cues: [
      'Potassium 6.3 mmol/L in a markedly hemolyzed sample.',
      'Earlier kidney function was normal.',
      'No current instability or characteristic ECG changes.',
      'A repeat specimen has been requested.',
    ],
    question:
      'Which plan best resolves the sample uncertainty without assuming safety?',
    options: [
      yes(
        'Arrange a prompt properly collected repeat sample with clinical and ECG reassessment',
        'Hemolysis can elevate the measured potassium, but the result should be resolved promptly rather than dismissed. Current stability supports verification alongside reassessment, with escalation if the patient or repeat result indicates real hyperkalemia.',
        [0, 1, 2, 3]
      ),
      no(
        'Record the result as collection artifact and use the next routine chemistry panel',
        'Artifact is plausible, but it is not confirmed. A prompt repeat is needed to resolve a potentially significant abnormality.',
        'Marked hemolysis and a reassuring earlier sample strongly suggest a spurious result.',
        'premature_closure',
        [0, 1, 3]
      ),
      no(
        'Use the normal ECG to decide that a repeat potassium is unnecessary',
        'A normal-looking ECG cannot exclude clinically important hyperkalemia. It does not resolve whether the sample value is real.',
        'The ECG may seem an independent confirmation that the result is harmless.',
        'cue_misinterpretation',
        [0, 2]
      ),
      no(
        'Begin a potassium-shifting regimen before clarifying the sample or current clinical risk',
        'Treatment may be urgent in true severe hyperkalemia or instability, but in this stable, strongly hemolyzed context prompt verification and assessment avoid unnecessary treatment-related harm.',
        'The numeric value may trigger a reflex response without considering specimen quality.',
        'misprioritization',
        [0, 1, 2, 3]
      ),
    ],
    reasoning: [
      'Weigh specimen reliability against the consequence of a true abnormality.',
      'Choose prompt verification with ongoing assessment rather than automatic dismissal or unreviewed treatment.',
    ],
    debrief:
      'Measurement uncertainty requires an active plan to resolve it. The normal ECG and an earlier result are context, not proof that the present value is false.',
    sources: ['hyperkalaemia'],
  }),
  renal({
    id: 'v2-renal-c-glucose',
    topic: 'New symptoms after potassium-shifting treatment',
    domain: 'renal',
    level: 'challenge',
    primaryCompetency: 'take_action',
    scenario:
      'A patient received insulin with glucose for hyperkalemia. Two hours later they become sweaty and less attentive. The potassium has fallen on the first recheck. The most recent glucose measurement was before the new symptoms began. A glucose meter and hypoglycemia protocol are available.',
    cues: [
      'Recent insulin–glucose treatment for hyperkalemia.',
      'Sweating and reduced attention two hours later.',
      'First potassium recheck has improved.',
      'No glucose measurement since symptom onset.',
    ],
    question:
      'Which assessment should occur immediately alongside the clinical review?',
    options: [
      yes(
        'Check bedside glucose and act on the result under the hypoglycemia pathway',
        'Insulin-related hypoglycemia can occur after the initial glucose administration. New compatible symptoms require an immediate glucose check even when potassium has improved.',
        [0, 1, 2, 3]
      ),
      no(
        'Repeat potassium first because the initial treatment targeted the potassium value',
        'Potassium monitoring continues, but the new symptoms after insulin make glucose an immediate and readily testable safety concern.',
        'The original emergency can remain the main focus after treatment.',
        'misprioritization',
        [0, 1, 2]
      ),
      no(
        'Use the improved potassium to reduce metabolic monitoring and encourage rest',
        'Improved potassium does not establish absence of a treatment complication. The new symptoms require assessment rather than a reduction in surveillance.',
        'A successful initial laboratory response may be taken as evidence that the emergency has resolved.',
        'premature_closure',
        [0, 1, 2]
      ),
      no(
        'Attribute the change to uremia and request the next scheduled renal panel',
        'Uremia may affect cognition, but the timing and adrenergic symptoms after insulin create a more immediate glucose-related question.',
        'Kidney dysfunction provides an alternative explanation for altered attention.',
        'cue_misinterpretation',
        [0, 1, 3]
      ),
    ],
    reasoning: [
      'Connect a new symptom pattern to a known delayed treatment risk.',
      'Prioritize a rapid measurement that can identify a reversible cause.',
    ],
    debrief:
      'Monitor for the harms of treatment independently of whether its intended target improves.',
    sources: ['hyperkalaemia', 'insulinSafety'],
  }),
  renal({
    id: 'v2-renal-c-rebound',
    topic: 'Potassium improvement after a temporary shift',
    domain: 'renal',
    level: 'challenge',
    primaryCompetency: 'evaluate_outcomes',
    scenario:
      'A patient with severe kidney dysfunction receives potassium-shifting treatment. The first repeat potassium falls into the target range. Urine output remains very low. No definitive potassium-removal plan has yet been completed. The patient asks whether monitoring can stop now.',
    cues: [
      'Potassium improved after a shifting treatment.',
      'Severe kidney dysfunction persists.',
      'Urine output remains very low.',
      'Definitive potassium removal is not yet established.',
    ],
    question: 'Which explanation best supports the follow-up plan?',
    options: [
      yes(
        'The shift may be temporary, so repeat potassium and glucose monitoring and removal planning remain necessary',
        'Intracellular shifting lowers measured extracellular potassium without necessarily removing it from the body. Poor elimination creates rebound risk, while the treatment also creates a separate glucose-monitoring need.',
        [0, 1, 2, 3]
      ),
      no(
        'The target potassium confirms that the total excess has been eliminated',
        'A shift in distribution is different from total-body removal. Persistent low output means the risk can recur as the treatment effect wanes.',
        'A normal repeat result may appear to demonstrate correction of the underlying problem.',
        'cue_misinterpretation',
        [0, 1, 2]
      ),
      no(
        'The next potassium check is needed if the ECG becomes abnormal again',
        'ECG surveillance does not replace repeat biochemical testing and cannot reliably detect or exclude rebound early enough.',
        'Electrical effects are a familiar way to judge potassium-related danger.',
        'misprioritization',
        [0, 2, 3]
      ),
      no(
        'The low output is no longer relevant because the shifting treatment bypasses kidney clearance',
        'The temporary mechanism does not remove the need to evaluate elimination. Persistent low output remains central to the risk of recurrent elevation.',
        'A treatment that works without urine production may seem to solve the renal limitation.',
        'premature_closure',
        [0, 1, 2, 3]
      ),
    ],
    reasoning: [
      'Distinguish a temporary redistribution from removal of potassium.',
      'Use persistent elimination limits to plan reassessment and escalation.',
    ],
    debrief:
      'A normal value immediately after temporizing treatment may be a transient state. Evaluate whether the mechanism sustaining the abnormality has actually changed.',
    sources: ['hyperkalaemia', 'aki'],
  }),
  renal({
    id: 'v2-renal-c-ketones',
    topic: 'Glucose improves before ketoacidosis resolves',
    domain: 'endocrine_metabolic',
    level: 'challenge',
    primaryCompetency: 'evaluate_outcomes',
    scenario:
      'A patient is receiving protocol-based treatment for diabetic ketoacidosis. Glucose has fallen substantially and nausea has improved. Blood ketones remain elevated and venous pH remains acidotic. The patient asks why treatment and blood tests are continuing. The team is reviewing the next protocol step.',
    cues: [
      'Glucose has fallen during DKA treatment.',
      'Nausea has improved.',
      'Blood ketones remain elevated.',
      'Venous pH remains acidotic.',
    ],
    question: 'Which explanation best describes the remaining treatment goal?',
    options: [
      yes(
        'Resolution requires correction of ketosis and acidosis, not glucose improvement alone',
        'Glucose can improve before the ketoacidotic process resolves. Treatment and monitoring must follow the full protocol endpoints, including ketones and acid-base status, with glucose support adjusted by the team as required.',
        [0, 1, 2, 3]
      ),
      no(
        'Nausea relief is the main sign that ketone production has stopped',
        'Symptoms can improve before biochemical resolution. Persistent ketones and acidosis show that symptom relief is not enough to establish recovery.',
        'Nausea is a prominent presenting feature of ketoacidosis.',
        'cue_misinterpretation',
        [1, 2, 3]
      ),
      no(
        'The glucose response makes the remaining acidosis a chronic baseline finding',
        'There is no baseline evidence supporting chronic acidosis, and persistent ketones directly support an unresolved acute process.',
        'A strong response in the most visible marker may make other abnormalities seem unrelated.',
        'premature_closure',
        [0, 2, 3]
      ),
      no(
        'The next treatment decision can be based on urine glucose instead of repeat blood ketones',
        'Urine glucose does not establish whether ketoacidosis has resolved. The relevant ketone and acid-base endpoints remain necessary.',
        'Urine testing can appear simpler than repeated blood sampling.',
        'misprioritization',
        [0, 2, 3]
      ),
    ],
    reasoning: [
      'Separate glucose response from resolution of the underlying ketotic process.',
      'Use the remaining abnormal endpoints to explain continued treatment.',
    ],
    debrief:
      'A treatment can normalize one measurement before the disease process is corrected. Follow the endpoints that reflect the unresolved mechanism.',
    sources: ['insulinSafety'],
    referenceUrls: crisisReference,
  }),
  renal({
    id: 'v2-renal-a-euglycemic',
    topic: 'Ketoacidosis without marked hyperglycemia',
    domain: 'endocrine_metabolic',
    level: 'advanced',
    primaryCompetency: 'prioritize_hypotheses',
    scenario:
      'A patient with diabetes takes an SGLT2 inhibitor and has eaten little during a recent illness. They now have nausea, abdominal discomfort and deep rapid breathing. Glucose is 178 mg/dL, which appears reassuring to the patient. Blood beta-hydroxybutyrate is 4.2 mmol/L and venous pH is 7.24. Bicarbonate is reduced and lactate does not explain the acidosis. The nurse is organizing urgent metabolic review.',
    cues: [
      'Diabetes treated with an SGLT2 inhibitor.',
      'Poor intake during illness.',
      'Nausea and deep rapid breathing.',
      'Glucose 178 mg/dL.',
      'Beta-hydroxybutyrate 4.2 mmol/L.',
      'Venous pH 7.24 with low bicarbonate and no explanatory lactate.',
    ],
    question: 'Which interpretation should guide the urgent handover?',
    options: [
      yes(
        'Possible euglycemic DKA requiring protocol review based on ketosis and acidosis despite the glucose level',
        'In a person with diabetes, substantial ketonemia and metabolic acidosis can represent DKA without marked hyperglycemia, particularly in this medication and low-intake context. The team should assess the full crisis pathway rather than use glucose to exclude it.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Starvation ketosis as the sufficient explanation, with oral intake as the main immediate endpoint',
        'Low intake is relevant, but the diabetes, SGLT2 exposure and degree of ketonemia and acidosis require evaluation for DKA. A plausible trigger does not establish a less dangerous diagnosis.',
        'Poor intake can produce ketones even without high glucose.',
        'premature_closure',
        [0, 1, 4, 5]
      ),
      no(
        'Respiratory compensation from an isolated anxiety episode, with repeat glucose as the main confirmation',
        'Deep breathing may be compensation for metabolic acidosis. Anxiety does not explain the measured ketonemia, low bicarbonate and acidemia.',
        'The glucose is not markedly elevated and rapid breathing can be associated with anxiety.',
        'cue_misinterpretation',
        [2, 3, 4, 5]
      ),
      no(
        'A glucose-defined mild illness, with the ketone result used to guide routine outpatient follow-up',
        'The severity and urgency cannot be judged from glucose alone. Acidemia and substantial ketonemia require acute assessment rather than routine follow-up.',
        'Glucose is often used as the main severity marker in diabetes self-management.',
        'misprioritization',
        [3, 4, 5]
      ),
    ],
    reasoning: [
      'Identify the metabolic process from ketones and acid-base findings rather than glucose alone.',
      'Integrate medication and intake context to prioritize a time-sensitive diagnosis and review.',
    ],
    conflict:
      'A glucose below the usual hyperglycemic range conflicts with substantial ketonemia, acidemia and compensatory breathing.',
    anticipation:
      'Continue close metabolic and clinical monitoring while the team directs fluids, insulin, glucose and electrolyte management under the appropriate pathway.',
    uncertainty:
      'The findings require urgent DKA assessment but do not determine the exact treatment regimen or exclude additional illness triggers.',
    debrief:
      'An atypical value can conceal a familiar emergency. Use the measurements that define the mechanism and account for medication effects that change the expected presentation.',
    sources: ['insulinSafety', 'medicationSafety'],
    referenceUrls: crisisReference,
  }),
  renal({
    id: 'v2-renal-a-normal-ecg',
    topic: 'Severe potassium elevation with preserved appearance',
    domain: 'renal',
    level: 'advanced',
    primaryCompetency: 'generate_solutions',
    scenario:
      'A patient with acute-on-chronic kidney dysfunction has potassium of 6.7 mmol/L in a nonhemolyzed sample. They are speaking normally and deny weakness. The initial ECG has no characteristic changes. Urine output has fallen substantially today and a potassium-raising medicine is on the list. Yesterday’s potassium was mildly elevated. The nurse is coordinating immediate review and repeat testing.',
    cues: [
      'Potassium 6.7 mmol/L in a nonhemolyzed sample.',
      'Acute-on-chronic kidney dysfunction.',
      'Preserved conversation without weakness.',
      'No characteristic changes on the initial ECG.',
      'Falling urine output with a potassium-raising medicine.',
      'Potassium was already elevated yesterday.',
    ],
    question:
      'Which plan best addresses immediate risk and the reason it may persist?',
    options: [
      yes(
        'Activate urgent hyperkalemia care, maintain monitoring and review confirmation, medicines and potassium elimination together',
        'The severe value remains urgent despite a reassuring appearance and ECG. Falling output and medication context increase concern for persistence; immediate care, prompt confirmation and a plan addressing removal and contributing factors should be coordinated rather than made sequential prerequisites.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Prioritize another ECG and make acute treatment depend on an electrical change while the sample is repeated',
        'An ECG can remain nondiagnostic in dangerous hyperkalemia. Making an electrical change the treatment gate can delay care for a severe, plausible abnormality.',
        'The ECG appears to offer a direct measure of current cardiac toxicity.',
        'cue_misinterpretation',
        [0, 2, 3, 4]
      ),
      no(
        'Review the potassium-raising medicine first and use withdrawal response to determine whether acute treatment is needed',
        'Removing a contributor may be important but does not promptly address the current severe concentration or impaired elimination. The withdrawal response cannot be used to postpone urgent care.',
        'A reversible medicine contributor can seem a targeted alternative to emergency treatment.',
        'misprioritization',
        [0, 1, 4, 5]
      ),
      no(
        'Treat the current value as the patient’s chronic tolerance and plan reassessment after the next routine renal panel',
        'Chronic kidney disease does not establish tolerance to a new severe rise. The falling output and progression from yesterday indicate a changed risk state.',
        'A history of mildly high potassium may normalize the finding in the learner’s mind.',
        'outdated_data',
        [0, 1, 4, 5]
      ),
    ],
    reasoning: [
      'Weigh a severe biochemical result against unreliable negative symptoms and ECG findings.',
      'Integrate impaired elimination and medicine exposure into immediate and ongoing risk management.',
    ],
    conflict:
      'The patient and ECG look reassuring while the severe result, rising trend and poor elimination indicate substantial risk.',
    anticipation:
      'Monitor for arrhythmia, treatment-related hypoglycemia and potassium rebound while the team addresses elimination.',
    uncertainty:
      'The exact contribution of each medicine and the need for renal replacement therapy require urgent team assessment, not an inference from one value.',
    debrief:
      'Advanced planning separates reassuring appearance from evidence of safety and addresses both the present abnormality and the mechanism that may recreate it.',
    sources: ['hyperkalaemia', 'aki', 'medicationSafety'],
  }),
  renal({
    id: 'v2-renal-a-volume',
    topic: 'Competing fluid-loss and congestion findings',
    domain: 'renal',
    level: 'advanced',
    primaryCompetency: 'generate_solutions',
    scenario:
      'A patient with heart failure and chronic ankle edema has several days of diarrhea. Creatinine rises and urine output falls. Pressure is lower than the usual baseline, but the ankles remain swollen. The current lung examination is clear and weight is below the recent home value. A standing diuretic prescription remains active. The team asks whether the edema alone should determine the next fluid decision.',
    cues: [
      'Heart failure with chronic ankle edema.',
      'Several days of gastrointestinal fluid loss.',
      'Rising creatinine with reduced output.',
      'Pressure lower than the usual baseline.',
      'Clear lungs and lower weight than the recent home value.',
      'An active standing diuretic prescription.',
    ],
    question:
      'Which plan best evaluates the current balance before changing fluid or diuretic therapy?',
    options: [
      yes(
        'Reassess perfusion, recent losses, weight and congestion together and review the standing medicines with the team',
        'Chronic peripheral edema does not establish current intravascular adequacy or pulmonary congestion. The new losses, lower weight and pressure require an integrated current assessment before deciding whether replacement, diuretic adjustment or another intervention is appropriate.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use the persistent edema to intensify diuresis and interpret the creatinine rise as a tolerable congestive change',
        'A congestive mechanism is possible, but the losses, lower weight, clear lungs and relative hypotension do not support making edema the sole treatment determinant.',
        'Peripheral swelling and heart failure commonly lead to a decongestion plan.',
        'premature_closure',
        [0, 1, 2, 3, 4]
      ),
      no(
        'Use the diarrhea history to prescribe a fixed replacement schedule before reviewing cardiac tolerance',
        'A deficit is plausible, but heart failure and kidney dysfunction require individualized reassessment. A fixed schedule selected from the loss history alone may cause harm.',
        'The temporal relationship between losses and oliguria strongly suggests depletion.',
        'misprioritization',
        [0, 1, 2, 4]
      ),
      no(
        'Continue the established diuretic regimen because it controlled edema before the diarrheal illness',
        'The patient’s current physiology differs from the stable period. Prior success of a standing regimen does not establish its safety during acute losses and kidney change.',
        'A familiar long-term regimen can appear safer than changing several treatments during an acute illness.',
        'outdated_data',
        [1, 2, 3, 5]
      ),
    ],
    reasoning: [
      'Distinguish chronic interstitial swelling from the present effective circulating state.',
      'Integrate losses, baseline-relative measurements and treatment context before selecting a fluid strategy.',
    ],
    conflict:
      'Persistent ankle edema suggests congestion while recent losses, lower weight and pressure suggest a possible intravascular deficit.',
    anticipation:
      'Monitor the response and respiratory tolerance closely after any team-directed change and reassess if output or perfusion worsens.',
    uncertainty:
      'The information does not establish fluid responsiveness or justify a specific replacement or diuretic dose.',
    debrief:
      'A chronic sign can remain present while the active physiology changes. Advanced assessment tests competing mechanisms before applying a familiar treatment.',
    sources: ['aki', 'fluids', 'medicationSafety'],
  }),
  renal({
    id: 'v2-renal-a-diuresis',
    topic: 'High urine output after relief of obstruction',
    domain: 'renal',
    level: 'advanced',
    primaryCompetency: 'evaluate_outcomes',
    scenario:
      'A patient with obstructive acute kidney injury has a urinary obstruction relieved under the urology plan. Urine output then rises sharply for several hours. Creatinine begins to fall, and the patient says this means the kidney problem is over. During the same period weight falls, thirst increases and pressure declines from baseline. Potassium is falling on serial samples. The nurse is reviewing monitoring and fluid balance.',
    cues: [
      'Obstruction has been relieved.',
      'Sustained high urine output follows relief.',
      'Creatinine is beginning to improve.',
      'Weight falls with increasing thirst.',
      'Pressure declines from baseline.',
      'Potassium is falling on serial samples.',
    ],
    question:
      'Which plan best evaluates whether the improving creatinine represents safe recovery?',
    options: [
      yes(
        'Escalate possible post-obstructive fluid and electrolyte losses and individualize monitoring and replacement with the team',
        'An improving creatinine can coexist with clinically important diuresis after obstruction relief. The balance, pressure and potassium trends require close reassessment and a team-directed plan that avoids both depletion and uncritical replacement.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Use the improving creatinine to reduce urine measurements and return to routine oral intake monitoring',
        'The filtration trend does not exclude excessive ongoing losses. Reducing measurements would lose information needed to detect worsening depletion and electrolyte change.',
        'A falling creatinine and brisk urine output are familiar recovery markers.',
        'premature_closure',
        [1, 2, 3, 4, 5]
      ),
      no(
        'Replace every milliliter of urine automatically until output returns to the preobstruction rate',
        'Replacement requires individualized review of clinical state, electrolytes and ongoing losses. A fixed full replacement rule may perpetuate excessive diuresis or cause imbalance.',
        'Matching output exactly appears to maintain a neutral balance.',
        'cue_misinterpretation',
        [1, 3, 4, 5]
      ),
      no(
        'Restrict all fluid because the previous kidney injury made fluid accumulation the main concern',
        'The current pattern suggests active losses and falling pressure, so a pre-relief assumption about accumulation should not dictate the new plan.',
        'Fluid overload is a recognized complication of oliguric kidney injury.',
        'outdated_data',
        [0, 1, 3, 4, 5]
      ),
    ],
    reasoning: [
      'Separate relief of obstruction and filtration improvement from safe fluid and electrolyte recovery.',
      'Integrate ongoing losses with pressure and potassium trends to revise the care plan.',
    ],
    conflict:
      'Creatinine improves while high urine output, thirst, falling weight and pressure indicate a new treatment-phase risk.',
    anticipation:
      'Watch for hypovolemia and electrolyte depletion during ongoing diuresis and communicate the trajectory before symptomatic deterioration.',
    uncertainty:
      'The appropriate replacement fraction and duration require the patient’s current clinical and laboratory assessment.',
    debrief:
      'Successful treatment can create a new monitoring problem. Recovery should be judged across filtration, perfusion, balance and electrolytes rather than one improving marker.',
    sources: ['aki', 'fluids'],
    referenceUrls: [
      'https://www.auanet.org/Documents/education/Urologic-Emergencies.pdf',
    ],
  }),
  renal({
    id: 'v2-renal-a-resolution',
    topic: 'Residual acidosis after ketones resolve',
    domain: 'endocrine_metabolic',
    level: 'advanced',
    primaryCompetency: 'evaluate_outcomes',
    scenario:
      'A patient with type 1 diabetes is recovering from DKA after fluid and insulin treatment. Glucose is 180 mg/dL and blood beta-hydroxybutyrate is 0.4 mmol/L. Venous pH is 7.31, but bicarbonate remains 16 mmol/L. Chloride has risen after treatment and the anion gap is no longer elevated. The patient is alert and ready to eat. The team is reviewing transition from the intravenous pathway.',
    cues: [
      'Type 1 diabetes under DKA treatment.',
      'Glucose 180 mg/dL with beta-hydroxybutyrate 0.4 mmol/L.',
      'Venous pH 7.31 despite bicarbonate 16 mmol/L.',
      'Rising chloride after fluid treatment.',
      'Anion gap no longer elevated.',
      'Alert and ready to eat.',
    ],
    question: 'Which evaluation best supports the transition decision?',
    options: [
      yes(
        'Review ketone and pH resolution, consider hyperchloremic acidosis and coordinate subcutaneous insulin coverage under protocol',
        'Low blood ketones and pH above the consensus resolution threshold support resolution of ketoacidosis despite a residual bicarbonate reduction. Hyperchloremic acidosis can follow treatment; transition still requires a coordinated insulin plan and the full clinical review.',
        [0, 1, 2, 3, 4, 5]
      ),
      no(
        'Continue the DKA pathway until bicarbonate reaches its target, treating the low value as proof of persistent ketogenesis',
        'Bicarbonate alone may remain reduced from hyperchloremic acidosis after ketones resolve. It should not be treated as proof of ongoing ketogenesis when the ketone and pH endpoints support resolution.',
        'Bicarbonate is a familiar marker used to diagnose and follow DKA.',
        'cue_misinterpretation',
        [1, 2, 3, 4]
      ),
      no(
        'Use the closed anion gap as the sole endpoint and stop intravenous insulin before arranging further insulin coverage',
        'The anion gap alone is not the preferred resolution endpoint, and type 1 diabetes requires an uninterrupted appropriate insulin plan during transition.',
        'A closed gap is often remembered as the signal that DKA treatment can stop.',
        'premature_closure',
        [0, 1, 3, 4]
      ),
      no(
        'Repeat urine ketones and delay the transition until the urine test becomes negative',
        'Urine ketones may remain positive or increase as beta-hydroxybutyrate converts during recovery. They can mislead when used as the resolution gate despite improving blood ketones and pH.',
        'A negative urine ketone test appears to provide a simple confirmation of resolution.',
        'misprioritization',
        [1, 2, 4, 5]
      ),
    ],
    reasoning: [
      'Distinguish persistent ketoacidosis from a treatment-associated non-gap acidosis.',
      'Evaluate resolution using the relevant metabolic endpoints.',
      'Anticipate insulin gaps during transition despite apparent biochemical recovery.',
    ],
    conflict:
      'Bicarbonate remains low while blood ketones and pH support resolution, with rising chloride offering a competing explanation.',
    anticipation:
      'Coordinate the protocol transition and subcutaneous insulin coverage to avoid recurrent ketosis or hypoglycemia.',
    uncertainty:
      'The exact insulin regimen, timing and nutritional plan require the team’s individualized protocol review.',
    debrief:
      'Advanced evaluation asks why a residual abnormality persists. A value can remain outside its range for a different mechanism after the original emergency has resolved.',
    sources: ['insulinSafety', 'chemistry'],
    referenceUrls: crisisReference,
  }),
]
