#!/usr/bin/env ts-node
/**
 * CSV -> .testbank.json
 * Required header:
 * id,topic,difficulty,stem,question,optionA,optionB,optionC,optionD,correct_answer,rationale,clinical_pearl,tags,assets
 * - tags: pipe-separated (e.g., cardio|valves)
 * - assets: JSON object (optional)
 *
 * Usage:
 *   npx ts-node scripts/csv_to_testbank.ts input.csv qbank/banks/my_bank.testbank.json "My Bank Title" "my_bank_id"
 */
import fs from "fs";
import path from "path";

function parseCSV(s: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') {
      if (inQ && s[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === "," && !inQ) {
      row.push(cur); cur = "";
    } else if ((c === "\n" || c === "\r") && !inQ) {
      if (cur !== "" || row.length) { row.push(cur); rows.push(row); row = []; cur = ""; }
    } else {
      cur += c;
    }
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.length && r.some(cell => cell.trim() !== ""));
}

function main() {
  const [,, inCsv, outJson, title = "Imported Bank", bankId = "imported_bank"] = process.argv;
  if (!inCsv || !outJson) {
    console.error("Usage: ts-node scripts/csv_to_testbank.ts input.csv out.testbank.json \"Title\" \"bank_id\"");
    process.exit(1);
  }
  const raw = fs.readFileSync(inCsv, "utf-8");
  const rows = parseCSV(raw);
  const header = rows.shift()!.map(h => h.trim());
  const H = (name: string) => header.indexOf(name);
  const items = rows.map((r, idx) => {
    const get = (k: string) => r[H(k)]?.trim() ?? "";
    const options = ["optionA","optionB","optionC","optionD"].map(get).filter(Boolean);
    const tags = get("tags") ? get("tags").split("|").map(s => s.trim()).filter(Boolean) : undefined;
    let assets: any = undefined;
    const assetsStr = get("assets");
    if (assetsStr) { try { assets = JSON.parse(assetsStr); } catch {} }
    return {
      id: get("id") || `q${idx+1}`,
      topic: get("topic"),
      difficulty: (get("difficulty") || "moderate").toLowerCase(),
      stem: get("stem") || undefined,
      question: get("question"),
      options,
      correct_answer: (get("correct_answer") || "A").toUpperCase(),
      rationale: get("rationale") || undefined,
      clinical_pearl: get("clinical_pearl") || undefined,
      tags,
      assets
    };
  });
  const bank = { version: "1.0.0", bank_id: bankId, title, source_note: "CSV import", items };
  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(outJson, JSON.stringify(bank, null, 2), "utf-8");
  console.log(`Wrote ${items.length} items to ${outJson}`);
}
main();


