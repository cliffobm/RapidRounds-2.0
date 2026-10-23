/** Supplemental teaching content stays outside versioned question definitions.
 * Existing stems, options, answer keys and saved-attempt hashes remain intact.
 * These original explanations are editorial drafts pending clinical signoff.
 */
export type PracticeExplanation = {
  brief: string
  reasoning: string[]
  terms?: { term: string; definition: string }[]
  options: { optionId: string; why: string }[]
  takeaway: string
  references: { title: string; url: string }[]
  caveat?: string
  workedExample?: string
}

const ventilationReference = {
  title: 'AARC 2024: patient–ventilator assessment',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11298231/',
}
const ardsReference = {
  title: 'ATS 2024: adult ARDS guideline',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10870893/',
}
const deadSpaceReference = {
  title: 'Hamilton Medical: alveolar ventilation and dead space',
  url: 'https://www.hamilton-medical.com/en_US/Article-page~knowledge-base~62e7ac96-b7b9-4566-a7bc-f7c9797d7348~Calculation-of-V-alv--VDaw-and-VDaw-VTe~.html',
}
const traumaReference = {
  title: 'NICE NG39: major trauma assessment and airway management',
  url: 'https://www.nice.org.uk/guidance/ng39/chapter/Recommendations',
}
const spinalReference = {
  title: 'NICE NG41: trauma assessment and spinal protection',
  url: 'https://www.nice.org.uk/guidance/ng41/chapter/Recommendations',
}
const anaphylaxisReference = {
  title: 'Resuscitation Council UK 2025: anaphylaxis',
  url: 'https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/special-circumstances-guidelines',
}
const allergyReference = {
  title: 'Australian Commission: acute anaphylaxis clinical care standard',
  url: 'https://www.safetyandquality.gov.au/clinical-care-standards/acute-anaphylaxis',
}
const organReference = {
  title: 'Sepsis-3 consensus: organ dysfunction and SOFA components',
  url: 'https://doi.org/10.1001/jama.2016.0287',
}
const glucoseReference = {
  title: 'SCCM 2024: glycemic control in critically ill patients',
  url: 'https://sccm.org/clinical-resources/guidelines/guidelines/guidelines-on-glycemic-control-for-critically-ill',
}
const padisReference = {
  title: 'SCCM: pain, agitation/sedation and delirium guidance',
  url: 'https://www.sccm.org/clinical-resources/guidelines/guidelines/guidelines-for-the-prevention-and-management-of-pa',
}
const liberationReference = {
  title: 'SCCM: ICU Liberation A–F bundle',
  url: 'https://www.sccm.org/clinical-resources/iculiberation-home/abcdef-bundles',
}
const padisUpdateReference = {
  title: 'SCCM 2025: focused PADIS update',
  url: 'https://www.sccm.org/clinical-resources/guidelines/guidelines/focused-update-padis-guideline',
}
const oximetryReference = {
  title: 'FDA: pulse oximeter interpretation and limitations',
  url: 'https://www.fda.gov/medical-devices/products-and-medical-procedures/pulse-oximeters',
}
const opioidReference = {
  title: 'APSF: monitoring opioid-induced ventilatory impairment',
  url: 'https://www.apsf.org/article/monitoring-for-opioid-induced-respiratory-depression/',
}
const deteriorationReference = {
  title: 'NICE CG50: recognising and responding to deterioration',
  url: 'https://www.nice.org.uk/guidance/cg50/chapter/Recommendations',
}
const communicationReference = {
  title: 'AHRQ TeamSTEPPS: closed-loop communication and check-back',
  url: 'https://www.ahrq.gov/sites/default/files/wysiwyg/teamstepps-program/teamstepps-pocket-guide.pdf',
}

export const practiceExplanations: Readonly<Record<string, PracticeExplanation>> = {
  'pulm-demo-1': {
    brief:
      'Smaller breaths can reduce lung distension and plateau pressure. A higher total respiratory rate can offset the smaller tidal volume to preserve total minute ventilation, with reassessment of gas exchange and expiratory time.',
    reasoning: [
      'VT is the volume of one breath; VE (more precisely V̇E) is the total volume moved each minute. They are related by V̇E = VT × respiratory rate. FiO₂ is oxygen concentration, while PEEP is pressure remaining at the end of expiration; these are different controls.',
      'For the same respiratory-system compliance and end-expiratory pressure, a smaller delivered VT generally requires less distending pressure. This is why reducing VT is the answer component that addresses plateau pressure. Increasing the total respiratory rate can compensate mathematically for the smaller breaths.',
      'The trade-off is that the same total minute ventilation does not guarantee the same effective gas exchange. Dead space occupies part of every breath. Check delivered volumes, blood gas/pH, ventilator waveforms, patient effort and auto-PEEP with the treating team after an adjustment.',
    ],
    terms: [
      { term: 'VT — tidal volume', definition: 'Air volume delivered or exhaled in one breath, usually mL/breath. Ventilator lung-protection targets use mL/kg predicted body weight.' },
      { term: 'V̇E / VE — minute ventilation', definition: 'Total air moved per minute: VT in L/breath × total respiratory rate in breaths/min = L/min.' },
      { term: 'Plateau pressure', definition: 'Airway pressure during a valid inspiratory hold with no flow and minimal patient effort; it reflects the elastic load of the lungs and chest wall.' },
      { term: 'V̇A — alveolar ventilation', definition: 'Effective gas-exchanging ventilation per minute, approximated by (VT − physiologic dead-space volume) × respiratory rate.' },
    ],
    workedExample:
      'Illustrative arithmetic, not a ventilator prescription: 0.50 L/breath × 12 breaths/min = 6 L/min. With 0.15 L dead space per breath, V̇A = (0.50 − 0.15) × 12 = 4.2 L/min. At 0.30 L × 20/min, V̇E is still 6 L/min, but V̇A = (0.30 − 0.15) × 20 = 3.0 L/min. Smaller, faster breaths can therefore preserve V̇E while reducing effective ventilation.',
    options: [
      { optionId: 'A', why: 'Larger breaths can increase distension and plateau pressure, moving against the stated goal even if a slower rate preserves the product.' },
      { optionId: 'B', why: 'Reducing breath size addresses distending pressure; raising the total rate can preserve V̇E. Gas exchange and adequate exhalation still need checking.' },
      { optionId: 'C', why: 'PEEP can improve recruitment and oxygenation in selected patients, but increasing it alone does not reduce VT or reliably lower plateau pressure.' },
      { optionId: 'D', why: 'FiO₂ changes delivered oxygen concentration. It does not directly reduce breath size or maintain CO₂ clearance when ventilation falls.' },
    ],
    takeaway: 'Separate breath size, total ventilation, effective ventilation and oxygenation; improving one does not establish that the others are adequate.',
    caveat:
      'This short stem omits the actual plateau pressure, compliance, predicted body weight, blood gas, total rate and expiratory flow. The answer is a conceptual comparison, not enough information for a patient-specific ventilator change. In assist-control, patient-triggered breaths may make total rate higher than the set rate; increasing rate can worsen air trapping.',
    references: [ventilationReference, ardsReference, deadSpaceReference],
  },
  'faf14853-70b6-4d8a-b6e9-65653ae63b5f': {
    brief: 'Sudden skin/mucosal changes, wheeze and hypotension after a sting indicate anaphylaxis. IM epinephrine is the first-line medicine because it addresses airway, breathing and circulation together.',
    reasoning: [
      'The key is the combination and timing: swelling and hives accompany bronchospasm and a pressure of 82/50 soon after exposure. Treat this as a time-critical systemic reaction, activate emergency help and begin the anaphylaxis pathway.',
      'Epinephrine supports vascular tone and cardiac output and relaxes bronchial smooth muscle. An inhaled bronchodilator addresses wheeze but cannot replace treatment of the systemic reaction. An antihistamine may relieve skin symptoms but does not reverse life-threatening airway or circulatory compromise.',
    ],
    terms: [
      { term: 'Angioedema', definition: 'Swelling in deeper skin or mucosal tissues; airway involvement can threaten patency.' },
      { term: 'IM', definition: 'Intramuscular: injection into muscle. For anaphylaxis, the recommended site is the mid-anterolateral thigh.' },
    ],
    options: [
      { optionId: 'A', why: 'Albuterol may be an adjunct for persistent bronchospasm after epinephrine, but it does not adequately treat shock or upper-airway swelling.' },
      { optionId: 'B', why: 'The IM route is the first-line choice for this presentation. Use the dose and repeat interval in the local age/weight-appropriate protocol.' },
      { optionId: 'C', why: 'Diphenhydramine treats some allergic symptoms; giving it first would delay the medicine that treats the immediate life threats.' },
      { optionId: 'D', why: 'A 1 mg IV push is a cardiac-arrest dose, not the initial treatment for this patient with a pulse. IV epinephrine for refractory anaphylaxis requires expert dosing and monitoring.' },
    ],
    takeaway: 'Recognise anaphylaxis from airway, breathing or circulation compromise after exposure; do not let treatment of hives delay IM epinephrine.',
    caveat: 'The preserved option uses older ratio notation “1:1,000”; this means 1 mg/mL. Prefer mg/mL on medication labels and follow the local protocol to prevent concentration errors.',
    references: [anaphylaxisReference, allergyReference],
  },
  '7be87882-26a7-4b01-bc8d-4ef7393ca182': {
    brief: 'The platelet, clotting, creatinine and glucose abnormalities span several systems. That pattern is more consistent with multiple organ dysfunction than a single isolated measurement.',
    reasoning: [
      'MODS means multiple organ dysfunction syndrome. Think across systems: low platelets and abnormal clotting suggest hematologic dysfunction; rising creatinine can indicate worsening renal function. New changes together deserve urgent evaluation of the cause and trajectory.',
      'Dysglycemia means abnormal glucose regulation and can accompany critical illness. It adds context here but is not, by itself, a MODS diagnosis or a SOFA criterion. Establish baseline values, trends, medicines and alternative explanations rather than diagnosing from this cluster alone.',
    ],
    terms: [
      { term: 'Thrombocytopenia', definition: 'A platelet count below the laboratory reference range; its cause and bleeding/thrombosis implications depend on context.' },
      { term: 'Coagulopathy', definition: 'Abnormal clotting function; interpretation requires the clinical picture and relevant tests.' },
      { term: 'Dysglycemia', definition: 'Glucose outside the intended range, including high or low values.' },
    ],
    options: [
      { optionId: 'A', why: 'Increased platelets, higher albumin and alkalosis do not describe the characteristic cross-system deterioration tested here.' },
      { optionId: 'B', why: 'This is the only option combining hematologic/coagulation and renal dysfunction with a metabolic disturbance.' },
      { optionId: 'C', why: 'Bradycardia, narrow pulse pressure and high calcium need assessment, but this set is less representative of multiple organ dysfunction.' },
      { optionId: 'D', why: 'A low troponin and higher albumin do not establish organ injury; alkalosis alone does not supply the missing cross-system evidence.' },
    ],
    takeaway: 'Recognise linked deterioration across organ systems, then compare baseline and trends to identify what is newly failing.',
    caveat: 'This is pattern recognition, not a diagnostic rule. MODS has several possible causes and does not automatically mean sepsis.',
    references: [organReference, glucoseReference],
  },
  '43fda3ea-d1a3-45ec-95fa-5471fb5c0152': {
    brief: 'Among these options, assess and support the airway while protecting the cervical spine first. A reduced level of consciousness makes airway assessment urgent; imaging does not replace stabilization.',
    reasoning: [
      'GCS 12 is below the fully alert score of 15. After a riding injury, reduced consciousness raises concern about maintaining a patent airway and handling secretions, while the mechanism also raises possible spinal injury. Check the airway and ventilation immediately while limiting cervical movement.',
      'The primary survey identifies and treats immediate life threats before definitive diagnostic work. CT head, ultrasound and pelvic imaging can be important, but none establishes that air can reach the lungs now. Resuscitation and investigations may proceed in parallel when the team can do so safely.',
      'Airway assessment is not the same as automatic intubation. Escalate to trained airway clinicians based on the actual ability to maintain the airway and ventilation, protective reflexes, trajectory and associated injuries; GCS 12 alone does not decide the procedure.',
    ],
    terms: [
      { term: 'GCS — Glasgow Coma Scale', definition: 'A structured assessment of eye, verbal and motor responses, scored from 3 to 15. Document components and change, not only the total.' },
      { term: 'C-spine control', definition: 'Protection of the cervical spine by limiting movement, including manual in-line stabilization during airway care as appropriate.' },
      { term: 'FAST', definition: 'Focused assessment with sonography for trauma: bedside ultrasound used to look for selected signs of bleeding; a negative result does not exclude all hemorrhage.' },
    ],
    options: [
      { optionId: 'A', why: 'FAST may inform hemorrhage assessment, but does not assess or secure a threatened airway.' },
      { optionId: 'B', why: 'This addresses a potentially immediate threat to oxygen delivery while reducing avoidable spinal movement.' },
      { optionId: 'C', why: 'Pelvic imaging may be indicated, but obtaining an image is not the first response to an unassessed airway in this presentation.' },
      { optionId: 'D', why: 'CT head helps identify intracranial injury after initial stabilization; transfer to imaging must not delay essential airway support.' },
    ],
    takeaway: 'Treat immediate life threats during the primary survey; diagnostic imaging follows or accompanies stabilization when safe.',
    caveat: 'The stem is sparse and names no catastrophic external hemorrhage. Modern trauma sequences commonly use <C>ABCDE: immediately control catastrophic bleeding when present, then airway with spinal protection. “Airway first” is therefore not an unconditional rule for every trauma patient.',
    references: [traumaReference, spinalReference],
  },
  'b7561b97-5f1f-4adc-a311-559b4e4ffd10': {
    brief: 'RASS +3 signals substantial agitation, but does not identify its cause. Assess pain and reversible physiologic causes, use an agreed sedation target, and consider awakening/breathing trials when safety criteria are met.',
    reasoning: [
      'An intubated patient may be agitated because of pain, hypoxemia, ventilator dyssynchrony, delirium, retention, withdrawal or another problem. Increasing sedative medication before checking can mask the warning without treating its cause.',
      'An analgesia-first, assessment-driven plan treats pain and targets an agreed level of arousal rather than immobility alone. RASS tracks arousal/agitation; use an appropriate pain assessment as well. Light sedation is generally preferred when clinically suitable, with individualized exceptions.',
      'Spontaneous awakening and breathing trials are paired parts of liberation planning. They require a safety screen and coordination with the team; this option does not mean abruptly stopping all infusions or trialling an unstable patient.',
    ],
    terms: [
      { term: 'RASS', definition: 'Richmond Agitation–Sedation Scale, from +4 (combative) to −5 (unarousable). +3 denotes very agitated behavior.' },
      { term: 'SAT / SBT', definition: 'Spontaneous awakening trial / spontaneous breathing trial: supervised assessments of readiness for less sedation and less ventilator support.' },
    ],
    options: [
      { optionId: 'A', why: 'Neuromuscular blockade does not provide analgesia or amnesia and can hide agitation. It is reserved for specific indications with adequate analgesia, sedation and monitoring.' },
      { optionId: 'B', why: 'Increasing a benzodiazepine without assessment can deepen sedation while leaving pain or physiologic deterioration unrecognized.' },
      { optionId: 'C', why: 'This combines cause assessment, pain treatment, an explicit arousal target and screened liberation planning.' },
      { optionId: 'D', why: 'Removing analgesia can worsen untreated pain; propofol is a sedative and does not replace analgesia.' },
    ],
    takeaway: 'Assess why the patient is agitated, treat pain, then titrate an individualized sedation plan and reassess.',
    caveat: 'RASS is an assessment tool, not a treatment order. Sedative choice, depth, and trial eligibility depend on the indication and current condition.',
    references: [padisReference, liberationReference, padisUpdateReference],
  },
  'rr-draft-resp-1': {
    brief: 'The rising rate and loss of speech tolerance show increased respiratory burden despite SpO₂ 96%. Assess effort and trajectory rather than letting one reassuring number dismiss the change.',
    reasoning: [
      'Compare the patient with their earlier state: rate nearly doubled and they can speak only a few words. Those functional changes support prompt assessment and an appropriate response.',
      'SpO₂ estimates hemoglobin oxygen saturation; it does not directly measure breath volume, CO₂ removal or the effort required to breathe. A saturation that looks acceptable can coexist with developing respiratory fatigue.',
    ],
    terms: [{ term: 'Work of breathing', definition: 'The effort required to move air, assessed through the breathing pattern, accessory-muscle use, speech and other findings.' }],
    options: [
      { optionId: 'A', why: 'A few words per breath is reduced speech tolerance in this context, not evidence that urgent assessment can be deferred.' },
      { optionId: 'B', why: 'This combines the trend and functional change instead of allowing saturation alone to overrule the bedside assessment.' },
      { optionId: 'C', why: 'Saturation does not establish that ventilation, effort and endurance are adequate.' },
    ],
    takeaway: 'Judge breathing using effort, rate, function and change alongside saturation.',
    references: [oximetryReference, deteriorationReference],
  },
  'rr-draft-resp-2': {
    brief: 'Verify the poor-quality reading promptly while assessing the breathless patient. A possible measurement problem and a real clinical problem can occur together.',
    reasoning: [
      'A cold hand and weak signal reduce confidence in the displayed value. Check probe placement, perfusion and signal quality using the device guidance, and obtain a reliable repeat measurement.',
      'The patient is also more breathless, which remains clinically relevant whatever the device shows. Observe breathing, alertness and other vital signs and respond to the overall condition while verifying the number.',
    ],
    terms: [{ term: 'Measurement artifact', definition: 'A reading distorted by the measurement process rather than accurately representing the underlying physiology.' }],
    options: [
      { optionId: 'A', why: 'This checks both independent concerns: measurement reliability and the patient’s changed symptoms.' },
      { optionId: 'B', why: 'Dismissing symptoms because the probe is unreliable creates a second unsupported assumption.' },
      { optionId: 'C', why: 'Treating a poor-quality value as exact can misdirect decisions; verify it without overlooking the patient.' },
    ],
    takeaway: 'Question the measurement and assess the patient at the same time.',
    references: [oximetryReference],
  },
  'rr-draft-resp-3': {
    brief: 'New drowsiness and slower breathing raise a ventilation concern even when oxygen maintains SpO₂. Communicate the change and support level urgently.',
    reasoning: [
      'Oxygenation and ventilation are related but different. Supplemental oxygen may sustain saturation while ventilation falls and CO₂ rises, so a saturation-only handover can conceal the deterioration.',
      'Describe the new alertness, rate and depth/pattern of breathing, timing and oxygen device/flow. Request urgent bedside assessment; use available monitoring and emergency support within your role rather than waiting for desaturation.',
    ],
    terms: [{ term: 'Ventilation', definition: 'Movement of air into and out of the lungs; effective alveolar ventilation is needed to remove CO₂.' }],
    options: [
      { optionId: 'A', why: 'The saturation alone omits the signs most relevant to possible ventilatory deterioration.' },
      { optionId: 'B', why: 'Waiting for desaturation can delay a response while oxygen masks an early warning.' },
      { optionId: 'C', why: 'The change, oxygen support and clear request give the receiving team an actionable picture.' },
    ],
    takeaway: 'A maintained saturation does not rule out declining ventilation.',
    caveat: 'These observations do not identify one cause; medication effects, neurologic change and other explanations still require assessment.',
    references: [opioidReference, deteriorationReference],
  },
  'rr-draft-resp-4': {
    brief: 'Improved saturation is only part of the response. Persistent increased effort means the patient still needs a wider reassessment against the agreed goals.',
    reasoning: [
      'A monitor can improve because oxygen support increased while the underlying respiratory burden persists. Compare what support is required as well as the number achieved.',
      'Reassess rate, effort, alertness, symptoms and trajectory with the team’s plan. Report what improved and what remains concerning so the next decision reflects the whole response.',
    ],
    options: [
      { optionId: 'A', why: 'Receiving treatment does not establish that its intended effect occurred or that the cause resolved.' },
      { optionId: 'B', why: 'This checks multiple response measures and the support needed to achieve them.' },
      { optionId: 'C', why: 'Saturation alone misses ongoing effort, symptoms and possible fatigue.' },
    ],
    takeaway: 'Evaluate the patient’s response, including remaining distress and the support required.',
    references: [ventilationReference, deteriorationReference],
  },
  'rr-draft-critical-1': {
    brief: 'Sudden airway symptoms and lightheadedness during an infusion require an emergency response. Absence of a rash does not exclude anaphylaxis.',
    reasoning: [
      'The shared timing matters: noisy breathing, difficulty speaking and lightheadedness began during an exposure. That combination raises a possible systemic reaction with airway or circulatory involvement.',
      'Activate the local emergency pathway and assess/support immediate life threats within your role. Communicate the exposure and onset; do not wait for skin changes to make the deterioration count.',
    ],
    options: [
      { optionId: 'A', why: 'Severe anaphylaxis can occur without visible skin findings; lack of rash cannot safely rule it out.' },
      { optionId: 'B', why: 'Separating symptoms loses the common timing and possible systemic pattern.' },
      { optionId: 'C', why: 'This prioritizes the observed life threats while retaining an appropriate possible explanation.' },
    ],
    takeaway: 'Use the acute airway, breathing and circulation pattern rather than requiring a rash.',
    references: [anaphylaxisReference, allergyReference],
  },
  'rr-draft-critical-2': {
    brief: 'Difficulty rousing and slower breathing after a procedure are new clinical changes to assess promptly. Medication effects are possible, but should not be assumed without evidence.',
    reasoning: [
      'Compare the new state with the previously alert baseline. The combination of reduced arousal and slower breathing can signal inadequate ventilation and deserves attention even after a procedure.',
      'Review recent medicines, timing and relevant physiologic findings with the response team while assessing airway and breathing. Keep alternatives open; an urgent response does not require a confirmed diagnosis.',
    ],
    options: [
      { optionId: 'A', why: 'Naming a definite drug cause before assessment risks anchoring and overlooking other causes.' },
      { optionId: 'B', why: 'This identifies the observed deterioration and treats medication effects as a possibility to evaluate.' },
      { optionId: 'C', why: 'Expected postoperative sleepiness does not establish that this degree of reduced arousal and breathing change is safe.' },
    ],
    takeaway: 'Act on the change while testing, rather than assuming, its explanation.',
    references: [opioidReference, padisReference],
  },
  'rr-draft-critical-3': {
    brief: 'Name the person responsible and confirm the call was made and received. Colleagues arriving does not prove that escalation occurred.',
    reasoning: [
      'The failure is an unassigned task: each colleague thinks the other completed it. Repeating an open request can preserve the same ambiguity.',
      'Use closed-loop communication: identify the colleague, state the action, hear their acknowledgement and confirm completion. A check-back makes shared responsibility observable instead of assumed.',
    ],
    terms: [{ term: 'Closed-loop communication', definition: 'The sender makes a clear request, the recipient confirms it, and the sender verifies the message/action was understood and completed.' }],
    options: [
      { optionId: 'A', why: 'A named owner and confirmation directly address the missing escalation.' },
      { optionId: 'B', why: '“Someone” leaves responsibility open and may not change what happens.' },
      { optionId: 'C', why: 'Physical presence is different from acknowledgement by the response team.' },
    ],
    takeaway: 'Assign, acknowledge and verify time-critical actions.',
    references: [communicationReference],
  },
  'rr-draft-critical-4': {
    brief: 'A new noisy airway and increasing distress take priority over paperwork. Arrange urgent bedside help and delegate other tasks.',
    reasoning: [
      'Noisy breathing can indicate airway narrowing; the increasing distress makes the current clinical change time-sensitive. The priority is immediate assessment and support, rather than completing a transfer process first.',
      'Delegate administrative work and coordinate help so the patient remains supported. Destination planning can continue in parallel, but it does not replace reassessment of a potentially threatened airway.',
    ],
    options: [
      { optionId: 'A', why: 'Completing the form first would delay attention to the immediate clinical concern.' },
      { optionId: 'B', why: 'A destination decision alone does not assess or support the patient’s airway now.' },
      { optionId: 'C', why: 'This prioritizes bedside support while allowing nonurgent work to be delegated.' },
    ],
    takeaway: 'Organize the workflow around the immediate life threat, with other work delegated.',
    references: [anaphylaxisReference, communicationReference],
  },
}

export function getPracticeExplanation(id?: string): PracticeExplanation | undefined {
  return id ? practiceExplanations[id] : undefined
}
