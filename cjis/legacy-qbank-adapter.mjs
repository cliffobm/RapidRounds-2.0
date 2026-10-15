// Lossless, provisional adapter for the original RapidRounds QBankItem format.
// It does not infer cognitive competencies from keywords or claim clinical review.
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export function adaptLegacyItem(item, bankId = "unknown") {
  if (!item || typeof item.id !== "string" || !item.id.trim() ||
      typeof item.question !== "string" || !item.question.trim() ||
      (item.stem != null && typeof item.stem !== "string") ||
      !Array.isArray(item.options) || item.options.length < 2 || item.options.length > letters.length ||
      item.options.some(text => typeof text !== "string" || !text.trim())) throw new Error("Invalid legacy item");
  const answer = typeof item.correct_answer === "string" ? item.correct_answer.trim().toUpperCase() : "";
  const correctIndex = /^[A-Z]$/.test(answer) ? letters.indexOf(answer) : -1;
  if (correctIndex < 0 || correctIndex >= item.options.length) throw new Error("Unsupported correct_answer for " + item.id);
  return {
    id: item.id,
    legacy: { bank_id: bankId, topic: item.topic ?? null, difficulty: item.difficulty ?? null, tags: item.tags ?? [], clinical_pearl: item.clinical_pearl ?? null, assets: item.assets ?? null, source: structuredClone(item) },
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
  if (!bank || typeof bank.bank_id !== "string" || !bank.bank_id.trim() || !Array.isArray(bank.items)) throw new Error("Invalid legacy bank");
  const ids = new Set();
  return bank.items.map(item => {
    const adapted = adaptLegacyItem(item, bank.bank_id);
    if (ids.has(item.id)) throw new Error("Duplicate item ID: " + item.id);
    ids.add(item.id);
    return adapted;
  });
}
