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
