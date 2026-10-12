#!/usr/bin/env ts-node
/**
 * Writes selector + review components, and reminds you to generate bank index.
 * Run:
 *   npx ts-node scripts/apply_selector_and_review.ts
 * Then:
 *   npx ts-node scripts/qbank_generate_index.ts
 */
import fs from "fs";
import path from "path";

const payloads: Array<{ target: string; contentPath: string }> = [
  { target: "scripts/qbank_generate_index.ts", contentPath: "scripts/qbank_generate_index.ts" },
  { target: "components/BankSelector.tsx", contentPath: "components/BankSelector.tsx" },
  { target: "examples/QuizWithSelector.tsx", contentPath: "examples/QuizWithSelector.tsx" },
  { target: "examples/ReviewBookmarkedFlagged.tsx", contentPath: "examples/ReviewBookmarkedFlagged.tsx" },
];

function copyIntoRepo(root: string) {
  let wrote = 0, skipped = 0;
  for (const p of payloads) {
    const src = path.resolve(root, p.contentPath);
    const out = path.resolve(process.cwd(), p.target);
    const code = fs.readFileSync(src, "utf-8");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, code, "utf-8");
    console.log("✔ wrote", p.target);
    wrote++;
  }
  console.log("\nNext steps:");
  console.log("  1) Generate bank index & manifest: npx ts-node scripts/qbank_generate_index.ts");
  console.log("  2) In Next.js, create routes to render examples/QuizWithSelector.tsx and examples/ReviewBookmarkedFlagged.tsx:");
  console.log('     - /app/quiz/page.tsx -> import dynamic(() => import("@/examples/QuizWithSelector"), { ssr: false })');
  console.log('     - /app/review/page.tsx -> import dynamic(() => import("@/examples/ReviewBookmarkedFlagged"), { ssr: false })');
}

copyIntoRepo(__dirname);
