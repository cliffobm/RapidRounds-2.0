import type { EvolvingQuestion } from './evolving-types'

type Option = [text: string, explanation: string]
export type OtherCaseQuestions = {
  challenge: EvolvingQuestion
  advanced: EvolvingQuestion
}

// Fictional teaching cases. These are draft assessment items, not care protocols.
// Additional findings belong to the question where they are explicitly introduced.
// Clinical source coverage is retained here for the editorial review trail.
export const otherCaseQuestionSources = {
  'fever-neuro': [
    'https://www.nice.org.uk/guidance/ng240/chapter/Recommendations',
    'https://www.nice.org.uk/guidance/ng228/chapter/Recommendations',
  ],
  'pancreas-balance': [
    'https://www.nice.org.uk/guidance/ng104/chapter/Recommendations',
    'https://www.nice.org.uk/guidance/cg174/chapter/recommendations',
  ],
  'leg-to-lung': [
    'https://www.nice.org.uk/guidance/ng158/chapter/Recommendations',
  ],
  'nutrition-context': [
    'https://www.nice.org.uk/guidance/ng20/chapter/Recommendations',
    'https://www.nice.org.uk/guidance/cg174/chapter/recommendations',
    'https://www.nice.org.uk/guidance/cg32/chapter/Recommendations',
  ],
} as const

function q(
  prompt: string,
  correct: number[],
  options: Option[],
  reflection: string
): EvolvingQuestion {
  return {
    prompt,
    options: options.map(([text, explanation], index) => ({
      id: String(index),
      text,
      explanation,
    })),
    correct: correct.map(String),
    reflection,
  }
}

export const complexCasesOther: Record<
  string,
  Record<string, OtherCaseQuestions[]>
> = {
  'fever-neuro': {
    a: [
      {
        challenge: q(
          'Avery has a different headache, fever and neck discomfort. Which focused assessment best establishes whether neurologic function is changing while urgent review is arranged?',
          [2],
          [
            [
              'Repeat the pain score after a dark-room rest before assessing cognition',
              'Pain reassessment is useful, but delaying a neurologic baseline could miss deterioration.',
            ],
            [
              'Record neck range of motion as the main neurologic baseline',
              'Neck discomfort does not establish alertness, pupils or focal function.',
            ],
            [
              'Compare alertness, pupils and focal function with a collateral baseline',
              'This creates a current neurologic baseline and a person-specific comparison without requiring a diagnosis.',
            ],
            [
              'Use the SpO₂ of 97% to document an intact neurologic assessment',
              'Normal peripheral oxygen saturation does not assess neurologic function.',
            ],
          ],
          'Name a neurologic change that would require an immediate update rather than waiting for the next routine observations.'
        ),
        advanced: q(
          'Avery says, “My migraines usually build slowly, and I do not usually have fever.” The onset speed of this headache has not been established. Which TWO questions would most help challenge migraine anchoring without postponing urgent assessment?',
          [0, 3],
          [
            [
              '“Did this headache become maximal suddenly, and what were you doing at onset?”',
              'A sudden maximal-onset headache would broaden the urgent differential, including vascular causes.',
            ],
            [
              '“Which medicine and sleep pattern usually precede your migraines?”',
              'This helps characterise migraine but is less immediately discriminating than the unestablished onset and new neurologic symptoms.',
            ],
            [
              '“Have you been around anyone with a respiratory infection during the past week?”',
              'Exposure history can contribute, but it does not establish the urgent headache features that are still unknown.',
            ],
            [
              '“Have you had new confusion, weakness, a seizure or a change in vision?”',
              'New neurologic features change the differential, urgency and investigation safety.',
            ],
            [
              '“Would a normal neck examination make you comfortable going home?”',
              'A negative neck finding alone would not safely exclude a serious cause.',
            ],
          ],
          'Explain why meningitis is a working concern while a sudden vascular headache would still need consideration if new history supports it.'
        ),
      },
      {
        challenge: q(
          'Avery now loses the thread of questions; the friend confirms clear conversation earlier. Which TWO actions best investigate a reversible contributor while preserving the urgent neurologic response?',
          [1, 3],
          [
            [
              'Attribute the change to migraine fatigue until the next temperature check',
              'This explanation is untested and would postpone assessment of a new neurologic change.',
            ],
            [
              'Check bedside glucose using the local pathway',
              'Hypoglycaemia is a potentially reversible cause of altered mental state that can be assessed promptly.',
            ],
            [
              'Replace the neurologic assessment with another oxygen-saturation reading',
              'Oximetry is one part of assessment and does not explain the cognitive change.',
            ],
            [
              'Repeat and document level of consciousness and communicate the new change now',
              'A documented trend helps the team act on deterioration before diagnostic results return.',
            ],
          ],
          'Describe what you would reassess after correcting any reversible abnormality.'
        ),
        advanced: q(
          'Additional assessment for this question: bedside glucose is within the local reference range, pupils are equal, and Avery remains newly inattentive. A colleague says the normal glucose and pupils make urgent infection assessment unnecessary. Which interpretation is strongest?',
          [1],
          [
            [
              'Equal pupils favour a non-focal cause, so defer the repeat consciousness assessment',
              'Equal pupils do not resolve the acute cognitive change or justify delaying its reassessment.',
            ],
            [
              'The normal findings do not explain the new febrile cognitive change',
              'Negative findings update the differential; they do not erase the unresolved high-risk pattern.',
            ],
            [
              'Trial the usual migraine treatment before deciding whether the cognitive change needs investigation',
              'The different headache with fever and new inattention already warrants assessment; a therapeutic trial should not be the gatekeeper.',
            ],
            [
              'Prioritise the neck examination over the attention trend because it is more specific to meningitis',
              'The acute attention change remains important even if a neck examination is less clear or appears reassuring.',
            ],
          ],
          'State your leading concern, one remaining alternative and the new finding that would change your next action.'
        ),
      },
      {
        challenge: q(
          'Investigations are delayed and Avery is less alert. Suspected bacterial meningitis remains the team’s working concern. Which TWO requests avoid delaying time-critical treatment while the team determines whether lumbar puncture is safe?',
          [0, 2],
          [
            [
              'Escalate the fall in alertness and clarify immediate stabilisation and antimicrobial timing',
              'Declining consciousness changes urgency; treatment planning must not wait passively for procedure access.',
            ],
            [
              'Wait for a lumbar-puncture slot before updating the prescriber',
              'A logistical delay is not a reason to defer a clinical deterioration update.',
            ],
            [
              'Coordinate indicated blood samples promptly when this will not delay treatment',
              'Blood investigations and treatment can be coordinated while procedure safety is assessed.',
            ],
            [
              'Proceed with lumbar puncture solely because antibiotics may reduce diagnostic yield',
              'Diagnostic yield does not override airway, shock or neurologic safety considerations.',
            ],
          ],
          'Which tasks can proceed in parallel, and who must decide whether lumbar puncture is currently safe?'
        ),
        advanced: q(
          'Additional deterioration for this question: Avery’s GCS falls rapidly from 13 to 9 and a pupil becomes poorly reactive. Lumbar puncture is being prepared. Which THREE elements belong in your urgent escalation?',
          [1, 2, 4],
          [
            [
              'Continue the lumbar puncture to obtain a definitive answer before changing the plan',
              'A rapid fall in consciousness and abnormal pupil reaction require a safety reassessment before lumbar puncture.',
            ],
            [
              'Stop progression toward lumbar puncture and request immediate senior assessment of these new neurologic signs',
              'These are features that change the safety and sequence of investigations.',
            ],
            [
              'Prioritise airway and physiological stabilisation with the emergency team',
              'A reduced level of consciousness can threaten airway protection; immediate stabilisation takes priority.',
            ],
            [
              'Delay antimicrobial treatment until after neuroimaging to protect the scan interpretation',
              'Neuroimaging should not postpone time-critical treatment of suspected bacterial meningitis.',
            ],
            [
              'Communicate that blood investigations and prescribed antimicrobials should be coordinated before imaging without avoidable delay',
              'Treatment and stabilisation need coordination while the senior team arranges appropriate imaging.',
            ],
          ],
          'Explain how the new findings change investigation sequencing without claiming that they prove a particular intracranial diagnosis.'
        ),
      },
      {
        challenge: q(
          'Avery asks why multiple teams are attending, and the friend asks for the results. Avery’s information-sharing preferences have not been checked. Which response best combines a clear explanation with an appropriate next step?',
          [3],
          [
            [
              '“You definitely have meningitis; I will explain all your results to your friend.”',
              'This claims an unconfirmed diagnosis and assumes permission to share.',
            ],
            [
              '“There is no time for explanations until all tests are complete.”',
              'A brief explanation can support participation during urgent care.',
            ],
            [
              '“The tests will settle everything, so nothing else needs discussing.”',
              'The current uncertainty and care plan still need explanation.',
            ],
            [
              '“We need to assess the fever and alertness change. May we involve your friend?”',
              'This explains the reason for urgency without false certainty and checks the patient’s wishes.',
            ],
          ],
          'What would you check if Avery cannot follow the discussion well enough to express a reliable preference?'
        ),
        advanced: q(
          'Additional communication assessment: Avery alternates between a clear answer and losing the conversation. The friend requests consent for every procedure on Avery’s behalf. Which TWO actions best support decision-making now?',
          [0, 2],
          [
            [
              'Ask the treating team to assess decision-specific capacity and support Avery to participate as much as possible',
              'Fluctuating cognition requires assessment for the decision at hand rather than a blanket assumption of incapacity.',
            ],
            [
              'Treat the friend’s presence as automatic legal authority for all decisions',
              'Relationship or presence alone does not establish authority to consent.',
            ],
            [
              'Clarify the friend’s role, any documented representative arrangements and what information is necessary for urgent care',
              'This supports lawful, proportionate involvement while urgent treatment is coordinated under the applicable pathway.',
            ],
            [
              'Wait for full cognitive recovery before any necessary emergency care can proceed',
              'Necessary emergency care must follow the appropriate clinical and consent pathway rather than be indefinitely postponed.',
            ],
          ],
          'Separate the clinical need for immediate care from the question of who can make each decision under the local policy.'
        ),
      },
      {
        challenge: q(
          'Avery’s temperature is now 38.6°C, pulse 114/min, RR 26/min and BP 102/64; alertness is worse than on arrival. Which opening handover best communicates why the response must be reconsidered?',
          [1],
          [
            [
              '“The temperature is down, so I am calling with an improving fever.”',
              'This framing hides the worsening neurologic and respiratory findings.',
            ],
            [
              '“Alertness and breathing are worsening despite a lower temperature; please review now.”',
              'This leads with the current deterioration, relevant trend and specific requested response.',
            ],
            [
              '“Avery has migraines; I can give the full migraine history first.”',
              'Remote history should not obscure the immediate clinical change.',
            ],
            [
              '“The antibiotics have definitely failed and a resistant organism is confirmed.”',
              'Neither resistance nor treatment failure has been established by these observations alone.',
            ],
          ],
          'Name the earlier neurologic baseline and treatment timing you would add after this opening sentence.'
        ),
        advanced: q(
          'The clinician replies, “The fever is falling; repeat observations later.” Avery’s reduced alertness and rising RR remain unexplained. Which response best addresses this disagreement?',
          [2],
          [
            [
              'Repeat temperature and give its downward trend first when seeking a routine review',
              'This continues to prioritise the improving measure over the worsening neurologic and respiratory findings.',
            ],
            [
              'Repeat a full set of observations before challenging the requested delay',
              'Reassessment is important, but the known worsening trend already warrants a clear immediate escalation rather than deferring the challenge.',
            ],
            [
              'Restate the worsening trends, request review and escalate unresolved concern',
              'This uses objective change and an explicit safety request while preserving diagnostic uncertainty.',
            ],
            [
              'Ask the friend to confirm the headache history again before escalating the change in alertness',
              'The baseline and new change are already documented; repeating remote history should not delay the safety response.',
            ],
          ],
          'Give a concise escalation sentence that includes the risk of waiting and what you need the receiving clinician to do.'
        ),
      },
      {
        challenge: q(
          'After team care, Avery’s pulse and temperature improve, but attention remains below the friend’s documented baseline. Which outcome measure best determines whether the neurologic concern is resolving?',
          [0],
          [
            [
              'Repeat attention and alertness against the documented baseline',
              'The unresolved functional change must be measured directly rather than inferred from fever reduction.',
            ],
            [
              'A single lower temperature without another neurologic assessment',
              'This measures one physiological response, not cognitive recovery.',
            ],
            [
              'The friend’s relief that treatment has begun',
              'Reassurance does not establish return to baseline function.',
            ],
            [
              'A lower pain rating as evidence that attention has normalised',
              'Pain and cognition are different outcomes.',
            ],
          ],
          'State an unresolved finding and the reassessment or escalation plan needed before the next handover.'
        ),
        advanced: q(
          'Additional investigation update: a CSF Gram stain is negative after antibiotics were started; other results are pending. Avery remains inattentive. Which TWO conclusions should guide the next discussion?',
          [1, 3],
          [
            [
              'Use the negative Gram stain to defer infection review until the remaining culture returns',
              'A negative stain, especially after antibiotics, does not safely resolve the clinical concern or the persistent neurologic change.',
            ],
            [
              'Ask the team to interpret the full CSF and blood results with the timing of antibiotics',
              'Prior treatment can affect diagnostic reliability; results need integrated interpretation.',
            ],
            [
              'Use the falling pulse and temperature as the main basis for extending neurologic check intervals',
              'Improvement in those observations does not establish that the unresolved attention change is recovering.',
            ],
            [
              'Continue explicit neurologic reassessment while the team reviews unresolved causes and the treatment plan',
              'Persistent cognitive change remains a clinical issue even as other observations improve.',
            ],
          ],
          'Explain how you would avoid both prematurely excluding infection and treating the working diagnosis as proven.'
        ),
      },
    ],
    b: [
      {
        challenge: q(
          'Robin is 72, took an antipyretic, has a temperature of 37.7°C and no rash. Family reports a sudden change in attention. Which assessment finding should be given the greatest weight when deciding the urgency of review?',
          [2],
          [
            [
              'The lack of rash as evidence against urgent infection assessment',
              'Serious meningitis or meningococcal disease does not require a rash.',
            ],
            [
              'The temperature alone as proof that the illness is mild',
              'Medication and age can influence the presentation; the whole pattern matters.',
            ],
            [
              'The verified acute change from usual conversation',
              'A new neurologic change is meaningful despite a less striking temperature.',
            ],
            [
              'The presence of arthritis as a complete explanation for all symptoms',
              'Arthritis may complicate neck assessment, but does not explain new inattention.',
            ],
          ],
          'How would you establish what Robin could do and say before this illness?'
        ),
        advanced: q(
          'Robin’s family says, “They were managing bills and talking normally yesterday.” The neck examination is limited by arthritis. Which TWO interpretations best resist premature closure?',
          [0, 3],
          [
            [
              'Treat this as an acute cognitive change requiring a cause to be sought, rather than assuming dementia from age',
              'The collateral baseline supports acute change, not a new diagnosis of chronic impairment.',
            ],
            [
              'Conclude the limited neck examination rules out meningeal disease',
              'A difficult examination cannot be treated as a reassuring negative finding.',
            ],
            [
              'Wait for a rash to distinguish all serious from non-serious causes',
              'Waiting for a rash can delay response and does not address other causes of delirium.',
            ],
            [
              'Keep infection, metabolic causes and other acute neurologic processes in the differential while escalating the current change',
              'Parallel assessment avoids a false choice between urgent infection review and other reversible contributors.',
            ],
          ],
          'Identify one targeted assessment that could change the differential without delaying urgent help.'
        ),
      },
      {
        challenge: q(
          'Robin needs questions repeated and neck movement remains difficult to interpret. Which TWO nursing observations best determine whether this is progressing?',
          [1, 2],
          [
            [
              'Repeat only neck range of motion until it becomes diagnostic',
              'A limited neck examination should not replace monitoring neurologic function.',
            ],
            [
              'Use the same documented alertness assessment and compare it with the previous review',
              'A consistent method makes the direction of change easier to communicate.',
            ],
            [
              'Check bedside glucose and current focal neurologic findings alongside the full observations',
              'These assess important contributors and changes while urgent review proceeds.',
            ],
            [
              'Record “confused elderly patient” without timing or baseline',
              'This label omits the acute change and makes progression difficult to judge.',
            ],
          ],
          'Which new finding would make you call again before the planned review time?'
        ),
        advanced: q(
          'Additional assessment: Robin has a low bedside glucose, which is treated under the local protocol. The repeat glucose normalises, but inattention persists with fever and RR 24/min. What is the strongest next inference?',
          [3],
          [
            [
              'Continue glucose-focused observations and defer other acute review until the next routine set',
              'The treated glucose abnormality does not explain persistent inattention with the systemic pattern.',
            ],
            [
              'Start a routine chronic cognitive-impairment assessment before further acute review',
              'The new onset and ongoing physiology require an acute assessment before attributing the change to chronic disease.',
            ],
            [
              'Recheck temperature after the antipyretic has worn off before reconsidering infection',
              'Waiting for a less influenced temperature would postpone assessment of an already concerning neurologic change.',
            ],
            [
              'A contributor was corrected; the unresolved acute change still needs review',
              'Reassessment after treatment tests the explanation; persistence requires continued investigation.',
            ],
          ],
          'Explain how the response to the glucose intervention changes your reasoning without closing the differential.'
        ),
      },
      {
        challenge: q(
          'Robin is less attentive, RR is 25/min and BP is 110/68. A proposed investigation is delayed. Which message is most useful to the reviewing team?',
          [0],
          [
            [
              '“Attention is declining; please reassess and clarify treatment during the delay.”',
              'This combines the actual change, an explicit request and the risk of waiting for logistics.',
            ],
            [
              '“The temperature is only 38.2°C, so the delay should be safe.”',
              'Temperature alone does not establish safety.',
            ],
            [
              '“We should finish the investigation before deciding whether the change is important.”',
              'Deterioration requires assessment before diagnostic certainty is available.',
            ],
            [
              '“Arthritis explains the entire presentation, so the investigation can be cancelled.”',
              'Arthritis does not account for new cognitive and systemic findings.',
            ],
          ],
          'Name the time-sensitive treatment question you would ask if bacterial meningitis remains suspected.'
        ),
        advanced: q(
          'Additional planning update: the team suspects bacterial meningitis, and imaging cannot begin promptly. There is progressive decline in consciousness. Which TWO questions should you raise about the current sequence?',
          [1, 3],
          [
            [
              '“Can all treatment wait until imaging confirms the cause?”',
              'The need for imaging should not create avoidable delay to stabilisation and treatment.',
            ],
            [
              '“Has the falling consciousness changed airway or lumbar-puncture safety, and who is reviewing this now?”',
              'New neurologic deterioration changes immediate safety considerations.',
            ],
            [
              '“Can the absence of a rash be used to cancel the urgent pathway?”',
              'Absence of rash does not resolve suspected meningitis.',
            ],
            [
              '“How are prompt blood investigations, prescribed antimicrobials and stabilisation being coordinated before imaging?”',
              'This supports parallel, time-critical care rather than a serial wait for imaging.',
            ],
          ],
          'Describe what remains uncertain and what is sufficiently concerning to require action before a definitive result.'
        ),
      },
      {
        challenge: q(
          'Robin’s family asks whether the lower temperature means the danger has passed. Which response best explains why the team is continuing urgent assessment?',
          [2],
          [
            [
              '“The medicine has cured the underlying illness because the temperature fell.”',
              'An antipyretic response does not establish resolution of the cause.',
            ],
            [
              '“The temperature does not matter at all.”',
              'Temperature is relevant; it must be interpreted alongside the other findings and medicine timing.',
            ],
            [
              '“Attention and breathing remain abnormal despite the lower temperature.”',
              'This gives a clear reason for ongoing concern without asserting a diagnosis.',
            ],
            [
              '“Confusion at this age is expected, so we are only being cautious.”',
              'The verified acute change should not be dismissed as normal ageing.',
            ],
          ],
          'Ask the family to describe a concrete change they should tell the team about immediately.'
        ),
        advanced: q(
          'The family wants to take Robin home because the fever looks better. Robin is drowsy and cannot sustain the discussion. Which TWO steps best address this disagreement?',
          [0, 2],
          [
            [
              'Explain the unresolved cognitive and respiratory findings using the documented baseline and current observations',
              'Specific evidence helps distinguish partial physiological improvement from safe recovery.',
            ],
            [
              'Accept the family’s preference as sufficient evidence that discharge is safe',
              'Preference informs decisions but does not replace assessment of current risks and decision-making ability.',
            ],
            [
              'Request senior review of current safety and decision-specific capacity while supporting Robin’s participation',
              'The clinical concern and impaired participation need an appropriate, person-centred assessment.',
            ],
            [
              'Use an unconfirmed diagnosis as a certainty to end the conversation',
              'Clear risk communication should preserve uncertainty rather than manufacture certainty.',
            ],
          ],
          'How would you explain the risk of leaving while remaining respectful and avoiding a claim that the final diagnosis is known?'
        ),
      },
      {
        challenge: q(
          'At handover Robin’s BP is 104/66, RR 26/min and SpO₂ 94%; temperature is 38.1°C. Alertness is declining. Which TWO details most clearly demonstrate deterioration to a team that has not met Robin?',
          [1, 3],
          [
            [
              'The arthritis diagnosis without a description of current function',
              'This is relevant context but does not convey the new deterioration.',
            ],
            [
              'The change from normal conversation to repeated prompting and declining alertness, with times',
              'A timed functional comparison makes the neurologic change explicit.',
            ],
            [
              'The fact that a rash has not appeared',
              'This does not counter the evolving systemic and neurologic concerns.',
            ],
            [
              'The rising respiratory rate and falling blood-pressure trend rather than the current temperature alone',
              'The trajectory shows worsening across more than one physiological domain.',
            ],
          ],
          'Turn these findings into a one-sentence request for the receiving team.'
        ),
        advanced: q(
          'A handover note says “fever improving, likely mild illness,” but contains no alertness trend. You see the current deterioration. Which action best prevents that summary from directing the next team’s care?',
          [1],
          [
            [
              'Add the latest temperature to the old summary and leave the assessment label unchanged',
              'The old summary still hides the unresolved change in alertness and breathing.',
            ],
            [
              'Directly hand over the new deterioration and document the revised concern',
              'This corrects the clinical narrative using new evidence and closes the communication gap.',
            ],
            [
              'Record the current values without a direct handover so the next team can infer the trend',
              'Documentation alone may not convey the urgency or ensure the receiving team recognises the revised concern.',
            ],
            [
              'Copy the original urgent diagnosis into the new note without distinguishing concern from confirmation',
              'A current handover needs verified findings and explicit uncertainty, not a stronger label without evidence.',
            ],
          ],
          'What should the receiving clinician repeat back to show they understand the current risk and next action?'
        ),
      },
      {
        challenge: q(
          'Robin’s pulse falls to 104/min and temperature to 37.8°C after care, but attention is still below baseline. Which evaluation statement is most accurate?',
          [3],
          [
            [
              '“Recovered because the temperature is below 38°C.”',
              'A threshold temperature does not establish cognitive recovery.',
            ],
            [
              '“No benefit from care because every symptom has not disappeared.”',
              'Some observations improved; the evaluation should distinguish improvement from unresolved concerns.',
            ],
            [
              '“Persistent confusion is now the new baseline.”',
              'An unresolved acute change should not be relabelled as baseline without assessment.',
            ],
            [
              '“Partly improved, with unresolved attention change needing reassessment.”',
              'This recognises both response and remaining risk.',
            ],
          ],
          'Which person-specific cognitive task would help assess recovery at the next review?'
        ),
        advanced: q(
          'Additional reassessment: the family says Robin is more awake but still cannot follow a familiar conversation. A transfer is proposed without a neurologic monitoring plan. Which TWO requirements would you advocate for before handover is complete?',
          [0, 2],
          [
            [
              'A documented current cognitive assessment, baseline comparison and trend for the receiving team',
              'The unresolved function must be made explicit rather than hidden behind “better.”',
            ],
            [
              'A statement that normal temperature excludes further neurologic deterioration',
              'Temperature cannot guarantee neurologic stability.',
            ],
            [
              'A named plan for repeat assessment and specific triggers for urgent reassessment, with ownership confirmed',
              'A transfer needs continuity of surveillance and a response plan for further change.',
            ],
            [
              'Closure of the acute cognitive problem solely because the family sees some improvement',
              'Partial improvement does not establish resolution or explain the cause.',
            ],
          ],
          'State what has improved, what remains unresolved and what new change would make the transfer plan unsafe.'
        ),
      },
    ],
  },
  'pancreas-balance': {
    a: [
      {
        challenge: q(
          'Sam has upper abdominal pain, repeated vomiting, HR 110/min and BP 108/70. Which TWO data should be obtained first to judge the circulatory effect of the losses?',
          [0, 2],
          [
            [
              'The amount and timing of intake, emesis and urine output',
              'A timed balance history helps quantify the current problem rather than infer it from pain alone.',
            ],
            [
              'A presumed alcohol history before checking perfusion',
              'Cause should be investigated without bias, but it does not replace immediate assessment of physiological impact.',
            ],
            [
              'Current mental state, peripheral perfusion and observations compared with baseline',
              'These findings help determine whether the losses are affecting organ perfusion.',
            ],
            [
              'The pain score alone as the endpoint for the fluid plan',
              'Pain does not adequately measure circulating volume or fluid tolerance.',
            ],
          ],
          'What would make you request a faster review before the cause of the abdominal pain is confirmed?'
        ),
        advanced: q(
          'Additional assessment: Sam is cool peripherally and has continuing emesis. A colleague attributes the tachycardia entirely to pain. Which response best tests that explanation?',
          [2],
          [
            [
              'Give the prescribed analgesia and use the pulse response before checking the balance record',
              'Pain treatment matters, but the losses and perfusion should be assessed in parallel rather than deferred.',
            ],
            [
              'Use the pulse and pressure alone to classify the mechanism and choose the next fluid step',
              'Those values indicate concern but do not establish fluid responsiveness or the full mechanism.',
            ],
            [
              'Compare perfusion and timed losses with the response to pain and fluid care',
              'This evaluates competing contributors instead of treating pain and perfusion as mutually exclusive explanations.',
            ],
            [
              'Make oxygen saturation the main repeated endpoint because the initial value is normal',
              'A normal saturation does not assess circulating volume or organ perfusion.',
            ],
          ],
          'Explain what persistent tachycardia after pain relief would change in your next assessment.'
        ),
      },
      {
        challenge: q(
          'Additional measured balance: Sam weighs 80 kg and has passed 80 mL urine over four hours. Which interpretation should be communicated with HR 118/min and BP 100/64?',
          [1],
          [
            [
              'The output is 1 mL/kg/hour and is reassuring',
              '80 ÷ 80 ÷ 4 is 0.25 mL/kg/hour, not 1.',
            ],
            [
              '0.25 mL/kg/hour: low output requiring review with the perfusion trend',
              'The calculation uses both weight and time; the result raises concern but does not identify the cause alone.',
            ],
            [
              'The four-hour output proves intrinsic renal failure',
              'Reduced output can have several causes, including reduced perfusion or obstruction.',
            ],
            [
              'The output is uninterpretable whenever IV fluids have started',
              'A known time interval remains useful for evaluating response to care.',
            ],
          ],
          'Which additional assessment would help distinguish poor perfusion from a urine-collection problem?'
        ),
        advanced: q(
          'Additional checks: Sam’s urinary catheter is draining freely, the low four-hour volume is verified, and emesis continues. Which TWO findings would most strengthen concern that low output reflects inadequate perfusion rather than an isolated measurement problem?',
          [1, 3],
          [
            [
              'A lower pain rating by itself',
              'Pain relief does not establish adequate renal perfusion.',
            ],
            [
              'New delayed peripheral capillary refill with the falling BP trend',
              'Concordant perfusion findings make the low output more concerning in context.',
            ],
            [
              'An unchanged oxygen saturation alone',
              'Normal saturation does not explain the low urine output.',
            ],
            [
              'A worsening creatinine trend interpreted against the prior value and current fluid balance',
              'Renal results over time can support concern, while still requiring interpretation of the whole clinical picture.',
            ],
          ],
          'Describe the evidence you would present before requesting reassessment of the fluid strategy.'
        ),
      },
      {
        challenge: q(
          'The team identifies reduced renal function while planning ongoing fluids for Sam; HR is 120/min and BP 96/60. Which TWO endpoints should be agreed together for the next reassessment?',
          [0, 3],
          [
            [
              'Whether perfusion, alertness and timed urine output improve',
              'The response should show whether the circulation is benefiting.',
            ],
            [
              'Whether the entire prescribed container has finished, regardless of the patient’s response',
              'Delivered volume is a process measure, not sufficient evidence of benefit or tolerance.',
            ],
            [
              'Whether the pain score reaches zero before any repeat observations',
              'Repeat physiological assessment should not wait for complete analgesia.',
            ],
            [
              'Whether breathing effort, oxygen requirement or signs of congestion worsen',
              'Fluid benefit and intolerance need simultaneous surveillance, especially with renal impairment.',
            ],
          ],
          'How would you state an escalation trigger for benefit failing to appear or new respiratory harm appearing?'
        ),
        advanced: q(
          'Additional review data: low urine output persists, but Sam develops new bibasal crackles during the prescribed infusion. Which plan best handles these competing findings?',
          [1],
          [
            [
              'Request another fluid challenge for the low output, then review the new crackles afterward',
              'The new respiratory finding should be part of the immediate review rather than assessed only after more fluid.',
            ],
            [
              'Request joint reassessment of perfusion, renal trend and fluid tolerance',
              'The team must distinguish ongoing underperfusion from emerging congestion or another cause of low output.',
            ],
            [
              'Prioritise a congestion-only plan because the crackles are newer than the low urine output',
              'The team must address respiratory intolerance without losing the unresolved perfusion or renal problem.',
            ],
            [
              'Finish the existing volume and use the next creatinine result to judge tolerance',
              'The patient already has a new respiratory sign requiring assessment before the infusion endpoint.',
            ],
          ],
          'Explain why the same low urine output can coexist with fluid intolerance and what data would help the team decide.'
        ),
      },
      {
        challenge: q(
          'Sam’s pressure improves to 104/66, but breathing takes more effort and SpO₂ is 95%. What should your immediate reassessment focus on?',
          [2],
          [
            [
              'The improved pressure alone to confirm that the fluid plan is successful',
              'A circulatory response does not cancel a new respiratory concern.',
            ],
            [
              'Only whether abdominal pain is lower',
              'Pain is one outcome and does not describe respiratory tolerance.',
            ],
            [
              'Reassess breathing and recent balance; promptly report the change',
              'This characterises the new problem and its timing while the team reassesses overall benefit and harm.',
            ],
            [
              'A fixed plan to continue unchanged until the next morning’s renal results',
              'Waiting for later blood results is inappropriate when respiratory effort is changing.',
            ],
          ],
          'Which respiratory changes would make you activate the urgent escalation pathway?'
        ),
        advanced: q(
          'Additional respiratory assessment: Sam has increasing work of breathing after fluids; no cause is confirmed. Which TWO possibilities should remain in the urgent discussion rather than assuming the abdominal pain explains everything?',
          [0, 2],
          [
            [
              'Fluid-related pulmonary congestion in relation to the infusion, balance and renal context',
              'The timing and tolerance need evaluation; congestion is a hypothesis, not a confirmed diagnosis.',
            ],
            [
              'Expected recovery from pancreatitis, requiring no further respiratory assessment',
              'New work of breathing is not adequately explained as routine recovery.',
            ],
            [
              'An acute pulmonary complication of the underlying illness or another cause of hypoxaemia',
              'Pancreatitis can coexist with respiratory complications; assessment must avoid narrowing too early.',
            ],
            [
              'Anxiety as the confirmed explanation because the pressure is better',
              'Anxiety cannot account safely for objective changes without assessment.',
            ],
          ],
          'What finding would support congestion, and what information would make you reconsider that leading explanation?'
        ),
      },
      {
        challenge: q(
          'Sam’s pain score falls, but RR rises to 28/min and SpO₂ falls to 93%. Which handover opening best prioritises this change?',
          [3],
          [
            [
              '“Pain is better, so the response appears satisfactory.”',
              'This omits worsening respiration.',
            ],
            [
              '“The fluid container is nearly empty.”',
              'A process detail does not convey the patient’s present risk.',
            ],
            [
              '“Sam must have fluid overload; please record that diagnosis.”',
              'The cause is not established and should not be stated as confirmed.',
            ],
            [
              '“RR 28 and SpO₂ 93% despite pain relief; please review breathing and fluids.”',
              'This highlights discordant outcomes and makes a specific request.',
            ],
          ],
          'What oxygen-support, balance and examination information would you provide next?'
        ),
        advanced: q(
          'Additional trend: Sam needs more oxygen to maintain the same saturation while urine output remains low. Which TWO details make “the saturation is now acceptable” an incomplete evaluation?',
          [1, 2],
          [
            [
              'An unchanged saturation proves the respiratory condition is stable regardless of support',
              'A number maintained by increasing support may hide worsening physiology.',
            ],
            [
              'The increased oxygen requirement and work of breathing indicate that respiratory support needs have risen',
              'Treatment intensity is part of interpreting the observed saturation.',
            ],
            [
              'Persistent low output requires the team to reassess perfusion, renal function and fluid tolerance together',
              'Low output plus respiratory deterioration is a competing-risk problem, not an automatic signal to give more fluid.',
            ],
            [
              'A better pain score excludes organ dysfunction',
              'Pain response does not establish respiratory or renal recovery.',
            ],
          ],
          'Give a handover that distinguishes the measured values from the support needed to achieve them.'
        ),
      },
      {
        challenge: q(
          'Sam’s pulse and pressure improve, but RR remains 25/min and SpO₂ 94%. Vomiting has limited intake. Which TWO items must remain visible in the ongoing plan?',
          [0, 3],
          [
            [
              'The unresolved respiratory findings and next reassessment',
              'Partial improvement does not close a continuing breathing concern.',
            ],
            [
              'Only the final pain score',
              'A single symptom outcome omits organ response and intake.',
            ],
            [
              'A blanket instruction to withhold food until pancreatic enzymes normalise',
              'Food should not be withheld solely for the diagnosis or enzyme result; the reason and appropriate route need clinical review.',
            ],
            [
              'A clinician- and dietitian-led nutrition plan that accounts for current vomiting and tolerance',
              'Intake needs an explicit plan rather than being left unresolved after circulatory care.',
            ],
          ],
          'What clinical findings, rather than a completed infusion, would show the overall plan is working?'
        ),
        advanced: q(
          'Additional recovery update: vomiting has stopped, but an old instruction says “nil by mouth until all pain and laboratory abnormalities resolve.” Which response best addresses this unfinished part of Sam’s care?',
          [2],
          [
            [
              'Keep fasting until the laboratory abnormalities resolve, using IV fluids as the interim nutrition plan',
              'IV fluids do not replace a nutrition plan, and the diagnosis or enzyme result alone is not a sufficient fasting indication.',
            ],
            [
              'Restart a full oral diet immediately because the vomiting has stopped',
              'The vomiting update prompts review, but does not replace assessment of intake tolerance and the overall clinical state.',
            ],
            [
              'Clarify the fasting indication and a monitored oral or enteral plan',
              'This challenges an outdated blanket rule while keeping nutrition decisions within the current clinical plan.',
            ],
            [
              'Request parenteral nutrition before considering whether an oral or enteral route is feasible',
              'The appropriate route should be individualised; parenteral feeding is not the automatic first strategy when enteral intake may be possible.',
            ],
          ],
          'Explain which observations would demonstrate tolerance and which would require the nutrition plan to be reviewed again.'
        ),
      },
    ],
    b: [
      {
        challenge: q(
          'Lee has acute pancreatitis, heart failure, chronic kidney disease, vomiting and reduced output over four hours. Which initial record best supports a safe fluid review?',
          [1],
          [
            [
              '“Heart failure means fluids cannot be considered.”',
              'Comorbidity changes risk and monitoring; it does not replace assessment of the current losses and perfusion.',
            ],
            [
              'Timed balance and baseline perfusion, breathing, heart and kidney context',
              'Both the need for fluid and the ability to tolerate it require a starting assessment.',
            ],
            [
              'Only the pancreatitis diagnosis and prescribed volume',
              'A diagnosis-based standard volume omits individual risk and response.',
            ],
            [
              'The absence of severe hypoxaemia as proof that any fluid rate is safe',
              'A single saturation cannot establish future fluid tolerance.',
            ],
          ],
          'Which baseline respiratory finding would you want documented before assessing response to further fluids?'
        ),
        advanced: q(
          'Additional assessment: Lee has continuing gastrointestinal losses and reports a usual daily fluid limit for heart failure. No individualised acute fluid plan is documented. Which TWO issues should be clarified together?',
          [0, 2],
          [
            [
              'How the team will address acute perfusion needs and ongoing losses in the context of the usual chronic plan',
              'An acute illness may require a different supervised strategy; the usual limit is context rather than a complete acute prescription.',
            ],
            [
              'Whether all acute losses can be ignored because a chronic limit exists',
              'Ignoring losses risks underperfusion.',
            ],
            [
              'What response and intolerance endpoints will trigger immediate review',
              'The plan needs explicit monitoring of benefit and potential harm.',
            ],
            [
              'Whether the standard pancreatitis volume should automatically override all comorbidity',
              'A generic volume does not account for heart and kidney function.',
            ],
          ],
          'Describe the competing harms of both under-treatment and poorly tolerated fluid therapy for Lee.'
        ),
      },
      {
        challenge: q(
          'Lee’s HR rises to 112/min and BP falls to 104/66; usual kidney function is reduced. What is the best interpretation of the low urine trend?',
          [3],
          [
            [
              'It proves the current output is normal for Lee because chronic kidney disease is present',
              'Baseline disease does not make a new reduction automatically usual or benign.',
            ],
            [
              'It means the prescribed fluid must always be increased immediately',
              'Output alone cannot determine fluid responsiveness or tolerance.',
            ],
            [
              'It proves that vomiting is not contributing to the current physiology',
              'Gastrointestinal losses can coexist with reduced kidney function.',
            ],
            [
              'Compare the new trend with usual output, balance and current perfusion',
              'The new trend must be interpreted against Lee’s baseline and the whole acute illness.',
            ],
          ],
          'Which current findings would support urgent reassessment even if creatinine was already abnormal before admission?'
        ),
        advanced: q(
          'Additional balance review: a verified four-hour output is well below Lee’s usual output; a repeat creatinine is higher than the available baseline. Which TWO further assessments best inform a review of possible acute kidney injury?',
          [1, 3],
          [
            [
              'Assume chronic kidney disease explains the change without reviewing medicines or perfusion',
              'An acute change on chronic disease still requires assessment.',
            ],
            [
              'Assess perfusion, ongoing losses and recent fluid delivery alongside signs of congestion',
              'This helps identify competing haemodynamic contributors and fluid tolerance.',
            ],
            [
              'Interpret the creatinine in isolation without confirming the timing of either sample',
              'The time course and baseline are essential for meaningful interpretation.',
            ],
            [
              'Verify collection or catheter problems and review relevant medicines and recent exposures with the team',
              'Measurement, obstruction and medication factors can contribute and should not be overlooked.',
            ],
          ],
          'State why chronic kidney disease increases the need for careful interpretation rather than reducing the urgency of a new change.'
        ),
      },
      {
        challenge: q(
          'A standard fluid order is queried for Lee because heart failure and kidney disease are present. Which request best improves that order’s usefulness?',
          [2],
          [
            [
              '“Please use the same order as the younger patient with pancreatitis.”',
              'The diagnosis does not make the patients’ risks or responses equivalent.',
            ],
            [
              '“Please remove all reassessment until the infusion is complete.”',
              'Response and intolerance can emerge before a planned volume finishes.',
            ],
            [
              '“Please specify Lee’s fluid goal, review time and benefit or harm triggers.”',
              'A clear, individualised plan supports safe delivery and timely review.',
            ],
            [
              '“Please use urine output as the only measure of tolerance.”',
              'Renal output does not identify respiratory congestion or other harm by itself.',
            ],
          ],
          'What findings would you report before requesting a change to the prescribed plan?'
        ),
        advanced: q(
          'Additional bedside assessment: Lee has low output and falling pressure, but new crackles are now audible. Which reasoning best supports a senior review rather than an automatic “more fluid” response?',
          [0],
          [
            [
              'Underperfusion and congestion may coexist; reassess both before deciding',
              'The competing findings require integrated assessment, not a single-output target applied in isolation.',
            ],
            [
              'Prioritise congestion alone and leave the low output for the next routine renal review',
              'New congestion does not remove the need to assess ongoing perfusion and the acute renal trend.',
            ],
            [
              'Use low urine output to justify the next fluid step and reassess the lungs after it',
              'Respiratory tolerance must be considered before assuming that more fluid is beneficial.',
            ],
            [
              'Treat the higher risk from heart failure as sufficient reason to exclude volume depletion',
              'Heart failure and losses can coexist; comorbidity does not establish current volume status.',
            ],
          ],
          'Present one sign of inadequate perfusion and one sign of intolerance, then state what you need the senior team to decide.'
        ),
      },
      {
        challenge: q(
          'Lee’s BP improves to 108/68 but new breathlessness appears, RR is 26/min and SpO₂ 94%. Which TWO nursing priorities best test whether the plan is still tolerated?',
          [0, 3],
          [
            [
              'Repeat a focused respiratory assessment, including effort, chest findings and oxygen support',
              'These observations characterise the new symptom and its physiological effect.',
            ],
            [
              'Continue unchanged because the pressure improved',
              'Improvement in one measure does not resolve a new concern in another system.',
            ],
            [
              'Wait for severe hypoxaemia before contacting the team',
              'New breathlessness in this context merits prompt review before severe deterioration.',
            ],
            [
              'Report the timing of breathlessness relative to fluid delivery, together with the cumulative balance and kidney context',
              'The team needs the relationship between the treatment and the new finding without assuming causation.',
            ],
          ],
          'How would you describe possible fluid intolerance without stating that it is already confirmed?'
        ),
        advanced: q(
          'Additional assessment: Lee has orthopnoea and new crackles after the infusion, but the acute pancreatitis also carries pulmonary-complication risk. Which next plan is most defensible?',
          [1],
          [
            [
              'Use the timing after the infusion to select a congestion-only pathway before reassessing the chest',
              'The timing supports concern, but does not establish the sole cause of the respiratory change.',
            ],
            [
              'Escalate breathing and perfusion review with timing, balance and differential',
              'This supports timely action and a focused differential while the team reviews the prescribed therapy.',
            ],
            [
              'Give the prescribed analgesia first and reassess breathing when the pain response is clear',
              'Respiratory deterioration should be assessed now rather than made dependent on an analgesic response.',
            ],
            [
              'Review the daily weight and fluid chart before requesting a current bedside respiratory assessment',
              'Historical balance information is useful, but should not delay assessment of new respiratory findings.',
            ],
          ],
          'Which findings would make a circulatory-only definition of “improved” unsafe for Lee?'
        ),
      },
      {
        challenge: q(
          'Lee’s pain is better, but RR is 30/min and SpO₂ is 92%. Which handover most clearly communicates the priority?',
          [2],
          [
            [
              '“Pain is now controlled; please continue the existing plan.”',
              'This hides significant respiratory change.',
            ],
            [
              '“Lee has chronic kidney disease, which explains all the observations.”',
              'Chronic disease alone does not explain an acute respiratory trend.',
            ],
            [
              '“Lee’s breathing is worse: RR 30, SpO₂ 92% during fluids; review urgently.”',
              'The opening integrates the acute change, relevant treatment risks and a clear request.',
            ],
            [
              '“The infusion chart is complete, so the episode is finished.”',
              'Completion of a chart is not a clinical endpoint.',
            ],
          ],
          'What current oxygen-support and perfusion details belong immediately after this opening?'
        ),
        advanced: q(
          'Additional handover data: Lee’s pressure is higher than earlier, but respiratory support needs are increasing and output remains low. Which TWO questions require an explicit answer before the next phase of fluids?',
          [1, 3],
          [
            [
              '“Can the higher pressure alone be used to declare the fluid strategy successful?”',
              'Success must account for organ function and harm, not a single haemodynamic number.',
            ],
            [
              '“What does the current examination suggest about congestion versus continuing underperfusion, and does the monitoring setting remain adequate?”',
              'The team needs to reassess the physiology and whether current surveillance can support safe care.',
            ],
            [
              '“Can urine output automatically justify the same infusion regardless of breathing?”',
              'An isolated urine target cannot override signs of respiratory deterioration.',
            ],
            [
              '“Who is reviewing the prescribed fluid plan now, and what deterioration will trigger a higher level of response?”',
              'Ownership and escalation criteria are needed when competing organ concerns remain.',
            ],
          ],
          'Explain why a numerically better blood pressure can coexist with a clinically worse overall response.'
        ),
      },
      {
        challenge: q(
          'Lee’s breathing improves after reassessment, but RR remains 27/min and nutrition and follow-up plans are unsettled. What should lead the next care-plan review?',
          [0],
          [
            [
              'Remaining breathing concerns, intake tolerance and review ownership',
              'A coherent ongoing plan needs to cover unresolved clinical and practical needs.',
            ],
            [
              'A statement that all concerns are resolved because saturation rose',
              'Partial respiratory improvement does not establish complete recovery.',
            ],
            [
              'Discharge planning based only on the lower pain score',
              'Pain alone does not establish physiological stability or a workable intake plan.',
            ],
            [
              'A generic diet leaflet without assessment of current intake',
              'Information does not replace an individualised nutrition plan.',
            ],
          ],
          'Which unresolved finding should remain prominent in the next handover?'
        ),
        advanced: q(
          'Additional transition discussion: Lee has improved from the respiratory deterioration but is still above the usual support needs. A transfer order has no fluid or nutrition reassessment instructions. Which THREE elements should you ask the team to specify?',
          [0, 2, 4],
          [
            [
              'The current fluid strategy with response and intolerance endpoints',
              'The receiving team needs the individualised plan after the recent adverse trend.',
            ],
            [
              'An assumption that the previous standard order can resume unchanged',
              'The recent respiratory concern requires an explicit review rather than a silent reset.',
            ],
            [
              'The nutrition route and tolerance plan, with review if intake remains inadequate',
              'Nutrition remains unresolved and should not disappear during transfer.',
            ],
            [
              'A statement that kidney impairment removes the need to measure output',
              'Kidney impairment increases the value of appropriate trend monitoring.',
            ],
            [
              'Who will reassess breathing, perfusion and output and what triggers urgent escalation',
              'Clear ownership and triggers preserve continuity while recovery is incomplete.',
            ],
          ],
          'Give the receiving team a concise “improved, unresolved, watch next” summary.'
        ),
      },
    ],
  },
  'leg-to-lung': {
    a: [
      {
        challenge: q(
          'Morgan has unilateral leg swelling after reduced mobility and no current respiratory symptoms. Which TWO findings should you gather to support the formal thrombosis assessment?',
          [1, 3],
          [
            [
              'A palpable foot pulse as the deciding test for venous thrombosis',
              'A palpable arterial pulse does not exclude a venous thrombus.',
            ],
            [
              'The symptom time course, previous VTE and recent immobility or other relevant risk factors',
              'History contributes to clinical probability and the appropriate diagnostic pathway.',
            ],
            [
              'A forced ankle manoeuvre as a definitive bedside test for thrombosis',
              'A single provocative sign is not a reliable diagnostic substitute.',
            ],
            [
              'Local examination and alternative explanations for unilateral swelling',
              'The assessment needs both features supporting thrombosis and plausible alternatives.',
            ],
          ],
          'Which new symptom would change your priority from a leg-only assessment?'
        ),
        advanced: q(
          'Additional decision data: Morgan’s clinician documents a two-level DVT Wells score of 2, ultrasound cannot be reported within four hours, and no bleeding contraindication is identified. Using the NICE adult DVT pathway, which plan should you coordinate with the prescriber?',
          [2],
          [
            [
              'Arrange a D-dimer and wait for a positive result before discussing interim treatment',
              'For likely DVT with this imaging delay, the pathway calls for a D-dimer followed by interim therapeutic anticoagulation and timely ultrasound; treatment is not simply deferred until a positive result.',
            ],
            [
              'Obtain the scan tomorrow without interim treatment because the current leg circulation is intact',
              'A palpable pulse does not remove the VTE concern or address the delay in the likely-DVT pathway.',
            ],
            [
              'Obtain D-dimer, then prescribed interim anticoagulation and ultrasound within 24 hours',
              'This follows the stated likely-DVT pathway during a scan delay, with treatment prescribed and patient-specific risks assessed.',
            ],
            [
              'Use a positive D-dimer to confirm DVT and replace the need for the planned ultrasound',
              'A positive D-dimer does not confirm DVT or replace imaging in this pathway.',
            ],
          ],
          'Explain how both probability and delay change the plan, and which patient-specific risk could require the prescriber to modify it.'
        ),
      },
      {
        challenge: q(
          'Morgan reports new shortness of breath during the leg assessment; RR has risen from 18 to 22/min. Which reassessment should come first?',
          [0],
          [
            [
              'Reassess breathing and circulation now; report the new symptom and context',
              'The new respiratory symptom changes the clinical picture before the original investigation is finished.',
            ],
            [
              'Complete all leg measurements before checking breathing',
              'A fixed task sequence can delay response to a new acute concern.',
            ],
            [
              'Ask Morgan to walk to see whether the breathlessness disappears',
              'Exertion is not a substitute for assessing a potentially acute respiratory change.',
            ],
            [
              'Diagnose anxiety because the initial saturation was 97%',
              'An earlier normal value does not explain a new symptom.',
            ],
          ],
          'What would you include in the first sentence of your update to the clinician?'
        ),
        advanced: q(
          'Additional assessment: Morgan says the breathlessness began suddenly and is accompanied by pain on inspiration. Current SpO₂ is 96%. Which TWO statements are justified?',
          [1, 3],
          [
            [
              'The current SpO₂ excludes pulmonary embolism',
              'A normal or near-normal saturation cannot independently exclude PE.',
            ],
            [
              'The sudden respiratory symptoms in this risk context require urgent assessment for PE and other acute causes',
              'The combined history changes probability and urgency without confirming a diagnosis.',
            ],
            [
              'Pain on inspiration confirms PE and makes other causes irrelevant',
              'Pleuritic pain is not specific to one diagnosis.',
            ],
            [
              'The onset, examination and vital-sign trend should be communicated even before imaging is available',
              'The present clinical change supports timely prioritisation and investigation.',
            ],
          ],
          'Name a competing acute diagnosis and the finding that would make you reconsider your leading concern.'
        ),
      },
      {
        challenge: q(
          'Morgan’s HR is now 112/min, RR 28/min, SpO₂ 92% and BP 110/68, all worse than the initial observations. Which action takes priority over waiting for the leg imaging result?',
          [3],
          [
            [
              'Wait for the ultrasound result so the referral can include a confirmed diagnosis',
              'Current respiratory deterioration warrants assessment before diagnostic certainty.',
            ],
            [
              'Repeat only the leg examination because that was the original referral',
              'The clinical priority has changed.',
            ],
            [
              'Tell Morgan that the trend is expected during investigations',
              'The worsening observations should not be normalised without assessment.',
            ],
            [
              'Urgent ABCDE review for suspected PE and other acute causes',
              'The response should address the current physiology and differential immediately.',
            ],
          ],
          'Which change in circulation or consciousness would increase the urgency further?'
        ),
        advanced: q(
          'Additional deterioration for this question: Morgan’s BP falls to 86/54 with presyncope while definitive imaging is being arranged. Which TWO actions best support the emergency team?',
          [0, 2],
          [
            [
              'Activate the emergency response and communicate the new haemodynamic instability with the respiratory trend',
              'Instability changes the immediate risk and the urgency of bedside assessment.',
            ],
            [
              'Send Morgan unaccompanied for routine imaging to avoid a delay',
              'An unstable patient needs an appropriate stabilisation, monitoring and transport decision.',
            ],
            [
              'Coordinate bedside stabilisation and urgent senior decisions about investigation and treatment while obtaining the relevant history',
              'An unstable suspected PE pathway requires rapid clinical decisions; nursing coordination supports parallel care.',
            ],
            [
              'Independently select and administer thrombolysis because PE is suspected',
              'High-risk treatment requires the appropriate clinician’s diagnosis, contraindication review and prescription.',
            ],
          ],
          'Explain how instability changes the workflow without claiming that PE is already proven.'
        ),
      },
      {
        challenge: q(
          'A new bleeding symptom is reported while Morgan’s treatment details are being checked. Which TWO assessments are most important before the clinician reviews the risk-benefit balance?',
          [0, 3],
          [
            [
              'The site, amount, persistence and physiological effect of the bleeding',
              'Severity and current effect help determine urgency.',
            ],
            [
              'The colour of the original swollen leg as the sole treatment-safety measure',
              'Leg appearance does not assess bleeding or anticoagulant exposure.',
            ],
            [
              'Whether Morgan would prefer no further blood tests, without exploring the current risk',
              'Preferences matter, but the current bleeding risk requires a clear explanation and assessment.',
            ],
            [
              'The exact medicine, dose timing, relevant renal function and current blood results',
              'Drug exposure and patient factors affect interpretation and the safe next plan.',
            ],
          ],
          'Which bleeding or neurologic symptom would make you escalate immediately rather than await routine review?'
        ),
        advanced: q(
          'Additional findings: Morgan has a small self-limited gum bleed, no new neurological symptom and no current haemodynamic collapse, but respiratory deterioration is unresolved. Which interpretation best handles the competing risks?',
          [1],
          [
            [
              'Request a treatment pause based on the gum bleed before the respiratory risk is reviewed',
              'A change should follow an integrated clinician-led review of bleeding severity and the unresolved cardiopulmonary risk.',
            ],
            [
              'Report bleeding severity with the unresolved lung concern and drug exposure',
              'Neither the clot concern nor the bleeding concern should erase the other.',
            ],
            [
              'Continue the current plan without a medicine review because the visible bleeding stopped',
              'Self-limited bleeding may still identify a reason to verify exposure, other symptoms and monitoring.',
            ],
            [
              'Prioritise a blood-loss explanation for the breathlessness because a bleeding source is visible',
              'A small self-limited gum bleed does not establish enough blood loss to explain the respiratory findings.',
            ],
          ],
          'Identify the additional information that would change this from a medication-safety review to an emergency bleeding response.'
        ),
      },
      {
        challenge: q(
          'The receiving clinician asks for a concise update on Morgan’s new breathing symptoms and bleeding report. Which opening is most useful?',
          [2],
          [
            [
              '“Morgan has a swollen leg; I will begin with the full remote history.”',
              'This delays the urgent respiratory and treatment-safety information.',
            ],
            [
              '“The oxygen number is better, so there is no further concern.”',
              'The support needed and remaining symptoms still matter.',
            ],
            [
              '“New respiratory deterioration and bleeding during DVT workup; review both risks.”',
              'This communicates the changed priority and competing risk without unsupported certainty.',
            ],
            [
              '“The treatment has definitely caused every new symptom.”',
              'Timing alone does not establish causation.',
            ],
          ],
          'Which exact medication and timing details would you add if available, and what would you explicitly label as still unverified?'
        ),
        advanced: q(
          'Additional handover: the first dose time is unverified, and two medication lists name different anticoagulants. The next planned dose is approaching. Which TWO actions best prevent a handover error?',
          [1, 3],
          [
            [
              'Choose the list with the most recent print date without checking administration records',
              'Document recency does not establish what was actually administered.',
            ],
            [
              'Reconcile the exact medicine and last administration using the administration record and responsible team',
              'The next decision requires verified exposure, not an assumption based on conflicting lists.',
            ],
            [
              'Give both listed medicines so the patient is not left untreated',
              'Duplicate anticoagulant exposure can cause harm and is not a safe way to resolve ambiguity.',
            ],
            [
              'Clearly flag the discrepancy, current bleeding concern and need for a prescriber-approved plan before administration under local policy',
              'An explicit unresolved discrepancy prevents an unsafe implied continuation.',
            ],
          ],
          'State what you can safely hand over as verified and what must remain an unresolved action.'
        ),
      },
      {
        challenge: q(
          'Morgan’s breathlessness eases after review. Which teach-back response best demonstrates an actionable safety plan?',
          [0],
          [
            [
              '“I will use the urgent-help plan for sudden breathlessness, collapse or serious bleeding.”',
              'This applies the plan to specific urgent symptoms rather than only repeating a label.',
            ],
            [
              '“Feeling better means the problem cannot recur.”',
              'Improvement does not remove all future risk.',
            ],
            [
              '“I will wait until the next routine appointment for any new chest symptom.”',
              'New acute cardiopulmonary symptoms may need urgent assessment.',
            ],
            [
              '“If I notice bleeding, I will decide a new dose myself.”',
              'Medication changes need the agreed clinical pathway and advice.',
            ],
          ],
          'What practical barrier might prevent Morgan from using the agreed follow-up or urgent-care plan?'
        ),
        advanced: q(
          'Additional transition update: Morgan can repeat the warning signs but is unsure which anticoagulant to take and when the next review occurs. Which TWO outcomes are still required before education is considered complete?',
          [0, 2],
          [
            [
              'A reconciled written medication plan with teach-back of the exact intended medicine and schedule',
              'Recognising warning signs does not resolve an unsafe medication ambiguity.',
            ],
            [
              'Agreement that the patient will infer the schedule from the old list',
              'Conflicting instructions require reconciliation rather than inference.',
            ],
            [
              'A named follow-up contact and timing, with a usable route for urgent questions or deterioration',
              'A safety plan needs ownership and access as well as knowledge.',
            ],
            [
              'A promise that improved breathlessness means further review is optional',
              'Clinical and treatment follow-up may remain necessary despite symptom improvement.',
            ],
          ],
          'Separate evidence that Morgan understands the information from evidence that the plan can actually be followed.'
        ),
      },
    ],
    b: [
      {
        challenge: q(
          'Jules is receiving treatment for confirmed thrombosis and has kidney disease, new gum bleeding and a bruise. Which assessment should be completed first?',
          [2],
          [
            [
              'Assume the bruise proves that the anticoagulant dose is excessive',
              'The finding alone does not establish dose appropriateness or bleeding severity.',
            ],
            [
              'Dismiss the gum bleed because the original problem is a clot',
              'Treatment-related harm still needs assessment.',
            ],
            [
              'Assess bleeding and physiology; verify medicine and last dose',
              'Both the immediate effect and actual drug exposure are needed to judge urgency and next steps.',
            ],
            [
              'Use a normal distal pulse to conclude that the bleeding and clot risks are low',
              'An arterial pulse does not assess either anticoagulant effect or bleeding severity.',
            ],
          ],
          'Which additional bleeding symptoms would you ask about before calling the clinician?'
        ),
        advanced: q(
          'Additional medicine history: Jules names “a blood thinner” but cannot identify it; kidney function has changed since the initial plan. Which TWO facts are essential to a safe treatment review?',
          [0, 3],
          [
            [
              'The verified anticoagulant, formulation, last dose and any concurrent medicines that affect bleeding risk',
              'Risk and management differ by drug and exposure; the colloquial label is insufficient.',
            ],
            [
              'Only the size of the visible bruise',
              'A superficial bruise does not establish total bleeding or treatment exposure.',
            ],
            [
              'A general assumption that all anticoagulants have the same renal handling',
              'Renal considerations differ between agents and regimens.',
            ],
            [
              'Current renal results in relation to baseline and the intended regimen, reviewed with the prescriber or pharmacist',
              'A changing renal context can alter the safety assessment and must be linked to the actual medicine.',
            ],
          ],
          'Explain why “kidney disease plus bleeding” is a reason for verification and review rather than an independent dose change.'
        ),
      },
      {
        challenge: q(
          'Jules’s bleeding is being assessed; HR has risen from 90 to 98/min and BP is 120/72. Which TWO findings would most change the urgency from a minor-bleeding review?',
          [1, 2],
          [
            [
              'The bruise remains the same size and there are no other symptoms',
              'This is useful follow-up information but does not by itself indicate major deterioration.',
            ],
            [
              'Persistent bleeding with dizziness, syncope or a worsening circulatory trend',
              'These findings raise concern about physiological impact.',
            ],
            [
              'A new severe headache, focal neurologic change or reduced consciousness',
              'These symptoms warrant immediate assessment for serious bleeding or another acute neurologic cause.',
            ],
            [
              'The patient can correctly name the medicine',
              'Correct naming helps reconciliation but does not determine bleeding severity.',
            ],
          ],
          'Which emergency pathway would you use if one of the concerning changes occurred?'
        ),
        advanced: q(
          'Additional result: Jules has an elevated INR, but the medication record is not yet reconciled. Which interpretation is safest?',
          [3],
          [
            [
              'Use the INR to grade anticoagulant intensity before identifying the medicine',
              'INR is not a universal measure of anticoagulant effect; the actual medicine must be established.',
            ],
            [
              'Base the major-bleeding classification mainly on how far the INR exceeds range',
              'Bleeding severity requires the clinical effect and relevant results, not one test alone.',
            ],
            [
              'Repeat the INR first and defer medicine reconciliation until the second result',
              'Repeating a test does not resolve the uncertainty about which medicine makes it interpretable.',
            ],
            [
              'Verify the drug and assess INR in its clinical context before a directed plan',
              'The meaning of the result and treatment response depend on actual exposure and the current clinical picture.',
            ],
          ],
          'Explain what you still need to know before describing this as excessive anticoagulation from a specific drug.'
        ),
      },
      {
        challenge: q(
          'Jules becomes lightheaded and breathless; RR is 26/min, SpO₂ 93% and BP 108/66. What should take priority over describing the small visible bruise?',
          [0],
          [
            [
              'Urgent ABCDE review of the new breathing and circulatory changes',
              'The new physiological change may reflect a serious process not explained by the visible bruise alone.',
            ],
            [
              'Measure the bruise again before checking the current observations',
              'A minor local finding should not delay assessment of systemic deterioration.',
            ],
            [
              'Assume the symptoms are harmless because treatment for thrombosis is already prescribed',
              'Treatment does not exclude recurrence, complications or treatment-related harm.',
            ],
            [
              'Conclude that the gum bleeding explains all breathlessness',
              'The small visible bleed does not establish the cause of the new symptoms.',
            ],
          ],
          'Which information would help the team distinguish bleeding-related deterioration from an acute thromboembolic concern?'
        ),
        advanced: q(
          'Additional review data: Jules’s haemoglobin is lower than the recent baseline, but no major external bleed is seen; new breathlessness persists during thrombosis treatment. Which TWO concerns should be kept active in the urgent discussion?',
          [1, 3],
          [
            [
              'Prescribed anticoagulation makes recurrent or extending thromboembolic disease impossible',
              'Treatment reduces risk but does not make an acute thromboembolic cause impossible.',
            ],
            [
              'Occult bleeding or another cause of falling haemoglobin with physiological impact',
              'A lower haemoglobin without visible major bleeding requires evaluation rather than reassurance from the bruise.',
            ],
            [
              'A small gum bleed is a complete explanation for any fall in haemoglobin',
              'The source and magnitude are not established by that visible symptom.',
            ],
            [
              'An acute pulmonary or cardiac cause, including possible thromboembolic disease despite current treatment',
              'Persistent new respiratory symptoms require an open differential and verification of actual treatment exposure.',
            ],
          ],
          'Describe how you would communicate both concerns without choosing a diagnosis from incomplete data.'
        ),
      },
      {
        challenge: q(
          'The team is urgently reviewing Jules’s breathlessness and treatment risks. Which TWO information gaps most directly affect the next anticoagulation decision?',
          [0, 2],
          [
            [
              'The verified last dose, any missed or duplicate doses and concurrent bleeding-risk medicines',
              'Actual exposure is needed to interpret both thrombosis and bleeding concerns.',
            ],
            [
              'Whether the patient remembers the brand colour of the tablets',
              'This may help identification but is not adequate verification of medicine or exposure.',
            ],
            [
              'Bleeding severity, haemoglobin trend and current renal function linked to baseline',
              'The clinical impact and individual drug-handling context inform the clinician’s risk-benefit assessment.',
            ],
            [
              'The fact that thrombosis was confirmed, as a reason to omit bleeding assessment',
              'A confirmed clot does not remove the need to assess treatment-related harm.',
            ],
          ],
          'What must be clearly communicated if a key dose time cannot yet be verified?'
        ),
        advanced: q(
          'Additional clinical discussion: one team member wants to stop treatment because of bleeding; another wants to continue because thrombosis is confirmed. There is no documented agreed plan. Which next action best supports a safe decision?',
          [2],
          [
            [
              'Use the most recent spoken instruction and hand over the disagreement for later review',
              'An unresolved conflict needs a clear authorised plan rather than an assumed winner.',
            ],
            [
              'Delay discussion until the next scheduled dose and collect further routine observations first',
              'The current symptoms and conflicting plans need timely review, not a delay driven by the dose schedule.',
            ],
            [
              'Seek one senior-led documented plan using the verified competing-risk data',
              'A coherent risk-benefit decision with ownership is needed when serious competing concerns remain.',
            ],
            [
              'Ask Jules to choose which instruction to follow before the teams reconcile the clinical risks',
              'The person should participate, but conflicting clinical advice needs an integrated clinician-led decision.',
            ],
          ],
          'State the unresolved clinical question, the verified facts and the decision that needs a named owner.'
        ),
      },
      {
        challenge: q(
          'The receiving clinician asks about Jules’s new symptoms. Which opening handover best communicates both the current concern and treatment context?',
          [1],
          [
            [
              '“There is a small bruise; the rest can wait for the medication chart.”',
              'This omits the clinically important respiratory and circulatory changes.',
            ],
            [
              '“New breathlessness and bleeding during thrombosis treatment; review urgently.”',
              'This combines the acute change, competing risk and clear review request.',
            ],
            [
              '“Jules is stable because the initial saturation was 97%.”',
              'Initial observations do not describe the present condition.',
            ],
            [
              '“Renal failure caused an overdose and a PE simultaneously.”',
              'This asserts multiple mechanisms that have not been established.',
            ],
          ],
          'What would you say explicitly if you do not yet know the exact last dose time?'
        ),
        advanced: q(
          'Additional reconciliation update: the last dose remains unverified and the renal result is from before the acute illness. Transfer is requested now. Which TWO handover actions prevent unsafe assumptions?',
          [0, 3],
          [
            [
              'Label both facts as unverified or outdated and state who is obtaining the current information',
              'An explicit uncertainty with ownership is safer than an implied completed reconciliation.',
            ],
            [
              'Write “medicines reviewed” because an old list was located',
              'An old list alone does not verify administration or current appropriateness.',
            ],
            [
              'Estimate the last dose time and enter it as confirmed',
              'Invented precision can drive an unsafe subsequent dose.',
            ],
            [
              'Confirm the responsible clinician’s interim medication and monitoring plan before the next dose or transfer under local policy',
              'The receiving team needs an authorised plan that accounts for the unresolved exposure and acute change.',
            ],
          ],
          'What should the receiving team repeat back to demonstrate that no one has mistaken the unresolved actions for completed checks?'
        ),
      },
      {
        challenge: q(
          'After review, Jules feels better and asks what to do if symptoms return. Which teaching response best matches the current risks?',
          [3],
          [
            [
              '“All bleeding can wait for the next routine review.”',
              'Severity and associated symptoms determine urgency; serious bleeding requires immediate help.',
            ],
            [
              '“If breathlessness returns, take an extra dose without calling.”',
              'Unsupervised extra anticoagulant dosing can cause harm and does not safely assess a new symptom.',
            ],
            [
              '“Improvement means there is no need to clarify your medicine list.”',
              'The medication plan still needs to be accurate and usable.',
            ],
            [
              '“Show me how you would use the plan for recurrent breathing or bleeding symptoms.”',
              'Applied teach-back checks urgent and routine routes rather than relying on reassurance alone.',
            ],
          ],
          'Ask Jules to explain the plan in their own words and identify any access barrier.'
        ),
        advanced: q(
          'Additional teach-back: Jules says, “Because I bled, I will skip every other dose until my kidneys improve.” Which response best resolves the misunderstanding?',
          [1],
          [
            [
              'Focus on recurrent bleeding warnings and accept the proposed schedule until the next review',
              'The self-selected schedule is an unresolved treatment-safety problem needing correction now.',
            ],
            [
              'Reconcile instructions and repeat teach-back using the clinical contact plan',
              'This addresses the reasoning behind self-adjustment and verifies both understanding and an actionable alternative.',
            ],
            [
              'Repeat the intended schedule verbally and accept a yes/no check of understanding',
              'A realistic teach-back and reconciled written instructions are needed to identify and correct the actual misunderstanding.',
            ],
            [
              'Refer for general motivation support before checking whether the written instructions conflict',
              'The statement may arise from a knowledge or instruction gap; it is not evidence of unwillingness.',
            ],
          ],
          'Explain how you would distinguish a knowledge gap from conflicting instructions, cost or difficulty obtaining follow-up.'
        ),
      },
    ],
  },
  'nutrition-context': {
    a: [
      {
        challenge: q(
          'Taylor has persistent gastrointestinal symptoms and weight change and recently removed gluten before diagnostic review. Which TWO details are most important to establish before giving more dietary instructions?',
          [0, 2],
          [
            [
              'What gluten-containing foods were reduced, when the change began and how intake changed overall',
              'The current diet affects both nutritional assessment and the interpretation of coeliac investigations.',
            ],
            [
              'Whether symptom improvement alone is enough to record confirmed coeliac disease',
              'Improvement after restriction is not a diagnostic confirmation.',
            ],
            [
              'Which investigations are complete or planned and what the specialist has advised',
              'Advice must fit the stage of diagnosis and the existing clinical plan.',
            ],
            [
              'Which additional food groups Taylor could remove immediately',
              'Further uncoordinated restriction can worsen nutritional adequacy and complicate assessment.',
            ],
          ],
          'Which advice appropriate after confirmed coeliac disease could complicate the current diagnostic workup?'
        ),
        advanced: q(
          'Additional measurements: Taylor’s weight fell from 75 kg to 67 kg in two months, while BMI remains within the usual adult healthy range. Bloating improved after reducing gluten, but no diagnosis is confirmed. Which interpretation best guides the next assessment?',
          [2],
          [
            [
              'Use the current healthy-range BMI to prioritise routine diet education over nutrition screening',
              'A substantial unintentional weight loss can indicate nutritional concern even when the current BMI appears reassuring.',
            ],
            [
              'Use the improvement in bloating to explain the weight change as an expected successful diet response',
              'The weight loss is unintended and ongoing; a symptom improvement does not establish a safe nutrition outcome.',
            ],
            [
              'Treat the approximately 11% unintentional loss as a nutrition concern despite the current BMI',
              'Percentage change and time course reveal a clinically important trajectory that BMI alone would miss; diagnostic uncertainty remains.',
            ],
            [
              'Wait for the coeliac diagnosis before assessing whether the reduced intake is nutritionally adequate',
              'Nutritional assessment should not wait for diagnostic confirmation when a substantial adverse trajectory is already present.',
            ],
          ],
          'Calculate the percentage loss and explain why a reassuring current BMI and partial symptom relief do not close the nutrition assessment.'
        ),
      },
      {
        challenge: q(
          'Taylor’s coeliac blood result is reported as reassuring, but gluten was substantially reduced before the sample. Which next step best addresses the reliability of that result?',
          [1],
          [
            [
              'Document coeliac disease as excluded regardless of the testing diet',
              'Pre-test gluten exposure can affect interpretation.',
            ],
            [
              'Refer the diet and timing for review of what the test can establish',
              'The result needs interpretation in relation to the test conditions and persistent symptoms.',
            ],
            [
              'Tell Taylor to begin a self-directed food challenge immediately',
              'Any challenge or repeat-testing plan should be individualised and supervised through the appropriate clinician.',
            ],
            [
              'Ignore the result because no blood test can be useful',
              'The limitation is contextual, not a reason to dismiss all testing.',
            ],
          ],
          'Which information about the sample and the preceding diet would you put in the referral?'
        ),
        advanced: q(
          'Additional laboratory review: the report lists a negative IgA-tTG, but total IgA is not documented; Taylor had already reduced gluten. Which TWO issues should be raised before treating this as a secure exclusion?',
          [0, 3],
          [
            [
              'Whether gluten exposure during testing was sufficient for the intended diagnostic interpretation',
              'Reduced exposure can limit confidence in the result and requires review.',
            ],
            [
              'Whether a negative IgA-tTG alone excludes every cause of malabsorption',
              'One result does not address all causes or all test limitations.',
            ],
            [
              'Whether symptom improvement can replace the missing test information',
              'Diet response does not repair incomplete diagnostic context.',
            ],
            [
              'Whether total IgA was measured and whether IgA deficiency changes the appropriate serological approach',
              'An IgA-based result must be interpreted in the context of IgA status.',
            ],
          ],
          'Explain how these are separate limitations and why the nursing role is to identify and communicate them rather than prescribe a food challenge.'
        ),
      },
      {
        challenge: q(
          'Taylor reports lightheadedness with ongoing gastrointestinal losses; HR has risen to 96/min and BP is 108/68 compared with the earlier 118/74. Which priority should come before continuing the planned diet lesson?',
          [3],
          [
            [
              'Finish the diet lesson because the observations are not dramatically abnormal',
              'A symptomatic trend can be important despite values that do not appear extreme.',
            ],
            [
              'Attribute the lightheadedness to anxiety about food without assessing losses',
              'This explanation is untested and may miss current physiological change.',
            ],
            [
              'Record “nonadherence” because intake has fallen',
              'A judgmental label does not assess the cause or effect of reduced intake.',
            ],
            [
              'Assess current circulation and losses and the need for prompt review',
              'The acute symptomatic change needs its own assessment alongside the longer-term nutrition workup.',
            ],
          ],
          'What change would move this from a routine education visit to an urgent escalation?'
        ),
        advanced: q(
          'Additional assessment: Taylor becomes lightheaded on standing after continued diarrhoea and poor intake. Which TWO plans address present safety without losing the longer-term diagnostic problem?',
          [1, 2],
          [
            [
              'Require Taylor to stand repeatedly until the symptoms can be reproduced',
              'Repeated unsafe mobilisation is not an appropriate substitute for a supported assessment.',
            ],
            [
              'Prevent an immediate fall and arrange clinical assessment of symptomatic circulatory change and ongoing losses',
              'Current safety and physiology take priority over completing an education checklist.',
            ],
            [
              'Keep the nutrition and diagnostic follow-up active once the acute assessment is addressed',
              'Managing an acute contributor should not cause the persistent symptoms and weight change to disappear from the plan.',
            ],
            [
              'Conclude that all symptoms are caused by coeliac disease before it is confirmed',
              'A working diagnostic concern should not be treated as proof of every new symptom.',
            ],
          ],
          'Explain what can be deferred safely and what needs an immediate response in this encounter.'
        ),
      },
      {
        challenge: q(
          'Taylor understands the intended diet but cannot reliably obtain suitable meals during work shifts. Which first question is most likely to produce a workable plan?',
          [0],
          [
            [
              '“What food, time, money and preparation space are available on a shift?”',
              'A concrete account identifies the real access barrier and supports tailored options.',
            ],
            [
              '“Why have you not followed the leaflet correctly?”',
              'This assumes unwillingness and may hide practical obstacles.',
            ],
            [
              '“Can you memorise more foods to avoid before we discuss access?”',
              'More knowledge does not solve a lack of suitable meals.',
            ],
            [
              '“Would you agree to remove more foods without dietary review?”',
              'Additional restriction can worsen adequacy without addressing the barrier.',
            ],
          ],
          'How would you know whether the barrier is information, cost, preparation facilities or the current diagnostic uncertainty?'
        ),
        advanced: q(
          'Additional planning detail: Taylor can afford either the specialist-branded products suggested online or regular meals, but not both. Diagnosis is still being reviewed. Which TWO actions best protect nutrition and a shared plan?',
          [0, 3],
          [
            [
              'Bring the actual budget and current diagnostic stage to the dietitian and specialist plan so advice is feasible and appropriate',
              'A plan needs to match both diagnostic status and the resources available.',
            ],
            [
              'Make premium products a condition of being considered adherent',
              'Brand cost is not a defensible measure of participation or nutritional adequacy.',
            ],
            [
              'Recommend skipping work-shift meals to avoid any uncertainty',
              'Avoiding meals can worsen inadequate intake and does not resolve the underlying plan.',
            ],
            [
              'Agree affordable, nutritionally adequate options within the clinician’s current advice and identify food-access support if needed',
              'This targets the practical barrier while avoiding independent changes to the diagnostic diet.',
            ],
          ],
          'Define a small achievable goal and an outcome that would show it improves intake rather than only leaflet completion.'
        ),
      },
      {
        challenge: q(
          'Taylor can repeat the instructions but is uncertain about food preparation and cross-contact. Which teach-back task best checks application of the agreed advice?',
          [2],
          [
            [
              'Ask whether the leaflet was read and accept “yes” as proof',
              'Reading does not establish practical application.',
            ],
            [
              'Ask Taylor to repeat the exact wording of a definition',
              'Verbatim repetition may miss practical misunderstandings.',
            ],
            [
              'Apply the agreed advice to a realistic work meal and preparation example',
              'A concrete example reveals whether the plan can be applied in the person’s setting.',
            ],
            [
              'Provide a longer list of restrictions without asking what is unclear',
              'More information may add burden without identifying the specific gap.',
            ],
          ],
          'What would you change if the example reveals a preparation problem rather than a knowledge problem?'
        ),
        advanced: q(
          'Additional teach-back: Taylor says, “If a meal might have cross-contact, I will skip eating for the rest of the shift.” Which response best balances the concern with nutritional risk?',
          [1],
          [
            [
              'Prioritise avoiding the uncertain meal and review the resulting intake at the next scheduled visit',
              'That response leaves a foreseeable intake gap without a practical backup now.',
            ],
            [
              'Agree a feasible backup meal and dietary advice for the preparation concern',
              'This addresses both cross-contact uncertainty and adequate intake rather than forcing an unsafe trade-off.',
            ],
            [
              'Reassure that the preparation setting is safe without establishing what the concern involves',
              'The concern needs a specific assessment and accurate advice rather than an unverified reassurance.',
            ],
            [
              'Provide a more detailed avoidance list before discussing which meals remain possible',
              'More restrictions may increase the intake problem unless feasibility and adequate alternatives are addressed.',
            ],
          ],
          'Explain how your revised plan would be tested during the next real work shift.'
        ),
      },
      {
        challenge: q(
          'Taylor brings a usable food plan and symptom record, but symptoms have not fully resolved. Which TWO outcomes should be evaluated separately?',
          [1, 3],
          [
            [
              'Leaflet completion and the colour of the food diary as measures of recovery',
              'Administrative completion does not establish a health outcome.',
            ],
            [
              'Whether the plan is feasible and is supporting adequate intake',
              'This measures whether the agreed process is functioning in daily life.',
            ],
            [
              'Persistent symptoms as proof that Taylor ignored the plan',
              'Symptoms can persist for reasons other than failure to follow advice.',
            ],
            [
              'The symptom, weight and nutritional trajectory and need for further specialist assessment',
              'Clinical recovery requires direct evaluation and a next step for unresolved findings.',
            ],
          ],
          'Which change would require earlier review rather than waiting for the planned follow-up?'
        ),
        advanced: q(
          'Additional follow-up: Taylor’s work meals are now practical, but unintentional weight loss continues and diarrhoea remains frequent. What is the best next conclusion?',
          [3],
          [
            [
              'Use the feasible meal plan as the main outcome and continue the same strategy until the next annual review',
              'The continuing adverse weight and symptom trajectory needs reassessment sooner than routine long-term review.',
            ],
            [
              'Prioritise specialist treatment for refractory coeliac disease before establishing the original diagnosis',
              'That diagnosis cannot be inferred before specialist confirmation and assessment of other causes.',
            ],
            [
              'Add another dietary restriction before reviewing the nutrition trajectory and test context',
              'Further uncoordinated restriction could worsen intake and delay the unresolved diagnostic review.',
            ],
            [
              'Access improved; ongoing weight loss still needs diagnostic and nutrition review',
              'The evaluation separates a successful practical intervention from an unresolved diagnostic and nutritional problem.',
            ],
          ],
          'Summarise what the intervention changed, what it did not change and the specific review you are requesting.'
        ),
      },
    ],
    b: [
      {
        challenge: q(
          'Rowan has persistent gastrointestinal symptoms and unintended weight change while specialist review is pending. Work schedules and food cost complicate intake. Which assessment best avoids reducing this to a knowledge problem?',
          [1],
          [
            [
              'Ask only whether Rowan knows the names of gluten-containing grains',
              'Knowledge is only one part of access, intake and diagnostic assessment.',
            ],
            [
              'Assess intake, weight, losses, access and the diagnostic stage',
              'This assesses physiological and practical needs without assuming the diagnosis or the reason for reduced intake.',
            ],
            [
              'Record nonadherence before asking about work-shift meals',
              'A label can obscure the cause and prevent a workable plan.',
            ],
            [
              'Assume that normal-looking vital signs mean nutritional assessment can wait indefinitely',
              'Persistent symptoms and unintended weight change merit assessment despite relatively reassuring observations.',
            ],
          ],
          'Which barrier would you ask Rowan to prioritise first, and which clinical finding could override that planned order?'
        ),
        advanced: q(
          'Additional intake history: Rowan skips meals during long shifts and has reduced gluten while awaiting testing. Which TWO risks require separate plans?',
          [0, 2],
          [
            [
              'Potentially inadequate nutrition from skipped meals and restricted choices',
              'The practical intake problem deserves assessment regardless of the final diagnosis.',
            ],
            [
              'A confirmed diagnosis of coeliac disease solely because gluten has been reduced',
              'A self-directed diet does not establish the diagnosis.',
            ],
            [
              'Reduced confidence in some coeliac testing if the pre-test diet is not appropriate',
              'The diagnostic plan needs the diet and timing communicated explicitly.',
            ],
            [
              'An assumption that resolving food cost will automatically resolve all gastrointestinal symptoms',
              'A barrier intervention may improve access without identifying the disease process.',
            ],
          ],
          'Explain how you would coordinate the immediate nutrition concern with the specialist’s diagnostic plan.'
        ),
      },
      {
        challenge: q(
          'Rowan’s dietary history shows suitable meals are available at home but not during work shifts. Which intervention best targets this specific barrier?',
          [3],
          [
            [
              'Repeat the same general leaflet and make no change to the plan',
              'The problem is feasibility in a particular setting, not simply missing information.',
            ],
            [
              'Ask Rowan to avoid every work-shift meal until diagnosis is confirmed',
              'Skipping meals can worsen inadequate intake.',
            ],
            [
              'Use home meals as proof that work access should not be a problem',
              'Different settings have different resources and constraints.',
            ],
            [
              'Agree a usable shift meal within the current diagnostic advice',
              'This fits the actual setting while preserving the specialist plan.',
            ],
          ],
          'What practical feature would make the proposed option usable on the next shift?'
        ),
        advanced: q(
          'Additional test context: Rowan’s IgA-tTG is negative after several weeks of markedly reduced gluten; total IgA is documented as deficient. Which TWO points should lead the referral update?',
          [1, 3],
          [
            [
              'The negative IgA-tTG securely excludes coeliac disease regardless of IgA status',
              'IgA deficiency limits the interpretation of an IgA-based test.',
            ],
            [
              'The IgA deficiency may require an appropriate IgG-based serological approach selected by the clinician or laboratory pathway',
              'The test strategy must account for the immunoglobulin context.',
            ],
            [
              'Rowan should independently increase gluten immediately without reviewing tolerance or the specialist plan',
              'A diagnostic challenge should be individualised and clinically supervised.',
            ],
            [
              'The reduced gluten exposure is a separate test-validity issue that also needs specialist review',
              'Even an appropriate antibody class does not remove the need to consider the testing diet.',
            ],
          ],
          'Explain why fixing one limitation does not automatically remove the other.'
        ),
      },
      {
        challenge: q(
          'During the visit Rowan reports lightheadedness with gastrointestinal losses; HR is 94/min and BP 110/68 compared with the earlier 124/76. Which TWO actions should precede a long discussion of food labels?',
          [0, 2],
          [
            [
              'Assess current circulation, hydration, intake and losses and arrange the appropriate clinical review',
              'The new symptomatic trend needs assessment in its own right.',
            ],
            [
              'Finish every planned education topic before checking the symptoms',
              'The original visit agenda should not obscure an acute need.',
            ],
            [
              'Support immediate safety if lightheaded, including avoiding unsupported mobilisation',
              'Preventing a fall is a practical priority while the cause is assessed.',
            ],
            [
              'Assume modest changes from baseline are clinically irrelevant',
              'Symptoms and direction of change can matter even without extreme values.',
            ],
          ],
          'Which additional finding would make you use the urgent escalation pathway?'
        ),
        advanced: q(
          'Additional assessment: Rowan has continuing diarrhoea, poor intake and symptomatic dizziness on standing; a work shift begins shortly. Rowan asks to leave with only the food leaflet. Which response best balances preference and current risk?',
          [2],
          [
            [
              'Complete the written diet plan first and give a routine review appointment for the dizziness',
              'The new symptomatic physiological change should take priority over completing education.',
            ],
            [
              'Explain only the medical risk and leave the work constraint for a later discussion',
              'The work constraint affects the feasibility of assessment and should be incorporated into a safe shared plan.',
            ],
            [
              'Explain the current risk and seek assessment with a feasible safe next step',
              'This addresses immediate risk and the barrier to staying without replacing shared decision-making with a lecture.',
            ],
            [
              'Use the suspected coeliac diagnosis to explain the dizziness and direct the visit back to dietary teaching',
              'The diagnosis and the immediate cause of the new symptoms remain unresolved.',
            ],
          ],
          'State the risk of deferring assessment and the information Rowan needs to participate in the decision.'
        ),
      },
      {
        challenge: q(
          'Rowan and the dietitian explore affordable meals and preparation concerns. Which question best converts the discussion into a testable practical plan?',
          [1],
          [
            [
              '“Can you promise never to have symptoms again?”',
              'Symptoms are not entirely controlled by willingness or the practical meal plan.',
            ],
            [
              '“Which shift meal is feasible, and what could prevent it?”',
              'This identifies a specific action and the barrier that could stop it.',
            ],
            [
              '“Will you buy every premium product on the list?”',
              'Costly product purchase is not the goal of a feasible nutrition plan.',
            ],
            [
              '“Can we record the education as complete because we discussed it?”',
              'Discussion alone does not show that the plan can be used.',
            ],
          ],
          'What would you measure at the next review to determine whether this plan improved intake?'
        ),
        advanced: q(
          'Additional planning conflict: one advice sheet assumes confirmed coeliac disease; another gives instructions for the pending diagnostic stage. Rowan cannot tell which applies. Which TWO actions best prevent further uncoordinated restriction?',
          [0, 3],
          [
            [
              'Ask the responsible clinician and dietitian to reconcile the advice with Rowan’s actual testing stage',
              'The person needs a single coherent plan that fits the current clinical context.',
            ],
            [
              'Tell Rowan to combine the strictest parts of both sheets',
              'Combining incompatible instructions can worsen restriction and test uncertainty.',
            ],
            [
              'Assume that more restriction is always safer during investigation',
              'Restriction can have nutritional and diagnostic consequences.',
            ],
            [
              'Provide one clear written plan, identify what remains undecided and confirm who will answer questions before further diet changes',
              'This makes uncertainty and ownership explicit rather than leaving the person to resolve conflicting clinical advice.',
            ],
          ],
          'Describe the difference between reducing information burden and withholding an important unresolved decision.'
        ),
      },
      {
        challenge: q(
          'Rowan repeats the plan accurately but says part of it is impossible during shifts. What is the best next response?',
          [0],
          [
            [
              'Identify and adapt the impossible step with dietary support',
              'Correct recall does not establish feasibility; the specific obstacle needs a practical response.',
            ],
            [
              'Mark teaching complete because recall was accurate',
              'Application and access remain unresolved.',
            ],
            [
              'Repeat the same instruction more firmly until Rowan agrees',
              'Agreement under pressure does not solve the barrier.',
            ],
            [
              'Describe Rowan as unmotivated because work remains a concern',
              'This unsupported judgment may obscure a solvable constraint.',
            ],
          ],
          'How would you check that the revised instruction can actually be carried out?'
        ),
        advanced: q(
          'Additional teach-back: Rowan says, “I know the plan, but my workplace has no safe preparation space and I cannot afford a separate lunch every day.” Which TWO outcomes would represent meaningful progress?',
          [1, 2],
          [
            [
              'Rowan repeats the leaflet without mentioning the barriers again',
              'Suppressing the barrier does not improve access or intake.',
            ],
            [
              'A mutually agreed affordable meal or backup that can be used in the actual work setting',
              'The intervention should solve a real access problem rather than increase instruction.',
            ],
            [
              'A follow-up measure of whether shift-day intake and symptoms improve, with support if the option fails',
              'A testable plan includes outcomes and a response to failure.',
            ],
            [
              'An assumption that no preparation space proves deliberate nonadherence',
              'An environmental limit is not evidence of unwillingness.',
            ],
          ],
          'State a realistic process measure and a separate clinical measure for the next review.'
        ),
      },
      {
        challenge: q(
          'Rowan now has a feasible food plan and symptom tracking, but gastrointestinal symptoms persist. Which next review best evaluates the whole plan?',
          [2],
          [
            [
              'Ask only whether Rowan still has the leaflet',
              'Possession of information is not a clinical outcome.',
            ],
            [
              'Assume persistent symptoms mean the food-access plan failed',
              'Access may have improved while disease-related symptoms remain unresolved.',
            ],
            [
              'Review intake and clinical trends with the specialist follow-up plan',
              'This separates implementation from clinical response and gives unresolved findings a next step.',
            ],
            [
              'Close follow-up because the observations are close to the starting values',
              'Vital signs alone do not establish resolution of persistent gastrointestinal or nutrition concerns.',
            ],
          ],
          'What finding would make you seek review earlier than the planned appointment?'
        ),
        advanced: q(
          'Additional follow-up: Rowan can now obtain meals during shifts but reports further weight loss and is uncertain who will review the earlier limited coeliac testing. Which TWO actions best close the remaining care gap?',
          [0, 3],
          [
            [
              'Escalate the adverse weight and symptom trajectory for clinical and nutritional reassessment',
              'Improved access does not make continuing deterioration acceptable or explained.',
            ],
            [
              'Attribute ongoing symptoms to hidden dietary mistakes without assessment',
              'This prematurely closes the differential and may blame the person for an unresolved disease process.',
            ],
            [
              'Treat a negative test from the restricted diet as a reason to end specialist follow-up',
              'The test context remains unresolved and should not be ignored.',
            ],
            [
              'Confirm a named clinician, timing and purpose for reviewing the diagnostic limitations and next investigations',
              'Ownership prevents an unresolved result from being lost between teams.',
            ],
          ],
          'Give a handover that distinguishes the successful access intervention from the unresolved nutritional and diagnostic concerns.'
        ),
      },
    ],
  },
}
