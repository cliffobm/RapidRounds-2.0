import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('docs/source-migration-manifest.json', root), 'utf8'));
const errors = [];
let unchanged = 0, changed = 0;
for (const file of manifest.imported_files) {
  const path = new URL(file.path, root);
  if (!existsSync(path)) { errors.push('Missing: ' + file.path); continue; }
  const bytes = readFileSync(path);
  const hash = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  const intentional = manifest.intentional_changes[file.path];
  if (hash !== (intentional?.migrated_sha ?? file.sha)) errors.push('Content changed: ' + file.path);
  if (intentional) changed++; else unchanged++;
  const content = bytes.toString('utf8');
  const keyCandidates = content.match(/\b(?:sk-(?:proj-|svcacct-|ant-)?[A-Za-z0-9_-]{24,}|sb_secret_[A-Za-z0-9_-]{24,}|GOCSPX-[A-Za-z0-9_-]+|AIza[A-Za-z0-9_-]{30,}|AKIA[A-Z0-9]{16}|whsec_[A-Za-z0-9]{24,})/g) ?? [];
  const realKeys = keyCandidates.filter(value => !/your|placeholder|example|development/i.test(value));
  if (/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(content) || realKeys.length || /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)) errors.push('Embedded credential: ' + file.path);
}
for (const file of manifest.excluded_files) if (existsSync(new URL(file.path, root))) errors.push('Excluded file present: ' + file.path);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Verified ${unchanged} unchanged imports and ${changed} documented changes; ${manifest.excluded_files.length} excluded artifacts absent.`);
