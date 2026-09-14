import {describe,expect,it} from 'vitest';
import {neuroCases,neuroConcepts,neuroLessons,neuroQuestions,neuroScenarios,neuroVersion} from '../content/neuro-loc-pack';
import {isTeachingMetadata} from '../content/teaching-metadata';
import {availableCases,availableLessons,beginSession,caseQuestions,initialLearningState,nextQuestion,restoreLearning,sessionPool,studyItems,submitResponse} from '../lib/learning';
import {scoreNgn,type NgnResponse} from '../lib/ngn';

const START=Date.UTC(2026,8,14,12);
const response=(id:string,keys:string[]):NgnResponse=>({selectedIds:keys.map(key=>`${id}-${key}`),rowAnswers:{}});
const intendedKeys=[['drowsy'],['worse'],['13'],['nt'],['activate'],['airway'],['hearing','sedation','language','baseline'],['npo','route','assess'],['changed'],['objective'],['trend','teach','swallow'],['evaluate']];
const caseKeys=[['eyes'],['acute'],['airway'],['trend','npo','prepare'],['sbar'],['continue']];

describe('LOC pack authoring and learning integration (not clinical validation)',()=>{
  it('adds 12 unique questions, one linked six-stage case and one lesson to preview',()=>{
    expect(neuroQuestions).toHaveLength(12);
    expect(neuroCases).toHaveLength(1);
    expect(neuroLessons).toHaveLength(1);
    expect(studyItems(true)).toHaveLength(78);
    expect(availableCases(true)).toHaveLength(5);
    expect(availableLessons(true)).toHaveLength(7);
    expect(sessionPool(neuroScenarios[0].id,true)).toHaveLength(12);
    const ids=[...studyItems(true).map(q=>q.id),...availableCases(true).flatMap(c=>[c.id,...c.stages.map(s=>s.id)]),...availableLessons(true).map(l=>l.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('keeps the full new pack out of production and caps requested rounds at available unique items',()=>{
    expect(sessionPool(neuroScenarios[0].id,false)).toEqual([]);
    expect(caseQuestions(neuroCases[0].id,false)).toEqual([]);
    expect(availableLessons(false)).not.toContainEqual(neuroLessons[0]);
    const state=beginSession(structuredClone(initialLearningState),'learn',neuroScenarios[0].id,START,true,{questionCount:50});
    expect(state.active!.questions).toHaveLength(12);
    expect(new Set(state.active!.questions.map(q=>q.id)).size).toBe(12);
  });
  it.each(neuroQuestions.map((q,index)=>({q,index})))('scores the editorial key and rejects an incorrect option for $q.id',({q,index})=>{
    expect(scoreNgn(q.rubric,response(q.id,intendedKeys[index]))).toMatchObject({valid:true,correct:true});
    const correct=new Set(response(q.id,intendedKeys[index]).selectedIds);
    const wrong=q.rubric.options.find(option=>!correct.has(option.id))!;
    expect(scoreNgn(q.rubric,{selectedIds:[wrong.id],rowAnswers:{}})).toMatchObject({valid:true,correct:false,earned:0});
    expect(q.optionRationales.filter(o=>o.correct).map(o=>o.id)).toEqual([...correct]);
    expect(q.optionRationales.map(o=>o.id)).toEqual(q.rubric.options.map(o=>o.id));
    expect(q.optionRationales.every(o=>o.rationale.length>20)).toBe(true);
  });
  it('uses partial credit for an incomplete multiple-response answer and accounts for a distractor',()=>{
    const q=neuroQuestions[7];
    expect(scoreNgn(q.rubric,response(q.id,['npo','route']))).toMatchObject({valid:true,correct:false,earned:2,max:3});
    expect(scoreNgn(q.rubric,response(q.id,['npo','route','water']))).toMatchObject({valid:true,correct:false,earned:1,max:3});
  });
  it('keeps review attribution honest and tracks every new content version',()=>{
    const entries=[...neuroQuestions,...neuroCases,...neuroCases.flatMap(c=>c.stages),...neuroLessons];
    for(const entry of entries){
      expect(entry.status).toBe('needs_review');
      expect(isTeachingMetadata(entry.metadata)).toBe(true);
      expect(entry.metadata!.review).toMatchObject({reviewer:null,reviewDate:null,approvalStatus:'needs_review',contentVersion:neuroVersion});
      expect(entry.metadata!.courseTopic).toContain('Medical-Surgical III');
      expect(entry.metadata!.clientNeedsCategory).toContain('Physiological Integrity');
    }
    expect(new Set(neuroQuestions.map(q=>q.difficulty))).toEqual(new Set(['foundation','application','advanced']));
    expect(neuroQuestions.every(q=>q.conceptId===neuroConcepts[0].id)).toBe(true);
  });
  it('ignores absent or damaged display metadata rather than assuming a usable review record',()=>{
    for(const bad of [null,undefined,{},true,{...neuroQuestions[0].metadata,review:null},{...neuroQuestions[0].metadata,clinicalJudgmentSkills:['unknown']}]){
      expect(isTeachingMetadata(bad)).toBe(false);
    }
  });
  it('keeps stage order, per-option explanations and prior chart entries without leaking future entries',()=>{
    const c=neuroCases[0];
    const questions=caseQuestions(c.id,true);
    expect(c.stages.map(s=>s.step)).toEqual(['recognize','analyze','prioritize','generate','action','evaluate']);
    questions.forEach((q,index)=>{
      expect(scoreNgn(q.rubric,response(q.id,caseKeys[index]))).toMatchObject({valid:true,correct:true});
      expect(q.previousChart).toEqual(c.stages.slice(0,index).flatMap(stage=>stage.chart));
      expect(q.chart).toEqual([c.patient,...c.stages[index].chart]);
      expect(q.optionRationales.map(o=>o.id)).toEqual(q.rubric.options.map(o=>o.id));
      expect(q.metadata!.clinicalJudgmentSkills).toEqual([c.stages[index].step]);
    });
    expect(JSON.stringify(questions[0].chart)).not.toContain('10:00');
  });
  it('completes the case and restores its responses and teaching metadata across a restart',()=>{
    let state=beginSession(structuredClone(initialLearningState),'case',neuroCases[0].id,START,true);
    for(let i=0;i<6;i++){
      const q=state.active!.questions[i];
      state=submitResponse(state,response(q.id,caseKeys[i]),'somewhat',START+1000+i*2000);
      if(i<5)expect(Object.keys(state.concepts)).toHaveLength(0);
      state=nextQuestion(state,START+1500+i*2000);
    }
    expect(state.active).toBeNull();
    expect(state.history[0].responses.every(r=>r.correct)).toBe(true);
    const restored=restoreLearning(JSON.stringify(state),true);
    expect(restored.history[0].questions[0].metadata).toEqual(neuroCases[0].stages[0].metadata);
    const production=restoreLearning(JSON.stringify(state),false);
    expect(production.history).toHaveLength(0);
    expect(production.withheldSessions).toHaveLength(1);
  });
  it('preserves earlier saved wording while revising the current item under a new version',()=>{
    const q=structuredClone(studyItems(true).find(item=>item.id==='rr-ext-oxygenation-01')!);
    expect(q.prompt).toContain('difficult to arouse');
    expect(q.cues).toContain('Difficult to arouse');
    expect(q.version).toBe('2026-09-14.1');
    q.prompt=q.prompt.replace('difficult to arouse','difficult to wake');q.version='2026-09-11.1';
    const started=beginSession(structuredClone(initialLearningState),'learn',q.scenarioId!,START,true);
    started.active!.questions=[q];
    const restored=restoreLearning(JSON.stringify(started),true);
    expect(restored.active!.questions[0].prompt).toContain('difficult to wake');
    expect(restored.active!.questions[0].version).toBe('2026-09-11.1');
  });
});
