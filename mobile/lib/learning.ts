import { catalogItems, catalogConcepts, migrateItemId, migrateOptionId } from '../content/catalog';
import { learningCases } from '../content/learning-cases';
import { CARDIAC_SCENARIOS } from '../content/cardiac-pack';
import { expandedQuestions, expandedScenarios, expandedConcepts, expandedCases, lessons } from '../content/expanded-content';
import { scoreNgn, type NgnItem, type NgnResponse } from './ngn';
import { recordResponseReward, recordCompletionReward, validRewardLedger, type RewardLedger } from './rewards';
import { calculateRapidRoundScore, type RapidRoundScoreBreakdown } from './rapidRound/scoring';
import { restore as restoreV1, shuffle, type Round } from './mobile';
import type { ItemWithOptions } from './domain/types';

export type Mode = 'learn' | 'review' | 'challenge' | 'case';
export type Confidence = 'unsure' | 'somewhat' | 'sure';
export type QuestionDifficulty = 'foundation' | 'application' | 'advanced';
export type SessionOptions = { questionCount?: 5 | 10 | 20 | 30 | 50; difficulty?: 'all' | QuestionDifficulty };
export type StudyScenario = { id:string; title:string; description:string; estimatedMinutes:number };
export type StudyConcept = { id:string; label:string; description?:string };
export const studyScenarios:StudyScenario[] = [...CARDIAC_SCENARIOS,...expandedScenarios];
export const studyConcepts:StudyConcept[] = [...catalogConcepts,...expandedConcepts];
export const sessionQuestionCounts = [5,10,20,30,50] as const;
export type StudyQuestion = {
  id: string; version: string; conceptId: string; conceptLabel: string; objective: string;
  prompt: string; status: string; rubric: NgnItem; rationale: string;
  optionRationales: {id:string; text:string; rationale:string; correct:boolean}[];
  sources: {title:string;url?:string}[]; timerSeconds: number;
  scenarioId?: string; difficulty?: QuestionDifficulty;
  chart?: string[]; previousChart?:string[]; step?: string; cues?: string[]; mechanism?:string; transferPrompt?:string;
};
export type StudyResponse = { questionId:string; value:NgnResponse; confidence:Confidence; earned:number; max:number; correct:boolean; timedOut:boolean; elapsedMs:number; submittedAt:number; exposure:'first'|'repeat'; rewardEligible?:boolean };
export type StudySession = { id:string; mode:Mode; title:string; scenarioId:string; attempt:number; questions:StudyQuestion[]; responses:StudyResponse[]; index:number; startedAt:number; questionStartedAt:number; deadline:number|null; completedAt:number|null; challengeScore?:RapidRoundScoreBreakdown };
export type ConceptProgress = { id:string; label:string; attempts:number; earned:number; max:number; firstAttempts:number; firstCorrect:number; seenIds:string[]; dueAt:number; intervalStep:number; lastSuccessDay:string|null; lastStudiedAt:number; needsSupport:boolean };
export type ContentReport = { id:string; questionId:string; version:string; question:string; reason:string; createdAt:number; status:'open'|'resolved' };
export type LearningState = { version:2; active:StudySession|null; history:StudySession[]; withheldSessions?:StudySession[]; rewardLedger?:RewardLedger; challengeAttempts:Record<string,number>; concepts:Record<string,ConceptProgress>; reports:ContentReport[]; lastSavedAt:number };
export const initialLearningState:LearningState = {version:2,active:null,history:[],challengeAttempts:{},concepts:{},reports:[],lastSavedAt:0};
export const isContentPreview = process.env.EXPO_PUBLIC_CONTENT_PREVIEW === 'true';
const DAY=86400000;
const intervalDays=[1,3,7,14];
const allowed=(status:string,preview:boolean)=>status==='published'||(preview&&status==='needs_review');
const id=()=>`${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
function seenQuestionIds(state:LearningState){return new Set([...Object.values(state.concepts).flatMap(c=>c.seenIds),...[...state.history,...(state.withheldSessions??[])].flatMap(s=>s.responses.map(r=>r.questionId)),...(state.active?.responses.map(r=>r.questionId)??[])]);}

export function studyItems(preview=isContentPreview):StudyQuestion[] {
  const inherited:StudyQuestion[]=catalogItems.filter(q=>allowed(q.status,preview)).map(q=>({
    id:q.id,version:q.contentVersion,conceptId:q.conceptId,conceptLabel:q.conceptLabel,objective:q.learningObjective,scenarioId:q.scenarioId,difficulty:'application',
    prompt:q.stem,status:q.status,rubric:{format:'single',options:q.options.map(o=>({id:o.id,text:o.text})),correctIds:q.options.filter(o=>o.isCorrect).map(o=>o.id)},
    rationale:q.rationale,optionRationales:q.options.map(o=>({id:o.id,text:o.text,rationale:o.rationale,correct:o.isCorrect})),sources:[{title:q.referenceText??'Source review pending'}],timerSeconds:q.timerSeconds,
    transferPrompt:'Which change in the patient’s findings would make a different option more appropriate? Compare your reasoning with the explanations above.',
  }));
  const combined=[...inherited,...expandedQuestions.filter(q=>allowed(q.status,preview)).map(q=>({...q,difficulty:q.difficulty??'application' as const}))];
  return [...new Map(combined.map(q=>[q.id,q])).values()];
}
export function availableCases(preview=isContentPreview){return [...learningCases,...expandedCases].filter(c=>allowed(c.status,preview)&&c.stages.every(stage=>allowed(stage.status,preview)));}
export function availableLessons(preview=isContentPreview){return lessons.filter(lesson=>allowed(lesson.status,preview));}
export function caseQuestions(caseId:string,preview=isContentPreview):StudyQuestion[]{
  const c=availableCases(preview).find(c=>c.id===caseId); if(!c)return [];
  return c.stages.map((stage,stageIndex):StudyQuestion=>{
    const conceptId=stage.conceptId??({recognize:'oxygenation-fluid',analyze:'oxygenation-fluid',prioritize:'perfusion',generate:'medication-safety',action:'perfusion',evaluate:'oxygenation-fluid'} as const)[stage.step];
    const rubric:NgnItem=stage.format==='matrix' ? {format:'matrix',options:stage.options,rows:stage.rows!} : stage.format==='selectN' ? {format:'selectN',options:stage.options,correctIds:stage.correctIds,selectCount:stage.selectCount!} : {format:stage.format,options:stage.options,correctIds:stage.correctIds};
    return {id:stage.id,version:stage.contentVersion,conceptId,conceptLabel:stage.conceptLabel??studyConcepts.find(x=>x.id===conceptId)?.label??stage.title,scenarioId:c.id,difficulty:'application',objective:stage.title,prompt:stage.prompt,status:stage.status,rubric,rationale:stage.rationale.takeaway,optionRationales:stage.rationale.distractors.map((text,i)=>({id:`explanation-${i}`,text:'Reasoning note',rationale:text,correct:false})),sources:stage.sources,timerSeconds:0,chart:[c.patient,...stage.chart],previousChart:c.stages.slice(0,stageIndex).flatMap(prior=>prior.chart),step:stage.title,cues:stage.rationale.cues,mechanism:stage.rationale.mechanism,transferPrompt:stage.rationale.transferPrompt};
  });
}
/** Full eligible pool, before the requested session length is applied. */
export function sessionPool(scenarioId:string,preview=isContentPreview,options:SessionOptions={}):StudyQuestion[]{
  const difficulty=options?.difficulty;
  return studyItems(preview).filter(q=>(scenarioId==='all'||q.scenarioId===scenarioId)&&
    (!difficulty||difficulty==='all'||q.difficulty===difficulty));
}
export function dueConcepts(state:LearningState,now=Date.now()){return Object.values(state.concepts).filter(c=>c.dueAt<=now).sort((a,b)=>Number(b.needsSupport)-Number(a.needsSupport)||a.dueAt-b.dueAt);}
export function reviewItems(state:LearningState,now=Date.now(),preview=isContentPreview):StudyQuestion[]{
  const available=studyItems(preview);
  const seen=seenQuestionIds(state);
  return dueConcepts(state,now).flatMap(c=>{
    const choices=available.filter(q=>q.conceptId===c.id);
    const unseen=choices.find(q=>!seen.has(q.id));
    return unseen?[unseen]:choices.length?[choices[c.attempts%choices.length]]:[];
  }).slice(0,5);
}
export function beginSession(state:LearningState,mode:Mode,scenarioId:string,now=Date.now(),preview=isContentPreview,options:SessionOptions={}):LearningState{
  if(state.active||!Number.isFinite(now))return state;
  let questions:StudyQuestion[]=[]; let title='Scheduled review';
  if(mode==='case'){questions=caseQuestions(scenarioId,preview);title=availableCases(preview).find(c=>c.id===scenarioId)?.title??'Unfolding case';}
  else if(mode==='review') questions=reviewItems(state,now,preview);
  else {
    const pool=sessionPool(scenarioId,preview,options);
    const requested=options?.questionCount&&sessionQuestionCounts.includes(options.questionCount)?options.questionCount:mode==='learn'?5:10;
    const seen=seenQuestionIds(state);
    questions=shuffle(pool).sort((a,b)=>Number(seen.has(a.id))-Number(seen.has(b.id))).slice(0,requested).map(q=>({...q,
      timerSeconds:mode==='challenge'?(Number.isFinite(q.timerSeconds)&&q.timerSeconds>0?Math.max(1,Math.min(300,Math.round(q.timerSeconds))):60):q.timerSeconds,
      rubric:{...q.rubric,options:shuffle(q.rubric.options)}}));
    title=scenarioId==='all'?'Mixed nursing concepts':studyScenarios.find(s=>s.id===scenarioId)?.title??'Nursing practice';
  }
  if(!questions.length)return state;
  const attempt=mode==='challenge'?(state.challengeAttempts[scenarioId]??0)+1:1;
  return {...state,challengeAttempts:mode==='challenge'?{...state.challengeAttempts,[scenarioId]:attempt}:state.challengeAttempts,active:{id:id(),mode,title,scenarioId,attempt,questions,responses:[],index:0,startedAt:now,questionStartedAt:now,deadline:mode==='challenge'?now+questions[0].timerSeconds*1000:null,completedAt:null}};
}
function updateConcept(state:LearningState,q:StudyQuestion,r:StudyResponse):Record<string,ConceptProgress>{
  const old=state.concepts[q.conceptId];
  const successful=r.correct&&r.confidence!=='unsure';
  const day=new Date(r.submittedAt).toISOString().slice(0,10);
  const intervalStep=successful?Math.min(3,(old?.intervalStep??-1)+(old?.lastSuccessDay===day?0:1)):0;
  // Fresh responses and later-day retrieval are recorded separately from repeated-item recognition.
  const record:ConceptProgress={id:q.conceptId,label:q.conceptLabel,attempts:(old?.attempts??0)+1,earned:(old?.earned??0)+r.earned,max:(old?.max??0)+r.max,firstAttempts:(old?.firstAttempts??0)+Number(r.exposure==='first'),firstCorrect:(old?.firstCorrect??0)+Number(r.exposure==='first'&&r.correct),seenIds:[...new Set([...(old?.seenIds??[]),q.id])],dueAt:r.submittedAt+(successful?intervalDays[Math.max(0,intervalStep)]*DAY:r.confidence==='sure'&&!r.correct?0:DAY),intervalStep:Math.max(0,intervalStep),lastSuccessDay:successful?day:old?.lastSuccessDay??null,lastStudiedAt:r.submittedAt,needsSupport:!successful};
  return {...state.concepts,[q.conceptId]:record};
}
export function submitResponse(state:LearningState,value:NgnResponse,confidence:Confidence,now=Date.now()):LearningState{
  const session=state.active;if(!session||session.responses.length>session.index||!Number.isFinite(now))return state;
  const q=session.questions[session.index];const timedOut=session.deadline!==null&&now>=session.deadline;
  const evaluated=scoreNgn(q.rubric,value);
  if(!timedOut&&!evaluated.valid)return state;
  const response:StudyResponse={questionId:q.id,value:timedOut?{selectedIds:[],rowAnswers:{}}:value,confidence,earned:timedOut?0:evaluated.earned,max:evaluated.max,correct:!timedOut&&evaluated.correct,timedOut,elapsedMs:Math.max(0,Math.min(now-session.questionStartedAt,session.deadline===null?Number.MAX_SAFE_INTEGER:q.timerSeconds*1000)),submittedAt:now,exposure:seenQuestionIds(state).has(q.id)?'repeat':'first',rewardEligible:true};
  const next={...state,active:{...session,responses:[...session.responses,response]}};
  // Case feedback/evidence is committed only at completion; each stage stays hidden until then.
  return session.mode==='case'?next:{...next,concepts:updateConcept(state,q,response),rewardLedger:recordResponseReward(state.rewardLedger,q,response,session.id)};
}
export function nextQuestion(state:LearningState,now=Date.now()):LearningState{
  const a=state.active;if(!a||a.responses.length!==a.index+1||!Number.isFinite(now))return state;
  if(a.index+1<a.questions.length)return {...state,active:{...a,index:a.index+1,questionStartedAt:now,deadline:a.mode==='challenge'?now+a.questions[a.index+1].timerSeconds*1000:null}};
  const complete:StudySession={...a,completedAt:now};
  if(a.mode==='challenge')complete.challengeScore=challengeScore(complete);
  let concepts=state.concepts;
  let rewardLedger=state.rewardLedger;
  if(a.mode==='case')for(const [i,q] of a.questions.entries()){
    concepts=updateConcept({...state,concepts},q,a.responses[i]);
    rewardLedger=recordResponseReward(rewardLedger,q,a.responses[i],a.id);
  }
  rewardLedger=recordCompletionReward(rewardLedger,complete);
  return {...state,active:null,concepts,...(rewardLedger?{rewardLedger}:{}),history:[complete,...state.history].slice(0,100)};
}
function challengeScore(session:StudySession){
  const items=session.questions.map(q=>({id:q.id,timerSeconds:q.timerSeconds}) as ItemWithOptions);
  return calculateRapidRoundScore({items,responses:session.responses.map((r,i)=>({id:`${session.id}:${i}`,sessionId:session.id,itemId:r.questionId,selectedAnswerOptionId:r.value.selectedIds[0]??null,isCorrect:r.correct,timedOut:r.timedOut,responseMs:r.elapsedMs,answeredAt:r.submittedAt})),completed:session.completedAt!==null,attemptNumber:session.attempt});
}
export function addReport(state:LearningState,q:StudyQuestion,reason:string,now=Date.now()):LearningState{
  const cleaned=reason.trim().slice(0,1000);if(!cleaned)return state;
  return {...state,reports:[{id:id(),questionId:q.id,version:q.version,question:q.prompt,reason:cleaned,createdAt:now,status:'open'},...state.reports]};
}
function migrateRound(r:Round):StudySession{
  const questions:StudyQuestion[]=r.items.map(q=>{const id=migrateItemId(q.id);const meta=catalogItems.find(i=>i.id===id);return {id,version:'legacy-1',conceptId:meta?.conceptId??'legacy',conceptLabel:meta?.conceptLabel??'Previous cardiac practice',objective:meta?.learningObjective??'Previous practice',prompt:q.stem,status:q.status,rubric:{format:'single',options:q.options.map(o=>({id:migrateOptionId(o.id),text:o.text})),correctIds:q.options.filter(o=>o.isCorrect).map(o=>migrateOptionId(o.id))},rationale:q.rationale,optionRationales:q.options.map(o=>({id:migrateOptionId(o.id),text:o.text,rationale:o.rationale,correct:o.isCorrect})),sources:[{title:q.referenceText??'Legacy content'}],timerSeconds:q.timerSeconds};});
  const s:StudySession={id:r.id,mode:'challenge',title:CARDIAC_SCENARIOS.find(c=>c.id===r.scenarioId)?.title??'Previous round',scenarioId:r.scenarioId,attempt:r.attempt,questions,responses:r.responses.map(a=>({questionId:migrateItemId(a.itemId),value:{selectedIds:a.selectedAnswerOptionId?[migrateOptionId(a.selectedAnswerOptionId)]:[],rowAnswers:{}},confidence:'unsure',earned:a.isCorrect?1:0,max:1,correct:a.isCorrect,timedOut:a.timedOut,elapsedMs:a.responseMs,submittedAt:a.answeredAt,exposure:'repeat'})),index:r.index,startedAt:r.startedAt,questionStartedAt:r.deadline-r.items[r.index].timerSeconds*1000,deadline:r.deadline,completedAt:r.completedAt};
  if(r.completedAt!==null)s.challengeScore=challengeScore(s);return s;
}
/** Keep unavailable snapshots persisted, but outside the surfaces rendered by the app. */
function gateSavedSessions(state:LearningState,preview:boolean):LearningState{
  const publishedKeys=new Set([...studyItems(false),...availableCases(false).flatMap(c=>caseQuestions(c.id,false))]
    .filter(q=>q.status==='published').map(q=>`${q.id}\u0000${q.version}`));
  const available=(s:StudySession)=>s.questions.every(q=>preview?allowed(q.status,true):q.status==='published'&&publishedKeys.has(`${q.id}\u0000${q.version}`));
  // Current sessions take precedence if a persisted archive contains the same ID.
  const uniqueSessions=new Map<string,StudySession>();
  for(const session of [...(state.active?[state.active]:[]),...state.history,...(state.withheldSessions??[])])if(!uniqueSessions.has(session.id))uniqueSessions.set(session.id,session);
  const sessions=[...uniqueSessions.values()];
  const active=sessions.find(s=>s.completedAt===null&&available(s))??null;
  const history=sessions.filter(s=>s.completedAt!==null&&available(s));
  const withheldSessions=sessions.filter(s=>s!==active&&!history.includes(s));
  const {withheldSessions:previousArchive,...rest}=state;
  return {...rest,active,history,...(withheldSessions.length?{withheldSessions}:{})};
}
export function migrateLegacy(raw:string|null,preview=isContentPreview):LearningState{
  const old=restoreV1(raw);
  return gateSavedSessions({...initialLearningState,active:old.active?migrateRound(old.active):null,history:old.history.map(migrateRound),challengeAttempts:old.attempts,reports:old.reports.map((r,i)=>({id:`legacy-report-${i}`,questionId:migrateItemId(r.itemId),version:'legacy-1',question:'Report from a previous round',reason:r.reason,createdAt:r.createdAt,status:'open'}))},preview);
}
export function restoreLearning(raw:string,preview=isContentPreview):LearningState{
  const state=JSON.parse(raw);
  if(!state||state.version!==2||!Array.isArray(state.history)||!Array.isArray(state.reports)||state.withheldSessions!==undefined&&!Array.isArray(state.withheldSessions)||!state.concepts||typeof state.concepts!=='object'||Array.isArray(state.concepts)||!state.challengeAttempts)throw new Error('Invalid study data');
  if(state.rewardLedger!==undefined&&!validRewardLedger(state.rewardLedger))throw new Error('Invalid reward data');
  const validQuestion=(q:StudyQuestion)=>q&&['id','version','conceptId','conceptLabel','objective','prompt','rationale','status'].every(k=>typeof q[k as keyof StudyQuestion]==='string')&&Number.isFinite(q.timerSeconds)&&q.timerSeconds>=0&&Array.isArray(q.sources)&&q.sources.every(source=>typeof source.title==='string'&&(source.url===undefined||/^https:\/\//.test(source.url)))&&Array.isArray(q.optionRationales)&&q.optionRationales.every(o=>typeof o.id==='string'&&typeof o.text==='string'&&typeof o.rationale==='string')&&[q.chart,q.previousChart,q.cues].every(v=>v===undefined||Array.isArray(v)&&v.every(x=>typeof x==='string'))&&q.rubric&&scoreNgn(q.rubric,{selectedIds:[],rowAnswers:{}}).max>0;
  const validSession=(s:StudySession)=>s&&['learn','review','case','challenge'].includes(s.mode)&&typeof s.id==='string'&&typeof s.title==='string'&&Array.isArray(s.questions)&&s.questions.length>0&&s.questions.every(validQuestion)&&Array.isArray(s.responses)&&Number.isInteger(s.index)&&s.index>=0&&s.index<s.questions.length&&s.responses.length>=s.index&&s.responses.length<=s.index+1&&s.responses.every((r:StudyResponse,i:number)=>r.questionId===s.questions[i].id&&r.value&&Array.isArray(r.value.selectedIds)&&r.value.rowAnswers&&Number.isFinite(r.earned)&&Number.isFinite(r.max)&&r.max>0)&&Number.isFinite(s.questionStartedAt)&&(s.deadline===null||Number.isFinite(s.deadline));
  if((state.active!==null&&!validSession(state.active))||!state.history.every(validSession)||!(state.withheldSessions??[]).every(validSession)||!Object.values(state.concepts).every((c:any)=>typeof c.id==='string'&&typeof c.label==='string'&&Array.isArray(c.seenIds)&&Number.isFinite(c.dueAt)&&Number.isFinite(c.attempts)&&Number.isFinite(c.firstAttempts)&&Number.isFinite(c.firstCorrect))||!state.reports.every((r:ContentReport)=>typeof r.id==='string'&&typeof r.reason==='string'&&typeof r.version==='string'))throw new Error('Invalid saved session');
  if(state.history.some((s:StudySession)=>!Number.isFinite(s.completedAt)||s.responses.length!==s.questions.length)||state.active?.completedAt!==undefined&&state.active?.completedAt!==null)throw new Error('Invalid completion state');
  if(!Object.values(state.challengeAttempts).every(n=>Number.isInteger(n)&&Number(n)>=0))throw new Error('Invalid challenge attempts');
  for(const session of [...state.history,...(state.active?[state.active]:[]),...(state.withheldSessions??[])] as StudySession[]){
    if(session.completedAt!==null&&(!Number.isFinite(session.completedAt)||session.responses.length!==session.questions.length))throw new Error('Invalid archived completion state');
    if(session.questions.some(q=>q.difficulty!==undefined&&!['foundation','application','advanced'].includes(q.difficulty)||q.scenarioId!==undefined&&typeof q.scenarioId!=='string'))throw new Error('Invalid question metadata');
    if(!Number.isFinite(session.startedAt)||!Number.isInteger(session.attempt)||session.attempt<1||session.mode==='challenge'&&(session.deadline===null||session.questions.some(q=>q.timerSeconds<=0)))throw new Error('Invalid session metadata');
    for(const [index,response] of session.responses.entries()){
      if(response.rewardEligible!==undefined&&typeof response.rewardEligible!=='boolean')throw new Error('Invalid reward eligibility');
      if(!['unsure','somewhat','sure'].includes(response.confidence)||!['first','repeat'].includes(response.exposure)||!Number.isFinite(response.submittedAt)||!Number.isFinite(response.elapsedMs)||response.elapsedMs<0||response.earned<0||response.earned>response.max||typeof response.correct!=='boolean'||typeof response.timedOut!=='boolean')throw new Error('Invalid response');
      const evaluated=scoreNgn(session.questions[index].rubric,response.value);
      if(!response.timedOut&&(!evaluated.valid||evaluated.earned!==response.earned||evaluated.max!==response.max||evaluated.correct!==response.correct)||response.timedOut&&(response.earned!==0||response.correct||session.mode!=='challenge'))throw new Error('Response does not match its saved rubric');
    }
  }
  return gateSavedSessions(state,preview);
}
