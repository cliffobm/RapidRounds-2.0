import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { adaptLegacyBank, adaptLegacyItem } from './legacy-qbank-adapter.mjs';
import { applyCompetencyMapping, validateAuthoredQuestion, validateRegistryConsistency, isEligibleForCompetencyEvidence } from './validation.mjs';
const source = { id: 'fixture', question: 'Nonclinical structural fixture question?', options: ['First', 'Second'], correct_answer: 'B', rationale: 'Original text', extension: { keep: true } };
const mapping = { source_version: '1', primary_competency: 'analyze_cues', clinical_domain: 'cardiovascular', complexity_level: 3, learning_objective: 'Structural validation fixture only' };
function authored() {
  return { id: 'fixture', case_family_id: 'fixture-family', stem: source.question,
    options: [{ id: 'A', text: 'First' }, { id: 'B', text: 'Second' }], correct_option_id: 'B',
    primary_competency: 'analyze_cues', clinical_domain: 'cardiovascular', complexity_level: 3,
    learning_objective: 'Structural validation fixture only', review_status: 'draft', calibration_status: 'uncalibrated',
    rationale: { normal_physiology: 'Fixture', pathophysiology: 'Fixture', decisive_cues: 'Fixture',
      correct_answer: 'Fixture', distractors: { A: 'Fixture' }, nursing_implications: 'Fixture', reassessment: 'Fixture' } };
}
test('registry and authored schema agree', () => assert.deepEqual(validateRegistryConsistency(), []));
test('all 17 canonical datasets retain original payloads, answers, and draft status', () => {
  const directory = new URL('../qbank/banks/', import.meta.url);
  let banks = 0, count = 0;
  for (const name of readdirSync(directory).filter(value => value.endsWith('.json'))) {
    const bank = JSON.parse(readFileSync(new URL(name, directory), 'utf8'));
    if (!Array.isArray(bank) && !Object.hasOwn(bank, 'items')) continue;
    const source = Array.isArray(bank) ? bank : bank.items, before = structuredClone(source);
    const drafts = adaptLegacyBank(bank, name);
    banks++; count += source.length;
    for (let index = 0; index < source.length; index++) {
      const item = source[index], draft = drafts[index];
      assert.deepEqual(draft.legacy.source_item, item);
      const answerIndex = Object.hasOwn(item, 'answer') ? item.answer : item.correct_answer.trim().toUpperCase().charCodeAt(0) - 65;
      assert.equal(draft.options.find(option => option.id === draft.correct_option_id).text, item.options[answerIndex]);
      assert.equal(draft.rationale.legacy_text, item.rationale ?? null);
      assert.equal(isEligibleForCompetencyEvidence(draft), false);
    }
    assert.deepEqual(source, before);
  }
  assert.equal(banks, 17); assert.equal(count, 168);
});
test('copies the entire source payload without shared references', () => {
  const draft = adaptLegacyItem(source, 'fixture-bank', '1');
  assert.deepEqual(draft.legacy.source_item, source);
  draft.legacy.source_item.extension.keep = false;
  assert.equal(source.extension.keep, true);
});
test('adapts explicit zero-based answers and requires an array bank identity', () => {
  const { correct_answer, ...rest } = source;
  const items = [{ ...rest, answer: 1 }];
  assert.equal(adaptLegacyBank(items, 'resp-fixture')[0].correct_option_id, 'B');
  assert.throws(() => adaptLegacyBank(items), /bank ID/);
});
test('rejects unsupported or ambiguous answers instead of guessing', () => {
  for (const value of ['BC', '', 1, 'Z']) assert.throws(() => adaptLegacyItem({ ...source, correct_answer: value }));
  const { correct_answer, ...rest } = source;
  for (const answer of [-1, 0.5, '1', 2, null]) assert.throws(() => adaptLegacyItem({ ...rest, answer }));
  assert.throws(() => adaptLegacyItem({ ...source, answer: 1 }), /Ambiguous/);
});
test('rejects malformed options and whitespace-only identities', () => {
  assert.throws(() => adaptLegacyItem({ ...source, options: ['One', ' '] }));
  assert.throws(() => adaptLegacyItem({ ...source, id: ' ' }));
});
test('explicit metadata is validated without approving or calibrating a draft', () => {
  const draft = adaptLegacyItem(source, 'fixture-bank', '1'), copy = structuredClone(draft);
  const mapped = applyCompetencyMapping(draft, mapping);
  assert.equal(mapped.primary_competency, 'analyze_cues');
  assert.equal(mapped.review_status, 'draft');
  assert.equal(mapped.calibration_status, 'uncalibrated');
  assert.deepEqual(mapped.rationale, draft.rationale);
  assert.equal(isEligibleForCompetencyEvidence(mapped), false);
  assert.deepEqual(draft, copy);
  for (const change of [{ primary_competency: 'made_up' }, { clinical_domain: 'made_up' }, { complexity_level: 6 }, { source_version: '2' }, { learning_objective: ' ' }]) {
    assert.throws(() => applyCompetencyMapping(draft, { ...mapping, ...change }));
  }
});
test('full authored contract validates structure and cross-field semantics', () => {
  assert.deepEqual(validateAuthoredQuestion(authored()), []);
  for (const mutate of [
    q => q.options.push({ id: 'A', text: 'Duplicate' }),
    q => q.correct_option_id = 'Z',
    q => q.rationale.distractors = {},
    q => q.rationale.distractors.B = 'Correct answer cannot be a distractor',
    q => q.rationale.pathophysiology = '',
    q => q.rationale.pathophysiology = ' ',
    q => q.id = ' ',
    q => q.options[0].unexpected = true,
    q => q.learning_objective = ''
  ]) { const q = authored(); mutate(q); assert.ok(validateAuthoredQuestion(q).length > 0); }
  for (const q of [null, {}, { options: [null] }]) assert.ok(validateAuthoredQuestion(q).length > 0);
});
test('competency evidence needs approved, referenced, calibrated records', () => {
  const q = authored();
  assert.equal(isEligibleForCompetencyEvidence(q), false);
  q.review_status = 'approved'; q.calibration_status = 'calibrated';
  assert.equal(isEligibleForCompetencyEvidence(q), false);
  q.references = ['fixture-only-reference'];
  assert.equal(isEligibleForCompetencyEvidence(q), true);
  q.calibration_status = 'uncalibrated';
  assert.equal(isEligibleForCompetencyEvidence(q), false);
});
