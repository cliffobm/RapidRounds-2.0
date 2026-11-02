import type { EvolvingQuestion } from './evolving-types'

type Choice = [text: string, explanation: string]
type Rewrite = {
  prompt: string
  options: [Choice, Choice, Choice, Choice]
  debrief: string
}
// Original replacement decisions. These are editorial drafts, not calibrated assessments.
// The first authored alternative is keyed; deterministic rotation balances presentation.
const rewrites: Record<string, Rewrite> = {
  'irregular-pulse/arrival': {
    prompt:
      'Which interpretation best explains why Priya’s rapid rhythm requires an immediate hemodynamic response?',
    options: [
      [
        'The abrupt rhythm change accompanies new cerebral and myocardial hypoperfusion.',
        'New confusion, chest pressure and a large pressure fall show clinically important perfusion compromise. The team must assess whether the tachyarrhythmia is causing the instability while supporting circulation, rather than treating the monitor rate in isolation.',
      ],
      [
        'The irregularity establishes atrial fibrillation as the cause of every abnormal observation.',
        'The rhythm is a plausible contributor, but irregularity does not establish causation or exclude another precipitant. The immediate urgency is supported by the new perfusion changes, with cause assessed by the responding team.',
      ],
      [
        'The borderline saturation makes a primary oxygenation problem the leading immediate explanation.',
        'Oxygenation deserves support, but a saturation of 93% does not account for the whole sudden circulatory pattern. The pressure decline and cognitive and chest symptoms require hemodynamic assessment in parallel.',
      ],
      [
        'The high rate establishes low output even if the pressure and cognition were unchanged.',
        'Rate can reduce filling and output, but its clinical effect depends on the patient. The actual new hypotension and organ symptoms distinguish this presentation from a tolerated rapid rhythm.',
      ],
    ],
    debrief:
      'Connect rhythm, timing and patient effect. Hemodynamic instability is established by the current perfusion pattern, while the causal contribution of the rhythm still requires the team’s assessment.',
  },
  'irregular-pulse/response': {
    prompt:
      'With shock attributed to AF and a confirmed pulse, which electrical-treatment preparation best balances urgency and safety?',
    options: [
      [
        'Prepare synchronized cardioversion with airway support and sedation when feasible without delay.',
        'A pulse and an organized tachyarrhythmia favor synchronized cardioversion when the team attributes instability to the rhythm. Prepare monitoring and airway support; procedural sedation is considered when feasible without delaying treatment of ongoing shock.',
      ],
      [
        'Prepare intravenous rate control and use its response to decide whether electrical treatment is needed.',
        'Rate-control medicines may be appropriate in other contexts, but this patient has ongoing shock attributed to the arrhythmia. A trial-first plan risks delaying the urgent team-directed electrical intervention.',
      ],
      [
        'Prepare an unsynchronized shock because irregular R–R intervals prevent reliable synchronization.',
        'Irregular timing does not by itself make AF a pulseless shockable rhythm or remove the usual role of synchronization. The team should verify synchronization to ventricular complexes rather than infer that irregularity requires an unsynchronized strategy.',
      ],
      [
        'Prepare anticoagulation assessment and clarify onset before proceeding with rhythm intervention.',
        'Onset and anticoagulation are important, but they should not delay urgent cardioversion for instability. The team addresses thromboembolic risk alongside and after stabilization rather than making a settled history a prerequisite.',
      ],
    ],
    debrief:
      'Choose the electrical strategy from pulse status, rhythm and hemodynamic effect. A history question that matters after stabilization should not become a barrier to treating shock.',
  },
  'irregular-pulse/reassessment': {
    prompt:
      'Priya’s capnography waveform is present but CO₂ is rising after procedural medication. Which reassessment should lead despite improved pressure and saturation?',
    options: [
      [
        'Assess airway patency, ventilation and arousability, with prompt support for inadequate breathing.',
        'Shallow bradypnea, reduced arousability and rising exhaled CO₂ support impaired ventilation after procedural medication. Supplemental oxygen can preserve saturation during hypoventilation; the team should reassess and support breathing rather than use oxygenation as a ventilation endpoint.',
      ],
      [
        'Assess recurrent atrial fibrillation as the main cause of drowsiness and repeat the rhythm strip first.',
        'Rhythm recurrence remains a monitoring concern, but the present regular pulse, improved pressure and direct ventilatory cues make breathing assessment the immediate priority. A tracing does not assess ventilation.',
      ],
      [
        'Assess embolic neurological injury first and use preserved saturation to defer ventilatory support.',
        'A neurological complication is a possible concern if altered consciousness persists or focal findings appear. Here shallow breathing and rising CO₂ already require assessment and support; a normal saturation does not make that step deferrable.',
      ],
      [
        'Assess postprocedure atelectasis and titrate oxygen until the patient becomes easier to arouse.',
        'Atelectasis can affect oxygenation, but more oxygen does not correct inadequate ventilation. The rate, depth, CO₂ trend and arousability should guide the urgent response rather than an oxygen-only strategy.',
      ],
    ],
    debrief:
      'A successful rhythm intervention can introduce a new risk. Evaluate ventilation separately from oxygenation, and reassess other causes of reduced consciousness if the response does not fit the expected recovery.',
  },
  'irregular-pulse/handover': {
    prompt:
      'Which handover priority best addresses risk after cardioversion when Priya now gives an uncertain onset history?',
    options: [
      [
        'Communicate the instability and intervention, uncertain onset and verified anticoagulant exposure for a continuing risk plan.',
        'The uncertain duration affects the post-cardioversion assessment even though urgent instability justified prompt treatment. Preserve the trajectory, recovery and actual anticoagulant history so the team can plan monitoring and individualized thromboembolic management.',
      ],
      [
        'Communicate the apparent recent onset and ask the next team to reassess stroke risk if AF recurs.',
        'The new account makes the onset uncertain now. Deferring the risk assessment until recurrence overweights the original onset estimate and the current sinus rhythm.',
      ],
      [
        'Communicate the successful conversion and prioritize rate-control adjustment before revisiting the onset discrepancy.',
        'Rate and recurrence prevention matter, but they do not settle the unresolved duration and anticoagulation questions. The handover should preserve these risks rather than sequence them after a routine medication adjustment.',
      ],
      [
        'Communicate a presumptive prolonged episode and request an anticoagulant regimen before checking the medication history.',
        'A prolonged episode is possible but not established. The clinician needs the actual exposure, timing and patient risks before selecting an individualized regimen; a handover should state the uncertainty instead of converting it to a fact.',
      ],
    ],
    debrief:
      'After rescue treatment, preserve information that changes the next decision. Sinus rhythm and a better pressure do not resolve uncertain AF duration or determine the anticoagulation plan.',
  },
  'wide-complex-collapse/pulse-present': {
    prompt:
      'For a regular broad-complex rhythm with a pulse, shock and impaired alertness, which preparation best fits the current state?',
    options: [
      [
        'Prepare team-directed synchronized cardioversion with support for airway and circulation.',
        'The patient has a pulse but marked hemodynamic instability associated with a regular broad-complex tachycardia. Urgent synchronized cardioversion and supportive care fit this state; reassess continuously because losing the pulse changes the pathway.',
      ],
      [
        'Prepare an antiarrhythmic infusion and use the first infusion response to determine cardioversion timing.',
        'A medicine-first strategy can be appropriate in selected stable presentations. It should not delay the responding team’s electrical treatment of current shock attributed to the tachyarrhythmia.',
      ],
      [
        'Prepare unsynchronized defibrillation because broad QRS complexes identify a shockable arrest rhythm.',
        'Broad-complex morphology does not establish cardiac arrest. The confirmed pulse and organized regular rhythm change the electrical strategy compared with pulseless VT.',
      ],
      [
        'Prepare a diagnostic supraventricular-rhythm pathway before choosing the electrical strategy.',
        'An uncertain rhythm origin does not remove the current instability. Detailed differentiation should not postpone the team-led treatment of a profoundly hypotensive patient with a broad-complex tachyarrhythmia.',
      ],
    ],
    debrief:
      'A broad-complex rhythm is not a complete treatment decision. Combine rhythm regularity with pulse and perfusion, then be ready to change the pathway if the patient changes.',
  },
  'wide-complex-collapse/pulse-lost': {
    prompt:
      'What must change when Noah loses a definite pulse and normal breathing while the broad-complex rhythm persists?',
    options: [
      [
        'Start CPR and prepare prompt unsynchronized defibrillation through the arrest pathway.',
        'The bedside change establishes cardiac arrest with a shockable rhythm in this context. Begin high-quality CPR and prompt defibrillation under the team or AED pathway, minimizing interruptions rather than retaining the with-a-pulse strategy.',
      ],
      [
        'Continue the synchronized cardioversion sequence while another responder obtains arterial pressure.',
        'The loss of pulse changes the pathway before an additional pressure measurement is needed. Waiting for synchronization or a pressure confirmation can delay compressions and defibrillation.',
      ],
      [
        'Begin CPR and retain synchronization because the rhythm remains organized and broad-complex.',
        'Compressions are appropriate, but synchronization is not the usual shock strategy for pulseless VT. Organized-looking broad-complex activity can still be a shockable arrest rhythm when circulation is absent.',
      ],
      [
        'Begin ventilatory support and give the prepared antiarrhythmic before the first shock.',
        'Ventilation and medicines contribute to resuscitation, but they should not displace prompt CPR and defibrillation of a shockable arrest. The sequence must address absent circulation immediately.',
      ],
    ],
    debrief:
      'The decisive change is clinical, not a new tracing label. Reclassify the rhythm’s treatment context as soon as pulse and normal breathing are lost.',
  },
  'wide-complex-collapse/after-shock': {
    prompt:
      'Without signs of returned circulation immediately after defibrillation, which sequence best preserves perfusion?',
    options: [
      [
        'Resume high-quality CPR promptly, with rhythm and pulse reassessment at the team-directed interval.',
        'Defibrillation does not guarantee immediate effective circulation. Prompt compressions support perfusion while the team follows the arrest sequence, keeping reassessment pauses brief and responding to convincing signs of return if they appear.',
      ],
      [
        'Inspect the postshock tracing first and check the pulse if it appears organized before resuming compressions.',
        'A tracing can improve without a pulse, and an immediate check-first sequence can prolong the interruption. Without signs of return, resume CPR promptly and use the appropriate scheduled reassessment.',
      ],
      [
        'Repeat the shock immediately because no purposeful movement is apparent after the first one.',
        'Absence of immediate movement does not establish the current rhythm or justify a routine stacked-shock sequence. Resume the team-directed CPR cycle rather than substitute repeated shocks for perfusion support.',
      ],
      [
        'Complete the next medicine administration before restarting compressions to prevent another interruption.',
        'Coordinating medicines is useful, but compressions should not wait for the administration task. The team should organize those tasks around maintaining high-quality CPR.',
      ],
    ],
    debrief:
      'Evaluate shock delivery as an intervention, not an outcome. Maintain perfusion during the interval in which electrical recovery may not yet produce effective mechanical output.',
  },
  'wide-complex-collapse/organized-rhythm': {
    prompt:
      'Which pathway fits an organized 72/min tracing when Noah still has no definite pulse or normal breathing?',
    options: [
      [
        'Continue CPR and the nonshockable-arrest pathway while the team seeks reversible causes.',
        'An organized rhythm without a definite pulse is PEA in this context. High-quality CPR and the team-directed nonshockable pathway remain necessary; electrical organization alone is not evidence that circulation has returned.',
      ],
      [
        'Pause compressions to obtain a cuff pressure because the organized rate suggests circulation has returned.',
        'The absent definite pulse and lack of normal breathing do not support delaying CPR for a cuff reading. Additional evidence can assist the team without creating a prolonged perfusion interruption.',
      ],
      [
        'Prepare another defibrillation because the preceding rhythm was pulseless ventricular tachycardia.',
        'The current rhythm determines the shock decision. A previously shockable rhythm does not make organized pulseless electrical activity shockable now.',
      ],
      [
        'Prepare synchronized cardioversion because the rhythm has become organized after the shock.',
        'Synchronization is not a substitute for circulation in an organized pulseless state, and this is not an unstable tachyarrhythmia with a pulse. Continue the current arrest assessment and treatment pathway.',
      ],
    ],
    debrief:
      'Use the current rhythm and current pulse together. Neither a previous shockable rhythm nor a normal-looking rate determines whether the next shock is appropriate.',
  },
  'slowing-conduction/faint': {
    prompt:
      'Which interpretation best links Helen’s AV dissociation to the urgency of her present symptoms?',
    options: [
      [
        'The slow ventricular output is accompanied by cerebral and systemic hypoperfusion.',
        'Syncope, recurrent dizziness and hypotension accompany a ventricular rate of 32/min despite faster atrial activity. These findings support an unstable bradycardia response rather than judging safety from atrial activity or temporary wakefulness.',
      ],
      [
        'Recovery of consciousness suggests the escape rhythm is adequate for continued observation.',
        'Brief recovery does not establish adequate sustained output while hypotension and dizziness persist. The trajectory remains concerning despite the patient being awake again.',
      ],
      [
        'The atrial rate is the most useful guide to output because it reflects the upstream pacemaker.',
        'With AV dissociation, atrial activity is not reliably conducting to ventricular contractions. The ventricular pulse and its perfusion consequences determine the immediate concern.',
      ],
      [
        'The faint is most likely postural and should be reassessed by standing the patient.',
        'Postural symptoms can have several causes, but the current profound bradycardia and hypotension make provocation inappropriate before stabilization. Evaluate the existing evidence of poor perfusion instead.',
      ],
    ],
    debrief:
      'Interpret a conduction disorder by the ventricular response and patient effect. Transient improvement in consciousness does not establish stable perfusion.',
  },
  'slowing-conduction/prepare-support': {
    prompt:
      'With complete AV block and worsening perfusion despite initial medication, which preparation best supports rescue treatment?',
    options: [
      [
        'Bring pacing-capable equipment and prepare monitoring and support for the team’s urgent pacing plan.',
        'Persistent hypoperfusion despite initial treatment can require temporary pacing and other clinician-directed support. Equipment readiness and prompt expert involvement address the failing ventricular rate without waiting for definitive device planning.',
      ],
      [
        'Prepare another medication cycle before bringing pacing equipment to avoid premature electrical treatment.',
        'Further medicines may be part of a clinician’s plan, but worsening perfusion makes delayed pacing readiness unsafe. Preparing rescue equipment can occur while the team considers additional treatment.',
      ],
      [
        'Arrange permanent-device referral and use that plan to determine when temporary support is needed.',
        'Definitive device assessment is important, but it does not replace stabilization of the current shock. Temporary support decisions must be based on the present deterioration.',
      ],
      [
        'Prepare cardioversion to restore atrioventricular coordination before considering pacing.',
        'Cardioversion does not correct this slow ventricular escape from complete AV block. The immediate electrical support goal is an adequate ventricular rate and perfusion.',
      ],
    ],
    debrief:
      'Anticipate the next support need when initial treatment fails. Preparing temporary rescue measures should not depend on completion of a definitive device pathway.',
  },
  'slowing-conduction/capture': {
    prompt:
      'Which assessment best distinguishes useful pacing from monitor or skeletal-muscle effects while Helen remains pale?',
    options: [
      [
        'Confirm mechanical capture with a matching pulse, pressure and perfusion response to the paced complexes.',
        'Pacing markers and apparent electrical capture do not prove effective ventricular output. Concordant pulse and hemodynamic assessment, with additional monitoring when available, establishes whether the electrical intervention is improving circulation.',
      ],
      [
        'Use consistent pacing markers followed by QRS complexes to confirm that the circulation is restored.',
        'Those findings support electrical capture, but mechanical capture still requires patient and hemodynamic confirmation. An electrical endpoint does not settle the reason for continuing pallor.',
      ],
      [
        'Use palpable chest-wall movement at the pacing rate as confirmation of cardiac output.',
        'Transcutaneous pacing can stimulate skeletal muscle, producing movement that is not a ventricular pulse. The team must distinguish that artifact from mechanical circulation.',
      ],
      [
        'Use improved arousability after pain stimulation as confirmation that the current pacing output is adequate.',
        'Arousal is clinically useful but can change with stimulation or discomfort. It should be interpreted with pulse, pressure and perfusion rather than substitute for confirmation of mechanical capture.',
      ],
    ],
    debrief:
      'Evaluate the mechanism the treatment is meant to restore. Electrical capture is intermediate evidence; useful perfusion requires concordant mechanical and clinical findings.',
  },
  'slowing-conduction/ongoing-risk': {
    prompt:
      'Which plan best evaluates whether Helen’s improvement is durable while temporary pacing remains necessary?',
    options: [
      [
        'Continue capture and perfusion surveillance while reviewing reversible contributors and the specialist support plan.',
        'The rate and pressure improved under temporary support, not necessarily because conduction recovered. Ongoing capture checks and review of medicines, ischemia and electrolytes help the team manage recurrence or support failure and plan definitive care.',
      ],
      [
        'Use the improved pressure to taper capture checks while waiting for the specialist’s device decision.',
        'A pressure obtained during effective pacing does not show that capture will remain stable or that intrinsic conduction is adequate. Surveillance remains relevant during temporary support.',
      ],
      [
        'Use an unchanged atrial rhythm to support a trial off pacing before completing the cause assessment.',
        'Atrial activity does not establish reliable AV conduction or a safe intrinsic ventricular response. A trial-off decision requires the treating team’s monitored assessment, not inference from atrial stability.',
      ],
      [
        'Prioritize a permanent-device plan and defer reversible-cause review until after the device procedure.',
        'A device may be needed, but reversible contributors can change treatment and recurrence risk now. Definitive planning and cause assessment should be coordinated rather than treated as mutually exclusive.',
      ],
    ],
    debrief:
      'Distinguish supported improvement from resolution. Preserve surveillance of the treatment mechanism while investigating why it became necessary.',
  },
  'hidden-loss/drain-change': {
    prompt:
      'Which interpretation should lead the immediate response to Owen’s fresh drainage and rapidly changing perfusion?',
    options: [
      [
        'Escalate possible significant hemorrhage using the blood-loss trajectory and organ-perfusion findings together.',
        'The abrupt fresh loss, pressure fall and presyncope form a concerning hemorrhage pattern. Activate urgent surgical review and the local response while assessing ABCs and preserving the loss measurements; a definitive source need not be established first.',
      ],
      [
        'Prioritize residual anesthetic vasodilation and use the drain volume trend to decide whether bleeding review is needed.',
        'Anesthetic effects can contribute to hypotension, but the simultaneous fresh loss and symptoms already warrant urgent bleeding assessment. The team should not wait for an additional drain threshold to be crossed.',
      ],
      [
        'Prioritize a repeat blood count before deciding whether the drainage represents clinically significant loss.',
        'Blood tests inform treatment but can lag acute loss. The current physiological pattern is already sufficient to escalate while sampling proceeds in parallel.',
      ],
      [
        'Prioritize pain-related tachycardia and use analgesic response to determine whether the pressure fall is important.',
        'Pain may increase pulse, but fresh blood loss with a large pressure decline and faintness is not safely explained by pain alone. A symptom response should not become the gate to hemorrhage assessment.',
      ],
    ],
    debrief:
      'A source clue, a trend and the patient response strengthen each other. Escalate the converging pattern rather than requiring one laboratory or drain threshold to prove the concern.',
  },
  'hidden-loss/lab-lag': {
    prompt:
      'How should the early hemoglobin be weighed against Owen’s worsening pressure, restlessness and ongoing fresh loss?',
    options: [
      [
        'Continue urgent bleeding control and resuscitation assessment; the early concentration can understate acute loss.',
        'Acute hemorrhage can initially remove plasma and red cells together before equilibration. A nearly unchanged early hemoglobin cannot exclude important loss when perfusion and drainage are worsening; serial results supplement the bedside trajectory.',
      ],
      [
        'Use the near-baseline result to favor vasodilation and reassess hemorrhage after the next blood count.',
        'The early result has limited exclusionary power. Ongoing fresh loss and worsening perfusion require assessment now, even if vasodilation could also contribute.',
      ],
      [
        'Use the hemoglobin decline alone to select the resuscitation intensity because it directly measures lost volume.',
        'Hemoglobin is a concentration rather than a direct measurement of circulating-volume loss. Treatment intensity must incorporate current physiology, continued bleeding and the team’s evolving assessment.',
      ],
      [
        'Use the small fall to classify the drain loss as expected while investigating the restlessness separately.',
        'Expected postoperative drainage does not explain the whole worsening pattern. Separating restlessness from pressure and loss can obscure a shared perfusion mechanism.',
      ],
    ],
    debrief:
      'Interpret a test in its time and measurement context. An early concentration result should not override a changing patient whose circulating volume may be falling.',
  },
  'hidden-loss/drain-stops': {
    prompt:
      'Which interpretation best reconciles stopped drain output with Owen’s new distension and worsening shock?',
    options: [
      [
        'Internal blood loss may continue despite absent drain output, requiring urgent surgical reassessment.',
        'Drain obstruction or a change in where blood collects can stop visible output while blood loss continues internally. New distension and worsening perfusion argue against treating an empty container as proof of hemostasis.',
      ],
      [
        'The source has likely sealed, with the remaining hypotension reflecting the earlier volume deficit.',
        'An earlier deficit may contribute, but the new distension and deterioration do not support assuming the source has sealed. Current source control still needs urgent assessment.',
      ],
      [
        'The main problem is a blocked drain, so restoring drainage should precede review of the shock mechanism.',
        'A blockage is plausible, but patency is not the clinical endpoint and manipulation requires the surgical plan. Treating the device as the whole problem can delay assessment of ongoing hemorrhage and other complications.',
      ],
      [
        'The tense abdomen establishes a single compartment diagnosis that should replace the bleeding assessment.',
        'Distension and shock require urgent specialist evaluation, but they do not independently establish one mechanism. Pressure-related complications and continuing hemorrhage may coexist.',
      ],
    ],
    debrief:
      'Reconcile conflicting measurements by asking what each actually captures. A drain reports external collection, not the absence of internal loss or a definitive source-control outcome.',
  },
  'hidden-loss/handover-transfer': {
    prompt:
      'Which handover best explains Owen’s residual risk despite a temporary pressure improvement before source control?',
    options: [
      [
        'Describe the loss and perfusion trajectory, resuscitation response and unresolved source during transfer.',
        'The response to support may be temporary while bleeding control remains incomplete. Communicate measured loss, worst and current physiology, treatments, access and pending results so the receiving team can continue resuscitation and definitive care without losing the trajectory.',
      ],
      [
        'Describe the current pressure and classify the earlier abnormalities as corrected by the resuscitation.',
        'The current supported pressure does not establish durable perfusion or source control. That framing can make continuing tachycardia, cool skin and future deterioration seem unexpected or less urgent.',
      ],
      [
        'Describe the total drain volume and use the stopped output to indicate that active loss has ended.',
        'The drain trend matters, but stopped output does not establish hemostasis when distension and shock worsened. The handover must preserve the possibility of concealed ongoing loss.',
      ],
      [
        'Describe the planned procedure and treat further perfusion assessment as the receiving theatre team’s task.',
        'Definitive treatment planning does not remove transport risk. The receiving team needs the current support requirement and unresolved physiology before and during transfer, not only the destination and procedure.',
      ],
    ],
    debrief:
      'A handover should explain what improved, what support produced it and what remains untreated. A temporary response is different from resolution of hemorrhage.',
  },
  'potassium-warning/critical-result': {
    prompt:
      'Which interpretation best explains why Leon’s renal history and present ECG/perfusion changes require an urgent hyperkalemia response?',
    options: [
      [
        'The potassium result and changing conduction with poor perfusion indicate a current arrhythmic hazard.',
        'The severe potassium result is clinically concordant with slowing conduction and impaired perfusion in a patient with reduced elimination. Urgent team assessment, monitoring and treatment are needed rather than treating the result as a routine delayed-dialysis issue.',
      ],
      [
        'The delayed dialysis makes the potassium rise expected, so the next planned session determines urgency.',
        'An expected cause does not make the present physiological consequences safe. Conduction and perfusion changes alter the urgency independently of the routine dialysis schedule.',
      ],
      [
        'The pulse being present makes the conduction change a stable electrolyte finding for repeat testing first.',
        'A pulse does not establish a stable state. Severe hyperkalemia with current conduction and perfusion abnormalities requires urgent care while appropriate repeat sampling and treatment proceed.',
      ],
      [
        'The conduction pattern establishes an intrinsic block, so electrolyte treatment can follow pacing assessment.',
        'Intrinsic conduction disease may be considered, but a major reversible electrolyte abnormality must be addressed in parallel. The ECG cannot exclude hyperkalemic contribution or justify postponing its treatment.',
      ],
    ],
    debrief:
      'Distinguish an expected laboratory abnormality from a tolerated one. Current conduction and perfusion effects determine the urgency while the team addresses the cause.',
  },
  'potassium-warning/stabilize-and-remove': {
    prompt:
      'If the QRS improves after prescribed calcium, which interpretation should guide the remaining potassium plan?',
    options: [
      [
        'Calcium protects the heart while potassium lowering and definitive elimination remain necessary.',
        'Calcium can counter immediate electrophysiologic effects without lowering serum potassium. A better QRS is evidence of one treatment effect, not proof that the excess potassium has been shifted or removed; continue the team’s staged plan and monitoring.',
      ],
      [
        'The improved QRS establishes a sufficient potassium fall to defer further lowering until the next sample.',
        'Electrical improvement can precede a potassium change. The serum concentration and need for further treatment cannot be inferred from the calcium response alone.',
      ],
      [
        'Calcium has corrected the membrane problem, so elimination is relevant mainly if another ECG change appears.',
        'The underlying excess remains even when membrane effects improve. Waiting for another electrical manifestation ignores recurrence risk and the need for a definitive elimination plan.',
      ],
      [
        'The calcium response confirms potassium as the sole mechanism, allowing the other shock assessment to stop.',
        'A response supports a physiological contribution but does not establish a sole cause. Continue assessment of perfusion and other contributors while the electrolyte emergency is managed.',
      ],
    ],
    debrief:
      'Separate membrane protection, redistribution and elimination. Improvement in one endpoint does not demonstrate that the next treatment objective has already been achieved.',
  },
  'potassium-warning/second-risk': {
    prompt:
      'After the QRS narrows, which check should lead the reassessment of Leon’s new sweating and inattention after insulin/glucose?',
    options: [
      [
        'Check bedside glucose promptly while continuing cardiac and potassium surveillance.',
        'The timing and symptoms make treatment-associated hypoglycemia an immediately testable concern even though glucose accompanied insulin. Check and use the local treatment pathway while retaining assessment for recurrent hyperkalemia or another cause.',
      ],
      [
        'Repeat potassium first and use its result to decide whether the new cognitive change needs a glucose check.',
        'Recurrent hyperkalemia remains important, but a potassium sample does not assess a readily reversible insulin-associated risk. Glucose assessment should not depend on the potassium result.',
      ],
      [
        'Reassess blood pressure first and use an adequate reading to classify the sweating as a dialysis-related stress response.',
        'Pressure assessment is useful, but adequate pressure would not exclude hypoglycemia. The recent treatment and symptom pattern warrant a direct glucose measurement rather than reassurance from a different variable.',
      ],
      [
        'Use the earlier glucose administration to favor uremic symptoms and advance dialysis before glucose reassessment.',
        'Glucose given with insulin reduces but does not abolish later hypoglycemia. Uremia is a possible contributor, but it should not displace prompt testing of the new treatment-associated risk.',
      ],
    ],
    debrief:
      'Consider a new harm introduced by treatment while preserving surveillance of the original emergency. A response in the ECG does not explain every subsequent symptom.',
  },
  'potassium-warning/rebound': {
    prompt:
      'Before dialysis, which monitoring plan best accounts for a lower potassium, a narrower QRS and the earlier insulin exposure?',
    options: [
      [
        'Continue ECG, repeat potassium and glucose surveillance while the definitive elimination plan proceeds.',
        'A lower potassium after shifting treatment may not be durable before excess potassium is removed. Insulin-associated hypoglycemia may also occur after initial improvement, so the team should track both risks and preserve the treatment and sampling times.',
      ],
      [
        'Continue ECG and repeat potassium, with glucose checks ending once the first low glucose has been corrected.',
        'This preserves cardiac surveillance but closes the treatment-associated glucose assessment too soon. Correction of one low value does not establish that the insulin-related risk has ended.',
      ],
      [
        'Continue glucose surveillance, with repeat potassium guided by whether the QRS widens again.',
        'ECG appearance does not reliably track potassium concentration. Biochemical reassessment remains needed even when the tracing looks better.',
      ],
      [
        'Continue repeated potassium checks and reconsider dialysis if the next shifted value remains lower.',
        'A continuing lower value may be useful information, but redistribution is not definitive removal. Dialysis decisions need the renal team’s evaluation of elimination, recurrence risk and the wider clinical context rather than a single improved trend.',
      ],
    ],
    debrief:
      'Evaluate durability, not merely direction of change. Two treatment-related risks can run on different timelines, and each requires the monitoring appropriate to its mechanism.',
  },
  'breathless-infection/new-confusion': {
    prompt:
      'Which comparison most strongly challenges a conclusion of respiratory stability from Mei’s similar saturation?',
    options: [
      [
        'Similar saturation now requires more oxygen and accompanies worsening breathing, pressure and attention.',
        'A supported value is not equivalent to the same value on room air. Increased support, tachypnea, a pressure fall and new inattention converge on deterioration even though the displayed saturation has changed little.',
      ],
      [
        'The saturation remains near the earlier value, so the oxygen change mainly reflects precautionary support.',
        'That interpretation discounts the increased work of breathing and other organ trends. The higher support is part of the clinical comparison, not evidence that the original condition is unchanged.',
      ],
      [
        'The lower pressure should lead assessment independently because it can explain the confusion without a respiratory change.',
        'Perfusion may contribute, but the oxygen and respiratory trajectory is also abnormal. Separating the systems would miss the evidence for a combined deterioration pattern.',
      ],
      [
        'The family’s report should be reassessed after fever treatment before it alters the observed baseline.',
        'Collateral information provides a recent baseline for attention and function. Fever treatment may help symptoms, but it should not delay incorporating a meaningful new cognitive change into the assessment.',
      ],
    ],
    debrief:
      'Compare the value, support and patient function together. A familiar display can conceal worsening reserve when increasing treatment is required to maintain it.',
  },
  'breathless-infection/hypoperfusion': {
    prompt:
      'Which coordinated plan best supports high-risk sepsis treatment while accounting for Mei’s heart failure and changing oxygen need?',
    options: [
      [
        'Support urgent prescribed antimicrobials and reassessed resuscitation, collecting indicated samples without substantial delay.',
        'The current shock and organ findings require prompt treatment, while heart failure and respiratory changes demand ongoing assessment of volume response and tolerance. Sampling and source evaluation should proceed without becoming a barrier to urgent prescribed care.',
      ],
      [
        'Prioritize pretreatment cultures and let successful sampling determine when the first antimicrobial can start.',
        'Cultures are ideally collected promptly before therapy, but unsuccessful sampling should not create a substantial delay in a high-risk emergency. Treatment and investigation must be coordinated in context.',
      ],
      [
        'Prioritize a fixed fluid sequence and use lactate normalization to decide when reassessment is necessary.',
        'Lactate does not directly measure volume need or tolerance. Changing oxygen requirements and heart failure require reassessment during treatment rather than after completion of a fixed sequence.',
      ],
      [
        'Prioritize fluid restriction because the heart-failure diagnosis makes circulatory fluid treatment inappropriate.',
        'Heart failure increases intolerance risk but does not independently settle the treatment of current hypoperfusion. The team must individualize resuscitation using the current patient and response, rather than a blanket restriction.',
      ],
    ],
    debrief:
      'Coordinate urgent treatment with continuous reassessment. A comorbidity changes the information needed for a plan; it does not automatically dictate that every resuscitation component be given or withheld.',
  },
  'breathless-infection/fluid-tolerance': {
    prompt:
      'Which response best evaluates the value and cost of further volume when pressure rises slightly but respiratory function worsens?',
    options: [
      [
        'Request immediate ABC and fluid-tolerance reassessment before the next volume decision.',
        'A modest pressure response does not establish an acceptable overall response. New crackles, greater work and worsening oxygenation require immediate support and review of the infusion under local policy, with a revised hemodynamic and respiratory plan.',
      ],
      [
        'Use the pressure rise as evidence of responsiveness and complete the next bolus before comparing oxygen needs.',
        'A pressure response can coexist with clinically important intolerance. Delaying comparison until another bolus is completed can add respiratory harm without establishing net benefit.',
      ],
      [
        'Use the existing pneumonia to explain the respiratory changes and keep the resuscitation target unchanged.',
        'Pneumonia remains relevant, but a new change during treatment requires reassessment for fluid intolerance and other contributors. An existing diagnosis should not absorb every new finding.',
      ],
      [
        'Use crackles to select active fluid removal before reviewing the continuing perfusion deficit.',
        'Congestion may require treatment, but crackles do not alone establish the next hemodynamic intervention. Hypotension and organ findings still need an integrated team assessment.',
      ],
    ],
    debrief:
      'Evaluate benefit and harm at the same time. The next intervention should follow the present whole-patient response rather than a single improving pressure value or an isolated congestion sign.',
  },
  'breathless-infection/support-needed': {
    prompt:
      'Which handover best represents Mei’s response when saturation improves on more support but cognition, breathing and urine output remain abnormal?',
    options: [
      [
        'Describe supported oxygen improvement with unresolved perfusion concerns and the response to each intervention.',
        'The oxygen value improved at a greater support level, while tachypnea, confusion, pressure and output remain concerning. Communicate both the response and the remaining deficits so critical care can evaluate the next support needs.',
      ],
      [
        'Describe a successful respiratory response and prioritize a later renal review for the remaining low output.',
        'This separates the output from concurrent confusion and hypotension and overstates recovery from a supported saturation. The unresolved pattern still warrants an integrated urgent assessment.',
      ],
      [
        'Describe fluid intolerance as the established explanation and prioritize decongestion over the original infection pathway.',
        'Fluid intolerance is a working concern, but infection and other hemodynamic contributors may coexist. A handover should preserve that uncertainty and the ongoing treatment rather than replace one unconfirmed sole cause with another.',
      ],
      [
        'Describe persistent sepsis using the lactate and fever, with the current oxygen requirement as secondary information.',
        'The oxygen support and its trajectory are material to current risk and treatment tolerance. A sepsis label or earlier markers cannot replace the current respiratory, cognitive and perfusion details.',
      ],
    ],
    debrief:
      'Report the support needed to achieve the value and the functions that have not recovered. A useful handover explains the next uncertainty rather than declaring success from one normalized measurement.',
  },
}

export function revisedResponseQuestion(
  caseId: string,
  stageId: string,
  position: number
): EvolvingQuestion {
  const row = rewrites[`${caseId}/${stageId}`]
  if (!row)
    throw new Error(`Missing revised response decision: ${caseId}/${stageId}`)
  const correct = (position + 1) % 4
  const options = row.options.map((_, index) => {
    const source = row.options[(index - correct + 4) % 4]!
    return { id: String(index), text: source[0], explanation: source[1] }
  })
  return {
    prompt: row.prompt,
    options,
    correct: [String(correct)],
    reflection: row.debrief,
  }
}
