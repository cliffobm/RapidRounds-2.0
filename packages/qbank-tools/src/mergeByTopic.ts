#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { QBank, QBankItem } from "./types";

function loadBank(p: string): QBank { return JSON.parse(fs.readFileSync(p, "utf-8")); }
function matchTopic(item: QBankItem, prefixes: string[]): boolean {
  if (!prefixes.length) return true;
  const topic = item.topic || "";
  return prefixes.some(p => topic.toLowerCase().startsWith(p.toLowerCase()));
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log(`Usage: qbank-merge-by-topic <outFile> <topicPrefix1,topicPrefix2,...> <fileOrDir> [more files/dirs...]`);
    process.exit(1);
  }
  const [outFile, prefixList, ...inputs] = args as [string, string, ...string[]];
  const prefixes = (prefixList ?? "").split(",").map(s => s.trim()).filter(Boolean);
  const files: string[] = [];
  for (const input of inputs) {
    const p = path.resolve(process.cwd(), input);
    const st = fs.statSync(p);
    if (st.isDirectory()) for (const f of fs.readdirSync(p)) if (f.endsWith(".testbank.json")) files.push(path.join(p, f));
    else files.push(p);
  }
  const banks = files.map(loadBank);
  const items = banks.flatMap(b => b.items).filter(it => matchTopic(it, prefixes));
  const merged: QBank = { version: "1.0.0", bank_id: `merged_${Date.now()}`, title: `Merged: ${prefixes.join(", ")}`, source_note: `Merged from ${files.length} file(s)`, items };
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(merged, null, 2), "utf-8");
  console.log(`Wrote ${items.length} items to ${outFile}`);
}
main();
