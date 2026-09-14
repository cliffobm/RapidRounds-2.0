// Uses Node 24's built-in TypeScript stripping; the content has type-only imports.
import {writeFileSync} from 'node:fs';
import {neuroQuestions,neuroCases,neuroLessons,neuroVersion} from '../content/neuro-loc-pack.ts';
import {clinicalSkillLabels} from '../content/teaching-metadata.ts';

const lines=['# LOC and neurologic assessment faculty review',
  `Version ${neuroVersion}. Review pending. 12 standalone questions, six case decisions, and one lesson.`,
  'Use the IDs below to request corrections. Review each answer key, distractor, clinical statement, source, and blueprint tag. Blank reviewer fields mean that approval has not been recorded.',
  'Source and terminology decisions are explained in CONTENT_AUTHORING.md. The original course package remains outside this repository.'];
const add=(...values)=>lines.push(...values);
function review(m){add(`Course: ${m.courseTopic}`,`Client Needs: ${m.clientNeedsCategory}`,
  `Clinical judgment: ${m.clinicalJudgmentSkills.map(s=>clinicalSkillLabels[s]).join(', ')}`,
  `Author: ${m.review.author}. Drafted: ${m.review.draftedOn}. Approval: needs_review.`,
  'Reviewer and credentials: __________  Review date: __________',
  'Decision and requested changes: __________');}
function sources(items){add('Sources:',...items.map(s=>`- [${s.title}](${s.url})`));}
function item(q){add(`## ${q.id}`,q.objective??q.title,`Format: ${q.rubric.format}. Difficulty: ${q.difficulty??'application'}.`,q.prompt);
  add(...q.optionRationales.map(o=>`- **${o.id}${o.correct?' — KEY':''}: ${o.text}**\n\n  ${o.rationale}`));
  add(`Takeaway: ${q.rationale}`,`Key cues: ${(q.cues??[]).join('; ')}`,`Mechanism: ${q.mechanism}`,`Transfer reflection: ${q.transferPrompt}`);
  sources(q.sources);review(q.metadata);}
for(const q of neuroQuestions)item(q);
for(const c of neuroCases){add(`# Case ${c.id}`,c.title,c.description,c.patient);review(c.metadata);
  for(const stage of c.stages){add('Current chart entries:',...stage.chart.map(entry=>`- ${entry}`));item({
    ...stage,objective:stage.title,rubric:{format:stage.format},rationale:stage.rationale.takeaway,
    cues:stage.rationale.cues,mechanism:stage.rationale.mechanism,transferPrompt:stage.rationale.transferPrompt});}}
for(const l of neuroLessons){add(`# Lesson ${l.id}`,l.title,l.summary,`Estimated duration: ${l.estimatedMinutes} minutes.`,'Objectives:',...l.objectives.map(x=>`- ${x}`),
  ...l.steps.map((step,i)=>`## Teaching step ${i+1}\n\n${step}`));
  for(const chart of l.referenceCharts)add(`## ${chart.title}`,...chart.rows.map(row=>`- **${row.label}:** ${row.detail}`),chart.note);
  add('## Worked example',l.workedExample,'## Reflection',l.reflection);
  for(const exercise of l.documentationExercises)add(`## Documentation exercise ${exercise.id}`,`Original: ${exercise.original}`,`Observations: ${exercise.observations}`,`Model note: ${exercise.modelNote}`,'Self-check:',...exercise.selfCheck.map(x=>`- ${x}`));
  sources(l.sources);review(l.metadata);}
writeFileSync(new URL('../docs/NEURO_PACK_REVIEW.md',import.meta.url),lines.join('\n\n')+'\n');
console.log(`Exported faculty review for ${neuroVersion}.`);
