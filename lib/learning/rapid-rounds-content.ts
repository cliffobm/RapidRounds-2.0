import type {
  RapidRound,
  RoundPrompt,
  RoundCategory,
  RoundBloom,
  RoundSkill,
  RoundOption,
} from './rapid-rounds-model'

const sources = {
  oxygen: {
    title: 'BTS guideline on controlled oxygen and patient-specific targets',
    url: 'https://www.brit-thoracic.org.uk/clinical-resources/guidelines/emergency-oxygen/',
  },
  sepsis: {
    title: 'NICE NG253: recognising and managing suspected adult sepsis',
    url: 'https://www.nice.org.uk/guidance/ng253/chapter/Managing-suspected-sepsis',
  },
  fluids: {
    title: 'NICE CG174: assessment and reassessment of IV fluid needs',
    url: 'https://www.nice.org.uk/guidance/cg174/chapter/Recommendations',
  },
  aki: {
    title: 'NICE NG148: acute kidney injury assessment and medicines',
    url: 'https://www.nice.org.uk/guidance/ng148/chapter/Recommendations',
  },
  heart: {
    title: 'NICE CG187: acute heart failure assessment and monitoring',
    url: 'https://www.nice.org.uk/guidance/cg187/chapter/Recommendations',
  },
  potassium: {
    title: 'UK Kidney Association: adult hyperkalaemia guideline',
    url: 'https://guidelines.ukkidney.org/hyperkalaemia/',
  },
  opioid: {
    title: 'APSF: monitoring opioid-induced ventilatory impairment',
    url: 'https://www.apsf.org/article/monitoring-for-opioid-induced-respiratory-depression/',
  },
  sbar: {
    title: 'AHRQ TeamSTEPPS: SBAR communication',
    url: 'https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/sbar.html',
  },
  anaphylaxis: {
    title: 'Resuscitation Council UK: anaphylaxis guidance',
    url: 'https://www.resus.org.uk/library/additional-guidance/guidance-anaphylaxis/emergency-treatment-anaphylactic-reactions',
  },
}
type Spec = [RoundCategory, RoundBloom, RoundSkill | null, string]
type Teaching = [string, string, string, string] // hint, brief, mechanism, carry forward
type Choice = [string, string]
function options(values: Choice[]): RoundOption[] {
  return values.map(([text, explanation], i) => ({
    id: String(i),
    text,
    explanation,
  }))
}
function q(
  id: string,
  spec: Spec,
  update: string,
  prompt: string,
  choices: Choice[],
  teaching: Teaching
): RoundPrompt {
  return {
    id,
    category: spec[0],
    bloom: spec[1],
    skill: spec[2],
    outcome: spec[3],
    update,
    prompt,
    format: 'choice',
    options: options(choices),
    correct: '0',
    hint: teaching[0],
    brief: teaching[1],
    mechanism: teaching[2],
    carryForward: teaching[3],
  }
}
function m(
  id: string,
  spec: Spec,
  update: string,
  prompt: string,
  rows: [string, boolean, string][],
  teaching: Teaching
): RoundPrompt {
  return {
    id,
    category: spec[0],
    bloom: spec[1],
    skill: spec[2],
    outcome: spec[3],
    update,
    prompt,
    format: 'matrix',
    rows: rows.map(([text, urgent, explanation], i) => ({
      id: String(i),
      text,
      urgent,
      explanation,
    })),
    hint: teaching[0],
    brief: teaching[1],
    mechanism: teaching[2],
    carryForward: teaching[3],
  }
}
function clue(prompt: string, choices: Choice[], takeaway: string) {
  return { prompt, options: options(choices), correct: '0', takeaway }
}

export const rapidRounds: RapidRound[] = [
  {
    id: 'a-change-in-breathing',
    title: 'A change in breathing',
    patient: 'Jordan · 54 · medical ward',
    handoff:
      'Jordan is receiving treatment for pneumonia. At handoff they were alert, speaking comfortably, with a respiratory rate of 20/min and oxygen saturation of 95% on prescribed oxygen at 2 L/min. Their prescribed saturation target is 94–98%. You are the bedside RN; the ward escalation team is available.',
    focus:
      'Connect a changing respiratory trend with the next nursing priority.',
    sources: [sources.oxygen, sources.sepsis, sources.sbar],
    steps: [
      m(
        'breathing-1',
        [
          'respiratory',
          'apply',
          'recognize',
          'Identify changes requiring prompt respiratory reassessment.',
        ],
        'Thirty minutes later, the oxygen device and flow are unchanged. The oximeter waveform is reliable. Classify each finding in this update.',
        'Which findings need prompt follow-up, and which show no acute change in the information given?',
        [
          [
            'Oxygen saturation is now 88%.',
            true,
            'This is a new fall below the stated prescribed target despite unchanged oxygen support.',
          ],
          [
            'Respiratory rate is now 32/min.',
            true,
            'A substantial increase from baseline suggests greater respiratory demand or distress.',
          ],
          [
            'Jordan is newly confused about where they are.',
            true,
            'New confusion alongside respiratory deterioration adds urgency; it should not be dismissed as fatigue.',
          ],
          [
            'The documented dry cough is unchanged, with no new pain or sputum change.',
            false,
            'This row describes no acute change. The unchanged cough does not reduce the urgency of the other new findings.',
          ],
        ],
        [
          'Compare the new findings with the handoff. A familiar diagnosis does not make a new change expected.',
          'The oxygenation trend, breathing rate and new confusion belong together.',
          'Inflamed lung tissue can impair gas exchange. Increasing respiratory effort and a change in mental status may signal inadequate oxygen delivery or other deterioration; the pattern needs bedside reassessment.',
          'Compare with baseline before deciding whether a finding is reassuring.',
        ]
      ),
      q(
        'breathing-2',
        [
          'respiratory',
          'analyze',
          'analyze',
          'Interpret linked findings rather than one reassuring observation.',
        ],
        'Jordan can still answer short questions, but saturation remains 88%, breathing remains rapid and confusion is new.',
        'Which interpretation best accounts for the overall change?',
        [
          [
            'The respiratory picture is worsening even though Jordan can still speak.',
            'Being able to speak does not cancel a reliable saturation decline, tachypnea and a new mental-status change.',
          ],
          [
            'Speech makes an immediately important gas-exchange problem less likely.',
            'Speech is useful information, but it is being given too much weight against three worsening findings.',
          ],
          [
            'The increase in breathing rate is likely compensating adequately for the lower saturation.',
            'A higher rate can be a compensatory response without achieving adequate gas exchange; persistent hypoxemia and confusion argue against adequate compensation.',
          ],
          [
            'The confusion should be evaluated separately before interpreting the respiratory measurements.',
            'Other causes may contribute, but separating the findings delays recognition of the shared deterioration pattern.',
          ],
        ],
        [
          'Ask whether the apparently reassuring detail explains the worsening trend.',
          'A patient can compensate visibly while still deteriorating.',
          'Respiratory rate, oxygenation and cognition provide different information. Their combined trajectory is more informative than the ability to answer a short question.',
          'Weigh reassuring details against the whole trajectory.',
        ]
      ),
      q(
        'breathing-3',
        [
          'communication',
          'apply',
          'act',
          'Communicate a specific deterioration and request immediate bedside help.',
        ],
        'You have reassessed airway and breathing, checked the oxygen setup, and activated the ward escalation process. A senior nurse asks what has changed.',
        'Which opening best communicates the priority?',
        [
          [
            'Jordan has new confusion, RR 32 and a reliable saturation of 88% on unchanged prescribed oxygen; I need urgent bedside review.',
            'This identifies the patient, the change, current support and a specific request.',
          ],
          [
            'Jordan has pneumonia and is finding the admission difficult; could you review when your current task is finished?',
            'The diagnosis is correct, but the message omits the new instability and understates urgency.',
          ],
          [
            'Jordan may need a change in antibiotics; could you ask the prescriber to check the treatment chart?',
            'Treatment review may follow, but it does not communicate the immediate breathing and cognitive changes.',
          ],
          [
            'Jordan has an abnormal saturation; I will repeat it again and call if the number is still low.',
            'You already have a reliable repeat and a concerning clinical pattern. This message defers help without explaining the accompanying changes.',
          ],
        ],
        [
          'Include the change, what support is already in place, and the help needed now.',
          'A clear request makes your assessment actionable for the receiving clinician.',
          'Structured escalation connects observations to an immediate clinical concern without requiring certainty about the final diagnosis.',
          'State the change and your request, not just the diagnosis.',
        ]
      ),
      q(
        'breathing-4',
        [
          'respiratory',
          'analyze',
          'evaluate',
          'Interpret improvement using several reassessment findings.',
        ],
        'Following team assessment and prescribed treatment, saturation reaches 95%. Jordan remains difficult to engage and is breathing at 30/min.',
        'What should guide your next assessment?',
        [
          [
            'The saturation has improved, but persistent tachypnea and altered mentation still need prompt review.',
            'One improved value does not show that the whole respiratory problem has resolved.',
          ],
          [
            'Reaching the oxygen target makes routine scheduled observations the best next step.',
            'The target matters, but the ongoing clinical abnormalities make routine-only follow-up insufficient.',
          ],
          [
            'The higher saturation means the remaining findings probably reflect anxiety.',
            'Anxiety is possible, but the information does not establish it as the cause of persistent changes.',
          ],
          [
            'Continue the current plan unchanged until all measurements have had time to normalize.',
            'Treatment response should be reassessed actively; there is no stated reason to defer review of persistent abnormalities.',
          ],
        ],
        [
          'Which concerns from the first update have actually resolved?',
          'Track the patient response, not just the monitor target.',
          'Oxygen saturation estimates oxygenation; it does not independently establish ventilation, perfusion or neurological recovery.',
          'An improved number is one part of reassessment.',
        ]
      ),
    ],
    clue: clue(
      'Build the next clue: which new finding would most challenge your impression that Jordan is recovering?',
      [
        [
          'Increasing drowsiness despite saturation remaining in target.',
          'That finding challenges recovery and calls for reassessment beyond oxygenation.',
        ],
        [
          'Asking for a drink while speaking comfortably.',
          'That may be consistent with improving interaction; it does not alone challenge recovery.',
        ],
        [
          'Respiratory rate falls toward baseline while Jordan becomes more alert.',
          'These changes support recovery rather than challenging it.',
        ],
        [
          'A family member confirming Jordan normally knows the date.',
          'Baseline information is helpful, but a new worsening finding more directly challenges recovery.',
        ],
      ],
      'Try the same reasoning when one measurement improves but the patient still looks unwell.'
    ),
  },
  {
    id: 'the-target-is-not-the-whole-story',
    title: 'The target is not the whole story',
    patient: 'Morgan · 68 · respiratory ward',
    handoff:
      'Morgan has COPD with documented prior hypercapnic respiratory failure. The current prescribed oxygen target is 88–92%, with blood-gas assessment available through the treating team. They were alert at handoff, RR 22/min, saturation 90% on controlled oxygen.',
    focus:
      'Use an individualized target while watching ventilation and alertness.',
    sources: [sources.oxygen],
    steps: [
      q(
        'target-1',
        [
          'respiratory',
          'understand',
          null,
          'Explain why an oxygen target is individualized.',
        ],
        'Morgan asks why their oxygen target differs from another patient’s.',
        'Which explanation fits the stated history?',
        [
          [
            'The team is controlling oxygen to an individualized target because Morgan has a known risk of hypercapnic respiratory failure.',
            'The documented history explains the target; controlled oxygen still treats hypoxemia.',
          ],
          [
            'The lower target means oxygen is not useful for Morgan’s current respiratory illness.',
            'A controlled target does not mean withholding needed oxygen.',
          ],
          [
            'A saturation in this range confirms that Morgan’s carbon dioxide is normal.',
            'Pulse oximetry does not measure carbon dioxide or acid-base status.',
          ],
          [
            'The target can be applied to every person with a respiratory diagnosis.',
            'Targets depend on the person’s risk and clinical plan; the diagnosis category alone is not enough.',
          ],
        ],
        [
          'Separate the purpose of a target from what the monitor can measure.',
          'Controlled oxygen and assessment of ventilation work together.',
          'Oximetry estimates oxygen saturation. Hypercapnia requires assessment of ventilation and, when indicated, blood gases; it cannot be excluded by a target-range saturation.',
          'Know what each measurement can and cannot tell you.',
        ]
      ),
      q(
        'target-2',
        [
          'respiratory',
          'analyze',
          'prioritize',
          'Identify concern despite a target-range saturation.',
        ],
        'Morgan becomes newly drowsy. RR is 10/min and saturation is still 90% on the prescribed device.',
        'Which interpretation deserves priority?',
        [
          [
            'Possible ventilatory deterioration despite oxygen saturation remaining in target.',
            'The new drowsiness and reduced respiratory rate outweigh reassurance from a target-range saturation.',
          ],
          [
            'A stable oxygen reading makes respiratory deterioration unlikely.',
            'Oxygenation and ventilation are related but different; the new clinical findings remain concerning.',
          ],
          [
            'The lower breathing rate demonstrates that the treatment has reduced respiratory work successfully.',
            'A lower rate can be reassuring only in context; new drowsiness argues against assuming uncomplicated improvement.',
          ],
          [
            'The change should primarily trigger review of Morgan’s sleep schedule.',
            'Sleep history can inform assessment but does not take priority over new ventilatory warning signs.',
          ],
        ],
        [
          'Has the patient’s alertness improved or worsened alongside the breathing-rate change?',
          'A number in target does not cancel a new clinical concern.',
          'Reduced effective ventilation can permit carbon dioxide accumulation and altered consciousness without an immediate drop in saturation on oxygen.',
          'Reassess breathing and cognition even when saturation looks acceptable.',
        ]
      ),
      q(
        'target-3',
        [
          'medication',
          'apply',
          'generate',
          'Include recent medicines in an urgent respiratory review.',
        ],
        'Urgent bedside review is underway. Morgan received a sedating medicine after handoff; the exact timing is in the administration record.',
        'Which information would most strengthen the review?',
        [
          [
            'The medicine, dose and time given, compared with the onset of drowsiness and respiratory changes.',
            'The exposure timeline helps evaluate a potentially reversible contributor while assessment continues.',
          ],
          [
            'The medicine’s usual indication, without delaying to establish administration timing.',
            'Indication matters, but it cannot show whether the exposure preceded the change.',
          ],
          [
            'Whether the same dose was tolerated before, without comparing the present respiratory state.',
            'Prior tolerance adds history, but the current illness and respiratory state may change the effect.',
          ],
          [
            'Whether the dose was within the usual range, treating that as sufficient to exclude a contribution.',
            'A usual dose can still contribute to sedation in a susceptible patient; timing and the current clinical response remain important.',
          ],
        ],
        [
          'Look for a relevant exposure that preceded the change.',
          'A medication timeline is part of the patient story.',
          'Sedating medicines can contribute to reduced ventilatory drive. The temporal relationship supports investigation; it does not by itself prove a single cause.',
          'Bring timing and current findings together.',
        ]
      ),
      m(
        'target-4',
        [
          'respiratory',
          'analyze',
          'evaluate',
          'Evaluate respiratory response using more than saturation.',
        ],
        'After prescribed adjustments and team review, classify the following reassessment findings. “No acute change” applies only to the information shown.',
        'Which findings still need prompt follow-up?',
        [
          [
            'Morgan becomes harder to wake.',
            true,
            'Worsening consciousness requires prompt reassessment.',
          ],
          [
            'RR falls further to 7/min.',
            true,
            'A further fall in rate alongside drowsiness is concerning for inadequate ventilation.',
          ],
          [
            'Saturation remains within the prescribed range, with no new change in the reading.',
            false,
            'This reading alone is not a new adverse change, although it does not exclude the other concerns.',
          ],
          [
            'The team reports a worsening respiratory acidosis on repeat blood gas.',
            true,
            'The measured trend strengthens concern about ventilation and requires action by the treating team.',
          ],
        ],
        [
          'A stable oxygen reading can coexist with a worsening patient.',
          'Reassessment combines observations with the available investigations.',
          'Saturation, ventilatory rate, mental status and blood-gas trends answer different questions. Evaluate the change in each rather than letting one normal-looking result dominate.',
          'Improvement should be coherent across the patient’s condition.',
        ]
      ),
    ],
    clue: clue(
      'Which detail would make a fall in respiratory rate more reassuring?',
      [
        [
          'The patient is more alert, speaking comfortably and has an improving blood-gas trend.',
          'Several consistent improvements support reduced respiratory distress.',
        ],
        [
          'The saturation number is unchanged, with increasing drowsiness.',
          'This combination still raises concern about ventilation.',
        ],
        [
          'The patient received an additional sedating medicine.',
          'That introduces another potential contributor rather than reassurance.',
        ],
        [
          'The respiratory diagnosis is unchanged on the problem list.',
          'A stable label does not describe the patient’s trajectory.',
        ],
      ],
      'The same number can mean different things depending on the accompanying findings.'
    ),
  },
  {
    id: 'two-kinds-of-fluid-concern',
    title: 'Two kinds of fluid concern',
    patient: 'Alex · 72 · cardiac ward',
    handoff:
      'Alex is admitted with heart failure. Earlier they could rest at 30 degrees, RR 20/min, blood pressure 132/78, and saturation 95% on the prescribed support. Treatment and fluid monitoring are ordered. You have access to urgent bedside review.',
    focus:
      'Connect respiratory and circulation findings without assuming every low blood pressure needs the same response.',
    sources: [sources.heart, sources.fluids],
    steps: [
      m(
        'fluid-heart-1',
        [
          'perfusion',
          'apply',
          'recognize',
          'Separate acute changes from stable background findings.',
        ],
        'At the next assessment, Alex is more breathless and asks to sit upright. Classify each finding.',
        'Which findings need prompt follow-up?',
        [
          [
            'Blood pressure is newly 92/58 with cool hands.',
            true,
            'The pressure change and peripheral findings raise concern about perfusion.',
          ],
          [
            'Breathlessness now prevents lying back at the previous angle.',
            true,
            'New orthopnea is a clinically relevant change.',
          ],
          [
            'An unchanged longstanding ankle deformity.',
            false,
            'The stable background finding is not evidence of an acute circulatory change.',
          ],
          [
            'Urine output has decreased alongside the pressure change.',
            true,
            'A falling output can add evidence of reduced renal perfusion or another acute problem.',
          ],
        ],
        [
          'Compare the current observations with the earlier assessment.',
          'Breathing, pressure, peripheral findings and output belong in one assessment.',
          'Impaired cardiac function may produce congestion while effective organ perfusion also falls. Visible fluid accumulation does not establish that circulation to organs is adequate.',
          'Check both congestion and perfusion.',
        ]
      ),
      q(
        'fluid-heart-2',
        [
          'perfusion',
          'analyze',
          'analyze',
          'Integrate congestion and low-perfusion findings.',
        ],
        'Alex has new crackles, worsening orthopnea, cool hands, lower pressure and reduced urine output.',
        'Which explanation best integrates the findings?',
        [
          [
            'Congestion and inadequate effective perfusion may be occurring together.',
            'The respiratory and peripheral findings can coexist when cardiac function is impaired.',
          ],
          [
            'Crackles establish adequate circulating volume and therefore adequate perfusion.',
            'Congestion does not establish effective forward blood flow.',
          ],
          [
            'Reduced output makes a urinary cause more important than the breathing and pressure changes.',
            'A urinary cause remains possible, but isolating output overlooks the linked acute findings.',
          ],
          [
            'The lower pressure likely explains the breathlessness without any need to consider congestion.',
            'This gives one finding too much weight and fails to account for crackles and orthopnea.',
          ],
        ],
        [
          'Can two apparently competing problems be present at the same time?',
          'The best explanation accounts for the whole pattern.',
          'Elevated cardiac filling pressures can contribute to pulmonary congestion while reduced forward flow limits organ perfusion. These are not mutually exclusive.',
          'Avoid forcing a mixed presentation into a single-number explanation.',
        ]
      ),
      q(
        'fluid-heart-3',
        [
          'fluids',
          'apply',
          'generate',
          'Choose a reassessment plan appropriate to mixed fluid findings.',
        ],
        'You have initiated urgent review. A colleague suggests giving extra IV fluid because the blood pressure is lower.',
        'Which response best fits the current information?',
        [
          [
            'Bring the congestion, pressure and urine-output trends to the clinician before changing the prescribed fluid plan.',
            'The mixed picture needs individualized assessment; a low pressure alone does not specify the fluid response.',
          ],
          [
            'Give extra fluid first and use any pressure rise as confirmation that congestion was not important.',
            'A transient pressure change would not exclude worsening congestion or establish an appropriate plan.',
          ],
          [
            'Avoid all fluid-related assessment because Alex has a heart-failure diagnosis.',
            'The diagnosis does not remove the need to evaluate fluid balance and perfusion.',
          ],
          [
            'Use the daily weight alone to choose between increasing and stopping the current infusion.',
            'Weight adds context but cannot independently resolve an acute change in perfusion and breathing.',
          ],
        ],
        [
          'What information would make a general treatment assumption unsafe?',
          'Use the combined assessment to guide a prescribed, individualized plan.',
          'Fluid decisions depend on perfusion, congestion, exposures and response. This bedside task is to identify the mixed signals and obtain timely review, not infer a universal bolus or restriction.',
          'A low pressure is a finding to interpret, not a complete fluid prescription.',
        ]
      ),
      q(
        'fluid-heart-4',
        [
          'perfusion',
          'analyze',
          'evaluate',
          'Identify incomplete improvement after treatment.',
        ],
        'After team-directed treatment Alex reports easier breathing, but remains cool with low pressure and minimal urine output.',
        'Which conclusion is best supported?',
        [
          [
            'One symptom has improved while perfusion concerns remain unresolved.',
            'Breathing relief is useful, but the pressure, peripheral and output findings still need review.',
          ],
          [
            'The easier breathing establishes that the acute problem is resolved.',
            'Symptom improvement is not equivalent to recovery of organ perfusion.',
          ],
          [
            'Minimal urine output can now be discounted because respiratory treatment was effective.',
            'Persistent reduced output remains relevant and may change the treatment plan.',
          ],
          [
            'The remaining changes should be attributed to Alex’s age.',
            'Age does not explain away acute changes from the documented baseline.',
          ],
        ],
        [
          'Which earlier concerns are still present?',
          'Reassessment can show partial rather than complete improvement.',
          'Different aspects of circulation and congestion may respond at different times. Continuing perfusion abnormalities require evaluation even when a symptom improves.',
          'Describe improvement precisely, including what has not improved.',
        ]
      ),
    ],
    clue: clue(
      'Which additional observation would strengthen concern about poor effective perfusion?',
      [
        [
          'A new decrease in alertness alongside the low pressure.',
          'Another organ-related change strengthens the concern.',
        ],
        [
          'A lower respiratory rate accompanied by easier breathing.',
          'This supports respiratory improvement but does not add evidence of worsening organ perfusion.',
        ],
        [
          'A saturation that has returned to the prescribed target.',
          'Improved oxygenation does not establish circulatory recovery or add a new perfusion concern.',
        ],
        [
          'Urine output returning to the earlier trend with warmer hands.',
          'These changes would support improving perfusion rather than strengthen the concern.',
        ],
      ],
      'Look for a coherent response across organs rather than a single improved symptom.'
    ),
  },
  {
    id: 'the-dressing-is-only-one-clue',
    title: 'The dressing is only one clue',
    patient: 'Sam · 46 · postoperative ward',
    handoff:
      'Sam is several hours after abdominal surgery. Earlier pulse was 86/min, blood pressure 124/76 and urine output was maintained. They were alert and comfortable at rest. The prescribed postoperative observation and escalation plan is available.',
    focus: 'Use trends to recognize a postoperative perfusion concern.',
    sources: [sources.fluids, sources.sbar],
    steps: [
      q(
        'postop-1',
        [
          'perfusion',
          'apply',
          'recognize',
          'Select a meaningful postoperative change from baseline.',
        ],
        'Pulse rises to 118/min, pressure falls to 94/60 and Sam becomes lightheaded. The outer dressing shows only a small stain.',
        'Which information deserves greatest weight?',
        [
          [
            'The linked pulse, pressure and symptom changes from baseline.',
            'These acute changes raise a perfusion concern despite a small external stain.',
          ],
          [
            'The small external stain as the main estimate of possible blood loss.',
            'Visible dressing staining cannot account for all possible postoperative bleeding.',
          ],
          [
            'The absence of a documented previous bleeding disorder.',
            'No prior disorder does not exclude an acute postoperative problem.',
          ],
          [
            'The earlier normal observations as the best representation of current stability.',
            'Earlier values provide a baseline but do not replace the new assessment.',
          ],
        ],
        [
          'Which information describes the patient now?',
          'The trend carries more weight than a reassuring surface finding.',
          'Compensatory tachycardia, falling pressure and lightheadedness can accompany reduced circulating volume. External staining does not exclude concealed loss or another acute cause.',
          'Use visible findings without letting them override physiological change.',
        ]
      ),
      q(
        'postop-2',
        [
          'perfusion',
          'analyze',
          'prioritize',
          'Prioritize evaluation of a possible acute perfusion problem.',
        ],
        'Sam reports pain of 5/10. The pulse and pressure changes persist after a repeat assessment, and urine output is falling.',
        'Which concern should organize the immediate review?',
        [
          [
            'Possible circulatory deterioration requiring urgent assessment, including bleeding as a cause.',
            'This accounts for multiple changes and keeps alternative causes open while prioritizing review.',
          ],
          [
            'Pain-related tachycardia as a sufficient explanation for all the observations.',
            'Pain may contribute to pulse changes, but does not adequately account for the complete perfusion pattern.',
          ],
          [
            'A routine postoperative reduction in urine output that can be assessed at the next scheduled check.',
            'The combined pressure, pulse and symptom changes make routine-only follow-up insufficient.',
          ],
          [
            'A monitor problem unless the dressing becomes visibly saturated.',
            'Repeat readings and symptoms support a real clinical concern; dressing appearance is not a prerequisite for escalation.',
          ],
        ],
        [
          'Which explanation accounts for the pressure, symptoms and output as well as pulse?',
          'Prioritize the consequence that needs timely assessment while the cause is investigated.',
          'The task is to recognize a threatened circulation, not prove a final diagnosis before obtaining help.',
          'Escalation can be justified before diagnostic certainty.',
        ]
      ),
      q(
        'postop-3',
        [
          'communication',
          'apply',
          'act',
          'Request urgent review with a clear trend and clinical concern.',
        ],
        'You remain with Sam and activate the postoperative escalation pathway. You contact the responding clinician.',
        'Which message best supports an immediate response?',
        [
          [
            'Since handoff pulse rose from 86 to 118, pressure fell from 124/76 to 94/60, and Sam is lightheaded with falling output; I need urgent bedside review for a perfusion change.',
            'The comparison, symptoms and request explain why the situation needs prompt assessment.',
          ],
          [
            'Sam is uncomfortable after surgery; could the pain prescription be reviewed when possible?',
            'This leaves out the urgent perfusion information and narrows the review too early.',
          ],
          [
            'The dressing has a small stain; I will call again if that becomes larger.',
            'This omits the physiological changes already requiring review.',
          ],
          [
            'There is no known bleeding disorder, but I am slightly concerned about the observations.',
            'History and vague concern do not communicate the magnitude and direction of the change.',
          ],
        ],
        [
          'Make it possible for the receiving person to understand the change immediately.',
          'The baseline-to-current comparison makes your concern concrete.',
          'Clear escalation reduces the need for the recipient to reconstruct the clinical trajectory from a diagnosis label or isolated number.',
          'Give the trend, concern and specific request.',
        ]
      ),
      m(
        'postop-4',
        [
          'perfusion',
          'analyze',
          'evaluate',
          'Distinguish persistent deterioration from stable postoperative findings.',
        ],
        'While the team assesses Sam, you continue the prescribed observations. Classify each update.',
        'Which updates need prompt follow-up?',
        [
          [
            'Pressure falls further and Sam becomes harder to engage.',
            true,
            'Worsening pressure and mental status strengthen concern about perfusion.',
          ],
          [
            'Urine output remains markedly reduced.',
            true,
            'Persistent reduced output is an unresolved organ-perfusion concern.',
          ],
          [
            'The small external dressing stain is unchanged.',
            false,
            'It is not a new adverse change, but it does not rule out the other abnormalities or concealed bleeding.',
          ],
          [
            'A reliable repeat shows a further increase in pulse with cool skin.',
            true,
            'This adds to the pattern of continuing physiological deterioration.',
          ],
        ],
        [
          'Stable external appearance does not erase a worsening internal pattern.',
          'Keep reassessing while help and investigation are underway.',
          'A meaningful response assessment includes cognition, pressure, pulse and output; the dressing is only one source of information.',
          'Reassess the same concerns that prompted escalation.',
        ]
      ),
    ],
    clue: clue(
      'Which change would most challenge the assumption that pain alone explains Sam’s tachycardia?',
      [
        [
          'Pain improves but low pressure and reduced urine output persist.',
          'Persisting perfusion changes after pain relief make a pain-only account less adequate.',
        ],
        [
          'Pulse settles toward baseline as pain improves, with pressure and output maintained.',
          'A coherent improvement after pain relief would make pain a more adequate explanation.',
        ],
        [
          'The dressing remains only lightly stained.',
          'A surface finding cannot exclude other causes of deterioration.',
        ],
        [
          'Sam reports increased pain during movement and a pulse that rises at the same time.',
          'This supports a pain contribution but does not establish that pain explains the persistent pressure and output changes.',
        ],
      ],
      'Ask what evidence would challenge your first explanation.'
    ),
  },
  {
    id: 'infection-and-the-circulation',
    title: 'Infection and the circulation',
    patient: 'Casey · 61 · medical ward',
    handoff:
      'Casey is being treated for a suspected infection. Earlier pressure was 126/74, pulse 90/min and they were alert. A local sepsis assessment pathway, prescriber review and urgent response team are available. Your role is assessment, monitoring, escalation and administering prescribed care.',
    focus:
      'Recognize a change in organ function while infection is being investigated.',
    sources: [sources.sepsis, sources.fluids],
    steps: [
      q(
        'infection-1',
        [
          'infection',
          'understand',
          null,
          'Explain why an infection can be associated with poor perfusion.',
        ],
        'Casey asks why the team is checking blood pressure and urine output during an infection assessment.',
        'Which explanation best connects the observations with the concern?',
        [
          [
            'A severe response to infection can affect circulation and organ function, so the team tracks more than temperature.',
            'Circulation and output can reveal consequences requiring prompt assessment.',
          ],
          [
            'Urine output is checked only to determine the location of the infection.',
            'Output also informs organ function and fluid assessment; it does not by itself locate an infection.',
          ],
          [
            'A normal temperature would establish that circulation is unaffected.',
            'Temperature alone cannot establish stability or exclude a serious response to infection.',
          ],
          [
            'A blood-pressure reading identifies which organism is causing the infection.',
            'Blood pressure cannot identify the organism; it helps assess the physiological response.',
          ],
        ],
        [
          'Think about what the illness can do to organs as well as where it began.',
          'The team is watching the patient response, not just the infection label.',
          'Inflammatory changes can affect vascular tone, permeability and effective perfusion. The patient’s clinical response and organ function therefore matter alongside investigation of the source.',
          'Link observations to the consequence you are trying to detect.',
        ]
      ),
      q(
        'infection-2',
        [
          'infection',
          'analyze',
          'prioritize',
          'Prioritize a deterioration pattern during suspected infection.',
        ],
        'Casey now has pressure 88/54, pulse 124/min, new confusion and little urine output. The source is not yet confirmed.',
        'What should organize your immediate response?',
        [
          [
            'Urgent deterioration assessment and escalation while the possible source and other causes are investigated.',
            'The organ-related changes justify an urgent response without waiting for source confirmation.',
          ],
          [
            'Obtaining a confirmed source before deciding whether the new observations are urgent.',
            'Confirmation can take time; the patient’s current physiological changes already need action.',
          ],
          [
            'Repeating temperature first because it is the most direct measure of infection severity.',
            'Temperature adds information but does not outweigh hypotension, confusion and reduced output.',
          ],
          [
            'Attributing the findings to reduced intake until culture results are available.',
            'Reduced intake may contribute, but it is not a sufficient reason to dismiss the combined deterioration.',
          ],
        ],
        [
          'What decision can be justified now, even if the final diagnosis remains uncertain?',
          'You can act on a concerning trajectory before the cause is confirmed.',
          'A possible infection with new organ-related abnormalities needs timely assessment. Alternative causes remain in the review rather than being excluded by assumption.',
          'Distinguish uncertainty about the cause from certainty that review is needed.',
        ]
      ),
      m(
        'infection-3',
        [
          'infection',
          'apply',
          'generate',
          'Select elements that belong in an immediate escalation and review plan.',
        ],
        'The urgent team is on its way. Classify these proposed parts of the plan by whether they need prompt attention in Casey’s current situation.',
        'Which parts need prompt follow-up rather than routine-only review?',
        [
          [
            'Report the falling pressure and new confusion.',
            true,
            'These changes explain the immediate concern.',
          ],
          [
            'Confirm available vascular access and prepare the ordered investigations and treatment under the local pathway.',
            true,
            'Preparation supports timely prescribed care while the team assesses the patient.',
          ],
          [
            'The urgent prescribed treatment has not yet been prepared while source investigations are pending.',
            true,
            'The preparation delay needs prompt attention under the local pathway; source confirmation should not hold up urgent prescribed care.',
          ],
          [
            'Update an unchanged nonurgent dietary preference once the immediate assessment is underway.',
            false,
            'This remains part of person-centred care but is not the urgent physiological priority described.',
          ],
        ],
        [
          'Classify the proposals by what would affect the immediate response, including a harmful delay.',
          'Keep assessment, communication and prescribed treatment moving together.',
          'Timely response depends on recognizing the deterioration and preparing appropriate care; confirmation of a source should not become a barrier to reviewing an unstable patient.',
          'Identify delays as well as missing actions.',
        ]
      ),
      q(
        'infection-4',
        [
          'reassessment',
          'analyze',
          'evaluate',
          'Interpret discordant response findings after initial treatment.',
        ],
        'After prescribed treatment pressure rises to 106/66. Casey remains confused, output remains low and repeat lactate has not improved.',
        'Which interpretation best fits the reassessment?',
        [
          [
            'Pressure has improved, but continuing organ-related concerns need prompt reassessment.',
            'The change is partial; the other findings remain important.',
          ],
          [
            'The pressure response establishes that organ perfusion is now adequate.',
            'An improved pressure alone does not establish recovery across organs.',
          ],
          [
            'The persistent confusion should now be treated as Casey’s baseline.',
            'Earlier alertness was documented; the change remains unexplained.',
          ],
          [
            'The same treatment should continue without review until the laboratory value normalizes.',
            'Continuing abnormalities need active assessment rather than an automatic wait for normalization.',
          ],
        ],
        [
          'Look for agreement between the response measures.',
          'A response may be encouraging and still incomplete.',
          'Pressure, cognition, urine output and laboratory trends offer complementary evidence. A single improved measure cannot establish resolution of the whole problem.',
          'Name both what improved and what still needs attention.',
        ]
      ),
    ],
    clue: clue(
      'Which new detail would challenge an assumption that Casey is stable because the pressure improved?',
      [
        [
          'A further decline in alertness with continued low urine output.',
          'The continuing organ-related changes challenge the stability assumption.',
        ],
        [
          'The repeat pressure remains at the improved level.',
          'This confirms one part of the response but does not establish recovery of cognition or renal function.',
        ],
        [
          'Temperature falls while Casey becomes more alert.',
          'These changes support improvement rather than challenge it.',
        ],
        [
          'The source investigation is still pending.',
          'Uncertainty about the source is not itself a response measurement.',
        ],
      ],
      'Use recovery across several findings to test your interpretation.'
    ),
  },
  {
    id: 'the-temperature-can-mislead',
    title: 'The temperature can mislead',
    patient: 'Riley · 79 · assessment ward',
    handoff:
      'Riley is usually alert and walks with a frame. They are being assessed for a possible infection. At handoff pressure was 130/72 and RR 18/min. You have a documented baseline, the current chart and the local escalation pathway.',
    focus:
      'Avoid letting a single reassuring measurement obscure a changing patient.',
    sources: [sources.sepsis, sources.sbar],
    steps: [
      q(
        'temperature-1',
        [
          'infection',
          'understand',
          null,
          'Explain why lack of fever does not exclude a serious infection-related concern.',
        ],
        'Riley’s temperature is 36.8°C. A colleague says a serious infection is unlikely because there is no fever.',
        'Which statement best explains the limitation?',
        [
          [
            'Temperature is one part of the assessment; a normal reading does not exclude a serious infection-related illness.',
            'The whole presentation and trend remain necessary.',
          ],
          [
            'A normal temperature makes changes in cognition irrelevant to infection assessment.',
            'A mental-status change can be important even without a fever.',
          ],
          [
            'Only an unusually high temperature can justify an infection escalation pathway.',
            'Clinical concern and deterioration can justify assessment without that requirement.',
          ],
          [
            'The normal temperature establishes that any later deterioration must have a different cause.',
            'The measurement cannot establish a cause or exclude infection.',
          ],
        ],
        [
          'Ask what one measurement can actually exclude.',
          'A normal-looking number is not an all-clear for the patient.',
          'People can have serious infection-related illness without a raised temperature. Clinical assessment integrates trajectory, symptoms and organ-related changes.',
          'Keep the rest of the assessment active when one result is reassuring.',
        ]
      ),
      q(
        'temperature-2',
        [
          'infection',
          'analyze',
          'analyze',
          'Interpret baseline-to-current changes without anchoring on fever.',
        ],
        'Riley is newly disoriented, RR is 28/min and pressure is 96/58. Temperature remains 36.8°C.',
        'Which interpretation best uses the available evidence?',
        [
          [
            'The patient has deteriorated and needs prompt review; infection and other causes remain under consideration.',
            'The new neurological, respiratory and pressure changes justify review despite the temperature.',
          ],
          [
            'The normal temperature should outweigh the other changes until infection is confirmed.',
            'This overweights a single result against a consistent clinical trend.',
          ],
          [
            'Confusion is likely a usual feature of Riley’s age and can be removed from the comparison.',
            'The handoff establishes a different baseline; age does not erase a new change.',
          ],
          [
            'The respiratory rate should be interpreted alone before comparing the pressure or cognition.',
            'Interpreting the findings together is more useful than separating a linked deterioration pattern.',
          ],
        ],
        [
          'Which findings have changed from Riley’s own baseline?',
          'The baseline makes the new changes meaningful.',
          'New confusion, faster breathing and falling pressure can reflect systemic illness or another acute problem; uncertainty about the cause does not make the trajectory reassuring.',
          'Compare with the person, not a stereotype about age or diagnosis.',
        ]
      ),
      q(
        'temperature-3',
        [
          'communication',
          'apply',
          'act',
          'Include the baseline and an explicit request in escalation.',
        ],
        'You activate the local escalation process. The responder asks for a concise handoff.',
        'Which opening most clearly communicates the concern?',
        [
          [
            'Riley is normally alert; they now have new confusion, RR 28 and pressure 96/58 despite a normal temperature. I need prompt bedside assessment.',
            'The baseline, current changes and request are concrete.',
          ],
          [
            'Riley is older and a little unsettled, but has no fever; please review when convenient.',
            'This obscures the acute change and understates the concern.',
          ],
          [
            'The infection screen is pending; I will call once it identifies a cause.',
            'The current deterioration needs review before the investigation is complete.',
          ],
          [
            'Riley has several abnormal numbers; the full chart is available if you need details.',
            'The receiver should not have to reconstruct the priority from an unspecified set of abnormalities.',
          ],
        ],
        [
          'Give the patient’s baseline, what changed, and what you need.',
          'Specific observations make a clear escalation.',
          'A structured handoff supports a shared picture without overstating diagnostic certainty.',
          'Use precise changes rather than vague labels.',
        ]
      ),
      m(
        'temperature-4',
        [
          'reassessment',
          'apply',
          'evaluate',
          'Identify whether concerning changes remain after initial care.',
        ],
        'After assessment and prescribed care, classify Riley’s next observations.',
        'Which findings need prompt follow-up?',
        [
          [
            'Pressure falls further compared with the last assessment.',
            true,
            'The deterioration in pressure remains a concern.',
          ],
          [
            'Riley is harder to wake than during the last assessment.',
            true,
            'A worsening consciousness trend needs prompt review.',
          ],
          [
            'The previously documented healed skin mark is unchanged.',
            false,
            'The stable background finding does not indicate an acute change.',
          ],
          [
            'A reliable repeat shows an increasing respiratory rate.',
            true,
            'The worsening breathing trend remains relevant to the response assessment.',
          ],
        ],
        [
          'Use the same baseline-to-current comparison again.',
          'Reassessment is another decision, not just another set of observations.',
          'Repeated observations are useful when they inform whether the patient is responding, remains unchanged or is worsening.',
          'Use the trend to decide what needs another review.',
        ]
      ),
    ],
    clue: clue(
      'Build a more useful handoff: which detail should you add to “Riley is confused”?',
      [
        [
          'Riley was alert at handoff and the confusion developed with a fall in pressure.',
          'The baseline and linked change give the finding clinical meaning.',
        ],
        [
          'Riley’s age without any baseline description.',
          'Age does not establish the usual level of cognition.',
        ],
        [
          'The room number without describing the change.',
          'Location helps identify the patient but does not explain the concern.',
        ],
        [
          'An assumption that the confusion is expected.',
          'An unsupported assumption can hide a new change.',
        ],
      ],
      'A useful handoff distinguishes a new observation from an assumption.'
    ),
  },
  {
    id: 'less-urine-more-context',
    title: 'Less urine, more context',
    patient: 'Taylor · 58 · medical ward',
    handoff:
      'Taylor has had vomiting and poor intake. Earlier renal function was near their documented baseline. You are reviewing fluid balance, current observations and medication exposures with the treating team.',
    focus: 'Connect low output, renal trends and recent exposures.',
    sources: [sources.aki, sources.fluids],
    steps: [
      q(
        'kidney-1',
        [
          'fluids',
          'remember',
          null,
          'Recognize the meaning of oliguria in a fluid-balance review.',
        ],
        'The handoff uses the word “oliguria” when describing the output chart.',
        'What does this term describe?',
        [
          [
            'Reduced urine output.',
            'Oliguria describes the amount of urine output; context and measurement are still needed.',
          ],
          [
            'Blood in the urine.',
            'Hematuria describes blood in the urine rather than its volume.',
          ],
          [
            'Pain when passing urine.',
            'Dysuria describes pain or discomfort with urination.',
          ],
          [
            'Excessive urine output.',
            'Polyuria describes increased urine output rather than reduced output.',
          ],
        ],
        [
          'Separate urine volume, appearance and symptoms.',
          'The term names a finding, not its cause.',
          'A vocabulary check supports the later clinical decisions. Reduced output has several possible explanations and needs assessment in context.',
          'Knowing the term is a starting point for interpreting the trend.',
        ]
      ),
      q(
        'kidney-2',
        [
          'fluids',
          'analyze',
          'analyze',
          'Integrate reduced output with renal and circulation findings.',
        ],
        'Taylor has output below their earlier trend, rising creatinine, dizziness and lower pressure after ongoing vomiting.',
        'Which interpretation best integrates the findings?',
        [
          [
            'Acute renal impairment is a concern; fluid losses and perfusion require review alongside other causes.',
            'The combined trend needs assessment rather than a single assumed explanation.',
          ],
          [
            'Low output establishes that the urinary tract is obstructed.',
            'Obstruction is possible, but the output alone does not establish it; the losses and perfusion changes also matter.',
          ],
          [
            'A rising creatinine can be interpreted independently of fluid balance and exposure history.',
            'Those details can help explain the change and guide the clinical review.',
          ],
          [
            'The earlier baseline renal function makes an acute problem unlikely.',
            'The baseline makes a new rise meaningful rather than excluding it.',
          ],
        ],
        [
          'Which explanation accounts for the losses, pressure and renal trend together?',
          'Use the baseline to recognize a new problem.',
          'Effective circulating volume, renal perfusion, obstruction and medication effects can affect renal function. The pattern supports assessment for acute kidney injury without proving a single cause.',
          'Bring trends and possible contributors to the same review.',
        ]
      ),
      m(
        'kidney-3',
        [
          'medication',
          'apply',
          'generate',
          'Identify medication details needing prompt renal safety review.',
        ],
        'The treating team is assessing possible acute kidney injury. Classify the medication-review findings.',
        'Which findings need prompt follow-up?',
        [
          [
            'An NSAID was taken repeatedly during the period of vomiting and low intake.',
            true,
            'This exposure can be relevant to renal perfusion and needs inclusion in the review.',
          ],
          [
            'A medicine with renal dosing requirements has not yet been reviewed after the renal-function change.',
            true,
            'The new renal function may affect safe use; a prescriber or pharmacist should review the plan.',
          ],
          [
            'The pharmacist has completed the renal-dose review and the current prescriptions match that plan, with no further change reported.',
            false,
            'This row describes a completed review with no new discrepancy. The other unreviewed exposures still need attention.',
          ],
          [
            'The team has not been told about a recently added over-the-counter medicine.',
            true,
            'Unrecorded exposures may affect assessment and the medication plan.',
          ],
        ],
        [
          'Consider current organ function and the actual exposure timeline.',
          'The medicines history includes nonprescription products.',
          'Some medicines can affect renal perfusion or accumulate when renal function declines. The nursing task is to identify relevant exposures and obtain an individualized review.',
          'A changed patient can need a changed medication review.',
        ]
      ),
      q(
        'kidney-4',
        [
          'fluids',
          'apply',
          'evaluate',
          'Continue reassessment after a partial response in fluid status.',
        ],
        'After prescribed care, pressure improves but measured output remains low. The team has not yet reassessed the continued low output.',
        'What is the most appropriate next step?',
        [
          [
            'Recheck the output measurement and promptly report the persistent low trend for reassessment.',
            'This checks the data and keeps the unresolved concern in the clinical plan.',
          ],
          [
            'Use the pressure improvement to mark renal recovery complete.',
            'Pressure improvement alone does not establish renal recovery.',
          ],
          [
            'Replace the next measured output with an estimate based on the improved pressure.',
            'The actual measurement should be preserved and verified, not substituted by an assumption.',
          ],
          [
            'Give additional fluid independently until the output reaches the earlier baseline.',
            'The information does not justify an independent fluid prescription; ongoing assessment and the prescribed plan matter.',
          ],
        ],
        [
          'First verify the measurement, then interpret what remains unresolved.',
          'Good reassessment uses reliable data and an explicit next step.',
          'Persistent low output may reflect ongoing impairment or another cause despite an improved circulation measure. Further assessment must account for the full fluid and renal picture.',
          'Do not substitute an expected response for an observed one.',
        ]
      ),
    ],
    clue: clue(
      'Which new fact would make “fluid losses alone explain the low output” less certain?',
      [
        [
          'A newly discovered possible urinary obstruction.',
          'That adds a competing explanation requiring assessment.',
        ],
        [
          'A second note confirming earlier vomiting.',
          'It supports the existing explanation rather than challenging it.',
        ],
        [
          'The same recorded intake total.',
          'Repeated unchanged information does not add a competing cause.',
        ],
        [
          'Dizziness begins after another episode of vomiting and poor intake.',
          'This is consistent with a fluid-loss contribution rather than adding a competing explanation.',
        ],
      ],
      'A sound explanation stays open to new information.'
    ),
  },
  {
    id: 'potassium-in-context',
    title: 'Potassium in context',
    patient: 'Drew · 64 · acute medical ward',
    handoff:
      'Drew has impaired renal function. A new potassium result is above the laboratory’s adult reference interval. The team can obtain an ECG, repeat a sample when indicated and initiate the local hyperkalaemia pathway.',
    focus:
      'Recognize why symptoms and cardiac findings change the priority of an abnormal result.',
    sources: [sources.potassium, sources.aki, sources.sbar],
    steps: [
      q(
        'potassium-1',
        [
          'fluids',
          'remember',
          null,
          'Recognize the term for an elevated potassium result.',
        ],
        'You are reviewing the laboratory report before contacting the team.',
        'Which term means potassium above the reference interval?',
        [
          [
            'Hyperkalemia.',
            'Hyperkalemia describes an elevated potassium concentration.',
          ],
          ['Hypokalemia.', 'Hypokalemia describes low potassium.'],
          ['Hypernatremia.', 'Hypernatremia describes elevated sodium.'],
          ['Hypocalcemia.', 'Hypocalcemia describes low calcium.'],
        ],
        [
          'Identify which electrolyte the word names.',
          'Use a precise term when sharing an abnormal result.',
          'This is a prerequisite knowledge check. The result’s meaning and urgency still depend on the actual value, sample quality, symptoms and clinical setting.',
          'Name the finding accurately, then assess its context.',
        ]
      ),
      q(
        'potassium-2',
        [
          'fluids',
          'analyze',
          'prioritize',
          'Prioritize an abnormal potassium result with symptoms and ECG change.',
        ],
        'Potassium is 6.6 mmol/L. Drew has new weakness and a new ECG conduction change. The sample has no reported haemolysis flag.',
        'Which interpretation best guides the immediate priority?',
        [
          [
            'The result and clinical changes require urgent assessment under the hyperkalemia pathway.',
            'The combination raises a time-sensitive concern and should not await a routine review.',
          ],
          [
            'Sample error should be assumed until a later sample proves otherwise.',
            'Verification may be needed, but symptoms and ECG change make an assumption of error unsafe.',
          ],
          [
            'Weakness should be reviewed separately because it does not help interpret an electrolyte result.',
            'Neuromuscular symptoms can be relevant to an abnormal potassium result.',
          ],
          [
            'Known renal impairment makes the result an expected baseline finding.',
            'A known risk factor does not establish that the new result and changes are safe.',
          ],
        ],
        [
          'Look for evidence that the abnormal result may be affecting the patient.',
          'An expected risk is not the same as a reassuring response.',
          'Potassium disturbances can affect membrane excitability and cardiac conduction. The result, symptoms and new ECG changes need interpretation together.',
          'Combine the investigation with the patient’s current condition.',
        ]
      ),
      q(
        'potassium-3',
        [
          'perfusion',
          'apply',
          'act',
          'Escalate new instability during an electrolyte-related cardiac concern.',
        ],
        'While urgent review is underway, Drew becomes lightheaded with a lower pressure and a new slow pulse. They remain responsive.',
        'Which nursing response best fits this change?',
        [
          [
            'Activate the immediate deterioration response and communicate the potassium, rhythm and perfusion changes while supporting the patient under the local protocol.',
            'The new instability requires an immediate response and a concise clinical picture.',
          ],
          [
            'Wait for the repeat potassium before changing the urgency of review.',
            'The new perfusion and pulse changes already justify escalation.',
          ],
          [
            'Arrange routine outpatient follow-up because renal impairment explains the potassium.',
            'The current symptoms and instability require acute assessment.',
          ],
          [
            'Document the pulse change and wait for the next scheduled observation.',
            'A scheduled interval is not a reason to defer response to new instability.',
          ],
        ],
        [
          'What has changed about the patient’s stability?',
          'Respond to instability while the cause is assessed.',
          'An electrolyte problem can become a circulation emergency. The nursing role includes rapid recognition, help-seeking and protocol-based support rather than waiting for every investigation to return.',
          'A change in stability can change the priority immediately.',
        ]
      ),
      m(
        'potassium-4',
        [
          'communication',
          'apply',
          'generate',
          'Select relevant information for an urgent electrolyte handoff.',
        ],
        'You are assembling the immediate handoff. Classify the following information by whether it needs prompt attention in this review.',
        'Which details need prompt follow-up?',
        [
          [
            'The current potassium value and time the sample was collected.',
            true,
            'The value and timing help the team interpret the current risk.',
          ],
          [
            'The new conduction change, slow pulse and pressure decline.',
            true,
            'These findings describe the patient’s instability.',
          ],
          [
            'Recent relevant medicines and the renal-function trend.',
            true,
            'They may contribute to the cause and affect treatment planning.',
          ],
          [
            'An unchanged nonurgent meal preference.',
            false,
            'This is not a priority detail for the immediate electrolyte-related handoff.',
          ],
        ],
        [
          'Give information that changes urgency, interpretation or the treatment plan.',
          'A useful handoff includes findings, timing and possible contributors.',
          'An investigation is most actionable when paired with the clinical change and relevant context; a laboratory number alone can hide urgency.',
          'Make the abnormal result part of the patient story.',
        ]
      ),
    ],
    clue: clue(
      'Which finding would challenge the assumption that a normal-looking ECG excludes an important potassium problem?',
      [
        [
          'A reliably confirmed markedly elevated potassium in a patient with a relevant renal trend.',
          'A reassuring ECG appearance does not independently exclude important hyperkalemia.',
        ],
        [
          'A repeat uncontaminated sample within the reference interval, with the first sample confirmed as haemolysed.',
          'That would support sample-related error in the first result rather than challenge reassurance from the new assessment.',
        ],
        [
          'No reported muscle weakness while the repeat potassium is still pending.',
          'Absence of a symptom is insufficient to exclude risk; it does not provide the strong competing evidence supplied by a confirmed high result.',
        ],
        [
          'Renal function and potassium both returning to their documented baseline on repeat testing.',
          'Those objective improvements support recovery rather than challenge it.',
        ],
      ],
      'Ask what a reassuring test can actually exclude.'
    ),
  },
  {
    id: 'comfortable-or-too-sedated',
    title: 'Comfortable—or too sedated?',
    patient: 'Jamie · 49 · postoperative ward',
    handoff:
      'Jamie received prescribed opioid analgesia after surgery. Before the dose they were awake, RR 16/min and saturation 97% on prescribed oxygen. The unit has an opioid monitoring and emergency response protocol.',
    focus: 'Distinguish pain relief from a concerning ventilation change.',
    sources: [sources.opioid, sources.oxygen],
    steps: [
      q(
        'opioid-1',
        [
          'medication',
          'understand',
          null,
          'Explain why saturation alone cannot establish safe ventilation after an opioid.',
        ],
        'Jamie’s saturation stays 97% while receiving supplemental oxygen.',
        'What is the limitation of using that number alone after an opioid?',
        [
          [
            'Supplemental oxygen can maintain saturation while breathing and ventilation worsen.',
            'The reading does not replace respiratory and sedation assessment.',
          ],
          [
            'A saturation in target confirms that the opioid has no respiratory effect.',
            'The monitor does not establish the absence of an opioid effect on ventilation.',
          ],
          [
            'Oximetry directly measures the amount of carbon dioxide being cleared.',
            'Pulse oximetry does not measure carbon dioxide clearance.',
          ],
          [
            'A normal oxygen reading makes the level of consciousness less useful.',
            'Sedation and responsiveness remain important parts of opioid monitoring.',
          ],
        ],
        [
          'Separate oxygenation from the movement of air.',
          'A monitor reading is only one part of the assessment.',
          'Opioids can suppress ventilatory drive. Oxygen may support saturation while inadequate ventilation and sedation develop, so observations of breathing and consciousness remain necessary.',
          'Assess the patient as well as the oxygen reading.',
        ]
      ),
      q(
        'opioid-2',
        [
          'medication',
          'analyze',
          'analyze',
          'Interpret a medication timeline with new sedation and slow breathing.',
        ],
        'Twenty minutes after analgesia Jamie is difficult to wake, RR 7/min and saturation remains 97% on oxygen. Pain appears reduced.',
        'Which interpretation is best supported?',
        [
          [
            'The new sedation and slow breathing raise concern for opioid-related ventilatory impairment despite pain relief.',
            'The exposure timeline and clinical changes fit a concerning adverse effect that needs prompt assessment.',
          ],
          [
            'Reduced pain with a target-range saturation is the strongest evidence of a successful response.',
            'This gives pain relief and oxygenation too much weight while overlooking reduced responsiveness and breathing.',
          ],
          [
            'The slow breathing is probably an acceptable sleep pattern because oxygen is prescribed.',
            'The new marked sedation and reduced rate should not be assumed to be normal sleep.',
          ],
          [
            'The opioid can be excluded because the saturation did not fall.',
            'A maintained saturation on oxygen does not exclude a ventilatory effect.',
          ],
        ],
        [
          'Which new changes could be related to the recent exposure?',
          'Treatment benefit and an adverse effect can occur together.',
          'Pain relief does not establish safe ventilation. The temporal relationship raises a plausible contributor while an urgent assessment considers other causes as well.',
          'Do not let a treatment benefit hide a new adverse response.',
        ]
      ),
      q(
        'opioid-3',
        [
          'respiratory',
          'apply',
          'act',
          'Choose an immediate response to new sedation and inadequate breathing.',
        ],
        'Jamie remains responsive only to repeated stimulation. You are at the bedside; the emergency team and prescribed unit protocol are available.',
        'Which response best fits the immediate concern?',
        [
          [
            'Call for immediate help, assess and support airway and breathing, and follow the unit’s prescribed opioid emergency protocol.',
            'This addresses the immediate physiological concern and obtains the necessary team support.',
          ],
          [
            'Increase oxygen alone and reassess at the next routine observation.',
            'Oxygen alone does not correct inadequate ventilation and does not justify delaying response.',
          ],
          [
            'Allow uninterrupted sleep because the pain treatment has worked.',
            'The marked change in responsiveness and breathing needs assessment rather than an assumption of restorative sleep.',
          ],
          [
            'Focus first on whether Jamie still reports pain before deciding if review is needed.',
            'The ventilation and responsiveness changes already determine the urgent priority.',
          ],
        ],
        [
          'What physiological function needs support now?',
          'Address breathing and obtain help while following the prescribed pathway.',
          'A respiratory emergency response prioritizes airway and ventilation assessment alongside investigation and treatment of the contributor.',
          'Match the first response to the immediate physiological threat.',
        ]
      ),
      q(
        'opioid-4',
        [
          'medication',
          'analyze',
          'evaluate',
          'Plan continued monitoring after an initial response to emergency care.',
        ],
        'After team-directed care Jamie is easier to wake and breathing improves. The team has given a further monitoring plan because the opioid may continue to act.',
        'Which interpretation should guide continued care?',
        [
          [
            'The initial improvement is encouraging, but recurrent sedation or breathing changes still require surveillance under the plan.',
            'The contributor can outlast an initial response, so continued monitoring matters.',
          ],
          [
            'A response to initial care establishes that recurrence is no longer possible.',
            'An initial response does not establish that the exposure has ended.',
          ],
          [
            'Only pain scores need to be followed now that breathing improved.',
            'Respiratory and sedation monitoring remain part of the prescribed follow-up.',
          ],
          [
            'The earlier event can be removed from the next handoff because it has improved.',
            'The event and monitoring plan remain relevant to safe continuity.',
          ],
        ],
        [
          'Has the exposure necessarily ended when the first response improves?',
          'An initial response is a reason to reassess, not a reason to stop observing.',
          'The duration of an opioid effect and the response to emergency treatment may differ. Ongoing observation helps detect recurrence or another cause.',
          'Include recurrence risk and the follow-up plan in your handoff.',
        ]
      ),
    ],
    clue: clue(
      'Change one detail: which observation most supports comfortable recovery rather than increasing sedation?',
      [
        [
          'Jamie wakes easily, converses normally and has sustained adequate breathing on the prescribed observations.',
          'The findings are coherent with a more reassuring recovery picture.',
        ],
        [
          'Jamie is difficult to wake but the saturation remains in target on oxygen.',
          'That combination does not establish adequate ventilation.',
        ],
        [
          'Jamie no longer asks for pain medicine because they cannot stay awake.',
          'The reason for reduced requests matters; this description is concerning.',
        ],
        [
          'The opioid administration was documented correctly.',
          'Correct documentation does not establish the patient’s response.',
        ],
      ],
      'The meaning of “comfortable” depends on responsiveness and breathing as well as pain.'
    ),
  },
  {
    id: 'the-new-clue-changes-the-plan',
    title: 'The new clue changes the plan',
    patient: 'Avery · 57 · acute medical ward',
    handoff:
      'Avery has a suspected infection with a new pressure decline and increased breathing rate. The team has assessed them and ordered urgent treatment, including an IV antibiotic after allergy checks. Local sepsis and emergency anaphylaxis protocols are available.',
    focus:
      'Update the explanation when a new exposure changes the patient story.',
    sources: [sources.sepsis, sources.anaphylaxis],
    steps: [
      q(
        'reaction-1',
        [
          'infection',
          'apply',
          'prioritize',
          'Use the full clinical picture when prioritizing prescribed infection care.',
        ],
        'Avery’s temperature falls after an antipyretic, but the pressure and breathing abnormalities persist. The prescribed treatment is ready.',
        'Which response best fits the current information?',
        [
          [
            'Continue the urgent assessed plan and observations; the lower temperature does not resolve the other concerns.',
            'The ongoing changes still matter despite a temperature response.',
          ],
          [
            'Defer the urgent plan because the lower temperature shows the infection has resolved.',
            'An antipyretic response does not establish resolution of the illness or physiological effects.',
          ],
          [
            'Use the temperature alone to decide whether further escalation is necessary.',
            'This leaves out the persistent pressure and breathing changes.',
          ],
          [
            'Replace the current assessment with the earlier stable handoff because the fever improved.',
            'The current observations remain the basis for reassessment.',
          ],
        ],
        [
          'Which findings remain abnormal after the temperature change?',
          'Symptom treatment does not replace reassessment of the illness.',
          'An antipyretic can lower temperature without resolving the cause of an infection-related deterioration. The other clinical changes remain relevant to the plan.',
          'Reassess the whole response when one symptom changes.',
        ]
      ),
      q(
        'reaction-2',
        [
          'medication',
          'analyze',
          'analyze',
          'Revise a working explanation after a new exposure and symptom pattern.',
        ],
        'Shortly after the antibiotic infusion begins, Avery develops new widespread hives, wheeze and a further pressure fall.',
        'Which interpretation best accounts for this new pattern?',
        [
          [
            'An acute drug-related anaphylactic reaction must be considered alongside the original illness.',
            'The new exposure, skin findings and respiratory/circulatory change require immediate reassessment of the working explanation.',
          ],
          [
            'The new changes can be assigned to the original infection without revisiting the exposure timeline.',
            'This overlooks the close temporal relationship and newly added symptom pattern.',
          ],
          [
            'Hives make a significant respiratory or circulatory reaction less likely.',
            'Skin findings can accompany anaphylaxis; they do not cancel respiratory or circulatory involvement.',
          ],
          [
            'The prior allergy check excludes a first recognized reaction to the medicine.',
            'A negative history does not exclude a new reaction.',
          ],
        ],
        [
          'What new information does the original explanation fail to account for?',
          'A sound working explanation changes when the patient story changes.',
          'An acute reaction may affect skin, airways and circulation after an exposure. Prior absence of a known allergy cannot establish safety of the current response.',
          'Keep the exposure timeline active when a new pattern appears.',
        ]
      ),
      q(
        'reaction-3',
        [
          'respiratory',
          'apply',
          'act',
          'Activate the immediate response to an acute breathing and circulation reaction.',
        ],
        'You stop the suspected trigger and call for immediate emergency assistance. Avery is wheezing and has worsening breathing difficulty. The emergency protocol and team are available.',
        'What should guide your next nursing actions?',
        [
          [
            'Assess and support airway, breathing and circulation while following the emergency anaphylaxis protocol and preparing its prescribed treatment.',
            'This prioritizes the threatened physiological functions within the stated emergency plan.',
          ],
          [
            'Focus on documenting the rash before supporting the breathing problem.',
            'Documentation matters, but the airway, breathing and circulatory threats determine the immediate priority.',
          ],
          [
            'Restart the infusion more slowly once the wheeze briefly eases.',
            'A short change in one symptom does not justify re-exposure during a suspected serious reaction.',
          ],
          [
            'Wait for an allergy investigation before following the emergency pathway.',
            'Emergency assessment and treatment cannot wait for later confirmation.',
          ],
        ],
        [
          'What needs immediate support before the cause can be formally confirmed?',
          'Use the emergency pathway while supporting the patient’s physiological needs.',
          'Acute airway, breathing or circulation compromise after an exposure is time-sensitive. Investigations and later documentation complement the emergency response rather than replacing it.',
          'Respond to the current threat without waiting for a final label.',
        ]
      ),
      q(
        'reaction-4',
        [
          'perfusion',
          'apply',
          'evaluate',
          'Continue reassessment after an initial circulatory response.',
        ],
        'After prescribed emergency treatment Avery’s pressure improves. Wheeze and weakness persist, and the team has ordered continued close observation.',
        'Which next step best follows the available evidence?',
        [
          [
            'Continue the ordered reassessment and report the persisting respiratory symptoms and weakness.',
            'The improvement is partial; ongoing findings still inform the response plan.',
          ],
          [
            'Return to routine observations because the pressure is now better.',
            'One improved measure does not establish that the acute reaction has resolved.',
          ],
          [
            'Document the pressure alone as the complete treatment response.',
            'The response includes ongoing respiratory and clinical findings.',
          ],
          [
            'Assume the remaining symptoms are unrelated to the event because treatment was given.',
            'Treatment administration does not establish that all consequences have resolved.',
          ],
        ],
        [
          'Separate “treatment given” from “all concerns resolved.”',
          'Describe the patient response accurately, including what persists.',
          'A pressure response is encouraging but does not independently establish resolution of respiratory involvement or eliminate recurrence concerns in the ongoing clinical plan.',
          'Use several findings to judge response.',
        ]
      ),
    ],
    clue: clue(
      'Which new detail would most challenge an infection-only explanation of Avery’s sudden deterioration?',
      [
        [
          'New hives and wheeze beginning immediately after a new infusion.',
          'The exposure-linked new pattern adds a competing, urgent explanation.',
        ],
        [
          'A note confirming that infection was suspected earlier.',
          'That supports the earlier explanation without accounting for the new exposure-linked findings.',
        ],
        [
          'The same temperature recorded before treatment.',
          'An old measurement does not explain the new trajectory.',
        ],
        [
          'A correctly signed fluid-balance chart.',
          'Documentation completion does not identify the cause of a new reaction.',
        ],
      ],
      'Good reasoning includes changing your mind when new evidence warrants it.'
    ),
  },
]
