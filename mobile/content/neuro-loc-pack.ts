import type {StudyQuestion,QuestionDifficulty} from '../lib/learning';
import type {ClinicalStep,CaseStage,LearningCase,LearningSource} from './learning-cases';
import type {ConceptLesson} from './expanded-content';
import type {TeachingMetadata} from './teaching-metadata';

// Original fictional practice items, informed by the owner's course objectives.
// The owner has supplied editorial direction, not approval of these new items.
export const neuroVersion='2026-09-14.1';
const conceptId='rr-neuro-loc';
const conceptLabel='Level of consciousness & neurologic assessment';
const scenarioId='rr-neuro-loc-round';
const risk='Physiological Integrity / Reduction of Risk Potential';
const adaptation='Physiological Integrity / Physiological Adaptation';
export const neuroSources={
  gcs:{title:'Glasgow Coma Scale: adult assessment components',url:'https://www.glasgowcomascale.org/what-is-gcs/'},
  recording:{title:'Glasgow Coma Scale: recording component findings and trends',url:'https://www.glasgowcomascale.org/recording-gcs/'},
  confounders:{title:'Glasgow Coma Scale: interfering factors and not-testable components',url:'https://www.glasgowcomascale.org/faq/'},
  assessment:{title:'Glasgow Coma Scale: structured assessment',url:'https://www.glasgowcomascale.org/gcs-aid/'},
  nursing:{title:'OpenStax Fundamentals of Nursing: sensory functioning and consciousness',url:'https://openstax.org/books/fundamentals-nursing/pages/29-1-sensory-functioning'},
  stroke:{title:'American Stroke Association: stroke symptoms and warning signs',url:'https://www.stroke.org/en/about-stroke/stroke-symptoms'},
  guideline:{title:'AHA/ASA: 2026 acute ischemic stroke guideline',url:'https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke'},
  swallowing:{title:'NICE NG128: swallowing, hydration and individual positioning',url:'https://www.nice.org.uk/guidance/ng128/chapter/recommendations'},
} satisfies Record<string,LearningSource>;
const S=neuroSources;

function metadata(skills:ClinicalStep[],category=risk):TeachingMetadata {
  return {courseTopic:'Medical-Surgical III / LOC and neurologic assessment',clientNeedsCategory:category,
    clinicalJudgmentSkills:skills,review:{author:'Rapid Rounds / AI-assisted draft',reviewer:null,reviewDate:null,
      approvalStatus:'needs_review',contentVersion:neuroVersion,draftedOn:'2026-09-14'}};
}
export const neuroConcepts=[{id:conceptId,label:conceptLabel}];
export const neuroScenarios=[{id:scenarioId,title:'Assess a change in LOC',estimatedMinutes:10,
  description:'Practice arousal terminology, GCS components, neurologic trends, priorities, and precise documentation. Educator review pending.'}];

type Option=[id:string,text:string,rationale:string,correct?:boolean];
type Spec={difficulty:QuestionDifficulty;skill:ClinicalStep;objective:string;prompt:string;options:Option[];
  takeaway:string;cues:string[];mechanism:string;transfer:string;sources:LearningSource[];
  format?:'single'|'multiple';category?:string};
function makeQuestion(id:string,s:Spec):StudyQuestion {
  return {id,version:neuroVersion,conceptId,conceptLabel,scenarioId,difficulty:s.difficulty,
    objective:s.objective,prompt:s.prompt,status:'needs_review',timerSeconds:90,
    rubric:{format:s.format??'single',options:s.options.map(([key,text])=>({id:`${id}-${key}`,text})),
      correctIds:s.options.filter(o=>o[3]).map(o=>`${id}-${o[0]}`)},
    rationale:s.takeaway,optionRationales:s.options.map(([key,text,rationale,correct])=>({id:`${id}-${key}`,text,rationale,correct:!!correct})),
    cues:s.cues,mechanism:s.mechanism,transferPrompt:s.transfer,sources:s.sources,
    metadata:metadata([s.skill],s.category)};
}
const q=(n:number,s:Spec)=>makeQuestion(`rr-neuro-loc-${String(n).padStart(2,'0')}`,s);

export const neuroQuestions:StudyQuestion[]=[
  q(1,{difficulty:'foundation',skill:'recognize',objective:'Describe drowsiness using an observed response to voice.',
    prompt:'An adult opens their eyes when the nurse says their name, answers orientation questions correctly, and follows commands. When conversation stops, the patient drifts back to sleep. Which note best communicates this assessment?',
    options:[
      ['coma','Comatose; no further response testing is needed.','Eye opening, appropriate answers, and command following contradict this description.'],
      ['drowsy','Drowsy, arouses to voice, answers correctly, and follows commands.','This records both the stimulus needed and the response observed.',true],
      ['normal','Alert throughout the assessment; neurologic status is normal.','The patient does not sustain wakefulness after conversation stops.'],
      ['obtunded','Obtunded; unable to respond appropriately to spoken requests.','The described patient does respond appropriately to voice; this note changes the findings.'],
    ],takeaway:'Pair an arousal descriptor with what the patient actually does.',cues:['Opens eyes to name','Answers correctly','Drifts back to sleep'],
    mechanism:'Wakefulness and the quality of a response are separate observations. A useful note preserves both.',
    transfer:'How would your note change if the patient opened their eyes but gave unrelated answers?',sources:[S.nursing,S.recording]}),
  q(2,{difficulty:'application',skill:'analyze',objective:'Distinguish a change in arousability from a change in terminology.',
    prompt:'At 0800, a patient described as lethargic opens their eyes to a normal speaking voice and answers promptly. At 0830, repeated louder verbal prompts are needed, responses are delayed, and attention cannot be sustained. Breathing is currently effective. Which interpretation is most appropriate?',
    options:[
      ['same','Both notes describe sleepiness, so the neurologic assessment is unchanged.','The strength of stimulation and quality of responses have changed.'],
      ['coma','The later assessment establishes coma regardless of the remaining responses.','The patient still responds; this label overstates the observed finding.'],
      ['worse','Arousal has decreased; document the response and obtain prompt clinical evaluation.','The trend is concerning even before a single descriptor is selected.',true],
      ['label','Select the preferred term before reporting any change to the clinical team.','Debating terminology should not postpone communication of the deterioration.'],
    ],takeaway:'A new need for stronger stimulation is a meaningful trend.',cues:['Previously responded to ordinary voice','Now needs repeated louder prompts','Delayed responses'],
    mechanism:'Terms such as lethargic and obtunded vary between teaching resources. The observed response makes the change interpretable.',
    transfer:'What baseline hearing or communication information would you verify while assessing this change?',sources:[S.nursing,S.recording,S.confounders]}),
  q(3,{difficulty:'foundation',skill:'analyze',objective:'Calculate and report a fully testable adult GCS.',
    prompt:'An adult opens their eyes to speech, converses but is confused about location, and obeys a two-step motor command. All three GCS components are testable. Which recording is correct?',
    options:[
      ['13','E3 V4 M6 = 13.','Eye opening to sound is 3, confused conversation is 4, and obeying commands is 6.',true],
      ['14','E4 V4 M6 = 14.','E4 requires spontaneous eye opening; speech was needed here.'],
      ['12','E3 V3 M6 = 12.','The patient converses despite disorientation; isolated words would be a different response.'],
      ['15','E4 V5 M6 = 15.','This would misrecord both eye opening and orientation.'],
    ],takeaway:'Record E, V, and M alongside the total when all components are testable.',cues:['Eyes open to speech','Confused conversation','Obeys commands'],
    mechanism:'Each observed response has its own score. A total alone hides which component changed.',
    transfer:'What would you report if an endotracheal tube prevented verbal assessment?',sources:[S.gcs,S.recording,S.confounders]}),
  q(4,{difficulty:'advanced',skill:'analyze',objective:'Preserve a not-testable GCS component without fabricating a total.',
    prompt:'An intubated adult opens their eyes spontaneously and obeys commands. The endotracheal tube prevents a verbal response. Which statement follows the structured GCS approach?',
    options:[
      ['one','Record E4 V1 M6 and a total of 11 because no speech is heard.','An obstruction to testing is different from an observed absent response.'],
      ['infer','Record E4 V5 M6 because command following establishes normal verbal ability.','Motor responses do not establish an untested verbal response.'],
      ['omit','Omit the full neurologic assessment until the tube has been removed.','The eye and motor findings can still be assessed and trended.'],
      ['nt','Record E4 V-NT M6, explain the tube limitation, and do not calculate a total.','NT preserves the testing limitation while keeping the usable components visible.',true],
    ],takeaway:'Do not replace a not-testable response with an invented number.',cues:['Endotracheal tube','Eyes open spontaneously','Obeys commands'],
    mechanism:'A misleading total can make a testing barrier look like a neurologic deficit.',
    transfer:'Which other treatment or communication factors could limit interpretation of a component?',sources:[S.confounders]}),
  q(5,{difficulty:'application',skill:'recognize',objective:'Recognize an acute change from an established neurologic baseline.',
    prompt:'A patient hospitalized after stroke had clear speech and equal, reactive pupils at 0900. At 0905, speech becomes slurred and the right pupil is larger and sluggish. Which nursing response is most appropriate?',category:adaptation,
    options:[
      ['wait','Repeat the routine assessment at the next scheduled interval before reporting.','The new focal findings require a response now.'],
      ['activate','Activate the urgent stroke or rapid-response pathway and assess ABCs concurrently.','The acute change requires immediate evaluation while physiologic threats are assessed.',true],
      ['rest','Reduce conversation and let the patient rest before comparing the pupils again.','Rest does not explain or address these new findings.'],
      ['history','Finish a comprehensive health history before contacting the stroke team.','A full history should not delay response to an observed acute change.'],
    ],takeaway:'New focal findings require immediate escalation, even without a complete diagnosis.',cues:['Clear speech five minutes earlier','New slurred speech','New pupil asymmetry'],
    mechanism:'Changes in more than one neurologic finding strengthen concern for an evolving problem; they do not establish its cause.',
    transfer:'Would the need for urgent evaluation change if the speech became clear again before the team arrived?',sources:[S.stroke,S.guideline,S.recording]}),
  q(6,{difficulty:'application',skill:'prioritize',objective:'Prioritize breathing when LOC decreases.',
    prompt:'A patient with decreased LOC has snoring respirations at 8/min and SpO₂ of 88%. Another nurse is activating the emergency response. What should the bedside nurse prioritize?',category:adaptation,
    options:[
      ['gcs','Finish a complete GCS calculation before addressing the respiratory findings.','Scoring must not postpone response to ineffective breathing.'],
      ['water','Give water to determine whether swallowing improves with stimulation.','Oral intake adds aspiration risk in this situation.'],
      ['airway','Support airway and ventilation within training and protocol while help arrives.','The current airway and breathing findings require immediate support.',true],
      ['family','Obtain a detailed family history before taking further bedside action.','History is useful but does not address the immediate physiologic threat.'],
    ],takeaway:'Address airway and breathing threats while the emergency response proceeds.',cues:['Decreased LOC','Snoring, slow respirations','SpO₂ 88%'],
    mechanism:'A detailed neurologic examination cannot replace support for inadequate breathing.',
    transfer:'After breathing is supported, which time-stamped neurologic findings would you report?',sources:[S.guideline,S.recording]}),
  q(7,{difficulty:'application',skill:'recognize',objective:'Identify factors that can confound neurologic response testing.',format:'multiple',
    prompt:'Which factors should the nurse identify when interpreting a patient’s neurologic responses? Select all that apply.',
    options:[
      ['hearing','Hearing aids are unavailable during spoken instructions.','A missed instruction may reflect hearing rather than arousal.',true],
      ['sedation','A sedating medication was recently administered.','Treatment timing can affect the observed response.',true],
      ['language','The examination is conducted in a language the patient does not understand.','A language barrier can interfere with a response to commands.',true],
      ['baseline','Baseline aphasia affects spoken answers.','A baseline communication deficit must be described when interpreting responses.',true],
      ['ignore','Any new change can be ignored if one confounding factor is present.','A confounder calls for interpretation and adaptation; it does not rule out deterioration.'],
    ],takeaway:'Document barriers and adapt assessment while still evaluating new changes.',cues:['Communication access','Recent medication exposure','Known baseline'],
    mechanism:'A response depends on the ability to receive and carry out the request as well as arousal.',
    transfer:'How could you adapt a spoken instruction without assuming a patient has impaired consciousness?',sources:[S.confounders]}),
  q(8,{difficulty:'foundation',skill:'generate',objective:'Plan hydration safely when swallowing status is uncertain.',format:'multiple',
    prompt:'Following an acute stroke, a patient is drowsy and has not completed a swallowing screen. Which actions fit a safe plan to promote adequate hydration? Select all that apply.',
    options:[
      ['npo','Keep oral food, fluids, and medications withheld until swallowing safety is established.','Water and tablets also require a safe swallowing route.',true],
      ['route','Clarify the prescribed hydration and medication routes with the team.','Hydration needs remain while oral intake is restricted.',true],
      ['water','Offer small sips of water because the patient can speak.','Speaking does not establish safe swallowing.'],
      ['assess','Assess intake, output, and the patient’s hydration status.','The plan should reflect the individual assessment.',true],
      ['unlimited','Replace the restriction with unrestricted oral fluids when the patient reports thirst.','Thirst alone does not remove aspiration risk or determine fluid requirements.'],
    ],takeaway:'Hydration language must specify a safe route and an individualized plan.',cues:['Acute stroke','Drowsiness','Swallowing safety not established'],
    mechanism:'A goal to maintain hydration does not itself authorize oral intake or a particular fluid volume.',
    transfer:'How would renal or cardiac fluid restrictions change the plan you clarify?',sources:[S.swallowing]}),
  q(9,{difficulty:'advanced',skill:'analyze',objective:'Compare neurologic components despite an unchanged GCS total.',
    prompt:'At 1000, a fully testable patient’s GCS is E3 V5 M6 = 14. At 1030, it is E4 V4 M6 = 14, with newly confused conversation. Which interpretation is best?',
    options:[
      ['stable','The total is unchanged, so the neurologic findings are stable.','The total conceals the new verbal change.'],
      ['improved','Spontaneous eye opening proves that the overall neurologic condition improved.','One improved component does not cancel a worsening component.'],
      ['invalid','The later score is invalid because different components cannot yield the same total.','Both component sets add to 14.'],
      ['changed','Eye opening improved, but the new confusion needs assessment and communication.','Component trends reveal a change that a total alone misses.',true],
    ],takeaway:'Equal totals can represent different neurologic findings.',cues:['Same total of 14','Eye opening increased','New confused conversation'],
    mechanism:'A sum compresses several observations. Use the component findings to interpret the trend.',
    transfer:'Which additional neurologic and physiologic observations would help characterize the new confusion?',sources:[S.recording]}),
  q(10,{difficulty:'foundation',skill:'action',objective:'Select objective neurologic documentation.',
    prompt:'At 1115, a patient opens their eyes when their name is spoken, identifies person and place but gives the wrong month, and obeys commands. Both pupils are 3 mm and briskly reactive. Which entry best records the observed findings?',
    options:[
      ['objective','1115: Eyes open to voice; identifies person/place, not month; follows commands; pupils 3 mm, brisk bilaterally.','The entry includes time, stimulus, response, orientation, and pupil findings.',true],
      ['fine','1115: Patient sleepy but fine; no need to specify individual neurologic responses.','An overall judgment cannot replace the available assessment data.'],
      ['uncooperative','1115: Patient uncooperative because the month was incorrect despite answering other questions.','The note assigns a motive that the observed findings do not establish.'],
      ['invented','1115: Oriented to person, place, and time; pupils equal; strength normal in all extremities.','This changes an incorrect answer and adds strength findings not provided.'],
    ],takeaway:'Document observed findings without adding motives or unassessed normal results.',cues:['Time of assessment','Specific orientation response','Measured pupil findings'],
    mechanism:'Objective detail allows the next clinician to compare the same observations.',
    transfer:'What additional information would you add after reporting a new change to the response team?',sources:[S.recording,S.nursing]}),
  q(11,{difficulty:'advanced',skill:'evaluate',objective:'Evaluate improvement without ending needed surveillance.',format:'multiple',
    prompt:'After urgent team evaluation and prescribed stabilization, a patient is more alert and speech is clearer. The cause of the earlier deterioration is still being investigated. Which conclusions are appropriate? Select all that apply.',
    options:[
      ['trend','Record the improved findings and continue the ordered neurologic reassessments.','Improvement is meaningful and still needs follow-up.',true],
      ['cancel','Cancel pending evaluation because the patient is now speaking clearly.','Improvement does not establish that the cause has resolved.'],
      ['teach','When the patient is stable enough, ask the family to report recurrent changes promptly.','Family observations can support early recognition while clinical monitoring continues.',true],
      ['swallow','Verify current swallowing clearance before resuming oral fluids or medications.','Improved speech or alertness alone does not establish safe swallowing.',true],
      ['routine','Record only the normal findings so the earlier episode does not confuse the next nurse.','The episode and response are important parts of the handoff.'],
    ],takeaway:'Improvement belongs in the trend; it does not erase the preceding event.',cues:['Improved alertness','Clearer speech','Cause still under evaluation'],
    mechanism:'A response to care and a completed diagnostic evaluation are different conclusions.',
    transfer:'Which exact findings would you ask the family to report without assigning them responsibility for clinical monitoring?',sources:[S.recording,S.stroke,S.swallowing]}),
  q(12,{difficulty:'application',skill:'prioritize',objective:'Evaluate vital signs alongside an acute neurologic change.',
    prompt:'At 1400, a patient’s BP is 146/82 mm Hg, HR 82/min, RR 16/min, and SpO₂ 97%. At 1410, vital signs are similar, but new slurred speech and left arm weakness appear. Which statement best guides the nurse’s next action?',category:adaptation,
    options:[
      ['vitals','Similar vital signs make an urgent neurologic problem unlikely enough to wait.','Stable vital signs do not rule out an acute focal neurologic event.'],
      ['repeat','Obtain another set of vital signs before beginning any urgent notification.','Repeating measurements must not delay activation for new focal findings.'],
      ['evaluate','Evaluate the new neurologic findings and activate the urgent stroke pathway now.','The new deficits determine urgency despite similar vital signs.',true],
      ['weakness','Reassess the arm after exercise before deciding whether the speech change matters.','The combination of new weakness and speech change requires urgent evaluation.'],
    ],takeaway:'Obtain and evaluate vital signs as part of the whole assessment.',cues:['New slurred speech','New unilateral weakness','Vital signs similar to baseline'],
    mechanism:'One reassuring set of measurements cannot cancel a new focal deficit.',
    transfer:'What last-known-well and onset information would you communicate during activation?',sources:[S.stroke,S.guideline]}),
];

function stage(n:number,step:ClinicalStep,chart:string[],spec:Spec):CaseStage {
  const item=makeQuestion(`rr-neuro-loc-case-01-s${n}`,spec);
  if('rows' in item.rubric)throw new Error('This case uses choice responses.');
  return {id:item.id,conceptId,conceptLabel,step,title:spec.objective,chart,prompt:item.prompt,
    options:item.rubric.options,correctIds:item.rubric.correctIds,format:spec.format??'single',
    rationale:{takeaway:item.rationale,cues:spec.cues,mechanism:spec.mechanism,
      distractors:item.optionRationales.filter(o=>!o.correct).map(o=>o.rationale),transferPrompt:spec.transfer},
    optionRationales:item.optionRationales,sources:item.sources as LearningSource[],status:'needs_review',
    contentVersion:neuroVersion,metadata:metadata([step],spec.category)};
}
export const neuroCases:LearningCase[]=[{
  id:'rr-neuro-loc-case-01',title:'A change from the neurologic baseline',subtitle:'Arousal, pupils, speech, and the next nursing action',
  description:'An original fictional inpatient stroke case. Emergency actions occur at the documented times; answering a teaching stage does not represent waiting to provide care.',
  patient:'Jordan Ellis, 69 • adult stroke unit • ischemic stroke 36 hours earlier • mild left grip weakness at baseline; no baseline aphasia or dysarthria',
  estimatedMinutes:12,concepts:['Neurologic trends','Airway safety','Time-stamped communication'],
  status:'needs_review',contentVersion:neuroVersion,sources:[S.gcs,S.recording,S.guideline,S.swallowing],
  metadata:metadata(['recognize','analyze','prioritize','generate','action','evaluate']),
  stages:[
    stage(1,'recognize',[
      '08:45 • Baseline: eyes open spontaneously, oriented, follows commands; GCS E4 V5 M6 = 15. Pupils 3 mm and brisk bilaterally; speech clear; mild left grip weakness unchanged.',
      '09:00 • Now drowsy, opens eyes to voice, remains oriented and follows commands. GCS E3 V5 M6 = 14. Pupils and limb findings unchanged. RR 16/min, SpO₂ 96% on room air, BP 154/86 mm Hg.',
      '09:00 • Nurse remains at bedside and notifies the stroke clinician of the new drowsiness; prompt assessment is underway.',
    ],{difficulty:'application',skill:'recognize',objective:'Recognize cues',
      prompt:'Which comparison best identifies the new finding to communicate?',
      options:[['eyes','Spontaneous eye opening at 0845 changed to eye opening to voice at 0900.','This identifies the change in arousal and its timing.',true],['grip','Mild left grip weakness is a newly observed deficit at 0900.','The chart identifies that weakness as an unchanged baseline finding.'],['pupils','Pupils became unequal between 0845 and 0900.','The current pupils remain equal and briskly reactive.'],['total','Both assessments show GCS 15, so no response has changed.','The eye component decreased and the later total is 14.']],
      takeaway:'Compare each finding with the patient’s own documented baseline.',cues:['Earlier E4','Current E3','Orientation and commands preserved'],mechanism:'A new arousal change can precede additional focal findings.',transfer:'What further change would increase the urgency of the current evaluation?',sources:[S.recording]}),
    stage(2,'analyze',[
      '09:04 • New slurred speech, right pupil 5 mm and sluggish, left pupil 3 mm and brisk. The left arm now drifts more than at baseline.',
      '09:04 • Glucose 112 mg/dL; RR 16/min; SpO₂ 95% on room air. Nurse immediately activates the urgent stroke/rapid-response pathway and continues ABC assessment.',
    ],{difficulty:'application',skill:'analyze',objective:'Analyze cues',category:adaptation,
      prompt:'Which interpretation best explains the need for the activation already initiated?',
      options:[['fatigue','The combined findings fit routine post-stroke fatigue and can be followed at the next check.','New pupil, speech, and motor changes require urgent evaluation.'],['acute','Several acute neurologic changes suggest deterioration; the cause still needs urgent evaluation.','The pattern establishes urgency without claiming a diagnosis from bedside findings alone.',true],['ruledout','The glucose result excludes urgent causes of the neurologic changes.','A single glucose result does not rule out evolving intracranial disease.'],['certain','The unequal pupils alone confirm a specific hemorrhage and its treatment.','The cause and treatment require team assessment and appropriate investigations.']],
      takeaway:'Connect the new findings while separating a concern from a confirmed diagnosis.',cues:['New pupil asymmetry','New dysarthria','Increased left arm drift'],mechanism:'The changes involve several aspects of the neurologic assessment.',transfer:'How would you communicate concern without presenting an unconfirmed cause as fact?',sources:[S.stroke,S.guideline,S.recording]}),
    stage(3,'prioritize',[
      '09:04 • While the response team arrives, respirations become snoring and slow at 8/min; SpO₂ falls to 90%. Jordan is now difficult to arouse.',
      '09:04 • A second nurse updates the emergency team while the bedside nurse assesses airway and breathing.',
    ],{difficulty:'application',skill:'prioritize',objective:'Prioritize hypotheses',category:adaptation,
      prompt:'Which immediate concern takes priority at the bedside?',
      options:[['teaching','Readiness for family education about recovery.','Teaching can wait while the physiologic threat is addressed.'],['mobility','Risk of deconditioning from remaining in bed.','Mobility planning does not take priority during this deterioration.'],['airway','Threatened airway patency and inadequate ventilation.','The respiratory pattern, oxygenation change, and reduced arousal require immediate attention.',true],['documentation','Incomplete discharge documentation from the prior shift.','Documentation does not take priority over current airway and breathing support.']],
      takeaway:'Prioritize the current physiologic threat as the neurologic emergency response continues.',cues:['Snoring respirations','RR 8/min','SpO₂ 90%','Difficult to arouse'],mechanism:'The patient’s immediate support needs can change during the same episode.',transfer:'Which reassessment will tell you whether respiratory support is effective?',sources:[S.guideline]}),
    stage(4,'generate',[
      '09:05 • Response clinicians are providing airway and breathing support. A bedside nurse is assigned ongoing observations and preparation for urgent imaging.',
      '09:05 • Oral intake is withheld. Head and neck positioning will be individualized by the team to airway, aspiration, and perfusion needs.',
    ],{difficulty:'application',skill:'generate',objective:'Generate solutions',format:'multiple',category:adaptation,
      prompt:'Which actions belong in the immediate collaborative plan? Select all that apply.',
      options:[['trend','Trend respiratory status, vital signs, pupils, and motor responses.','These findings help evaluate the response and detect further change.',true],['npo','Maintain NPO status and clarify needed non-oral medication or hydration routes.','Reduced LOC requires a safe route while the evaluation continues.',true],['prepare','Prepare for ordered urgent imaging and an appropriately monitored transfer.','The team needs to investigate the cause while maintaining physiologic support.',true],['flat','Place every patient with stroke flat regardless of breathing or aspiration risk.','Positioning must account for this patient’s clinical needs.'],['sips','Offer water to see whether swallowing can stimulate alertness.','Water is not a treatment for decreased LOC and adds aspiration risk.']],
      takeaway:'Coordinate assessment, safe routes, and the planned diagnostic response.',cues:['Breathing support in progress','Urgent imaging preparation','Oral intake withheld'],mechanism:'Support and investigation proceed together; a generic hydration or positioning instruction is insufficient.',transfer:'Which transport information and equipment would you confirm with the response team?',sources:[S.guideline,S.swallowing]}),
    stage(5,'action',[
      '09:07 • With team support, RR is 14/min and SpO₂ is 95% on prescribed oxygen. Urgent head imaging and monitored transfer are ordered; the response team will accompany Jordan.',
      '09:07 • The receiving team needs the time-stamped neurologic baseline, changes, interventions, and current response. Last observed baseline was 0845; drowsiness was first documented at 0900.',
    ],{difficulty:'application',skill:'action',objective:'Take action',
      prompt:'Which handoff most accurately supports the ordered transfer?',
      options:[['discovery','Last known well was 0904, when speech first became slurred; the earlier observations can be omitted.','This confuses discovery of a later deficit with the last observed baseline.'],['recovered','Jordan has recovered because oxygenation improved; send the current saturation without the neurologic trend.','Respiratory improvement does not establish neurologic recovery.'],['assumed','Jordan has a confirmed new hemorrhage; transfer for treatment based on that diagnosis.','The cause is still being evaluated; the handoff should not invent a diagnosis.'],['sbar','Baseline at 0845; drowsy at 0900; focal changes at 0904. Report breathing support, current findings, and urgent imaging plan.','This preserves chronology, observed findings, actions, and the current request.',true]],
      takeaway:'Use SBAR with exact times and observed changes.',cues:['Baseline 0845','Drowsiness 0900','Focal changes 0904','Response to support'],mechanism:'An accurate timeline helps the receiving team interpret a changing assessment.',transfer:'How would you document uncertainty if no reliable last-baseline time were available?',sources:[S.guideline,S.recording]}),
    stage(6,'evaluate',[
      '10:00 • After urgent evaluation and prescribed stabilization, Jordan opens eyes spontaneously, answers orientation questions correctly, and follows commands: E4 V5 M6 = 15. Speech is clearer; pupils are 3 mm and brisk bilaterally.',
      '10:00 • The stroke team continues the diagnostic evaluation and ordered surveillance. Oral intake has not been re-cleared. Jordan is stable enough for a brief family discussion.',
    ],{difficulty:'application',skill:'evaluate',objective:'Evaluate outcomes',
      prompt:'Which evaluation and teaching statement best fits the current findings?',
      options:[['continue','The observed responses improved. Continue ordered surveillance and ask family to report recurrent changes promptly.','This acknowledges improvement while preserving the ongoing plan.',true],['resolved','The episode is resolved, so the family can provide oral fluids without further assessment.','Neither the cause nor swallowing safety has been established by these findings.'],['stop','The GCS is now 15, so pupil and motor reassessments are no longer needed.','GCS does not replace the rest of the neurologic assessment.'],['replace','Family observation can now replace nursing reassessment until discharge.','Family participation supplements clinical assessment; it does not replace it.']],
      takeaway:'Reassessment closes one reasoning cycle and informs the next.',cues:['Improved E/V/M findings','Evaluation continues','Swallowing not re-cleared'],mechanism:'Response, diagnosis, and readiness for oral intake each require their own evidence.',transfer:'Write a handoff that includes the earlier deterioration, response, remaining concerns, and when to escalate again.',sources:[S.recording,S.swallowing]}),
  ],
}];

export const neuroLessons:ConceptLesson[]=[{
  id:'rr-neuro-loc-lesson-01',conceptId,title:'Describe and respond to a change in LOC',version:neuroVersion,estimatedMinutes:10,
  summary:'Use precise arousal descriptions, component findings, and a time-stamped trend to guide your next nursing action.',
  objectives:['Differentiate arousal descriptions using observed responses.','Interpret GCS components alongside pupils, speech, and motor findings.','Prioritize airway safety, prompt escalation, and clear documentation when LOC decreases.'],
  steps:[
    'Start with the baseline: how the patient usually opens their eyes, communicates, and follows commands. Identify hearing, language, speech, medication, and other factors that could affect testing.',
    'Describe the stimulus and response. “Difficult to arouse” is more useful when followed by the actual eye, verbal, and motor findings. Do not use “obtunded” as a substitute for describing what happened.',
    'Record GCS components using the structured assessment method taught and approved in your setting. Add the total only when all three components are testable. Pupils, laterality, and speech findings remain separate parts of the neurologic assessment.',
    'Compare exact times and findings. A decrease in arousal or a new focal deficit requires prompt assessment and escalation. Do not finish a long examination before calling for help when the change is urgent.',
    'Respond to airway and breathing threats while the team evaluates the cause. Individualize positioning and hydration; decreased LOC or uncertain swallowing safety can make oral intake unsafe.',
    'Reassess after interventions and communicate what changed, what you did, the response, and what still needs evaluation. Improvement does not authorize stopping the ordered plan.',
  ],
  referenceCharts:[
    {title:'Arousal descriptors: always add the observed response',rows:[
      {label:'Alert',detail:'Awake and readily engages. Document orientation separately; an awake patient may still be confused.'},
      {label:'Lethargic / drowsy',detail:'Sleepy but can be aroused with voice; may drift back to sleep. Record whether responses are prompt and sustained.'},
      {label:'Obtunded',detail:'Reduced alertness with more stimulation needed and slower or limited responses. Specify the actual stimulus and response.'},
      {label:'Stuporous',detail:'Arousal is brief and requires vigorous stimulation. Assessment technique belongs within supervised training and local policy.'},
      {label:'Comatose',detail:'Cannot be aroused into wakefulness. Record observed motor and reflex responses separately; the term does not establish brain death.'},
    ],note:'Descriptor boundaries vary between texts. Use your course definitions consistently and document observable findings; do not assign a GCS from a descriptor alone.'},
    {title:'Adult GCS: eye opening',rows:[
      {label:'E4',detail:'Eyes open without a stimulus.'},{label:'E3',detail:'Eyes open when addressed by sound.'},
      {label:'E2',detail:'Eyes open in response to appropriate pressure.'},{label:'E1',detail:'No eye opening, with testing possible.'},
    ],note:'Use NT and explain the reason when this component cannot be tested.'},
    {title:'Adult GCS: verbal response',rows:[
      {label:'V5',detail:'Conversation shows correct orientation.'},{label:'V4',detail:'Conversation is possible, but the patient is confused.'},
      {label:'V3',detail:'Recognizable words without conversational exchange.'},{label:'V2',detail:'Vocal sounds without recognizable words.'},
      {label:'V1',detail:'No verbal response, with testing possible.'},
    ],note:'An endotracheal tube can make verbal testing unavailable. Do not infer V5 from command following.'},
    {title:'Adult GCS: best motor response',rows:[
      {label:'M6',detail:'Carries out a requested movement.'},{label:'M5',detail:'Moves purposefully toward the site of a pressure stimulus.'},
      {label:'M4',detail:'Flexes normally away from pressure without localizing it.'},{label:'M3',detail:'Shows an abnormal flexion pattern.'},
      {label:'M2',detail:'Shows an extension pattern.'},{label:'M1',detail:'No motor response, with testing possible.'},
    ],note:'Document right/left differences separately. Use the official structured assessment aid for technique; this teaching chart is not a bedside competency assessment.'},
    {title:'Report components and context',rows:[
      {label:'Fully testable example',detail:'E3 + V4 + M6 = 13. Include the observed criteria with the numbers.'},
      {label:'A component is NT',detail:'Report the available components and reason for NT; do not calculate a total.'},
      {label:'The total is unchanged',detail:'Compare components, pupils, speech, and motor symmetry. An unchanged total can hide a new deficit.'},
    ],note:'GCS describes responses. It does not independently diagnose a cause or replace clinical assessment.'},
  ],
  workedExample:'At 0800, a patient opens their eyes spontaneously, is oriented, and follows commands. At 0830, their eyes open to voice and conversation is confused, although commands are followed. E4 V5 M6 = 15 has changed to E3 V4 M6 = 13. Describe and urgently communicate the change while assessing ABCs and other possible contributors; do not explain it away as sleepiness.',
  reflection:'Why is “opens eyes to voice, gives incorrect month, follows commands” more useful than “neuro unchanged”? What finding would make you activate an immediate response?',
  documentationExercises:[
    {id:'rr-neuro-note-01',original:'Difficult to wake. Neuro okay.',
      observations:'0915: Eyes open to repeated voice; identifies person and place, not month; follows commands. Pupils 3 mm and brisk bilaterally. At 0845 the patient was awake and fully oriented. The nurse stays at bedside, assesses ABCs, and calls for urgent clinical evaluation at 0915.',
      modelNote:'0915: Difficult to arouse; eyes open to repeated voice. Identifies person and place but gives incorrect month; follows commands. Pupils 3 mm, brisk bilaterally. New change from awake and oriented baseline at 0845. Remained at bedside, assessed ABCs, and requested urgent clinical evaluation at 0915.',
      selfCheck:['Include time and the response to stimulation.','Describe orientation and pupils precisely.','Compare with baseline and include escalation.','Do not invent a GCS score when the full standardized examination is not supplied.']},
    {id:'rr-neuro-note-02',original:'Patient denies pain. Check vitals.',
      observations:'1000: The awake patient states “I have no pain” and rates pain 0/10. BP 142/80 mm Hg, HR 78/min, RR 16/min, SpO₂ 97% on room air. These measurements are similar to 0930. No neurologic examination findings are supplied for this exercise.',
      modelNote:'1000: Patient reports no pain, 0/10. BP 142/80 mm Hg, HR 78/min, RR 16/min, SpO₂ 97% on room air; vital signs similar to 0930.',
      selfCheck:['Preserve the patient’s report and pain rating.','Include measurements, units, time, and comparison.','Do not add “neurologically stable” without assessment findings.']},
  ],
  sources:[S.nursing,S.gcs,S.assessment,S.recording,S.confounders,S.guideline,S.swallowing],status:'needs_review',
  metadata:metadata(['recognize','analyze','prioritize','generate','action','evaluate']),
}];
