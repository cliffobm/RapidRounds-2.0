import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  RationaleService,
  canSeeFullRationale,
  getRationaleForDisplay,
} from './rationales'
const { from } = vi.hoisted(() => ({ from: vi.fn() }))
vi.mock('./supabase', () => ({ supabase: { from } }))
let count: number
const rationale = {
  hint: 'Consider the symptoms',
  full: 'Full original teaching explanation',
}
beforeEach(() => {
  count = 0
  from.mockImplementation((table: string) => {
    const query: any = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      single: vi.fn(async () => ({
        data: table === 'rationale_usage' ? { count } : rationale,
        error: null,
      })),
      upsert: vi.fn(async () => ({ error: null })),
    }
    return query
  })
})
describe('rationale access and display', () => {
  it('allows premium access', async () => {
    expect(
      (
        await RationaleService.canSeeFullRationale('user1', {
          subscription_tier: 'premium',
        })
      ).reason
    ).toBe('premium')
  })
  it('allows an unexpired trial', async () => {
    expect(
      (
        await RationaleService.canSeeFullRationale('user1', {
          trial_active: true,
          trial_expires_at: new Date(Date.now() + 86400000).toISOString(),
        })
      ).reason
    ).toBe('trial')
  })
  it('calculates the remaining free allowance using the filtered usage query', async () => {
    count = 3
    expect(
      await RationaleService.canSeeFullRationale('user1', {
        subscription_tier: 'free',
      })
    ).toMatchObject({ canAccess: true, remainingFree: 2 })
    expect(from).toHaveBeenCalledWith('rationale_usage')
  })
  it('denies full content at the free limit', async () => {
    count = 5
    expect(
      await RationaleService.canSeeFullRationale('user1', {
        subscription_tier: 'free',
      })
    ).toMatchObject({ canAccess: false, upgradeRequired: true })
    const result = await RationaleService.getRationaleContent(
      'item1',
      'user1',
      { subscription_tier: 'free' }
    )
    expect(result.hint).toBe(rationale.hint)
    expect(result.full).toContain('Upgrade to Premium')
  })
  it('returns full content to an entitled user', async () => {
    expect(
      await RationaleService.getRationaleContent('item1', 'user1', {
        subscription_tier: 'premium',
      })
    ).toEqual(rationale)
  })
  it('does not treat an expired trial as entitled', () => {
    expect(
      canSeeFullRationale(
        { trial_active: true, trial_expires_at: '2000-01-01' },
        5
      )
    ).toBe(false)
  })
  it('denies helper access without a profile', () => {
    expect(canSeeFullRationale(null, 0)).toBe(false)
  })
  it('enforces helper limits and entitled access', () => {
    expect(canSeeFullRationale({ subscription_tier: 'free' }, 3)).toBe(true)
    expect(canSeeFullRationale({ subscription_tier: 'free' }, 5)).toBe(false)
    expect(canSeeFullRationale({ subscription_tier: 'premium' }, 10)).toBe(true)
  })
  it('selects full content or a hint for display', () => {
    expect(getRationaleForDisplay(rationale, true)).toBe(rationale.full)
    expect(getRationaleForDisplay(rationale, false)).toBe(rationale.hint)
  })
})
