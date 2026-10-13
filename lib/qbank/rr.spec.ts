import { describe, it, expect, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), schema: vi.fn() }))
vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase', () => ({ supabase: { schema: mocks.schema } }))
import { fetchScenarioQuestionsByCode } from './rr'

describe('RR schema RPC', () => {
  it('calls the custom schema and groups returned question rows', async () => {
    mocks.schema.mockReturnValue({ rpc: mocks.rpc })
    mocks.rpc.mockResolvedValue({ data: [{ question_id: 'q', stem: 'Question', option_idx: 0, option_text: 'A' }], error: null })
    const result = await fetchScenarioQuestionsByCode('test')
    expect(mocks.schema).toHaveBeenCalledWith('rr')
    expect(mocks.rpc).toHaveBeenCalledWith('get_scenario_questions', { scenario_code: 'test' })
    expect(result.questions[0]?.options).toEqual([{ id: '0', text: 'A' }])
  })
  it('returns a setup error when the schema RPC is unavailable', async () => {
    mocks.schema.mockReturnValue({ rpc: mocks.rpc })
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'missing function' } })
    await expect(fetchScenarioQuestionsByCode('test')).rejects.toThrow('missing function')
  })
})
