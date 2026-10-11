import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase service role key not found, skipping metrics logging')
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Lazily import supabaseAdmin to avoid build-time execution
    const { supabaseAdmin } = await import('@/lib/supabase-admin')
    
    const body = await req.json().catch(() => ({}));
    const { event, detail, user_id } = body ?? {};
    if (!event || typeof event !== 'string') {
      return NextResponse.json({ error: 'Missing "event" (string)' }, { status: 400 });
    }
    const { error } = await supabaseAdmin.from('event_logs').insert({
      event,
      detail: detail ?? null,
      user_id: user_id ?? null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Metrics logging error:', e);
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}
