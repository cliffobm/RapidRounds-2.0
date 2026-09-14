import type {TeachingMetadata} from './teaching-metadata';
export type ClinicalStep = 'recognize' | 'analyze' | 'prioritize' | 'generate' | 'action' | 'evaluate';

export interface LearningSource {
  title: string;
  url: string;
}

export interface CaseStage {
  metadata?:TeachingMetadata;
  optionRationales?:{id:string;text:string;rationale:string;correct:boolean}[];
  id: string;
  conceptId?: string;
  conceptLabel?: string;
  step: ClinicalStep;
  title: string;
  chart: string[];
  prompt: string;
  options: { id: string; text: string }[];
  correctIds: string[];
  format: 'single' | 'multiple' | 'selectN' | 'matrix';
  rows?: { id: string; label: string; correctOptionId: string }[];
  selectCount?: number;
  rationale: {
    takeaway: string;
    cues: string[];
    mechanism: string;
    distractors: string[];
    transferPrompt: string;
  };
  sources: LearningSource[];
  status: 'needs_review';
  contentVersion: string;
}

export interface LearningCase {
  metadata?:TeachingMetadata;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  patient: string;
  estimatedMinutes: number;
  concepts: string[];
  sources: LearningSource[];
  status: 'needs_review';
  contentVersion: string;
  stages: CaseStage[];
}

const version = '2026-09-11.2';
const signs: LearningSource = {
  title: 'American Heart Association: Heart Failure Signs and Symptoms',
  url: 'https://www.heart.org/en/health-topics/heart-failure/warning-signs-of-heart-failure',
};
const tracking: LearningSource = {
  title: 'American Heart Association: Managing Heart Failure Symptoms',
  url: 'https://www.heart.org/en/health-topics/heart-failure/warning-signs-of-heart-failure/managing-heart-failure-symptoms',
};
const acuteCare: LearningSource = {
  title: 'NICE CG187: Acute heart failure, recommendations 1.3.3–1.3.5',
  url: 'https://www.nice.org.uk/guidance/cg187/chapter/recommendations',
};
const deterioration: LearningSource = {
  title: 'NICE CG50: Recognising and responding to deterioration in adults',
  url: 'https://www.nice.org.uk/guidance/cg50/resources/full-guideline-pdf-195219037',
};
const hypotension: LearningSource = {
  title: 'American Heart Association: Low Blood Pressure',
  url: 'https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/low-blood-pressure-when-blood-pressure-is-too-low',
};
const medications: LearningSource = {
  title: 'American Heart Association: Heart Failure Medications',
  url: 'https://www.heart.org/-/media/Files/Health-Topics/Heart-Failure/HF-Medications.pdf',
};
const furosemideLabel: LearningSource = {
  title: 'DailyMed: Furosemide injection — fluid, electrolyte, and renal monitoring (sections 5.1–5.2)',
  url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=aaced7a8-c3d7-4d66-8c07-aa407b8b3f35',
};

// Original fictional teaching case. References support the teaching principles;
// they do not establish nurse-educator review or validate this item's answer key.
// Each stage reveals only its own update; the UI may show earlier entries too.
export const heartFailureCase: LearningCase = {
  id: 'hf-unfolding-01',
  title: 'When breathing gets harder',
  subtitle: 'One patient. Six decisions. Follow the changes.',
  description: 'Connect congestion, oxygenation, and perfusion in a fictional adult-health case. Review explanations after completing all six decisions. Draft teaching content awaiting independent nurse-educator review; not guidance for patient care.',
  patient: 'Jordan Ellis, 64 • admitted to a monitored adult medical unit • established heart failure with reduced ejection fraction',
  estimatedMinutes: 12,
  concepts: ['Oxygenation', 'Perfusion', 'Fluid balance', 'Medication safety', 'Reassessment'],
  sources: [signs, tracking, acuteCare, deterioration, hypotension, medications, furosemideLabel],
  status: 'needs_review',
  contentVersion: version,
  stages: [
    {
      id: 'hf-01-recognize',
      step: 'recognize',
      title: 'Notice the pattern',
      chart: [
        '09:00 • Admission history: Jordan usually sleeps with one pillow but has needed three to breathe comfortably during the last three nights. Weight increased 2 kg over the last three days. Baseline ejection fraction is 35%. No history of chronic lung disease is documented.',
        '09:00 • Assessment: fine crackles at both lung bases, bilateral ankle edema, alert and oriented, regular radial pulse.',
        '09:00 • Vitals: BP 146/86 mmHg; pulse 104/min; respirations 24/min; SpO₂ 91% on room air; temperature 36.8°C.',
        '09:00 • Nursing note: admission team notified of breathing symptoms and low oxygen saturation; nurse remains at bedside with monitoring while assessment continues.',
      ],
      prompt: 'Which THREE findings most directly support a pattern of fluid accumulation?',
      format: 'selectN',
      selectCount: 3,
      options: [
        { id: 'pillows', text: 'New need for three pillows to breathe comfortably at night' },
        { id: 'weight', text: 'Weight increase of 2 kg in three days' },
        { id: 'crackles', text: 'Crackles at both lung bases' },
        { id: 'orientation', text: 'Alert and oriented' },
        { id: 'temperature', text: 'Temperature 36.8°C' },
        { id: 'regular', text: 'Regular radial pulse' },
      ],
      correctIds: ['pillows', 'weight', 'crackles'],
      rationale: {
        takeaway: 'Cluster related findings before choosing an explanation.',
        cues: ['Breathing worsens when lying down.', 'Weight rose quickly.', 'Bilateral basal crackles accompany edema.'],
        mechanism: 'Higher pulmonary filling pressures can promote lung fluid accumulation. Fluid retention can also raise weight. Together, these findings fit congestion in this patient, but they do not prove its cause.',
        distractors: ['Orientation describes mental status; being alert does not rule out congestion.', 'A normal temperature does not explain the fluid pattern or exclude illness.', 'A regular pulse describes rhythm, not fluid status.'],
        transferPrompt: 'If another patient had ankle swelling alone, what breathing history and recent weight trend would help you decide whether congestion is developing?',
      },
      sources: [signs, tracking],
      status: 'needs_review',
      contentVersion: version,
    },
    {
      id: 'hf-02-analyze',
      step: 'analyze',
      title: 'Connect cue to mechanism',
      chart: [
        '09:05 • Imaging report: bilateral interstitial pulmonary edema. The admitting clinician is evaluating suspected acute worsening of heart failure.',
        '09:05 • Assessment remains: basal crackles, ankle edema, pulse 104/min. Nurse and clinical team continue the bedside assessment.',
      ],
      prompt: 'Match each finding to its most direct interpretation in this case. Choose one interpretation per row.',
      format: 'matrix',
      options: [
        { id: 'pulmonary', text: 'Pulmonary congestion' },
        { id: 'systemic', text: 'Peripheral fluid accumulation' },
        { id: 'nonspecific', text: 'Not specific enough by itself' },
      ],
      rows: [
        { id: 'basal', label: 'Crackles at both lung bases with pulmonary edema on imaging', correctOptionId: 'pulmonary' },
        { id: 'ankles', label: 'Bilateral ankle edema', correctOptionId: 'systemic' },
        { id: 'pulse', label: 'Pulse 104/min', correctOptionId: 'nonspecific' },
      ],
      correctIds: [],
      rationale: {
        takeaway: 'Different findings describe different parts of the same problem.',
        cues: ['The imaging result strengthens the interpretation of crackles.', 'Edema is visible in the peripheral tissues.', 'A fast pulse has several possible causes.'],
        mechanism: 'Pulmonary and peripheral fluid findings can coexist. Tachycardia may accompany illness, but cannot identify congestion or its cause on its own.',
        distractors: ['Ankle edema is a peripheral finding; it does not directly describe lung fluid.', 'A fast pulse alone cannot distinguish congestion, pain, anxiety, or another cause.', 'Use the chart together; individual findings are rarely a complete diagnosis.'],
        transferPrompt: 'If imaging showed no pulmonary edema, which interpretation would become less certain and what additional assessment would you seek?',
      },
      sources: [signs],
      status: 'needs_review',
      contentVersion: version,
    },
    {
      id: 'hf-03-prioritize',
      step: 'prioritize',
      title: 'Choose the immediate concern',
      chart: [
        '09:10 • New change: Jordan now speaks only a few words at a time and says breathing feels much harder.',
        '09:10 • Vitals: BP 152/90 mmHg; pulse 114/min; respirations 30/min with increased effort; SpO₂ 87% on room air. Jordan is awake and frightened.',
        '09:10 • Immediate response: the nurse activates the local urgent response, remains at bedside, and initiates prescribed or protocol-directed oxygen and positioning support while the team responds.',
      ],
      prompt: 'Which concern should drive the nurse’s immediate escalation and bedside response?',
      format: 'single',
      options: [
        { id: 'gas', text: 'Worsening oxygenation and respiratory distress' },
        { id: 'teaching', text: 'Need for a detailed home weight-monitoring lesson' },
        { id: 'sleep', text: 'Interrupted sleep during the past three nights' },
        { id: 'anxiety', text: 'Anxiety as the sole explanation for the breathing change' },
      ],
      correctIds: ['gas'],
      rationale: {
        takeaway: 'A worsening breathing trend changes the priority now.',
        cues: ['SpO₂ fell from 91% to 87% on room air.', 'Respirations increased from 24 to 30/min.', 'Speech is limited by breathlessness.'],
        mechanism: 'These combined changes signal acute respiratory deterioration. Activate the appropriate local urgent response while continuing bedside assessment and prescribed or protocol-directed support.',
        distractors: ['Home teaching can wait until the acute change is addressed.', 'Sleep matters, but does not outrank the current breathing deterioration.', 'Fear can accompany distress; it does not explain away objective oxygenation changes.'],
        transferPrompt: 'In a different patient, how would new confusion change your urgency even if the oxygen saturation had not yet fallen?',
      },
      sources: [deterioration],
      status: 'needs_review',
      contentVersion: version,
    },
    {
      id: 'hf-04-generate',
      step: 'generate',
      title: 'Plan useful reassessments',
      chart: [
        '09:20 • Reassessment after support initiated at 09:10: the acute care team has assessed Jordan. Prescribed oxygen and a position supporting breathing remain in place. SpO₂ is now 94% on supplemental oxygen; respirations 24/min.',
        '09:20 • Clinician documents acute heart failure with congestion and prescribes IV furosemide, a loop diuretic. Baseline results: potassium 4.1 mmol/L, creatinine 1.0 mg/dL.',
        '09:20 • The nurse verifies the medication order and plans monitoring with the team. No medication dose is supplied in this teaching case.',
      ],
      prompt: 'Which monitoring plans help assess both benefit and potential harm during treatment? Select all that apply.',
      format: 'multiple',
      options: [
        { id: 'breathing', text: 'Trend respiratory effort, oxygen saturation, and oxygen support required' },
        { id: 'balance', text: 'Record intake and urine output, and compare weights under consistent conditions' },
        { id: 'safety', text: 'Trend blood pressure and review ordered renal function and electrolyte results' },
        { id: 'urineOnly', text: 'Use increased urine output alone to declare treatment successful' },
        { id: 'replace', text: 'Automatically replace every milliliter of urine with unrestricted oral fluid' },
      ],
      correctIds: ['breathing', 'balance', 'safety'],
      rationale: {
        takeaway: 'Look for relief of congestion and watch for treatment-related problems.',
        cues: ['Breathing improved after support.', 'A diuretic has been prescribed.', 'Baseline renal function and electrolytes are available for comparison.'],
        mechanism: 'Diuretics promote salt and water removal. Follow the patient’s response with fluid trends and renal monitoring; blood pressure, symptoms, and electrolytes add medication-safety context.',
        distractors: ['More urine does not establish that breathing, perfusion, and laboratory findings are satisfactory.', 'Fluid intake follows the individualized plan; automatic replacement could undermine congestion treatment.'],
        transferPrompt: 'If a different patient’s breathing improved but their blood pressure fell and dizziness appeared, which part of your monitoring plan would become urgent?',
      },
      sources: [acuteCare, medications, tracking, furosemideLabel],
      status: 'needs_review',
      contentVersion: version,
    },
    {
      id: 'hf-05-action',
      step: 'action',
      title: 'Respond to the new change',
      chart: [
        '13:20 • After the prescribed treatment, recorded urine output is 1,300 mL over four hours. Jordan now reports feeling faint while sitting in bed.',
        '13:20 • Repeat BP is 86/54 mmHg, compared with 130/78 mmHg an hour earlier. Pulse 116/min; respirations 22/min; SpO₂ 95% on unchanged prescribed oxygen.',
        '13:20 • Jordan is awake. The next scheduled IV diuretic is due. The cause of the blood pressure change has not been established.',
      ],
      prompt: 'Which is the best immediate nursing response to this new information?',
      format: 'single',
      options: [
        { id: 'reassess', text: 'Stay with Jordan, protect against a fall, reassess breathing and circulation, and activate the local urgent response; obtain prompt clinical review before the scheduled diuretic' },
        { id: 'routine', text: 'Give the scheduled diuretic to treat the remaining edema, then request a routine medication review because oxygen saturation has improved' },
        { id: 'walk', text: 'Assist Jordan to stand for orthostatic blood pressure measurements before deciding whether urgent escalation is needed' },
        { id: 'diagnose', text: 'Pause medication administration and wait for the pending renal function results before contacting the clinician about the blood pressure change' },
      ],
      correctIds: ['reassess'],
      rationale: {
        takeaway: 'New symptomatic hypotension requires prompt reassessment and escalation.',
        cues: ['BP fell substantially and remains low on repeat measurement.', 'Jordan feels faint.', 'A further medication dose is due while the condition has changed.'],
        mechanism: 'Low pressure with symptoms can indicate compromised circulation. Heart failure, medication effects, and other problems may contribute; the response must not assume a single cause.',
        distractors: ['Remaining edema and an improved oxygen reading do not justify administering the due medication without review of the new symptomatic hypotension.', 'Standing measurements can add information in other circumstances, but should not delay escalation or expose this already faint patient to a fall.', 'Pending laboratory results may help explain the change; waiting for them would delay the response to an immediate clinical concern.'],
        transferPrompt: 'If another patient developed dizziness and hypotension without receiving a diuretic, why would the same initial reassessment still matter?',
      },
      sources: [hypotension, deterioration],
      status: 'needs_review',
      contentVersion: version,
    },
    {
      id: 'hf-06-evaluate',
      step: 'evaluate',
      title: 'Improving does not mean resolved',
      chart: [
        '14:00 • The responding clinician reassessed Jordan and revised the treatment orders. Monitoring continues.',
        '14:00 • BP 108/68 mmHg; pulse 92/min; respirations 20/min with less effort; SpO₂ 95% on the same prescribed oxygen support. Jordan is alert and no longer feels faint.',
        '14:00 • Urine output in the last hour: 45 mL. Ankle edema remains. Follow-up renal function and electrolyte results are pending.',
      ],
      prompt: 'For each finding, choose whether it demonstrates an improving trend or an unresolved issue needing follow-up.',
      format: 'matrix',
      options: [
        { id: 'improving', text: 'Improving trend' },
        { id: 'followup', text: 'Needs continued follow-up' },
      ],
      rows: [
        { id: 'effort', label: 'Respirations fell from 30 to 20/min and effort decreased', correctOptionId: 'improving' },
        { id: 'pressure', label: 'BP rose from 86/54 to 108/68 mmHg and faintness resolved', correctOptionId: 'improving' },
        { id: 'support', label: 'SpO₂ is 95% while supplemental oxygen remains in use; oxygenation without support has not been established', correctOptionId: 'followup' },
        { id: 'pending', label: 'Edema persists and repeat renal function and electrolyte results are pending', correctOptionId: 'followup' },
      ],
      correctIds: [],
      rationale: {
        takeaway: 'Evaluate change against the earlier problem and the support still in use.',
        cues: ['Breathing effort and symptomatic blood pressure both improved.', 'Oxygen support remains in place.', 'Fluid and laboratory reassessment is incomplete.'],
        mechanism: 'Several trends are reassuring, but one observation cannot establish recovery. Oxygenation without support is not established; fluid findings and pending laboratory results also need follow-up.',
        distractors: ['A satisfactory saturation on oxygen does not establish adequate oxygenation without that support.', 'Improved blood pressure is useful evidence, not a discharge decision.', 'Persistent edema and pending results should not be silently treated as resolved.'],
        transferPrompt: 'If a new patient had a normal oxygen saturation only after their oxygen support was increased, would the number alone demonstrate improvement? Explain what else you would compare.',
      },
      sources: [acuteCare, tracking, deterioration],
      status: 'needs_review',
      contentVersion: version,
    },
  ],
};

export const learningCases: LearningCase[] = [heartFailureCase];
