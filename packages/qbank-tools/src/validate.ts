#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { QBank } from "./types";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function validateBank(jsonPath: string): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  let data: QBank | null = null;
  try { data = JSON.parse(fs.readFileSync(jsonPath, "utf-8")); }
  catch (e: any) { errors.push(`Invalid JSON: ${e.message}`); return { ok: false, errors }; }
  if (!data) return { ok: false, errors: ["No data"] };
  if (!Array.isArray(data.items)) errors.push("items must be an array");
  const seen = new Set<string>();
  data.items?.forEach((it: any, idx: number) => {
    if (!it.id) errors.push(`item[${idx}] missing id`);
    if (it.id && seen.has(it.id)) errors.push(`item[${idx}] duplicate id ${it.id}`);
    if (it.id) seen.add(it.id);
    if (!it.topic) errors.push(`item[${idx}] missing topic`);
    if (!it.question) errors.push(`item[${idx}] missing question`);
    if (!Array.isArray(it.options) || it.options.length < 2) errors.push(`item[${idx}] options must have >= 2`);
    if (typeof it.correct_answer !== "string") errors.push(`item[${idx}] correct_answer must be a string letter`);
    const optionsLen = Array.isArray(it.options) ? it.options.length : 0;
    const maxLetter: string = letters[Math.max(0, optionsLen - 1)] ?? "A";
    if (typeof it.correct_answer === "string") {
      const ca = it.correct_answer.toUpperCase();
      if (!letters.includes(ca)) errors.push(`item[${idx}] correct_answer must be A..Z`);
      else if (letters.indexOf(ca) > letters.indexOf(maxLetter)) errors.push(`item[${idx}] correct_answer '${ca}' out of bounds (max ${maxLetter})`);
    }
  });
  return { ok: errors.length === 0, errors };
}

function printHelp() {
  console.log(`Usage: qbank-validate <path-or-dir>
Validates *.testbank.json files.`);
}

async function main() {
  const arg = process.argv[2];
  if (!arg || arg === "-h" || arg === "--help") { printHelp(); return; }
  const target = path.resolve(process.cwd(), arg as string);
  const stats = fs.statSync(target);
  const files: string[] = [];
  if (stats.isDirectory()) {
    for (const f of fs.readdirSync(target)) if (f.endsWith(".testbank.json")) files.push(path.join(target, f));
  } else files.push(target);
  let total = 0, failed = 0;
  for (const file of files) {
    total++;
    const { ok, errors } = validateBank(file);
    if (ok) console.log(`✔ ${file}`);
    else {
      failed++; console.log(`✘ ${file}`);
      for (const e of errors) console.log(`  - ${e}`);
    }
  }
  if (failed) { console.error(`\n${failed}/${total} file(s) failed validation.`); process.exit(1); }
  else console.log(`\nAll ${total} file(s) valid.`);
}
main();
