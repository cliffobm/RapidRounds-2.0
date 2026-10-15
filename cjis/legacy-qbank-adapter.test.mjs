import test from "node:test";
import assert from "node:assert/strict";
import { adaptLegacyBank } from "./legacy-qbank-adapter.mjs";
const sample = {bank_id:"acute_mi_v1",items:[{id:"sample-1",topic:"Cardio • ACS",difficulty:"easy",stem:"Chest pain and elevated troponin.",question:"Diagnosis?",options:["Unstable angina","NSTEMI","STEMI","Variant angina"],correct_answer:"B",rationale:"Original rationale.",tags:["NSTEMI"]}]};
test("preserves original answer, item identity and clinical text",()=>{
  const [x]=adaptLegacyBank(sample);
  assert.equal(x.id,"sample-1");
  assert.equal(x.correct_option_id,"B");
  assert.equal(x.options[1].text,"NSTEMI");
  assert.match(x.stem,/Chest pain/);
  assert.equal(x.rationale.legacy_text,"Original rationale.");
  assert.equal(x.primary_competency,null);
  assert.equal(x.review_status,"draft");
});
test("rejects invalid answer keys",()=>assert.throws(()=>adaptLegacyBank({...sample,items:[{...sample.items[0],correct_answer:"Z"}]})));
test("rejects duplicate IDs",()=>assert.throws(()=>adaptLegacyBank({...sample,items:[sample.items[0],sample.items[0]]})));
test('rejects ambiguous or non-letter answers', () => {
  for (const answer of ['', 'AB', 'A,C', '1', 1, null]) {
    assert.throws(() => adaptLegacyBank({ ...sample, items: [{ ...sample.items[0], correct_answer: answer }] }));
  }
});
test('rejects malformed items and banks', () => {
  for (const item of [null, {}, { ...sample.items[0], id: '' }, { ...sample.items[0], options: ['a'] },
    { ...sample.items[0], options: ['a', {}] }, { ...sample.items[0], options: ['a', ''] },
    { ...sample.items[0], question: '' }, { ...sample.items[0], options: Array(27).fill('option') }]) {
    assert.throws(() => adaptLegacyBank({ ...sample, items: [item] }));
  }
  assert.throws(() => adaptLegacyBank({ items: [] }));
});
test('preserves unknown source metadata without aliasing the input', () => {
  const original = { ...sample.items[0], extra: { source: ['original'] } };
  const [draft] = adaptLegacyBank({ ...sample, items: [original] });
  assert.deepEqual(draft.legacy.source, original);
  original.extra.source.push('mutation');
  assert.deepEqual(draft.legacy.source.extra.source, ['original']);
});
test('normalizes a lower-case answer with surrounding whitespace', () => {
  const [draft] = adaptLegacyBank({ ...sample, items: [{ ...sample.items[0], correct_answer: ' b ' }] });
  assert.equal(draft.correct_option_id, 'B');
});
test('supports the nullable stems present in the real vascular and hypertension banks', () => {
  const [draft] = adaptLegacyBank({ ...sample, items: [{ ...sample.items[0], stem: null }] });
  assert.equal(draft.stem, sample.items[0].question);
  assert.equal(draft.legacy.source.stem, null);
});
