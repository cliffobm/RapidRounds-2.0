// Staging only: original payloads are retained; clinical metadata is never inferred.
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const text = value => typeof value === 'string' && value.trim().length > 0;
export function adaptLegacyItem(item, bankId = 'unknown', bankVersion = 'unknown') {
  if (!item || !text(item.id) || !Array.isArray(item.options) || item.options.length < 2 ||
      item.options.length > letters.length || !item.options.every(text)) throw new Error('Invalid legacy item');
  if (!text(item.question) && !text(item.stem)) throw new Error('Missing stem: ' + item.id);
  let index;
  if (Object.hasOwn(item, 'correct_answer')) {
    const answer = typeof item.correct_answer === 'string' ? item.correct_answer.trim().toUpperCase() : '';
    index = answer.length === 1 ? letters.indexOf(answer) : -1;
    if (Object.hasOwn(item, 'answer')) throw new Error('Ambiguous answer formats: ' + item.id);
  } else index = item.answer; // Respiratory arrays use a zero-based integer.
  if (!Number.isInteger(index) || index < 0 || index >= item.options.length) throw new Error('Unsupported answer for ' + item.id);
  return {
    id: item.id,
    legacy: {
      bank_id: bankId, bank_version: bankVersion, topic: item.topic ?? null,
      difficulty: item.difficulty ?? null, tags: structuredClone(item.tags ?? []),
      clinical_pearl: item.clinical_pearl ?? null, assets: structuredClone(item.assets ?? null),
      source_item: structuredClone(item)
    },
    case_family_id: 'legacy:' + bankId + ':' + item.id,
    stem: [item.stem, item.question].filter(text).join('\n\n'),
    options: item.options.map((value, index) => ({ id: letters[index], text: value })),
    correct_option_id: letters[index], primary_competency: null, clinical_domain: null,
    complexity_level: null, learning_objective: null, rationale: { legacy_text: item.rationale ?? null },
    review_status: 'draft', calibration_status: 'uncalibrated', migration_status: 'needs_competency_mapping'
  };
}
export function adaptLegacyBank(bank, arrayBankId) {
  const isArray = Array.isArray(bank), items = isArray ? bank : bank?.items;
  const bankId = isArray ? arrayBankId : bank?.bank_id;
  if (!Array.isArray(items) || !text(bankId)) throw new Error('Invalid legacy bank or missing bank ID');
  const ids = new Set();
  return items.map(item => {
    if (ids.has(item.id)) throw new Error('Duplicate item ID: ' + item.id);
    ids.add(item.id);
    return adaptLegacyItem(item, bankId, isArray ? 'legacy-array' : bank.version ?? 'unknown');
  });
}
