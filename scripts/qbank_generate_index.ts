#!/usr/bin/env ts-node
import fs from "fs";
import path from "path";

const BANK_DIR = path.resolve(process.cwd(), "qbank", "banks");
const OUT_INDEX = path.resolve(BANK_DIR, "index.ts");
const OUT_MANIFEST = path.resolve(process.cwd(), "qbank", "bank.manifest.json");

function titleFromFile(file: string) {
  const base = path.basename(file).replace(/\.testbank\.json$/i, "");
  return base.replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function main() {
  if (!fs.existsSync(BANK_DIR)) {
    console.error("Missing qbank/banks directory.");
    process.exit(1);
  }

  const files = fs.readdirSync(BANK_DIR).filter(f => f.endsWith(".testbank.json")).sort();
  if (!files.length) {
    console.error("No *.testbank.json files in qbank/banks");
    process.exit(1);
  }

  let imports: string[] = [];
  let entries: string[] = [];
  let manifest: any[] = [];

  files.forEach((f, i) => {
    const varName = "b" + i;
    imports.push(`import ${varName} from "./${f}";`);
    const abs = path.join(BANK_DIR, f);
    let count = 0, title = titleFromFile(f);
    try {
      const data = JSON.parse(fs.readFileSync(abs, "utf-8"));
      count = Array.isArray(data.items) ? data.items.length : 0;
      if (data.title) title = String(data.title);
    } catch {}
    const key = f.replace(/\.testbank\.json$/i, "");
    entries.push(`  "${key}": ${varName},`);
    manifest.push({ key, title, file: `qbank/banks/${f}`, items: count });
  });

  const indexTs = `// AUTO-GENERATED\n${imports.join("\n")}\n\nexport const BANKS = {\n${entries.join("\n")}\n} as const;\n\nexport type BankKey = keyof typeof BANKS;\n`;

  fs.writeFileSync(OUT_INDEX, indexTs, "utf-8");
  fs.writeFileSync(OUT_MANIFEST, JSON.stringify({ banks: manifest }, null, 2), "utf-8");
  console.log(`Wrote ${OUT_INDEX}`);
  console.log(`Wrote ${OUT_MANIFEST}`);
}
main();


