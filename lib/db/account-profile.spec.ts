import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadAccountProfile, saveAccountProfile } from './account-profile'

const mocks = vi.hoisted(() => ({ from: vi.fn(), select: vi.fn(), update: vi.fn(), eq: vi.fn(), single: vi.fn() }))
vi.mock('@/lib/supabase-client', () => ({ supabaseClient: { from: mocks.from } }))

describe('account profile queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const chain = { select: mocks.select, update: mocks.update, eq: mocks.eq, single: mocks.single }
    mocks.from.mockReturnValue(chain)
    mocks.select.mockReturnValue(chain)
    mocks.update.mockReturnValue(chain)
    mocks.eq.mockReturnValue(chain)
    mocks.single.mockResolvedValue({ data: { id: 'learner-b' }, error: null })
  })
  it('filters a profile read by the current account ID', async () => {
    expect(await loadAccountProfile('learner-b')).toEqual({ id: 'learner-b' })
    expect(mocks.from).toHaveBeenCalledWith('profiles')
    expect(mocks.eq).toHaveBeenCalledWith('id', 'learner-b')
  })
  it('sends only editable fields and requires a returned row', async () => {
    await saveAccountProfile('learner-b', { full_name: 'B', display_name: 'Learner B', credentials: ['RN'], role: 'admin', institution_id: 'other', updated_at: 'fake' } as any)
    expect(mocks.update).toHaveBeenCalledWith({ full_name: 'B', display_name: 'Learner B', credentials: ['RN'] })
    expect(mocks.eq).toHaveBeenCalledWith('id', 'learner-b')
    expect(mocks.single).toHaveBeenCalledOnce()
  })
  it('propagates database permission errors without reporting success', async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: 'permission denied' } })
    await expect(saveAccountProfile('learner-b', { full_name: 'B', display_name: null, credentials: [] })).rejects.toEqual({ message: 'permission denied' })
  })
  it('rejects an absent or wrong-account record', async () => {
    mocks.single.mockResolvedValue({ data: null, error: null })
    await expect(loadAccountProfile('learner-b')).rejects.toThrow('not returned')
    mocks.single.mockResolvedValue({ data: { id: 'learner-a' }, error: null })
    await expect(loadAccountProfile('learner-b')).rejects.toThrow('not returned')
  })
})
