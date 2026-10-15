import { vi } from 'vitest'

// A thenable PostgREST-style builder: filters chain until awaited.
export function queryMock(data: unknown, error: unknown = null) {
  const result = { data, error }
  const builder: any = { then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve) }
  for (const method of ['select', 'eq', 'not', 'gte', 'order', 'limit']) builder[method] = vi.fn(() => builder)
  builder.single = vi.fn().mockResolvedValue(result)
  return builder
}
