import { pillars } from './pillars'
import {
  choiceQuestion,
  evidenceQuestion,
  type EvolvingCase,
  type Observation,
  type ReasoningQuestion,
  type ReasoningLevel,
} from './evolving-types'
import type { SourceId } from './sources'
type Pair = [string, string]
type TeachingRow = {
  update: string
  prompt: string
  choices: [Pair, Pair, Pair]
  support: [Pair, Pair]
  reflection: string
}
const row = (
  update: string,
  prompt: string,
  good: Pair,
  bad: Pair,
  other: Pair,
  support: [Pair, Pair],
  reflection: string
): TeachingRow => ({
  update,
  prompt,
  choices: [good, bad, other],
  support,
  reflection,
})
type Family = {
  id: string
  title: string
  topic: string
  summary: string
  sources: SourceId[]
  patients: [string, string]
  histories: [string, string]
  vitals: [number, string, number, number, number][][]
  alternate: string[]
  rows: TeachingRow[]
}
const families: Family[] = [
  {
    id: 'fever-neuro',
    title: 'The Unusual Headache',
    topic: 'Infection & neurology',
    summary: 'A headache, fever and a changing neurologic assessment.',
    sources: ['meningitis', 'deterioration', 'sharedDecisions'],
    patients: ['Avery Cole · 27 years', 'Robin Ellis · 72 years'],
    histories: [
      'Avery has migraine history but describes a different headache, fever and neck discomfort. A friend can describe the usual baseline.',
      'Robin has arthritis and took an antipyretic before arrival. Family reports a new change in attention; absence of a rash has been used as reassurance.',
    ],
    vitals: [
      [
        [94, '122/76', 19, 38.4, 97],
        [104, '114/72', 23, 38.7, 96],
        [110, '108/68', 24, 38.8, 96],
        [112, '104/66', 25, 38.8, 95],
        [114, '102/64', 26, 38.6, 95],
        [108, '110/68', 23, 38.1, 96],
      ],
      [
        [90, '132/78', 20, 37.7, 96],
        [102, '120/72', 24, 38, 95],
        [108, '110/68', 25, 38.2, 95],
        [110, '108/68', 25, 38.1, 95],
        [112, '104/66', 26, 38.1, 94],
        [104, '114/70', 23, 37.8, 95],
      ],
    ],
    alternate: [
      'The family says this is a sudden change from Robin’s usual conversation. The temperature is modest after medication; there is no visible rash.',
      'Robin becomes less attentive and needs questions repeated. Neck movement is difficult to interpret because of arthritis.',
      'The proposed investigation cannot begin promptly; clinical review is already being coordinated.',
      'The family asks whether the low temperature means the concern has passed. You need to communicate the whole pattern.',
      'A new handover reveals that alertness is declining despite a lower measured temperature.',
      'The temperature has fallen further after team care, but Robin still has difficulty sustaining attention.',
    ],
    rows: [
      row(
        'Avery reports a headache unlike the usual migraine, fever and discomfort moving the neck. No cause has been confirmed.',
        'What should lead the initial response?',
        [
          'Escalate the new symptom combination and assess current neurologic status',
          'The combination and change from baseline warrant urgent clinical assessment without waiting for a diagnostic label.',
        ],
        [
          'Treat the migraine history as a sufficient explanation',
          'A familiar diagnosis does not establish the cause of a new presentation.',
        ],
        [
          'Wait for a rash before considering a serious infection',
          'A rash is not required for serious infection.',
        ],
        [
          [
            'Different headache with fever',
            'The combination challenges the familiar migraine explanation.',
          ],
          [
            'Current neurologic baseline and trend',
            'A change in cognition alters the urgency and must be established.',
          ],
        ],
        'Which observation would most change your urgency, and who can confirm baseline?'
      ),
      row(
        'A friend reports that Avery was speaking clearly earlier. Avery now loses the thread of a question.',
        'Which interpretation best uses the new information?',
        [
          'New cognitive change strengthens concern even before a test result',
          'The baseline comparison is clinically meaningful; diagnosis remains uncertain.',
        ],
        [
          'The person is probably tired from waiting',
          'That explanation cannot account safely for the new change without assessment.',
        ],
        [
          'Normal oxygen saturation excludes an urgent neurologic problem',
          'Oximetry does not exclude a neurologic or infectious emergency.',
        ],
        [
          [
            'New difficulty sustaining attention',
            'This is a change in neurologic function.',
          ],
          [
            'The friend’s earlier baseline report',
            'This establishes that the finding is new rather than usual.',
          ],
        ],
        'What alternative explanations still need consideration without delaying help?'
      ),
      row(
        'The team is arranging investigations. A proposed procedure is delayed and the patient is becoming less alert.',
        'Which plan avoids a harmful sequencing error?',
        [
          'Communicate the deterioration and coordinate urgent assessment alongside investigation planning',
          'Procedure logistics must not postpone recognition or response to deterioration.',
        ],
        [
          'Wait for the procedure before telling the team about the change',
          'The new deterioration is relevant now, independently of the procedure.',
        ],
        [
          'Perform a procedure without confirming safety requirements',
          'The treating team must assess suitability, contraindications and sequencing.',
        ],
        [
          [
            'Urgent update about declining alertness',
            'The team needs the new information to prioritize safely.',
          ],
          [
            'Clarification of procedure safety and timing',
            'Investigations must fit the current clinical condition and local pathway.',
          ],
        ],
        'What can proceed in parallel, and what needs a senior decision?'
      ),
      row(
        'Avery asks why different teams are attending. The friend requests information but the patient’s preferences for sharing have not been checked.',
        'Which communication plan best supports person-centred urgent care?',
        [
          'Explain the concern briefly, check sharing preferences and coordinate essential updates',
          'Urgency and understandable communication can coexist.',
        ],
        [
          'Provide a definite diagnosis to reduce anxiety',
          'False certainty can mislead the person and family.',
        ],
        [
          'Exclude the friend from all discussion without asking the patient',
          'The patient’s preferences and clinical situation should guide involvement.',
        ],
        [
          [
            'A clear explanation of the current uncertainty',
            'This supports understanding without inventing certainty.',
          ],
          [
            'The person’s preferences for involving the friend',
            'Support and confidentiality require attention to the individual.',
          ],
        ],
        'What does the patient most need to understand right now?'
      ),
      row(
        'The receiving team asks what changed. Temperature is slightly lower, but alertness and respiratory rate have worsened.',
        'What should lead the handover?',
        [
          'The worsening alertness and breathing trend, with the earlier baseline and current concern',
          'Improvement in one number should not hide deterioration in other functions.',
        ],
        [
          'Only the lower temperature',
          'This omits the most concerning changes.',
        ],
        [
          'The complete remote history before describing the present change',
          'The urgent change and request should be clear early in handover.',
        ],
        [
          [
            'The direction of the alertness trend',
            'A clinically important deterioration remains present.',
          ],
          [
            'The respiratory-rate trend and current observations',
            'This adds evidence of a broader changing condition.',
          ],
        ],
        'State the concern, uncertainty and requested response in one sentence.'
      ),
      row(
        'After coordinated care, temperature and pulse improve, but attention remains below the documented baseline.',
        'Which conclusion is justified?',
        [
          'Some findings improved, but neurologic recovery remains incomplete and needs reassessment',
          'A partial response is different from resolution of the concern.',
        ],
        [
          'A lower temperature proves recovery',
          'One measurement cannot establish overall recovery.',
        ],
        [
          'The original diagnosis is confirmed by the response alone',
          'A response does not independently establish etiology.',
        ],
        [
          [
            'Persistent change in attention',
            'This remains an unresolved clinical concern.',
          ],
          [
            'An explicit repeat neurologic assessment and escalation plan',
            'Reassessment must address the function that has not recovered.',
          ],
        ],
        'What would count as recovery for this individual?'
      ),
    ],
  },
  {
    id: 'pancreas-balance',
    title: 'Pancreatitis & Fluid Balance',
    topic: 'Inflammation & fluid balance',
    summary:
      'Abdominal pain, fluid losses and competing cardiac or renal risks.',
    sources: ['pancreatitis', 'fluids', 'deterioration'],
    patients: ['Sam Rivera · 48 years', 'Lee Bennett · 66 years'],
    histories: [
      'Sam has persistent upper abdominal pain, vomiting and suspected pancreatic inflammation. The cause is being investigated.',
      'Lee has confirmed acute pancreatitis, heart failure and chronic kidney disease. Team-directed fluids require careful reassessment.',
    ],
    vitals: [
      [
        [110, '108/70', 22, 37.8, 97],
        [118, '100/64', 25, 38, 96],
        [120, '96/60', 26, 38.1, 96],
        [112, '104/66', 24, 38, 95],
        [108, '110/68', 28, 37.9, 93],
        [104, '112/70', 25, 37.7, 94],
      ],
      [
        [104, '116/72', 22, 37.7, 96],
        [112, '104/66', 24, 37.9, 95],
        [116, '100/64', 25, 38, 95],
        [110, '108/68', 26, 37.9, 94],
        [108, '112/70', 30, 37.8, 92],
        [104, '114/72', 27, 37.6, 94],
      ],
    ],
    alternate: [
      'Lee has vomiting with poor intake and reduced urine output over a documented four-hour interval.',
      'The team confirms heart failure and a lower usual kidney function. A higher pulse accompanies falling pressure.',
      'A standard fluid order is queried because Lee’s baseline risk differs from another patient with pancreatitis.',
      'New breathlessness appears while pressure improves. The clinical team is reviewing the balance of risks.',
      'Breathing effort and oxygen needs increase even though the pain score has fallen.',
      'After reassessment, breathing improves but the team has not yet agreed nutrition and follow-up plans.',
    ],
    rows: [
      row(
        'Upper abdominal pain and repeated vomiting are accompanied by a faster pulse and lower pressure than baseline.',
        'Which information should drive the first assessment?',
        [
          'The symptom pattern, losses and perfusion trend considered together',
          'The full pattern guides urgency while the cause is investigated.',
        ],
        [
          'The pain rating alone',
          'Pain severity does not describe the circulatory impact of losses.',
        ],
        [
          'A presumed alcohol cause without asking the history',
          'Etiology should not be assumed or used to bias care.',
        ],
        [
          [
            'Repeated vomiting and poor intake',
            'These describe potential losses and reduced intake.',
          ],
          [
            'Pulse and pressure compared with baseline',
            'These help characterize the clinical effect rather than count symptoms alone.',
          ],
        ],
        'What history can you obtain without making assumptions about the cause?'
      ),
      row(
        'Urine volume is lower over a known four-hour period. Current fluid balance and prior observations are available.',
        'Which conclusion is most defensible?',
        [
          'The trend adds concern and requires assessment with other perfusion findings',
          'A defined interval makes the trend interpretable, but it does not identify the cause alone.',
        ],
        [
          'The urine finding proves isolated kidney failure',
          'Several causes and contributing factors remain possible.',
        ],
        [
          'The urine finding is irrelevant because fluids have started',
          'Starting a response does not demonstrate that it is sufficient or well tolerated.',
        ],
        [
          [
            'Volume linked to a known time interval',
            'A time denominator is essential when interpreting output.',
          ],
          [
            'Cognition, circulation and the full balance record',
            'Output must be interpreted in the wider clinical context.',
          ],
        ],
        'Which missing finding would distinguish ongoing losses from another cause?'
      ),
      row(
        'Heart failure or reduced renal function is identified while the team is planning ongoing fluid therapy.',
        'Which plan best handles competing risks?',
        [
          'Clarify an individualized plan with response endpoints and signs of intolerance',
          'Both insufficient perfusion and poorly tolerated fluids need consideration.',
        ],
        [
          'Use the same fluid plan for every person with the diagnosis',
          'A diagnosis does not remove differences in comorbidity and response.',
        ],
        [
          'Avoid all reassessment until the prescribed volume is complete',
          'The response can change before an infusion finishes.',
        ],
        [
          [
            'Individual cardiac and renal context',
            'These risks affect tolerance and monitoring needs.',
          ],
          [
            'Agreed reassessment and escalation endpoints',
            'The plan should say what to watch and when to review.',
          ],
        ],
        'What improvement and what harm would you monitor for at the same time?'
      ),
      row(
        'The pressure improves after team care. The patient now has more effort breathing and requires reassessment.',
        'Which response best avoids anchoring on improvement?',
        [
          'Communicate the new breathing change and reassess the overall response',
          'A better pressure does not cancel new respiratory concerns.',
        ],
        [
          'Treat the improved pressure as proof the entire plan is working',
          'Different organ-related findings can move in different directions.',
        ],
        [
          'Stop or change all treatment independently based on one finding',
          'Patient-specific treatment changes need the appropriate clinical review and pathway.',
        ],
        [
          [
            'New breathing effort and support needs',
            'These may indicate an important new problem.',
          ],
          [
            'The relation between recent care and the whole observation trend',
            'The team needs a coherent timeline to reassess risks.',
          ],
        ],
        'What else could explain the breathing change, and what must not wait?'
      ),
      row(
        'The pain score falls. A proposed blanket plan would withhold all oral intake without documenting a reason or review point.',
        'What should the nurse clarify?',
        [
          'The individualized nutrition plan, current tolerance and reason for any restriction',
          'A blanket restriction is not a substitute for a current clinical nutrition assessment.',
        ],
        [
          'All pancreatitis requires indefinite fasting',
          'Nutrition planning depends on current condition, severity and contraindications.',
        ],
        [
          'Pain improvement means nutrition no longer needs discussion',
          'Nutrition remains part of recovery and prevention of complications.',
        ],
        [
          [
            'Current vomiting and ability to tolerate intake',
            'These affect the immediate nutrition discussion.',
          ],
          [
            'The reason, review point and specialist input for any restriction',
            'This prevents a blanket instruction from continuing unexamined.',
          ],
        ],
        'What clinical reason justifies the present restriction, if any?'
      ),
      row(
        'Pulse and pain improve, but breathing remains above baseline. The nutrition plan and follow-up are still being arranged.',
        'Which evaluation is most complete?',
        [
          'Review perfusion, breathing, intake tolerance and the agreed next review',
          'Recovery includes multiple functions, not only pain relief.',
        ],
        [
          'Record pain relief as the only outcome',
          'This misses continuing respiratory and nutritional concerns.',
        ],
        [
          'Assume that discharge readiness follows from one improved vital sign',
          'Readiness requires the relevant clinical, functional and follow-up assessment.',
        ],
        [
          [
            'Persistent breathing change',
            'This is an unresolved part of the response.',
          ],
          [
            'A practical intake and reassessment plan',
            'The person needs a coherent next step as well as better numbers.',
          ],
        ],
        'What is improved, unresolved and newly uncertain?'
      ),
    ],
  },
  {
    id: 'skin-systemic',
    title: 'The Spreading Skin Infection',
    topic: 'Infection & immunity',
    summary:
      'New pain and spreading symptoms during treatment for a skin infection.',
    sources: ['cellulitis', 'sepsis', 'deterioration'],
    patients: ['Dara Singh · 52 years', 'Alex Monroe · 45 years'],
    histories: [
      'Dara is receiving treatment for a lower-leg skin infection. Earlier observations and the documented skin border are available.',
      'Alex takes immunosuppressive treatment for an autoimmune condition. New leg pain is difficult to interpret from redness alone.',
    ],
    vitals: [
      [
        [98, '126/76', 20, 38.1, 97],
        [108, '114/70', 23, 38.5, 96],
        [116, '104/66', 26, 38.6, 95],
        [120, '98/62', 28, 38.5, 94],
        [118, '100/64', 27, 38.3, 95],
        [108, '110/70', 23, 37.9, 96],
      ],
      [
        [96, '120/74', 20, 37.4, 97],
        [106, '110/68', 24, 37.6, 96],
        [114, '102/64', 26, 37.8, 95],
        [118, '96/60', 28, 37.7, 94],
        [116, '100/62', 27, 37.6, 95],
        [106, '112/70', 23, 37.4, 96],
      ],
    ],
    alternate: [
      'Alex reports new deep pain; surface color change is subtle. Immunosuppressive medicines are part of the history.',
      'The pain has intensified and extends beyond what the superficial appearance suggests.',
      'A modest temperature is being used to discount new systemic symptoms.',
      'The team is reassessing for serious complications and alternative diagnoses.',
      'A family member identifies new confusion while the skin color appears unchanged.',
      'After team care, systemic observations improve but pain and function still need review.',
    ],
    rows: [
      row(
        'Pain and swelling have increased since the last review. The skin looks only slightly different from the documented border.',
        'Which comparison is most useful?',
        [
          'Assess pain, function, spread and systemic findings against the earlier record',
          'Skin appearance alone can underrepresent clinical change.',
        ],
        [
          'Use border size as the only measure of worsening',
          'Pain and systemic findings may change without a dramatic visible border change.',
        ],
        [
          'Assume antibiotics make new symptoms expected and harmless',
          'Treatment does not remove the need to evaluate deterioration.',
        ],
        [
          [
            'The direction and severity of pain and swelling',
            'These provide clinically important information beyond color.',
          ],
          [
            'Earlier observations and current systemic assessment',
            'The comparison identifies whether the condition is changing more broadly.',
          ],
        ],
        'What is different, and how reliable is the comparison?'
      ),
      row(
        'Pain is now severe and appears out of proportion to the visible superficial findings.',
        'What is the safest interpretation?',
        [
          'A serious complication or an alternative process needs urgent reassessment',
          'Disproportionate pain is a reason to escalate assessment rather than wait for the skin appearance to catch up.',
        ],
        [
          'A small visible change proves the process is superficial',
          'Visible appearance does not exclude deeper illness.',
        ],
        [
          'The symptom confirms one specific diagnosis without review',
          'It raises concern but does not establish the cause on its own.',
        ],
        [
          [
            'Disproportionate or rapidly worsening pain',
            'This changes the urgency of review.',
          ],
          [
            'Assessment for deeper complications and alternative causes',
            'The initial label should not close the differential.',
          ],
        ],
        'What explanation are you at risk of overlooking?'
      ),
      row(
        'A modest temperature is accompanied by faster breathing and pressure below baseline. Immunosuppressive treatment is noted.',
        'Which priority is most defensible?',
        [
          'Escalate the systemic trend without requiring a high fever',
          'A temperature alone is insufficient to dismiss a serious illness.',
        ],
        [
          'Require a high fever before seeking review',
          'Serious infection can present without a prominent fever.',
        ],
        [
          'Use the stable skin photograph to overrule the observations',
          'A photograph cannot replace a current systemic assessment.',
        ],
        [
          [
            'The breathing and circulatory trend',
            'These suggest that concern extends beyond local skin symptoms.',
          ],
          [
            'The immunosuppressive medication history',
            'This is relevant context for risk and presentation.',
          ],
        ],
        'Which finding matters most even if the temperature seems reassuring?'
      ),
      row(
        'The receiving team is considering both worsening infection and a noninfectious cause of leg swelling.',
        'Which plan best supports their assessment?',
        [
          'Provide the time course, medicine history, examination and relevant prior results',
          'A coherent history and examination help discriminate alternatives.',
        ],
        [
          'Withhold the original diagnosis so the team cannot be biased',
          'Prior assessment is useful when communicated as a working label rather than certainty.',
        ],
        [
          'Decide that all unilateral swelling is infection',
          'Other causes can resemble a skin infection.',
        ],
        [
          [
            'A precise time course and current findings',
            'The evolution helps distinguish processes.',
          ],
          [
            'Relevant medicines, allergies and previous response',
            'These affect the assessment and safe next plan.',
          ],
        ],
        'Which data would challenge your leading explanation?'
      ),
      row(
        'A relative reports new confusion. The temperature is lower and the visible border is similar.',
        'What should lead the urgent update?',
        [
          'The new cognitive change and systemic trend',
          'The most concerning change should lead, even if local appearance seems stable.',
        ],
        [
          'Only the unchanged skin border',
          'This would omit the new systemic concern.',
        ],
        [
          'A definite claim that the treatment has failed in a particular way',
          'A specific mechanism has not been established.',
        ],
        [
          [
            'The relative’s baseline comparison',
            'This helps establish that confusion is new.',
          ],
          [
            'The current observations and requested clinical response',
            'The team needs both evidence and a clear action request.',
          ],
        ],
        'How would you communicate urgency without claiming an unconfirmed diagnosis?'
      ),
      row(
        'Systemic observations improve after team care. Residual redness remains, and pain and mobility are being reassessed.',
        'Which evaluation is best?',
        [
          'Distinguish gradual skin recovery from persistent pain, functional loss or new systemic change',
          'Different outcomes recover at different rates and need appropriate follow-up.',
        ],
        [
          'Require all redness to disappear before any improvement can be recognized',
          'Skin appearance may recover slowly.',
        ],
        [
          'Treat improved temperature as proof that no further review is needed',
          'Pain, function and systemic trends still need evaluation.',
        ],
        [
          [
            'Pain and function compared with the previous assessment',
            'These help identify unresolved problems.',
          ],
          [
            'A clear return/escalation plan for renewed systemic symptoms',
            'Improvement must be accompanied by a workable safety net.',
          ],
        ],
        'Which residual finding is expected, and which would trigger another review?'
      ),
    ],
  },
  {
    id: 'leg-to-lung',
    title: 'Leg Swelling & Breathlessness',
    topic: 'Circulation & bleeding',
    summary: 'Leg swelling, new breathlessness and competing treatment risks.',
    sources: ['vte', 'deterioration', 'sharedDecisions'],
    patients: ['Morgan Hale · 60 years', 'Jules Park · 70 years'],
    histories: [
      'Morgan has unilateral leg swelling after reduced mobility. A clinical assessment for possible venous thrombosis is in progress.',
      'Jules is being treated for confirmed thrombosis. Kidney disease and a new bleeding symptom make reassessment important.',
    ],
    vitals: [
      [
        [92, '130/78', 18, 37.2, 97],
        [100, '122/74', 22, 37.3, 96],
        [112, '110/68', 28, 37.4, 92],
        [116, '104/66', 29, 37.4, 91],
        [110, '112/70', 26, 37.3, 94],
        [102, '118/72', 23, 37.2, 95],
      ],
      [
        [90, '128/76', 18, 37.1, 97],
        [98, '120/72', 21, 37.2, 96],
        [108, '108/66', 26, 37.3, 93],
        [112, '102/62', 28, 37.3, 92],
        [108, '110/68', 25, 37.2, 94],
        [100, '116/70', 22, 37.1, 95],
      ],
    ],
    alternate: [
      'Jules reports new gum bleeding and has a small bruise. Current medicines and the timing of doses need confirmation.',
      'The extent and persistence of bleeding are being assessed with current observations and relevant results.',
      'Jules now feels lightheaded and breathless. The change cannot be explained by the small visible bruise alone.',
      'The team is urgently reviewing both the new symptoms and treatment-related risks.',
      'A handover needs the dose timing and relevant kidney-function context without independently changing treatment.',
      'After review, symptoms improve but the person needs a clear plan for recurrent bleeding or breathlessness.',
    ],
    rows: [
      row(
        'A leg is newly swollen and uncomfortable after reduced mobility. There are no current respiratory symptoms.',
        'Which initial approach is most defensible?',
        [
          'Assess the history and leg findings while considering thrombosis and other causes',
          'The pattern raises concern but does not confirm a diagnosis.',
        ],
        [
          'Diagnose thrombosis from swelling alone',
          'Several conditions can cause unilateral swelling.',
        ],
        [
          'Dismiss the finding because a distal pulse is palpable',
          'A palpable pulse does not exclude a venous problem.',
        ],
        [
          [
            'The time course and risk context',
            'These contribute to clinical probability and assessment.',
          ],
          [
            'Examination for local findings and alternatives',
            'Assessment needs more than one sign.',
          ],
        ],
        'What would make you revise the leading concern?'
      ),
      row(
        'The person describes feeling unusually short of breath while the leg assessment is underway.',
        'What should change?',
        [
          'Reassess the new respiratory symptom and escalate the changed clinical picture',
          'A new symptom can change urgency before the original workup is finished.',
        ],
        [
          'Complete the original leg-only assessment before mentioning it',
          'A sequential task list should not delay response to a new concern.',
        ],
        [
          'Assume anxiety explains breathlessness because the person is worried',
          'Anxiety cannot be used to exclude an acute clinical cause.',
        ],
        [
          [
            'Onset and severity of breathlessness',
            'The new time course matters for prioritization.',
          ],
          [
            'Current breathing, circulation and oxygenation findings',
            'These help establish the effect of the new symptom.',
          ],
        ],
        'What has changed in your priority compared with the previous moment?'
      ),
      row(
        'Breathing is faster, saturation is lower than baseline and pressure is falling. The exact cause remains unconfirmed.',
        'Which response best handles the uncertainty?',
        [
          'Request urgent clinical review while communicating the findings and competing concerns',
          'Urgency does not require diagnostic certainty.',
        ],
        [
          'Wait for a definitive imaging result before escalating',
          'The current deterioration needs a response independently of a pending test.',
        ],
        [
          'State that the diagnosis is certain because the pattern is familiar',
          'The pattern supports concern but does not establish one cause.',
        ],
        [
          [
            'A new respiratory/circulatory trend',
            'This provides direct evidence of clinical change.',
          ],
          [
            'The original leg symptoms and relevant treatment history',
            'The receiving team needs context for competing explanations and risks.',
          ],
        ],
        'What can you say confidently, and what remains a hypothesis?'
      ),
      row(
        'Treatment details and relevant results are being checked. A new bleeding symptom is reported.',
        'Which plan best supports safety?',
        [
          'Assess the bleeding, observations, medication timing and relevant results, and communicate the findings',
          'Treatment risks need review in the context of actual severity and current condition.',
        ],
        [
          'Independently change all anticoagulant treatment from one minor finding',
          'The appropriate response depends on severity, drug, results and the clinical plan.',
        ],
        [
          'Ignore bleeding because thrombosis is the original concern',
          'Treatment-related harm also needs assessment.',
        ],
        [
          [
            'Severity, persistence and physiological effect of bleeding',
            'These help prioritize the response.',
          ],
          [
            'The exact medicine and relevant timing/results',
            'Different treatments and patient factors require different interpretations.',
          ],
        ],
        'Which finding would make this a different level of urgency?'
      ),
      row(
        'A receiving clinician asks for a concise summary of the new symptoms and the treatment context.',
        'Which handover is most useful?',
        [
          'Describe the new trend, key treatment timing, relevant risks and a specific review request',
          'This supports a decision without overstating a diagnosis or omitting treatment risks.',
        ],
        [
          'Provide only a list of remote risk factors',
          'The current change and action requested are missing.',
        ],
        [
          'Say the patient is stable because an earlier set of observations was normal',
          'The earlier assessment does not describe the present state.',
        ],
        [
          [
            'Current symptoms and observation trend',
            'This establishes the present concern.',
          ],
          [
            'Treatment timing, risks and the requested next action',
            'These details support safe coordination.',
          ],
        ],
        'Which sentence communicates both urgency and uncertainty?'
      ),
      row(
        'After team review, breathlessness eases. The person asks what should prompt them to seek help again.',
        'Which evaluation and teaching plan is best?',
        [
          'Review the response, remaining risks and a teach-back of the follow-up/escalation plan',
          'A practical safety net is part of evaluating readiness and understanding.',
        ],
        [
          'Assume reassurance alone proves understanding',
          'Agreement does not show that instructions can be applied.',
        ],
        [
          'Promise that improvement means symptoms cannot recur',
          'Improvement does not remove all future risk.',
        ],
        [
          [
            'An explicit plan for recurrent breathing or bleeding symptoms',
            'The person needs actionable information.',
          ],
          [
            'Teach-back using the person’s own words',
            'This checks the explanation rather than testing recall of jargon.',
          ],
        ],
        'How would you check that the person knows what to do next?'
      ),
    ],
  },
  {
    id: 'abdomen-turn',
    title: 'Abdominal Pain',
    topic: 'Abdominal assessment',
    summary: 'Abdominal pain and a changing assessment.',
    sources: ['appendicitis', 'deterioration', 'sharedDecisions'],
    patients: ['Nico Reed · 31 years', 'Emery Shaw · 67 years'],
    histories: [
      'Nico has worsening abdominal pain under investigation. The initial examination did not establish the cause.',
      'Emery has a less typical pain pattern and new functional change. A previous reassuring assessment is being cited despite new findings.',
    ],
    vitals: [
      [
        [90, '126/78', 18, 37.4, 98],
        [100, '118/74', 21, 37.9, 97],
        [108, '110/68', 24, 38.3, 97],
        [116, '100/64', 27, 38.5, 96],
        [112, '104/66', 26, 38.3, 96],
        [104, '114/70', 22, 37.8, 97],
      ],
      [
        [88, '132/80', 19, 37.3, 97],
        [98, '120/74', 22, 37.7, 97],
        [106, '108/68', 25, 38, 96],
        [114, '98/62', 28, 38.2, 95],
        [110, '104/66', 26, 38, 96],
        [102, '114/70', 23, 37.6, 97],
      ],
    ],
    alternate: [
      'Emery reports diffuse discomfort and reduced appetite rather than a classic location. Family notes reduced activity.',
      'The new examination and observation trend differ from the earlier review.',
      'A brief reduction in pain is followed by a more unwell appearance and difficulty moving comfortably.',
      'A new clinician is asked to reassess the whole picture rather than repeat the earlier conclusion.',
      'The family asks whether the earlier reassuring result means a new assessment is unnecessary.',
      'After reassessment and team care, pain and observations improve but mobility and intake remain under review.',
    ],
    rows: [
      row(
        'Abdominal pain persists and appetite is reduced. The initial assessment did not identify a cause.',
        'What should guide ongoing assessment?',
        [
          'The time course, repeat examination and associated symptoms',
          'An early assessment is one point in an evolving story.',
        ],
        [
          'The assumption that an unconfirmed diagnosis means no serious problem',
          'Diagnostic uncertainty does not equal absence of risk.',
        ],
        [
          'The expectation that every patient will describe the classic pain pattern',
          'Presentations can differ, especially across age and clinical context.',
        ],
        [
          [
            'The direction and location of the pain over time',
            'The evolution is more informative than one isolated description.',
          ],
          [
            'Associated symptoms and current functional change',
            'These contribute to the overall assessment.',
          ],
        ],
        'Which part of the earlier assessment needs to be revisited?'
      ),
      row(
        'The pain changes location and walking becomes more uncomfortable. Observations also differ from the earlier record.',
        'Which interpretation best avoids premature closure?',
        [
          'The current change requires reassessment even if the first examination was reassuring',
          'The new state must be evaluated on its own findings.',
        ],
        [
          'The earlier assessment overrules the new symptoms',
          'That would ignore the evolving time course.',
        ],
        [
          'The changing location confirms one diagnosis without further evaluation',
          'It supports a concern but is not independently definitive.',
        ],
        [
          [
            'New functional difficulty',
            'This is a meaningful change for the person.',
          ],
          [
            'A different observation and examination trend',
            'The current assessment should be compared with the earlier one.',
          ],
        ],
        'What new information makes the previous working explanation less secure?'
      ),
      row(
        'Pain briefly eases, but the person looks more unwell and pressure falls while breathing becomes faster.',
        'Which conclusion is safest?',
        [
          'Pain relief alone is incomplete evidence; the systemic change needs urgent review',
          'One symptom can improve while the overall condition worsens.',
        ],
        [
          'A lower pain score proves resolution',
          'This ignores the circulatory and respiratory trend.',
        ],
        [
          'Only the pain location needs reassessment',
          'The whole clinical response matters.',
        ],
        [
          [
            'Falling pressure and faster breathing',
            'These challenge the conclusion of recovery.',
          ],
          [
            'The broader appearance and functional change',
            'Observed deterioration must be considered alongside symptom reporting.',
          ],
        ],
        'What would you communicate before seeking a diagnostic label?'
      ),
      row(
        'A clinician is arranging further assessment. The person is worried and asks whether surgery is inevitable.',
        'Which response best supports informed care?',
        [
          'Explain that the cause and next steps are being assessed and invite the person’s questions',
          'Honest uncertainty supports understanding while urgent assessment proceeds.',
        ],
        [
          'Promise that surgery will not be needed',
          'The evidence does not support that promise.',
        ],
        [
          'Give a definite diagnosis to make the conversation shorter',
          'False certainty can interfere with informed choices.',
        ],
        [
          [
            'A clear account of what is known and not yet known',
            'This reduces misleading assumptions.',
          ],
          [
            'The person’s questions and concerns about proposed next steps',
            'These are part of person-centred planning.',
          ],
        ],
        'What information can you give without making an unsupported prediction?'
      ),
      row(
        'The receiving team has the original results but has not heard about the new observation trend.',
        'What should lead your update?',
        [
          'The new clinical change, its timing and the urgent reassessment request',
          'The reason for a different priority should be explicit.',
        ],
        [
          'Repeat only the original reassuring results',
          'That leaves out why reassessment is now needed.',
        ],
        [
          'Delay the handover until every new test is complete',
          'Current deterioration must be communicated while investigations proceed.',
        ],
        [
          [
            'A direct comparison with the previous state',
            'This explains why the plan needs review.',
          ],
          [
            'The requested response and interim observation plan',
            'The update must connect concern to action.',
          ],
        ],
        'What is the shortest accurate explanation of why the situation is different now?'
      ),
      row(
        'After team care, the person reports better pain control. Eating, movement and follow-up still need review.',
        'Which outcome review is most useful?',
        [
          'Evaluate pain, observations, function, intake and the safety-net plan',
          'Recovery and readiness depend on more than a single symptom.',
        ],
        [
          'Use pain relief as the sole discharge criterion',
          'That omits important clinical and functional information.',
        ],
        [
          'Assume the initial diagnosis question no longer matters',
          'The plan and any remaining uncertainty still need clarification.',
        ],
        [
          [
            'Functional ability and intake tolerance',
            'These show how recovery affects daily activity.',
          ],
          [
            'Clear follow-up and advice for renewed worsening',
            'The person needs to know what to do if the picture changes again.',
          ],
        ],
        'Which unresolved issue should appear in the next handover?'
      ),
    ],
  },
  {
    id: 'nutrition-context',
    title: 'Nutrition & Diagnosis',
    topic: 'Nutrition & person-centred care',
    summary:
      'Persistent digestive symptoms, weight change and barriers to care.',
    sources: ['coeliac', 'sharedDecisions', 'fluids'],
    patients: ['Taylor Kim · 39 years', 'Rowan Diaz · 56 years'],
    histories: [
      'Taylor has persistent gastrointestinal symptoms, weight change and investigations for possible coeliac disease. A restrictive diet has been started without specialist review.',
      'Rowan is undergoing investigation for persistent symptoms and possible coeliac disease. Work schedules, food cost and dietary restrictions complicate assessment.',
    ],
    vitals: [
      [
        [84, '118/74', 16, 36.8, 98],
        [90, '112/70', 17, 36.9, 98],
        [96, '108/68', 18, 36.9, 97],
        [90, '114/72', 17, 36.8, 98],
        [86, '116/72', 16, 36.8, 98],
        [84, '118/74', 16, 36.8, 98],
      ],
      [
        [82, '124/76', 16, 36.7, 98],
        [88, '118/72', 17, 36.8, 98],
        [94, '110/68', 18, 36.8, 97],
        [88, '118/74', 17, 36.7, 98],
        [84, '120/74', 16, 36.7, 98],
        [82, '122/76', 16, 36.7, 98],
      ],
    ],
    alternate: [
      'Rowan has ongoing symptoms and unintended weight change. Specialist diagnostic review is pending.',
      'The dietary history reveals different food access at home and work rather than a simple knowledge gap.',
      'The person reports lightheadedness during ongoing gastrointestinal losses; assessment must address current physiology as well as education.',
      'A dietitian and the person explore affordable food options and cross-contact concerns.',
      'The person can describe the plan but says parts of it are not feasible during work shifts.',
      'At review, symptom tracking and a feasible follow-up plan are available, but persistent symptoms still need specialist reassessment.',
    ],
    rows: [
      row(
        'Persistent gastrointestinal symptoms and weight change are under investigation. The person has recently removed gluten without specialist advice.',
        'What should be clarified first?',
        [
          'The current diet, testing stage, symptom burden and specialist plan',
          'Dietary changes can affect interpretation of some diagnostic tests; individualized review is needed.',
        ],
        [
          'Confirm the diagnosis solely from symptom improvement after restriction',
          'A response alone does not establish the diagnosis.',
        ],
        [
          'Tell the person to make another major diet change without checking the plan',
          'Uncoordinated restriction can complicate testing and nutrition.',
        ],
        [
          [
            'What the person currently eats and when it changed',
            'This is relevant to testing and nutritional assessment.',
          ],
          [
            'The stage of investigation or confirmed diagnosis',
            'Advice must fit whether the diagnosis is established.',
          ],
        ],
        'What advice might be appropriate in confirmed disease but inappropriate during investigation?'
      ),
      row(
        'A test result is reassuring, but the person reports that gluten intake was already substantially reduced before the test.',
        'Which interpretation is most careful?',
        [
          'The testing context needs specialist review before a firm conclusion',
          'A result must be interpreted in relation to the relevant pre-test conditions.',
        ],
        [
          'The result excludes every cause of the symptoms',
          'One test does not address all possibilities.',
        ],
        [
          'A self-directed food challenge is automatically appropriate',
          'The person’s situation and specialist plan must be reviewed.',
        ],
        [
          [
            'The diet during the testing period',
            'This can affect how the result is interpreted.',
          ],
          [
            'The persistent symptoms and next specialist step',
            'Unresolved symptoms still require a coherent plan.',
          ],
        ],
        'Which condition of the test might change your confidence in the result?'
      ),
      row(
        'Ongoing losses are accompanied by lightheadedness, a faster pulse and lower pressure than the person’s usual values.',
        'Which priority should lead this review?',
        [
          'Assess the current physiological change as well as the longer-term nutrition concern',
          'An education visit can also reveal an acute assessment need.',
        ],
        [
          'Continue the planned diet discussion without assessing the new symptoms',
          'The original appointment purpose should not obscure a new clinical concern.',
        ],
        [
          'Attribute lightheadedness to anxiety without checking the observations',
          'That explanation is incomplete and may miss physiological change.',
        ],
        [
          [
            'The new symptoms and observation trend',
            'These require assessment in their own right.',
          ],
          [
            'Losses, intake and the time interval of change',
            'The history helps characterize the current effect.',
          ],
        ],
        'What can wait, and what should be assessed now?'
      ),
      row(
        'The person understands the intended diet but cannot reliably obtain suitable meals during work shifts.',
        'Which plan best addresses the actual barrier?',
        [
          'Agree feasible options with the person and relevant dietary support',
          'Knowledge is not the only determinant of what a person can do.',
        ],
        [
          'Repeat the same leaflet more firmly',
          'That does not address access or feasibility.',
        ],
        [
          'Label the person as nonadherent without exploring the problem',
          'A judgmental label can hide a solvable barrier.',
        ],
        [
          [
            'The specific food-access barrier',
            'This identifies what needs to change in the plan.',
          ],
          [
            'The person’s priorities and practical specialist support',
            'A feasible plan must fit their circumstances.',
          ],
        ],
        'What is the difference between a knowledge gap and an access barrier?'
      ),
      row(
        'The person can repeat instructions but describes uncertainty about food preparation and cross-contact.',
        'How should understanding be checked?',
        [
          'Use a realistic example and ask the person to explain the agreed approach in their own words',
          'Applied teach-back can reveal what the explanation has not yet made clear.',
        ],
        [
          'Ask only whether the leaflet was read',
          'Reading does not show that the plan can be applied.',
        ],
        [
          'Treat questions as evidence that the person is unwilling',
          'Questions can identify where more useful support is needed.',
        ],
        [
          [
            'A realistic meal or preparation example',
            'This tests how the explanation works in daily life.',
          ],
          [
            'The person’s own account of the next step',
            'This checks understanding and feasibility.',
          ],
        ],
        'What would you change in your explanation if teach-back shows uncertainty?'
      ),
      row(
        'At follow-up, a workable food plan and symptom record are available. Symptoms have not fully resolved.',
        'Which conclusion is justified?',
        [
          'There is progress in the plan, with persistent symptoms still needing reassessment',
          'A better process does not prove that all clinical concerns are resolved.',
        ],
        [
          'A completed leaflet proves a clinical outcome',
          'Participation and understanding are different from symptom recovery.',
        ],
        [
          'Persistent symptoms prove the person ignored the plan',
          'Other causes and ongoing disease assessment remain relevant.',
        ],
        [
          [
            'The symptom and nutrition trajectory',
            'Clinical outcomes need evaluation over time.',
          ],
          [
            'A clear specialist follow-up and escalation plan',
            'Unresolved symptoms require a defined next step.',
          ],
        ],
        'Which outcome reflects participation, and which reflects health change?'
      ),
    ],
  },
]
const alternateDecisions: Record<string, Record<number, TeachingRow>> = {
  'fever-neuro': {
    2: row(
      'A modest measured temperature follows an antipyretic, and attention has declined.',
      'Which risk interpretation best fits this version?',
      [
        'The new cognitive change remains urgent despite a less striking temperature',
        'Medicine timing and a baseline comparison affect interpretation; one modest temperature does not dismiss the changing condition.',
      ],
      [
        'The temperature trend is sufficient to downgrade the response',
        'That would give one influenced measurement more weight than the new neurologic findings.',
      ],
      [
        'The absence of a rash resolves the remaining uncertainty',
        'Absence of one sign does not establish a benign cause.',
      ],
      [
        [
          'New attention change compared with family-reported baseline',
          'This is direct evidence that neurologic function is different.',
        ],
        [
          'Antipyretic timing and incomplete clinical information',
          'This explains why the temperature must be interpreted in context.',
        ],
      ],
      'Which reassuring observation might be misleading in this version?'
    ),
  },
  'pancreas-balance': {
    3: row(
      'Breathing effort rises while pressure improves in a person with cardiac and renal comorbidity.',
      'What should change the plan first in this version?',
      [
        'Request reassessment of the new respiratory change and tolerance of the current plan',
        'Competing risks matter even when one perfusion measurement improves.',
      ],
      [
        'Continue the existing volume plan until all scheduled fluids finish',
        'A planned endpoint does not remove the need to assess a new adverse trend.',
      ],
      [
        'Prioritize the routine nutrition discussion before reporting the breathing change',
        'Nutrition matters, but the new respiratory concern changes the immediate priority.',
      ],
      [
        [
          'Rising breathing effort and support needs',
          'These may indicate an important new problem.',
        ],
        [
          'Cardiac/renal context and recent treatment timeline',
          'These help the team reassess the balance of risks.',
        ],
      ],
      'What improved and what now competes with that improvement?'
    ),
  },
  'skin-systemic': {
    2: row(
      'The person takes immunosuppressive treatment and has new systemic change with little fever.',
      'Which conclusion best handles the competing explanations?',
      [
        'Keep serious infection and other causes under review while escalating the current deterioration',
        'The medicine history and systemic trend are important even with a modest temperature.',
      ],
      [
        'Attribute the new symptoms to autoimmune disease because fever is low',
        'That is an unconfirmed explanation and may miss an infection or another acute cause.',
      ],
      [
        'Wait for a more visible skin change to distinguish the possibilities',
        'The systemic deterioration warrants reassessment before the superficial appearance changes.',
      ],
      [
        [
          'The immunosuppressive medicine history',
          'This changes risk and the interpretation of presentation.',
        ],
        [
          'Current cognition, breathing and circulation compared with baseline',
          'These help establish the current effect rather than assume a cause.',
        ],
      ],
      'What evidence would help distinguish the alternatives without delaying help?'
    ),
  },
  'leg-to-lung': {
    0: row(
      'A person receiving anticoagulant treatment reports a new bleeding symptom.',
      'What should guide the initial response in this version?',
      [
        'Assess the bleeding’s extent, current physiology, exact medicine and relevant timing/results',
        'A small visible finding needs context; neither an automatic treatment change nor automatic dismissal is justified.',
      ],
      [
        'Immediately alter the treatment based only on a small bruise',
        'The drug, severity, results and patient-specific plan need appropriate review.',
      ],
      [
        'Provide routine advice without checking whether bleeding is ongoing',
        'Teaching alone does not establish the severity or physiological effect of the new symptom.',
      ],
      [
        [
          'The severity and persistence of bleeding with current observations',
          'These determine the urgency of review.',
        ],
        [
          'The precise medicine, timing and relevant patient risks',
          'Different treatments and contexts need different interpretations.',
        ],
      ],
      'What finding would change the urgency of this assessment?'
    ),
  },
  'abdomen-turn': {
    1: row(
      'An older adult has a less typical pain pattern and new functional change after an earlier reassuring assessment.',
      'Which reasoning move best fits the changed context?',
      [
        'Reopen the working explanation and compare current findings with the earlier state',
        'Atypical presentation and a new trajectory can reduce confidence in the initial explanation.',
      ],
      [
        'Use the earlier reassuring result as the strongest evidence about the present state',
        'That result describes an earlier moment and may not resolve a new change.',
      ],
      [
        'Require classic localized pain before requesting another review',
        'Atypical presentations can still require urgent reassessment.',
      ],
      [
        [
          'The difference in current function and observations',
          'This is evidence that the earlier state may no longer apply.',
        ],
        [
          'The limits of the earlier assessment and current uncertainty',
          'Knowing what a result does not establish prevents premature closure.',
        ],
      ],
      'Which part of your first explanation needs to be tested again?'
    ),
  },
  'nutrition-context': {
    3: row(
      'Food access differs between work and home while investigation and nutritional review continue.',
      'Which next step best fits this person’s barrier?',
      [
        'Co-design feasible food options and coordinate the current testing/nutrition plan',
        'A usable plan must fit the person’s circumstances and the stage of investigation.',
      ],
      [
        'Use a more detailed version of the same leaflet as the sole response',
        'More information alone does not solve a food-access barrier.',
      ],
      [
        'Treat a difficult work schedule as proof of unwillingness',
        'The reported constraint calls for practical exploration rather than a character judgment.',
      ],
      [
        [
          'The specific work-related food constraint',
          'This identifies the barrier the plan must address.',
        ],
        [
          'The current diagnostic stage and individualized dietary support',
          'This avoids contradictory advice while making care more feasible.',
        ],
      ],
      'What would a realistic next week look like for this person?'
    ),
  },
}
export const evolvingCases: EvolvingCase[] = families.map((family) => ({
  id: family.id,
  title: family.title,
  topic: family.topic,
  summary: family.summary,
  sources: family.sources,
  paths: family.patients.map((patient, pathIndex) => ({
    id: pathIndex === 0 ? 'a' : 'b',
    label: pathIndex === 0 ? 'Initial presentation' : 'Complicating context',
    patient,
    history: family.histories[pathIndex]!,
    frames: family.rows.map((item, index) => {
      const teaching =
        pathIndex === 1
          ? (alternateDecisions[family.id]?.[index] ?? item)
          : item
      const values = family.vitals[pathIndex]![index]!
      const observation: Observation = {
        minute: index * 15,
        hr: values[0],
        bp: values[1],
        rr: values[2],
        temperature: values[3],
        spo2: values[4],
        note:
          pathIndex === 0
            ? item.update
            : `${item.update.split(family.patients[0].split(' ')[0]!).join(patient.split(' ')[0]!)} ${family.alternate[index]!}`,
      }
      return {
        skill: pillars[index]!.id,
        update: observation.note,
        evidence: [
          ...item.support.map((pair) => pair[0]),
          index === 0
            ? family.histories[pathIndex]!
            : family.rows[index - 1]!.update,
        ],
        observation,
        question: choiceQuestion(
          teaching.prompt,
          teaching.choices,
          teaching.reflection
        ),
        complex: evidenceQuestion(
          `Select the TWO elements that best support the current reasoning and plan. ${teaching.prompt}`,
          [
            teaching.support[0][0],
            teaching.support[1][0],
            teaching.choices[1][0],
            teaching.choices[2][0],
          ],
          [
            teaching.support[0][1],
            teaching.support[1][1],
            teaching.choices[1][1],
            teaching.choices[2][1],
          ],
          teaching.reflection
        ),
      }
    }),
  })),
}))
export const reasoningQuestions: ReasoningQuestion[] = families.flatMap(
  (family) =>
    family.rows.map((item, index) => ({
      ...choiceQuestion(item.prompt, item.choices, item.reflection),
      id: `rr-context-${family.id}-${index + 1}`,
      context: item.update,
      topic: family.topic,
      level: (['foundation', 'challenge', 'advanced'] as ReasoningLevel[])[
        Math.floor(index / 2)
      ]!,
      sources: family.sources,
      reviewStatus: 'draft' as const,
    }))
)
