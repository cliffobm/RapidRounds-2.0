export async function logEvent(event: string, detail?: any, userId?: string) {
  try {
    await fetch('/api/metrics/log', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event, detail, user_id: userId ?? null }),
      keepalive: true,
    });
  } catch {
    // swallow
  }
}
