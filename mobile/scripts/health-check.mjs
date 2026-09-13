import { spawn } from 'node:child_process';
import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = join(root, 'reports', 'health');
const installFailed = process.argv.includes('--install-failed');
const sensitiveValues = Object.entries(process.env)
  .filter(([key, value]) => /TOKEN|SECRET|PASSWORD|KEY|DSN|AUTH|SUPABASE/i.test(key) && value && value.length > 5)
  .map(([, value]) => value).sort((a, b) => b.length - a.length);
function redact(value) {
  let text = String(value).replace(/\u001b\[[0-9;]*m/g, '');
  for (const secret of sensitiveValues) text = text.split(secret).join('[redacted]');
  return text
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[redacted token]')
    .replace(/\b(?:sb_secret_|gh[pousr]_)[A-Za-z0-9_-]+\b/g, '[redacted token]')
    .replace(/(Bearer\s+)\S+/gi, '$1[redacted]')
    .replace(/([?&](?:token|code|key|access_token|refresh_token|password)=)[^&\s]+/gi, '$1[redacted]');
}
const npmCli = process.env.npm_execpath || join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
const checks = [
  { id: 'types', title: 'Code consistency', args: ['node_modules/typescript/bin/tsc', '--noEmit'], pass: 'The app code passes its type checks.', fail: 'Some parts of the code disagree about the data they use. Ask your developer to fix the listed file errors before release.' },
  { id: 'tests', title: 'Automated behavior tests', args: ['node_modules/vitest/vitest.mjs', 'run'], pass: 'All automated behavior tests passed.', fail: 'At least one expected behavior failed. Open the test log to find the test name and reproduce that behavior before release.' },
  { id: 'expo', title: 'Expo library compatibility', args: ['node_modules/expo/bin/cli', 'install', '--check'], pass: 'Installed libraries match this Expo version.', fail: 'Expo could not confirm compatible libraries. Check the connection and the package versions; do not force an upgrade without testing.' },
  { id: 'export', title: 'iPhone, Android, and web code packaging', args: ['node_modules/expo/bin/cli', 'export', '--platform', 'all', '--max-workers', '2', '--output-dir', 'dist-health'], pass: 'Code and assets packaged for all three platforms. Signed phone builds and device testing are still separate steps.', fail: 'The app could not package for every platform. A missing library or asset may prevent a build from opening.' },
  { id: 'audit', title: 'Known dependency security issues', args: [npmCli, 'audit', '--audit-level=high', '--json'], pass: 'No high or critical known dependency issues were reported.', fail: 'The dependency security check needs attention. Fix high/critical issues, or restore the registry connection if the check could not finish.' },
];

await mkdir(reportDir, { recursive: true });
const results = [];
const startedAt = new Date().toISOString();
const limits = 'These checks do not prove medical accuracy, store approval, live sign-in, native crash coverage, or correct behavior on a real phone.';

function run(check) {
  return new Promise((resolveResult) => {
    const started = Date.now();
    let output = '';
    let truncated = false;
    let settled = false;
    const child = spawn(process.execPath, check.args, {
      cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, CI: '1', NO_COLOR: '1', EXPO_PUBLIC_CONTENT_PREVIEW: 'true' },
    });
    const collect = (data) => {
      if (output.length >= 2_000_000) { truncated = true; return; }
      output += data.toString().slice(0, 2_000_000 - output.length);
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    const finish = (code, failure) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (failure) output += `\n${failure}`;
      if (truncated) output += '\n[Log shortened after 2 MB.]';
      resolveResult({ code, output, durationSeconds: Math.round((Date.now() - started) / 1000) });
    };
    const timeout = setTimeout(() => {
      child.kill();
      finish(1, 'This check exceeded its 12-minute time limit. It did not pass.');
    }, 12 * 60 * 1000);
    child.on('error', error => finish(1, error.message));
    child.on('close', code => finish(code ?? 1));
  });
}

if (installFailed) {
  results.push({ id: 'install', title: 'Install locked libraries', status: 'fail', explanation: 'The exact saved libraries could not be installed. Check the Install libraries step in GitHub Actions. App checks were not run.', durationSeconds: 0 });
} else {
  for (const check of checks) {
    console.log(`Checking: ${check.title}...`);
    const result = await run(check);
    let status = result.code === 0 ? 'pass' : 'fail';
    let explanation = status === 'pass' ? check.pass : check.fail;
    let auditCounts;
    if (check.id === 'audit') {
      try {
        const payload = JSON.parse(result.output);
        const counts = payload.metadata?.vulnerabilities;
        if (!counts || payload.error || !['low', 'moderate', 'high', 'critical'].every(key => Number.isInteger(counts[key]) && counts[key] >= 0)) throw new Error('Incomplete audit response');
        auditCounts = { low: counts.low, moderate: counts.moderate, high: counts.high, critical: counts.critical };
        status = counts.high + counts.critical > 0 ? 'fail' : result.code !== 0 ? 'fail' : counts.low + counts.moderate > 0 ? 'warning' : 'pass';
        explanation = `${counts.high} high, ${counts.critical} critical, ${counts.moderate} moderate, and ${counts.low} low known issues were reported. `;
        explanation += status === 'fail' ? 'The audit did not pass. Review the audit log before releasing.' : status === 'warning' ? 'No high/critical issues were reported. Schedule review of the remaining advisories; do not run a forced fix that downgrades Expo.' : check.pass;
      } catch {
        status = 'fail';
        explanation = 'The security registry did not return a complete audit. Check the network and rerun this check; security status is unknown.';
      }
    }
    const log = `${check.id}.log`;
    await writeFile(join(reportDir, log), redact(result.output), 'utf8');
    results.push({ id: check.id, title: check.title, status, explanation, durationSeconds: result.durationSeconds, log, ...(auditCounts ? { auditCounts } : {}) });
    console.log(`${status.toUpperCase()}: ${explanation}`);
  }
}

const failed = results.some(result => result.status === 'fail');
const warned = results.some(result => result.status === 'warning');
const report = { schemaVersion: 1, startedAt, finishedAt: new Date().toISOString(), overall: failed ? 'needs_attention' : warned ? 'passed_with_warnings' : 'passed', contentMode: 'preview', limits, checks: results };
const markdown = [
  '# Rapid Rounds health check', '',
  failed ? '**Needs attention: do not release this version yet.**' : warned ? '**Automated checks passed, with dependency warnings to review.**' : '**Automated checks passed. Complete the phone and clinical checks before release.**', '',
  `Checked: ${report.finishedAt}`, '',
  ...results.flatMap(result => [`## ${result.title}: ${result.status.toUpperCase()}`, '', result.explanation, '', ...(result.log ? [`Technical detail: [${result.log}](${result.log}) (${result.durationSeconds} seconds).`, ''] : [])]),
  '## What to do next', '',
  failed ? 'Send your developer this report and the referenced logs. Fix the failure, rerun npm run health, and retest the affected phone behavior.' : 'Run the physical-phone checklist in docs/RELEASE_CHECKLIST.md. Keep a copy of this report with the build number.', '',
  limits, '',
  'Reports contain developer check output. Known credential patterns and sensitive environment values are redacted, but review logs before sharing outside the project. No student profiles or app study history are read by this script.', '',
].join('\n');
await writeFile(join(reportDir, 'health-report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
await writeFile(join(reportDir, 'health-report.md'), markdown, 'utf8');
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown, 'utf8');
console.log('Saved reports/health/health-report.md and health-report.json');
process.exitCode = failed ? 1 : 0;
