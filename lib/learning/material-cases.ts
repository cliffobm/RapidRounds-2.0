import { pillars } from './pillars'
import type {
  CaseFrame,
  EvolvingCase,
  EvolvingQuestion,
  Observation,
} from './evolving-types'

// Original fictional teaching cases, authored 22 October 2026. The supplied
// pharmacology/med-surg material informed topic coverage, not copied questions.
// Current clinical checks: APSF OIVI monitoring; FDA opioid/CNS-depressant warning;
// ADA Standards of Care 2026 section 16; NICE NG148/CG174/CG50; UKKA July 2026.
// Sources are registered centrally. All cases remain drafts for clinical review.
type Option = [text: string, explanation: string]
type Vitals = [
  minute: number,
  hr: number,
  bp: string,
  rr: number,
  temperature: number,
  spo2: number,
]
const q = (
  prompt: string,
  options: [Option, Option, Option, Option],
  correct: number[],
  reflection: string
): EvolvingQuestion => ({
  prompt,
  options: options.map(([text, explanation], index) => ({
    id: String(index),
    text,
    explanation,
  })),
  correct: correct.map(String),
  reflection,
})
const frame = (
  stage: number,
  update: string,
  evidence: string[],
  vitals: Vitals,
  note: string,
  question: EvolvingQuestion,
  challenge: EvolvingQuestion,
  advanced: EvolvingQuestion
): CaseFrame => {
  const [minute, hr, bp, rr, temperature, spo2] = vitals
  const observation: Observation = {
    minute,
    hr,
    bp,
    rr,
    temperature,
    spo2,
    note,
  }
  return {
    skill: pillars[stage]!.id,
    update,
    evidence,
    observation,
    question,
    challenge,
    advanced,
    complex: question,
  }
}

const opioidFrames: CaseFrame[] = [
  frame(
    0,
    'Mara, 58, is increasingly sleepy after postoperative opioid analgesia. You remain at the bedside and request urgent help while assessing breathing.',
    [
      'Previously alert with RR 16/min on room air; now opens eyes briefly to voice and breathes shallowly at 10/min.',
      'SpO₂ is 98% on prescribed oxygen at 2 L/min. A benzodiazepine was given earlier for the procedure.',
      'Mara has obstructive sleep apnea; the home CPAP device has not arrived.',
    ],
    [0, 72, '112/68', 10, 36.7, 98],
    'Shallow breathing; oxygen 2 L/min; arousal is harder than at handover.',
    q(
      'Which finding most directly signals an immediate safety problem for Mara?',
      [
        [
          'A pain score lower than the preoperative score',
          'Analgesia can reduce pain, but the lower score does not establish safe breathing or alertness.',
        ],
        [
          'New difficulty staying awake with shallow breathing',
          'The change in arousal and breathing requires prompt assessment and response even with a reassuring saturation.',
        ],
        [
          'The home CPAP device has not yet arrived',
          'The missing device is relevant risk information; the current change in consciousness and ventilation is more immediate.',
        ],
        [
          'A pulse slower than before the operation',
          'Pulse contributes to the assessment, but this value alone is less direct than the new impaired arousal and shallow breaths.',
        ],
      ],
      [1],
      'Describe a change in the patient, rather than relying on a single monitor value.'
    ),
    q(
      'Which TWO details explain why Mara’s 98% saturation should not end the respiratory assessment?',
      [
        [
          'Oxygen is being supplied while breathing is becoming shallower',
          'Supplemental oxygen can preserve saturation despite impaired ventilation; the breathing pattern still needs assessment.',
        ],
        [
          'The temperature is below the usual fever range',
          'Temperature does not establish adequate ventilation and does not explain away reduced arousal.',
        ],
        [
          'Arousal has changed after medicines that can depress the central nervous system',
          'The medication context and reduced responsiveness strengthen concern about ventilatory impairment.',
        ],
        [
          'The pain score improved after treatment',
          'Pain relief may be desirable, but it is not evidence that ventilation or airway protection remains adequate.',
        ],
      ],
      [0, 2],
      'Separate oxygenation from ventilation when interpreting an apparently reassuring monitor.'
    ),
    q(
      'A colleague suggests leaving Mara asleep because the oxygen saturation is normal. Which response best addresses the competing evidence?',
      [
        [
          'Confirm the oxygen probe and compare the pulse before deciding whether the sleepiness matters',
          'Probe checks can be useful, but should not postpone a response to a directly observed change in breathing and arousal.',
        ],
        [
          'Use the previous respiratory rate to determine whether the current opioid order was appropriate',
          'The previous rate is useful baseline data; deciding whether an order was appropriate does not address the immediate change.',
        ],
        [
          'Obtain the CPAP device before making a new assessment of breathing or calling the clinical team',
          'Sleep apnea is relevant, but waiting for equipment would delay assessment and urgent support of the current problem.',
        ],
        [
          'Explain that oxygen can mask a ventilation problem and continue urgent bedside assessment',
          'The observed deterioration outweighs reassurance from saturation on oxygen; assess airway, ventilation and consciousness while help arrives.',
        ],
      ],
      [3],
      'State both the reassuring finding and why it does not resolve the risk.'
    )
  ),
  frame(
    1,
    'The response nurse arrives. Mara now needs repeated stimulation to open the eyes; respirations are 8/min with pauses. The team begins immediate airway and breathing support.',
    [
      'Medication administration record confirms a recent opioid and an earlier benzodiazepine; the medication times are available.',
      'No new focal weakness is apparent on the brief assessment, but this does not establish a diagnosis.',
      'A patent IV is present. Oxygen remains at 2 L/min; SpO₂ remains 98%.',
    ],
    [3, 68, '106/64', 8, 36.7, 98],
    'Repeated stimulation needed; pauses observed; urgent team at bedside.',
    q(
      'Which explanation should be actively considered while Mara receives immediate support?',
      [
        [
          'Sleep deprivation as the confirmed cause of the pauses',
          'Sleep deprivation does not adequately explain this deterioration after sedating medicines and should not be treated as confirmed.',
        ],
        [
          'A normal recovery pattern because saturation is unchanged',
          'Unchanged saturation on supplemental oxygen cannot establish that the reduced ventilation is normal or safe.',
        ],
        [
          'Medication-related ventilatory impairment, with other causes assessed',
          'The temporal association and interacting risk factors make this a serious working concern, without excluding other acute causes.',
        ],
        [
          'An opioid allergy proven by the slower respiratory rate',
          'Respiratory depression is not the same as allergy; no allergic reaction has been established from these findings.',
        ],
      ],
      [2],
      'Use a working hypothesis to guide safety actions without closing the differential.'
    ),
    q(
      'Which medication-history detail most changes the interpretation of Mara’s sleepiness?',
      [
        [
          'The benzodiazepine and opioid were both administered before the decline',
          'The sequence supports a possible combined depressant effect and should be conveyed with doses and times from the record.',
        ],
        [
          'The opioid was prescribed by the surgical team rather than the home clinician',
          'Prescriber identity does not determine whether the current medication effect is safe; the actual exposures and response matter.',
        ],
        [
          'Mara used a different brand of pain medicine during a previous admission',
          'A previous brand may inform history but is less immediate than the verified current exposures and deterioration.',
        ],
        [
          'The analgesia prescription includes an as-needed interval for later doses',
          'An allowed interval does not override a new adverse response; further doses require reassessment and review.',
        ],
      ],
      [0],
      'A medication timeline often explains more than a medication list alone.'
    ),
    q(
      'Which THREE assessments should proceed in parallel with the team’s immediate support, rather than waiting for a confirmed drug cause?',
      [
        [
          'Depth and regularity of breathing, airway patency and response to support',
          'These establish the immediate physiologic threat and whether airway and ventilation interventions are working.',
        ],
        [
          'Arousal, bedside glucose and a focused check for another acute neurologic cause',
          'Medication exposure can coexist with metabolic or neurologic problems; focused checks reduce diagnostic anchoring.',
        ],
        [
          'A complete discharge medication teaching session with Mara’s family',
          'Discharge teaching is useful later, but it should not compete with assessment and support during impaired responsiveness.',
        ],
        [
          'Verified medication times, other depressants and the baseline sleep-apnea plan',
          'The timeline and interacting risks help the team select and evaluate a safe response while acute support continues.',
        ],
      ],
      [0, 1, 3],
      'Keep the differential open while treating the immediate physiologic problem.'
    )
  ),
  frame(
    2,
    'Mara remains difficult to arouse while the team supports ventilation and prepares the local opioid emergency pathway. There is a pulse; no cardiac arrest is reported.',
    [
      'Breathing is shallow with pauses despite brief arousal to stimulation.',
      'The team has emergency equipment and the medication record at the bedside.',
      'The scheduled pain reassessment is due, but effective ventilation is the immediate concern.',
    ],
    [5, 70, '104/62', 8, 36.7, 98],
    'Ventilation is being supported by the trained response team.',
    q(
      'Which priority should lead Mara’s care at this point?',
      [
        [
          'Complete the pain questionnaire before altering the care plan',
          'The pain assessment can be adapted, but it must not delay airway and ventilation support during reduced consciousness.',
        ],
        [
          'Finish the medication incident report before calling for another clinician',
          'Reporting matters after immediate safety needs are addressed; the bedside threat requires action now.',
        ],
        [
          'Treat the preserved oxygen saturation as sufficient respiratory recovery',
          'Saturation on oxygen is not proof of adequate ventilation or sustained arousal.',
        ],
        [
          'Support airway and breathing while the team treats the suspected cause',
          'Physiologic support and prompt prescribed or protocol-based treatment take priority over routine documentation and teaching.',
        ],
      ],
      [3],
      'Prioritize the consequence of deterioration, not simply the most likely label.'
    ),
    q(
      'Which TWO actions would create an unsafe delay while Mara has pauses and poor arousal?',
      [
        [
          'Providing the response team with the confirmed opioid administration time',
          'The exposure time helps guide treatment and monitoring and can be communicated while immediate support continues.',
        ],
        [
          'Waiting for oxygen saturation to fall before activating further support',
          'Supplemental oxygen may delay desaturation; observed ventilatory impairment already requires an urgent response.',
        ],
        [
          'Continuing airway support while the emergency medication is prepared',
          'Immediate support must continue while prescribed or protocol-based treatment is prepared; these actions complement each other.',
        ],
        [
          'Waiting for a complete medication reconciliation before supporting breathing',
          'A full reconciliation is not a prerequisite for supporting a failing airway or inadequate ventilation.',
        ],
      ],
      [1, 3],
      'Choose actions that can run together, and identify those that unnecessarily delay rescue.'
    ),
    q(
      'A trainee proposes relying on a reversal medicine alone while moving on to another patient. What is the best correction?',
      [
        [
          'Reversal should be avoided because it can interfere with postoperative pain relief',
          'Pain management matters, but a concern about returning pain must not block emergency treatment of life-threatening ventilatory impairment.',
        ],
        [
          'Maintain bedside airway support and monitoring; reversal does not establish sustained recovery',
          'Reversal is part of the response, not a substitute for ventilation support and continued assessment of response or recurrence.',
        ],
        [
          'The original opioid interval determines when further breathing assessment is needed',
          'The acute clinical response and local emergency pathway determine monitoring, not the routine analgesia interval.',
        ],
        [
          'Restoring the saturation to baseline confirms that airway support can end',
          'Oxygen saturation alone does not confirm sustained ventilation, protective reflexes or alertness, especially during oxygen therapy.',
        ],
      ],
      [1],
      'Rescue treatment needs an explicit response assessment and a plan for recurrence.'
    )
  ),
  frame(
    3,
    'Following supported ventilation and prescribed reversal under the local pathway, Mara answers questions and breathes at 14/min. The team is developing a safer ongoing analgesia and monitoring plan.',
    [
      'Pain has returned to 6/10; Mara is concerned that all pain treatment will be stopped.',
      'Sleep apnea, the earlier benzodiazepine and the response to rescue are included in the handover.',
      'A clinician and pharmacist are reviewing further sedating medicines and available analgesic options.',
    ],
    [12, 82, '116/70', 14, 36.7, 97],
    'Awake to conversation; oxygen 2 L/min; team review continues.',
    q(
      'Which plan best addresses both Mara’s safety and pain?',
      [
        [
          'Review analgesic options and monitoring with the team while reassessing breathing and function',
          'The plan should address pain and functional goals while reducing depressant risk and watching for recurrent ventilatory impairment.',
        ],
        [
          'Resume the original analgesia plan because one respiratory assessment improved',
          'One improvement after rescue does not establish that the previous plan is safe or that the effect will persist.',
        ],
        [
          'Stop all pain assessment because further treatment would be too dangerous',
          'Pain still requires assessment and an individualized plan; avoiding it entirely can impair recovery and is not a complete safety strategy.',
        ],
        [
          'Offer the earlier sedative again so that Mara can sleep despite the pain',
          'Additional depressants may compound the current risk and should not be offered without appropriate clinical review.',
        ],
      ],
      [0],
      'Safety and symptom control should be planned together.'
    ),
    q(
      'Which TWO elements belong in Mara’s individualized follow-up plan?',
      [
        [
          'A return to the routine observation schedule after this single awake assessment',
          'The recent rescue and interacting risk factors require a team-defined monitoring plan; one assessment is insufficient.',
        ],
        [
          'A shared target for acceptable pain and ability to cough, move and participate in recovery',
          'A functional target helps the team evaluate analgesia rather than pursuing a pain score alone.',
        ],
        [
          'A monitoring and escalation plan for sedation and ventilation, including recurrence',
          'The plan needs clear responsibility and a response to declining arousal or breathing, rather than relying only on saturation.',
        ],
        [
          'A promise that CPAP removes the need to review concurrent sedating medicines',
          'Sleep-apnea therapy does not remove the effects of interacting drugs or the need for assessment and medication review.',
        ],
      ],
      [1, 2],
      'Specify what success looks like and what change should trigger another response.'
    ),
    q(
      'Mara asks for the same opioid again because the pain is now 6/10. Which response best balances analgesia, autonomy and the recent event?',
      [
        [
          'Explain that any opioid request after a respiratory event indicates drug-seeking behavior',
          'A request for pain relief is not evidence of drug-seeking; stigmatizing it undermines assessment and shared planning.',
        ],
        [
          'Offer only reassurance until all sedating medicines have completely cleared',
          'Reassurance alone leaves pain and function untreated; the team should develop an individualized plan while monitoring safety.',
        ],
        [
          'Acknowledge the pain, reassess function and ask the team to revise the analgesia plan before further opioid',
          'The response respects the symptom while addressing the observed harm, interacting medicines and monitoring needs before further exposure.',
        ],
        [
          'Use the patient’s preferred medicine without review once the pain score exceeds the earlier score',
          'Patient preferences matter, but a score does not override a serious adverse response or replace a revised safety plan.',
        ],
      ],
      [2],
      'Respect the patient’s goal while explaining how the observed response changes the next decision.'
    )
  ),
  frame(
    4,
    'During continued monitoring, Mara becomes sleepy again and respirations fall to 9/min. You alert the response team immediately and support airway and breathing within your training.',
    [
      'Mara initially improved after reversal; no further opioid has been administered.',
      'SpO₂ is 97% on 2 L/min; the new decline in arousal is directly observed.',
      'The team’s emergency pathway and prescribed rescue orders remain available.',
    ],
    [30, 74, '110/66', 9, 36.7, 97],
    'Recurrent shallow breathing after initial improvement; urgent reassessment underway.',
    q(
      'What should you do when Mara becomes difficult to keep awake again?',
      [
        [
          'Document the change for the next routine medication round',
          'Documentation should accompany a timely response, not postpone it during recurrent ventilatory impairment.',
        ],
        [
          'Call for urgent reassessment and support breathing under the local emergency pathway',
          'The recurrence requires another immediate response even though no further opioid was given and saturation is preserved.',
        ],
        [
          'Give another analgesic first because agitation may be causing the irregular breathing',
          'The observed problem is reduced arousal with slow shallow breathing; further sedating medication could compound the risk.',
        ],
        [
          'Disconnect the oxygen briefly to determine whether true desaturation develops',
          'Removing prescribed oxygen to provoke a monitor change is unsafe and unnecessary; clinical deterioration is already evident.',
        ],
      ],
      [1],
      'Act on the recurrent clinical change without waiting for another monitor to confirm it.'
    ),
    q(
      'Which TWO facts must be emphasized when reporting Mara’s recurrent deterioration?',
      [
        [
          'The initial response to rescue followed by recurrent impaired arousal and slow breathing',
          'The sequence shows that the initial improvement did not persist and is central to reassessing ongoing treatment and monitoring.',
        ],
        [
          'The unchanged saturation proves that the first rescue medicine failed',
          'Saturation on oxygen neither proves failure nor establishes recovery; describe the breathing and arousal response instead.',
        ],
        [
          'No further opioid was given, so recurrence cannot be related to the earlier exposure',
          'Effects can recur after initial reversal; lack of another dose does not exclude ongoing medication-related risk.',
        ],
        [
          'The verified exposure and rescue times, with current oxygen and respiratory observations',
          'The time course and current support help the team assess recurrence and decide on further prescribed treatment.',
        ],
      ],
      [0, 3],
      'A useful escalation includes the response over time, not just the latest vital signs.'
    ),
    q(
      'A transfer team is ready for an unmonitored trip to routine imaging. Which THREE actions are appropriate now that Mara’s breathing has worsened again?',
      [
        [
          'Proceed after increasing oxygen until the saturation reaches the previous value',
          'A higher saturation would not establish safe ventilation, alertness or suitability for an unmonitored transfer.',
        ],
        [
          'Pause the routine transfer and obtain a fresh clinical assessment of stability',
          'The recurrence changes transfer risk; reassessment should precede nonurgent movement away from immediate support.',
        ],
        [
          'Continue the local emergency response and prescribed rescue assessment at the bedside',
          'Immediate support and treatment evaluation remain priorities during recurrent impaired ventilation.',
        ],
        [
          'Arrange monitoring, trained support and a clear handover if transfer later becomes necessary',
          'A transfer plan must reflect the patient’s actual monitoring and rescue needs, including risk of recurrence.',
        ],
      ],
      [1, 2, 3],
      'A previously agreed workflow must change when the patient’s physiologic state changes.'
    )
  ),
  frame(
    5,
    'After further team-directed care, Mara stays awake during conversation and breathes more deeply at 15/min. Pain is 4/10 and Mara can cough with support; enhanced monitoring continues.',
    [
      'There have been repeated stable assessments during this observation period; no recurrent pauses are observed.',
      'The team has documented an individualized analgesia plan and responsibilities for monitoring.',
      'Oxygen remains prescribed at 2 L/min; readiness to reduce support will be assessed by the team.',
    ],
    [60, 80, '118/72', 15, 36.7, 97],
    'Sustained arousal and deeper breathing on prescribed oxygen; ongoing enhanced monitoring.',
    q(
      'Which finding best supports improvement in Mara’s immediate respiratory safety?',
      [
        [
          'A lower pain score than immediately after reversal',
          'Pain improvement is useful but does not demonstrate adequate sustained ventilation or alertness.',
        ],
        [
          'The same saturation on the same oxygen flow',
          'Preserved saturation is useful but can persist despite impaired ventilation; it cannot establish recovery by itself.',
        ],
        [
          'Sustained alertness with deeper regular breathing on repeated assessments',
          'The repeated clinical response directly addresses the earlier problem; continued monitoring is still needed.',
        ],
        [
          'The absence of another opioid administration since rescue',
          'Avoiding further exposure may reduce risk, but medication history alone does not prove physiologic recovery.',
        ],
      ],
      [2],
      'Judge recovery using the same clinical problems that prompted the urgent response.'
    ),
    q(
      'Which TWO outcomes show that Mara’s revised plan is meeting both respiratory and recovery goals?',
      [
        [
          'Mara can cough with tolerable pain and participate in conversation',
          'Function and sustained arousal show progress toward analgesia and safety goals rather than a pain score alone.',
        ],
        [
          'Mara has no memory of the rescue, so further monitoring can be reduced',
          'Memory of the event does not predict recurrence risk or determine the required monitoring.',
        ],
        [
          'A single normal saturation is recorded immediately after oxygen adjustment',
          'A single oxygen-supported measurement does not establish sustained ventilation or safe analgesia.',
        ],
        [
          'Breathing remains regular and arousal stable across the team-defined observation period',
          'Repeated findings make the response more credible and support ongoing evaluation of the individualized plan.',
        ],
      ],
      [0, 3],
      'Evaluate symptom relief, function and safety together over time.'
    ),
    q(
      'Which conclusion is best supported before Mara leaves enhanced monitoring?',
      [
        [
          'The trend is improving, but the team must verify sustained stability and a safe follow-up plan',
          'Repeated improvement is encouraging; monitoring and disposition still require individualized review after recurrence and interacting risks.',
        ],
        [
          'A full conversation excludes the possibility of another respiratory event later',
          'One activity cannot eliminate recurrence risk; the response must be interpreted across time and within the clinical plan.',
        ],
        [
          'Pain of 4/10 means the original medication regimen can be reinstated unchanged',
          'The acceptable pain level does not erase the adverse response or justify restarting an unrevised regimen.',
        ],
        [
          'CPAP availability alone determines when respiratory monitoring can stop',
          'Sleep-apnea support is one part of care; the recent event, medications and observed response also determine monitoring needs.',
        ],
      ],
      [0],
      'Distinguish evidence of improvement from a decision that requires broader clinical review.'
    )
  ),
]

const glucoseFrames: CaseFrame[] = [
  frame(
    0,
    'Ellis, 43, has type 1 diabetes. Lunch was delayed after prescribed mealtime insulin. Ellis is sweaty, tremulous and having difficulty concentrating; the bedside glucose is 58 mg/dL (3.2 mmol/L). You remain with Ellis and activate the local hypoglycaemia pathway.',
    [
      'Ellis is awake and initially able to follow instructions.',
      'Breakfast intake was smaller than usual. The insulin administration time is verified.',
      'The patient was conversing normally at the previous observation.',
    ],
    [0, 106, '128/74', 20, 36.8, 98],
    'New autonomic symptoms and difficulty concentrating; immediate treatment pathway activated.',
    q(
      'Which new cue should drive Ellis’s immediate care?',
      [
        [
          'The lunch tray is later than usual',
          'The delayed meal contributes to the risk, but the symptomatic low glucose is the immediate problem.',
        ],
        [
          'A temperature within the usual adult range',
          'A reassuring temperature does not reduce the need to respond to the glucose and symptoms.',
        ],
        [
          'Low glucose accompanied by sweating and impaired concentration',
          'The symptoms and measured glucose form an urgent cue cluster requiring the local response.',
        ],
        [
          'The recorded diagnosis of type 1 diabetes alone',
          'The diagnosis provides context; the current change establishes the immediate concern.',
        ],
      ],
      [2],
      'Connect the measurement with the change in the person.'
    ),
    q(
      'Which TWO facts most strongly support a mismatch between insulin action and carbohydrate availability?',
      [
        [
          'The mealtime dose was given before the delayed lunch',
          'The verified exposure and meal timing support a plausible mechanism for the low glucose.',
        ],
        [
          'Ellis is younger than many other ward patients',
          'Age alone does not establish why this episode occurred.',
        ],
        [
          'Oxygen saturation is 98% on room air',
          'Saturation does not establish adequate circulating glucose.',
        ],
        [
          'Breakfast intake was reduced and lunch has not arrived',
          'The intake history adds relevant information about available carbohydrate.',
        ],
      ],
      [0, 3],
      'Build a timeline that includes actual intake rather than the meal order alone.'
    ),
    q(
      'A colleague proposes waiting for a laboratory glucose before beginning the local pathway. Which response best weighs accuracy against delay?',
      [
        [
          'Send the sample, then leave Ellis resting until it returns',
          'Laboratory confirmation must not become a reason to leave a symptomatic patient without immediate care.',
        ],
        [
          'Respond to the symptomatic bedside result now while checking any measurement concern in parallel',
          'Immediate management and verification can proceed together; the clinical pattern makes delay unsafe.',
        ],
        [
          'Disregard the reading because Ellis can still answer a question',
          'Being able to answer does not exclude clinically important hypoglycaemia or deterioration.',
        ],
        [
          'Give the scheduled next insulin dose to test the first result',
          'Additional insulin is not a diagnostic test and would require urgent review of the current situation.',
        ],
      ],
      [1],
      'Explain what can be verified without postponing care.'
    )
  ),
  frame(
    1,
    'While the team assesses Ellis, the glucose is 51 mg/dL (2.8 mmol/L). Ellis is now drowsier and coughs when trying to sip. Oral intake is stopped and the trained team uses the appropriate prescribed emergency pathway.',
    [
      'The change in swallowing safety is new.',
      'The team has the medication record and emergency equipment.',
      'No food or drink is forced; airway and responsiveness are monitored.',
    ],
    [4, 110, '124/72', 20, 36.8, 98],
    'Drowsiness and unsafe swallowing; trained team providing non-oral emergency care.',
    q(
      'Which change makes further oral carbohydrate unsafe for Ellis at this point?',
      [
        [
          'A pulse above the earlier baseline',
          'Pulse helps track the response, but swallowing safety directly determines whether oral intake is appropriate.',
        ],
        [
          'Coughing with a sip and increasing drowsiness',
          'Reduced alertness and coughing raise an immediate aspiration concern requiring a different treatment route.',
        ],
        [
          'The delayed meal has now reached the ward',
          'Food availability does not establish that the patient can swallow safely.',
        ],
        [
          'Ellis has previously treated low glucose independently',
          'Past independence cannot establish current swallowing safety during reduced consciousness.',
        ],
      ],
      [1],
      'A change in function can alter the route of a safe intervention.'
    ),
    q(
      'Which interpretation best integrates Ellis’s worsening concentration, glucose and swallowing?',
      [
        [
          'The swallowing difficulty proves a new stroke and excludes the low glucose',
          'Another neurologic cause may need assessment, but a definitive diagnosis cannot be made by excluding a measured metabolic problem.',
        ],
        [
          'The lower reading matters only if the oxygen saturation also falls',
          'Glucose-related neurologic deterioration can occur while oxygen saturation remains normal.',
        ],
        [
          'This is deterioration during hypoglycaemia that changes treatment safety and requires continued assessment',
          'The new functional impairment changes the immediate plan while the team evaluates the broader clinical picture.',
        ],
        [
          'The episode is resolving because Ellis is quieter',
          'Reduced responsiveness is not evidence of recovery.',
        ],
      ],
      [2],
      'Avoid mistaking reduced activity for clinical improvement.'
    ),
    q(
      'Which TWO actions should proceed while the team uses the non-oral emergency pathway?',
      [
        [
          'Observe airway, breathing and responsiveness and report further change',
          'Support and surveillance continue while the metabolic problem is treated.',
        ],
        [
          'Ask Ellis to finish the juice slowly to complete the earlier plan',
          'Continuing oral intake after new swallowing concerns introduces aspiration risk.',
        ],
        [
          'Reconcile the insulin and intake timeline and arrange repeat glucose under the local pathway',
          'The timeline informs recurrence prevention; repeat assessment evaluates whether treatment is effective.',
        ],
        [
          'Begin a detailed carbohydrate-counting lesson while Ellis is drowsy',
          'Teaching should wait until the patient can participate safely and effectively.',
        ],
      ],
      [0, 2],
      'Immediate support and investigation of the cause can proceed together.'
    )
  ),
  frame(
    2,
    'After prescribed treatment, Ellis is alert, swallowing safely and has a glucose of 96 mg/dL (5.3 mmol/L). The next meal and insulin plan are being reviewed.',
    [
      'Ellis remembers little of the deterioration.',
      'The rapid-acting insulin exposure may remain relevant to recurrence.',
      'Repeat monitoring and a suitable intake plan have been arranged.',
    ],
    [15, 94, '126/72', 18, 36.8, 98],
    'Initial response to emergency treatment; recurrence monitoring remains active.',
    q(
      'What should the nurse assess before Ellis eats now?',
      [
        [
          'Whether Ellis is alert and can swallow safely',
          'Return of alertness and swallowing safety support an appropriate oral intake plan after emergency treatment.',
        ],
        [
          'Whether the first low reading can be removed from the chart',
          'The earlier episode remains clinically important and must stay in the record.',
        ],
        [
          'Whether the normal reading makes further checks unnecessary',
          'An initial normal reading does not establish sustained stability.',
        ],
        [
          'Whether every diabetes medicine can be stopped permanently',
          'Medication changes require individualized clinical review; blanket cessation is not appropriate.',
        ],
      ],
      [0],
      'Check recovery of function as well as the glucose value.'
    ),
    q(
      'Which TWO concerns remain despite the 96 mg/dL reading?',
      [
        [
          'Ellis’s earlier memory gap must mean a permanent neurologic injury',
          'A memory gap needs assessment, but it does not establish permanent injury.',
        ],
        [
          'Insulin action and reduced intake may cause a further fall',
          'The original mismatch may persist after the first treatment response.',
        ],
        [
          'The same mealtime plan must be repeated because it was prescribed',
          'A previously valid order may need review when intake and clinical circumstances change.',
        ],
        [
          'Ellis needs a feasible nutrition and monitoring plan before routine care resumes',
          'A sustained response depends on reassessment and prevention of another mismatch.',
        ],
      ],
      [1, 3],
      'Separate immediate correction from prevention of recurrence.'
    ),
    q(
      'Which nursing recommendation best balances hypoglycaemia prevention with Ellis’s type 1 diabetes?',
      [
        [
          'Stop all insulin for the rest of the admission once a low reading occurs',
          'Basal insulin has an essential role in type 1 diabetes; indiscriminate cessation can create serious metabolic risk.',
        ],
        [
          'Restart every order unchanged because the latest glucose is normal',
          'The response does not explain away the episode or establish that the previous plan still fits.',
        ],
        [
          'Request individualized review of basal, mealtime and correction components alongside intake and monitoring',
          'Different insulin components have different purposes; revise the plan with the authorized team rather than treating all insulin as interchangeable.',
        ],
        [
          'Use only oxygen saturation to decide whether the insulin regimen is safe',
          'Oxygen saturation cannot evaluate the balance between insulin and carbohydrate availability.',
        ],
      ],
      [2],
      'Identify which part of a regimen is causing concern without discarding essential treatment.'
    )
  ),
  frame(
    3,
    'At the planned repeat check, Ellis feels shaky again and the glucose is 64 mg/dL (3.6 mmol/L). The team reactivates the local pathway while reviewing ongoing insulin effect and intake.',
    [
      'Ellis remains alert and the team reassesses swallowing before oral treatment.',
      'The later fall follows an initial response rather than a sustained recovery.',
      'Medication and meal documentation are checked together.',
    ],
    [35, 102, '126/74', 20, 36.8, 98],
    'Recurrent symptomatic low glucose; further treatment and review underway.',
    q(
      'What does the recurrent low glucose mean for the monitoring plan?',
      [
        [
          'The first normal reading can still be used to discharge Ellis from observation',
          'The new fall supersedes reassurance from a single earlier reading.',
        ],
        [
          'The first treatment was necessarily administered incorrectly',
          'Recurrence can reflect ongoing medication effect or inadequate intake; it does not prove an administration error.',
        ],
        [
          'The glucose device should be abandoned for all future checks',
          'A possible measurement issue can be evaluated, but it does not justify abandoning assessment during recurrent symptoms.',
        ],
        [
          'Continued treatment, repeat assessment and review of the cause are needed',
          'Recurrence shows that initial correction did not establish stability.',
        ],
      ],
      [3],
      'Use the latest trend to update the plan.'
    ),
    q(
      'Which explanation should be investigated first rather than assuming the earlier recovery was durable?',
      [
        [
          'Ongoing insulin action with insufficient carbohydrate intake',
          'This mechanism fits the verified exposure and meal history and can explain recurrence after initial correction.',
        ],
        [
          'A normal respiratory rate establishing normal glucose regulation',
          'Respiratory rate does not establish adequate glucose availability.',
        ],
        [
          'An inherited inability to respond to every form of treatment',
          'The case provides no evidence for that broad conclusion.',
        ],
        [
          'Deliberate refusal to cooperate with care',
          'The documented meal and medication mismatch should be investigated without attributing blame.',
        ],
      ],
      [0],
      'Explain recurrence using evidence rather than a judgment about the patient.'
    ),
    q(
      'Which THREE elements belong in the team’s revised prevention plan?',
      [
        [
          'A verified record of insulin products and administration times',
          'The actual exposure helps the team understand the period of continuing risk.',
        ],
        [
          'A workable intake plan reflecting nausea and meal delivery',
          'Food that is ordered but unavailable or uneaten cannot safely be treated as actual intake.',
        ],
        [
          'A fixed assumption that another normal value ends all recurrence risk',
          'Repeated assessment and the individualized pathway determine stability; one value is not a guarantee.',
        ],
        [
          'Repeat glucose and symptom checks with explicit escalation responsibilities',
          'A clear monitoring and response plan links detection of another decline to timely action.',
        ],
      ],
      [0, 1, 3],
      'Coordinate treatment, logistics and reassessment rather than changing a number alone.'
    )
  ),
  frame(
    4,
    'Ellis has recovered again and the glucose is 108 mg/dL (6.0 mmol/L). The prescriber and pharmacist review the regimen. Ellis explains that nausea made the planned lunch unrealistic.',
    [
      'Ellis wants to understand why another episode happened.',
      'Meal delivery, dose timing and actual intake are documented without blame.',
      'The revised plan distinguishes basal from intake-related insulin.',
    ],
    [60, 88, '128/76', 18, 36.8, 98],
    'Recovery with an individualized medication and intake plan under review.',
    q(
      'Which communication approach best supports Ellis’s participation?',
      [
        [
          'Tell Ellis that nausea is irrelevant once insulin has been given',
          'Symptoms affecting intake are important safety information and should be included in planning.',
        ],
        [
          'Ask Ellis to describe intake barriers and help agree a workable response',
          'The patient’s experience can reveal why a technically correct schedule failed in practice.',
        ],
        [
          'Ask only whether Ellis promises never to miss another meal',
          'A promise does not solve nausea or delayed access to food.',
        ],
        [
          'Finish teaching before Ellis has a chance to ask questions',
          'One-way instruction can miss concerns and misunderstandings about the revised plan.',
        ],
      ],
      [1],
      'Make the plan achievable in the patient’s actual circumstances.'
    ),
    q(
      'Which handover most usefully explains the risk to the next nurse?',
      [
        [
          '“Diabetes stable; last glucose normal”',
          'This omits the recurrent episodes, their context and the continuing monitoring plan.',
        ],
        [
          '“Ellis is difficult about meals”',
          'A character judgment conceals actionable information about symptoms and system barriers.',
        ],
        [
          '“There were two symptomatic falls after a meal-related dose; here are the times, intake and revised checks”',
          'The sequence, response and agreed plan allow the next nurse to continue surveillance safely.',
        ],
        [
          '“The event was treated, so no medication history is needed”',
          'The verified exposure remains relevant after immediate treatment.',
        ],
      ],
      [2],
      'Use a timeline and next actions to make the handover actionable.'
    ),
    q(
      'Which TWO teach-back demonstrations would best test whether the revised explanation is usable?',
      [
        [
          'Ellis describes whom to tell when nausea or a delayed meal disrupts the plan',
          'This checks the practical communication step needed to prevent another mismatch.',
        ],
        [
          'Ellis repeats the word “hypoglycaemia” without explaining it',
          'Reciting a term does not demonstrate recognition or use of a safety plan.',
        ],
        [
          'Ellis agrees to manage every future low without contacting the team',
          'The recent severe and recurrent episode requires clear support and escalation boundaries.',
        ],
        [
          'Ellis explains the agreed symptoms, checks and help-seeking steps in their own words',
          'This checks understanding of the individualized response rather than passive agreement.',
        ],
      ],
      [0, 3],
      'Evaluate the explanation through practical use, not a signature.'
    )
  ),
  frame(
    5,
    'Glucose is now 112 mg/dL (6.2 mmol/L); Ellis remains alert and has tolerated intake. The team continues the agreed observation period before deciding the next level of care.',
    [
      'No further fall has been recorded during the checks so far.',
      'The revised insulin and meal plan is available to the next shift.',
      'Ellis can explain when to ask for help.',
    ],
    [90, 84, '126/74', 18, 36.8, 98],
    'Improving trend; duration of monitoring remains individualized.',
    q(
      'Which finding best supports improvement in Ellis’s immediate condition?',
      [
        [
          'A completed incident-report form',
          'Reporting supports learning but does not measure physiologic recovery.',
        ],
        [
          'A new medication list without confirmation of actual intake',
          'A list alone cannot establish that the revised plan is working.',
        ],
        [
          'Stable alertness, tolerated intake and repeat glucose without another fall so far',
          'These findings connect symptoms, function and repeated measurements.',
        ],
        [
          'The absence of a high temperature',
          'Temperature does not evaluate recovery from this glucose-related event.',
        ],
      ],
      [2],
      'Evaluate the outcome that the care plan intended to achieve.'
    ),
    q(
      'Which conclusion is justified by the current trend?',
      [
        [
          'The individualized plan appears effective so far and must still be evaluated over the agreed period',
          'The observed response supports improvement without guaranteeing that recurrence is impossible.',
        ],
        [
          'Type 1 diabetes has resolved because glucose is now in range',
          'Correction of this episode does not remove the underlying condition.',
        ],
        [
          'Future meal delays can be ignored because Ellis knows the symptoms',
          'Knowledge supports safety but does not eliminate medication or system risks.',
        ],
        [
          'The exact original regimen is now proven safe for every future situation',
          'A response in this context cannot validate an unchanged regimen for all circumstances.',
        ],
      ],
      [0],
      'Match the strength of a conclusion to the duration and scope of the evidence.'
    ),
    q(
      'Which TWO outcomes should be included when evaluating whether the revised system reduces recurrence?',
      [
        [
          'Every patient has an identical insulin schedule regardless of intake',
          'Uniform schedules can recreate the mismatch that contributed to this episode.',
        ],
        [
          'Meal availability and intake changes are communicated before the next intake-related dose',
          'This evaluates whether the medication and nutrition processes now align.',
        ],
        [
          'Only the highest glucose is displayed in the handover',
          'Selecting a reassuring measurement hides clinically important variation and recurrence.',
        ],
        [
          'Further symptomatic or measured low episodes are tracked alongside response and contributing factors',
          'Tracking recurrence and context evaluates safety more meaningfully than one isolated result.',
        ],
      ],
      [1, 3],
      'Evaluate both the patient response and whether the care process changed.'
    )
  ),
]

// Each renal path has its own findings and level-specific decisions. No values
// are generated randomly; the clinically authored sequence is retained on replay.
type RenalRow = {
  update: string
  evidence: string[]
  vitals: Vitals
  note: string
  items: [EvolvingQuestion, EvolvingQuestion, EvolvingQuestion]
}
const renalFrames = (rows: RenalRow[]) =>
  rows.map((row, index) =>
    frame(index, row.update, row.evidence, row.vitals, row.note, ...row.items)
  )
function r(
  prompt: string,
  choices: [string, string, string, string],
  keys: number[],
  why: [string, string, string, string]
): EvolvingQuestion {
  return q(
    prompt,
    choices.map((text, index) => [text, why[index]!] as Option) as [
      Option,
      Option,
      Option,
      Option,
    ],
    keys,
    'Which patient finding would change your next assessment or escalation?'
  )
}
const lossFrames = renalFrames([
  {
    update:
      'Nadia, 67, has had vomiting and poor intake. Urine output has fallen over six hours. Creatinine increased from 0.9 to 1.6 mg/dL within 36 hours; the current blood pressure is lower than the recorded baseline.',
    evidence: [
      'Urine output is 0.3 mL/kg/hour over six hours; collection accuracy is checked.',
      'Nadia reports taking an over-the-counter NSAID while continuing prescribed blood-pressure medicines.',
      'There is no documented chronic elevation of creatinine; baseline BP was 132/76.',
    ],
    vitals: [0, 108, '96/60', 22, 37, 97],
    note: 'Reduced intake, falling pressure and reduced urine output; urgent assessment requested.',
    items: [
      r(
        'Which cluster most strongly signals a change in Nadia’s kidney function?',
        [
          'A single report of thirst without other findings',
          'Falling urine output and rising creatinine compared with baseline',
          'Age and the number of medication bottles',
          'A temperature below the fever range',
        ],
        [1],
        [
          'Thirst contributes to assessment but cannot establish the extent of the renal change.',
          'The urine and creatinine trends provide complementary evidence of an acute change requiring assessment.',
          'Age and polypharmacy provide context but do not establish current kidney function.',
          'A reassuring temperature cannot exclude acute kidney injury.',
        ]
      ),
      r(
        'Which TWO history details should be linked with Nadia’s current renal and perfusion changes?',
        [
          'Recent vomiting and reduced intake',
          'The position of the bed in the room',
          'Recent NSAID use and the actual prescription schedule',
          'The color of the medicine packaging',
        ],
        [0, 2],
        [
          'Losses and reduced intake can affect circulating volume and kidney perfusion.',
          'Bed location does not explain this clinical pattern.',
          'Potentially contributory exposures need a verified medication timeline and authorized review.',
          'Packaging color does not establish the drug, dose, exposure or effect.',
        ]
      ),
      r(
        'Nadia’s baseline creatinine was normal. Which interpretation best avoids false reassurance?',
        [
          'The earlier normal value rules out acute renal injury now',
          'A falling urine output can be assessed only after a full day has passed',
          'All current findings must be explained by an irreversible chronic disorder',
          'A substantial recent change matters even when a previous result was normal',
        ],
        [3],
        [
          'A previous normal value is useful precisely because it makes a new change visible.',
          'Current oliguria and clinical deterioration require assessment rather than a fixed wait.',
          'The sequence suggests an acute change; permanence and chronicity are not established.',
          'Interpret the trajectory, timing and current condition rather than treating a baseline result as a continuing guarantee.',
        ]
      ),
    ],
  },
  {
    update:
      'Nadia feels weaker. BP is 92/58 and HR 112/min. The potassium result is 5.6 mmol/L in a non-hemolysed sample. The clinical team reviews perfusion, fluid status, medicines and possible obstruction together.',
    evidence: [
      'Bladder assessment and the collection system are checked.',
      'Vomiting continues; there are no new crackles or oxygen requirement on current assessment.',
      'The team requests repeat laboratory evaluation and cardiac assessment under its pathway.',
    ],
    vitals: [15, 112, '92/58', 24, 37, 97],
    note: 'Hypotension and oliguria persist; potassium is rising.',
    items: [
      r(
        'Which assessment helps distinguish low urine production from a problem with urine drainage or measurement?',
        [
          'Assume the collection chart is complete',
          'Use urine color to estimate kidney filtration',
          'Check bladder/drainage findings and verify the measured output',
          'Stop measuring because creatinine is already available',
        ],
        [2],
        [
          'An assumed accurate chart can conceal a measurement or drainage problem.',
          'Color alone cannot assess filtration or exclude obstruction.',
          'Evaluate potentially reversible drainage and measurement problems alongside the clinical assessment.',
          'Urine trends remain relevant even when blood results are available.',
        ]
      ),
      r(
        'Which TWO mechanisms need consideration in Nadia’s differential?',
        [
          'Reduced effective perfusion after gastrointestinal losses',
          'Confirmed chronic kidney disease based only on today’s creatinine',
          'Medication contribution to the acute renal change',
          'Obstruction excluded solely by a history of vomiting',
        ],
        [0, 2],
        [
          'The loss and pressure history make perfusion an important possibility.',
          'One acute abnormal result cannot establish chronic kidney disease.',
          'NSAID exposure and other medicines warrant review in this context.',
          'More than one mechanism can coexist; vomiting does not exclude obstruction.',
        ]
      ),
      r(
        'Which team communication most accurately describes the uncertainty?',
        [
          '“Nadia is simply thirsty, so no review is needed”',
          '“Low output, hypotension and rising creatinine/potassium need urgent review of perfusion, drugs and obstruction”',
          '“The NSAID is proven to be the only cause”',
          '“The potassium can be ignored until kidney function is normal”',
        ],
        [1],
        [
          'The combined physiologic and laboratory change is more concerning than isolated thirst.',
          'State the objective trend and competing mechanisms while requesting timely assessment.',
          'The exposure is relevant but does not establish a single exclusive cause.',
          'A potentially important electrolyte change needs assessment during, not after, the renal problem.',
        ]
      ),
    ],
  },
  {
    update:
      'The repeat potassium is 6.2 mmol/L and is not hemolysed. Nadia reports increasing weakness. An ECG has no new obvious abnormality. The response team activates its acute hyperkalaemia pathway.',
    evidence: [
      'Continuous observation and the local monitoring plan are underway.',
      'The team reviews the repeat result, symptoms, renal change and medication exposures.',
      'No independent drug dose or treatment order is assumed by the nurse.',
    ],
    vitals: [30, 110, '94/58', 24, 37, 97],
    note: 'Repeat elevated potassium with weakness; urgent team-directed care underway.',
    items: [
      r(
        'Which current development increases the urgency of Nadia’s care?',
        [
          'The repeat raised potassium with weakness and renal deterioration',
          'The absence of a new fever',
          'The earlier normal creatinine result',
          'The recorded name of the NSAID alone',
        ],
        [0],
        [
          'The combined findings create an important electrolyte and physiologic concern requiring the acute pathway.',
          'Temperature does not establish electrolyte safety.',
          'The baseline helps describe the change but cannot override the current results.',
          'The exposure matters, but the present physiologic threat determines urgency.',
        ]
      ),
      r(
        'How should the apparently unchanged ECG influence interpretation of the repeat potassium?',
        [
          'It proves the sample is wrong',
          'It means no further cardiac observation is useful',
          'It confirms that all potassium-related risk has passed',
          'It does not exclude clinically important hyperkalaemia or remove the need for the acute pathway',
        ],
        [3],
        [
          'An ECG cannot by itself invalidate a verified non-hemolysed result.',
          'Monitoring and reassessment remain relevant in the acute clinical context.',
          'A normal-looking tracing does not establish sustained electrolyte safety.',
          'Use the result, symptoms, renal trajectory and local pathway together; the ECG is one component.',
        ]
      ),
      r(
        'Which THREE priorities should proceed together while the authorized team treats the electrolyte problem?',
        [
          'Cardiac and clinical monitoring with rapid communication of change',
          'Repeat assessment of potassium and response as directed',
          'Wait for a dramatic ECG change before providing any further support',
          'Verify current medicines, fluid status and output to address continuing contributors',
        ],
        [0, 1, 3],
        [
          'Monitoring can detect deterioration while treatment takes effect.',
          'The response and any recurrence need reassessment rather than reliance on the first intervention.',
          'Waiting for an ECG change would disregard the present verified result and symptoms.',
          'Contributing renal, fluid and medication factors influence whether the improvement will last.',
        ]
      ),
    ],
  },
  {
    update:
      'The team prescribes an individualized fluid plan after assessing Nadia. Treatment of hyperkalaemia continues. Lung findings, pressure, urine output and symptoms are reassessed around the intervention.',
    evidence: [
      'No routine large-volume replacement is assumed.',
      'The prescriber specifies reassessment and escalation responsibilities.',
      'Further medication doses are checked against the revised authorized plan.',
    ],
    vitals: [45, 104, '102/62', 22, 37, 97],
    note: 'Initial pressure response; ongoing assessment for benefit and fluid intolerance.',
    items: [
      r(
        'Which action best evaluates Nadia’s prescribed fluid intervention?',
        [
          'Record only that the prescribed volume was given',
          'Reassess pressure, breathing, lung findings and urine trends',
          'Assume every low urine output requires the same volume',
          'Discontinue observations once the infusion begins',
        ],
        [1],
        [
          'Administration records do not establish the patient’s response.',
          'Evaluate perfusion and possible intolerance alongside the output and clinical trajectory.',
          'Fluid needs depend on cause, current status and response.',
          'Active reassessment is part of safe delivery, not an optional later step.',
        ]
      ),
      r(
        'Which TWO findings would make continuing the same fluid plan without review unsafe?',
        [
          'A more comfortable posture with unchanged breathing',
          'A verified medication list reaching the bedside',
          'New breathlessness or crackles during the intervention',
          'Failure to improve with continued hypotension or further deterioration',
        ],
        [2, 3],
        [
          'Comfort is useful context but does not itself demonstrate intolerance.',
          'Medication verification supports care rather than creating a physiologic contraindication.',
          'New respiratory findings can signal fluid intolerance and require reassessment.',
          'A plan that is not meeting its intended outcome needs timely review rather than automatic continuation.',
        ]
      ),
      r(
        'A colleague recommends treating the urine-output target as the only endpoint. Which response is strongest?',
        [
          'Use output together with perfusion, respiratory tolerance, labs and the overall response',
          'Increase fluid until output reaches a fixed number regardless of lung findings',
          'Stop fluid assessment because potassium is the only important variable',
          'Assume that a higher blood pressure proves every renal mechanism is corrected',
        ],
        [0],
        [
          'Several findings are needed to judge benefit and harm and to reconsider the mechanism.',
          'An isolated target can promote harmful treatment when the patient cannot tolerate more fluid.',
          'Electrolyte management does not replace assessment of the renal and fluid problem.',
          'Pressure can improve before renal recovery, and other mechanisms may remain.',
        ]
      ),
    ],
  },
  {
    update:
      'Nadia’s pressure has improved and urine output is beginning to increase. The repeat potassium is 5.2 mmol/L; creatinine remains 1.7 mg/dL. The team reviews medicines and the follow-up plan.',
    evidence: [
      'Nadia explains that the NSAID was taken without realizing it could matter during illness.',
      'Medication decisions are reconciled with the prescriber and pharmacist.',
      'Repeat laboratory tests and escalation triggers are documented.',
    ],
    vitals: [90, 96, '108/66', 20, 37, 97],
    note: 'Partial clinical response; laboratory recovery is incomplete.',
    items: [
      r(
        'Which medication-history detail should be included in Nadia’s handover?',
        [
          'Only prescriptions printed at admission',
          'Only products whose packaging is still available',
          'Actual NSAID use, timing and the revised authorized medicine plan',
          'A statement that every blood-pressure medicine has been permanently stopped',
        ],
        [2],
        [
          'Admission records may omit nonprescription exposure or later changes.',
          'A missing packet does not make a relevant exposure disappear.',
          'The actual exposure and reviewed plan help prevent duplication or resumption errors.',
          'Permanent blanket cessation cannot be assumed from an acute review.',
        ]
      ),
      r(
        'Which TWO statements belong in a patient-centered explanation?',
        [
          'Ask Nadia to describe which nonprescription products are used and why',
          'Describe the event as proof that Nadia cannot manage medicines',
          'Explain the agreed illness, medication and help-seeking plan in understandable terms',
          'Tell Nadia to independently stop and restart every prescribed medicine when unwell',
        ],
        [0, 2],
        [
          'Understanding actual use supports a feasible safety plan without blame.',
          'A judgment about competence is not supported by the event and can obstruct useful information.',
          'Clear individualized guidance supports safe use and timely contact with the team.',
          'Blanket unsupervised changes can create other risks and do not reflect an individualized plan.',
        ]
      ),
      r(
        'Nadia wants to restart the home regimen because pressure is better. Which recommendation best addresses the unresolved risk?',
        [
          'Resume all medicines from the old list without reconciling it',
          'Discard the old list without creating an updated one',
          'Use only the latest potassium to authorize every medicine',
          'Clarify each medicine’s current instruction and follow-up with the authorized team before discharge',
        ],
        [3],
        [
          'The old schedule may no longer fit the renal, electrolyte and volume status.',
          'Removing an obsolete list must be accompanied by a clear current plan.',
          'Medication safety depends on more than one improving result.',
          'A reconciled plan connects current renal status, indication, monitoring and responsibilities.',
        ]
      ),
    ],
  },
  {
    update:
      'Nadia is more alert, pressure is 112/68 and urine output has improved over the team’s observation period. Potassium is 4.9 mmol/L; creatinine is 1.6 mg/dL. Follow-up remains necessary.',
    evidence: [
      'The creatinine has not returned to the recorded baseline of 0.9 mg/dL.',
      'Nadia demonstrates the updated medication instructions.',
      'The next checks and contact route are explicit in the handover.',
    ],
    vitals: [180, 90, '112/68', 18, 37, 97],
    note: 'Improving trend; complete renal recovery has not been established.',
    items: [
      r(
        'Which finding shows that Nadia’s renal recovery is still incomplete?',
        [
          'The medication list has been explained',
          'Creatinine remains above the documented baseline',
          'The pulse is lower than at presentation',
          'The urine collection chart is now complete',
        ],
        [1],
        [
          'Teaching is useful but does not establish recovery of filtration.',
          'The result remains substantially above baseline and requires ongoing evaluation.',
          'A more stable pulse supports improvement but cannot establish renal recovery.',
          'Better documentation improves interpretation rather than demonstrating recovery itself.',
        ]
      ),
      r(
        'Which conclusion is supported by Nadia’s overall course?',
        [
          'The improvement is encouraging, with unresolved renal change requiring follow-up',
          'No further checks are needed because pressure improved',
          'The initial working cause is now proven to be the only mechanism',
          'A near-normal potassium establishes complete kidney recovery',
        ],
        [0],
        [
          'Use the whole trajectory while acknowledging that the renal result has not returned to baseline.',
          'Improved perfusion is one outcome and does not end renal follow-up needs.',
          'Response to care can support an explanation without proving an exclusive cause.',
          'Potassium correction and filtration recovery are related but distinct outcomes.',
        ]
      ),
      r(
        'Which TWO outcomes should determine whether Nadia’s follow-up plan is working?',
        [
          'Only whether a discharge leaflet was printed',
          'Only whether the original medication names were remembered',
          'Repeat renal/electrolyte results and a sustained clinical/output trajectory',
          'Nadia can follow the revised plan and knows how to seek help if intake or symptoms worsen',
        ],
        [2, 3],
        [
          'A printed leaflet does not show whether the clinical problem resolved or the plan is usable.',
          'Name recall is less useful than correctly following the updated regimen and monitoring plan.',
          'Clinical and laboratory reassessment assess whether recovery is sustained.',
          'Usable instructions and help-seeking support safe continuation of the plan outside the immediate episode.',
        ]
      ),
    ],
  },
])
const congestionFrames = renalFrames([
  {
    update:
      'Victor, 76, has heart failure and worsening breathlessness. Weight has increased over several days; urine output has fallen. Creatinine increased from 1.2 to 1.9 mg/dL in 48 hours. The clinical team is reviewing the fluid and medicine plan.',
    evidence: [
      'New bilateral crackles, ankle swelling and a prescribed oxygen requirement are documented.',
      'Urine output is 0.4 mL/kg/hour over the last six hours.',
      'Victor was more comfortable breathing yesterday; there is no history of vomiting or diarrhoea.',
    ],
    vitals: [0, 104, '108/66', 26, 36.9, 93],
    note: 'Congestion with renal deterioration; oxygen 2 L/min under the current prescription.',
    items: [
      r(
        'Which new finding most directly adds concern beyond Victor’s ankle swelling?',
        [
          'A familiar diagnosis written in the chart',
          'The name of the prescribed diuretic',
          'A routine medication review is due',
          'Worsening breathing with crackles and a new oxygen requirement',
        ],
        [3],
        [
          'A diagnosis provides context but does not describe the present deterioration.',
          'The medicine name does not establish the current physiologic condition.',
          'A scheduled task should not outweigh a new respiratory change.',
          'The new respiratory findings indicate a clinically important change requiring timely assessment.',
        ]
      ),
      r(
        'Which TWO data trends should be interpreted together when assessing Victor’s fluid and renal status?',
        [
          'Weight gain with worsening breathlessness and crackles',
          'The room number and time of the next visitor',
          'Falling output with a recent creatinine rise',
          'A single previous statement that the medicines were tolerated',
        ],
        [0, 2],
        [
          'The combined findings support assessment of congestion rather than isolated peripheral swelling.',
          'These details do not explain the fluid and renal change.',
          'The output and laboratory trajectory add evidence of acute renal deterioration.',
          'Past tolerance cannot establish current safety in a changing clinical state.',
        ]
      ),
      r(
        'Victor has low output and a creatinine rise. Why is an automatic fluid bolus a poor default conclusion?',
        [
          'Kidney injury never responds to correction of perfusion',
          'Congestion means every circulating-volume assessment is unnecessary',
          'Respiratory congestion and perfusion must be assessed together before an individualized plan',
          'Low output can only be caused by a blocked urinary catheter',
        ],
        [2],
        [
          'Reduced perfusion can matter, but its assessment does not justify a universal response.',
          'Congestion does not eliminate the need to evaluate perfusion and possible competing mechanisms.',
          'Extra fluid can worsen respiratory compromise; assess the whole pattern and follow an authorized individualized plan.',
          'Obstruction is one possible mechanism and must not become the only explanation.',
        ]
      ),
    ],
  },
  {
    update:
      'Victor’s breathing remains laboured. The team confirms congestion while assessing perfusion and drainage. Potassium is 5.7 mmol/L in a non-hemolysed sample; the next dose and medicine plan are being reviewed.',
    evidence: [
      'Bladder/drainage assessment does not show an immediate obstruction.',
      'The medication list includes a potassium supplement from an older prescription; actual use is being verified.',
      'Blood-pressure and output trends are available to the reviewing team.',
    ],
    vitals: [15, 108, '102/64', 28, 36.9, 93],
    note: 'Renal/electrolyte change with ongoing congestion; urgent review continues.',
    items: [
      r(
        'Which history discrepancy is especially relevant to Victor’s current potassium?',
        [
          'The older potassium supplement and whether it is still being taken',
          'The number of pages in the medication list',
          'The brand of the bedside water cup',
          'The date of the last routine weight chart printout',
        ],
        [0],
        [
          'Actual potassium-containing product exposure matters during renal and electrolyte deterioration.',
          'List length does not identify a clinically relevant exposure.',
          'The cup brand does not establish fluid or potassium intake.',
          'The weight trajectory matters more than the printing date.',
        ]
      ),
      r(
        'Which explanation best integrates the renal and respiratory findings?',
        [
          'Renal deterioration proves Victor needs unrestricted oral fluid',
          'The congestion, perfusion and medicine effects may interact and need assessment together',
          'The potassium supplement is proven to be the exclusive cause of all symptoms',
          'An unchanged temperature excludes important acute illness',
        ],
        [1],
        [
          'A creatinine rise does not establish that unrestricted fluid is safe during respiratory congestion.',
          'Interacting mechanisms are plausible; assess the volume, renal, medication and respiratory trajectory.',
          'The exposure is relevant but cannot explain every finding with certainty.',
          'A reassuring temperature cannot exclude serious fluid, cardiac or renal deterioration.',
        ]
      ),
      r(
        'Which TWO questions most help the team distinguish competing causes without delaying care?',
        [
          'Can Victor’s current medicine instructions and actual use be verified?',
          'Can the previous heart-failure diagnosis be used instead of reassessment?',
          'What are the current congestion, perfusion and output trends relative to baseline?',
          'Can all current findings be attributed to age alone?',
        ],
        [0, 2],
        [
          'Verified exposure can identify a reversible contributor or unsafe duplication.',
          'A prior diagnosis does not replace evaluation of the current mechanism and severity.',
          'The trend helps compare reduced effective perfusion, congestion and other contributors.',
          'Age does not establish a causal explanation for a new deterioration.',
        ]
      ),
    ],
  },
  {
    update:
      'Victor is more distressed and cannot complete a sentence comfortably. Oxygen is adjusted under the authorized pathway while the response team assesses breathing, circulation and the renal/electrolyte results.',
    evidence: [
      'No cardiac arrest is reported.',
      'The team is at the bedside and is preparing individualized treatment and monitoring.',
      'The electrolyte concern is communicated alongside the respiratory decline.',
    ],
    vitals: [25, 114, '98/60', 32, 36.9, 91],
    note: 'Increasing respiratory distress; oxygen 3 L/min under the response plan.',
    items: [
      r(
        'What must take priority over completing Victor’s routine medication education?',
        [
          'Obtaining a complete list of home food preferences',
          'Waiting for the next scheduled ward round',
          'Immediate support and reassessment of the worsening breathing',
          'Recording a final discharge date',
        ],
        [2],
        [
          'Preferences can inform later planning but should not delay the acute response.',
          'The new deterioration requires a response now rather than a scheduled review.',
          'The acute physiologic threat requires immediate team support while the causes are assessed.',
          'Discharge planning is not the priority during increasing respiratory distress.',
        ]
      ),
      r(
        'Which TWO handover elements best convey why Victor’s priority changed?',
        [
          'The original diagnosis without the new findings',
          'The increasing respiratory rate, oxygen requirement and difficulty speaking',
          'The recent creatinine/output/potassium trajectory and current response',
          'Only that the medication chart has been reviewed',
        ],
        [1, 2],
        [
          'The label alone does not communicate the present severity or change.',
          'These respiratory changes make the new urgency explicit.',
          'The renal/electrolyte context informs safe concurrent treatment and monitoring.',
          'Chart review alone does not convey the clinical trajectory.',
        ]
      ),
      r(
        'Which plan best addresses Victor’s simultaneous respiratory and electrolyte risks?',
        [
          'Complete an electrolyte worksheet before continuing breathing support',
          'Ask the team to address only the latest laboratory result',
          'Treat a temporarily improved saturation as permission to stop surveillance',
          'Continue respiratory support while the team evaluates cardiac, renal and medication contributors in parallel',
        ],
        [3],
        [
          'Documentation must not postpone support of an acute physiologic problem.',
          'The laboratory result is important within a broader deteriorating clinical picture.',
          'Improvement in one oxygen-supported value does not establish complete recovery.',
          'Parallel assessment and treatment avoid neglecting either immediate support or important ongoing contributors.',
        ]
      ),
    ],
  },
  {
    update:
      'Following prescribed treatment, Victor is breathing more comfortably. Urine output has increased. The team’s diuretic and monitoring plan includes repeat assessment of pressure, kidney function and electrolytes.',
    evidence: [
      'The team has not treated urine volume as the sole outcome.',
      'Potassium is 5.1 mmol/L on the current repeat sample.',
      'Victor’s BP is lower than the original baseline but has not fallen further during this interval.',
    ],
    vitals: [60, 102, '100/62', 24, 36.9, 95],
    note: 'Initial respiratory response; oxygen 2 L/min; monitoring of tolerance continues.',
    items: [
      r(
        'Which assessment best evaluates Victor’s response to the prescribed plan?',
        [
          'Breathing, perfusion, output and laboratory trends together',
          'Only the volume of urine in the last container',
          'Only whether the diuretic was signed as administered',
          'Only whether ankle swelling remains visible',
        ],
        [0],
        [
          'Evaluate intended benefit and potential renal, electrolyte or perfusion harm across several findings.',
          'Output is useful but does not establish respiratory or hemodynamic safety alone.',
          'Administration documentation does not establish the clinical response.',
          'Peripheral swelling may change at a different rate from acute breathing and perfusion.',
        ]
      ),
      r(
        'Which TWO findings would prompt review before automatically repeating the same plan?',
        [
          'Victor can finish a sentence more comfortably',
          'New dizziness with a further pressure drop',
          'Urine output has been documented accurately',
          'Worsening renal/electrolyte results or renewed respiratory distress',
        ],
        [1, 3],
        [
          'Improved function is encouraging while reassessment continues.',
          'Symptoms and falling pressure can signal poor tolerance or impaired perfusion.',
          'Accurate measurement supports interpretation rather than indicating harm.',
          'A new adverse trajectory requires reassessment of benefit, harm and mechanism.',
        ]
      ),
      r(
        'A colleague suggests withholding every future diuretic solely because creatinine was elevated. Which response is most useful?',
        [
          'Renal results have no relevance during heart failure',
          'A high creatinine proves that all diuresis is harmful',
          'Ask the authorized team to weigh residual congestion, perfusion, renal trends and response before revising treatment',
          'Tell Victor to choose the next medication dose based only on thirst',
        ],
        [2],
        [
          'Kidney function and electrolytes remain important to safe treatment.',
          'An isolated result cannot determine the balance of benefit and harm in every volume state.',
          'Treatment decisions require the clinical trajectory and competing risks rather than a blanket rule.',
          'Thirst alone cannot guide a safe prescription decision.',
        ]
      ),
    ],
  },
  {
    update:
      'Victor’s medicine plan has been reconciled. The older potassium supplement is specifically addressed by the prescriber. Victor describes difficulty distinguishing old and current instructions at home.',
    evidence: [
      'A current list states what to take, what has changed and who will review it.',
      'The pharmacist and nurse use the actual bottles during teaching.',
      'The team documents laboratory follow-up and individualized contact instructions.',
    ],
    vitals: [120, 94, '106/66', 22, 36.9, 95],
    note: 'Breathing improving; oxygen plan and medication instructions under review.',
    items: [
      r(
        'Which teaching method best checks that Victor can use the new medication list?',
        [
          'Ask for a signature before discussing the changes',
          'Ask Victor to show the next day’s plan using the current list and bottles',
          'Read every item rapidly and ask whether it is clear',
          'Assume the number of years taking medicines guarantees understanding',
        ],
        [1],
        [
          'A signature does not demonstrate practical understanding.',
          'A concrete teach-back can reveal obsolete bottles, unclear instructions and mismatches in the explanation.',
          'Rapid one-way delivery can conceal misunderstandings.',
          'Experience does not prevent confusion when a regimen changes.',
        ]
      ),
      r(
        'Which TWO details should accompany Victor’s next-shift handover?',
        [
          'Only the most reassuring saturation from the day',
          'A statement that medication confusion is solely a patient problem',
          'The revised medication instructions, including the old potassium product',
          'The current respiratory, pressure, output and laboratory follow-up plan',
        ],
        [2, 3],
        [
          'Selecting one reassuring measurement hides the trajectory and support required.',
          'A practical mismatch should be addressed through accessible communication and system support.',
          'Explicit instructions reduce accidental continuation of a superseded product.',
          'The next team needs current status, monitoring responsibilities and triggers for review.',
        ]
      ),
      r(
        'Victor asks what to do if breathlessness worsens again after discharge. Which response best supports an individualized plan?',
        [
          'Review the team’s specific symptoms, contact route and emergency-help instructions using teach-back',
          'Advise changing every medicine independently whenever ankle swelling appears',
          'Suggest waiting for the next appointment regardless of worsening symptoms',
          'Give a universal fluid target without considering the current plan',
        ],
        [0],
        [
          'The patient needs clear, agreed help-seeking steps suited to the clinical situation and local service.',
          'Blanket independent changes can create new risk and bypass the reviewed plan.',
          'A routine appointment is not a substitute for responding to acute deterioration.',
          'Fluid advice must fit the individual condition and authorized plan.',
        ]
      ),
    ],
  },
  {
    update:
      'Victor is breathing comfortably at rest on the team’s current oxygen plan. Pressure and urine output have remained stable across repeat observations. Creatinine is 1.8 mg/dL and remains above the 1.2 baseline.',
    evidence: [
      'Potassium is 4.8 mmol/L on the latest check.',
      'The team will reassess oxygen needs and the appropriate setting of care.',
      'Victor can demonstrate the updated medication and contact plan.',
    ],
    vitals: [240, 88, '110/68', 20, 36.9, 96],
    note: 'Improved cardiorespiratory status; residual renal change requires follow-up.',
    items: [
      r(
        'Which finding shows that Victor still needs renal follow-up despite easier breathing?',
        [
          'The bedside chart is complete',
          'Victor understands the instructions',
          'The latest pulse is below the initial pulse',
          'Creatinine is still above the documented baseline',
        ],
        [3],
        [
          'Documentation helps continuity but cannot establish renal recovery.',
          'Understanding supports safety but does not replace clinical reassessment.',
          'Improved pulse is encouraging but does not measure filtration.',
          'The unresolved laboratory change requires follow-up in the overall clinical context.',
        ]
      ),
      r(
        'Which conclusion best reflects Victor’s current response?',
        [
          'A higher urine output proves all kidney and heart problems have resolved',
          'The plan has produced improvement, with ongoing renal and disposition questions to reassess',
          'An oxygen-supported saturation proves no future oxygen assessment is needed',
          'The original medication list can be resumed because teaching is complete',
        ],
        [1],
        [
          'Output alone cannot establish complete recovery of both systems.',
          'The improving trajectory supports benefit while the residual changes and support needs remain explicit.',
          'Oxygen-supported measurements need interpretation within the ongoing respiratory plan.',
          'The reconciled plan, not an obsolete list, guides subsequent medication use.',
        ]
      ),
      r(
        'Which THREE outcomes should be checked when evaluating whether Victor’s transition plan is safe?',
        [
          'Sustained respiratory and perfusion stability in the intended care setting',
          'A clear renal/electrolyte follow-up plan with responsible clinicians',
          'The ability to follow current medication and help-seeking instructions',
          'Only whether the original diagnosis remains on the problem list',
        ],
        [0, 1, 2],
        [
          'A short-lived response does not establish stability after a change in setting or support.',
          'Residual renal changes require explicit monitoring and ownership.',
          'A usable plan connects the clinical strategy with the person’s daily actions and access to help.',
          'The diagnostic label does not evaluate recovery, safety or feasibility.',
        ]
      ),
    ],
  },
])
export const materialCases: EvolvingCase[] = [
  {
    id: 'medication-shift',
    title: 'The Medication Shift',
    topic: 'Medication safety',
    summary:
      'Unexpected medication effects change the priorities of a familiar shift.',
    sources: [
      'opioidSafety',
      'insulinSafety',
      'medicationSafety',
      'deterioration',
    ],
    paths: [
      {
        id: 'a',
        label: 'Sedation and breathing',
        patient: 'Mara Lane · 58 years',
        history:
          'Postoperative opioid analgesia, an earlier benzodiazepine and obstructive sleep apnea.',
        frames: opioidFrames,
      },
      {
        id: 'b',
        label: 'Recurrent hypoglycaemia',
        patient: 'Ellis Rowan · 43 years',
        history:
          'Type 1 diabetes, reduced intake and a delayed meal after prescribed mealtime insulin.',
        frames: glucoseFrames,
      },
    ],
  },
  {
    id: 'kidney-trend',
    title: 'The Falling Urine Output',
    topic: 'Kidney & fluid balance',
    summary:
      'Renal and electrolyte changes require a plan that fits the volume state.',
    sources: [
      'aki',
      'hyperkalaemia',
      'fluids',
      'medicationSafety',
      'deterioration',
    ],
    paths: [
      {
        id: 'a',
        label: 'Losses and medicine exposure',
        patient: 'Nadia Bell · 67 years',
        history:
          'Vomiting, reduced intake and recent nonprescription NSAID use.',
        frames: lossFrames,
      },
      {
        id: 'b',
        label: 'Congestion and competing risks',
        patient: 'Victor Ames · 76 years',
        history:
          'Heart failure, worsening congestion and an older potassium prescription requiring reconciliation.',
        frames: congestionFrames,
      },
    ],
  },
]
