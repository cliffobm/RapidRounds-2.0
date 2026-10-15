import { BANKS, type BankKey } from './banks';
import { adaptLegacyBank } from '@/cjis/legacy-qbank-adapter.mjs';
import { applyCompetencyMapping, COMPETENCY_REGISTRY } from '@/cjis/validation.mjs';
export type CompetencyMapping = {
  source_version: string; primary_competency: string; clinical_domain: string;
  complexity_level: number; learning_objective: string;
};
// Legacy quiz consumers continue to receive BANKS unchanged.
export function getCjisBank(key: BankKey, mappings: Record<string, CompetencyMapping> = {}) {
  if (!Object.prototype.hasOwnProperty.call(BANKS, key)) throw new Error('Unknown bank: ' + key);
  const bank = BANKS[key], drafts = adaptLegacyBank(bank);
  const ids = new Set(drafts.map(item => item.id));
  for (const id of Object.keys(mappings)) if (!ids.has(id)) throw new Error('Unknown mapping item: ' + id);
  return { bank_id: bank.bank_id, source_version: bank.version, source_bank: structuredClone(bank), registry_version: COMPETENCY_REGISTRY.version,
    items: drafts.map(draft => mappings[draft.id] ? applyCompetencyMapping(draft, mappings[draft.id]) : draft) };
}
export function getCjisCatalog() {
  return Object.entries(BANKS).map(([key, bank]) => ({ key, bank_id: bank.bank_id, title: bank.title,
    items: bank.items.length, registry_version: COMPETENCY_REGISTRY.version }));
}
