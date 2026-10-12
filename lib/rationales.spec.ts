import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RationaleService, canSeeFullRationale, getRationaleForDisplay } from './rationales'
import { supabase } from './supabase'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))
const rationale = { hint: 'Consider the patient symptoms', full: 'The complete clinical explanation' }
const query = (data: unknown, error: unknown = null) => {
  const builder: any = { single: vi.fn().mockResolvedValue({ data, error }) }
  builder.select = vi.fn(() => builder)
  builder.eq = vi.fn(() => builder)
  builder.upsert = vi.fn().mockResolvedValue({ error: null })
  return builder
}
beforeEach(() => vi.resetAllMocks())

describe('RationaleService', () => {
  it('grants premium access without querying free usage', async () => {
    expect(await RationaleService.canSeeFullRationale('u', { subscription_tier: 'premium' })).toMatchObject({ canAccess: true, reason: 'premium' })
    expect(supabase.from).not.toHaveBeenCalled()
  })
  it('grants an active trial', async () => {
    expect(await RationaleService.canSeeFullRationale('u', { trial_active: true, trial_expires_at: new Date(Date.now() + 86400000).toISOString() })).toMatchObject({ canAccess: true, reason: 'trial' })
  })
  it('enforces free limits and filters usage by user and type', async () => {
    const usage = query({ count: 3 })
    vi.mocked(supabase.from).mockReturnValue(usage)
    expect(await RationaleService.canSeeFullRationale('u', { subscription_tier: 'free' })).toMatchObject({ canAccess: true, remainingFree: 2, reason: 'free_limit' })
    expect(usage.eq).toHaveBeenCalledWith('user_id', 'u')
    expect(usage.eq).toHaveBeenCalledWith('usage_type', 'free')
  })
  it('denies free access at the limit', async () => {
    vi.mocked(supabase.from).mockReturnValue(query({ count: 5 }))
    expect(await RationaleService.canSeeFullRationale('u', { subscription_tier: 'free' })).toMatchObject({ canAccess: false, upgradeRequired: true, remainingFree: 0 })
  })
  it('returns full content for premium users', async () => {
    vi.mocked(supabase.from).mockReturnValue(query(rationale))
    expect(await RationaleService.getRationaleContent('item', 'u', { subscription_tier: 'premium' })).toEqual(rationale)
    expect(supabase.from).toHaveBeenCalledWith('rationales')
  })
  it('returns a hint and upgrade message when usage is exhausted', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce(query({ count: 5 })).mockReturnValueOnce(query(rationale))
    const result = await RationaleService.getRationaleContent('item', 'u', { subscription_tier: 'free' })
    expect(result.hint).toBe(rationale.hint)
    expect(result.full).toContain('Upgrade to Premium')
  })
  it('increments usage after a free rationale is returned', async () => {
    const usage = query({ count: 3 })
    vi.mocked(supabase.from).mockImplementation(table => table === 'rationales' ? query(rationale) : usage)
    expect(await RationaleService.getRationaleContent('item', 'u', { subscription_tier: 'free' })).toEqual(rationale)
    expect(usage.upsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'u', usage_type: 'free', count: 4 }))
  })
})
describe('rationale helpers', () => {
  it('grants premium access', () => expect(canSeeFullRationale({ subscription_tier: 'premium' }, 10)).toBe(true))
  it('grants an active trial', () => expect(canSeeFullRationale({ trial_active: true, trial_expires_at: new Date(Date.now() + 86400000).toISOString() }, 10)).toBe(true))
  it('denies an expired trial at the free limit', () => expect(canSeeFullRationale({ trial_active: true, trial_expires_at: new Date(Date.now() - 86400000).toISOString() }, 5)).toBe(false))
  it('denies at the free limit', () => expect(canSeeFullRationale({ subscription_tier: 'free' }, 5)).toBe(false))
  it('grants below the free limit', () => expect(canSeeFullRationale({ subscription_tier: 'free' }, 3)).toBe(true))
  it('denies a missing profile', () => expect(canSeeFullRationale(null, 0)).toBe(false))
  it('shows full content with access', () => expect(getRationaleForDisplay(rationale, true)).toBe(rationale.full))
  it('shows the hint without access', () => expect(getRationaleForDisplay(rationale, false)).toBe(rationale.hint))
})
