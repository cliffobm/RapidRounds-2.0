import { NextResponse } from 'next/server';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST() {
  // Lazily import supabaseAdmin to avoid build-time execution
  const { supabaseAdmin } = await import('@/lib/supabase-admin')
  
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, sample: data });
}
