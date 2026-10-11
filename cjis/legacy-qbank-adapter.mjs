// Lossless, provisional adapter for the original RapidRounds QBankItem format.
// It does not infer cognitive competencies from keywords or claim clinical review.
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export function adaptLegacyItem(item, bankId = "unknown") {
  if (!item || typeof item.id !== "string" || !Array.isArray(item.options)) throw new Error("Invalid legacy item");
  const answer = String(item.correct_answer ?? "").trim().toUpperCase();
  const correctIndex = letters.indexOf(answer);
  if (correctIndex < 0 || correctIndex >= item.options.length) throw new Error("Unsupported correct_answer for " + item.id);
  return {
    id: item.id,
    legacy: { bank_id: bankId, topic: item.topic ?? null, difficulty: item.difficulty ?? null, tags: item.tags ?? [], clinical_pearl: item.clinical_pearl ?? null, assets: item.assets ?? null },
    case_family_id: "legacy:" + bankId + ":" + item.id,
    stem: [item.stem, item.question].filter(Boolean).join("\n\n"),
    options: item.options.map((text, index) => ({ id: letters[index], text })),
    correct_option_id: letters[correctIndex],
    primary_competency: null,
    clinical_domain: null,
    complexity_level: null,
    learning_objective: null,
    rationale: { legacy_text: item.rationale ?? null },
    review_status: "draft",
    calibration_status: "uncalibrated",
    migration_status: "needs_competency_mapping"
  };
}
export function adaptLegacyBank(bank) {
  if (!bank || !Array.isArray(bank.items)) throw new Error("Invalid legacy bank");
  const ids = new Set();
  return bank.items.map(item => {
    if (ids.has(item.id)) throw new Error("Duplicate item ID: " + item.id);
    ids.add(item.id);
    return adaptLegacyItem(item, bank.bank_id);
  });
}
