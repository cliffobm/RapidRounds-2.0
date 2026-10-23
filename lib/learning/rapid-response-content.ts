import type { EcgRhythmId } from './ecg-rhythms'
import type { EvolvingQuestion } from './evolving-types'

export const rapidResponseRevision = '2026-10-23.1'
export const rapidResponseClinicalScope =
  'Fictional adult learning cases with synthetic ECG illustrations. Training budgets are not clinical deadlines. Actions and treatments follow the responding team, local protocols and professional scope; this draft content requires clinical editorial signoff.'

export type RapidResponseStage = {
  id: string
  update: string
  observations: string[]
  rhythmId?: EcgRhythmId
  pulseContext?: string
  question: EvolvingQuestion
  /** Editorial review flag for an important safety decision; not a validated competency measure. */
  critical: boolean
}

export type RapidResponseCase = {
  id: string
  title: string
  topic: string
  summary: string
  /** Adjustable learning-session budget, never a clinical response-time standard. */
  timeBudgetSeconds: number
  references: { title: string; url: string }[]
  stages: RapidResponseStage[]
}

type Choice = [text: string, explanation: string]
function question(
  prompt: string,
  choices: [Choice, Choice, Choice, Choice],
  correctIndexes: number[],
  reflection: string,
): EvolvingQuestion {
  return {
    prompt,
    options: choices.map(([text, explanation], index) => ({ id: String(index), text, explanation })),
    correct: correctIndexes.map(String),
    reflection,
  }
}

const als = {
  title: 'AHA 2025: adult advanced life support',
  url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support',
}
const bls = {
  title: 'AHA 2025: adult basic life support',
  url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support',
}
const conduction = {
  title: 'ACC/AHA/HRS: bradycardia and cardiac conduction delay',
  url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000628',
}
const potassium = {
  title: 'UK Kidney Association: acute hyperkalaemia in adults, July 2026 update',
  url: 'https://www.ukkidney.org/health-professionals/guidelines/treatment-acute-hyperkalaemia-adults-0',
}
const deterioration = {
  title: 'NICE CG50: recognising and responding to deterioration in hospital',
  url: 'https://www.nice.org.uk/guidance/cg50/chapter/Recommendations',
}

/** Original adult educational scenarios. All require clinical editorial signoff before release as validated assessment. */
export const rapidResponseCases: RapidResponseCase[] = [
  {
    id: 'irregular-pulse',
    title: 'The Irregular Pulse',
    topic: 'Arrhythmia & perfusion',
    summary: 'A new rapid rhythm accompanies a sudden fall in blood pressure.',
    timeBudgetSeconds: 300,
    references: [als, deterioration],
    stages: [
      {
        id: 'arrival',
        update: 'Priya Shah, 64, suddenly reports palpitations and chest pressure while awaiting discharge. Her earlier pulse was 82/min and regular. She is now clammy and struggles to stay focused.',
        observations: ['Irregular pulse averaging about 150/min', 'BP 78/46 mmHg; earlier 126/74', 'RR 28/min; SpO₂ 93% on room air', 'New chest pressure and confusion'],
        rhythmId: 'af-rvr',
        pulseContext: 'A rapid, irregular central pulse is palpable. Priya is breathing spontaneously.',
        critical: true,
        question: question(
          'Which finding makes this a time-critical perfusion problem rather than an isolated high monitor rate?',
          [
            ['The new hypotension with confusion and chest pressure', 'The abrupt pressure fall and signs of cerebral and myocardial compromise indicate instability. Assess and summon emergency help while supporting airway, breathing and circulation; do not wait for an exact rhythm label.'],
            ['The irregularity by itself, regardless of blood pressure', 'Irregularity helps identify the rhythm, but it does not establish whether circulation is adequate. Her associated deterioration determines the immediate urgency.'],
            ['The oxygen saturation being only slightly below normal', 'Oxygenation needs attention, but a near-normal saturation cannot exclude inadequate blood flow. It does not explain away the hypotension or confusion.'],
            ['The absence of a previously diagnosed arrhythmia', 'A new diagnosis matters, but urgency comes from her current physiologic compromise. A person with known atrial fibrillation could be equally unstable.'],
          ],
          [0],
          'Distinguish recognition of a rhythm from recognition of the harm it is causing. Here the patient, pulse and pressure establish urgency together.',
        ),
      },
      {
        id: 'response',
        update: 'The emergency team arrives. A 12-lead ECG confirms atrial fibrillation with a rapid ventricular response. The team attributes the ongoing shock to the abrupt tachyarrhythmia; Priya still has a pulse.',
        observations: ['Irregular ventricular response averaging about 150/min', 'BP 76/44 mmHg', 'Chest pressure persists', 'Defibrillator, suction and airway equipment are being brought to bedside'],
        rhythmId: 'af-rvr',
        pulseContext: 'A central pulse is present; Priya remains responsive to voice.',
        critical: true,
        question: question(
          'Which preparation best supports the team’s immediate treatment of this unstable rhythm with a pulse?',
          [
            ['Prepare for an unsynchronized shock as if there were no pulse', 'She has a pulse and an organized tachyarrhythmia. Synchronization is generally used for cardioversion of this rhythm to avoid delivering a shock during a vulnerable part of ventricular repolarization.'],
            ['Wait for an oral rate-control medicine to take effect', 'Ongoing shock requires a prompt team-led intervention. Oral treatment has neither the timing nor the controllability required for this deterioration.'],
            ['Prepare synchronized cardioversion with airway support', 'Instability attributed to AF with a rapid ventricular response supports immediate electrical cardioversion. Prepare pads, monitoring and airway support; sedation is considered when feasible without delaying urgent care.'],
            ['Obtain a chest image before bringing the defibrillator', 'Investigations can help identify associated illness, but should not delay support and urgent rhythm treatment in this clearly unstable presentation.'],
          ],
          [2],
          'Pulse status and rhythm morphology guide the electrical strategy. Do not transfer a pulseless-arrest action automatically to a patient who still has a pulse.',
        ),
      },
      {
        id: 'reassessment',
        update: 'After team-directed synchronized cardioversion, the monitor shows an organized rhythm at 72/min. Priya is still drowsy following procedural medication.',
        observations: ['BP 104/66 mmHg', 'RR 10/min, shallow', 'SpO₂ 96% on supplemental oxygen', 'Responds to a loud voice'],
        rhythmId: 'sinus',
        pulseContext: 'A regular pulse is palpable and matches the monitor rate.',
        critical: true,
        question: question(
          'Which reassessment is most urgent despite the improved rhythm and blood pressure?',
          [
            ['Ask about long-term exercise goals before further observations', 'Long-term education is useful after stabilization. Shallow breathing and reduced alertness make immediate airway and ventilation assessment more urgent.'],
            ['Reassess airway patency, ventilation and alertness', 'Procedural medicines can impair ventilation even while oxygen maintains a reassuring SpO₂. Reassess breathing effort, rate, responsiveness and available ventilation monitoring, and support/escalate as needed.'],
            ['Remove monitoring because sinus rhythm has returned', 'Rhythm conversion does not end the need for post-procedure monitoring. Recurrence, hypotension and respiratory effects may still occur.'],
            ['Use the oxygen saturation alone to exclude respiratory compromise', 'SpO₂ measures oxygenation rather than the adequacy of ventilation. Supplemental oxygen can delay desaturation during hypoventilation.'],
          ],
          [1],
          'Success of one intervention can create a new assessment priority. Recheck the whole patient rather than ending assessment when the monitor improves.',
        ),
      },
      {
        id: 'handover',
        update: 'Priya is now awake, breathing normally and free of chest pressure. She says the palpitations might have started overnight rather than just before discharge. Anticoagulation history has not yet been confirmed.',
        observations: ['Pulse 86/min and regular', 'BP 112/70 mmHg', 'RR 16/min; SpO₂ 97% on the prescribed oxygen', 'Rhythm duration remains uncertain'],
        critical: false,
        question: question(
          'Which handover most supports safe care after the immediate instability has resolved?',
          [
            ['Document only the final normal heart rate', 'The final rate omits the instability, intervention, respiratory recovery and uncertain rhythm duration needed for subsequent management.'],
            ['State that stroke-risk assessment is unnecessary after conversion', 'Restoring sinus rhythm does not remove the need for an individualized assessment of thromboembolic risk and anticoagulation by the treating clinician.'],
            ['Recommend discharge because the repeat rhythm looks normal', 'A normal snapshot does not establish that the precipitant, recurrence risk or post-cardioversion plan has been addressed.'],
            ['Include the course, onset uncertainty and anticoagulation history', 'Communicating the course and uncertainty helps the clinician plan monitoring, investigate causes and assess post-cardioversion thromboembolic risk. Urgent stabilization should not have been delayed to settle the onset history.'],
          ],
          [3],
          'An effective handover preserves the trajectory and unresolved risks, including details that become important after the emergency intervention.',
        ),
      },
    ],
  },
  {
    id: 'wide-complex-collapse',
    title: 'The Wide-Complex Collapse',
    topic: 'Ventricular rhythm & arrest',
    summary: 'A person with a pulse deteriorates into a shockable cardiac arrest.',
    timeBudgetSeconds: 240,
    references: [als, bls],
    stages: [
      {
        id: 'pulse-present',
        update: 'Noah Brooks, 57, develops a regular broad-complex rhythm after reporting chest discomfort. He is pale and answers slowly. The resuscitation team is at bedside.',
        observations: ['Regular wide-complex rate 180/min', 'BP 74/42 mmHg', 'New impaired alertness and chest discomfort', 'No normal-pressure baseline has been restored'],
        rhythmId: 'vt',
        pulseContext: 'A central pulse is palpable. Noah is breathing and responds to voice.',
        critical: true,
        question: question(
          'Which treatment preparation fits the current rhythm, pulse and signs of shock?',
          [
            ['Prepare a team-directed synchronized cardioversion', 'A regular monomorphic wide-complex tachycardia with a pulse and shock is an unstable tachyarrhythmia. Prepare urgent synchronized cardioversion and supportive care under the resuscitation team’s direction.'],
            ['Start chest compressions despite the confirmed pulse', 'Compressions are indicated for cardiac arrest, not solely for a high monitor rate. Current pulse and perfusion assessment distinguish this state from pulseless VT.'],
            ['Delay action until the precise ventricular origin is mapped', 'Detailed localization does not take priority over stabilization of profound hypotension and altered mental status.'],
            ['Treat it as a stable narrow-complex SVT', 'The complexes are broad and the patient is unstable. A narrow-complex stable-rhythm pathway does not fit these facts.'],
          ],
          [0],
          'The same broad-complex appearance can require a different response when pulse status changes. Reassess the patient continuously.',
        ),
      },
      {
        id: 'pulse-lost',
        update: 'Before cardioversion can be delivered, Noah becomes unresponsive and has only occasional gasps. A pulse check by the trained responder finds no definite central pulse within 10 seconds. The monitor still shows the broad-complex rhythm.',
        observations: ['Unresponsive', 'No normal breathing', 'No definite central pulse', 'Defibrillator is attached and a trained team is present'],
        rhythmId: 'pulseless-vt',
        pulseContext: 'No definite central pulse is found within 10 seconds; there is no normal breathing.',
        critical: true,
        question: question(
          'Which response must replace the with-a-pulse pathway now?',
          [
            ['Wait for a blood pressure reading before deciding whether this is arrest', 'Unresponsiveness, absent normal breathing and no definite pulse already indicate cardiac arrest. A cuff reading must not delay CPR and defibrillation.'],
            ['Continue preparing synchronized cardioversion without compressions', 'Loss of the pulse changes the pathway. Waiting for synchronization can delay defibrillation of a shockable arrest rhythm.'],
            ['Start CPR and prepare unsynchronized defibrillation', 'Pulseless VT is a shockable cardiac arrest. Begin high-quality CPR and use prompt unsynchronized defibrillation through the team/AED pathway, minimizing interruptions in compressions.'],
            ['Give oxygen alone until a regular rhythm returns', 'Oxygen cannot substitute for circulation in cardiac arrest. Ventilatory support accompanies CPR and defibrillation rather than replacing them.'],
          ],
          [2],
          'Pulseless VT cannot be diagnosed from its shape alone. The bedside loss of pulse is the decisive new information.',
        ),
      },
      {
        id: 'after-shock',
        update: 'The team delivers the indicated shock. No signs of return of circulation are apparent immediately afterward.',
        observations: ['No purposeful movement', 'No normal breathing observed', 'Team is coordinating the next CPR cycle', 'Continuous assessment is being led by the resuscitation leader'],
        critical: true,
        question: question(
          'What should happen immediately after this shock?',
          [
            ['Pause for a complete 12-lead ECG', 'A prolonged pause interrupts perfusion. Diagnostic tracing is not the immediate priority before circulation returns.'],
            ['Resume high-quality CPR promptly, with minimal interruption', 'Chest compressions should resume promptly after defibrillation when there are no signs of return of circulation. Rhythm and pulse checks occur at the appropriate team-directed intervals, with interruptions kept brief.'],
            ['Check the pulse repeatedly until one becomes palpable', 'Repeated prolonged pulse checks reduce compression time. Reassess at the designated interval or when convincing signs of circulation appear.'],
            ['Assume the shock has restored circulation and stop compressions', 'Electrical treatment does not guarantee effective circulation. Without signs of return, continue the arrest pathway.'],
          ],
          [1],
          'A shock is one part of resuscitation. Avoid treating shock delivery itself as evidence that the circulation has recovered.',
        ),
      },
      {
        id: 'organized-rhythm',
        update: 'At the next scheduled assessment, the monitor shows an organized narrow-complex rhythm at 72/min. Noah remains unresponsive, and a trained responder cannot feel a definite central pulse within 10 seconds.',
        observations: ['Organized electrical activity 72/min', 'No definite central pulse', 'No normal breathing', 'Team is reviewing reversible causes'],
        rhythmId: 'pea',
        pulseContext: 'Despite organized electrical activity, no definite central pulse is present within 10 seconds.',
        critical: true,
        question: question(
          'What does this organized rhythm without a pulse require?',
          [
            ['Stop CPR because electrical activity proves perfusion', 'An organized tracing can exist without effective mechanical output. It does not establish return of spontaneous circulation.'],
            ['Defibrillate every organized rhythm until a pulse appears', 'PEA is not a shockable rhythm. Defibrillation is directed at VF/pulseless VT rather than organized pulseless activity.'],
            ['Prepare synchronized cardioversion of the 72/min rhythm', 'There is no pulse and no tachyarrhythmia to cardiovert. This remains a cardiac arrest requiring the nonshockable pathway.'],
            ['Continue CPR and the nonshockable-arrest pathway', 'Electrical activity without a definite pulse is PEA in this context. Continue high-quality CPR, team-directed nonshockable-arrest care and active assessment for reversible causes.'],
          ],
          [3],
          'The display can improve while circulation remains absent. Always connect the tracing to pulse status and the patient’s clinical state.',
        ),
      },
    ],
  },
  {
    id: 'slowing-conduction',
    title: 'The Slowing Pulse',
    topic: 'Heart block & perfusion',
    summary: 'A slow ventricular rhythm progresses with syncope and hypotension.',
    timeBudgetSeconds: 300,
    references: [als, conduction],
    stages: [
      {
        id: 'faint',
        update: 'Helen Ortiz, 73, briefly loses consciousness while sitting in bed. She is now awake but dizzy and clammy. A 12-lead ECG has been requested while the emergency team is called.',
        observations: ['Ventricular pulse 32/min', 'BP 82/48 mmHg', 'Recurrent dizziness after syncope', 'Atrial activity is faster than the ventricular rhythm'],
        rhythmId: 'av-complete',
        pulseContext: 'A slow central pulse is palpable and matches the ventricular rate.',
        critical: true,
        question: question(
          'Which interpretation best connects Helen’s slow pulse to her current risk?',
          [
            ['A slow pulse is expected in every older adult', 'Age does not make syncope and hypotension benign. Her symptoms and perfusion must be assessed alongside the rhythm.'],
            ['Electrical atrial activity guarantees adequate cardiac output', 'Atrial depolarization does not guarantee effective ventricular output. The ventricular rate and hemodynamic effects are central here.'],
            ['The bradycardia is accompanied by hypoperfusion', 'Syncope, dizziness and hypotension accompany the marked bradycardia. This is an unstable presentation requiring urgent support and expert treatment, rather than observation of the monitor alone.'],
            ['Only chest pain would justify an emergency response', 'Chest pain is one possible adverse sign, not a requirement. Her syncope and low pressure already demonstrate significant compromise.'],
          ],
          [2],
          'Interpret a bradycardia through blood flow and symptoms. The numeric rate alone cannot distinguish a well athlete from this unstable patient.',
        ),
      },
      {
        id: 'prepare-support',
        update: 'The team confirms complete AV block. Initial team-directed medication has not improved the ventricular rate or pressure, and Helen is becoming less responsive.',
        observations: ['Ventricular rate 32/min', 'BP 70/40 mmHg', 'Declining responsiveness', 'Defibrillator with pacing capability is available'],
        rhythmId: 'av-complete',
        pulseContext: 'A slow pulse remains present; Helen is breathing spontaneously.',
        critical: true,
        question: question(
          'Which preparation most directly addresses persistent unstable bradycardia?',
          [
            ['Bring pacing-capable equipment and support the team’s urgent pacing plan', 'Persistent hypoperfusion despite initial treatment may require pacing and other clinician-directed support. Preparing pads, monitoring, access and expert assistance helps avoid further delay.'],
            ['Wait for several routine observation rounds before escalating again', 'The worsening pressure and responsiveness require an immediate response. Routine observation intervals are unsafe in this trajectory.'],
            ['Prepare synchronized cardioversion for the slow escape rhythm', 'Cardioversion treats selected tachyarrhythmias; it does not correct this slow ventricular escape rhythm. Pacing is the relevant electrical support.'],
            ['Delay bedside support until permanent pacemaker consent is completed', 'Definitive treatment planning is important, but temporary stabilization of the current shock must proceed urgently with the team.'],
          ],
          [0],
          'Recognize when the current treatment is failing. Equipment readiness and explicit escalation are part of an effective clinical response.',
        ),
      },
      {
        id: 'capture',
        update: 'Transcutaneous pacing is started by the team. Pacing markers appear on the monitor with apparent ventricular complexes afterward. Helen remains pale.',
        observations: ['Monitor displays pacing at 70/min', 'Bedside perfusion has not yet been confirmed', 'BP measurement is being repeated', 'Conscious discomfort is also being assessed'],
        critical: true,
        question: question(
          'Which assessment is essential before concluding that pacing has restored useful circulation?',
          [
            ['Count pacing spikes alone', 'Spikes show attempted stimulation. They do not establish either ventricular depolarization or effective mechanical output.'],
            ['Use the displayed heart rate as the only endpoint', 'The monitor may count pacing artifacts or electrical activity. A rate label cannot demonstrate that tissues are being perfused.'],
            ['Assume any muscle movement confirms a pulse', 'Skeletal muscle contractions can occur during transcutaneous pacing. They can be mistaken for evidence of effective cardiac output.'],
            ['Confirm mechanical capture with pulse and hemodynamic assessment', 'Electrical capture must be linked to mechanical output. The team confirms an appropriate pulse, blood pressure and perfusion response, using additional monitoring when available rather than relying on pacing artifacts.'],
          ],
          [3],
          'An electrical change is an intermediate signal. The clinical endpoint is restored perfusion, supported by concordant bedside findings.',
        ),
      },
      {
        id: 'ongoing-risk',
        update: 'Mechanical capture is confirmed and Helen becomes more alert. The rate remains supported by temporary pacing. A medication history and ischemia/electrolyte assessment are incomplete.',
        observations: ['Pulse 70/min with pacing', 'BP 106/64 mmHg', 'Dizziness is improving', 'The cause of the conduction failure remains under review'],
        critical: false,
        question: question(
          'Which ongoing plan best addresses the risk that remains after this improvement?',
          [
            ['Stop rhythm observation once Helen can answer questions', 'Improved alertness does not establish durable conduction or exclude loss of capture. Continued monitoring is needed during temporary support.'],
            ['Continue checking capture and perfusion while preparing specialist review', 'Temporary pacing supports rate but does not explain or necessarily resolve the cause. Continued surveillance, medication review, ischemia/electrolyte assessment and specialist planning address recurrence and treatment failure.'],
            ['Record the rhythm as uncomplicated sinus bradycardia', 'The team has confirmed complete AV block requiring pacing. Relabeling it loses the severity and can mislead subsequent care.'],
            ['Recommend independent ambulation to prove recovery', 'Ambulation is inappropriate while an unstable conduction problem is being supported and assessed. Current improvement must be consolidated safely.'],
          ],
          [1],
          'Stabilization and resolution are different milestones. Preserve the need for monitoring and etiologic review during the handover.',
        ),
      },
    ],
  },
  {
    id: 'hidden-loss',
    title: 'The Hidden Blood Loss',
    topic: 'Postoperative hemorrhage',
    summary: 'A postoperative trend challenges reassuring single measurements.',
    timeBudgetSeconds: 360,
    references: [
      deterioration,
      { title: 'Royal College of Anaesthetists NAP7: major haemorrhage', url: 'https://www.rcoa.ac.uk/sites/default/files/documents/2024-05/24832%20RCoA_NAP7_Book_updated.pdf' },
    ],
    stages: [
      {
        id: 'drain-change',
        update: 'Owen Reed, 46, is two hours after abdominal surgery. The drain has collected 290 mL of fresh blood in 30 minutes. He says he feels suddenly cold and faint.',
        observations: ['Pulse 120/min; earlier 78', 'BP 96/60 mmHg; earlier 138/82', 'Cool skin and new pallor', 'Fresh bloody drainage is continuing'],
        rhythmId: 'sinus-tachy',
        pulseContext: 'A rapid pulse is present. Owen is awake and breathing.',
        critical: true,
        question: question(
          'Which response best addresses the combination of drainage and changing perfusion?',
          [
            ['Attribute the tachycardia to postoperative pain and recheck at the next round', 'Pain is a possible contributor, but fresh blood loss with a pressure fall and presyncope requires urgent assessment rather than a benign single-cause assumption.'],
            ['Activate urgent surgical review and the hemorrhage pathway', 'The trajectory suggests clinically significant bleeding with evolving hypoperfusion. Stay with the patient, reassess ABCs and support rapid surgical/anesthetic review, access and the institution’s hemorrhage response.'],
            ['Empty the drain without recording its amount or appearance', 'Emptying without recording destroys important trend information. The amount, time course and character of loss help communicate urgency and guide the team.'],
            ['Wait for hemoglobin to fall before reporting possible bleeding', 'A hemoglobin result can lag the clinical effects of acute blood loss. The bedside deterioration is sufficient to escalate now.'],
          ],
          [1],
          'A trend across pulse, pressure, symptoms and visible loss is more actionable than any single reassuring result.',
        ),
      },
      {
        id: 'lab-lag',
        update: 'The first hemoglobin is 10.8 g/dL; the preoperative value was 11.1 g/dL. Owen’s pulse is now 128/min and he is increasingly restless while the surgical team evaluates him.',
        observations: ['BP 88/52 mmHg', 'Respiratory rate 28/min', 'Fresh drain loss continues', 'Hemoglobin has changed little in the first sample'],
        critical: true,
        question: question(
          'How should the nearly unchanged hemoglobin affect the response to this deterioration?',
          [
            ['It excludes important bleeding because the value is close to baseline', 'Early acute loss can remove plasma and red cells together before equilibration. A small initial concentration change does not exclude substantial blood loss.'],
            ['It proves the low pressure is a harmless anesthetic effect', 'The laboratory value cannot identify the cause of shock. Ongoing fresh loss and worsening perfusion require active evaluation and treatment.'],
            ['It means all resuscitation must wait for a second sample', 'Repeat tests can guide care, but treatment of the unstable clinical state must not be delayed solely to demonstrate a laboratory decline.'],
            ['Worsening shock still demands urgent review and bleeding control', 'Continue urgent team-led hemorrhage care based on the whole trajectory. Serial blood count, coagulation and physiologic measurements inform treatment without replacing bedside perfusion assessment.'],
          ],
          [3],
          'Distinguish a blood concentration from total circulating volume. The early laboratory snapshot may understate the urgency of the loss.',
        ),
      },
      {
        id: 'drain-stops',
        update: 'The drain abruptly stops flowing. Owen’s abdomen looks fuller and feels tense. He becomes harder to engage; the surgical team is considering urgent source control.',
        observations: ['Pulse 134/min', 'BP 82/46 mmHg', 'New abdominal distension', 'No further drain output despite worsening physiology'],
        critical: true,
        question: question(
          'Which interpretation of the stopped drainage is safest?',
          [
            ['Internal blood loss may continue despite absent drain output', 'A drain can stop because of obstruction or a change in where blood accumulates. Increased distension with worsening shock argues against treating absent output as proof that bleeding stopped. Escalate the new findings immediately.'],
            ['The bleeding has stopped because no more blood reaches the container', 'The container measures only what leaves through the drain. It cannot exclude retained or ongoing internal blood loss.'],
            ['A tense abdomen confirms that the drain can be removed', 'This is a new concerning finding, not a removal criterion. Drain manipulation or removal requires surgical assessment and direction.'],
            ['The lower pressure can be ignored until the drain restarts', 'Perfusion is worsening now. Waiting for renewed external loss would postpone necessary treatment of possible concealed hemorrhage.'],
          ],
          [0],
          'Absence of a visible sign is not reassuring when the rest of the trajectory is worsening. Reconcile conflicting signals rather than choosing the convenient one.',
        ),
      },
      {
        id: 'handover-transfer',
        update: 'Team-directed resuscitation improves Owen’s pressure to 100/62 mmHg. The surgical team arranges urgent transfer for bleeding control. He remains tachycardic.',
        observations: ['Pulse 116/min', 'BP 100/62 mmHg after treatment', 'Skin remains cool', 'Definitive control of bleeding has not yet occurred'],
        critical: false,
        question: question(
          'Which information is most important to preserve during the urgent transfer handover?',
          [
            ['Only the improved pressure, because the prior values are no longer relevant', 'The response may be temporary. Omitting the worst values and treatment can conceal ongoing risk and make a later decline harder to interpret.'],
            ['Only the planned destination and the patient’s age', 'Transport details are necessary but do not convey the trajectory, blood loss, treatments or unresolved source of shock.'],
            ['Communicate the blood-loss trend, resuscitation and unresolved source', 'This concise sequence explains why ongoing resuscitation, monitoring and rapid definitive treatment remain necessary despite an improved cuff pressure. Include access, products/medicines given and pending tests according to the actual record.'],
            ['A statement that normalization of pressure proves the hemorrhage has resolved', 'A resuscitation response does not prove source control. Persistent tachycardia, cool skin and the untreated source require continued vigilance.'],
          ],
          [2],
          'Communicate both improvement and residual risk. A temporary response to support should not be mistaken for correction of the underlying cause.',
        ),
      },
    ],
  },
  {
    id: 'potassium-warning',
    title: 'The Potassium Warning',
    topic: 'Electrolytes & cardiac risk',
    summary: 'A critical laboratory result and new conduction changes require a coordinated response.',
    timeBudgetSeconds: 360,
    references: [potassium, als],
    stages: [
      {
        id: 'critical-result',
        update: 'Leon Park, 59, missed two dialysis sessions because of vomiting. He reports new weakness. The laboratory calls a potassium of 6.9 mmol/L from a nonhemolyzed sample; the earlier ECG had a narrow QRS.',
        observations: ['Pulse 44/min', 'BP 90/54 mmHg', 'Current 12-lead ECG: QRS 0.16 seconds with less distinct P waves', 'No rhythm image is provided for this electrolyte-specific pattern'],
        pulseContext: 'A slow central pulse is present; Leon is awake but weak.',
        critical: true,
        question: question(
          'Which finding makes it unsafe to treat this as a routine delayed-dialysis result?',
          [
            ['Vomiting alone, because it always proves potassium depletion', 'Vomiting does not establish the potassium concentration in someone with impaired renal excretion. The measured severe elevation and new cardiac changes determine this risk.'],
            ['The absence of chest pain, which confirms a stable heart', 'Hyperkalemia can destabilize cardiac conduction without chest pain. Symptoms may be subtle before a dangerous rhythm develops.'],
            ['New conduction changes with hyperkalemia and hypotension', 'The combination raises immediate concern for cardiac toxicity. Activate urgent clinical review, continuous monitoring and the local hyperkalemia pathway while preparing prescribed treatment; do not wait for a classic textbook waveform.'],
            ['The fact that Leon remains awake', 'Consciousness does not exclude impending arrhythmia. New conduction abnormalities and hypotension warrant urgent treatment while he still has a pulse.'],
          ],
          [2],
          'A critical laboratory result becomes more urgent when the bedside physiology and ECG trend show potential organ effects. A normal ECG would not exclude risk either.',
        ),
      },
      {
        id: 'stabilize-and-remove',
        update: 'The emergency clinician prescribes IV calcium for the cardiac changes and initiates the local hyperkalemia pathway. The renal team is arranging definitive potassium removal.',
        observations: ['Potassium 6.9 mmol/L', 'Continuous ECG monitoring is in place', 'Prescribed intracellular-shift treatment is being prepared', 'Dialysis assessment is underway'],
        critical: true,
        question: question(
          'Why must the plan continue beyond giving the prescribed calcium?',
          [
            ['Calcium removes excess potassium through the kidneys', 'Calcium does not remove potassium and cannot be relied on to correct the concentration, especially in dialysis-dependent kidney failure.'],
            ['Calcium protects the heart while potassium lowering continues', 'Calcium counters the immediate electrophysiologic effects but does not lower serum potassium. The team must also lower extracellular potassium, address its cause and arrange elimination with repeated assessment.'],
            ['A better ECG proves the potassium concentration has normalized', 'ECG improvement can follow membrane stabilization before potassium falls. Follow-up chemistry and ongoing monitoring remain necessary.'],
            ['Dialysis is unnecessary once a pulse remains palpable', 'A pulse is not evidence that potassium has been removed. The renal team evaluates definitive removal and rebound risk in the clinical context.'],
          ],
          [1],
          'Separate three treatment goals: protect the myocardium, shift potassium temporarily, and remove excess potassium. Improvement in one goal does not complete the others.',
        ),
      },
      {
        id: 'second-risk',
        update: 'After prescribed insulin/glucose treatment, the QRS narrows. Leon later becomes sweaty and inattentive. The scheduled glucose check is due; monitoring continues while dialysis is arranged.',
        observations: ['Pulse 58/min; BP 108/66 mmHg', 'New sweating and reduced attention', 'Potassium is being rechecked', 'Insulin/glucose treatment was given earlier under the protocol'],
        critical: true,
        question: question(
          'Which immediate check most directly addresses this new post-treatment change?',
          [
            ['Check bedside glucose promptly', 'Insulin used to shift potassium can cause hypoglycemia, including after initial improvement. Check promptly, assess the patient and use the prescribed/local response while maintaining cardiac surveillance.'],
            ['Assume the symptoms are anxiety because the QRS improved', 'A better tracing does not explain the new symptoms. Hypoglycemia is a treatable treatment-associated risk that requires a prompt measurement.'],
            ['Stop glucose monitoring because glucose accompanied the insulin', 'Giving glucose reduces but does not eliminate subsequent hypoglycemia risk. Monitoring must continue for the locally specified period.'],
            ['Give another insulin dose independently before checking any result', 'Do not repeat insulin without an order/protocol and clinical review. Additional insulin could worsen an unrecognized low glucose.'],
          ],
          [0],
          'Anticipate harm from the treatment as well as harm from the original problem. New symptoms need reassessment even when the first target is improving.',
        ),
      },
      {
        id: 'rebound',
        update: 'Glucose is treated according to the protocol. A repeat potassium falls to 5.7 mmol/L before dialysis begins. A colleague asks whether the cardiac and biochemical monitoring can stop.',
        observations: ['QRS remains narrower than at presentation', 'Potassium is lower but not definitively removed', 'Dialysis plan remains active', 'Follow-up glucose checks are scheduled'],
        critical: false,
        question: question(
          'Which response best explains the need for continued surveillance?',
          [
            ['A single lower potassium result guarantees that the emergency cannot recur', 'A temporary intracellular shift can wear off. One improved result does not establish durable potassium removal or remove the risk of recurrence.'],
            ['A normal-looking ECG makes repeat potassium unnecessary', 'ECG findings do not reliably track the serum concentration. Repeat biochemistry remains important even when the tracing improves.'],
            ['Only glucose needs follow-up because cardiac risk has ended', 'Both post-insulin hypoglycemia and recurrent hyperkalemia remain relevant. Monitoring needs to follow the whole treatment pathway.'],
            ['Temporary potassium shifts may reverse, and glucose can still fall', 'Continue the prescribed ECG, potassium and glucose surveillance and hand over the treatment times, responses and pending dialysis. Temporary improvement is valuable but must be checked for durability.'],
          ],
          [3],
          'Evaluate whether the underlying excess has been removed or merely redistributed. That distinction determines what risk remains after the first improvement.',
        ),
      },
    ],
  },
  {
    id: 'breathless-infection',
    title: 'The Worsening Breathlessness',
    topic: 'Infection & respiratory deterioration',
    summary: 'An infection presentation develops competing oxygenation and perfusion problems.',
    timeBudgetSeconds: 360,
    references: [
      deterioration,
      { title: 'NICE NG253: evaluating sepsis risk in adults', url: 'https://www.nice.org.uk/guidance/ng253/chapter/evaluating-risk' },
      { title: 'NICE NG253: managing suspected sepsis', url: 'https://www.nice.org.uk/guidance/ng253/chapter/managing-suspected-sepsis' },
    ],
    stages: [
      {
        id: 'new-confusion',
        update: 'Mei Carter, 68, is admitted with suspected pneumonia and has heart failure with preserved ejection fraction. She was conversing normally an hour ago. Her daughter now reports that she seems confused.',
        observations: ['RR 32/min; pulse 120/min', 'BP 94/58 mmHg; earlier 122/72', 'SpO₂ 94% on 3 L/min oxygen; earlier 95% on room air', 'Temperature 38.2°C; new inattention'],
        rhythmId: 'sinus-tachy',
        pulseContext: 'A pulse is present and Mei is breathing spontaneously with increased effort.',
        critical: true,
        question: question(
          'Which comparison most clearly shows deterioration despite the current saturation of 94%?',
          [
            ['The temperature is below 39°C', 'A lower fever does not exclude serious infection or evolving organ dysfunction. The circulatory, respiratory and mental-status trends are more concerning.'],
            ['The pulse is below 150/min', 'Serious perfusion failure can occur without an extreme rate. A numeric tachyarrhythmia threshold does not determine the urgency of suspected sepsis.'],
            ['Oxygen need, respiratory effort, pressure and cognition worsened', 'Maintaining a similar saturation with more support is not stability. The increased oxygen requirement, pressure decline and new cognitive change require immediate structured reassessment and escalation.'],
            ['The daughter’s concern is less reliable than the monitor', 'A family member can identify a meaningful baseline change. That information complements rather than competes with current observations.'],
          ],
          [2],
          'Compare the amount of support and the clinical trajectory, not only the displayed value. Reassuring oxygenation cannot erase worsening perfusion or cognition.',
        ),
      },
      {
        id: 'hypoperfusion',
        update: 'The emergency team assesses Mei. Lactate is 4.1 mmol/L, pressure has fallen further and urine output has been minimal. The clinician classifies her as high risk and starts the local sepsis pathway.',
        observations: ['BP 86/50 mmHg', 'RR 34/min; increasing oxygen requirement', 'Lactate 4.1 mmol/L', 'Cultures and prescribed IV antibiotics are being prepared'],
        critical: true,
        question: question(
          'Which coordinated action best supports the urgent plan while investigation continues?',
          [
            ['Support urgent antibiotics and prescribed, reassessed resuscitation', 'High-risk suspected sepsis with hypoperfusion needs urgent treatment and senior/critical-care input. Obtain indicated samples without creating a significant treatment delay, and reassess the response to prescribed oxygen and fluids.'],
            ['Wait for culture identification before preparing antibiotics', 'Microbiological identification takes time. It should guide later targeted treatment rather than postpone urgent empiric treatment in this high-risk presentation.'],
            ['Treat the lactate number without reassessing circulation or breathing', 'Lactate is one signal, not a standalone treatment target. Pressure, alertness, urine output and respiratory tolerance help judge perfusion and treatment response.'],
            ['Give a fixed large fluid volume independently because every patient needs the same amount', 'Fluid therapy must be prescribed and reassessed. Heart failure and changing respiratory findings make individualized evaluation particularly important.'],
          ],
          [0],
          'Parallel actions can preserve time without discarding reasoning: support immediate treatment, gather useful samples, reassess perfusion and escalate unresolved risk.',
        ),
      },
      {
        id: 'fluid-tolerance',
        update: 'During a prescribed fluid bolus, Mei becomes more breathless. New bilateral crackles are heard. Her pressure has improved slightly, but her oxygenation has worsened.',
        observations: ['BP 96/58 mmHg', 'RR 36/min', 'SpO₂ 89% on 6 L/min oxygen', 'New bilateral crackles and increased work of breathing'],
        critical: true,
        question: question(
          'Which response best addresses the competing perfusion and respiratory signals?',
          [
            ['Continue further boluses automatically because pressure rose a little', 'A small pressure improvement does not establish safe fluid tolerance. New respiratory compromise requires reassessment before further fluid.'],
            ['Ignore the new crackles because pneumonia already explains all breathing changes', 'An existing diagnosis should not make a new deterioration invisible. The temporal relationship and increased oxygen need warrant immediate review.'],
            ['Stop all infection treatment because the problem must now be heart failure alone', 'Infection and fluid intolerance can coexist. The new respiratory problem requires reassessment without abandoning the sepsis treatment plan.'],
            ['Request immediate ABC and fluid-tolerance reassessment', 'The new crackles and hypoxemia require immediate supportive care and review of the infusion under local policy. Escalate for a revised hemodynamic and respiratory plan rather than continuing a fixed fluid sequence.'],
          ],
          [3],
          'Treatment response has several dimensions. A better pressure can coexist with worse oxygenation, requiring a new plan rather than more of the same intervention.',
        ),
      },
      {
        id: 'support-needed',
        update: 'After the respiratory plan is adjusted, SpO₂ is 95% on a higher level of prescribed oxygen support. Mei remains confused and tachypneic. Critical-care review is being arranged.',
        observations: ['SpO₂ 95% on increased oxygen support', 'RR 34/min', 'BP 92/56 mmHg', 'Persistent confusion and low urine output'],
        critical: false,
        question: question(
          'Which handover best represents Mei’s condition now?',
          [
            ['Recovered because the saturation has returned to 95%', 'The saturation is supported by more oxygen, while major abnormalities remain. It is not evidence of global recovery.'],
            ['Oxygenation needs support; perfusion concerns remain', 'Communicate the increased support, persistent tachypnea, confusion, pressure and urine output together with treatments and responses. These unresolved findings support continued urgent escalation and monitoring.'],
            ['Stable enough for routine observation because no arrest occurred', 'Avoiding arrest is not the definition of stability. Ongoing respiratory and perfusion abnormalities need active management.'],
            ['The original fever is the only observation worth trending', 'Temperature alone does not capture organ dysfunction or treatment tolerance. Handover must preserve the evolving whole-patient pattern.'],
          ],
          [1],
          'Judge improvement by function and support requirements across systems. One normalized value should not hide unresolved deterioration.',
        ),
      },
    ],
  },
]

export function getRapidResponseCase(id: string) {
  return rapidResponseCases.find((item) => item.id === id)
}
