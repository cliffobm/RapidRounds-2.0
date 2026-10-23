import type { UnifiedPracticeQuestion } from './practice-library'
import type { ReasoningLevel } from './evolving-types'
import type { PillarId } from './pillars'
import type { SourceId } from './sources'

// Original draft cases. Uploaded resources informed topic coverage, not question wording.
// Current evidence is linked through SourceId; local pathways and educator review still apply.
export const materialRevision = 'materials-2026-10-22.1'
export const materialCollections = [
  {
    id: 'medications-safety',
    title: 'Medication decisions',
    category: 'Pharmacology',
  },
  {
    id: 'renal-metabolic',
    title: 'Kidney & metabolic changes',
    category: 'Medical–surgical',
  },
  {
    id: 'assessment-safety',
    title: 'Assessment & safety',
    category: 'Fundamentals',
  },
  {
    id: 'person-centered-genetics',
    title: 'Genetics & shared decisions',
    category: 'Person-centered care',
  },
] as const

type Choice = [text: string, explanation: string]
function q(
  id: string,
  collection: number,
  level: ReasoningLevel,
  skill: PillarId,
  sources: SourceId[],
  context: string,
  prompt: string,
  options: [Choice, Choice, Choice, Choice],
  correct: number,
  reflection: string
): UnifiedPracticeQuestion {
  const topic = materialCollections[collection]!
  return {
    id: `material-${id}`,
    revision: materialRevision,
    context,
    prompt,
    options: options.map(([text, explanation], index) => ({
      id: String(index),
      text,
      explanation,
    })),
    correct: [String(correct)],
    reflection,
    collectionId: topic.id,
    collectionTitle: topic.title,
    category: topic.category,
    level,
    skill,
    sources,
    origin: 'authored',
  }
}

export const materialQuestions: UnifiedPracticeQuestion[] = [
  q(
    'med-history',
    0,
    'foundation',
    'recognize_cues',
    ['medicationSafety'],
    'Elena brings a hospital discharge list and a bag containing a sleep aid, herbal tablets and prescription bottles. She says the bag contains everything she currently takes.',
    'Which parts of Elena’s actual medicine use must be reconciled with the discharge list?',
    [
      [
        'Only medicines appearing on the discharge list',
        'A discharge list is one source to verify; it may omit nonprescription products or contain outdated instructions.',
      ],
      [
        'Every product she uses, with its purpose and actual schedule',
        'Prescription, nonprescription and complementary products can affect safety. Compare actual use with documented instructions and resolve discrepancies.',
      ],
      [
        'Prescription bottles, with the printed schedule accepted as current',
        'Bottles help verify products, but the printed instructions may differ from a recent change or actual use.',
      ],
      [
        'Products started during admission, with the home list reviewed later',
        'Recent additions matter, but an incomplete home history can conceal duplication or important omissions.',
      ],
    ],
    1,
    'Which additional source would you use to resolve an uncertain medication history?'
  ),
  q(
    'med-meal',
    0,
    'foundation',
    'take_action',
    ['insulinSafety'],
    'Sam is alert, with a bedside glucose of 116 mg/dL (6.4 mmol/L). Scheduled rapid-acting mealtime insulin has not been given. Breakfast is delayed, and he now reports nausea.',
    'How should delayed breakfast and nausea affect Sam’s pending mealtime insulin?',
    [
      [
        'Give it now because the scheduled time has arrived',
        'The clock does not confirm that carbohydrate intake is available; meal-related insulin requires coordination with intake and the order.',
      ],
      [
        'Cancel every insulin order until Sam eats normally',
        'Basal and mealtime insulin have different roles. The whole regimen should not be stopped without individualized review.',
      ],
      [
        'Replace breakfast with water and give the scheduled dose',
        'Water does not provide the carbohydrate expected with a mealtime dose.',
      ],
      [
        'Clarify the meal and insulin plan before dosing',
        'Coordinate the prescribed mealtime insulin with actual intake and current glucose. Follow the local pathway and seek clarification when the plan no longer fits.',
      ],
    ],
    3,
    'How would the decision differ for basal insulin, especially in type 1 diabetes?'
  ),
  q(
    'med-sedation',
    0,
    'foundation',
    'prioritize_hypotheses',
    ['opioidSafety', 'deterioration'],
    'Forty minutes after an opioid, Leon is difficult to wake. His respiratory rate is 7/min with shallow breaths. His partner says he was conversing normally before the dose.',
    'Which immediate threat is suggested by Leon’s new poor arousal and shallow breathing after the opioid?',
    [
      [
        'Possible opioid-related ventilatory impairment',
        'Reduced responsiveness and slow, shallow breathing require urgent airway and breathing assessment, assistance and the local emergency response.',
      ],
      [
        'Incomplete pain relief because the last pain score was high',
        'The earlier pain score does not outweigh the current threat to breathing. Further sedating medication requires urgent review.',
      ],
      [
        'Interrupted sleep caused by repeated nursing observations',
        'Difficulty waking with a respiratory rate of 7/min is not reassuring sleep.',
      ],
      [
        'A medication preference that can be explored at the next round',
        'Preferences matter, but immediate physiologic instability takes priority.',
      ],
    ],
    0,
    'Which changes in alertness and breathing would you communicate with the timing of the dose?'
  ),
  q(
    'med-allergy',
    0,
    'foundation',
    'analyze_cues',
    ['medicationSafety'],
    'A new antibiotic is due. The electronic allergy entry says only “antibiotic allergy.” Noor recalls throat swelling after an antibiotic several years ago but cannot remember its name.',
    'How should the uncertain antibiotic allergy and reported throat swelling affect administration of the new antibiotic?',
    [
      [
        'Assume all antibiotics are contraindicated and remove the order',
        'A vague record requires urgent clarification; it does not justify independently removing every antibiotic option.',
      ],
      [
        'Use a smaller unprescribed amount to assess tolerance',
        'An informal test dose is not a safe substitute for allergy assessment and an authorized treatment plan.',
      ],
      [
        'Pause and clarify the allergy and new antibiotic',
        'Possible airway involvement is clinically important. Verify the history, document details and resolve safety concerns before administration.',
      ],
      [
        'Give the dose because the old drug cannot be identified',
        'Missing information increases the need to verify; it does not establish safety.',
      ],
    ],
    2,
    'What details make an allergy record useful for the next clinician?'
  ),
  q(
    'med-teachback',
    0,
    'foundation',
    'evaluate_outcomes',
    ['medicationSafety', 'sharedDecisions'],
    'During discharge teaching, Grace nods while looking between two bottles with different instructions. She says, “I think I can manage.” Her medication plan was changed this morning.',
    'How can the nurse check whether Grace can use the changed medication instructions tomorrow?',
    [
      [
        'Ask her to read the handout silently and sign it',
        'A signature or silent reading does not demonstrate how the plan will be used at home.',
      ],
      [
        'Ask her to show how she will take the medicines tomorrow',
        'A respectful demonstration reveals practical misunderstandings and lets the nurse improve the explanation without testing or blaming the patient.',
      ],
      [
        'Ask whether the pharmacist already explained the changes',
        'Prior teaching does not establish present understanding of the final reconciled plan.',
      ],
      [
        'Repeat the same instructions more loudly',
        'Volume does not address confusing labels or a mismatch between instructions and daily routines.',
      ],
    ],
    1,
    'How would you phrase teach-back so it evaluates the explanation rather than the person?'
  ),
  q(
    'med-oxygen',
    0,
    'challenge',
    'analyze_cues',
    ['opioidSafety', 'oximetry'],
    'After an opioid and a sedating sleep medicine, Imani has a saturation of 97% while receiving oxygen. She repeatedly drifts off mid-sentence and breathes 8 times/min.',
    'How should the nurse interpret the apparently reassuring saturation?',
    [
      [
        'It rules out a clinically important medication effect',
        'Saturation measures oxygenation; it does not establish adequate ventilation or explain reduced responsiveness.',
      ],
      [
        'The sleep medicine is the sole cause, so the opioid is irrelevant',
        'Combined central nervous system depressants can increase risk. The findings do not identify one medicine as the only cause.',
      ],
      [
        'It makes a repeat pain score more urgent than breathing assessment',
        'The immediate risk is slow breathing and reduced alertness, regardless of the earlier pain score.',
      ],
      [
        'Supplemental oxygen can coexist with dangerous hypoventilation',
        'Assess ventilation, airway protection and alertness and activate urgent assistance. Do not use oxygen saturation alone to judge opioid safety.',
      ],
    ],
    3,
    'Which bedside observations add information that the saturation number cannot provide?'
  ),
  q(
    'med-renal',
    0,
    'challenge',
    'generate_solutions',
    ['aki', 'medicationSafety'],
    'Mara has vomiting, reduced urine output and a creatinine rise from 0.8 to 1.4 mg/dL in 36 hours. Her usual medicines include a renally cleared antibiotic. The next dose is due.',
    'How should the acute kidney trend change review of the medicine that is due?',
    [
      [
        'Renal trend, current order, exposure and drug guidance',
        'Acute changes can alter medication safety. Prompt prescriber/pharmacist review should use the actual trend and drug rather than an assumed routine schedule.',
      ],
      [
        'The admission medication list, because it was previously tolerated',
        'Previous tolerance does not establish safety during a new acute kidney injury.',
      ],
      [
        'The current creatinine alone, without the prior value or timing',
        'A single result can understate the importance of a rapid change and does not provide the full medication context.',
      ],
      [
        'A plan to discontinue all infection treatment until discharge',
        'The need to treat infection remains. An individualized review is needed rather than abandoning treatment.',
      ],
    ],
    0,
    'How would you communicate a time-sensitive medication question without independently prescribing a replacement?'
  ),
  q(
    'med-duplicate',
    0,
    'challenge',
    'recognize_cues',
    ['medicationSafety'],
    'Theo requests a cold remedy from home while receiving a hospital combination pain medicine. Both product labels list acetaminophen (paracetamol), but he considers them different because one is “for a cold.”',
    'What makes the two differently branded products unsafe to treat as separate medicines?',
    [
      [
        'The cold remedy was bought without a prescription',
        'Nonprescription status does not mean risk-free; the active ingredients and total exposure determine the duplication concern.',
      ],
      [
        'He has used the cold remedy before without noticing a problem',
        'Past use does not address the new overlap with a hospital product.',
      ],
      [
        'The same active ingredient appears in both products',
        'Different brand names and indications can conceal duplicate exposure. Reconcile ingredients and seek review before adding the home product.',
      ],
      [
        'The products are supplied in different dosage forms',
        'A liquid and a tablet may still contain the same active ingredient and contribute to cumulative exposure.',
      ],
    ],
    2,
    'What would you ask about all products taken before admission and during this shift?'
  ),
  q(
    'med-bleed',
    0,
    'challenge',
    'prioritize_hypotheses',
    ['medicationSafety', 'deterioration'],
    'An anticoagulated patient, Jo, reports new dizziness and passes black, tarry stool. Her pulse is 116/min, up from 82. A routine anticoagulant dose is due soon.',
    'How should the new possible bleeding change assessment and handling of the due dose?',
    [
      [
        'Give the routine dose and mention the stool at handover',
        'Possible active bleeding and a rising pulse require a timely assessment and medication decision, not a delayed handover note.',
      ],
      [
        'Assess possible bleeding urgently and clarify the due dose',
        'New melena and physiologic change require assessment of stability and urgent prescriber review; follow the local bleeding and medication pathway.',
      ],
      [
        'Attribute the stool to iron without checking the history',
        'Iron may darken stool, but it does not safely explain tarry stool with new dizziness and tachycardia.',
      ],
      [
        'Ask Jo to walk to the bathroom to assess exercise tolerance',
        'Unassisted activity can add fall risk while bleeding-related instability is being assessed.',
      ],
    ],
    1,
    'What information would make the escalation more specific than “the patient feels dizzy”?'
  ),
  q(
    'med-interrupted-intake',
    0,
    'challenge',
    'take_action',
    ['insulinSafety'],
    'Rapid-acting mealtime insulin has just been administered under the order. Before eating, Asha begins vomiting and the meal is removed. She is currently alert and her glucose is not low.',
    'How should interrupted carbohydrate delivery change the immediate insulin and glucose-monitoring plan?',
    [
      [
        'Wait for symptoms because a normal current glucose excludes later hypoglycemia',
        'The administered insulin can continue to act after the intake plan changes; a normal initial result does not remove that risk.',
      ],
      [
        'Document a missed meal and check again at the next routine shift',
        'Routine timing alone may miss an evolving mismatch between insulin action and carbohydrate intake.',
      ],
      [
        'Give the next mealtime dose early to keep the schedule consistent',
        'Additional insulin would not correct absent intake and could increase risk.',
      ],
      [
        'Notify the team and use the local intake-interruption and glucose-monitoring plan',
        'An active dose with interrupted intake needs prompt coordination, planned glucose checks and an appropriate authorized response if glucose falls.',
      ],
    ],
    3,
    'What should the next nurse know about dose timing, intake and planned reassessment?'
  ),
  q(
    'med-rebound-sedation',
    0,
    'advanced',
    'evaluate_outcomes',
    ['opioidSafety', 'deterioration'],
    'A patient became difficult to rouse after an opioid plus a benzodiazepine. The emergency team treated the episode. Twenty minutes later she is talking, but then becomes drowsier and breathes 9/min again.',
    'What does recurrent sedation after initial improvement imply about continuing medication safety monitoring?',
    [
      [
        'Initial recovery did not establish sustained safety',
        'Recurrent sedation and slow breathing require immediate reassessment and renewed assistance. A temporary improvement does not replace ongoing monitoring.',
      ],
      [
        'The first response excludes a medication contribution to the recurrence',
        'A response to treatment does not exclude persistent or recurring medicine effects.',
      ],
      [
        'The recurrence establishes a new neurologic diagnosis',
        'Other causes must remain open, but this pattern alone does not establish a different diagnosis; breathing must be addressed now.',
      ],
      [
        'The patient can resume the previous sedating schedule after a pain score',
        'A recurrence requires clinical and medication review before resuming the previous plan.',
      ],
    ],
    0,
    'Which observations and medication times would help the team judge whether improvement is sustained?'
  ),
  q(
    'med-error-response',
    0,
    'advanced',
    'take_action',
    ['medicationSafety', 'deterioration'],
    'During handover, a nurse discovers that a second sedating dose was administered after an electronic record delay. The patient is awake but less attentive than at baseline. The team is debating who entered the order.',
    'What should the nurse prioritize while the discrepancy is investigated?',
    [
      [
        'Correct the record first so the next shift can decide what to do',
        'Documentation is essential, but it must not delay assessing the person who may be experiencing harm.',
      ],
      [
        'Assume there is no injury because the patient can answer a question',
        'The ability to answer briefly does not exclude evolving sedation or respiratory compromise.',
      ],
      [
        'Assess the patient, obtain urgent clinical advice and communicate actual exposure',
        'Patient assessment and timely review come first. Preserve accurate dose/timing information and use transparent reporting after immediate safety needs are addressed.',
      ],
      [
        'Ask the previous nurse to judge whether the second dose was necessary',
        'Attribution does not resolve the current exposure or substitute for direct assessment and coordinated review.',
      ],
    ],
    2,
    'How would you separate immediate patient care from the later learning and reporting process?'
  ),
  q(
    'med-discharge-conflict',
    0,
    'advanced',
    'generate_solutions',
    ['medicationSafety', 'sharedDecisions'],
    'At discharge, Kai has an old anticoagulant bottle and a new list naming a different anticoagulant. He says one clinician told him to “switch,” but neither a stop date nor a start date is documented. Transport has arrived.',
    'Which plan best resolves the risk before Kai leaves?',
    [
      [
        'Tell him to choose the bottle he trusts and confirm it at follow-up',
        'Choosing without an agreed transition can create duplication or a gap in treatment.',
      ],
      [
        'Resolve the prescribing conflict and verify the final plan',
        'Clarify the intended product and timing, update the reconciled instructions and check how Kai will use them before discharge.',
      ],
      [
        'Advise taking both until the community pharmacist reviews them',
        'An unverified overlap can create serious bleeding risk and is not a safe default.',
      ],
      [
        'Remove both products until the next outpatient appointment',
        'An unplanned interruption can also cause harm; the team must resolve the treatment transition.',
      ],
    ],
    1,
    'Which handoff details prevent the same ambiguity from reaching the community pharmacy?'
  ),
  q(
    'med-low-glucose-pattern',
    0,
    'advanced',
    'analyze_cues',
    ['insulinSafety', 'aki'],
    'For three nights, an inpatient has low glucose before dawn despite little daytime change. Her intake has fallen and creatinine has doubled. Each low has been treated, but the insulin regimen has not been reviewed.',
    'Why is repeated rescue treatment inadequate for these recurrent overnight low-glucose episodes?',
    [
      [
        'Judge the plan successful because every low was corrected',
        'Rescue treatment addresses an episode; recurrent events show that the prevention plan needs review.',
      ],
      [
        'Prioritize meter-quality checks before requesting a regimen review',
        'Measurement quality matters, but repeated lows with reduced intake and kidney change deserve an active clinical review.',
      ],
      [
        'Focus only on the next mealtime dose because nighttime lows are unrelated',
        'The time pattern may implicate more than mealtime dosing; the full regimen and clinical changes need assessment.',
      ],
      [
        'Review insulin exposure alongside intake and renal trends',
        'A pattern-based review can identify changed requirements and prevent recurrence. The nurse contributes observations while authorized clinicians individualize the regimen.',
      ],
    ],
    3,
    'What would distinguish treating repeated hypoglycemia from evaluating the safety of the whole plan?'
  ),
  q(
    'med-followup-gap',
    0,
    'advanced',
    'evaluate_outcomes',
    ['medicationSafety', 'sharedDecisions'],
    'A discharge plan for a newly changed high-risk medicine says “laboratory monitoring next week.” The patient lives far away, has no booked appointment and cannot name whom to contact if the test is missed.',
    'What would show that the post-discharge laboratory monitoring plan is actually usable?',
    [
      [
        'An arranged test, responsible clinician and missed-test contact',
        'A closed-loop monitoring plan connects the required follow-up to an accessible appointment and a responsible person; teach-back tests whether it can work.',
      ],
      [
        'The printed leaflet includes a description of laboratory monitoring',
        'Information alone does not establish that monitoring is arranged or feasible.',
      ],
      [
        'The medicine is dispensed before transport arrives',
        'Supply is necessary but does not close an unresolved follow-up safety gap.',
      ],
      [
        'A family member says they will look for an appointment later',
        'Helpful support should be incorporated, but an uncertain future task is weaker than a confirmed and understood plan.',
      ],
    ],
    0,
    'What practical barrier could make a clinically correct medicine plan fail at home?'
  ),

  q(
    'renal-output',
    1,
    'foundation',
    'recognize_cues',
    ['aki'],
    'Owen has passed much less urine than usual since surgery. The collection record has no start time, and one entry may include urine measured before the current shift.',
    'Which missing measurement details must be verified before interpreting the apparent low urine output?',
    [
      [
        'The color of the collection bag alone',
        'Color may add context, but it cannot establish a timed urine output.',
      ],
      [
        'The most recent meal and whether Owen slept overnight',
        'These may affect the wider assessment but do not resolve the measurement interval.',
      ],
      [
        'Verified volume, interval, weight and clinical assessment',
        'Timed output and relevant patient context make a low-output trend interpretable; check collection accuracy while assessing the patient.',
      ],
      [
        'The largest urine volume recorded during the previous admission',
        'A remote maximum does not validate the current measurement or explain an acute change.',
      ],
    ],
    2,
    'How could a collection problem resemble a physiologic decline?'
  ),
  q(
    'renal-baseline',
    1,
    'foundation',
    'analyze_cues',
    ['aki'],
    'Priya is admitted after two days of poor intake. Her creatinine is 1.2 mg/dL; the laboratory upper reference limit is 1.3. A result two days ago was 0.7 mg/dL.',
    'Why can Priya’s creatinine require acute kidney injury assessment despite remaining within the laboratory interval?',
    [
      [
        'The result is below 1.3, so there is no kidney concern',
        'A value within a laboratory range can still represent a clinically important acute rise from that person’s baseline.',
      ],
      [
        'The rapid rise from her own recent baseline',
        'The magnitude and timing of change meet an acute kidney injury detection criterion and require clinical assessment.',
      ],
      [
        'The result is lower than many other patients on the ward',
        'Comparing patients does not assess Priya’s acute change.',
      ],
      [
        'The laboratory range replaces the need for a urine history',
        'Kidney assessment includes urine output, clinical status and possible causes, not one reference range.',
      ],
    ],
    1,
    'What does a personal baseline add to a “normal” laboratory range?'
  ),
  q(
    'renal-potassium',
    1,
    'foundation',
    'prioritize_hypotheses',
    ['hyperkalaemia'],
    'A nonhemolyzed potassium result of 6.7 mmol/L is reported for Ellis, who has acute kidney injury. He says he feels well and is waiting for lunch.',
    'How should the nurse respond to this potassium result in the current clinical context?',
    [
      [
        'Repeat the level at the next routine morning collection',
        'This severe result requires an urgent response rather than routine next-day testing.',
      ],
      [
        'Ask him to avoid high-potassium food and continue the usual round',
        'Dietary advice does not address the immediate arrhythmia risk from severe hyperkalemia.',
      ],
      [
        'Wait for palpitations before contacting the clinical team',
        'Dangerous hyperkalemia may be clinically silent; absence of symptoms is not a safe trigger for delay.',
      ],
      [
        'Urgent review, ECG and monitoring through the local pathway',
        'Severe hyperkalemia needs urgent assessment and a coordinated treatment pathway even when the patient appears comfortable.',
      ],
    ],
    3,
    'Why can feeling well be weak reassurance when potassium is severely elevated?'
  ),
  q(
    'renal-catheter',
    1,
    'foundation',
    'take_action',
    ['aki'],
    'A catheterized patient reports new lower abdominal pressure, and the bag has been empty for two hours. The nurse notices the tubing trapped beneath the patient’s leg.',
    'How should absent drainage be investigated when the external catheter tubing is trapped beneath the patient’s leg?',
    [
      [
        'Relieve the external obstruction, assess the patient and reassess drainage',
        'A visible mechanical problem should be corrected within local catheter care guidance while checking symptoms and response; persistent poor drainage needs further review.',
      ],
      [
        'Conclude that the kidneys have stopped producing urine',
        'An empty bag does not distinguish absent production from impaired drainage.',
      ],
      [
        'Increase the fluid rate without checking the catheter system',
        'An unverified fluid increase does not resolve a blocked drainage pathway and may cause harm.',
      ],
      [
        'Irrigate forcefully without reviewing the catheter order or policy',
        'Unapproved forceful irrigation can cause harm; use the authorized assessment and escalation pathway.',
      ],
    ],
    0,
    'What would you do if drainage did not resume after the external kink was relieved?'
  ),
  q(
    'renal-balance',
    1,
    'foundation',
    'evaluate_outcomes',
    ['fluids', 'aki'],
    'After a clinician-directed fluid plan for gastrointestinal losses, Min is being reassessed. The intake chart is complete, but the urine and ongoing stool losses are not recorded.',
    'Which combined findings best evaluate the patient’s response to the prescribed fluid plan?',
    [
      [
        'Whether the entire prescribed fluid bag was administered',
        'Completion of a bag is a process measure; it does not demonstrate the patient’s response or remaining losses.',
      ],
      [
        'Whether Min reports that the room feels warmer',
        'This does not establish perfusion, fluid balance or tolerance of the plan.',
      ],
      [
        'Perfusion, breathing, timed output and ongoing losses',
        'Evaluate both intended benefit and potential fluid-related harm, using clinical findings alongside a reliable balance record.',
      ],
      [
        'The current intake total without comparison to output',
        'Input alone cannot show whether losses persist or fluid is accumulating.',
      ],
    ],
    2,
    'Which findings would make you request a change rather than simply continue the original plan?'
  ),
  q(
    'renal-normal-range',
    1,
    'challenge',
    'analyze_cues',
    ['aki'],
    'Hana’s creatinine rises from 0.5 to 0.9 mg/dL in 36 hours. A colleague says it is normal because the local reference range ends at 1.1. Hana has new nausea and falling urine output.',
    'Which response best explains why further review is needed?',
    [
      [
        'The acute rise matters despite the reported reference range',
        'A rise of at least 0.3 mg/dL within 48 hours meets a detection criterion. Her symptoms and output strengthen the need for assessment.',
      ],
      [
        'Any creatinine below 1.1 excludes an acute reduction in kidney function',
        'Reference limits do not replace time-linked comparison with the patient’s baseline.',
      ],
      [
        'The low starting value proves that the second result is inaccurate',
        'A low baseline does not invalidate a later change; verify unexpected results without dismissing the clinical pattern.',
      ],
      [
        'The nausea confirms a permanent chronic kidney diagnosis',
        'Acute findings require investigation; the vignette does not establish chronicity or permanence.',
      ],
    ],
    0,
    'What would be lost if the handoff reported only “creatinine 0.9”?'
  ),
  q(
    'renal-fluid-conflict',
    1,
    'challenge',
    'prioritize_hypotheses',
    ['fluids', 'aki'],
    'After treatment for vomiting, Dev still has low urine output. He now needs more oxygen, has new crackles and is more breathless lying flat. A further fluid bag is awaiting administration.',
    'What should change when the fluid intervention is followed by new respiratory findings?',
    [
      [
        'Continue the bag because low urine output always means dehydration',
        'Oliguria has several causes, and new respiratory findings may signal poor fluid tolerance.',
      ],
      [
        'Focus on the urine chart and leave the breathing assessment until later',
        'New breathing compromise needs immediate assessment alongside the kidney problem.',
      ],
      [
        'Stop all future fluid intake indefinitely',
        'An indefinite unreviewed restriction does not resolve the competing risks or establish a treatment plan.',
      ],
      [
        'Reassess breathing and volume status; clarify the fluid plan',
        'Persistent oliguria with new respiratory compromise requires prompt review before automatically continuing fluids. Seek an individualized plan and monitor closely.',
      ],
    ],
    3,
    'Which findings suggest the original solution may now be adding a new problem?'
  ),
  q(
    'renal-hemolysis',
    1,
    'challenge',
    'generate_solutions',
    ['hyperkalaemia'],
    'A hemolyzed specimen reports potassium 6.8 mmol/L. Quinn has acute kidney injury, new muscle weakness and a new wide-complex rhythm on monitoring.',
    'How should the possible specimen error affect the response?',
    [
      [
        'Treat the value as invalid and silence the monitor',
        'Hemolysis can elevate potassium, but the associated clinical and rhythm changes make dismissal unsafe.',
      ],
      [
        'Repeat sampling alongside urgent assessment and treatment',
        'Verify the result without allowing specimen uncertainty to delay a response to possible life-threatening hyperkalemia.',
      ],
      [
        'Wait for the repeat before requesting any clinical review',
        'A patient with new weakness and a rhythm change needs immediate assessment while confirmation is obtained.',
      ],
      [
        'Conclude the rhythm is caused by low potassium because the sample was hemolyzed',
        'Hemolysis does not establish the opposite electrolyte disorder or explain away the pattern.',
      ],
    ],
    1,
    'When should data verification occur in parallel with urgent care rather than before it?'
  ),
  q(
    'renal-retention',
    1,
    'challenge',
    'analyze_cues',
    ['aki'],
    'After pelvic surgery, Blair has passed small amounts frequently and reports lower abdominal fullness. Total measured urine is low. A bedside bladder assessment under local protocol shows substantial retained urine.',
    'How should the bladder findings change the interpretation of the low measured output?',
    [
      [
        'The frequent voiding proves adequate bladder emptying',
        'Small frequent voids can coexist with substantial retention. Frequency alone does not establish effective drainage.',
      ],
      [
        'The low output proves the patient needs an unprescribed fluid bolus',
        'A fluid bolus does not address confirmed retained urine and may worsen other risks.',
      ],
      [
        'Impaired bladder emptying is contributing to the low measured output',
        'The symptoms and retained volume support prompt review and an authorized bladder-management plan while kidney function is assessed.',
      ],
      [
        'The bladder finding excludes any need to review kidney function',
        'Obstruction can contribute to kidney injury; identifying retention does not make renal assessment unnecessary.',
      ],
    ],
    2,
    'What response would show whether the authorized drainage plan has helped?'
  ),
  q(
    'renal-handoff',
    1,
    'challenge',
    'take_action',
    ['aki', 'medicationSafety'],
    'Rae’s creatinine has doubled since admission. She has taken ibuprofen at home during a diarrheal illness and is also prescribed an ACE inhibitor. The nurse is requesting a medication and kidney review.',
    'Which handover best connects the kidney trend with losses, medicines and the present clinical condition?',
    [
      [
        'Timed renal change, losses, actual medicines and current status',
        'The team needs a connected account of acute change, potential contributors and present stability to individualize medicines and volume management.',
      ],
      [
        'Report “kidney results abnormal” and send the medication list later',
        'An unspecific result without timing or exposure conceals information needed for a timely decision.',
      ],
      [
        'State that the ACE inhibitor is permanently contraindicated',
        'Acute illness may require medication changes, but this vignette does not justify a permanent prohibition.',
      ],
      [
        'Attribute the entire change to ibuprofen without considering other causes',
        'A potential contributor should be identified without prematurely closing the differential.',
      ],
    ],
    0,
    'How can you recommend a review while keeping uncertainty about the cause explicit?'
  ),
  q(
    'renal-reassessment',
    1,
    'advanced',
    'evaluate_outcomes',
    ['aki', 'fluids'],
    'During a clinician-directed resuscitation plan, Taylor’s blood pressure improves, but urine output remains low. A later assessment finds new crackles, increased work of breathing and a positive fluid balance.',
    'How should improved perfusion be weighed against the new evidence of fluid intolerance?',
    [
      [
        'Blood pressure recovery proves that the fluid plan should continue unchanged',
        'One improved variable does not outweigh signs of possible fluid-related harm and unresolved oliguria.',
      ],
      [
        'The lungs and urine should be considered unrelated problems',
        'The findings may be linked through fluid tolerance and kidney function; assess them together.',
      ],
      [
        'Low urine output confirms that more fluid will restore filtration',
        'Persistent oliguria does not establish ongoing fluid responsiveness or the cause of kidney dysfunction.',
      ],
      [
        'Improved perfusion with new harm requiring urgent review',
        'Report both improvement and deterioration. The team needs to reassess volume status, causes of oliguria and the next fluid strategy.',
      ],
    ],
    3,
    'How would you describe a mixed response without labeling the whole intervention simply “successful” or “failed”?'
  ),
  q(
    'renal-ecg-negative',
    1,
    'advanced',
    'prioritize_hypotheses',
    ['hyperkalaemia'],
    'Mika has a confirmed potassium of 6.6 mmol/L and worsening kidney function. The first ECG has no typical hyperkalemic changes. Another urgent call is competing for the clinician’s attention.',
    'What should the nurse communicate about the normal-looking ECG?',
    [
      [
        'It reduces the potassium result to a routine follow-up issue',
        'Severe hyperkalemia still requires urgent assessment and monitoring; the ECG cannot safely downgrade it to routine care.',
      ],
      [
        'It cannot exclude dangerous hyperkalemia',
        'A single ECG has limited sensitivity. Communicate the confirmed result, renal trend and need for the urgent pathway despite absent typical changes.',
      ],
      [
        'It establishes that the laboratory result is a collection error',
        'A normal-looking ECG cannot prove a specimen error, particularly after confirmation.',
      ],
      [
        'It means dietary education should replace cardiac monitoring',
        'Dietary measures do not substitute for acute monitoring and treatment decisions.',
      ],
    ],
    1,
    'What should remain urgent when one expected feature is absent?'
  ),
  q(
    'renal-unreliable-chart',
    1,
    'advanced',
    'analyze_cues',
    ['aki', 'deterioration'],
    'A chart shows apparently normal urine output, but two entries were copied from the same collection bag without emptying it. The patient is newly confused, and creatinine has risen sharply.',
    'How should the team handle an unreliable urine chart during clinical deterioration?',
    [
      [
        'The reassuring total outweighs the new mental-status change',
        'The total is unreliable and should not override a new concerning clinical change.',
      ],
      [
        'A chart correction can wait because only laboratory results matter',
        'Both measurement integrity and the clinical decline need timely attention.',
      ],
      [
        'Reconstruct the true output while urgently assessing the patient’s deterioration',
        'Do not treat duplicated data as evidence of stability. Verify the record in parallel with assessment and escalation of the new findings.',
      ],
      [
        'Delete all fluid records and start again without telling the team',
        'Corrections need an accurate audit trail and communication; silently discarding records conceals uncertainty.',
      ],
    ],
    2,
    'How would you communicate that a previously reassuring trend is no longer trustworthy?'
  ),
  q(
    'renal-medication-balance',
    1,
    'advanced',
    'generate_solutions',
    ['aki', 'medicationSafety'],
    'During an acute kidney injury review, the team identifies medicines that may worsen hypotension or accumulate. One medicine also treats a serious ongoing infection. The patient asks whether all tablets should simply stop.',
    'How should medicine review balance ongoing indications against changing renal and perfusion risks?',
    [
      [
        'Review each medicine’s current benefit, risk and monitoring',
        'Medication decisions should be individualized. Reducing exposure-related harm must be balanced against the harm of untreated conditions and an explicit reassessment plan.',
      ],
      [
        'Stop every medicine until creatinine returns to the reference range',
        'A blanket interruption ignores important indications and may introduce avoidable harm.',
      ],
      [
        'Continue every medicine because it was prescribed before the kidney change',
        'A prior prescription does not account for acute changes in clearance, volume status or blood pressure.',
      ],
      [
        'Ask the patient to decide which pills seem most important by appearance',
        'Shared decisions require meaningful information and professional review, not an unsupported choice based on appearance.',
      ],
    ],
    0,
    'What should be documented about any temporary change and the conditions for restarting or reassessing it?'
  ),
  q(
    'renal-after-discharge',
    1,
    'advanced',
    'evaluate_outcomes',
    ['aki', 'sharedDecisions'],
    'After an acute kidney injury, Jordan’s creatinine improves but remains above baseline. He feels well and thinks follow-up is unnecessary. Several medicines were temporarily changed during admission.',
    'Which discharge outcome best reduces the remaining risk?',
    [
      [
        'Jordan knows that improvement means the episode cannot recur',
        'Recovery does not guarantee that kidney function has returned to baseline or eliminate recurrence risk.',
      ],
      [
        'The discharge summary uses the phrase “renal function improving”',
        'An accurate phrase does not establish monitoring arrangements or an understood medication plan.',
      ],
      [
        'All medicines are restarted automatically because symptoms resolved',
        'Symptoms alone do not determine whether each medicine is safe to restart.',
      ],
      [
        'A usable test, medicine-review and help-seeking plan',
        'A usable recovery plan includes follow-up of residual dysfunction, a clear medication plan and actions for renewed illness or reduced output.',
      ],
    ],
    3,
    'Who will check the result and close the loop if kidney function has not recovered?'
  ),

  q(
    'assess-pressure',
    2,
    'foundation',
    'recognize_cues',
    ['pressureInjury'],
    'A bedbound patient with dark skin reports a sore heel. The heel is warmer and firmer than the other side, but obvious redness is difficult to see.',
    'How should the new heel findings affect focused assessment and pressure relief?',
    [
      [
        'The absence of visible redness excludes pressure-related injury',
        'Color change can be subtle in dark skin. Pain, temperature and tissue consistency also matter.',
      ],
      [
        'The heel needs focused assessment and pressure relief',
        'Localized discomfort and tissue changes over a pressure area require assessment and prevention; color alone is insufficient.',
      ],
      [
        'Massage is the best way to test whether the tissue recovers',
        'Rubbing or massage is not recommended to prevent pressure injury and can harm vulnerable tissue.',
      ],
      [
        'Reassessment can wait until there is an open wound',
        'Waiting for skin breakdown misses the opportunity for early prevention.',
      ],
    ],
    1,
    'What findings would you compare with nearby skin and the opposite heel?'
  ),
  q(
    'assess-normal-bp',
    2,
    'foundation',
    'analyze_cues',
    ['deterioration'],
    'Luca’s blood pressure remains 124/76 mmHg, but his respiratory rate has risen from 16 to 28/min. He is newly restless and cannot finish the same short walk he managed earlier.',
    'How should the respiratory and functional change be weighed against a reassuring blood pressure?',
    [
      [
        'The normal pressure is sufficient evidence that he is stable',
        'One reassuring vital sign does not negate a new respiratory and functional decline.',
      ],
      [
        'Restlessness should be treated as a personality issue first',
        'A change in behavior may be a cue to deterioration and needs assessment in context.',
      ],
      [
        'The walking difficulty can be reviewed at tomorrow’s therapy session',
        'A new decline alongside tachypnea should not be deferred as a routine mobility problem.',
      ],
      [
        'Prompt reassessment of the respiratory and functional change',
        'Assess the patient, repeat relevant observations and use clinical concern and the local escalation pathway, even with a normal blood pressure.',
      ],
    ],
    3,
    'What information would you include in a call that explains why the normal pressure is not reassuring enough?'
  ),
  q(
    'assess-transfusion',
    2,
    'foundation',
    'take_action',
    ['transfusion'],
    'Ten minutes after a blood transfusion begins, Morgan develops shaking chills, back discomfort and a falling blood pressure. These findings were absent before the transfusion.',
    'What immediate response is needed to the new symptoms during the transfusion?',
    [
      [
        'Stop transfusion; assess ABCs and obtain urgent help',
        'A suspected serious transfusion reaction requires immediate interruption and urgent assessment. Maintain IV access according to local policy; do not flush the blood-filled line.',
      ],
      [
        'Slow the transfusion and reassess after the bag finishes',
        'Continuing exposure can worsen a serious reaction; these are not findings to observe through completion.',
      ],
      [
        'Give a routine antipyretic while leaving the transfusion running',
        'Symptom treatment must not delay stopping a potentially harmful transfusion and assessing severity.',
      ],
      [
        'Discard the bag and tubing before contacting the transfusion service',
        'The component and equipment may be needed for investigation; follow local handling and reporting procedures.',
      ],
    ],
    0,
    'After immediate safety actions, what identity checks and notifications are required by your local transfusion procedure?'
  ),
  q(
    'assess-toileting',
    2,
    'foundation',
    'generate_solutions',
    ['falls', 'sharedDecisions'],
    'Evelyn, 79, says she will walk to the bathroom alone because the bell is out of reach and waiting is embarrassing. She became dizzy when standing earlier.',
    'Which plan best addresses the immediate risk and her goal?',
    [
      [
        'Tell her to stay in bed without discussing toileting',
        'This ignores the need driving the attempted walk and may increase unassisted attempts.',
      ],
      [
        'Place a falls label at the doorway and leave',
        'A label does not resolve an inaccessible bell, dizziness or an urgent toileting need.',
      ],
      [
        'Timely assisted toileting with reachable help',
        'A practical, respectful plan addresses both the trigger and the mobility risk; assess the dizziness and involve Evelyn in the approach.',
      ],
      [
        'Remove her walking aid so she cannot leave the bed',
        'Removing needed equipment undermines safe mobility and does not address the cause of risk.',
      ],
    ],
    2,
    'Which environmental change would make the safer choice easier to use?'
  ),
  q(
    'assess-external-bleed',
    2,
    'foundation',
    'prioritize_hypotheses',
    ['traumaAssessment'],
    'After a machinery injury, a patient has brisk visible bleeding from the forearm. A colleague is gathering a full health history while another team member calls for emergency assistance.',
    'Which immediate nursing action addresses the visible threat?',
    [
      [
        'Finish the medication history before touching the wound',
        'Relevant history is important, but active significant bleeding needs an immediate response.',
      ],
      [
        'Direct pressure with protection and trauma support',
        'Direct pressure is a first measure for external hemorrhage. Continue rapid assessment and summon trained help for bleeding that cannot be controlled.',
      ],
      [
        'Remove the dressing repeatedly to calculate the blood loss',
        'Repeatedly disturbing initial bleeding control can prolong exposure; assess effectiveness without unnecessarily interrupting pressure.',
      ],
      [
        'Wait for a blood pressure drop to confirm significant bleeding',
        'Waiting for hypotension delays treatment of a visible threat.',
      ],
    ],
    1,
    'What would make you escalate beyond the initial bleeding-control measure?'
  ),
  q(
    'assess-trauma-trend',
    2,
    'challenge',
    'analyze_cues',
    ['traumaAssessment', 'deterioration'],
    'After a road collision, Arin initially speaks clearly with a blood pressure of 118/72. Over 20 minutes he becomes pale and restless, pulse rises from 88 to 124, and the pressure falls to 98/64.',
    'What does the changing perfusion pattern imply after this trauma?',
    [
      [
        'The initial normal pressure rules out important hemorrhage',
        'An initial measurement cannot exclude evolving blood loss or replace serial assessment.',
      ],
      [
        'Restlessness proves an anxiety disorder unrelated to the injury',
        'Restlessness can accompany physiologic decline and should be assessed with the changing vital signs.',
      ],
      [
        'The pulse rise is expected after pain and needs no reassessment',
        'Pain may contribute, but the combined trend after trauma requires urgent reassessment for serious causes.',
      ],
      [
        'Urgent trauma reassessment of the perfusion change',
        'The trajectory is concerning for worsening circulation. Escalate with the mechanism, trend and current findings rather than waiting for profound hypotension.',
      ],
    ],
    3,
    'Why is the direction of change more useful here than the first set of observations?'
  ),
  q(
    'assess-postural',
    2,
    'challenge',
    'generate_solutions',
    ['falls', 'medicationSafety'],
    'After a nighttime fall, Mae, 76, reports dizziness on rising. She recently started a sedating medicine, is drinking less and has difficulty seeing the bathroom doorway.',
    'What should shape the prevention plan after injury assessment?',
    [
      [
        'A review of the interacting personal and environmental risks',
        'Several modifiable factors may be interacting. Tailor the plan to the assessment and Mae’s needs rather than relying on a label or one intervention.',
      ],
      [
        'A generic warning that all older people must remain in bed',
        'Routine immobility does not address individual causes and can contribute to loss of function.',
      ],
      [
        'Stopping every medicine without checking its indication',
        'Medicines deserve review, but blanket unprescribed cessation can introduce other harms.',
      ],
      [
        'Teaching her to stand faster so she reaches the bathroom sooner',
        'This does not address dizziness or environmental barriers and may increase the risk of another fall.',
      ],
    ],
    0,
    'Which part of Mae’s usual nighttime routine should be included in the plan?'
  ),
  q(
    'assess-new-confusion',
    2,
    'challenge',
    'recognize_cues',
    ['deterioration'],
    'A daughter says her father is “not himself”: yesterday he followed conversations, but now he repeatedly loses track. His usual hearing aids are in place. Vital signs have not been checked since the change.',
    'How should the newly reported confusion change the immediate assessment?',
    [
      [
        'Explain that confusion is expected in all older inpatients',
        'An acute change is not normal aging and may be an important deterioration cue.',
      ],
      [
        'Ask the daughter to return after visiting hours',
        'Her knowledge of baseline function is useful evidence and should inform assessment.',
      ],
      [
        'Assess and escalate the acute clinical change',
        'Compare with baseline, obtain relevant observations and consider reversible contributors. Family concern can identify a change that a brief encounter misses.',
      ],
      [
        'Document dementia before reviewing the time course',
        'An acute fluctuation does not establish a chronic cognitive diagnosis.',
      ],
    ],
    2,
    'What precise description of baseline and onset would improve the handoff?'
  ),
  q(
    'assess-moisture-pressure',
    2,
    'challenge',
    'analyze_cues',
    ['pressureInjury'],
    'A patient has frequent incontinence and cannot reposition independently. There is diffuse moist irritation in skin folds and a separate painful, firm area directly over the sacrum.',
    'How should the nurse distinguish moisture-associated changes from possible pressure-related injury?',
    [
      [
        'Use one diagnosis for all areas because incontinence is present',
        'Moisture and pressure can coexist; one explanation may not account for distinct patterns and tissue findings.',
      ],
      [
        'Assess each area’s distribution, pressure exposure, pain and tissue changes',
        'A site-specific assessment guides pressure relief and moisture management and supports appropriate review without assuming every change has the same cause.',
      ],
      [
        'Treat the sacral finding as harmless until the skin opens',
        'Intact skin can still have clinically important tissue changes requiring prevention and assessment.',
      ],
      [
        'Massage both areas until the discoloration disappears',
        'Massage is not recommended for pressure-injury prevention and may harm affected tissue.',
      ],
    ],
    1,
    'What additional finding would make a pressure contribution more likely at one site?'
  ),
  q(
    'assess-transfusion-breathing',
    2,
    'challenge',
    'prioritize_hypotheses',
    ['transfusion', 'deterioration'],
    'During a transfusion, a patient develops new breathlessness, tachycardia and falling oxygen saturation. She has heart failure, but no single cause of the change has been established.',
    'What is the safest response before assigning a reaction subtype?',
    [
      [
        'Assume fluid overload and continue the blood more slowly',
        'The differential includes serious reactions. Continuing before assessment may expose the patient to further harm.',
      ],
      [
        'Wait for a rash because it is required for a serious reaction',
        'Serious transfusion reactions may occur without a rash.',
      ],
      [
        'Complete the unit so the investigation can use the entire volume',
        'Investigation needs do not justify continuing a suspected harmful exposure.',
      ],
      [
        'Stop transfusion and obtain urgent clinical/transfusion review',
        'Immediate safety actions do not require a definitive subtype. The subsequent assessment and investigation distinguish causes and guide treatment.',
      ],
    ],
    3,
    'Which baseline and current findings would help the team distinguish possible causes after the transfusion is stopped?'
  ),
  q(
    'assess-negative-fast',
    2,
    'advanced',
    'analyze_cues',
    ['traumaAssessment'],
    'A trauma patient’s focused ultrasound was reported negative. He remains tachycardic and becomes increasingly clammy with a falling pressure. The team is considering whether the negative scan is sufficient reassurance.',
    'How should a negative focused ultrasound be weighed against worsening perfusion after trauma?',
    [
      [
        'A negative focused scan does not exclude important internal hemorrhage',
        'A negative FAST cannot exclude intraperitoneal or retroperitoneal bleeding. Continuing deterioration requires immediate trauma reassessment and a pathway based on current stability.',
      ],
      [
        'The scan result outweighs all subsequent physiologic changes',
        'A test result must be interpreted with its limitations and the patient’s evolving condition.',
      ],
      [
        'The scan proves that further bleeding assessment is unnecessary',
        'Focused ultrasound does not detect every source or stage of bleeding.',
      ],
      [
        'The remaining explanation must be anxiety because the scan is negative',
        'This closes the differential despite a concerning perfusion trend and risks delaying care.',
      ],
    ],
    0,
    'How would you frame a test result that lowers one concern but cannot safely exclude it?'
  ),
  q(
    'assess-head-anticoag',
    2,
    'advanced',
    'prioritize_hypotheses',
    ['headInjury', 'falls'],
    'After an unwitnessed fall, 81-year-old Finn reports striking his head. He takes apixaban. He is currently alert with equal pupils and says he would prefer to sleep rather than be examined.',
    'Which plan best weighs the reassuring exam against the unresolved risk?',
    [
      [
        'Allow sleep and omit further review because the pupils are equal',
        'A reassuring brief examination does not exclude intracranial injury after head trauma in an anticoagulated person.',
      ],
      [
        'Assume intracranial bleeding is proven and explain a definite diagnosis',
        'The risk requires assessment; the vignette does not establish bleeding.',
      ],
      [
        'Prompt pathway-based head-injury review',
        'Anticoagulant use changes risk assessment even with a normal initial exam. Explain the concern, assess capacity and preferences and obtain timely clinical review.',
      ],
      [
        'Review only his walking aid because the fall has already occurred',
        'Prevention matters after immediate injury assessment; it does not replace evaluation of a possible head injury.',
      ],
    ],
    2,
    'What information about timing, symptoms, medicines and baseline would the reviewing clinician need?'
  ),
  q(
    'assess-reaction-uncertainty',
    2,
    'advanced',
    'generate_solutions',
    ['transfusion'],
    'A transfusion has been stopped for acute dyspnea. The patient has crackles and hypertension but also chills. One clinician suspects circulatory overload; another raises a different transfusion reaction.',
    'Which time-linked findings help the team investigate the transfusion-associated respiratory decline?',
    [
      [
        'Restart the transfusion because the disagreement implies low risk',
        'Diagnostic disagreement is not reassurance and does not justify restarting a stopped transfusion.',
      ],
      [
        'Time-linked findings, exposure, baseline and response',
        'A structured timeline supports differentiation while urgent supportive care and the transfusion investigation continue. The nursing role does not require prematurely declaring a subtype.',
      ],
      [
        'Report only the features that support the first clinician’s explanation',
        'Selective reporting can anchor the team and obscure findings that suggest a competing cause.',
      ],
      [
        'Discard the component and tubing to prevent staff confusion',
        'Preserve material required by the local investigation pathway and notify the transfusion service.',
      ],
    ],
    1,
    'Which finding does not fit the leading explanation and should remain visible in the handoff?'
  ),
  q(
    'assess-pressure-response',
    2,
    'advanced',
    'evaluate_outcomes',
    ['pressureInjury', 'nutritionSupport'],
    'Despite a documented prevention plan, a patient’s sacral pain and discoloration are worsening. Repositioning entries are complete, but she says each position lasted only a few minutes because it was uncomfortable. Intake is also poor.',
    'Which evaluation best explains why the plan needs revision?',
    [
      [
        'Completed documentation proves adequate pressure redistribution',
        'Recorded tasks do not establish effective or sustained relief at the affected site.',
      ],
      [
        'Poor intake proves that nutrition alone caused the tissue changes',
        'Nutrition may contribute, but it does not replace assessment of pressure exposure, tolerability and other factors.',
      ],
      [
        'The patient should tolerate pain so the original schedule can continue',
        'An intolerable plan is unlikely to work and needs patient-centered adaptation and symptom review.',
      ],
      [
        'Reassess pressure relief, tolerance and nutrition with the team',
        'Evaluate what was achieved, not only what was charted. Worsening tissue findings require prompt review and an individualized, feasible prevention and care plan.',
      ],
    ],
    3,
    'What would demonstrate that a revised position or support surface actually reduces the problem?'
  ),
  q(
    'assess-family-trend',
    2,
    'advanced',
    'take_action',
    ['deterioration', 'sharedDecisions'],
    'A patient’s observation score remains below the usual escalation threshold. Her partner reports a major change in conversation, and the nurse observes that she now needs help sitting upright and is breathing harder.',
    'How should the low warning score be weighed against the family-reported and observed deterioration?',
    [
      [
        'Use it alongside the concerning clinical and functional change',
        'A score supports assessment but does not replace clinical judgment. Communicate new findings and family observations and use the clinical-concern escalation route.',
      ],
      [
        'As a rule preventing contact with the reviewing clinician',
        'Concern about deterioration may warrant escalation even when a numerical trigger is not met.',
      ],
      [
        'As evidence that the partner’s observations are inaccurate',
        'A partner may know baseline function well; the score does not invalidate that information.',
      ],
      [
        'As justification to defer reassessment until the next scheduled round',
        'A new change requires timely reassessment rather than waiting solely on the routine schedule.',
      ],
    ],
    0,
    'What would you say if the first escalation received only “the score is low” as a response?'
  ),

  q(
    'gen-screen-result',
    3,
    'foundation',
    'analyze_cues',
    ['geneticCounselling'],
    'An asymptomatic patient receives a screening result suggesting increased inherited cancer risk. She asks, “Does this mean I have cancer now?”',
    'Which explanation best separates risk from diagnosis?',
    [
      [
        'A risk result confirms that cancer is already present',
        'A susceptibility result does not diagnose a current cancer.',
      ],
      [
        'The result predicts the exact age when cancer will develop',
        'Risk results generally do not establish whether or when an individual will develop disease.',
      ],
      [
        'It informs risk and follow-up, not a diagnosis of cancer',
        'Explain what the particular test can and cannot establish and arrange appropriate interpretation and follow-up.',
      ],
      [
        'No symptoms mean the result can be discarded',
        'An asymptomatic person may still benefit from risk assessment and an individualized screening plan.',
      ],
    ],
    2,
    'Which next question would help you understand what the patient thinks the result means?'
  ),
  q(
    'gen-consent',
    3,
    'foundation',
    'take_action',
    ['geneticConsent', 'sharedDecisions'],
    'Before a nonurgent genetic test, Amira says, “I signed the form, but I still do not understand what my family could learn from this. I want more time.”',
    'How should uncertainty about the test implications affect proceeding with the genetic test?',
    [
      [
        'Proceed because the signed form settles all questions',
        'Informed consent is a continuing process; a signature does not replace understanding or a voluntary current decision.',
      ],
      [
        'Pause for informed discussion of her preferences',
        'Support the request for clarification and time. The person can reconsider a nonurgent test after understanding potential benefits, limitations and family implications.',
      ],
      [
        'Ask a relative to decide without involving Amira',
        'Her own decision remains central when she can make it; relatives do not automatically replace her consent.',
      ],
      [
        'Say that declining the test ends access to all future care',
        'This is coercive and misrepresents the relationship between a testing decision and ongoing care.',
      ],
    ],
    1,
    'What should happen if a person’s wishes change after a consent form is signed?'
  ),
  q(
    'gen-family-history',
    3,
    'foundation',
    'recognize_cues',
    ['familyHistory'],
    'During a clinic visit, Micah says, “Cancer runs in my family,” but the record contains no details. He is unsure whether anyone had a genetic test.',
    'Which follow-up information most improves the risk history?',
    [
      [
        'Only the number of relatives currently living nearby',
        'Proximity may affect support, but it does not describe the pattern of disease.',
      ],
      [
        'Whether all relatives used the same hospital',
        'Hospital choice does not substitute for diagnosis, relationship and age at onset.',
      ],
      [
        'Only the oldest relative’s current age',
        'This isolated fact does not identify patterns of early or related disease.',
      ],
      [
        'Affected relatives, conditions, onset ages and test results',
        'Relationships, timing and verified diagnoses help clinicians assess a family pattern and whether further counseling is appropriate.',
      ],
    ],
    3,
    'How would you record uncertainty when a relative’s diagnosis is not yet confirmed?'
  ),
  q(
    'gen-language',
    3,
    'foundation',
    'generate_solutions',
    ['sharedDecisions', 'geneticConsent'],
    'A patient wants a professional interpreter for a genetic-testing discussion. Her adult child offers to interpret, but the patient says she has private questions she would rather ask alone.',
    'Which plan best supports an informed decision?',
    [
      [
        'Use a professional interpreter and the patient’s family preference',
        'Accessible communication and privacy support voluntary understanding. Ask whom the patient wants involved instead of assuming a family role.',
      ],
      [
        'Use the child because genetic information always belongs to the whole family',
        'Family implications do not remove the individual’s preferences or privacy needs.',
      ],
      [
        'Give a translated consent form without a discussion',
        'A form can help but does not replace an accessible conversation and a chance to ask questions.',
      ],
      [
        'Delay every aspect of care until the child can attend',
        'The patient requested a different communication plan; family availability should not be treated as a prerequisite for her care.',
      ],
    ],
    0,
    'How would you verify understanding without asking the interpreter to make the decision?'
  ),
  q(
    'gen-teachback-risk',
    3,
    'foundation',
    'evaluate_outcomes',
    ['geneticCounselling', 'sharedDecisions'],
    'After counseling, Sora says, “A harmful variant raises my risk, but it does not guarantee I will get the disease. I need to discuss what screening is right for me.”',
    'What does the patient’s explanation show about the distinction between genetic risk and certainty?',
    [
      [
        'She has confirmed a diagnosis of the disease',
        'A risk-associated variant and a current diagnosis are different findings.',
      ],
      [
        'She can stop all screening because the result is genetic',
        'Genetic risk may affect screening needs; it does not make screening irrelevant.',
      ],
      [
        'Increased risk is not certainty; follow-up still matters',
        'The statement reflects a useful understanding of probabilistic risk and individualized next steps.',
      ],
      [
        'She can predict whether each relative carries the variant',
        'Her result alone cannot establish every relative’s genotype.',
      ],
    ],
    2,
    'What part of the agreed follow-up plan would you ask Sora to explain in her own words?'
  ),
  q(
    'gen-vus',
    3,
    'challenge',
    'analyze_cues',
    ['geneticCounselling'],
    'A report lists a “variant of uncertain significance.” The patient’s sibling has interpreted the word “variant” as proof of an inherited cancer syndrome and is urging immediate irreversible treatment.',
    'How should a variant of uncertain significance be explained without treating it as a confirmed disease-causing finding?',
    [
      [
        'The variant is definitely harmful because the laboratory reported it',
        'Reporting a variant does not establish that it causes disease.',
      ],
      [
        'Uncertain means the patient has no family-related risk',
        'Uncertainty about one variant does not erase the personal and family history.',
      ],
      [
        'The sibling’s interpretation is sufficient to choose irreversible treatment',
        'Family concern deserves support, but a treatment decision needs qualified interpretation of evidence and the full clinical context.',
      ],
      [
        'An unresolved result requiring expert, contextual interpretation',
        'A VUS should not be treated as a confirmed harmful variant. Counseling can explain uncertainty, appropriate management and possible later reclassification.',
      ],
    ],
    3,
    'How would you explain uncertainty without implying that the patient’s concerns are unimportant?'
  ),
  q(
    'gen-negative',
    3,
    'challenge',
    'prioritize_hypotheses',
    ['geneticCounselling', 'familyHistory'],
    'A family has several early cancers but no known familial pathogenic variant. Talia’s panel is negative, and she plans to cancel the risk-clinic appointment because she believes the result rules out inherited risk.',
    'How should a negative result be interpreted when the concerning family pattern remains unexplained?',
    [
      [
        'A potentially uninformative result within the family history',
        'Without a known familial cause, a negative panel may not explain or remove the observed risk pattern. Follow-up should be individualized.',
      ],
      [
        'The result guarantees that no relative has a hereditary condition',
        'One negative result cannot establish the genetic status or risk of all relatives.',
      ],
      [
        'The result proves that the family history is inaccurate',
        'A negative test does not disprove the reported pattern of disease.',
      ],
      [
        'Every negative result requires the same screening plan as the general population',
        'The meaning of a negative result depends on the test and family context; screening should not be generalized from the word negative alone.',
      ],
    ],
    0,
    'What difference would a known familial pathogenic variant make when interpreting a negative result?'
  ),
  q(
    'gen-autonomy',
    3,
    'challenge',
    'generate_solutions',
    ['geneticConsent', 'sharedDecisions'],
    'An adult’s parent has a known inherited condition. The adult is uncertain about predictive testing, while family members insist that testing must occur before the next family meeting.',
    'How should the nurse support the adult’s choice about genetic testing without pressure?',
    [
      [
        'Schedule the test because the family has already agreed',
        'Agreement among relatives does not replace a competent adult’s voluntary decision.',
      ],
      [
        'Advise refusal because uncertainty always means testing is inappropriate',
        'Uncertainty calls for informed support, not a decision imposed by the nurse in the opposite direction.',
      ],
      [
        'Explore goals and offer voluntary counseling',
        'Predictive testing can have personal and family consequences. Support an informed choice, including the choice to defer, rather than treating pressure as consent.',
      ],
      [
        'Limit discussion to the technical blood collection steps',
        'Technical instructions omit the implications and preferences central to the decision.',
      ],
    ],
    2,
    'Which question would reveal what this person hopes testing will change?'
  ),
  q(
    'gen-relative-request',
    3,
    'challenge',
    'take_action',
    ['geneticConsent', 'sharedDecisions'],
    'A competent adult patient has not authorized sharing her genetic result. Her brother calls asking the nurse for the report because “it could affect my children.”',
    'How should a relative’s request for the patient’s genetic result be handled?',
    [
      [
        'Email the report because relatives may share some genetic risk',
        'Possible relevance does not by itself provide authorization to disclose the patient’s report.',
      ],
      [
        'Protect confidentiality and support authorized sharing',
        'Follow privacy policy, clarify consent and offer ways for the patient to discuss relevant information with relatives and qualified counselors.',
      ],
      [
        'Tell the brother that he cannot seek advice unless she releases her report',
        'He may seek his own clinical advice using his available history; withholding the report does not bar that.',
      ],
      [
        'Promise that no genetic result ever has relevance to relatives',
        'Genetic information may have family implications; privacy and supportive communication must both be addressed.',
      ],
    ],
    1,
    'How could the patient be supported to share useful information while retaining control over her report?'
  ),
  q(
    'gen-values',
    3,
    'challenge',
    'evaluate_outcomes',
    ['sharedDecisions', 'geneticCounselling'],
    'After a risk discussion, Tomas can repeat percentages but says, “I still do not know which option fits my wish to avoid repeated travel and unnecessary procedures.”',
    'How should the proposed options be compared with this person’s priorities and practical burdens?',
    [
      [
        'Conclude that knowing the numbers means the decision is complete',
        'Recall of information is not the same as choosing an option that fits informed preferences.',
      ],
      [
        'Choose the most intensive option because it appears safest for everyone',
        'More intensive care can have burdens and harms; the decision should reflect the person’s clinical situation and preferences.',
      ],
      [
        'Ask Tomas to choose without discussing his concerns further',
        'A decision without exploring practical consequences may leave him poorly supported.',
      ],
      [
        'Compare benefits, harms and burdens with his priorities',
        'Connect evidence to what matters to Tomas, check understanding and agree a feasible plan with room to revisit the decision.',
      ],
    ],
    3,
    'What would demonstrate an informed choice rather than agreement with the clinician?'
  ),
  q(
    'gen-ancestry-drug',
    3,
    'advanced',
    'analyze_cues',
    ['pharmacogenetics', 'medicationSafety'],
    'A colleague assumes a patient has a specific drug-metabolism variant based on perceived ancestry. No genotype is available. The patient has a new adverse-effect concern and several potentially interacting medicines.',
    'How should an ancestry-based drug assumption be replaced with an individual medication-safety assessment?',
    [
      [
        'Individual assessment and validated drug-specific guidance',
        'Ancestry is not an individual genotype result. Review observed response, interactions and relevant evidence; validated genetic information may contribute if available.',
      ],
      [
        'Record the assumed genotype as a confirmed laboratory finding',
        'An inferred group association cannot be documented as an individual test result.',
      ],
      [
        'Ignore the adverse effect because pharmacogenetics is the only relevant factor',
        'Drug response also depends on illness, organ function, exposure and interactions; clinical vigilance remains essential.',
      ],
      [
        'Tell the patient to adjust the medicine using an ancestry-based rule',
        'An unsupported adjustment could cause harm; medication changes require an authorized individualized plan.',
      ],
    ],
    0,
    'Which evidence would change an assumption about metabolism into a clinically usable finding?'
  ),
  q(
    'gen-consumer-test',
    3,
    'advanced',
    'generate_solutions',
    ['geneticCounselling', 'geneticConsent'],
    'Nia has a consumer genetic report stating “no variants detected.” A relative’s clinical report documents a specific pathogenic variant, but it is unclear whether Nia’s consumer test assessed it.',
    'How should this consumer genetic report be evaluated before changing inherited-risk care?',
    [
      [
        'Accept the consumer result as a true negative for every inherited disorder',
        'A negative result only addresses what the test validly assessed; it cannot exclude all inherited conditions.',
      ],
      [
        'Ignore the relative’s report because Nia feels healthy',
        'Being asymptomatic does not resolve the relevance of a documented familial variant.',
      ],
      [
        'Qualified review of test scope and the familial finding',
        'The two reports may answer different questions. A genetics professional can interpret coverage, clinical validity and informed options before the care plan changes.',
      ],
      [
        'Tell Nia that the consumer result confirms she carries the familial variant',
        'An inadequately characterized negative result does not establish a positive genotype either.',
      ],
    ],
    2,
    'What would make a negative result informative for this particular family?'
  ),
  q(
    'gen-new-symptom',
    3,
    'advanced',
    'prioritize_hypotheses',
    ['familyHistory', 'sharedDecisions'],
    'While waiting for clarification of an uncertain family cancer history, a patient develops persistent rectal bleeding and unexplained weight loss. He asks whether assessment should wait until the genetic records arrive.',
    'Which plan best separates present symptoms from inherited-risk assessment?',
    [
      [
        'Delay symptom assessment until the pedigree is complete',
        'Unresolved inherited-risk information should not delay assessment of new concerning symptoms.',
      ],
      [
        'Assess symptoms promptly; clarify family history in parallel',
        'Current symptoms need their own diagnostic pathway. Genetic risk work can continue without becoming a gatekeeper to timely assessment.',
      ],
      [
        'Assume hereditary cancer is confirmed and stop further investigation',
        'The findings warrant assessment but do not establish a diagnosis or hereditary cause.',
      ],
      [
        'Use a negative test in a distant relative to dismiss the symptoms',
        'Another person’s result cannot safely explain or exclude the patient’s current symptoms.',
      ],
    ],
    1,
    'How could attention to a genetic explanation accidentally delay a more immediate diagnostic task?'
  ),
  q(
    'gen-tumor-vs-inherited',
    3,
    'advanced',
    'analyze_cues',
    ['geneticCounselling'],
    'A tumor-sequencing report identifies a mutation that may guide cancer treatment. The patient concludes that her children must carry the same mutation, but no inherited-risk assessment has been completed.',
    'What can a tumor test establish about inherited risk to relatives?',
    [
      [
        'A tumor result proves that every child inherited the mutation',
        'Tumor findings are not automatically inherited, and inheritance cannot be assigned to relatives from this report alone.',
      ],
      [
        'A tumor result can never have implications for inherited risk',
        'Some findings may warrant inherited-risk assessment; dismissing all family relevance is also incorrect.',
      ],
      [
        'The children should change their screening without any further review',
        'Screening decisions require appropriate interpretation of the patient’s and family’s actual risk.',
      ],
      [
        'Tumor findings need review before inferring inherited status',
        'Distinguish tumor-directed testing from germline assessment. Further evaluation may be appropriate, but the tumor result alone does not establish relatives’ status.',
      ],
    ],
    3,
    'Which question is the tumor test answering, and which question remains unanswered?'
  ),
  q(
    'gen-access-plan',
    3,
    'advanced',
    'evaluate_outcomes',
    ['sharedDecisions', 'geneticConsent'],
    'A patient agreed to genetics counseling but missed two appointments because travel required unpaid leave. The record now says “noncompliant.” She still wants help and is worried about the possible implications of testing.',
    'What should missed counseling visits due to lost wages change about the genetics care pathway?',
    [
      [
        'Explore barriers and arrange a voluntary, feasible pathway',
        'A missed appointment can reveal a mismatch between the plan and the person’s circumstances. Revisit access, communication and the choice about testing without blame.',
      ],
      [
        'Close the referral because two missed visits demonstrate refusal',
        'Missed visits do not by themselves establish an informed decision to decline care.',
      ],
      [
        'Order testing without counseling to avoid another appointment',
        'Removing informed discussion does not resolve the person’s concerns or access needs.',
      ],
      [
        'Repeat the same appointment instructions without exploring the barrier',
        'Unchanged instructions are unlikely to solve a documented practical obstacle.',
      ],
    ],
    0,
    'What evidence would show that the revised pathway is accessible and still voluntary?'
  ),
]
