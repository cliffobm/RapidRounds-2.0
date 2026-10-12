import { NextRequest, NextResponse } from 'next/server';
import { getCjisBank, getCjisCatalog } from '@/qbank/cjis';
import { BANKS, type BankKey } from '@/qbank/banks';
export const dynamic = 'force-dynamic';
// Development staging access only. Does not touch database, progress, or scoring state.
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' || process.env.CJIS_PREVIEW_ENABLED !== 'true') return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const key = request.nextUrl.searchParams.get('bank');
  if (key === null) return NextResponse.json({ banks: getCjisCatalog() });
  if (!Object.prototype.hasOwnProperty.call(BANKS, key)) return NextResponse.json({ error: 'Unknown bank' }, { status: 404 });
  return NextResponse.json(getCjisBank(key as BankKey));
}
