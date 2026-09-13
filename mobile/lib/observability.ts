import {
  ISSUE_CATALOG, REPORT_CATEGORIES, SCREEN_NAMES, STUDY_MODES, USAGE_EVENT_NAMES,
  type DiagnosticIssue, type ProblemReport, type UsageEvent,
} from './diagnostics-core';

export type ObservabilityBuildInfo = {
  version: string;
  platform: 'ios' | 'android' | 'web';
  build?: string;
  channel?: string;
};
export type DeliveryReceipt = {provider: 'sentry' | 'posthog'; eventId: string; acceptedAt: string};
type Environment = {sentryDsn?: string; posthogKey?: string; posthogHost?: string};
type SentryDestination = {dsn: string; endpoint: string};
type PostHogDestination = {key: string; endpoint: string};

const UUID = /^[a-f\d]{8}-[a-f\d]{4}-[1-8][a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
const SENTRY_EVENT_ID = /^[a-f\d]{32}$/i;
const timeoutMs = 8_000;

function environment(): Environment {
  // Expo substitutes only statically referenced EXPO_PUBLIC variables.
  return {
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY,
    posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
  };
}

function sentryDestination(value?: string): SentryDestination | null {
  if (!value || value.length > 512) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.password || url.port || url.search || url.hash
      || !/^[a-f\d]{32}$/i.test(url.username)
      || !/^o\d+\.ingest\.(?:(?:us|de)\.)?sentry\.io$/.test(url.hostname)
      || !/^\/\d+$/.test(url.pathname)) return null;
    return {dsn: url.toString(), endpoint: `https://${url.hostname}/api${url.pathname}/envelope/`};
  } catch { return null; }
}

function posthogDestination(key?: string, host?: string): PostHogDestination | null {
  if (!key || !/^phc_[a-zA-Z\d]{20,200}$/.test(key) || !host) return null;
  try {
    const url = new URL(host);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash
      || url.pathname !== '/' || !['us.i.posthog.com', 'eu.i.posthog.com'].includes(url.hostname)) return null;
    return {key, endpoint: `${url.origin}/i/v0/e/`};
  } catch { return null; }
}

export function getObservabilityConfig(env: Environment = environment()) {
  const diagnosticsConfigured = sentryDestination(env.sentryDsn) !== null;
  const usageConfigured = posthogDestination(env.posthogKey, env.posthogHost) !== null;
  return {
    diagnosticsConfigured, usageConfigured,
    diagnosticsMessage: diagnosticsConfigured
      ? 'Error reporting is configured. Delivery still requires an internet connection.'
      : 'Online reports are not connected. Reports can still be saved on this device.',
    usageMessage: usageConfigured
      ? 'Optional usage reporting is configured.'
      : 'Online usage reporting is not connected.',
  };
}

function eventId(id: string): string {
  if (typeof id === 'string' && (UUID.test(id) || SENTRY_EVENT_ID.test(id))) return id.replace(/-/g, '').toLowerCase();
  throw new Error('This report has an invalid reference. Save a new report before sending.');
}

function timestamp(value: number): string {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error('This report has an invalid date. Save a new report before sending.');
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error('This report has an invalid date. Save a new report before sending.');
  return date.toISOString();
}

function buildFields(build: ObservabilityBuildInfo) {
  const version = typeof build.version === 'string' && /^\d+\.\d+\.\d+(?:[-+][a-zA-Z\d.-]+)?$/.test(build.version)
    && build.version.length <= 64 ? build.version : 'unknown';
  const platform = ['ios', 'android', 'web'].includes(build.platform) ? build.platform : 'unknown';
  const number = typeof build.build === 'string' && /^\d{1,12}$/.test(build.build) ? build.build : undefined;
  const channel = typeof build.channel === 'string'
    && ['development', 'preview', 'testflight', 'beta', 'production', 'simulator', 'local'].includes(build.channel)
    ? build.channel : undefined;
  return {version, platform, ...(number ? {build: number} : {}), ...(channel ? {channel} : {})};
}

function screen(value: unknown): string {
  return typeof value === 'string' && (SCREEN_NAMES as readonly string[]).includes(value) ? value : 'unknown';
}

/** A final allowlist at the network boundary; callers may carry additional local fields. */
export function sanitizeDiagnosticIssue(issue: DiagnosticIssue) {
  if (!Object.hasOwn(ISSUE_CATALOG, issue.code)) throw new Error('This type of issue cannot be sent.');
  const catalog = ISSUE_CATALOG[issue.code];
  return {
    id: eventId(issue.id), code: issue.code, title: catalog.title, explanation: catalog.explanation,
    nextStep: catalog.nextStep, screen: screen(issue.context),
    firstSeen: timestamp(issue.firstSeen), lastSeen: timestamp(issue.lastSeen),
    count: Number.isFinite(issue.count) ? Math.min(10_000, Math.max(1, Math.trunc(issue.count))) : 1,
  };
}

/** Best-effort redaction for explicitly submitted text. It cannot detect every name or health detail. */
export function redactReportText(value: unknown, maxLength = 1_400): string {
  if (typeof value !== 'string') return '';
  return value.slice(0, 12_000)
    .replace(/data:[^\s;]+;base64,[A-Za-z\d+/=]+/gi, '[image removed]')
    .replace(/\b(?:https?:\/\/|www\.)[^\s<>]+/gi, '[link removed]')
    .replace(/\b[A-Z\d._%+-]+@[A-Z\d.-]+\.[A-Z]{2,}\b/gi, '[email removed]')
    .replace(/\beyJ[A-Za-z\d_-]+\.[A-Za-z\d_-]+\.[A-Za-z\d_-]+\b/g, '[token removed]')
    .replace(/\b(?:Bearer\s+)[A-Za-z\d._~+\/-]+=*/gi, '[token removed]')
    .replace(/\b(?:sb_secret_|sb_publishable_|phc_|phx_|ghp_|github_pat_|sntrys_|sk_live_|sk_test_)[A-Za-z\d_-]+\b/g, '[key removed]')
    .replace(/\b(?:password|passwd|access_token|refresh_token|api[_ -]?key|secret)\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi, '[credential removed]')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .slice(0, Math.min(4_000, Math.max(0, maxLength))).trim();
}

export function sanitizeUserReport(report: ProblemReport) {
  if (!(REPORT_CATEGORIES as readonly string[]).includes(report.category)) throw new Error('Choose a valid report category.');
  const summary = redactReportText(report.summary, 1_200);
  if (!summary) throw new Error('Describe the problem before sending your report.');
  return {
    id: eventId(report.id), createdAt: timestamp(report.createdAt), category: report.category,
    summary, steps: redactReportText(report.steps, 1_400), expected: redactReportText(report.expected, 1_400),
    screen: screen(report.context),
    diagnostics: report.includeDiagnostics === true && Array.isArray(report.diagnostics)
      ? report.diagnostics.slice(0, 10).filter(issue => Object.hasOwn(ISSUE_CATALOG, issue.code)).map(sanitizeDiagnosticIssue) : [],
  };
}

export function buildUsagePayload(event: UsageEvent, anonymousInstallId: string, build: ObservabilityBuildInfo) {
  if (!UUID.test(anonymousInstallId)) throw new Error('Usage reporting needs a new anonymous device reference.');
  if (!(USAGE_EVENT_NAMES as readonly string[]).includes(event.name)) throw new Error('This type of usage event cannot be sent.');
  const props = event.properties || {};
  const fields = buildFields(build);
  const id = eventId(event.id);
  const uuid = `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
  return {
    event: event.name, distinct_id: anonymousInstallId.toLowerCase(), uuid, timestamp: timestamp(event.createdAt),
    properties: {
      $process_person_profile: false, $geoip_disable: true, $ip: null,
      app_version: fields.version, platform: fields.platform,
      ...(fields.build ? {app_build: fields.build} : {}), ...(fields.channel ? {channel: fields.channel} : {}),
      ...(props.screen !== undefined ? {screen: screen(props.screen)} : {}),
      ...(typeof props.mode === 'string' && (STUDY_MODES as readonly string[]).includes(props.mode) ? {mode: props.mode} : {}),
      ...(typeof props.count === 'number' && Number.isFinite(props.count) ? {count: Math.min(100, Math.max(0, Math.trunc(props.count)))} : {}),
    },
  };
}

function sentryEventBase(id: string, at: string, build: ObservabilityBuildInfo) {
  const fields = buildFields(build);
  return {
    event_id: id, timestamp: at, platform: 'javascript', logger: 'rapid-rounds',
    release: `rapid-rounds@${fields.version}`, ...(fields.build ? {dist: fields.build} : {}),
    ...(fields.channel ? {environment: fields.channel} : {}),
    tags: {app_platform: fields.platform},
  };
}

export function buildDiagnosticPayload(issue: DiagnosticIssue, build: ObservabilityBuildInfo) {
  const safe = sanitizeDiagnosticIssue(issue);
  // Preserve 96 random bits and encode the occurrence count. A retry keeps its ID; a new occurrence gets a new ID.
  const occurrenceId = `${safe.id.slice(0, 24)}${safe.count.toString(16).padStart(8, '0')}`;
  return {
    ...sentryEventBase(occurrenceId, safe.lastSeen, build), level: 'error',
    message: `${safe.title}: ${safe.explanation}`,
    fingerprint: ['rapid-rounds-diagnostic', safe.code],
    tags: {app_platform: buildFields(build).platform, category: 'diagnostic', issue_code: safe.code, screen: safe.screen},
    extra: {plain_language: safe},
  };
}

export function buildUserReportPayload(report: ProblemReport, build: ObservabilityBuildInfo) {
  const safe = sanitizeUserReport(report);
  return {
    ...sentryEventBase(safe.id, safe.createdAt, build), level: 'warning',
    message: `Student report: ${safe.category}`,
    fingerprint: ['rapid-rounds-student-report', safe.id],
    tags: {app_platform: buildFields(build).platform, category: 'student_report', report_category: safe.category, screen: safe.screen},
    extra: {student_report: safe},
  };
}

/** Human-readable preview built from the same sanitized event that is sent, never the raw draft. */
export function formatReportForSharing(report: ProblemReport, build: ObservabilityBuildInfo): string {
  const payload = buildUserReportPayload(report, build);
  const safe = payload.extra.student_report;
  const lines = [
    'Rapid Rounds report to Sentry',
    `Reference: ${payload.event_id}`, `Created: ${payload.timestamp}`,
    `App release: ${payload.release}`, `Platform: ${payload.tags.app_platform}`,
    ...(payload.dist ? [`Build: ${payload.dist}`] : []),
    ...(payload.environment ? [`Release channel: ${payload.environment}`] : []),
    `Category: ${safe.category}`, `Screen: ${safe.screen}`, '',
    'Problem:', safe.summary, '', 'Steps to reproduce:', safe.steps || 'Not provided.', '',
    'Expected result:', safe.expected || 'Not provided.', '',
    'Included app problems:',
  ];
  if (!safe.diagnostics.length) lines.push('None.');
  for (const issue of safe.diagnostics) {
    lines.push(
      `${issue.title} (${issue.code})`, issue.explanation, `Try this: ${issue.nextStep}`,
      `Reference: ${issue.id}; screen: ${issue.screen}; count: ${issue.count}`,
      `First seen: ${issue.firstSeen}; last seen: ${issue.lastSeen}`, '',
    );
  }
  return lines.join('\n');
}

async function post(endpoint: string, body: string, contentType: string, signal?: AbortSignal): Promise<string> {
  const abort = new AbortController();
  let timedOut = false;
  const cancel = () => abort.abort();
  if (signal?.aborted) throw new Error('Sending was cancelled. Your report stays on this device.');
  signal?.addEventListener('abort', cancel, {once: true});
  const timer = setTimeout(() => { timedOut = true; abort.abort(); }, timeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: 'POST', headers: {'Content-Type': contentType}, body, signal: abort.signal,
      credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error',
    });
    if (!response.ok || response.redirected) throw new Error('rejected');
    const text = await response.text();
    if (abort.signal.aborted || text.length > 4_096) throw new Error('cancelled or invalid response');
    return text;
  } catch {
    if (timedOut) throw new Error('Sending took too long. Check your connection and try again.');
    if (signal?.aborted) throw new Error('Sending was cancelled. Your report stays on this device.');
    throw new Error('The reporting service did not confirm delivery. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}

async function sendSentry(payload: ReturnType<typeof buildDiagnosticPayload> | ReturnType<typeof buildUserReportPayload>, signal?: AbortSignal): Promise<DeliveryReceipt> {
  const destination = sentryDestination(environment().sentryDsn);
  if (!destination) throw new Error('Online reports are not connected. Your report stays on this device.');
  const event = JSON.stringify(payload);
  // A single JSON line has no literal newlines. Omitting optional byte length avoids UTF-16/UTF-8 length confusion.
  const envelope = `${JSON.stringify({event_id: payload.event_id, dsn: destination.dsn, sent_at: new Date().toISOString()})}\n${JSON.stringify({type: 'event', content_type: 'application/json'})}\n${event}\n`;
  const response = await post(destination.endpoint, envelope, 'text/plain;charset=UTF-8', signal);
  let data: unknown;
  try { data = JSON.parse(response); } catch { throw new Error('The reporting service did not return a receipt. Try again later.'); }
  if (!data || typeof data !== 'object' || !('id' in data) || data.id !== payload.event_id) {
    throw new Error('The reporting service did not return a matching receipt. Try again later.');
  }
  return {provider: 'sentry', eventId: payload.event_id, acceptedAt: new Date().toISOString()};
}

/** Call only while the user's diagnostics-sharing choice is enabled. */
export async function sendDiagnosticIssue(issue: DiagnosticIssue, build: ObservabilityBuildInfo, signal?: AbortSignal) {
  return sendSentry(buildDiagnosticPayload(issue, build), signal);
}

/** Call only after the user has reviewed the report and explicitly chosen Send. */
export async function sendUserReport(report: ProblemReport, build: ObservabilityBuildInfo, signal?: AbortSignal) {
  return sendSentry(buildUserReportPayload(report, build), signal);
}

/** Call only while the user's analytics-sharing choice is enabled. No initialization or automatic capture occurs. */
export async function sendUsageEvent(event: UsageEvent, anonymousInstallId: string, build: ObservabilityBuildInfo, signal?: AbortSignal): Promise<DeliveryReceipt> {
  const env = environment();
  const destination = posthogDestination(env.posthogKey, env.posthogHost);
  if (!destination) throw new Error('Online usage reporting is not connected.');
  const payload = buildUsagePayload(event, anonymousInstallId, build);
  const response = await post(destination.endpoint, JSON.stringify({api_key: destination.key, ...payload}), 'application/json', signal);
  let data: unknown;
  try { data = JSON.parse(response); } catch { throw new Error('The usage service did not confirm acceptance. Try again later.'); }
  if (data !== 1 && (!data || typeof data !== 'object' || !('status' in data) || data.status !== 1)) {
    throw new Error('The usage service did not confirm acceptance. Try again later.');
  }
  // Ingestion is asynchronous: acceptance is not proof that an event appears in a dashboard.
  return {provider: 'posthog', eventId: payload.uuid, acceptedAt: new Date().toISOString()};
}
