import type {ClinicalStep} from './learning-cases';

export const clinicalSkillLabels:Record<ClinicalStep,string>={
  recognize:'Recognize cues',analyze:'Analyze cues',prioritize:'Prioritize hypotheses',
  generate:'Generate solutions',action:'Take action',evaluate:'Evaluate outcomes',
};

export interface TeachingMetadata {
  courseTopic:string;
  clientNeedsCategory:string;
  clinicalJudgmentSkills:ClinicalStep[];
  review:{
    author:string;
    reviewer:string|null;
    reviewDate:string|null;
    approvalStatus:'needs_review'|'approved';
    contentVersion:string;
    draftedOn:string;
  };
}

export interface LessonReferenceChart {
  title:string;
  rows:{label:string;detail:string}[];
  note:string;
}

export interface DocumentationExercise {
  id:string;
  original:string;
  observations:string;
  modelNote:string;
  selfCheck:string[];
}

// Saved question snapshots can predate this schema or contain damaged metadata.
// A missing teaching label must never prevent access to a saved explanation.
export function isTeachingMetadata(value:unknown):value is TeachingMetadata {
  if(!value||typeof value!=='object')return false;
  const m=value as Partial<TeachingMetadata>;
  const r=m.review;
  return typeof m.courseTopic==='string'&&typeof m.clientNeedsCategory==='string'&&
    Array.isArray(m.clinicalJudgmentSkills)&&m.clinicalJudgmentSkills.length>0&&
    m.clinicalJudgmentSkills.every(skill=>Object.hasOwn(clinicalSkillLabels,skill))&&
    !!r&&typeof r==='object'&&typeof r.author==='string'&&
    (r.reviewer===null||typeof r.reviewer==='string')&&(r.reviewDate===null||typeof r.reviewDate==='string')&&
    ['needs_review','approved'].includes(r.approvalStatus)&&typeof r.contentVersion==='string'&&typeof r.draftedOn==='string';
}
