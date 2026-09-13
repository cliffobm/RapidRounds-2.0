import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  buildDiagnosticPayload, buildUsagePayload, buildUserReportPayload, formatReportForSharing,
  getObservabilityConfig, redactReportText, sendDiagnosticIssue, sendUsageEvent, sendUserReport,
  type ObservabilityBuildInfo,
} from '../lib/observability';
import type {DiagnosticIssue, ProblemReport, UsageEvent} from '../lib/diagnostics-core';

const id = 'ad2479ce-8c1b-4dba-8694-6e97a3e2a182';
const anonymousId = '8bd0035e-956d-4c9d-8a45-157a351d77e5';
const now = Date.parse('2026-09-13T10:00:00.000Z');
const dsn = 'https://0123456789abcdef0123456789abcdef@o0.ingest.us.sentry.io/123';
const key = 'phc_0123456789abcdefghij0123456789abcdefghij';
const build: ObservabilityBuildInfo = {version: '1.0.0', platform: 'ios', build: '12', channel: 'beta'};
const issue: DiagnosticIssue = {id, code: 'speech', context: 'lesson', firstSeen: now, lastSeen: now, count: 2};
const report: ProblemReport = {
  id, createdAt: now, category: 'bug', summary: 'Read aloud stopped.', steps: 'Open a lesson and tap Listen.',
  expected: 'The lesson should be spoken.', includeDiagnostics: true, context: 'lesson', status: 'saved', diagnostics: [issue],
};
const usage: UsageEvent = {id, createdAt: now, name: 'round_completed', properties: {screen: 'results', mode: 'rapid', count: 10}};

function response(body: unknown, status = 200) {
  return {ok: status >= 200 && status < 300, status, redirected: false, text: async () => JSON.stringify(body)} as Response;
}
function configured() {
  vi.stubEnv('EXPO_PUBLIC_SENTRY_DSN', dsn);
  vi.stubEnv('EXPO_PUBLIC_POSTHOG_KEY', key);
  vi.stubEnv('EXPO_PUBLIC_POSTHOG_HOST', 'https://us.i.posthog.com');
}
beforeEach(() => {
  vi.stubEnv('EXPO_PUBLIC_SENTRY_DSN', '');
  vi.stubEnv('EXPO_PUBLIC_POSTHOG_KEY', '');
  vi.stubEnv('EXPO_PUBLIC_POSTHOG_HOST', '');
  vi.stubGlobal('fetch', vi.fn());
});
afterEach(() => {vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers();});

describe('reporting configuration', () => {
  it('does not send anything when configuration is read', () => {
    configured(); expect(getObservabilityConfig().diagnosticsConfigured).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('requires an official HTTPS Sentry DSN with a public client key', () => {
    for (const invalid of [dsn.replace('https:', 'http:'), dsn.replace('@', ':secret@'),
      dsn.replace('.sentry.io', '.sentry.io.attacker.example'), dsn.replace('@o0', '@evil'),
      `${dsn}?token=secret`, `${dsn}#fragment`, dsn.replace('/123', '/path/123'), dsn.replace('/123', ':8443/123')]) {
      expect(getObservabilityConfig({sentryDsn: invalid}).diagnosticsConfigured).toBe(false);
    }
    for (const domain of ['o0.ingest.sentry.io', 'o123.ingest.us.sentry.io', 'o123.ingest.de.sentry.io']) {
      expect(getObservabilityConfig({sentryDsn: dsn.replace('o0.ingest.us.sentry.io', domain)}).diagnosticsConfigured).toBe(true);
    }
  });
  it('requires the PostHog public token and an explicit matching cloud region', () => {
    expect(getObservabilityConfig({posthogKey: key}).usageConfigured).toBe(false);
    for (const host of ['https://us.i.posthog.com', 'https://eu.i.posthog.com/']) {
      expect(getObservabilityConfig({posthogKey: key, posthogHost: host}).usageConfigured).toBe(true);
    }
    for (const host of ['http://us.i.posthog.com', 'https://us.i.posthog.com.evil.example', 'https://us.i.posthog.com/path',
      'https://user@us.i.posthog.com', 'https://us.i.posthog.com?token=secret']) {
      expect(getObservabilityConfig({posthogKey: key, posthogHost: host}).usageConfigured).toBe(false);
    }
    expect(getObservabilityConfig({posthogKey: 'phx_secret_token', posthogHost: 'https://us.i.posthog.com'}).usageConfigured).toBe(false);
  });
  it('fails honestly without attempting delivery when not configured', async () => {
    await expect(sendUserReport(report, build)).rejects.toThrow('not connected');
    await expect(sendDiagnosticIssue(issue, build)).rejects.toThrow('not connected');
    await expect(sendUsageEvent(usage, anonymousId, build)).rejects.toThrow('not connected');
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('privacy boundary', () => {
  it('uses catalog explanations and drops all raw error fields', () => {
    const hostile = {...issue, message: 'secret password', stack: 'user@email.example', title: 'private',
      context: 'user@email.example', name: 'Student', school: 'School'} as unknown as DiagnosticIssue;
    const payload = buildDiagnosticPayload(hostile, build);
    const json = JSON.stringify(payload);
    expect(json).not.toMatch(/secret password|user@email|private|Student|School/);
    expect(payload.tags.screen).toBe('unknown');
    expect(payload.extra.plain_language.title).toBe('Read-aloud could not finish');
    expect(payload.extra.plain_language.count).toBe(2);
    expect(payload).not.toHaveProperty('user'); expect(payload).not.toHaveProperty('request');
  });
  it('keeps retry identifiers stable while distinguishing new issue occurrences', () => {
    const first = buildDiagnosticPayload(issue, build).event_id;
    expect(buildDiagnosticPayload(issue, build).event_id).toBe(first);
    expect(buildDiagnosticPayload({...issue, count: 3}, build).event_id).not.toBe(first);
  });
  it('rejects unknown issue codes, invalid dates and arbitrary identifiers', () => {
    expect(() => buildDiagnosticPayload({...issue, code: 'private' as never}, build)).toThrow();
    expect(() => buildDiagnosticPayload({...issue, firstSeen: NaN}, build)).toThrow();
    expect(() => buildDiagnosticPayload({...issue, id: 'user@email.example'}, build)).toThrow();
  });
  it('redacts common credentials, emails, links and image data in user-entered text', () => {
    const text = 'Contact user@example.org; https://example.org/callback?token=private '
      + 'eyJhbGci.eyJzdWIi.signature Bearer privateToken password="very private" '
      + 'phc_0123456789abcdefghij data:image/png;base64,SGVsbG8=';
    const safe = redactReportText(text);
    expect(safe).not.toMatch(/user@example|example.org|eyJ|privateToken|very private|phc_|SGVsbG8/);
    expect(safe).toContain('[email removed]');
    expect(safe).toContain('[image removed]');
  });
  it('bounds report text and strips diagnostics unless the attachment was selected', () => {
    const payload = buildUserReportPayload({...report, summary: 'a'.repeat(3000), steps: 'b'.repeat(3000),
      expected: 'c'.repeat(3000), includeDiagnostics: false}, build);
    const safe = payload.extra.student_report;
    expect(safe.summary.length + safe.steps.length + safe.expected.length).toBeLessThanOrEqual(4000);
    expect(safe.diagnostics).toEqual([]);
    expect(payload.event_id).toBe(id.replace(/-/g, ''));
    expect(payload.level).toBe('warning');
  });
  it('previews the same redacted report content and build values used for sending', () => {
    const withEmail = {...report, summary: 'user@example.org cannot hear sound'};
    const payload = buildUserReportPayload(withEmail, build);
    const preview = formatReportForSharing(withEmail, build);
    expect(preview).toContain(payload.extra.student_report.summary);
    expect(preview).toContain(payload.release);
    expect(preview).toContain('Release channel: beta');
    expect(preview).toContain(payload.extra.student_report.diagnostics[0].explanation);
    expect(preview).not.toContain('user@example.org');
  });
  it('rejects empty reports or invalid categories', () => {
    expect(() => buildUserReportPayload({...report, summary: ''}, build)).toThrow('Describe');
    expect(() => buildUserReportPayload({...report, category: 'private' as never}, build)).toThrow('category');
  });
  it('restricts usage events to broad, anonymous study actions', () => {
    const unsafe = {...usage, properties: {...usage.properties, email: 'user@example.org', score: 45,
      answer: 'insulin', school: 'Private', $set: {name: 'Private'}, $ip: '1.2.3.4', $geoip_disable: false}};
    const payload = buildUsagePayload(unsafe, anonymousId, build);
    expect(payload).toMatchObject({uuid: id, distinct_id: anonymousId, event: 'round_completed'});
    expect(payload.properties).toEqual({$process_person_profile: false, $geoip_disable: true, $ip: null,
      app_version: '1.0.0', platform: 'ios', app_build: '12', channel: 'beta', screen: 'results', mode: 'rapid', count: 10});
    expect(JSON.stringify(payload)).not.toMatch(/user@example|Private|insulin|1.2.3.4/);
  });
  it('rejects identifiable analytics IDs and unknown event names', () => {
    expect(() => buildUsagePayload(usage, 'user@example.org', build)).toThrow('anonymous');
    expect(() => buildUsagePayload({...usage, name: '$identify' as never}, anonymousId, build)).toThrow('event');
  });
  it('drops unsafe build fields and invalid usage values', () => {
    const payload = buildUsagePayload({...usage, properties: {screen: 'secret' as never, mode: 'private' as never, count: Infinity}}, anonymousId,
      {version: 'user@example.org', platform: 'secret' as never, channel: 'private-email', build: 'private'});
    expect(payload.properties).toEqual({$process_person_profile: false, $geoip_disable: true, $ip: null,
      app_version: 'unknown', platform: 'unknown', screen: 'unknown'});
  });
});

describe('delivery acknowledgements and cancellation', () => {
  it('sends one valid Sentry envelope and requires the matching receipt', async () => {
    configured(); vi.mocked(fetch).mockResolvedValue(response({id: id.replace(/-/g, '')}));
    const receipt = await sendUserReport(report, build);
    expect(receipt).toMatchObject({provider: 'sentry', eventId: id.replace(/-/g, '')});
    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('https://o0.ingest.us.sentry.io/api/123/envelope/');
    expect(options).toMatchObject({method: 'POST', credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer'});
    const [header, item, event] = String(options?.body).trim().split('\n').map(line => JSON.parse(line));
    expect(header.dsn).toBe(dsn); expect(header.event_id).toBe(event.event_id);
    expect(item.type).toBe('event'); expect(event.extra.student_report.summary).toBe(report.summary);
    expect(String(options?.body)).not.toContain('access_token');
  });
  it.each([{}, {id: 'other'}, {status: 0}])('does not mark Sentry delivery complete without an exact receipt: %j', async body => {
    configured(); vi.mocked(fetch).mockResolvedValue(response(body));
    await expect(sendUserReport(report, build)).rejects.toThrow('receipt');
  });
  it('accepts PostHog success but never turns rejected bodies into receipts', async () => {
    configured(); vi.mocked(fetch).mockResolvedValue(response({status: 1}));
    expect(await sendUsageEvent(usage, anonymousId, build)).toMatchObject({provider: 'posthog', eventId: id});
    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('https://us.i.posthog.com/i/v0/e/');
    expect(JSON.parse(String(options?.body)).api_key).toBe(key);
    vi.mocked(fetch).mockResolvedValue(response({status: 0, message: 'user@example.org'}));
    await expect(sendUsageEvent(usage, anonymousId, build)).rejects.toThrow('did not confirm');
  });
  it.each([401, 429, 500])('rejects HTTP %i with a useful message and no provider secrets', async status => {
    configured(); vi.mocked(fetch).mockResolvedValue(response({message: 'secret'}, status));
    await expect(sendUserReport(report, build)).rejects.toThrow('did not confirm delivery');
  });
  it('returns a safe error for failed network requests', async () => {
    configured(); vi.mocked(fetch).mockRejectedValue(new Error(`${dsn} raw secrets`));
    await expect(sendUserReport(report, build)).rejects.toThrow('Check your connection');
  });
  it('does not start a request that has already been cancelled', async () => {
    configured(); const abort = new AbortController(); abort.abort();
    await expect(sendUserReport(report, build, abort.signal)).rejects.toThrow('cancelled');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('aborts in-flight delivery when sharing is turned off', async () => {
    configured(); const abort = new AbortController();
    vi.mocked(fetch).mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    }));
    const sending = sendUsageEvent(usage, anonymousId, build, abort.signal);
    const rejected = expect(sending).rejects.toThrow('cancelled'); abort.abort(); await rejected;
  });
  it('times out after eight seconds and does not retry on its own', async () => {
    vi.useFakeTimers(); configured();
    vi.mocked(fetch).mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    }));
    const rejected = expect(sendUserReport(report, build)).rejects.toThrow('took too long');
    await vi.advanceTimersByTimeAsync(8000); await rejected;
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
