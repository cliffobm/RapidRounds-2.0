import { describe, expect, it } from 'vitest';
import { expandedCases, expandedConcepts, expandedQuestions, expandedScenarios, lessons } from '../content/expanded-content';
import { catalogItems } from '../content/catalog';
import { learningCases, type CaseStage } from '../content/learning-cases';
import { scoreNgn, type NgnItem, type NgnResponse } from '../lib/ngn';

function keyResponse(item:NgnItem):NgnResponse {
  return item.format==='matrix'||item.format==='cloze'
    ? {selectedIds:[],rowAnswers:Object.fromEntries(item.rows.map(row=>[row.id,row.correctOptionId]))}
    : {selectedIds:[...item.correctIds],rowAnswers:{}};
}
function stageRubric(stage:CaseStage):NgnItem {
  if(stage.format==='matrix')return {format:'matrix',options:stage.options,rows:stage.rows!};
  if(stage.format==='selectN')return {format:'selectN',options:stage.options,correctIds:stage.correctIds,selectCount:stage.selectCount!};
  return {format:stage.format,options:stage.options,correctIds:stage.correctIds};
}
const allowedHosts=new Set(['www.nhlbi.nih.gov','www.niddk.nih.gov','www.cdc.gov','www.fda.gov','www.nice.org.uk','www.heart.org','www.ahrq.gov','digital.ahrq.gov','medlineplus.gov','dailymed.nlm.nih.gov']);

describe('expanded educational content: authoring checks, not clinical validation',()=>{
  it('adds 36 distinct standalone questions across six concept rounds with three difficulty levels',()=>{
    expect(expandedQuestions).toHaveLength(36);
    expect(expandedConcepts).toHaveLength(6);
    expect(expandedScenarios).toHaveLength(6);
    expect(new Set(expandedQuestions.map(q=>q.prompt)).size).toBe(36);
    for(const concept of expandedConcepts){
      const group=expandedQuestions.filter(q=>q.conceptId===concept.id);
      expect(group).toHaveLength(6);
      expect(new Set(group.map(q=>q.difficulty))).toEqual(new Set(['foundation','application','advanced']));
      for(const q of group){
        expect(q.conceptLabel).toBe(concept.label);
        expect(expandedScenarios.some(s=>s.id===q.scenarioId)).toBe(true);
        expect(q.timerSeconds).toBeGreaterThan(0);
      }
    }
  });

  it('keeps all content gated as draft and IDs separate from the original catalog and cases',()=>{
    const newIds=[...expandedQuestions.map(q=>q.id),...expandedCases.flatMap(c=>[c.id,...c.stages.map(s=>s.id)]),...lessons.map(l=>l.id)];
    const originalIds=[...catalogItems.map(q=>q.id),...learningCases.flatMap(c=>[c.id,...c.stages.map(s=>s.id)])];
    expect(new Set(newIds).size).toBe(newIds.length);
    for(const id of newIds){expect(id.startsWith('rr-ext-')).toBe(true);expect(originalIds).not.toContain(id);}
    for(const q of expandedQuestions){expect(q.status).toBe('needs_review');expect(q.version).toMatch(/^\d{4}-\d{2}-\d{2}\.\d+$/);}
    for(const c of expandedCases){expect(c.status).toBe('needs_review');for(const s of c.stages){expect(s.status).toBe('needs_review');expect(s.contentVersion).toBe(c.contentVersion);}}
    for(const lesson of lessons)expect(lesson.status).toBe('needs_review');
  });

  it('gives each standalone option its own explanation matching its key',()=>{
    for(const q of expandedQuestions){
      expect(q.optionRationales.map(o=>o.id)).toEqual(q.rubric.options.map(o=>o.id));
      const rubric=q.rubric;
      expect(rubric.format==='single'||rubric.format==='multiple'||rubric.format==='selectN').toBe(true);
      if(rubric.format==='matrix'||rubric.format==='cloze')throw new Error('Unexpected standalone row item');
      expect(q.optionRationales.filter(o=>o.correct).map(o=>o.id)).toEqual(rubric.correctIds);
      expect(q.optionRationales.some(o=>!o.correct)).toBe(true);
      for(const option of q.optionRationales)expect(option.rationale.length).toBeGreaterThan(25);
      expect(q.cues!.length).toBeGreaterThanOrEqual(2);
      expect(q.mechanism!.length).toBeGreaterThan(30);
      expect(q.transferPrompt!.length).toBeGreaterThan(30);
      const evaluated=scoreNgn(rubric,keyResponse(rubric));
      expect(evaluated.valid,q.id).toBe(true);
      expect(evaluated.correct,q.id).toBe(true);
      expect(evaluated.earned).toBe(evaluated.max);
      const wrong=rubric.options.find(o=>!rubric.correctIds.includes(o.id))!.id;
      const perturbed=keyResponse(rubric);
      perturbed.selectedIds[0]=wrong;
      const result=scoreNgn(rubric,perturbed);
      expect(result.valid,q.id).toBe(true);
      expect(result.correct,q.id).toBe(false);
    }
  });

  it('uses all six stages in order and validates every case row and answer key',()=>{
    expect(expandedCases).toHaveLength(3);
    for(const c of expandedCases){
      expect(c.stages.map(s=>s.step)).toEqual(['recognize','analyze','prioritize','generate','action','evaluate']);
      expect(c.description).toContain('fictional');
      for(const stage of c.stages){
        expect(stage.chart.length).toBeGreaterThan(0);
        expect(stage.chart.every(entry=>/^\d{2}:\d{2} •/.test(entry))).toBe(true);
        expect(expandedConcepts.some(concept=>concept.id===stage.conceptId&&concept.label===stage.conceptLabel)).toBe(true);
        expect(stage.rationale.distractors.length).toBeGreaterThan(0);
        expect(stage.rationale.cues.length).toBeGreaterThanOrEqual(2);
        const rubric=stageRubric(stage);
        const result=scoreNgn(rubric,keyResponse(rubric));
        expect(result.valid,stage.id).toBe(true);
        expect(result.correct,stage.id).toBe(true);
        if(rubric.format==='matrix'){
          const response=keyResponse(rubric);
          const first=rubric.rows[0];
          response.rowAnswers[first.id]=rubric.options.find(o=>o.id!==first.correctOptionId)!.id;
          const partial=scoreNgn(rubric,response);
          expect(partial.valid).toBe(true);
          expect(partial.earned).toBe(rubric.rows.length-1);
          expect(partial.correct).toBe(false);
        }
      }
    }
  });

  it('keeps multiple-response deductions and fixed-choice partial credit distinct',()=>{
    const multiple=expandedQuestions.find(q=>q.rubric.format==='multiple')!.rubric;
    const selectN=expandedQuestions.find(q=>q.rubric.format==='selectN')!.rubric;
    if(multiple.format!=='multiple'||selectN.format!=='selectN')throw new Error('Missing formats');
    const multipleWrong=multiple.options.find(o=>!multiple.correctIds.includes(o.id))!.id;
    expect(scoreNgn(multiple,{selectedIds:[...multiple.correctIds,multipleWrong],rowAnswers:{}}).earned).toBe(multiple.correctIds.length-1);
    const fixedWrong=selectN.options.find(o=>!selectN.correctIds.includes(o.id))!.id;
    const partial=[fixedWrong,...selectN.correctIds.slice(1)];
    expect(scoreNgn(selectN,{selectedIds:partial,rowAnswers:{}}).earned).toBe(selectN.selectCount-1);
    expect(scoreNgn(selectN,{selectedIds:selectN.correctIds.slice(1),rowAnswers:{}}).valid).toBe(false);
  });

  it('provides a worked lesson and traceable source links for every concept and item',()=>{
    expect(lessons).toHaveLength(6);
    expect(new Set(lessons.map(l=>l.conceptId))).toEqual(new Set(expandedConcepts.map(c=>c.id)));
    for(const lesson of lessons){expect(lesson.steps).toHaveLength(4);expect(lesson.workedExample.length).toBeGreaterThan(100);expect(lesson.reflection.length).toBeGreaterThan(30);}
    const sources=[...expandedQuestions,...expandedCases,...expandedCases.flatMap(c=>c.stages),...lessons].flatMap(item=>{
      expect(item.sources.length).toBeGreaterThan(0);
      return item.sources;
    });
    for(const source of sources){
      expect(source.title.length).toBeGreaterThan(10);
      const url=new URL(source.url!);
      expect(url.protocol).toBe('https:');
      expect(allowedHosts.has(url.hostname)).toBe(true);
    }
  });
});
