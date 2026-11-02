import type {
  ChoiceDraftV2,
  ClinicalDomainV2,
  DistractorErrorV2,
  QuestionDraftV2,
} from '@/lib/cjis/question-v2'
import type { SourceId } from '@/lib/learning/sources'

// Original authoring drafts. Editorial structure is not psychometric validation or clinical approval.
const right = (
  text: string,
  explanation: string,
  cues: number[]
): ChoiceDraftV2 => ({ text, explanation, cues })
const wrong = (
  text: string,
  explanation: string,
  plausible: string,
  error: DistractorErrorV2,
  cues: number[]
): ChoiceDraftV2 => ({ text, explanation, plausible, error, cues })
type Row = Omit<
  QuestionDraftV2,
  | 'id'
  | 'collectionId'
  | 'domain'
  | 'sources'
  | 'setting'
  | 'options'
  | 'correct'
> & { key: string; choices: QuestionDraftV2['options']; setting?: string }
function group(
  collectionId: string,
  domain: ClinicalDomainV2,
  sources: SourceId[],
  rows: Row[]
): QuestionDraftV2[] {
  return rows.map(
    ({ key, choices, setting = 'Adult acute care', ...row }, index) => {
      const offset = index % 4
      const options = [
        ...choices.slice(offset),
        ...choices.slice(0, offset),
      ] as QuestionDraftV2['options']
      return {
        ...row,
        id: `v2-cv-${key}`,
        collectionId,
        domain,
        sources,
        setting,
        options,
        correct: ((4 - offset) % 4) as QuestionDraftV2['correct'],
      }
    }
  )
}

const coronary = group(
  'acute_mi',
  'cardiovascular',
  ['acs', 'deterioration'],
  [
    {
      key: 'ami-f1',
      topic: 'Possible ischemia without chest pain',
      level: 'foundation',
      scenario:
        'Morgan arrives after developing nausea and jaw pressure while climbing stairs. The discomfort persists at rest. Their skin is cool and sweaty. They describe the sensation as indigestion.',
      cues: [
        'Exertional jaw pressure persisting at rest',
        'Nausea with diaphoresis',
      ],
      question:
        'Which first assessment is most appropriate for possible myocardial ischemia presenting without chest pain?',
      choices: [
        right(
          'Obtain a prompt 12-lead ECG.',
          'The symptom cluster can represent myocardial ischemia and needs early electrical assessment.',
          [0, 1]
        ),
        wrong(
          'Perform a focused abdominal assessment.',
          'Abdominal assessment may contribute later, but does not address possible time-sensitive ischemia.',
          'Nausea suggests a gastrointestinal source.',
          'misprioritization',
          [1]
        ),
        wrong(
          'Assess jaw movement and dental tenderness.',
          'Exertional symptoms and sweating are poorly explained by an isolated dental problem.',
          'Jaw pressure can arise from teeth.',
          'cue_misinterpretation',
          [0]
        ),
        wrong(
          'Complete an orthostatic blood pressure assessment.',
          'Standing the patient does not evaluate the principal ischemic concern and may provoke symptoms.',
          'Cool skin can suggest volume depletion.',
          'misprioritization',
          [1]
        ),
      ],
      reasoning: ['Recognize an ischemic symptom equivalent.'],
      debrief:
        'Recognize ischemic equivalents before assigning a gastrointestinal or musculoskeletal explanation.',
    },
    {
      key: 'ami-f2',
      topic: 'Early troponin interpretation',
      level: 'foundation',
      scenario:
        'Avery reports chest pressure beginning 20 minutes before arrival. The first troponin is below the assay threshold. The initial ECG has no diagnostic ST changes. The clinician is arranging further assessment.',
      cues: [
        'Symptoms began 20 minutes ago',
        'Initial troponin below threshold',
        'Nondiagnostic initial ECG',
      ],
      question:
        'How should a negative troponin sampled 20 minutes after symptom onset affect the ischemia assessment?',
      choices: [
        right(
          'Early ischemia remains possible; serial assessment is needed.',
          'A very early sample and nondiagnostic ECG cannot independently exclude an evolving coronary event.',
          [0, 1, 2]
        ),
        wrong(
          'The results favor stable angina over an acute syndrome.',
          'Stable angina cannot be established from early negative testing during an acute presentation.',
          'Both initial tests look reassuring.',
          'premature_closure',
          [1, 2]
        ),
        wrong(
          'The ECG makes the initial troponin sufficient for discharge.',
          'The ECG does not remove the limitations of an early troponin sample.',
          'Two negative-looking tests seem conclusive.',
          'cue_misinterpretation',
          [0, 1, 2]
        ),
        wrong(
          'Another troponin sample is indicated if the pain intensifies.',
          'Serial testing follows the validated pathway and clinical context, not pain worsening alone.',
          'Pain severity seems a practical trigger for conditional repeat testing.',
          'misprioritization',
          [0, 2]
        ),
      ],
      reasoning: ['Interpret the timing limitation of an initial test.'],
      debrief:
        'An early reassuring result is one observation within a diagnostic pathway, rather than a final exclusion.',
    },
    {
      key: 'ami-f3',
      topic: 'Inferior infarction and right-sided assessment',
      level: 'foundation',
      scenario:
        'Casey has an inferior ST-elevation pattern confirmed by the clinician. Their blood pressure is 88/56 mmHg. Neck veins are visibly elevated. Lung sounds are clear.',
      cues: [
        'Inferior infarction',
        'Hypotension with elevated neck veins',
        'Clear lung fields',
      ],
      question:
        'Which additional cardiac assessment is most relevant to hypotension during an inferior infarction?',
      choices: [
        right(
          'Right-sided leads to assess right ventricular involvement.',
          'Inferior ischemia with this hemodynamic pattern raises concern for right ventricular involvement.',
          [0, 1, 2]
        ),
        wrong(
          'Posterior leads as the sole additional lead set.',
          'Posterior ischemia can accompany inferior events, but these bedside findings specifically raise right ventricular concern.',
          'Inferior and posterior territories may overlap.',
          'cue_misinterpretation',
          [0]
        ),
        wrong(
          'An exercise ECG to assess functional ischemia.',
          'Active infarction and hypotension require acute evaluation rather than exertional testing.',
          'Exercise testing also investigates coronary disease.',
          'misprioritization',
          [0, 1]
        ),
        wrong(
          'A rhythm strip instead of additional spatial leads.',
          'A rhythm strip tracks rhythm but cannot replace the required regional assessment.',
          'Hypotension can reflect an arrhythmia.',
          'misprioritization',
          [1]
        ),
      ],
      reasoning: ['Match the hemodynamic pattern to a focused assessment.'],
      debrief:
        'Recognize when additional lead placement answers a specific question that a standard rhythm strip cannot.',
    },
    {
      key: 'ami-f4',
      topic: 'New congestion after infarction',
      level: 'foundation',
      scenario:
        'Jordan is being observed after a myocardial infarction. They now need to sit upright to breathe comfortably. New bilateral basal crackles are present. A low-pitched sound is heard just after S2 at the apex.',
      cues: [
        'New orthopnea',
        'New basal crackles',
        'Apical sound immediately after S2',
      ],
      question:
        'What does new breathlessness with crackles suggest after an acute infarction?',
      choices: [
        right(
          'Left ventricular dysfunction with pulmonary congestion.',
          'Orthopnea, crackles and an S3-type sound support new congestion after myocardial injury.',
          [0, 1, 2]
        ),
        wrong(
          'Predominantly right ventricular failure without lung involvement.',
          'Isolated right-sided dysfunction does not best explain the new pulmonary findings.',
          'Infarction can affect the right ventricle.',
          'cue_misinterpretation',
          [1]
        ),
        wrong(
          'Pericardial inflammation with a friction rub.',
          'A rub is typically scratchy; the filling sound plus congestion suggests ventricular dysfunction.',
          'Inflammation may follow myocardial injury.',
          'cue_misinterpretation',
          [2]
        ),
        wrong(
          'Bronchospasm causing air trapping and wheeze.',
          'Crackles, orthopnea and an extra filling sound fit congestion better than isolated bronchospasm.',
          'Breathlessness may be respiratory in origin.',
          'premature_closure',
          [0, 1]
        ),
      ],
      reasoning: ['Recognize a congestion pattern.'],
      debrief:
        'Connect heart and lung findings when recognizing early pump dysfunction after infarction.',
    },
    {
      key: 'ami-f5',
      topic: 'Bleeding after coronary intervention',
      level: 'foundation',
      scenario:
        'Taylor returns from a femoral coronary intervention. They report new lower-back discomfort. The blood pressure is 90/58 mmHg. The visible groin dressing is dry.',
      cues: [
        'Recent femoral arterial access',
        'Back discomfort with hypotension',
        'Dry visible access dressing',
      ],
      question:
        'Which complication best explains new back discomfort and hypotension after femoral arterial access?',
      choices: [
        right(
          'Blood loss into a concealed retroperitoneal space.',
          'Bleeding after femoral access can collect internally despite a dry external dressing.',
          [0, 1, 2]
        ),
        wrong(
          'Local access-site discomfort without major blood loss.',
          'Hypotension and back discomfort require evaluation beyond expected superficial access pain.',
          'The external dressing remains dry.',
          'premature_closure',
          [1, 2]
        ),
        wrong(
          'Contrast-associated kidney injury as the immediate explanation.',
          'Kidney injury does not best explain this acute pain and hypotension pattern.',
          'Contrast was used during the procedure.',
          'misprioritization',
          [0, 1]
        ),
        wrong(
          'Muscle strain from lying flat during the procedure.',
          'Positional soreness is possible, but the accompanying hypotension makes bleeding a priority concern.',
          'Prolonged positioning can cause back pain.',
          'cue_misinterpretation',
          [1, 2]
        ),
      ],
      reasoning: ['Recognize a concealed bleeding pattern.'],
      debrief:
        'A dry dressing does not exclude internal blood loss after arterial access.',
    },
    {
      key: 'ami-c1',
      topic: 'Recurrent pain after nondiagnostic testing',
      level: 'challenge',
      scenario:
        'Quinn had a nondiagnostic ECG on arrival with chest discomfort. Thirty minutes later the pressure returns during rest. They are newly diaphoretic and their blood pressure has fallen from 138/82 to 106/68 mmHg. The scheduled repeat troponin is not yet due.',
      cues: [
        'Recurrent pressure at rest',
        'New diaphoresis',
        'Falling blood pressure',
        'Earlier nondiagnostic ECG',
      ],
      question:
        'What should recurrent chest pressure change about the plan after initially nondiagnostic coronary tests?',
      choices: [
        right(
          'Repeat the 12-lead ECG during the recurrent symptoms.',
          'New symptoms and deterioration can reveal evolving ischemic changes before the scheduled blood sample.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Bring the repeat troponin forward as the first reassessment.',
          'Blood sampling contributes, but must not displace immediate reassessment of active electrical ischemia.',
          'A biomarker trend helps diagnose infarction.',
          'misprioritization',
          [0, 3]
        ),
        wrong(
          'Compare the episode with the previous reflux history first.',
          'Prior reflux does not adequately account for diaphoresis and falling pressure during recurrent pain.',
          'Recurrent pain can have a familiar cause.',
          'premature_closure',
          [0, 1, 2]
        ),
        wrong(
          'Repeat orthostatic observations to explain the pressure change.',
          'Provoking posture changes delays assessment of an unstable ischemic symptom pattern.',
          'The blood pressure has fallen.',
          'cue_misinterpretation',
          [2]
        ),
      ],
      reasoning: [
        'Integrate recurrent symptoms with the hemodynamic trend.',
        'Prioritize time-sensitive reassessment.',
      ],
      debrief:
        'Clinical deterioration overrides the reassurance of an earlier ECG and the routine timing of later tests.',
    },
    {
      key: 'ami-c2',
      topic: 'Troponin change in chronic kidney disease',
      level: 'challenge',
      scenario:
        'Drew has chronic kidney disease and previous mildly elevated troponin results. Today exertional chest pressure persists after stopping activity. Serial measurements using the same assay rise substantially from the admission value. New lateral ST depression appears on a repeat ECG.',
      cues: [
        'Chronic kidney disease with baseline elevation',
        'Persistent ischemic-type symptoms',
        'New troponin rise on the same assay',
        'New lateral ST depression',
      ],
      question:
        'How should the serial troponin change be interpreted alongside symptoms in a patient with chronic kidney disease?',
      choices: [
        right(
          'Dynamic myocardial injury with new ischemic evidence.',
          'A meaningful change plus symptoms and ECG evolution warrants urgent coronary assessment despite baseline elevation.',
          [1, 2, 3]
        ),
        wrong(
          'Chronic renal troponin elevation requiring renal review first.',
          'A known baseline does not explain a new biomarker rise accompanied by ischemic changes.',
          'Kidney disease commonly complicates troponin interpretation.',
          'outdated_data',
          [0, 2, 3]
        ),
        wrong(
          'Demand-related injury established by reduced renal clearance.',
          'Reduced clearance alone cannot establish the cause of acute injury or exclude a coronary event.',
          'Chronic disease can produce noncoronary injury.',
          'premature_closure',
          [0, 2]
        ),
        wrong(
          'An isolated ECG abnormality requiring lead replacement first.',
          'Lead verification is useful, but concordant symptoms and biomarker change require escalation rather than dismissal.',
          'Lead position can alter ST appearance.',
          'misprioritization',
          [1, 2, 3]
        ),
      ],
      reasoning: [
        'Distinguish baseline abnormality from an acute trend.',
        'Integrate independent ischemic findings.',
      ],
      debrief:
        'Compare with baseline while giving appropriate weight to new, concordant changes across several assessments.',
    },
    {
      key: 'ami-c3',
      topic: 'Nitrate reassessment with hypotension',
      level: 'challenge',
      scenario:
        'Sam is receiving prescribed anti-ischemic treatment under a monitored protocol. Pressure discomfort is now 2/10 rather than 7/10. Before the next nitrate dose, blood pressure has fallen to 86/54 mmHg and Sam feels faint. The ECG has an inferior infarction pattern.',
      cues: [
        'Pain improved after treatment',
        'Blood pressure now 86/54 mmHg',
        'New presyncope',
        'Inferior infarction pattern',
      ],
      question:
        'Which response best addresses new hypotension and dizziness before another prescribed nitrate dose?',
      choices: [
        right(
          'Withhold the dose and seek immediate hemodynamic reassessment.',
          'New symptomatic hypotension changes medication safety; right ventricular involvement or other causes require assessment.',
          [1, 2, 3]
        ),
        wrong(
          'Repeat the dose to finish relieving the residual discomfort.',
          'Pain relief is not a reason to add vasodilation when perfusion is compromised.',
          'Some ischemic discomfort remains.',
          'misprioritization',
          [0, 1, 2]
        ),
        wrong(
          'Give an antiemetic before repeating the same nitrate dose.',
          'Treating associated symptoms would not correct the new hypotension or reassess nitrate safety.',
          'Faintness may accompany nausea during infarction.',
          'cue_misinterpretation',
          [1, 2]
        ),
        wrong(
          'Complete a standing blood pressure check before deciding.',
          'Provoking orthostasis is unsafe and unnecessary with symptomatic resting hypotension.',
          'A postural component could explain faintness.',
          'misprioritization',
          [1, 2]
        ),
      ],
      reasoning: [
        'Compare symptom improvement with deteriorating perfusion.',
        'Reprioritize medication safety.',
      ],
      debrief:
        'An intervention can improve one symptom while making the next scheduled dose unsafe.',
    },
    {
      key: 'ami-c4',
      topic: 'Post-infarction rhythm and perfusion',
      level: 'challenge',
      scenario:
        'Lee develops a regular broad-complex tachycardia during post-infarction monitoring. They still have a palpable pulse. Over two minutes blood pressure falls to 78/46 mmHg and they become confused. The defibrillator and emergency team are at the bedside.',
      cues: [
        'Regular broad-complex tachycardia',
        'Palpable pulse',
        'New hypotension',
        'New confusion',
      ],
      question:
        'Which finding should determine the urgency of the new post-infarction rhythm change?',
      choices: [
        right(
          'Synchronized cardioversion for unstable tachycardia with a pulse.',
          'Tachycardia with a pulse and impaired perfusion requires the unstable tachycardia pathway.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Unsynchronized defibrillation for pulseless ventricular tachycardia.',
          'The documented pulse distinguishes this presentation from the pulseless arrest pathway.',
          'The rhythm may be ventricular tachycardia.',
          'cue_misinterpretation',
          [0, 1]
        ),
        wrong(
          'A stable tachycardia medication trial before electrical treatment.',
          'Worsening hypotension and confusion make a stable pathway inappropriate.',
          'Medication can treat some wide-complex rhythms.',
          'misprioritization',
          [2, 3]
        ),
        wrong(
          'Transcutaneous pacing for a low cardiac output state.',
          'Pacing addresses selected bradyarrhythmias rather than this rapid rhythm.',
          'The patient has poor perfusion.',
          'cue_misinterpretation',
          [0, 2]
        ),
      ],
      reasoning: [
        'Combine pulse status with signs of instability.',
        'Select the appropriate emergency pathway.',
      ],
      debrief:
        'The same rhythm family can require different pathways according to pulse and perfusion.',
    },
    {
      key: 'ami-c5',
      topic: 'Concealed loss versus access-site appearance',
      level: 'challenge',
      scenario:
        'Reese was stable after femoral intervention two hours ago. Their pulse has increased from 76 to 112/min and blood pressure has fallen from 128/76 to 94/60 mmHg. New flank pain accompanies a hemoglobin fall. There is no expanding groin hematoma.',
      cues: [
        'Recent femoral intervention',
        'Tachycardia with falling blood pressure',
        'New flank pain',
        'Hemoglobin fall despite quiet groin site',
      ],
      question:
        'What should falling pressure and flank discomfort trigger despite a dry arterial-access dressing?',
      choices: [
        right(
          'Escalate for concealed hemorrhage assessment and monitored support.',
          'Concordant pain, perfusion and hemoglobin trends warrant urgent assessment of internal access-related bleeding.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Apply additional groin pressure as the sole initial response.',
          'A quiet superficial site does not localize or control a possible retroperitoneal bleed.',
          'Compression treats many access-site bleeds.',
          'cue_misinterpretation',
          [0, 3]
        ),
        wrong(
          'Treat the flank pain and reassess after analgesia takes effect.',
          'Analgesia may be appropriate alongside assessment, but must not postpone evaluation of shock.',
          'Pain can drive tachycardia.',
          'misprioritization',
          [1, 2]
        ),
        wrong(
          'Request renal investigations before the hemorrhage review.',
          'Kidney complications do not explain the full acute blood-loss pattern as well.',
          'Contrast exposure and flank pain suggest renal causes.',
          'misprioritization',
          [1, 2, 3]
        ),
      ],
      reasoning: [
        'Integrate change across perfusion, symptoms and laboratory findings.',
        'Prioritize a concealed source.',
      ],
      debrief:
        'Investigate a coherent deterioration trend even when the most visible procedural site appears reassuring.',
    },
    {
      key: 'ami-a1',
      topic: 'Mechanical complication despite less chest pain',
      level: 'advanced',
      scenario:
        'Three days after an infarction, Alex reports less chest pain than yesterday. Over 15 minutes they develop severe dyspnea and cool extremities. Blood pressure falls to 84/52 mmHg and oxygen saturation falls despite supplemental oxygen. A new systolic apical murmur is faint rather than loud. The previous echocardiogram showed only mild mitral regurgitation.',
      cues: [
        'Recent infarction',
        'Abrupt severe dyspnea',
        'Hypotension with cool extremities',
        'Worsening oxygenation',
        'New faint apical systolic murmur',
        'Earlier echo showed mild regurgitation',
        'Chest pain is less severe',
      ],
      question:
        'Which complication should lead the reassessment of new pulmonary edema and hypotension despite less infarction pain?',
      choices: [
        right(
          'Request emergency echocardiography and mechanical-complication review.',
          'Acute regurgitation or another mechanical lesion can produce shock despite a quiet murmur and less pain.',
          [0, 1, 2, 3, 4]
        ),
        wrong(
          'Treat recurrent ischemia first and repeat imaging if pain returns.',
          'Mechanical complications can deteriorate without increasing ischemic pain; imaging should not depend on pain recurrence.',
          'The original diagnosis was myocardial infarction.',
          'premature_closure',
          [0, 6]
        ),
        wrong(
          'Treat fluid overload and use murmur intensity to judge urgency.',
          'Low forward flow or rapid pressure equalization can make severe acute regurgitation surprisingly quiet.',
          'Congestion suggests excess volume and murmurs can be graded.',
          'cue_misinterpretation',
          [1, 3, 4]
        ),
        wrong(
          'Use the recent echo to guide routine heart-failure reassessment.',
          'An earlier echo cannot exclude a new structural event during abrupt shock.',
          'Recent imaging documented only mild valve disease.',
          'outdated_data',
          [2, 5]
        ),
      ],
      reasoning: [
        'Reconcile reduced pain and a quiet murmur with acute shock.',
        'Anticipate a new structural cause and obtain urgent imaging.',
      ],
      conflict:
        'Less pain and a previously mild lesion conflict with abrupt pulmonary and circulatory collapse.',
      anticipation:
        'Prepare for rapidly worsening oxygenation and definitive management if acute valve or septal injury is found.',
      uncertainty:
        'Auscultation alone does not establish the mechanical lesion or its severity.',
      debrief:
        'Evaluate a changed clinical trajectory instead of using pain severity or murmur loudness as a proxy for risk.',
    },
    {
      key: 'ami-a2',
      topic: 'Persistent shock after a right ventricular event',
      level: 'advanced',
      scenario:
        'Pat has inferior infarction with right ventricular involvement confirmed by the team. A small prescribed fluid challenge raises blood pressure briefly from 82/50 to 94/58 mmHg. Ten minutes later it is 84/52 mmHg with persistent oliguria. Neck venous distension has increased and new basal crackles are present. Oxygen need is rising, although the earlier lungs were clear.',
      cues: [
        'Confirmed right ventricular involvement',
        'Only transient response to fluid',
        'Persistent oliguria and hypotension',
        'Increasing neck venous distension',
        'New basal crackles',
        'Increasing oxygen requirement',
      ],
      question:
        'Which plan best distinguishes inadequate filling from pump failure after the right ventricular event?',
      choices: [
        right(
          'Reassess ventricular function and congestion before further fluid.',
          'A transient response does not establish ongoing fluid responsiveness; new congestion changes the balance of benefit and harm.',
          [1, 2, 3, 4, 5]
        ),
        wrong(
          'Repeat the same fluid challenge because the first raised pressure.',
          'The new congestion means the earlier response cannot safely justify repetitive unassessed fluid.',
          'Right ventricular infarction can be preload sensitive.',
          'outdated_data',
          [0, 1, 4]
        ),
        wrong(
          'Prioritize diuresis using the crackles as proof of left-sided overload.',
          'Crackles warrant action, but shock with mixed ventricular effects needs integrated reassessment before choosing fluid removal.',
          'Crackles and venous distension suggest congestion.',
          'premature_closure',
          [2, 3, 4]
        ),
        wrong(
          'Increase anti-ischemic vasodilation to reduce the filling pressures.',
          'Hypotension and oliguria make additional vasodilation hazardous without urgent hemodynamic review.',
          'Rising filling pressures can worsen pulmonary symptoms.',
          'misprioritization',
          [2, 3, 5]
        ),
      ],
      reasoning: [
        'Compare a transient intervention response with subsequent organ findings.',
        'Anticipate fluid intolerance and identify the next assessment needed.',
      ],
      conflict:
        'Initial fluid benefit conflicts with later congestion and persistent hypoperfusion.',
      anticipation:
        'Escalate persistent shock and increasing respiratory support needs while further treatment is individualized.',
      uncertainty:
        'Neither the initial pressure rise nor crackles alone identify the current optimal preload or shock mechanism.',
      debrief:
        'Fluid responsiveness is time dependent; reassessment must include both forward perfusion and treatment tolerance.',
    },
    {
      key: 'ami-a3',
      topic: 'Ischemic-looking symptoms with dissection clues',
      level: 'advanced',
      scenario:
        'Robin arrives with chest pain and an inferior ST-elevation pattern. They describe pain that was maximal immediately and extends between the shoulder blades. Blood pressure differs substantially between arms, and one radial pulse is weaker. A new diastolic murmur is heard. Coronary antithrombotic orders are being prepared but have not been administered.',
      cues: [
        'Inferior ST elevation',
        'Abrupt maximal-onset chest pain',
        'Pain extending to the back',
        'Interarm pressure difference',
        'Asymmetric radial pulses',
        'New diastolic murmur',
        'Antithrombotics not yet given',
      ],
      question:
        'What should the aortic warning signs change about the pending antithrombotic plan despite ST elevation?',
      choices: [
        right(
          'Immediately flag suspected aortic pathology before antithrombotic administration.',
          'Aortic dissection can compromise coronary flow; these additional findings require urgent team review of imaging and medication safety.',
          [0, 1, 2, 3, 4, 5, 6]
        ),
        wrong(
          'Proceed with the coronary orders because ST elevation settles the diagnosis.',
          'ST elevation does not exclude dissection-related coronary involvement, where antithrombotic exposure may increase harm.',
          'ST elevation normally triggers urgent coronary care.',
          'premature_closure',
          [0, 6]
        ),
        wrong(
          'Recheck both arm pressures after the first antithrombotic dose.',
          'Verification is reasonable, but should occur while the concerning pattern is escalated before irreversible medication exposure.',
          'Interarm readings can reflect measurement differences.',
          'misprioritization',
          [3, 6]
        ),
        wrong(
          'Prioritize treatment of the murmur as isolated aortic regurgitation.',
          'The murmur needs explanation within the abrupt pain and pulse findings, rather than an isolated valve label.',
          'Diastolic murmurs can indicate aortic valve disease.',
          'cue_misinterpretation',
          [1, 4, 5]
        ),
      ],
      reasoning: [
        'Recognize findings inconsistent with an isolated coronary explanation.',
        'Anticipate treatment-related harm while urgent diagnosis is clarified.',
      ],
      conflict:
        'A coronary ECG pattern coexists with strong acute aortic warning signs.',
      anticipation:
        'Prepare for urgent aortic imaging and specialist management while monitoring perfusion.',
      uncertainty:
        'The ECG does not determine whether coronary ischemia is primary or secondary to aortic disease.',
      debrief:
        'Advanced judgment includes checking whether the usual pathway could worsen a plausible competing emergency.',
    },
    {
      key: 'ami-a4',
      topic: 'Deterioration despite successful reperfusion',
      level: 'advanced',
      scenario:
        'Riley returns after coronary reperfusion with reduced ST elevation. They report less chest pressure but remain lightheaded. During the next hour they become cool and confused, urine output is 10 mL, and blood pressure falls to 86/56 mmHg. Lung crackles increase and the pulse pressure narrows. The catheterization report documented a patent treated artery.',
      cues: [
        'Improved ST elevation after reperfusion',
        'Minimal chest discomfort',
        'Cool confusion',
        'Urine output 10 mL in an hour',
        'Blood pressure 86/56 mmHg with narrow pulse pressure',
        'Increasing crackles',
        'Patent treated artery',
      ],
      question:
        'Which reassessment priority best evaluates Riley’s worsening perfusion despite reduced pressure and improved ST elevation?',
      choices: [
        right(
          'Prioritize perfusion reassessment and urgent cardiac imaging for pump or mechanical failure.',
          'Successful reperfusion does not exclude pump failure or a new mechanical complication causing ongoing organ hypoperfusion. Current cerebral, renal, circulatory and pulmonary trends require urgent cardiac reassessment despite less pain.',
          [2, 3, 4, 5]
        ),
        wrong(
          'Prioritize repeat coronary biomarkers and ECG trends to assess residual myocardial injury.',
          'Coronary surveillance remains useful, but biomarker and ECG trends cannot adequately evaluate the current low-output and congestive pattern. Bedside shock assessment and cardiac imaging should not be displaced by repeating the reperfusion endpoints.',
          'Serial ECG and biomarker trends are familiar objective measures after an acute coronary event.',
          'misprioritization',
          [0, 2, 3, 4, 5]
        ),
        wrong(
          'Prioritize renal-function testing and contrast-exposure review to explain the new low output.',
          'Contrast exposure deserves review, but isolated kidney injury does not explain the rapid combination of confusion, narrow pulse pressure and increasing congestion. The whole perfusion pattern takes priority.',
          'Oliguria follows a contrast procedure and may draw attention toward a renal complication.',
          'premature_closure',
          [2, 3, 4, 5, 6]
        ),
        wrong(
          'Prioritize volume-loss assessment and a fluid trial to explain the hypotension and oliguria.',
          'Volume loss is a possible contributor, but increasing crackles make unassessed additional fluid risky. The pattern requires urgent evaluation of cardiac function and fluid tolerance rather than assuming a volume-responsive mechanism.',
          'Hypotension and oliguria commonly suggest inadequate circulating volume after a procedure.',
          'cue_misinterpretation',
          [3, 4, 5]
        ),
      ],
      reasoning: [
        'Separate successful artery treatment from whole-patient recovery.',
        'Evaluate a shock pattern and anticipate cardiac complications.',
      ],
      conflict:
        'Reassuring procedural and ECG results conflict with worsening systemic and pulmonary findings.',
      anticipation:
        'Identify pump or mechanical failure before further respiratory or circulatory collapse.',
      uncertainty:
        'The current mechanism of shock is not established by artery patency or urine output alone.',
      debrief:
        'Evaluate the patient response across organs rather than treating a technically successful procedure as the final outcome.',
    },
    {
      key: 'ami-a5',
      topic: 'Bleeding risk during antithrombotic treatment',
      level: 'advanced',
      scenario:
        'Chris is receiving antithrombotic treatment after coronary intervention. Six hours later blood pressure is 92/58 mmHg, down from 124/74, with a pulse of 108/min. They have new abdominal fullness and flank pain, but the access dressing is dry. Hemoglobin is nearly unchanged from the immediate postprocedure sample. Chest pressure has also recurred without a new ECG change.',
      cues: [
        'Recent intervention with antithrombotic exposure',
        'Falling blood pressure with tachycardia',
        'New abdominal fullness',
        'New flank pain',
        'Dry dressing',
        'Initially little hemoglobin change',
        'Recurrent pressure without new ECG change',
      ],
      question:
        'Which interpretation best integrates recurrent chest pressure with new flank pain and falling pressure after intervention?',
      choices: [
        right(
          'Possible concealed hemorrhage with secondary ischemia requires urgent review.',
          'Acute loss may precede a measured hemoglobin fall; hypoperfusion can also aggravate myocardial oxygen imbalance.',
          [0, 1, 2, 3, 5, 6]
        ),
        wrong(
          'Recurrent coronary occlusion is established and antithrombotics should increase.',
          'Recurrent pain warrants coronary assessment, but does not establish occlusion or make escalating bleeding exposure safe.',
          'The patient recently had an acute coronary event.',
          'premature_closure',
          [0, 6]
        ),
        wrong(
          'Stable hemoglobin makes medication-related vasodilation the leading concern.',
          'A single early hemoglobin result cannot exclude acute internal loss with this clinical pattern.',
          'The latest laboratory result seems stable.',
          'cue_misinterpretation',
          [1, 3, 5]
        ),
        wrong(
          'Use the dry groin site to defer bleeding assessment pending the next sample.',
          'Retroperitoneal bleeding may be concealed; serial bedside deterioration should prompt action before another routine sample.',
          'Access-site bleeding often produces visible swelling.',
          'outdated_data',
          [1, 4, 5]
        ),
      ],
      reasoning: [
        'Reconcile early laboratory reassurance with a concealed-loss pattern.',
        'Consider secondary ischemia and anticipate harm from treatment escalation.',
      ],
      conflict:
        'Recurrent chest discomfort suggests ischemia while flank findings and falling pressure suggest bleeding; early hemoglobin appears reassuring.',
      anticipation:
        'Prepare for hemorrhage investigation and coordinated medication decisions while maintaining coronary surveillance.',
      uncertainty:
        'Neither a stable early hemoglobin nor a nondynamic ECG excludes a serious evolving complication.',
      debrief:
        'Competing coronary and bleeding risks require a whole-pattern reassessment before increasing a treatment that could worsen the alternative.',
    },
  ]
)

const hypertension = group(
  'cv_hypertensive_crises',
  'cardiovascular',
  ['deterioration', 'stroke', 'aki', 'acs'],
  [
    {
      key: 'htn-f1',
      topic: 'Confirming a markedly elevated reading',
      level: 'foundation',
      scenario:
        'Blake has a triage blood pressure of 202/112 mmHg. The cuff is visibly too small for their arm. They report no acute chest, breathing, visual or neurologic symptoms. A focused assessment is being arranged.',
      cues: [
        'Markedly elevated initial pressure',
        'Cuff too small',
        'No reported acute organ symptoms',
      ],
      question:
        'What is the best next assessment of a markedly elevated pressure without acute symptoms?',
      choices: [
        right(
          'Repeat with a correctly sized cuff and supported positioning.',
          'Measurement quality should be corrected while clinical assessment checks for acute organ injury.',
          [0, 1, 2]
        ),
        wrong(
          'Use the first value because high readings require immediate treatment.',
          'A markedly high number requires attention, but measurement error should not become the treatment baseline.',
          'The value is substantially elevated.',
          'cue_misinterpretation',
          [0, 1]
        ),
        wrong(
          'Average the small-cuff reading with a second small-cuff reading.',
          'Repeated systematic cuff error does not produce a reliable baseline.',
          'Averaging repeated readings often improves accuracy.',
          'cue_misinterpretation',
          [1]
        ),
        wrong(
          'Measure immediately after walking to assess the functional pressure.',
          'Activity can further distort the resting measurement needed for this assessment.',
          'Activity can reveal cardiovascular limitation.',
          'misprioritization',
          [0, 2]
        ),
      ],
      reasoning: ['Recognize and correct a measurement error.'],
      debrief:
        'Verify the measurement while assessing the person; the numerical value alone does not define a hypertensive emergency.',
    },
    {
      key: 'htn-f2',
      topic: 'Acute organ injury with severe hypertension',
      level: 'foundation',
      scenario:
        'Rowan has a confirmed blood pressure of 214/122 mmHg. They are newly confused. Their partner says they were oriented an hour earlier. No sedating medication has been given.',
      cues: [
        'Confirmed severe hypertension',
        'New confusion from baseline',
        'No sedative explanation',
      ],
      question:
        'Which finding most strongly indicates acute organ injury in this severe-hypertension presentation?',
      choices: [
        right(
          'The acute change in cerebral function.',
          'New neurologic dysfunction raises concern for acute organ injury in the setting of severe hypertension.',
          [0, 1]
        ),
        wrong(
          'The likelihood of longstanding poorly controlled hypertension.',
          'Chronic hypertension adds risk but does not establish the acute emergency component.',
          'The pressure is very high.',
          'cue_misinterpretation',
          [0]
        ),
        wrong(
          'The need to establish the usual home medication schedule.',
          'Medication history matters but must not displace urgent evaluation of new neurologic dysfunction.',
          'Missed medication may explain hypertension.',
          'misprioritization',
          [0, 1]
        ),
        wrong(
          'The possibility that anxiety raised the initial reading.',
          'A confirmed reading with new confusion should not be assigned to anxiety without urgent assessment.',
          'Acute-care anxiety can elevate pressure.',
          'premature_closure',
          [0, 1]
        ),
      ],
      reasoning: ['Recognize acute target-organ dysfunction.'],
      debrief:
        'Urgency depends on the acute organ findings as well as the measured blood pressure.',
    },
    {
      key: 'htn-f3',
      topic: 'Severe hypertension with pulmonary symptoms',
      level: 'foundation',
      scenario:
        'Ellis presents with a blood pressure of 218/116 mmHg. They cannot lie flat because of breathlessness. Bilateral crackles are present. The clinician is at the bedside.',
      cues: ['Severe hypertension', 'Orthopnea', 'Bilateral crackles'],
      question:
        'Which organ complication should lead assessment of severe hypertension with new pulmonary symptoms?',
      choices: [
        right(
          'Possible acute heart failure with pulmonary edema.',
          'Orthopnea and crackles with severe hypertension raise concern for acute pulmonary congestion.',
          [0, 1, 2]
        ),
        wrong(
          'Isolated bronchospasm as the likely cause of breathlessness.',
          'Crackles and orthopnea fit congestion better than isolated bronchospasm.',
          'Breathing complaints often arise from airway disease.',
          'cue_misinterpretation',
          [1, 2]
        ),
        wrong(
          'Chronic peripheral fluid retention without acute lung involvement.',
          'The current respiratory findings indicate an acute pulmonary problem, not peripheral edema alone.',
          'Hypertension commonly accompanies chronic heart disease.',
          'premature_closure',
          [0, 1, 2]
        ),
        wrong(
          'Anxiety-related hyperventilation causing the elevated pressure.',
          'Objective crackles and positional breathlessness need an organ-based assessment.',
          'Distress can raise breathing rate and pressure.',
          'premature_closure',
          [0, 1, 2]
        ),
      ],
      reasoning: ['Recognize the pulmonary congestion pattern.'],
      debrief:
        'Use objective respiratory findings to identify a possible acute hypertensive cardiac complication.',
    },
    {
      key: 'htn-f4',
      topic: 'Severe hypertension with focal deficit',
      level: 'foundation',
      scenario:
        'Cameron has a blood pressure of 206/110 mmHg. New right-arm weakness began while eating breakfast. Their speech is now slurred. The exact last-known-well time has not been recorded.',
      cues: [
        'New unilateral weakness',
        'New slurred speech',
        'Last-known-well not recorded',
      ],
      question:
        'What should the new focal deficit change about the response to the elevated pressure?',
      choices: [
        right(
          'The last time the patient was known to be neurologically normal.',
          'Last-known-well supports urgent stroke treatment decisions; discovery time may be different.',
          [0, 1, 2]
        ),
        wrong(
          'The time of the highest blood pressure recorded this week.',
          'Prior pressure history is useful later but does not establish the acute neurologic treatment timeline.',
          'The current pressure is markedly elevated.',
          'misprioritization',
          [0, 1]
        ),
        wrong(
          'The time the patient first noticed feeling generally unwell.',
          'A nonspecific symptom time is not necessarily the last documented normal neurologic state.',
          'Patients may recall illness before focal symptoms.',
          'cue_misinterpretation',
          [2]
        ),
        wrong(
          'The usual time of the morning antihypertensive medication.',
          'Medication timing does not replace the time needed for urgent stroke evaluation.',
          'A missed dose may contribute to hypertension.',
          'misprioritization',
          [0, 1, 2]
        ),
      ],
      reasoning: ['Identify the time datum required by a stroke pathway.'],
      debrief:
        'Record a clinically meaningful neurologic timeline while the emergency assessment proceeds.',
    },
    {
      key: 'htn-f5',
      topic: 'Kidney findings during severe hypertension',
      level: 'foundation',
      scenario:
        'Jamie is assessed for a confirmed blood pressure of 210/118 mmHg. Their creatinine is substantially above a documented recent baseline. Urine output has decreased today. There is no known chronic dialysis requirement.',
      cues: [
        'Severe hypertension',
        'New creatinine rise from baseline',
        'Reduced urine output',
      ],
      question:
        'How should new renal findings affect assessment of the severe hypertension?',
      choices: [
        right(
          'Possible acute renal organ injury accompanying the hypertension.',
          'A new kidney-function change with oliguria raises concern for acute organ dysfunction.',
          [0, 1, 2]
        ),
        wrong(
          'Expected chronic hypertensive kidney damage without an acute change.',
          'The documented rise from a recent baseline makes chronic disease alone insufficient.',
          'Longstanding hypertension can damage kidneys.',
          'outdated_data',
          [1, 2]
        ),
        wrong(
          'Normal variation caused by the high blood pressure reading.',
          'A substantial baseline change plus oliguria should not be treated as routine laboratory variation.',
          'Single laboratory results can fluctuate.',
          'cue_misinterpretation',
          [1, 2]
        ),
        wrong(
          'An isolated urinary problem unrelated to cardiovascular assessment.',
          'Other renal causes need evaluation, but the concurrent severe hypertension requires integrated organ assessment.',
          'Oliguria may have a urinary cause.',
          'premature_closure',
          [0, 2]
        ),
      ],
      reasoning: ['Recognize a change from renal baseline.'],
      debrief:
        'A baseline comparison helps distinguish possible acute organ injury from a chronic diagnosis.',
    },
    {
      key: 'htn-c1',
      topic: 'New deficit during blood pressure treatment',
      level: 'challenge',
      scenario:
        'Dakota is receiving titrated treatment for a hypertensive emergency. Over 20 minutes blood pressure falls from 224/124 to 154/86 mmHg. They develop new left-arm weakness and difficulty speaking. They were conversing normally before treatment.',
      cues: [
        'Active titrated pressure treatment',
        'Substantial pressure fall in 20 minutes',
        'New focal weakness',
        'New speech difficulty',
      ],
      question:
        'What should the new neurological deficit change about the ongoing pressure-lowering plan?',
      choices: [
        right(
          'Immediately escalate the new deficit and review the pressure target.',
          'A new neurologic deficit needs urgent stroke assessment and review for treatment-associated perfusion compromise.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Continue toward a normal pressure before reassessing neurologic function.',
          'Achieving a number must not override new organ dysfunction during treatment.',
          'The presenting pressure was dangerously high.',
          'misprioritization',
          [1, 2, 3]
        ),
        wrong(
          'Treat the weakness as expected fatigue after the pressure improves.',
          'A focal change and language disturbance are not explained by generalized fatigue.',
          'Patients may feel tired during treatment.',
          'cue_misinterpretation',
          [2, 3]
        ),
        wrong(
          'Repeat the medication history before notifying the stroke team.',
          'History can be gathered in parallel, but must not delay time-sensitive assessment of a new deficit.',
          'Medication exposure may explain the pressure fall.',
          'misprioritization',
          [0, 2, 3]
        ),
      ],
      reasoning: [
        'Link treatment timing with a new organ finding.',
        'Prioritize reassessment over numerical completion.',
      ],
      debrief:
        'A falling blood pressure is not a successful outcome if cerebral function is worsening.',
    },
    {
      key: 'htn-c2',
      topic: 'Persistent respiratory distress despite lower pressure',
      level: 'challenge',
      scenario:
        'Rory is treated for severe hypertension with acute pulmonary edema. Pressure falls from 220/120 to 178/96 mmHg over the monitored interval. Their breathing rate rises from 24 to 34/min and oxygen need increases. They are becoming too breathless to finish sentences.',
      cues: [
        'Pressure improving during treatment',
        'Respiratory rate rising',
        'Increasing oxygen requirement',
        'Speech limited by dyspnea',
      ],
      question:
        'Which assessment best evaluates persistent respiratory distress after the pressure has decreased?',
      choices: [
        right(
          'Escalate respiratory support assessment while reviewing cardiac treatment.',
          'The organ response is worsening despite a better pressure, requiring prompt respiratory and hemodynamic reassessment.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Use the pressure reduction to confirm adequate emergency control.',
          'Pressure is only one endpoint; worsening work of breathing indicates persistent organ compromise.',
          'The treatment achieved a substantial numerical change.',
          'cue_misinterpretation',
          [0, 1, 3]
        ),
        wrong(
          'Prioritize a fluid bolus to prevent hypotension from further treatment.',
          'Rising oxygen needs with pulmonary edema do not justify routine added volume.',
          'Rapid pressure treatment can reduce perfusion.',
          'misprioritization',
          [0, 2]
        ),
        wrong(
          'Give an anxiolytic first to assess the contribution of distress.',
          'Anxiety may accompany respiratory failure, but sedation must not delay assessment of worsening ventilation and oxygenation.',
          'Distress can amplify breathlessness.',
          'premature_closure',
          [1, 3]
        ),
      ],
      reasoning: [
        'Compare blood pressure response with respiratory trends.',
        'Prioritize the deteriorating organ system.',
      ],
      debrief:
        'Measure success by organ recovery and treatment tolerance rather than the blood pressure trend alone.',
    },
    {
      key: 'htn-c3',
      topic: 'Reversible drivers of asymptomatic severe hypertension',
      level: 'challenge',
      scenario:
        'Harper has repeated correctly measured pressures near 192/108 mmHg after surgery. Focused neurologic, cardiac and respiratory assessments show no acute organ findings. Their bladder scan shows marked urinary retention and pain is 8/10. Earlier ward pressures were near their usual baseline.',
      cues: [
        'Repeated severe pressure elevation',
        'No current acute organ findings',
        'Marked urinary retention',
        'Severe postoperative pain',
        'Earlier baseline pressure',
      ],
      question:
        'Which plan best addresses reversible contributors before escalating treatment of asymptomatic severe hypertension?',
      choices: [
        right(
          'Treat retention and pain under orders, then reassess pressure and organs.',
          'Addressing evident reversible drivers with ongoing surveillance avoids reflex treatment of the number alone.',
          [1, 2, 3, 4]
        ),
        wrong(
          'Request rapid intravenous pressure reduction before addressing discomfort.',
          'Without acute organ findings, reflex rapid lowering may add risk while leaving clear drivers untreated.',
          'The repeated pressure remains very high.',
          'misprioritization',
          [0, 1, 2, 3]
        ),
        wrong(
          'Restart every home pressure medication immediately without reconciliation.',
          'Medication decisions need reconciliation and clinical review, especially during postoperative physiologic change.',
          'A missed home regimen may contribute.',
          'premature_closure',
          [0, 4]
        ),
        wrong(
          'Attribute the elevation to pain and stop organ surveillance.',
          'Plausible drivers do not eliminate the need for reassessment or detection of emerging injury.',
          'Pain and retention explain the timing.',
          'premature_closure',
          [1, 2, 3]
        ),
      ],
      reasoning: [
        'Integrate absent acute organ findings with reversible triggers.',
        'Select treatment and reassessment in the correct sequence.',
      ],
      debrief:
        'Correct a plausible driver while continuing surveillance; explanation of a high reading does not replace evaluation.',
    },
    {
      key: 'htn-c4',
      topic: 'Aortic warning pattern during hypertension',
      level: 'challenge',
      scenario:
        'Finley reports chest pain beginning abruptly at maximum intensity. Blood pressure is 226/118 mmHg. The pain now extends to the upper back and the left radial pulse is weaker than the right. The initial ECG does not establish an acute coronary occlusion.',
      cues: [
        'Abrupt maximal chest pain',
        'Severe hypertension',
        'Pain extending to upper back',
        'Asymmetric radial pulses',
      ],
      question:
        'Which new finding should redirect the hypertension assessment toward possible acute aortic disease?',
      choices: [
        right(
          'Possible acute aortic syndrome requiring condition-specific assessment.',
          'Abrupt chest-back pain with pulse asymmetry raises aortic concern and changes emergency management priorities.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Primary coronary ischemia with incidental arm-pulse variation.',
          'Coronary disease remains possible, but does not adequately explain the combined aortic warning pattern.',
          'Chest pain and hypertension can accompany ischemia.',
          'premature_closure',
          [0, 1, 3]
        ),
        wrong(
          'Musculoskeletal back pain producing reactive hypertension.',
          'Pulse asymmetry and abrupt maximal pain require evaluation before a benign pain explanation.',
          'Back pain can cause a marked pressure rise.',
          'cue_misinterpretation',
          [0, 2, 3]
        ),
        wrong(
          'Chronic peripheral arterial disease as the principal acute issue.',
          'Chronic pulse differences may occur, but the concurrent acute pain syndrome requires urgent aortic assessment.',
          'An asymmetric pulse can reflect chronic disease.',
          'outdated_data',
          [0, 3]
        ),
      ],
      reasoning: [
        'Integrate pain timing, distribution and vascular findings.',
        'Prioritize the dangerous unifying explanation.',
      ],
      debrief:
        'The nature and onset of pain can make a severe-pressure presentation require a specific emergency pathway.',
    },
    {
      key: 'htn-c5',
      topic: 'Renal response during pressure reduction',
      level: 'challenge',
      scenario:
        'Skyler is receiving monitored therapy for hypertensive renal injury. Pressure has decreased from 218/120 to 168/94 mmHg. Urine output falls further, and new dizziness appears when they sit upright. Their morning renal results were abnormal but stable compared with yesterday.',
      cues: [
        'Active pressure-lowering therapy',
        'Substantial pressure decrease',
        'Further urine-output reduction',
        'New positional dizziness',
        'Earlier stable renal results',
      ],
      question:
        'Which reassessment best evaluates falling urine output and dizziness during pressure-lowering treatment?',
      choices: [
        right(
          'Review current perfusion, medication effect and renal trend together.',
          'New symptoms and oliguria during treatment require assessment of tolerance, not reliance on earlier laboratory stability.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Use the morning creatinine to defer assessment of the lower output.',
          'Laboratory values lag current physiology; a new bedside trend requires review.',
          'The latest renal blood tests were stable.',
          'outdated_data',
          [2, 4]
        ),
        wrong(
          'Increase treatment until the pressure reaches the outpatient target.',
          'Acute organ injury requires an individualized monitored target and attention to worsening perfusion.',
          'The measured pressure is still above normal.',
          'misprioritization',
          [1, 2, 3]
        ),
        wrong(
          'Use positional dizziness to select a fluid bolus.',
          'Fluid may or may not help; pressure therapy, congestion and renal context require review first.',
          'Dizziness can reflect volume depletion.',
          'premature_closure',
          [2, 3]
        ),
      ],
      reasoning: [
        'Connect new organ findings with treatment timing.',
        'Reassess present physiology rather than earlier tests.',
      ],
      debrief:
        'Renal output and symptoms can signal treatment intolerance before a scheduled creatinine result changes.',
    },
    {
      key: 'htn-a1',
      topic: 'Neurologic deterioration despite a safer-looking pressure',
      level: 'advanced',
      scenario:
        'Emerson has longstanding severe hypertension and is being treated for acute pulmonary edema. Blood pressure falls from 238/130 to 150/82 mmHg during a short monitored interval. Crackles and breathing improve, but the patient becomes drowsy with new unilateral weakness. Glucose is normal and oxygen saturation is now adequate. No sedative was administered.',
      cues: [
        'Longstanding severe hypertension',
        'Large pressure reduction',
        'Pulmonary symptoms improving',
        'New drowsiness and unilateral weakness',
        'Normal glucose',
        'Adequate oxygenation without sedation',
      ],
      question:
        'How should new unilateral weakness change the plan despite improved pulmonary edema and pressure?',
      choices: [
        right(
          'Possible cerebral injury or hypoperfusion needs emergency neurologic review.',
          'Improving lungs do not establish cerebral safety; a new deficit requires stroke assessment and review of the lowering strategy.',
          [1, 2, 3, 4, 5]
        ),
        wrong(
          'Expected recovery fatigue is most likely because oxygenation improved.',
          'Focal weakness is not explained by recovery fatigue and must be treated as a new neurologic emergency.',
          'Respiratory distress was exhausting.',
          'premature_closure',
          [2, 3, 5]
        ),
        wrong(
          'Continue lowering because residual hypertension is causing the deficit.',
          'The cause is not established; further reflex reduction could worsen cerebral perfusion.',
          'Pressure remains above an outpatient target.',
          'cue_misinterpretation',
          [0, 1, 3]
        ),
        wrong(
          'Prioritize another diuretic dose to sustain the respiratory improvement.',
          'Preventing recurrent congestion matters, but a new focal deficit takes immediate assessment priority.',
          'Pulmonary edema was the initial emergency.',
          'misprioritization',
          [2, 3]
        ),
      ],
      reasoning: [
        'Reconcile improvement in one organ with new dysfunction in another.',
        'Anticipate harm from continuing an unreviewed pressure trajectory.',
      ],
      conflict:
        'Respiratory improvement and lower pressure coexist with new focal cerebral dysfunction.',
      anticipation:
        'Activate the neurologic pathway and coordinate an organ-specific pressure plan.',
      uncertainty:
        'The deficit could reflect ischemia, hemorrhage or treatment-associated hypoperfusion; the number alone cannot identify the cause.',
      debrief:
        'A treatment response must be evaluated separately across affected organs, especially when baseline autoregulation may differ.',
    },
    {
      key: 'htn-a2',
      topic: 'Renal dysfunction with uncertain volume state',
      level: 'advanced',
      scenario:
        'Sawyer is treated for severe hypertension and acute kidney dysfunction. Pressure has fallen to 174/96 mmHg, but urine output remains low. They have new crackles and increasing oxygen need after initial fluids. Their mouth is dry and intake was poor before admission. Creatinine is rising, and the catheter tubing is patent.',
      cues: [
        'Severe hypertension with kidney dysfunction',
        'Persistent low urine output after pressure improvement',
        'New crackles after fluid',
        'Increasing oxygen need',
        'Dry mouth and poor prior intake',
        'Rising creatinine',
        'Patent catheter tubing',
      ],
      question:
        'Which assessment best distinguishes ongoing renal hypoperfusion from fluid intolerance before further volume?',
      choices: [
        right(
          'Request integrated congestion and perfusion assessment before more fluid.',
          'Historical intake and dry mouth do not establish current fluid responsiveness when new pulmonary intolerance is present.',
          [1, 2, 3, 4, 5]
        ),
        wrong(
          'Repeat fluid because the poor intake explains the low urine output.',
          'Poor intake is relevant, but the current lung response suggests additional fluid could worsen harm.',
          'Dry mouth and oliguria suggest depletion.',
          'outdated_data',
          [1, 2, 4]
        ),
        wrong(
          'Increase pressure reduction until urine output reaches the usual hourly goal.',
          'Urine output is not a safe standalone target for escalating pressure therapy during possible perfusion compromise.',
          'Hypertension can contribute to kidney injury.',
          'cue_misinterpretation',
          [0, 1, 5]
        ),
        wrong(
          'Treat obstruction as established despite the patent tubing.',
          'Tubing patency does not exclude every obstruction, but it cannot explain away new pulmonary findings and needs evidence.',
          'Low output often prompts a catheter check.',
          'premature_closure',
          [1, 6]
        ),
      ],
      reasoning: [
        'Weigh historical depletion cues against new treatment intolerance.',
        'Choose an assessment that differentiates congestion from inadequate perfusion.',
      ],
      conflict:
        'Poor intake suggests depletion while treatment-associated crackles and oxygen need suggest congestion.',
      anticipation:
        'Avoid worsening respiratory failure while clarifying the kidney and circulatory problem.',
      uncertainty:
        'Creatinine and urine output do not individually establish fluid responsiveness or the mechanism of kidney injury.',
      debrief:
        'When cues conflict, identify the missing assessment rather than committing to a familiar volume explanation.',
    },
    {
      key: 'htn-a3',
      topic: 'Different pressure goals in a focal neurologic event',
      level: 'advanced',
      scenario:
        'Parker has severe hypertension with new aphasia discovered on waking. Last-known-well was the previous evening, and the scan to distinguish hemorrhage from ischemia is pending. There is no pulmonary edema or chest pain. Their partner asks why the pressure is not immediately reduced to normal. A standard ward hypertension order is visible in the chart.',
      cues: [
        'Severe hypertension',
        'New aphasia',
        'Wake-up presentation with uncertain onset',
        'Brain imaging pending',
        'No concurrent pulmonary edema or chest pain',
        'Generic ward pressure order',
      ],
      question:
        'What should unresolved stroke type and treatment eligibility change about applying the routine pressure order?',
      choices: [
        right(
          'Clarify the stroke-specific pressure plan before applying the routine order.',
          'Imaging, reperfusion eligibility and concurrent organ conditions determine acute stroke pressure management; reflex normalization can impair perfusion.',
          [1, 2, 3, 4, 5]
        ),
        wrong(
          'Apply the routine order because untreated pressure worsens every stroke.',
          'The relationship depends on stroke type and treatment context; the routine order may be inappropriate.',
          'Hypertension is a major stroke risk factor.',
          'cue_misinterpretation',
          [0, 1, 5]
        ),
        wrong(
          'Treat wake-up discovery as the exact onset when setting the target.',
          'Discovery and last-known-well are distinct; neither alone determines all treatment eligibility or pressure decisions.',
          'Discovery time is the clearest available clock time.',
          'premature_closure',
          [2, 3]
        ),
        wrong(
          'Withhold every pressure intervention until the full neurologic deficit resolves.',
          'A stroke-specific plan may still require treatment before resolution; blanket withholding is not the individualized decision.',
          'Maintaining pressure may support cerebral perfusion.',
          'cue_misinterpretation',
          [0, 1, 3]
        ),
      ],
      reasoning: [
        'Identify why a generic target may conflict with an acute organ pathway.',
        'Anticipate perfusion harm and obtain the condition-specific plan.',
      ],
      conflict:
        'A high numerical pressure suggests treatment while unresolved stroke type and therapy eligibility change the appropriate target.',
      anticipation:
        'Coordinate imaging and any reperfusion evaluation without inadvertently lowering cerebral perfusion.',
      uncertainty:
        'The clinical deficit alone does not distinguish ischemic from hemorrhagic stroke or set the pressure target.',
      debrief:
        'Safe advanced reasoning recognizes when a standard order needs contextual review before implementation.',
    },
    {
      key: 'htn-a4',
      topic: 'Persistent symptoms after an aortic pressure response',
      level: 'advanced',
      scenario:
        'Logan is receiving specialist-directed treatment for suspected acute aortic syndrome. Arm blood pressure and heart rate have reached the prescribed targets. They develop new abdominal pain and one foot becomes cool with a weaker pulse. Urine output declines over the next hour. Chest pain is less intense, and oxygenation remains stable.',
      cues: [
        'Suspected acute aortic syndrome',
        'Prescribed arm pressure and rate targets reached',
        'New abdominal pain',
        'New cool foot with weaker pulse',
        'Declining urine output',
        'Reduced chest pain with stable oxygenation',
      ],
      question:
        'What do the new abdominal, limb and urine findings mean after the aortic pressure targets are reached?',
      choices: [
        right(
          'Possible branch-vessel malperfusion persists despite target pressure.',
          'New distal and abdominal organ findings can indicate evolving malperfusion even when central treatment targets are met.',
          [0, 2, 3, 4]
        ),
        wrong(
          'The target readings establish control; treat the new pain symptomatically.',
          'Meeting arm pressure and rate goals does not exclude impaired flow to branch-vessel territories.',
          'Chest pain and vital signs improved.',
          'premature_closure',
          [1, 2, 5]
        ),
        wrong(
          'Lower the arm pressure further to restore flow to the affected foot.',
          'Additional reduction is not a substitute for urgent malperfusion assessment and may reduce distal flow further.',
          'Pressure stress contributes to aortic injury.',
          'cue_misinterpretation',
          [1, 3]
        ),
        wrong(
          'Treat the oliguria as isolated kidney injury from the initial hypertension.',
          'The simultaneous abdominal and limb changes demand a unifying vascular reassessment.',
          'Severe hypertension can injure kidneys.',
          'outdated_data',
          [2, 3, 4]
        ),
      ],
      reasoning: [
        'Evaluate organ perfusion beyond a successfully treated central measurement.',
        'Anticipate branch-vessel compromise and escalate specialist reassessment.',
      ],
      conflict:
        'Improved central readings and chest pain conflict with new distal organ findings.',
      anticipation:
        'Prompt specialist review of evolving organ ischemia and need for definitive intervention.',
      uncertainty:
        'Arm pressure cannot establish perfusion of renal, mesenteric or limb vessels.',
      debrief:
        'A target vital sign is a treatment measure; organ perfusion remains the patient-centered outcome.',
    },
    {
      key: 'htn-a5',
      topic: 'Uncertain cause of confusion with severe pressure',
      level: 'advanced',
      scenario:
        'Arden arrives confused with a pressure of 216/118 mmHg. They also have fever, new urinary symptoms and poor intake. Glucose is normal, there is no clear focal deficit, and their family reports abrupt cognitive change. Creatinine is higher than baseline. The initial referral labels the problem as hypertensive encephalopathy, but infection studies and brain imaging are pending.',
      cues: [
        'Severe hypertension with acute confusion',
        'Fever with new urinary symptoms',
        'Poor intake',
        'Normal glucose without a clear focal deficit',
        'Creatinine above baseline',
        'Alternative-cause tests pending',
        'Unconfirmed referral diagnosis',
      ],
      question:
        'Which approach best distinguishes cerebral injury, infection and treatment intolerance in the patient with severe pressure and confusion?',
      choices: [
        right(
          'Investigate acute cerebral injury and infection while monitoring treatment tolerance.',
          'Severe pressure may accompany several illnesses; concurrent evaluation is needed before attributing all organ findings to hypertension.',
          [0, 1, 4, 5, 6]
        ),
        wrong(
          'Use the referral diagnosis to make pressure normalization the single priority.',
          'An unconfirmed label does not resolve infectious or structural causes of acute confusion.',
          'The pressure and confusion fit that label.',
          'premature_closure',
          [0, 6]
        ),
        wrong(
          'Attribute confusion to urinary infection because the examination is nonfocal.',
          'A nonfocal examination does not exclude acute cerebral injury or hypertensive encephalopathy.',
          'Infection commonly causes delirium.',
          'premature_closure',
          [1, 3]
        ),
        wrong(
          'Use the creatinine rise as proof that more fluid is required first.',
          'Kidney injury and poor intake do not establish current responsiveness or make neurologic assessment less urgent.',
          'Poor intake can cause prerenal injury.',
          'cue_misinterpretation',
          [2, 4]
        ),
      ],
      reasoning: [
        'Compare several plausible explanations for acute organ dysfunction.',
        'Plan parallel evaluation and anticipate harm from a single-cause treatment assumption.',
      ],
      conflict:
        'Severe pressure supports an encephalopathy hypothesis while fever and urinary symptoms support an infectious alternative.',
      anticipation:
        'Detect evolving neurologic or septic deterioration while reassessing the response to each treatment.',
      uncertainty:
        'The pressure, fever and creatinine rise do not establish which condition is causing the cerebral dysfunction.',
      debrief:
        'When more than one mechanism remains plausible, a shared reassessment plan is safer than a confident unverified label.',
    },
  ]
)

const sounds = group(
  'heart_sounds',
  'cardiovascular',
  ['auscultation', 'deterioration'],
  [
    {
      key: 'sound-f1',
      topic: 'Timing an extra heart sound',
      level: 'foundation',
      scenario:
        'A nurse hears an extra low-pitched apical sound in an older adult. It occurs immediately after S2. The finding is reproducible with light bell pressure in the left lateral position. The patient is resting comfortably.',
      cues: [
        'Low-pitched apical sound',
        'Immediately after S2',
        'Best heard with light bell pressure',
      ],
      question:
        'Which extra heart sound fits the documented position in the cardiac cycle?',
      choices: [
        right(
          'An S3 associated with early ventricular filling.',
          'The timing after S2 places this low-pitched sound in early diastolic ventricular filling.',
          [0, 1, 2]
        ),
        wrong(
          'An S4 associated with atrial contraction.',
          'S4 occurs before S1, later in diastole, rather than immediately after S2.',
          'Both gallops can be low pitched.',
          'cue_misinterpretation',
          [0, 1]
        ),
        wrong(
          'A systolic ejection click during valve opening.',
          'An ejection click occurs in systole and is usually higher pitched.',
          'Extra sounds may reflect valve events.',
          'cue_misinterpretation',
          [0, 1]
        ),
        wrong(
          'A split S2 caused by two semilunar closures.',
          'Split S2 is a separation of higher-pitched closure components rather than an apical filling sound.',
          'The extra sound follows S2 closely.',
          'cue_misinterpretation',
          [0, 1]
        ),
      ],
      reasoning: ['Use cardiac-cycle timing to identify the sound.'],
      debrief:
        'Locate an extra sound in the cardiac cycle before interpreting its clinical meaning.',
    },
    {
      key: 'sound-f2',
      topic: 'Presystolic sound and ventricular stiffness',
      level: 'foundation',
      scenario:
        'An older adult with hypertension has a regular sinus rhythm. A low-pitched apical sound is heard just before S1. It is clearer with the bell than the diaphragm. There are no acute respiratory symptoms.',
      cues: [
        'Sinus rhythm',
        'Low-pitched sound immediately before S1',
        'History of hypertension',
      ],
      question:
        'Which mechanism best explains a low-pitched presystolic sound in this hypertensive patient?',
      choices: [
        right(
          'An S4 associated with reduced ventricular compliance.',
          'A presystolic filling sound in sinus rhythm fits an S4 and requires an atrial contraction.',
          [0, 1, 2]
        ),
        wrong(
          'An S3 from rapid early ventricular filling.',
          'S3 follows S2 rather than preceding S1.',
          'Both findings are diastolic gallops.',
          'cue_misinterpretation',
          [1]
        ),
        wrong(
          'An opening snap from mitral valve opening.',
          'An opening snap occurs after S2, not just before S1.',
          'Mitral valve sounds are often apical.',
          'cue_misinterpretation',
          [1]
        ),
        wrong(
          'A pericardial rub caused by inflamed surfaces.',
          'A rub is scratchy and may have several components, unlike this discrete low-pitched presystolic sound.',
          'Inflammation can add sounds to the cycle.',
          'cue_misinterpretation',
          [1]
        ),
      ],
      reasoning: ['Recognize a late-diastolic sound.'],
      debrief:
        'Use timing and rhythm together rather than labeling every extra sound as the same gallop.',
    },
    {
      key: 'sound-f3',
      topic: 'Ejection murmur with exertional symptoms',
      level: 'foundation',
      scenario:
        'An older adult reports dizziness when walking uphill. A systolic ejection murmur is loudest at the right upper sternal border. It radiates to the neck. The patient is currently seated and stable.',
      cues: [
        'Exertional dizziness',
        'Right upper sternal ejection murmur',
        'Radiation toward the neck',
      ],
      question:
        'Which valve finding best fits the ejection murmur and exertional symptoms?',
      choices: [
        right(
          'Aortic stenosis requiring further valve assessment.',
          'The location, ejection character and neck radiation fit aortic outflow obstruction.',
          [0, 1, 2]
        ),
        wrong(
          'Mitral regurgitation with backward systolic flow.',
          'Mitral regurgitation is typically apical with axillary radiation rather than this ejection pattern.',
          'Both lesions can produce systolic murmurs.',
          'cue_misinterpretation',
          [1, 2]
        ),
        wrong(
          'Aortic regurgitation during early diastole.',
          'The stated systolic timing does not fit the characteristic diastolic regurgitant murmur.',
          'The aortic area is involved.',
          'cue_misinterpretation',
          [1]
        ),
        wrong(
          'Mitral stenosis restricting diastolic ventricular filling.',
          'Mitral stenosis typically produces an apical diastolic rumble rather than a neck-radiating ejection sound.',
          'Valve obstruction can cause exertional symptoms.',
          'cue_misinterpretation',
          [0, 1, 2]
        ),
      ],
      reasoning: ['Match timing, location and radiation to a valve concern.'],
      debrief:
        'Auscultation supports a focused concern; echocardiography establishes the lesion and its severity.',
    },
    {
      key: 'sound-f4',
      topic: 'Apical systolic murmur',
      level: 'foundation',
      scenario:
        'During assessment, a blowing murmur extends through systole. It is loudest at the apex. The sound radiates toward the left axilla. A second nurse confirms the timing.',
      cues: [
        'Blowing holosystolic murmur',
        'Apical maximum',
        'Left axillary radiation',
      ],
      question: 'Which valve mechanism best fits this apical systolic murmur?',
      choices: [
        right(
          'Mitral regurgitation.',
          'An apical holosystolic murmur radiating toward the axilla supports mitral regurgitation.',
          [0, 1, 2]
        ),
        wrong(
          'Aortic stenosis.',
          'Aortic stenosis has an ejection pattern with a typical upper-sternal maximum and neck radiation.',
          'Aortic stenosis also produces a systolic murmur.',
          'cue_misinterpretation',
          [0, 1, 2]
        ),
        wrong(
          'Mitral stenosis.',
          'Mitral stenosis usually causes a diastolic filling murmur, not a holosystolic murmur.',
          'The sound is loudest at the apex.',
          'cue_misinterpretation',
          [0, 1]
        ),
        wrong(
          'Aortic regurgitation.',
          'Aortic regurgitation typically produces an early diastolic blowing murmur rather than a systolic one.',
          'Both may have a blowing quality.',
          'cue_misinterpretation',
          [0]
        ),
      ],
      reasoning: ['Recognize a valve-pattern description.'],
      debrief:
        'Interpret sound quality alongside timing and radiation; no one descriptor is sufficient alone.',
    },
    {
      key: 'sound-f5',
      topic: 'Physiologic second-sound variation',
      level: 'foundation',
      scenario:
        'A healthy young adult has no exertional symptoms. At the upper left sternal border, S2 separates into two components during inspiration. The components merge during expiration. The rest of the assessment is unremarkable.',
      cues: [
        'S2 splitting during inspiration',
        'Merges during expiration',
        'Healthy asymptomatic young adult',
      ],
      question:
        'Which interpretation best explains the respiratory variation of the second heart sound?',
      choices: [
        right(
          'Physiologic respiratory splitting of S2.',
          'Normal inspiration can delay pulmonic closure, making the two S2 components audible.',
          [0, 1, 2]
        ),
        wrong(
          'Fixed splitting suggesting an atrial septal defect.',
          'Fixed splitting remains separated through respiration, unlike this clearly variable pattern.',
          'An atrial septal defect can split S2.',
          'cue_misinterpretation',
          [0, 1]
        ),
        wrong(
          'An apical S3 from ventricular volume overload.',
          'An S3 is a filling sound rather than two upper-sternal closure components varying with respiration.',
          'A young adult may have an extra sound.',
          'cue_misinterpretation',
          [0, 2]
        ),
        wrong(
          'Paradoxical splitting from delayed aortic closure.',
          'Paradoxical splitting is heard in expiration and narrows with inspiration, the opposite sequence.',
          'Conduction or valve disease can alter S2.',
          'cue_misinterpretation',
          [0, 1]
        ),
      ],
      reasoning: ['Interpret respiratory variation of a normal sound.'],
      debrief:
        'Normal variation is recognized by a reproducible pattern, rather than by assuming every extra component is disease.',
    },
    {
      key: 'sound-c1',
      topic: 'New gallop during fluid therapy',
      level: 'challenge',
      scenario:
        'Kendall is receiving prescribed fluids for dehydration. Over an hour breathing becomes more difficult and new crackles appear. A low-pitched apical sound after S2 is now audible. Oxygen requirement has increased from room air to supplemental oxygen.',
      cues: [
        'Recent fluid administration',
        'Increasing dyspnea',
        'New crackles',
        'New S3-type sound',
        'Increasing oxygen requirement',
      ],
      question:
        'What should a new gallop and breathlessness change about the ongoing fluid assessment?',
      choices: [
        right(
          'Escalate possible fluid intolerance and reassess the infusion plan.',
          'New respiratory congestion with an S3-type sound suggests that continued fluid needs review.',
          [0, 1, 2, 3, 4]
        ),
        wrong(
          'Increase fluid delivery because dehydration was the admission diagnosis.',
          'The original diagnosis cannot override new signs that the current intervention is poorly tolerated.',
          'Fluids were prescribed to correct a deficit.',
          'outdated_data',
          [0, 1, 2]
        ),
        wrong(
          'Document the extra sound before finishing the planned fluid volume.',
          'A new sound accompanied by respiratory deterioration needs action before the planned volume is completed.',
          'Documenting a new finding is appropriate.',
          'misprioritization',
          [1, 3, 4]
        ),
        wrong(
          'Treat the sound as physiologic without comparing prior assessments.',
          'Physiologic S3 is possible in some people, but new congestion and oxygen need require clinical reassessment.',
          'An S3 can sometimes be normal.',
          'cue_misinterpretation',
          [2, 3, 4]
        ),
      ],
      reasoning: [
        'Integrate a new sound with treatment and respiratory trends.',
        'Prioritize treatment tolerance.',
      ],
      debrief:
        'A heart sound becomes more informative when its appearance tracks a meaningful change in the patient.',
    },
    {
      key: 'sound-c2',
      topic: 'Exertional syncope with a murmur',
      level: 'challenge',
      scenario:
        'Marley reports two episodes of near-syncope while climbing stairs this week. The nurse hears an ejection systolic murmur radiating to the neck. Exercise tolerance has declined over a month. Resting observations are currently stable.',
      cues: [
        'Recurrent exertional near-syncope',
        'Neck-radiating ejection murmur',
        'Declining exercise tolerance',
        'Stable resting observations',
      ],
      question:
        'Which concern should determine the urgency of exertional syncope with the ejection murmur?',
      choices: [
        right(
          'Prompt specialist valve assessment with echocardiography.',
          'Exertional presyncope with this murmur requires timely evaluation despite normal resting observations.',
          [0, 1, 2]
        ),
        wrong(
          'Orthostatic testing as the sole explanation before valve referral.',
          'The symptoms occur with exertion and accompany a valve pattern, rather than a clearly postural trigger.',
          'Dizziness commonly prompts orthostatic assessment.',
          'premature_closure',
          [0, 1]
        ),
        wrong(
          'A routine annual murmur review based on stable resting vital signs.',
          'Current stability does not negate newly symptomatic possible outflow obstruction.',
          'Many chronic murmurs are monitored routinely.',
          'outdated_data',
          [0, 2, 3]
        ),
        wrong(
          'An unsupervised exercise trial to reproduce the faintness first.',
          'Provoking exertional symptoms is inappropriate before suspected significant valve disease is evaluated.',
          'Reproducing symptoms can aid diagnosis.',
          'misprioritization',
          [0, 1]
        ),
      ],
      reasoning: [
        'Integrate exertional timing with a valve pattern.',
        'Select an appropriate assessment priority.',
      ],
      debrief:
        'Resting stability does not remove the significance of exertional symptoms associated with a potentially obstructive lesion.',
    },
    {
      key: 'sound-c3',
      topic: 'New murmur during bacteremia',
      level: 'challenge',
      scenario:
        'Micah is receiving treatment for bloodstream infection. Today a new regurgitant murmur is documented. They develop breathlessness on walking to the bathroom and crackles that were absent yesterday. Temperature remains elevated despite initial treatment.',
      cues: [
        'Bloodstream infection',
        'New regurgitant murmur',
        'New exertional breathlessness',
        'New crackles',
        'Persistent fever',
      ],
      question:
        'What should a newly documented murmur change about reassessment during bacteremia?',
      choices: [
        right(
          'Possible infective valve involvement with new cardiac dysfunction.',
          'Bacteremia plus a new murmur and congestion warrants assessment for endocardial infection and valve consequences.',
          [0, 1, 2, 3, 4]
        ),
        wrong(
          'An innocent flow murmur caused by fever alone.',
          'Fever can increase flow, but new congestion and a regurgitant pattern require evaluation beyond that explanation.',
          'Fever raises cardiac output and sound intensity.',
          'premature_closure',
          [1, 3, 4]
        ),
        wrong(
          'Primary pneumonia as the established source of the new crackles.',
          'Pneumonia remains possible, but does not explain away the new valve finding during bacteremia.',
          'Fever, dyspnea and crackles can be pulmonary infection.',
          'premature_closure',
          [0, 1, 3]
        ),
        wrong(
          'Expected deconditioning after infection without a new organ problem.',
          'A changed murmur and new crackles are objective findings beyond reduced fitness.',
          'Illness commonly reduces exercise tolerance.',
          'cue_misinterpretation',
          [1, 2, 3]
        ),
      ],
      reasoning: [
        'Link a new auscultatory finding to infectious and functional change.',
        'Prioritize a unifying complication.',
      ],
      debrief:
        'A new murmur during bloodstream infection is assessed with the whole trajectory, especially new heart-failure signs.',
    },
    {
      key: 'sound-c4',
      topic: 'Changing gallop with an irregular rhythm',
      level: 'challenge',
      scenario:
        'Shay previously had an S4 documented with hypertension and sinus rhythm. Today the pulse is newly irregular and the ECG confirms atrial fibrillation. The presystolic sound is no longer heard. Blood pressure and breathing remain unchanged.',
      cues: [
        'Previously documented S4 in sinus rhythm',
        'New atrial fibrillation',
        'Presystolic sound now absent',
        'No parallel improvement in other findings',
      ],
      question:
        'How should the irregular rhythm affect interpretation of the reported presystolic sound?',
      choices: [
        right(
          'Loss of organized atrial contraction can explain the absent S4.',
          'S4 depends on atrial contraction; its disappearance during atrial fibrillation does not prove improved ventricular compliance.',
          [0, 1, 2]
        ),
        wrong(
          'Ventricular stiffness has resolved because the S4 disappeared.',
          'The rhythm change provides another explanation, so improved compliance cannot be inferred.',
          'S4 is associated with a stiff ventricle.',
          'cue_misinterpretation',
          [0, 1, 2]
        ),
        wrong(
          'The previous sound must have been an S3 rather than S4.',
          'A prior presystolic sound can have been correctly identified; atrial fibrillation explains its loss.',
          'Both are low-pitched extra sounds.',
          'premature_closure',
          [0, 1]
        ),
        wrong(
          'Normal breathing excludes a clinically important rhythm change.',
          'Stable breathing does not establish the cause or risk of newly detected atrial fibrillation.',
          'Other observations have not deteriorated.',
          'cue_misinterpretation',
          [1, 3]
        ),
      ],
      reasoning: [
        'Use rhythm physiology to interpret a changing examination.',
        'Avoid mistaking absent evidence for recovery.',
      ],
      debrief:
        'A disappearing sign may reflect a changed mechanism rather than improvement in the underlying disease.',
    },
    {
      key: 'sound-c5',
      topic: 'Documenting a sound to support comparison',
      level: 'challenge',
      scenario:
        'Two nurses describe an extra sound differently during handover. The patient has developed mild exertional breathlessness since yesterday. One describes a gallop and the other a split closure sound. No recording or detailed timing was documented.',
      cues: [
        'Conflicting sound labels',
        'New exertional breathlessness',
        'No timing description',
        'No comparable recording',
      ],
      question:
        'Which examination details would best resolve the conflicting sound labels during handover?',
      choices: [
        right(
          'Reassess timing, location and respiratory variation with a skilled colleague.',
          'A reproducible description plus symptoms is more informative than choosing between unsupported labels.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Carry forward the more senior nurse’s label without reassessment.',
          'Seniority cannot replace a reproducible assessment when documentation conflicts.',
          'Experience often improves sound recognition.',
          'outdated_data',
          [0, 2]
        ),
        wrong(
          'Use sound intensity as the main basis for the escalation.',
          'Intensity alone does not identify timing, mechanism or clinical severity.',
          'Louder sounds are easier to recognize.',
          'cue_misinterpretation',
          [0, 2]
        ),
        wrong(
          'Request a treatment change using the new gallop label as confirmed.',
          'Symptoms warrant review, but an uncertain sound should be communicated as uncertain rather than established.',
          'A new gallop can indicate dysfunction.',
          'premature_closure',
          [0, 1, 2]
        ),
      ],
      reasoning: [
        'Identify the missing information in competing interpretations.',
        'Obtain a reproducible examination before labeling.',
      ],
      debrief:
        'High-quality handover describes what was heard, what changed and what remains uncertain.',
    },
    {
      key: 'sound-a1',
      topic: 'A quieter murmur with worse perfusion',
      level: 'advanced',
      scenario:
        'Avery has known aortic stenosis and a previously loud ejection murmur. Over a week their exertional dizziness and breathlessness worsen. Today the murmur is softer, blood pressure is 92/62 mmHg and the pulse is weak. New crackles are present. The last echocardiogram was performed before the recent functional decline.',
      cues: [
        'Known aortic stenosis',
        'Worsening exertional symptoms',
        'Murmur quieter than baseline',
        'Low pressure with weak pulse',
        'New crackles',
        'Echo predates functional decline',
      ],
      question:
        'Which evaluation best explains a quieter aortic murmur despite worsening exertional symptoms and perfusion?',
      choices: [
        right(
          'Urgently reassess valve severity, ventricular function and forward flow.',
          'Reduced flow can soften a murmur despite worsening disease; new hypoperfusion and congestion require integrated imaging.',
          [1, 2, 3, 4, 5]
        ),
        wrong(
          'Regrade stenosis as improving and investigate primary lung disease first.',
          'A quieter flow-dependent murmur cannot establish improved obstruction when cardiac symptoms and perfusion worsen.',
          'The murmur is less intense.',
          'cue_misinterpretation',
          [1, 2, 3]
        ),
        wrong(
          'Repeat auscultation after exertion to amplify the murmur before referral.',
          'Provoking symptoms adds risk and delays the necessary assessment of symptomatic hemodynamic deterioration.',
          'Flow can influence murmur intensity.',
          'misprioritization',
          [1, 3]
        ),
        wrong(
          'Use the previous echo to treat the crackles as an isolated volume problem.',
          'Imaging predating a clinical change cannot exclude progression or new ventricular dysfunction.',
          'Prior imaging established the valve diagnosis.',
          'outdated_data',
          [4, 5]
        ),
      ],
      reasoning: [
        'Reconcile sound intensity with flow-dependent physiology.',
        'Anticipate low-output valve complications and identify urgent imaging needs.',
      ],
      conflict:
        'The murmur sounds less dramatic while symptoms, perfusion and lung findings worsen.',
      anticipation:
        'Escalate low-output deterioration and avoid provoking further exertional symptoms.',
      uncertainty:
        'Murmur loudness cannot determine present valve severity or distinguish reduced flow from improved obstruction.',
      debrief:
        'Auscultation is interpreted in its hemodynamic context; a quieter sound may be a warning rather than reassurance.',
    },
    {
      key: 'sound-a2',
      topic: 'Tachycardia obscuring new valve dysfunction',
      level: 'advanced',
      scenario:
        'Jordan has bacteremia and a newly documented murmur. During the evening, breathing becomes labored and pulse rises to 132/min. Blood pressure falls and crackles develop, but the murmur is now difficult to time. An echocardiogram two weeks earlier showed no major valve lesion. The patient is receiving antimicrobials and fluid therapy.',
      cues: [
        'Bacteremia',
        'New murmur',
        'Rapid pulse obscuring timing',
        'Falling blood pressure',
        'New respiratory distress and crackles',
        'Earlier echo without major lesion',
        'Concurrent fluid and antimicrobial treatment',
      ],
      question:
        'Which assessment best addresses new shock and pulmonary findings when tachycardia obscures the murmur?',
      choices: [
        right(
          'Escalate shock and request current valve and ventricular assessment.',
          'New valve dysfunction, sepsis and fluid intolerance may coexist; current imaging and perfusion assessment are required.',
          [0, 1, 3, 4, 6]
        ),
        wrong(
          'Repeat a full sound examination after the heart rate is controlled first.',
          'Better timing may help, but must not delay assessment of shock and acute pulmonary findings.',
          'Tachycardia makes auscultation less reliable.',
          'misprioritization',
          [2, 3, 4]
        ),
        wrong(
          'Use the earlier echo to favor uncomplicated septic vasodilation.',
          'An earlier normal valve assessment does not exclude a newly evolving infectious valve complication.',
          'Bacteremia commonly causes distributive shock.',
          'outdated_data',
          [0, 5]
        ),
        wrong(
          'Stop at a fluid-overload explanation and judge response after diuresis.',
          'Fluid intolerance is possible, but does not resolve the new murmur, infection and shock mechanism.',
          'Crackles followed fluid therapy.',
          'premature_closure',
          [1, 3, 4, 6]
        ),
      ],
      reasoning: [
        'Integrate examination uncertainty with multiple plausible shock mechanisms.',
        'Anticipate acute valve failure and seek assessment without delaying support.',
      ],
      conflict:
        'A difficult current murmur and an earlier normal echo conflict with new bacteremia-associated cardiac findings.',
      anticipation:
        'Prepare for worsening pulmonary edema and a potentially urgent structural cardiac problem.',
      uncertainty:
        'Auscultation and prior imaging cannot establish the current lesion or exclude mixed shock.',
      debrief:
        'An unreliable examination during tachycardia increases the need for complementary assessment rather than lowering concern.',
    },
    {
      key: 'sound-a3',
      topic: 'An S3 in a young adult with changing function',
      level: 'advanced',
      scenario:
        'A 28-year-old athlete has an apical S3 and asks whether it is normal for their age. They recently recovered from a viral illness. Their usual training pace now causes breathlessness and palpitations. Resting pulse is higher than their personal baseline, and mild ankle swelling is new. Oxygen saturation is normal while seated.',
      cues: [
        'Age when physiologic S3 is possible',
        'Recent viral illness',
        'New exercise intolerance',
        'Palpitations',
        'Resting pulse above personal baseline',
        'New ankle swelling',
        'Normal resting oxygen saturation',
      ],
      question:
        'How should new exercise intolerance and edema affect interpretation of an S3 in a young athlete?',
      choices: [
        right(
          'The new functional changes warrant cardiac evaluation despite possible physiologic S3.',
          'Age and normal resting saturation do not explain new exercise limitation, edema and a changed pulse baseline.',
          [0, 2, 3, 4, 5, 6]
        ),
        wrong(
          'Use age and athletic status to classify the S3 as physiologic.',
          'A potentially normal sound does not make the associated new symptoms physiologic.',
          'Young athletes can have a normal S3.',
          'premature_closure',
          [0, 2, 5]
        ),
        wrong(
          'Attribute the change to deconditioning and assess after training resumes.',
          'Resuming exertion before evaluating new cardiac symptoms may increase risk and delay diagnosis.',
          'Recent illness can interrupt fitness routines.',
          'misprioritization',
          [1, 2, 3]
        ),
        wrong(
          'Prioritize a pulmonary oxygen problem because breathlessness is exertional.',
          'Pulmonary causes remain possible, but normal resting saturation does not resolve the combined cardiac clues.',
          'Dyspnea often originates in the lungs.',
          'cue_misinterpretation',
          [2, 4, 5, 6]
        ),
      ],
      reasoning: [
        'Evaluate a potentially normal sign against a changed personal baseline.',
        'Anticipate cardiac dysfunction and choose safe assessment before exertion.',
      ],
      conflict:
        'Youth and athletic status make physiologic S3 possible, while several new findings suggest disease.',
      anticipation:
        'Avoid unassessed strenuous exertion and assess for a new cardiac process.',
      uncertainty:
        'An S3 and recent illness do not independently establish myocarditis or ventricular dysfunction.',
      debrief:
        'A normal-range characteristic does not cancel a coherent pattern of new functional and examination abnormalities.',
    },
    {
      key: 'sound-a4',
      topic: 'A changing examination with a prosthetic valve',
      level: 'advanced',
      scenario:
        'Casey has a mechanical valve and usually hears its familiar closing click. Today the click sounds different to them, and they have new dyspnea with a faster pulse. They missed several anticoagulant doses during a vomiting illness. The nurse cannot confidently compare the click with a previous recording. Oxygen saturation is preserved and there is no visible bleeding.',
      cues: [
        'Mechanical valve',
        'Patient-reported change in familiar click',
        'New dyspnea and tachycardia',
        'Missed anticoagulant doses',
        'No reliable baseline recording',
        'Preserved oxygen saturation without visible bleeding',
      ],
      question:
        'Which plan best evaluates a changed prosthetic-valve click with new symptoms after interrupted anticoagulation?',
      choices: [
        right(
          'Arrange urgent valve imaging and hemodynamic review while verifying recent anticoagulant exposure.',
          'New symptoms and interrupted anticoagulation make valve dysfunction important to assess; uncertain auscultation should not delay review.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Prioritize anticoagulation restoration and use persistent symptoms afterward to determine the need for valve imaging.',
          'Restoring an appropriate regimen requires supervised decisions, but that should not delay assessment of possible current valve dysfunction.',
          'The interruption appears to explain the risk and restoring treatment seems to address it.',
          'misprioritization',
          [0, 2, 3]
        ),
        wrong(
          'Obtain a repeat sound recording and use acoustic confirmation to prioritize the specialist referral.',
          'A recording can help documentation but cannot exclude clinically important prosthetic dysfunction or become a prerequisite for urgent review.',
          'The main reported change is acoustic and a baseline comparison is missing.',
          'cue_misinterpretation',
          [1, 2, 4]
        ),
        wrong(
          'Prioritize dehydration assessment and use preserved saturation to defer valve imaging until rehydration.',
          'Dehydration may coexist, but preserved saturation does not rule out a valve-related hemodynamic problem.',
          'Vomiting can produce tachycardia and breathlessness.',
          'premature_closure',
          [2, 3, 5]
        ),
      ],
      reasoning: [
        'Weigh uncertain sound findings against high-risk history and new symptoms.',
        'Anticipate prosthetic dysfunction without unsafe medication assumptions.',
      ],
      conflict:
        'Preserved saturation and uncertain auscultation coexist with a high-risk anticoagulant interruption and new symptoms.',
      anticipation:
        'Assess for valve obstruction or another complication before further hemodynamic deterioration.',
      uncertainty:
        'A perceived click change does not diagnose thrombosis; imaging and clinical assessment are required.',
      debrief:
        'Patient familiarity with a baseline can supply a valuable cue without becoming a substitute for diagnostic assessment.',
    },
    {
      key: 'sound-a5',
      topic: 'EF reassurance with new congestion and murmur',
      level: 'advanced',
      scenario:
        'Reese has a new systolic murmur and increasing exertional breathlessness. A recent report lists an ejection fraction within the reference range but does not fully characterize the valve lesion. They now need extra pillows and have new basal crackles. Blood pressure is preserved and oxygen saturation is normal at rest. The patient was told the normal ejection fraction meant their heart was working normally.',
      cues: [
        'New systolic murmur',
        'Increasing exertional breathlessness',
        'Reported normal ejection fraction',
        'Valve lesion not fully characterized',
        'New orthopnea and basal crackles',
        'Preserved pressure and resting saturation',
      ],
      question:
        'Which cardiac reassessment remains necessary despite a normal ejection fraction and preserved resting observations?',
      choices: [
        right(
          'Review valve severity, filling pressures and symptom progression together.',
          'A preserved ejection fraction does not exclude significant regurgitation, elevated filling pressures or symptomatic cardiac disease.',
          [0, 1, 2, 3, 4]
        ),
        wrong(
          'Use ejection fraction to direct the workup away from cardiac causes.',
          'A normal fraction is not a comprehensive assessment of valve function or filling-pressure consequences.',
          'Ejection fraction is a familiar measure of pumping.',
          'cue_misinterpretation',
          [2, 3, 4]
        ),
        wrong(
          'Reassess the murmur after treating a primary respiratory cause first.',
          'Respiratory alternatives matter, but new murmur and orthopnea warrant concurrent cardiac assessment.',
          'Crackles and dyspnea can arise from lung disease.',
          'misprioritization',
          [0, 1, 4]
        ),
        wrong(
          'Use preserved pressure and saturation to classify the symptoms as mild.',
          'Resting values can remain normal despite important exertional limitations and congestion.',
          'The bedside vital signs look reassuring.',
          'premature_closure',
          [1, 4, 5]
        ),
      ],
      reasoning: [
        'Identify the limits of a reassuring single cardiac metric.',
        'Integrate functional change and valve uncertainty to anticipate congestion.',
      ],
      conflict:
        'A normal ejection fraction and resting observations conflict with new murmur and progressive congestion symptoms.',
      anticipation:
        'Clarify the lesion and hemodynamic consequences before further loss of functional capacity or acute decompensation.',
      uncertainty:
        'Ejection fraction alone does not establish the mechanism or severity of the valve disease.',
      debrief:
        'Evaluate the full cardiac problem rather than allowing one familiar normal metric to close the assessment.',
    },
  ]
)

const shock = group(
  'multisystem_core_shock',
  'multisystem',
  ['fluids', 'traumaAssessment', 'deterioration', 'anaphylaxis', 'vte'],
  [
    {
      key: 'shock-f1',
      topic: 'Compensated blood loss',
      level: 'foundation',
      scenario:
        'A postoperative patient has a blood pressure within their usual range. Their pulse is newly fast and the skin is cool and clammy. Fresh blood is collecting in the surgical drain. They are awake and answering questions.',
      cues: [
        'New tachycardia with cool clammy skin',
        'Fresh drain blood',
        'Blood pressure still near baseline',
      ],
      question:
        'Which interpretation best explains the early perfusion findings after the blood loss?',
      choices: [
        right(
          'Possible compensated blood loss despite preserved pressure.',
          'Compensatory responses can maintain pressure early while blood loss reduces circulating volume.',
          [0, 1, 2]
        ),
        wrong(
          'A pain response without circulatory compromise.',
          'Pain may contribute, but fresh bleeding and cool skin make blood loss important to evaluate.',
          'Pain commonly increases postoperative pulse.',
          'premature_closure',
          [0, 1]
        ),
        wrong(
          'Established distributive shock with peripheral vasodilation.',
          'Active bleeding with cool clammy skin fits a volume-loss concern better than isolated vasodilation.',
          'Tachycardia is common in several shock states.',
          'cue_misinterpretation',
          [0, 1]
        ),
        wrong(
          'An uncomplicated postoperative response because pressure is normal.',
          'A preserved pressure does not exclude early hypoperfusion in an actively bleeding patient.',
          'The familiar pressure number is reassuring.',
          'cue_misinterpretation',
          [1, 2]
        ),
      ],
      reasoning: ['Recognize compensation before hypotension develops.'],
      debrief:
        'Preserved arterial pressure does not rule out early blood loss or the need for timely escalation.',
    },
    {
      key: 'shock-f2',
      topic: 'Pump failure with congestion',
      level: 'foundation',
      scenario:
        'An adult with a recent myocardial infarction becomes breathless. Their blood pressure is 82/50 mmHg. The extremities are cool and bilateral crackles are present. There is no reported external blood loss.',
      cues: [
        'Recent infarction',
        'Hypotension with cool extremities',
        'Bilateral crackles',
      ],
      question:
        'Which shock mechanism best explains cool hypotension with crackles after an infarction?',
      choices: [
        right(
          'Reduced cardiac pumping with pulmonary congestion.',
          'Myocardial injury plus cool hypotension and lung congestion suggests a cardiogenic mechanism.',
          [0, 1, 2]
        ),
        wrong(
          'Reduced circulating volume from acute fluid loss.',
          'Pure volume depletion does not best explain new pulmonary congestion after myocardial injury.',
          'Low pressure can reflect inadequate volume.',
          'cue_misinterpretation',
          [1, 2]
        ),
        wrong(
          'Predominant systemic vasodilation without pump dysfunction.',
          'The infarction and congestion favor pump dysfunction over isolated distributive physiology.',
          'Vasodilation can also cause hypotension.',
          'cue_misinterpretation',
          [0, 1, 2]
        ),
        wrong(
          'An isolated airway process with incidental low pressure.',
          'A primary airway explanation does not account well for cool systemic hypoperfusion and the infarction context.',
          'The principal reported symptom is breathlessness.',
          'premature_closure',
          [0, 1, 2]
        ),
      ],
      reasoning: ['Match the clinical pattern to a likely shock mechanism.'],
      debrief:
        'Lung findings help distinguish several causes of hypotension but must be interpreted with the cardiac history.',
    },
    {
      key: 'shock-f3',
      topic: 'Obstructive pulmonary vascular concern',
      level: 'foundation',
      scenario:
        'An adult immobilized after surgery develops abrupt breathlessness. Their blood pressure is low and neck veins are elevated. Lung fields are clear on auscultation. There is no visible major bleeding.',
      cues: [
        'Recent immobilization with abrupt breathlessness',
        'Hypotension with elevated neck veins',
        'Clear lung fields',
      ],
      question:
        'Which circulatory mechanism should be considered in this pulmonary vascular presentation?',
      choices: [
        right(
          'Pulmonary vascular obstruction impairing forward blood flow.',
          'The risk context and acute right-sided pressure pattern raise concern for a significant pulmonary embolic event.',
          [0, 1, 2]
        ),
        wrong(
          'Left ventricular congestion causing pulmonary edema.',
          'Clear lungs and abrupt right-sided findings are less consistent with predominant pulmonary edema.',
          'Heart failure may cause dyspnea and venous distension.',
          'cue_misinterpretation',
          [1, 2]
        ),
        wrong(
          'Simple intravascular depletion from poor intake.',
          'Volume depletion typically does not produce elevated neck veins with this abrupt presentation.',
          'Postoperative intake may be limited.',
          'cue_misinterpretation',
          [0, 1]
        ),
        wrong(
          'Vasovagal hypotension from postoperative discomfort.',
          'Venous distension and sudden breathlessness need assessment beyond a transient reflex explanation.',
          'Pain can cause reflex hypotension.',
          'premature_closure',
          [0, 1, 2]
        ),
      ],
      reasoning: ['Recognize an obstructive shock pattern.'],
      debrief:
        'A plausible mechanism directs urgent assessment without pretending the bedside pattern alone confirms the diagnosis.',
    },
    {
      key: 'shock-f4',
      topic: 'Anaphylactic circulatory deterioration',
      level: 'foundation',
      scenario:
        'Shortly after an intravenous antibiotic begins, a patient develops wheeze. Their blood pressure falls and widespread urticaria appears. The infusion is still connected. The emergency call system is within reach.',
      cues: [
        'New antibiotic exposure',
        'Wheeze with falling pressure',
        'Widespread urticaria',
      ],
      question:
        'Which finding best identifies circulatory involvement in the allergic reaction?',
      choices: [
        right(
          'Anaphylaxis with immediate airway and circulatory management.',
          'Acute multisystem findings after an exposure support anaphylaxis requiring immediate emergency management.',
          [0, 1, 2]
        ),
        wrong(
          'An isolated skin-allergy pathway focused on antihistamine treatment.',
          'Wheeze and hypotension make this more than an isolated cutaneous reaction.',
          'Urticaria is an obvious allergic finding.',
          'misprioritization',
          [1, 2]
        ),
        wrong(
          'An asthma pathway focused on bronchodilator response first.',
          'Bronchospasm is present, but asthma alone does not explain the acute skin and circulatory findings.',
          'Wheeze may dominate the initial complaint.',
          'premature_closure',
          [1, 2]
        ),
        wrong(
          'A vasovagal pathway focused on positioning and reassessment.',
          'Wheeze and urticaria after exposure favor anaphylaxis over an isolated reflex faint.',
          'The blood pressure has fallen suddenly.',
          'cue_misinterpretation',
          [0, 1, 2]
        ),
      ],
      reasoning: ['Recognize multisystem involvement after an exposure.'],
      debrief:
        'The combination of airway or breathing and circulatory findings changes the priority beyond skin-symptom treatment.',
    },
    {
      key: 'shock-f5',
      topic: 'Organ perfusion beyond the pressure reading',
      level: 'foundation',
      scenario:
        'A patient is being assessed for circulatory compromise. Blood pressure is 112/70 mmHg. They are newly confused and the extremities are mottled. Family confirms that the confusion is not baseline.',
      cues: [
        'Preserved measured pressure',
        'New confusion',
        'Mottled extremities',
      ],
      question:
        'Which bedside finding adds the strongest evidence of impaired organ perfusion beyond the pressure value?',
      choices: [
        right(
          'The new cerebral and peripheral perfusion abnormalities.',
          'New confusion and mottling can indicate impaired perfusion despite a preserved measured arterial pressure.',
          [0, 1, 2]
        ),
        wrong(
          'The pressure remaining above a common hypotension threshold.',
          'A threshold does not establish adequate organ blood flow in this patient.',
          'Blood pressure is often used to screen for shock.',
          'cue_misinterpretation',
          [0]
        ),
        wrong(
          'The absence of a baseline diagnosis of cognitive impairment.',
          'The relevant concern is the acute change itself, rather than whether a chronic diagnosis exists.',
          'Chronic cognitive history affects interpretation.',
          'misprioritization',
          [1]
        ),
        wrong(
          'The possibility that room temperature explains the skin appearance.',
          'Environmental effects cannot adequately explain the concurrent acute cognitive change.',
          'Cold surroundings can change skin perfusion.',
          'premature_closure',
          [1, 2]
        ),
      ],
      reasoning: ['Recognize organ-level evidence of impaired perfusion.'],
      debrief:
        'Shock assessment integrates end-organ function rather than treating one acceptable pressure as sufficient reassurance.',
    },
    {
      key: 'shock-c1',
      topic: 'Occult loss despite an early hemoglobin result',
      level: 'challenge',
      scenario:
        'After abdominal surgery, Rowan’s pulse rises from 84 to 116/min over 30 minutes. Blood pressure falls from 132/78 to 104/66 mmHg and the abdomen becomes more distended. Drain output is minimal. An early hemoglobin sample is close to the preoperative result.',
      cues: [
        'Rising pulse',
        'Falling pressure',
        'Increasing abdominal distension',
        'Minimal drain output',
        'Early hemoglobin near baseline',
      ],
      question:
        'How should the early hemoglobin result be weighed against the evolving blood-loss pattern?',
      choices: [
        right(
          'Escalate suspected concealed bleeding using the bedside trend.',
          'A coherent deterioration pattern requires assessment even when early hemoglobin and drain output appear reassuring.',
          [0, 1, 2, 3, 4]
        ),
        wrong(
          'Request a routine repeat hemoglobin before escalating the concern.',
          'An early result can lag acute blood loss; waiting for laboratory confirmation delays source assessment.',
          'Hemoglobin helps quantify blood loss.',
          'misprioritization',
          [0, 1, 4]
        ),
        wrong(
          'Treat ileus as the leading cause because the abdomen is distended.',
          'Ileus may cause distension, but does not adequately explain the new hypoperfusion trend.',
          'Postoperative distension commonly reflects ileus.',
          'premature_closure',
          [0, 1, 2]
        ),
        wrong(
          'Use the low drain output to prioritize medication-related hypotension.',
          'A quiet drain cannot exclude bleeding into a concealed compartment.',
          'Visible surgical drainage appears limited.',
          'cue_misinterpretation',
          [1, 3]
        ),
      ],
      reasoning: [
        'Integrate serial physiology with a possible concealed source.',
        'Prioritize deterioration over early negative-looking tests.',
      ],
      debrief:
        'Serial bedside changes may identify a bleeding complication before routine laboratory or drain findings confirm it.',
    },
    {
      key: 'shock-c2',
      topic: 'Fluid response and new respiratory intolerance',
      level: 'challenge',
      scenario:
        'A patient with hypotension receives a prescribed fluid challenge. Pressure rises only briefly, then returns to the previous low value. New crackles develop and oxygen requirement increases. Urine output remains low.',
      cues: [
        'Only transient pressure response',
        'New crackles',
        'Increasing oxygen need',
        'Persistent low urine output',
      ],
      question:
        'What should a transient fluid response with new respiratory intolerance change about the next bolus decision?',
      choices: [
        right(
          'Reassess responsiveness and congestion with the treating team.',
          'The limited benefit and new intolerance make an unreviewed repeat challenge potentially harmful.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Repeat it because even a brief pressure rise demonstrates ongoing need.',
          'A previous transient response does not prove current responsiveness or safety.',
          'The first challenge initially increased pressure.',
          'outdated_data',
          [0, 1, 2]
        ),
        wrong(
          'Switch directly to fluid removal based on crackles alone.',
          'Crackles matter, but the low-pressure state and uncertain mechanism need integrated assessment before reversal of strategy.',
          'New lung congestion suggests excessive fluid.',
          'premature_closure',
          [1, 2, 3]
        ),
        wrong(
          'Judge the next challenge by urine output without lung reassessment.',
          'Urine output can lag and does not capture worsening respiratory tolerance.',
          'Improved renal output is a resuscitation goal.',
          'misprioritization',
          [1, 2, 3]
        ),
      ],
      reasoning: [
        'Compare treatment benefit with developing harm.',
        'Select reassessment before repeating an intervention.',
      ],
      debrief:
        'Response and tolerance are separate questions; both must inform additional fluid decisions.',
    },
    {
      key: 'shock-c3',
      topic: 'Deterioration after central venous access',
      level: 'challenge',
      scenario:
        'Soon after central venous catheter insertion, a patient becomes acutely breathless. Blood pressure falls and the oxygen requirement rises. Breath sounds are markedly reduced on the procedure side. The postprocedure chest image has not yet been obtained.',
      cues: [
        'Recent thoracic vascular procedure',
        'Abrupt hypotension and dyspnea',
        'Rising oxygen requirement',
        'Unilateral reduction in breath sounds',
        'Image pending',
      ],
      question:
        'Which complication should lead reassessment of abrupt deterioration after central venous access?',
      choices: [
        right(
          'Suspected tension physiology needs immediate bedside assessment.',
          'Acute unilateral respiratory findings with shock after the procedure require urgent clinical assessment without waiting for routine imaging.',
          [0, 1, 2, 3, 4]
        ),
        wrong(
          'Possible line malposition should be checked on the scheduled image first.',
          'Line position matters, but imaging must not delay assessment of possible life-threatening tension physiology.',
          'The deterioration followed line placement.',
          'misprioritization',
          [0, 1, 4]
        ),
        wrong(
          'Possible pulmonary edema should lead the initial fluid-restriction plan.',
          'Unilateral absent breath sounds after a procedure favor an obstructive complication over diffuse edema.',
          'Dyspnea and low pressure can accompany cardiac dysfunction.',
          'cue_misinterpretation',
          [1, 2, 3]
        ),
        wrong(
          'Sedation-related hypoventilation should be treated as the main cause.',
          'Sedation does not adequately explain marked unilateral breath-sound reduction and shock.',
          'Procedural sedation may have been administered.',
          'premature_closure',
          [1, 3]
        ),
      ],
      reasoning: [
        'Connect timing and unilateral findings to an obstructive mechanism.',
        'Prioritize bedside emergency assessment over routine confirmation.',
      ],
      debrief:
        'A deteriorating patient may need immediate assessment and intervention before a scheduled diagnostic image is available.',
    },
    {
      key: 'shock-c4',
      topic: 'Limited heart-rate response during bleeding',
      level: 'challenge',
      scenario:
        'An older adult taking a beta blocker has black stools and dizziness. Their pulse is 72/min, near baseline. Over an hour blood pressure falls, urine output decreases and they become cooler. The latest hemoglobin is lower than the previous result.',
      cues: [
        'Beta-blocker use',
        'Black stools',
        'Pulse near baseline',
        'Falling pressure with reduced output and cool skin',
        'Hemoglobin falling',
      ],
      question:
        'How should beta-blocker exposure affect interpretation of the pulse during suspected hemorrhage?',
      choices: [
        right(
          'Possible blood-loss hypoperfusion despite absent tachycardia.',
          'Beta blockade can limit heart-rate response; the remaining perfusion and bleeding trends are concerning.',
          [0, 1, 3, 4]
        ),
        wrong(
          'The stable pulse makes clinically important blood loss unlikely.',
          'An absent tachycardia response does not exclude circulatory compromise, especially with beta blockade.',
          'Tachycardia is a common early bleeding sign.',
          'cue_misinterpretation',
          [0, 2, 3]
        ),
        wrong(
          'Medication-related hypotension explains the presentation without bleeding assessment.',
          'Medication effects may contribute, but do not account for black stools and falling hemoglobin.',
          'Beta blockers can affect circulatory responses.',
          'premature_closure',
          [0, 1, 4]
        ),
        wrong(
          'Chronic anemia should be reviewed before the pressure decline.',
          'The serial decline with new organ findings needs acute assessment, rather than a chronic explanation alone.',
          'Older adults may have pre-existing anemia.',
          'outdated_data',
          [3, 4]
        ),
      ],
      reasoning: [
        'Account for a medication-modified physiologic response.',
        'Integrate multiple markers of evolving blood loss.',
      ],
      debrief:
        'Recognize when a familiar compensatory sign may be blunted and use the remaining trajectory.',
    },
    {
      key: 'shock-c5',
      topic: 'Treatment response after anaphylaxis',
      level: 'challenge',
      scenario:
        'A patient receives emergency treatment for anaphylaxis under protocol. The hives fade and wheeze lessens. Blood pressure remains low, the voice becomes hoarse and the patient reports throat tightness. The emergency team is still present.',
      cues: [
        'Emergency anaphylaxis treatment',
        'Skin and wheeze improving',
        'Persistent low pressure',
        'New hoarse voice',
        'Throat tightness',
      ],
      question:
        'Which response indicators should guide reassessment after the initial anaphylaxis treatment?',
      choices: [
        right(
          'Persistent circulatory compromise with possible progressive airway involvement.',
          'Improving skin symptoms do not establish resolution when perfusion and upper-airway findings remain abnormal.',
          [1, 2, 3, 4]
        ),
        wrong(
          'Cutaneous recovery suggests the remaining symptoms are anxiety related.',
          'New hoarseness and persistent hypotension require objective emergency reassessment.',
          'Visible hives have improved.',
          'premature_closure',
          [1, 2, 3]
        ),
        wrong(
          'Residual lower-airway spasm should be treated before airway reassessment.',
          'A hoarse voice and throat tightness suggest upper-airway risk beyond the improving wheeze.',
          'Wheeze was prominent initially.',
          'misprioritization',
          [1, 3, 4]
        ),
        wrong(
          'The fading hives establish that the trigger is no longer active.',
          'Skin response cannot establish the state of the airway or circulation.',
          'The most visible reaction is resolving.',
          'cue_misinterpretation',
          [1, 2, 4]
        ),
      ],
      reasoning: [
        'Compare improvement in one system with persistent risk in others.',
        'Prioritize airway and circulatory endpoints.',
      ],
      debrief:
        'Multisystem reactions need multisystem reassessment; disappearance of the rash is not the endpoint.',
    },
    {
      key: 'shock-a1',
      topic: 'Pressure recovery with ongoing concealed loss',
      level: 'advanced',
      scenario:
        'An adult with pelvic trauma receives initial resuscitation and the blood pressure rises to 110/68 mmHg. They are still cool and increasingly restless. Urine output remains very low and lactate rises on the next sample. Initial hemoglobin is near the reference range, and no external bleeding is obvious. Pain medication reduces reported pain without improving the perfusion findings.',
      cues: [
        'Pelvic trauma',
        'Pressure temporarily improves',
        'Cool restlessness persists',
        'Very low urine output',
        'Rising lactate',
        'Early hemoglobin near reference range without visible loss',
        'Pain relief without perfusion improvement',
      ],
      question:
        'Which reassessment best evaluates continuing concealed blood loss after the pressure temporarily improves?',
      choices: [
        {
          text: 'Reassess hemorrhage control and serial organ perfusion before treating the pressure rise as resuscitation success.',
          explanation:
            'A pressure rise shows a treatment effect, but persistent restlessness, low output and rising lactate do not show restored perfusion. With pelvic trauma and limited early hemoglobin information, the team should reassess concealed loss and its control rather than equate an achieved pressure with recovery.',
          cues: [0, 1, 2, 3, 4, 5, 6],
        },
        {
          text: 'Use another small volume challenge and repeat lactate to establish whether the residual findings remain preload responsive.',
          explanation:
            'A further challenge may be considered by the team, but repeated volume-response testing cannot replace reassessing ongoing hemorrhage and source control. A temporary pressure response can coexist with continuing loss.',
          plausible:
            'The first pressure response suggests some volume responsiveness, while lactate is still elevated.',
          error: 'misprioritization',
          cues: [0, 1, 2, 3, 4],
        },
        {
          text: 'Use repeat hemoglobin and focused imaging as prerequisites to further bleeding intervention while preserving the achieved pressure target.',
          explanation:
            'Repeat tests can inform care, but an early near-normal count and limited imaging cannot become gates to urgent reassessment when perfusion findings are worsening. Current stability determines the diagnostic and control pathway.',
          plausible:
            'Objective test confirmation may feel necessary before committing to another hemorrhage intervention.',
          error: 'outdated_data',
          cues: [1, 2, 3, 4, 5],
        },
        {
          text: 'Use improved pressure and analgesic response to prioritize nonhemorrhagic causes while continuing the present observation schedule.',
          explanation:
            'Other causes deserve assessment, but analgesia reduced pain without improving the organ findings. The mechanism and trajectory still require active concealed-loss reassessment rather than a routine observation plan.',
          plausible:
            'Pain relief and an improved pressure make a stress-mediated component plausible.',
          error: 'premature_closure',
          cues: [0, 1, 2, 5, 6],
        },
      ],
      reasoning: [
        'Reconcile pressure improvement with worsening organ-level indicators.',
        'Anticipate continued concealed loss and prioritize source assessment.',
      ],
      conflict:
        'Improved pressure and reassuring initial hemoglobin conflict with persistent peripheral and organ hypoperfusion.',
      anticipation:
        'Prepare for recurrent hemodynamic collapse and definitive hemorrhage control.',
      uncertainty:
        'Lactate alone is nonspecific, but its trend adds concern when aligned with other perfusion abnormalities.',
      debrief:
        'Evaluate sustained tissue recovery and bleeding control rather than the transient response of a single vital sign.',
    },
    {
      key: 'shock-a2',
      topic: 'Mixed low output and fluid intolerance',
      level: 'advanced',
      scenario:
        'An adult with infection and chronic ventricular dysfunction remains hypotensive after initial fluids. A monitored passive-leg-raise assessment produces no meaningful stroke-volume increase. Crackles and oxygen need are increasing, and urine output remains low. The limbs are cool despite a warm examination earlier. Lactate remains elevated and bedside imaging shows reduced ventricular contraction.',
      cues: [
        'Infection with prior ventricular dysfunction',
        'Persistent hypotension after fluid',
        'No meaningful stroke-volume response to passive leg raise',
        'Increasing crackles and oxygen need',
        'Persistent oliguria',
        'Cooler limbs than earlier',
        'Reduced contraction with persistent lactate elevation',
      ],
      question:
        'Which plan best balances low-output findings against worsening fluid tolerance?',
      choices: [
        {
          text: 'Request circulatory-support review with repeated perfusion and fluid-tolerance assessment rather than another empiric bolus.',
          explanation:
            'The measured lack of stroke-volume response and worsening respiratory tolerance challenge additional empiric fluid. Reduced contraction and ongoing hypoperfusion require team assessment of mixed mechanisms and appropriate circulatory support; neither a low ejection pattern nor a sepsis label selects the treatment alone.',
          cues: [0, 1, 2, 3, 4, 5, 6],
        },
        {
          text: 'Request a smaller fluid challenge because the infective trigger and oliguria suggest residual preload dependence.',
          explanation:
            'Infection and low urine output do not establish current preload dependence. The dynamic assessment and worsening congestion provide more relevant evidence about the likely benefit and harm of additional volume.',
          plausible:
            'Distributive illness and oliguria commonly lead clinicians to consider inadequate filling.',
          error: 'cue_misinterpretation',
          cues: [0, 2, 3, 4],
        },
        {
          text: 'Request an inotrope-focused plan based on reduced contraction, postponing the broader sepsis-resuscitation review until output improves.',
          explanation:
            'Reduced contraction is relevant but does not establish the sole shock mechanism or remove infection-related circulatory needs. A narrow treatment-first explanation could miss coexisting vasodilation and other contributors.',
          plausible:
            'The ultrasound finding appears to identify a specific pump problem that can explain the cool limbs.',
          error: 'premature_closure',
          cues: [0, 1, 5, 6],
        },
        {
          text: 'Request active fluid-removal review based on worsening oxygenation, using decongestion response to choose later circulatory support.',
          explanation:
            'Fluid intolerance needs attention, but persistent hypotension, low output and organ hypoperfusion require coordinated assessment of support and removal. An isolated decongestion-first plan may worsen circulation.',
          plausible:
            'Crackles and rising oxygen needs create a real concern about the cost of further intravascular volume.',
          error: 'misprioritization',
          cues: [1, 3, 4, 6],
        },
      ],
      reasoning: [
        'Integrate dynamic response, treatment tolerance and ventricular findings.',
        'Anticipate mixed shock and choose reassessment of circulatory support.',
      ],
      conflict:
        'An infectious presentation suggests vasodilation while current flow and congestion findings suggest a concurrent pump component.',
      anticipation:
        'Escalate circulatory and respiratory support while avoiding added congestion from unhelpful fluid.',
      uncertainty:
        'The examination does not quantify each shock component or set a medication regimen.',
      debrief:
        'Shock mechanisms can coexist and change; the next intervention follows current responsiveness and tolerance.',
    },
    {
      key: 'shock-a3',
      topic: 'Abrupt deterioration after positive-pressure ventilation',
      level: 'advanced',
      scenario:
        'A ventilated trauma patient becomes suddenly hypotensive after repositioning. Oxygen saturation falls, airway pressures rise and breath sounds are much quieter on one side. The airway depth marking is unchanged. Neck veins are difficult to assess under the collar, and the previous chest image showed no pneumothorax. A fluid infusion has not restored pressure.',
      cues: [
        'Ventilated trauma patient after repositioning',
        'Abrupt hypotension and desaturation',
        'Rising airway pressures',
        'Unilateral quieter breath sounds',
        'Unchanged airway depth marking',
        'Prior image without pneumothorax',
        'No pressure response to fluid',
      ],
      question:
        'Which bedside reassessment best distinguishes tension physiology from airway causes in the suddenly unstable ventilated patient?',
      choices: [
        {
          text: 'Request an immediate airway, circuit and bilateral chest assessment with preparation for urgent pleural intervention if tension physiology is supported.',
          explanation:
            'Sudden respiratory and circulatory deterioration with high airway pressures and asymmetric air entry requires a rapid bedside search for airway and intrathoracic obstruction. A previous image or unchanged tube marking cannot exclude the current problem; the team must not delay treatment of a clinically supported tension state for routine imaging.',
          cues: [0, 1, 2, 3, 4, 5, 6],
        },
        {
          text: 'Request controlled tube repositioning for presumed mainstem placement and use the oxygen response to decide whether pleural assessment is needed.',
          explanation:
            'Movement-related mainstem placement is possible even with an unchanged marking, but it is not established. A tube-first causal trial should not defer parallel chest assessment of a possible obstructive shock mechanism.',
          plausible:
            'Repositioning preceded asymmetric ventilation, making endobronchial tube movement a credible competing cause.',
          error: 'premature_closure',
          cues: [0, 1, 2, 3],
        },
        {
          text: 'Request a dynamic fluid-response assessment and use the stroke-volume change to choose support before revising the ventilation plan.',
          explanation:
            'Hemodynamic assessment can help, but an airway or intrathoracic obstructive problem needs prompt bedside evaluation. Further volume testing cannot resolve the sudden high-pressure, unilateral respiratory pattern.',
          plausible:
            'Hypotension after movement can suggest a change in venous return or preload.',
          error: 'misprioritization',
          cues: [0, 1, 2, 6],
        },
        {
          text: 'Request portable chest imaging while maintaining current ventilation, using the image to determine the next pleural intervention.',
          explanation:
            'Imaging may contribute, but it should not become a prerequisite for immediate bedside assessment and treatment of a clinically supported tension state in an unstable patient. The prior image describes an earlier condition.',
          plausible:
            'Both tube malposition and pleural air can be clarified by a chest image when a patient is sufficiently stable.',
          error: 'outdated_data',
          cues: [1, 2, 3, 4, 5],
        },
      ],
      reasoning: [
        'Compare two plausible immediately reversible mechanical causes.',
        'Anticipate arrest and prioritize bedside differentiation without imaging delay.',
      ],
      conflict:
        'An unchanged tube marking and older negative image are reassuring, but current mechanical and perfusion findings indicate a new emergency.',
      anticipation:
        'Prepare for rapid intervention if tension physiology or major airway displacement is identified.',
      uncertainty:
        'Breath sounds and airway pressures alone do not reliably distinguish every mechanical cause.',
      debrief:
        'Advanced reassessment uses competing hypotheses to guide immediate bedside checks rather than waiting for a perfect diagnostic label.',
    },
    {
      key: 'shock-a4',
      topic: 'Recurrent anaphylaxis with competing cardiac concerns',
      level: 'advanced',
      scenario:
        'An adult initially improves after emergency anaphylaxis treatment. During observation, throat tightness and dizziness recur with hoarseness and blood pressure falling to 84/50 mmHg. The rash has not returned and there is no known new exposure. The patient takes a beta blocker and has coronary artery disease. The pulse is 72/min and chest pressure appears. The responding team arrives as the patient asks whether further allergy treatment would be unsafe.',
      cues: [
        'Initial improvement after anaphylaxis treatment',
        'Recurrent throat tightness and hoarseness',
        'Recurrent hypotension with dizziness',
        'No second rash or known new exposure',
        'Beta-blocker treatment',
        'Coronary disease with new chest pressure',
        'A pulse of 72/min despite circulatory compromise',
      ],
      question:
        'How should the team balance recurrent airway and shock findings against the new cardiac symptoms when selecting the next response?',
      choices: [
        {
          text: 'Reactivate the airway and shock response, with team review of recurrent anaphylaxis treatment and concurrent cardiac evaluation.',
          explanation:
            'Recurrent airway compromise with falling pressure after initial improvement remains an emergency despite absent rash or new exposure. Beta blockade may blunt tachycardia, while coronary symptoms require concurrent assessment rather than replacing the airway and shock response. The responding team determines treatment and escalation.',
          cues: [0, 1, 2, 3, 4, 5, 6],
        },
        {
          text: 'Prioritize the chest-pressure pathway and clarify ischemia before reconsidering anaphylaxis treatment because of the coronary history.',
          explanation:
            'Cardiac assessment is important, but making it a prerequisite to the airway and shock response risks delaying treatment of recurrent life-threatening allergic physiology. The two concerns must be assessed together.',
          plausible:
            'Coronary disease and new chest pressure raise a genuine concern about myocardial ischemia and treatment effects.',
          error: 'misprioritization',
          cues: [1, 2, 4, 5, 6],
        },
        {
          text: 'Prioritize medication-associated hypotension and use a fluid response to distinguish it from recurrence before repeating allergy treatment.',
          explanation:
            'Medication effects can contribute, but the recurrent hoarseness and throat tightness are not explained by isolated hypotension. A fluid-response trial cannot settle the airway risk or justify delaying the emergency reassessment.',
          plausible:
            'Recent treatment, beta blockade and a relatively normal pulse make a medication contribution plausible.',
          error: 'premature_closure',
          cues: [0, 1, 2, 4, 6],
        },
        {
          text: 'Prioritize a repeat exposure and skin assessment, using evidence of a new trigger to select the next emergency treatment.',
          explanation:
            'A recurrent reaction does not require a newly identified exposure or a recurrent rash. Trigger investigation is useful, but the current airway and circulatory abnormalities determine the urgency.',
          plausible:
            'The first reaction had an identifiable trigger, and normal skin can make a second allergic episode seem less likely.',
          error: 'cue_misinterpretation',
          cues: [0, 1, 2, 3],
        },
      ],
      reasoning: [
        'Evaluate recurrence from the airway and perfusion trajectory rather than requiring skin signs or a new exposure.',
        'Account for beta blockade and competing coronary risk while prioritizing the current life-threatening physiology.',
      ],
      conflict:
        'Normal skin and a relatively normal pulse appear reassuring, while new coronary symptoms add concern about treatment risk; recurrent airway compromise and falling pressure still demand an emergency response.',
      anticipation:
        'Prepare for worsening airway or circulatory compromise and preserve serial cardiac and perfusion findings while the team selects and evaluates treatment.',
      uncertainty:
        'The findings do not establish the mechanism of chest pressure or exclude concurrent ischemia, and they do not authorize an independent medication decision.',
      debrief:
        'Advanced judgment coordinates competing risks instead of choosing one concern to explain everything. A cardiac history changes the assessment and monitoring required without making recurrent airway and shock findings safe to defer.',
    },
    {
      key: 'shock-a5',
      topic: 'Normal lactate with clinically worsening perfusion',
      level: 'advanced',
      scenario:
        'An older adult is monitored after a large gastrointestinal bleed. Lactate remains within the local reference range, and pressure is acceptable while lying flat. They are taking a beta blocker. New confusion, cool mottled knees and falling urine output develop over the next hour. Visible bleeding has slowed, but they become faint when the head of the bed is raised.',
      cues: [
        'Recent large gastrointestinal bleed',
        'Lactate within reference range',
        'Acceptable supine pressure',
        'Beta-blocker use',
        'New confusion and mottling',
        'Falling urine output',
        'Presyncope with position despite less visible bleeding',
      ],
      question:
        'Which plan best evaluates worsening cerebral, renal and peripheral perfusion despite a normal lactate?',
      choices: [
        {
          text: 'Request urgent bleeding and perfusion review using current organ trends and a reassessment of loss and volume response.',
          explanation:
            'New confusion, mottling and low output converge on possible continuing hypoperfusion despite normal lactate and an acceptable supine pressure. The beta blocker can limit the pulse response. Reassess ongoing loss and the present circulatory state rather than require another positive laboratory or postural test.',
          cues: [0, 2, 3, 4, 5, 6],
        },
        {
          text: 'Request beta-blocker and blood-pressure treatment review, then repeat supine pressure before re-entering the hemorrhage pathway.',
          explanation:
            'Medication review is relevant, but it does not account for the new cerebral, renal and peripheral changes or establish that bleeding-related hypoperfusion has resolved. A reassuring supine reading should not become the gate to further assessment.',
          plausible:
            'Medication-related postural symptoms are plausible when the resting pulse and pressure appear acceptable.',
          error: 'premature_closure',
          cues: [1, 2, 3, 4, 5, 6],
        },
        {
          text: 'Request repeat lactate and hemoglobin, using their direction to decide whether the positional symptoms reflect ongoing loss.',
          explanation:
            'Serial tests may inform the evaluation but should not delay review of the current organ-perfusion pattern. A normal lactate and reduced visible loss cannot independently exclude circulatory compromise.',
          plausible:
            'Laboratory trends can appear more objective than symptoms occurring with a change in position.',
          error: 'cue_misinterpretation',
          cues: [0, 1, 4, 5, 6],
        },
        {
          text: 'Request graded head-up testing with paired pressures to quantify postural intolerance before revising the resuscitation plan.',
          explanation:
            'Provoking further positional symptoms adds risk and is unnecessary when new confusion, mottling and low output already support urgent assessment. This is more than isolated dizziness in an otherwise recovered patient.',
          plausible:
            'Symptoms are most obvious when the head of the bed is raised, suggesting an orthostatic assessment.',
          error: 'misprioritization',
          cues: [2, 4, 5, 6],
        },
      ],
      reasoning: [
        'Weigh several bedside trends against a normal biomarker and posture-dependent pressure.',
        'Anticipate decompensation and choose a comprehensive bleeding reassessment.',
      ],
      conflict:
        'Normal lactate and acceptable supine pressure conflict with worsening cerebral, renal and peripheral findings.',
      anticipation:
        'Avoid further provoked presyncope and prepare for renewed hemodynamic support if loss persists.',
      uncertainty:
        'No single biomarker establishes adequate tissue perfusion or confirms that hemorrhage has stopped.',
      debrief:
        'Advanced reasoning gives converging clinical trends appropriate weight even when familiar screening values remain reassuring.',
    },
  ]
)

const sepsis = group(
  'sepsis_septic_shock',
  'sepsis_infectious',
  ['sepsis', 'deterioration', 'fluids'],
  [
    {
      key: 'sepsis-f1',
      topic: 'New confusion during infection',
      level: 'foundation',
      scenario:
        'An older adult is being assessed for a urinary infection. The family reports that the patient is normally fully oriented. The patient is now inattentive and cannot follow a familiar instruction. A nurse is completing the first assessment.',
      cues: [
        'Possible urinary infection',
        'Acute change from normal cognition',
      ],
      question:
        'Which observation is the clearest acute organ-function change during the suspected urinary infection?',
      choices: [
        right(
          'The new change in attention and ability to follow instructions.',
          'An acute mental-status change during possible infection may indicate organ dysfunction and warrants prompt evaluation; it is not explained by age alone.',
          [0, 1]
        ),
        wrong(
          'The need for family assistance to describe the usual routine.',
          'Family history is useful baseline evidence, but obtaining collateral information is not itself a sign of acute organ dysfunction.',
          'Reliance on family can resemble impaired independence.',
          'cue_misinterpretation',
          [1]
        ),
        wrong(
          'The suspected urinary source before the culture result is available.',
          'A suspected source motivates assessment, but it does not itself demonstrate organ dysfunction. The acute cognitive change is the relevant finding here.',
          'A urinary infection is a plausible cause of serious illness.',
          'misprioritization',
          [0, 1]
        ),
        wrong(
          'The patient’s age and expected vulnerability to an unfamiliar setting.',
          'Age may increase vulnerability, but attributing the change to an unfamiliar setting prematurely discounts the documented acute difference from baseline.',
          'Older patients can become disoriented in hospital.',
          'premature_closure',
          [0, 1]
        ),
      ],
      reasoning: [
        'Recognize an acute change from the person’s cognitive baseline.',
      ],
      debrief:
        'A baseline comparison gives a symptom clinical meaning. New confusion in a person with possible infection should enter the deterioration assessment rather than being dismissed as an expected feature of age.',
    },
    {
      key: 'sepsis-f2',
      topic: 'Cultures before urgent antimicrobials',
      level: 'foundation',
      scenario:
        'An adult has a probable severe infection and an urgent antimicrobial prescription. Blood-culture bottles and a trained collector are available at the bedside. The medicine is ready for administration. No culture sample has yet been obtained.',
      cues: [
        'Urgent antimicrobial treatment prescribed',
        'Blood cultures can be collected promptly without a substantial delay',
      ],
      question:
        'How should prompt blood-culture collection be sequenced with the urgent prescribed antimicrobial?',
      choices: [
        right(
          'Collect the blood cultures promptly, then administer the prescribed antimicrobial.',
          'Cultures obtained before antimicrobial exposure may improve organism identification. Collection should occur promptly and should not create a substantial delay in urgent treatment.',
          [0, 1]
        ),
        wrong(
          'Administer the antimicrobial, then collect cultures at the next fever spike.',
          'Waiting for another fever spike is unnecessary and later exposure may reduce culture yield. The available bedside collection can precede treatment without a substantial delay.',
          'A fever spike may seem the best moment to capture circulating organisms.',
          'misprioritization',
          [0, 1]
        ),
        wrong(
          'Collect a urine sample first and use that result to decide whether blood cultures are needed.',
          'A urine result cannot replace timely blood cultures when these are indicated in a severe infection. Waiting for a source sample result delays the prescribed treatment sequence.',
          'A suspected source can draw attention toward the local specimen.',
          'premature_closure',
          [0, 1]
        ),
        wrong(
          'Obtain the first culture after the antimicrobial infusion to assess whether treatment has worked.',
          'An immediate postinfusion culture does not establish treatment success and may be less informative for identifying the initial pathogen.',
          'Post-treatment testing can be mistaken for a direct measure of early response.',
          'cue_misinterpretation',
          [0, 1]
        ),
      ],
      reasoning: [
        'Recognize when pre-treatment sampling can occur without delaying urgent care.',
      ],
      debrief:
        'Preserve diagnostic information when it can be obtained promptly. Do not turn specimen collection into a reason to defer urgent antimicrobial treatment.',
    },
    {
      key: 'sepsis-f3',
      topic: 'Interpreting lactate in suspected sepsis',
      level: 'foundation',
      scenario:
        'A patient with suspected pneumonia has a lactate above the laboratory reference range. The nurse is preparing a handover. No cause for the elevation has yet been established. A repeat clinical assessment is planned.',
      cues: [
        'Suspected infection',
        'Elevated lactate without an established cause',
      ],
      question:
        'What can the elevated lactate establish during the suspected pneumonia assessment?',
      choices: [
        right(
          'Lactate adds concern and requires interpretation alongside perfusion and other clinical findings.',
          'An elevated lactate can support risk assessment but does not independently diagnose septic shock or establish its mechanism. The clinical pattern and alternative causes matter.',
          [0, 1]
        ),
        wrong(
          'Lactate establishes septic shock and identifies infection as the cause of the perfusion problem.',
          'A single biomarker cannot establish the complete diagnosis or exclude alternative causes of elevation.',
          'Lactate is commonly measured during a sepsis evaluation.',
          'premature_closure',
          [0, 1]
        ),
        wrong(
          'Lactate determines the fluid volume needed to restore this patient’s circulating volume.',
          'A lactate value does not directly measure circulating volume or fluid responsiveness. Bedside assessment and reassessment are needed.',
          'A high lactate often accompanies resuscitation decisions.',
          'cue_misinterpretation',
          [1]
        ),
        wrong(
          'Lactate establishes inadequate oxygen delivery as the dominant cause of the abnormal result.',
          'An elevation does not by itself establish a single mechanism such as reduced oxygen delivery. Other physiological and metabolic contributors require clinical interpretation.',
          'Lactate is often taught as a marker associated with tissue hypoxia.',
          'cue_misinterpretation',
          [0, 1]
        ),
      ],
      reasoning: [
        'Distinguish a risk-related biomarker from a definitive diagnosis or treatment target.',
      ],
      debrief:
        'Describe what a test supports and what it cannot establish. Lactate contributes to a whole-patient assessment rather than supplying a diagnosis or resuscitation prescription by itself.',
    },
    {
      key: 'sepsis-f4',
      topic: 'Reduced urine during a severe infection',
      level: 'foundation',
      scenario:
        'An adult is receiving care for a severe infection. Urine output is much lower than the patient’s usual pattern. The catheter tubing is unkinked and the bag is below the bladder. The nurse is deciding what the observation means.',
      cues: [
        'Severe infection',
        'Reduced urine output despite apparently patent drainage',
      ],
      question:
        'Which concern should guide assessment of low urine output after simple drainage problems have been checked?',
      choices: [
        right(
          'Possible impaired renal perfusion or acute kidney dysfunction.',
          'Reduced output during severe illness may indicate impaired perfusion or kidney dysfunction. Drainage checks are useful but do not explain the low output once a simple tubing problem is less likely.',
          [0, 1]
        ),
        wrong(
          'Expected reduction in urine because infection increases the metabolic rate.',
          'An expected metabolic response does not adequately explain a meaningful new reduction in output. It should be evaluated rather than normalized.',
          'Illness changes fluid needs and insensible losses.',
          'cue_misinterpretation',
          [0, 1]
        ),
        wrong(
          'Confirmed urinary obstruction requiring catheter replacement before assessment.',
          'A patent-looking system does not rule out every obstruction, but the finding does not establish obstruction or justify substituting catheter replacement for clinical assessment.',
          'Low drainage commonly prompts concern about the catheter.',
          'premature_closure',
          [1]
        ),
        wrong(
          'A urine-concentration change that can be evaluated after the infection resolves.',
          'Reduced volume is a current organ-function observation, not merely a concentration finding. Deferring assessment risks missing deterioration.',
          'Concentrated urine during illness is familiar and may seem self-limiting.',
          'misprioritization',
          [0, 1]
        ),
      ],
      reasoning: [
        'Recognize reduced urine as an organ-function cue after checking simple drainage problems.',
      ],
      debrief:
        'An output trend belongs in the perfusion assessment. Check the measurement system while retaining a clinical explanation for a genuinely reduced volume.',
    },
    {
      key: 'sepsis-f5',
      topic: 'An anatomical infection source',
      level: 'foundation',
      scenario:
        'A patient has a severe abdominal infection. Imaging shows a drainable infected collection. Antimicrobials have been started. The treating team is discussing the next part of management.',
      cues: [
        'Severe infection with a drainable collection',
        'Antimicrobials have already started',
      ],
      question:
        'What additional management need follows identification of a drainable infected collection?',
      choices: [
        right(
          'Prompt specialist assessment for source control of the infected collection.',
          'A source such as an infected collection may require drainage or another intervention in addition to antimicrobials. Early coordination addresses the continuing anatomical source.',
          [0, 1]
        ),
        wrong(
          'Serial inflammatory markers to determine when a procedural assessment becomes necessary.',
          'Markers can help follow illness but should not replace timely assessment of a known source requiring control.',
          'Laboratory trends can seem a less invasive way to judge whether the collection is resolving.',
          'misprioritization',
          [0, 1]
        ),
        wrong(
          'A longer antimicrobial course before considering whether the collection needs an intervention.',
          'Simply extending therapy does not address an anatomical source that may require drainage. The team should assess source control rather than assume medicine alone will suffice.',
          'Antimicrobials are already treating the infection.',
          'premature_closure',
          [0, 1]
        ),
        wrong(
          'A repeat diagnostic scan as the first step because the original collection may already have cleared.',
          'A new scan may be useful in some circumstances, but no new evidence suggests the known drainable source has cleared. It should not displace prompt specialist review.',
          'Starting treatment can create an expectation of early radiological improvement.',
          'cue_misinterpretation',
          [0, 1]
        ),
      ],
      reasoning: [
        'Recognize when infection management includes control of an anatomical source.',
      ],
      debrief:
        'Identify the source as well as the syndrome. Antimicrobial treatment and source-control assessment address related but different parts of the problem.',
    },
    {
      key: 'sepsis-c1',
      topic: 'Deterioration despite a falling temperature',
      level: 'challenge',
      scenario:
        'A patient with pneumonia receives the first prescribed antimicrobial. Over two hours the temperature falls after an antipyretic. Respiratory rate rises, the oxygen requirement increases and the patient becomes less attentive. Blood pressure is lower than on admission. The patient says the fever is better.',
      cues: [
        'Temperature decreased after an antipyretic',
        'Rising respiratory rate and oxygen requirement',
        'New inattention',
        'Blood pressure falling over two hours',
      ],
      question:
        'Which response indicators should take priority when fever falls but respiratory, cognitive and pressure findings worsen?',
      choices: [
        right(
          'Reassess respiratory support and perfusion urgently because the organ-function trends are worsening.',
          'Temperature can fall after an antipyretic without reversing infection-related organ dysfunction. Breathing, cognition and pressure trends require urgent reassessment and escalation.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Use the temperature response to support the current plan and repeat the full observations after the next antimicrobial.',
          'The fever response does not account for worsening organ findings. Waiting for another dose delays assessment of present deterioration.',
          'The most recognizable infection symptom has improved after treatment.',
          'outdated_data',
          [0, 1, 2, 3]
        ),
        wrong(
          'Review whether the initial antimicrobial spectrum was adequate before reassessing the oxygen and pressure changes.',
          'Spectrum review is important, but it should occur alongside rather than before urgent bedside support and organ assessment.',
          'Deterioration after the first dose raises concern about treatment coverage.',
          'misprioritization',
          [1, 2, 3]
        ),
        wrong(
          'Attribute the increased breathing effort to fever-related demand and use the next temperature to reassess it.',
          'The temperature is falling while respiratory and cognitive findings worsen, making a fever-only explanation inadequate.',
          'Fever commonly increases respiratory rate and metabolic demand.',
          'premature_closure',
          [0, 1, 2]
        ),
      ],
      reasoning: [
        'Compare symptom relief with concurrent organ-function trends.',
        'Prioritize deterioration assessment over one reassuring response marker.',
      ],
      debrief:
        'Judge treatment response across systems and against timing. A change produced by a symptomatic medicine may not reflect recovery of perfusion or gas exchange.',
    },
    {
      key: 'sepsis-c2',
      topic: 'Fluid response with new respiratory intolerance',
      level: 'challenge',
      scenario:
        'An adult with suspected sepsis receives an initial prescribed crystalloid bolus. Blood pressure rises briefly and then falls again. New crackles appear and oxygen requirement increases. Urine output remains low. The next bolus has not been started.',
      cues: [
        'Transient pressure response to an initial bolus',
        'Recurrent hypotension',
        'New crackles with increasing oxygen requirement',
        'Persistently low urine output',
      ],
      question:
        'What should the transient pressure response and new crackles change about further fluid in suspected sepsis?',
      choices: [
        right(
          'Request prompt reassessment of fluid responsiveness and tolerance before further volume is prescribed.',
          'A temporary pressure response does not establish that more fluid will help, and new respiratory intolerance increases the potential harm. Ongoing hypotension also requires timely review of the wider hemodynamic plan.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Use the transient pressure increase as evidence of responsiveness and proceed with the same bolus sequence.',
          'The response was not sustained and the patient now has signs of intolerance. Earlier responsiveness cannot be assumed to persist.',
          'The first bolus produced an observable improvement.',
          'outdated_data',
          [0, 1, 2]
        ),
        wrong(
          'Use the low urine output as the primary endpoint and continue volume until output returns to baseline.',
          'Urine output can lag or reflect kidney dysfunction; using it alone can promote over-resuscitation when respiratory tolerance is worsening.',
          'Urine output is a familiar perfusion endpoint.',
          'cue_misinterpretation',
          [2, 3]
        ),
        wrong(
          'Classify the crackles as heart failure and prioritize active fluid removal before the pressure trend is reviewed.',
          'Congestion is relevant, but the patient remains hypotensive and needs an integrated assessment before fluid removal is selected.',
          'New crackles often prompt a diuretic-focused explanation.',
          'premature_closure',
          [1, 2]
        ),
      ],
      reasoning: [
        'Integrate the duration of a fluid response with evidence of intolerance.',
        'Choose reassessment that addresses both under-resuscitation and excess fluid risk.',
      ],
      debrief:
        'A fluid decision depends on benefit and tolerance now. Avoid converting one transient response or one organ marker into an automatic repeat-volume rule.',
    },
    {
      key: 'sepsis-c3',
      topic: 'Culture collection when access is difficult',
      level: 'challenge',
      scenario:
        'A patient with probable septic shock has urgent antimicrobial treatment prescribed. Attempts to obtain blood cultures have been unsuccessful. The medicine is ready and the team has already spent substantial time seeking a sample. Pressure is falling and mentation is worsening. A clinician is at the bedside.',
      cues: [
        'Probable septic shock with urgent treatment prescribed',
        'Substantial delay from unsuccessful culture attempts',
        'Falling pressure',
        'Worsening mentation',
      ],
      question:
        'How should the team handle unsuccessful culture collection that is substantially delaying urgent shock treatment?',
      choices: [
        right(
          'Escalate the sampling difficulty and give the prescribed antimicrobial without further substantial delay.',
          'Cultures are ideally obtained first, but unsuccessful collection should not prolong a substantial delay in treating shock. Document the timing and coordinate further sampling with the team.',
          [0, 1, 2, 3]
        ),
        wrong(
          'Continue seeking paired cultures before releasing the antimicrobial because pretreatment identification determines therapy.',
          'Identification matters, but the current shock pattern makes a further substantial treatment delay unsafe. The ideal sampling sequence is not a prerequisite at any cost.',
          'Pretreatment cultures improve diagnostic yield and later targeting.',
          'misprioritization',
          [0, 1, 2]
        ),
        wrong(
          'Use a urine culture as the substitute that must be completed before administering the antimicrobial.',
          'A different specimen may help identify a source but does not solve the treatment delay or substitute for indicated blood cultures.',
          'A urine specimen may be easier to obtain than another venipuncture.',
          'cue_misinterpretation',
          [0, 1]
        ),
        wrong(
          'Wait for an elevated inflammatory biomarker to justify proceeding without the preferred culture sequence.',
          'The clinical emergency already justifies prompt treatment. A biomarker should not become an additional barrier to the prescribed urgent therapy.',
          'A supporting result may seem necessary when an ideal diagnostic step cannot be completed.',
          'premature_closure',
          [0, 2, 3]
        ),
      ],
      reasoning: [
        'Weigh the diagnostic benefit of pretreatment cultures against an increasing treatment delay.',
        'Prioritize urgent therapy while preserving documentation and a coordinated sampling plan.',
      ],
      debrief:
        'Apply a preferred sequence in context. Diagnostic sampling should support timely treatment, with a different plan when repeated attempts are delaying care during shock.',
    },
    {
      key: 'sepsis-c4',
      topic: 'Persistent illness with an unresolved source',
      level: 'challenge',
      scenario:
        'A patient with abdominal sepsis remains tachycardic after initial resuscitation and antimicrobials. Imaging now identifies an obstructed infected collecting system. Blood pressure requires continuing support. The fever has fallen slightly. The nurse is preparing a focused escalation.',
      cues: [
        'Persistent illness after initial antimicrobial treatment',
        'Obstructed infected collecting system on imaging',
        'Continuing hemodynamic support',
        'Slightly improved fever',
      ],
      question:
        'Which unresolved need should lead escalation after imaging identifies an infected urinary obstruction?',
      choices: [
        right(
          'Urgent specialist evaluation of drainage or other source control.',
          'An obstructed infected system can sustain severe illness despite antimicrobial exposure. The anatomical finding and persistent support requirement make source-control coordination time-sensitive.',
          [0, 1, 2, 3]
        ),
        wrong(
          'An additional temperature trend before requesting a procedure because the fever is beginning to respond.',
          'The fever trend does not resolve the obstruction or the continuing hemodynamic problem. Waiting for another trend delays review of a known source.',
          'A falling fever suggests that antimicrobials may be starting to work.',
          'outdated_data',
          [1, 2, 3]
        ),
        wrong(
          'An antimicrobial change as the main next step before reviewing the need to relieve the obstruction.',
          'Coverage may require review, but changing therapy does not address the anatomical obstruction. Source control and antimicrobial review should be coordinated.',
          'Persistent tachycardia after treatment can suggest inadequate coverage.',
          'misprioritization',
          [0, 1, 2]
        ),
        wrong(
          'A repeat blood culture to establish whether the obstruction is responsible for the instability.',
          'A culture result cannot determine whether a known infected obstruction requires prompt intervention, and should not delay specialist assessment.',
          'Microbiological confirmation seems helpful before an invasive procedure.',
          'cue_misinterpretation',
          [1, 2]
        ),
      ],
      reasoning: [
        'Connect persistent support needs with the newly identified anatomical source.',
        'Prioritize source-control assessment rather than waiting for a partial symptom response.',
      ],
      debrief:
        'Reassess whether the treatment addresses the source. A small improvement in fever does not establish control of an infected obstruction.',
    },
    {
      key: 'sepsis-c5',
      topic: 'Normal temperature during a worsening infection pattern',
      level: 'challenge',
      scenario:
        'An immunosuppressed adult reports new productive cough. Temperature remains within the reference range. During an hour of observation the patient becomes more tachypneic and needs increasing oxygen. They are newly drowsy. The triage note described the illness as a mild respiratory infection.',
      cues: [
        'Immunosuppression with possible respiratory infection',
        'No measured fever',
        'Increasing oxygen need and tachypnea over an hour',
        'New drowsiness',
        'Earlier low-risk triage label',
      ],
      question:
        'How should worsening oxygen needs and drowsiness change the earlier low-risk infection assessment despite no fever?',
      choices: [
        right(
          'The current organ-function changes indicate serious deterioration despite the absent fever.',
          'Infection-related deterioration may occur without fever, particularly in vulnerable patients. New respiratory and mental-status changes should outweigh the earlier mild label.',
          [0, 1, 2, 3, 4]
        ),
        wrong(
          'The unchanged temperature supports the earlier triage category while the cough is investigated.',
          'A normal temperature cannot exclude serious infection or outweigh worsening oxygenation and consciousness.',
          'Fever is a familiar infection-screening cue.',
          'outdated_data',
          [1, 2, 3, 4]
        ),
        wrong(
          'The oxygen requirement should be attributed to chronic lung disease until a new infiltrate is confirmed.',
          'No established chronic explanation accounts for the new trend. Imaging may help, but confirmation should not precede escalation of current deterioration.',
          'Respiratory symptoms often prompt a pulmonary rather than systemic explanation.',
          'premature_closure',
          [0, 2, 3]
        ),
        wrong(
          'The drowsiness should be evaluated after the oxygen target is reached because it is probably fatigue.',
          'Drowsiness is part of the urgent whole-patient assessment and may indicate respiratory or circulatory compromise. Treating it as fatigue separates a clinically relevant cue.',
          'A tiring patient with a cough may appear simply exhausted.',
          'misprioritization',
          [2, 3]
        ),
      ],
      reasoning: [
        'Recognize that absence of fever does not exclude a serious infection pattern.',
        'Reprioritize using current respiratory and cognitive trends rather than the earlier label.',
      ],
      debrief:
        'Update risk when the patient changes. Familiar screening features and an earlier reassuring classification should not override new organ dysfunction.',
    },
    {
      key: 'sepsis-a1',
      topic: 'Lactate improvement with worsening organ perfusion',
      level: 'advanced',
      scenario:
        'An adult with septic shock receives initial fluid and prescribed vasopressor support. Lactate decreases on the repeat sample and the pressure target is reached. Over the next hour urine output falls and the patient becomes more confused. Their extremities become mottled. Oxygen requirement rises after a positive fluid balance. The team is reviewing whether resuscitation can be reduced.',
      cues: [
        'Septic shock under active treatment',
        'Falling lactate',
        'Pressure target reached on support',
        'Falling urine output',
        'Increasing confusion and mottling',
        'Rising oxygen requirement',
        'Positive fluid balance',
      ],
      question:
        'Which evaluation best resolves falling lactate and target pressure alongside worsening organ perfusion and oxygen needs?',
      choices: [
        right(
          'Reassess organ perfusion, fluid tolerance and the source while reviewing the ongoing support requirement.',
          'Improved pressure and lactate are useful but do not establish adequate whole-patient perfusion. New organ and respiratory findings require evaluation of unresolved shock, treatment effects and source control before de-escalation.',
          [0, 1, 2, 3, 4, 5, 6]
        ),
        wrong(
          'Use the lactate decrease and pressure target to begin reducing support, with urine output as the later check.',
          'The new organ findings undermine the assumption that recovery is secure. A later output check does not address current cognitive, peripheral and respiratory deterioration.',
          'Two commonly used resuscitation measures have improved.',
          'premature_closure',
          [1, 2, 3, 4, 5]
        ),
        wrong(
          'Continue fluid until the remaining lactate elevation resolves, using pressure to assess tolerance.',
          'Lactate is not a stand-alone volume target, and pressure does not measure respiratory tolerance or responsiveness. The rising oxygen need and fluid balance increase the risk from automatic further volume.',
          'Lactate reduction can encourage continuation of the intervention associated with improvement.',
          'cue_misinterpretation',
          [1, 2, 5, 6]
        ),
        wrong(
          'Prioritize active fluid removal because positive balance explains both the oxygen need and falling urine output.',
          'Fluid excess is plausible, but the new perfusion findings and continuing vasopressor support require a broader hemodynamic evaluation before fluid removal is selected.',
          'Positive balance and rising oxygen demand strongly suggest congestion.',
          'misprioritization',
          [2, 3, 4, 5, 6]
        ),
      ],
      reasoning: [
        'Weigh improved resuscitation markers against worsening independent organ trends.',
        'Evaluate competing harms from unresolved shock and fluid intolerance before changing support.',
      ],
      conflict:
        'Lactate and pressure improve while cerebral, renal, peripheral and respiratory observations worsen.',
      anticipation:
        'Identify worsening shock or treatment intolerance before support is reduced or additional volume increases respiratory compromise.',
      uncertainty:
        'Neither the cause of the organ changes nor the next fluid or vasopressor adjustment is established by these observations alone.',
      debrief:
        'Evaluate convergence across organs before calling a resuscitation successful. Discordant trends should reopen the assessment rather than be forced to fit an improving biomarker.',
    },
    {
      key: 'sepsis-a2',
      topic: 'Persistent shock with a newly identified source',
      level: 'advanced',
      scenario:
        'A patient with postoperative sepsis remains dependent on increasing vasopressor support. The first antimicrobial was administered promptly and the temperature has decreased. New imaging shows an infected abdominal collection that a specialist considers drainable. Lactate has not fallen and urine output is low. A prior operative note described adequate source control. The team is deciding which problem to address next.',
      cues: [
        'Escalating support requirement after surgery',
        'Prompt antimicrobial exposure',
        'Falling temperature',
        'New drainable infected collection',
        'Persistent lactate elevation',
        'Low urine output',
        'Earlier note of adequate source control',
      ],
      question:
        'What should the new drainable collection change about the plan despite an earlier note of adequate source control?',
      choices: [
        right(
          'Coordinate urgent source-control reassessment alongside hemodynamic and antimicrobial review.',
          'The current anatomical finding and persistent shock outweigh the earlier procedural conclusion. Timely specialist reassessment of the collection should occur in parallel with ongoing support and review of antimicrobial adequacy.',
          [0, 1, 3, 4, 5, 6]
        ),
        wrong(
          'Use the earlier source-control note to prioritize a broader antimicrobial regimen before another procedural review.',
          'The new scan changes the evidence. A prior note cannot exclude a newly apparent collection, and broader coverage may not resolve an anatomical source.',
          'The initial procedure was documented as adequate and treatment has already begun.',
          'outdated_data',
          [1, 3, 6]
        ),
        wrong(
          'Use the temperature improvement to allow another antimicrobial interval before deciding whether the collection matters.',
          'Temperature relief does not establish source control or adequate perfusion when support and organ findings remain concerning.',
          'Fever is an accessible marker of infection response.',
          'premature_closure',
          [0, 2, 3, 4, 5]
        ),
        wrong(
          'Prioritize repeated fluid challenges to lower lactate before arranging transfer for source-control assessment.',
          'Fluid needs require individual reassessment, but attempting to normalize lactate should not postpone review of a known source. Transfer planning and ongoing resuscitation can be coordinated.',
          'Procedural transfer may seem safer only after every resuscitation marker has improved.',
          'misprioritization',
          [0, 3, 4, 5]
        ),
      ],
      reasoning: [
        'Update the source hypothesis using new imaging despite a previously reassuring operative conclusion.',
        'Anticipate continued shock unless source control and support are addressed together.',
      ],
      conflict:
        'Earlier documentation and a lower temperature suggest response, while the new collection and increasing support indicate an unresolved problem.',
      anticipation:
        'Plan timely source-control expertise and safe monitored transfer if needed without interrupting resuscitation.',
      uncertainty:
        'The collection’s microbiology and the full contribution of other causes of shock remain unresolved.',
      debrief:
        'Reopen a settled explanation when new evidence appears. Source control is a continuing clinical assessment, not a status that remains guaranteed by an earlier procedure note.',
    },
    {
      key: 'sepsis-a3',
      topic: 'Low procalcitonin with a high-risk clinical pattern',
      level: 'advanced',
      scenario:
        'A patient develops rigors and hypotension after a recent urinary procedure. Temperature is only mildly elevated and the initial procalcitonin is low. The patient is newly confused and tachypneic. Urine output has fallen and lactate is above the reference range. Blood cultures are pending. The team is considering whether a low biomarker should change the urgent treatment plan.',
      cues: [
        'Recent urinary procedure with rigors',
        'Hypotension',
        'Low initial procalcitonin and little fever',
        'New confusion and tachypnea',
        'Falling urine output',
        'Elevated lactate',
        'Cultures pending',
      ],
      question:
        'How should the low procalcitonin affect urgent treatment of this postprocedure shock and organ-dysfunction pattern?',
      choices: [
        right(
          'Maintain urgent sepsis assessment and prescribed treatment while evaluating alternative causes in parallel.',
          'A low procalcitonin does not exclude sepsis or justify delaying treatment in a clinically high-risk presentation. The team should address the current emergency while evaluating possible sources and alternative causes.',
          [0, 1, 2, 3, 4, 5, 6]
        ),
        wrong(
          'Use the low procalcitonin to defer antimicrobials until cultures establish whether the procedure caused infection.',
          'The biomarker and pending cultures cannot safely exclude infection during this shock and organ-dysfunction pattern. Culture confirmation is not a prerequisite for urgent prescribed treatment.',
          'The biomarker appears to directly challenge the infection hypothesis.',
          'cue_misinterpretation',
          [0, 1, 2, 3, 4]
        ),
        wrong(
          'Treat the procedure-related timing as proof of a bacterial cause and stop investigating other contributors to shock.',
          'The timing increases suspicion but does not establish a single cause. Concurrent evaluation remains important even when empiric sepsis treatment is appropriate.',
          'A recent invasive procedure offers a strong causal narrative.',
          'premature_closure',
          [0, 1, 5]
        ),
        wrong(
          'Repeat procalcitonin before reassessing the hypotension to determine which pathway should lead care.',
          'The present clinical deterioration requires immediate assessment and support. A repeated biomarker should not delay evaluation of shock.',
          'A later sample may be more informative than an early test.',
          'misprioritization',
          [1, 2, 3, 4]
        ),
      ],
      reasoning: [
        'Appraise the exclusion limits of an early biomarker against a high-risk clinical pattern.',
        'Preserve urgent treatment while retaining competing explanations rather than making a single-test diagnosis.',
      ],
      conflict:
        'A low biomarker and limited fever contrast with a plausible infectious trigger and multiple new organ abnormalities.',
      anticipation:
        'Escalate support and reassess the source or alternative mechanism if instability persists despite initial treatment.',
      uncertainty:
        'The organism and exact mechanism are not established; clinical urgency is distinct from diagnostic certainty.',
      debrief:
        'Uncertainty does not require inactivity. A low-risk test result should be weighed against the consequences of delaying care in a high-risk clinical pattern.',
    },
    {
      key: 'sepsis-a4',
      topic: 'Sepsis with competing resuscitation tolerance',
      level: 'advanced',
      scenario:
        'An adult with suspected infection has persistent hypotension after an initial prescribed fluid bolus. They have chronic systolic heart failure and chronic kidney disease. A dynamic bedside assessment suggests little further volume responsiveness. Oxygen requirement and crackles have increased. Extremities remain cool and urine output is low. The clinician is present to revise the resuscitation plan.',
      cues: [
        'Persistent hypotension after initial fluid',
        'Systolic heart failure',
        'Chronic kidney disease',
        'Little apparent further volume responsiveness',
        'Worsening oxygen requirement and crackles',
        'Cool extremities and low urine output',
      ],
      question:
        'Which resuscitation proposal best balances persistent hypoperfusion with little volume responsiveness and worsening lung tolerance?',
      choices: [
        right(
          'Reassess the shock mechanism and discuss monitored vasoactive support with further fluid individualized to response.',
          'Persistent hypoperfusion still needs treatment, but limited responsiveness and new respiratory intolerance make automatic further boluses risky. The clinician should reassess the mechanism and support plan using the whole response.',
          [0, 1, 2, 3, 4, 5]
        ),
        wrong(
          'Complete a fixed volume sequence because chronic heart and kidney disease do not alter initial resuscitation priorities.',
          'Initial resuscitation is important, but current tolerance and response must inform continuing volume. A fixed sequence should not override new harm signals.',
          'Sepsis bundles are often remembered as uniform fluid requirements.',
          'outdated_data',
          [0, 1, 2, 3, 4]
        ),
        wrong(
          'Begin fluid removal as the dominant strategy because crackles establish congestion as the cause of hypotension.',
          'Crackles indicate poor tolerance but do not establish the entire shock mechanism. Fluid removal without integrated reassessment may worsen perfusion.',
          'Heart failure, positive fluid exposure and crackles create a compelling congestion explanation.',
          'premature_closure',
          [0, 1, 4, 5]
        ),
        wrong(
          'Use urine output as the deciding fluid endpoint because the dynamic assessment may be unreliable in acute illness.',
          'No test is perfect, but dismissing the dynamic assessment and respiratory trend in favor of urine alone ignores several converging signs of low fluid benefit and potential harm.',
          'Urine output is concrete and easy to trend during resuscitation.',
          'cue_misinterpretation',
          [2, 3, 4, 5]
        ),
      ],
      reasoning: [
        'Integrate continuing hypoperfusion with limited fluid benefit and worsening tolerance.',
        'Choose escalation that addresses perfusion without assuming more volume or immediate fluid removal.',
      ],
      conflict:
        'The patient needs circulatory support while current assessment suggests more fluid may have little benefit and increasing respiratory cost.',
      anticipation:
        'Monitor oxygenation and perfusion closely while the clinician adjusts support, with readiness for respiratory escalation.',
      uncertainty:
        'The relative contributions of distributive and cardiac dysfunction need bedside evaluation; no specific support dose can be inferred.',
      debrief:
        'Advanced resuscitation decisions balance the risks of inadequate perfusion and treatment intolerance. Individual reassessment should guide the next intervention rather than the presence of a diagnostic label alone.',
    },
    {
      key: 'sepsis-a5',
      topic: 'Reconsidering an initial infection diagnosis',
      level: 'advanced',
      scenario:
        'A patient admitted with presumed pneumonia has received initial antimicrobial treatment. A repeat examination shows sudden pleuritic pain and new unilateral leg swelling. Oxygen need rises abruptly while fever and cough have improved. Blood pressure is falling and the first blood cultures have no growth so far. The patient had recent surgery and limited mobility. A chest film still shows a small basal opacity.',
      cues: [
        'Initial pneumonia diagnosis with treatment',
        'New pleuritic pain and unilateral leg swelling',
        'Abrupt oxygen deterioration',
        'Improved fever and cough',
        'Falling blood pressure',
        'Recent surgery and immobility',
        'Small basal opacity and preliminary negative cultures',
      ],
      question:
        'Which reassessment best accounts for abrupt vascular and respiratory findings while some pneumonia symptoms improve?',
      choices: [
        right(
          'Escalate urgent evaluation for pulmonary vascular obstruction while continuing review of infection and support needs.',
          'The new timing and thromboembolic cues warrant urgent assessment for a competing cause of shock and hypoxemia. A basal opacity and preliminary cultures do not settle the diagnosis or justify dropping the infection assessment.',
          [0, 1, 2, 3, 4, 5, 6]
        ),
        wrong(
          'Escalate antimicrobial breadth because the persistent opacity and falling pressure establish worsening pneumonia.',
          'The opacity is nonspecific and does not explain away new unilateral leg findings, pleuritic pain and abrupt deterioration. A competing diagnosis needs evaluation.',
          'The existing pneumonia label and chest image provide a coherent infectious explanation.',
          'outdated_data',
          [0, 1, 2, 4, 6]
        ),
        wrong(
          'Stop the infection pathway because improved fever and early negative cultures exclude a bacterial contributor.',
          'Early no-growth cultures and symptom improvement do not exclude infection. Evaluating pulmonary vascular obstruction need not prematurely terminate the infection assessment.',
          'Improved infection symptoms and a new alternative diagnosis can encourage a complete diagnostic switch.',
          'premature_closure',
          [0, 3, 6]
        ),
        wrong(
          'Use the improved cough to prioritize analgesia and reassess oxygen needs after the pain settles.',
          'Pain can worsen breathing, but abrupt hypoxemia and hypotension with thromboembolic cues require urgent evaluation rather than a symptom-only reassessment.',
          'Pleuritic pain can cause shallow breathing and distress.',
          'misprioritization',
          [1, 2, 4, 5]
        ),
      ],
      reasoning: [
        'Recognize evidence that no longer fits the original infection narrative.',
        'Prioritize a time-sensitive competing cause while retaining uncertainty about coexistence.',
      ],
      conflict:
        'Some infection symptoms improve while new vascular and hemodynamic findings suggest a different or additional emergency.',
      anticipation:
        'Prepare for rapidly worsening respiratory or circulatory support needs while the team determines an appropriate diagnostic and treatment pathway.',
      uncertainty:
        'The observations do not confirm pulmonary embolism or exclude concurrent infection; both require context-sensitive evaluation.',
      debrief:
        'Reassessment includes asking whether the original diagnosis still explains the trajectory. A plausible new emergency should alter priorities without forcing an unsupported either-or diagnosis.',
    },
  ]
).map((q) => ({
  ...q,
  referenceUrls: [
    'https://sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026',
  ],
}))

// Prompt-specific judgments; a level is not a competency tag.
const primaryCompetencies: Record<
  string,
  NonNullable<QuestionDraftV2['primaryCompetency']>
> = {
  'ami-f1': 'take_action',
  'ami-f2': 'analyze_cues',
  'ami-f3': 'generate_solutions',
  'ami-f4': 'recognize_cues',
  'ami-f5': 'recognize_cues',
  'ami-c1': 'take_action',
  'ami-c2': 'analyze_cues',
  'ami-c3': 'take_action',
  'ami-c4': 'prioritize_hypotheses',
  'ami-c5': 'prioritize_hypotheses',
  'ami-a1': 'prioritize_hypotheses',
  'ami-a2': 'generate_solutions',
  'ami-a3': 'take_action',
  'ami-a4': 'evaluate_outcomes',
  'ami-a5': 'prioritize_hypotheses',
  'htn-f1': 'take_action',
  'htn-f2': 'recognize_cues',
  'htn-f3': 'recognize_cues',
  'htn-f4': 'take_action',
  'htn-f5': 'analyze_cues',
  'htn-c1': 'evaluate_outcomes',
  'htn-c2': 'evaluate_outcomes',
  'htn-c3': 'generate_solutions',
  'htn-c4': 'prioritize_hypotheses',
  'htn-c5': 'evaluate_outcomes',
  'htn-a1': 'evaluate_outcomes',
  'htn-a2': 'generate_solutions',
  'htn-a3': 'generate_solutions',
  'htn-a4': 'evaluate_outcomes',
  'htn-a5': 'prioritize_hypotheses',
  'sound-f1': 'analyze_cues',
  'sound-f2': 'analyze_cues',
  'sound-f3': 'analyze_cues',
  'sound-f4': 'analyze_cues',
  'sound-f5': 'analyze_cues',
  'sound-c1': 'evaluate_outcomes',
  'sound-c2': 'prioritize_hypotheses',
  'sound-c3': 'prioritize_hypotheses',
  'sound-c4': 'analyze_cues',
  'sound-c5': 'generate_solutions',
  'sound-a1': 'evaluate_outcomes',
  'sound-a2': 'prioritize_hypotheses',
  'sound-a3': 'analyze_cues',
  'sound-a4': 'prioritize_hypotheses',
  'sound-a5': 'prioritize_hypotheses',
  'shock-f1': 'recognize_cues',
  'shock-f2': 'analyze_cues',
  'shock-f3': 'prioritize_hypotheses',
  'shock-f4': 'recognize_cues',
  'shock-f5': 'analyze_cues',
  'shock-c1': 'analyze_cues',
  'shock-c2': 'evaluate_outcomes',
  'shock-c3': 'prioritize_hypotheses',
  'shock-c4': 'analyze_cues',
  'shock-c5': 'evaluate_outcomes',
  'shock-a1': 'evaluate_outcomes',
  'shock-a2': 'generate_solutions',
  'shock-a3': 'generate_solutions',
  'shock-a4': 'prioritize_hypotheses',
  'shock-a5': 'generate_solutions',
  'sepsis-f1': 'recognize_cues',
  'sepsis-f2': 'take_action',
  'sepsis-f3': 'analyze_cues',
  'sepsis-f4': 'analyze_cues',
  'sepsis-f5': 'generate_solutions',
  'sepsis-c1': 'evaluate_outcomes',
  'sepsis-c2': 'generate_solutions',
  'sepsis-c3': 'generate_solutions',
  'sepsis-c4': 'prioritize_hypotheses',
  'sepsis-c5': 'analyze_cues',
  'sepsis-a1': 'evaluate_outcomes',
  'sepsis-a2': 'generate_solutions',
  'sepsis-a3': 'analyze_cues',
  'sepsis-a4': 'generate_solutions',
  'sepsis-a5': 'prioritize_hypotheses',
}
const shockReferences: Record<string, SourceId[]> = {
  'shock-f1': ['traumaAssessment', 'deterioration'],
  'shock-f2': ['fluids', 'deterioration'],
  'shock-f3': ['vte', 'deterioration'],
  'shock-f4': ['anaphylaxis', 'deterioration'],
  'shock-f5': ['fluids', 'deterioration'],
  'shock-c1': ['traumaAssessment', 'deterioration'],
  'shock-c2': ['fluids', 'deterioration'],
  'shock-c3': ['traumaAssessment', 'deterioration'],
  'shock-c4': ['traumaAssessment', 'deterioration'],
  'shock-c5': ['anaphylaxis', 'deterioration'],
  'shock-a1': ['traumaAssessment', 'deterioration'],
  'shock-a2': ['sepsis', 'fluids', 'deterioration'],
  'shock-a3': ['traumaAssessment', 'deterioration'],
  'shock-a4': ['anaphylaxis', 'acs', 'deterioration'],
  'shock-a5': ['fluids', 'deterioration'],
}
export const cardiovascularQualityQuestions: QuestionDraftV2[] = [
  ...coronary,
  ...hypertension,
  ...sounds,
  ...shock,
  ...sepsis,
].map((question) => {
  const key = question.id.replace('v2-cv-', '')
  const primaryCompetency =
    primaryCompetencies[question.id.replace('v2-cv-', '')]
  if (!primaryCompetency)
    throw new Error(`Missing prompt-specific competency: ${question.id}`)
  return {
    ...question,
    sources: shockReferences[key] ?? question.sources,
    primaryCompetency,
  }
})
