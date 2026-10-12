import fs from "fs";
import path from "path";
import type { QBank } from "@/packages/qbank-tools/src/types";

export function loadQBankSync(resolvedJsonPath: string): QBank {
  const abs = path.resolve(resolvedJsonPath);
  const raw = fs.readFileSync(abs, "utf-8");
  return JSON.parse(raw);
}

export async function loadQBank(resolvedJsonPath: string): Promise<QBank> {
  return loadQBankSync(resolvedJsonPath);
}

export * from "./banks";


