import { readFileSync, readdirSync } from 'node:fs';
import { adaptLegacyBank } from './legacy-qbank-adapter.mjs';
import { validateRegistryConsistency } from './validation.mjs';
const directory = new URL('../qbank/banks/', import.meta.url);
const errors = validateRegistryConsistency();
let banks = 0, items = 0;
for (const name of readdirSync(directory).filter(value => value.endsWith('.json')).sort()) {
  const data = JSON.parse(readFileSync(new URL(name, directory), 'utf8'));
  if (!Array.isArray(data) && !Object.hasOwn(data, 'items')) continue; // Manifest, not question data.
  try {
    const staged = adaptLegacyBank(data, name.replace(/\.json$/, ''));
    banks++; items += staged.length;
    console.log(`${name}: ${staged.length} preserved draft items`);
  } catch (error) { errors.push(name + ': ' + error.message); }
}
const outline = JSON.parse(readFileSync(new URL('./cases/tavr-conduction-deterioration.json', import.meta.url), 'utf8'));
if (outline.review_status !== 'draft') errors.push('TAVR outline must remain a draft');
if (!banks || !items) errors.push('No question banks found');
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Validated ${banks} banks / ${items} staging items. No items approved or calibrated by migration.`);
